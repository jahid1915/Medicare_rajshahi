import React, { useState } from 'react';
import { Play, ArrowRight, ArrowLeft, CheckCircle2, Sparkles, X, ShieldCheck, Box, Activity, Sliders, AlertTriangle } from 'lucide-react';

export default function DemonstrationFlowModal({ onClose, onNavigateToTab }) {
  const [currentStep, setCurrentStep] = useState(1);

  const demoSteps = [
    { step: 1, title: 'Patient Uploads Documents', desc: 'Patient uploads multi-page PDFs, lab scans, and discharge summaries.', targetTab: 'timeline' },
    { step: 2, title: 'OCR Entity Extraction Pipeline', desc: 'Document AI extracts test names, numerical values, reference ranges, and doctor notes with confidence scores.', targetTab: 'comparison' },
    { step: 3, title: 'AI Medical Memory Timeline Built', desc: 'Longitudinal medical memory connects documents chronologically from 2019 to 2026 with RAG query support.', targetTab: 'timeline' },
    { step: 4, title: 'Doctor Reviews AI Record & Conflicts', desc: 'Doctor opens AI clinical assistant, inspects detected medication discrepancies and signed discharge drafts.', targetTab: 'specialists' },
    { step: 5, title: '3D Hospital Digital Twin View', desc: 'Hospital administrators inspect 3D Three.js building wings, live bed occupancy heatmaps, and ICU wards.', targetTab: 'digital-twin' },
    { step: 6, title: 'Emergency Demand Surge (+40%)', desc: 'Simulated influx of 25 incoming ambulances triggers emergency triage pressure.', targetTab: 'early-warning' },
    { step: 7, title: 'ML Forecasting Model Predicts Congestion', desc: 'XGBoost forecasting model predicts ICU threshold breach and triage queue growth over next 6 hours.', targetTab: 'forecasting' },
    { step: 8, title: 'What-If Control Room Simulation', desc: 'Simulator computes impact of +40% emergency surge against baseline bed availability.', targetTab: 'what-if' },
    { step: 9, title: 'Administrator Tests What-If Scenarios', desc: 'Admin adjusts ICU bed allocation (+15 beds) and lab throughput (+25%) sliders to resolve bottleneck.', targetTab: 'what-if' },
    { step: 10, title: 'Explainable AI Displays Recommendations', desc: 'SHAP feature waterfall chart highlights top operational drivers and suggests actionable staff reallocation.', targetTab: 'early-warning' },
    { step: 11, title: 'IoT Sensors Stream Real-Time Vitals', desc: 'ESP32 MQTT telemetry nodes update patient bed SpO2 and heart rate monitors live.', targetTab: 'iot' },
    { step: 12, title: 'Hospital State Rebalances & Stabilizes', desc: 'Digital Twin and Early Warning Center update to green equilibrium state.', targetTab: 'digital-twin' }
  ];

  const activeStepObj = demoSteps.find(s => s.step === currentStep);

  const handleGoToStep = (stepNum) => {
    setCurrentStep(stepNum);
    if (onNavigateToTab && demoSteps[stepNum - 1]?.targetTab) {
      onNavigateToTab(demoSteps[stepNum - 1].targetTab);
    }
  };

  return (
    <div style={{
      position: 'fixed', bottom: 20, right: 20,
      width: '420px', background: 'var(--bg-card)', border: '2px solid var(--primary)',
      borderRadius: '16px', boxShadow: '0 12px 40px rgba(0,0,0,0.6)', zIndex: 99999, padding: '20px'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span className="badge badge-primary">🎬 Requirement #64 Master Scenario</span>
          <span style={{ fontSize: '0.75rem', fontWeight: 800 }}>Step {currentStep} of 12</span>
        </div>
        <button onClick={onClose} className="btn btn-secondary" style={{ padding: '4px 8px' }}><X style={{ width: 14, height: 14 }} /></button>
      </div>

      <h3 style={{ fontSize: '1.05rem', fontWeight: 900, marginBottom: '4px', color: 'var(--primary)' }}>
        {activeStepObj.title}
      </h3>
      <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '16px' }}>
        {activeStepObj.desc}
      </p>

      {/* Progress Dots Bar */}
      <div style={{ display: 'flex', gap: '4px', marginBottom: '16px' }}>
        {demoSteps.map(s => (
          <div
            key={s.step}
            onClick={() => handleGoToStep(s.step)}
            style={{
              flex: 1, height: '6px', borderRadius: '3px', cursor: 'pointer',
              background: s.step === currentStep ? 'var(--primary)' : s.step < currentStep ? '#10b981' : 'var(--bg-canvas)'
            }}
          />
        ))}
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <button
          disabled={currentStep === 1}
          onClick={() => handleGoToStep(currentStep - 1)}
          className="btn btn-secondary"
          style={{ fontSize: '0.75rem', padding: '6px 12px' }}
        >
          <ArrowLeft style={{ width: 14, height: 14 }} /> Previous
        </button>

        <button
          onClick={() => {
            if (currentStep < 12) handleGoToStep(currentStep + 1);
            else onClose();
          }}
          className="btn btn-primary"
          style={{ fontSize: '0.75rem', padding: '6px 16px' }}
        >
          {currentStep === 12 ? 'Finish Walkthrough' : 'Next Step'} <ArrowRight style={{ width: 14, height: 14 }} />
        </button>
      </div>
    </div>
  );
}
