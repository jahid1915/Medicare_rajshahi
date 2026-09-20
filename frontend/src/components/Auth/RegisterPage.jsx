import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { hospitalsAPI, pharmaciesAPI } from '../../services/api';
import NiramoyLogo from '../Common/NiramoyLogo';
import {
  User, Mail, Phone, Lock, Eye, EyeOff, AlertCircle, Loader2,
  Calendar, MapPin, ArrowRight, ShieldCheck, HeartPulse, Clock,
  Building2, Pill, Stethoscope, CheckCircle2, ChevronDown, Check,
  Briefcase, Award
} from 'lucide-react';

const ROLE_CONFIG = [
  {
    id: 'patient',
    label: 'Patient',
    title: 'Personal Healthcare & Discovery',
    icon: HeartPulse,
    color: '#0d7c6e',
    tagline: 'Book trusted doctors, store medical memory, and track orders across Rajshahi.',
    redirect: '/dashboard',
    perks: [
      'Instant appointments with 350+ verified Rajshahi doctors',
      'Digital prescription memory and smart health timelines',
      'Direct doorstep delivery from local licensed pharmacies'
    ]
  },
  {
    id: 'doctor',
    label: 'Doctor',
    title: 'Physician Clinical Workspace',
    icon: Stethoscope,
    color: '#0284c7',
    tagline: 'Manage daily chamber appointments, digital prescriptions, and patient consultation queues.',
    redirect: '/doctor-portal',
    perks: [
      'Verified BMDC digital badge and automated chamber schedule',
      'AI clinical co-pilot and real-time consultation workspace',
      'Direct patient communication & digital follow-up management'
    ]
  },
  {
    id: 'pharmacy_owner',
    label: 'Pharmacy Owner',
    title: 'Pharmacy Partner & Dispatch',
    icon: Pill,
    color: '#2563eb',
    tagline: 'Connect your Rajshahi pharmacy with patients for online orders and inventory dispatch.',
    redirect: '/pharmacy-portal',
    perks: [
      'Digital prescription order management with instant alerts',
      'Medicine inventory management and pricing controls',
      'Verified pharmacy badge for local Rajshahi areas'
    ]
  },
  {
    id: 'hospital_admin',
    label: 'Hospital Authority',
    title: 'Hospital Command & Operations',
    icon: Building2,
    color: '#7c3aed',
    tagline: 'Register according to your hospital to control live bed availability, ICU resources, and admissions.',
    redirect: '/hospital-portal',
    perks: [
      'Real-time bed, ICU, CCU & ventilator availability updates',
      'Hospital department administration & admission control',
      'Emergency warning broadcast for critical Rajshahi patients'
    ]
  }
];

export default function RegisterPage() {
  const { register, isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from || null;

  const [activeRole, setActiveRole] = useState('patient');
  const [hospitalsList, setHospitalsList] = useState([]);
  const [pharmaciesList, setPharmaciesList] = useState([]);
  const [loadingLists, setLoadingLists] = useState(false);

  const [form, setForm] = useState({
    name: '', email: '', phone: '', password: '', confirmPassword: '',
    // Patient
    date_of_birth: '', gender: '', address: '', blood_group: '',
    // Doctor
    specialization: '', qualifications: '', bmdc_number: '', chamber_address: '',
    // Pharmacy Owner
    pharmacy_id: '', pharmacy_name: '', pharmacy_area: 'Laxmipur', pharmacy_address: '', pharmacy_license: '',
    // Hospital Authority
    hospital_id: '', hospital_name: '', hospital_type: 'private', hospital_address: '', hospital_department: ''
  });

  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Load hospitals & pharmacies for selection
  useEffect(() => {
    let mounted = true;
    setLoadingLists(true);
    Promise.all([
      hospitalsAPI.getAll({ limit: 50 }).catch(() => ({ data: { hospitals: [] } })),
      pharmaciesAPI.getAll({ limit: 50 }).catch(() => ({ data: { pharmacies: [] } }))
    ]).then(([hospRes, pharmRes]) => {
      if (!mounted) return;
      setHospitalsList(hospRes.data?.hospitals || []);
      setPharmaciesList(pharmRes.data?.pharmacies || []);
    }).finally(() => {
      if (mounted) setLoadingLists(false);
    });
    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    if (isAuthenticated && user) {
      const matched = ROLE_CONFIG.find(r => r.id === user.role);
      navigate(from || (matched ? matched.redirect : '/dashboard'), { replace: true });
    }
  }, [isAuthenticated, user, navigate, from]);

  if (isAuthenticated && user) {
    return null;
  }

  const setField = (key, val) => setForm(prev => ({ ...prev, [key]: val }));

  const currentRoleConfig = ROLE_CONFIG.find(r => r.id === activeRole) || ROLE_CONFIG[0];

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

    // Role-specific validations
    if (activeRole === 'hospital_admin' && !form.hospital_id && !form.hospital_name) {
      setError('Please select or specify your hospital.');
      return;
    }

    if (activeRole === 'pharmacy_owner' && !form.pharmacy_id && !form.pharmacy_name) {
      setError('Please select or specify your pharmacy name.');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        name: form.name.trim(),
        email: form.email.trim().toLowerCase(),
        phone: form.phone ? form.phone.trim() : undefined,
        password: form.password,
        role: activeRole,

        // Patient fields
        date_of_birth: activeRole === 'patient' && form.date_of_birth ? form.date_of_birth : undefined,
        gender: activeRole === 'patient' && form.gender ? form.gender : undefined,
        address: form.address ? form.address.trim() : undefined,
        blood_group: activeRole === 'patient' && form.blood_group ? form.blood_group : undefined,

        // Doctor fields
        specialization: activeRole === 'doctor' && form.specialization ? form.specialization.trim() : undefined,
        qualifications: activeRole === 'doctor' && form.qualifications ? form.qualifications.trim() : undefined,
        bmdc_number: activeRole === 'doctor' && form.bmdc_number ? form.bmdc_number.trim() : undefined,

        // Pharmacy Owner fields
        pharmacy_id: activeRole === 'pharmacy_owner' && form.pharmacy_id ? form.pharmacy_id : undefined,
        pharmacy_name: activeRole === 'pharmacy_owner' && form.pharmacy_name ? form.pharmacy_name.trim() : undefined,
        pharmacy_address: activeRole === 'pharmacy_owner' && form.pharmacy_address ? form.pharmacy_address.trim() : undefined,
        pharmacy_area: activeRole === 'pharmacy_owner' && form.pharmacy_area ? form.pharmacy_area : undefined,
        pharmacy_license: activeRole === 'pharmacy_owner' && form.pharmacy_license ? form.pharmacy_license.trim() : undefined,

        // Hospital Authority fields
        hospital_id: activeRole === 'hospital_admin' && form.hospital_id ? form.hospital_id : undefined,
        hospital_name: activeRole === 'hospital_admin' && form.hospital_name ? form.hospital_name.trim() : undefined,
        hospital_type: activeRole === 'hospital_admin' && form.hospital_type ? form.hospital_type : undefined,
        hospital_address: activeRole === 'hospital_admin' && form.hospital_address ? form.hospital_address.trim() : undefined,
        hospital_department: activeRole === 'hospital_admin' && form.hospital_department ? form.hospital_department.trim() : undefined,
      };

      const res = await register(payload);
      const targetPath = currentRoleConfig.redirect;
      navigate(from || targetPath, { replace: true });
    } catch (err) {
      setError(err.message || 'Registration failed. Please check details and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-layout" style={{ minHeight: '100vh', background: 'var(--color-surface)' }}>
      {/* Left Visual Panel */}
      <div className="auth-visual" style={{ background: `linear-gradient(145deg, #094a42 0%, ${currentRoleConfig.color} 100%)` }}>
        <div className="auth-visual__grid" />
        <div style={{ position: 'relative', zIndex: 1, width: '100%', maxWidth: 420 }}>
          {/* Logo */}
          <Link to="/" style={{ display: 'inline-block', marginBottom: 'var(--sp-8)', textDecoration: 'none' }}>
            <NiramoyLogo size="lg" variant="light" tagline="Healthcare Network" />
          </Link>

          {/* Dynamic Role Badge */}
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 12px', borderRadius: 99, background: 'rgba(255,255,255,0.18)', border: '1px solid rgba(255,255,255,0.25)', color: 'white', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 16 }}>
            <currentRoleConfig.icon style={{ width: 14, height: 14 }} /> {currentRoleConfig.label} Registration
          </div>

          <div className="auth-visual__title" style={{ fontSize: '1.9rem', lineHeight: 1.25, marginBottom: 12 }}>
            {currentRoleConfig.title}
          </div>
          <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: 'var(--text-base)', lineHeight: 1.6, marginBottom: 'var(--sp-8)' }}>
            {currentRoleConfig.tagline}
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {currentRoleConfig.perks.map((perk, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                <div style={{ width: 28, height: 28, borderRadius: 8, background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 2 }}>
                  <Check style={{ width: 14, height: 14, color: 'white' }} />
                </div>
                <span style={{ color: 'rgba(255,255,255,0.9)', fontSize: 'var(--text-sm)', lineHeight: 1.5 }}>
                  {perk}
                </span>
              </div>
            ))}
          </div>

          <div style={{ marginTop: 40, paddingTop: 24, borderTop: '1px solid rgba(255,255,255,0.2)', color: 'rgba(255,255,255,0.75)', fontSize: '12px' }}>
            Serving Rajshahi Division with verified healthcare professionals & digital infrastructure.
          </div>
        </div>
      </div>

      {/* Right Form Panel */}
      <div className="auth-form-side" style={{ padding: 'var(--sp-8) var(--sp-4)' }}>
        <div className="auth-form-card" style={{ maxWidth: 580, padding: '36px 32px' }}>
          <h1 className="auth-form-card__title" style={{ fontSize: '1.65rem', marginBottom: 4 }}>
            Create Niramoy Account
          </h1>
          <p className="auth-form-card__subtitle" style={{ marginBottom: 20 }}>
            Already registered?{' '}
            <Link to="/signin" style={{ color: 'var(--color-primary)', fontWeight: 700 }}>Sign In to Portal</Link>
          </p>

          {/* Role Switcher Tabs */}
          <div style={{ marginBottom: 24 }}>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>
              Select Account Type
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
              {ROLE_CONFIG.map(r => {
                const isSelected = activeRole === r.id;
                const Icon = r.icon;
                return (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => { setActiveRole(r.id); setError(''); }}
                    style={{
                      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                      gap: 6, padding: '12px 6px', borderRadius: 'var(--radius-lg)',
                      border: isSelected ? `2px solid ${r.color}` : '1.5px solid var(--color-border)',
                      background: isSelected ? `${r.color}10` : 'white',
                      cursor: 'pointer', transition: 'all var(--trans-fast)'
                    }}
                  >
                    <Icon style={{ width: 20, height: 20, color: isSelected ? r.color : 'var(--color-text-muted)' }} />
                    <span style={{ fontSize: '11px', fontWeight: isSelected ? 800 : 600, color: isSelected ? r.color : 'var(--color-text-primary)', textAlign: 'center', lineHeight: 1.2 }}>
                      {r.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {error && (
            <div className="auth-error" style={{ marginBottom: 20 }}>
              <AlertCircle style={{ width: 16, height: 16, flexShrink: 0 }} />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="auth-form" noValidate>
            {/* ═══ COMMON FIELDS ═══ */}
            <div className="auth-field">
              <label htmlFor="reg-name">
                {activeRole === 'doctor' ? 'Doctor Full Name *' : activeRole === 'pharmacy_owner' ? 'Owner / Pharmacist Name *' : activeRole === 'hospital_admin' ? 'Official Authority Name *' : 'Full Name *'}
              </label>
              <div className="auth-input-wrap">
                <User style={{ width: 16, height: 16 }} />
                <input
                  id="reg-name"
                  type="text"
                  placeholder={activeRole === 'doctor' ? 'e.g. Dr. Md. Tariqul Islam' : 'Your full name'}
                  value={form.name}
                  onChange={e => setField('name', e.target.value)}
                  required
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12 }}>
              <div className="auth-field">
                <label htmlFor="reg-email">Email Address *</label>
                <div className="auth-input-wrap">
                  <Mail style={{ width: 16, height: 16 }} />
                  <input
                    id="reg-email"
                    type="email"
                    placeholder="you@example.com"
                    value={form.email}
                    onChange={e => setField('email', e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="auth-field">
                <label htmlFor="reg-phone">Mobile Number</label>
                <div className="auth-input-wrap">
                  <Phone style={{ width: 16, height: 16 }} />
                  <input
                    id="reg-phone"
                    type="tel"
                    placeholder="01XXXXXXXXX"
                    value={form.phone}
                    onChange={e => setField('phone', e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* ═══ ROLE-SPECIFIC: HOSPITAL AUTHORITY (ACCORDING TO EACH HOSPITAL) ═══ */}
            {activeRole === 'hospital_admin' && (
              <div style={{ background: '#f8fafc', border: '1.5px solid #e2e8f0', borderRadius: 'var(--radius-xl)', padding: '16px 18px', margin: '4px 0 14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 700, fontSize: '13px', color: '#7c3aed', marginBottom: 12 }}>
                  <Building2 style={{ width: 16, height: 16 }} /> Hospital Association Details
                </div>

                <div className="auth-field" style={{ marginBottom: 12 }}>
                  <label htmlFor="hosp-select">Associated Rajshahi Hospital *</label>
                  <select
                    id="hosp-select"
                    value={form.hospital_id}
                    onChange={e => {
                      const selId = e.target.value;
                      setField('hospital_id', selId);
                      if (selId) {
                        const matchedHosp = hospitalsList.find(h => h._id === selId);
                        if (matchedHosp) setField('hospital_name', matchedHosp.name);
                      }
                    }}
                    style={{
                      width: '100%', padding: '11px 14px', borderRadius: 'var(--radius-lg)',
                      border: '1.5px solid var(--color-border)', background: 'white',
                      fontSize: 'var(--text-sm)', outline: 'none'
                    }}
                  >
                    <option value="">-- Choose Hospital in Rajshahi --</option>
                    {hospitalsList.map(h => (
                      <option key={h._id} value={h._id}>
                        {h.name} ({h.area || 'Rajshahi'}) [{h.type}]
                      </option>
                    ))}
                    <option value="custom">+ Other / Add New Hospital</option>
                  </select>
                </div>

                {(form.hospital_id === 'custom' || !form.hospital_id) && (
                  <>
                    <div className="auth-field" style={{ marginBottom: 12 }}>
                      <label htmlFor="hosp-name">Hospital Name (if not listed)</label>
                      <input
                        id="hosp-name"
                        type="text"
                        placeholder="e.g. Barendra Specialized Hospital"
                        value={form.hospital_name}
                        onChange={e => setField('hospital_name', e.target.value)}
                        style={{
                          width: '100%', padding: '10px 14px', borderRadius: 'var(--radius-lg)',
                          border: '1.5px solid var(--color-border)', fontSize: 'var(--text-sm)'
                        }}
                      />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
                      <div className="auth-field">
                        <label htmlFor="hosp-type">Hospital Category</label>
                        <select
                          id="hosp-type"
                          value={form.hospital_type}
                          onChange={e => setField('hospital_type', e.target.value)}
                          style={{ width: '100%', padding: '10px 12px', borderRadius: 'var(--radius-lg)', border: '1.5px solid var(--color-border)', background: 'white', fontSize: 'var(--text-sm)' }}
                        >
                          <option value="private">Private Hospital</option>
                          <option value="government">Government Hospital</option>
                          <option value="clinic">Clinic</option>
                          <option value="ngo">NGO Hospital</option>
                        </select>
                      </div>
                      <div className="auth-field">
                        <label htmlFor="hosp-address">Hospital Address / Location</label>
                        <input
                          id="hosp-address"
                          type="text"
                          placeholder="e.g. Laxmipur, Rajshahi"
                          value={form.hospital_address}
                          onChange={e => setField('hospital_address', e.target.value)}
                          style={{ width: '100%', padding: '10px 12px', borderRadius: 'var(--radius-lg)', border: '1.5px solid var(--color-border)', fontSize: 'var(--text-sm)' }}
                        />
                      </div>
                    </div>
                  </>
                )}

                <div className="auth-field">
                  <label htmlFor="hosp-dept">Designation / Role in Hospital</label>
                  <input
                    id="hosp-dept"
                    type="text"
                    placeholder="e.g. Superintendent, Medical Director, Bed Manager"
                    value={form.hospital_department}
                    onChange={e => setField('hospital_department', e.target.value)}
                    style={{
                      width: '100%', padding: '10px 14px', borderRadius: 'var(--radius-lg)',
                      border: '1.5px solid var(--color-border)', fontSize: 'var(--text-sm)'
                    }}
                  />
                </div>
              </div>
            )}

            {/* ═══ ROLE-SPECIFIC: PHARMACY OWNER ═══ */}
            {activeRole === 'pharmacy_owner' && (
              <div style={{ background: '#f8fafc', border: '1.5px solid #e2e8f0', borderRadius: 'var(--radius-xl)', padding: '16px 18px', margin: '4px 0 14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 700, fontSize: '13px', color: '#2563eb', marginBottom: 12 }}>
                  <Pill style={{ width: 16, height: 16 }} /> Pharmacy Store Details
                </div>

                <div className="auth-field" style={{ marginBottom: 12 }}>
                  <label htmlFor="pharm-select">Select Existing Rajshahi Pharmacy or Register New</label>
                  <select
                    id="pharm-select"
                    value={form.pharmacy_id}
                    onChange={e => {
                      const selId = e.target.value;
                      setField('pharmacy_id', selId);
                      if (selId && selId !== 'new') {
                        const matched = pharmaciesList.find(p => p._id === selId);
                        if (matched) {
                          setField('pharmacy_name', matched.name);
                          setField('pharmacy_area', matched.area || 'Laxmipur');
                          setField('pharmacy_address', matched.address || '');
                        }
                      }
                    }}
                    style={{
                      width: '100%', padding: '11px 14px', borderRadius: 'var(--radius-lg)',
                      border: '1.5px solid var(--color-border)', background: 'white',
                      fontSize: 'var(--text-sm)', outline: 'none'
                    }}
                  >
                    <option value="">-- Choose Existing Pharmacy --</option>
                    {pharmaciesList.map(p => (
                      <option key={p._id} value={p._id}>{p.name} ({p.area || 'Rajshahi'})</option>
                    ))}
                    <option value="new">+ Register My New Pharmacy</option>
                  </select>
                </div>

                {(form.pharmacy_id === 'new' || !form.pharmacy_id) && (
                  <>
                    <div className="auth-field" style={{ marginBottom: 12 }}>
                      <label htmlFor="pharm-name">Pharmacy Name *</label>
                      <input
                        id="pharm-name"
                        type="text"
                        placeholder="e.g. Al-Madina Model Pharmacy"
                        value={form.pharmacy_name}
                        onChange={e => setField('pharmacy_name', e.target.value)}
                        style={{
                          width: '100%', padding: '10px 14px', borderRadius: 'var(--radius-lg)',
                          border: '1.5px solid var(--color-border)', fontSize: 'var(--text-sm)'
                        }}
                      />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
                      <div className="auth-field">
                        <label htmlFor="pharm-area">Rajshahi Area</label>
                        <select
                          id="pharm-area"
                          value={form.pharmacy_area}
                          onChange={e => setField('pharmacy_area', e.target.value)}
                          style={{ width: '100%', padding: '10px 12px', borderRadius: 'var(--radius-lg)', border: '1.5px solid var(--color-border)', background: 'white', fontSize: 'var(--text-sm)' }}
                        >
                          <option value="Laxmipur">Laxmipur</option>
                          <option value="Shaheb Bazar">Shaheb Bazar</option>
                          <option value="Kazihata">Kazihata</option>
                          <option value="Medical Road">Medical Road</option>
                          <option value="Talaimari">Talaimari</option>
                          <option value="Court Station">Court Station</option>
                          <option value="Boalia">Boalia</option>
                          <option value="Motihar">Motihar</option>
                        </select>
                      </div>

                      <div className="auth-field">
                        <label htmlFor="pharm-license">Drug License No. (DGDA)</label>
                        <input
                          id="pharm-license"
                          type="text"
                          placeholder="e.g. RAJ-DL-88219"
                          value={form.pharmacy_license}
                          onChange={e => setField('pharmacy_license', e.target.value)}
                          style={{ width: '100%', padding: '10px 12px', borderRadius: 'var(--radius-lg)', border: '1.5px solid var(--color-border)', fontSize: 'var(--text-sm)' }}
                        />
                      </div>
                    </div>

                    <div className="auth-field">
                      <label htmlFor="pharm-addr">Full Pharmacy Street Address</label>
                      <input
                        id="pharm-addr"
                        type="text"
                        placeholder="e.g. Holding 42, Laxmipur Hospital Mor, Rajshahi"
                        value={form.pharmacy_address}
                        onChange={e => setField('pharmacy_address', e.target.value)}
                        style={{
                          width: '100%', padding: '10px 14px', borderRadius: 'var(--radius-lg)',
                          border: '1.5px solid var(--color-border)', fontSize: 'var(--text-sm)'
                        }}
                      />
                    </div>
                  </>
                )}
              </div>
            )}

            {/* ═══ ROLE-SPECIFIC: DOCTOR ═══ */}
            {activeRole === 'doctor' && (
              <div style={{ background: '#f8fafc', border: '1.5px solid #e2e8f0', borderRadius: 'var(--radius-xl)', padding: '16px 18px', margin: '4px 0 14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 700, fontSize: '13px', color: '#0284c7', marginBottom: 12 }}>
                  <Award style={{ width: 16, height: 16 }} /> Physician Credentials & Chamber
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
                  <div className="auth-field">
                    <label htmlFor="doc-spec">Specialization *</label>
                    <input
                      id="doc-spec"
                      type="text"
                      placeholder="e.g. Cardiology, Medicine, Pediatrics"
                      value={form.specialization}
                      onChange={e => setField('specialization', e.target.value)}
                      style={{ width: '100%', padding: '10px 12px', borderRadius: 'var(--radius-lg)', border: '1.5px solid var(--color-border)', fontSize: 'var(--text-sm)' }}
                    />
                  </div>
                  <div className="auth-field">
                    <label htmlFor="doc-bmdc">BMDC Registration No. *</label>
                    <input
                      id="doc-bmdc"
                      type="text"
                      placeholder="e.g. A-74291"
                      value={form.bmdc_number}
                      onChange={e => setField('bmdc_number', e.target.value)}
                      style={{ width: '100%', padding: '10px 12px', borderRadius: 'var(--radius-lg)', border: '1.5px solid var(--color-border)', fontSize: 'var(--text-sm)' }}
                    />
                  </div>
                </div>

                <div className="auth-field" style={{ marginBottom: 12 }}>
                  <label htmlFor="doc-qual">Degrees & Qualifications</label>
                  <input
                    id="doc-qual"
                    type="text"
                    placeholder="e.g. MBBS (DMC), FCPS (Medicine), MD (Cardiology)"
                    value={form.qualifications}
                    onChange={e => setField('qualifications', e.target.value)}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: 'var(--radius-lg)', border: '1.5px solid var(--color-border)', fontSize: 'var(--text-sm)' }}
                  />
                </div>
              </div>
            )}

            {/* ═══ ROLE-SPECIFIC: PATIENT PROFILE ═══ */}
            {activeRole === 'patient' && (
              <>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 12 }}>
                  <div className="auth-field">
                    <label htmlFor="dob">Date of Birth</label>
                    <div className="auth-input-wrap">
                      <Calendar style={{ width: 16, height: 16 }} />
                      <input
                        id="dob"
                        type="date"
                        value={form.date_of_birth}
                        onChange={e => setField('date_of_birth', e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="auth-field">
                    <label htmlFor="gender">Gender</label>
                    <select
                      id="gender"
                      value={form.gender}
                      onChange={e => setField('gender', e.target.value)}
                      style={{
                        width: '100%', padding: '11px 12px', borderRadius: 'var(--radius-lg)',
                        border: '1.5px solid var(--color-border)', background: 'white',
                        fontSize: 'var(--text-sm)', outline: 'none'
                      }}
                    >
                      <option value="">Select Gender</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  <div className="auth-field">
                    <label htmlFor="blood">Blood Group</label>
                    <select
                      id="blood"
                      value={form.blood_group}
                      onChange={e => setField('blood_group', e.target.value)}
                      style={{
                        width: '100%', padding: '11px 12px', borderRadius: 'var(--radius-lg)',
                        border: '1.5px solid var(--color-border)', background: 'white',
                        fontSize: 'var(--text-sm)', outline: 'none'
                      }}
                    >
                      <option value="">Blood Group</option>
                      <option value="A+">A+</option>
                      <option value="A-">A-</option>
                      <option value="B+">B+</option>
                      <option value="B-">B-</option>
                      <option value="O+">O+</option>
                      <option value="O-">O-</option>
                      <option value="AB+">AB+</option>
                      <option value="AB-">AB-</option>
                    </select>
                  </div>
                </div>

                <div className="auth-field">
                  <label htmlFor="address">Address in Rajshahi</label>
                  <div className="auth-input-wrap">
                    <MapPin style={{ width: 16, height: 16 }} />
                    <input
                      id="address"
                      type="text"
                      placeholder="e.g. Kazihata / Laxmipur, Rajshahi"
                      value={form.address}
                      onChange={e => setField('address', e.target.value)}
                    />
                  </div>
                </div>
              </>
            )}

            {/* ═══ PASSWORDS ═══ */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12 }}>
              <div className="auth-field">
                <label htmlFor="password">Password *</label>
                <div className="auth-input-wrap">
                  <Lock style={{ width: 16, height: 16 }} />
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Min 6 characters"
                    value={form.password}
                    onChange={e => setField('password', e.target.value)}
                    required
                    minLength={6}
                  />
                  <button
                    type="button"
                    className="auth-pw-toggle"
                    onClick={() => setShowPassword(v => !v)}
                  >
                    {showPassword ? <EyeOff style={{ width: 15, height: 15 }} /> : <Eye style={{ width: 15, height: 15 }} />}
                  </button>
                </div>
              </div>

              <div className="auth-field">
                <label htmlFor="confirmPassword">Confirm Password *</label>
                <div className="auth-input-wrap">
                  <Lock style={{ width: 16, height: 16 }} />
                  <input
                    id="confirmPassword"
                    type="password"
                    placeholder="Re-enter password"
                    value={form.confirmPassword}
                    onChange={e => setField('confirmPassword', e.target.value)}
                    required
                  />
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <button
              id="register-submit"
              type="submit"
              className="btn btn-primary"
              style={{
                width: '100%', justifyContent: 'center', padding: '13px 24px',
                fontSize: 'var(--text-base)', marginTop: 8, gap: 8,
                background: currentRoleConfig.color, borderColor: currentRoleConfig.color
              }}
              disabled={loading}
            >
              {loading ? (
                <><Loader2 style={{ width: 18, height: 18, animation: 'spin 1s linear infinite' }} /> Creating {currentRoleConfig.label} Account…</>
              ) : (
                <>Create {currentRoleConfig.label} Account <ArrowRight style={{ width: 16, height: 16 }} /></>
              )}
            </button>
          </form>

          <p className="auth-footer" style={{ marginTop: 20 }}>
            By registering, you agree to Niramoy's terms and privacy safeguards for Rajshahi healthcare network.
          </p>
        </div>
      </div>
    </div>
  );
}
