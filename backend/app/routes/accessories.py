from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.accessory import Accessory
from app.models.user import User
from app.schemas.accessory import AccessoryCreate, AccessoryUpdate, AccessoryResponse
from app.services.auth import get_current_admin

router = APIRouter(prefix="/accessories", tags=["Acessórios e Jogos"])

@router.get("", response_model=List[AccessoryResponse])
def list_accessories(
    category: Optional[str] = Query(None, description="Filtrar por categoria"),
    db: Session = Depends(get_db)
):
    query = db.query(Accessory)
    if category:
        query = query.filter(Accessory.category == category)
    return query.order_by(Accessory.category.asc(), Accessory.name.asc()).all()

@router.get("/{accessory_id}", response_model=AccessoryResponse)
def get_accessory(accessory_id: int, db: Session = Depends(get_db)):
    item = db.query(Accessory).filter(Accessory.id == accessory_id).first()
    if not item:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Item não encontrado.")
    return item

@router.post("", response_model=AccessoryResponse, status_code=status.HTTP_201_CREATED)
def create_accessory(
    accessory_in: AccessoryCreate,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin)
):
    item = Accessory(**accessory_in.model_dump())
    db.add(item)
    db.commit()
    db.refresh(item)
    return item

@router.put("/{accessory_id}", response_model=AccessoryResponse)
def update_accessory(
    accessory_id: int,
    accessory_in: AccessoryUpdate,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin)
):
    item = db.query(Accessory).filter(Accessory.id == accessory_id).first()
    if not item:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Item não encontrado.")

    update_data = accessory_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(item, field, value)

    db.commit()
    db.refresh(item)
    return item

@router.delete("/{accessory_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_accessory(
    accessory_id: int,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin)
):
    item = db.query(Accessory).filter(Accessory.id == accessory_id).first()
    if not item:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Item não encontrado.")

    db.delete(item)
    db.commit()
    return None
