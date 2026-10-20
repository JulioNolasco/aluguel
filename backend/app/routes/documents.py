import os
import uuid
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user import User, CustomerDocument
from app.schemas.user import CustomerDocumentResponse
from app.services.auth import get_current_user, get_current_admin
from app.config import settings

router = APIRouter(prefix="/documents", tags=["Validação Cadastral e Documentos"])

@router.post("/upload", response_model=CustomerDocumentResponse)
async def upload_document(
    doc_type: str = Form(..., description="id_card ou proof_of_residence"),
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    valid_types = ["id_card", "proof_of_residence"]
    if doc_type not in valid_types:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Tipo de documento inválido. Use 'id_card' ou 'proof_of_residence'."
        )

    # Save file
    file_ext = os.path.splitext(file.filename)[1] or ".jpg"
    safe_name = f"doc_{current_user.id}_{doc_type}_{uuid.uuid4().hex[:8]}{file_ext}"
    file_path = os.path.join(settings.UPLOAD_DIR, safe_name)

    content = await file.read()
    with open(file_path, "wb") as f:
        f.write(content)

    doc = CustomerDocument(
        user_id=current_user.id,
        doc_type=doc_type,
        file_name=file.filename,
        file_url=f"/uploads/{safe_name}",
        status="pending"
    )
    db.add(doc)
    db.commit()
    db.refresh(doc)
    return doc

@router.get("/my", response_model=List[CustomerDocumentResponse])
def get_my_documents(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return db.query(CustomerDocument).filter(CustomerDocument.user_id == current_user.id).all()

@router.get("", response_model=List[CustomerDocumentResponse])
def list_all_documents(
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin)
):
    return db.query(CustomerDocument).order_by(CustomerDocument.uploaded_at.desc()).all()

@router.put("/{doc_id}/status", response_model=CustomerDocumentResponse)
def update_document_status(
    doc_id: int,
    status_str: str = Form(..., description="approved ou rejected"),
    notes: str = Form(None),
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin)
):
    doc = db.query(CustomerDocument).filter(CustomerDocument.id == doc_id).first()
    if not doc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Documento não encontrado.")

    doc.status = status_str
    if notes:
        doc.notes = notes

    # Check if user now has both id_card and proof_of_residence approved
    user = doc.user
    approved_docs = db.query(CustomerDocument).filter(
        CustomerDocument.user_id == user.id,
        CustomerDocument.status == "approved"
    ).all()
    approved_types = {d.doc_type for d in approved_docs}
    if "id_card" in approved_types and "proof_of_residence" in approved_types:
        user.documents_verified = True
    elif status_str == "rejected":
        user.documents_verified = False

    db.commit()
    db.refresh(doc)
    return doc
