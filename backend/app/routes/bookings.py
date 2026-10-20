import uuid
from typing import List, Optional
from datetime import datetime, date, timedelta
from fastapi import APIRouter, Depends, HTTPException, status, Query, Response
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.booking import Booking, BookingItem
from app.models.console import Console
from app.models.accessory import Accessory
from app.models.user import User
from app.schemas.booking import (
    BookingSimulationRequest,
    BookingSimulationResponse,
    BookingCreate,
    BookingStatusUpdate,
    BookingResponse
)
from app.services.auth import get_current_user, get_current_admin
from app.services.availability import (
    is_console_available,
    get_available_consoles,
    calculate_rental_price,
    cleanup_expired_holds
)
from app.services.payments import generate_pix_payload, process_payment_success
from app.services.export import export_bookings_csv
from app.config import settings

router = APIRouter(prefix="/bookings", tags=["Locações"])

@router.post("/simulate", response_model=BookingSimulationResponse)
def simulate_booking(req: BookingSimulationRequest, db: Session = Depends(get_db)):
    cleanup_expired_holds(db)
    if req.end_date < req.start_date:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A data de término não pode ser anterior à data de início."
        )

    # Calculate days and packages
    days = max((req.end_date - req.start_date).days, 1)

    # Find console daily rate
    daily_rate = 59.90
    is_available = True
    if req.console_id:
        console = db.query(Console).filter(Console.id == req.console_id).first()
        if console:
            daily_rate = console.daily_rate
            is_available = is_console_available(db, console.id, req.start_date, req.end_date)
        else:
            is_available = False
    
    available_consoles = get_available_consoles(db, req.start_date, req.end_date)
    if not req.console_id:
        is_available = len(available_consoles) > 0

    _, console_total = calculate_rental_price(
        req.start_date, req.end_date, daily_rate, req.rental_period_type or "daily"
    )

    # Calculate items
    items_total = 0.0
    for it in req.items:
        acc = db.query(Accessory).filter(Accessory.id == it.accessory_id).first()
        if acc:
            items_total += (acc.daily_rate * days * it.quantity)

    security_deposit = 150.00
    total_amount = console_total + items_total + security_deposit

    return {
        "days": days,
        "start_date": req.start_date,
        "end_date": req.end_date,
        "rental_period_type": req.rental_period_type or "daily",
        "console_id": req.console_id,
        "console_daily_rate": daily_rate,
        "console_total": round(console_total, 2),
        "items_total": round(items_total, 2),
        "security_deposit": security_deposit,
        "total_amount": round(total_amount, 2),
        "is_available": is_available,
        "available_consoles_count": len(available_consoles)
    }

@router.post("", response_model=BookingResponse, status_code=status.HTTP_201_CREATED)
def create_booking(
    booking_in: BookingCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    cleanup_expired_holds(db)
    
    if booking_in.end_date < booking_in.start_date:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Data final deve ser maior ou igual à data inicial."
        )

    # Concurrency safe check: find or lock requested console
    console_id = booking_in.console_id
    if console_id:
        if not is_console_available(db, console_id, booking_in.start_date, booking_in.end_date):
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="O console selecionado já está reservado para o período escolhido. Por favor selecione outra data ou console."
            )
        console = db.query(Console).filter(Console.id == console_id).first()
    else:
        available = get_available_consoles(db, booking_in.start_date, booking_in.end_date)
        if not available:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Não há consoles disponíveis para o período selecionado."
            )
        console = available[0]
        console_id = console.id

    days, console_total = calculate_rental_price(
        booking_in.start_date, booking_in.end_date, console.daily_rate, booking_in.rental_period_type
    )

    items_total = 0.0
    booking_items_to_create = []
    for it in booking_in.items:
        acc = db.query(Accessory).filter(Accessory.id == it.accessory_id).first()
        if not acc:
            continue
        subtotal = acc.daily_rate * days * it.quantity
        items_total += subtotal
        booking_items_to_create.append({
            "accessory_id": acc.id,
            "quantity": it.quantity,
            "unit_price": acc.daily_rate,
            "subtotal": round(subtotal, 2)
        })

    security_deposit = 150.00
    total_amount = round(console_total + items_total + security_deposit, 2)
    booking_code = f"LOC-PS5-{uuid.uuid4().hex[:6].upper()}"

    # RF04: Hold lock 15 minutes for checkout
    hold_expires_at = datetime.utcnow() + timedelta(minutes=settings.HOLD_DURATION_MINUTES)
    
    pix_code, _ = generate_pix_payload(booking_code, total_amount)

    booking = Booking(
        booking_code=booking_code,
        customer_id=current_user.id,
        console_id=console_id,
        start_date=booking_in.start_date,
        end_date=booking_in.end_date,
        rental_period_type=booking_in.rental_period_type,
        total_amount=total_amount,
        security_deposit=security_deposit,
        status="awaiting_payment",
        hold_expires_at=hold_expires_at,
        terms_accepted=booking_in.terms_accepted,
        payment_method=booking_in.payment_method,
        pix_code=pix_code,
        delivery_type=booking_in.delivery_type,
        delivery_address=booking_in.delivery_address or current_user.address,
        notes=booking_in.notes
    )
    db.add(booking)
    db.flush()

    for bi_data in booking_items_to_create:
        bi = BookingItem(booking_id=booking.id, **bi_data)
        db.add(bi)

    db.commit()
    db.refresh(booking)
    return booking

@router.get("", response_model=List[BookingResponse])
def list_bookings(
    status: Optional[str] = Query(None, description="Filtrar por status"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    cleanup_expired_holds(db)
    query = db.query(Booking)
    if current_user.role != "admin":
        query = query.filter(Booking.customer_id == current_user.id)
    if status:
        query = query.filter(Booking.status == status)

    return query.order_by(Booking.id.desc()).all()

@router.get("/export/csv")
def export_csv(
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin)
):
    bookings = db.query(Booking).order_by(Booking.id.desc()).all()
    csv_data = export_bookings_csv(bookings)
    return Response(
        content=csv_data,
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=relatorio_locacoes_ps5.csv"}
    )

@router.get("/{booking_id}", response_model=BookingResponse)
def get_booking(
    booking_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    cleanup_expired_holds(db)
    booking = db.query(Booking).filter(Booking.id == booking_id).first()
    if not booking:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Locação não encontrada.")
    if current_user.role != "admin" and booking.customer_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Acesso não autorizado.")
    return booking

@router.post("/{booking_id}/pay", response_model=BookingResponse)
def confirm_payment(
    booking_id: int,
    payment_method: str = Query("pix", description="pix ou credit_card"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Confirms payment (simulation or webhook). Unlocks reservation permanently!
    """
    booking = db.query(Booking).filter(Booking.id == booking_id).first()
    if not booking:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Locação não encontrada.")
    if current_user.role != "admin" and booking.customer_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Acesso não autorizado.")

    booking = process_payment_success(db, booking, payment_method=payment_method)
    return booking

@router.put("/{booking_id}/status", response_model=BookingResponse)
def update_booking_status(
    booking_id: int,
    status_update: BookingStatusUpdate,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin)
):
    booking = db.query(Booking).filter(Booking.id == booking_id).first()
    if not booking:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Locação não encontrada.")

    valid_statuses = [
        "awaiting_payment",
        "paid_scheduled",
        "in_transit",
        "active",
        "returned_inspection",
        "completed",
        "overdue",
        "incident",
        "cancelled"
    ]
    if status_update.status not in valid_statuses:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Status inválido. Permitidos: {', '.join(valid_statuses)}"
        )

    booking.status = status_update.status
    if status_update.notes:
        booking.notes = status_update.notes

    # Keep console status in sync
    if booking.console:
        if status_update.status == "active":
            booking.console.status = "rented"
        elif status_update.status in ["completed", "cancelled"]:
            booking.console.status = "available"
        elif status_update.status == "incident":
            booking.console.status = "maintenance"

    db.commit()
    db.refresh(booking)
    return booking
