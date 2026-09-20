import React, { useState } from 'react';
import { queryMedicalMemoryRAG } from '../../services/documentAiEngine';
import { MOCK_OCR_DOCUMENTS } from '../../data/hospitalStore';
import { Calendar, Search, FileText, Sparkles, AlertCircle, Bookmark, ShieldCheck, CheckCircle2 } from 'lucide-react';

export default function MedicalMemoryTimeline() {
  const [ragQuery, setRagQuery] = useState('');
  const [ragResult, setRagResult] = useState(null);
  const [selectedDocModal, setSelectedDocModal] = useState(null);

  // Longitudinal timeline items spanning 2019 to 2026
  const timelineEvents = [
    { year: '2026', date: '2026-06-12', title: 'Comprehensive Metabolic Panel & Lipid Profile', category: 'Laboratory Report', docId: 'DOC-2026-881', summary: 'Glucose 118 mg/dL, Cholesterol 228 mg/dL, HbA1c 6.4% (Prediabetes). Active Metformin.' },
    { year: '2025', date: '2025-09-18', title: 'Routine Annual Wellness Follow-up', category: 'Outpatient Consult', docId: null, summary: 'Vitals stable. BP 124/80. Recommended dietary adjustment.' },
    { year: '2024', date: '2024-11-04', title: 'Hospital Discharge Summary (Chest Pain Admission)', category: 'Hospitalization', docId: 'DOC-2024-412', summary: 'Inpatient admission for Hypertensive Crisis (Resolved). Prescribed Lisinopril 10mg.' },
    { year: '2023', date: '2023-05-14', title: 'Chest Radiograph (X-Ray 2-Views)', category: 'Medical Imaging', docId: null, summary: 'Clear lung fields. No acute cardiopulmonary disease.' },
    { year: '2022', date: '2022-08-30', title: 'Endocrine Specialist Consultation', category: 'Specialist Visit', docId: null, summary: 'Screening for metabolic risk factors. Family history noted.' },
    { year: '2021', date: '2021-03-22', title: 'Outpatient Consultation & Allergy Registration', category: 'Allergy Record', docId: 'DOC-2021-109', summary: 'Registered Penicillin allergy (Anaphylaxis risk).' },
    { year: '2020', date: '2020-01-15', title: 'Baseline Blood Diagnostics', category: 'Laboratory Report', docId: null, summary: 'Glucose 94 mg/dL. All parameters within normal ranges.' },
    { year: '2019', date: '2019-04-10', title: 'Primary Care Intake & Medical History Establishment', category: 'Consultation', docId: null, summary: 'Initial patient profile creation.' }
  ];

  const handleExecuteRAG = (e) => {
    e?.preventDefault();
    if (!ragQuery.trim()) return;
    const res = queryMedicalMemoryRAG(ragQuery, MOCK_OCR_DOCUMENTS);
    setRagResult(res);
  };

  const setSampleQuery = (q) => {
    setRagQuery(q);
    const res = queryMedicalMemoryRAG(q, MOCK_OCR_DOCUMENTS);
    setRagResult(res);
  };

  return (
    <div style={{ padding: '24px', color: 'var(--text-main)' }}>
      {/* Header Banner */}
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <span className="badge badge-primary">🧠 AI Medical Memory</span>
            <span className="badge badge-info">Longitudinal RAG Vector Engine</span>
          </div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 900 }}>Personal Health Timeline & Document RAG</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
            Transforms fragmented historical PDFs, lab scans & doctor notes into an auditable longitudinal medical memory timeline.
          </p>
        </div>
      </div>

      {/* RAG SEARCH BAR CONTAINER */}
      <div className="dashboard-card" style={{ marginBottom: '32px', borderLeft: '4px solid var(--primary)' }}>
        <form onSubmit={handleExecuteRAG} style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <Search style={{ position: 'absolute', left: 12, top: 12, width: 18, height: 18, color: 'var(--text-muted)' }} />
            <input
              type="text"
              placeholder="Ask AI Medical Memory: e.g. 'Show medications during last hospitalization' or 'Compare glucose values'"
              value={ragQuery}
              onChange={(e) => setRagQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 12px 10px 40px',
                borderRadius: '8px',
                border: '1px solid var(--border-color)',
                background: 'var(--bg-canvas)',
                color: 'var(--text-main)',
                fontSize: '0.9rem'
              }}
            />
          </div>
          <button type="submit" className="btn btn-primary" style={{ padding: '10px 20px' }}>
            <Sparkles style={{ width: 16, height: 16 }} /> RAG Query Memory
          </button>
        </form>

        {/* Quick Sample Queries */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '12px', fontSize: '0.75rem' }}>
          <span style={{ color: 'var(--text-muted)', fontWeight: 600 }}>Suggested Questions:</span>
          {[
            'Show medications recorded during last hospitalization',
            'Find previous laboratory results for cholesterol',
            'Show important events in documented history'
          ].map((q, idx) => (
            <button
              key={idx}
              onClick={() => setSampleQuery(q)}
              style={{ background: 'var(--bg-canvas)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '2px 10px', cursor: 'pointer', color: 'var(--primary)' }}
            >
              "{q}"
            </button>
          ))}
        </div>

        {/* RAG Answer Result Display */}
        {ragResult && (
          <div style={{ marginTop: '20px', background: 'var(--bg-canvas)', padding: '16px', borderRadius: '10px', border: '1px solid var(--primary)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span className="badge badge-success">AI Memory Synthesis (Confidence: {Math.round(ragResult.confidence * 100)}%)</span>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Source Vector Indexing Active</span>
            </div>

            <p style={{ fontSize: '0.9rem', lineHeight: 1.6, fontWeight: 600 }}>{ragResult.answer}</p>

            <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px dotted var(--border-color)' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)', marginBottom: '6px' }}>
                📌 Ground Truth Source Citations (Zero Fabrication Enforcement):
              </div>
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                {ragResult.sourceCitations.map((cite, i) => (
                  <div key={i} style={{ background: 'var(--bg-card)', padding: '6px 10px', borderRadius: '6px', fontSize: '0.75rem', border: '1px solid var(--border-color)' }}>
                    <strong>[{cite.docId}]</strong> ({cite.date}): "{cite.excerpt}"
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* VISUAL PERSONAL HEALTH TIMELINE (2019 -> 2026) */}
      <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <Calendar style={{ width: 18, height: 18, color: 'var(--primary)' }} /> Personal Health Timeline (2019 — 2026)
      </h3>

      <div style={{ position: 'relative', paddingLeft: '32px', borderLeft: '3px solid var(--primary)' }}>
        {timelineEvents.map((item, idx) => (
          <div key={idx} style={{ position: 'relative', marginBottom: '24px' }}>
            {/* Timeline Dot */}
            <div style={{
              position: 'absolute',
              left: '-41px',
              top: '4px',
              width: '16px',
              height: '16px',
              borderRadius: '50%',
              background: item.year === '2026' ? '#ef4444' : 'var(--primary)',
              border: '3px solid var(--bg-card)'
            }} />

            <div className="dashboard-card" style={{ padding: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <span className="badge badge-primary">{item.year} • {item.date}</span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700 }}>{item.category}</span>
              </div>

              <h4 style={{ fontSize: '1.05rem', fontWeight: 800 }}>{item.title}</h4>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '4px' }}>{item.summary}</p>

              {item.docId && (
                <div style={{ marginTop: '10px' }}>
                  <button
                    onClick={() => setSelectedDocModal(MOCK_OCR_DOCUMENTS.find(d => d.id === item.docId))}
                    className="btn btn-secondary"
                    style={{ fontSize: '0.75rem', padding: '4px 10px' }}
                  >
                    <FileText style={{ width: 14, height: 14, color: 'var(--primary)' }} /> Inspect OCR Document [{item.docId}]
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* OCR Document Inspection Modal */}
      {selectedDocModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '20px'
        }}>
          <div className="dashboard-card" style={{ width: '100%', maxWidth: '600px', maxHeight: '80vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800 }}>OCR Document Inspector: {selectedDocModal.id}</h3>
              <button onClick={() => setSelectedDocModal(null)} className="btn btn-secondary" style={{ padding: '4px 8px' }}>Close</button>
            </div>

            <div style={{ fontSize: '0.8rem', marginBottom: '8px' }}>
              <div><strong>Document Title:</strong> {selectedDocModal.title}</div>
              <div><strong>Date:</strong> {selectedDocModal.date} | <strong>Hospital:</strong> {selectedDocModal.hospital}</div>
              <div><strong>OCR Confidence Score:</strong> <span className="badge badge-success">{(selectedDocModal.confidenceScore * 100).toFixed(1)}%</span></div>
            </div>

            <pre style={{
              background: 'var(--bg-canvas)',
              padding: '12px',
              borderRadius: '8px',
              fontSize: '0.75rem',
              fontFamily: 'var(--font-mono)',
              whiteSpace: 'pre-wrap'
            }}>
              {JSON.stringify(selectedDocModal.extractedData, null, 2)}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}
