from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database import Base

class Inspection(Base):
    __tablename__ = "inspections"

    id = Column(Integer, primary_key=True, index=True)
    booking_id = Column(Integer, ForeignKey("bookings.id", ondelete="CASCADE"), nullable=False)
    type = Column(String(30), nullable=False)  # check_in (delivery/outbound), check_out (return/inbound)
    inspector_name = Column(String(100), nullable=False, default="Equipe Operacional")
    
    hdmi_cable_ok = Column(Boolean, default=True)
    power_cable_ok = Column(Boolean, default=True)
    console_body_ok = Column(Boolean, default=True)
    controllers_ok = Column(Boolean, default=True)
    games_accessories_ok = Column(Boolean, default=True)
    cleanliness_ok = Column(Boolean, default=True)
    
    photos_urls = Column(Text, nullable=True)  # JSON or comma-separated URLs
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    booking = relationship("Booking", back_populates="inspections")
