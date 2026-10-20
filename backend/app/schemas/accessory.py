from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class AccessoryBase(BaseModel):
    name: str
    category: str = "controller"  # controller, headset, game, charging_station, other
    daily_rate: float = 15.00
    stock_quantity: int = 5
    image_url: Optional[str] = None
    description: Optional[str] = None

class AccessoryCreate(AccessoryBase):
    pass

class AccessoryUpdate(BaseModel):
    name: Optional[str] = None
    category: Optional[str] = None
    daily_rate: Optional[float] = None
    stock_quantity: Optional[int] = None
    image_url: Optional[str] = None
    description: Optional[str] = None

class AccessoryResponse(AccessoryBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True
