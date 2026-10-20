from typing import List, Optional
from datetime import date
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.console import Console
from app.models.user import User
from app.schemas.console import ConsoleCreate, ConsoleUpdate, ConsoleResponse
from app.services.auth import get_current_admin
from app.services.availability import is_console_available, cleanup_expired_holds

router = APIRouter(prefix="/consoles", tags=["Consoles"])

@router.get("", response_model=List[ConsoleResponse])
def list_consoles(
    start_date: Optional[date] = Query(None, description="Data início para verificar disponibilidade"),
    end_date: Optional[date] = Query(None, description="Data fim para verificar disponibilidade"),
    model_type: Optional[str] = Query(None, description="Filtrar por tipo: disk ou digital"),
    db: Session = Depends(get_db)
):
    cleanup_expired_holds(db)
    query = db.query(Console)
    if model_type:
        query = query.filter(Console.model_type == model_type)
        
    consoles = query.order_by(Console.id.asc()).all()
    
    result = []
    for c in consoles:
        c_dict = {
            "id": c.id,
            "serial_number": c.serial_number,
            "name": c.name,
            "model_type": c.model_type,
            "condition_notes": c.condition_notes,
            "status": c.status,
            "daily_rate": c.daily_rate,
            "image_url": c.image_url,
            "created_at": c.created_at,
            "is_available_for_period": True
        }
        if start_date and end_date:
            c_dict["is_available_for_period"] = is_console_available(db, c.id, start_date, end_date)
        elif c.status != "available":
            c_dict["is_available_for_period"] = False
        result.append(c_dict)
        
    return result

@router.get("/{console_id}", response_model=ConsoleResponse)
def get_console(console_id: int, db: Session = Depends(get_db)):
    console = db.query(Console).filter(Console.id == console_id).first()
    if not console:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Console não encontrado.")
    return console

@router.post("", response_model=ConsoleResponse, status_code=status.HTTP_201_CREATED)
def create_console(
    console_in: ConsoleCreate,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin)
):
    existing = db.query(Console).filter(Console.serial_number == console_in.serial_number).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Já existe um console cadastrado com este Número de Série."
        )
    
    db_console = Console(**console_in.model_dump())
    db.add(db_console)
    db.commit()
    db.refresh(db_console)
    return db_console

@router.put("/{console_id}", response_model=ConsoleResponse)
def update_console(
    console_id: int,
    console_in: ConsoleUpdate,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin)
):
    console = db.query(Console).filter(Console.id == console_id).first()
    if not console:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Console não encontrado.")

    update_data = console_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(console, field, value)

    db.commit()
    db.refresh(console)
    return console

@router.delete("/{console_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_console(
    console_id: int,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin)
):
    console = db.query(Console).filter(Console.id == console_id).first()
    if not console:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Console não encontrado.")

    db.delete(console)
    db.commit()
    return None
