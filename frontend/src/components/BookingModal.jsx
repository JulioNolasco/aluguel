import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  Calendar,
  Gamepad2,
  Plus,
  Minus,
  Truck,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  X,
  CreditCard,
  QrCode,
} from 'lucide-react';

export default function BookingModal({ consoleItem, initialPeriod = 'weekend', onClose, onSuccess }) {
  const { user, showToast } = useAuth();
  const [periodType, setPeriodType] = useState(initialPeriod);

  // Default dates
  const today = new Date().toISOString().split('T')[0];
  const next3Days = new Date(Date.now() + 3 * 86400000).toISOString().split('T')[0];

  const [startDate, setStartDate] = useState(today);
  const [endDate, setEndDate] = useState(next3Days);
  const [accessories, setAccessories] = useState([]);
  const [selectedItems, setSelectedItems] = useState({}); // { [accessoryId]: quantity }
  const [deliveryType, setDeliveryType] = useState('delivery');
  const [deliveryAddress, setDeliveryAddress] = useState(user?.address || '');
  const [paymentMethod, setPaymentMethod] = useState('pix');
  const [termsAccepted, setTermsAccepted] = useState(false);

  const [simulation, setSimulation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [simulating, setSimulating] = useState(false);

  // Fetch accessories catalog
  useEffect(() => {
    async function loadAccessories() {
      try {
        const data = await api.accessories.list();
        setAccessories(data);
      } catch (err) {
        console.error(err);
      }
    }
    loadAccessories();
  }, []);

  // Set date ranges automatically when period pill is clicked
  const handlePeriodChange = (type) => {
    setPeriodType(type);
    const start = new Date(startDate || today);
    let daysToAdd = 1;
    if (type === 'weekend') daysToAdd = 3;
    if (type === 'weekly') daysToAdd = 7;
    if (type === 'monthly') daysToAdd = 30;

    const end = new Date(start.getTime() + daysToAdd * 86400000);
    setEndDate(end.toISOString().split('T')[0]);
  };

  // Run dynamic simulation whenever dates, console, or accessories change
  useEffect(() => {
    async function runSimulation() {
      if (!startDate || !endDate || endDate < startDate) return;
      setSimulating(true);
      try {
        const itemsPayload = Object.entries(selectedItems)
          .filter(([_, qty]) => qty > 0)
          .map(([id, qty]) => ({ accessory_id: parseInt(id), quantity: qty }));

        const sim = await api.bookings.simulate({
          console_id: consoleItem?.id,
          start_date: startDate,
          end_date: endDate,
          rental_period_type: periodType,
          items: itemsPayload,
        });
        setSimulation(sim);
      } catch (err) {
        console.error(err);
      } finally {
        setSimulating(false);
      }
    }
    runSimulation();
  }, [startDate, endDate, periodType, selectedItems, consoleItem]);

  const updateItemQty = (id, delta) => {
    setSelectedItems((prev) => {
      const current = prev[id] || 0;
      const next = Math.max(0, current + delta);
      return { ...prev, [id]: next };
    });
  };

  const handleConfirmBooking = async (e) => {
    e.preventDefault();
    if (!termsAccepted) {
      showToast('Por favor, aceite os termos de responsabilidade e locação.', 'warning');
      return;
    }
    if (deliveryType === 'delivery' && !deliveryAddress.trim()) {
      showToast('Informe o endereço de entrega.', 'warning');
      return;
    }

    setLoading(true);
    try {
      const itemsPayload = Object.entries(selectedItems)
        .filter(([_, qty]) => qty > 0)
        .map(([id, qty]) => ({ accessory_id: parseInt(id), quantity: qty }));

      const booking = await api.bookings.create({
        console_id: consoleItem?.id,
        start_date: startDate,
        end_date: endDate,
        rental_period_type: periodType,
        items: itemsPayload,
        payment_method: paymentMethod,
        delivery_type: deliveryType,
        delivery_address: deliveryAddress,
        terms_accepted: termsAccepted,
      });

      showToast(`Reserva #${booking.booking_code} gerada com sucesso!`, 'success');
      onSuccess(booking);
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-dialog" style={{ maxWidth: 760 }}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Gamepad2 size={24} color="var(--accent-cyan)" />
            <div>
              <h3 style={{ fontSize: '1.2rem', color: '#fff' }}>
                Reserva de PlayStation 5
              </h3>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                {consoleItem ? consoleItem.name : 'Console PS5 Disponível'} — Seleção de Período e Adicionais
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleConfirmBooking}>
          <div className="modal-body" style={{ maxHeight: '68vh', overflowY: 'auto' }}>
            {/* Period Pills */}
            <div style={{ marginBottom: 20 }}>
              <label className="form-label">Pacote / Período Desejado</label>
              <div className="ppc-pills" style={{ justifyContent: 'flex-start' }}>
                {[
                  { id: 'daily', label: 'Diária', badge: 'Flexível' },
                  { id: 'weekend', label: 'Fim de Semana', badge: '15% OFF' },
                  { id: 'weekly', label: 'Semanal (7 dias)', badge: '20% OFF' },
                  { id: 'monthly', label: 'Mensal (30 dias)', badge: '35% OFF' },
                ].map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    className={`ppc-pill ${periodType === p.id ? 'ac-active' : ''}`}
                    onClick={() => handlePeriodChange(p.id)}
                  >
                    <span>{p.label}</span>
                    <span className="ppc-pill-badge">{p.badge}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Dates row */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Data de Início</label>
                <input
                  type="date"
                  className="form-input"
                  min={today}
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  required
                />
              </div>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Data de Devolução</label>
                <input
                  type="date"
                  className="form-input"
                  min={startDate}
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Availability Check Alert */}
            {simulation && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  padding: '10px 14px',
                  borderRadius: 'var(--radius-sm)',
                  marginBottom: 20,
                  background: simulation.is_available ? 'rgba(0, 209, 137, 0.1)' : 'rgba(255, 71, 111, 0.12)',
                  border: `1px solid ${simulation.is_available ? 'rgba(0, 209, 137, 0.3)' : 'rgba(255, 71, 111, 0.3)'}`,
                  color: simulation.is_available ? 'var(--accent-green)' : 'var(--accent-rose)',
                  fontSize: '0.85rem',
                }}
              >
                {simulation.is_available ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
                <span>
                  {simulation.is_available
                    ? `Período disponível! (${simulation.days} ${simulation.days === 1 ? 'diária' : 'diárias'}) — Frota com unidades prontas para envio.`
                    : 'Período indisponível para este console. Escolha outras datas ou outro modelo.'}
                </span>
              </div>
            )}

            {/* Accessories & Games Selector */}
            <div style={{ marginBottom: 24 }}>
              <label className="form-label" style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Adicionar Controles Extras & Jogos</span>
                <span style={{ fontSize: '0.78rem', color: 'var(--accent-cyan)' }}>Opcional</span>
              </label>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                  gap: 12,
                  maxHeight: 220,
                  overflowY: 'auto',
                  paddingRight: 6,
                }}
              >
                {accessories.map((acc) => {
                  const qty = selectedItems[acc.id] || 0;
                  return (
                    <div
                      key={acc.id}
                      style={{
                        background: qty > 0 ? 'rgba(1, 213, 250, 0.08)' : 'rgba(255, 255, 255, 0.02)',
                        border: `1px solid ${qty > 0 ? 'var(--accent-cyan)' : 'var(--border-strong)'}`,
                        borderRadius: 'var(--radius-sm)',
                        padding: '10px 14px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                      }}
                    >
                      <div>
                        <div style={{ fontSize: '0.88rem', fontWeight: 600, color: '#fff' }}>{acc.name}</div>
                        <div style={{ fontSize: '0.78rem', color: 'var(--accent-green)' }}>
                          + R$ {acc.daily_rate.toFixed(2)}/dia
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <button
                          type="button"
                          className="btn btn-outline btn-sm"
                          style={{ padding: 4, width: 26, height: 26, borderRadius: 6 }}
                          onClick={() => updateItemQty(acc.id, -1)}
                          disabled={qty === 0}
                        >
                          <Minus size={14} />
                        </button>
                        <span style={{ fontWeight: 700, minWidth: 16, textAlign: 'center' }}>{qty}</span>
                        <button
                          type="button"
                          className="btn btn-outline btn-sm"
                          style={{ padding: 4, width: 26, height: 26, borderRadius: 6 }}
                          onClick={() => updateItemQty(acc.id, 1)}
                        >
                          <Plus size={14} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Delivery Type & Address */}
            <div style={{ marginBottom: 20 }}>
              <label className="form-label">Opção de Entrega</label>
              <div style={{ display: 'flex', gap: 12, marginBottom: 12 }}>
                <button
                  type="button"
                  className={`btn btn-sm ${deliveryType === 'delivery' ? 'btn-primary' : 'btn-outline'}`}
                  style={{ flex: 1 }}
                  onClick={() => setDeliveryType('delivery')}
                >
                  <Truck size={16} /> Entrega Expressa no Endereço
                </button>
                <button
                  type="button"
                  className={`btn btn-sm ${deliveryType === 'pickup' ? 'btn-primary' : 'btn-outline'}`}
                  style={{ flex: 1 }}
                  onClick={() => setDeliveryType('pickup')}
                >
                  Retirada no Balcão Oficial
                </button>
              </div>

              {deliveryType === 'delivery' && (
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Endereço Completo de Entrega</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Rua, número, apto, bairro e cidade"
                    value={deliveryAddress}
                    onChange={(e) => setDeliveryAddress(e.target.value)}
                    required
                  />
                </div>
              )}
            </div>

            {/* Payment Method */}
            <div style={{ marginBottom: 24 }}>
              <label className="form-label">Forma de Pagamento</label>
              <div style={{ display: 'flex', gap: 12 }}>
                <button
                  type="button"
                  className={`btn btn-sm ${paymentMethod === 'pix' ? 'btn-accent' : 'btn-outline'}`}
                  style={{ flex: 1 }}
                  onClick={() => setPaymentMethod('pix')}
                >
                  <QrCode size={16} /> PIX Dinâmico (Aprovação Instantânea)
                </button>
                <button
                  type="button"
                  className={`btn btn-sm ${paymentMethod === 'credit_card' ? 'btn-accent' : 'btn-outline'}`}
                  style={{ flex: 1 }}
                  onClick={() => setPaymentMethod('credit_card')}
                >
                  <CreditCard size={16} /> Cartão de Crédito (Caução Pré-autorizada)
                </button>
              </div>
            </div>

            {/* Summary Price Box */}
            {simulation && (
              <div
                style={{
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid var(--border-strong)',
                  borderRadius: 'var(--radius-md)',
                  padding: 16,
                  marginBottom: 20,
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: '0.85rem' }}>
                  <span>Aluguel Console ({simulation.days} dias):</span>
                  <span>R$ {simulation.console_total.toFixed(2)}</span>
                </div>
                {simulation.items_total > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: '0.85rem' }}>
                    <span>Periféricos & Jogos Extras:</span>
                    <span>R$ {simulation.items_total.toFixed(2)}</span>
                  </div>
                )}
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    marginBottom: 10,
                    fontSize: '0.85rem',
                    color: 'var(--accent-amber)',
                  }}
                >
                  <span>Caução reembolsável:</span>
                  <span>R$ {simulation.security_deposit.toFixed(2)}</span>
                </div>
                <div
                  style={{
                    borderTop: '1px solid var(--border-subtle)',
                    paddingTop: 10,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    fontWeight: 700,
                  }}
                >
                  <span style={{ color: '#fff', fontSize: '1rem' }}>Total da Reserva:</span>
                  <span style={{ color: 'var(--accent-green)', fontSize: '1.4rem' }}>
                    R$ {simulation.total_amount.toFixed(2)}
                  </span>
                </div>
              </div>
            )}

            {/* Terms of Rental Checkbox (RF06) */}
            <div
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: 10,
                background: 'rgba(1, 213, 250, 0.05)',
                border: '1px solid rgba(1, 213, 250, 0.2)',
                padding: 14,
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.82rem',
                color: 'var(--text-secondary)',
              }}
            >
              <input
                type="checkbox"
                id="termsCheck"
                checked={termsAccepted}
                onChange={(e) => setTermsAccepted(e.target.checked)}
                style={{ marginTop: 2, cursor: 'pointer' }}
                required
              />
              <label htmlFor="termsCheck" style={{ cursor: 'pointer' }}>
                Li e concordo com os <strong>Termos de Locação e Responsabilidade por Danos</strong>.
                Estou ciente de que o console PS5 possui lacres de segurança e que a caução de R$ 150 será estornada
                integralmente após a vistoria de devolução.
              </label>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-outline btn-sm" onClick={onClose}>
              Voltar
            </button>
            <button
              type="submit"
              className="btn btn-primary btn-lg"
              disabled={loading || (simulation && !simulation.is_available)}
            >
              {loading ? 'Processando Reserva...' : 'Avançar para Pagamento →'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
