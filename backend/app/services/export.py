import csv
import io
from typing import List
from app.models.booking import Booking
from app.models.financial import FinancialTransaction

def export_bookings_csv(bookings: List[Booking]) -> str:
    output = io.StringIO()
    writer = csv.writer(output, delimiter=";", quoting=csv.QUOTE_MINIMAL)
    
    # Headers
    writer.writerow([
        "Código", "Cliente", "Console", "Início", "Fim", 
        "Período", "Valor Total (R$)", "Caução (R$)", "Status", "Pagamento", "Data Criação"
    ])
    
    for b in bookings:
        client_name = b.customer.name if b.customer else "N/A"
        console_name = b.console.name if b.console else "N/A"
        writer.writerow([
            b.booking_code,
            client_name,
            console_name,
            b.start_date.isoformat(),
            b.end_date.isoformat(),
            b.rental_period_type,
            f"{b.total_amount:.2f}",
            f"{b.security_deposit:.2f}",
            b.status,
            b.payment_method,
            b.created_at.strftime("%d/%m/%Y %H:%M")
        ])
        
    return output.getvalue()

def export_financial_csv(transactions: List[FinancialTransaction]) -> str:
    output = io.StringIO()
    writer = csv.writer(output, delimiter=";", quoting=csv.QUOTE_MINIMAL)
    
    # Headers
    writer.writerow([
        "ID", "Tipo", "Categoria", "Valor (R$)", "Método", "Descrição", "Data/Hora"
    ])
    
    for t in transactions:
        writer.writerow([
            t.id,
            "RECEITA" if t.type == "revenue" else "DESPESA",
            t.category,
            f"{t.amount:.2f}",
            t.payment_method,
            t.description,
            t.created_at.strftime("%d/%m/%Y %H:%M")
        ])
        
    return output.getvalue()
