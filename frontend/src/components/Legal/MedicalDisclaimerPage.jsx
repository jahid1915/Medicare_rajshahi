import React from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, ShieldCheck, Stethoscope, PhoneCall, ArrowLeft, HeartPulse, FileText } from 'lucide-react';

export default function MedicalDisclaimerPage() {
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
      <div style={{ borderBottom: '1px solid var(--color-border, #e2eceb)', paddingBottom: '24px', marginBottom: '36px' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '4px 12px', borderRadius: '99px', background: 'var(--color-primary-50, #f0faf9)', color: 'var(--color-primary, #0d7c6e)', fontSize: '0.78rem', fontWeight: 700, marginBottom: '12px' }}>
          <ShieldCheck size={14} /> Clinical & Safety Disclosures
        </div>
        <h1 style={{ fontSize: '2.2rem', fontWeight: 900, margin: '0 0 10px 0', letterSpacing: '-0.02em', color: 'var(--color-text, #142422)' }}>
          Medical Disclaimer
        </h1>
        <p style={{ margin: 0, fontSize: '0.95rem', color: 'var(--color-text-secondary, #2f4847)' }}>
          Official Medical & Health Information Notice • Effective Date: October 1, 2026
        </p>
      </div>

      {/* Critical Emergency Banner */}
      <div style={{
        background: '#fef2f2', border: '1.5px solid #fecaca', borderRadius: '14px',
        padding: '20px 24px', marginBottom: '36px', display: 'flex', gap: '16px', alignItems: 'flex-start'
      }}>
        <AlertTriangle size={26} style={{ color: '#dc2626', flexShrink: 0, marginTop: '2px' }} />
        <div>
          <h2 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#991b1b', margin: '0 0 6px 0' }}>
            Emergency Medical Situations
          </h2>
          <p style={{ margin: 0, fontSize: '0.9rem', color: '#b91c1c', lineHeight: 1.6 }}>
            If you or someone in your care is experiencing severe chest pain, shortness of breath, sudden numbness, uncontrolled bleeding, poisoning, acute trauma, or any life-threatening condition, <strong>DO NOT use this website or wait for an online response.</strong> Call <strong>999</strong> immediately, contact the National Health Helpline at <strong>16263</strong>, or proceed at once to the Emergency Department of Rajshahi Medical College Hospital (RMCH) or your nearest medical center.
          </p>
        </div>
      </div>

      {/* Main Content Sections */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '28px', fontSize: '0.92rem', lineHeight: 1.7, color: 'var(--color-text-secondary, #2f4847)' }}>
        <section>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--color-text, #142422)', marginBottom: '10px' }}>
            1. Nature of the Niramoy Platform
          </h2>
          <p>
            Niramoy is a healthcare technology platform designed to streamline doctor discovery, hospital bed resource monitoring, pharmacy catalog lookup, and clinical appointment scheduling across Rajshahi and Bangladesh. 
          </p>
          <p>
            <strong>Niramoy is not a hospital, medical clinic, or healthcare provider organization.</strong> Niramoy does not employ medical practitioners to practice medicine on its behalf, nor does the platform establish a physician-patient relationship simply by your use of the website or mobile application. Any doctor-patient relationship is formed directly and exclusively between you and the independent, registered physician you choose to consult.
          </p>
        </section>

        <section>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--color-text, #142422)', marginBottom: '10px' }}>
            2. General Informational & Educational Content
          </h2>
          <p>
            All health tips, medical articles, educational summaries, drug database descriptions, and wellness materials published on Niramoy are provided for general educational and informational purposes only. Such materials:
          </p>
          <ul style={{ paddingLeft: '24px', margin: '8px 0' }}>
            <li>Do not constitute individual medical advice, diagnosis, or treatment plans;</li>
            <li>Should never be relied upon as a substitute for an in-person clinical assessment by a licensed medical professional;</li>
            <li>Must not be used to disregard or delay seeking professional medical advice because of something you have read on this site.</li>
          </ul>
        </section>

        <section>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--color-text, #142422)', marginBottom: '10px' }}>
            3. Niramoy AI & Automated Decision-Support Tools
          </h2>
          <p>
            Niramoy incorporates artificial intelligence (AI) and automated assistive algorithms to help users navigate healthcare services, explore symptom information, and prepare questions for medical consultations.
          </p>
          <div style={{
            background: 'var(--color-surface, #ffffff)', border: '1px solid var(--color-border, #e2eceb)',
            borderRadius: '12px', padding: '16px 20px', margin: '14px 0'
          }}>
            <ul style={{ paddingLeft: '20px', margin: 0 }}>
              <li><strong>Informational Assistant Only:</strong> Niramoy AI is an intelligent assistant, not an autonomous physician or medical diagnostician.</li>
              <li><strong>No Prescriptive Authority:</strong> AI outputs cannot prescribe medications, modify existing treatment regimens, or issue clinical orders.</li>
              <li><strong>Mandatory Verification:</strong> All AI-generated insights, summaries, or triage suggestions must be reviewed and confirmed by a certified medical doctor before taking clinical action.</li>
              <li><strong>Safety Protocols:</strong> The AI system automatically flags clinical red flags (such as stroke or coronary warning signs) and redirects the user to emergency services.</li>
            </ul>
          </div>
        </section>

        <section>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--color-text, #142422)', marginBottom: '10px' }}>
            4. Physician Credentials & Verification
          </h2>
          <p>
            Where a doctor profile displays a BMDC verification badge, it indicates that Niramoy has validated the physician's registration record against Bangladesh Medical & Dental Council registries during onboarding. While we strive to maintain accurate information, medical practitioners are solely responsible for maintaining their active licensing, adherence to clinical standards, and the medical advice they deliver during appointments or teleconsultations.
          </p>
        </section>

        <section>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--color-text, #142422)', marginBottom: '10px' }}>
            5. Hospital Resource & Bed Availability Data
          </h2>
          <p>
            Live hospital bed, ICU, CCU, and incubator availability metrics published on Niramoy are reported directly by participating hospital administration desks or estimated via clinical resource telemetry. In critical medical emergencies, users and patient attendants must directly contact the hospital emergency desk to confirm real-time admission readiness before transit.
          </p>
        </section>

        <section>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--color-text, #142422)', marginBottom: '10px' }}>
            6. Medicine Information & Pharmacy Orders
          </h2>
          <p>
            Pharmaceutical details including generic names, standard dosages, and therapeutic classifications are compiled from national formularies and manufacturer documentation. Users should never self-medicate or alter drug dosages without consulting a licensed physician. Prescription-only medicines (POM) strictly require a valid prescription uploaded and verified by a licensed pharmacist before fulfillment.
          </p>
        </section>

        <section>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--color-text, #142422)', marginBottom: '10px' }}>
            7. Contact for Clinical Safety Inquiries
          </h2>
          <p>
            For inquiries regarding clinical compliance, reporting inaccurate medical information, or technical safety concerns, please contact our medical compliance desk at <a href="mailto:compliance@niramoy.health" style={{ color: 'var(--color-primary, #0d7c6e)', fontWeight: 600 }}>compliance@niramoy.health</a> or our Rajshahi coordination office at +880 1700-NIRAMOY.
          </p>
        </section>
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
