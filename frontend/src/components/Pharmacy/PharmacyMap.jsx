import React, { useState } from 'react';
import { MapPin, ShoppingBag, Truck, Clock } from 'lucide-react';
import { PHARMACIES } from '../../data/pharmacies';

export default function PharmacyMap({ onSelectPharmacyForOrder }) {
  const [selectedPharm, setSelectedPharm] = useState(PHARMACIES[0]);

  return (
    <div className="glass-card" style={{ padding: 'var(--space-6)', display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 'var(--space-4)' }}>
        <div className="section-header">
          <h2><div className="section-icon" style={{ background: 'rgba(16,185,129,0.1)', color: 'var(--success)' }}><MapPin style={{ width: 22, height: 22 }} /></div>
            Live Pharmacy Map</h2>
          <p>Real-time stock mapping with verified inventory timestamps & express delivery.</p>
        </div>
        <span className="live-pulse" style={{ background: 'rgba(16,185,129,0.1)', color: 'var(--success)' }}>
          <span className="live-pulse-dot" /> Live Feed
        </span>
      </div>

      {/* Map Canvas */}
      <div style={{
        position: 'relative', width: '100%', height: 320,
        borderRadius: 'var(--radius-lg)', background: 'var(--bg-body)',
        border: '1px solid var(--border-subtle)', overflow: 'hidden',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <div className="bg-dots-pattern" style={{ position: 'absolute', inset: 0, opacity: 0.25 }} />

        {/* Patient */}
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', zIndex: 10, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={{
            width: 40, height: 40, borderRadius: '50%',
            background: 'rgba(59,130,246,0.2)', border: '2px solid var(--info)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <div style={{ width: 14, height: 14, borderRadius: '50%', background: 'var(--info)' }} />
          </div>
          <span style={{ marginTop: 4, fontSize: '0.5625rem', fontWeight: 700, background: 'var(--bg-surface)', padding: '2px 8px', borderRadius: 'var(--radius-full)', border: '1px solid var(--border-subtle)' }}>👤 You</span>
        </div>

        {/* Pharmacy markers */}
        {PHARMACIES.map((p, i) => {
          const positions = [
            { top: '22%', left: '25%' },
            { top: '30%', right: '22%' },
            { bottom: '22%', right: '30%' },
          ];
          const pos = positions[i] || positions[0];
          const isOpen = p.status === 'open';
          const isSelected = selectedPharm.id === p.id;
          
          return (
            <button key={p.id} onClick={() => setSelectedPharm(p)} style={{
              position: 'absolute', ...pos, zIndex: 20, border: 'none', cursor: 'pointer', background: 'none',
              transition: 'transform 200ms cubic-bezier(0.34,1.56,0.64,1)',
              transform: isSelected ? 'scale(1.08)' : 'scale(1)',
            }}>
              <div style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '6px 12px', borderRadius: 'var(--radius-full)',
                background: isOpen ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)',
                border: `2px solid ${isOpen ? 'var(--success)' : 'var(--danger)'}`,
                fontSize: '0.625rem', fontWeight: 700,
                color: isOpen ? 'var(--success)' : 'var(--danger)',
                boxShadow: isSelected ? (isOpen ? '0 0 20px var(--success-glow)' : '0 0 20px var(--danger-glow)') : 'none',
              }}>
                <span style={{ width: 7, height: 7, borderRadius: '50%', background: isOpen ? 'var(--success)' : 'var(--danger)' }} />
                {p.name.split('-')[0].trim()}
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.5625rem', opacity: 0.8 }}>({p.distanceKm}km)</span>
              </div>
            </button>
          );
        })}

        {/* Legend */}
        <div style={{
          position: 'absolute', bottom: 12, left: 12,
          padding: '8px 12px', borderRadius: 'var(--radius-sm)',
          background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)',
          fontSize: '0.5625rem', display: 'flex', flexDirection: 'column', gap: 4, color: 'var(--text-muted)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--success)' }} /> Open & In Stock
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--danger)' }} /> Closed / Out of Stock
          </div>
        </div>
      </div>

      {/* Selected Detail */}
      {selectedPharm && (
        <div style={{
          padding: 'var(--space-5)', borderRadius: 'var(--radius-md)',
          background: 'var(--bg-badge)', border: '1px solid var(--border-subtle)',
          display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 'var(--space-4)',
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 4 }}>
              <h4 style={{ fontSize: '0.875rem', fontWeight: 750 }}>{selectedPharm.name}</h4>
              <span className={`badge ${selectedPharm.status === 'open' ? 'badge-success' : 'badge-danger'}`} style={{ fontSize: '0.5625rem' }}>
                {selectedPharm.status === 'open' ? '🟢 Open' : '🔴 Closed'}
              </span>
            </div>
            <p style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>📍 {selectedPharm.address}</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-4)', fontSize: '0.6875rem', color: 'var(--text-muted)', marginTop: 6 }}>
              <span>Distance: <strong style={{ color: 'var(--text-primary)' }}>{selectedPharm.distanceKm} km</strong></span>
              <span>ETA: <strong style={{ color: 'var(--text-primary)' }}>{selectedPharm.deliveryEtaMins} min</strong></span>
              <span>Delivery: <strong style={{ color: 'var(--primary)' }}>{selectedPharm.currency}{selectedPharm.deliveryFee}</strong></span>
              <span>Stock: <strong style={{ color: 'var(--success)' }}>{selectedPharm.lastInventoryUpdate}</strong></span>
            </div>
          </div>
          <button onClick={() => onSelectPharmacyForOrder && onSelectPharmacyForOrder(selectedPharm)}
            disabled={selectedPharm.status !== 'open'}
            className="btn btn-primary" style={{ fontSize: '0.75rem', padding: '10px 20px', opacity: selectedPharm.status !== 'open' ? 0.4 : 1 }}>
            <ShoppingBag style={{ width: 14, height: 14 }} /> Order Medicines
          </button>
        </div>
      )}
    </div>
  );
}
