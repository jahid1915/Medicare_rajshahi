import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Shield, FileText, CheckCircle2, AlertTriangle, ArrowLeft,
  ChevronDown, HelpCircle, Lock, Calendar, CreditCard, Sparkles, Building2
} from 'lucide-react';

const TERMS_SECTIONS = [
  {
    id: 'acceptance',
    num: '1',
    title: 'Acceptance of Terms',
    icon: CheckCircle2,
    badge: 'Core Agreement',
    summary: 'Binding agreement upon accessing Niramoy digital healthcare services.',
    fullText: 'By accessing or using the Niramoy platform, web application, API services, or digital healthcare tools ("Services"), you acknowledge that you have read, understood, and agree to be bound by these Terms of Service. If you do not agree to these terms, you must discontinue using Niramoy immediately.',
    contextMeaning: 'Whenever you search doctors, book appointments, check pharmacy stocks, or log into Niramoy, this agreement protects both your patient rights and system integrity.',
    protections: [
      'Universal access to verified healthcare directory without subscription fees',
      'Right to request account deletion and medical record portability',
      'Explicit consent required before sharing clinical notes with other doctors'
    ]
  },
  {
    id: 'platform-role',
    num: '2',
    title: 'Platform Role & Scope of Services',
    icon: Building2,
    badge: 'Intermediary Status',
    summary: 'Niramoy connects you with verified providers; clinical care is delivered independently.',
    fullText: 'Niramoy operates as an integrated healthcare technology ecosystem in Bangladesh, connecting patients with BMDC-verified physicians, licensed hospitals, registered pharmacies, diagnostic centers, and ambulance operators. Healthcare professionals and institutions are independent service providers solely responsible for their clinical evaluations, diagnoses, and treatments.',
    contextMeaning: 'Niramoy is your digital bridge to verified healthcare in Rajshahi. We ensure you get authentic information and easy serial booking, while clinical decisions remain strictly between you and your licensed doctor.',
    protections: [
      '100% BMDC registration verification for listed doctors',
      'Direct contact numbers and chamber addresses verified on-site',
      'Independent diagnostic reporting with no algorithmic alterations'
    ]
  },
  {
    id: 'account-security',
    num: '3',
    title: 'Account Registration & Security',
    icon: Lock,
    badge: 'Authentication',
    summary: 'Passwordless SMS OTP authentication and account confidentiality.',
    fullText: 'When registering on Niramoy, you agree to provide authentic, accurate, and current information. Patient accounts are authenticated via verified Bangladeshi mobile numbers and one-time passcodes (OTP). You are responsible for maintaining the confidentiality of your credentials and all activities occurring under your account.',
    contextMeaning: 'No complicated passwords to remember. Your verified 11-digit mobile phone is your identity key. Each login generates a secure 6-digit cryptographic OTP valid for 5 minutes.',
    protections: [
      'Zero plaintext storage of SMS verification codes',
      'Rate-limiting and brute-force protection with automatic lockouts',
      'Instant session termination across devices upon password/profile reset'
    ]
  },
  {
    id: 'appointments',
    num: '4',
    title: 'Appointment Bookings & Slot Holds',
    icon: Calendar,
    badge: 'Zero-Trust Booking',
    summary: '15-minute slot reservation locks and serial attendance policies.',
    fullText: 'When you select a doctor consultation slot, Niramoy places a temporary 15-minute slot hold to prevent double-booking. Confirmed appointments require complete payment verification or chamber confirmation. Failure to attend a scheduled appointment without prior cancellation may be logged as a missed visit.',
    contextMeaning: 'When you find an open slot with a specialist, that slot is reserved exclusively for you for 15 minutes. No other patient can grab it while you fill in your details or complete payment.',
    protections: [
      'Guaranteed serial hold during checkout',
      'Automated SMS voucher and printable PDF appointment confirmation',
      'Rescheduling allowed up to 4 hours before the consultation slot'
    ]
  },
  {
    id: 'payments',
    num: '5',
    title: 'Payment Processing & SSLCOMMERZ',
    icon: CreditCard,
    badge: 'Secure Checkout',
    summary: 'Bank-grade encrypted gateway processing and zero-fee transparency.',
    fullText: 'Online payments are processed securely through certified gateway partners, including SSLCOMMERZ. Consultation fees and medicine prices are determined directly by participating healthcare providers. Niramoy does not store raw credit card numbers or banking passwords. All transactions generate a unique serial confirmation code (e.g., NRM-YYYY-MMDD-XXXX).',
    contextMeaning: 'You can pay via bKash, Nagad, Rocket, or local debit/credit cards. Fees are set directly by clinics and doctors with zero hidden surcharges from Niramoy.',
    protections: [
      '256-bit SSL encrypted bank gateway integration',
      'Instant digital transaction receipt sent via email and SMS',
      'Automated refund protocol for cancelled sessions'
    ]
  },
  {
    id: 'prescriptions',
    num: '6',
    title: 'Prescriptions & Medicine Orders',
    icon: Shield,
    badge: 'Pharmacy Regulations',
    summary: 'Strict dispensing rules for prescription drugs and authentic inventory.',
    fullText: 'Prescription-only medications require a valid, verified digital prescription issued by a registered medical practitioner. Participating pharmacies reserve the right to verify prescriptions before dispatch. Orders may be declined if stock is unavailable or the prescription cannot be verified.',
    contextMeaning: 'Antibiotics and controlled medicines will only be delivered if you have a valid doctor prescription. This prevents counterfeit drug distribution and protects public health in Rajshahi.',
    protections: [
      'Only licensed retail pharmacies are permitted to fulfill orders',
      'Manufacturer batch tracking with expiration date audits',
      'Cold-chain storage compliance for insulin and biologicals'
    ]
  },
  {
    id: 'ai-tools',
    num: '7',
    title: 'AI Decision Support Tools',
    icon: Sparkles,
    badge: 'Clinical AI Advisory',
    summary: 'Guidance tools for informational triage, not substitute diagnosis.',
    fullText: 'Niramoy AI and health navigation assistants provide informational triage based on clinical guidelines. AI recommendations are intended as decision support tools and do not constitute definitive medical diagnosis, prescription issuance, or treatment plans.',
    contextMeaning: 'Our AI tools help you understand complex lab reports and navigate to the right specialty. However, always follow the recommendations of your licensed doctor.',
    protections: [
      'Plain-language explanations of medical abbreviations',
      'Clear medical disclaimers on every AI interaction',
      'Zero algorithmic prescription generation'
    ]
  },
  {
    id: 'liability',
    num: '8',
    title: 'Limitation of Liability',
    icon: AlertTriangle,
    badge: 'Legal Protections',
    summary: 'Limits of intermediary technology responsibility under Bangladeshi law.',
    fullText: 'To the maximum extent permitted by applicable law in Bangladesh, Niramoy shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising out of your access to or inability to use the platform or the clinical decisions made by independent medical practitioners.',
    contextMeaning: 'Niramoy is committed to 99.9% uptime and reliable data. However, medical decisions and chamber facilities operate independently under their respective licenses.',
    protections: [
      'Compliance with Bangladesh ICT Act 2006 & Digital Security Act 2018',
      'Consumer rights protection for all verified digital payments',
      'Direct dispute resolution desk at Laxmipur, Rajshahi'
    ]
  }
];

export default function TermsPage() {
  const [expandedId, setExpandedId] = useState('acceptance');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredSections = TERMS_SECTIONS.filter(s =>
    s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.fullText.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div style={{ maxWidth: '960px', margin: '0 auto', padding: '40px 20px 80px 20px', color: 'var(--color-text, #142422)' }}>
      {/* Breadcrumb */}
      <div style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: 'var(--color-text-muted, #47615f)' }}>
        <Link to="/" style={{ color: 'var(--color-primary, #0d7c6e)', textDecoration: 'none', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
          <ArrowLeft size={14} /> Home
        </Link>
        <span>/</span>
        <span>Terms of Service</span>
      </div>

      {/* Header */}
      <div style={{ borderBottom: '1px solid var(--color-border, #e2eceb)', paddingBottom: '24px', marginBottom: '28px' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '4px 12px', borderRadius: '99px', background: 'var(--color-primary-50, #f0faf9)', color: 'var(--color-primary, #0d7c6e)', fontSize: '0.78rem', fontWeight: 700, marginBottom: '12px' }}>
          <Shield size={14} /> Interactive Legal & Compliance
        </div>
        <h1 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.4rem)', fontWeight: 900, margin: '0 0 10px 0', letterSpacing: '-0.02em', color: 'var(--color-text, #142422)' }}>
          Terms of Service & User Conditions
        </h1>
        <p style={{ margin: 0, fontSize: '0.95rem', color: 'var(--color-text-secondary, #2f4847)' }}>
          Click any term or condition below to view contextual guidance, patient protections, and legal clauses.
        </p>
      </div>

      {/* Critical Medical Notice */}
      <div style={{
        background: '#fffbeb', border: '1.5px solid #fde68a', borderRadius: '12px',
        padding: '16px 20px', marginBottom: '28px', display: 'flex', gap: '14px', alignItems: 'flex-start'
      }}>
        <AlertTriangle size={22} style={{ color: '#d97706', flexShrink: 0, marginTop: '2px' }} />
        <div style={{ fontSize: '0.88rem', color: '#92400e', lineHeight: 1.6 }}>
          <strong>Critical Healthcare Notice:</strong> Niramoy is a digital healthcare coordination platform. Niramoy does not practice medicine or directly provide clinical diagnosis. In any life-threatening emergency, call <strong>999</strong> immediately or visit the nearest hospital emergency room.
        </div>
      </div>

      {/* Quick Context Filter Pills */}
      <div style={{ marginBottom: '24px' }}>
        <div style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--color-text-muted)', marginBottom: '8px' }}>
          Quick Jump by Topic:
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          {TERMS_SECTIONS.map(s => {
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
        {filteredSections.map(s => {
          const isOpen = expandedId === s.id;
          return (
            <div
              key={s.id}
              id={`term-${s.id}`}
              style={{
                borderRadius: '16px',
                border: isOpen ? '2px solid var(--color-primary, #0d7c6e)' : '1.5px solid var(--color-border, #e2eceb)',
                background: '#ffffff',
                boxShadow: isOpen ? '0 10px 30px rgba(13, 124, 110, 0.08)' : '0 2px 8px rgba(0,0,0,0.02)',
                transition: 'all 0.2s ease',
                overflow: 'hidden'
              }}
            >
              {/* Clickable Header Button */}
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
                    {isOpen ? 'Hide Details' : 'View Context'}
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

              {/* Expandable Contextual Details */}
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
                  {/* Context Explanation */}
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
                      <HelpCircle size={14} /> What this means for you (ব্যবহারিক অর্থ)
                    </div>
                    <p style={{ margin: 0, fontSize: '0.88rem', color: '#134e4a', lineHeight: 1.6 }}>
                      {s.contextMeaning}
                    </p>
                  </div>

                  {/* Official Legal Clause */}
                  <div>
                    <div style={{ fontSize: '0.78rem', fontWeight: 800, color: 'var(--color-text-muted)', marginBottom: '6px', textTransform: 'uppercase' }}>
                      Official Policy Clause:
                    </div>
                    <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--color-text-secondary)', lineHeight: 1.7 }}>
                      {s.fullText}
                    </p>
                  </div>

                  {/* Patient Protections */}
                  <div style={{
                    background: '#f8fafc',
                    padding: '12px 16px',
                    borderRadius: '10px',
                    border: '1px solid #e2e8f0'
                  }}>
                    <div style={{ fontSize: '0.78rem', fontWeight: 800, color: '#334155', marginBottom: '8px' }}>
                      Key Patient Rights & Protections:
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

      {/* Support & Contact Footer */}
      <div style={{
        marginTop: '48px',
        padding: '24px',
        borderRadius: '16px',
        background: '#f8fafc',
        border: '1.5px solid var(--color-border)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '16px'
      }}>
        <div>
          <h3 style={{ margin: '0 0 4px 0', fontSize: '1.05rem', fontWeight: 800, color: 'var(--color-text)' }}>
            Have a question about these terms?
          </h3>
          <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
            Our compliance desk in Laxmipur, Rajshahi is available for user questions.
          </p>
        </div>
        <Link to="/contact" className="btn btn-primary" style={{ textDecoration: 'none' }}>
          Contact Legal Desk
        </Link>
      </div>
    </div>
  );
}

