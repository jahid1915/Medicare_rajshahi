import React, { useState } from 'react';
import { Users, Clock, Sparkles, UserCheck, ShoppingBag, Activity } from 'lucide-react';
import { getStoredState, saveStoredState } from '../../data/mockUserStore';

export default function FamilyHealthTimeline({ onSelectFamilyMember }) {
  const state = getStoredState();
  const [activeMember, setActiveMember] = useState(state.activeFamilyMember || state.familyMembers[0]);
  const filteredTimeline = state.timeline.filter(t => !t.familyMemberId || t.familyMemberId === activeMember.id);

  const handleSwitch = (m) => {
    setActiveMember(m);
    const s = getStoredState(); s.activeFamilyMember = m; saveStoredState(s);
    if (onSelectFamilyMember) onSelectFamilyMember(m);
  };

  const typeIcons = { 'AI_CONSULTATION': Sparkles, 'DOCTOR_VISIT': UserCheck, 'LAB_REPORT': Activity, 'PHARMACY_ORDER': ShoppingBag };
  const typeColors = { 'AI_CONSULTATION': 'var(--primary)', 'DOCTOR_VISIT': 'var(--info)', 'LAB_REPORT': 'var(--success)', 'PHARMACY_ORDER': 'var(--accent)' };

  return (
    <div style={{ maxWidth: '880px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
      {/* Header */}
      <div className="glass-card" style={{ padding: 'var(--space-6) var(--space-8)' }}>
        <div className="section-header" style={{ marginBottom: 'var(--space-5)' }}>
          <h2><div className="section-icon" style={{ background: 'rgba(59,130,246,0.1)', color: 'var(--info)' }}><Users style={{ width: 22, height: 22 }} /></div>
            Family Health Timeline</h2>
          <p>Manage health records & chronological events for authorized family profiles.</p>
        </div>

        {/* Family Switcher */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 'var(--space-3)' }}>
          {state.familyMembers.map(m => (
            <button key={m.id} onClick={() => handleSwitch(m)} className="glass-card" style={{
              padding: 'var(--space-3) var(--space-4)', cursor: 'pointer', textAlign: 'left',
              borderColor: activeMember.id === m.id ? 'var(--primary)' : 'var(--border-subtle)',
              background: activeMember.id === m.id ? 'rgba(8,145,178,0.08)' : 'var(--bg-badge)',
              boxShadow: activeMember.id === m.id ? 'var(--shadow-primary)' : 'none',
              transition: 'all 200ms',
            }}>
              <div style={{ fontSize: '0.8125rem', fontWeight: 700, color: activeMember.id === m.id ? 'var(--primary)' : 'var(--text-primary)' }}>{m.name}</div>
              <div style={{ fontSize: '0.625rem', color: 'var(--text-muted)' }}>{m.relation} • {m.age}y ({m.bloodGroup})</div>
            </button>
          ))}
        </div>
      </div>

      {/* Timeline */}
      <div className="glass-card" style={{ padding: 'var(--space-6) var(--space-8)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-5)' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 750, display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
            <Clock style={{ width: 18, height: 18, color: 'var(--primary)' }} /> Timeline ({activeMember.name})
          </h3>
          <span style={{ fontSize: '0.625rem', color: 'var(--text-muted)' }}>Chronological</span>
        </div>

        {filteredTimeline.length === 0 ? (
          <div style={{ padding: 'var(--space-12)', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.8125rem' }}>
            No records for {activeMember.name} yet.
          </div>
        ) : (
          <div style={{ position: 'relative', paddingLeft: 'var(--space-8)', borderLeft: '2px solid var(--border-default)', marginLeft: 'var(--space-2)' }}>
            {filteredTimeline.map((item, i) => {
              const Icon = typeIcons[item.type] || Activity;
              const color = typeColors[item.type] || 'var(--text-muted)';
              return (
                <div key={item.id} style={{
                  position: 'relative', marginBottom: 'var(--space-6)',
                  animation: `fadeIn 0.3s var(--ease-out) ${i * 0.05}s both`,
                }}>
                  <div style={{
                    position: 'absolute', left: -37, top: 4,
                    width: 24, height: 24, borderRadius: '50%',
                    background: 'var(--bg-surface)', border: `2px solid ${color}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <Icon style={{ width: 12, height: 12, color }} />
                  </div>

                  <div className="glass-card" style={{ padding: 'var(--space-4)', cursor: 'default' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.6875rem', marginBottom: 4 }}>
                      <span style={{ fontWeight: 700, color, display: 'flex', alignItems: 'center', gap: 4 }}>
                        {item.title}
                      </span>
                      <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', fontSize: '0.625rem' }}>{item.date} • {item.time}</span>
                    </div>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>{item.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
