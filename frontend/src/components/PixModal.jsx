import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { QrCode, Copy, CheckCircle2, Clock, ShieldCheck, X } from 'lucide-react';

export default function PixModal({ booking, onClose, onSuccess }) {
  const { showToast } = useAuth();
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState(15 * 60); // 15 minutes in seconds

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleCopy = () => {
    if (booking?.pix_code) {
      navigator.clipboard.writeText(booking.pix_code);
      setCopied(true);
      showToast('Código PIX copiado com sucesso!', 'success');
      setTimeout(() => setCopied(false), 3000);
    }
  };

  const handleSimulatePayment = async () => {
    setLoading(true);
    try {
      const updated = await api.bookings.pay(booking.id, 'pix');
      showToast('Pagamento aprovado com sucesso! Sua reserva está confirmada.', 'success');
      onSuccess(updated);
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  if (!booking) return null;

  return (
    <div className="modal-backdrop">
      <div className="modal-dialog" style={{ maxWidth: 520 }}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: '50%',
                background: 'rgba(0, 209, 137, 0.15)',
                color: 'var(--accent-green)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <QrCode size={18} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.15rem', color: '#fff' }}>Pagamento via PIX Dinâmico</h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                Reserva #{booking.booking_code}
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

        <div className="modal-body" style={{ textAlign: 'center' }}>
          {/* Anti-overbooking timer */}
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              background: 'rgba(245, 158, 11, 0.12)',
              border: '1px solid rgba(245, 158, 11, 0.3)',
              color: 'var(--accent-amber)',
              padding: '6px 14px',
              borderRadius: 'var(--radius-full)',
              fontSize: '0.82rem',
              fontWeight: 600,
              marginBottom: 20,
            }}
          >
            <Clock size={16} />
            <span>Console retido temporariamente: <strong>{formatTime(timeLeft)}</strong></span>
          </div>

          {/* Amount Box */}
          <div
            style={{
              background: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid var(--border-strong)',
              borderRadius: 'var(--radius-md)',
              padding: 16,
              marginBottom: 20,
            }}
          >
            <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
              Valor Total a Pagar
            </span>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--accent-green)' }}>
              R$ {booking.total_amount?.toFixed(2)}
            </div>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              (Inclui caução reembolsável de R$ {booking.security_deposit?.toFixed(2)})
            </span>
          </div>

          {/* QR Code Simulation Box */}
          <div
            style={{
              background: '#ffffff',
              borderRadius: 'var(--radius-md)',
              padding: 18,
              display: 'inline-block',
              marginBottom: 20,
              boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
            }}
          >
            <img
              src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(
                booking.pix_code || 'PLAYLOC_PS5_PIX'
              )}`}
              alt="QR Code PIX"
              style={{ width: 180, height: 180, display: 'block' }}
            />
          </div>

          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: 12 }}>
            Abra o app do seu banco, escolha <strong>Pagar via Pix</strong> e aponte a câmera para o QR Code acima, ou copie o código abaixo:
          </p>

          {/* Copy-Paste Code */}
          <div
            style={{
              display: 'flex',
              gap: 8,
              background: 'var(--bg-input)',
              border: '1px solid var(--border-strong)',
              borderRadius: 'var(--radius-sm)',
              padding: '6px 8px',
              alignItems: 'center',
              marginBottom: 20,
            }}
          >
            <input
              type="text"
              readOnly
              value={booking.pix_code || ''}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--text-secondary)',
                fontSize: '0.8rem',
                flex: 1,
                outline: 'none',
                fontFamily: 'monospace',
              }}
            />
            <button
              className="btn btn-outline btn-sm"
              onClick={handleCopy}
              style={{ padding: '6px 12px' }}
            >
              {copied ? <CheckCircle2 size={16} color="var(--accent-green)" /> : <Copy size={16} />}
              <span>{copied ? 'Copiado!' : 'Copiar'}</span>
            </button>
          </div>

          {/* Immediate Simulation Trigger */}
          <button
            className="btn btn-success btn-lg"
            onClick={handleSimulatePayment}
            disabled={loading}
            style={{ width: '100%', marginBottom: 12 }}
          >
            {loading ? 'Confirmando...' : '✓ Simular Confirmação Imediata de Pagamento'}
          </button>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6,
              color: 'var(--text-muted)',
              fontSize: '0.75rem',
            }}
          >
            <ShieldCheck size={14} color="var(--accent-cyan)" />
            <span>Ambiente seguro. Confirmação instantânea via webhook.</span>
          </div>
        </div>
      </div>
    </div>
  );
}
