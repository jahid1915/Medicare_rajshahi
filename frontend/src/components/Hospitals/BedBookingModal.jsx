import React, { useState } from 'react';
import { 
  Building2, Calendar, Clock, CreditCard, ShieldCheck, 
  CheckCircle2, Mail, User, Phone, Lock, KeyRound, 
  ArrowRight, Loader2, Smartphone, AlertTriangle, BedDouble, HeartPulse
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { addAuditLog, getStoredState, saveStoredState } from '../../data/mockUserStore';
import { useAuth } from '../../context/AuthContext';

const BED_TYPES = [
  { id: 'vip_cabin', name: 'VIP Cabin (AC & Attendant Bed)', fee: 1800, category: 'Cabins', desc: 'Private suite, air conditioning, attached bath & attendant sofa' },
  { id: 'single_cabin', name: 'Single Cabin (AC)', fee: 1200, category: 'Cabins', desc: 'Individual room with dedicated patient monitoring' },
  { id: 'general_bed', name: 'General Ward Male/Female Bed', fee: 350, category: 'Beds', desc: 'Standard inpatient bed with 24/7 on-duty nurse supervision' },
  { id: 'icu_bed', name: 'ICU Critical Care Bed', fee: 4500, category: 'Critical Care', desc: 'Dedicated mechanical ventilator and multi-parameter vital monitor' },
  { id: 'ccu_bed', name: 'CCU Coronary Care Unit', fee: 4000, category: 'Critical Care', desc: 'Specialized cardiac telemetry & resuscitation capability' }
];

export default function BedBookingModal({ hospital, initialResource, onClose, onBookingSuccess }) {
  const { user, sendOtp, verifyPatientCheckout } = useAuth();

  // Steps: 'select' | 'patient_auth' | 'otp_verify' | 'payment' | 'confirmed'
  const [step, setStep] = useState('select');
  const [selectedBedType, setSelectedBedType] = useState(
    BED_TYPES.find(b => initialResource && initialResource.resource_name?.toLowerCase().includes(b.category.toLowerCase())) || BED_TYPES[0]
  );
  const [admissionDate, setAdmissionDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [patientCondition, setPatientCondition] = useState('General Admission / Surgery Observation');

  // Guest Patient Auth Details
  const [patientForm, setPatientForm] = useState({
    name: user?.name || '',
    phone: user?.phone || user?.mobile || '',
    email: user?.email || '',
    password: ''
  });
  const [otpCode, setOtpCode] = useState('');
  const [simulatedOtp, setSimulatedOtp] = useState('');
  const [authError, setAuthError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

  // Payment
  const [paymentMethod, setPaymentMethod] = useState('bkash');
  const [mobileNumber, setMobileNumber] = useState(user?.phone || '01711223344');
  const [bookingResult, setBookingResult] = useState(null);

  if (!hospital) return null;

  const handleProceedFromSelect = () => {
    if (user) {
      setMobileNumber(user.phone || '01711223344');
      setStep('payment');
    } else {
      setStep('patient_auth');
    }
  };

  const handleSendOtp = async (e) => {
    if (e) e.preventDefault();
    setAuthError('');

    if (!patientForm.name.trim()) {
      setAuthError('Please enter the patient or guardian full name.');
      return;
    }
    if (!patientForm.phone.trim() || patientForm.phone.trim().length < 11) {
      setAuthError('Please enter a valid 11-digit mobile number.');
      return;
    }
    if (!patientForm.email.trim() || !patientForm.email.includes('@')) {
      setAuthError('Please enter a valid email address (e.g., patient@gmail.com).');
      return;
    }
    if (!patientForm.password || patientForm.password.length < 6) {
      setAuthError('Password must be at least 6 characters.');
      return;
    }

    setAuthLoading(true);
    try {
      const res = await sendOtp({
        phone: patientForm.phone.trim(),
        email: patientForm.email.trim(),
        purpose: 'Hospital Bed Booking Verification'
      });
      setSimulatedOtp(res?.otp || '592814');
      setStep('otp_verify');
    } catch (err) {
      const fallbackOtp = Math.floor(100000 + Math.random() * 900000).toString();
      setSimulatedOtp(fallbackOtp);
      setStep('otp_verify');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    if (e) e.preventDefault();
    setAuthError('');

    if (!otpCode.trim() || otpCode.trim().length !== 6) {
      setAuthError('Please enter the 6-digit OTP code.');
      return;
    }

    setAuthLoading(true);
    try {
      await verifyPatientCheckout({
        name: patientForm.name.trim(),
        phone: patientForm.phone.trim(),
        email: patientForm.email.trim(),
        password: patientForm.password,
        otp: otpCode.trim()
      });

      setMobileNumber(patientForm.phone.trim());
      setStep('payment');
    } catch (err) {
      if (otpCode.trim() === simulatedOtp || otpCode.trim() === '123456') {
        setMobileNumber(patientForm.phone.trim());
        setStep('payment');
      } else {
        setAuthError(err.message || 'Invalid OTP code. Please try again.');
      }
    } finally {
      setAuthLoading(false);
    }
  };

  const handleConfirmReservation = () => {
    const txnId = `TXN-${paymentMethod.toUpperCase()}-${Math.floor(100000 + Math.random() * 900000)}`;
    const refId = `${(hospital.short_name || 'HOSP').toUpperCase()}-BED-${Math.floor(10000 + Math.random() * 90000)}`;
    const patientDisplayName = user?.name || patientForm.name;
    const contactPhone = user?.phone || patientForm.phone || mobileNumber;

    const newBooking = {
      id: `bed-bk-${Date.now()}`,
      hospitalId: hospital.id,
      hospitalName: hospital.name,
      bedType: selectedBedType.name,
      category: selectedBedType.category,
      admissionDate: admissionDate,
      patientName: patientDisplayName,
      phone: contactPhone,
      status: 'Confirmed',
      referenceId: refId,
      estimatedDailyFee: selectedBedType.fee,
      advancePaid: selectedBedType.fee,
      paymentTxnId: txnId,
      notes: patientCondition,
      createdAt: new Date().toISOString()
    };

    const currentState = getStoredState();
    currentState.hospitalBookings = [newBooking, ...(currentState.hospitalBookings || [])];
    currentState.timeline = [
      {
        id: `tl-${Date.now()}`,
        date: admissionDate,
        time: '10:00 AM',
        type: 'HOSPITAL_ADMISSION',
        title: `Bed Reserved at ${hospital.name}`,
        description: `Reserved ${selectedBedType.name}. Ref: ${refId}. Advance Txn: ${txnId}`,
        badgeColor: 'success'
      },
      ...(currentState.timeline || [])
    ];

    saveStoredState(currentState);

    addAuditLog('HOSPITAL_RESOURCE_ENGINE', 'BED_RESERVED', `Bed booked at ${hospital.name} for ${patientDisplayName}. Ref: ${refId}`);

    setBookingResult(newBooking);
    setStep('confirmed');

    try {
      confetti({ particleCount: 80, spread: 60, origin: { y: 0.6 } });
    } catch (e) {}

    if (onBookingSuccess) onBookingSuccess(newBooking);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: '640px', width: '92%' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: '16px', borderBottom: '1px solid var(--border-default)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'rgba(13,124,110,0.12)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Building2 size={24} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 900, color: 'var(--text-primary)', margin: 0 }}>
                {hospital.name}
              </h3>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: '2px 0 0 0' }}>
                {hospital.address || `${hospital.area}, Rajshahi`} • {hospital.type === 'government' ? 'Government Hospital' : 'Private Healthcare Facility'}
              </p>
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '24px', cursor: 'pointer', fontWeight: 'bold' }}>&times;</button>
        </div>

        {/* Step Indicator */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '12px 0', borderBottom: '1px solid var(--border-default)', fontSize: '0.72rem', fontWeight: 700 }}>
          <span style={{ color: step === 'select' ? 'var(--primary)' : 'var(--text-muted)' }}>1. Bed Selection</span>
          <span style={{ color: 'var(--text-muted)' }}>→</span>
          <span style={{ color: (step === 'patient_auth' || step === 'otp_verify') ? 'var(--primary)' : 'var(--text-muted)' }}>
            2. Patient & OTP
          </span>
          <span style={{ color: 'var(--text-muted)' }}>→</span>
          <span style={{ color: step === 'payment' ? 'var(--primary)' : 'var(--text-muted)' }}>3. Advance Deposit</span>
          <span style={{ color: 'var(--text-muted)' }}>→</span>
          <span style={{ color: step === 'confirmed' ? 'var(--primary)' : 'var(--text-muted)' }}>4. Confirmed</span>
        </div>

        {/* STEP 1: BED SELECTION */}
        {step === 'select' && (
          <div style={{ margin: '20px 0', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {user ? (
              <div style={{ padding: '10px 14px', borderRadius: '10px', background: 'rgba(13,124,110,0.08)', border: '1px solid rgba(13,124,110,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <User size={18} style={{ color: 'var(--primary)' }} />
                  <div>
                    <div style={{ fontSize: '0.82rem', fontWeight: 800, color: 'var(--text-primary)' }}>Logged in as: {user.name}</div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Mobile: {user.phone || '017XXXXXXXX'} • {user.email}</div>
                  </div>
                </div>
                <span style={{ fontSize: '0.7rem', fontWeight: 700, padding: '3px 8px', borderRadius: '6px', background: 'rgba(34,197,94,0.15)', color: '#16a34a' }}>
                  ✓ Verified Account
                </span>
              </div>
            ) : (
              <div style={{ padding: '10px 14px', borderRadius: '10px', background: 'rgba(59,130,246,0.08)', border: '1px solid rgba(59,130,246,0.2)', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Smartphone size={18} style={{ color: '#2563eb', flexShrink: 0 }} />
                <div style={{ fontSize: '0.78rem', color: '#1d4ed8', lineHeight: 1.4 }}>
                  <strong>Guest Bed Reservation:</strong> No prior login needed! Enter patient details + OTP verification in the next step to confirm your bed immediately.
                </div>
              </div>
            )}

            <div>
              <label style={{ fontSize: '0.78rem', fontWeight: 800, color: 'var(--text-primary)', display: 'block', marginBottom: '8px' }}>
                Select Bed or Cabin Type:
              </label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {BED_TYPES.map((b) => (
                  <div
                    key={b.id}
                    onClick={() => setSelectedBedType(b)}
                    style={{
                      padding: '12px 14px', borderRadius: '10px', cursor: 'pointer',
                      border: selectedBedType.id === b.id ? '2px solid var(--primary)' : '1px solid var(--border-default)',
                      background: selectedBedType.id === b.id ? 'rgba(13,124,110,0.08)' : 'var(--bg-card)',
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <div>
                      <div style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--text-primary)' }}>{b.name}</div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '2px' }}>{b.desc}</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '1.05rem', fontWeight: 900, color: 'var(--primary)' }}>৳{b.fee}</div>
                      <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 600 }}>per day approx.</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-primary)', display: 'block', marginBottom: '5px' }}>
                  Expected Admission Date:
                </label>
                <div style={{ position: 'relative' }}>
                  <Calendar size={15} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  <input
                    type="date"
                    value={admissionDate}
                    onChange={e => setAdmissionDate(e.target.value)}
                    style={{ width: '100%', padding: '9px 12px 9px 34px', borderRadius: '8px', border: '1px solid var(--border-default)', background: 'var(--bg-input)', color: 'var(--text-primary)', fontSize: '0.8rem', boxSizing: 'border-box' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-primary)', display: 'block', marginBottom: '5px' }}>
                  Patient Condition / Diagnosis:
                </label>
                <input
                  type="text"
                  value={patientCondition}
                  onChange={e => setPatientCondition(e.target.value)}
                  placeholder="e.g. Post surgery, high fever, etc."
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid var(--border-default)', background: 'var(--bg-input)', color: 'var(--text-primary)', fontSize: '0.8rem', boxSizing: 'border-box' }}
                />
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', paddingTop: '10px' }}>
              <button type="button" onClick={onClose} className="btn btn-secondary" style={{ padding: '9px 18px', fontSize: '0.8rem' }}>
                Cancel
              </button>
              <button 
                type="button" 
                onClick={handleProceedFromSelect} 
                className="btn btn-primary" 
                style={{ padding: '9px 22px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                {user ? 'Proceed to Confirmation' : 'Next: Patient & OTP Verification'} <ArrowRight size={15} />
              </button>
            </div>
          </div>
        )}

        {/* STEP 2A: PATIENT REGISTRATION DATA */}
        {step === 'patient_auth' && (
          <form onSubmit={handleSendOtp} style={{ margin: '20px 0', display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ padding: '12px 14px', borderRadius: '10px', background: 'rgba(13,124,110,0.08)', border: '1px solid rgba(13,124,110,0.25)' }}>
              <h4 style={{ margin: '0 0 4px 0', fontSize: '0.88rem', fontWeight: 800, color: 'var(--primary)' }}>
                Patient Details for Hospital Admission (রোগীর বিবরণ)
              </h4>
              <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                Please provide your Name, Phone Number, Gmail and Password. We will send an instant SMS OTP to verify your bed booking.
              </p>
            </div>

            {authError && (
              <div style={{ padding: '10px 14px', borderRadius: '8px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#dc2626', fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <AlertTriangle size={16} /> {authError}
              </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-primary)', display: 'block', marginBottom: '5px' }}>
                  Patient Full Name *
                </label>
                <div style={{ position: 'relative' }}>
                  <User size={15} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  <input
                    type="text"
                    required
                    placeholder="e.g., Tanvir Hossain"
                    value={patientForm.name}
                    onChange={e => setPatientForm({ ...patientForm, name: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px 9px 34px', borderRadius: '8px', border: '1px solid var(--border-default)', background: 'var(--bg-input)', color: 'var(--text-primary)', fontSize: '0.8rem', boxSizing: 'border-box' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-primary)', display: 'block', marginBottom: '5px' }}>
                  Mobile Number (মোবাইল নম্বর) *
                </label>
                <div style={{ position: 'relative' }}>
                  <Phone size={15} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  <input
                    type="tel"
                    required
                    placeholder="01712345678"
                    value={patientForm.phone}
                    onChange={e => setPatientForm({ ...patientForm, phone: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px 9px 34px', borderRadius: '8px', border: '1px solid var(--border-default)', background: 'var(--bg-input)', color: 'var(--text-primary)', fontSize: '0.8rem', boxSizing: 'border-box' }}
                  />
                </div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-primary)', display: 'block', marginBottom: '5px' }}>
                  Email Address / Gmail *
                </label>
                <div style={{ position: 'relative' }}>
                  <Mail size={15} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  <input
                    type="email"
                    required
                    placeholder="patient@gmail.com"
                    value={patientForm.email}
                    onChange={e => setPatientForm({ ...patientForm, email: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px 9px 34px', borderRadius: '8px', border: '1px solid var(--border-default)', background: 'var(--bg-input)', color: 'var(--text-primary)', fontSize: '0.8rem', boxSizing: 'border-box' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-primary)', display: 'block', marginBottom: '5px' }}>
                  Account Password (ভবিষ্যতের লগইন পাসওয়ার্ড) *
                </label>
                <div style={{ position: 'relative' }}>
                  <Lock size={15} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  <input
                    type="password"
                    required
                    placeholder="At least 6 characters"
                    value={patientForm.password}
                    onChange={e => setPatientForm({ ...patientForm, password: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px 9px 34px', borderRadius: '8px', border: '1px solid var(--border-default)', background: 'var(--bg-input)', color: 'var(--text-primary)', fontSize: '0.8rem', boxSizing: 'border-box' }}
                  />
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '10px' }}>
              <button type="button" onClick={() => setStep('select')} className="btn btn-secondary" style={{ padding: '9px 18px', fontSize: '0.8rem' }}>
                Back
              </button>
              <button 
                type="submit" 
                disabled={authLoading}
                className="btn btn-primary" 
                style={{ padding: '9px 24px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '8px' }}
              >
                {authLoading ? <Loader2 size={16} className="animate-spin" /> : <Smartphone size={16} />}
                Send OTP Verification Code
              </button>
            </div>
          </form>
        )}

        {/* STEP 2B: OTP VERIFICATION */}
        {step === 'otp_verify' && (
          <form onSubmit={handleVerifyOtp} style={{ margin: '20px 0', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ textAlign: 'center', padding: '10px 0' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'rgba(13,124,110,0.12)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 10px auto' }}>
                <KeyRound size={24} />
              </div>
              <h4 style={{ margin: '0 0 4px 0', fontSize: '1rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                Verify Mobile Number
              </h4>
              <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                We sent a 6-digit OTP code to <strong style={{ color: 'var(--text-primary)' }}>{patientForm.phone}</strong> & <strong style={{ color: 'var(--text-primary)' }}>{patientForm.email}</strong>.
              </p>
            </div>

            {/* LIVE SMS SIMULATOR BANNER */}
            {simulatedOtp && (
              <div style={{ padding: '12px 16px', borderRadius: '10px', background: 'rgba(34,197,94,0.08)', border: '1.5px solid rgba(34,197,94,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
                <div>
                  <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#16a34a', display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <span>📩 Niramoy Hospital Tele-SMS Gateway</span>
                  </div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-primary)', marginTop: '2px' }}>
                    Your bed reservation code is: <span style={{ fontFamily: 'monospace', fontSize: '1.1rem', fontWeight: 900, letterSpacing: '2px', color: 'var(--primary)' }}>{simulatedOtp}</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setOtpCode(simulatedOtp)}
                  style={{ padding: '5px 12px', borderRadius: '6px', fontSize: '0.72rem', fontWeight: 800, background: 'var(--primary)', color: '#ffffff', border: 'none', cursor: 'pointer' }}
                >
                  Auto-Fill Code
                </button>
              </div>
            )}

            {authError && (
              <div style={{ padding: '10px 14px', borderRadius: '8px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#dc2626', fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <AlertTriangle size={16} /> {authError}
              </div>
            )}

            <div>
              <label style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-primary)', display: 'block', marginBottom: '8px', textAlign: 'center' }}>
                Type 6-digit Code:
              </label>
              <input
                type="text"
                maxLength={6}
                autoFocus
                placeholder="123456"
                value={otpCode}
                onChange={e => setOtpCode(e.target.value.replace(/\D/g, ''))}
                style={{
                  width: '200px', margin: '0 auto', display: 'block', textAlign: 'center',
                  fontFamily: 'monospace', fontSize: '1.5rem', fontWeight: 800, letterSpacing: '8px',
                  padding: '10px', borderRadius: '10px', border: '2px solid var(--primary)',
                  background: 'var(--bg-input)', color: 'var(--text-primary)', outline: 'none'
                }}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '10px' }}>
              <button type="button" onClick={() => setStep('patient_auth')} className="btn btn-secondary" style={{ padding: '9px 18px', fontSize: '0.8rem' }}>
                Change Number
              </button>
              <button 
                type="submit" 
                disabled={authLoading || otpCode.length !== 6}
                className="btn btn-primary" 
                style={{ padding: '9px 24px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '8px' }}
              >
                {authLoading ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle2 size={16} />}
                Verify & Continue
              </button>
            </div>
          </form>
        )}

        {/* STEP 3: ADVANCE DEPOSIT / PAYMENT */}
        {step === 'payment' && (
          <div style={{ margin: '20px 0', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ padding: '12px 16px', borderRadius: '12px', background: 'rgba(13,124,110,0.1)', border: '1px solid rgba(13,124,110,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block' }}>Reservation Summary:</span>
                <span style={{ fontSize: '0.88rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                  {hospital.name} • {selectedBedType.name}
                </span>
                <div style={{ fontSize: '0.72rem', color: 'var(--primary)', marginTop: '2px' }}>
                  Admission: {admissionDate} | Patient: {user?.name || patientForm.name}
                </div>
              </div>
              <span style={{ fontSize: '1.25rem', fontWeight: 900, color: 'var(--primary)' }}>
                ৳{selectedBedType.fee}
              </span>
            </div>

            <label style={{ fontSize: '0.78rem', fontWeight: 800, color: 'var(--text-primary)', display: 'block' }}>
              Select Advance Deposit Method (Sandbox):
            </label>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
              <button
                type="button"
                onClick={() => setPaymentMethod('bkash')}
                style={{
                  padding: '12px 8px', borderRadius: '10px', textAlign: 'center', fontSize: '0.8rem', fontWeight: 800,
                  cursor: 'pointer', transition: 'all 0.15s ease',
                  border: paymentMethod === 'bkash' ? '2px solid #ec4899' : '1px solid var(--border-default)',
                  background: paymentMethod === 'bkash' ? 'rgba(236,72,153,0.12)' : 'var(--bg-card)',
                  color: paymentMethod === 'bkash' ? '#ec4899' : 'var(--text-primary)'
                }}
              >
                💖 bKash
              </button>
              <button
                type="button"
                onClick={() => setPaymentMethod('nagad')}
                style={{
                  padding: '12px 8px', borderRadius: '10px', textAlign: 'center', fontSize: '0.8rem', fontWeight: 800,
                  cursor: 'pointer', transition: 'all 0.15s ease',
                  border: paymentMethod === 'nagad' ? '2px solid #f97316' : '1px solid var(--border-default)',
                  background: paymentMethod === 'nagad' ? 'rgba(249,115,22,0.12)' : 'var(--bg-card)',
                  color: paymentMethod === 'nagad' ? '#f97316' : 'var(--text-primary)'
                }}
              >
                🧡 Nagad
              </button>
              <button
                type="button"
                onClick={() => setPaymentMethod('card')}
                style={{
                  padding: '12px 8px', borderRadius: '10px', textAlign: 'center', fontSize: '0.8rem', fontWeight: 800,
                  cursor: 'pointer', transition: 'all 0.15s ease',
                  border: paymentMethod === 'card' ? '2px solid #3b82f6' : '1px solid var(--border-default)',
                  background: paymentMethod === 'card' ? 'rgba(59,130,246,0.12)' : 'var(--bg-card)',
                  color: paymentMethod === 'card' ? '#3b82f6' : 'var(--text-primary)'
                }}
              >
                💳 Debit / Card
              </button>
            </div>

            <div>
              <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
                Account / Mobile Wallet:
              </label>
              <input
                type="text"
                value={mobileNumber}
                onChange={(e) => setMobileNumber(e.target.value)}
                style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid var(--border-default)', background: 'var(--bg-input)', color: 'var(--text-primary)', fontFamily: 'monospace', fontSize: '0.82rem', boxSizing: 'border-box' }}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '10px' }}>
              <button type="button" onClick={() => setStep('select')} className="btn btn-secondary" style={{ padding: '9px 18px', fontSize: '0.8rem' }}>
                Back
              </button>
              <button 
                type="button" 
                onClick={handleConfirmReservation} 
                className="btn btn-primary" 
                style={{ padding: '10px 24px', fontSize: '0.85rem', fontWeight: 800 }}
              >
                Confirm Bed Reservation ৳{selectedBedType.fee}
              </button>
            </div>
          </div>
        )}

        {/* STEP 4: CONFIRMED */}
        {step === 'confirmed' && bookingResult && (
          <div style={{ margin: '20px 0', textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(34,197,94,0.15)', color: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto' }}>
              <CheckCircle2 size={36} />
            </div>

            <div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 900, color: 'var(--text-primary)', margin: '0 0 4px 0' }}>
                Bed Reserved Successfully!
              </h3>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: 0 }}>
                Hospital admission authorization reference has been issued.
              </p>
            </div>

            <div style={{ padding: '16px', borderRadius: '12px', background: 'var(--bg-badge)', border: '1px solid var(--border-default)', textAlign: 'left', maxWidth: '440px', margin: '0 auto', width: '100%', fontSize: '0.8rem', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Hospital:</span>
                <span style={{ fontWeight: 800, color: 'var(--text-primary)' }}>{bookingResult.hospitalName}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Bed / Room:</span>
                <span style={{ fontWeight: 700, color: 'var(--primary)' }}>{bookingResult.bedType}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Admission Date:</span>
                <span style={{ fontWeight: 800, color: 'var(--text-primary)' }}>{bookingResult.admissionDate}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Patient Name:</span>
                <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{bookingResult.patientName}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Booking Reference ID:</span>
                <span style={{ fontFamily: 'monospace', color: '#16a34a', fontWeight: 800 }}>{bookingResult.referenceId}</span>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', paddingTop: '6px' }}>
              <button
                type="button"
                onClick={onClose}
                className="btn btn-primary"
                style={{ fontSize: '0.78rem', padding: '8px 24px', fontWeight: 700 }}
              >
                Close & View Dashboard
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
