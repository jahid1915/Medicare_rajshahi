import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import NiramoyLogo from '../Common/NiramoyLogo';
import {
  Mail, Lock, Eye, EyeOff, AlertCircle, Loader2,
  CheckCircle2, Stethoscope, Shield, Users, ArrowRight,
  Phone, Smartphone, Building2, Pill, UserCheck
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

const ROLE_TABS = [
  { id: 'patient', label: '🧑‍⚕️ Patient (রোগী)', roleName: 'Patient' },
  { id: 'doctor', label: '🩺 Doctor (ডাক্তার)', roleName: 'Doctor' },
  { id: 'hospital_admin', label: '🏥 Hospital (হাসপাতাল)', roleName: 'Hospital Authority' },
  { id: 'pharmacy_owner', label: '💊 Pharmacy (ফার্মেসি)', roleName: 'Pharmacy Owner' },
  { id: 'super_admin', label: '👑 Admin (অ্যাডমিন)', roleName: 'Admin' }
];

const DEMO_ACCOUNTS = [
  { roleKey: 'patient', label: '🧑‍⚕️ Patient (Rahim)', identifier: '01711223344', password: 'Pass@123456', role: 'patient' },
  { roleKey: 'patient', label: '🧑‍⚕️ Patient (Email)', identifier: 'patient@niramoy.health', password: 'Patient@123456', role: 'patient' },
  { roleKey: 'doctor', label: '🩺 Doctor', identifier: 'doctor@niramoy.health', password: 'Doctor@123456', role: 'doctor' },
  { roleKey: 'hospital_admin', label: '🏥 Hospital Authority', identifier: 'hospital.admin@niramoy.health', password: 'Hospital@123456', role: 'hospital_admin' },
  { roleKey: 'pharmacy_owner', label: '💊 Pharmacy Owner', identifier: 'pharmacy.owner@niramoy.health', password: 'Pharmacy@123456', role: 'pharmacy_owner' },
  { roleKey: 'super_admin', label: '👑 Super Admin', identifier: 'admin@niramoy.health', password: 'Admin@123456', role: 'super_admin' },
];

export default function SignInPage() {
  const { login, isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from || null;

  const [activeTab, setActiveTab] = useState('patient');
  const [form, setForm] = useState({ identifier: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

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
          <Link to="/" style={{ textDecoration: 'none', marginBottom: 16, display: 'inline-block' }}>
            <NiramoyLogo size="md" />
          </Link>

          <h1 className="auth-form-card__title" style={{ marginBottom: '6px' }}>Sign In to Niramoy</h1>
          <p className="auth-form-card__subtitle" style={{ marginBottom: '16px' }}>
            Don't have an account?{' '}
            <Link to="/register" style={{ color: 'var(--color-primary)', fontWeight: 700 }}>
              Create an account / সাইন আপ করুন
            </Link>
          </p>

          {/* Role Tabs */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '18px', padding: '4px', background: 'var(--color-surface, #f8fafc)', borderRadius: '12px', border: '1px solid var(--color-border, #e2eceb)' }}>
            {ROLE_TABS.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => {
                  setActiveTab(tab.id);
                  setError('');
                }}
                style={{
                  flex: '1 1 auto',
                  padding: '7px 10px',
                  borderRadius: '8px',
                  border: 'none',
                  background: activeTab === tab.id ? 'var(--color-primary, #0d7c6e)' : 'transparent',
                  color: activeTab === tab.id ? '#ffffff' : 'var(--color-text-secondary, #2f4847)',
                  fontSize: '0.74rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Role specific info box */}
          {activeTab === 'patient' ? (
            <div style={{ padding: '10px 14px', borderRadius: '10px', background: 'rgba(13,124,110,0.08)', border: '1px solid rgba(13,124,110,0.2)', marginBottom: '16px', fontSize: '0.78rem', color: 'var(--color-text-primary)' }}>
              <strong>Patient Sign-in (রোগী লগইন):</strong> Enter your <strong>Mobile Number</strong> (e.g. 01711223344) and <strong>Password</strong> to access your dashboard and service history.
            </div>
          ) : (
            <div style={{ padding: '10px 14px', borderRadius: '10px', background: 'rgba(2,132,199,0.08)', border: '1px solid rgba(2,132,199,0.2)', marginBottom: '16px', fontSize: '0.78rem', color: '#0369a1', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <strong>Professional Sign-in:</strong> Doctors, Hospitals, and Pharmacies require verified registration.
              </div>
              <Link to={`/register?role=${activeTab}`} style={{ color: '#0284c7', fontWeight: 800, textDecoration: 'underline', flexShrink: 0, marginLeft: '8px' }}>
                Sign Up →
              </Link>
            </div>
          )}

          {/* Quick Demo Logins Bar */}
          <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)', padding: '10px 12px', marginBottom: 18 }}>
            <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6 }}>
              ⚡ One-Click Demo Credentials:
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {DEMO_ACCOUNTS.map((d, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => fillDemo(d)}
                  style={{
                    padding: '3px 8px', borderRadius: 99,
                    border: form.identifier === d.identifier ? '1.5px solid var(--color-primary)' : '1px solid var(--color-border)',
                    background: form.identifier === d.identifier ? 'rgba(13,124,110,0.1)' : 'white',
                    color: form.identifier === d.identifier ? 'var(--color-primary)' : 'var(--color-text-primary)',
                    fontSize: '11px', fontWeight: 600, cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                >
                  {d.label}
                </button>
              ))}
            </div>
          </div>

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

          <form onSubmit={handleSubmit} className="auth-form" noValidate>
            <div className="auth-field">
              <label htmlFor="identifier">
                {activeTab === 'patient' 
                  ? 'Mobile Number or Email (মোবাইল নম্বর বা ইমেইল)' 
                  : 'Email Address or Phone'}
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
              <label htmlFor="password">Password (পাসওয়ার্ড)</label>
              <div className="auth-input-wrap">
                <Lock style={{ width: 16, height: 16 }} />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
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
                <><Loader2 style={{ width: 18, height: 18, animation: 'spin 1s linear infinite' }} /> Signing in…</>
              ) : (
                <>
                  Sign In as {ROLE_TABS.find(t => t.id === activeTab)?.roleName || 'User'} 
                  <ArrowRight style={{ width: 16, height: 16 }} />
                </>
              )}
            </button>
          </form>

          {activeTab !== 'patient' && (
            <div style={{ marginTop: '16px', textAlign: 'center', fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>
              Are you a new doctor, pharmacy owner, or hospital authority?{' '}
              <Link to="/register" style={{ color: 'var(--color-primary)', fontWeight: 700 }}>
                Register your facility / সাইন আপ করুন →
              </Link>
            </div>
          )}

          <p className="auth-footer" style={{ marginTop: '16px' }}>
            By continuing, you agree to Niramoy's{' '}
            <span style={{ color: 'var(--color-primary)', cursor: 'default' }}>Terms of Service</span>{' '}
            and{' '}
            <span style={{ color: 'var(--color-primary)', cursor: 'default' }}>Privacy Policy</span>.
          </p>
        </div>
      </div>
    </div>
  );
}
