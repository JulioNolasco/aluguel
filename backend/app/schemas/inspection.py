from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class InspectionBase(BaseModel):
    booking_id: int
    type: str  # check_in, check_out
    inspector_name: str = "Equipe Operacional"
    hdmi_cable_ok: bool = True
    power_cable_ok: bool = True
    console_body_ok: bool = True
    controllers_ok: bool = True
    games_accessories_ok: bool = True
    cleanliness_ok: bool = True
    photos_urls: Optional[str] = None
    notes: Optional[str] = None

class InspectionCreate(InspectionBase):
    pass

class InspectionResponse(InspectionBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True
