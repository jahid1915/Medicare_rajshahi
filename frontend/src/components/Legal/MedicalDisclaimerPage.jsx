import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  AlertTriangle, ArrowLeft, Stethoscope, ShieldCheck, HeartPulse,
  ChevronDown, HelpCircle, PhoneCall, Building2, Pill, Sparkles
} from 'lucide-react';

const DISCLAIMER_SECTIONS = [
  {
    id: 'platform-nature',
    num: '1',
    title: 'Nature of the Niramoy Platform',
    icon: Building2,
    badge: 'Technology Intermediary',
    summary: 'Niramoy connects you with independent licensed doctors and facilities.',
    fullText: 'Niramoy is a healthcare technology platform designed to streamline doctor discovery, hospital bed resource monitoring, pharmacy catalog lookup, and clinical appointment scheduling across Rajshahi and Bangladesh. Niramoy is not a hospital, medical clinic, or healthcare provider organization. Any doctor-patient relationship is formed directly and exclusively between you and the independent, registered physician you choose to consult.',
    contextMeaning: 'Niramoy provides the digital network and booking tools. Your medical care, diagnosis, and prescriptions are given directly by your doctor.',
    actions: [
      'Doctor credentials are BMDC validated at onboarding',
      'Prescriptions are signed and authorized solely by attending doctors',
      'Consultations happen directly in-chamber or via secure video call'
    ]
  },
  {
    id: 'educational-content',
    num: '2',
    title: 'General Informational & Educational Content',
    icon: HelpCircle,
    badge: 'Educational Notice',
    summary: 'Health tips and articles are for educational awareness only.',
    fullText: 'All health tips, medical articles, educational summaries, drug database descriptions, and wellness materials published on Niramoy are provided for general educational and informational purposes only. Such materials do not constitute individual medical advice, diagnosis, or treatment plans and should never replace an in-person doctor visit.',
    contextMeaning: 'Articles about nutrition, seasonal illnesses, or health tips help you stay informed, but cannot diagnose illnesses. Always consult a physician for symptoms.',
    actions: [
      'Articles are peer-reviewed against standard medical guidelines',
      'Never alter your prescribed treatment based on online articles',
      'Ask your doctor if you have questions about any medical topic'
    ]
  },
  {
    id: 'ai-tools',
    num: '3',
    title: 'Niramoy AI & Automated Decision-Support Tools',
    icon: Sparkles,
    badge: 'Clinical AI Advisory',
    summary: 'AI symptom assistants guide clinical navigation; doctors make diagnoses.',
    fullText: 'Niramoy AI assists users in navigating healthcare services, translating lab report terms into plain language, and organizing questions for appointments. Niramoy AI is an intelligent assistant, not an autonomous physician or medical diagnostician. AI outputs cannot prescribe medications, modify existing treatment regimens, or issue clinical orders.',
    contextMeaning: 'Our AI translates complex lab values into easy-to-understand explanations and suggests relevant specialties, but your doctor always reviews and confirms.',
    actions: [
      'Automated safety red-flag triage redirecting to emergency hotlines',
      'Zero algorithmic prescription generation',
      'Human doctor review required for clinical decisions'
    ]
  },
  {
    id: 'physician-credentials',
    num: '4',
    title: 'Physician Credentials & Verification',
    icon: Stethoscope,
    badge: 'BMDC Validation',
    summary: 'Verification processes for doctor registration and qualifications.',
    fullText: 'Where a doctor profile displays a BMDC verification badge, it indicates that Niramoy has validated the physician registration record against Bangladesh Medical & Dental Council registries during onboarding. Medical practitioners are solely responsible for maintaining active licensing and clinical treatment standards.',
    contextMeaning: 'You can trust the doctor BMDC badge, degrees, and hospital workplace details shown on Niramoy because they are cross-referenced with official records.',
    actions: [
      'Direct link to official BMDC registry lookups',
      'Verified chamber schedules and hospital affiliations',
      'Regular compliance audits of practicing specialists'
    ]
  },
  {
    id: 'hospital-beds',
    num: '5',
    title: 'Hospital Resource & Bed Availability Data',
    icon: Building2,
    badge: 'Resource Telemetry',
    summary: 'Real-time telemetry and emergency room readiness verification.',
    fullText: 'Live hospital bed, ICU, CCU, and incubator availability metrics published on Niramoy are reported directly by participating hospital administration desks or estimated via clinical resource telemetry. In critical medical emergencies, users and patient attendants must directly contact the hospital emergency desk to confirm real-time admission readiness before transit.',
    contextMeaning: 'Bed metrics give you instant visibility into Rajshahi hospital capacities. In emergencies, call the hotline before transit so the ICU or bed is pre-held.',
    actions: [
      'Direct emergency room phone numbers provided on each hospital card',
      'Real-time bed counts updated by participating clinics',
      'Verified ambulance dispatch coordination'
    ]
  },
  {
    id: 'medicines',
    num: '6',
    title: 'Medicine Information & Pharmacy Orders',
    icon: Pill,
    badge: 'Pharmacy Safety',
    summary: 'Prescription verification rules and authentic pharmaceuticals.',
    fullText: 'Pharmaceutical details including generic names, standard dosages, and therapeutic classifications are compiled from national formularies. Users should never self-medicate or alter drug dosages without consulting a licensed physician. Prescription-only medicines (POM) strictly require a valid prescription uploaded and verified by a licensed pharmacist before fulfillment.',
    contextMeaning: 'Prescription-only drugs require a verified doctor prescription before a pharmacy dispatches them. This ensures safe dosages and authentic pharmaceuticals.',
    actions: [
      '100% DGDA-compliant authentic medicine inventory',
      'Licensed pharmacist review for all prescription orders',
      'Automated allergy and conflict warnings'
    ]
  }
];

export default function MedicalDisclaimerPage() {
  const [expandedId, setExpandedId] = useState('platform-nature');

  return (
    <div style={{ maxWidth: '960px', margin: '0 auto', padding: '40px 20px 80px 20px', color: 'var(--color-text, #142422)' }}>
      {/* Breadcrumb */}
      <div style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: 'var(--color-text-muted, #47615f)' }}>
        <Link to="/" style={{ color: 'var(--color-primary, #0d7c6e)', textDecoration: 'none', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
          <ArrowLeft size={14} /> Home
        </Link>
        <span>/</span>
        <span>Medical Disclaimer</span>
      </div>

      {/* Header */}
      <div style={{ borderBottom: '1px solid var(--color-border, #e2eceb)', paddingBottom: '24px', marginBottom: '28px' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '4px 12px', borderRadius: '99px', background: 'var(--color-primary-50, #f0faf9)', color: 'var(--color-primary, #0d7c6e)', fontSize: '0.78rem', fontWeight: 700, marginBottom: '12px' }}>
          <ShieldCheck size={14} /> Clinical Governance & Patient Safety
        </div>
        <h1 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.4rem)', fontWeight: 900, margin: '0 0 10px 0', letterSpacing: '-0.02em', color: 'var(--color-text, #142422)' }}>
          Medical Disclaimer
        </h1>
        <p style={{ margin: 0, fontSize: '0.95rem', color: 'var(--color-text-secondary, #2f4847)' }}>
          Click any disclaimer clause below to view contextual safety guidelines, clinical boundaries, and emergency protocols.
        </p>
      </div>

      {/* Emergency Red Banner */}
      <div style={{
        background: '#fef2f2', border: '1.5px solid #fecaca', borderRadius: '14px',
        padding: '20px 24px', marginBottom: '28px', display: 'flex', gap: '16px', alignItems: 'flex-start'
      }}>
        <AlertTriangle size={26} style={{ color: '#dc2626', flexShrink: 0, marginTop: '2px' }} />
        <div>
          <h2 style={{ margin: '0 0 6px 0', fontSize: '1.05rem', fontWeight: 900, color: '#991b1b' }}>
            EMERGENCY MEDICAL NOTICE — CALL 999 IMMEDIATELY
          </h2>
          <p style={{ margin: 0, fontSize: '0.88rem', color: '#b91c1c', lineHeight: 1.6 }}>
            If you or someone in your care is experiencing severe chest pain, shortness of breath, sudden numbness, uncontrolled bleeding, poisoning, acute trauma, or any life-threatening condition, <strong>DO NOT wait for an online response.</strong> Call <strong>999</strong> immediately, contact the National Health Helpline at <strong>16263</strong>, or proceed at once to the Emergency Department of Rajshahi Medical College Hospital (RMCH).
          </p>
        </div>
      </div>

      {/* Quick Jump Buttons */}
      <div style={{ marginBottom: '24px' }}>
        <div style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--color-text-muted)', marginBottom: '8px' }}>
          Quick Jump by Safety Context:
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          {DISCLAIMER_SECTIONS.map(s => {
            const isSelected = expandedId === s.id;
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => setExpandedId(s.id)}
                style={{
                  padding: '6px 12px',
                  borderRadius: '99px',
                  border: isSelected ? '1.5px solid var(--color-primary)' : '1px solid var(--color-border)',
                  background: isSelected ? 'var(--color-primary-50)' : '#ffffff',
                  color: isSelected ? 'var(--color-primary)' : 'var(--color-text-secondary)',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '5px',
                  transition: 'all 0.15s ease'
                }}
              >
                <s.icon size={12} />
                {s.title}
              </button>
            );
          })}
        </div>
      </div>

      {/* Interactive Clauses List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {DISCLAIMER_SECTIONS.map(s => {
          const isOpen = expandedId === s.id;
          return (
            <div
              key={s.id}
              style={{
                borderRadius: '16px',
                border: isOpen ? '2px solid var(--color-primary, #0d7c6e)' : '1.5px solid var(--color-border, #e2eceb)',
                background: '#ffffff',
                boxShadow: isOpen ? '0 10px 30px rgba(13, 124, 110, 0.08)' : '0 2px 8px rgba(0,0,0,0.02)',
                transition: 'all 0.2s ease',
                overflow: 'hidden'
              }}
            >
              {/* Header Button */}
              <button
                type="button"
                onClick={() => setExpandedId(isOpen ? '' : s.id)}
                style={{
                  width: '100%',
                  padding: '18px 22px',
                  background: isOpen ? 'linear-gradient(135deg, rgba(13,124,110,0.04), #ffffff)' : 'none',
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  textAlign: 'left',
                  gap: '12px'
                }}
                aria-expanded={isOpen}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px', minWidth: 0 }}>
                  <div style={{
                    width: 36,
                    height: 36,
                    borderRadius: '10px',
                    background: isOpen ? 'var(--color-primary, #0d7c6e)' : 'var(--color-primary-50, #f0faf9)',
                    color: isOpen ? '#ffffff' : 'var(--color-primary, #0d7c6e)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    fontWeight: 900,
                    fontSize: '0.9rem'
                  }}>
                    {s.num}
                  </div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                      <h2 style={{
                        margin: 0,
                        fontSize: '1.05rem',
                        fontWeight: 800,
                        color: 'var(--color-text, #142422)'
                      }}>
                        {s.title}
                      </h2>
                      <span style={{
                        fontSize: '0.68rem',
                        fontWeight: 700,
                        padding: '2px 8px',
                        borderRadius: '99px',
                        background: 'var(--color-primary-50, #f0faf9)',
                        color: 'var(--color-primary, #0d7c6e)'
                      }}>
                        {s.badge}
                      </span>
                    </div>
                    <p style={{
                      margin: '4px 0 0 0',
                      fontSize: '0.8rem',
                      color: 'var(--color-text-secondary, #2f4847)',
                      lineHeight: 1.4
                    }}>
                      {s.summary}
                    </p>
                  </div>
                </div>

                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  color: 'var(--color-primary, #0d7c6e)',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  flexShrink: 0
                }}>
                  <span style={{ display: window.innerWidth <= 480 ? 'none' : 'inline' }}>
                    {isOpen ? 'Hide Details' : 'View Safety Context'}
                  </span>
                  <ChevronDown
                    size={18}
                    style={{
                      transform: isOpen ? 'rotate(180deg)' : 'none',
                      transition: 'transform 0.2s ease'
                    }}
                  />
                </div>
              </button>

              {/* Context Details */}
              {isOpen && (
                <div style={{
                  padding: '0 22px 22px 22px',
                  borderTop: '1px solid #f1f5f9',
                  background: '#ffffff',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '16px',
                  animation: 'fadeIn 0.2s ease-out'
                }}>
                  {/* Context Note */}
                  <div style={{
                    marginTop: '16px',
                    padding: '14px 16px',
                    borderRadius: '12px',
                    background: 'var(--color-primary-50, #f0faf9)',
                    border: '1px solid rgba(13,124,110,0.15)'
                  }}>
                    <div style={{
                      fontSize: '0.75rem',
                      fontWeight: 800,
                      color: 'var(--color-primary, #0d7c6e)',
                      textTransform: 'uppercase',
                      letterSpacing: '0.04em',
                      marginBottom: '4px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '5px'
                    }}>
                      <HelpCircle size={14} /> What this means for your care (চিকিৎসাগত অর্থ)
                    </div>
                    <p style={{ margin: 0, fontSize: '0.88rem', color: '#134e4a', lineHeight: 1.6 }}>
                      {s.contextMeaning}
                    </p>
                  </div>

                  {/* Policy Clause */}
                  <div>
                    <div style={{ fontSize: '0.78rem', fontWeight: 800, color: 'var(--color-text-muted)', marginBottom: '6px', textTransform: 'uppercase' }}>
                      Clinical Notice Text:
                    </div>
                    <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--color-text-secondary)', lineHeight: 1.7 }}>
                      {s.fullText}
                    </p>
                  </div>

                  {/* Safety Guidance */}
                  <div style={{
                    background: '#f8fafc',
                    padding: '12px 16px',
                    borderRadius: '10px',
                    border: '1px solid #e2e8f0'
                  }}>
                    <div style={{ fontSize: '0.78rem', fontWeight: 800, color: '#334155', marginBottom: '8px' }}>
                      Patient Safety & Verification Protocols:
                    </div>
                    <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '0.82rem', color: '#475569', lineHeight: 1.6 }}>
                      {s.actions.map((act, i) => (
                        <li key={i}>{act}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Footer Navigation */}
      <div style={{ marginTop: '48px', paddingTop: '24px', borderTop: '1px solid var(--color-border, #e2eceb)', display: 'flex', gap: '20px', flexWrap: 'wrap', fontSize: '0.85rem' }}>
        <Link to="/terms" style={{ color: 'var(--color-primary, #0d7c6e)', textDecoration: 'none', fontWeight: 600 }}>Terms of Service</Link>
        <Link to="/privacy" style={{ color: 'var(--color-primary, #0d7c6e)', textDecoration: 'none', fontWeight: 600 }}>Privacy Policy</Link>
        <Link to="/cookie-policy" style={{ color: 'var(--color-primary, #0d7c6e)', textDecoration: 'none', fontWeight: 600 }}>Cookie Policy</Link>
        <Link to="/contact" style={{ color: 'var(--color-primary, #0d7c6e)', textDecoration: 'none', fontWeight: 600 }}>Contact Support</Link>
      </div>
    </div>
  );
}
