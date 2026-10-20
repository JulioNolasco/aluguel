import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Gamepad2, Headphones, Disc, BatteryCharging, Sparkles, Plus, Check } from 'lucide-react';

export default function Catalog({ onRentConsole }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('all');

  useEffect(() => {
    async function loadAccessories() {
      setLoading(true);
      try {
        const data = await api.accessories.list(category === 'all' ? null : category);
        setItems(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadAccessories();
  }, [category]);

  const categories = [
    { id: 'all', label: 'Todos os Itens' },
    { id: 'controller', label: 'Controles DualSense', icon: <Gamepad2 size={15} /> },
    { id: 'game', label: 'Jogos PS5', icon: <Disc size={15} /> },
    { id: 'headset', label: 'Headsets Pulse 3D', icon: <Headphones size={15} /> },
    { id: 'charging_station', label: 'Bases de Carga', icon: <BatteryCharging size={15} /> },
  ];

  return (
    <div className="container" style={{ padding: '40px 0 80px' }}>
      <div style={{ textAlign: 'center', marginBottom: 40 }}>
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
          <Sparkles size={16} />
          <span>Equipamentos Originais PlayStation</span>
        </div>
        <h1 style={{ fontSize: '2.4rem', marginBottom: 12 }}>
          Catálogo de Jogos & <span className="gradient-text">Periféricos Extras</span>
        </h1>
        <p style={{ color: 'var(--text-secondary)', maxWidth: 640, margin: '0 auto' }}>
          Personalize sua experiência de locação com controles adicionais para multiplayer local,
          headsets de áudio 3D e os maiores lançamentos da atualidade.
        </p>

        {/* Filter pills */}
        <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: 10, marginTop: 24 }}>
          {categories.map((c) => (
            <button
              key={c.id}
              className={`btn btn-sm ${category === c.id ? 'btn-primary' : 'btn-outline'}`}
              onClick={() => setCategory(c.id)}
            >
              {c.icon} {c.label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)' }}>
          Carregando catálogo de periféricos...
        </div>
      ) : (
        <div className="cards-grid">
          {items.map((it) => (
            <div key={it.id} className="card-item">
              <div className="card-media" style={{ height: 180 }}>
                <img src={it.image_url} alt={it.name} />
                <div style={{ position: 'absolute', top: 12, right: 12 }}>
                  <span
                    style={{
                      background: 'rgba(10, 14, 23, 0.85)',
                      backdropFilter: 'blur(8px)',
                      padding: '4px 10px',
                      borderRadius: 'var(--radius-full)',
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      color: it.stock_quantity > 0 ? 'var(--accent-green)' : 'var(--accent-rose)',
                    }}
                  >
                    {it.stock_quantity > 0 ? `${it.stock_quantity} un em estoque` : 'Esgotado'}
                  </span>
                </div>
              </div>

              <div className="card-body">
                <span
                  style={{
                    fontSize: '0.72rem',
                    textTransform: 'uppercase',
                    color: 'var(--accent-cyan)',
                    fontWeight: 700,
                    letterSpacing: 0.5,
                    marginBottom: 4,
                  }}
                >
                  {it.category}
                </span>
                <h3 style={{ fontSize: '1.1rem', color: '#fff', marginBottom: 8 }}>{it.name}</h3>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: 16, flex: 1, lineHeight: 1.5 }}>
                  {it.description}
                </p>

                <div
                  style={{
                    borderTop: '1px solid var(--border-subtle)',
                    paddingTop: 14,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Taxa Diária</span>
                    <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--accent-green)' }}>
                      R$ {it.daily_rate.toFixed(2)}
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 400 }}>/dia</span>
                    </div>
                  </div>

                  <button
                    className="btn btn-outline btn-sm"
                    onClick={() => onRentConsole(null, 'weekend')}
                  >
                    Alugar com PS5 →
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
