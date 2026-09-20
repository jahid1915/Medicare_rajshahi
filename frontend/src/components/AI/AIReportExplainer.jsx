import React, { useState } from 'react';
import { FileText, Upload, AlertCircle, CheckCircle2, Info, Sparkles, RefreshCw } from 'lucide-react';
import { addAuditLog } from '../../data/mockUserStore';

export default function AIReportExplainer() {
  const [selectedReport, setSelectedReport] = useState('cbc');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  
  const sampleReports = {
    cbc: {
      title: 'Complete Blood Count (CBC)',
      labName: 'Popular Diagnostic Centre',
      date: '2026-08-10',
      patient: 'Tanvir Hossain (32, M)',
      parameters: [
        { name: 'Hemoglobin (Hb)', value: '11.8 g/dL', normal: '13.5 - 17.5 g/dL', status: 'low', note: 'Mild anemia indicator. May cause slight fatigue or dizziness.' },
        { name: 'Total WBC Count', value: '7,200 /uL', normal: '4,000 - 11,000 /uL', status: 'normal', note: 'White blood cell count is within normal healthy range.' },
        { name: 'Platelet Count', value: '250,000 /uL', normal: '150,000 - 450,000 /uL', status: 'normal', note: 'Platelet levels are normal.' },
        { name: 'ESR (Erythrocyte Sedimentation Rate)', value: '24 mm/hr', normal: '0 - 15 mm/hr', status: 'high', note: 'Slightly elevated ESR suggests mild systemic inflammation.' }
      ],
      aiExplanation: `Summary Explanation:\n1. Your Hemoglobin level (11.8 g/dL) is slightly below the standard adult male reference range (13.5 - 17.5 g/dL).\n2. Your ESR (24 mm/hr) is slightly elevated.\n3. WBC and Platelet counts are completely healthy and normal.\n\nPlain Language Takeaway:\nThese results suggest mild iron-deficiency anemia or mild post-viral fatigue. This is not an emergency, but consulting a doctor or General Physician is recommended to discuss dietary iron options or routine follow-up.`
    },
    renal: {
      title: 'Kidney & Renal Function Test (RFT)',
      labName: 'Ibn Sina Diagnostic Center',
      date: '2026-08-08',
      patient: 'Tanvir Hossain (32, M)',
      parameters: [
        { name: 'Serum Creatinine', value: '0.9 mg/dL', normal: '0.7 - 1.3 mg/dL', status: 'normal', note: 'Optimal kidney filtration marker.' },
        { name: 'Blood Urea Nitrogen (BUN)', value: '14 mg/dL', normal: '7 - 20 mg/dL', status: 'normal', note: 'Normal protein metabolism and fluid balance.' },
        { name: 'eGFR (Glomerular Filtration Rate)', value: '105 mL/min/1.73m²', normal: '> 90 mL/min', status: 'normal', note: 'Excellent kidney filtration capacity.' }
      ],
      aiExplanation: `Summary Explanation:\nAll kidney filtration metrics including Serum Creatinine (0.9 mg/dL) and eGFR (105 mL/min) are in perfect normal ranges.\n\nPlain Language Takeaway:\nYour renal function appears healthy and normal. Maintain adequate hydration.`
    }
  };

  const [reportResult, setReportResult] = useState(sampleReports.cbc);

  const handleAnalyze = (reportKey) => {
    setIsAnalyzing(true);
    setSelectedReport(reportKey);
    setTimeout(() => {
      setReportResult(sampleReports[reportKey]);
      setIsAnalyzing(false);
      addAuditLog('AI_REPORT_EXPLAINER', 'OCR_ANALYSIS_COMPLETED', `Analyzed ${sampleReports[reportKey].title}`);
    }, 700);
  };

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* Main Header Panel */}
      <div className="dashboard-card" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'var(--primary-glow)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifySelf: 'center', justifyContent: 'center' }}>
              <FileText style={{ width: '22px', height: '22px' }} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)' }}>AI Medical Report Explainer</h2>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Get plain-language reference comparisons & health metrics instantly</p>
            </div>
          </div>
          <span className="badge badge-primary">
            <Sparkles style={{ width: 13, height: 13, marginRight: 2 }} /> Medical OCR v3
          </span>
        </div>

        {/* Diagnostic Report Selectors */}
        <div style={{ marginTop: '24px', padding: '16px', background: '#f8fafc', borderRadius: '12px', border: '1px solid var(--border-default)' }}>
          <span style={{ fontSize: '0.6875rem', fontWeight: 750, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'block', marginBottom: '12px' }}>
            Select Sample Diagnostic Report or Upload:
          </span>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '12px' }}>
            <button
              onClick={() => handleAnalyze('cbc')}
              style={{
                padding: '14px',
                borderRadius: '12px',
                textAlign: 'left',
                border: '1.5px solid transparent',
                cursor: 'pointer',
                transition: 'all 200ms ease',
                background: selectedReport === 'cbc' ? 'var(--primary)' : 'white',
                color: selectedReport === 'cbc' ? 'white' : 'var(--text-primary)',
                borderColor: selectedReport === 'cbc' ? 'var(--primary)' : 'var(--border-default)',
                boxShadow: selectedReport === 'cbc' ? 'var(--shadow-primary)' : 'none'
              }}
            >
              <div style={{ fontWeight: 800, fontSize: '0.8125rem', marginBottom: '2px' }}>🩸 Complete Blood Count (CBC)</div>
              <div style={{ fontSize: '0.625rem', opacity: selectedReport === 'cbc' ? 0.8 : 0.6 }}>Popular Lab • 10 Aug 2026</div>
            </button>

            <button
              onClick={() => handleAnalyze('renal')}
              style={{
                padding: '14px',
                borderRadius: '12px',
                textAlign: 'left',
                border: '1.5px solid transparent',
                cursor: 'pointer',
                transition: 'all 200ms ease',
                background: selectedReport === 'renal' ? 'var(--primary)' : 'white',
                color: selectedReport === 'renal' ? 'white' : 'var(--text-primary)',
                borderColor: selectedReport === 'renal' ? 'var(--primary)' : 'var(--border-default)',
                boxShadow: selectedReport === 'renal' ? 'var(--shadow-primary)' : 'none'
              }}
            >
              <div style={{ fontWeight: 800, fontSize: '0.8125rem', marginBottom: '2px' }}>🫘 Renal Function (RFT)</div>
              <div style={{ fontSize: '0.625rem', opacity: selectedReport === 'renal' ? 0.8 : 0.6 }}>Ibn Sina Lab • 08 Aug 2026</div>
            </button>

            <div style={{
              padding: '14px',
              borderRadius: '12px',
              border: '1.5px dashed var(--border-strong)',
              background: 'rgba(255,255,255,0.4)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              textAlign: 'center',
              cursor: 'pointer',
              color: 'var(--text-muted)',
              fontSize: '0.75rem',
              transition: 'border-color 150ms'
            }}>
              <Upload style={{ width: 16, height: 16, color: 'var(--primary)', marginBottom: '4px' }} />
              <span style={{ fontWeight: 700 }}>Upload Lab Report</span>
              <span style={{ fontSize: '0.5625rem', opacity: 0.7 }}>Supports PDF or image files</span>
            </div>
          </div>
        </div>
      </div>

      {/* Output Panel */}
      {isAnalyzing ? (
        <div className="dashboard-card" style={{ padding: '48px', textAlign: 'center' }}>
          <RefreshCw style={{ width: '32px', height: '32px', color: 'var(--primary)', margin: '0 auto 12px auto' }} className="animate-spin" />
          <h3 style={{ fontSize: '0.875rem', fontWeight: 800 }}>Analyzing parameters with Medical NLP...</h3>
          <p style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', marginTop: '4px' }}>Comparing values against age-specific standard intervals</p>
        </div>
      ) : reportResult ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* Metadata banner */}
          <div className="dashboard-card" style={{ padding: '16px 20px', background: '#f8fafc', display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', gap: '16px' }}>
            <div style={{ fontSize: '0.75rem' }}>
              <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.625rem', fontWeight: 650 }}>REPORT TYPE</span>
              <strong style={{ color: 'var(--text-primary)' }}>{reportResult.title}</strong>
            </div>
            <div style={{ fontSize: '0.75rem' }}>
              <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.625rem', fontWeight: 650 }}>FACILITY</span>
              <strong style={{ color: 'var(--text-primary)' }}>{reportResult.labName}</strong>
            </div>
            <div style={{ fontSize: '0.75rem' }}>
              <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.625rem', fontWeight: 650 }}>DATE & PATIENT</span>
              <strong style={{ color: 'var(--text-primary)' }}>{reportResult.date} • {reportResult.patient}</strong>
            </div>
          </div>

          {/* Table Card */}
          <div className="dashboard-card" style={{ padding: '0', overflow: 'hidden' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Parameter</th>
                  <th>Your Result</th>
                  <th>Standard Reference</th>
                  <th>Status</th>
                  <th>Clinical Interpretation Note</th>
                </tr>
              </thead>
              <tbody>
                {reportResult.parameters.map((param, index) => (
                  <tr key={index}>
                    <td style={{ fontWeight: 700 }}>{param.name}</td>
                    <td style={{ fontWeight: 750, color: 'var(--text-primary)' }}>{param.value}</td>
                    <td style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontSize: '0.75rem' }}>{param.normal}</td>
                    <td>
                      {param.status === 'normal' && <span className="badge badge-success">✓ Normal</span>}
                      {param.status === 'low' && <span className="badge badge-warning">⚠ Low</span>}
                      {param.status === 'high' && <span className="badge badge-danger">▲ High</span>}
                    </td>
                    <td style={{ color: 'var(--text-secondary)', fontSize: '0.75rem' }}>{param.note}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* AI Explanation Summary */}
          <div className="dashboard-card" style={{ borderLeft: '4px solid var(--primary)', background: 'rgba(10, 83, 148, 0.02)', padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--primary)', fontWeight: 800, fontSize: '0.875rem', marginBottom: '12px' }}>
              <Sparkles style={{ width: 16, height: 16 }} />
              AI Natural-Language Interpretation Summary
            </div>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', lineHeight: 1.6, whiteSpace: 'pre-line' }}>
              {reportResult.aiExplanation}
            </p>
          </div>

          {/* Notice Warning */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 16px', borderRadius: '10px', background: 'rgba(245, 158, 11, 0.05)', border: '1.5px solid rgba(245, 158, 11, 0.1)', fontSize: '0.75rem', color: '#b45309' }}>
            <Info style={{ width: 16, height: 16, flexShrink: 0 }} />
            <span>Educational Disclaimer: AI summaries are for guidance only. Consult a registered physician before making any clinical treatment changes.</span>
          </div>

        </div>
      ) : null}

    </div>
  );
}
