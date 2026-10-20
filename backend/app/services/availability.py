from datetime import datetime, date, timedelta
from typing import List, Optional
from sqlalchemy.orm import Session
from sqlalchemy import or_, and_

from app.models.console import Console
from app.models.booking import Booking
from app.config import settings

def cleanup_expired_holds(db: Session):
    """
    RF04: Cleans up or cancels bookings where hold_expires_at has passed and still awaiting payment.
    """
    now = datetime.utcnow()
    expired_bookings = db.query(Booking).filter(
        Booking.status == "awaiting_payment",
        Booking.hold_expires_at != None,
        Booking.hold_expires_at < now
    ).all()

    for b in expired_bookings:
        b.status = "cancelled"
        b.notes = (b.notes or "") + " [Cancelado por tempo limite de pagamento (15 min) expirado]"
    
    if expired_bookings:
        db.commit()

def check_date_overlap(
    req_start: date, 
    req_end: date, 
    booked_start: date, 
    booked_end: date, 
    safety_days: int = 1
) -> bool:
    """
    RF03: Check if requested dates overlap with booked dates including safety buffer.
    """
    effective_start = booked_start - timedelta(days=safety_days)
    effective_end = booked_end + timedelta(days=safety_days)
    return not (req_end < effective_start or req_start > effective_end)

def is_console_available(
    db: Session,
    console_id: int,
    start_date: date,
    end_date: date,
    exclude_booking_id: Optional[int] = None
) -> bool:
    cleanup_expired_holds(db)
    
    console = db.query(Console).filter(Console.id == console_id).first()
    if not console or console.status in ["maintenance", "inactive"]:
        return False

    active_statuses = [
        "paid_scheduled",
        "in_transit",
        "active",
        "returned_inspection"
    ]

    now = datetime.utcnow()
    query = db.query(Booking).filter(
        Booking.console_id == console_id,
        or_(
            Booking.status.in_(active_statuses),
            and_(
                Booking.status == "awaiting_payment",
                Booking.hold_expires_at > now
            )
        )
    )

    if exclude_booking_id:
        query = query.filter(Booking.id != exclude_booking_id)

    conflicting_bookings = query.all()
    safety_days = 1 if settings.SAFETY_BUFFER_HOURS >= 12 else 0

    for b in conflicting_bookings:
        if check_date_overlap(start_date, end_date, b.start_date, b.end_date, safety_days=safety_days):
            return False

    return True

def get_available_consoles(
    db: Session,
    start_date: date,
    end_date: date,
    model_type: Optional[str] = None
) -> List[Console]:
    cleanup_expired_holds(db)
    query = db.query(Console).filter(Console.status.notin_(["maintenance", "inactive"]))
    if model_type:
        query = query.filter(Console.model_type == model_type)
    
    all_consoles = query.all()
    available = []
    for c in all_consoles:
        if is_console_available(db, c.id, start_date, end_date):
            available.append(c)
    return available

def calculate_rental_price(
    start_date: date,
    end_date: date,
    daily_rate: float,
    period_type: str = "daily"
) -> tuple[int, float]:
    days = max((end_date - start_date).days, 1)
    
    # Pricing package discounts
    if period_type == "weekend" and days in [2, 3]:
        # Fim de semana especial: ex. 15% de desconto no valor diário
        total = days * daily_rate * 0.85
    elif period_type == "weekly" or days >= 7:
        # Semanal: ex. 20% de desconto
        total = days * daily_rate * 0.80
    elif days >= 30:
        # Mensal: 35% desconto
        total = days * daily_rate * 0.65
    else:
        total = days * daily_rate
    
    return days, round(total, 2)
