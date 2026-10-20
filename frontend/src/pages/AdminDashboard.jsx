import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  TrendingUp,
  DollarSign,
  Gamepad2,
  Package,
  Layers,
  FileSpreadsheet,
  Plus,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  ClipboardCheck,
  Disc,
  Cpu,
  ShieldCheck,
  Filter,
} from 'lucide-react';
import InspectionModal from '../components/InspectionModal';
import ContractModal from '../components/ContractModal';

export default function AdminDashboard() {
  const { showToast } = useAuth();
  const [activeTab, setActiveTab] = useState('kpis'); // kpis, inventory, bookings, inspections, documents, financial

  // Data states
  const [kpis, setKpis] = useState(null);
  const [consoles, setConsoles] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [inspections, setInspections] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals & Forms
  const [selectedInspectionBooking, setSelectedInspectionBooking] = useState(null);
  const [selectedContractBooking, setSelectedContractBooking] = useState(null);
  const [showAddConsoleModal, setShowAddConsoleModal] = useState(false);
  const [showAddExpenseModal, setShowAddExpenseModal] = useState(false);

  // New Console Form
  const [newConsole, setNewConsole] = useState({
    serial_number: '',
    name: '',
    model_type: 'disk',
    condition_notes: '',
    daily_rate: 59.90,
    status: 'available',
    image_url: 'https://images.unsplash.com/photo-1606813907291-d86efa9b94db?auto=format&fit=crop&w=800&q=80',
  });

  // New Expense Form
  const [newExpense, setNewExpense] = useState({
    type: 'expense',
    category: 'maintenance',
    amount: '',
    payment_method: 'pix',
    description: '',
  });

  // Filter for bookings
  const [bookingStatusFilter, setBookingStatusFilter] = useState('');

  const loadAllData = async () => {
    setLoading(true);
    try {
      const [k, c, b, i, d, t] = await Promise.all([
        api.financial.getKpis(),
        api.consoles.list(),
        api.bookings.list(bookingStatusFilter || null),
        api.inspections.listAll(),
        api.documents.listAll(),
        api.financial.listTransactions(),
      ]);
      setKpis(k);
      setConsoles(c);
      setBookings(b);
      setInspections(i);
      setDocuments(d);
      setTransactions(t);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, [bookingStatusFilter]);

  // Update Booking Status
  const handleAdvanceStatus = async (bookingId, nextStatus) => {
    try {
      await api.bookings.updateStatus(bookingId, { status: nextStatus });
      showToast(`Status atualizado para "${nextStatus}" com sucesso!`, 'success');
      loadAllData();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  // Update Console Status directly
  const handleUpdateConsoleStatus = async (consoleId, status) => {
    try {
      await api.consoles.update(consoleId, { status });
      showToast('Status do console atualizado!', 'success');
      loadAllData();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  // Create Console
  const handleCreateConsole = async (e) => {
    e.preventDefault();
    try {
      await api.consoles.create(newConsole);
      showToast('Console cadastrado no inventário com sucesso!', 'success');
      setShowAddConsoleModal(false);
      loadAllData();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  // Create Expense
  const handleCreateExpense = async (e) => {
    e.preventDefault();
    try {
      await api.financial.createTransaction({
        ...newExpense,
        amount: parseFloat(newExpense.amount),
      });
      showToast('Despesa operacional registrada!', 'success');
      setShowAddExpenseModal(false);
      setNewExpense({
        type: 'expense',
        category: 'maintenance',
        amount: '',
        payment_method: 'pix',
        description: '',
      });
      loadAllData();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  // KYC Approval
  const handleDocumentAction = async (docId, status) => {
    try {
      await api.documents.updateStatus(docId, status, status === 'approved' ? 'Aprovado pelo gestor' : 'Foto ilegível');
      showToast(`Documento ${status === 'approved' ? 'aprovado' : 'recusado'}!`, 'success');
      loadAllData();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const getStatusBadge = (status) => {
    const map = {
      available: { label: 'Disponível', color: 'var(--accent-green)', bg: 'rgba(0, 209, 137, 0.15)' },
      reserved: { label: 'Reservado', color: 'var(--accent-amber)', bg: 'rgba(245, 158, 11, 0.15)' },
      rented: { label: 'Alugado', color: 'var(--accent-cyan)', bg: 'rgba(1, 213, 250, 0.15)' },
      maintenance: { label: 'Manutenção', color: 'var(--accent-rose)', bg: 'rgba(255, 71, 111, 0.15)' },
      inactive: { label: 'Inativo', color: '#64748b', bg: 'rgba(100, 116, 139, 0.15)' },
      awaiting_payment: { label: 'Aguardando Pagamento', color: 'var(--accent-amber)', bg: 'rgba(245, 158, 11, 0.15)' },
      paid_scheduled: { label: 'Pago / Agendado', color: 'var(--accent-cyan)', bg: 'rgba(1, 213, 250, 0.15)' },
      in_transit: { label: 'Em Trânsito', color: '#a855f7', bg: 'rgba(168, 85, 247, 0.15)' },
      active: { label: 'Ativo (Com Cliente)', color: 'var(--accent-green)', bg: 'rgba(0, 209, 137, 0.15)' },
      returned_inspection: { label: 'Devolvido (Em Vistoria)', color: '#38bdf8', bg: 'rgba(56, 189, 248, 0.15)' },
      completed: { label: 'Concluído', color: '#94a3b8', bg: 'rgba(148, 163, 184, 0.15)' },
    };
    const s = map[status] || { label: status, color: '#fff', bg: 'rgba(255, 255, 255, 0.1)' };
    return (
      <span
        style={{
          color: s.color,
          background: s.bg,
          padding: '4px 10px',
          borderRadius: 'var(--radius-full)',
          fontSize: '0.75rem',
          fontWeight: 700,
        }}
      >
        {s.label}
      </span>
    );
  };

  return (
    <div className="container" style={{ padding: '40px 0 80px' }}>
      {/* Admin Header */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 16,
          marginBottom: 32,
        }}
      >
        <div>
          <h1 style={{ fontSize: '1.8rem', color: '#fff', marginBottom: 4 }}>
            Painel de Gestão & Operação PS5
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            Controle de inventário individual, ciclo de vida de locações e balanço financeiro analítico.
          </p>
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn btn-outline btn-sm" onClick={() => api.bookings.exportCsv()}>
            <FileSpreadsheet size={16} /> Exportar Locações (CSV)
          </button>
          <button className="btn btn-outline btn-sm" onClick={() => api.financial.exportCsv()}>
            <DollarSign size={16} /> Exportar Balanço (CSV)
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, borderBottom: '1px solid var(--border-subtle)', marginBottom: 28 }}>
        {[
          { id: 'kpis', label: 'Indicadores & Balanço (RF11/12)', icon: <TrendingUp size={16} /> },
          { id: 'inventory', label: 'Inventário de Consoles (RF01)', icon: <Gamepad2 size={16} /> },
          { id: 'bookings', label: 'Operação & Locações (RF09)', icon: <Package size={16} /> },
          { id: 'inspections', label: 'Vistorias & Checklists (RF10)', icon: <ClipboardCheck size={16} /> },
          { id: 'documents', label: 'Anti-Fraude & Clientes (RF06)', icon: <ShieldCheck size={16} /> },
        ].map((t) => (
          <button
            key={t.id}
            className={`btn btn-sm ${activeTab === t.id ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => setActiveTab(t.id)}
          >
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {/* TAB 1: KPIS & FINANCIAL ANALYTICS (RF11, RF12) */}
      {activeTab === 'kpis' && kpis && (
        <div>
          {/* Main KPI Cards */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: 20,
              marginBottom: 32,
            }}
          >
            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-strong)', borderRadius: 'var(--radius-md)', padding: 20 }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Faturamento Bruto</span>
              <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--accent-green)', marginTop: 4 }}>
                R$ {kpis.gross_revenue.toFixed(2)}
              </div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Total de receitas realizadas</span>
            </div>

            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-strong)', borderRadius: 'var(--radius-md)', padding: 20 }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Despesas Operacionais</span>
              <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--accent-rose)', marginTop: 4 }}>
                R$ {kpis.total_expenses.toFixed(2)}
              </div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Manutenção, peças e fretes</span>
            </div>

            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-strong)', borderRadius: 'var(--radius-md)', padding: 20 }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Lucro Líquido</span>
              <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--accent-cyan)', marginTop: 4 }}>
                R$ {kpis.net_profit.toFixed(2)}
              </div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Receitas menos Despesas</span>
            </div>

            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-strong)', borderRadius: 'var(--radius-md)', padding: 20 }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Taxa de Ocupação da Frota</span>
              <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--accent-amber)', marginTop: 4 }}>
                {kpis.occupancy_rate}%
              </div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Consoles ativos / locados hoje</span>
            </div>

            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-strong)', borderRadius: 'var(--radius-md)', padding: 20 }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Ticket Médio por Locação</span>
              <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#fff', marginTop: 4 }}>
                R$ {kpis.average_ticket.toFixed(2)}
              </div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Base: {kpis.total_bookings} locações</span>
            </div>
          </div>

          {/* Detailed Balance & Top Performers */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: 24, marginBottom: 32 }}>
            {/* Top Consoles */}
            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-strong)', borderRadius: 'var(--radius-lg)', padding: 24 }}>
              <h3 style={{ fontSize: '1.15rem', color: '#fff', marginBottom: 16 }}>Consoles Mais Rentáveis (RF11)</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {kpis.top_consoles.map((c, i) => (
                  <div
                    key={c.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '10px 14px',
                      background: 'rgba(255, 255, 255, 0.02)',
                      borderRadius: 'var(--radius-sm)',
                      border: '1px solid var(--border-subtle)',
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 600, color: '#fff', fontSize: '0.88rem' }}>
                        #{i + 1} {c.name}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        Serial: {c.serial_number} • {c.rentals_count} locações
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <span style={{ fontWeight: 800, color: 'var(--accent-green)', fontSize: '0.95rem' }}>
                        R$ {c.total_revenue.toFixed(2)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Top Accessories */}
            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-strong)', borderRadius: 'var(--radius-lg)', padding: 24 }}>
              <h3 style={{ fontSize: '1.15rem', color: '#fff', marginBottom: 16 }}>Periféricos & Jogos Mais Solicitados</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {kpis.top_accessories.map((a, i) => (
                  <div
                    key={a.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '10px 14px',
                      background: 'rgba(255, 255, 255, 0.02)',
                      borderRadius: 'var(--radius-sm)',
                      border: '1px solid var(--border-subtle)',
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 600, color: '#fff', fontSize: '0.88rem' }}>
                        #{i + 1} {a.name}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        Alugado {a.times_rented} vezes
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <span style={{ fontWeight: 800, color: 'var(--accent-cyan)', fontSize: '0.95rem' }}>
                        R$ {a.total_revenue.toFixed(2)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Financial Transactions List + Add Expense Button */}
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-strong)', borderRadius: 'var(--radius-lg)', padding: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <div>
                <h3 style={{ fontSize: '1.15rem', color: '#fff' }}>Balanço Financeiro & Lançamentos Operacionais (RF12)</h3>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>Discriminação de receitas e despesas</p>
              </div>

              <button className="btn btn-primary btn-sm" onClick={() => setShowAddExpenseModal(true)}>
                <Plus size={16} /> Lançar Despesa / Receita
              </button>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border-strong)', textAlign: 'left', color: 'var(--text-muted)' }}>
                    <th style={{ padding: '12px 14px' }}>Data</th>
                    <th style={{ padding: '12px 14px' }}>Tipo</th>
                    <th style={{ padding: '12px 14px' }}>Categoria</th>
                    <th style={{ padding: '12px 14px' }}>Descrição</th>
                    <th style={{ padding: '12px 14px' }}>Método</th>
                    <th style={{ padding: '12px 14px', textAlign: 'right' }}>Valor</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((t) => (
                    <tr key={t.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                      <td style={{ padding: '12px 14px', color: 'var(--text-muted)' }}>
                        {new Date(t.created_at).toLocaleDateString('pt-BR')}
                      </td>
                      <td style={{ padding: '12px 14px' }}>
                        <span
                          style={{
                            padding: '3px 8px',
                            borderRadius: 4,
                            fontSize: '0.72rem',
                            fontWeight: 700,
                            background: t.type === 'revenue' ? 'rgba(0, 209, 137, 0.15)' : 'rgba(255, 71, 111, 0.15)',
                            color: t.type === 'revenue' ? 'var(--accent-green)' : 'var(--accent-rose)',
                          }}
                        >
                          {t.type === 'revenue' ? 'RECEITA' : 'DESPESA'}
                        </span>
                      </td>
                      <td style={{ padding: '12px 14px', color: '#fff' }}>{t.category}</td>
                      <td style={{ padding: '12px 14px', color: 'var(--text-secondary)' }}>{t.description}</td>
                      <td style={{ padding: '12px 14px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                        {t.payment_method}
                      </td>
                      <td
                        style={{
                          padding: '12px 14px',
                          textAlign: 'right',
                          fontWeight: 700,
                          color: t.type === 'revenue' ? 'var(--accent-green)' : 'var(--accent-rose)',
                        }}
                      >
                        {t.type === 'revenue' ? '+' : '-'} R$ {t.amount.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: INVENTORY MANAGEMENT (RF01) */}
      {activeTab === 'inventory' && (
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-strong)', borderRadius: 'var(--radius-lg)', padding: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <div>
              <h3 style={{ fontSize: '1.2rem', color: '#fff' }}>Inventário de Consoles PS5 (RF01)</h3>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                Cadastro individual por número de série e monitoramento de estado de conservação
              </p>
            </div>

            <button className="btn btn-primary btn-sm" onClick={() => setShowAddConsoleModal(true)}>
              <Plus size={16} /> Adicionar Nova Unidade
            </button>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-strong)', textAlign: 'left', color: 'var(--text-muted)' }}>
                  <th style={{ padding: '12px 14px' }}>Console / Apelido</th>
                  <th style={{ padding: '12px 14px' }}>Serial Number</th>
                  <th style={{ padding: '12px 14px' }}>Versão</th>
                  <th style={{ padding: '12px 14px' }}>Diária Base</th>
                  <th style={{ padding: '12px 14px' }}>Status Atual</th>
                  <th style={{ padding: '12px 14px' }}>Alterar Status</th>
                </tr>
              </thead>
              <tbody>
                {consoles.map((c) => (
                  <tr key={c.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                    <td style={{ padding: '12px 14px' }}>
                      <div style={{ fontWeight: 600, color: '#fff' }}>{c.name}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{c.condition_notes}</div>
                    </td>
                    <td style={{ padding: '12px 14px', fontFamily: 'monospace', color: 'var(--accent-cyan)' }}>
                      {c.serial_number}
                    </td>
                    <td style={{ padding: '12px 14px' }}>
                      {c.model_type === 'disk' ? (
                        <span style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#fff' }}>
                          <Disc size={14} color="var(--accent-cyan)" /> Com Disco
                        </span>
                      ) : (
                        <span style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#fff' }}>
                          <Cpu size={14} color="var(--accent-green)" /> Digital
                        </span>
                      )}
                    </td>
                    <td style={{ padding: '12px 14px', fontWeight: 600, color: 'var(--accent-green)' }}>
                      R$ {c.daily_rate.toFixed(2)}
                    </td>
                    <td style={{ padding: '12px 14px' }}>{getStatusBadge(c.status)}</td>
                    <td style={{ padding: '12px 14px' }}>
                      <select
                        className="form-select"
                        style={{ padding: '4px 8px', fontSize: '0.78rem', width: 'auto' }}
                        value={c.status}
                        onChange={(e) => handleUpdateConsoleStatus(c.id, e.target.value)}
                      >
                        <option value="available">Disponível</option>
                        <option value="reserved">Reservado</option>
                        <option value="rented">Alugado</option>
                        <option value="maintenance">Manutenção</option>
                        <option value="inactive">Inativo</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: BOOKINGS LIFECYCLE (RF09) */}
      {activeTab === 'bookings' && (
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-strong)', borderRadius: 'var(--radius-lg)', padding: 24 }}>
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: 16,
              marginBottom: 20,
            }}
          >
            <div>
              <h3 style={{ fontSize: '1.2rem', color: '#fff' }}>Gestão do Ciclo de Vida da Locação (RF09)</h3>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                Controle operacional de pagamentos, rotas de entrega, cliente ativo e devoluções
              </p>
            </div>

            {/* Status Filter */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Filter size={16} color="var(--text-muted)" />
              <select
                className="form-select"
                style={{ width: 'auto', padding: '6px 12px', fontSize: '0.82rem' }}
                value={bookingStatusFilter}
                onChange={(e) => setBookingStatusFilter(e.target.value)}
              >
                <option value="">Todos os Status</option>
                <option value="awaiting_payment">Aguardando Pagamento</option>
                <option value="paid_scheduled">Pago / Agendado</option>
                <option value="in_transit">Em Trânsito</option>
                <option value="active">Ativo (Com Cliente)</option>
                <option value="returned_inspection">Devolvido (Em Vistoria)</option>
                <option value="completed">Concluído</option>
                <option value="incident">Sinistro / Avaria</option>
              </select>
            </div>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-strong)', textAlign: 'left', color: 'var(--text-muted)' }}>
                  <th style={{ padding: '12px 14px' }}>Código</th>
                  <th style={{ padding: '12px 14px' }}>Console & Serial</th>
                  <th style={{ padding: '12px 14px' }}>Período</th>
                  <th style={{ padding: '12px 14px' }}>Valor</th>
                  <th style={{ padding: '12px 14px' }}>Status Atual</th>
                  <th style={{ padding: '12px 14px', textAlign: 'right' }}>Ações Operacionais</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((b) => (
                  <tr key={b.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                    <td style={{ padding: '12px 14px' }}>
                      <div style={{ fontWeight: 700, color: '#fff' }}>#{b.booking_code}</div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                        {new Date(b.created_at).toLocaleDateString('pt-BR')}
                      </div>
                    </td>
                    <td style={{ padding: '12px 14px' }}>
                      <div style={{ fontWeight: 600, color: '#fff' }}>{b.console?.name || 'PS5'}</div>
                      <div style={{ fontSize: '0.75rem', fontFamily: 'monospace', color: 'var(--text-muted)' }}>
                        {b.console?.serial_number || 'N/A'}
                      </div>
                    </td>
                    <td style={{ padding: '12px 14px' }}>
                      <div>
                        {new Date(b.start_date).toLocaleDateString('pt-BR')} → {new Date(b.end_date).toLocaleDateString('pt-BR')}
                      </div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--accent-cyan)' }}>{b.rental_period_type}</div>
                    </td>
                    <td style={{ padding: '12px 14px' }}>
                      <div style={{ fontWeight: 700, color: 'var(--accent-green)' }}>R$ {b.total_amount?.toFixed(2)}</div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Caução: R$ {b.security_deposit?.toFixed(2)}</div>
                    </td>
                    <td style={{ padding: '12px 14px' }}>{getStatusBadge(b.status)}</td>
                    <td style={{ padding: '12px 14px', textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: 6, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                        {b.status === 'paid_scheduled' && (
                          <button
                            className="btn btn-outline btn-sm"
                            style={{ fontSize: '0.75rem', padding: '4px 8px' }}
                            onClick={() => setSelectedInspectionBooking(b)}
                          >
                            <ClipboardCheck size={14} /> Vistoria Saída
                          </button>
                        )}

                        {b.status === 'in_transit' && (
                          <button
                            className="btn btn-primary btn-sm"
                            style={{ fontSize: '0.75rem', padding: '4px 8px' }}
                            onClick={() => handleAdvanceStatus(b.id, 'active')}
                          >
                            Entregue ao Cliente
                          </button>
                        )}

                        {b.status === 'active' && (
                          <button
                            className="btn btn-primary btn-sm"
                            style={{ fontSize: '0.75rem', padding: '4px 8px' }}
                            onClick={() => setSelectedInspectionBooking(b)}
                          >
                            <ClipboardCheck size={14} /> Vistoria Devolução
                          </button>
                        )}

                        <button
                          className="btn btn-outline btn-sm"
                          style={{ fontSize: '0.75rem', padding: '4px 8px' }}
                          onClick={() => setSelectedContractBooking(b)}
                        >
                          Contrato
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: INSPECTIONS LIST (RF10) */}
      {activeTab === 'inspections' && (
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-strong)', borderRadius: 'var(--radius-lg)', padding: 24 }}>
          <h3 style={{ fontSize: '1.2rem', color: '#fff', marginBottom: 6 }}>
            Histórico de Vistorias de Check-in e Check-out (RF10)
          </h3>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: 20 }}>
            Registro formal de conferência de cabos, carcaça, higiene e analógicos DualSense
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {inspections.map((insp) => (
              <div
                key={insp.id}
                style={{
                  background: 'rgba(255, 255, 255, 0.02)',
                  border: '1px solid var(--border-strong)',
                  borderRadius: 'var(--radius-md)',
                  padding: 18,
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                  <div>
                    <span
                      style={{
                        padding: '4px 10px',
                        borderRadius: 4,
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        background: insp.type === 'check_in' ? 'rgba(0, 209, 137, 0.15)' : 'rgba(1, 213, 250, 0.15)',
                        color: insp.type === 'check_in' ? 'var(--accent-green)' : 'var(--accent-cyan)',
                        marginRight: 10,
                      }}
                    >
                      {insp.type === 'check_in' ? 'VISTORIA DE SAÍDA (ENTREGA)' : 'VISTORIA DE ENTRADA (RETORNO)'}
                    </span>
                    <span style={{ fontWeight: 600, color: '#fff' }}>Reserva #{insp.booking_id}</span>
                  </div>

                  <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                    Inspetor: {insp.inspector_name} • {new Date(insp.created_at).toLocaleDateString('pt-BR')}
                  </span>
                </div>

                {/* Items Status Tags */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 12 }}>
                  {[
                    { label: 'HDMI', ok: insp.hdmi_cable_ok },
                    { label: 'Força AC', ok: insp.power_cable_ok },
                    { label: 'Carcaça', ok: insp.console_body_ok },
                    { label: 'DualSense', ok: insp.controllers_ok },
                    { label: 'Acessórios/Jogos', ok: insp.games_accessories_ok },
                    { label: 'Higienização', ok: insp.cleanliness_ok },
                  ].map((it, idx) => (
                    <span
                      key={idx}
                      style={{
                        fontSize: '0.72rem',
                        padding: '3px 8px',
                        borderRadius: 4,
                        background: it.ok ? 'rgba(0, 209, 137, 0.1)' : 'rgba(255, 71, 111, 0.15)',
                        color: it.ok ? 'var(--accent-green)' : 'var(--accent-rose)',
                      }}
                    >
                      {it.label}: {it.ok ? 'OK' : 'AVARIA'}
                    </span>
                  ))}
                </div>

                {insp.notes && (
                  <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', fontStyle: 'italic' }}>
                    "{insp.notes}"
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 5: KYC DOCUMENTS (RF06) */}
      {activeTab === 'documents' && (
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-strong)', borderRadius: 'var(--radius-lg)', padding: 24 }}>
          <h3 style={{ fontSize: '1.2rem', color: '#fff', marginBottom: 6 }}>
            Validação Cadastral & Anti-Fraude (RF06)
          </h3>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: 20 }}>
            Verificação de documentos pessoais enviados pelos clientes antes do envio do console
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {documents.map((doc) => (
              <div
                key={doc.id}
                style={{
                  background: 'rgba(255, 255, 255, 0.02)',
                  border: '1px solid var(--border-strong)',
                  borderRadius: 'var(--radius-md)',
                  padding: 18,
                  display: 'flex',
                  flexWrap: 'wrap',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: 14,
                }}
              >
                <div>
                  <div style={{ fontWeight: 600, color: '#fff', fontSize: '0.95rem' }}>
                    {doc.doc_type === 'id_card' ? 'Documento de Identidade (RG/CNH)' : 'Comprovante de Residência'}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    Arquivo: {doc.file_name} • Usuário #{doc.user_id}
                  </div>
                  {doc.notes && (
                    <div style={{ fontSize: '0.78rem', color: 'var(--accent-cyan)', marginTop: 4 }}>
                      Nota: {doc.notes}
                    </div>
                  )}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span
                    style={{
                      padding: '4px 10px',
                      borderRadius: 'var(--radius-full)',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      background:
                        doc.status === 'approved'
                          ? 'rgba(0, 209, 137, 0.15)'
                          : doc.status === 'rejected'
                          ? 'rgba(255, 71, 111, 0.15)'
                          : 'rgba(245, 158, 11, 0.15)',
                      color:
                        doc.status === 'approved'
                          ? 'var(--accent-green)'
                          : doc.status === 'rejected'
                          ? 'var(--accent-rose)'
                          : 'var(--accent-amber)',
                    }}
                  >
                    {doc.status === 'approved' ? 'Aprovado' : doc.status === 'rejected' ? 'Rejeitado' : 'Pendente'}
                  </span>

                  {doc.status === 'pending' && (
                    <>
                      <button
                        className="btn btn-outline btn-sm"
                        style={{ color: 'var(--accent-green)', borderColor: 'rgba(0, 209, 137, 0.4)' }}
                        onClick={() => handleDocumentAction(doc.id, 'approved')}
                      >
                        Aprovar
                      </button>
                      <button
                        className="btn btn-outline btn-sm"
                        style={{ color: 'var(--accent-rose)', borderColor: 'rgba(255, 71, 111, 0.4)' }}
                        onClick={() => handleDocumentAction(doc.id, 'rejected')}
                      >
                        Rejeitar
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MODAL: ADD CONSOLE */}
      {showAddConsoleModal && (
        <div className="modal-backdrop">
          <div className="modal-dialog" style={{ maxWidth: 520 }}>
            <div className="modal-header">
              <h3 style={{ fontSize: '1.15rem', color: '#fff' }}>Cadastrar Nova Unidade PS5</h3>
              <button
                onClick={() => setShowAddConsoleModal(false)}
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleCreateConsole}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Nome / Identificador</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Ex.: PlayStation 5 Slim 1TB #07"
                    value={newConsole.name}
                    onChange={(e) => setNewConsole({ ...newConsole, name: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Número de Série (Único)</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Ex.: CFI-2015A-9812401"
                    value={newConsole.serial_number}
                    onChange={(e) => setNewConsole({ ...newConsole, serial_number: e.target.value })}
                    required
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div className="form-group">
                    <label className="form-label">Versão</label>
                    <select
                      className="form-select"
                      value={newConsole.model_type}
                      onChange={(e) => setNewConsole({ ...newConsole, model_type: e.target.value })}
                    >
                      <option value="disk">Edição com Disco (Blu-Ray)</option>
                      <option value="digital">Edição Digital</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Valor Diária (R$)</label>
                    <input
                      type="number"
                      step="0.01"
                      className="form-input"
                      value={newConsole.daily_rate}
                      onChange={(e) => setNewConsole({ ...newConsole, daily_rate: parseFloat(e.target.value) })}
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Estado de Conservação / Notas</label>
                  <textarea
                    className="form-textarea"
                    rows="3"
                    placeholder="Condição estética, componentes testados, pasta térmica..."
                    value={newConsole.condition_notes}
                    onChange={(e) => setNewConsole({ ...newConsole, condition_notes: e.target.value })}
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-outline btn-sm" onClick={() => setShowAddConsoleModal(false)}>
                  Cancelar
                </button>
                <button type="submit" className="btn btn-primary btn-sm">
                  Salvar Console
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADD EXPENSE */}
      {showAddExpenseModal && (
        <div className="modal-backdrop">
          <div className="modal-dialog" style={{ maxWidth: 500 }}>
            <div className="modal-header">
              <h3 style={{ fontSize: '1.15rem', color: '#fff' }}>Lançamento Financeiro</h3>
              <button
                onClick={() => setShowAddExpenseModal(false)}
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleCreateExpense}>
              <div className="modal-body">
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div className="form-group">
                    <label className="form-label">Tipo de Lançamento</label>
                    <select
                      className="form-select"
                      value={newExpense.type}
                      onChange={(e) => setNewExpense({ ...newExpense, type: e.target.value })}
                    >
                      <option value="expense">Despesa (-)</option>
                      <option value="revenue">Receita (+)</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Categoria</label>
                    <select
                      className="form-select"
                      value={newExpense.category}
                      onChange={(e) => setNewExpense({ ...newExpense, category: e.target.value })}
                    >
                      <option value="maintenance">Manutenção / Reparo</option>
                      <option value="game_purchase">Compra de Jogos</option>
                      <option value="delivery_fee">Frete / Combustível</option>
                      <option value="parts_replacement">Troca de Peças</option>
                      <option value="other">Outros</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Descrição</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Ex.: Troca de módulo do analógico DualSense"
                    value={newExpense.description}
                    onChange={(e) => setNewExpense({ ...newExpense, description: e.target.value })}
                    required
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div className="form-group">
                    <label className="form-label">Valor (R$)</label>
                    <input
                      type="number"
                      step="0.01"
                      className="form-input"
                      placeholder="0.00"
                      value={newExpense.amount}
                      onChange={(e) => setNewExpense({ ...newExpense, amount: e.target.value })}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Forma de Pagamento</label>
                    <select
                      className="form-select"
                      value={newExpense.payment_method}
                      onChange={(e) => setNewExpense({ ...newExpense, payment_method: e.target.value })}
                    >
                      <option value="pix">PIX</option>
                      <option value="credit_card">Cartão</option>
                      <option value="bank_transfer">Transferência</option>
                      <option value="cash">Dinheiro</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-outline btn-sm" onClick={() => setShowAddExpenseModal(false)}>
                  Cancelar
                </button>
                <button type="submit" className="btn btn-primary btn-sm">
                  Salvar Lançamento
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* INSPECTION MODAL */}
      {selectedInspectionBooking && (
        <InspectionModal
          booking={selectedInspectionBooking}
          onClose={() => setSelectedInspectionBooking(null)}
          onSuccess={() => {
            setSelectedInspectionBooking(null);
            loadAllData();
          }}
        />
      )}

      {/* CONTRACT MODAL */}
      {selectedContractBooking && (
        <ContractModal
          booking={selectedContractBooking}
          onClose={() => setSelectedContractBooking(null)}
        />
      )}
    </div>
  );
}
