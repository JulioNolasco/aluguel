import io
import base64
import uuid
import qrcode
from datetime import datetime
from sqlalchemy.orm import Session

from app.models.booking import Booking
from app.models.financial import FinancialTransaction

def generate_pix_qr(pix_code: str) -> str:
    """Generates base64 QR code image from string"""
    qr = qrcode.QRCode(
        version=1,
        error_correction=qrcode.constants.ERROR_CORRECT_L,
        box_size=8,
        border=2,
    )
    qr.add_data(pix_code)
    qr.make(fit=True)
    img = qr.make_image(fill_color="#000000", back_color="#ffffff")
    
    buf = io.BytesIO()
    img.save(buf, format="PNG")
    b64_bytes = base64.b64encode(buf.getvalue()).decode("utf-8")
    return f"data:image/png;base64,{b64_bytes}"

def generate_pix_payload(booking_code: str, amount: float) -> tuple[str, str]:
    """
    Simulates a standard EMVCo PIX dynamic payload string and returns (payload, qr_base64)
    """
    tx_id = f"PLAYLOC{uuid.uuid4().hex[:12].upper()}"
    chave_pix = "pix@playlocps5.com.br"
    nome_beneficiario = "PLAYLOC LOCACOES LTDA"
    cidade = "SAO PAULO"
    
    # Realistic mock format
    pix_code = (
        f"00020126580014br.gov.bcb.pix0136{chave_pix}52040000530398654{amount:.2f}"
        f"5802BR5921{nome_beneficiario}6009{cidade}62160512{tx_id}6304"
    )
    qr_data = generate_pix_qr(pix_code)
    return pix_code, qr_data

def process_payment_success(db: Session, booking: Booking, payment_method: str = "pix") -> Booking:
    """
    Confirms payment for a booking, moves state to 'paid_scheduled', and registers financial transaction.
    """
    booking.status = "paid_scheduled"
    booking.hold_expires_at = None  # Lock confirmed!
    booking.payment_method = payment_method
    booking.updated_at = datetime.utcnow()

    # Create revenue transaction
    transaction = FinancialTransaction(
        booking_id=booking.id,
        type="revenue",
        category="rental_fee",
        amount=booking.total_amount,
        payment_method=payment_method,
        description=f"Recebimento de aluguel PS5 - Reserva #{booking.booking_code}"
    )
    db.add(transaction)
    db.commit()
    db.refresh(booking)
    return booking
