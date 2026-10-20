from sqlalchemy import Column, Integer, String, Float, Boolean, Date, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database import Base

class Booking(Base):
    __tablename__ = "bookings"

    id = Column(Integer, primary_key=True, index=True)
    booking_code = Column(String(50), unique=True, index=True, nullable=False)
    customer_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    console_id = Column(Integer, ForeignKey("consoles.id", ondelete="SET NULL"), nullable=True)
    
    start_date = Column(Date, nullable=False)
    end_date = Column(Date, nullable=False)
    rental_period_type = Column(String(30), default="daily")  # daily, weekend, weekly, custom
    
    total_amount = Column(Float, nullable=False, default=0.0)
    security_deposit = Column(Float, nullable=False, default=150.0)
    
    # RF09 Lifecycle statuses:
    # awaiting_payment -> paid_scheduled -> in_transit -> active -> returned_inspection -> completed
    # exceptions: overdue, incident, cancelled
    status = Column(String(40), nullable=False, default="awaiting_payment")
    
    # RF04 Hold expiration for anti-overbooking
    hold_expires_at = Column(DateTime, nullable=True)
    terms_accepted = Column(Boolean, default=False)
    
    payment_method = Column(String(30), default="pix")  # pix, credit_card
    pix_code = Column(Text, nullable=True)
    
    delivery_type = Column(String(30), default="delivery")  # delivery, pickup
    delivery_address = Column(String(255), nullable=True)
    notes = Column(Text, nullable=True)
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    customer = relationship("User", back_populates="bookings")
    console = relationship("Console", back_populates="bookings")
    items = relationship("BookingItem", back_populates="booking", cascade="all, delete-orphan")
    inspections = relationship("Inspection", back_populates="booking", cascade="all, delete-orphan")
    transactions = relationship("FinancialTransaction", back_populates="booking")


class BookingItem(Base):
    __tablename__ = "booking_items"

    id = Column(Integer, primary_key=True, index=True)
    booking_id = Column(Integer, ForeignKey("bookings.id", ondelete="CASCADE"), nullable=False)
    accessory_id = Column(Integer, ForeignKey("accessories.id", ondelete="CASCADE"), nullable=False)
    quantity = Column(Integer, nullable=False, default=1)
    unit_price = Column(Float, nullable=False, default=0.0)
    subtotal = Column(Float, nullable=False, default=0.0)

    # Relationships
    booking = relationship("Booking", back_populates="items")
    accessory = relationship("Accessory", back_populates="booking_items")
