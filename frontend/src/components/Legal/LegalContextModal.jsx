import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  X, Shield, FileText, Lock, AlertTriangle, CheckCircle2,
  Calendar, Clock, ExternalLink, HelpCircle, PhoneCall
} from 'lucide-react';

export const LEGAL_TOPICS = {
  terms: {
    id: 'terms',
    title: 'Terms of Service',
    badge: 'Platform Agreement',
    icon: FileText,
    color: '#0d7c6e',
    summary: 'Rules and conditions governing the use of Niramoy digital healthcare services.',
    pageUrl: '/terms',
    sections: [
      {
        heading: '1. Acceptance & Purpose',
        text: 'By using Niramoy, you agree to access verified healthcare coordination tools in Rajshahi. Niramoy acts as a technology intermediary connecting patients with independent, BMDC-registered medical practitioners and licensed health facilities.',
        highlight: 'Niramoy connects you with licensed doctors but does not independently practice medicine.'
      },
      {
        heading: '2. Zero-Trust Account Security',
        text: 'Patient accounts are authenticated using secure 6-digit SMS OTPs sent to your mobile phone. OTPs are never stored in plain text and expire in 5 minutes. Never share verification codes with anyone.',
        highlight: 'Your phone number is your secure credential. Niramoy staff will never ask for your OTP.'
      },
      {
        heading: '3. Appointment Slots & 15-Minute Hold',
        text: 'When selecting an appointment slot, Niramoy locks that slot for 15 minutes to prevent double-booking while you review details or process payment. If unconfirmed within 15 minutes, the slot is released to other patients.',
        highlight: '15-minute slot hold guarantees no double booking while completing your reservation.'
      },
      {
        heading: '4. Independent Professional Responsibility',
        text: 'All participating doctors, hospitals, pharmacies, and ambulance operators are independent professionals. Attending physicians retain sole responsibility for clinical diagnosis, prescriptions, and medical treatment.',
        highlight: 'Clinical decisions are made solely by certified doctors, not algorithmic engines.'
      }
    ]
  },
  privacy: {
    id: 'privacy',
    title: 'Privacy Policy',
    badge: 'Confidentiality & Data Protection',
    icon: Lock,
    color: '#0284c7',
    summary: 'How your health records, consultation histories, and phone numbers are safeguarded.',
    pageUrl: '/privacy',
    sections: [
      {
        heading: '1. Multi-Tenant Role Isolation',
        text: 'Your health records, appointments, and prescriptions are strictly isolated in our database. Other patients or unauthorized staff cannot query, view, or alter your medical timeline.',
        highlight: 'Zero cross-tenant data leakage. Only you and your chosen doctor can view your active records.'
      },
      {
        heading: '2. What Data We Store',
        text: 'We store your verified mobile number, appointment history, doctor consultation notes, issued digital prescriptions, and emergency contact details if voluntarily provided.',
        highlight: 'We never sell or distribute your contact details to third-party commercial advertisers.'
      },
      {
        heading: '3. End-to-End Encryption',
        text: 'All communications between your browser or phone and Niramoy are secured using 256-bit TLS encryption. Sensitive credentials are cryptographic hashes.',
        highlight: 'All session tokens and verification codes are protected with zero-trust encryption.'
      }
    ]
  },
  disclaimer: {
    id: 'disclaimer',
    title: 'Medical Disclaimer',
    badge: 'Clinical Notice',
    icon: AlertTriangle,
    color: '#d97706',
    summary: 'Important guidelines on non-emergency use, emergency hotlines, and medical advice.',
    pageUrl: '/disclaimer',
    sections: [
      {
        heading: '1. Not an Emergency Dispatch Service',
        text: 'Niramoy is not a direct emergency medical dispatch operator. In the event of chest pain, severe bleeding, trauma, or acute breathing difficulty, call 999 or proceed immediately to the nearest hospital emergency room (e.g. Rajshahi Medical College Hospital).',
        highlight: '🚨 In acute life-threatening situations, immediately call 999 or visit the ER.'
      },
      {
        heading: '2. Informational Decision Support Only',
        text: 'Content, health tips, and AI symptom summaries on Niramoy are intended for patient education and clinical navigation. They do not substitute for in-person physician examination.',
        highlight: 'Always consult your attending doctor before starting or changing medications.'
      }
    ]
  },
  cancellation: {
    id: 'cancellation',
    title: 'Appointment & Cancellation Terms',
    badge: 'Booking Guidelines',
    icon: Calendar,
    color: '#7c3aed',
    summary: 'Policies regarding rescheduling, serial cancellations, and chamber check-ins.',
    pageUrl: '/terms',
    sections: [
      {
        heading: '1. Rescheduling Guidelines',
        text: 'Patients may reschedule appointment slots up to 4 hours before the scheduled chamber session from the Patient Dashboard, subject to doctor branch availability.',
        highlight: 'Free online rescheduling up to 4 hours prior to the appointment slot.'
      },
      {
        heading: '2. Chamber Serial Queue Attendance',
        text: 'Please arrive at the chamber 15 minutes before your estimated time window. Chamber queues may experience minor delays depending on emergency patient care.',
        highlight: 'Present your Niramoy Digital PDF voucher or SMS serial number at the reception desk.'
      }
    ]
  },
  prescription: {
    id: 'prescription',
    title: 'Pharmacy & Prescription Terms',
    badge: 'Medicine Dispensing',
    icon: Shield,
    color: '#059669',
    summary: 'Regulations on prescription medicines, license verification, and safe dispensing.',
    pageUrl: '/terms',
    sections: [
      {
        heading: '1. Prescription Verification',
        text: 'Antibiotics, narcotics, and controlled prescription medications require a verified digital prescription issued by a registered medical practitioner.',
        highlight: 'Licensed retail pharmacies will verify doctor credentials prior to fulfillment.'
      },
      {
        heading: '2. Expiry & Authentic Stock',
        text: 'All participating pharmacies in Rajshahi must dispense unexpired, DGDA-registered authentic pharmaceuticals stored under manufacturer-specified conditions.',
        highlight: '100% authentic medicine guarantee with digital batch and expiry tracking.'
      }
    ]
  }
};

export default function LegalContextModal({
  isOpen,
  onClose,
  initialTopic = 'terms'
}) {
  const [activeTopic, setActiveTopic] = useState(initialTopic);

  useEffect(() => {
    if (initialTopic && LEGAL_TOPICS[initialTopic]) {
      setActiveTopic(initialTopic);
    }
  }, [initialTopic]);

  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === 'Escape' && isOpen) onClose();
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const current = LEGAL_TOPICS[activeTopic] || LEGAL_TOPICS.terms;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        background: 'rgba(15, 23, 42, 0.75)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px'
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: '#ffffff',
          borderRadius: '20px',
          width: '100%',
          maxWidth: '680px',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          boxShadow: '0 25px 60px rgba(0,0,0,0.3)',
          border: '1.5px solid var(--color-border, #e2eceb)',
          animation: 'fadeIn 0.2s ease-out'
        }}
        onClick={e => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="legal-modal-title"
      >
        {/* Header */}
        <div style={{
          padding: '18px 22px',
          borderBottom: '1px solid #f1f5f9',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'linear-gradient(135deg, rgba(13,124,110,0.06), #ffffff)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: 38,
              height: 38,
              borderRadius: '10px',
              background: 'var(--color-primary-50, #f0faf9)',
              color: current.color,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <current.icon size={20} />
            </div>
            <div>
              <div style={{
                fontSize: '0.68rem',
                fontWeight: 800,
                color: current.color,
                textTransform: 'uppercase',
                letterSpacing: '0.04em'
              }}>
                {current.badge}
              </div>
              <h2 id="legal-modal-title" style={{
                fontSize: '1.15rem',
                fontWeight: 900,
                color: 'var(--color-text, #0f172a)',
                margin: 0
              }}>
                {current.title}
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            style={{
              background: '#f1f5f9',
              border: 'none',
              width: 32,
              height: 32,
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: '#64748b'
            }}
            aria-label="Close dialog"
          >
            <X size={18} />
          </button>
        </div>

        {/* Topic Pills */}
        <div style={{
          display: 'flex',
          gap: '6px',
          padding: '10px 18px',
          background: '#f8fafc',
          borderBottom: '1px solid #e2e8f0',
          overflowX: 'auto',
          whiteSpace: 'nowrap',
          scrollbarWidth: 'none'
        }}>
          {Object.values(LEGAL_TOPICS).map(t => {
            const isActive = activeTopic === t.id;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => setActiveTopic(t.id)}
                style={{
                  padding: '6px 12px',
                  borderRadius: '99px',
                  border: isActive ? `1.5px solid ${t.color}` : '1.5px solid transparent',
                  background: isActive ? '#ffffff' : 'transparent',
                  color: isActive ? t.color : '#64748b',
                  fontSize: '0.74rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '5px',
                  transition: 'all 0.15s ease'
                }}
              >
                <t.icon size={12} />
                {t.title}
              </button>
            );
          })}
        </div>

        {/* Content Body */}
        <div style={{
          padding: '20px 22px',
          overflowY: 'auto',
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          gap: '16px'
        }}>
          <div style={{
            fontSize: '0.85rem',
            color: '#475569',
            lineHeight: 1.6,
            background: 'rgba(13,124,110,0.04)',
            padding: '12px 14px',
            borderRadius: '10px',
            border: '1px solid rgba(13,124,110,0.12)'
          }}>
            <strong>Context Summary:</strong> {current.summary}
          </div>

          {current.sections.map((sec, idx) => (
            <div
              key={idx}
              style={{
                borderRadius: '12px',
                border: '1px solid #e2e8f0',
                padding: '14px 16px',
                background: '#ffffff'
              }}
            >
              <h4 style={{
                margin: '0 0 6px 0',
                fontSize: '0.92rem',
                fontWeight: 800,
                color: '#0f172a'
              }}>
                {sec.heading}
              </h4>
              <p style={{
                margin: '0 0 8px 0',
                fontSize: '0.82rem',
                color: '#334155',
                lineHeight: 1.6
              }}>
                {sec.text}
              </p>
              {sec.highlight && (
                <div style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '6px',
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  color: current.color,
                  background: 'rgba(13,124,110,0.06)',
                  padding: '6px 10px',
                  borderRadius: '6px'
                }}>
                  <CheckCircle2 size={13} style={{ flexShrink: 0, marginTop: '2px' }} />
                  <span>{sec.highlight}</span>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Footer */}
        <div style={{
          padding: '14px 22px',
          borderTop: '1px solid #f1f5f9',
          background: '#f8fafc',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '12px',
          flexWrap: 'wrap'
        }}>
          <Link
            to={current.pageUrl}
            onClick={onClose}
            style={{
              fontSize: '0.8rem',
              fontWeight: 700,
              color: 'var(--color-primary, #0d7c6e)',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              textDecoration: 'none'
            }}
          >
            Read Full Documentation Page <ExternalLink size={13} />
          </Link>

          <button
            type="button"
            onClick={onClose}
            style={{
              padding: '8px 20px',
              borderRadius: '8px',
              border: 'none',
              background: 'var(--color-primary, #0d7c6e)',
              color: '#ffffff',
              fontSize: '0.82rem',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            I Understand / বুঝেছি
          </button>
        </div>
      </div>
    </div>
  );
}
