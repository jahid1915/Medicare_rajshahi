import React from 'react';
import { Link } from 'react-router-dom';
import { Lock, Shield, ArrowLeft, CheckCircle } from 'lucide-react';

export default function PrivacyPolicyPage() {
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
      <div style={{ borderBottom: '1px solid var(--color-border, #e2eceb)', paddingBottom: '24px', marginBottom: '36px' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '4px 12px', borderRadius: '99px', background: 'var(--color-primary-50, #f0faf9)', color: 'var(--color-primary, #0d7c6e)', fontSize: '0.78rem', fontWeight: 700, marginBottom: '12px' }}>
          <Lock size={14} /> Data Protection & Privacy
        </div>
        <h1 style={{ fontSize: '2.2rem', fontWeight: 900, margin: '0 0 10px 0', letterSpacing: '-0.02em', color: 'var(--color-text, #142422)' }}>
          Privacy Policy
        </h1>
        <p style={{ margin: 0, fontSize: '0.95rem', color: 'var(--color-text-secondary, #2f4847)' }}>
          Effective Date: October 1, 2026 • Version 2.0 (Healthcare Zero-Trust Architecture)
        </p>
      </div>

      {/* Highlight Box */}
      <div style={{
        background: 'var(--color-primary-50, #f0faf9)', border: '1.5px solid var(--color-primary-100, #ccf0ec)',
        borderRadius: '12px', padding: '20px', marginBottom: '32px'
      }}>
        <h3 style={{ margin: '0 0 8px 0', fontSize: '1.05rem', fontWeight: 800, color: 'var(--color-primary-dark, #0a6559)' }}>
          Our Patient Privacy Commitment
        </h3>
        <p style={{ margin: 0, fontSize: '0.88rem', color: 'var(--color-text-secondary, #2f4847)', lineHeight: 1.6 }}>
          Niramoy treats your health records with strict confidentiality. Your medical history, doctor prescriptions, diagnostic reports, and emergency data are protected by multi-tenant role-based access controls and are never sold or shared with commercial marketing agencies.
        </p>
      </div>

      {/* Content */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '28px', fontSize: '0.92rem', lineHeight: 1.7, color: 'var(--color-text-secondary, #2f4847)' }}>
        <section>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--color-text, #142422)', marginBottom: '10px' }}>
            1. Information We Collect
          </h2>
          <p>We collect only the data necessary to provide safe and personalized healthcare coordination:</p>
          <ul style={{ paddingLeft: '24px', margin: '8px 0' }}>
            <li><strong>Account Data:</strong> Verified mobile phone number, name, optional email address, and authentication tokens.</li>
            <li><strong>Clinical Profile Data:</strong> Blood group, date of birth, gender, allergies, pre-existing conditions, and emergency contact details (provided voluntarily by you).</li>
            <li><strong>Healthcare Service Records:</strong> Doctor consultation schedules, digital prescriptions issued by attending doctors, diagnostic tests, and pharmacy orders.</li>
            <li><strong>Technical & Session Data:</strong> IP address, device type, and session timestamps used solely for security auditing and spam mitigation.</li>
          </ul>
        </section>

        <section>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--color-text, #142422)', marginBottom: '10px' }}>
            2. How We Use Your Data
          </h2>
          <p>Your information is processed strictly for legitimate healthcare workflows:</p>
          <ul style={{ paddingLeft: '24px', margin: '8px 0' }}>
            <li>Scheduling appointments with verified physicians and sending SMS appointment vouchers;</li>
            <li>Enabling authorized attending doctors to review vital medical history during teleconsultations;</li>
            <li>Matching digital prescriptions with licensed pharmacies in Rajshahi for medicine fulfillment;</li>
            <li>Processing digital payments and dispatching invoices via SSLCOMMERZ;</li>
            <li>Maintaining zero-trust audit trails to track who accesses medical records.</li>
          </ul>
        </section>

        <section>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--color-text, #142422)', marginBottom: '10px' }}>
            3. Zero-Trust Healthcare Authorization
          </h2>
          <p>
            Niramoy implements strict server-side authorization:
          </p>
          <ul style={{ paddingLeft: '24px', margin: '8px 0' }}>
            <li><strong>Patient Isolation:</strong> Patient A can never view or modify appointments, prescriptions, or files belonging to Patient B.</li>
            <li><strong>Doctor Boundaries:</strong> Doctors can only access patient clinical records associated with appointments scheduled with their clinic or chamber.</li>
            <li><strong>Pharmacy Isolation:</strong> Pharmacy owners only see orders and prescription items specifically placed with their store.</li>
          </ul>
        </section>

        <section>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--color-text, #142422)', marginBottom: '10px' }}>
            4. Artificial Intelligence & Third-Party Services
          </h2>
          <p>
            When utilizing Niramoy AI health triage tools, your queries are processed locally within regional decision-support engines. Sensitive medical records are not transmitted to foreign commercial AI services for model training without explicit written consent.
          </p>
        </section>

        <section>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--color-text, #142422)', marginBottom: '10px' }}>
            5. Data Retention & Your Rights
          </h2>
          <p>
            You retain the right to review your stored clinical profile, download appointment vouchers and prescriptions in high-resolution PDF format, update your emergency contacts, or request complete account deactivation at any time via your patient dashboard.
          </p>
        </section>

        <section>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--color-text, #142422)', marginBottom: '10px' }}>
            6. Privacy Officer Contact
          </h2>
          <p>
            To exercise your privacy rights or file a security inquiry, contact our Data Protection Officer at <Link to="/contact" style={{ color: 'var(--color-primary, #0d7c6e)', fontWeight: 600 }}>privacy@niramoy.health</Link>.
          </p>
        </section>
      </div>
    </div>
  );
}
