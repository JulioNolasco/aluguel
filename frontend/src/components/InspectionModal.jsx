import React, { useState } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { ClipboardCheck, CheckSquare, Square, AlertTriangle, X } from 'lucide-react';

export default function InspectionModal({ booking, onClose, onSuccess }) {
  const { showToast } = useAuth();
  const [type, setType] = useState('check_in'); // check_in or check_out
  const [inspectorName, setInspectorName] = useState('Carlos Operador');
  const [checks, setChecks] = useState({
    hdmi_cable_ok: true,
    power_cable_ok: true,
    console_body_ok: true,
    controllers_ok: true,
    games_accessories_ok: true,
    cleanliness_ok: true,
  });
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  const toggleCheck = (key) => {
    setChecks((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.inspections.create({
        booking_id: booking.id,
        type,
        inspector_name: inspectorName,
        ...checks,
        notes,
      });
      showToast(
        type === 'check_in'
          ? 'Vistoria de saída registrada! Pedido pronto/em trânsito.'
          : 'Vistoria de devolução finalizada com sucesso!',
        'success'
      );
      onSuccess();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  if (!booking) return null;

  return (
    <div className="modal-backdrop">
      <div className="modal-dialog" style={{ maxWidth: 600 }}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <ClipboardCheck size={22} color="var(--accent-cyan)" />
            <div>
              <h3 style={{ fontSize: '1.15rem', color: '#fff' }}>Checklist de Vistoria de Integridade</h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                Reserva #{booking.booking_code} — {booking.console?.name || 'Console PS5'}
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

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {/* Type Switcher */}
            <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
              <button
                type="button"
                className={`btn btn-sm ${type === 'check_in' ? 'btn-primary' : 'btn-outline'}`}
                style={{ flex: 1 }}
                onClick={() => setType('check_in')}
              >
                Vistoria de Saída (Check-in Entrega)
              </button>
              <button
                type="button"
                className={`btn btn-sm ${type === 'check_out' ? 'btn-primary' : 'btn-outline'}`}
                style={{ flex: 1 }}
                onClick={() => setType('check_out')}
              >
                Vistoria de Retorno (Check-out Devolução)
              </button>
            </div>

            <div className="form-group">
              <label className="form-label">Nome do Vistoriador / Operador</label>
              <input
                type="text"
                className="form-input"
                value={inspectorName}
                onChange={(e) => setInspectorName(e.target.value)}
                required
              />
            </div>

            <label className="form-label" style={{ marginBottom: 12 }}>
              Itens Obrigatórios de Conferência (RF10)
            </label>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: 12,
                marginBottom: 20,
              }}
            >
              {[
                { key: 'hdmi_cable_ok', label: 'Cabo HDMI Original' },
                { key: 'power_cable_ok', label: 'Cabo de Força AC' },
                { key: 'console_body_ok', label: 'Carcaça / Sem Riscos' },
                { key: 'controllers_ok', label: 'DualSense (Gatilhos e Analógicos)' },
                { key: 'games_accessories_ok', label: 'Acessórios e Mídias Físicas' },
                { key: 'cleanliness_ok', label: 'Higienização e Lacres' },
              ].map((item) => (
                <div
                  key={item.key}
                  onClick={() => toggleCheck(item.key)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    padding: '10px 14px',
                    borderRadius: 'var(--radius-sm)',
                    background: checks[item.key] ? 'rgba(0, 209, 137, 0.08)' : 'rgba(255, 71, 111, 0.08)',
                    border: `1px solid ${checks[item.key] ? 'rgba(0, 209, 137, 0.3)' : 'rgba(255, 71, 111, 0.3)'}`,
                    cursor: 'pointer',
                    userSelect: 'none',
                  }}
                >
                  {checks[item.key] ? (
                    <CheckSquare size={18} color="var(--accent-green)" />
                  ) : (
                    <Square size={18} color="var(--accent-rose)" />
                  )}
                  <span style={{ fontSize: '0.85rem', color: checks[item.key] ? '#fff' : 'var(--accent-rose)' }}>
                    {item.label}
                  </span>
                </div>
              ))}
            </div>

            {Object.values(checks).includes(false) && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: 10,
                  borderRadius: 'var(--radius-sm)',
                  background: 'rgba(255, 71, 111, 0.12)',
                  color: 'var(--accent-rose)',
                  fontSize: '0.82rem',
                  marginBottom: 16,
                }}
              >
                <AlertTriangle size={16} />
                <span>Atenção: Itens desmarcados classificarão a devolução como Sinistro/Manutenção.</span>
              </div>
            )}

            <div className="form-group">
              <label className="form-label">Observações e Avarias / Lacres</label>
              <textarea
                className="form-textarea"
                rows="3"
                placeholder="Ex.: Lacre nº 4491 conferido intacto. Nenhum risco visível. Analógicos testados no Astro Bot."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-outline btn-sm" onClick={onClose}>
              Cancelar
            </button>
            <button type="submit" className="btn btn-primary btn-sm" disabled={loading}>
              {loading ? 'Salvando...' : 'Salvar Vistoria'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
