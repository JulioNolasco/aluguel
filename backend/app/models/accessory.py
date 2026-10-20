from sqlalchemy import Column, Integer, String, Float, DateTime, Text
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database import Base

class Accessory(Base):
    __tablename__ = "accessories"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(150), nullable=False)
    category = Column(String(50), nullable=False, default="controller")  # controller, headset, game, charging_station, other
    daily_rate = Column(Float, nullable=False, default=15.00)
    stock_quantity = Column(Integer, nullable=False, default=5)
    image_url = Column(String(500), nullable=True)
    description = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    booking_items = relationship("BookingItem", back_populates="accessory")
