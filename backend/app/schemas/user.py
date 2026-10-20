from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime

class Token(BaseModel):
    access_token: str
    token_type: str
    user: "UserResponse"

class TokenPayload(BaseModel):
    sub: Optional[str] = None
    role: Optional[str] = None

class UserBase(BaseModel):
    name: str
    email: EmailStr
    cpf_cnpj: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None

class UserCreate(UserBase):
    password: str
    role: Optional[str] = "customer"

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserUpdate(BaseModel):
    name: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    cpf_cnpj: Optional[str] = None
    documents_verified: Optional[bool] = None

class CustomerDocumentResponse(BaseModel):
    id: int
    user_id: int
    doc_type: str
    file_name: str
    file_url: str
    status: str
    notes: Optional[str] = None
    uploaded_at: datetime

    class Config:
        from_attributes = True

class UserResponse(UserBase):
    id: int
    role: str
    documents_verified: bool
    created_at: datetime
    documents: List[CustomerDocumentResponse] = []

    class Config:
        from_attributes = True

Token.model_rebuild()
