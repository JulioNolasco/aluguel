# **Documento de Especificação de Requisitos (SRS)**

# **Sistema Web de Gestão e Locação de PlayStation 5**

O objetivo principal deste projeto é permitir reservas públicas com controle dinâmico de inventário e fornecer um painel administrativo com fluxo operacional integrado e balanço financeiro e analítico.

---

# **1\. Visão Geral do Produto**

O sistema consiste em uma aplicação web responsiva dividida em duas áreas fundamentais:

* **Portal Público (Cliente):** Interface moderna e *mobile-first* para visualização dos consoles disponíveis, seleção de período (diárias ou pacotes), escolha de periféricos e jogos adicionais, checkout e agendamento.  
* **Painel de Gestão (Administrador):** Controle de estoque unitário (números de série e patrimônio), gestão do ciclo de vida da locação (entrega, devolução, vistorias) e módulo financeiro/balanço analítico.

---

# **2\. Perfis de Usuário e Permissões**

| Perfil | Permissões e Atribuições |
| :---- | :---- |
| **Cliente** | Navega pelo catálogo, verifica disponibilidade em tempo real, cria e gerencia seu perfil, envia documentos de verificação, realiza reservas e acompanha o status dos pedidos. |
| **Administrador / Operador** | Gerencia o inventário físico, valida cadastros e termos de responsabilidade, altera status operacionais, registra manutenções e acessa relatórios financeiros e métricas de desempenho. |

---

# **3\. Requisitos Funcionais (RF)**

## **3.1. Gestão de Inventário e Estoque**

* **RF01 \- Cadastro de Unidades Individuais:** O sistema deve registrar cada PS5 de forma única (ID, Número de Série, Apelido/Identificador, Versão com disco ou digital, Estado de conservação e Status: *Disponível*, *Reservado*, *Alugado*, *Manutenção*, *Inativo*).  
* **RF02 \- Acessórios e Jogos:** Permitir cadastrar itens adicionais vinculáveis às locações (ex.: controles extras DualSense, base de carregamento, headset, mídias físicas).  
* **RF03 \- Cálculo Dinâmico de Disponibilidade:**  
  * O motor de busca deve cruzar a quantidade de unidades operacionais com as reservas já confirmadas ou ativas no intervalo de datas selecionado pelo cliente.  
  * O sistema deve incluir uma margem de segurança configurável (ex.: 2 a 4 horas ou 1 dia entre locações para higienização, conferência e testes).  
* **RF04 \- Bloqueio Preventivo de Concorrência:** Durante o fluxo de checkout, a unidade ou vaga selecionada deve ficar retida por um período limite (ex.: 15 minutos) aguardando pagamento para evitar *overbooking*.

## **3.2. Portal do Cliente e Fluxo de Reserva**

* **RF05 \- Seleção de Período e Simulação:** O cliente escolhe as datas de início e fim da locação (ou pacotes pré-definidos: diária, fim de semana, semanal) e visualiza o valor calculado em tempo real.  
* **RF06 \- Validação Cadastral e Anti-Fraude:**  
  * Upload de documento com foto (RG/CNH) e comprovante de residência.  
  * Coleta de aceite eletrônico dos Termos de Locação e Responsabilidade por Danos.  
* **RF07 \- Checkout e Pagamento:** Integração com gateway de pagamentos (PIX dinâmico com confirmação imediata via Webhook e Cartão de Crédito com possibilidade de caução/pré-autorização de segurança).  
* **RF08 \- Área do Cliente:** Histórico de locações, visualização de contrato assinado, status de entrega/retirada e instruções de uso.

## **3.3. Operação e Gestão de Locações**

* **RF09 \- Ciclo de Vida da Locação:**  
  * O sistema deve gerenciar os seguintes estados da reserva:  
    * `Aguardando Pagamento`  
    * `Pago / Agendado`  
    * `Em Trânsito / Pronto para Retirada`  
    * `Ativo (Com o Cliente)`  
    * `Devolvido (Em Vistoria)`  
    * `Concluído` (ou `Atrasado` / `Sinistro`)  
* **RF10 \- Checklist de Entrada e Saída (Vistoria):**  
  * Registro de fotos e checklist de integridade na entrega e no recebimento (cabos HDMI e alimentação, estado dos controles, riscos no console).

## **3.4. Módulo Financeiro e Balanço Analítico**

* **RF11 \- Painel de Indicadores Gerais (KPIs):**  
  * Total de locações realizadas (dia, semana, mês, período customizado).  
  * Faturamento bruto e ticket médio por locação.  
  * Taxa de ocupação do inventário (% de dias em que os consoles estiveram alugados vs. capacidade total).  
  * Consoles mais rentáveis e periféricos mais solicitados.  
* **RF12 \- Balanço Detalhado:**  
  * Discriminação de receitas (valores de aluguel, taxas de entrega, adicionais).  
  * Registro de despesas operacionais (manutenção de controles, compra de jogos, frete/combustível, substituição de peças).  
  * Cálculo de lucro líquido no período.  
* **RF13 \- Exportação de Dados:** Possibilidade de exportar relatórios de vendas e balanços nos formatos CSV e PDF.

---

# **4\. Requisitos Não Funcionais (RNF)**

* **RNF01 \- Responsividade e Design:** Layout 100% responsivo (otimizado para smartphones, tablets e desktop), com interface limpa e intuitiva focada em rápida conversão.  
* **RNF02 \- Desempenho e Concorrência:** O cálculo de disponibilidade e transações concorrentes deve utilizar travas transacionais (*database locks*) para impedir duplicidade de agendamento do mesmo console.  
* **RNF03 \- Segurança e LGPD:** Criptografia de dados sensíveis e documentos armazenados (armazenamento seguro via S3/Cloud Storage com URLs assinadas e expiração). Autenticação segura via tokens/cookies HttpOnly com controle de acesso por papel (RBAC).  
* **RNF04 \- Notificações:** Envio automatizado de lembretes via WhatsApp (API) ou e-mail/SMS para: confirmação de reserva, lembrete de devolução na véspera e alerta de atraso.

---

# **5\. Modelo de Dados Sugerido (Entidades Principais)**

| Entidade | Campos Principais | Descrição / Função |
| :---- | :---- | :---- |
| **Users / Customers** | `id`, `name`, `cpf_cnpj`, `email`, `phone`, `address`, `documents_verified` | Cadastro geral dos usuários e clientes da plataforma. |
| **Consoles** | `id`, `serial_number`, `model_type`, `status`, `notes` | Unidades físicas dos consoles PS5 em inventário. |
| **Accessories** | `id`, `name`, `daily_rate`, `stock_quantity` | Periféricos e jogos disponíveis para locação adicional. |
| **Bookings** | `id`, `customer_id`, `console_id`, `start_date`, `end_date`, `total_amount`, `status`, `security_deposit` | Registro principal do contrato e período da reserva. |
| **BookingItems** | `id`, `booking_id`, `accessory_id`, `quantity`, `price` | Itens adicionais associados a uma reserva específica. |
| **FinancialTransactions** | `id`, `booking_id`, `type`, `category`, `amount`, `payment_method`, `created_at` | Lançamentos de entradas (receitas) e saídas (despesas). |
| **Inspections** | `id`, `booking_id`, `type`, `checklist_data`, `photos_urls` | Registros de vistorias de check-in e check-out. |

---

# **6\. Sugestão de Stack Tecnológica**

* **Frontend:** Next.js (React) ou Vue 3 com Tailwind CSS (garante alta performance, SEO e layout responsivo).  
* **Backend:** Node.js (NestJS / Express) ou Python (Django / FastAPI) com suporte robusto a transações ACID.  
* **Banco de Dados:** PostgreSQL (ideal para consultas relacionais de disponibilidade e consistência de estoque).  
* **Gateways / APIs:** Mercado Pago / Asaas / Stripe (para PIX automático e cartões) e Evolution API / Twilio (para notificações via WhatsApp).

