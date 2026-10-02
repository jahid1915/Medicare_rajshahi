import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../i18n';
import NiramoyLogo from '../Common/NiramoyLogo';
import LegalContextModal from '../Legal/LegalContextModal';
import {
  Mail, Lock, Eye, EyeOff, AlertCircle, Loader2,
  CheckCircle2, Stethoscope, Shield, Users, ArrowRight,
  Phone, Smartphone, Building2, Pill, UserCheck,
  UserRound, Hospital
} from 'lucide-react';

const FEATURES = [
  { icon: Stethoscope, text: '350+ Verified Healthcare Professionals' },
  { icon: Shield, text: 'Trusted & Verified Information' },
  { icon: Users, text: 'Growing Rajshahi Healthcare Network' },
];

function getDashboardForRole(role) {
  if (['hospital_admin','hospital_management','receptionist'].includes(role)) return '/hospital-portal';
  if (['pharmacy_owner','pharmacist'].includes(role)) return '/pharmacy-portal';
  if (['doctor','specialist_doctor','nurse','lab_tech','radiology_tech'].includes(role)) return '/doctor-portal';
  if (['super_admin','compliance_auditor','researcher'].includes(role)) return '/admin';
  return '/dashboard';
}

const DEMO_ACCOUNTS = [
  { roleKey: 'patient', label: '🧑‍⚕️ Patient (Rahim)', identifier: '01711223344', password: 'Pass@123456', role: 'patient' },
  { roleKey: 'patient', label: '🧑‍⚕️ Patient (Email)', identifier: 'patient@niramoy.health', password: 'Patient@123456', role: 'patient' },
  { roleKey: 'doctor', label: '🩺 Doctor', identifier: 'doctor@niramoy.health', password: 'Doctor@123456', role: 'doctor' },
  { roleKey: 'hospital_admin', label: '🏥 Hospital Authority', identifier: 'hospital.admin@niramoy.health', password: 'Hospital@123456', role: 'hospital_admin' },
  { roleKey: 'pharmacy_owner', label: '💊 Pharmacy Owner', identifier: 'pharmacy.owner@niramoy.health', password: 'Pharmacy@123456', role: 'pharmacy_owner' },
  { roleKey: 'super_admin', label: '👑 Super Admin', identifier: 'admin@niramoy.health', password: 'Admin@123456', role: 'super_admin' },
];

export default function SignInPage() {
  const { t, isBangla } = useLanguage();
  const { login, sendOtp, verifyOtp, isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from || null;

  const PORTAL_OPTIONS = [
    {
      id: 'patient',
      nameEn: 'Patient',
      nameBn: 'রোগী',
      roleName: 'Patient',
      icon: UserRound,
    },
    {
      id: 'doctor',
      nameEn: 'Doctor',
      nameBn: 'ডাক্তার',
      roleName: 'Doctor',
      icon: Stethoscope,
    },
    {
      id: 'hospital_admin',
      nameEn: 'Hospital',
      nameBn: 'হাসপাতাল',
      roleName: 'Hospital Authority',
      icon: Hospital,
    },
    {
      id: 'pharmacy_owner',
      nameEn: 'Pharmacy',
      nameBn: 'ফার্মেসি',
      roleName: 'Pharmacy Owner',
      icon: Pill,
    },
  ];

  const [activeTab, setActiveTab] = useState('patient');

  const currentPortal = PORTAL_OPTIONS.find(p => p.id === activeTab);
  const activePortalLabelEn = currentPortal ? currentPortal.roleName : (activeTab === 'super_admin' ? 'Platform Admin' : 'User');
  const activePortalLabelBn = currentPortal ? currentPortal.nameBn : (activeTab === 'super_admin' ? 'অ্যাডমিন' : 'ইউজার');
  const [form, setForm] = useState({ identifier: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Legal Modal State for interactive contextual terms
  const [legalModal, setLegalModal] = useState({ open: false, topic: 'terms' });

  // Phone OTP States for Patients
  const [patientAuthMode, setPatientAuthMode] = useState('otp'); // 'otp' | 'password'
  const [otpStep, setOtpStep] = useState('phone'); // 'phone' | 'verify'
  const [patientPhone, setPatientPhone] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [otpCountdown, setOtpCountdown] = useState(0);
  const [otpLoading, setOtpLoading] = useState(false);

  // Resend Countdown Timer
  useEffect(() => {
    if (otpCountdown > 0) {
      const timer = setTimeout(() => setOtpCountdown(c => c - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [otpCountdown]);

  const handleRequestOtp = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    setError('');
    if (!patientPhone.trim()) {
      setError('Please enter your 11-digit mobile phone number (e.g. 017XXXXXXXX).');
      return;
    }
    setOtpLoading(true);
    try {
      await sendOtp({ phone: patientPhone.trim() });
      setOtpStep('verify');
      setOtpCountdown(60);
    } catch (err) {
      setError(err.message || 'Failed to send OTP code.');
    } finally {
      setOtpLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    setError('');
    if (!otpCode || otpCode.trim().length !== 6) {
      setError('Please enter the 6-digit verification code.');
      return;
    }
    setOtpLoading(true);
    try {
      const data = await verifyOtp({ phone: patientPhone.trim(), otp: otpCode.trim() });
      navigate(from || getDashboardForRole(data.user.role), { replace: true });
    } catch (err) {
      setError(err.message || 'Invalid or expired verification code.');
    } finally {
      setOtpLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated && user) {
      navigate(from || getDashboardForRole(user.role), { replace: true });
    }
  }, [isAuthenticated, user, navigate, from]);


  if (isAuthenticated && user) {
    return null;
  }

  const fillDemo = (demo) => {
    setActiveTab(demo.roleKey);
    setForm({ identifier: demo.identifier, password: demo.password });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.identifier || !form.password) {
      setError(
        activeTab === 'patient' 
          ? 'Please enter your mobile number (or email) and password.' 
          : 'Please enter your email/phone and password.'
      );
      return;
    }
    setLoading(true);
    try {
      const data = await login({ 
        identifier: form.identifier.trim(), 
        email: form.identifier.trim(), 
        phone: form.identifier.trim(), 
        password: form.password 
      });
      navigate(from || getDashboardForRole(data.user.role), { replace: true });
    } catch (err) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-layout">
      {/* Left Visual Panel */}
      <div className="auth-visual">
        <div className="auth-visual__grid" />
        <div style={{ position: 'relative', zIndex: 1, width: '100%', maxWidth: 400 }}>
          {/* Logo */}
          <Link to="/" style={{ display: 'inline-block', marginBottom: 'var(--sp-10)', textDecoration: 'none' }}>
            <NiramoyLogo size="lg" variant="light" tagline="Digital Health Network" />
          </Link>

          <div className="auth-visual__title">Welcome back.</div>
          <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: 'var(--text-lg)', lineHeight: 1.7, marginBottom: 'var(--sp-10)' }}>
            Sign in to access your role portal — Patient, Doctor, Pharmacy Owner, Hospital Authority, or Platform Admin.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-4)' }}>
            {FEATURES.map((f, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <f.icon style={{ width: 16, height: 16, color: 'rgba(255,255,255,0.9)' }} />
                </div>
                <span style={{ color: 'rgba(255,255,255,0.8)', fontSize: 'var(--text-sm)', fontWeight: 500 }}>{f.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Form Panel */}
      <div className="auth-form-side">
        <div className="auth-form-card" style={{ maxWidth: 500, width: '100%' }}>
          <Link to="/" className="auth-card-logo" style={{ textDecoration: 'none', marginBottom: 16, display: 'inline-block' }}>
            <NiramoyLogo size="md" />
          </Link>

          <h1 className="auth-form-card__title" style={{ marginBottom: '6px' }}>
            {t('auth.signInTitle', 'Enter Portal')}
          </h1>
          <p className="auth-form-card__subtitle" style={{ marginBottom: '16px' }}>
            {isBangla ? 'কোনো অ্যাকাউন্ট নেই? ' : "Don't have an account? "}
            <Link to="/register" style={{ color: 'var(--color-primary)', fontWeight: 700 }}>
              {isBangla ? 'নতুন অ্যাকাউন্ট তৈরি করুন' : 'Become a Member'}
            </Link>
          </p>

          {/* Redesigned Healthcare Portal Selector */}
          <div className="portal-selector-wrapper">
            <div className="portal-selector-label" id="portal-selector-label">
              {isBangla ? 'পোর্টাল নির্বাচন করুন' : 'CONTINUE AS'}
            </div>
            <div
              className="portal-selector-grid"
              role="tablist"
              aria-labelledby="portal-selector-label"
            >
              {PORTAL_OPTIONS.map((portal) => {
                const isSelected = activeTab === portal.id;
                const IconComponent = portal.icon;
                return (
                  <button
                    key={portal.id}
                    id={`portal-tab-${portal.id}`}
                    type="button"
                    role="tab"
                    aria-selected={isSelected}
                    aria-controls="portal-auth-panel"
                    tabIndex={0}
                    className={`portal-card-btn ${isSelected ? 'active' : ''}`}
                    onClick={() => {
                      setActiveTab(portal.id);
                      setError('');
                    }}
                  >
                    <div className="portal-card-icon-wrap" aria-hidden="true">
                      <IconComponent size={16} strokeWidth={2} />
                    </div>
                    <span className="portal-card-name-en">{portal.nameEn}</span>
                    <span className="portal-card-name-bn">{portal.nameBn}</span>
                    {isSelected && <span className="portal-card-indicator" aria-hidden="true" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Role specific info box */}
          {activeTab === 'patient' ? (
            <div className="auth-mode-toggle-card">
              <div className="auth-mode-toggle-header">
                <div className="auth-mode-title">
                  <strong>{isBangla ? '📱 মোবাইল ওটিপি সাইন ইন' : '📱 Phone OTP Sign-in'}</strong>
                </div>
                <button
                  type="button"
                  className="auth-mode-switch-btn"
                  onClick={() => {
                    setPatientAuthMode(m => m === 'otp' ? 'password' : 'otp');
                    setError('');
                  }}
                >
                  {patientAuthMode === 'otp'
                    ? (isBangla ? 'পাসওয়ার্ড ব্যবহার করুন' : 'Use Password')
                    : (isBangla ? 'ফোন ওটিপি ব্যবহার করুন' : 'Use Phone OTP')}
                </button>
              </div>
              <p style={{ margin: 0, color: 'var(--color-text-secondary)', fontSize: '0.8rem', lineHeight: 1.5 }}>
                {patientAuthMode === 'otp'
                  ? (isBangla ? 'আপনার মোবাইল নম্বর লিখুন। এসএমএস-এর মাধ্যমে একটি ৬ সংখ্যার ওটিপি কোড পাঠানো হবে।' : 'Enter your mobile number to receive a secure 6-digit verification code via SMS.')
                  : (isBangla ? 'আপনার নিবন্ধিত ফোন নম্বর/ইমেইল এবং পাসওয়ার্ড প্রদান করুন।' : 'Enter your registered phone/email and account password.')}
              </p>
            </div>
          ) : (
            <div style={{ padding: '10px 14px', borderRadius: '10px', background: 'rgba(2,132,199,0.08)', border: '1px solid rgba(2,132,199,0.2)', marginBottom: '16px', fontSize: '0.78rem', color: '#0369a1', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <strong>{isBangla ? 'পেশাদারদের সাইন ইন:' : 'Professional Sign-in:'}</strong> {isBangla ? 'ডাক্তার, হাসপাতাল এবং ফার্মেসির জন্য যাচাইকৃত অ্যাকাউন্টের শংসাপত্র প্রয়োজন।' : 'Doctors, Hospitals, and Pharmacies require verified credentials.'}
              </div>
              <Link to={`/register?role=${activeTab}`} style={{ color: '#0284c7', fontWeight: 800, textDecoration: 'underline', flexShrink: 0, marginLeft: '8px' }}>
                {isBangla ? 'নিবন্ধন করুন →' : 'Sign Up →'}
              </Link>
            </div>
          )}

          {from && (
            <div className="auth-info" style={{ marginBottom: 'var(--sp-5)' }}>
              Please sign in to continue.
            </div>
          )}

          {error && (
            <div className="auth-error" style={{ marginBottom: 'var(--sp-5)' }}>
              <AlertCircle style={{ width: 16, height: 16, flexShrink: 0 }} />
              {error}
            </div>
          )}

          {/* ═══ PATIENT PHONE OTP FLOW ═══ */}
          {activeTab === 'patient' && patientAuthMode === 'otp' ? (
            <div>
              {otpStep === 'phone' ? (
                <form onSubmit={handleRequestOtp} className="auth-form" noValidate>
                  <div className="auth-field">
                    <label htmlFor="patient-phone">
                      {isBangla ? 'মোবাইল ফোন নম্বর' : 'Mobile Phone Number'}
                    </label>
                    <div className="auth-input-wrap">
                      <Phone style={{ width: 16, height: 16 }} />
                      <input
                        id="patient-phone"
                        type="tel"
                        placeholder="e.g. 017XXXXXXXX"
                        value={patientPhone}
                        onChange={e => setPatientPhone(e.target.value)}
                        autoComplete="tel"
                        required
                        disabled={otpLoading}
                        style={{ fontSize: '1rem', letterSpacing: '0.5px' }}
                      />
                    </div>
                    <span style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)', marginTop: 4 }}>
                      {isBangla ? 'আপনার মোবাইলে একটি ৬ সংখ্যার ওটিপি কোড পাঠানো হবে।' : 'A 6-digit OTP will be dispatched via SMS to your mobile phone.'}
                    </span>
                  </div>

                  <button
                    id="btn-send-otp"
                    type="submit"
                    className="btn btn-primary"
                    style={{ width: '100%', justifyContent: 'center', padding: '12px 24px', fontSize: 'var(--text-base)', marginTop: 'var(--sp-3)', gap: 8 }}
                    disabled={otpLoading}
                  >
                    {otpLoading ? (
                      <><Loader2 style={{ width: 18, height: 18, animation: 'spin 1s linear infinite' }} /> {isBangla ? 'কোড পাঠানো হচ্ছে...' : 'Sending OTP…'}</>
                    ) : (
                      <>
                        {isBangla ? 'ওটিপি কোড পাঠান' : 'Send Verification Code'}
                        <ArrowRight style={{ width: 16, height: 16 }} />
                      </>
                    )}
                  </button>
                </form>
              ) : (
                <form onSubmit={handleVerifyOtp} className="auth-form" noValidate>
                  <div style={{ background: '#f8fafc', border: '1px solid #e2eceb', borderRadius: '12px', padding: '12px', marginBottom: 16 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.82rem', color: '#475569' }}>
                        {isBangla ? 'কোড পাঠানো হয়েছে: ' : 'Code sent to: '}<strong>{patientPhone}</strong>
                      </span>
                      <button
                        type="button"
                        onClick={() => { setOtpStep('phone'); setOtpCode(''); setError(''); }}
                        style={{ background: 'none', border: 'none', color: 'var(--color-primary, #0d7c6e)', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer', textDecoration: 'underline' }}
                      >
                        {isBangla ? 'পরিবর্তন' : 'Change'}
                      </button>
                    </div>
                  </div>

                  <div className="auth-field">
                    <label htmlFor="patient-otp">
                      {isBangla ? '৬ সংখ্যার যাচাইকরণ কোড লিখুন' : 'Enter 6-Digit Verification Code'}
                    </label>
                    <div className="auth-input-wrap">
                      <Lock style={{ width: 16, height: 16 }} />
                      <input
                        id="patient-otp"
                        type="text"
                        maxLength={6}
                        placeholder="••••••"
                        value={otpCode}
                        onChange={e => setOtpCode(e.target.value.replace(/\D/g, ''))}
                        autoFocus
                        required
                        disabled={otpLoading}
                        style={{
                          fontSize: '1.4rem', letterSpacing: '6px', textAlign: 'center', fontWeight: 800,
                          fontFamily: 'monospace'
                        }}
                      />
                    </div>
                  </div>

                  <button
                    id="btn-verify-otp"
                    type="submit"
                    className="btn btn-primary"
                    style={{ width: '100%', justifyContent: 'center', padding: '12px 24px', fontSize: 'var(--text-base)', marginTop: 'var(--sp-2)', gap: 8 }}
                    disabled={otpLoading || otpCode.length !== 6}
                  >
                    {otpLoading ? (
                      <><Loader2 style={{ width: 18, height: 18, animation: 'spin 1s linear infinite' }} /> {isBangla ? 'যাচাই করা হচ্ছে...' : 'Verifying…'}</>
                    ) : (
                      <>
                        {isBangla ? 'যাচাই করে প্রবেশ করুন' : 'Verify & Sign In'}
                        <CheckCircle2 style={{ width: 16, height: 16 }} />
                      </>
                    )}
                  </button>

                  <div style={{ marginTop: 14, textAlign: 'center' }}>
                    {otpCountdown > 0 ? (
                      <span style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>
                        {isBangla ? `পুনরায় পাঠানোর সময়: ` : `Resend code in `}<strong>{otpCountdown}s</strong>
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={handleRequestOtp}
                        disabled={otpLoading}
                        style={{
                          background: 'none', border: 'none', color: 'var(--color-primary, #0d7c6e)',
                          fontSize: '0.78rem', fontWeight: 800, cursor: 'pointer', textDecoration: 'underline'
                        }}
                      >
                        {isBangla ? 'পুনরায় কোড পাঠান' : 'Resend Verification Code'}
                      </button>
                    )}
                  </div>
                </form>
              )}
            </div>
          ) : (
            /* ═══ PASSWORD AUTH FLOW (Staff & Optional Patient Password) ═══ */
            <form onSubmit={handleSubmit} className="auth-form" noValidate>
              <div className="auth-field">
                <label htmlFor="identifier">
                  {activeTab === 'patient' 
                    ? (isBangla ? 'মোবাইল নম্বর বা ইমেইল' : 'Mobile Number or Email') 
                    : (isBangla ? 'ইমেইল বা ফোন নম্বর' : 'Email Address or Phone')}
                </label>
                <div className="auth-input-wrap">
                  {activeTab === 'patient' ? (
                    <Phone style={{ width: 16, height: 16 }} />
                  ) : (
                    <Mail style={{ width: 16, height: 16 }} />
                  )}
                  <input
                    id="identifier"
                    type="text"
                    placeholder={
                      activeTab === 'patient'
                        ? "e.g., 01711223344 or patient@gmail.com"
                        : "you@example.com or phone"
                    }
                    value={form.identifier}
                    onChange={e => setForm({ ...form, identifier: e.target.value })}
                    autoComplete="username"
                    required
                    aria-label="Mobile Number or Email"
                  />
                </div>
              </div>

              <div className="auth-field">
                <label htmlFor="password">
                  {isBangla ? 'পাসওয়ার্ড' : 'Password'}
                </label>
                <div className="auth-input-wrap">
                  <Lock style={{ width: 16, height: 16 }} />
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder={isBangla ? 'পাসওয়ার্ড লিখুন' : 'Enter your password'}
                    value={form.password}
                    onChange={e => setForm({ ...form, password: e.target.value })}
                    autoComplete="current-password"
                    required
                    aria-label="Password"
                  />
                  <button
                    type="button"
                    className="auth-pw-toggle"
                    onClick={() => setShowPassword(v => !v)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff style={{ width: 15, height: 15 }} /> : <Eye style={{ width: 15, height: 15 }} />}
                  </button>
                </div>
              </div>

              <button
                id="sign-in-submit"
                type="submit"
                className="btn btn-primary"
                style={{ width: '100%', justifyContent: 'center', padding: '12px 24px', fontSize: 'var(--text-base)', marginTop: 'var(--sp-2)', gap: 8 }}
                disabled={loading}
              >
                {loading ? (
                  <><Loader2 style={{ width: 18, height: 18, animation: 'spin 1s linear infinite' }} /> {isBangla ? 'সাইন ইন হচ্ছে...' : 'Signing in…'}</>
                ) : (
                  <>
                    {isBangla 
                      ? `${activePortalLabelBn} পোর্টাল-এ প্রবেশ করুন`
                      : `Enter Portal as ${activePortalLabelEn}`}
                    <ArrowRight style={{ width: 16, height: 16 }} />
                  </>
                )}
              </button>
            </form>
          )}

          {activeTab !== 'patient' && activeTab !== 'super_admin' && (
            <div style={{ marginTop: '16px', textAlign: 'center', fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>
              {isBangla ? 'নতুন ডাক্তার, ফার্মেসি মালিক অথবা হাসপাতাল কর্তৃপক্ষ? ' : 'Are you a new doctor, pharmacy owner, or hospital authority? '}
              <Link to="/register" style={{ color: 'var(--color-primary)', fontWeight: 700 }}>
                Register your facility / সাইন আপ করুন →
              </Link>
            </div>
          )}

          {/* Discreet Admin Login Access */}
          <div style={{ marginTop: '12px', textAlign: 'center' }}>
            <button
              type="button"
              onClick={() => {
                setActiveTab(activeTab === 'super_admin' ? 'patient' : 'super_admin');
                setError('');
              }}
              style={{
                background: 'none',
                border: 'none',
                padding: '2px 8px',
                fontSize: '0.73rem',
                color: activeTab === 'super_admin' ? 'var(--color-primary)' : 'var(--color-text-muted)',
                fontWeight: activeTab === 'super_admin' ? 700 : 500,
                cursor: 'pointer',
                textDecoration: 'underline',
                opacity: 0.85
              }}
            >
              {activeTab === 'super_admin'
                ? (isBangla ? '← সাধারণ পোর্টালে ফিরুন' : '← Return to Healthcare Portals')
                : (isBangla ? 'সিস্টেম অ্যাডমিন পোর্টাল' : 'Platform Admin Sign-in')}
            </button>
          </div>

          <p className="auth-footer" style={{ marginTop: '16px' }}>
            By continuing, you agree to Niramoy's{' '}
            <button
              type="button"
              onClick={() => setLegalModal({ open: true, topic: 'terms' })}
              style={{
                background: 'none', border: 'none', padding: 0,
                color: 'var(--color-primary)', fontWeight: 700,
                cursor: 'pointer', textDecoration: 'underline'
              }}
            >
              Terms of Service
            </button>{' '}
            and{' '}
            <button
              type="button"
              onClick={() => setLegalModal({ open: true, topic: 'privacy' })}
              style={{
                background: 'none', border: 'none', padding: 0,
                color: 'var(--color-primary)', fontWeight: 700,
                cursor: 'pointer', textDecoration: 'underline'
              }}
            >
              Privacy Policy
            </button>.
          </p>
        </div>
      </div>

      {/* Interactive Contextual Terms Modal */}
      <LegalContextModal
        isOpen={legalModal.open}
        initialTopic={legalModal.topic}
        onClose={() => setLegalModal({ open: false, topic: 'terms' })}
      />
    </div>
  );
}
