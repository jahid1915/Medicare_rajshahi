import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Calendar, Clock, CreditCard, ShieldCheck, CheckCircle2,
  Mail, User, Download, AlertTriangle, Phone, Lock, KeyRound,
  ArrowRight, Loader2, RefreshCw, Smartphone, MapPin, Building2,
  Check, ExternalLink, Sparkles, X, ChevronRight, Video, Stethoscope
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useAuth } from '../../context/AuthContext';
import { doctorsAPI, appointmentsAPI, paymentsAPI } from '../../services/api';

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
        width: 56, height: 56, borderRadius: '14px',
        background: 'linear-gradient(135deg, var(--color-primary, #0d7c6e) 0%, #064e3b 100%)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: '#fff', fontSize: '1.2rem', fontWeight: 800, flexShrink: 0,
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
        width: 56, height: 56, borderRadius: '14px',
        objectFit: 'cover', flexShrink: 0,
        border: '2px solid var(--color-primary, #0d7c6e)',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
      }}
    />
  );
}

export default function AppointmentBookingModal({ doctor, onClose, onBookingSuccess }) {
  const navigate = useNavigate();
  const { user, sendOtp, verifyOtp } = useAuth();

  // Doctor Details
  const doctorId = doctor?._id || doctor?.id || doctor?.slug;
  const doctorName = doctor?.name || 'Specialist Physician';
  const doctorSpecialty = doctor?.specialty || doctor?.specialtyName || 'Specialist Doctor';
  const doctorSubtitle = doctor?.designation || doctor?.qualifications || doctor?.workplace || 'Chamber Specialist';
  const doctorImg = doctor?.imageUrl || doctor?.avatar;

  // Step state: 'branch_schedule' | 'patient_info' | 'otp_verify' | 'summary' | 'payment_processing' | 'confirmed'
  const [step, setStep] = useState('branch_schedule');

  // Branch states (dynamically loaded from backend)
  const [branches, setBranches] = useState([]);
  const [selectedBranch, setSelectedBranch] = useState(null);
  const [loadingBranches, setLoadingBranches] = useState(true);

  // Date states
  const now = new Date();
  const [selectedDate, setSelectedDate] = useState(now.toISOString().split('T')[0]);

  // Dynamic slot availability states
  const [slots, setSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState('');
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [consultationType, setConsultationType] = useState('Online Consultation'); // 'Online Consultation' | 'In-person Consultation'

  // Patient Info Form
  const [patientForm, setPatientForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    gender: user?.gender || 'male',
    age: '',
    address: user?.address || 'Rajshahi, Bangladesh',
    emergencyContact: user?.emergency_contact || '',
    bloodGroup: user?.blood_group || '',
    consultationReason: ''
  });

  // OTP states
  const [otpCode, setOtpCode] = useState('');
  const [authError, setAuthError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);

  // Booking and Payment results
  const [pendingAppointment, setPendingAppointment] = useState(null);
  const [confirmedBooking, setConfirmedBooking] = useState(null);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [paymentError, setPaymentError] = useState('');
  const [emailResent, setEmailResent] = useState(false);

  // Fee calculation (derived from branch or doctor)
  const fee = selectedBranch?.consultationFee || doctor?.consultation_fee || 800;

  // 1. Fetch Dynamic Branches on Modal Open
  useEffect(() => {
    let isMounted = true;
    async function fetchBranches() {
      if (!doctorId) return;
      setLoadingBranches(true);
      try {
        const res = await doctorsAPI.getBranches(doctorId);
        if (isMounted) {
          const list = res?.data?.branches || [];
          setBranches(list);
          if (list.length > 0) {
            setSelectedBranch(list[0]);
          }
        }
      } catch (err) {
        console.error('Error fetching branches:', err);
        // Fallback from doctor object if API is loading
        if (isMounted) {
          const fallbackBranch = {
            _id: 'default-branch',
            name: doctor?.workplace || 'Rajshahi Medical Chamber',
            address: 'Medical College Road, Laxmipur, Rajshahi',
            phone: '01711223344',
            consultationFee: doctor?.consultation_fee || 800
          };
          setBranches([fallbackBranch]);
          setSelectedBranch(fallbackBranch);
        }
      } finally {
        if (isMounted) setLoadingBranches(false);
      }
    }
    fetchBranches();
    return () => { isMounted = false; };
  }, [doctorId]);

  // 2. Fetch Dynamic Slots when Branch or Date changes
  useEffect(() => {
    let isMounted = true;
    async function fetchSlots() {
      if (!doctorId || !selectedBranch?._id || !selectedDate) return;
      setLoadingSlots(true);
      try {
        const res = await doctorsAPI.getAvailableSlots(doctorId, selectedBranch._id, selectedDate);
        if (isMounted) {
          const slotList = res?.data?.slots || [];
          setSlots(slotList);
          const firstAvailable = slotList.find(s => s.available);
          if (firstAvailable) {
            setSelectedSlot(firstAvailable.time);
          } else {
            setSelectedSlot('');
          }
        }
      } catch (err) {
        console.warn('Slot query fallback:', err);
        if (isMounted) {
          const defaultSlots = [
            { time: '05:00 PM', available: true },
            { time: '05:20 PM', available: true },
            { time: '05:40 PM', available: true },
            { time: '06:00 PM', available: true },
            { time: '06:20 PM', available: true },
            { time: '06:40 PM', available: true },
            { time: '07:00 PM', available: true },
            { time: '07:20 PM', available: true }
          ];
          setSlots(defaultSlots);
          setSelectedSlot(defaultSlots[0].time);
        }
      } finally {
        if (isMounted) setLoadingSlots(false);
      }
    }
    fetchSlots();
    return () => { isMounted = false; };
  }, [doctorId, selectedBranch, selectedDate]);

  // 3. Countdown timer for OTP
  useEffect(() => {
    let timer;
    if (step === 'otp_verify' && countdown > 0) {
      timer = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            setCanResend(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [step, countdown]);

  // Auto-sync user if logged in
  useEffect(() => {
    if (user) {
      setPatientForm(prev => ({
        ...prev,
        name: user.name || prev.name,
        email: user.email || prev.email,
        phone: user.phone || prev.phone,
        address: user.address || prev.address
      }));
    }
  }, [user]);

  // ─── Step 1 Proceed -> Step 2 (Patient Info) ───
  const handleProceedFromSchedule = () => {
    if (!selectedSlot) {
      alert('Please select an available appointment time slot.');
      return;
    }
    setStep('patient_info');
  };

  // ─── Step 2 Proceed -> Step 3 (OTP or Summary) ───
  const handleProceedFromPatientInfo = async (e) => {
    if (e) e.preventDefault();
    setAuthError('');

    if (!patientForm.name.trim()) {
      setAuthError('Please enter your full name.');
      return;
    }
    if (!patientForm.phone.trim() || patientForm.phone.trim().length < 11) {
      setAuthError('Please enter a valid 11-digit mobile phone number.');
      return;
    }
    if (!patientForm.emergencyContact.trim()) {
      setAuthError('Please enter an emergency contact number.');
      return;
    }

    // If user is already authenticated, go straight to summary
    if (user) {
      setStep('summary');
      return;
    }

    // Otherwise, dispatch Phone OTP via MIM SMS
    setAuthLoading(true);
    try {
      await sendOtp({
        phone: patientForm.phone.trim(),
        name: patientForm.name.trim(),
        purpose: 'PATIENT_SIGNUP'
      });
      setCountdown(60);
      setCanResend(false);
      setStep('otp_verify');
    } catch (err) {
      setAuthError(err.message || 'Failed to dispatch SMS verification code. Please try again.');
    } finally {
      setAuthLoading(false);
    }
  };

  // ─── Step 3: Verify OTP ───
  const handleVerifyOtp = async (e) => {
    if (e) e.preventDefault();
    setAuthError('');

    if (!otpCode.trim() || otpCode.trim().length !== 6) {
      setAuthError('Please enter the 6-digit OTP code received on your phone.');
      return;
    }

    setAuthLoading(true);
    try {
      await verifyOtp({
        phone: patientForm.phone.trim(),
        otp: otpCode.trim(),
        name: patientForm.name.trim(),
        gender: patientForm.gender,
        address: patientForm.address,
        emergency_contact_phone: patientForm.emergencyContact,
        blood_group: patientForm.bloodGroup,
        email: patientForm.email ? patientForm.email.trim() : undefined
      });

      // Auto-logged in! Transition immediately to Appointment Summary
      setStep('summary');
    } catch (err) {
      setAuthError(err.message || 'Invalid or expired verification code.');
    } finally {
      setAuthLoading(false);
    }
  };

  // ─── Resend OTP ───
  const handleResendOtp = async () => {
    if (!canResend) return;
    setAuthLoading(true);
    setAuthError('');
    try {
      await sendOtp({
        phone: patientForm.phone.trim(),
        name: patientForm.name.trim(),
        purpose: 'PATIENT_SIGNUP'
      });
      setCountdown(60);
      setCanResend(false);
    } catch (err) {
      setAuthError(err.message || 'Failed to resend SMS code');
    } finally {
      setAuthLoading(false);
    }
  };

  // ─── Step 5: Proceed to Payment & Zero-Trust Verification ───
  const handleProceedToPayment = async () => {
    setPaymentLoading(true);
    setPaymentError('');

    try {
      // 1. Backend creates Pending Appointment with 15-minute slot hold
      const apptRes = await appointmentsAPI.create({
        doctorId: doctor._id || doctor.id || doctor.slug,
        branchId: selectedBranch?._id,
        appointmentDate: selectedDate,
        timeSlot: selectedSlot,
        consultationType,
        patientName: patientForm.name,
        patientPhone: patientForm.phone,
        patientEmail: patientForm.email,
        gender: patientForm.gender,
        age: patientForm.age,
        address: patientForm.address,
        emergencyContact: patientForm.emergencyContact,
        bloodGroup: patientForm.bloodGroup,
        consultationReason: patientForm.consultationReason
      });

      const apptData = apptRes.data?.appointment;
      setPendingAppointment(apptData);

      // 2. Request SSLCOMMERZ Hosted Checkout Session
      const payRes = await paymentsAPI.initiateSslCommerz({
        appointmentId: apptData._id
      });

      const gatewayUrl = payRes.data?.gatewayPageUrl;
      const isSandboxSim = payRes.data?.isSandbox;

      if (!gatewayUrl) {
        throw new Error('Payment gateway did not provide a checkout URL.');
      }

      // If user is in browser and wants hosted checkout, redirect
      if (isSandboxSim) {
        // Open the sandbox simulation window or redirect
        window.location.href = gatewayUrl;
      } else {
        window.location.href = gatewayUrl;
      }
    } catch (err) {
      console.error('Payment initiation error:', err);
      setPaymentError(err.message || 'Unable to start payment checkout session. Please try again.');
      setPaymentLoading(false);
    }
  };

  // ─── Resend Confirmation Email (from Confirmed Screen) ───
  const handleResendEmail = async () => {
    if (!confirmedBooking?._id) return;
    try {
      await appointmentsAPI.resendEmail(confirmedBooking._id);
      setEmailResent(true);
      setTimeout(() => setEmailResent(false), 4000);
    } catch (err) {
      alert(err.message || 'Failed to resend confirmation email.');
    }
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 1000,
      background: 'rgba(15, 23, 42, 0.75)', backdropFilter: 'blur(8px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: window.innerWidth <= 640 ? '0' : '16px'
    }}>
      <div className="booking-modal-content" style={{
        background: '#ffffff', borderRadius: window.innerWidth <= 640 ? '0' : '24px',
        width: '100%', maxWidth: window.innerWidth <= 640 ? '100%' : '640px',
        maxHeight: window.innerWidth <= 640 ? '100%' : '92vh',
        height: window.innerWidth <= 640 ? '100%' : 'auto',
        overflowY: 'auto', boxShadow: '0 25px 60px rgba(0,0,0,0.3)',
        border: window.innerWidth <= 640 ? 'none' : '1px solid var(--border-default, #e2eceb)',
        display: 'flex', flexDirection: 'column'
      }}>
        {/* ─── Modal Header ─── */}
        <div style={{
          padding: window.innerWidth <= 480 ? '14px 16px' : '20px 24px', borderBottom: '1px solid #f1f5f9',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          background: 'linear-gradient(135deg, rgba(13,124,110,0.06), #ffffff)',
          gap: '8px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <DoctorAvatarThumb src={doctorImg} name={doctorName} />
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 900, color: 'var(--text-primary, #0f172a)', margin: 0 }}>
                  {doctorName}
                </h3>
                <span style={{
                  fontSize: '0.68rem', fontWeight: 800, padding: '2px 8px', borderRadius: '99px',
                  background: 'rgba(13,124,110,0.1)', color: 'var(--primary, #0d7c6e)'
                }}>
                  {doctorSpecialty}
                </span>
              </div>
              <p style={{ fontSize: '0.78rem', color: '#64748b', margin: '3px 0 0 0' }}>
                {doctorSubtitle}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            style={{
              background: '#f1f5f9', border: 'none', width: 34, height: 34, borderRadius: '50%',
              display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
              color: '#64748b', transition: 'all 0.15s ease'
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* ─── Step Indicator ─── */}
        <div style={{
          display: 'flex', background: '#f8fafc', padding: '10px 24px',
          borderBottom: '1px solid #f1f5f9', gap: '8px', overflowX: 'auto', fontSize: '0.75rem', fontWeight: 700
        }}>
          {[
            { id: 'branch_schedule', label: '1. Branch & Slot' },
            { id: 'patient_info', label: '2. Patient Info' },
            { id: 'otp_verify', label: '3. Email OTP' },
            { id: 'summary', label: '4. Summary & Pay' }
          ].map((st, idx) => {
            const isActive = step === st.id;
            return (
              <div
                key={st.id}
                style={{
                  display: 'flex', alignItems: 'center', gap: '6px',
                  color: isActive ? 'var(--primary, #0d7c6e)' : '#94a3b8',
                  fontWeight: isActive ? 800 : 600
                }}
              >
                <span>{st.label}</span>
                {idx < 3 && <ChevronRight size={14} style={{ color: '#cbd5e1' }} />}
              </div>
            );
          })}
        </div>

        {/* ─── Modal Content ─── */}
        <div style={{ padding: '24px' }}>

          {/* ═════ STEP 1: BRANCH, DATE & SCHEDULE SLOTS ═════ */}
          {step === 'branch_schedule' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {/* Branch Selection */}
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 800, color: '#1e293b', marginBottom: '8px' }}>
                  🏥 Select Hospital Branch / Chamber (ডাক্তারের চেম্বার নির্বাচন করুন):
                </label>
                {loadingBranches ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#64748b', fontSize: '0.85rem' }}>
                    <Loader2 size={16} className="animate-spin" /> Loading branches from database...
                  </div>
                ) : (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '10px' }}>
                    {branches.map((b) => {
                      const isSelected = selectedBranch?._id === b._id;
                      return (
                        <div
                          key={b._id}
                          onClick={() => setSelectedBranch(b)}
                          style={{
                            padding: '12px 14px', borderRadius: '12px', cursor: 'pointer',
                            border: isSelected ? '2px solid var(--primary, #0d7c6e)' : '1.5px solid #e2e8f0',
                            background: isSelected ? 'rgba(13,124,110,0.04)' : '#ffffff',
                            transition: 'all 0.15s ease'
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontSize: '0.88rem', fontWeight: 800, color: isSelected ? 'var(--primary, #0d7c6e)' : '#0f172a' }}>
                              {b.name}
                            </span>
                            {isSelected && <Check size={16} style={{ color: 'var(--primary, #0d7c6e)' }} />}
                          </div>
                          <p style={{ fontSize: '0.74rem', color: '#64748b', margin: '4px 0 0 0' }}>
                            📍 {b.address}
                          </p>
                          <div style={{ fontSize: '0.72rem', color: '#0d7c6e', fontWeight: 700, marginTop: '6px' }}>
                            Fee: ৳{b.consultationFee || fee} BDT
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Consultation Type */}
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 800, color: '#1e293b', marginBottom: '8px' }}>
                  🩺 Consultation Type:
                </label>
                <div style={{ display: 'flex', gap: '10px' }}>
                  {[
                    { id: 'Online Consultation', label: 'Online Telemedicine', icon: Video, desc: 'Video Consultation' },
                    { id: 'In-person Consultation', label: 'In-Person Chamber', icon: Stethoscope, desc: 'Visit Hospital Branch' }
                  ].map((ct) => {
                    const isSelected = consultationType === ct.id;
                    return (
                      <div
                        key={ct.id}
                        onClick={() => setConsultationType(ct.id)}
                        style={{
                          flex: 1, padding: '12px', borderRadius: '12px', cursor: 'pointer',
                          border: isSelected ? '2px solid var(--primary, #0d7c6e)' : '1.5px solid #e2e8f0',
                          background: isSelected ? 'rgba(13,124,110,0.04)' : '#ffffff'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <ct.icon size={16} style={{ color: isSelected ? 'var(--primary, #0d7c6e)' : '#64748b' }} />
                          <span style={{ fontSize: '0.85rem', fontWeight: 800, color: isSelected ? 'var(--primary, #0d7c6e)' : '#0f172a' }}>
                            {ct.label}
                          </span>
                        </div>
                        <span style={{ fontSize: '0.72rem', color: '#64748b', display: 'block', marginTop: '2px' }}>
                          {ct.desc}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Date Selection */}
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 800, color: '#1e293b', marginBottom: '8px' }}>
                  📅 Select Appointment Date:
                </label>
                <input
                  type="date"
                  min={now.toISOString().split('T')[0]}
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  style={{
                    width: '100%', padding: '10px 14px', borderRadius: '10px',
                    border: '1.5px solid #cbd5e1', fontSize: '0.88rem', fontWeight: 700, color: '#0f172a'
                  }}
                />
              </div>

              {/* Dynamic Slot Availability Grid */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <label style={{ fontSize: '0.82rem', fontWeight: 800, color: '#1e293b' }}>
                    ⏰ Select Available Time Slot:
                  </label>
                  <span style={{ fontSize: '0.72rem', color: '#64748b' }}>
                    {slots.filter(s => s.available).length} slots available
                  </span>
                </div>

                {loadingSlots ? (
                  <div style={{ padding: '20px', textAlign: 'center', color: '#64748b' }}>
                    <Loader2 size={20} className="animate-spin" style={{ margin: '0 auto 8px' }} />
                    <span style={{ fontSize: '0.82rem' }}>Checking real-time slot availability...</span>
                  </div>
                ) : (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(110px, 1fr))', gap: '8px' }}>
                    {slots.map((s, idx) => {
                      const isSelected = selectedSlot === s.time;
                      const isAvail = s.available;
                      return (
                        <button
                          key={idx}
                          type="button"
                          disabled={!isAvail}
                          onClick={() => setSelectedSlot(s.time)}
                          style={{
                            padding: '10px 6px', borderRadius: '10px', textAlign: 'center',
                            border: isSelected ? '2px solid var(--primary, #0d7c6e)' : '1px solid #e2e8f0',
                            background: !isAvail ? '#f1f5f9' : (isSelected ? 'var(--primary, #0d7c6e)' : '#ffffff'),
                            color: !isAvail ? '#94a3b8' : (isSelected ? '#ffffff' : '#0f172a'),
                            cursor: !isAvail ? 'not-allowed' : 'pointer',
                            fontSize: '0.78rem', fontWeight: 700,
                            position: 'relative'
                          }}
                        >
                          <div>{s.time}</div>
                          {!isAvail && (
                            <span style={{ fontSize: '0.62rem', display: 'block', color: '#dc2626' }}>
                              {s.status === 'BOOKED' ? 'Booked' : 'Held'}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Bottom Step Action */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '16px', borderTop: '1px solid #f1f5f9' }}>
                <div>
                  <span style={{ fontSize: '0.74rem', color: '#64748b' }}>Consultation Fee:</span>
                  <div style={{ fontSize: '1.25rem', fontWeight: 900, color: 'var(--primary, #0d7c6e)' }}>৳{fee} BDT</div>
                </div>
                <button
                  type="button"
                  disabled={!selectedSlot}
                  onClick={handleProceedFromSchedule}
                  style={{
                    padding: '12px 24px', borderRadius: '12px', border: 'none',
                    background: selectedSlot ? 'var(--primary, #0d7c6e)' : '#cbd5e1',
                    color: '#fff', fontWeight: 800, fontSize: '0.88rem', cursor: selectedSlot ? 'pointer' : 'not-allowed',
                    display: 'flex', alignItems: 'center', gap: '8px'
                  }}
                >
                  Continue <ArrowRight size={16} />
                </button>
              </div>
            </div>
          )}

          {/* ═════ STEP 2: PATIENT INFORMATION FORM ═════ */}
          {step === 'patient_info' && (
            <form onSubmit={handleProceedFromPatientInfo} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <h4 style={{ margin: '0 0 4px', fontSize: '0.95rem', fontWeight: 800, color: '#0f172a' }}>
                Patient Details (রোগীর তথ্য)
              </h4>

              {authError && (
                <div style={{ padding: '10px 14px', borderRadius: '8px', background: '#fef2f2', color: '#b91c1c', fontSize: '0.8rem', fontWeight: 600 }}>
                  ⚠️ {authError}
                </div>
              )}

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                  Full Name (সম্পূর্ণ নাম) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Jahid Hasan"
                  value={patientForm.name}
                  onChange={(e) => setPatientForm({ ...patientForm, name: e.target.value })}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1.5px solid #cbd5e1', fontSize: '0.85rem' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="patient@gmail.com"
                    value={patientForm.email}
                    onChange={(e) => setPatientForm({ ...patientForm, email: e.target.value })}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1.5px solid #cbd5e1', fontSize: '0.85rem' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                    Phone Number (১১ ডিজিট) *
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="017XXXXXXXX"
                    value={patientForm.phone}
                    onChange={(e) => setPatientForm({ ...patientForm, phone: e.target.value })}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1.5px solid #cbd5e1', fontSize: '0.85rem' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                    Gender *
                  </label>
                  <select
                    value={patientForm.gender}
                    onChange={(e) => setPatientForm({ ...patientForm, gender: e.target.value })}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1.5px solid #cbd5e1', fontSize: '0.85rem' }}
                  >
                    <option value="male">Male (পুরুষ)</option>
                    <option value="female">Female (মহিলা)</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                    Age (বয়স)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 32"
                    value={patientForm.age}
                    onChange={(e) => setPatientForm({ ...patientForm, age: e.target.value })}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1.5px solid #cbd5e1', fontSize: '0.85rem' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                    Blood Group
                  </label>
                  <select
                    value={patientForm.bloodGroup}
                    onChange={(e) => setPatientForm({ ...patientForm, bloodGroup: e.target.value })}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1.5px solid #cbd5e1', fontSize: '0.85rem' }}
                  >
                    <option value="">Select</option>
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

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                    Address (ঠিকানা) *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Laxmipur, Rajshahi"
                    value={patientForm.address}
                    onChange={(e) => setPatientForm({ ...patientForm, address: e.target.value })}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1.5px solid #cbd5e1', fontSize: '0.85rem' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                    Emergency Contact Number *
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="01XXXXXXXXX"
                    value={patientForm.emergencyContact}
                    onChange={(e) => setPatientForm({ ...patientForm, emergencyContact: e.target.value })}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1.5px solid #cbd5e1', fontSize: '0.85rem' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                  Short Reason for Consultation (ঐচ্ছিক)
                </label>
                <textarea
                  rows="2"
                  placeholder="e.g. High blood pressure follow-up or fever..."
                  value={patientForm.consultationReason}
                  onChange={(e) => setPatientForm({ ...patientForm, consultationReason: e.target.value })}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1.5px solid #cbd5e1', fontSize: '0.85rem' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '12px' }}>
                <button
                  type="button"
                  onClick={() => setStep('branch_schedule')}
                  style={{ background: 'none', border: 'none', color: '#64748b', fontWeight: 700, cursor: 'pointer' }}
                >
                  ← Back to Schedule
                </button>
                <button
                  type="submit"
                  disabled={authLoading}
                  style={{
                    padding: '12px 24px', borderRadius: '12px', border: 'none',
                    background: 'var(--primary, #0d7c6e)', color: '#fff', fontWeight: 800,
                    cursor: authLoading ? 'wait' : 'pointer', display: 'flex', alignItems: 'center', gap: '8px'
                  }}
                >
                  {authLoading && <Loader2 size={16} className="animate-spin" />}
                  Verify & Continue <ArrowRight size={16} />
                </button>
              </div>
            </form>
          )}

          {/* ═════ STEP 3: PHONE OTP VERIFICATION ═════ */}
          {step === 'otp_verify' && (
            <div style={{ textAlign: 'center', padding: '12px 0' }}>
              <div style={{
                width: 60, height: 60, borderRadius: '50%', background: 'rgba(13,124,110,0.1)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary, #0d7c6e)',
                margin: '0 auto 16px'
              }}>
                <Smartphone size={28} />
              </div>

              <h3 style={{ fontSize: '1.25rem', fontWeight: 900, color: '#0f172a', margin: '0 0 6px' }}>
                Verify Mobile Phone
              </h3>
              <p style={{ fontSize: '0.82rem', color: '#64748b', maxWidth: 420, margin: '0 auto 20px', lineHeight: 1.5 }}>
                We have dispatched a 6-digit one-time verification SMS to <strong style={{ color: '#0f172a' }}>{patientForm.phone}</strong>.
              </p>

              {authError && (
                <div style={{ padding: '10px 14px', borderRadius: '8px', background: '#fef2f2', color: '#b91c1c', fontSize: '0.8rem', fontWeight: 600, marginBottom: '16px' }}>
                  ⚠️ {authError}
                </div>
              )}

              <form onSubmit={handleVerifyOtp} style={{ maxWidth: 360, margin: '0 auto' }}>
                <input
                  type="text"
                  maxLength={6}
                  required
                  placeholder="• • • • • •"
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                  style={{
                    width: '100%', padding: '14px', textAlign: 'center', fontSize: '1.8rem',
                    letterSpacing: '12px', fontWeight: 900, borderRadius: '12px',
                    border: '2px solid var(--primary, #0d7c6e)', color: 'var(--primary, #0d7c6e)',
                    background: '#f0fdf4', marginBottom: '16px'
                  }}
                />

                <button
                  type="submit"
                  disabled={authLoading || otpCode.length !== 6}
                  style={{
                    width: '100%', padding: '14px', borderRadius: '12px', border: 'none',
                    background: otpCode.length === 6 ? 'var(--primary, #0d7c6e)' : '#cbd5e1',
                    color: '#fff', fontWeight: 800, fontSize: '0.92rem', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
                  }}
                >
                  {authLoading && <Loader2 size={16} className="animate-spin" />}
                  Verify & Confirm Serial
                </button>
              </form>

              <div style={{ marginTop: '20px', fontSize: '0.8rem', color: '#64748b' }}>
                {countdown > 0 ? (
                  <span>Resend SMS code in <strong>{countdown}s</strong></span>
                ) : (
                  <button
                    type="button"
                    onClick={handleResendOtp}
                    style={{ background: 'none', border: 'none', color: 'var(--primary, #0d7c6e)', fontWeight: 800, cursor: 'pointer' }}
                  >
                    Resend SMS Code
                  </button>
                )}
              </div>

              <button
                type="button"
                onClick={() => setStep('patient_info')}
                style={{ marginTop: '16px', background: 'none', border: 'none', color: '#94a3b8', fontSize: '0.78rem', cursor: 'pointer' }}
              >
                Change mobile number
              </button>
            </div>
          )}

          {/* ═════ STEP 4: APPOINTMENT SUMMARY & SSLCOMMERZ CHECKOUT ═════ */}
          {step === 'summary' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{
                background: 'linear-gradient(135deg, rgba(13,124,110,0.06), #f8fafc)',
                border: '1.5px solid #e2eceb', borderRadius: '16px', padding: '20px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid #e2e8f0', paddingBottom: '14px', marginBottom: '14px' }}>
                  <div>
                    <span style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--primary, #0d7c6e)', textTransform: 'uppercase' }}>
                      Appointment Summary
                    </span>
                    <h4 style={{ margin: '4px 0 0 0', fontSize: '1.1rem', fontWeight: 900, color: '#0f172a' }}>
                      {doctorName}
                    </h4>
                    <span style={{ fontSize: '0.8rem', color: '#64748b' }}>{doctorSpecialty}</span>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <span style={{ fontSize: '0.7rem', color: '#64748b' }}>Consultation Fee</span>
                    <div style={{ fontSize: '1.35rem', fontWeight: 900, color: 'var(--primary, #0d7c6e)' }}>
                      ৳{fee} BDT
                    </div>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '0.82rem' }}>
                  <div>
                    <span style={{ color: '#64748b' }}>Branch / Chamber:</span>
                    <div style={{ fontWeight: 800, color: '#0f172a' }}>{selectedBranch?.name}</div>
                  </div>
                  <div>
                    <span style={{ color: '#64748b' }}>Consultation Mode:</span>
                    <div style={{ fontWeight: 800, color: '#0d7c6e' }}>{consultationType}</div>
                  </div>
                  <div>
                    <span style={{ color: '#64748b' }}>Date:</span>
                    <div style={{ fontWeight: 800, color: '#0f172a' }}>
                      {new Date(selectedDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </div>
                  </div>
                  <div>
                    <span style={{ color: '#64748b' }}>Time Slot:</span>
                    <div style={{ fontWeight: 800, color: '#0f172a' }}>{selectedSlot}</div>
                  </div>
                  <div>
                    <span style={{ color: '#64748b' }}>Patient Name:</span>
                    <div style={{ fontWeight: 800, color: '#0f172a' }}>{patientForm.name}</div>
                  </div>
                  <div>
                    <span style={{ color: '#64748b' }}>Patient Phone:</span>
                    <div style={{ fontWeight: 800, color: '#0f172a' }}>{patientForm.phone}</div>
                  </div>
                </div>
              </div>

              {/* Zero-trust payment assurance note */}
              <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '12px', padding: '14px', fontSize: '0.78rem', color: '#166534', lineHeight: 1.5 }}>
                🔒 <strong>Secure SSLCOMMERZ Payment Gateway:</strong> Upon clicking Proceed, you will be redirected to the secure SSLCOMMERZ Hosted Checkout page. Your appointment will be confirmed only after server-side validation.
              </div>

              {paymentError && (
                <div style={{ padding: '10px 14px', borderRadius: '8px', background: '#fef2f2', color: '#b91c1c', fontSize: '0.8rem', fontWeight: 600 }}>
                  ⚠️ {paymentError}
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px' }}>
                <button
                  type="button"
                  onClick={() => setStep('branch_schedule')}
                  style={{ background: 'none', border: 'none', color: '#64748b', fontWeight: 700, cursor: 'pointer' }}
                >
                  ← Edit Schedule
                </button>

                <button
                  type="button"
                  disabled={paymentLoading}
                  onClick={handleProceedToPayment}
                  style={{
                    padding: '14px 28px', borderRadius: '12px', border: 'none',
                    background: 'linear-gradient(135deg, #0d7c6e 0%, #064e3b 100%)',
                    color: '#fff', fontWeight: 900, fontSize: '0.95rem', cursor: paymentLoading ? 'wait' : 'pointer',
                    boxShadow: '0 8px 20px rgba(13,124,110,0.3)', display: 'flex', alignItems: 'center', gap: '8px'
                  }}
                >
                  {paymentLoading ? (
                    <>
                      <Loader2 size={18} className="animate-spin" /> Connecting to SSLCOMMERZ...
                    </>
                  ) : (
                    <>
                      Proceed to Payment (৳{fee}) <ArrowRight size={18} />
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* ═════ STEP 5: CONFIRMED STATE (Triggered after payment callback) ═════ */}
          {step === 'confirmed' && confirmedBooking && (
            <div style={{ textAlign: 'center', padding: '16px 0' }}>
              <div style={{
                width: 72, height: 72, borderRadius: '50%', background: '#dcfce7', color: '#16a34a',
                display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px',
                border: '4px solid #bbf7d0'
              }}>
                <CheckCircle2 size={42} />
              </div>

              <span style={{ fontSize: '0.82rem', fontWeight: 800, color: '#16a34a', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                ✓ Appointment Confirmed & Verified
              </span>

              <div style={{
                margin: '16px 0', padding: '16px', borderRadius: '14px',
                background: '#f8fafc', border: '2px dashed #0d7c6e'
              }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b' }}>YOUR OFFICIAL SERIAL ID</div>
                <div style={{ fontSize: '1.8rem', fontWeight: 900, color: 'var(--primary, #0d7c6e)', fontFamily: 'monospace' }}>
                  {confirmedBooking.serialNumber || 'NRM-CONFIRMED'}
                </div>
                <div style={{ fontSize: '0.72rem', color: '#16a34a', fontWeight: 800, marginTop: '4px' }}>
                  Payment Verified by Niramoy Healthcare • Status: PAID
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', textAlign: 'left', fontSize: '0.8rem', background: '#f8fafc', padding: '14px', borderRadius: '12px', marginBottom: '20px' }}>
                <div><strong>Doctor:</strong> {doctorName}</div>
                <div><strong>Branch:</strong> {selectedBranch?.name}</div>
                <div><strong>Date:</strong> {selectedDate}</div>
                <div><strong>Time:</strong> {selectedSlot}</div>
                <div><strong>Type:</strong> {consultationType}</div>
                <div><strong>Amount Paid:</strong> ৳{fee} BDT</div>
              </div>

              {emailResent && (
                <div style={{ padding: '8px 12px', borderRadius: '8px', background: '#f0fdf4', color: '#166534', fontSize: '0.78rem', fontWeight: 700, marginBottom: '14px' }}>
                  ✓ Confirmation email re-sent with PDF attachment!
                </div>
              )}

              {/* Action Buttons */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <a
                  href={appointmentsAPI.getPdfUrl(confirmedBooking._id)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-primary"
                  style={{
                    padding: '12px', borderRadius: '10px', textDecoration: 'none',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                    fontWeight: 800, fontSize: '0.88rem'
                  }}
                >
                  <Download size={16} /> Download PDF Voucher
                </a>

                <div style={{ display: 'flex', gap: '10px' }}>
                  <button
                    type="button"
                    onClick={handleResendEmail}
                    style={{
                      flex: 1, padding: '10px', borderRadius: '10px', border: '1.5px solid #cbd5e1',
                      background: '#fff', color: '#334155', fontWeight: 700, fontSize: '0.82rem',
                      cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px'
                    }}
                  >
                    <Mail size={14} /> Resend Email
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      navigate('/dashboard?tab=appointments');
                    }}
                    style={{
                      flex: 1, padding: '10px', borderRadius: '10px', border: 'none',
                      background: '#0f172a', color: '#fff', fontWeight: 700, fontSize: '0.82rem',
                      cursor: 'pointer'
                    }}
                  >
                    Go to Dashboard →
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
