import React, { useState } from 'react';
import { getEarlyWarningRiskAssessment } from '../../services/aiForecastingEngine';
import { AlertOctagon, ShieldAlert, Activity, Info, BarChart2, Layers, CheckCircle2, ChevronRight } from 'lucide-react';
import ExplainableAiModal from '../AI/ExplainableAiModal';

export default function EarlyWarningCenter() {
  const [risks] = useState(getEarlyWarningRiskAssessment());
  const [selectedRiskForXAI, setSelectedRiskForXAI] = useState(null);

  // Digital Health Operational Scores (Operational, NOT Diagnostic)
  const operationalScores = [
    { name: 'Hospital Capacity Index', score: 82, status: 'High Strain', color: '#f59e0b', desc: 'Bed & ICU occupancy monitoring' },
    { name: 'Emergency Pressure Score', score: 88, status: 'Critical', color: '#ef4444', desc: 'Triage queue & incoming ambulance volume' },
    { name: 'Resource & Equipment Strain', score: 65, status: 'Optimal', color: '#10b981', desc: 'Ventilators & imaging utilization' },
    { name: 'Pharmacy Stock Pressure', score: 74, status: 'Moderate', color: '#f59e0b', desc: 'Essential drug safety buffer' },
    { name: 'Lab Processing Queue Index', score: 70, status: 'Moderate', color: '#3b82f6', desc: 'Sample turnaround time efficiency' },
    { name: 'Blood Bank Inventory Buffer', score: 91, status: 'Optimal', color: '#10b981', desc: 'O-Negative & rare group supply' }
  ];

  return (
    <div style={{ padding: '24px', color: 'var(--text-main)' }}>
      {/* Top Header */}
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <span className="badge badge-primary">🚨 Unique Hospital Feature</span>
            <span className="badge badge-error">AI Early Warning Center</span>
          </div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 900 }}>Hospital Operational Early Warning System</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
            Predictive early warning radar continuous monitoring for bed shortages, ER congestion, pharmacy stockouts & lab bottlenecks.
          </p>
        </div>

        <div style={{ padding: '8px 16px', background: 'rgba(239, 68, 68, 0.15)', border: '1px solid #ef4444', borderRadius: '8px', color: '#ef4444', fontWeight: 800, fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <AlertOctagon style={{ width: 18, height: 18 }} /> 3 Active Operational Alerts Detected
        </div>
      </div>

      {/* OPERATIONAL DIGITAL HEALTH SCORES GRID (Non-Diagnostic) */}
      <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <BarChart2 style={{ width: 18, height: 18, color: 'var(--primary)' }} /> Operational Pressure Scores (Documented Methodology)
      </h3>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px', marginBottom: '32px' }}>
        {operationalScores.map((item, idx) => (
          <div key={idx} className="dashboard-card" style={{ borderLeft: `4px solid ${item.color}` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)' }}>{item.name}</div>
              <span style={{ fontSize: '0.7rem', fontWeight: 800, padding: '2px 6px', borderRadius: '4px', background: item.color, color: '#fff' }}>
                {item.status}
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
              <div style={{ fontSize: '1.8rem', fontWeight: 900, color: item.color }}>{item.score} / 100</div>
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>{item.desc}</div>

            {/* Progress meter */}
            <div style={{ height: '6px', background: 'var(--bg-canvas)', borderRadius: '3px', marginTop: '10px', overflow: 'hidden' }}>
              <div style={{ width: `${item.score}%`, height: '100%', background: item.color, borderRadius: '3px' }}></div>
            </div>
          </div>
        ))}
      </div>

      {/* ACTIVE PREDICTIVE EARLY WARNING RISKS WITH SHAP EXPLANATIONS */}
      <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <ShieldAlert style={{ width: 18, height: 18, color: '#ef4444' }} /> Active Predictive Operational Warnings & SHAP Explainability
      </h3>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {risks.map((risk) => (
          <div key={risk.id} className="dashboard-card" style={{ padding: '20px', borderLeft: risk.level === 'CRITICAL' ? '4px solid #ef4444' : '4px solid #f59e0b' }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px', marginBottom: '12px' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span className={`badge ${risk.level === 'CRITICAL' ? 'badge-error' : 'badge-warning'}`}>{risk.level} RISK</span>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 700 }}>Trigger Horizon: {risk.triggerTime}</span>
                </div>
                <h4 style={{ fontSize: '1.2rem', fontWeight: 800, marginTop: '4px' }}>{risk.category}</h4>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '2px' }}>{risk.summary}</p>
              </div>

              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Risk Index</div>
                <div style={{ fontSize: '1.6rem', fontWeight: 900, color: risk.level === 'CRITICAL' ? '#ef4444' : '#f59e0b' }}>
                  {risk.riskScore} %
                </div>
                <button
                  onClick={() => setSelectedRiskForXAI(risk)}
                  className="btn btn-secondary"
                  style={{ marginTop: '8px', fontSize: '0.75rem', padding: '6px 12px' }}
                >
                  <Activity style={{ width: 14, height: 14, color: 'var(--primary)' }} /> Inspect XAI / SHAP Features
                </button>
              </div>
            </div>

            {/* Inline SHAP Feature Contribution Summary */}
            <div style={{ background: 'var(--bg-canvas)', padding: '12px', borderRadius: '8px', marginTop: '12px' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 800, marginBottom: '8px', color: 'var(--text-muted)' }}>
                🔍 Key Driving Variables (SHAP Feature Importance Contribution):
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px' }}>
                {risk.shapContributions.map((shap, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', padding: '6px 8px', background: 'var(--bg-card)', borderRadius: '4px', border: '1px solid var(--border-color)' }}>
                    <span style={{ fontWeight: 600 }}>{shap.feature}</span>
                    <span style={{ fontWeight: 800, color: shap.direction === 'increase' ? '#ef4444' : '#10b981' }}>{shap.contribution}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* SHAP Explanation Modal trigger */}
      {selectedRiskForXAI && (
        <ExplainableAiModal
          riskItem={selectedRiskForXAI}
          onClose={() => setSelectedRiskForXAI(null)}
        />
      )}
    </div>
  );
}
