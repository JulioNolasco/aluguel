from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(150), nullable=False)
    email = Column(String(150), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    role = Column(String(20), default="customer")  # customer, admin
    cpf_cnpj = Column(String(30), nullable=True)
    phone = Column(String(30), nullable=True)
    address = Column(String(255), nullable=True)
    documents_verified = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    bookings = relationship("Booking", back_populates="customer", cascade="all, delete-orphan")
    documents = relationship("CustomerDocument", back_populates="user", cascade="all, delete-orphan")

class CustomerDocument(Base):
    __tablename__ = "customer_documents"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    doc_type = Column(String(50), nullable=False)  # id_card, proof_of_residence
    file_name = Column(String(255), nullable=False)
    file_url = Column(String(255), nullable=False)
    status = Column(String(30), default="pending")  # pending, approved, rejected
    notes = Column(Text, nullable=True)
    uploaded_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="documents")
