import React, { useState, useEffect, useCallback } from 'react';
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
import LegalContextModal from '../Legal/LegalContextModal';
import NiramoySelect from '../Common/NiramoySelect';

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
  const { user } = useAuth();

  // Doctor Details
  const doctorId = doctor?._id || doctor?.id || doctor?.slug;
  const doctorName = doctor?.name || 'Specialist Physician';
  const doctorSpecialty = doctor?.specialty || doctor?.specialtyName || 'Specialist Doctor';
  const doctorSubtitle = doctor?.designation || doctor?.qualifications || doctor?.workplace || 'Chamber Specialist';
  const doctorImg = doctor?.imageUrl || doctor?.avatar;

  // Step state: 'branch_schedule' | 'patient_info' | 'otp_verify' | 'confirmed'
  const [step, setStep] = useState('branch_schedule');
  const [legalModal, setLegalModal] = useState({ open: false, topic: 'cancellation' });

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

  // 2. Fetch Dynamic Slots when Branch or Date changes (Part 1, 2, 5)
  const fetchSlots = useCallback(async () => {
    if (!doctorId || !selectedBranch?._id || !selectedDate) return;
    setLoadingSlots(true);
    try {
      const res = await doctorsAPI.getAvailableSlots(doctorId, selectedBranch._id, selectedDate);
      const slotList = res?.data?.slots || [];
      setSlots(slotList);

      // Preserve currently selected slot only if still available; otherwise auto-select first available
      setSelectedSlot((prev) => {
        const stillAvailable = slotList.find(s => s.time === prev && s.available);
        if (stillAvailable) return prev;
        const firstAvailable = slotList.find(s => s.available);
        return firstAvailable ? firstAvailable.time : '';
      });
    } catch (err) {
      console.warn('Slot query fallback:', err);
      const defaultSlots = [
        { time: '05:00 PM', available: true, status: 'AVAILABLE' },
        { time: '05:20 PM', available: true, status: 'AVAILABLE' },
        { time: '05:40 PM', available: true, status: 'AVAILABLE' },
        { time: '06:00 PM', available: true, status: 'AVAILABLE' },
        { time: '06:20 PM', available: true, status: 'AVAILABLE' },
        { time: '06:40 PM', available: true, status: 'AVAILABLE' },
        { time: '07:00 PM', available: true, status: 'AVAILABLE' },
        { time: '07:20 PM', available: true, status: 'AVAILABLE' }
      ];
      setSlots(defaultSlots);
      setSelectedSlot((prev) => prev || defaultSlots[0].time);
    } finally {
      setLoadingSlots(false);
    }
  }, [doctorId, selectedBranch?._id, selectedDate]);

  useEffect(() => {
    fetchSlots();
  }, [fetchSlots]);

  // Intelligent refresh when window regains focus (Part 5)
  useEffect(() => {
    const handleFocus = () => {
      if (step === 'branch_schedule') {
        fetchSlots();
      }
    };
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [step, fetchSlots]);

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
    const current = slots.find(s => s.time === selectedSlot);
    if (current && !current.available) {
      alert('This slot has already been booked. Please select another available time.');
      fetchSlots();
      return;
    }
    setStep('patient_info');
  };

  // ─── Step 2 Proceed -> Step 3 (Request Email OTP) ───
  const handleProceedFromPatientInfo = async (e) => {
    if (e) e.preventDefault();
    setAuthError('');

    if (!patientForm.name.trim()) {
      setAuthError('Please enter your full name.');
      return;
    }
    if (!patientForm.email.trim() || !patientForm.email.includes('@')) {
      setAuthError('Please enter a valid email address to receive your confirmation code.');
      return;
    }
    if (!selectedSlot) {
      setAuthError('Please select an appointment time slot.');
      return;
    }

    setAuthLoading(true);
    try {
      await appointmentsAPI.requestEmailOtp({
        email: patientForm.email.trim(),
        patientName: patientForm.name.trim(),
        doctorId: doctor._id || doctor.id || doctor.slug,
        branchId: selectedBranch?._id,
        appointmentDate: selectedDate,
        timeSlot: selectedSlot
      });
      setCountdown(60);
      setCanResend(false);
      setStep('otp_verify');
    } catch (err) {
      setAuthError(err.message || 'Failed to dispatch email verification code. Please check your email and retry.');
    } finally {
      setAuthLoading(false);
    }
  };

  // ─── Step 3: Verify OTP & Confirm in Supabase ───
  const handleVerifyOtp = async (e) => {
    if (e) e.preventDefault();
    setAuthError('');

    if (!otpCode.trim() || otpCode.trim().length !== 6) {
      setAuthError('Please enter the 6-digit verification code sent to your email.');
      return;
    }

    setAuthLoading(true);
    try {
      const clientReqId = 'req_' + Date.now() + '_' + Math.random().toString(36).substring(2, 9);
      const res = await appointmentsAPI.confirmWithEmailOtp({
        email: patientForm.email.trim(),
        otp: otpCode.trim(),
        doctorId: doctor._id || doctor.id || doctor.slug,
        branchId: selectedBranch?._id,
        appointmentDate: selectedDate,
        timeSlot: selectedSlot,
        consultationType,
        patientName: patientForm.name.trim(),
        patientPhone: patientForm.phone ? patientForm.phone.trim() : null,
        gender: patientForm.gender,
        age: patientForm.age,
        address: patientForm.address,
        emergencyContact: patientForm.emergencyContact,
        bloodGroup: patientForm.bloodGroup,
        consultationReason: patientForm.consultationReason,
        booking_request_id: clientReqId
      });

      const confirmedData = res.data?.appointment || res.data;
      setConfirmedBooking({
        ...confirmedData,
        serialNumber: res.data?.serialNumber || confirmedData.serial_number,
        pdfDownloadUrl: res.data?.pdfDownloadUrl || appointmentsAPI.getPdfUrl(confirmedData.id || confirmedData._id)
      });

      // Confetti celebration
      try {
        confetti({
          particleCount: 90,
          spread: 75,
          origin: { y: 0.6 }
        });
      } catch (_) {}

      setStep('confirmed');
      if (onBookingSuccess) onBookingSuccess(confirmedData);
    } catch (err) {
      const isSlotConflict = err.status === 409 ||
                            err.code === 'SLOT_ALREADY_BOOKED' ||
                            err.message?.toLowerCase().includes('already been booked') ||
                            err.message?.toLowerCase().includes('just booked');

      if (isSlotConflict) {
        const conflictMsg = 'This appointment slot was just booked by another patient.\n\nPlease select another available time.';
        setAuthError(conflictMsg);
        fetchSlots();
        setTimeout(() => {
          setStep('branch_schedule');
        }, 2000);
      } else {
        setAuthError(err.message || 'Verification failed. Please check your code and retry.');
      }
    } finally {
      setAuthLoading(false);
    }
  };

  // ─── Resend Email OTP ───
  const handleResendOtp = async () => {
    if (!canResend) return;
    setAuthLoading(true);
    setAuthError('');
    try {
      await appointmentsAPI.requestEmailOtp({
        email: patientForm.email.trim(),
        patientName: patientForm.name.trim(),
        doctorId: doctor._id || doctor.id || doctor.slug,
        branchId: selectedBranch?._id,
        appointmentDate: selectedDate,
        timeSlot: selectedSlot
      });
      setCountdown(60);
      setCanResend(false);
    } catch (err) {
      setAuthError(err.message || 'Failed to resend verification code');
    } finally {
      setAuthLoading(false);
    }
  };

  // ─── Resend Confirmation Email (from Confirmed Screen) ───
  const handleResendEmail = async () => {
    const apptId = confirmedBooking?.id || confirmedBooking?._id;
    if (!apptId) return;
    try {
      await appointmentsAPI.resendEmail(apptId);
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
            { id: 'patient_info', label: '2. Patient Details' },
            { id: 'otp_verify', label: '3. Email OTP' },
            { id: 'confirmed', label: '4. Confirmed' }
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

              {/* Dynamic Slot Availability Grid (Parts 1, 4, 21, 25) */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', flexWrap: 'wrap', gap: '8px' }}>
                  <label style={{ fontSize: '0.82rem', fontWeight: 800, color: '#1e293b' }}>
                    ⏰ Select Available Time Slot:
                  </label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontSize: '0.72rem', color: '#64748b' }}>
                      {slots.filter(s => s.available).length} of {slots.length} available
                    </span>
                    <button
                      type="button"
                      onClick={fetchSlots}
                      style={{
                        background: 'none', border: 'none', cursor: 'pointer',
                        display: 'inline-flex', alignItems: 'center', gap: '4px',
                        color: 'var(--primary, #0d7c6e)', fontSize: '0.74rem', fontWeight: 700, padding: 0
                      }}
                      title="Refresh slot availability from database"
                    >
                      <RefreshCw size={12} className={loadingSlots ? 'animate-spin' : ''} />
                      Refresh
                    </button>
                  </div>
                </div>

                {/* Slot Status Legend (Part 4) */}
                <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap', marginBottom: '12px', fontSize: '0.72rem', color: '#475569' }}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                    <span style={{ width: 12, height: 12, borderRadius: 3, border: '1.5px solid #cbd5e1', background: '#ffffff' }} />
                    Available
                  </span>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                    <span style={{ width: 12, height: 12, borderRadius: 3, background: 'var(--primary, #0d7c6e)' }} />
                    Selected
                  </span>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                    <span style={{ width: 12, height: 12, borderRadius: 3, background: '#d1fae5', border: '1.5px solid #10b981' }} />
                    <strong style={{ color: '#065f46' }}>Booked (Locked)</strong>
                  </span>
                </div>

                {loadingSlots ? (
                  <div style={{ padding: '24px', textAlign: 'center', color: '#64748b' }}>
                    <Loader2 size={20} className="animate-spin" style={{ margin: '0 auto 8px', color: 'var(--primary, #0d7c6e)' }} />
                    <span style={{ fontSize: '0.82rem', fontWeight: 600 }}>Checking real-time slot availability in database...</span>
                  </div>
                ) : (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(115px, 1fr))', gap: '10px' }}>
                    {slots.map((s, idx) => {
                      const isSelected = selectedSlot === s.time;
                      const isAvail = s.available;
                      const isBooked = !isAvail && (s.status === 'BOOKED' || s.status === 'confirmed' || s.status === 'CONFIRMED');
                      const isHeld = !isAvail && (s.status === 'HELD' || s.status === 'PENDING_PAYMENT' || s.status === 'awaiting_payment');

                      // Slot state styles
                      let bg = '#ffffff';
                      let border = '1.5px solid #cbd5e1';
                      let color = '#0f172a';
                      let cursor = 'pointer';
                      let tooltip = 'Click to select this available consultation slot';

                      if (isSelected) {
                        bg = 'linear-gradient(135deg, var(--primary, #0d7c6e) 0%, #064e3b 100%)';
                        border = '2px solid #064e3b';
                        color = '#ffffff';
                        tooltip = 'Selected appointment time slot';
                      } else if (isBooked) {
                        // PART 1 & PART 4: Booked slot = GREEN + LOCKED + disabled
                        bg = '#d1fae5';
                        border = '1.5px solid #10b981';
                        color = '#065f46';
                        cursor = 'not-allowed';
                        tooltip = 'This slot has already been booked. Please select another available time.';
                      } else if (isHeld) {
                        bg = '#fffbeb';
                        border = '1.5px solid #f59e0b';
                        color = '#92400e';
                        cursor = 'not-allowed';
                        tooltip = 'This slot is temporarily held for a checkout. Please choose another slot.';
                      } else if (!isAvail) {
                        bg = '#f1f5f9';
                        border = '1.5px solid #e2e8f0';
                        color = '#94a3b8';
                        cursor = 'not-allowed';
                        tooltip = 'This slot is unavailable.';
                      }

                      return (
                        <button
                          key={idx}
                          type="button"
                          disabled={!isAvail}
                          title={tooltip}
                          aria-label={`${s.time} - ${isBooked ? 'Booked' : (isHeld ? 'Held' : (isAvail ? 'Available' : 'Unavailable'))}`}
                          onClick={() => {
                            if (isAvail) setSelectedSlot(s.time);
                          }}
                          style={{
                            padding: '10px 8px',
                            borderRadius: '12px',
                            textAlign: 'center',
                            border,
                            background: bg,
                            color,
                            cursor,
                            fontSize: '0.82rem',
                            fontWeight: 700,
                            position: 'relative',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '3px',
                            transition: 'all 0.15s ease',
                            boxShadow: isSelected ? '0 4px 12px rgba(13, 124, 110, 0.25)' : 'none',
                            opacity: isBooked ? 0.95 : (isAvail ? 1 : 0.7)
                          }}
                        >
                          <div style={{ fontSize: '0.84rem', letterSpacing: '-0.01em' }}>
                            {s.time}
                          </div>

                          {/* Visual State Badges (Part 1 & 4) */}
                          {isBooked && (
                            <span style={{
                              display: 'inline-flex', alignItems: 'center', gap: '3px',
                              fontSize: '0.66rem', fontWeight: 800, color: '#047857',
                              background: '#ecfdf5', padding: '2px 6px', borderRadius: '6px',
                              border: '1px solid #a7f3d0'
                            }}>
                              <Lock size={10} style={{ color: '#059669' }} /> Booked
                            </span>
                          )}

                          {isHeld && (
                            <span style={{
                              display: 'inline-flex', alignItems: 'center', gap: '3px',
                              fontSize: '0.64rem', fontWeight: 800, color: '#b45309',
                              background: '#fef3c7', padding: '2px 5px', borderRadius: '6px'
                            }}>
                              <Clock size={10} /> Held
                            </span>
                          )}

                          {isSelected && (
                            <span style={{
                              display: 'inline-flex', alignItems: 'center', gap: '3px',
                              fontSize: '0.64rem', fontWeight: 800, color: '#ffffff',
                              background: 'rgba(255,255,255,0.2)', padding: '2px 6px', borderRadius: '6px'
                            }}>
                              <Check size={10} /> Selected
                            </span>
                          )}

                          {isAvail && !isSelected && (
                            <span style={{
                              fontSize: '0.64rem', fontWeight: 600, color: '#0d7c6e',
                              opacity: 0.8
                            }}>
                              Available
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
                  Continue to Details <ArrowRight size={16} />
                </button>
              </div>
            </div>
          )}

          {/* ═════ STEP 2: PATIENT INFORMATION FORM ═════ */}
          {step === 'patient_info' && (
            <form onSubmit={handleProceedFromPatientInfo} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 800, color: '#0f172a' }}>
                  Patient Details (রোগীর তথ্য)
                </h4>
                <span style={{ fontSize: '0.74rem', color: '#64748b' }}>
                  Selected: <strong>{selectedDate} ({selectedSlot})</strong>
                </span>
              </div>

              {authError && (
                <div style={{ padding: '10px 14px', borderRadius: '8px', background: '#fef2f2', color: '#b91c1c', fontSize: '0.8rem', fontWeight: 600 }}>
                  ⚠️ {authError}
                </div>
              )}

              {/* Email Notice Box */}
              <div style={{
                background: 'linear-gradient(135deg, rgba(13,124,110,0.06), #f0fdf4)',
                border: '1.5px solid #bbf7d0', borderRadius: '12px', padding: '14px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#166534', fontWeight: 800, fontSize: '0.84rem' }}>
                  <Mail size={16} style={{ color: 'var(--primary, #0d7c6e)' }} />
                  Patient Email Address (ইমেইল ঠিকানা) *
                </div>
                <p style={{ margin: '4px 0 10px 0', fontSize: '0.74rem', color: '#15803d', lineHeight: 1.4 }}>
                  Your 6-digit confirmation code and official PDF appointment voucher will be delivered to this email.
                </p>
                <input
                  type="email"
                  required
                  placeholder="e.g. patient@gmail.com"
                  value={patientForm.email}
                  onChange={(e) => setPatientForm({ ...patientForm, email: e.target.value })}
                  style={{
                    width: '100%', padding: '11px 14px', borderRadius: '8px',
                    border: '1.5px solid #86efac', fontSize: '0.9rem', fontWeight: 700, color: '#0f172a',
                    background: '#ffffff'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                  Full Name (রোগীর সম্পূর্ণ নাম) *
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
                    Contact Phone (যোগাযোগের ফোন নম্বর - ঐচ্ছিক)
                  </label>
                  <input
                    type="tel"
                    placeholder="e.g. 017XXXXXXXX"
                    value={patientForm.phone}
                    onChange={(e) => setPatientForm({ ...patientForm, phone: e.target.value })}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1.5px solid #cbd5e1', fontSize: '0.85rem' }}
                  />
                </div>
                <div>
                  <NiramoySelect
                    label="Gender (লিঙ্গ)"
                    required
                    value={patientForm.gender}
                    onChange={(e) => setPatientForm({ ...patientForm, gender: e.target.value })}
                    options={[
                      { value: 'male', label: 'Male (পুরুষ)' },
                      { value: 'female', label: 'Female (মহিলা)' },
                      { value: 'other', label: 'Other (অন্যান্য)' }
                    ]}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                    Age (বয়স)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 28"
                    value={patientForm.age}
                    onChange={(e) => setPatientForm({ ...patientForm, age: e.target.value })}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '12px', border: '1.5px solid #cbd5e1', fontSize: '0.85rem' }}
                  />
                </div>
                <div>
                  <NiramoySelect
                    label="Blood Group (রক্তের গ্রুপ)"
                    placeholder="Select Blood Group"
                    value={patientForm.bloodGroup}
                    onChange={(e) => setPatientForm({ ...patientForm, bloodGroup: e.target.value })}
                    options={[
                      { value: 'A+', label: 'A+ (Positive)' },
                      { value: 'A-', label: 'A- (Negative)' },
                      { value: 'B+', label: 'B+ (Positive)' },
                      { value: 'B-', label: 'B- (Negative)' },
                      { value: 'O+', label: 'O+ (Positive)' },
                      { value: 'O-', label: 'O- (Negative)' },
                      { value: 'AB+', label: 'AB+ (Positive)' },
                      { value: 'AB-', label: 'AB- (Negative)' }
                    ]}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                    Address (ঠিকানা)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Kazihata, Rajshahi"
                    value={patientForm.address}
                    onChange={(e) => setPatientForm({ ...patientForm, address: e.target.value })}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1.5px solid #cbd5e1', fontSize: '0.85rem' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                    Emergency Contact (জরুরী নম্বর)
                  </label>
                  <input
                    type="tel"
                    placeholder="e.g. 01XXXXXXXXX"
                    value={patientForm.emergencyContact}
                    onChange={(e) => setPatientForm({ ...patientForm, emergencyContact: e.target.value })}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1.5px solid #cbd5e1', fontSize: '0.85rem' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                  Short Reason for Consultation (পরামর্শের কারণ - ঐচ্ছিক)
                </label>
                <textarea
                  rows="2"
                  placeholder="e.g. Follow-up consultation, fever, or health checkup..."
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
                  Send Email Verification Code <ArrowRight size={16} />
                </button>
              </div>
            </form>
          )}

          {/* ═════ STEP 3: EMAIL OTP VERIFICATION ═════ */}
          {step === 'otp_verify' && (
            <div style={{ textAlign: 'center', padding: '12px 0' }}>
              <div style={{
                width: 64, height: 64, borderRadius: '50%', background: 'rgba(13,124,110,0.1)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary, #0d7c6e)',
                margin: '0 auto 16px'
              }}>
                <Mail size={30} />
              </div>

              <h3 style={{ fontSize: '1.25rem', fontWeight: 900, color: '#0f172a', margin: '0 0 6px' }}>
                Verify Your Email Address
              </h3>
              <p style={{ fontSize: '0.84rem', color: '#64748b', maxWidth: 440, margin: '0 auto 20px', lineHeight: 1.5 }}>
                We have dispatched a 6-digit verification code to <strong style={{ color: '#0f172a' }}>{patientForm.email}</strong>.
                <br /><span style={{ fontSize: '0.76rem', color: '#0d7c6e', fontWeight: 600 }}>Code expires in 10 minutes. Please check your inbox or spam folder.</span>
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
                  autoFocus
                  placeholder="• • • • • •"
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                  style={{
                    width: '100%', padding: '14px', textAlign: 'center', fontSize: '2rem',
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
                    background: otpCode.length === 6 ? 'linear-gradient(135deg, #0d7c6e 0%, #064e3b 100%)' : '#cbd5e1',
                    color: '#fff', fontWeight: 800, fontSize: '0.94rem', cursor: otpCode.length === 6 ? 'pointer' : 'not-allowed',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                    boxShadow: otpCode.length === 6 ? '0 6px 18px rgba(13,124,110,0.25)' : 'none'
                  }}
                >
                  {authLoading && <Loader2 size={16} className="animate-spin" />}
                  Verify & Confirm Appointment
                </button>

                <div style={{ marginTop: '14px', fontSize: '0.72rem', color: '#64748b', textAlign: 'center', lineHeight: 1.5 }}>
                  By verifying, you agree to Niramoy's{' '}
                  <button
                    type="button"
                    onClick={() => setLegalModal({ open: true, topic: 'cancellation' })}
                    style={{ background: 'none', border: 'none', padding: 0, color: 'var(--primary, #0d7c6e)', fontWeight: 700, cursor: 'pointer', textDecoration: 'underline' }}
                  >
                    Appointment & Cancellation Terms
                  </button>{' '}
                  and{' '}
                  <button
                    type="button"
                    onClick={() => setLegalModal({ open: true, topic: 'disclaimer' })}
                    style={{ background: 'none', border: 'none', padding: 0, color: 'var(--primary, #0d7c6e)', fontWeight: 700, cursor: 'pointer', textDecoration: 'underline' }}
                  >
                    Medical Consultation Notice
                  </button>.
                </div>
              </form>

              <div style={{ marginTop: '20px', fontSize: '0.8rem', color: '#64748b' }}>
                {countdown > 0 ? (
                  <span>Resend code in <strong>{countdown}s</strong></span>
                ) : (
                  <button
                    type="button"
                    onClick={handleResendOtp}
                    style={{ background: 'none', border: 'none', color: 'var(--primary, #0d7c6e)', fontWeight: 800, cursor: 'pointer' }}
                  >
                    Resend Email Verification Code
                  </button>
                )}
              </div>

              <button
                type="button"
                onClick={() => setStep('patient_info')}
                style={{ marginTop: '16px', background: 'none', border: 'none', color: '#94a3b8', fontSize: '0.78rem', cursor: 'pointer' }}
              >
                ← Change Email or Patient Details
              </button>
            </div>
          )}

          {/* ═════ STEP 4: CONFIRMED STATE WITH PDF VOUCHER DOWNLOAD ═════ */}
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
                ✓ Official Appointment Confirmed & Verified
              </span>

              <div style={{
                margin: '16px 0', padding: '16px', borderRadius: '14px',
                background: '#f8fafc', border: '2px dashed #0d7c6e'
              }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b' }}>YOUR OFFICIAL SERIAL ID</div>
                <div style={{ fontSize: '1.8rem', fontWeight: 900, color: 'var(--primary, #0d7c6e)', fontFamily: 'monospace' }}>
                  {confirmedBooking.serialNumber || confirmedBooking.serial_number || 'NRM-CONFIRMED'}
                </div>
                <div style={{ fontSize: '0.72rem', color: '#16a34a', fontWeight: 800, marginTop: '4px' }}>
                  Verified by Niramoy Healthcare • Authoritative Supabase Record
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', textAlign: 'left', fontSize: '0.8rem', background: '#f8fafc', padding: '14px', borderRadius: '12px', marginBottom: '16px' }}>
                <div><strong>Doctor:</strong> {doctorName}</div>
                <div><strong>Branch:</strong> {selectedBranch?.name}</div>
                <div><strong>Date:</strong> {selectedDate}</div>
                <div><strong>Time:</strong> {selectedSlot}</div>
                <div><strong>Patient:</strong> {patientForm.name}</div>
                <div><strong>Consultation Fee:</strong> ৳{fee} BDT</div>
              </div>

              <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '10px', padding: '12px', fontSize: '0.78rem', color: '#166534', marginBottom: '16px', lineHeight: 1.5 }}>
                📩 A confirmation email with the official PDF voucher attachment has been dispatched to <strong>{patientForm.email}</strong>.
              </div>

              {emailResent && (
                <div style={{ padding: '8px 12px', borderRadius: '8px', background: '#f0fdf4', color: '#166534', fontSize: '0.78rem', fontWeight: 700, marginBottom: '14px' }}>
                  ✓ Confirmation email re-sent with PDF attachment!
                </div>
              )}

              {/* Action Buttons */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <a
                  href={confirmedBooking.pdfDownloadUrl || appointmentsAPI.getPdfUrl(confirmedBooking.id || confirmedBooking._id)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-primary"
                  style={{
                    padding: '14px', borderRadius: '12px', textDecoration: 'none',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                    fontWeight: 900, fontSize: '0.92rem', background: 'linear-gradient(135deg, #0d7c6e 0%, #064e3b 100%)',
                    color: '#fff', boxShadow: '0 8px 20px rgba(13,124,110,0.25)'
                  }}
                >
                  <Download size={18} /> Download Official Appointment PDF
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
                    View Appointments →
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* Interactive Contextual Terms Modal */}
      <LegalContextModal
        isOpen={legalModal.open}
        initialTopic={legalModal.topic}
        onClose={() => setLegalModal({ open: false, topic: 'cancellation' })}
      />
    </div>
  );
}
