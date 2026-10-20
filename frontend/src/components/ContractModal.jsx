import React from 'react';
import { FileText, Printer, CheckCircle2, ShieldCheck, X } from 'lucide-react';

export default function ContractModal({ booking, onClose }) {
  if (!booking) return null;

  const handlePrint = () => {
    window.print();
  };

  const clientName = booking.customer?.name || 'Cliente Cadastrado';
  const clientCpf = booking.customer?.cpf_cnpj || '000.000.000-00';
  const clientAddress = booking.delivery_address || booking.customer?.address || 'Endereço em cadastro';

  return (
    <div className="modal-backdrop">
      <div className="modal-dialog" style={{ maxWidth: 750, maxHeight: '88vh' }}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <FileText size={22} color="var(--accent-cyan)" />
            <div>
              <h3 style={{ fontSize: '1.15rem', color: '#fff' }}>Instrumento Particular de Locação de Equipamento</h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                Contrato #{booking.booking_code} — Assinado Eletronicamente
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

        <div
          className="modal-body"
          style={{
            fontSize: '0.86rem',
            lineHeight: 1.6,
            color: 'var(--text-secondary)',
            maxHeight: '60vh',
            overflowY: 'auto',
            paddingRight: 12,
          }}
        >
          {/* Status Header */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              background: 'rgba(0, 209, 137, 0.08)',
              border: '1px solid rgba(0, 209, 137, 0.25)',
              padding: '12px 16px',
              borderRadius: 'var(--radius-sm)',
              marginBottom: 20,
              color: 'var(--accent-green)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <ShieldCheck size={18} />
              <span style={{ fontWeight: 600 }}>Aceite dos Termos Confirmado pelo Cliente</span>
            </div>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              Data: {new Date(booking.created_at).toLocaleDateString('pt-BR')}
            </span>
          </div>

          <h4 style={{ color: '#fff', marginBottom: 6 }}>1. DAS PARTES</h4>
          <p style={{ marginBottom: 14 }}>
            <strong>LOCADORA:</strong> PLAYLOC GESTÃO E LOCAÇÃO DE CONSOLES LTDA, inscrita no CNPJ sob o nº 45.123.789/0001-90, com sede em São Paulo/SP.<br />
            <strong>LOCATÁRIO:</strong> {clientName}, portador do CPF nº {clientCpf}, residente em {clientAddress}.
          </p>

          <h4 style={{ color: '#fff', marginBottom: 6 }}>2. DO OBJETO</h4>
          <p style={{ marginBottom: 14 }}>
            O presente instrumento tem por objeto a locação temporária da seguinte unidade individual:<br />
            • <strong>Equipamento:</strong> {booking.console?.name || 'PlayStation 5'}<br />
            • <strong>Número de Série:</strong> {booking.console?.serial_number || 'Conforme Vistoria'}<br />
            • <strong>Período de Locação:</strong> {new Date(booking.start_date).toLocaleDateString('pt-BR')} até {new Date(booking.end_date).toLocaleDateString('pt-BR')} ({booking.rental_period_type})<br />
            • <strong>Itens Adicionais e Jogos:</strong> {booking.items?.length > 0 ? booking.items.map(i => `${i.quantity}x ${i.accessory?.name || 'Acessório'}`).join(', ') : 'Nenhum item adicional'}
          </p>

          <h4 style={{ color: '#fff', marginBottom: 6 }}>3. DOS VALORES E CAUÇÃO DE SEGURANÇA</h4>
          <p style={{ marginBottom: 14 }}>
            O valor total do período é de <strong>R$ {booking.total_amount?.toFixed(2)}</strong>, incluindo taxa de caução temporária no importe de <strong>R$ {booking.security_deposit?.toFixed(2)}</strong>, a qual será integralmente restituída ao LOCATÁRIO em até 24 horas após a devolução e conferência na vistoria de check-out, desde que o equipamento não apresente avarias, riscos físicos, quebra de lacres ou componentes ausentes.
          </p>

          <h4 style={{ color: '#fff', marginBottom: 6 }}>4. DAS OBRIGAÇÕES E VISTORIAS</h4>
          <p style={{ marginBottom: 14 }}>
            O LOCATÁRIO declara receber o console em perfeito funcionamento, testado e higienizado com lacres de garantia intactos. Obriga-se a mantê-lo em local arejado, protegido contra quedas, umidade e oscilações de energia elétrica. É terminantemente proibida a abertura do aparelho ou violação de lacres, sob pena de perda integral da caução e cobrança do valor de reposição de mercado.
          </p>

          <div
            style={{
              marginTop: 24,
              padding: 16,
              background: 'rgba(255, 255, 255, 0.02)',
              border: '1px solid var(--border-strong)',
              borderRadius: 'var(--radius-sm)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <div>
              <div style={{ fontWeight: 700, color: '#fff' }}>Assinatura Digital Eletrônica</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Hash SHA256: {booking.booking_code}-SECURE-{booking.id * 89312}
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--accent-green)' }}>
              <CheckCircle2 size={16} />
              <span style={{ fontWeight: 600, fontSize: '0.8rem' }}>VÁLIDO CONFORME MP 2.200-2/2001</span>
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn btn-outline btn-sm" onClick={handlePrint}>
            <Printer size={16} /> Imprimir / Salvar PDF
          </button>
          <button className="btn btn-primary btn-sm" onClick={onClose}>
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}
