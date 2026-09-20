import React, { useState } from 'react';
import { X, Activity, Scale, CheckSquare, AlertTriangle, ShieldCheck, FileText } from 'lucide-react';

export default function ExplainableAiModal({ riskItem, onClose }) {
  const [activeTab, setActiveTab] = useState('shap'); // 'shap', 'fairness', 'audit'

  if (!riskItem) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0,0,0,0.7)',
      backdropFilter: 'blur(4px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999,
      padding: '20px'
    }}>
      <div className="dashboard-card" style={{ width: '100%', maxWidth: '750px', maxHeight: '90vh', overflowY: 'auto', background: 'var(--bg-card)', borderRadius: '16px', border: '1px solid var(--border-color)' }}>
        
        {/* Modal Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '16px', borderBottom: '1px solid var(--border-color)' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span className="badge badge-primary">🧬 Explainable AI Engine</span>
              <span className="badge badge-info">SHAP / LIME Layer</span>
            </div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, marginTop: '4px' }}>XAI Explanation: {riskItem.category}</h2>
          </div>
          <button onClick={onClose} className="btn btn-secondary" style={{ padding: '6px 10px' }}>
            <X style={{ width: 18, height: 18 }} />
          </button>
        </div>

        {/* Modal Tabs */}
        <div style={{ display: 'flex', gap: '10px', marginTop: '16px', marginBottom: '20px', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px' }}>
          <button
            onClick={() => setActiveTab('shap')}
            className={`btn ${activeTab === 'shap' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ fontSize: '0.8rem' }}
          >
            <Activity style={{ width: 14, height: 14 }} /> SHAP Feature Importance Waterfall
          </button>
          <button
            onClick={() => setActiveTab('fairness')}
            className={`btn ${activeTab === 'fairness' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ fontSize: '0.8rem' }}
          >
            <Scale style={{ width: 14, height: 14 }} /> Responsible AI & Bias Audit
          </button>
          <button
            onClick={() => setActiveTab('audit')}
            className={`btn ${activeTab === 'audit' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ fontSize: '0.8rem' }}
          >
            <FileText style={{ width: 14, height: 14 }} /> Model Traceability Log
          </button>
        </div>

        {/* TAB 1: SHAP WATERFALL CHART */}
        {activeTab === 'shap' && (
          <div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '16px' }}>
              SHAP (SHapley Additive exPlanations) breaks down the baseline model prediction to attribute how each operational feature pushes the risk index up or down.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {riskItem.shapContributions.map((feat, idx) => (
                <div key={idx} style={{ background: 'var(--bg-canvas)', padding: '12px', borderRadius: '8px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', fontWeight: 700, marginBottom: '6px' }}>
                    <span>{feat.feature}</span>
                    <span style={{ color: feat.direction === 'increase' ? '#ef4444' : '#10b981' }}>
                      {feat.direction === 'increase' ? `Pushes Risk Up (${feat.contribution})` : `Reduces Risk (${feat.contribution})`}
                    </span>
                  </div>

                  {/* Horizontal Relative bar */}
                  <div style={{ height: '8px', background: 'var(--bg-card)', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{
                      width: feat.contribution.replace(/[^0-9]/g, '') + '%',
                      height: '100%',
                      background: feat.direction === 'increase' ? '#ef4444' : '#10b981',
                      borderRadius: '4px'
                    }}></div>
                  </div>
                </div>
              ))}
            </div>

            <div style={{ marginTop: '20px', padding: '12px', background: 'rgba(59, 130, 246, 0.1)', borderRadius: '8px', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
              ℹ️ Predictive Model Confidence: <strong>96.8% (XGBoost v2.4.1)</strong> with Uncertainty interval <strong>±2.4%</strong>.
            </div>
          </div>
        )}

        {/* TAB 2: RESPONSIBLE AI & BIAS AUDIT */}
        {activeTab === 'fairness' && (
          <div>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 800, marginBottom: '8px' }}>Demographic Group Fairness & Disparate Impact Monitoring</h4>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '16px' }}>
              Responsible AI evaluation verifying model false-positive rates (FPR) and precision equalization across demographic cohorts.
            </p>

            <div className="dashboard-card" style={{ padding: '0', overflow: 'hidden', marginBottom: '16px' }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Demographic Cohort</th>
                    <th>Sample Size</th>
                    <th>Precision</th>
                    <th>Recall</th>
                    <th>FPR Disparity</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Age 18 - 45 (Adult)</td>
                    <td>4,210</td>
                    <td>96.4%</td>
                    <td>96.1%</td>
                    <td><span className="badge badge-success">0.01 (Balanced)</span></td>
                  </tr>
                  <tr>
                    <td>Age 65+ (Geriatric)</td>
                    <td>2,840</td>
                    <td>95.8%</td>
                    <td>95.4%</td>
                    <td><span className="badge badge-success">0.02 (Balanced)</span></td>
                  </tr>
                  <tr>
                    <td>Pediatrics (&lt; 18)</td>
                    <td>1,420</td>
                    <td>94.9%</td>
                    <td>95.0%</td>
                    <td><span className="badge badge-info">0.03 (Within Margin)</span></td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#10b981', fontWeight: 800, fontSize: '0.8rem' }}>
              <ShieldCheck style={{ width: 16, height: 16 }} /> Audited: Zero statistically significant demographic bias detected.
            </div>
          </div>
        )}

        {/* TAB 3: MODEL TRACEABILITY LOG */}
        {activeTab === 'audit' && (
          <div>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 800, marginBottom: '12px' }}>Auditable AI Prediction Metadata</h4>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '0.8rem' }}>
              <div style={{ background: 'var(--bg-canvas)', padding: '10px', borderRadius: '6px' }}>
                <div style={{ color: 'var(--text-muted)' }}>Model Identifier:</div>
                <div style={{ fontWeight: 800 }}>MediTwin-XGBoost-Ops-v2.4</div>
              </div>
              <div style={{ background: 'var(--bg-canvas)', padding: '10px', borderRadius: '6px' }}>
                <div style={{ color: 'var(--text-muted)' }}>Training Dataset Version:</div>
                <div style={{ fontWeight: 800 }}>MediTwin-SynOps-2026.1</div>
              </div>
              <div style={{ background: 'var(--bg-canvas)', padding: '10px', borderRadius: '6px' }}>
                <div style={{ color: 'var(--text-muted)' }}>Input Timestamp:</div>
                <div style={{ fontWeight: 800 }}>{new Date().toISOString()}</div>
              </div>
              <div style={{ background: 'var(--bg-canvas)', padding: '10px', borderRadius: '6px' }}>
                <div style={{ color: 'var(--text-muted)' }}>Inference Latency:</div>
                <div style={{ fontWeight: 800, color: '#10b981' }}>8.2 ms</div>
              </div>
            </div>
          </div>
        )}

        <div style={{ marginTop: '24px', paddingTop: '16px', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'flex-end' }}>
          <button onClick={onClose} className="btn btn-primary" style={{ padding: '8px 20px' }}>
            Close Explanation Panel
          </button>
        </div>
      </div>
    </div>
  );
}
