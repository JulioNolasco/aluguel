from pydantic import BaseModel
from typing import Optional, List
from datetime import date, datetime
from app.schemas.accessory import AccessoryResponse
from app.schemas.console import ConsoleResponse

class BookingItemCreate(BaseModel):
    accessory_id: int
    quantity: int = 1

class BookingItemResponse(BaseModel):
    id: int
    accessory_id: int
    quantity: int
    unit_price: float
    subtotal: float
    accessory: Optional[AccessoryResponse] = None

    class Config:
        from_attributes = True

class BookingSimulationRequest(BaseModel):
    console_id: Optional[int] = None
    start_date: date
    end_date: date
    rental_period_type: Optional[str] = "daily"  # daily, weekend, weekly, custom
    items: List[BookingItemCreate] = []

class BookingSimulationResponse(BaseModel):
    days: int
    start_date: date
    end_date: date
    rental_period_type: str
    console_id: Optional[int] = None
    console_daily_rate: float
    console_total: float
    items_total: float
    security_deposit: float
    total_amount: float
    is_available: bool
    available_consoles_count: int

class BookingCreate(BaseModel):
    console_id: Optional[int] = None
    start_date: date
    end_date: date
    rental_period_type: str = "daily"
    items: List[BookingItemCreate] = []
    payment_method: str = "pix"  # pix, credit_card
    delivery_type: str = "delivery"  # delivery, pickup
    delivery_address: Optional[str] = None
    terms_accepted: bool = True
    notes: Optional[str] = None

class BookingStatusUpdate(BaseModel):
    status: str
    notes: Optional[str] = None

class BookingResponse(BaseModel):
    id: int
    booking_code: str
    customer_id: int
    console_id: Optional[int] = None
    start_date: date
    end_date: date
    rental_period_type: str
    total_amount: float
    security_deposit: float
    status: str
    hold_expires_at: Optional[datetime] = None
    terms_accepted: bool
    payment_method: str
    pix_code: Optional[str] = None
    delivery_type: str
    delivery_address: Optional[str] = None
    notes: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    console: Optional[ConsoleResponse] = None
    items: List[BookingItemResponse] = []

    class Config:
        from_attributes = True
