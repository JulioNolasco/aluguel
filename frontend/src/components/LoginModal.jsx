import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { User, Lock, Mail, Phone, MapPin, FileCheck, X, Sparkles } from 'lucide-react';

export default function LoginModal({ initialMode = 'login', onClose, onSuccess }) {
  const { login, register, showToast } = useAuth();
  const [mode, setMode] = useState(initialMode); // 'login' or 'register'
  const [loading, setLoading] = useState(false);

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [cpf, setCpf] = useState('');
  const [address, setAddress] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === 'login') {
        await login(email, password);
      } else {
        await register({
          email,
          password,
          name,
          phone,
          cpf_cnpj: cpf,
          address,
        });
      }
      onSuccess?.();
      onClose();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = (role) => {
    if (role === 'admin') {
      setEmail('admin@playloc.com');
      setPassword('admin123');
      setMode('login');
    } else {
      setEmail('cliente@playloc.com');
      setPassword('cliente123');
      setMode('login');
    }
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-dialog" style={{ maxWidth: 460 }}>
        <div className="modal-header">
          <h3 style={{ fontSize: '1.2rem', color: '#fff' }}>
            {mode === 'login' ? 'Acessar Conta' : 'Criar Nova Conta'}
          </h3>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {/* Mode Switcher */}
            <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
              <button
                type="button"
                className={`btn btn-sm ${mode === 'login' ? 'btn-primary' : 'btn-outline'}`}
                style={{ flex: 1 }}
                onClick={() => setMode('login')}
              >
                Já tenho conta (Entrar)
              </button>
              <button
                type="button"
                className={`btn btn-sm ${mode === 'register' ? 'btn-primary' : 'btn-outline'}`}
                style={{ flex: 1 }}
                onClick={() => setMode('register')}
              >
                Quero me cadastrar
              </button>
            </div>

            {/* Quick Demo Credentials */}
            <div
              style={{
                background: 'rgba(1, 213, 250, 0.05)',
                border: '1px solid rgba(1, 213, 250, 0.15)',
                padding: '10px 12px',
                borderRadius: 'var(--radius-sm)',
                marginBottom: 20,
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  fontSize: '0.78rem',
                  color: 'var(--accent-cyan)',
                  marginBottom: 6,
                  fontWeight: 600,
                }}
              >
                <Sparkles size={14} />
                <span>Acesso Rápido para Demonstração:</span>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button
                  type="button"
                  className="btn btn-outline btn-sm"
                  style={{ flex: 1, fontSize: '0.75rem', padding: '4px 8px' }}
                  onClick={() => fillDemo('admin')}
                >
                  Admin / Gestor
                </button>
                <button
                  type="button"
                  className="btn btn-outline btn-sm"
                  style={{ flex: 1, fontSize: '0.75rem', padding: '4px 8px' }}
                  onClick={() => fillDemo('client')}
                >
                  Cliente Teste
                </button>
              </div>
            </div>

            {mode === 'register' && (
              <>
                <div className="form-group">
                  <label className="form-label">Nome Completo</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Seu nome completo"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div className="form-group">
                    <label className="form-label">CPF</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="000.000.000-00"
                      value={cpf}
                      onChange={(e) => setCpf(e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">WhatsApp / Tel</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="(11) 99999-9999"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Endereço de Entrega</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Rua, número, complemento e CEP"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                  />
                </div>
              </>
            )}

            <div className="form-group">
              <label className="form-label">E-mail</label>
              <input
                type="email"
                className="form-input"
                placeholder="seuemail@exemplo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Senha</label>
              <input
                type="password"
                className="form-input"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-outline btn-sm" onClick={onClose}>
              Cancelar
            </button>
            <button type="submit" className="btn btn-primary btn-sm" disabled={loading}>
              {loading ? 'Processando...' : mode === 'login' ? 'Entrar na Plataforma' : 'Finalizar Cadastro'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
