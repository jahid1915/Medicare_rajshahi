import React from 'react';
import { ShieldAlert, AlertTriangle, ShieldCheck } from 'lucide-react';

export default function TriageSafetyBanner({ onTriggerEmergency }) {
  return (
    <div className="glass-card" style={{
      padding: 'var(--space-4) var(--space-6)',
      borderLeft: '3px solid var(--primary)',
      display: 'flex',
      flexWrap: 'wrap',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 'var(--space-4)',
    }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--space-3)' }}>
        <div className="section-icon" style={{
          background: 'rgba(8,145,178,0.1)',
          color: 'var(--primary)',
          width: 36, height: 36, borderRadius: 'var(--radius-sm)',
        }}>
          <ShieldCheck style={{ width: 18, height: 18 }} />
        </div>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 2 }}>
            <h4 style={{ fontSize: '0.8125rem', fontWeight: 700 }}>Safety & Scope Protocol</h4>
            <span className="badge badge-success" style={{ fontSize: '0.5625rem' }}>Validated Scope</span>
          </div>
          <p style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', lineHeight: 1.5, maxWidth: 540 }}>
            MediBridge AI provides entry-level guidance and specialist navigation only. Uncertain or high-risk cases automatically escalate to licensed human clinicians.
          </p>
        </div>
      </div>

      <button onClick={onTriggerEmergency} className="btn btn-danger" style={{ fontSize: '0.6875rem', padding: '7px 14px', flexShrink: 0 }}>
        <AlertTriangle style={{ width: 14, height: 14 }} /> Test Emergency Triage
      </button>
    </div>
  );
}
