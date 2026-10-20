from datetime import date, datetime, timedelta
from sqlalchemy.orm import Session
from app.models.user import User, CustomerDocument
from app.models.console import Console
from app.models.accessory import Accessory
from app.models.booking import Booking, BookingItem
from app.models.financial import FinancialTransaction
from app.models.inspection import Inspection
from app.services.auth import get_password_hash

def seed_database(db: Session):
    # Check if already seeded
    if db.query(User).filter(User.email == "admin@playloc.com").first():
        return

    print("🌱 Iniciando seed de dados do sistema PlayLoc PS5...")

    # 1. Usuários
    admin_user = User(
        name="Administrador PlayLoc",
        email="admin@playloc.com",
        hashed_password=get_password_hash("admin123"),
        role="admin",
        cpf_cnpj="000.111.222-33",
        phone="(11) 98765-4321",
        address="Av. Paulista, 1000 - Bela Vista, São Paulo - SP",
        documents_verified=True
    )
    db.add(admin_user)

    client_user = User(
        name="Lucas Silveira Mendes",
        email="cliente@playloc.com",
        hashed_password=get_password_hash("cliente123"),
        role="customer",
        cpf_cnpj="345.678.910-11",
        phone="(11) 99123-4567",
        address="Rua dos Pinheiros, 450, Apto 82 - Pinheiros, São Paulo - SP",
        documents_verified=True
    )
    db.add(client_user)

    client_user2 = User(
        name="Mariana Costa Ramos",
        email="mariana@email.com",
        hashed_password=get_password_hash("cliente123"),
        role="customer",
        cpf_cnpj="456.789.012-22",
        phone="(11) 98877-6655",
        address="Rua Oscar Freire, 1200 - Jardins, São Paulo - SP",
        documents_verified=False
    )
    db.add(client_user2)
    db.flush()

    # Documentos de verificação
    doc1 = CustomerDocument(
        user_id=client_user.id,
        doc_type="id_card",
        file_name="cnh_lucas_mendes.pdf",
        file_url="/uploads/cnh_sample.pdf",
        status="approved",
        notes="Documento legível e válido."
    )
    doc2 = CustomerDocument(
        user_id=client_user.id,
        doc_type="proof_of_residence",
        file_name="comprovante_residencia_energia.pdf",
        file_url="/uploads/comp_sample.pdf",
        status="approved",
        notes="Comprovante de residência em nome do titular recente (30 dias)."
    )
    doc3 = CustomerDocument(
        user_id=client_user2.id,
        doc_type="id_card",
        file_name="rg_frente_verso.jpg",
        file_url="/uploads/rg_sample.jpg",
        status="pending",
        notes="Aguardando validação da equipe de compliance."
    )
    db.add_all([doc1, doc2, doc3])

    # 2. Consoles PS5 individuais (RF01)
    consoles_data = [
        {
            "serial_number": "CFI-2015A-8849102",
            "name": "PlayStation 5 Slim 1TB (Edição Disco) #01",
            "model_type": "disk",
            "condition_notes": "Console novo, carcaça impecável, 1TB SSD, leitor Ultra HD Blu-ray testado.",
            "status": "available",
            "daily_rate": 59.90,
            "image_url": "https://images.unsplash.com/photo-1606813907291-d86efa9b94db?auto=format&fit=crop&w=800&q=80"
        },
        {
            "serial_number": "CFI-2015A-8849103",
            "name": "PlayStation 5 Slim 1TB (Edição Disco) #02",
            "model_type": "disk",
            "condition_notes": "Excelente estado, limpeza térmica em dia, acompanha todos os cabos originais.",
            "status": "available",
            "daily_rate": 59.90,
            "image_url": "https://images.unsplash.com/photo-1606813907291-d86efa9b94db?auto=format&fit=crop&w=800&q=80"
        },
        {
            "serial_number": "CFI-2015B-3391004",
            "name": "PlayStation 5 Slim 1TB (Edição Digital) #03",
            "model_type": "digital",
            "condition_notes": "Design ultrafino, 100% digital, 1TB SSD de altíssima velocidade.",
            "status": "available",
            "daily_rate": 49.90,
            "image_url": "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=800&q=80"
        },
        {
            "serial_number": "CFI-2015B-3391005",
            "name": "PlayStation 5 Slim 1TB (Edição Digital) #04",
            "model_type": "digital",
            "condition_notes": "Edição Digital compacta, áudio 3D Tempest, controles atualizados.",
            "status": "available",
            "daily_rate": 49.90,
            "image_url": "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=800&q=80"
        },
        {
            "serial_number": "CFI-1215A-1120049",
            "name": "PlayStation 5 Standard (Edição Disco) #05",
            "model_type": "disk",
            "condition_notes": "Modelo clássico robusto, leitor Blu-ray 4K, revisado e higienizado com lacre.",
            "status": "available",
            "daily_rate": 54.90,
            "image_url": "https://images.unsplash.com/photo-1606813907291-d86efa9b94db?auto=format&fit=crop&w=800&q=80"
        },
        {
            "serial_number": "CFI-2015A-9920145",
            "name": "PlayStation 5 Slim 1TB (Edição Disco) #06",
            "model_type": "disk",
            "condition_notes": "Em manutenção preventiva para troca de ventoinha e pasta térmica.",
            "status": "maintenance",
            "daily_rate": 59.90,
            "image_url": "https://images.unsplash.com/photo-1606813907291-d86efa9b94db?auto=format&fit=crop&w=800&q=80"
        }
    ]
    created_consoles = []
    for cd in consoles_data:
        c = Console(**cd)
        db.add(c)
        created_consoles.append(c)
    db.flush()

    # 3. Acessórios e Jogos (RF02)
    accs_data = [
        {
            "name": "Controle DualSense Extra - Midnight Black",
            "category": "controller",
            "daily_rate": 15.00,
            "stock_quantity": 8,
            "image_url": "https://images.unsplash.com/photo-1600080972464-8e5f35f63d08?auto=format&fit=crop&w=400&q=80",
            "description": "Resposta tátil envolvente e gatilhos adaptáveis dinâmicos."
        },
        {
            "name": "Controle DualSense Extra - Cosmic Red",
            "category": "controller",
            "daily_rate": 15.00,
            "stock_quantity": 6,
            "image_url": "https://images.unsplash.com/photo-1592840496694-26d035b52b48?auto=format&fit=crop&w=400&q=80",
            "description": "Edição especial com acabamento vibrante Cosmic Red."
        },
        {
            "name": "Headset Sem Fio Pulse 3D",
            "category": "headset",
            "daily_rate": 18.00,
            "stock_quantity": 5,
            "image_url": "https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=400&q=80",
            "description": "Áudio 3D otimizado no PS5 com microfones duplos de cancelamento de ruído."
        },
        {
            "name": "Base de Carregamento Dupla DualSense",
            "category": "charging_station",
            "daily_rate": 8.00,
            "stock_quantity": 7,
            "image_url": "https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=400&q=80",
            "description": "Carregue até dois controles sem ocupar as portas USB do console."
        },
        {
            "name": "Marvel's Spider-Man 2 (PS5)",
            "category": "game",
            "daily_rate": 12.00,
            "stock_quantity": 4,
            "image_url": "https://images.unsplash.com/photo-1534423861386-85a16f5d13fd?auto=format&fit=crop&w=400&q=80",
            "description": "Jogue com Peter Parker e Miles Morales contra Kraven e Venom em Nova York."
        },
        {
            "name": "EA SPORTS FC 24 (PS5)",
            "category": "game",
            "daily_rate": 12.00,
            "stock_quantity": 6,
            "image_url": "https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=400&q=80",
            "description": "O jogo do mundo com tecnologia HyperMotionV e Ultimate Team."
        },
        {
            "name": "God of War Ragnarök (PS5)",
            "category": "game",
            "daily_rate": 12.00,
            "stock_quantity": 4,
            "image_url": "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=400&q=80",
            "description": "Embarque em uma jornada épica com Kratos e Atreus pelos Nove Reinos."
        },
        {
            "name": "Gran Turismo 7 (PS5)",
            "category": "game",
            "daily_rate": 10.00,
            "stock_quantity": 3,
            "image_url": "https://images.unsplash.com/photo-1547394765-185e1317ac14?auto=format&fit=crop&w=400&q=80",
            "description": "O simulador de corrida definitivo com gráficos 4K e ray tracing."
        },
        {
            "name": "Mortal Kombat 1 (PS5)",
            "category": "game",
            "daily_rate": 12.00,
            "stock_quantity": 3,
            "image_url": "https://images.unsplash.com/photo-1579373903781-fd5c0c30c4cd?auto=format&fit=crop&w=400&q=80",
            "description": "Novo sistema de combate, modos de jogo e finalizações viscerais."
        }
    ]
    created_accs = []
    for ad in accs_data:
        a = Accessory(**ad)
        db.add(a)
        created_accs.append(a)
    db.flush()

    # 4. Reservas Históricas e Ativas para demonstração rica
    today = date.today()

    # Reserva 1: Concluída recentemente
    b1_start = today - timedelta(days=10)
    b1_end = today - timedelta(days=7)
    b1 = Booking(
        booking_code="LOC-PS5-PAST01",
        customer_id=client_user.id,
        console_id=created_consoles[0].id,
        start_date=b1_start,
        end_date=b1_end,
        rental_period_type="weekend",
        total_amount=329.70,
        security_deposit=150.00,
        status="completed",
        terms_accepted=True,
        payment_method="pix",
        delivery_type="delivery",
        delivery_address="Rua dos Pinheiros, 450 - SP",
        notes="Locação finalizada com sucesso. Cliente devolveu tudo impecável.",
        created_at=datetime.utcnow() - timedelta(days=12)
    )
    db.add(b1)
    db.flush()

    # Itens da reserva 1
    db.add(BookingItem(
        booking_id=b1.id,
        accessory_id=created_accs[0].id,  # DualSense Black
        quantity=1,
        unit_price=15.00,
        subtotal=45.00
    ))
    db.add(BookingItem(
        booking_id=b1.id,
        accessory_id=created_accs[4].id,  # Spider-Man 2
        quantity=1,
        unit_price=12.00,
        subtotal=36.00
    ))

    # Vistorias da reserva 1 (Check-in e Check-out)
    insp1_in = Inspection(
        booking_id=b1.id,
        type="check_in",
        inspector_name="Carlos Operador",
        hdmi_cable_ok=True,
        power_cable_ok=True,
        console_body_ok=True,
        controllers_ok=True,
        games_accessories_ok=True,
        cleanliness_ok=True,
        notes="Equipamento higienizado e testado antes da entrega. Lacre 9821."
    )
    insp1_out = Inspection(
        booking_id=b1.id,
        type="check_out",
        inspector_name="Carlos Operador",
        hdmi_cable_ok=True,
        power_cable_ok=True,
        console_body_ok=True,
        controllers_ok=True,
        games_accessories_ok=True,
        cleanliness_ok=True,
        notes="Retornado em perfeito estado. Caução liberada."
    )
    db.add_all([insp1_in, insp1_out])

    # Transações da reserva 1
    db.add(FinancialTransaction(
        booking_id=b1.id,
        type="revenue",
        category="rental_fee",
        amount=329.70,
        payment_method="pix",
        description="Aluguel PS5 Fim de Semana - Reserva #LOC-PS5-PAST01",
        created_at=datetime.utcnow() - timedelta(days=11)
    ))

    # Reserva 2: Ativa com o cliente hoje
    b2_start = today - timedelta(days=1)
    b2_end = today + timedelta(days=2)
    b2 = Booking(
        booking_code="LOC-PS5-ACTV02",
        customer_id=client_user.id,
        console_id=created_consoles[1].id,
        start_date=b2_start,
        end_date=b2_end,
        rental_period_type="weekend",
        total_amount=389.70,
        security_deposit=150.00,
        status="active",
        terms_accepted=True,
        payment_method="credit_card",
        delivery_type="delivery",
        delivery_address="Rua dos Pinheiros, 450 - SP",
        notes="Em andamento. Entrega realizada pontualmente.",
        created_at=datetime.utcnow() - timedelta(days=2)
    )
    created_consoles[1].status = "rented"
    db.add(b2)
    db.flush()

    db.add(BookingItem(
        booking_id=b2.id,
        accessory_id=created_accs[1].id,
        quantity=1,
        unit_price=15.00,
        subtotal=45.00
    ))
    db.add(BookingItem(
        booking_id=b2.id,
        accessory_id=created_accs[5].id,  # FC 24
        quantity=1,
        unit_price=12.00,
        subtotal=36.00
    ))

    db.add(Inspection(
        booking_id=b2.id,
        type="check_in",
        inspector_name="Roberto Logística",
        hdmi_cable_ok=True,
        power_cable_ok=True,
        console_body_ok=True,
        controllers_ok=True,
        games_accessories_ok=True,
        cleanliness_ok=True,
        notes="Vistoria de saída assinada pelo cliente. Tudo 100%."
    ))

    db.add(FinancialTransaction(
        booking_id=b2.id,
        type="revenue",
        category="rental_fee",
        amount=389.70,
        payment_method="credit_card",
        description="Aluguel PS5 3 Diárias - Reserva #LOC-PS5-ACTV02",
        created_at=datetime.utcnow() - timedelta(days=2)
    ))

    # Despesas operacionais do período (RF12)
    db.add(FinancialTransaction(
        booking_id=None,
        type="expense",
        category="maintenance",
        amount=120.00,
        payment_method="pix",
        description="Troca de módulo analógico DualSense #04 (drift preventivo)",
        created_at=datetime.utcnow() - timedelta(days=8)
    ))
    db.add(FinancialTransaction(
        booking_id=None,
        type="expense",
        category="game_purchase",
        amount=349.90,
        payment_method="credit_card",
        description="Aquisição de mídia física Spider-Man 2 adicional para estoque",
        created_at=datetime.utcnow() - timedelta(days=15)
    ))
    db.add(FinancialTransaction(
        booking_id=None,
        type="expense",
        category="delivery_fee",
        amount=85.00,
        payment_method="pix",
        description="Combustível e pedágio rotas de entrega Zona Oeste/Sul",
        created_at=datetime.utcnow() - timedelta(days=3)
    ))

    db.commit()
    print("✅ Seed de dados finalizado com sucesso!")
