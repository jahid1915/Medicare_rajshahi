import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { HeartPulse, Mail, Lock, Eye, EyeOff, AlertCircle, Loader2 } from 'lucide-react';

export default function SignInPage() {
  const { login, isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from || null;

  const [form, setForm] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // If already logged in, redirect
  if (isAuthenticated && user) {
    const dest = from || getDashboardForRole(user.role);
    navigate(dest, { replace: true });
    return null;
  }

  function getDashboardForRole(role) {
    if (['hospital_admin', 'hospital_management', 'receptionist'].includes(role)) return '/hospital-portal';
    if (['pharmacy_owner', 'pharmacist'].includes(role)) return '/pharmacy-portal';
    if (['doctor', 'specialist_doctor'].includes(role)) return '/doctor-portal';
    if (['super_admin', 'compliance_auditor', 'researcher'].includes(role)) return '/admin';
    return '/dashboard';
  }

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
      const dest = from || getDashboardForRole(data.user.role);
      navigate(dest, { replace: true });
    } catch (err) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-card__header">
          <Link to="/" className="auth-card__logo">
            <div style={{
              width: 44, height: 44, borderRadius: 12,
              background: 'var(--primary)', display: 'flex',
              alignItems: 'center', justifyContent: 'center', color: 'white'
            }}>
              <HeartPulse style={{ width: 24, height: 24 }} />
            </div>
          </Link>
          <h1 className="auth-card__title">Welcome Back</h1>
          <p className="auth-card__subtitle">Sign in to your Medicare AI account</p>
        </div>

        {from && (
          <div className="auth-info-bar">
            Please sign in to continue to your requested page.
          </div>
        )}

        {error && (
          <div className="auth-error">
            <AlertCircle style={{ width: 16, height: 16, flexShrink: 0 }} />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="auth-field">
            <label>Email Address</label>
            <div className="auth-input-wrapper">
              <Mail style={{ width: 16, height: 16, color: 'var(--text-muted)' }} />
              <input
                type="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
                autoComplete="email"
                required
              />
            </div>
          </div>

          <div className="auth-field">
            <label>Password</label>
            <div className="auth-input-wrapper">
              <Lock style={{ width: 16, height: 16, color: 'var(--text-muted)' }} />
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter your password"
                value={form.password}
                onChange={e => setForm({ ...form, password: e.target.value })}
                autoComplete="current-password"
                required
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="auth-toggle-pw">
                {showPassword ? <EyeOff style={{ width: 16, height: 16 }} /> : <Eye style={{ width: 16, height: 16 }} />}
              </button>
            </div>
          </div>

          <button type="submit" className="btn btn-primary auth-submit" disabled={loading}>
            {loading ? <Loader2 style={{ width: 18, height: 18, animation: 'spin 1s linear infinite' }} /> : 'Sign In'}
          </button>
        </form>

        <div className="auth-footer">
          <span>Don't have an account?</span>
          <Link to="/register" state={from ? { from } : undefined}>Create Account</Link>
        </div>
      </div>
    </div>
  );
}
