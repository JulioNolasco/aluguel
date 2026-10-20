from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from datetime import datetime

class FinancialTransactionBase(BaseModel):
    booking_id: Optional[int] = None
    type: str  # revenue, expense
    category: str  # rental_fee, delivery_fee, accessory_fee, maintenance, game_purchase, deposit_refund, parts_replacement, other
    amount: float
    payment_method: str = "pix"
    description: str

class FinancialTransactionCreate(FinancialTransactionBase):
    pass

class FinancialTransactionResponse(FinancialTransactionBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True

class FinancialKpisResponse(BaseModel):
    total_bookings: int
    active_bookings: int
    gross_revenue: float
    total_expenses: float
    net_profit: float
    average_ticket: float
    occupancy_rate: float
    top_consoles: List[Dict[str, Any]] = []
    top_accessories: List[Dict[str, Any]] = []
    recent_transactions: List[FinancialTransactionResponse] = []
