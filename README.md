# 🎮 PlayLoc PS5 — Sistema Web de Gestão e Locação de PlayStation 5

Sistema completo de locação de consoles PlayStation 5 com controle dinâmico de inventário, motor de disponibilidade com bloqueio anti-overbooking, fluxo operacional integrado, checklist de vistorias e balanço financeiro analítico, desenvolvido rigorosamente de acordo com o **Documento de Especificação de Requisitos (SRS)**.

---

## 🛠️ Stack Tecnológica

| Camada | Tecnologia | Descrição |
| :--- | :--- | :--- |
| **Frontend** | **React** (Vite) + Vanilla CSS | Interface moderna, responsiva (*mobile-first*), com estética dark PlayStation (glows, símbolos △ ○ □ ✕, pills e glassmorphism). |
| **Backend** | **FastAPI** (Python 3) | API RESTful de alta performance, Pydantic v2, SQLAlchemy ORM, travas de concorrência e geração de PIX dinâmico. |
| **Banco de Dados** | **PostgreSQL 16** | Armazenamento relacional com transações ACID e constraints de unicidade para controle patrimonial. |
| **Containerização** | **Docker & Docker Compose** | Orquestração completa de 3 serviços (`db`, `backend`, `frontend`) com inicialização e seeds automáticos. |

---

## 🚀 Como Executar o Projeto

Certifique-se de ter o **Docker** e o **Docker Compose** instalados na sua máquina.

### 1. Iniciar com Docker Compose (Recomendado)

Na raiz do projeto, execute:

```bash
docker compose up --build
```

Os 3 contêineres serão construídos e inicializados automaticamente:
- O banco de dados **PostgreSQL** iniciará com healthcheck ativo.
- O **Backend FastAPI** criará as tabelas e inserirá automaticamente dados demonstrativos (Seed com 6 consoles PS5, acessórios, jogos, histórico de locações e KPIs).
- O **Frontend React** será compilado e servido via **Nginx** na porta `3000`.

---

## 🌐 URLs de Acesso

- **Aplicação Web (Frontend):** [http://localhost:3000](http://localhost:3000)
- **API Backend:** [http://localhost:8000](http://localhost:8000)
- **Documentação Interativa (Swagger/OpenAPI):** [http://localhost:8000/docs](http://localhost:8000/docs)

---

## 🔑 Credenciais Pré-Cadastradas para Demonstração

| Perfil | E-mail | Senha | Atribuições |
| :--- | :--- | :--- | :--- |
| **Administrador / Gestor** | `admin@playloc.com` | `admin123` | Acesso total: Painel KPIs, Balanço Financeiro, Inventário PS5, Operação de Locações e Vistorias. |
| **Cliente Teste** | `cliente@playloc.com` | `cliente123` | Portal do cliente, reservas ativas, contrato assinado e upload de documentos. |

*(Dica: No modal de login há botões de preenchimento com 1 clique para agilizar testes).*

---

## 📋 Mapeamento de Requisitos Atendidos

### 1. Gestão de Inventário e Estoque
- **RF01 - Cadastro de Unidades Individuais:** Registro de cada console PS5 de forma única (`serial_number`, apelido, versão com disco ou digital, estado de conservação e status: *Disponível*, *Reservado*, *Alugado*, *Manutenção*, *Inativo*).
- **RF02 - Acessórios e Jogos:** Cadastro e vinculação de periféricos (controles DualSense extras, Pulse 3D, base de recarga) e mídias de jogos em catálogo (*Spider-Man 2*, *FC 24*, *God of War*, *Gran Turismo 7*, etc.).
- **RF03 - Cálculo Dinâmico de Disponibilidade:** Algoritmo que cruza o intervalo de datas selecionado pelo cliente com reservas ativas/confirmadas, aplicando margem de segurança configurável (24h) para higienização e testes.
- **RF04 - Bloqueio Preventivo de Concorrência (Anti-Overbooking):** Ao gerar a reserva, a unidade é temporariamente retida por 15 minutos aguardando pagamento. Caso expire sem pagamento, é liberada automaticamente.

### 2. Portal do Cliente e Fluxo de Reserva
- **RF05 - Seleção de Período e Simulação:** Filtro por pacotes com cálculo em tempo real:
  - Diária única
  - Fim de semana (Sexta a Segunda - 15% OFF)
  - Semanal (7 dias - 20% OFF)
  - Mensal (30 dias - 35% OFF)
- **RF06 - Validação Cadastral e Anti-Fraude:** Upload de RG/CNH e comprovante de residência pelo portal do cliente, com verificação de status e aceite explícito dos Termos de Locação e Responsabilidade.
- **RF07 - Checkout e Pagamento:** Geração de PIX Dinâmico com QR Code visual, chave copia-e-cola, cronômetro de 15 minutos e botão para simulação de confirmação imediata de pagamento.
- **RF08 - Área do Cliente:** Acompanhamento de histórico, rastreador visual de etapas da locação, contrato assinado e guia de uso do PS5.

### 3. Operação e Ciclo de Vida da Locação
- **RF09 - Ciclo de Vida da Locação:** Gestão completa dos estados:
  - `Aguardando Pagamento` ➔ `Pago / Agendado` ➔ `Em Trânsito / Entrega` ➔ `Ativo (Com o Cliente)` ➔ `Devolvido (Em Vistoria)` ➔ `Concluído` (ou `Sinistro / Avaria`).
- **RF10 - Checklist de Entrada e Saída (Vistoria):** Formulário de vistoria detalhado com conferência de cabo HDMI original, cabo de força AC, carcaça sem riscos, controles DualSense sem drift e integridade de lacres.

### 4. Módulo Financeiro e Balanço Analítico
- **RF11 - Painel de Indicadores Gerais (KPIs):** Total de locações, faturamento bruto, total de despesas, lucro líquido, ticket médio, taxa de ocupação da frota (%), consoles mais rentáveis e periféricos mais solicitados.
- **RF12 - Balanço Detalhado:** Discriminação de entradas (aluguel, diárias extras) e saídas operacionais (manutenção, compra de jogos, frete), com modal para novos lançamentos manuais.
- **RF13 - Exportação de Dados:** Exportação de relatórios em formato **CSV** de locações e lançamentos financeiros com um clique, além de opção de impressão/PDF de contratos.

---

## 📁 Estrutura de Diretórios

```text
aluguel/
├── backend/
│   ├── app/
│   │   ├── models/            # Modelos SQLAlchemy (Console, Booking, User, Inspection, Financial)
│   │   ├── schemas/           # Schemas Pydantic para validação e serialização
│   │   ├── routes/            # Endpoints REST (auth, consoles, bookings, financial, etc.)
│   │   ├── services/          # Regras de negócio (disponibilidade, pagamentos, exportação)
│   │   ├── config.py          # Variáveis de ambiente e configurações
│   │   ├── database.py        # Conexão com banco e sessões
│   │   ├── seed_data.py       # Inicialização de dados demonstrativos
│   │   └── main.py            # Ponto de entrada FastAPI
│   ├── Dockerfile
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── components/        # Navbar, Footer, Modais de Reserva, PIX, Vistoria e Contrato
│   │   ├── context/           # AuthContext com autenticação e toasts
│   │   ├── pages/             # Home, Catalog, CustomerDashboard, AdminDashboard
│   │   ├── services/          # Cliente de API Axios/Fetch
│   │   ├── styles/            # Design System CSS inspirado no template escuro PlayStation
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── Dockerfile
│   ├── nginx.conf
│   └── package.json
├── docker-compose.yml
├── .env.example
└── README.md
```
