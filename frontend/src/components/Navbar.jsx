import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Gamepad2, User, ShieldCheck, LogOut, LayoutDashboard, Sparkles } from 'lucide-react';

export default function Navbar({ currentView, setCurrentView, onOpenLogin }) {
  const { user, isAdmin, logout } = useAuth();

  return (
    <header className="header-nav">
      <div className="container">
        <div className="nav-inner">
          <a
            href="#home"
            className="logo-brand"
            onClick={(e) => {
              e.preventDefault();
              setCurrentView('home');
            }}
          >
            <div
              style={{
                width: 38,
                height: 38,
                borderRadius: 10,
                background: 'linear-gradient(135deg, #0070d1, #01d5fa)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 0 15px rgba(1, 213, 250, 0.4)',
              }}
            >
              <Gamepad2 size={22} color="#ffffff" />
            </div>
            <span>
              Play<span style={{ color: 'var(--accent-cyan)' }}>Loc</span>
            </span>
            <span className="logo-badge">PS5</span>
          </a>

          <nav className="nav-links">
            <button
              className={`nav-link ${currentView === 'home' ? 'active' : ''}`}
              onClick={() => setCurrentView('home')}
            >
              Catálogo de Consoles
            </button>
            <button
              className={`nav-link ${currentView === 'accessories' ? 'active' : ''}`}
              onClick={() => setCurrentView('accessories')}
            >
              Jogos & Acessórios
            </button>
            <a href="#how-it-works" className="nav-link">
              Como Funciona
            </a>
            {user && (
              <button
                className={`nav-link ${currentView === 'customer' ? 'active' : ''}`}
                onClick={() => setCurrentView('customer')}
              >
                <User size={16} />
                Minha Conta
              </button>
            )}
            {isAdmin && (
              <button
                className={`nav-link ${currentView === 'admin' ? 'active' : ''}`}
                onClick={() => setCurrentView('admin')}
                style={{ color: 'var(--accent-amber)' }}
              >
                <LayoutDashboard size={16} />
                Painel Gerencial
              </button>
            )}
          </nav>

          <div className="nav-actions">
            {user ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    background: 'rgba(255, 255, 255, 0.05)',
                    padding: '6px 14px',
                    borderRadius: 'var(--radius-full)',
                    border: '1px solid var(--border-strong)',
                    fontSize: '0.85rem',
                  }}
                >
                  <span style={{ fontWeight: 600 }}>{user.name.split(' ')[0]}</span>
                  {user.documents_verified ? (
                    <span title="Cadastro Verificado" style={{ color: 'var(--accent-green)', display: 'flex' }}>
                      <ShieldCheck size={16} />
                    </span>
                  ) : (
                    <span
                      style={{
                        fontSize: '0.72rem',
                        color: 'var(--accent-amber)',
                        background: 'rgba(245, 158, 11, 0.15)',
                        padding: '2px 6px',
                        borderRadius: 4,
                      }}
                    >
                      Pendente
                    </span>
                  )}
                </div>

                <button
                  className="btn btn-outline btn-sm"
                  onClick={logout}
                  title="Sair da conta"
                  style={{ padding: '7px 10px' }}
                >
                  <LogOut size={16} />
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', gap: 10 }}>
                <button className="btn btn-outline btn-sm" onClick={() => onOpenLogin('login')}>
                  Entrar
                </button>
                <button className="btn btn-primary btn-sm" onClick={() => onOpenLogin('register')}>
                  Criar Conta
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
