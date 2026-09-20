import React, { useState } from 'react';
import { processMedicalDocumentOCR, compareMedicalReports, detectDocumentConflicts } from '../../services/documentAiEngine';
import { MOCK_OCR_DOCUMENTS } from '../../data/hospitalStore';
import { FileDiff, AlertTriangle, FileText, Upload, TrendingUp, TrendingDown, Minus, CheckCircle, ShieldAlert } from 'lucide-react';

export default function DocumentComparisonView() {
  const [selectedReports, setSelectedReports] = useState(MOCK_OCR_DOCUMENTS);
  const [uploadStatus, setUploadStatus] = useState(null);
  
  const comparisonData = compareMedicalReports(selectedReports);
  const conflictsData = detectDocumentConflicts(selectedReports);

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadStatus('OCR Pipeline Processing PDF / Image...');
    setTimeout(() => {
      const newDoc = processMedicalDocumentOCR(file.name);
      setSelectedReports(prev => [...prev, {
        id: newDoc.docId,
        title: file.name,
        date: new Date().toISOString().split('T')[0],
        hospital: 'Uploaded Scan',
        doctor: 'Dr. Extracted',
        type: 'OCR PDF Scan',
        confidenceScore: newDoc.overallConfidence,
        extractedData: newDoc.extractedEntities
      }]);
      setUploadStatus(null);
    }, 800);
  };

  return (
    <div style={{ padding: '24px', color: 'var(--text-main)' }}>
      {/* Top Title Banner */}
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <span className="badge badge-primary">📄 Document AI Pipeline</span>
            <span className="badge badge-info">OCR + Entity Extraction</span>
          </div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 900 }}>Medical Report Comparison & Inconsistency Detector</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
            Compare multiple lab reports side-by-side (Report A vs Report B vs Report C) and detect cross-record conflicts automatically.
          </p>
        </div>

        {/* Upload Button */}
        <div>
          <label className="btn btn-primary" style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Upload style={{ width: 16, height: 16 }} /> Upload PDF / Image Scan
            <input type="file" accept=".pdf,.png,.jpg,.jpeg" onChange={handleFileUpload} style={{ display: 'none' }} />
          </label>
          {uploadStatus && <div style={{ fontSize: '0.75rem', color: 'var(--primary)', marginTop: '4px' }}>{uploadStatus}</div>}
        </div>
      </div>

      {/* SECTION 1: MEDICAL DOCUMENT CONFLICT DETECTOR */}
      <div className="dashboard-card" style={{ marginBottom: '32px', borderLeft: '4px solid #ef4444' }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <ShieldAlert style={{ width: 18, height: 18, color: '#ef4444' }} /> Medical Document Conflict & Inconsistency Detector
        </h3>

        {conflictsData && conflictsData.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {conflictsData.map((conf) => (
              <div key={conf.id} style={{ background: 'rgba(239, 68, 68, 0.08)', border: '1px solid rgba(239,68,68,0.3)', padding: '14px', borderRadius: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                  <span className="badge badge-error">Severity: {conf.severity}</span>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Flag ID: {conf.id}</span>
                </div>
                <h4 style={{ fontWeight: 800, fontSize: '0.9rem', color: '#ef4444' }}>{conf.category}</h4>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '4px' }}>{conf.description}</p>
                <div style={{ fontSize: '0.8rem', color: '#ef4444', fontWeight: 700, marginTop: '8px', background: 'var(--bg-card)', padding: '6px 10px', borderRadius: '4px' }}>
                  ⚠️ {conf.recommendation}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ color: '#10b981', fontWeight: 700, fontSize: '0.85rem' }}>
            ✓ No record inconsistencies detected across active uploaded reports.
          </div>
        )}
      </div>

      {/* SECTION 2: MULTI-REPORT SIDE-BY-SIDE COMPARISON TABLE */}
      <div className="dashboard-card">
        <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <FileDiff style={{ width: 18, height: 18, color: 'var(--primary)' }} /> Multi-Report Side-by-Side Values Comparison
        </h3>

        {comparisonData && (
          <div style={{ overflowX: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Biomarker / Test Name</th>
                  <th>Reference Range</th>
                  <th>Previous Report Value</th>
                  <th>Latest Report Value</th>
                  <th>Numerical Variance</th>
                  <th>Longitudinal Trend</th>
                </tr>
              </thead>
              <tbody>
                {comparisonData.comparisonRows.map((row, idx) => (
                  <tr key={idx}>
                    <td style={{ fontWeight: 800 }}>{row.testName}</td>
                    <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{row.refRange}</td>
                    <td style={{ fontFamily: 'var(--font-mono)' }}>
                      {row.previousValue} {row.previousValue !== 'N/A' && row.unit}
                    </td>
                    <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 800 }}>
                      {row.latestValue} {row.unit}
                    </td>
                    <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: row.trend === 'INCREASED' ? '#ef4444' : row.trend === 'DECREASED' ? '#10b981' : 'var(--text-muted)' }}>
                      {row.delta}
                    </td>
                    <td>
                      {row.trend === 'INCREASED' && (
                        <span className="badge badge-error" style={{ display: 'flex', alignItems: 'center', gap: '4px', width: 'fit-content' }}>
                          <TrendingUp style={{ width: 12, height: 12 }} /> Increased
                        </span>
                      )}
                      {row.trend === 'DECREASED' && (
                        <span className="badge badge-success" style={{ display: 'flex', alignItems: 'center', gap: '4px', width: 'fit-content' }}>
                          <TrendingDown style={{ width: 12, height: 12 }} /> Decreased
                        </span>
                      )}
                      {row.trend === 'UNCHANGED' && (
                        <span className="badge badge-info" style={{ display: 'flex', alignItems: 'center', gap: '4px', width: 'fit-content' }}>
                          <Minus style={{ width: 12, height: 12 }} /> Unchanged
                        </span>
                      )}
                      {row.trend === 'NEW_VALUE' && (
                        <span className="badge badge-primary">New Diagnostic Entry</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
