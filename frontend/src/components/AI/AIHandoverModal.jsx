import React from 'react';
import { ShieldAlert, ArrowRight, Clock, Activity, FileText, UserCheck } from 'lucide-react';

export default function AIHandoverModal({ handoverData, onClose, onSelectDoctor }) {
  if (!handoverData) return null;
  const { patientConcern, duration = '3-5 days', symptoms = [], safetyScreening = 'Red flag check completed', aiSummary, reasonForEscalation, specialty, detectedRedFlags = [] } = handoverData;

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: 660 }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: 'var(--space-4)', borderBottom: '1px solid var(--border-subtle)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
            <div className="section-icon" style={{ background: 'rgba(245,158,11,0.12)', color: 'var(--warning)', width: 44, height: 44 }}>
              <ShieldAlert style={{ width: 22, height: 22 }} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 800 }}>AI-to-Doctor Handover</h3>
              <p style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>Professional Assessment Recommended</p>
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '1.25rem', cursor: 'pointer', fontWeight: 700 }}>&times;</button>
        </div>

        <div style={{ margin: 'var(--space-5) 0', display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          {/* Escalation Banner */}
          <div style={{ padding: 'var(--space-4)', borderRadius: 'var(--radius-md)', background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)', display: 'flex', alignItems: 'flex-start', gap: 'var(--space-3)' }}>
            <Activity style={{ width: 18, height: 18, color: 'var(--warning)', flexShrink: 0, marginTop: 2 }} />
            <div>
              <span style={{ fontSize: '0.625rem', fontWeight: 700, color: 'var(--warning)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Escalation Rationale</span>
              <p style={{ fontSize: '0.8125rem', fontWeight: 600, marginTop: 4 }}>{reasonForEscalation || 'Symptom pattern warrants professional evaluation.'}</p>
            </div>
          </div>

          {/* Clinical Summary */}
          <div style={{ padding: 'var(--space-5)', borderRadius: 'var(--radius-md)', background: 'var(--bg-badge)', border: '1px solid var(--border-subtle)', display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '0.6875rem', fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'flex', alignItems: 'center', gap: 6 }}>
                <FileText style={{ width: 14, height: 14 }} /> Clinical Summary
              </span>
              <span className="badge badge-primary">{specialty?.name || 'General Medicine'}</span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-3)' }}>
              <div style={{ padding: 'var(--space-3)', borderRadius: 'var(--radius-xs)', background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', fontSize: '0.75rem' }}>
                <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.625rem', fontWeight: 600, marginBottom: 2 }}>Chief Concern:</span>
                <span style={{ fontWeight: 650 }}>{patientConcern}</span>
              </div>
              <div style={{ padding: 'var(--space-3)', borderRadius: 'var(--radius-xs)', background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', fontSize: '0.75rem' }}>
                <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.625rem', fontWeight: 600, marginBottom: 2 }}>Duration:</span>
                <span style={{ fontWeight: 650, display: 'flex', alignItems: 'center', gap: 4 }}><Clock style={{ width: 13, height: 13, color: 'var(--primary)' }} />{duration}</span>
              </div>
            </div>

            {symptoms.length > 0 && (
              <div>
                <span style={{ fontSize: '0.625rem', color: 'var(--text-muted)', fontWeight: 600 }}>Identified Symptoms:</span>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-1)', marginTop: 4 }}>
                  {symptoms.map((s, i) => <span key={i} className="badge badge-primary" style={{ fontSize: '0.625rem' }}>• {s}</span>)}
                </div>
              </div>
            )}

            {detectedRedFlags.length > 0 && (
              <div style={{ padding: 'var(--space-3)', borderRadius: 'var(--radius-xs)', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', fontSize: '0.75rem' }}>
                <span style={{ color: 'var(--danger)', fontWeight: 700, fontSize: '0.6875rem' }}>🚨 Warning Signs: </span>
                <span style={{ color: 'var(--danger)', fontWeight: 500 }}>{detectedRedFlags.join(', ')}</span>
              </div>
            )}

            <div>
              <span style={{ fontSize: '0.625rem', color: 'var(--text-muted)', fontWeight: 600 }}>AI Summary:</span>
              <p style={{ fontSize: '0.75rem', fontStyle: 'italic', marginTop: 4, padding: 'var(--space-3)', borderRadius: 'var(--radius-xs)', background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', lineHeight: 1.5 }}>
                "{aiSummary || 'Patient engaged in AI screening. Specialist review recommended.'}"
              </p>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div style={{ paddingTop: 'var(--space-4)', borderTop: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <button onClick={onClose} className="btn btn-secondary" style={{ fontSize: '0.75rem' }}>Back to Chat</button>
          <button onClick={() => { onClose(); if (onSelectDoctor) onSelectDoctor(specialty?.id); }}
            className="btn btn-primary" style={{ fontSize: '0.75rem' }}>
            <UserCheck style={{ width: 14, height: 14 }} /> Find {specialty?.name || 'Specialist'} Doctors <ArrowRight style={{ width: 14, height: 14 }} />
          </button>
        </div>
      </div>
    </div>
  );
}
