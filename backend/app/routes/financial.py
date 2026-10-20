from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query, Response
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.database import get_db
from app.models.financial import FinancialTransaction
from app.models.booking import Booking, BookingItem
from app.models.console import Console
from app.models.accessory import Accessory
from app.models.user import User
from app.schemas.financial import (
    FinancialTransactionCreate,
    FinancialTransactionResponse,
    FinancialKpisResponse
)
from app.services.auth import get_current_admin
from app.services.export import export_financial_csv

router = APIRouter(prefix="/financial", tags=["Financeiro e Balanço Analítico"])

@router.get("/kpis", response_model=FinancialKpisResponse)
def get_kpis(
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin)
):
    # Total bookings
    total_bookings = db.query(Booking).count()
    active_bookings = db.query(Booking).filter(Booking.status == "active").count()

    # Revenues and Expenses
    revenue_sum = db.query(func.sum(FinancialTransaction.amount)).filter(
        FinancialTransaction.type == "revenue"
    ).scalar() or 0.0

    expense_sum = db.query(func.sum(FinancialTransaction.amount)).filter(
        FinancialTransaction.type == "expense"
    ).scalar() or 0.0

    gross_revenue = round(float(revenue_sum), 2)
    total_expenses = round(float(expense_sum), 2)
    net_profit = round(gross_revenue - total_expenses, 2)
    average_ticket = round(gross_revenue / total_bookings, 2) if total_bookings > 0 else 0.0

    # Occupancy rate calculation (last 30 days active vs total console fleet)
    total_consoles = db.query(Console).filter(Console.status != "inactive").count() or 1
    # Occupancy rate estimated based on currently active/rented consoles vs operational fleet
    rented_consoles = db.query(Console).filter(Console.status.in_(["rented", "reserved"])).count()
    occupancy_rate = round((rented_consoles / total_consoles) * 100, 1)

    # Top consoles by completed/paid bookings
    consoles = db.query(Console).all()
    top_consoles = []
    for c in consoles:
        cnt = db.query(Booking).filter(
            Booking.console_id == c.id,
            Booking.status.in_(["paid_scheduled", "in_transit", "active", "returned_inspection", "completed"])
        ).count()
        rev = db.query(func.sum(Booking.total_amount)).filter(
            Booking.console_id == c.id,
            Booking.status.in_(["paid_scheduled", "in_transit", "active", "returned_inspection", "completed"])
        ).scalar() or 0.0
        top_consoles.append({
            "id": c.id,
            "name": c.name,
            "serial_number": c.serial_number,
            "rentals_count": cnt,
            "total_revenue": round(float(rev), 2),
            "status": c.status
        })
    top_consoles.sort(key=lambda x: x["total_revenue"], reverse=True)

    # Top accessories by requested count
    accessories = db.query(Accessory).all()
    top_accessories = []
    for a in accessories:
        qty_sum = db.query(func.sum(BookingItem.quantity)).filter(
            BookingItem.accessory_id == a.id
        ).scalar() or 0
        rev_sum = db.query(func.sum(BookingItem.subtotal)).filter(
            BookingItem.accessory_id == a.id
        ).scalar() or 0.0
        top_accessories.append({
            "id": a.id,
            "name": a.name,
            "category": a.category,
            "times_rented": int(qty_sum),
            "total_revenue": round(float(rev_sum), 2)
        })
    top_accessories.sort(key=lambda x: x["times_rented"], reverse=True)

    recent_txs = db.query(FinancialTransaction).order_by(
        FinancialTransaction.created_at.desc()
    ).limit(15).all()

    return {
        "total_bookings": total_bookings,
        "active_bookings": active_bookings,
        "gross_revenue": gross_revenue,
        "total_expenses": total_expenses,
        "net_profit": net_profit,
        "average_ticket": average_ticket,
        "occupancy_rate": occupancy_rate,
        "top_consoles": top_consoles[:5],
        "top_accessories": top_accessories[:5],
        "recent_transactions": recent_txs
    }

@router.get("/transactions", response_model=List[FinancialTransactionResponse])
def list_transactions(
    type: Optional[str] = Query(None, description="revenue ou expense"),
    category: Optional[str] = Query(None, description="Filtrar por categoria"),
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin)
):
    query = db.query(FinancialTransaction)
    if type:
        query = query.filter(FinancialTransaction.type == type)
    if category:
        query = query.filter(FinancialTransaction.category == category)
    return query.order_by(FinancialTransaction.created_at.desc()).all()

@router.post("/transactions", response_model=FinancialTransactionResponse, status_code=status.HTTP_201_CREATED)
def create_transaction(
    tx_in: FinancialTransactionCreate,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin)
):
    tx = FinancialTransaction(**tx_in.model_dump())
    db.add(tx)
    db.commit()
    db.refresh(tx)
    return tx

@router.get("/export/csv")
def export_csv(
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin)
):
    txs = db.query(FinancialTransaction).order_by(FinancialTransaction.created_at.desc()).all()
    csv_data = export_financial_csv(txs)
    return Response(
        content=csv_data,
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=balanco_financeiro_ps5.csv"}
    )
