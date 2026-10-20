import React from 'react';
import { Gamepad2, Shield, HeartHandshake, Headphones, Sparkles, CheckCircle2 } from 'lucide-react';

export default function Footer() {
  return (
    <footer
      style={{
        background: '#090d16',
        borderTop: '1px solid var(--border-subtle)',
        marginTop: 80,
        padding: '60px 0 30px',
        color: 'var(--text-secondary)',
        fontSize: '0.88rem',
      }}
    >
      <div className="container">
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: 40,
            marginBottom: 48,
          }}
        >
          {/* Brand */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 8,
                  background: 'linear-gradient(135deg, #0070d1, #01d5fa)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Gamepad2 size={18} color="#ffffff" />
              </div>
              <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.2rem', color: '#fff' }}>
                Play<span style={{ color: 'var(--accent-cyan)' }}>Loc</span> PS5
              </span>
            </div>
            <p style={{ lineHeight: 1.6, marginBottom: 16 }}>
              A maior e mais segura plataforma de locação de consoles PlayStation 5 de alta performance.
              Jogue os maiores lançamentos sem precisar desembolsar milhares de reais.
            </p>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center', color: 'var(--accent-green)' }}>
              <CheckCircle2 size={16} />
              <span style={{ fontSize: '0.82rem', fontWeight: 600 }}>100% Testado e Higienizado</span>
            </div>
          </div>

          {/* Links */}
          <div>
            <h4 style={{ color: '#fff', fontSize: '0.95rem', marginBottom: 16, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Navegação
            </h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 10 }}>
              <li><a href="#home" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>Catálogo de Consoles PS5</a></li>
              <li><a href="#catalog" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>Jogos & Acessórios</a></li>
              <li><a href="#how-it-works" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>Como Funciona a Reserva</a></li>
              <li><a href="#faq" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>Perguntas Frequentes</a></li>
            </ul>
          </div>

          {/* Segurança & Caução */}
          <div>
            <h4 style={{ color: '#fff', fontSize: '0.95rem', marginBottom: 16, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Segurança & Garantia
            </h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 10 }}>
              <li style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Shield size={16} color="var(--accent-cyan)" /> Contrato Digital com Assinatura Eletrônica
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <HeartHandshake size={16} color="var(--accent-green)" /> Caução Estornada Imediatamente após Vistoria
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Sparkles size={16} color="var(--accent-amber)" /> Lacres de Segurança e Rastreabilidade
              </li>
            </ul>
          </div>

          {/* Suporte */}
          <div>
            <h4 style={{ color: '#fff', fontSize: '0.95rem', marginBottom: 16, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Atendimento Humanizado
            </h4>
            <p style={{ lineHeight: 1.6, marginBottom: 12 }}>
              Dúvidas sobre entregas, disponibilidade ou setup?
            </p>
            <a
              href="https://api.whatsapp.com/send?phone=5511999999999&text=Ol%C3%A1,%20gostaria%20de%20alugar%20um%20PS5!"
              target="_blank"
              rel="noreferrer"
              className="btn btn-outline btn-sm"
              style={{ width: '100%', borderColor: 'rgba(0, 209, 137, 0.4)', color: 'var(--accent-green)' }}
            >
              <Headphones size={16} /> Suporte via WhatsApp
            </a>
          </div>
        </div>

        {/* Bottom bar */}
        <div
          style={{
            borderTop: '1px solid var(--border-subtle)',
            paddingTop: 24,
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 16,
            fontSize: '0.8rem',
          }}
        >
          <span>© {new Date().getFullYear()} PlayLoc Gestão e Locação de PS5 Ltda. Todos os direitos reservados.</span>
          <div style={{ display: 'flex', gap: 16 }}>
            <span>Termos de Uso</span>
            <span>Política de Privacidade (LGPD)</span>
            <span>Regras de Devolução</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
