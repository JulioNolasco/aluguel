from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database import Base

class FinancialTransaction(Base):
    __tablename__ = "financial_transactions"

    id = Column(Integer, primary_key=True, index=True)
    booking_id = Column(Integer, ForeignKey("bookings.id", ondelete="SET NULL"), nullable=True)
    type = Column(String(20), nullable=False)  # revenue, expense
    category = Column(String(50), nullable=False)  # rental_fee, delivery_fee, accessory_fee, maintenance, game_purchase, deposit_refund, parts_replacement, other
    amount = Column(Float, nullable=False, default=0.0)
    payment_method = Column(String(30), default="pix")  # pix, credit_card, bank_transfer, cash
    description = Column(String(255), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    booking = relationship("Booking", back_populates="transactions")
