import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, FileText, CheckCircle2, AlertTriangle, ArrowLeft } from 'lucide-react';

export default function TermsPage() {
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
      <div style={{ borderBottom: '1px solid var(--color-border, #e2eceb)', paddingBottom: '24px', marginBottom: '36px' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '4px 12px', borderRadius: '99px', background: 'var(--color-primary-50, #f0faf9)', color: 'var(--color-primary, #0d7c6e)', fontSize: '0.78rem', fontWeight: 700, marginBottom: '12px' }}>
          <Shield size={14} /> Legal & Compliance
        </div>
        <h1 style={{ fontSize: '2.2rem', fontWeight: 900, margin: '0 0 10px 0', letterSpacing: '-0.02em', color: 'var(--color-text, #142422)' }}>
          Terms of Service
        </h1>
        <p style={{ margin: 0, fontSize: '0.95rem', color: 'var(--color-text-secondary, #2f4847)' }}>
          Effective Date: October 1, 2026 • Last Updated: October 2026
        </p>
      </div>

      {/* Important Medical Notice Callout */}
      <div style={{
        background: '#fffbeb', border: '1.5px solid #fde68a', borderRadius: '12px',
        padding: '18px 20px', marginBottom: '32px', display: 'flex', gap: '14px', alignItems: 'flex-start'
      }}>
        <AlertTriangle size={22} style={{ color: '#d97706', flexShrink: 0, marginTop: '2px' }} />
        <div style={{ fontSize: '0.88rem', color: '#92400e', lineHeight: 1.6 }}>
          <strong>Critical Healthcare Notice:</strong> Niramoy is a digital healthcare coordination and technology platform. Niramoy does not practice medicine or directly provide clinical diagnosis. In any acute or life-threatening medical emergency, call <strong>999</strong> immediately or proceed directly to the nearest hospital emergency room.
        </div>
      </div>

      {/* Content Sections */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '28px', fontSize: '0.92rem', lineHeight: 1.7, color: 'var(--color-text-secondary, #2f4847)' }}>
        <section>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--color-text, #142422)', marginBottom: '10px' }}>
            1. Acceptance of Terms
          </h2>
          <p>
            By accessing or using the Niramoy platform, web application, API services, or digital healthcare tools ("Services"), you acknowledge that you have read, understood, and agree to be bound by these Terms of Service. If you do not agree to these terms, you must discontinue using Niramoy immediately.
          </p>
        </section>

        <section>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--color-text, #142422)', marginBottom: '10px' }}>
            2. Platform Role & Scope of Services
          </h2>
          <p>
            Niramoy operates as an integrated healthcare technology ecosystem in Bangladesh, connecting patients with:
          </p>
          <ul style={{ paddingLeft: '24px', margin: '8px 0' }}>
            <li>Licensed physicians verified by the Bangladesh Medical & Dental Council (BMDC);</li>
            <li>Registered hospitals, clinics, and emergency resource departments;</li>
            <li>Licensed retail model pharmacies and medicine delivery partners;</li>
            <li>Authorized diagnostic testing centers; and</li>
            <li>Verified local ambulance dispatch operators.</li>
          </ul>
          <p>
            Healthcare professionals and healthcare institutions are independent service providers. Each doctor or facility is solely responsible for their clinical evaluations, diagnoses, and treatments.
          </p>
        </section>

        <section>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--color-text, #142422)', marginBottom: '10px' }}>
            3. Account Registration & Security
          </h2>
          <p>
            When registering on Niramoy, you agree to provide authentic, accurate, and current information. Patient accounts are authenticated via verified Bangladeshi mobile numbers and one-time passcodes (OTP). You are responsible for maintaining the confidentiality of your credentials and all activities occurring under your account.
          </p>
        </section>

        <section>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--color-text, #142422)', marginBottom: '10px' }}>
            4. Appointment Bookings & Slot Holds
          </h2>
          <p>
            When you select a doctor consultation slot, Niramoy places a temporary 15-minute slot hold to prevent double-booking. Confirmed appointments require complete payment verification or chamber confirmation. Failure to attend a scheduled appointment without prior cancellation may be logged as a missed visit.
          </p>
        </section>

        <section>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--color-text, #142422)', marginBottom: '10px' }}>
            5. Payment Processing & SSLCOMMERZ
          </h2>
          <p>
            Online payments are processed securely through certified gateway partners, including SSLCOMMERZ. Consultation fees and medicine prices are determined directly by participating healthcare providers. Niramoy does not store raw credit card numbers or banking passwords. All transactions generate a unique serial confirmation code (e.g., NRM-YYYY-MMDD-XXXX).
          </p>
        </section>

        <section>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--color-text, #142422)', marginBottom: '10px' }}>
            6. Prescriptions & Medicine Orders
          </h2>
          <p>
            Prescription-only medications require a valid, verified digital prescription issued by a registered medical practitioner. Participating pharmacies reserve the right to verify prescriptions before dispatch. Orders may be declined if stock is unavailable or the prescription cannot be verified.
          </p>
        </section>

        <section>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--color-text, #142422)', marginBottom: '10px' }}>
            7. AI Decision Support Tools
          </h2>
          <p>
            Niramoy AI and health navigation assistants provide informational triage based on clinical guidelines. AI recommendations are intended as decision support tools and do not constitute definitive medical diagnosis, prescription issuance, or treatment plans.
          </p>
        </section>

        <section>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--color-text, #142422)', marginBottom: '10px' }}>
            8. Limitation of Liability
          </h2>
          <p>
            To the maximum extent permitted by applicable law in Bangladesh, Niramoy shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising out of your access to or inability to use the platform or the clinical decisions made by independent medical practitioners.
          </p>
        </section>

        <section>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--color-text, #142422)', marginBottom: '10px' }}>
            9. Contact & Inquiries
          </h2>
          <p>
            For inquiries regarding these Terms of Service, contact our legal and compliance desk at <Link to="/contact" style={{ color: 'var(--color-primary, #0d7c6e)', fontWeight: 600 }}>legal@niramoy.health</Link> or visit our office at Laxmipur, Rajshahi.
          </p>
        </section>
      </div>
    </div>
  );
}
