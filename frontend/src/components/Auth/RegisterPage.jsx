import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { HeartPulse, User, Mail, Phone, Lock, Eye, EyeOff, AlertCircle, Loader2, Calendar, MapPin } from 'lucide-react';

export default function RegisterPage() {
  const { register, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from || '/dashboard';

  const [form, setForm] = useState({
    name: '', email: '', phone: '', password: '', confirmPassword: '',
    date_of_birth: '', gender: '', address: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (isAuthenticated) {
    navigate(from, { replace: true });
    return null;
  }

  const setField = (key, val) => setForm(prev => ({ ...prev, [key]: val }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!form.name || !form.email || !form.password) {
      setError('Name, email and password are required.');
      return;
    }
    if (form.password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        name: form.name,
        email: form.email,
        phone: form.phone || undefined,
        password: form.password,
        role: 'patient',
        date_of_birth: form.date_of_birth || undefined,
        gender: form.gender || undefined,
        address: form.address || undefined
      };
      await register(payload);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card" style={{ maxWidth: 520 }}>
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
          <h1 className="auth-card__title">Create Patient Account</h1>
          <p className="auth-card__subtitle">Join Medicare AI to book appointments, order medicines & more</p>
        </div>

        {error && (
          <div className="auth-error">
            <AlertCircle style={{ width: 16, height: 16, flexShrink: 0 }} />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          {/* Name */}
          <div className="auth-field">
            <label>Full Name *</label>
            <div className="auth-input-wrapper">
              <User style={{ width: 16, height: 16, color: 'var(--text-muted)' }} />
              <input type="text" placeholder="Your full name" value={form.name}
                onChange={e => setField('name', e.target.value)} required />
            </div>
          </div>

          {/* Email */}
          <div className="auth-field">
            <label>Email Address *</label>
            <div className="auth-input-wrapper">
              <Mail style={{ width: 16, height: 16, color: 'var(--text-muted)' }} />
              <input type="email" placeholder="you@example.com" value={form.email}
                onChange={e => setField('email', e.target.value)} autoComplete="email" required />
            </div>
          </div>

          {/* Phone */}
          <div className="auth-field">
            <label>Mobile Number</label>
            <div className="auth-input-wrapper">
              <Phone style={{ width: 16, height: 16, color: 'var(--text-muted)' }} />
              <input type="tel" placeholder="01XXXXXXXXX" value={form.phone}
                onChange={e => setField('phone', e.target.value)} />
            </div>
          </div>

          {/* DOB + Gender */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div className="auth-field">
              <label>Date of Birth</label>
              <div className="auth-input-wrapper">
                <Calendar style={{ width: 16, height: 16, color: 'var(--text-muted)' }} />
                <input type="date" value={form.date_of_birth}
                  onChange={e => setField('date_of_birth', e.target.value)} />
              </div>
            </div>
            <div className="auth-field">
              <label>Gender</label>
              <select value={form.gender} onChange={e => setField('gender', e.target.value)}
                style={{
                  width: '100%', padding: '10px 12px', borderRadius: 10,
                  border: '1.5px solid var(--border-default)', background: 'var(--bg-input)',
                  color: 'var(--text-primary)', fontSize: '0.85rem'
                }}>
                <option value="">Select</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>

          {/* Address */}
          <div className="auth-field">
            <label>Address (Optional)</label>
            <div className="auth-input-wrapper">
              <MapPin style={{ width: 16, height: 16, color: 'var(--text-muted)' }} />
              <input type="text" placeholder="Your address" value={form.address}
                onChange={e => setField('address', e.target.value)} />
            </div>
          </div>

          {/* Password */}
          <div className="auth-field">
            <label>Password *</label>
            <div className="auth-input-wrapper">
              <Lock style={{ width: 16, height: 16, color: 'var(--text-muted)' }} />
              <input type={showPassword ? 'text' : 'password'} placeholder="Min 6 characters" value={form.password}
                onChange={e => setField('password', e.target.value)} required minLength={6} />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="auth-toggle-pw">
                {showPassword ? <EyeOff style={{ width: 16, height: 16 }} /> : <Eye style={{ width: 16, height: 16 }} />}
              </button>
            </div>
          </div>

          {/* Confirm Password */}
          <div className="auth-field">
            <label>Confirm Password *</label>
            <div className="auth-input-wrapper">
              <Lock style={{ width: 16, height: 16, color: 'var(--text-muted)' }} />
              <input type="password" placeholder="Re-enter your password" value={form.confirmPassword}
                onChange={e => setField('confirmPassword', e.target.value)} required />
            </div>
          </div>

          <button type="submit" className="btn btn-primary auth-submit" disabled={loading}>
            {loading ? <Loader2 style={{ width: 18, height: 18, animation: 'spin 1s linear infinite' }} /> : 'Create Account'}
          </button>
        </form>

        <div className="auth-footer">
          <span>Already have an account?</span>
          <Link to="/signin">Sign In</Link>
        </div>
      </div>
    </div>
  );
}
