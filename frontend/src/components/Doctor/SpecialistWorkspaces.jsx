import React, { useState } from 'react';
import { SPECIALTY_WORKSPACES } from '../../data/hospitalStore';
import { Stethoscope, UserCheck, FileText, Activity, AlertCircle, Plus, Search, ShieldCheck, Sparkles } from 'lucide-react';

export default function SpecialistWorkspaces() {
  const [selectedSpecialtyId, setSelectedSpecialtyId] = useState('cardiology');
  const [activeTab, setActiveTab] = useState('roster'); // 'roster', 'forms', 'ai_assistant'
  const [searchQuery, setSearchQuery] = useState('');
  const [aiNoteDraft, setAiNoteDraft] = useState('');

  const currentSpecialty = SPECIALTY_WORKSPACES.find(s => s.id === selectedSpecialtyId) || SPECIALTY_WORKSPACES[0];

  // Specialty specific mock patients & clinical indicators
  const specialtyPatients = [
    { id: 'PAT-8812', name: 'Alex Mercer', age: 38, gender: 'Male', status: 'Admitted (Bed-204)', indicator: 'Troponin-T: 0.04 ng/mL | EF: 58%', diagnosis: 'Hypertensive Crisis' },
    { id: 'PAT-9014', name: 'Eleanor Vance', age: 62, gender: 'Female', status: 'Post-Op ICU', indicator: 'LVEF: 45% | NT-proBNP: 450 pg/mL', diagnosis: 'Coronary Artery Bypass' },
    { id: 'PAT-3391', name: 'David Kim', age: 51, gender: 'Male', status: 'Outpatient Consult', indicator: 'ECG: Normal Sinus Rhythm', diagnosis: 'Palpitations Evaluation' }
  ];

  const handleGenerateSpecialtyNote = () => {
    setAiNoteDraft(
      `[AI-GENERATED CLINICAL DRAFT - ${currentSpecialty.name.toUpperCase()}]\n` +
      `Date: ${new Date().toLocaleDateString()}\n` +
      `Attending Specialist: ${currentSpecialty.lead}\n\n` +
      `SPECIALTY ASSESSMENT:\n` +
      `Patient presents with clinical presentation consistent with specialty parameters for ${currentSpecialty.name}.\n` +
      `Key Diagnostic Markers: Vital signs stable, targeted laboratory values within acceptable tolerance.\n\n` +
      `RECOMMENDED MANAGEMENT PLAN DRAFT:\n` +
      `1. Continue primary medical regimen as documented.\n` +
      `2. Schedule follow-up diagnostics within 14 days.\n\n` +
      `⚠️ AI-generated draft note — Must be reviewed, modified, and signed by ${currentSpecialty.lead} before entry into permanent EHR.`
    );
  };

  return (
    <div style={{ padding: '24px', color: 'var(--text-main)' }}>
      {/* Header Banner */}
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <span className="badge badge-primary">👨‍⚕️ Specialist Workspaces</span>
            <span className="badge badge-info">20 Clinical Specialties Active</span>
          </div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 900 }}>Specialist Clinical Intelligence Hub</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
            Specialty-tailored clinical workflows, specialized terminology, targeted forms & AI decision support.
          </p>
        </div>

        <div style={{ fontSize: '0.8rem', background: 'var(--bg-canvas)', padding: '8px 14px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
          Lead Specialist: <strong>{currentSpecialty.lead}</strong>
        </div>
      </div>

      {/* 20 SPECIALTY SELECTION BAR */}
      <div style={{
        display: 'flex',
        gap: '8px',
        overflowX: 'auto',
        paddingBottom: '12px',
        marginBottom: '24px',
        borderBottom: '1px solid var(--border-color)'
      }}>
        {SPECIALTY_WORKSPACES.map((spec) => (
          <button
            key={spec.id}
            onClick={() => { setSelectedSpecialtyId(spec.id); setAiNoteDraft(''); }}
            style={{
              padding: '8px 14px',
              borderRadius: '8px',
              fontSize: '0.8rem',
              fontWeight: 700,
              whiteSpace: 'nowrap',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              background: selectedSpecialtyId === spec.id ? 'var(--primary)' : 'var(--bg-card)',
              color: selectedSpecialtyId === spec.id ? '#fff' : 'var(--text-secondary)',
              border: '1px solid var(--border-color)',
              transition: 'all 0.2s ease'
            }}
          >
            <span>{spec.icon}</span>
            <span>{spec.name}</span>
          </button>
        ))}
      </div>

      {/* ACTIVE SPECIALTY WORKSPACE PANEL */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '24px' }}>
        
        {/* LEFT WORKSPACE MAIN AREA */}
        <div>
          <div className="dashboard-card" style={{ marginBottom: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span>{currentSpecialty.icon}</span> {currentSpecialty.name} Clinical Workspace
              </h2>
              <span className="badge badge-success">{currentSpecialty.patientsCount} Active Specialty Patients</span>
            </div>

            {/* Sub-tabs */}
            <div style={{ display: 'flex', gap: '10px', marginBottom: '16px' }}>
              <button
                onClick={() => setActiveTab('roster')}
                className={`btn ${activeTab === 'roster' ? 'btn-primary' : 'btn-secondary'}`}
                style={{ fontSize: '0.8rem' }}
              >
                <UserCheck style={{ width: 14, height: 14 }} /> Active Patient Roster
              </button>
              <button
                onClick={() => setActiveTab('forms')}
                className={`btn ${activeTab === 'forms' ? 'btn-primary' : 'btn-secondary'}`}
                style={{ fontSize: '0.8rem' }}
              >
                <FileText style={{ width: 14, height: 14 }} /> Specialty Assessment Forms
              </button>
            </div>

            {/* SUB-VIEW 1: PATIENT ROSTER */}
            {activeTab === 'roster' && (
              <div style={{ overflowX: 'auto' }}>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Patient Profile</th>
                      <th>Status & Location</th>
                      <th>Specialty Clinical Indicator</th>
                      <th>Documented Diagnosis</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {specialtyPatients.map((pat) => (
                      <tr key={pat.id}>
                        <td style={{ fontWeight: 700 }}>
                          <div>{pat.name}</div>
                          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{pat.id} • {pat.age}y / {pat.gender}</div>
                        </td>
                        <td><span className="badge badge-info">{pat.status}</span></td>
                        <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem' }}>{pat.indicator}</td>
                        <td style={{ color: 'var(--text-secondary)' }}>{pat.diagnosis}</td>
                        <td>
                          <button className="btn btn-secondary" style={{ fontSize: '0.7rem', padding: '4px 8px' }}>
                            Inspect EHR
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* SUB-VIEW 2: SPECIALTY ASSESSMENT FORMS */}
            {activeTab === 'forms' && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div style={{ background: 'var(--bg-canvas)', padding: '14px', borderRadius: '8px' }}>
                  <h4 style={{ fontWeight: 800, fontSize: '0.85rem' }}>📋 {currentSpecialty.name} Intake Questionnaire</h4>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                    Standardized clinical checklist for targeted diagnostic entry.
                  </p>
                  <button className="btn btn-primary" style={{ marginTop: '10px', fontSize: '0.75rem' }}>
                    Open Assessment Form
                  </button>
                </div>

                <div style={{ background: 'var(--bg-canvas)', padding: '14px', borderRadius: '8px' }}>
                  <h4 style={{ fontWeight: 800, fontSize: '0.85rem' }}>📊 Targeted Biomarker Panel</h4>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                    Pre-filtered lab test orders for {currentSpecialty.name}.
                  </p>
                  <button className="btn btn-secondary" style={{ marginTop: '10px', fontSize: '0.75rem' }}>
                    Order Lab Panel
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: AI CLINICAL DRAFT ASSISTANT */}
        <div className="dashboard-card" style={{ height: 'fit-content' }}>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 800, marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Sparkles style={{ width: 18, height: 18, color: 'var(--primary)' }} /> AI Clinical Note Generator
          </h3>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '12px' }}>
            Generate structured clinical notes tailored to {currentSpecialty.name} terminology.
          </p>

          <button
            onClick={handleGenerateSpecialtyNote}
            className="btn btn-primary"
            style={{ width: '100%', marginBottom: '16px', fontSize: '0.8rem' }}
          >
            Draft Clinical Summary Note
          </button>

          {aiNoteDraft && (
            <div>
              <textarea
                value={aiNoteDraft}
                onChange={(e) => setAiNoteDraft(e.target.value)}
                rows={12}
                style={{
                  width: '100%',
                  fontSize: '0.75rem',
                  fontFamily: 'var(--font-mono)',
                  padding: '10px',
                  borderRadius: '8px',
                  background: 'var(--bg-canvas)',
                  color: 'var(--text-main)',
                  border: '1px solid var(--border-color)',
                  resize: 'vertical'
                }}
              />

              <div style={{ fontSize: '0.7rem', color: '#f59e0b', marginTop: '8px', fontWeight: 600 }}>
                ⚠️ Non-Diagnostic Disclaimer: AI-generated draft for decision support. Physician review required.
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
