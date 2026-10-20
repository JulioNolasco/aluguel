import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  Calendar,
  Package,
  FileText,
  Upload,
  CheckCircle2,
  Clock,
  Truck,
  Gamepad2,
  ShieldCheck,
  AlertCircle,
  HelpCircle,
  User,
} from 'lucide-react';
import PixModal from '../components/PixModal';
import ContractModal from '../components/ContractModal';

export default function CustomerDashboard() {
  const { user, refreshUser, showToast } = useAuth();
  const [activeTab, setActiveTab] = useState('bookings'); // bookings, documents, profile
  const [bookings, setBookings] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [selectedPixBooking, setSelectedPixBooking] = useState(null);
  const [selectedContractBooking, setSelectedContractBooking] = useState(null);
  const [showInstructions, setShowInstructions] = useState(false);

  // Document upload state
  const [docType, setDocType] = useState('id_card');
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  // Profile update state
  const [phone, setPhone] = useState(user?.phone || '');
  const [address, setAddress] = useState(user?.address || '');
  const [cpf, setCpf] = useState(user?.cpf_cnpj || '');
  const [savingProfile, setSavingProfile] = useState(false);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const [bList, dList] = await Promise.all([
          api.bookings.list(),
          api.documents.getMy(),
        ]);
        setBookings(bList);
        setDocuments(dList);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const handleUploadDoc = async (e) => {
    e.preventDefault();
    if (!file) {
      showToast('Selecione um arquivo de foto ou PDF.', 'warning');
      return;
    }
    setUploading(true);
    try {
      await api.documents.upload(docType, file);
      showToast('Documento enviado com sucesso! Análise em até 2 horas.', 'success');
      setFile(null);
      const updatedDocs = await api.documents.getMy();
      setDocuments(updatedDocs);
      await refreshUser();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setUploading(false);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      await api.auth.updateMe({ phone, address, cpf_cnpj: cpf });
      showToast('Dados cadastrais atualizados com sucesso!', 'success');
      await refreshUser();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setSavingProfile(false);
    }
  };

  const getStatusBadge = (status) => {
    const map = {
      awaiting_payment: { label: 'Aguardando Pagamento', color: 'var(--accent-amber)', bg: 'rgba(245, 158, 11, 0.15)' },
      paid_scheduled: { label: 'Pago / Agendado', color: 'var(--accent-cyan)', bg: 'rgba(1, 213, 250, 0.15)' },
      in_transit: { label: 'Em Trânsito / Entrega', color: '#a855f7', bg: 'rgba(168, 85, 247, 0.15)' },
      active: { label: 'Ativo (Com Você)', color: 'var(--accent-green)', bg: 'rgba(0, 209, 137, 0.15)' },
      returned_inspection: { label: 'Devolvido (Em Vistoria)', color: '#38bdf8', bg: 'rgba(56, 189, 248, 0.15)' },
      completed: { label: 'Concluído', color: '#94a3b8', bg: 'rgba(148, 163, 184, 0.15)' },
      cancelled: { label: 'Cancelado', color: 'var(--accent-rose)', bg: 'rgba(255, 71, 111, 0.15)' },
      incident: { label: 'Sinistro / Avaria', color: 'var(--accent-rose)', bg: 'rgba(255, 71, 111, 0.15)' },
    };
    const s = map[status] || { label: status, color: '#fff', bg: 'rgba(255, 255, 255, 0.1)' };
    return (
      <span
        style={{
          color: s.color,
          background: s.bg,
          padding: '4px 12px',
          borderRadius: 'var(--radius-full)',
          fontSize: '0.78rem',
          fontWeight: 700,
        }}
      >
        {s.label}
      </span>
    );
  };

  const lifecycleSteps = [
    { key: 'awaiting_payment', label: 'Pagamento' },
    { key: 'paid_scheduled', label: 'Agendado' },
    { key: 'in_transit', label: 'Em Rota' },
    { key: 'active', label: 'Com Você' },
    { key: 'completed', label: 'Concluído' },
  ];

  const getStepProgress = (status) => {
    const idx = lifecycleSteps.findIndex((s) => s.key === status);
    if (idx === -1) {
      if (status === 'returned_inspection') return 4;
      return 1;
    }
    return idx + 1;
  };

  return (
    <div className="container" style={{ padding: '40px 0 80px' }}>
      {/* Header Profile Summary */}
      <div
        style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border-strong)',
          borderRadius: 'var(--radius-lg)',
          padding: '24px 32px',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 20,
          marginBottom: 32,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #0070d1, #01d5fa)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.4rem',
              fontWeight: 800,
              color: '#fff',
            }}
          >
            {user?.name?.[0]?.toUpperCase()}
          </div>
          <div>
            <h1 style={{ fontSize: '1.4rem', color: '#fff', marginBottom: 4 }}>
              Olá, {user?.name}!
            </h1>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              {user?.email} • {user?.phone || 'Telefone não informado'}
            </p>
          </div>
        </div>

        {/* KYC Badge */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {user?.documents_verified ? (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                background: 'rgba(0, 209, 137, 0.1)',
                border: '1px solid rgba(0, 209, 137, 0.3)',
                padding: '8px 16px',
                borderRadius: 'var(--radius-full)',
                color: 'var(--accent-green)',
                fontSize: '0.85rem',
                fontWeight: 600,
              }}
            >
              <ShieldCheck size={18} />
              <span>Cadastro 100% Verificado</span>
            </div>
          ) : (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                background: 'rgba(245, 158, 11, 0.1)',
                border: '1px solid rgba(245, 158, 11, 0.3)',
                padding: '8px 16px',
                borderRadius: 'var(--radius-full)',
                color: 'var(--accent-amber)',
                fontSize: '0.85rem',
                fontWeight: 600,
              }}
            >
              <Clock size={18} />
              <span>Verificação de Documentos Pendente</span>
            </div>
          )}
        </div>
      </div>

      {/* Navigation Tabs */}
      <div style={{ display: 'flex', gap: 12, borderBottom: '1px solid var(--border-subtle)', marginBottom: 32 }}>
        <button
          className={`btn ${activeTab === 'bookings' ? 'btn-primary' : 'btn-outline'} btn-sm`}
          onClick={() => setActiveTab('bookings')}
        >
          <Package size={16} /> Minhas Locações ({bookings.length})
        </button>
        <button
          className={`btn ${activeTab === 'documents' ? 'btn-primary' : 'btn-outline'} btn-sm`}
          onClick={() => setActiveTab('documents')}
        >
          <Upload size={16} /> Documentos & Anti-Fraude
        </button>
        <button
          className={`btn ${activeTab === 'profile' ? 'btn-primary' : 'btn-outline'} btn-sm`}
          onClick={() => setActiveTab('profile')}
        >
          <User size={16} /> Meus Dados & Endereço
        </button>
      </div>

      {/* TAB 1: BOOKINGS */}
      {activeTab === 'bookings' && (
        <div>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)' }}>
              Carregando suas locações...
            </div>
          ) : bookings.length === 0 ? (
            <div
              style={{
                textAlign: 'center',
                padding: '60px 20px',
                background: 'var(--bg-card)',
                borderRadius: 'var(--radius-lg)',
                border: '1px solid var(--border-strong)',
              }}
            >
              <Gamepad2 size={48} color="var(--text-muted)" style={{ marginBottom: 16 }} />
              <h3 style={{ fontSize: '1.2rem', color: '#fff', marginBottom: 8 }}>Você ainda não realizou nenhuma reserva</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: 20 }}>
                Explore nossos consoles PlayStation 5 e receba hoje mesmo no conforto da sua casa.
              </p>
              <a href="#catalog" className="btn btn-primary btn-sm">
                Ver Catálogo de Consoles
              </a>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              {bookings.map((b) => {
                const currentStep = getStepProgress(b.status);
                return (
                  <div
                    key={b.id}
                    style={{
                      background: 'var(--bg-card)',
                      border: '1px solid var(--border-strong)',
                      borderRadius: 'var(--radius-lg)',
                      padding: 24,
                    }}
                  >
                    {/* Top Row */}
                    <div
                      style={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        gap: 12,
                        marginBottom: 20,
                      }}
                    >
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <span style={{ fontSize: '1.15rem', fontWeight: 800, color: '#fff' }}>
                            Reserva #{b.booking_code}
                          </span>
                          {getStatusBadge(b.status)}
                        </div>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                          Criada em {new Date(b.created_at).toLocaleDateString('pt-BR')}
                        </span>
                      </div>

                      <div style={{ textAlign: 'right' }}>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Valor Total</span>
                        <div style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--accent-green)' }}>
                          R$ {b.total_amount?.toFixed(2)}
                        </div>
                      </div>
                    </div>

                    {/* Stepper Progress Bar (RF09 Lifecycle) */}
                    {b.status !== 'cancelled' && (
                      <div
                        style={{
                          background: 'rgba(255, 255, 255, 0.02)',
                          padding: '16px 20px',
                          borderRadius: 'var(--radius-md)',
                          marginBottom: 20,
                        }}
                      >
                        <div
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            position: 'relative',
                            marginBottom: 8,
                          }}
                        >
                          {lifecycleSteps.map((s, idx) => {
                            const isPassed = idx + 1 <= currentStep;
                            return (
                              <div
                                key={s.key}
                                style={{
                                  display: 'flex',
                                  flexDirection: 'column',
                                  alignItems: 'center',
                                  flex: 1,
                                  textAlign: 'center',
                                  zIndex: 2,
                                }}
                              >
                                <div
                                  style={{
                                    width: 24,
                                    height: 24,
                                    borderRadius: '50%',
                                    background: isPassed ? 'var(--accent-green)' : '#1e2840',
                                    color: isPassed ? '#000' : 'var(--text-muted)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '0.72rem',
                                    fontWeight: 800,
                                    marginBottom: 6,
                                  }}
                                >
                                  {isPassed ? '✓' : idx + 1}
                                </div>
                                <span
                                  style={{
                                    fontSize: '0.75rem',
                                    fontWeight: isPassed ? 700 : 400,
                                    color: isPassed ? '#fff' : 'var(--text-muted)',
                                  }}
                                >
                                  {s.label}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Booking Details */}
                    <div
                      style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                        gap: 16,
                        marginBottom: 20,
                        fontSize: '0.85rem',
                      }}
                    >
                      <div>
                        <span style={{ color: 'var(--text-muted)' }}>Console:</span>
                        <div style={{ fontWeight: 600, color: '#fff' }}>{b.console?.name || 'PS5 Standard'}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>
                          Serial: {b.console?.serial_number || 'N/A'}
                        </div>
                      </div>

                      <div>
                        <span style={{ color: 'var(--text-muted)' }}>Período de Locação:</span>
                        <div style={{ fontWeight: 600, color: '#fff' }}>
                          {new Date(b.start_date).toLocaleDateString('pt-BR')} até{' '}
                          {new Date(b.end_date).toLocaleDateString('pt-BR')}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--accent-cyan)' }}>
                          Pacote: {b.rental_period_type}
                        </div>
                      </div>

                      <div>
                        <span style={{ color: 'var(--text-muted)' }}>Entrega:</span>
                        <div style={{ fontWeight: 600, color: '#fff' }}>
                          {b.delivery_type === 'delivery' ? 'Entrega em Domicílio' : 'Retirada no Balcão'}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          {b.delivery_address || 'Endereço em cadastro'}
                        </div>
                      </div>

                      <div>
                        <span style={{ color: 'var(--text-muted)' }}>Caução de Segurança:</span>
                        <div style={{ fontWeight: 600, color: 'var(--accent-amber)' }}>
                          R$ {b.security_deposit?.toFixed(2)} (Reembolsável)
                        </div>
                      </div>
                    </div>

                    {/* Items List */}
                    {b.items?.length > 0 && (
                      <div
                        style={{
                          background: 'rgba(0, 0, 0, 0.2)',
                          padding: '10px 14px',
                          borderRadius: 'var(--radius-sm)',
                          marginBottom: 20,
                          fontSize: '0.82rem',
                        }}
                      >
                        <span style={{ color: 'var(--text-muted)', fontWeight: 600 }}>Itens Adicionais: </span>
                        {b.items.map((i) => `${i.quantity}x ${i.accessory?.name || 'Acessório'}`).join(' • ')}
                      </div>
                    )}

                    {/* Actions */}
                    <div
                      style={{
                        borderTop: '1px solid var(--border-subtle)',
                        paddingTop: 16,
                        display: 'flex',
                        flexWrap: 'wrap',
                        justifyContent: 'flex-end',
                        gap: 10,
                      }}
                    >
                      {b.status === 'awaiting_payment' && (
                        <button
                          className="btn btn-primary btn-sm"
                          onClick={() => setSelectedPixBooking(b)}
                        >
                          Pagar via PIX (Código / QR)
                        </button>
                      )}

                      <button
                        className="btn btn-outline btn-sm"
                        onClick={() => setSelectedContractBooking(b)}
                      >
                        <FileText size={15} /> Ver Contrato Assinado
                      </button>

                      <button
                        className="btn btn-outline btn-sm"
                        onClick={() => setShowInstructions(true)}
                      >
                        <HelpCircle size={15} /> Instruções de Uso
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: DOCUMENTS VALIDATION */}
      {activeTab === 'documents' && (
        <div style={{ maxWidth: 720 }}>
          <div
            style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border-strong)',
              borderRadius: 'var(--radius-lg)',
              padding: 28,
              marginBottom: 32,
            }}
          >
            <h3 style={{ fontSize: '1.2rem', color: '#fff', marginBottom: 8 }}>
              Envio de Documentos (Validação Anti-Fraude - RF06)
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', lineHeight: 1.6, marginBottom: 20 }}>
              Para garantir a segurança patrimonial dos consoles, envie uma foto legível do seu <strong>documento oficial com foto (RG ou CNH)</strong> e um <strong>comprovante de residência recente</strong>. Seus dados são protegidos por criptografia de acordo com a LGPD.
            </p>

            <form onSubmit={handleUploadDoc}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Tipo de Documento</label>
                  <select
                    className="form-select"
                    value={docType}
                    onChange={(e) => setDocType(e.target.value)}
                  >
                    <option value="id_card">Documento com Foto (RG / CNH)</option>
                    <option value="proof_of_residence">Comprovante de Residência</option>
                  </select>
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Arquivo (Foto / PDF)</label>
                  <input
                    type="file"
                    className="form-input"
                    accept="image/*,.pdf"
                    onChange={(e) => setFile(e.target.files[0])}
                    required
                  />
                </div>
              </div>

              <button type="submit" className="btn btn-primary btn-sm" disabled={uploading}>
                {uploading ? 'Enviando...' : 'Enviar Documento para Validação'}
              </button>
            </form>
          </div>

          {/* Uploaded Documents List */}
          <h4 style={{ color: '#fff', fontSize: '1.1rem', marginBottom: 16 }}>Documentos Enviados</h4>
          {documents.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Nenhum documento enviado ainda.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {documents.map((d) => (
                <div
                  key={d.id}
                  style={{
                    background: 'var(--bg-card)',
                    border: '1px solid var(--border-strong)',
                    borderRadius: 'var(--radius-sm)',
                    padding: '14px 18px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 600, color: '#fff', fontSize: '0.9rem' }}>
                      {d.doc_type === 'id_card' ? 'Documento de Identidade (RG/CNH)' : 'Comprovante de Residência'}
                    </div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                      Arquivo: {d.file_name} • Enviado em {new Date(d.uploaded_at).toLocaleDateString('pt-BR')}
                    </div>
                  </div>

                  <span
                    style={{
                      padding: '4px 10px',
                      borderRadius: 'var(--radius-full)',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      background:
                        d.status === 'approved'
                          ? 'rgba(0, 209, 137, 0.15)'
                          : d.status === 'rejected'
                          ? 'rgba(255, 71, 111, 0.15)'
                          : 'rgba(245, 158, 11, 0.15)',
                      color:
                        d.status === 'approved'
                          ? 'var(--accent-green)'
                          : d.status === 'rejected'
                          ? 'var(--accent-rose)'
                          : 'var(--accent-amber)',
                    }}
                  >
                    {d.status === 'approved' ? 'Aprovado' : d.status === 'rejected' ? 'Recusado' : 'Em Análise'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: PROFILE */}
      {activeTab === 'profile' && (
        <div style={{ maxWidth: 600 }}>
          <div
            style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border-strong)',
              borderRadius: 'var(--radius-lg)',
              padding: 28,
            }}
          >
            <h3 style={{ fontSize: '1.2rem', color: '#fff', marginBottom: 20 }}>Meus Dados Cadastrais</h3>

            <form onSubmit={handleUpdateProfile}>
              <div className="form-group">
                <label className="form-label">Nome Completo</label>
                <input type="text" className="form-input" value={user?.name || ''} disabled />
              </div>

              <div className="form-group">
                <label className="form-label">E-mail</label>
                <input type="text" className="form-input" value={user?.email || ''} disabled />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div className="form-group">
                  <label className="form-label">CPF / CNPJ</label>
                  <input
                    type="text"
                    className="form-input"
                    value={cpf}
                    onChange={(e) => setCpf(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">WhatsApp</label>
                  <input
                    type="text"
                    className="form-input"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Endereço Padrão de Entrega</label>
                <input
                  type="text"
                  className="form-input"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                />
              </div>

              <button type="submit" className="btn btn-primary btn-sm" disabled={savingProfile}>
                {savingProfile ? 'Salvando...' : 'Atualizar Dados'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* PIX Modal */}
      {selectedPixBooking && (
        <PixModal
          booking={selectedPixBooking}
          onClose={() => setSelectedPixBooking(null)}
          onSuccess={(updated) => {
            setSelectedPixBooking(null);
            setBookings((prev) => prev.map((b) => (b.id === updated.id ? updated : b)));
          }}
        />
      )}

      {/* Contract Modal */}
      {selectedContractBooking && (
        <ContractModal
          booking={selectedContractBooking}
          onClose={() => setSelectedContractBooking(null)}
        />
      )}

      {/* Instructions Modal */}
      {showInstructions && (
        <div className="modal-backdrop">
          <div className="modal-dialog" style={{ maxWidth: 540 }}>
            <div className="modal-header">
              <h3 style={{ fontSize: '1.15rem', color: '#fff' }}>Guia de Instalação e Uso do PS5</h3>
              <button
                onClick={() => setShowInstructions(false)}
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>
            <div className="modal-body" style={{ fontSize: '0.88rem', lineHeight: 1.6, color: 'var(--text-secondary)' }}>
              <ol style={{ paddingLeft: 20, display: 'flex', flexDirection: 'column', gap: 12 }}>
                <li><strong>Posicionamento:</strong> Coloque o PlayStation 5 na horizontal ou vertical com pelo menos 10 cm de espaço livre ao redor para ventilação térmica adequada.</li>
                <li><strong>Cabos:</strong> Conecte o cabo HDMI fornecido diretamente na entrada HDMI 2.1 da sua TV para habilitar 4K e 120 FPS. Conecte o cabo de alimentação na tomada aterrada.</li>
                <li><strong>Controle DualSense:</strong> Para emparelhar, utilize o cabo USB-C no primeiro momento e pressione o botão PlayStation no centro do controle.</li>
                <li><strong>Conta PSN:</strong> Você pode logar na sua própria conta PlayStation para continuar seus saves ou jogar offline nos jogos pré-instalados.</li>
                <li><strong>Devolução:</strong> No dia da devolução, guarde os cabos originais na embalagem protetora e certifique-se de deslogar da sua conta.</li>
              </ol>
            </div>
            <div className="modal-footer">
              <button className="btn btn-primary btn-sm" onClick={() => setShowInstructions(false)}>
                Entendido
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
