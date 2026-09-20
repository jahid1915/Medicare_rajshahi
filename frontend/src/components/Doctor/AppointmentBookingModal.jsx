import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Calendar, Clock, CreditCard, ShieldCheck, CheckCircle2, 
  Mail, User, Download, AlertTriangle, Phone, Lock, KeyRound, 
  ArrowRight, Loader2, RefreshCw, Smartphone, MapPin, Building2,
  Check, ExternalLink, Sparkles
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { addAuditLog, getStoredState, saveStoredState } from '../../data/mockUserStore';
import { useAuth } from '../../context/AuthContext';

// ─── Fee Calculation Helper ────────────────────────────────────────────────
function getConsultationFee(doctor) {
  if (!doctor) return 600;
  if (doctor.consultation_fee) return doctor.consultation_fee;
  if (doctor.fee) return doctor.fee;
  const des = (doctor.designation || '').toLowerCase();
  const qual = (doctor.qualifications || '').toLowerCase();
  if (des.includes('professor') || des.includes('head')) return 1000;
  if (des.includes('associate professor') || qual.includes('fcps') || qual.includes('ms') || qual.includes('md')) return 800;
  if (des.includes('assistant professor') || des.includes('consultant')) return 700;
  return 600;
}

// ─── Avatar Fallback ────────────────────────────────────────────────────────
function DoctorAvatarThumb({ src, name }) {
  const [failed, setFailed] = useState(false);
  const initials = (name || 'Dr')
    .replace(/^(Prof\.|Dr\.)\s*/i, '')
    .split(' ')
    .slice(0, 2)
    .map(w => w[0])
    .join('')
    .toUpperCase();

  if (!src || failed) {
    return (
      <div style={{
        width: 52, height: 52, borderRadius: '50%',
        background: 'linear-gradient(135deg, var(--color-primary, #0d7c6e) 0%, #064e3b 100%)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: '#fff', fontSize: '1.1rem', fontWeight: 800, flexShrink: 0,
        boxShadow: '0 4px 12px rgba(13, 124, 110, 0.25)', border: '2px solid #fff'
      }}>
        {initials}
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={name}
      onError={() => setFailed(true)}
      style={{
        width: 52, height: 52, borderRadius: '50%',
        objectFit: 'cover', flexShrink: 0,
        border: '2px solid var(--color-primary, #0d7c6e)',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
      }}
    />
  );
}

export default function AppointmentBookingModal({ doctor, onClose, onBookingSuccess }) {
  const navigate = useNavigate();
  const { user, sendOtp, verifyPatientCheckout } = useAuth();
  const state = getStoredState();

  // Doctor Details
  const doctorName = doctor?.name || 'Specialist Doctor';
  const doctorSpecialty = doctor?.specialty || doctor?.specialtyName || 'Specialist Doctor';
  const doctorSubtitle = doctor?.designation || doctor?.qualifications || doctor?.workplace || 'Chamber Specialist';
  const fee = getConsultationFee(doctor);
  const doctorImg = doctor?.imageUrl || doctor?.avatar;

  // Chambers
  const chambers = (doctor?.chambers && doctor.chambers.length > 0)
    ? doctor.chambers
    : [{
        name: doctor?.workplace || 'Primary Chamber, Rajshahi',
        address: 'Medical College Road, Rajshahi',
        visiting_hours: '05:00 PM - 09:00 PM'
      }];

  const [selectedChamberIndex, setSelectedChamberIndex] = useState(0);
  const selectedChamber = chambers[selectedChamberIndex] || chambers[0];

  // Dynamic Dates
  const now = new Date();
  const dateOptions = [
    {
      id: 'today',
      label: 'Today (আজ)',
      displayDate: now.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' }),
      isoDate: now.toISOString().split('T')[0]
    },
    {
      id: 'tomorrow',
      label: 'Tomorrow (আগামীকাল)',
      displayDate: new Date(Date.now() + 86400000).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' }),
      isoDate: new Date(Date.now() + 86400000).toISOString().split('T')[0]
    },
    {
      id: 'day_after',
      label: 'Day After (পরশু)',
      displayDate: new Date(Date.now() + 172800000).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' }),
      isoDate: new Date(Date.now() + 172800000).toISOString().split('T')[0]
    }
  ];

  const [selectedDateObj, setSelectedDateObj] = useState(dateOptions[0]);

  // Slots List
  const availableSlots = [
    '04:30 PM (Serial #1 - #5)',
    '05:15 PM (Serial #6 - #10)',
    '06:00 PM (Serial #11 - #15)',
    '06:45 PM (Serial #16 - #20)',
    '07:30 PM (Serial #21 - #25)',
    '08:15 PM (Serial #26 - #30)',
    '09:00 PM (Serial #31 - #35)'
  ];

  const [selectedSlot, setSelectedSlot] = useState(availableSlots[0]);

  // Steps: 'slot' | 'patient_auth' | 'otp_verify' | 'payment' | 'confirmed'
  const [step, setStep] = useState('slot');

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
  const [countdown, setCountdown] = useState(60);

  // Payment
  const [paymentMethod, setPaymentMethod] = useState('bkash');
  const [mobileNumber, setMobileNumber] = useState(user?.phone || '01711223344');
  const [showEmailPreview, setShowEmailPreview] = useState(false);
  const [bookingResult, setBookingResult] = useState(null);

  if (!doctor) return null;

  // Handle proceeding from Slot selection
  const handleProceedFromSlot = () => {
    if (user) {
      setMobileNumber(user.phone || '01711223344');
      setStep('payment');
    } else {
      setStep('patient_auth');
    }
  };

  // Trigger Send OTP
  const handleSendOtp = async (e) => {
    if (e) e.preventDefault();
    setAuthError('');

    if (!patientForm.name.trim()) {
      setAuthError('Please enter your full name (আপনার নাম লিখুন)।');
      return;
    }
    if (!patientForm.phone.trim() || patientForm.phone.trim().length < 11) {
      setAuthError('Please enter a valid 11-digit mobile number (১১ ডিজিটের মোবাইল নম্বর দিন)।');
      return;
    }
    if (!patientForm.email.trim() || !patientForm.email.includes('@')) {
      setAuthError('Please enter a valid email address (e.g., patient@gmail.com)।');
      return;
    }
    if (!patientForm.password || patientForm.password.length < 6) {
      setAuthError('Password must be at least 6 characters (পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে)।');
      return;
    }

    setAuthLoading(true);
    try {
      const res = await sendOtp({
        phone: patientForm.phone.trim(),
        email: patientForm.email.trim(),
        purpose: 'Doctor Appointment Verification'
      });
      const generatedOtp = res?.otp || '415815';
      setSimulatedOtp(generatedOtp);
      setOtpCode(generatedOtp); // Convenient auto-fill
      setStep('otp_verify');
      setCountdown(60);
    } catch (err) {
      const fallbackOtp = Math.floor(100000 + Math.random() * 900000).toString();
      setSimulatedOtp(fallbackOtp);
      setOtpCode(fallbackOtp);
      setStep('otp_verify');
    } finally {
      setAuthLoading(false);
    }
  };

  // Handle OTP submission and automatic login
  const handleVerifyOtp = async (e) => {
    if (e) e.preventDefault();
    setAuthError('');

    if (!otpCode.trim() || otpCode.trim().length !== 6) {
      setAuthError('Please enter the 6-digit OTP code (৬ ডিজিটের ওটিপি লিখুন)।');
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
        setAuthError(err.message || 'Invalid OTP code. Please check and try again.');
      }
    } finally {
      setAuthLoading(false);
    }
  };

  // Finalize Payment & Confirm Appointment
  const handleConfirmPayment = () => {
    const txnId = `TXN-${paymentMethod.toUpperCase()}-${Math.floor(100000 + Math.random() * 900000)}`;
    const serialNum = Math.floor(1 + Math.random() * 25);
    const appointmentDate = selectedDateObj.isoDate;
    const patientDisplayName = user?.name || patientForm.name || 'Registered Patient';
    const patientPhone = user?.phone || patientForm.phone || mobileNumber;

    const newAppointment = {
      id: `APT-${Date.now().toString(36).toUpperCase()}`,
      serialNumber: serialNum,
      doctorId: doctor._id || doctor.id || doctor.slug,
      doctorName: doctorName,
      specialty: doctorSpecialty,
      qualifications: doctor.qualifications || '',
      designation: doctor.designation || '',
      chamberName: selectedChamber.name || 'Primary Chamber',
      chamberAddress: selectedChamber.address || 'Rajshahi, Bangladesh',
      date: appointmentDate,
      dateDisplay: selectedDateObj.displayDate,
      time: selectedSlot,
      fee: fee,
      currency: '৳',
      status: 'Confirmed',
      paymentStatus: 'Paid',
      paymentTxnId: txnId,
      patientName: patientDisplayName,
      patientPhone: patientPhone,
      patientEmail: patientForm.email || user?.email || '',
      doctorAvatar: doctorImg,
      paymentMethod: paymentMethod.toUpperCase(),
      createdAt: new Date().toISOString()
    };

    // Save to stored state
    const currentState = getStoredState();
    currentState.appointments = [newAppointment, ...(currentState.appointments || [])];
    currentState.timeline = [
      {
        id: `tl-${Date.now()}`,
        date: appointmentDate,
        time: selectedSlot,
        type: 'DOCTOR_VISIT',
        title: `Appointment Confirmed: ${doctorName}`,
        description: `Serial #${serialNum} • ${selectedChamber.name} • Fee: ৳${fee} • Txn: ${txnId}`,
        badgeColor: 'primary'
      },
      ...(currentState.timeline || [])
    ];

    saveStoredState(currentState);

    addAuditLog('BOOKING_ENGINE', 'APPOINTMENT_CONFIRMED', `Serial #${serialNum} booked for ${patientDisplayName} with ${doctorName}. Txn: ${txnId}`);

    setBookingResult(newAppointment);
    setStep('confirmed');

    // Confetti celebration
    try {
      confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
    } catch (e) {}

    if (onBookingSuccess) onBookingSuccess(newAppointment);
  };

  const handleGoToDashboard = () => {
    onClose();
    navigate('/dashboard/appointments');
  };

  return (
    <div className="modal-overlay" style={{ zIndex: 1100 }}>
      <div className="modal-content" style={{ maxWidth: '640px', width: '94%', maxHeight: '90vh', overflowY: 'auto', borderRadius: '16px' }}>
        
        {/* Header: Doctor Info */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          paddingBottom: '16px', borderBottom: '1.5px solid var(--color-border, #e2e8f0)',
          position: 'relative'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <DoctorAvatarThumb src={doctorImg} name={doctorName} />
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--color-text, #0f172a)', margin: 0 }}>
                  {doctorName}
                </h3>
                {doctor.verified && (
                  <span style={{ fontSize: '0.65rem', fontWeight: 700, color: '#16a34a', background: '#dcfce7', padding: '1px 7px', borderRadius: '99px' }}>
                    ✓ Verified
                  </span>
                )}
              </div>
              <p style={{ fontSize: '0.78rem', color: 'var(--color-primary, #0d7c6e)', fontWeight: 700, margin: '2px 0 0 0' }}>
                {doctorSpecialty}
              </p>
              <p style={{ fontSize: '0.7rem', color: 'var(--color-text-secondary, #64748b)', margin: '1px 0 0 0' }}>
                {doctorSubtitle}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'none', border: 'none', color: 'var(--color-text-muted, #94a3b8)',
              fontSize: '24px', cursor: 'pointer', fontWeight: 'bold', padding: '4px 8px'
            }}
          >
            &times;
          </button>
        </div>

        {/* Progress Breadcrumbs */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          gap: '8px', padding: '12px 0', borderBottom: '1px solid var(--color-border, #e2e8f0)',
          fontSize: '0.72rem', fontWeight: 700
        }}>
          <span style={{ color: step === 'slot' ? 'var(--color-primary, #0d7c6e)' : 'var(--color-text-muted, #94a3b8)' }}>
            1. Serial & Chamber
          </span>
          <span style={{ color: 'var(--color-border, #cbd5e1)' }}>→</span>
          <span style={{ color: (step === 'patient_auth' || step === 'otp_verify') ? 'var(--color-primary, #0d7c6e)' : 'var(--color-text-muted, #94a3b8)' }}>
            2. Patient & OTP
          </span>
          <span style={{ color: 'var(--color-border, #cbd5e1)' }}>→</span>
          <span style={{ color: step === 'payment' ? 'var(--color-primary, #0d7c6e)' : 'var(--color-text-muted, #94a3b8)' }}>
            3. Payment
          </span>
          <span style={{ color: 'var(--color-border, #cbd5e1)' }}>→</span>
          <span style={{ color: step === 'confirmed' ? '#16a34a' : 'var(--color-text-muted, #94a3b8)' }}>
            4. Confirmed
          </span>
        </div>

        {/* ════════════ STEP 1: SERIAL, CHAMBER & SLOT SELECTOR ════════════ */}
        {step === 'slot' && (
          <div style={{ margin: '20px 0', display: 'flex', flexDirection: 'column', gap: '18px' }}>
            
            {/* User status banner */}
            {user ? (
              <div style={{
                padding: '10px 14px', borderRadius: '10px',
                background: 'rgba(13,124,110,0.08)', border: '1px solid rgba(13,124,110,0.2)',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <User size={18} style={{ color: 'var(--color-primary, #0d7c6e)' }} />
                  <div>
                    <div style={{ fontSize: '0.82rem', fontWeight: 800, color: 'var(--color-text, #0f172a)' }}>
                      Booking for: {user.name}
                    </div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--color-text-secondary, #64748b)' }}>
                      Mobile: {user.phone || '017XXXXXXXX'} • {user.email}
                    </div>
                  </div>
                </div>
                <span style={{ fontSize: '0.7rem', fontWeight: 700, padding: '3px 8px', borderRadius: '6px', background: 'rgba(34,197,94,0.15)', color: '#16a34a' }}>
                  ✓ Signed In
                </span>
              </div>
            ) : (
              <div style={{
                padding: '10px 14px', borderRadius: '10px',
                background: 'rgba(13,124,110,0.08)', border: '1px solid rgba(13,124,110,0.25)',
                display: 'flex', alignItems: 'center', gap: '10px'
              }}>
                <Smartphone size={18} style={{ color: 'var(--color-primary, #0d7c6e)', flexShrink: 0 }} />
                <div style={{ fontSize: '0.76rem', color: 'var(--color-text, #0f172a)', lineHeight: 1.4 }}>
                  <strong>New or Guest Patient?</strong> You don't need a prior account! You will provide your Name, Phone Number, Gmail & Password with instant SMS OTP verification in Step 2.
                </div>
              </div>
            )}

            {/* Chamber Selection (if doctor has multiple chambers) */}
            <div>
              <label style={{ fontSize: '0.78rem', fontWeight: 800, color: 'var(--color-text, #0f172a)', display: 'block', marginBottom: '8px' }}>
                Select Chamber / Hospital (চেম্বার নির্বাচন করুন):
              </label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {chambers.map((ch, idx) => {
                  const isSelected = selectedChamberIndex === idx;
                  return (
                    <div
                      key={idx}
                      onClick={() => setSelectedChamberIndex(idx)}
                      style={{
                        padding: '12px 14px', borderRadius: '10px', cursor: 'pointer',
                        border: isSelected ? '2px solid var(--color-primary, #0d7c6e)' : '1px solid var(--color-border, #e2e8f0)',
                        background: isSelected ? 'var(--color-primary-50, #f0fdfa)' : '#ffffff',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <Building2 size={16} style={{ color: isSelected ? 'var(--color-primary, #0d7c6e)' : '#94a3b8' }} />
                          <span style={{ fontSize: '0.85rem', fontWeight: 800, color: isSelected ? 'var(--color-primary, #0d7c6e)' : 'var(--color-text, #0f172a)' }}>
                            {ch.name || `Chamber ${idx + 1}`}
                          </span>
                        </div>
                        {isSelected && (
                          <span style={{ fontSize: '0.65rem', fontWeight: 800, color: 'var(--color-primary, #0d7c6e)', background: '#ccfbf1', padding: '2px 8px', borderRadius: '99px' }}>
                            ✓ Selected
                          </span>
                        )}
                      </div>
                      {ch.address && (
                        <div style={{ fontSize: '0.72rem', color: 'var(--color-text-secondary, #64748b)', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <MapPin size={12} /> {ch.address}
                        </div>
                      )}
                      {ch.visiting_hours && (
                        <div style={{ fontSize: '0.72rem', color: 'var(--color-primary, #0d7c6e)', marginTop: '3px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Clock size={12} /> Schedule: {ch.visiting_hours}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Date Selection */}
            <div>
              <label style={{ fontSize: '0.78rem', fontWeight: 800, color: 'var(--color-text, #0f172a)', display: 'block', marginBottom: '8px' }}>
                Consultation Day (তারিখ নির্বাচন করুন):
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
                {dateOptions.map(opt => {
                  const isSel = selectedDateObj.id === opt.id;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setSelectedDateObj(opt)}
                      style={{
                        padding: '10px 8px', borderRadius: '10px', textAlign: 'center', cursor: 'pointer',
                        border: isSel ? '2px solid var(--color-primary, #0d7c6e)' : '1px solid var(--color-border, #e2e8f0)',
                        background: isSel ? 'var(--color-primary, #0d7c6e)' : '#ffffff',
                        color: isSel ? '#ffffff' : 'var(--color-text, #0f172a)',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      <div style={{ fontSize: '0.75rem', fontWeight: 800 }}>{opt.label}</div>
                      <div style={{ fontSize: '0.68rem', opacity: isSel ? 0.9 : 0.65, marginTop: '2px' }}>{opt.displayDate}</div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Serial Time Slots */}
            <div>
              <label style={{ fontSize: '0.78rem', fontWeight: 800, color: 'var(--color-text, #0f172a)', display: 'block', marginBottom: '8px' }}>
                Serial & Time Slot (সিরিয়াল ও সময় বেছে নিন):
              </label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {availableSlots.map((slot, i) => {
                  const isSel = selectedSlot === slot;
                  return (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setSelectedSlot(slot)}
                      style={{
                        padding: '8px 14px', borderRadius: '10px', fontSize: '0.76rem', fontWeight: 700,
                        cursor: 'pointer', transition: 'all 0.15s ease',
                        border: isSel ? '1.5px solid var(--color-primary, #0d7c6e)' : '1px solid var(--color-border, #e2e8f0)',
                        background: isSel ? 'var(--color-primary, #0d7c6e)' : '#ffffff',
                        color: isSel ? '#ffffff' : 'var(--color-text, #0f172a)'
                      }}
                    >
                      <Clock size={12} style={{ display: 'inline', marginRight: '5px' }} />
                      {slot}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Fee Summary */}
            <div style={{
              padding: '12px 16px', borderRadius: '12px',
              background: '#f0fdf4', border: '1.5px solid #86efac',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between'
            }}>
              <div>
                <span style={{ fontSize: '0.8rem', color: '#166534', fontWeight: 700, display: 'block' }}>
                  Doctor Consultation Fee (ভিজিট ফি):
                </span>
                <span style={{ fontSize: '0.68rem', color: '#15803d' }}>
                  Payable via bKash / Nagad / Rocket with instant serial confirmation
                </span>
              </div>
              <span style={{ fontSize: '1.3rem', fontWeight: 900, color: '#15803d' }}>
                ৳{fee}
              </span>
            </div>

            {/* Step 1 Actions */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', paddingTop: '10px' }}>
              <button type="button" onClick={onClose} className="btn" style={{ padding: '9px 18px', fontSize: '0.8rem', background: '#f1f5f9', border: '1px solid #cbd5e1' }}>
                Cancel
              </button>
              <button 
                type="button" 
                onClick={handleProceedFromSlot} 
                className="btn btn-primary" 
                style={{
                  padding: '10px 24px', fontSize: '0.85rem', fontWeight: 800,
                  display: 'flex', alignItems: 'center', gap: '6px',
                  background: 'linear-gradient(135deg, var(--color-primary, #0d7c6e) 0%, #064e3b 100%)'
                }}
              >
                {user ? 'Proceed to Payment (পেমেন্ট করুন)' : 'Next: Patient Details & OTP (পরবর্তী)'} <ArrowRight size={15} />
              </button>
            </div>
          </div>
        )}

        {/* ════════════ STEP 2A: GUEST PATIENT REGISTRATION ════════════ */}
        {step === 'patient_auth' && (
          <form onSubmit={handleSendOtp} style={{ margin: '20px 0', display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ padding: '12px 14px', borderRadius: '10px', background: 'rgba(13,124,110,0.08)', border: '1px solid rgba(13,124,110,0.25)' }}>
              <h4 style={{ margin: '0 0 4px 0', fontSize: '0.88rem', fontWeight: 800, color: 'var(--color-primary, #0d7c6e)' }}>
                Patient Account Details (রোগীর তথ্যাদি)
              </h4>
              <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--color-text-secondary, #64748b)' }}>
                আপনার নাম, মোবাইল নম্বর, জিমেইল এবং পাসওয়ার্ড দিন। আমরা আপনার মোবাইলে তাৎক্ষণিক ৬ ডিজিটের ভেরিফিকেশন কোড (OTP) পাঠাব।
              </p>
            </div>

            {authError && (
              <div style={{ padding: '10px 14px', borderRadius: '8px', background: '#fef2f2', border: '1px solid #fca5a5', color: '#dc2626', fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <AlertTriangle size={16} /> {authError}
              </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-text, #0f172a)', display: 'block', marginBottom: '5px' }}>
                  Full Name (সম্পূর্ণ নাম) *
                </label>
                <div style={{ position: 'relative' }}>
                  <User size={15} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                  <input
                    type="text"
                    required
                    placeholder="e.g., Rahim Uddin"
                    value={patientForm.name}
                    onChange={e => setPatientForm({ ...patientForm, name: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px 9px 34px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#ffffff', color: '#0f172a', fontSize: '0.8rem', boxSizing: 'border-box' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-text, #0f172a)', display: 'block', marginBottom: '5px' }}>
                  Mobile Number (মোবাইল নম্বর) *
                </label>
                <div style={{ position: 'relative' }}>
                  <Phone size={15} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                  <input
                    type="tel"
                    required
                    placeholder="01711223344"
                    value={patientForm.phone}
                    onChange={e => setPatientForm({ ...patientForm, phone: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px 9px 34px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#ffffff', color: '#0f172a', fontSize: '0.8rem', boxSizing: 'border-box' }}
                  />
                </div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-text, #0f172a)', display: 'block', marginBottom: '5px' }}>
                  Email Address / Gmail *
                </label>
                <div style={{ position: 'relative' }}>
                  <Mail size={15} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                  <input
                    type="email"
                    required
                    placeholder="patient@gmail.com"
                    value={patientForm.email}
                    onChange={e => setPatientForm({ ...patientForm, email: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px 9px 34px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#ffffff', color: '#0f172a', fontSize: '0.8rem', boxSizing: 'border-box' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-text, #0f172a)', display: 'block', marginBottom: '5px' }}>
                  Password (ভবিষ্যতের লগইন পাসওয়ার্ড) *
                </label>
                <div style={{ position: 'relative' }}>
                  <Lock size={15} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                  <input
                    type="password"
                    required
                    placeholder="কমপক্ষে ৬ অক্ষরের পাসওয়ার্ড"
                    value={patientForm.password}
                    onChange={e => setPatientForm({ ...patientForm, password: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px 9px 34px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#ffffff', color: '#0f172a', fontSize: '0.8rem', boxSizing: 'border-box' }}
                  />
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '10px' }}>
              <button type="button" onClick={() => setStep('slot')} className="btn" style={{ padding: '9px 18px', fontSize: '0.8rem', background: '#f1f5f9', border: '1px solid #cbd5e1' }}>
                Back to Slots
              </button>
              <button 
                type="submit" 
                disabled={authLoading}
                className="btn btn-primary" 
                style={{ padding: '10px 24px', fontSize: '0.82rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px' }}
              >
                {authLoading ? <Loader2 size={16} className="animate-spin" /> : <Smartphone size={16} />}
                Send OTP Verification (কোড পাঠান)
              </button>
            </div>
          </form>
        )}

        {/* ════════════ STEP 2B: OTP VERIFICATION ════════════ */}
        {step === 'otp_verify' && (
          <form onSubmit={handleVerifyOtp} style={{ margin: '20px 0', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ padding: '14px', borderRadius: '10px', background: '#eff6ff', border: '1.5px solid #93c5fd', textAlign: 'center' }}>
              <h4 style={{ margin: '0 0 4px 0', fontSize: '0.92rem', fontWeight: 800, color: '#1d4ed8' }}>
                Enter SMS OTP Code (ওটিপি লিখুন)
              </h4>
              <p style={{ margin: 0, fontSize: '0.78rem', color: '#1e40af' }}>
                We sent a 6-digit verification code to <strong>{patientForm.phone}</strong>.
              </p>
            </div>

            {/* Instant Demo Simulator Banner */}
            <div style={{
              padding: '12px 14px', borderRadius: '10px', background: '#f0fdf4',
              border: '1.5px solid #86efac', display: 'flex', alignItems: 'center',
              justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <KeyRound size={18} style={{ color: '#16a34a' }} />
                <div>
                  <div style={{ fontSize: '0.78rem', fontWeight: 800, color: '#15803d' }}>
                    Live SMS Simulator: Your OTP is <span style={{ fontSize: '1rem', letterSpacing: '2px', background: '#dcfce7', padding: '1px 6px', borderRadius: '4px' }}>{simulatedOtp}</span>
                  </div>
                  <div style={{ fontSize: '0.68rem', color: '#166534' }}>Instant auto-fill enabled for immediate serial booking</div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setOtpCode(simulatedOtp)}
                style={{
                  padding: '6px 12px', borderRadius: '6px', background: '#16a34a',
                  color: '#fff', border: 'none', fontSize: '0.72rem', fontWeight: 800,
                  cursor: 'pointer'
                }}
              >
                Auto-Fill OTP
              </button>
            </div>

            {authError && (
              <div style={{ padding: '10px 14px', borderRadius: '8px', background: '#fef2f2', border: '1px solid #fca5a5', color: '#dc2626', fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <AlertTriangle size={16} /> {authError}
              </div>
            )}

            <div>
              <label style={{ fontSize: '0.78rem', fontWeight: 800, color: 'var(--color-text, #0f172a)', display: 'block', textAlign: 'center', marginBottom: '8px' }}>
                6-Digit OTP Code:
              </label>
              <input
                type="text"
                required
                maxLength={6}
                value={otpCode}
                onChange={e => setOtpCode(e.target.value)}
                placeholder="• • • • • •"
                style={{
                  width: '240px', margin: '0 auto', display: 'block',
                  textAlign: 'center', fontSize: '1.5rem', letterSpacing: '10px',
                  fontWeight: 900, padding: '10px', borderRadius: '10px',
                  border: '2px solid var(--color-primary, #0d7c6e)',
                  background: '#ffffff', color: '#0f172a', outline: 'none'
                }}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '10px' }}>
              <button type="button" onClick={() => setStep('patient_auth')} className="btn" style={{ padding: '9px 18px', fontSize: '0.8rem', background: '#f1f5f9', border: '1px solid #cbd5e1' }}>
                Edit Details
              </button>
              <button 
                type="submit" 
                disabled={authLoading}
                className="btn btn-primary" 
                style={{ padding: '10px 24px', fontSize: '0.85rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px' }}
              >
                {authLoading ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle2 size={16} />}
                Verify & Proceed to Payment
              </button>
            </div>
          </form>
        )}

        {/* ════════════ STEP 3: PAYMENT METHOD ════════════ */}
        {step === 'payment' && (
          <div style={{ margin: '20px 0', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{
              padding: '14px 16px', borderRadius: '12px',
              background: 'var(--color-bg, #f8fafc)', border: '1.5px solid var(--color-border, #e2e8f0)',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center'
            }}>
              <div>
                <div style={{ fontSize: '0.78rem', color: 'var(--color-text-secondary, #64748b)' }}>Appointment For:</div>
                <div style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--color-text, #0f172a)' }}>
                  {doctorName}
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--color-primary, #0d7c6e)', fontWeight: 700 }}>
                  {selectedChamber.name} • {selectedDateObj.displayDate} at {selectedSlot}
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '0.7rem', color: 'var(--color-text-secondary, #64748b)', fontWeight: 700 }}>PAYABLE FEE:</div>
                <div style={{ fontSize: '1.4rem', fontWeight: 900, color: 'var(--color-primary, #0d7c6e)' }}>
                  ৳{fee}
                </div>
              </div>
            </div>

            <label style={{ fontSize: '0.78rem', fontWeight: 800, color: 'var(--color-text, #0f172a)', display: 'block', marginBottom: '4px' }}>
              Select Payment Gateway (পেমেন্ট মাধ্যম বেছে নিন):
            </label>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px' }}>
              {[
                { id: 'bkash', name: 'bKash', color: '#e2136e', bg: 'rgba(226,19,110,0.1)' },
                { id: 'nagad', name: 'Nagad', color: '#f7941d', bg: 'rgba(247,148,29,0.1)' },
                { id: 'rocket', name: 'Rocket', color: '#8c3494', bg: 'rgba(140,52,148,0.1)' },
                { id: 'card', name: 'Card', color: '#2563eb', bg: 'rgba(37,99,235,0.1)' }
              ].map(pm => {
                const isSel = paymentMethod === pm.id;
                return (
                  <button
                    key={pm.id}
                    type="button"
                    onClick={() => setPaymentMethod(pm.id)}
                    style={{
                      padding: '12px 8px', borderRadius: '10px', textAlign: 'center', cursor: 'pointer',
                      border: isSel ? `2px solid ${pm.color}` : '1px solid var(--color-border, #e2e8f0)',
                      background: isSel ? pm.bg : '#ffffff',
                      color: pm.color, fontWeight: 900, fontSize: '0.85rem',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    {pm.name}
                  </button>
                );
              })}
            </div>

            <div>
              <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-text, #0f172a)', display: 'block', marginBottom: '4px' }}>
                Account / Mobile Wallet Number:
              </label>
              <input
                type="text"
                value={mobileNumber}
                onChange={(e) => setMobileNumber(e.target.value)}
                style={{
                  width: '100%', padding: '9px 12px', borderRadius: '8px',
                  border: '1px solid var(--color-border, #cbd5e1)', background: '#ffffff',
                  color: '#0f172a', fontFamily: 'monospace', fontSize: '0.85rem',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            <div style={{ padding: '10px 12px', borderRadius: '8px', background: '#f0fdf4', color: '#16a34a', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ShieldCheck size={16} style={{ flexShrink: 0 }} />
              <span>Compliant sandbox payment mode active. Instant digital receipt and serial generated.</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '10px' }}>
              <button type="button" onClick={() => setStep('slot')} className="btn" style={{ padding: '9px 18px', fontSize: '0.8rem', background: '#f1f5f9', border: '1px solid #cbd5e1' }}>
                Back
              </button>
              <button 
                type="button" 
                onClick={handleConfirmPayment} 
                className="btn btn-primary" 
                style={{
                  padding: '10px 28px', fontSize: '0.88rem', fontWeight: 900,
                  background: 'linear-gradient(135deg, var(--color-primary, #0d7c6e) 0%, #064e3b 100%)'
                }}
              >
                Confirm & Pay ৳{fee}
              </button>
            </div>
          </div>
        )}

        {/* ════════════ STEP 4: CONFIRMED SERIAL & DIGITAL RECEIPT ════════════ */}
        {step === 'confirmed' && bookingResult && (
          <div style={{ margin: '20px 0', textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            
            <div style={{
              width: '68px', height: '68px', borderRadius: '50%',
              background: '#dcfce7', color: '#16a34a', display: 'flex',
              alignItems: 'center', justifyContent: 'center', margin: '0 auto',
              boxShadow: '0 0 0 6px rgba(34,197,94,0.15)'
            }}>
              <CheckCircle2 size={40} />
            </div>

            <div>
              <h3 style={{ fontSize: '1.3rem', fontWeight: 900, color: 'var(--color-text, #0f172a)', margin: '0 0 4px 0' }}>
                Appointment Confirmed!
              </h3>
              <p style={{ fontSize: '0.78rem', color: 'var(--color-text-secondary, #64748b)', margin: 0 }}>
                আপনার অ্যাপয়েন্টমেন্ট সফলভাবে নিশ্চিত হয়েছে এবং হিস্টোরিতে সংরক্ষিত হয়েছে।
              </p>
            </div>

            {/* Serial Badge */}
            <div style={{
              padding: '12px 20px', borderRadius: '12px',
              background: 'linear-gradient(135deg, #0d7c6e 0%, #044e43 100%)',
              color: '#ffffff', maxWidth: '320px', margin: '0 auto', width: '100%',
              boxShadow: '0 4px 14px rgba(13, 124, 110, 0.3)'
            }}>
              <div style={{ fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', opacity: 0.85 }}>
                Your Serial Token (আপনার সিরিয়াল নম্বর)
              </div>
              <div style={{ fontSize: '2rem', fontWeight: 900, letterSpacing: '-0.02em', marginTop: 2 }}>
                #{bookingResult.serialNumber}
              </div>
              <div style={{ fontSize: '0.72rem', opacity: 0.9, marginTop: 2 }}>
                Time: {bookingResult.time}
              </div>
            </div>

            {/* Details Card */}
            <div style={{
              padding: '16px', borderRadius: '12px',
              background: '#f8fafc', border: '1.5px solid #e2e8f0',
              textAlign: 'left', maxWidth: '480px', margin: '0 auto',
              width: '100%', fontSize: '0.8rem', display: 'flex', flexDirection: 'column', gap: '9px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748b' }}>Doctor:</span>
                <span style={{ fontWeight: 800, color: '#0f172a' }}>{bookingResult.doctorName}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748b' }}>Specialty:</span>
                <span style={{ fontWeight: 700, color: '#0d7c6e' }}>{bookingResult.specialty}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748b' }}>Chamber:</span>
                <span style={{ fontWeight: 700, color: '#0f172a' }}>{bookingResult.chamberName}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748b' }}>Date & Time:</span>
                <span style={{ fontWeight: 800, color: '#0f172a' }}>{bookingResult.dateDisplay || bookingResult.date} at {bookingResult.time}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748b' }}>Patient Name:</span>
                <span style={{ fontWeight: 700, color: '#0f172a' }}>{bookingResult.patientName}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748b' }}>Contact Phone:</span>
                <span style={{ fontWeight: 700, color: '#0f172a' }}>{bookingResult.patientPhone}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px dashed #cbd5e1', paddingTop: '8px' }}>
                <span style={{ color: '#64748b' }}>Fee Paid:</span>
                <span style={{ fontWeight: 900, color: '#15803d' }}>৳{bookingResult.fee} (Paid via {bookingResult.paymentMethod})</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748b' }}>Transaction ID:</span>
                <span style={{ fontFamily: 'monospace', color: '#0d7c6e', fontWeight: 800 }}>{bookingResult.paymentTxnId}</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: '10px', paddingTop: '6px' }}>
              <button
                type="button"
                onClick={handleGoToDashboard}
                className="btn btn-primary"
                style={{
                  fontSize: '0.82rem', padding: '10px 20px', fontWeight: 800,
                  background: 'linear-gradient(135deg, var(--color-primary, #0d7c6e) 0%, #064e3b 100%)',
                  display: 'flex', alignItems: 'center', gap: 6
                }}
              >
                Go to Dashboard (ড্যাশবোর্ডে দেখুন) →
              </button>

              <button
                type="button"
                onClick={() => setShowEmailPreview(true)}
                className="btn"
                style={{
                  fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '6px',
                  padding: '9px 18px', background: '#f8fafc', border: '1.5px solid #cbd5e1',
                  color: '#0f172a', fontWeight: 700
                }}
              >
                <Mail size={14} style={{ color: 'var(--color-primary, #0d7c6e)' }} /> View Digital Slip
              </button>

              <button
                type="button"
                onClick={onClose}
                className="btn"
                style={{ fontSize: '0.8rem', padding: '9px 18px', background: '#f1f5f9', border: '1px solid #cbd5e1' }}
              >
                Close
              </button>
            </div>
          </div>
        )}

        {/* ════════════ EMAIL / DIGITAL SLIP MODAL ════════════ */}
        {showEmailPreview && (
          <div className="modal-overlay" style={{ zIndex: 1200 }}>
            <div className="modal-content" style={{ maxWidth: '500px', width: '92%', borderRadius: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: '12px', borderBottom: '1px solid #e2e8f0' }}>
                <h4 style={{ margin: 0, fontSize: '0.92rem', fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Mail size={16} style={{ color: 'var(--color-primary, #0d7c6e)' }} /> Niramoy Digital Serial Slip
                </h4>
                <button onClick={() => setShowEmailPreview(false)} style={{ background: 'none', border: 'none', color: '#94a3b8', fontSize: '20px', cursor: 'pointer' }}>&times;</button>
              </div>

              <div style={{ margin: '16px 0', padding: '16px', borderRadius: '12px', background: '#f8fafc', border: '1.5px solid #e2e8f0', fontSize: '0.78rem', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{ borderBottom: '1px solid #e2e8f0', paddingBottom: '8px' }}>
                  <div><strong>From:</strong> appointments@niramoy.health</div>
                  <div><strong>To:</strong> {bookingResult?.patientPhone} / {bookingResult?.patientEmail || 'patient@niramoy.health'}</div>
                  <div><strong>Subject:</strong> Confirmed Serial #{bookingResult?.serialNumber} with {bookingResult?.doctorName}</div>
                </div>

                <p style={{ margin: 0 }}>Dear {bookingResult?.patientName},</p>
                <p style={{ margin: 0 }}>Your consultation serial has been successfully booked and recorded in Niramoy Healthcare Network.</p>
                
                <div style={{ padding: '12px', borderRadius: '8px', background: '#f0fdf4', border: '1.5px solid #86efac', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <div><strong>Serial Number:</strong> #{bookingResult?.serialNumber}</div>
                  <div><strong>Doctor:</strong> {bookingResult?.doctorName} ({bookingResult?.specialty})</div>
                  <div><strong>Date & Time:</strong> {bookingResult?.dateDisplay || bookingResult?.date} @ {bookingResult?.time}</div>
                  <div><strong>Chamber / Facility:</strong> {bookingResult?.chamberName}</div>
                  <div><strong>Address:</strong> {bookingResult?.chamberAddress}</div>
                  <div><strong>Fee:</strong> ৳{bookingResult?.fee} (Paid)</div>
                  <div><strong>Status:</strong> Confirmed</div>
                </div>

                <div style={{ fontSize: '0.7rem', color: '#64748b' }}>
                  🔔 Please arrive 15 minutes before your time slot with previous prescriptions and diagnostic reports.
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button onClick={() => setShowEmailPreview(false)} className="btn btn-primary" style={{ padding: '8px 20px', fontSize: '0.8rem' }}>
                  Close Slip
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
