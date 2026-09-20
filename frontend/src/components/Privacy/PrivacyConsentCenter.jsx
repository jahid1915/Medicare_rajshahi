import React, { useState } from 'react';
import { Lock, Shield, Eye } from 'lucide-react';
import { getStoredState, saveStoredState, addAuditLog } from '../../data/mockUserStore';

const PERMISSIONS = [
  { key: 'aiAccess', label: '🤖 AI Health Assistant', desc: 'Allows AI to read past symptoms for navigation.' },
  { key: 'doctorAccess', label: '👨‍⚕️ Specialist Doctors', desc: 'Allows booked doctors to view AI Handover Summaries.' },
  { key: 'pharmacyAccess', label: '💊 Pharmacy Partners', desc: 'Allows pharmacies to verify digital prescriptions.' },
  { key: 'familyAccess', label: '👪 Family Members', desc: 'Allows family profiles to view shared timeline.' },
];

export default function PrivacyConsentCenter() {
  const state = getStoredState();
  const [permissions, setPermissions] = useState(state.privacyPermissions);
  const [auditLogs, setAuditLogs] = useState(state.auditLogs);

  const handleToggle = (key) => {
    const updated = { ...permissions, [key]: !permissions[key] };
    setPermissions(updated);
    const s = getStoredState(); s.privacyPermissions = updated; saveStoredState(s);
    const newLog = addAuditLog('PATIENT', 'UPDATED_PRIVACY', `'${key}' → ${updated[key]}`);
    setAuditLogs([newLog, ...auditLogs]);
  };

  return (
    <div style={{ maxWidth: '920px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
      {/* Header */}
      <div className="glass-card" style={{ padding: 'var(--space-6) var(--space-8)' }}>
        <div className="section-header">
          <h2><div className="section-icon" style={{ background: 'rgba(8,145,178,0.1)', color: 'var(--primary)' }}><Lock style={{ width: 22, height: 22 }} /></div>
            Privacy & Data Governance</h2>
          <p>Control who accesses your medical records and inspect transparent audit trails.</p>
        </div>
      </div>

      {/* Access Controls */}
      <div className="glass-card" style={{ padding: 'var(--space-6) var(--space-8)' }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 750, display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-5)' }}>
          <Shield style={{ width: 18, height: 18, color: 'var(--primary)' }} /> Access Control Matrix
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 'var(--space-4)' }}>
          {PERMISSIONS.map(p => (
            <div key={p.key} style={{
              padding: 'var(--space-4)', borderRadius: 'var(--radius-md)',
              background: 'var(--bg-badge)', border: '1px solid var(--border-subtle)',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 'var(--space-3)',
            }}>
              <div>
                <span style={{ fontWeight: 700, fontSize: '0.8125rem', display: 'block' }}>{p.label}</span>
                <span style={{ fontSize: '0.625rem', color: 'var(--text-muted)' }}>{p.desc}</span>
              </div>
              <button onClick={() => handleToggle(p.key)} style={{
                padding: '5px 14px', borderRadius: 'var(--radius-full)',
                fontWeight: 700, fontSize: '0.6875rem', border: 'none', cursor: 'pointer',
                transition: 'all 200ms',
                background: permissions[p.key] ? 'var(--success)' : 'var(--bg-badge)',
                color: permissions[p.key] ? 'white' : 'var(--text-muted)',
                outline: permissions[p.key] ? 'none' : '1px solid var(--border-default)',
              }}>
                {permissions[p.key] ? 'Granted' : 'Revoked'}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Audit Log */}
      <div className="glass-card" style={{ padding: 'var(--space-6) var(--space-8)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-4)' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 750, display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
            <Eye style={{ width: 18, height: 18, color: 'var(--primary)' }} /> Medical Audit Log
          </h3>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.625rem', color: 'var(--success)', fontWeight: 700 }}>🔒 Encrypted Trail</span>
        </div>
        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 'var(--space-4)' }}>
          Every access event is logged immutably with timestamp & actor identity.
        </p>
        <div style={{ borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)', overflow: 'hidden' }}>
          <table className="data-table" style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6875rem' }}>
            <thead>
              <tr>
                <th>Timestamp</th>
                <th>Actor</th>
                <th>Event</th>
                <th>Details</th>
              </tr>
            </thead>
            <tbody>
              {auditLogs.map(log => (
                <tr key={log.id}>
                  <td style={{ color: 'var(--text-muted)' }}>{log.timestamp}</td>
                  <td style={{ fontWeight: 700 }}>{log.actor}</td>
                  <td style={{ color: 'var(--primary)', fontWeight: 600 }}>{log.action}</td>
                  <td>{log.detail}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
