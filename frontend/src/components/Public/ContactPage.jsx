import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Mail, Phone, MapPin, Send, CheckCircle2, AlertCircle, Clock,
  ShieldCheck, HelpCircle, Building2, Stethoscope, Sparkles, AlertTriangle
} from 'lucide-react';

const INQUIRY_TYPES = [
  { id: 'general', label: 'General Inquiry', email: 'support@niramoy.health' },
  { id: 'technical', label: 'Technical Support', email: 'tech@niramoy.health' },
  { id: 'provider', label: 'Healthcare Provider Support', email: 'providers@niramoy.health' },
  { id: 'partnership', label: 'Partnership & Research', email: 'research@niramoy.health' }
];

export default function ContactPage() {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    inquiryType: 'general',
    subject: '',
    message: ''
  });

  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState('idle'); // 'idle' | 'loading' | 'success' | 'error'
  const [ticketId, setTicketId] = useState('');
  const [lastSubmittedTime, setLastSubmittedTime] = useState(0);

  const validate = () => {
    const errs = {};
    if (!formData.fullName.trim() || formData.fullName.trim().length < 2) {
      errs.fullName = 'Please enter your full name (at least 2 characters).';
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim() || !emailRegex.test(formData.email.trim())) {
      errs.email = 'Please provide a valid email address.';
    }
    const bdPhoneRegex = /^(\+?880|0)?1[3-9]\d{8}$/;
    if (formData.phone.trim() && !bdPhoneRegex.test(formData.phone.trim().replace(/[-\s]/g, ''))) {
      errs.phone = 'Please enter a valid Bangladeshi phone number (e.g. 01700000000).';
    }
    if (!formData.subject.trim() || formData.subject.trim().length < 3) {
      errs.subject = 'Subject is required (at least 3 characters).';
    }
    if (!formData.message.trim() || formData.message.trim().length < 10) {
      errs.message = 'Please provide a detailed message (at least 10 characters).';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    // Spam/Rate-limit check: 30 seconds cooldown
    const now = Date.now();
    if (now - lastSubmittedTime < 30000) {
      setErrors({ form: 'Please wait a moment before sending another message (anti-spam protection).' });
      return;
    }

    setStatus('loading');

    try {
      // Simulate network request to contact inquiry dispatcher
      await new Promise(resolve => setTimeout(resolve, 800));

      const generatedTicket = `NIR-${Math.floor(100000 + Math.random() * 900000)}`;
      setTicketId(generatedTicket);
      setLastSubmittedTime(now);
      setStatus('success');
      setFormData({
        fullName: '',
        email: '',
        phone: '',
        inquiryType: 'general',
        subject: '',
        message: ''
      });
      setErrors({});
    } catch (err) {
      setStatus('error');
      setErrors({ form: 'Failed to transmit inquiry. Please email support@niramoy.health directly.' });
    }
  };

  return (
    <div className="contact-page" style={{ color: 'var(--color-text, #142422)', paddingBottom: '80px' }}>
      {/* Header Banner */}
      <section style={{
        background: 'linear-gradient(135deg, #0d7c6e 0%, #0a5f54 100%)',
        color: '#ffffff',
        padding: '54px 20px',
        position: 'relative'
      }}>
        <div style={{ maxWidth: '1080px', margin: '0 auto' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '8px',
            padding: '4px 12px', borderRadius: '99px',
            background: 'rgba(255,255,255,0.15)', fontSize: '0.8rem', fontWeight: 700, marginBottom: '16px'
          }}>
            <Mail size={14} /> SUPPORT & INQUIRIES
          </div>
          <h1 style={{ fontSize: 'clamp(2rem, 4vw, 2.8rem)', fontWeight: 900, margin: '0 0 12px 0', letterSpacing: '-0.02em' }}>
            Contact Niramoy
          </h1>
          <p style={{ fontSize: '1.05rem', color: 'rgba(255,255,255,0.9)', maxWidth: '640px', margin: 0, lineHeight: 1.5 }}>
            Reach our patient support team, provider onboarding coordinators, or clinical research liaison in Rajshahi.
          </p>
        </div>
      </section>

      {/* Main Content Area */}
      <div style={{ maxWidth: '1080px', margin: '0 auto', padding: '48px 20px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '40px', alignItems: 'start' }}>
          
          {/* Left Column: Direct Contacts & Channels */}
          <div>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 900, margin: '0 0 16px 0', color: 'var(--color-text, #142422)' }}>
              Get in Touch Directly
            </h2>
            <p style={{ fontSize: '0.92rem', color: 'var(--color-text-secondary, #2f4847)', lineHeight: 1.6, margin: '0 0 28px 0' }}>
              We are dedicated to maintaining open communication with patients, physicians, and medical partners across Rajshahi Division.
            </p>

            {/* Quick Contact Cards */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '32px' }}>
              {/* Emergency Hotline */}
              <div style={{
                background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '14px',
                padding: '16px 20px', display: 'flex', gap: '14px', alignItems: 'center'
              }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#fee2e2', color: '#dc2626', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <AlertTriangle size={20} />
                </div>
                <div>
                  <div style={{ fontSize: '0.78rem', fontWeight: 800, color: '#991b1b', textTransform: 'uppercase' }}>
                    Emergency Medical Assistance
                  </div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 900, color: '#b91c1c' }}>
                    Call 999 or 16263 (National Health)
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#7f1d1d' }}>
                    Available 24/7 across Bangladesh
                  </div>
                </div>
              </div>

              {/* General Inquiries */}
              <div style={{
                background: 'var(--color-surface, #ffffff)', border: '1px solid var(--color-border, #e2eceb)',
                borderRadius: '14px', padding: '16px 20px', display: 'flex', gap: '14px', alignItems: 'center'
              }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'var(--color-primary-50, #f0faf9)', color: 'var(--color-primary, #0d7c6e)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Mail size={20} />
                </div>
                <div>
                  <div style={{ fontSize: '0.78rem', fontWeight: 800, color: 'var(--color-text-muted, #47615f)', textTransform: 'uppercase' }}>
                    General Patient Support
                  </div>
                  <a href="mailto:support@niramoy.health" style={{ fontSize: '0.98rem', fontWeight: 700, color: 'var(--color-primary, #0d7c6e)', textDecoration: 'none' }}>
                    support@niramoy.health
                  </a>
                  <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted, #47615f)' }}>
                    Response time: within 24 hours
                  </div>
                </div>
              </div>

              {/* Provider Support */}
              <div style={{
                background: 'var(--color-surface, #ffffff)', border: '1px solid var(--color-border, #e2eceb)',
                borderRadius: '14px', padding: '16px 20px', display: 'flex', gap: '14px', alignItems: 'center'
              }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'var(--color-primary-50, #f0faf9)', color: 'var(--color-primary, #0d7c6e)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Stethoscope size={20} />
                </div>
                <div>
                  <div style={{ fontSize: '0.78rem', fontWeight: 800, color: 'var(--color-text-muted, #47615f)', textTransform: 'uppercase' }}>
                    Healthcare Provider Onboarding
                  </div>
                  <a href="mailto:providers@niramoy.health" style={{ fontSize: '0.98rem', fontWeight: 700, color: 'var(--color-primary, #0d7c6e)', textDecoration: 'none' }}>
                    providers@niramoy.health
                  </a>
                  <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted, #47615f)' }}>
                    For Doctors, Clinics, Pharmacies & Ambulances
                  </div>
                </div>
              </div>

              {/* Research & Partnerships */}
              <div style={{
                background: 'var(--color-surface, #ffffff)', border: '1px solid var(--color-border, #e2eceb)',
                borderRadius: '14px', padding: '16px 20px', display: 'flex', gap: '14px', alignItems: 'center'
              }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'var(--color-primary-50, #f0faf9)', color: 'var(--color-primary, #0d7c6e)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Sparkles size={20} />
                </div>
                <div>
                  <div style={{ fontSize: '0.78rem', fontWeight: 800, color: 'var(--color-text-muted, #47615f)', textTransform: 'uppercase' }}>
                    Research & Institutional Partnerships
                  </div>
                  <a href="mailto:research@niramoy.health" style={{ fontSize: '0.98rem', fontWeight: 700, color: 'var(--color-primary, #0d7c6e)', textDecoration: 'none' }}>
                    research@niramoy.health
                  </a>
                  <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted, #47615f)' }}>
                    Clinical trials, smart hospital telemetry, AI research
                  </div>
                </div>
              </div>

              {/* Physical Office Location */}
              <div style={{
                background: 'var(--color-surface, #ffffff)', border: '1px solid var(--color-border, #e2eceb)',
                borderRadius: '14px', padding: '16px 20px', display: 'flex', gap: '14px', alignItems: 'center'
              }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'var(--color-primary-50, #f0faf9)', color: 'var(--color-primary, #0d7c6e)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <MapPin size={20} />
                </div>
                <div>
                  <div style={{ fontSize: '0.78rem', fontWeight: 800, color: 'var(--color-text-muted, #47615f)', textTransform: 'uppercase' }}>
                    Rajshahi Coordination Center
                  </div>
                  <div style={{ fontSize: '0.92rem', fontWeight: 700, color: 'var(--color-text, #142422)' }}>
                    Laxmipur Medical Zone, Rajshahi 6000, Bangladesh
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted, #47615f)' }}>
                    Sunday – Thursday, 9:00 AM – 6:00 PM
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Interactive Contact Form */}
          <div style={{
            background: 'var(--color-surface, #ffffff)',
            border: '1px solid var(--color-border, #e2eceb)',
            borderRadius: '20px',
            padding: '32px',
            boxShadow: '0 4px 16px rgba(0,0,0,0.04)'
          }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 900, margin: '0 0 8px 0', color: 'var(--color-text, #142422)' }}>
              Send an Official Inquiry
            </h3>
            <p style={{ fontSize: '0.88rem', color: 'var(--color-text-muted, #47615f)', margin: '0 0 24px 0' }}>
              Complete the form below and our regional coordination team will direct your inquiry to the relevant department.
            </p>

            {status === 'success' ? (
              <div style={{
                background: 'var(--color-primary-50, #f0faf9)', border: '1.5px solid var(--color-primary-100, #ccebe8)',
                borderRadius: '16px', padding: '24px', textAlign: 'center'
              }}>
                <CheckCircle2 size={44} style={{ color: 'var(--color-primary, #0d7c6e)', margin: '0 auto 12px auto' }} />
                <h4 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--color-text, #142422)', margin: '0 0 6px 0' }}>
                  Inquiry Received Successfully
                </h4>
                <p style={{ fontSize: '0.88rem', color: 'var(--color-text-secondary, #2f4847)', margin: '0 0 16px 0', lineHeight: 1.6 }}>
                  Thank you for reaching out. Your inquiry has been routed to our team with tracking reference:
                </p>
                <div style={{
                  display: 'inline-block', padding: '6px 14px', borderRadius: '8px',
                  background: 'var(--color-surface, #ffffff)', border: '1px solid var(--color-primary, #0d7c6e)',
                  fontWeight: 800, fontSize: '1rem', color: 'var(--color-primary, #0d7c6e)', marginBottom: '20px'
                }}>
                  {ticketId}
                </div>
                <div>
                  <button
                    onClick={() => setStatus('idle')}
                    className="btn btn-secondary"
                    style={{ fontSize: '0.85rem' }}
                  >
                    Submit Another Message
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {errors.form && (
                  <div style={{
                    padding: '10px 14px', borderRadius: '8px', background: '#fef2f2',
                    border: '1px solid #fecaca', color: '#b91c1c', fontSize: '0.85rem', display: 'flex', gap: '8px', alignItems: 'center'
                  }}>
                    <AlertCircle size={16} /> {errors.form}
                  </div>
                )}

                {/* Inquiry Type Radio / Selector */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: 'var(--color-text, #142422)', marginBottom: '8px' }}>
                    Department / Inquiry Type *
                  </label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '8px' }}>
                    {INQUIRY_TYPES.map(t => {
                      const selected = formData.inquiryType === t.id;
                      return (
                        <button
                          type="button"
                          key={t.id}
                          onClick={() => setFormData({ ...formData, inquiryType: t.id })}
                          style={{
                            padding: '8px 10px',
                            borderRadius: '8px',
                            border: selected ? '1.5px solid var(--color-primary, #0d7c6e)' : '1px solid var(--color-border, #e2eceb)',
                            background: selected ? 'var(--color-primary-50, #f0faf9)' : 'var(--color-surface, #ffffff)',
                            color: selected ? 'var(--color-primary, #0d7c6e)' : 'var(--color-text-secondary, #2f4847)',
                            fontSize: '0.78rem',
                            fontWeight: selected ? 700 : 500,
                            cursor: 'pointer',
                            textAlign: 'center'
                          }}
                        >
                          {t.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Full Name */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: 'var(--color-text, #142422)', marginBottom: '4px' }}>
                    Full Name *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Dr. Aminul Islam or Shamim Ahmed"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    style={{
                      width: '100%', padding: '10px 12px', borderRadius: '8px',
                      border: errors.fullName ? '1px solid #dc2626' : '1px solid var(--color-border, #e2eceb)',
                      fontSize: '0.9rem', outline: 'none'
                    }}
                  />
                  {errors.fullName && <div style={{ fontSize: '0.75rem', color: '#dc2626', marginTop: '3px' }}>{errors.fullName}</div>}
                </div>

                {/* Email & Phone */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '12px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: 'var(--color-text, #142422)', marginBottom: '4px' }}>
                      Email Address *
                    </label>
                    <input
                      type="email"
                      placeholder="you@example.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      style={{
                        width: '100%', padding: '10px 12px', borderRadius: '8px',
                        border: errors.email ? '1px solid #dc2626' : '1px solid var(--color-border, #e2eceb)',
                        fontSize: '0.9rem', outline: 'none'
                      }}
                    />
                    {errors.email && <div style={{ fontSize: '0.75rem', color: '#dc2626', marginTop: '3px' }}>{errors.email}</div>}
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: 'var(--color-text, #142422)', marginBottom: '4px' }}>
                      Phone (Optional)
                    </label>
                    <input
                      type="text"
                      placeholder="017XXXXXXXX"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      style={{
                        width: '100%', padding: '10px 12px', borderRadius: '8px',
                        border: errors.phone ? '1px solid #dc2626' : '1px solid var(--color-border, #e2eceb)',
                        fontSize: '0.9rem', outline: 'none'
                      }}
                    />
                    {errors.phone && <div style={{ fontSize: '0.75rem', color: '#dc2626', marginTop: '3px' }}>{errors.phone}</div>}
                  </div>
                </div>

                {/* Subject */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: 'var(--color-text, #142422)', marginBottom: '4px' }}>
                    Subject *
                  </label>
                  <input
                    type="text"
                    placeholder="Brief description of your inquiry"
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    style={{
                      width: '100%', padding: '10px 12px', borderRadius: '8px',
                      border: errors.subject ? '1px solid #dc2626' : '1px solid var(--color-border, #e2eceb)',
                      fontSize: '0.9rem', outline: 'none'
                    }}
                  />
                  {errors.subject && <div style={{ fontSize: '0.75rem', color: '#dc2626', marginTop: '3px' }}>{errors.subject}</div>}
                </div>

                {/* Message */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: 'var(--color-text, #142422)', marginBottom: '4px' }}>
                    Message *
                  </label>
                  <textarea
                    rows={4}
                    placeholder="Provide detailed information regarding your inquiry..."
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    style={{
                      width: '100%', padding: '10px 12px', borderRadius: '8px',
                      border: errors.message ? '1px solid #dc2626' : '1px solid var(--color-border, #e2eceb)',
                      fontSize: '0.9rem', outline: 'none', resize: 'vertical'
                    }}
                  />
                  {errors.message && <div style={{ fontSize: '0.75rem', color: '#dc2626', marginTop: '3px' }}>{errors.message}</div>}
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={status === 'loading'}
                  className="btn btn-primary"
                  style={{ width: '100%', padding: '12px', justifyContent: 'center', fontWeight: 700, marginTop: '8px' }}
                >
                  {status === 'loading' ? 'Transmitting Message...' : 'Send Inquiry'}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
