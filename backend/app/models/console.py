from sqlalchemy import Column, Integer, String, Float, DateTime, Text
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database import Base

class Console(Base):
    __tablename__ = "consoles"

    id = Column(Integer, primary_key=True, index=True)
    serial_number = Column(String(100), unique=True, index=True, nullable=False)
    name = Column(String(150), nullable=False)
    model_type = Column(String(30), nullable=False, default="disk")  # disk, digital
    condition_notes = Column(Text, nullable=True)
    status = Column(String(30), nullable=False, default="available")  # available, reserved, rented, maintenance, inactive
    daily_rate = Column(Float, nullable=False, default=59.90)
    image_url = Column(String(500), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    bookings = relationship("Booking", back_populates="console")
