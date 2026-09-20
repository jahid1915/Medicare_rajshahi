import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  ShieldCheck, Eye, Activity, Users, FileText, 
  Settings, UserCheck, AlertTriangle, Play, RefreshCw, CreditCard, ArrowRight
} from 'lucide-react';
import { getStoredState, saveStoredState, addAuditLog } from '../../data/mockUserStore';

export default function AdminDashboard() {
  const [storeState, setStoreState] = useState(getStoredState());
  const [latencySim, setLatencySim] = useState(false);
  const [debugTooltips, setDebugTooltips] = useState(true);
  const [escalationProtocol, setEscalationProtocol] = useState(true);

  const handleToggleSetting = (type, val, setVal) => {
    const newVal = !val;
    setVal(newVal);
    addAuditLog('ADMIN', 'SYSTEM_TOGGLED', `${type} → ${newVal}`);
    setStoreState(getStoredState());
  };

  const kpis = [
    { title: 'Total Registered Patients', value: '14,204', icon: Users, color: 'var(--primary)' },
    { title: 'Active Specialists', value: '48 Doctors', icon: UserCheck, color: 'var(--success)' },
    { title: 'Diagnostic Bookings', value: '1,048 Tests', icon: Activity, color: 'var(--info)' },
    { title: 'Critical Warnings Triggered', value: '24 Cases', icon: AlertTriangle, color: 'var(--danger)' }
  ];

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Header Panel */}
      <div className="dashboard-card" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <span className="badge badge-warning" style={{ marginBottom: 4 }}>🔑 System Administrator Portal</span>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)' }}>System Operations & Data Governance</h2>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Inspect clinical audit trails, configure system triggers, and verify security protocols.</p>
          </div>
          <button 
            onClick={() => {
              setStoreState(getStoredState());
              addAuditLog('ADMIN', 'MANUAL_REFRESH', 'Refreshed system tables');
            }} 
            className="btn btn-secondary"
            style={{ display: 'flex', alignItems: 'center', gap: 6 }}
          >
            <RefreshCw style={{ width: 14, height: 14 }} /> Refresh Systems
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
        {kpis.map((kpi, index) => {
          const Icon = kpi.icon;
          return (
            <div key={index} className="dashboard-card" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{
                width: '44px',
                height: '44px',
                borderRadius: '12px',
                background: 'var(--bg-badge)',
                color: kpi.color,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Icon style={{ width: '22px', height: '22px' }} />
              </div>
              <div>
                <span style={{ fontSize: '0.625rem', color: 'var(--text-muted)', display: 'block', fontWeight: 650 }}>{kpi.title}</span>
                <strong style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)' }}>{kpi.value}</strong>
              </div>
            </div>
          );
        })}
      </div>

      {/* Transactions & Status Transition Hub Banner */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(13,124,110,0.08) 0%, rgba(52,197,181,0.12) 100%)',
        border: '1.5px solid rgba(13,124,110,0.25)',
        borderRadius: 'var(--radius-xl)',
        padding: '20px 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 16
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ width: 44, height: 44, borderRadius: 12, background: 'var(--color-primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <CreditCard style={{ width: 22, height: 22 }} />
          </div>
          <div>
            <h3 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--color-text-primary)', margin: '0 0 4px' }}>
              Transaction History & Status Transitions
            </h3>
            <p style={{ fontSize: '12px', color: 'var(--color-text-muted)', margin: 0 }}>
              Audit financial settlements, inspect status transition history (initiated ➔ pending ➔ processing ➔ settled / refunded), and trigger admin overrides.
            </p>
          </div>
        </div>

        <Link
          to="/admin/payments"
          className="btn btn-primary"
          style={{ padding: '10px 18px', fontSize: '13px', display: 'inline-flex', alignItems: 'center', gap: 6 }}
        >
          Open Transaction Hub <ArrowRight style={{ width: 15, height: 15 }} />
        </Link>
      </div>

      {/* Two Column Layout: Settings Toggles + Audit Log */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.8fr', gap: '24px', alignItems: 'start' }}>
        
        {/* Left Side: System Configurations */}
        <div className="dashboard-card" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <h3 style={{ fontSize: '0.875rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Settings style={{ width: 16, height: 16, color: 'var(--primary)' }} /> Clinical Protocol Rules
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            
            {/* Setting 1 */}
            <div style={{ padding: '14px', borderRadius: '10px', background: 'var(--bg-badge)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
              <div>
                <strong style={{ fontSize: '0.75rem', display: 'block' }}>Auto-Escalation Protocol</strong>
                <span style={{ fontSize: '0.625rem', color: 'var(--text-muted)' }}>Redirect red flag symptoms to specialists</span>
              </div>
              <button 
                onClick={() => handleToggleSetting('ESCALATION_PROTOCOL', escalationProtocol, setEscalationProtocol)}
                className="btn btn-secondary"
                style={{
                  padding: '4px 10px',
                  fontSize: '0.6875rem',
                  fontWeight: 700,
                  background: escalationProtocol ? 'var(--primary)' : 'rgba(0,0,0,0.05)',
                  color: escalationProtocol ? 'white' : 'var(--text-muted)'
                }}
              >
                {escalationProtocol ? 'Enabled' : 'Disabled'}
              </button>
            </div>

            {/* Setting 2 */}
            <div style={{ padding: '14px', borderRadius: '10px', background: 'var(--bg-badge)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
              <div>
                <strong style={{ fontSize: '0.75rem', display: 'block' }}>Simulate Network Latency</strong>
                <span style={{ fontSize: '0.625rem', color: 'var(--text-muted)' }}>Demo response delays (350ms RTT)</span>
              </div>
              <button 
                onClick={() => handleToggleSetting('LATENCY_SIMULATION', latencySim, setLatencySim)}
                className="btn btn-secondary"
                style={{
                  padding: '4px 10px',
                  fontSize: '0.6875rem',
                  fontWeight: 700,
                  background: latencySim ? 'var(--primary)' : 'rgba(0,0,0,0.05)',
                  color: latencySim ? 'white' : 'var(--text-muted)'
                }}
              >
                {latencySim ? 'Active' : 'Bypass'}
              </button>
            </div>

            {/* Setting 3 */}
            <div style={{ padding: '14px', borderRadius: '10px', background: 'var(--bg-badge)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
              <div>
                <strong style={{ fontSize: '0.75rem', display: 'block' }}>Developer Tooltips</strong>
                <span style={{ fontSize: '0.625rem', color: 'var(--text-muted)' }}>Display data tags and API states</span>
              </div>
              <button 
                onClick={() => handleToggleSetting('DEBUG_TOOLTIPS', debugTooltips, setDebugTooltips)}
                className="btn btn-secondary"
                style={{
                  padding: '4px 10px',
                  fontSize: '0.6875rem',
                  fontWeight: 700,
                  background: debugTooltips ? 'var(--primary)' : 'rgba(0,0,0,0.05)',
                  color: debugTooltips ? 'white' : 'var(--text-muted)'
                }}
              >
                {debugTooltips ? 'Visible' : 'Hidden'}
              </button>
            </div>

          </div>

          <div style={{ padding: '12px 14px', borderRadius: '8px', background: 'rgba(16, 185, 129, 0.05)', border: '1.5px solid rgba(16, 185, 129, 0.1)', fontSize: '0.6875rem', color: 'var(--success)' }}>
            <span style={{ fontWeight: 700, display: 'block' }}>🛡️ Security Token Validator</span>
            <span style={{ color: 'var(--text-muted)', display: 'block', marginTop: '2px' }}>All data streams are currently encrypted under AES-256 standards.</span>
          </div>
        </div>

        {/* Right Side: Audit Trails */}
        <div className="dashboard-card" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontSize: '0.875rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Eye style={{ width: 16, height: 16, color: 'var(--primary)' }} /> Encryption Access Trails
            </h3>
            <span className="badge badge-primary">Immutable Trail</span>
          </div>

          <div style={{ borderRadius: '12px', border: '1.5px solid var(--border-default)', overflow: 'hidden' }}>
            <table className="data-table" style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6875rem' }}>
              <thead>
                <tr>
                  <th>Timestamp</th>
                  <th>Identity</th>
                  <th>Event Type</th>
                  <th>Detail logs</th>
                </tr>
              </thead>
              <tbody>
                {storeState.auditLogs.slice(0, 7).map((log, i) => (
                  <tr key={i}>
                    <td style={{ color: 'var(--text-muted)' }}>{log.timestamp}</td>
                    <td style={{ fontWeight: 700 }}>{log.actor}</td>
                    <td style={{ color: 'var(--primary)', fontWeight: 650 }}>{log.action}</td>
                    <td>{log.detail}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>

    </div>
  );
}
