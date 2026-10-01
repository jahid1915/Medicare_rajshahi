import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Lock, Shield, ArrowLeft, CheckCircle, ChevronDown,
  HelpCircle, UserCheck, Key, Database, Sparkles, Building2
} from 'lucide-react';

const PRIVACY_SECTIONS = [
  {
    id: 'info-collection',
    num: '1',
    title: 'Information We Collect',
    icon: Database,
    badge: 'Data Collection',
    summary: 'Only information required for safe, personalized healthcare coordination.',
    fullText: 'We collect account data (verified mobile number, name, authentication tokens), clinical profile data (blood group, date of birth, gender, allergies, pre-existing conditions), service records (consultations, digital prescriptions, test orders), and technical audit logs used solely for security auditing and spam mitigation.',
    contextMeaning: 'We only ask for details that help doctors treat you accurately and pharmacies dispense genuine medicines. We never collect data for advertiser tracking.',
    protections: [
      'No tracking cookies or commercial ad trackers',
      'Clinical profile data is voluntary and editable anytime',
      'Encrypted mobile number authentication'
    ]
  },
  {
    id: 'data-use',
    num: '2',
    title: 'How We Use Your Data',
    icon: UserCheck,
    badge: 'Purpose Limitation',
    summary: 'Your information is used strictly for legitimate healthcare workflows.',
    fullText: 'Your information is processed for scheduling appointments with verified physicians, generating SMS and PDF appointment vouchers, enabling authorized doctors to review clinical history during consultations, matching prescriptions with licensed pharmacies, processing payments via SSLCOMMERZ, and maintaining audit trails.',
    contextMeaning: 'Your data is only used to fulfill your requested medical services. It is never sold, rented, or shared with commercial marketing agencies.',
    protections: [
      'Zero commercial marketing resale',
      'Automated SMS vouchers delivered directly to your verified phone',
      'Tamper-evident audit trails for doctor note accesses'
    ]
  },
  {
    id: 'zero-trust',
    num: '3',
    title: 'Zero-Trust Healthcare Authorization',
    icon: Lock,
    badge: 'Multi-Tenant Isolation',
    summary: 'Cryptographic separation between patients, doctors, and pharmacy records.',
    fullText: 'Niramoy implements strict server-side authorization: Patient A can never view or modify appointments, prescriptions, or files belonging to Patient B. Doctors can only access clinical records for patients with active scheduled consultations. Pharmacies only see orders placed with their store.',
    contextMeaning: 'Your medical history is completely isolated. Even if someone tries to tamper with page URLs or IDs, server-side zero-trust checks block unauthorized access.',
    protections: [
      'Strict multi-tenant database isolation verified by automated test suites',
      'Zero OTP leakage in API responses (hashed with SHA-256)',
      'Role-based permissions for doctors, pharmacists, and hospital admins'
    ]
  },
  {
    id: 'ai-privacy',
    num: '4',
    title: 'Artificial Intelligence & Third-Party Services',
    icon: Sparkles,
    badge: 'AI Confidentiality',
    summary: 'Localized clinical triage without transmitting records to public LLMs.',
    fullText: 'When utilizing Niramoy AI health triage tools, your queries are processed locally within regional decision-support engines. Sensitive medical records are not transmitted to foreign commercial AI services for model training without explicit written consent.',
    contextMeaning: 'Your health questions and symptom checks remain private. They are never fed into public AI models or used to train commercial language models.',
    protections: [
      'De-identified clinical query processing',
      'No data harvesting for foreign AI training sets',
      'Explicit opt-in required for research datasets'
    ]
  },
  {
    id: 'retention-rights',
    num: '5',
    title: 'Data Retention & Patient Rights',
    icon: Key,
    badge: 'Patient Control',
    summary: 'Your rights to export, download, update, or delete your health records.',
    fullText: 'You retain the right to review your stored clinical profile, download appointment vouchers and prescriptions in high-resolution PDF format, update your emergency contacts, or request complete account deactivation at any time via your patient dashboard.',
    contextMeaning: 'You own your medical data. You can download all your prescriptions, change emergency contacts, or delete your account whenever you want.',
    protections: [
      'One-click high-resolution PDF download for all prescriptions',
      'Instant profile update and contact correction tools',
      'Right to be forgotten upon account termination'
    ]
  }
];

export default function PrivacyPolicyPage() {
  const [expandedId, setExpandedId] = useState('info-collection');

  return (
    <div style={{ maxWidth: '960px', margin: '0 auto', padding: '40px 20px 80px 20px', color: 'var(--color-text, #142422)' }}>
      {/* Breadcrumb */}
      <div style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: 'var(--color-text-muted, #47615f)' }}>
        <Link to="/" style={{ color: 'var(--color-primary, #0d7c6e)', textDecoration: 'none', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
          <ArrowLeft size={14} /> Home
        </Link>
        <span>/</span>
        <span>Privacy Policy</span>
      </div>

      {/* Header */}
      <div style={{ borderBottom: '1px solid var(--color-border, #e2eceb)', paddingBottom: '24px', marginBottom: '28px' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '4px 12px', borderRadius: '99px', background: 'var(--color-primary-50, #f0faf9)', color: 'var(--color-primary, #0d7c6e)', fontSize: '0.78rem', fontWeight: 700, marginBottom: '12px' }}>
          <Lock size={14} /> Data Protection & Patient Privacy
        </div>
        <h1 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.4rem)', fontWeight: 900, margin: '0 0 10px 0', letterSpacing: '-0.02em', color: 'var(--color-text, #142422)' }}>
          Privacy Policy
        </h1>
        <p style={{ margin: 0, fontSize: '0.95rem', color: 'var(--color-text-secondary, #2f4847)' }}>
          Click any policy section below to explore contextual data protections, isolation rules, and patient rights.
        </p>
      </div>

      {/* Commitment Highlight Box */}
      <div style={{
        background: 'var(--color-primary-50, #f0faf9)', border: '1.5px solid var(--color-primary-100, #ccf0ec)',
        borderRadius: '14px', padding: '20px 24px', marginBottom: '28px'
      }}>
        <h3 style={{ margin: '0 0 8px 0', fontSize: '1.05rem', fontWeight: 800, color: 'var(--color-primary-dark, #0a6559)' }}>
          Our Patient Privacy Commitment
        </h3>
        <p style={{ margin: 0, fontSize: '0.88rem', color: 'var(--color-text-secondary, #2f4847)', lineHeight: 1.6 }}>
          Niramoy treats your health records with strict confidentiality. Your medical history, doctor prescriptions, diagnostic reports, and emergency data are protected by multi-tenant role-based access controls and are never sold or shared with commercial marketing agencies.
        </p>
      </div>

      {/* Quick Jump Buttons */}
      <div style={{ marginBottom: '24px' }}>
        <div style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--color-text-muted)', marginBottom: '8px' }}>
          Quick Jump by Privacy Context:
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          {PRIVACY_SECTIONS.map(s => {
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

      {/* Interactive Sections List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {PRIVACY_SECTIONS.map(s => {
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
                    {isOpen ? 'Hide Details' : 'View Privacy Context'}
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
                      <HelpCircle size={14} /> What this means for your privacy (গোপনীয়তার অর্থ)
                    </div>
                    <p style={{ margin: 0, fontSize: '0.88rem', color: '#134e4a', lineHeight: 1.6 }}>
                      {s.contextMeaning}
                    </p>
                  </div>

                  {/* Policy Clause */}
                  <div>
                    <div style={{ fontSize: '0.78rem', fontWeight: 800, color: 'var(--color-text-muted)', marginBottom: '6px', textTransform: 'uppercase' }}>
                      Official Policy Clause:
                    </div>
                    <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--color-text-secondary)', lineHeight: 1.7 }}>
                      {s.fullText}
                    </p>
                  </div>

                  {/* Safeguards */}
                  <div style={{
                    background: '#f8fafc',
                    padding: '12px 16px',
                    borderRadius: '10px',
                    border: '1px solid #e2e8f0'
                  }}>
                    <div style={{ fontSize: '0.78rem', fontWeight: 800, color: '#334155', marginBottom: '8px' }}>
                      Data Protection Standards:
                    </div>
                    <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '0.82rem', color: '#475569', lineHeight: 1.6 }}>
                      {s.protections.map((p, i) => (
                        <li key={i}>{p}</li>
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
        <Link to="/disclaimer" style={{ color: 'var(--color-primary, #0d7c6e)', textDecoration: 'none', fontWeight: 600 }}>Medical Disclaimer</Link>
        <Link to="/cookie-policy" style={{ color: 'var(--color-primary, #0d7c6e)', textDecoration: 'none', fontWeight: 600 }}>Cookie Policy</Link>
        <Link to="/contact" style={{ color: 'var(--color-primary, #0d7c6e)', textDecoration: 'none', fontWeight: 600 }}>Contact Data Protection Officer</Link>
      </div>
    </div>
  );
}
