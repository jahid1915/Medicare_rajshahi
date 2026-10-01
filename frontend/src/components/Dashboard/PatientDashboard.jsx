import React, { useState, useEffect, useMemo } from 'react';
import { 
  Bell, ChevronRight, User, Star, Calendar, 
  Clock, CheckCircle2, Circle, Heart, Thermometer, 
  Ruler, Scale, Sparkles, ChevronLeft, ArrowRight,
  Building2, Pill, Stethoscope, FileText, Phone, MapPin,
  CreditCard, ShieldCheck, Tag, Download, Send, Video,
  AlertCircle, CheckCircle, ExternalLink, X, RefreshCw,
  Store, Truck, Copy, Edit3, Save, Shield, AlertTriangle
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Link, useSearchParams } from 'react-router-dom';
import { 
  appointmentsAPI, 
  pharmaciesAPI, 
  paymentsAPI, 
  prescriptionsAPI, 
  pharmacyOrdersAPI,
  notificationsAPI,
  authAPI 
} from '../../services/api';

export default function PatientDashboard({ initialTab = 'appointments', setActiveTab, onNavigateToDoctor }) {
  const { user, updateProfile, fetchProfile } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  // Active service history tab: 'appointments' | 'beds' | 'pharmacy' | 'prescriptions' | 'notifications'
  const [historyTab, setHistoryTab] = useState(initialTab);

  // Live database states
  const [backendAppointments, setBackendAppointments] = useState([]);
  const [backendPrescriptions, setBackendPrescriptions] = useState([]);
  const [backendOrders, setBackendOrders] = useState([]);
  const [backendNotifications, setBackendNotifications] = useState([]);
  
  const [loadingApts, setLoadingApts] = useState(false);
  const [loadingRxs, setLoadingRxs] = useState(false);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [loadingNotifications, setLoadingNotifications] = useState(false);
  const [unreadNotificationsCount, setUnreadNotificationsCount] = useState(0);

  const [resendingEmailId, setResendingEmailId] = useState(null);
  const [actionFeedback, setActionFeedback] = useState(null);

  // Profile completion modal state
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({
    name: '',
    date_of_birth: '',
    gender: '',
    blood_group: '',
    address: '',
    emergency_contact_name: '',
    emergency_contact_relation: '',
    emergency_contact_phone: '',
    allergies: '',
    existing_conditions: '',
    current_medications: '',
    previous_surgeries: '',
    medical_history: '',
    email: '',
    preferred_language: 'bn'
  });

  // SSLCOMMERZ payment callback banner
  const [paymentBanner, setPaymentBanner] = useState(() => {
    const payment = searchParams.get('payment');
    const serial = searchParams.get('serial');
    const appointmentId = searchParams.get('appointmentId');
    if (payment) {
      return { status: payment, serial, appointmentId };
    }
    return null;
  });

  // Prescription Pharmacy Availability Modal
  const [rxAvailabilityModal, setRxAvailabilityModal] = useState({
    isOpen: false,
    rx: null,
    loading: false,
    data: null,
    error: null
  });

  // Daily medication adherence tracker state
  const [completedMeds, setCompletedMeds] = useState({});

  // Sync profile form whenever user changes
  useEffect(() => {
    if (user) {
      setProfileForm({
        name: user.name || '',
        date_of_birth: user.date_of_birth ? new Date(user.date_of_birth).toISOString().split('T')[0] : '',
        gender: user.gender || '',
        blood_group: user.blood_group || '',
        address: user.address || '',
        emergency_contact_name: user.emergency_contact_name || '',
        emergency_contact_relation: user.emergency_contact_relation || '',
        emergency_contact_phone: user.emergency_contact_phone || user.emergency_contact || '',
        allergies: user.allergies || '',
        existing_conditions: user.existing_conditions || '',
        current_medications: user.current_medications || '',
        previous_surgeries: user.previous_surgeries || '',
        medical_history: user.medical_history || '',
        email: user.email || '',
        preferred_language: user.preferred_language || 'bn'
      });
    }
  }, [user]);

  // Fetch live appointments from backend
  const fetchAppointments = async () => {
    setLoadingApts(true);
    try {
      const res = await appointmentsAPI.getMine();
      const list = Array.isArray(res?.data)
        ? res.data
        : (Array.isArray(res?.data?.appointments) ? res.data.appointments : []);
      setBackendAppointments(list);
    } catch (err) {
      console.warn("Could not fetch remote appointments:", err.message);
    } finally {
      setLoadingApts(false);
    }
  };

  // Fetch live prescriptions from backend
  const fetchPrescriptions = async () => {
    setLoadingRxs(true);
    try {
      const res = await prescriptionsAPI.getMyPrescriptions();
      const list = Array.isArray(res?.data)
        ? res.data
        : (Array.isArray(res?.data?.prescriptions) ? res.data.prescriptions : []);
      setBackendPrescriptions(list);
    } catch (err) {
      console.warn("Could not fetch prescriptions:", err.message);
    } finally {
      setLoadingRxs(false);
    }
  };

  // Fetch live pharmacy orders from backend
  const fetchOrders = async () => {
    setLoadingOrders(true);
    try {
      const res = await pharmacyOrdersAPI.getMyOrders();
      const list = Array.isArray(res?.data)
        ? res.data
        : (Array.isArray(res?.data?.orders) ? res.data.orders : []);
      setBackendOrders(list);
    } catch (err) {
      console.warn("Could not fetch pharmacy orders:", err.message);
    } finally {
      setLoadingOrders(false);
    }
  };

  // Fetch live notifications from backend
  const fetchNotifications = async () => {
    setLoadingNotifications(true);
    try {
      const res = await notificationsAPI.getMyNotifications();
      const list = Array.isArray(res?.data) ? res.data : [];
      setBackendNotifications(list);
      setUnreadNotificationsCount(res?.unreadCount !== undefined ? res.unreadCount : list.filter(n => !n.is_read).length);
    } catch (err) {
      console.warn("Could not fetch notifications:", err.message);
    } finally {
      setLoadingNotifications(false);
    }
  };

  const handleMarkNotificationRead = async (id) => {
    try {
      await notificationsAPI.markAsRead(id);
      setBackendNotifications(prev => prev.map(n => n._id === id ? { ...n, is_read: true } : n));
      setUnreadNotificationsCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.warn("Failed to mark notification as read:", err.message);
    }
  };

  const handleMarkAllNotificationsRead = async () => {
    try {
      await notificationsAPI.markAllAsRead();
      setBackendNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
      setUnreadNotificationsCount(0);
    } catch (err) {
      console.warn("Failed to mark all notifications as read:", err.message);
    }
  };

  useEffect(() => {
    if (user) {
      fetchAppointments();
      fetchPrescriptions();
      fetchOrders();
      fetchNotifications();
    }
  }, [user]);

  useEffect(() => {
    if (initialTab) setHistoryTab(initialTab);
  }, [initialTab]);

  // Profile completion calculation
  const profileCompletion = useMemo(() => {
    if (user?.profile_completion) return user.profile_completion;

    const fields = [
      { key: "name", label: "Full Name", filled: !!(user?.name && user?.name !== "Patient") },
      { key: "phone", label: "Phone Number", filled: !!user?.phone },
      { key: "date_of_birth", label: "Date of Birth", filled: !!user?.date_of_birth },
      { key: "gender", label: "Gender", filled: !!user?.gender },
      { key: "blood_group", label: "Blood Group", filled: !!user?.blood_group },
      { key: "address", label: "Address", filled: !!(user?.address && user.address.trim()) },
      { key: "emergency_contact", label: "Emergency Contact", filled: !!(user?.emergency_contact_phone || user?.emergency_contact || user?.emergency_contact_name) },
      { key: "medical_history", label: "Medical Information", filled: !!(user?.allergies || user?.existing_conditions || user?.medical_history) }
    ];

    const filledCount = fields.filter(f => f.filled).length;
    const percentage = Math.round((filledCount / fields.length) * 100);
    const missing = fields.filter(f => !f.filled).map(f => f.label);
    return { percentage, missing, isComplete: percentage >= 80 };
  }, [user]);

  // Mapped appointments from database
  const mappedAppointments = useMemo(() => {
    return backendAppointments.map(a => ({
      id: a._id || a.appointmentId,
      _id: a._id,
      doctorId: a.doctorId?._id || a.doctorId,
      doctorName: a.doctorId?.name || a.doctorName || 'Doctor',
      doctorAvatar: a.doctorId?.avatar || a.doctorAvatar,
      specialty: a.doctorId?.specialty || a.specialty || 'General Physician',
      chamberName: a.branchId?.name || a.chamberName || 'Rajshahi Chamber',
      branchAddress: a.branchId?.address || a.chamberAddress,
      date: a.appointmentDate ? new Date(a.appointmentDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : a.date,
      time: a.startTime ? `${a.startTime}${a.endTime ? ' - ' + a.endTime : ''}` : a.time,
      serialNumber: a.serialNumber,
      status: a.status || 'CONFIRMED',
      paymentStatus: a.paymentStatus || 'PAID',
      fee: a.consultationFee || a.fee || 800,
      appointmentType: a.appointmentType || 'IN_PERSON',
      paymentTxnId: a.paymentId?.transactionId || a.sslTransactionId || a.paymentTxnId || null,
      patientName: a.patientName || user?.name || 'Patient'
    }));
  }, [backendAppointments, user]);

  // Daily prescribed medications collected from active prescriptions
  const activeMedications = useMemo(() => {
    const list = [];
    backendPrescriptions.forEach(p => {
      (p.medicines || []).forEach((m, idx) => {
        list.push({
          id: `rx-med-${p._id || p.prescription_number}-${idx}`,
          name: m.medicine_name || m.name,
          dosage: m.dosage,
          timing: m.timing || 'After meal',
          duration: m.duration || 'As directed',
          instructions: m.instructions || '',
          doctorName: p.doctor_name || 'Attending Doctor'
        });
      });
    });
    return list;
  }, [backendPrescriptions]);

  // Save profile changes
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setIsSavingProfile(true);
    setActionFeedback(null);
    try {
      await updateProfile(profileForm);
      await fetchProfile();
      setIsEditProfileOpen(false);
      setActionFeedback({
        type: 'success',
        message: '✓ Patient profile updated successfully! Healthcare records synchronized.'
      });
    } catch (err) {
      alert(err.message || 'Failed to update profile');
    } finally {
      setIsSavingProfile(false);
      setTimeout(() => setActionFeedback(null), 5000);
    }
  };

  // Resend confirmation email
  const handleResendEmail = async (aptId) => {
    setResendingEmailId(aptId);
    setActionFeedback(null);
    try {
      await appointmentsAPI.resendEmail(aptId);
      setActionFeedback({ id: aptId, type: 'success', message: '✓ Confirmation email with PDF dispatched!' });
    } catch (err) {
      setActionFeedback({ id: aptId, type: 'error', message: err.message || 'Failed to dispatch email' });
    } finally {
      setResendingEmailId(null);
      setTimeout(() => setActionFeedback(null), 5000);
    }
  };

  // Re-attempt SSLCOMMERZ payment for pending appointments
  const handleInitiatePayment = async (aptId) => {
    try {
      const res = await paymentsAPI.initiateSslCommerz({ appointmentId: aptId });
      if (res && res.data && res.data.paymentUrl) {
        window.location.href = res.data.paymentUrl;
      } else {
        alert("Payment initialization error. Please try again.");
      }
    } catch (err) {
      alert(err.message || "Failed to initiate payment gateway.");
    }
  };

  // Cancel appointment
  const handleCancelAppointment = async (aptId) => {
    if (!window.confirm("Are you sure you want to cancel this appointment?")) return;
    try {
      await appointmentsAPI.cancel(aptId, { reason: "Patient requested cancellation" });
      fetchAppointments();
      setActionFeedback({ id: aptId, type: 'info', message: 'Appointment cancelled.' });
    } catch (err) {
      alert(err.message || "Failed to cancel appointment.");
    }
  };

  // Check prescription pharmacy availability
  const handleCheckRxAvailability = async (rx) => {
    setRxAvailabilityModal({
      isOpen: true,
      rx,
      loading: true,
      data: null,
      error: null
    });

    try {
      const res = await pharmaciesAPI.checkPrescriptionAvailability(rx._id || rx.id || 'sample-rx');
      setRxAvailabilityModal(prev => ({
        ...prev,
        loading: false,
        data: res?.data || null
      }));
    } catch (err) {
      setRxAvailabilityModal(prev => ({
        ...prev,
        loading: false,
        error: "Unable to query pharmacy network at this moment. Please browse available pharmacies directly."
      }));
    }
  };

  const handleToggleMed = (medId) => {
    setCompletedMeds(prev => ({
      ...prev,
      [medId]: !prev[medId]
    }));
  };

  const patientDisplayName = user?.name || 'Patient';
  const patientPhone = user?.phone || 'Phone not set';
  const patientEmail = user?.email || 'No email provided';

  return (
    <div className="dashboard-grid">
      {/* ─── CENTER COLUMN (MAIN STATS & SERVICE HISTORY) ─── */}
      <div className="center-content">
        
        {/* Top search & Welcome banner */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>Welcome to your portal,</span>
              <span style={{ fontSize: '0.68rem', fontWeight: 800, padding: '2px 8px', borderRadius: '6px', background: 'rgba(34,197,94,0.12)', color: '#16a34a' }}>
                ✓ Verified Patient
              </span>
            </div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--text-primary)', marginTop: '2px' }}>
              Hello, {patientDisplayName}
            </h1>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: 0 }}>
              Mobile: <strong style={{ color: 'var(--text-secondary)' }}>{patientPhone}</strong> • Email: <strong style={{ color: 'var(--text-secondary)' }}>{patientEmail}</strong>
            </p>
          </div>
          
          {/* Quick Action Navigation */}
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <Link to="/doctors" className="btn btn-secondary" style={{ padding: '8px 12px', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '5px' }}>
              <Stethoscope size={14} style={{ color: 'var(--primary)' }} /> Book Doctor
            </Link>
            <Link to="/hospitals" className="btn btn-secondary" style={{ padding: '8px 12px', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '5px' }}>
              <Building2 size={14} style={{ color: '#8b5cf6' }} /> Hospital Bed
            </Link>
            <Link to="/medicines" className="btn btn-secondary" style={{ padding: '8px 12px', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '5px' }}>
              <Pill size={14} style={{ color: '#2563eb' }} /> Medicines
            </Link>
          </div>
        </div>

        {/* ─── PROFILE COMPLETION STATUS CARD (P0/Requirement 7 & 8) ─── */}
        <div style={{
          padding: '16px 20px',
          borderRadius: '14px',
          background: profileCompletion.percentage >= 80 
            ? 'linear-gradient(135deg, rgba(34,197,94,0.06) 0%, rgba(13,124,110,0.06) 100%)' 
            : 'linear-gradient(135deg, rgba(245,158,11,0.08) 0%, rgba(234,88,12,0.05) 100%)',
          border: `1.5px solid ${profileCompletion.percentage >= 80 ? 'rgba(34,197,94,0.3)' : 'rgba(245,158,11,0.35)'}`,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', minWidth: '240px', flex: 1 }}>
            <div style={{
              width: '42px', height: '42px', borderRadius: '12px',
              background: profileCompletion.percentage >= 80 ? '#dcfce7' : '#fef3c7',
              color: profileCompletion.percentage >= 80 ? '#15803d' : '#b45309',
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
            }}>
              {profileCompletion.percentage >= 80 ? <ShieldCheck size={24} /> : <AlertTriangle size={24} />}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                  Profile Completion: {profileCompletion.percentage}%
                </h4>
                <span style={{
                  fontSize: '0.68rem', fontWeight: 800, padding: '2px 8px', borderRadius: '6px',
                  background: profileCompletion.percentage >= 80 ? '#15803d' : '#b45309', color: '#fff'
                }}>
                  {profileCompletion.percentage >= 80 ? 'Ready for Consultations' : 'Profile Incomplete'}
                </span>
              </div>

              {/* Progress Bar */}
              <div style={{ width: '100%', height: '6px', background: 'rgba(0,0,0,0.08)', borderRadius: '99px', marginTop: '6px', overflow: 'hidden' }}>
                <div style={{
                  width: `${profileCompletion.percentage}%`, height: '100%',
                  background: profileCompletion.percentage >= 80 ? '#16a34a' : '#f59e0b',
                  borderRadius: '99px', transition: 'width 0.4s ease'
                }} />
              </div>

              <p style={{ margin: '4px 0 0 0', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                {profileCompletion.missing && profileCompletion.missing.length > 0 ? (
                  <>Missing: <strong>{profileCompletion.missing.join(', ')}</strong></>
                ) : (
                  'All core medical and emergency info verified on record.'
                )}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsEditProfileOpen(true)}
            className="btn btn-secondary"
            style={{
              padding: '8px 16px', fontSize: '0.78rem', fontWeight: 800,
              display: 'inline-flex', alignItems: 'center', gap: '6px',
              color: 'var(--text-primary)', background: 'var(--bg-card)',
              borderColor: 'var(--border-default)', borderRadius: '8px'
            }}
          >
            <Edit3 size={14} style={{ color: 'var(--primary)' }} />
            {profileCompletion.percentage >= 80 ? 'Edit Profile' : 'Complete Profile'}
          </button>
        </div>

        {/* ─── PAYMENT STATUS BANNER (From SSLCOMMERZ Gateway Callback) ─── */}
        {paymentBanner && (
          <div style={{
            padding: '16px 20px',
            borderRadius: '14px',
            background: paymentBanner.status === 'success' 
              ? 'linear-gradient(135deg, rgba(34,197,94,0.12) 0%, rgba(13,124,110,0.12) 100%)' 
              : 'rgba(239,68,68,0.08)',
            border: `1.5px solid ${paymentBanner.status === 'success' ? '#22c55e' : '#ef4444'}`,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '12px',
            boxShadow: '0 4px 14px rgba(0,0,0,0.04)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div style={{
                width: '42px', height: '42px', borderRadius: '50%',
                background: paymentBanner.status === 'success' ? '#22c55e' : '#ef4444',
                color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
              }}>
                {paymentBanner.status === 'success' ? <CheckCircle size={24} /> : <AlertCircle size={24} />}
              </div>
              <div>
                <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                  {paymentBanner.status === 'success' 
                    ? '✓ Appointment Confirmed & Payment Verified!' 
                    : paymentBanner.status === 'cancel'
                    ? 'Payment Cancelled'
                    : 'Payment Transaction Failed'}
                </h4>
                <p style={{ margin: '3px 0 0 0', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                  {paymentBanner.status === 'success' ? (
                    <>
                      Appointment Serial: <strong style={{ color: '#15803d' }}>#{paymentBanner.serial || 'CONFIRMED'}</strong>. 
                      A digital confirmation voucher has been dispatched to your email.
                    </>
                  ) : (
                    'Your appointment slot could not be confirmed. You can retry payment from the pending appointments list.'
                  )}
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              {paymentBanner.status === 'success' && (paymentBanner.appointmentId || backendAppointments[0]?._id) && (
                <a
                  href={appointmentsAPI.getPdfUrl(paymentBanner.appointmentId || backendAppointments[0]?._id)}
                  target="_blank"
                  rel="noreferrer"
                  className="btn btn-primary"
                  style={{
                    padding: '8px 16px', fontSize: '0.82rem', fontWeight: 800,
                    display: 'inline-flex', alignItems: 'center', gap: '6px',
                    background: '#15803d', color: '#ffffff', borderRadius: '8px',
                    textDecoration: 'none', boxShadow: '0 2px 8px rgba(21,128,61,0.25)'
                  }}
                >
                  <Download size={15} /> 📥 Download Confirmation PDF
                </a>
              )}
              <button
                type="button"
                onClick={() => {
                  setPaymentBanner(null);
                  searchParams.delete('payment');
                  searchParams.delete('serial');
                  searchParams.delete('appointmentId');
                  searchParams.delete('status');
                  setSearchParams(searchParams);
                }}
                style={{
                  border: 'none', background: 'transparent', cursor: 'pointer',
                  color: 'var(--text-muted)', padding: '6px'
                }}
                title="Dismiss"
              >
                <X size={18} />
              </button>
            </div>
          </div>
        )}

        {/* Global Action Feedback Message */}
        {actionFeedback && (
          <div style={{
            padding: '10px 16px', borderRadius: '10px', fontSize: '0.82rem', fontWeight: 700,
            background: actionFeedback.type === 'success' ? '#dcfce7' : actionFeedback.type === 'error' ? '#fee2e2' : '#e0f2fe',
            color: actionFeedback.type === 'success' ? '#166534' : actionFeedback.type === 'error' ? '#991b1b' : '#075985',
            border: `1px solid ${actionFeedback.type === 'success' ? '#86efac' : actionFeedback.type === 'error' ? '#fca5a5' : '#7dd3fc'}`
          }}>
            {actionFeedback.message}
          </div>
        )}

        {/* Quick Service Summary Counters (Connected directly to real database counts) */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '10px' }}>
          {[
            { label: 'Doctor Visits', count: mappedAppointments.length, color: 'var(--primary)', icon: Stethoscope },
            { label: 'Bed Bookings', count: 0, color: '#8b5cf6', icon: Building2 },
            { label: 'Medicine Orders', count: backendOrders.length, color: '#2563eb', icon: Pill },
            { label: 'Prescriptions', count: backendPrescriptions.length, color: '#16a34a', icon: FileText },
            { label: 'Alerts', count: unreadNotificationsCount, color: '#f59e0b', icon: Bell }
          ].map((item, idx) => (
            <div key={idx} style={{ padding: '12px 14px', borderRadius: '12px', background: 'var(--bg-card)', border: '1px solid var(--border-default)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <item.icon size={16} style={{ color: item.color }} />
                <span style={{ fontSize: '1.25rem', fontWeight: 900, color: item.color }}>{item.count}</span>
              </div>
              <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-secondary)', marginTop: '4px' }}>
                {item.label}
              </div>
            </div>
          ))}
        </div>

        {/* ─── UNIFIED HEALTHCARE SERVICE HISTORY VIEW ─── */}
        <div className="dashboard-card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px', marginBottom: '16px' }}>
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 900, color: 'var(--text-primary)', margin: 0 }}>
                My Healthcare Service History (আমার সেবা হিস্ট্রি)
              </h3>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: '2px 0 0 0' }}>
                Review past doctor appointments, hospital beds, and pharmacy medicine orders.
              </p>
            </div>

            {/* History Category Selector Tabs */}
            <div style={{ display: 'flex', gap: '6px', background: 'var(--bg-badge)', padding: '4px', borderRadius: '10px', border: '1px solid var(--border-default)', flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={() => setHistoryTab('appointments')}
                style={{
                  padding: '6px 12px', borderRadius: '8px', border: 'none', cursor: 'pointer',
                  fontSize: '0.75rem', fontWeight: 700,
                  background: historyTab === 'appointments' ? 'var(--primary)' : 'transparent',
                  color: historyTab === 'appointments' ? '#ffffff' : 'var(--text-secondary)',
                  transition: 'all 0.15s ease'
                }}
              >
                🩺 Doctors ({mappedAppointments.length})
              </button>
              <button
                type="button"
                onClick={() => setHistoryTab('beds')}
                style={{
                  padding: '6px 12px', borderRadius: '8px', border: 'none', cursor: 'pointer',
                  fontSize: '0.75rem', fontWeight: 700,
                  background: historyTab === 'beds' ? 'var(--primary)' : 'transparent',
                  color: historyTab === 'beds' ? '#ffffff' : 'var(--text-secondary)',
                  transition: 'all 0.15s ease'
                }}
              >
                🏥 Beds (0)
              </button>
              <button
                type="button"
                onClick={() => setHistoryTab('pharmacy')}
                style={{
                  padding: '6px 12px', borderRadius: '8px', border: 'none', cursor: 'pointer',
                  fontSize: '0.75rem', fontWeight: 700,
                  background: historyTab === 'pharmacy' ? 'var(--primary)' : 'transparent',
                  color: historyTab === 'pharmacy' ? '#ffffff' : 'var(--text-secondary)',
                  transition: 'all 0.15s ease'
                }}
              >
                💊 Pharmacy ({backendOrders.length})
              </button>
              <button
                type="button"
                onClick={() => setHistoryTab('prescriptions')}
                style={{
                  padding: '6px 12px', borderRadius: '8px', border: 'none', cursor: 'pointer',
                  fontSize: '0.75rem', fontWeight: 700,
                  background: historyTab === 'prescriptions' ? 'var(--primary)' : 'transparent',
                  color: historyTab === 'prescriptions' ? '#ffffff' : 'var(--text-secondary)',
                  transition: 'all 0.15s ease'
                }}
              >
                📄 Rx ({backendPrescriptions.length})
              </button>
              <button
                type="button"
                onClick={() => setHistoryTab('notifications')}
                style={{
                  padding: '6px 12px', borderRadius: '8px', border: 'none', cursor: 'pointer',
                  fontSize: '0.75rem', fontWeight: 700,
                  background: historyTab === 'notifications' ? 'var(--primary)' : 'transparent',
                  color: historyTab === 'notifications' ? '#ffffff' : 'var(--text-secondary)',
                  transition: 'all 0.15s ease'
                }}
              >
                🔔 Alerts {unreadNotificationsCount > 0 ? `(${unreadNotificationsCount})` : `(${backendNotifications.length})`}
              </button>
            </div>
          </div>

          {/* TAB 1: DOCTOR APPOINTMENTS */}
          {historyTab === 'appointments' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {loadingApts && (
                <div style={{ padding: '16px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.82rem' }}>
                  Syncing appointments with Niramoy database...
                </div>
              )}

              {mappedAppointments.length === 0 && !loadingApts ? (
                <div style={{ padding: '36px', textAlign: 'center', background: 'var(--bg-badge)', borderRadius: '12px', border: '1px dashed var(--border-default)' }}>
                  <Stethoscope size={36} style={{ color: 'var(--text-muted)', opacity: 0.5, marginBottom: '8px' }} />
                  <h4 style={{ margin: '0 0 6px', fontSize: '0.95rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                    No doctor consultations scheduled yet
                  </h4>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: '0 0 14px 0' }}>
                    Find specialists in Rajshahi and book verified chamber or video consultations.
                  </p>
                  <Link to="/doctors" className="btn btn-primary" style={{ display: 'inline-flex', padding: '8px 18px', fontSize: '0.78rem' }}>
                    Find a Doctor →
                  </Link>
                </div>
              ) : (
                mappedAppointments.map((apt) => {
                  const isConfirmed = apt.status === 'CONFIRMED' || apt.status === 'Confirmed';
                  const isPending = apt.status === 'PENDING_PAYMENT' || apt.status === 'Pending';
                  const isCancelled = apt.status === 'CANCELLED' || apt.status === 'Cancelled';

                  return (
                    <div 
                      key={apt.id} 
                      style={{ 
                        padding: '16px', borderRadius: '14px', background: 'var(--bg-card)', 
                        border: '1.5px solid var(--border-default)', display: 'flex', flexDirection: 'column',
                        gap: '12px', transition: 'all 0.2s ease',
                        boxShadow: isConfirmed ? '0 2px 8px rgba(13,124,110,0.06)' : 'none'
                      }}
                    >
                      {/* Top Header Row */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                          <div style={{
                            width: '48px', height: '48px', borderRadius: '50%',
                            background: 'linear-gradient(135deg, var(--color-primary, #0d7c6e) 0%, #064e3b 100%)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            color: '#fff', fontSize: '1rem', fontWeight: 800, flexShrink: 0,
                            overflow: 'hidden', border: '2px solid var(--primary)'
                          }}>
                            {apt.doctorAvatar ? (
                              <img 
                                src={apt.doctorAvatar} 
                                alt={apt.doctorName} 
                                onError={(e) => { e.target.style.display = 'none'; }}
                                style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                              />
                            ) : (
                              (apt.doctorName || 'Dr').replace(/^(Prof\.|Dr\.)\s*/i, '').slice(0, 2).toUpperCase()
                            )}
                          </div>
                          <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                              <span style={{ fontSize: '0.96rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                                {apt.doctorName}
                              </span>
                              <span style={{ fontSize: '0.68rem', fontWeight: 700, padding: '2px 8px', borderRadius: '99px', background: 'rgba(13,124,110,0.1)', color: 'var(--primary)' }}>
                                {apt.specialty}
                              </span>
                              <span style={{ fontSize: '0.65rem', fontWeight: 700, padding: '2px 8px', borderRadius: '99px', background: 'var(--bg-badge)', color: 'var(--text-muted)' }}>
                                {apt.appointmentType === 'ONLINE' ? '🌐 Online Teleconsult' : '🏥 In-person Chamber'}
                              </span>
                            </div>

                            <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                              📅 <strong>{apt.date}</strong> at <strong style={{ color: 'var(--primary)' }}>{apt.time}</strong> • Chamber: <strong>{apt.chamberName}</strong>
                            </div>

                            {apt.branchAddress && (
                              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <MapPin size={12} /> {apt.branchAddress}
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Status & Fee Badge */}
                        <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
                          <span style={{ fontSize: '1.15rem', fontWeight: 900, color: 'var(--primary)' }}>
                            ৳{apt.fee}
                          </span>
                          <span style={{ 
                            fontSize: '0.7rem', fontWeight: 800, padding: '3px 10px', borderRadius: '6px',
                            background: isConfirmed ? '#dcfce7' : isPending ? '#fef3c7' : '#fee2e2',
                            color: isConfirmed ? '#15803d' : isPending ? '#b45309' : '#b91c1c'
                          }}>
                            {isConfirmed ? '✓ CONFIRMED' : isPending ? '⏳ PAYMENT REQUIRED' : 'CANCELLED'}
                          </span>
                        </div>
                      </div>

                      {/* Serial Number & Verification Footer Bar */}
                      <div style={{
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap',
                        gap: '10px', padding: '10px 14px', borderRadius: '10px',
                        background: isConfirmed ? 'rgba(34,197,94,0.06)' : 'var(--bg-badge)',
                        border: `1px solid ${isConfirmed ? 'rgba(34,197,94,0.2)' : 'var(--border-default)'}`
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                          {apt.serialNumber ? (
                            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                              <span style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--text-secondary)' }}>Appointment Serial:</span>
                              <span style={{
                                fontSize: '0.78rem', fontWeight: 900, fontFamily: 'monospace',
                                padding: '2px 8px', borderRadius: '6px', background: '#dcfce7', color: '#15803d',
                                border: '1px solid #86efac'
                              }}>
                                {apt.serialNumber}
                              </span>
                            </div>
                          ) : (
                            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                              Serial generated upon payment verification
                            </span>
                          )}

                          {apt.paymentTxnId && (
                            <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>
                              Txn: <code style={{ color: 'var(--text-secondary)' }}>{apt.paymentTxnId}</code>
                            </span>
                          )}
                        </div>

                        {/* Action Buttons */}
                        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', alignItems: 'center' }}>
                          {isConfirmed && apt._id && (
                            <>
                              <a
                                href={appointmentsAPI.getPdfUrl(apt._id)}
                                target="_blank"
                                rel="noreferrer"
                                className="btn btn-secondary"
                                style={{ padding: '6px 12px', fontSize: '0.72rem', display: 'inline-flex', alignItems: 'center', gap: '5px', fontWeight: 700 }}
                              >
                                <Download size={13} style={{ color: 'var(--primary)' }} /> PDF Voucher
                              </a>

                              <button
                                type="button"
                                onClick={() => handleResendEmail(apt._id)}
                                disabled={resendingEmailId === apt._id}
                                className="btn btn-secondary"
                                style={{ padding: '6px 12px', fontSize: '0.72rem', display: 'inline-flex', alignItems: 'center', gap: '5px', fontWeight: 700 }}
                              >
                                <Send size={13} /> {resendingEmailId === apt._id ? 'Sending...' : 'Resend Email'}
                              </button>
                            </>
                          )}

                          {isConfirmed && apt.appointmentType === 'ONLINE' && (
                            <button
                              type="button"
                              onClick={() => alert(`Starting video consultation session for Serial #${apt.serialNumber || apt.id}. Doctor chamber room active.`)}
                              className="btn btn-primary"
                              style={{ padding: '6px 12px', fontSize: '0.72rem', display: 'inline-flex', alignItems: 'center', gap: '5px', background: '#0284c7' }}
                            >
                              <Video size={13} /> Join Consultation
                            </button>
                          )}

                          {isPending && apt._id && (
                            <>
                              <button
                                type="button"
                                onClick={() => handleInitiatePayment(apt._id)}
                                className="btn btn-primary"
                                style={{ padding: '6px 14px', fontSize: '0.72rem', display: 'inline-flex', alignItems: 'center', gap: '5px', background: '#0d7c6e' }}
                              >
                                <CreditCard size={13} /> Pay with SSLCOMMERZ
                              </button>

                              <button
                                type="button"
                                onClick={() => handleCancelAppointment(apt._id)}
                                style={{
                                  padding: '6px 10px', fontSize: '0.72rem', borderRadius: '8px',
                                  border: '1px solid #fecaca', background: '#fff1f2', color: '#b91c1c', cursor: 'pointer', fontWeight: 700
                                }}
                              >
                                Cancel
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}

          {/* TAB 2: HOSPITAL BED BOOKINGS */}
          {historyTab === 'beds' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ padding: '36px', textAlign: 'center', background: 'var(--bg-badge)', borderRadius: '12px', border: '1px dashed var(--border-default)' }}>
                <Building2 size={36} style={{ color: 'var(--text-muted)', opacity: 0.5, marginBottom: '8px' }} />
                <h4 style={{ margin: '0 0 6px', fontSize: '0.95rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                  No hospital beds or cabins reserved yet
                </h4>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: '0 0 14px 0' }}>
                  Check real-time bed and ICU availability across Rajshahi hospitals.
                </p>
                <Link to="/hospitals" className="btn btn-primary" style={{ display: 'inline-flex', padding: '8px 18px', fontSize: '0.78rem' }}>
                  View Hospital Resources & Reserve Bed →
                </Link>
              </div>
            </div>
          )}

          {/* TAB 3: PHARMACY MEDICINE ORDERS */}
          {historyTab === 'pharmacy' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {loadingOrders && (
                <div style={{ padding: '16px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.82rem' }}>
                  Loading pharmacy orders...
                </div>
              )}

              {backendOrders.length === 0 && !loadingOrders ? (
                <div style={{ padding: '36px', textAlign: 'center', background: 'var(--bg-badge)', borderRadius: '12px', border: '1px dashed var(--border-default)' }}>
                  <Pill size={36} style={{ color: 'var(--text-muted)', opacity: 0.5, marginBottom: '8px' }} />
                  <h4 style={{ margin: '0 0 6px', fontSize: '0.95rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                    No pharmacy orders placed yet
                  </h4>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: '0 0 14px 0' }}>
                    Order verified medicines with home delivery across Rajshahi.
                  </p>
                  <Link to="/medicines" className="btn btn-primary" style={{ display: 'inline-flex', padding: '8px 18px', fontSize: '0.78rem' }}>
                    Browse Medicines & Order →
                  </Link>
                </div>
              ) : (
                backendOrders.map((ord) => {
                  const statusColors = {
                    delivered: { bg: '#dcfce7', text: '#15803d' },
                    confirmed: { bg: '#e0f2fe', text: '#0284c7' },
                    preparing: { bg: '#fef3c7', text: '#b45309' },
                    cancelled: { bg: '#fee2e2', text: '#b91c1c' },
                    pending: { bg: '#f1f5f9', text: '#475569' }
                  };
                  const colorScheme = statusColors[ord.status] || statusColors.pending;

                  return (
                    <div 
                      key={ord._id || ord.order_number} 
                      style={{ 
                        padding: '14px 16px', borderRadius: '12px', background: 'var(--bg-card)', 
                        border: '1.5px solid var(--border-default)', display: 'flex', justifyContent: 'space-between', 
                        alignItems: 'center', flexWrap: 'wrap', gap: '12px' 
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: 'rgba(37,99,235,0.12)', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Pill size={22} />
                        </div>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ fontSize: '0.92rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                              {ord.pharmacy_id?.name || 'Model Pharmacy Rajshahi'}
                            </span>
                            <span style={{ fontSize: '0.68rem', fontFamily: 'monospace', color: 'var(--text-muted)' }}>
                              #{ord.order_number}
                            </span>
                          </div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '3px' }}>
                            Items: <strong>{(ord.items || []).map(i => `${i.brand_name} (x${i.quantity})`).join(', ')}</strong>
                          </div>
                          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                            📅 {new Date(ord.createdAt).toLocaleDateString('en-GB')} • Delivery: {ord.delivery_address?.street || 'Rajshahi Delivery'}
                          </div>
                        </div>
                      </div>

                      <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
                        <span style={{ fontSize: '1rem', fontWeight: 900, color: 'var(--primary)' }}>
                          ৳{ord.total_amount}
                        </span>
                        <span style={{ 
                          fontSize: '0.68rem', fontWeight: 800, padding: '3px 10px', borderRadius: '6px',
                          background: colorScheme.bg, color: colorScheme.text, textTransform: 'uppercase'
                        }}>
                          {ord.status}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}

          {/* TAB 4: DIGITAL PRESCRIPTIONS */}
          {historyTab === 'prescriptions' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {loadingRxs && (
                <div style={{ padding: '16px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.82rem' }}>
                  Loading digital prescriptions...
                </div>
              )}

              {backendPrescriptions.length === 0 && !loadingRxs ? (
                <div style={{ padding: '36px', textAlign: 'center', background: 'var(--bg-badge)', borderRadius: '12px', border: '1px dashed var(--border-default)' }}>
                  <FileText size={36} style={{ color: 'var(--text-muted)', opacity: 0.5, marginBottom: '8px' }} />
                  <h4 style={{ margin: '0 0 6px', fontSize: '0.95rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                    No digital prescriptions on record yet
                  </h4>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: '0 0 14px 0' }}>
                    Prescriptions issued by doctors during consultations will be stored securely here.
                  </p>
                  <Link to="/doctors" className="btn btn-secondary" style={{ display: 'inline-flex', padding: '8px 18px', fontSize: '0.78rem' }}>
                    Consult a Doctor
                  </Link>
                </div>
              ) : (
                backendPrescriptions.map((rx) => (
                  <div key={rx._id || rx.prescription_number} style={{ padding: '16px', borderRadius: '14px', background: 'var(--bg-card)', border: '1.5px solid var(--border-default)', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '8px' }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                            {rx.doctor_name || 'Attending Physician'}
                          </span>
                          <span style={{ fontSize: '0.68rem', padding: '2px 8px', borderRadius: '99px', background: 'rgba(13,124,110,0.1)', color: 'var(--primary)', fontWeight: 700 }}>
                            {rx.doctor_specialization || 'Medicine'}
                          </span>
                        </div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                          Date: {new Date(rx.createdAt).toLocaleDateString('en-GB')} • Prescription #{rx.prescription_number}
                        </div>
                      </div>

                      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                        {rx.diagnosis && (
                          <span style={{ fontSize: '0.72rem', fontWeight: 800, padding: '3px 10px', borderRadius: '6px', background: 'rgba(13,124,110,0.1)', color: 'var(--primary)' }}>
                            Dx: {rx.diagnosis}
                          </span>
                        )}
                        <button
                          type="button"
                          onClick={() => handleCheckRxAvailability(rx)}
                          className="btn btn-secondary"
                          style={{
                            fontSize: '0.72rem', padding: '5px 12px', display: 'inline-flex',
                            alignItems: 'center', gap: '5px', color: 'var(--primary)',
                            borderColor: 'var(--primary)', fontWeight: 700
                          }}
                        >
                          <Store size={13} /> Check Pharmacy Availability
                        </button>
                      </div>
                    </div>

                    {/* Prescribed Medicines List */}
                    <div style={{ padding: '10px 14px', borderRadius: '10px', background: 'var(--bg-badge)', fontSize: '0.78rem' }}>
                      <div style={{ fontWeight: 800, color: 'var(--text-primary)', marginBottom: '4px' }}>Prescribed Medicines:</div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        {(rx.medicines || []).map((m, mIdx) => (
                          <div key={mIdx} style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
                            <span><strong>{m.medicine_name || m.name}</strong> • {m.dosage} ({m.timing || 'After meal'})</span>
                            <span style={{ color: 'var(--text-muted)' }}>{m.duration}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {rx.advice && (
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                        <strong>Doctor's Advice:</strong> {rx.advice}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          )}

          {/* TAB 5: IN-APP NOTIFICATIONS */}
          {historyTab === 'notifications' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
                  Real-time alerts for appointments, pharmacy orders, and health records
                </span>
                {backendNotifications.length > 0 && unreadNotificationsCount > 0 && (
                  <button
                    type="button"
                    onClick={handleMarkAllNotificationsRead}
                    style={{
                      background: 'none', border: 'none', color: 'var(--primary)',
                      fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer', textDecoration: 'underline'
                    }}
                  >
                    Mark all as read
                  </button>
                )}
              </div>

              {loadingNotifications && (
                <div style={{ padding: '16px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.82rem' }}>
                  Loading notifications...
                </div>
              )}

              {backendNotifications.length === 0 && !loadingNotifications ? (
                <div style={{ padding: '36px', textAlign: 'center', background: 'var(--bg-badge)', borderRadius: '12px', border: '1px dashed var(--border-default)' }}>
                  <Bell size={36} style={{ color: 'var(--text-muted)', opacity: 0.5, marginBottom: '8px' }} />
                  <h4 style={{ margin: '0 0 6px', fontSize: '0.95rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                    No notifications yet
                  </h4>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: 0 }}>
                    You will receive instant alerts here for doctor appointments, medicine orders, and prescription updates.
                  </p>
                </div>
              ) : (
                backendNotifications.map((notif) => (
                  <div
                    key={notif._id}
                    onClick={() => !notif.is_read && handleMarkNotificationRead(notif._id)}
                    style={{
                      padding: '12px 14px', borderRadius: '12px',
                      background: notif.is_read ? 'var(--bg-card)' : 'rgba(13,124,110,0.06)',
                      border: `1.5px solid ${notif.is_read ? 'var(--border-default)' : 'rgba(13,124,110,0.25)'}`,
                      display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
                      gap: '12px', cursor: notif.is_read ? 'default' : 'pointer'
                    }}
                  >
                    <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                      <div style={{
                        width: '32px', height: '32px', borderRadius: '8px',
                        background: notif.is_read ? 'var(--bg-badge)' : 'var(--primary)',
                        color: notif.is_read ? 'var(--text-muted)' : '#ffffff',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
                      }}>
                        <Bell size={16} />
                      </div>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontSize: '0.88rem', fontWeight: notif.is_read ? 700 : 800, color: 'var(--text-primary)' }}>
                            {notif.title}
                          </span>
                          {!notif.is_read && (
                            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--primary)', display: 'inline-block' }} />
                          )}
                          <span style={{
                            fontSize: '0.65rem', fontWeight: 700, padding: '2px 6px', borderRadius: '4px',
                            background: 'var(--bg-badge)', color: 'var(--text-muted)', textTransform: 'uppercase'
                          }}>
                            {notif.type || 'SYSTEM'}
                          </span>
                        </div>
                        <p style={{ margin: '4px 0 0 0', fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                          {notif.message}
                        </p>
                        <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', display: 'block', marginTop: '4px' }}>
                          {new Date(notif.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>
                    {!notif.is_read && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleMarkNotificationRead(notif._id);
                        }}
                        style={{
                          border: 'none', background: 'transparent', color: 'var(--primary)',
                          fontSize: '0.72rem', fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap'
                        }}
                      >
                        Mark read
                      </button>
                    )}
                  </div>
                ))
              )}
            </div>
          )}
        </div>

      </div>

      {/* ─── RIGHT COLUMN (PROFILE, MEDICAL SNAPSHOT, MEDS) ─── */}
      <div className="right-sidebar">
        
        {/* Profile Card */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px', borderRadius: '14px', background: 'var(--bg-card)', border: '1px solid var(--border-default)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: 'rgba(13,124,110,0.15)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '1.1rem' }}>
              {patientDisplayName.charAt(0)}
            </div>
            <div>
              <span style={{ fontSize: '0.88rem', fontWeight: 800, display: 'block', color: 'var(--text-primary)' }}>{patientDisplayName}</span>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{patientPhone}</span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setIsEditProfileOpen(true)}
            style={{
              border: 'none', background: 'rgba(13,124,110,0.1)', color: 'var(--primary)',
              borderRadius: '8px', padding: '6px 10px', fontSize: '0.7rem', fontWeight: 800,
              cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px'
            }}
          >
            <Edit3 size={12} /> Edit
          </button>
        </div>

        {/* Real Patient Medical Snapshot Card (P0/Requirement 7 & 8) */}
        <div style={{ padding: '16px', borderRadius: '14px', background: 'var(--bg-card)', border: '1px solid var(--border-default)', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <ShieldCheck size={16} style={{ color: 'var(--primary)' }} /> Clinical Snapshot
            </span>
            <span style={{ fontSize: '0.65rem', fontWeight: 800, padding: '2px 8px', borderRadius: '99px', background: '#dcfce7', color: '#15803d' }}>
              Live Record
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            <div style={{ padding: '8px 10px', borderRadius: '8px', background: 'var(--bg-badge)' }}>
              <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Blood Group</div>
              <div style={{ fontSize: '0.9rem', fontWeight: 800, color: '#ef4444' }}>
                {user?.blood_group || 'Not set'}
              </div>
            </div>

            <div style={{ padding: '8px 10px', borderRadius: '8px', background: 'var(--bg-badge)' }}>
              <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Gender / Age</div>
              <div style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--text-primary)', textTransform: 'capitalize' }}>
                {user?.gender || 'Unspecified'}
              </div>
            </div>
          </div>

          <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <div>
              <strong style={{ color: 'var(--text-primary)' }}>Emergency Contact:</strong>{' '}
              {user?.emergency_contact_phone ? (
                <span>{user.emergency_contact_name || 'Contact'} ({user.emergency_contact_relation || 'Kin'}: {user.emergency_contact_phone})</span>
              ) : (
                <span style={{ color: 'var(--text-muted)' }}>Not configured</span>
              )}
            </div>

            <div>
              <strong style={{ color: 'var(--text-primary)' }}>Allergies:</strong>{' '}
              <span style={{ color: user?.allergies ? '#dc2626' : 'var(--text-muted)' }}>
                {user?.allergies || 'None reported'}
              </span>
            </div>

            <div>
              <strong style={{ color: 'var(--text-primary)' }}>Existing Conditions:</strong>{' '}
              <span>{user?.existing_conditions || 'None reported'}</span>
            </div>
          </div>
        </div>

        {/* Daily Prescribed Dosages (Real data from active database prescriptions) */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontSize: '0.85rem', fontWeight: 800, margin: 0 }}>Active Prescription Dosages</h3>
            <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>{activeMedications.length} items</span>
          </div>

          {activeMedications.length === 0 ? (
            <div style={{ padding: '20px 16px', borderRadius: '12px', background: 'var(--bg-badge)', textAlign: 'center', border: '1px dashed var(--border-default)' }}>
              <Pill size={24} style={{ color: 'var(--text-muted)', opacity: 0.5, marginBottom: '6px' }} />
              <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                No active prescription medicines. Consult an attending doctor to receive digital prescriptions.
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {activeMedications.map(med => {
                const isDone = completedMeds[med.id];
                return (
                  <div 
                    key={med.id} 
                    onClick={() => handleToggleMed(med.id)}
                    className="prescription-pill-card"
                    style={{
                      cursor: 'pointer',
                      background: isDone ? '#f8fafc' : 'white',
                      borderColor: isDone ? 'var(--border-subtle)' : 'var(--border-default)',
                      opacity: isDone ? 0.65 : 1,
                      padding: '10px 12px', borderRadius: '10px',
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                      border: '1px solid var(--border-default)'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <button style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: isDone ? 'var(--success)' : 'var(--text-muted)', padding: 0 }}>
                        {isDone ? <CheckCircle2 size={16} /> : <Circle size={16} />}
                      </button>
                      <div>
                        <span style={{ fontSize: '0.8rem', fontWeight: 700, textDecoration: isDone ? 'line-through' : 'none', color: 'var(--text-primary)' }}>
                          {med.name}
                        </span>
                        <p style={{ fontSize: '0.65rem', color: 'var(--text-muted)', margin: '1px 0 0' }}>
                          {med.dosage} • {med.timing}
                        </p>
                      </div>
                    </div>
                    <ChevronRight size={14} style={{ color: 'var(--text-muted)' }} />
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>

      {/* ─── COMPLETE PATIENT PROFILE MODAL (P0/Requirements 6, 7, 8) ─── */}
      {isEditProfileOpen && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 10000,
          background: 'rgba(15, 23, 42, 0.75)', backdropFilter: 'blur(5px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px'
        }}>
          <div style={{
            background: 'var(--bg-card, #ffffff)', width: '100%', maxWidth: '680px',
            borderRadius: '20px', border: '1px solid var(--border-default)',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.3)',
            maxHeight: '92vh', display: 'flex', flexDirection: 'column', overflow: 'hidden'
          }}>
            {/* Modal Header */}
            <div style={{
              padding: '18px 24px', borderBottom: '1px solid var(--border-default)',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              background: 'linear-gradient(135deg, rgba(13,124,110,0.08) 0%, rgba(34,197,94,0.06) 100%)'
            }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 900, color: 'var(--text-primary)' }}>
                  Complete Patient Profile
                </h3>
                <p style={{ margin: '2px 0 0', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                  Provide emergency contact & clinical details to enable full doctor booking and prescriptions.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setIsEditProfileOpen(false)}
                style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: 'var(--text-muted)', padding: '6px' }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body Form */}
            <form onSubmit={handleSaveProfile} style={{ padding: '20px 24px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '18px' }}>
              
              {/* Section 1: Basic Information */}
              <div>
                <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  1. Basic Information
                </span>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', marginTop: '8px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, marginBottom: '4px' }}>Full Name *</label>
                    <input
                      type="text"
                      required
                      value={profileForm.name}
                      onChange={(e) => setProfileForm(p => ({ ...p, name: e.target.value }))}
                      placeholder="e.g. Rahim Uddin"
                      style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--border-default)', fontSize: '0.85rem' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, marginBottom: '4px' }}>Date of Birth</label>
                    <input
                      type="date"
                      value={profileForm.date_of_birth}
                      onChange={(e) => setProfileForm(p => ({ ...p, date_of_birth: e.target.value }))}
                      style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--border-default)', fontSize: '0.85rem' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, marginBottom: '4px' }}>Gender</label>
                    <select
                      value={profileForm.gender}
                      onChange={(e) => setProfileForm(p => ({ ...p, gender: e.target.value }))}
                      style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--border-default)', fontSize: '0.85rem' }}
                    >
                      <option value="">Select Gender</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, marginBottom: '4px' }}>Blood Group</label>
                    <select
                      value={profileForm.blood_group}
                      onChange={(e) => setProfileForm(p => ({ ...p, blood_group: e.target.value }))}
                      style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--border-default)', fontSize: '0.85rem' }}
                    >
                      <option value="">Select Blood Group</option>
                      <option value="A+">A+</option>
                      <option value="A-">A-</option>
                      <option value="B+">B+</option>
                      <option value="B-">B-</option>
                      <option value="AB+">AB+</option>
                      <option value="AB-">AB-</option>
                      <option value="O+">O+</option>
                      <option value="O-">O-</option>
                    </select>
                  </div>
                </div>

                <div style={{ marginTop: '10px' }}>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, marginBottom: '4px' }}>Residential Address in Rajshahi</label>
                  <input
                    type="text"
                    value={profileForm.address}
                    onChange={(e) => setProfileForm(p => ({ ...p, address: e.target.value }))}
                    placeholder="e.g. House 24, Road 3, Laxmipur, Rajshahi"
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--border-default)', fontSize: '0.85rem' }}
                  />
                </div>
              </div>

              {/* Section 2: Emergency Contact */}
              <div style={{ paddingTop: '10px', borderTop: '1px solid var(--border-default)' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  2. Emergency Information
                </span>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px', marginTop: '8px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, marginBottom: '4px' }}>Emergency Contact Name</label>
                    <input
                      type="text"
                      value={profileForm.emergency_contact_name}
                      onChange={(e) => setProfileForm(p => ({ ...p, emergency_contact_name: e.target.value }))}
                      placeholder="e.g. Karim Uddin"
                      style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--border-default)', fontSize: '0.85rem' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, marginBottom: '4px' }}>Relationship</label>
                    <input
                      type="text"
                      value={profileForm.emergency_contact_relation}
                      onChange={(e) => setProfileForm(p => ({ ...p, emergency_contact_relation: e.target.value }))}
                      placeholder="e.g. Brother / Spouse / Parent"
                      style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--border-default)', fontSize: '0.85rem' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, marginBottom: '4px' }}>Emergency Phone Number</label>
                    <input
                      type="tel"
                      value={profileForm.emergency_contact_phone}
                      onChange={(e) => setProfileForm(p => ({ ...p, emergency_contact_phone: e.target.value }))}
                      placeholder="017XXXXXXXX"
                      style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--border-default)', fontSize: '0.85rem' }}
                    />
                  </div>
                </div>
              </div>

              {/* Section 3: Clinical & Medical Profile */}
              <div style={{ paddingTop: '10px', borderTop: '1px solid var(--border-default)' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  3. Clinical & Medical History
                </span>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '12px', marginTop: '8px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, marginBottom: '4px' }}>Known Drug or Food Allergies</label>
                    <input
                      type="text"
                      value={profileForm.allergies}
                      onChange={(e) => setProfileForm(p => ({ ...p, allergies: e.target.value }))}
                      placeholder="e.g. Penicillin, Sulfa, Dust, None"
                      style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--border-default)', fontSize: '0.85rem' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, marginBottom: '4px' }}>Existing Conditions</label>
                    <input
                      type="text"
                      value={profileForm.existing_conditions}
                      onChange={(e) => setProfileForm(p => ({ ...p, existing_conditions: e.target.value }))}
                      placeholder="e.g. Hypertension, Type-2 Diabetes, Asthma"
                      style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--border-default)', fontSize: '0.85rem' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, marginBottom: '4px' }}>Current Medications</label>
                    <input
                      type="text"
                      value={profileForm.current_medications}
                      onChange={(e) => setProfileForm(p => ({ ...p, current_medications: e.target.value }))}
                      placeholder="e.g. Tab. Amlodipine 5mg once daily"
                      style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--border-default)', fontSize: '0.85rem' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, marginBottom: '4px' }}>Previous Surgeries</label>
                    <input
                      type="text"
                      value={profileForm.previous_surgeries}
                      onChange={(e) => setProfileForm(p => ({ ...p, previous_surgeries: e.target.value }))}
                      placeholder="e.g. Appendectomy (2018), None"
                      style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--border-default)', fontSize: '0.85rem' }}
                    />
                  </div>
                </div>

                <div style={{ marginTop: '10px' }}>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, marginBottom: '4px' }}>General Medical Notes</label>
                  <textarea
                    rows={2}
                    value={profileForm.medical_history}
                    onChange={(e) => setProfileForm(p => ({ ...p, medical_history: e.target.value }))}
                    placeholder="Any relevant past clinical history for your attending doctor..."
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--border-default)', fontSize: '0.85rem' }}
                  />
                </div>
              </div>

              {/* Modal Footer Controls */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px', paddingTop: '14px', borderTop: '1px solid var(--border-default)' }}>
                <button
                  type="button"
                  onClick={() => setIsEditProfileOpen(false)}
                  className="btn btn-secondary"
                  style={{ padding: '8px 18px', fontSize: '0.82rem' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingProfile}
                  className="btn btn-primary"
                  style={{ padding: '8px 22px', fontSize: '0.82rem', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                >
                  <Save size={15} />
                  {isSavingProfile ? 'Saving Changes...' : 'Save Profile'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* ─── PRESCRIPTION PHARMACY AVAILABILITY MODAL ─── */}
      {rxAvailabilityModal.isOpen && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 9999,
          background: 'rgba(15, 23, 42, 0.7)', backdropFilter: 'blur(5px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px'
        }}>
          <div style={{
            background: 'var(--bg-card, #ffffff)', width: '100%', maxWidth: '640px',
            borderRadius: '20px', border: '1px solid var(--border-default)',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            maxHeight: '90vh', display: 'flex', flexDirection: 'column', overflow: 'hidden'
          }}>
            {/* Modal Header */}
            <div style={{
              padding: '20px 24px', borderBottom: '1px solid var(--border-default)',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              background: 'linear-gradient(135deg, rgba(13,124,110,0.08) 0%, rgba(34,197,94,0.05) 100%)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  width: '40px', height: '40px', borderRadius: '12px',
                  background: 'rgba(13,124,110,0.15)', color: 'var(--primary)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                  <Store size={22} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                    Rajshahi Pharmacy Availability Engine
                  </h3>
                  <p style={{ margin: '2px 0 0', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                    Live inventory cross-referenced with your prescription #{rxAvailabilityModal.rx?.prescription_number}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setRxAvailabilityModal(prev => ({ ...prev, isOpen: false }))}
                style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: 'var(--text-muted)', padding: '6px' }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div style={{ padding: '20px 24px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Prescribed Medicines Summary */}
              <div>
                <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Medicines In Prescription:
                </span>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '6px' }}>
                  {(rxAvailabilityModal.rx?.medicines || []).map((m, idx) => (
                    <span key={idx} style={{
                      fontSize: '0.78rem', fontWeight: 700, padding: '4px 10px', borderRadius: '8px',
                      background: 'rgba(13,124,110,0.1)', color: 'var(--primary)', border: '1px solid rgba(13,124,110,0.2)'
                    }}>
                      💊 {m.medicine_name || m.name} {m.dosage ? `(${m.dosage})` : ''}
                    </span>
                  ))}
                </div>
              </div>

              {rxAvailabilityModal.loading ? (
                <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
                  <RefreshCw size={24} style={{ animation: 'spin 1s linear infinite', marginBottom: '8px' }} />
                  <p style={{ fontSize: '0.85rem', fontWeight: 600 }}>Querying verified pharmacies in Rajshahi...</p>
                </div>
              ) : rxAvailabilityModal.error ? (
                <div style={{ padding: '24px', textAlign: 'center', background: 'var(--bg-badge)', borderRadius: '12px' }}>
                  <AlertCircle size={28} style={{ color: '#f59e0b', marginBottom: '8px' }} />
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: '0 0 12px' }}>
                    {rxAvailabilityModal.error}
                  </p>
                  <Link to="/medicines" className="btn btn-primary" style={{ padding: '8px 16px', fontSize: '0.78rem' }}>
                    Browse Medicines Directory
                  </Link>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    Available Pharmacies Nearby ({rxAvailabilityModal.data?.pharmacies?.length || 0}):
                  </span>

                  {(rxAvailabilityModal.data?.pharmacies || []).map((item, idx) => {
                    const ph = item.pharmacy || item;
                    const availableItems = item.availableItems || item.medicinesAvailable || [];
                    const isAllAvailable = item.matchPercentage === 100 || item.allAvailable;

                    return (
                      <div key={idx} style={{
                        padding: '14px 16px', borderRadius: '14px', background: 'var(--bg-card)',
                        border: '1.5px solid var(--border-default)', display: 'flex', flexDirection: 'column', gap: '8px'
                      }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '8px' }}>
                          <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <span style={{ fontSize: '0.92rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                                {ph.name || ph.pharmacyName || 'Model Pharmacy'}
                              </span>
                              {isAllAvailable ? (
                                <span style={{ fontSize: '0.68rem', fontWeight: 800, padding: '2px 8px', borderRadius: '99px', background: '#dcfce7', color: '#15803d' }}>
                                  ✓ All Medicines In Stock
                                </span>
                              ) : (
                                <span style={{ fontSize: '0.68rem', fontWeight: 800, padding: '2px 8px', borderRadius: '99px', background: '#fef3c7', color: '#b45309' }}>
                                  {item.matchPercentage ? `${item.matchPercentage}% Available` : 'Partial Stock'}
                                </span>
                              )}
                            </div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <MapPin size={12} /> {ph.address || ph.area || 'Rajshahi'} • <strong style={{ color: 'var(--primary)' }}>{ph.area || 'Rajshahi Central'}</strong>
                            </div>
                          </div>

                          <div style={{ textAlign: 'right' }}>
                            <span style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--primary)' }}>
                              Rating: ★{ph.rating || 4.8}
                            </span>
                            <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>
                              {ph.delivery_available !== false ? '🛵 Home Delivery Available' : '🏃 Pickup Only'}
                            </div>
                          </div>
                        </div>

                        {/* Stock detail chips */}
                        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '2px' }}>
                          {availableItems.map((med, mIdx) => (
                            <span key={mIdx} style={{
                              fontSize: '0.7rem', padding: '2px 8px', borderRadius: '6px',
                              background: 'rgba(34,197,94,0.08)',
                              color: '#16a34a',
                              border: '1px solid rgba(34,197,94,0.2)',
                              fontWeight: 700
                            }}>
                              ✓ {med.prescribedName || med.matchedBrand || med.medicine} {med.unitPrice ? `(৳${med.unitPrice})` : ''}
                            </span>
                          ))}
                          {(item.missingItems || []).map((mName, mIdx) => (
                            <span key={`mis-${mIdx}`} style={{
                              fontSize: '0.7rem', padding: '2px 8px', borderRadius: '6px',
                              background: 'rgba(239,68,68,0.08)',
                              color: '#dc2626',
                              border: '1px solid rgba(239,68,68,0.2)',
                              fontWeight: 700
                            }}>
                              ✗ {mName} (Out of stock)
                            </span>
                          ))}
                        </div>

                        {/* Pharmacy Actions */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '6px', paddingTop: '8px', borderTop: '1px solid var(--border-default)' }}>
                          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                            📞 {ph.phone || '01700000000'} • {ph.is_24_7 ? '24 Hours Emergency' : 'Open Today'}
                          </span>

                          <div style={{ display: 'flex', gap: '6px' }}>
                            {ph.phone && (
                              <a
                                href={`tel:${ph.phone}`}
                                className="btn btn-secondary"
                                style={{ padding: '5px 10px', fontSize: '0.72rem', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                              >
                                <Phone size={12} /> Call
                              </a>
                            )}
                            <Link
                              to="/medicines"
                              className="btn btn-primary"
                              style={{ padding: '5px 12px', fontSize: '0.72rem', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                            >
                              <Pill size={12} /> Order Now
                            </Link>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div style={{ padding: '14px 24px', borderTop: '1px solid var(--border-default)', display: 'flex', justifyContent: 'flex-end', background: 'var(--bg-badge)' }}>
              <button
                type="button"
                onClick={() => setRxAvailabilityModal(prev => ({ ...prev, isOpen: false }))}
                className="btn btn-secondary"
                style={{ padding: '8px 18px', fontSize: '0.82rem' }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
