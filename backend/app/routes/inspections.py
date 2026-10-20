from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.inspection import Inspection
from app.models.booking import Booking
from app.models.user import User
from app.schemas.inspection import InspectionCreate, InspectionResponse
from app.services.auth import get_current_user, get_current_admin

router = APIRouter(prefix="/inspections", tags=["Vistorias e Checklists"])

@router.post("", response_model=InspectionResponse, status_code=status.HTTP_201_CREATED)
def create_inspection(
    inspection_in: InspectionCreate,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin)
):
    booking = db.query(Booking).filter(Booking.id == inspection_in.booking_id).first()
    if not booking:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Locação não encontrada.")

    inspection = Inspection(**inspection_in.model_dump())
    db.add(inspection)

    # Automatically advance lifecycle state based on inspection
    if inspection.type == "check_in":
        # Outbound inspection complete -> ready or in transit
        booking.status = "in_transit"
    elif inspection.type == "check_out":
        # Inbound inspection
        has_issue = not (
            inspection.hdmi_cable_ok and
            inspection.power_cable_ok and
            inspection.console_body_ok and
            inspection.controllers_ok and
            inspection.games_accessories_ok
        )
        if has_issue:
            booking.status = "incident"
            if booking.console:
                booking.console.status = "maintenance"
        else:
            booking.status = "completed"
            if booking.console:
                booking.console.status = "available"

    db.commit()
    db.refresh(inspection)
    return inspection

@router.get("/booking/{booking_id}", response_model=List[InspectionResponse])
def get_inspections_for_booking(
    booking_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    booking = db.query(Booking).filter(Booking.id == booking_id).first()
    if not booking:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Locação não encontrada.")
    if current_user.role != "admin" and booking.customer_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Acesso não autorizado.")

    return db.query(Inspection).filter(Inspection.booking_id == booking_id).order_by(Inspection.created_at.asc()).all()

@router.get("", response_model=List[InspectionResponse])
def list_all_inspections(
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin)
):
    return db.query(Inspection).order_by(Inspection.id.desc()).all()
