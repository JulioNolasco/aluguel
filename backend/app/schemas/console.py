from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class ConsoleBase(BaseModel):
    serial_number: str
    name: str
    model_type: str = "disk"  # disk, digital
    condition_notes: Optional[str] = None
    status: str = "available"  # available, reserved, rented, maintenance, inactive
    daily_rate: float = 59.90
    image_url: Optional[str] = None

class ConsoleCreate(ConsoleBase):
    pass

class ConsoleUpdate(BaseModel):
    serial_number: Optional[str] = None
    name: Optional[str] = None
    model_type: Optional[str] = None
    condition_notes: Optional[str] = None
    status: Optional[str] = None
    daily_rate: Optional[float] = None
    image_url: Optional[str] = None

class ConsoleResponse(ConsoleBase):
    id: int
    created_at: datetime
    is_available_for_period: Optional[bool] = None

    class Config:
        from_attributes = True
