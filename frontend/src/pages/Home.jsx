import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  Gamepad2,
  Disc,
  Cpu,
  Sparkles,
  Zap,
  ShieldCheck,
  Truck,
  RotateCcw,
  CheckCircle2,
  ArrowRight,
  Clock,
  Layers,
  ChevronDown,
} from 'lucide-react';
import PS5Symbols from '../components/PS5Symbols';

export default function Home({ onSelectConsole, onOpenAccessories }) {
  const { user } = useAuth();
  const [period, setPeriod] = useState('weekend');
  const [consoles, setConsoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState('all'); // all, disk, digital

  useEffect(() => {
    async function loadConsoles() {
      setLoading(true);
      try {
        const data = await api.consoles.list();
        setConsoles(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadConsoles();
  }, []);

  const filteredConsoles = consoles.filter((c) => {
    if (filterType === 'all') return true;
    return c.model_type === filterType;
  });

  return (
    <div>
      {/* HERO SECTION */}
      <section
        style={{
          position: 'relative',
          padding: '80px 0 60px',
          overflow: 'hidden',
          borderBottom: '1px solid var(--border-subtle)',
        }}
      >
        <PS5Symbols />

        <div className="container" style={{ position: 'relative', zIndex: 2 }}>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
              gap: 48,
              alignItems: 'center',
            }}
          >
            {/* Left Content */}
            <div>
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '6px 16px',
                  borderRadius: 'var(--radius-full)',
                  background: 'rgba(1, 213, 250, 0.08)',
                  border: '1px solid rgba(1, 213, 250, 0.25)',
                  color: 'var(--accent-cyan)',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  marginBottom: 20,
                }}
              >
                <Sparkles size={16} />
                <span>PlayStation 5 Slim com 1TB SSD & Ray Tracing</span>
              </div>

              <h1 style={{ fontSize: 'clamp(2.4rem, 5vw, 3.8rem)', marginBottom: 20 }}>
                Jogue no <span className="gradient-text-ps">PlayStation 5</span> sem gastar uma fortuna.
              </h1>

              <p
                style={{
                  fontSize: '1.1rem',
                  color: 'var(--text-secondary)',
                  lineHeight: 1.6,
                  marginBottom: 32,
                  maxWidth: 520,
                }}
              >
                Aluguel descomplicado de consoles PS5 de última geração por diárias, fins de semana ou pacotes mensais.
                Receba em casa 100% higienizado, com jogos e acessórios originais.
              </p>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 14, marginBottom: 36 }}>
                <a href="#catalog" className="btn btn-primary btn-lg">
                  <Zap size={18} />
                  Alugar Console Agora
                </a>
                <button
                  type="button"
                  className="btn btn-outline btn-lg"
                  onClick={onOpenAccessories}
                >
                  <Gamepad2 size={18} />
                  Ver Jogos & Periféricos
                </button>
              </div>

              {/* Trust Badges */}
              <div
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: 20,
                  fontSize: '0.85rem',
                  color: 'var(--text-secondary)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <CheckCircle2 size={16} color="var(--accent-green)" />
                  <span>Entrega Expressa</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <CheckCircle2 size={16} color="var(--accent-green)" />
                  <span>Suporte via WhatsApp</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <CheckCircle2 size={16} color="var(--accent-green)" />
                  <span>Sem Consulta SPC/Serasa</span>
                </div>
              </div>
            </div>

            {/* Right Visual */}
            <div style={{ display: 'flex', justifyContent: 'center', position: 'relative' }}>
              <div
                style={{
                  width: '100%',
                  maxWidth: 440,
                  background: 'radial-gradient(circle, rgba(0,112,209,0.2) 0%, rgba(15,20,36,0.8) 70%)',
                  borderRadius: 28,
                  padding: 24,
                  border: '1px solid var(--border-strong)',
                  boxShadow: '0 20px 50px rgba(0, 0, 0, 0.6)',
                  position: 'relative',
                }}
              >
                {/* Floating pill 1 */}
                <div
                  style={{
                    position: 'absolute',
                    top: -15,
                    left: 20,
                    background: '#151b2b',
                    border: '1px solid rgba(1, 213, 250, 0.4)',
                    padding: '8px 16px',
                    borderRadius: 'var(--radius-full)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    fontSize: '0.82rem',
                    boxShadow: '0 8px 20px rgba(0,0,0,0.5)',
                  }}
                >
                  <span style={{ color: 'var(--accent-cyan)', fontWeight: 800 }}>600+</span>
                  <span style={{ color: 'var(--text-secondary)' }}>Horas de pura jogatina</span>
                </div>

                {/* Floating pill 2 */}
                <div
                  style={{
                    position: 'absolute',
                    bottom: -15,
                    right: 20,
                    background: '#151b2b',
                    border: '1px solid rgba(0, 209, 137, 0.4)',
                    padding: '8px 16px',
                    borderRadius: 'var(--radius-full)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    fontSize: '0.82rem',
                    boxShadow: '0 8px 20px rgba(0,0,0,0.5)',
                  }}
                >
                  <span style={{ color: 'var(--accent-green)', fontWeight: 800 }}>✓ Lacrado</span>
                  <span style={{ color: 'var(--text-secondary)' }}>Testado & Higienizado</span>
                </div>

                <img
                  src="https://images.unsplash.com/photo-1606813907291-d86efa9b94db?auto=format&fit=crop&w=800&q=80"
                  alt="PlayStation 5 Console"
                  style={{
                    width: '100%',
                    height: 320,
                    objectFit: 'cover',
                    borderRadius: 20,
                    display: 'block',
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* STATS COUNTER BAR */}
      <section className="stats-bar">
        <div className="container">
          <div className="stats-grid">
            <div className="stat-item">
              <span className="stat-number">6</span>
              <span className="stat-label">Consoles em Frota Ativa</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">85%</span>
              <span className="stat-label">Economia vs. Comprar Console</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">15 min</span>
              <span className="stat-label">Aprovação Instantânea via Pix</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">5.0 ★</span>
              <span className="stat-label">Avaliação Média dos Clientes</span>
            </div>
          </div>
        </div>
      </section>

      {/* PERIOD SELECTOR PILLS (Inspiration from user's template) */}
      <section id="catalog" className="container" style={{ paddingTop: 40, paddingBottom: 60 }}>
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              color: 'var(--accent-cyan)',
              fontSize: '0.85rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: 1,
              marginBottom: 8,
            }}
          >
            <Clock size={16} />
            <span>Simule e Escolha seu Período</span>
          </div>
          <h2 style={{ fontSize: '2.2rem', marginBottom: 12 }}>
            Consoles Disponíveis para <span className="gradient-text">Locação Imediata</span>
          </h2>
          <p style={{ color: 'var(--text-secondary)', maxWidth: 600, margin: '0 auto' }}>
            Unidades físicas reais com número de série cadastrado e conferência rigorosa antes de cada entrega.
          </p>

          <div className="ppc-period-wrap">
            <div className="ppc-pills">
              {[
                { id: 'daily', label: 'Diária', badge: 'Diária Única' },
                { id: 'weekend', label: 'Fim de Semana (Sex a Seg)', badge: 'Mais Popular' },
                { id: 'weekly', label: 'Semanal (7 dias)', badge: '20% OFF' },
                { id: 'monthly', label: 'Mensal (30 dias)', badge: '35% OFF' },
              ].map((p) => (
                <button
                  key={p.id}
                  type="button"
                  className={`ppc-pill ${period === p.id ? 'ac-active' : ''}`}
                  onClick={() => setPeriod(p.id)}
                >
                  <span>{p.label}</span>
                  <span className="ppc-pill-badge">{p.badge}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Model Type Filters */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: 10, marginBottom: 32 }}>
            <button
              className={`btn btn-sm ${filterType === 'all' ? 'btn-primary' : 'btn-outline'}`}
              onClick={() => setFilterType('all')}
            >
              Todos os Modelos
            </button>
            <button
              className={`btn btn-sm ${filterType === 'disk' ? 'btn-primary' : 'btn-outline'}`}
              onClick={() => setFilterType('disk')}
            >
              <Disc size={15} /> Edição com Leitor de Disco
            </button>
            <button
              className={`btn btn-sm ${filterType === 'digital' ? 'btn-primary' : 'btn-outline'}`}
              onClick={() => setFilterType('digital')}
            >
              <Cpu size={15} /> Edição 100% Digital
            </button>
          </div>
        </div>

        {/* Consoles Cards Grid */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)' }}>
            Carregando frota de consoles PS5...
          </div>
        ) : (
          <div className="cards-grid">
            {filteredConsoles.map((c) => {
              const isAvailable = c.status === 'available';
              return (
                <div key={c.id} className="card-item">
                  <div className="card-media">
                    <img src={c.image_url} alt={c.name} />
                    <div style={{ position: 'absolute', top: 14, right: 14 }}>
                      <span className={`badge badge-${c.status}`}>
                        {c.status === 'available'
                          ? 'Disponível'
                          : c.status === 'reserved'
                          ? 'Reservado'
                          : c.status === 'rented'
                          ? 'Alugado'
                          : 'Manutenção'}
                      </span>
                    </div>

                    <div
                      style={{
                        position: 'absolute',
                        bottom: 12,
                        left: 12,
                        background: 'rgba(10, 14, 23, 0.85)',
                        backdropFilter: 'blur(8px)',
                        padding: '4px 10px',
                        borderRadius: 6,
                        fontSize: '0.72rem',
                        color: 'var(--text-secondary)',
                        fontFamily: 'monospace',
                      }}
                    >
                      Serial: {c.serial_number}
                    </div>
                  </div>

                  <div className="card-body">
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                      {c.model_type === 'disk' ? (
                        <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.75rem', color: 'var(--accent-cyan)' }}>
                          <Disc size={14} /> Leitor Blu-ray 4K Ultra HD
                        </span>
                      ) : (
                        <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.75rem', color: 'var(--accent-green)' }}>
                          <Cpu size={14} /> Edição Digital Ultrafina
                        </span>
                      )}
                    </div>

                    <h3 style={{ fontSize: '1.15rem', color: '#fff', marginBottom: 8 }}>{c.name}</h3>
                    <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: 18, flex: 1, lineHeight: 1.5 }}>
                      {c.condition_notes}
                    </p>

                    {/* Specs badges */}
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 20 }}>
                      <span style={{ fontSize: '0.72rem', background: 'rgba(255,255,255,0.05)', padding: '3px 8px', borderRadius: 4 }}>
                        1TB SSD Ultra-Fast
                      </span>
                      <span style={{ fontSize: '0.72rem', background: 'rgba(255,255,255,0.05)', padding: '3px 8px', borderRadius: 4 }}>
                        DualSense Incluso
                      </span>
                      <span style={{ fontSize: '0.72rem', background: 'rgba(255,255,255,0.05)', padding: '3px 8px', borderRadius: 4 }}>
                        Cabo HDMI 2.1
                      </span>
                    </div>

                    {/* Price and CTA */}
                    <div
                      style={{
                        borderTop: '1px solid var(--border-subtle)',
                        paddingTop: 16,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                      }}
                    >
                      <div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>A partir de</div>
                        <div style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--accent-green)' }}>
                          R$ {c.daily_rate.toFixed(2)}
                          <span style={{ fontSize: '0.8rem', fontWeight: 400, color: 'var(--text-secondary)' }}>/dia</span>
                        </div>
                      </div>

                      <button
                        className={`btn ${isAvailable ? 'btn-primary' : 'btn-outline'} btn-sm`}
                        disabled={!isAvailable}
                        onClick={() => onSelectConsole(c, period)}
                      >
                        {isAvailable ? 'Alugar Este' : 'Indisponível'}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* HOW IT WORKS SECTION */}
      <section
        id="how-it-works"
        style={{
          background: 'rgba(15, 20, 36, 0.5)',
          borderTop: '1px solid var(--border-subtle)',
          borderBottom: '1px solid var(--border-subtle)',
          padding: '80px 0',
        }}
      >
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: 50 }}>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                color: 'var(--accent-cyan)',
                fontSize: '0.85rem',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: 1,
                marginBottom: 8,
              }}
            >
              <Layers size={16} />
              <span>Processo 100% Digital</span>
            </div>
            <h2 style={{ fontSize: '2.2rem' }}>
              Simples como apertar <span className="gradient-text">Start</span>
            </h2>
            <p style={{ color: 'var(--text-secondary)', marginTop: 8 }}>
              Em apenas 3 passos você já está com o PlayStation 5 pronto na sua TV.
            </p>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: 28,
            }}
          >
            {[
              {
                step: '1',
                title: 'Escolha o Período e o Console',
                desc: 'Selecione as datas desejadas, edição com disco ou digital, e adicione jogos ou controles extras conforme seu plano.',
                icon: <Clock size={28} color="var(--accent-cyan)" />,
              },
              {
                step: '2',
                title: 'Checkout Seguro com PIX Dinâmico',
                desc: 'Pague com PIX com confirmação em segundos e retenção de 15 minutos para evitar conflito de datas e overbooking.',
                icon: <ShieldCheck size={28} color="var(--accent-green)" />,
              },
              {
                step: '3',
                title: 'Receba em Casa e Jogue',
                desc: 'Entregamos no seu endereço devidamente higienizado, com cabos e vistoria digital de check-in. Ao final, retiramos no mesmo local!',
                icon: <Truck size={28} color="var(--accent-amber)" />,
              },
            ].map((st) => (
              <div
                key={st.step}
                style={{
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border-strong)',
                  borderRadius: 'var(--radius-lg)',
                  padding: 32,
                  position: 'relative',
                }}
              >
                <div
                  style={{
                    position: 'absolute',
                    top: 20,
                    right: 20,
                    fontSize: '2.5rem',
                    fontWeight: 900,
                    color: 'rgba(255, 255, 255, 0.05)',
                    fontFamily: 'var(--font-display)',
                  }}
                >
                  {st.step}
                </div>

                <div style={{ marginBottom: 20 }}>{st.icon}</div>
                <h3 style={{ fontSize: '1.2rem', color: '#fff', marginBottom: 12 }}>{st.title}</h3>
                <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>{st.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ SECTION */}
      <section id="faq" className="container" style={{ padding: '80px 0' }}>
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <h2 style={{ fontSize: '2rem', marginBottom: 10 }}>Dúvidas Frequentes</h2>
          <p style={{ color: 'var(--text-secondary)' }}>Tudo o que você precisa saber antes de alugar seu PS5.</p>
        </div>

        <div style={{ maxWidth: 760, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 16 }}>
          {[
            {
              q: 'Como funciona a caução de segurança?',
              a: 'A caução é um valor de garantia temporário (R$ 150) retido durante o período de locação. Ela é devolvida integralmente via PIX em até 24 horas após a devolução e conferência na vistoria de check-out.',
            },
            {
              q: 'Posso jogar online com minha própria conta da PSN?',
              a: 'Sim! Você pode logar com sua conta pessoal da PlayStation Network, baixar seus jogos digitais salvos na nuvem e jogar online normalmente.',
            },
            {
              q: 'O que acompanha cada console alugado?',
              a: 'Acompanha o console PlayStation 5 (Slim ou Standard com 1TB), 1 controle original DualSense sem fio, cabo HDMI de alta velocidade, cabo de alimentação AC e cabo USB-C para carregamento.',
            },
            {
              q: 'Como funciona a vistoria de entrada e saída?',
              a: 'No momento da entrega é feito um checklist digital rápido de integridade dos cabos, analógicos do controle e carcaça. O mesmo é conferido na devolução garantindo transparência para ambas as partes.',
            },
          ].map((item, idx) => (
            <div
              key={idx}
              style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border-strong)',
                borderRadius: 'var(--radius-md)',
                padding: '20px 24px',
              }}
            >
              <h4 style={{ color: '#fff', fontSize: '1.05rem', marginBottom: 8 }}>{item.q}</h4>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', lineHeight: 1.6 }}>{item.a}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
