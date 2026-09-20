import React from 'react';
import { 
  Stethoscope, Sparkles, UserCheck, ShoppingBag, 
  FileText, Users, Lock, Moon, Sun, Activity, Store, Video
} from 'lucide-react';

const PATIENT_TABS = [
  { id: 'ai-assistant', label: 'AI Navigator', icon: Sparkles, accent: '--primary' },
  { id: 'doctor-discovery', label: 'Doctors', icon: UserCheck, accent: '--info' },
  { id: 'pharmacy', label: 'Pharmacy', icon: ShoppingBag, accent: '--success' },
  { id: 'report-explainer', label: 'Reports', icon: FileText, accent: '--accent' },
  { id: 'diagnostic', label: 'Diagnostics', icon: Activity, accent: '--warning' },
  { id: 'timeline', label: 'Timeline', icon: Users, accent: '--info' },
  { id: 'privacy', label: 'Privacy', icon: Lock, accent: '--text-muted' }
];

const ROLE_PORTALS = [
  { id: 'patient', label: 'Patient', emoji: '👤', defaultTab: 'ai-assistant' },
  { id: 'doctor', label: 'Doctor', emoji: '👨‍⚕️', defaultTab: 'telemedicine' },
  { id: 'pharmacy', label: 'Pharmacy', emoji: '💊', defaultTab: 'pharmacy-dashboard' },
  { id: 'diagnostic', label: 'Diagnostic', emoji: '🧪', defaultTab: 'diagnostic' }
];

export default function Navbar({ 
  activeTab, setActiveTab, activeRole, setActiveRole, 
  theme, toggleTheme, activeFamilyMember, onSelectFamilyMember, familyMembers = []
}) {
  return (
    <header style={{
      position: 'sticky',
      top: 0,
      zIndex: 50,
      backdropFilter: 'blur(24px) saturate(1.8)',
      WebkitBackdropFilter: 'blur(24px) saturate(1.8)',
      borderBottom: '1px solid var(--border-subtle)',
      background: 'var(--glass-bg)',
    }}>
      {/* ─── TOP UTILITY BAR ─── */}
      <div style={{
        padding: '6px 20px',
        background: 'rgba(0,0,0,0.3)',
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '12px',
        fontSize: '0.6875rem',
        color: 'var(--text-muted)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <span className="live-pulse" style={{ background: 'rgba(16,185,129,0.1)', color: 'var(--success)', fontSize: '0.625rem' }}>
            <span className="live-pulse-dot" /> Platform Online
          </span>
          <span style={{ color: 'var(--text-muted)', fontSize: '0.625rem' }}>
            🚨 Emergency: <strong style={{ color: 'var(--danger)' }}>999</strong>
          </span>
        </div>

        {/* Role Switcher Pills */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '3px',
          background: 'rgba(255,255,255,0.04)',
          padding: '2px',
          borderRadius: 'var(--radius-sm)',
          border: '1px solid var(--border-subtle)',
        }}>
          {ROLE_PORTALS.map(role => (
            <button
              key={role.id}
              onClick={() => { setActiveRole(role.id); setActiveTab(role.defaultTab); }}
              style={{
                padding: '4px 12px',
                borderRadius: 'var(--radius-xs)',
                fontSize: '0.625rem',
                fontWeight: 700,
                border: 'none',
                cursor: 'pointer',
                transition: 'all 200ms',
                background: activeRole === role.id ? 'var(--primary)' : 'transparent',
                color: activeRole === role.id ? 'white' : 'var(--text-muted)',
              }}
            >
              {role.emoji} {role.label}
            </button>
          ))}
        </div>
      </div>

      {/* ─── MAIN NAVBAR ─── */}
      <div style={{
        maxWidth: '1360px',
        margin: '0 auto',
        padding: '12px 24px',
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '16px',
      }}>
        {/* Brand */}
        <div 
          onClick={() => { setActiveRole('patient'); setActiveTab('ai-assistant'); }}
          style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}
        >
          <div style={{
            width: '42px',
            height: '42px',
            borderRadius: 'var(--radius-md)',
            background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-700) 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            boxShadow: 'var(--shadow-primary)',
          }}>
            <Stethoscope style={{ width: '22px', height: '22px' }} />
          </div>
          <div>
            <h1 style={{ 
              fontSize: '1.25rem', fontWeight: 800, lineHeight: 1.1,
              display: 'flex', alignItems: 'baseline', gap: '2px',
            }}>
              <span>Medi</span>
              <span style={{ color: 'var(--primary)' }}>Bridge</span>
              <span style={{ 
                fontSize: '0.625rem', fontWeight: 700, color: 'var(--accent)',
                background: 'rgba(139,92,246,0.12)', padding: '1px 6px',
                borderRadius: 'var(--radius-full)', marginLeft: '4px',
              }}>AI</span>
            </h1>
            <p style={{ fontSize: '0.5625rem', color: 'var(--text-muted)', fontWeight: 500, letterSpacing: '0.04em' }}>
              Virtual Healthcare Ecosystem
            </p>
          </div>
        </div>

        {/* Patient Nav Tabs */}
        {activeRole === 'patient' && (
          <nav style={{
            display: 'flex',
            alignItems: 'center',
            gap: '2px',
            padding: '3px',
            background: 'var(--bg-badge)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-subtle)',
          }}>
            {PATIENT_TABS.map(tab => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '8px 14px',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '0.75rem',
                    fontWeight: isActive ? 700 : 500,
                    border: 'none',
                    cursor: 'pointer',
                    transition: 'all 200ms cubic-bezier(0.34, 1.56, 0.64, 1)',
                    background: isActive ? 'var(--primary)' : 'transparent',
                    color: isActive ? 'white' : 'var(--text-muted)',
                    boxShadow: isActive ? 'var(--shadow-primary)' : 'none',
                    transform: isActive ? 'scale(1.02)' : 'scale(1)',
                  }}
                >
                  <Icon style={{ width: '14px', height: '14px' }} />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        )}

        {/* Right Side Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
          {/* Family Picker */}
          {familyMembers.length > 0 && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '5px 12px',
              background: 'var(--bg-badge)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.6875rem',
            }}>
              <Users style={{ width: '12px', height: '12px', color: 'var(--text-muted)' }} />
              <select
                value={activeFamilyMember?.id}
                onChange={(e) => {
                  const m = familyMembers.find(f => f.id === e.target.value);
                  if (m && onSelectFamilyMember) onSelectFamilyMember(m);
                }}
                style={{
                  background: 'transparent',
                  color: 'var(--text-primary)',
                  border: 'none',
                  fontWeight: 650,
                  fontSize: '0.6875rem',
                  fontFamily: 'var(--font-sans)',
                  cursor: 'pointer',
                  outline: 'none',
                }}
              >
                {familyMembers.map(m => (
                  <option key={m.id} value={m.id} style={{ background: 'var(--bg-surface)', color: 'var(--text-primary)' }}>
                    {m.name} ({m.relation})
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            style={{
              width: '36px',
              height: '36px',
              borderRadius: 'var(--radius-sm)',
              background: 'var(--bg-badge)',
              border: '1px solid var(--border-subtle)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'all 200ms',
              color: 'var(--text-secondary)',
            }}
            title="Toggle Theme"
          >
            {theme === 'dark' ? <Sun style={{ width: '16px', height: '16px', color: '#f59e0b' }} /> : <Moon style={{ width: '16px', height: '16px' }} />}
          </button>
        </div>
      </div>
    </header>
  );
}
