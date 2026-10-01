import React from 'react';
import { Link } from 'react-router-dom';
import { Cookie, Shield, ArrowLeft } from 'lucide-react';

export default function CookiePolicyPage() {
  return (
    <div style={{ maxWidth: '960px', margin: '0 auto', padding: '40px 20px 80px 20px', color: 'var(--color-text, #142422)' }}>
      {/* Breadcrumb */}
      <div style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: 'var(--color-text-muted, #47615f)' }}>
        <Link to="/" style={{ color: 'var(--color-primary, #0d7c6e)', textDecoration: 'none', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
          <ArrowLeft size={14} /> Home
        </Link>
        <span>/</span>
        <span>Cookie Policy</span>
      </div>

      {/* Header */}
      <div style={{ borderBottom: '1px solid var(--color-border, #e2eceb)', paddingBottom: '24px', marginBottom: '36px' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '4px 12px', borderRadius: '99px', background: 'var(--color-primary-50, #f0faf9)', color: 'var(--color-primary, #0d7c6e)', fontSize: '0.78rem', fontWeight: 700, marginBottom: '12px' }}>
          <Cookie size={14} /> Browser Storage & Cookies
        </div>
        <h1 style={{ fontSize: '2.2rem', fontWeight: 900, margin: '0 0 10px 0', letterSpacing: '-0.02em', color: 'var(--color-text, #142422)' }}>
          Cookie Policy
        </h1>
        <p style={{ margin: 0, fontSize: '0.95rem', color: 'var(--color-text-secondary, #2f4847)' }}>
          Effective Date: October 1, 2026 • Niramoy Platform
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '28px', fontSize: '0.92rem', lineHeight: 1.7, color: 'var(--color-text-secondary, #2f4847)' }}>
        <section>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--color-text, #142422)', marginBottom: '10px' }}>
            1. What Are Cookies & Local Storage?
          </h2>
          <p>
            Cookies and browser storage mechanisms (such as localStorage) are small text files or key-value entries placed on your device to ensure reliable website functionality, maintain authenticated patient sessions, and save interface preferences (such as selected language and medication cart items).
          </p>
        </section>

        <section>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--color-text, #142422)', marginBottom: '10px' }}>
            2. Categories of Cookies We Use
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px', marginTop: '12px' }}>
            <div style={{ padding: '16px', borderRadius: '12px', background: 'var(--color-surface, #fff)', border: '1px solid var(--color-border, #e2eceb)' }}>
              <h3 style={{ margin: '0 0 6px 0', fontSize: '1rem', fontWeight: 800, color: 'var(--color-text, #142422)' }}>
                🔒 Essential & Authentication
              </h3>
              <p style={{ margin: 0, fontSize: '0.82rem', color: 'var(--color-text-secondary, #2f4847)' }}>
                Required for core security. Stores temporary encrypted JWT tokens (`niramoy_token`) to authenticate patient, doctor, and pharmacy sessions. These cannot be disabled.
              </p>
            </div>

            <div style={{ padding: '16px', borderRadius: '12px', background: 'var(--color-surface, #fff)', border: '1px solid var(--color-border, #e2eceb)' }}>
              <h3 style={{ margin: '0 0 6px 0', fontSize: '1rem', fontWeight: 800, color: 'var(--color-text, #142422)' }}>
                🛒 Functional & Preferences
              </h3>
              <p style={{ margin: 0, fontSize: '0.82rem', color: 'var(--color-text-secondary, #2f4847)' }}>
                Maintains medicine shopping cart state (`niramoy_cart_v1`) so your prescription selections are not lost when navigating between pharmacies in Rajshahi.
              </p>
            </div>

            <div style={{ padding: '16px', borderRadius: '12px', background: 'var(--color-surface, #fff)', border: '1px solid var(--color-border, #e2eceb)' }}>
              <h3 style={{ margin: '0 0 6px 0', fontSize: '1rem', fontWeight: 800, color: 'var(--color-text, #142422)' }}>
                ⚡ Security & Anti-Fraud
              </h3>
              <p style={{ margin: 0, fontSize: '0.82rem', color: 'var(--color-text-secondary, #2f4847)' }}>
                Enforces rate-limiting counters for Phone OTP dispatches and payment transaction callbacks to safeguard against automated brute-force attacks.
              </p>
            </div>
          </div>
        </section>

        <section>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--color-text, #142422)', marginBottom: '10px' }}>
            3. Zero Third-Party Advertising Trackers
          </h2>
          <p>
            Niramoy does NOT deploy cross-site tracking cookies, behavioral ad retargeting pixels, or third-party marketing beacons. Your healthcare navigation remains strictly confidential between you and the healthcare platform.
          </p>
        </section>

        <section>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--color-text, #142422)', marginBottom: '10px' }}>
            4. Managing Your Cookies
          </h2>
          <p>
            You can configure your browser to block cookies or clear existing site storage. However, blocking essential cookies will prevent logging in to your patient dashboard, accessing digital prescriptions, or completing appointment bookings.
          </p>
        </section>
      </div>
    </div>
  );
}
