import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import NiramoyLogo from '../Common/NiramoyLogo';
import {
  Mail, Lock, Eye, EyeOff, AlertCircle, Loader2,
  CheckCircle2, Stethoscope, Shield, Users, ArrowRight
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
  { label: '👑 Super Admin', email: 'admin@niramoy.health', password: 'Admin@123456', role: 'super_admin' },
  { label: '🏥 Hospital Authority', email: 'hospital.admin@niramoy.health', password: 'Hospital@123456', role: 'hospital_admin' },
  { label: '💊 Pharmacy Owner', email: 'pharmacy.owner@niramoy.health', password: 'Pharmacy@123456', role: 'pharmacy_owner' },
  { label: '🩺 Doctor', email: 'doctor@niramoy.health', password: 'Doctor@123456', role: 'doctor' },
  { label: '🧑‍⚕️ Patient', email: 'patient@niramoy.health', password: 'Patient@123456', role: 'patient' },
];

export default function SignInPage() {
  const { login, isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from || null;

  const [form, setForm] = useState({ email: '', password: '' });
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
    setForm({ email: demo.email, password: demo.password });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.email || !form.password) {
      setError('Please enter both email and password.');
      return;
    }
    setLoading(true);
    try {
      const data = await login({ email: form.email, password: form.password });
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
        <div className="auth-form-card" style={{ maxWidth: 480 }}>
          <Link to="/" style={{ textDecoration: 'none', marginBottom: 20, display: 'inline-block' }}>
            <NiramoyLogo size="md" />
          </Link>

          <h1 className="auth-form-card__title">Sign In</h1>
          <p className="auth-form-card__subtitle">
            Don't have an account?{' '}
            <Link to="/register" style={{ color: 'var(--color-primary)', fontWeight: 700 }}>Create an account</Link>
          </p>

          {/* Quick Demo Logins Bar */}
          <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)', padding: '12px 14px', marginBottom: 20 }}>
            <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>
              ⚡ Fast Test Credentials (One-Click)
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {DEMO_ACCOUNTS.map((d, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => fillDemo(d)}
                  style={{
                    padding: '4px 9px', borderRadius: 99,
                    border: form.email === d.email ? '1.5px solid var(--color-primary)' : '1px solid var(--color-border)',
                    background: form.email === d.email ? 'rgba(13,124,110,0.1)' : 'white',
                    color: form.email === d.email ? 'var(--color-primary)' : 'var(--color-text-primary)',
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
              <label htmlFor="email">Email Address</label>
              <div className="auth-input-wrap">
                <Mail style={{ width: 16, height: 16 }} />
                <input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={e => setForm({ ...form, email: e.target.value })}
                  autoComplete="email"
                  required
                  aria-label="Email address"
                />
              </div>
            </div>

            <div className="auth-field">
              <label htmlFor="password">Password</label>
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
              style={{ width: '100%', justifyContent: 'center', padding: '13px 24px', fontSize: 'var(--text-base)', marginTop: 'var(--sp-2)', gap: 8 }}
              disabled={loading}
            >
              {loading ? (
                <><Loader2 style={{ width: 18, height: 18, animation: 'spin 1s linear infinite' }} /> Signing in…</>
              ) : (
                <>Sign In to Portal <ArrowRight style={{ width: 16, height: 16 }} /></>
              )}
            </button>
          </form>

          <p className="auth-footer">
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
