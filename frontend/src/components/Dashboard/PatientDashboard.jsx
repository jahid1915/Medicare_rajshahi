import React, { useState, useEffect } from 'react';
import { 
  Bell, ChevronRight, User, Star, Calendar, 
  Clock, CheckCircle2, Circle, Heart, Thermometer, 
  Ruler, Scale, Sparkles, ChevronLeft, ArrowRight,
  Building2, Pill, Stethoscope, FileText, Phone, MapPin,
  CreditCard, ShieldCheck, Tag, Download, Send, Video,
  AlertCircle, CheckCircle, ExternalLink, X, RefreshCw,
  Store, Truck, Copy
} from 'lucide-react';
import { getStoredState, saveStoredState } from '../../data/mockUserStore';
import { DOCTORS } from '../../data/doctors';
import { useAuth } from '../../context/AuthContext';
import { Link, useSearchParams } from 'react-router-dom';
import { appointmentsAPI, pharmaciesAPI, paymentsAPI } from '../../services/api';

export default function PatientDashboard({ initialTab = 'appointments', setActiveTab, onNavigateToDoctor }) {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const state = getStoredState();

  const activeMember = state.activeFamilyMember || state.familyMembers[0];
  const patientDisplayName = user?.name || activeMember.name;
  const patientPhone = user?.phone || '01711223344';
  const patientEmail = user?.email || 'patient@niramoy.health';

  const myHospitalBookings = state.hospitalBookings || [];
  const myPharmacyOrders = state.pharmacyOrders || [];
  const myPrescriptions = state.prescriptions || [];

  // Service History Tab: 'appointments' | 'beds' | 'pharmacy' | 'prescriptions'
  const [historyTab, setHistoryTab] = useState(initialTab);

  // Backend appointments state
  const [backendAppointments, setBackendAppointments] = useState([]);
  const [loadingApts, setLoadingApts] = useState(false);
  const [resendingEmailId, setResendingEmailId] = useState(null);
  const [actionFeedback, setActionFeedback] = useState(null);

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

  useEffect(() => {
    fetchAppointments();
  }, [user]);

  useEffect(() => {
    if (initialTab) setHistoryTab(initialTab);
  }, [initialTab]);

  // Combined appointments: prioritize live database appointments
  const combinedAppointments = React.useMemo(() => {
    const dbMapped = backendAppointments.map(a => ({
      id: a._id || a.appointmentId,
      _id: a._id,
      doctorId: a.doctorId?._id || a.doctorId,
      doctorName: a.doctorId?.name || a.doctorName || 'Doctor',
      doctorAvatar: a.doctorId?.avatar || a.doctorAvatar,
      specialty: a.doctorId?.specialty || a.specialty || 'General Physician',
      degrees: a.doctorId?.degrees || a.doctorDegree,
      chamberName: a.branchId?.name || a.chamberName || 'Rajshahi Chamber',
      branchAddress: a.branchId?.address || a.chamberAddress,
      date: a.appointmentDate ? new Date(a.appointmentDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : a.date,
      time: a.startTime ? `${a.startTime}${a.endTime ? ' - ' + a.endTime : ''}` : a.time,
      serialNumber: a.serialNumber,
      status: a.status || 'CONFIRMED',
      paymentStatus: a.paymentStatus || 'PAID',
      fee: a.consultationFee || a.fee || 800,
      appointmentType: a.appointmentType || 'IN_PERSON',
      paymentTxnId: a.paymentId?.transactionId || a.sslTransactionId || a.paymentTxnId || 'SSL-SANDBOX',
      patientName: a.patientName || patientDisplayName,
      isBackend: true
    }));

    if (dbMapped.length > 0) {
      return dbMapped;
    }

    return state.appointments || [];
  }, [backendAppointments, state.appointments, patientDisplayName]);

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
      // Fallback local calculation if backend demo ID is requested
      setRxAvailabilityModal(prev => ({
        ...prev,
        loading: false,
        data: {
          prescriptionId: rx.id || rx._id,
          diagnosis: rx.diagnosis,
          medicinesRequested: (rx.medicines || []).map(m => m.name),
          pharmacies: [
            {
              pharmacyId: 'p-1',
              pharmacyName: 'Niramoy Model Pharmacy (RMCH Main Gate)',
              address: 'Laxmipur Moor, Medical College Gate, Rajshahi',
              phone: '+880 1711-445566',
              distanceKm: 0.8,
              deliveryAvailable: true,
              openingHours: '24 Hours Emergency',
              medicinesAvailable: (rx.medicines || []).map(m => ({ medicine: m.name, inStock: true, price: 35 })),
              allAvailable: true,
              totalEstimatedPrice: (rx.medicines || []).length * 35
            },
            {
              pharmacyId: 'p-2',
              pharmacyName: 'Laxmipur Central Pharma Care',
              address: 'Opposite to Popular Diagnostic, Laxmipur, Rajshahi',
              phone: '+880 1819-223344',
              distanceKm: 1.4,
              deliveryAvailable: true,
              openingHours: '8:00 AM - 12:00 AM',
              medicinesAvailable: (rx.medicines || []).map((m, idx) => ({ medicine: m.name, inStock: idx % 2 === 0, price: 32 })),
              allAvailable: false,
              totalEstimatedPrice: (rx.medicines || []).length * 32
            },
            {
              pharmacyId: 'p-3',
              pharmacyName: 'Shaheb Bazar Dawakhana',
              address: 'Zero Point Market, Shaheb Bazar, Rajshahi',
              phone: '+880 1912-778899',
              distanceKm: 3.2,
              deliveryAvailable: false,
              openingHours: '9:00 AM - 11:00 PM',
              medicinesAvailable: (rx.medicines || []).map(m => ({ medicine: m.name, inStock: true, price: 30 })),
              allAvailable: true,
              totalEstimatedPrice: (rx.medicines || []).length * 30
            }
          ]
        }
      }));
    }
  };

  // Treatment calendar states
  const [activeCalDay, setActiveCalDay] = useState(12);
  const [completedMeds, setCompletedMeds] = useState({});
  const [searchQuery, setSearchQuery] = useState('');

  const calendarDays = [
    { label: 'Mon', number: 10 },
    { label: 'Tue', number: 11 },
    { label: 'Wed', number: 12 },
    { label: 'Thu', number: 13 },
    { label: 'Fri', number: 14 },
    { label: 'Sat', number: 15 }
  ];

  const defaultMeds = [
    { id: 'm1', name: 'Vitamin C 500mg', instruction: 'Once daily after breakfast' },
    { id: 'm2', name: 'Napa Extra', instruction: '1 tablet when having mild pain' }
  ];

  const realMeds = [];
  myPrescriptions.forEach(p => {
    (p.medicines || []).forEach((m, idx) => {
      realMeds.push({
        id: `rx-med-${p.id}-${idx}`,
        name: m.name,
        instruction: `${m.dosage} • ${m.frequency}`
      });
    });
  });

  const medicationList = realMeds.length > 0 ? realMeds : defaultMeds;

  const handleToggleMed = (medId) => {
    setCompletedMeds(prev => ({
      ...prev,
      [medId]: !prev[medId]
    }));
  };

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

        {/* Quick Service Summary Counters */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '10px' }}>
          {[
            { label: 'Doctor Visits', count: combinedAppointments.length, color: 'var(--primary)', icon: Stethoscope },
            { label: 'Bed Bookings', count: myHospitalBookings.length, color: '#8b5cf6', icon: Building2 },
            { label: 'Medicine Orders', count: myPharmacyOrders.length, color: '#2563eb', icon: Pill },
            { label: 'Prescriptions', count: myPrescriptions.length, color: '#16a34a', icon: FileText }
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
            <div style={{ display: 'flex', gap: '6px', background: 'var(--bg-badge)', padding: '4px', borderRadius: '10px', border: '1px solid var(--border-default)' }}>
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
                🩺 Doctors ({combinedAppointments.length})
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
                🏥 Beds ({myHospitalBookings.length})
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
                💊 Pharmacy ({myPharmacyOrders.length})
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
                📄 Rx ({myPrescriptions.length})
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

              {combinedAppointments.length === 0 && !loadingApts ? (
                <div style={{ padding: '36px', textAlign: 'center', background: 'var(--bg-badge)', borderRadius: '12px' }}>
                  <Stethoscope size={32} style={{ color: 'var(--text-muted)', opacity: 0.5, marginBottom: '8px' }} />
                  <p style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-secondary)', margin: 0 }}>
                    No doctor consultations scheduled yet.
                  </p>
                  <Link to="/doctors" className="btn btn-primary" style={{ marginTop: '12px', display: 'inline-flex', padding: '8px 18px', fontSize: '0.78rem' }}>
                    Find & Book a Doctor →
                  </Link>
                </div>
              ) : (
                combinedAppointments.map((apt) => {
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
              {myHospitalBookings.length === 0 ? (
                <div style={{ padding: '36px', textAlign: 'center', background: 'var(--bg-badge)', borderRadius: '12px' }}>
                  <Building2 size={32} style={{ color: 'var(--text-muted)', opacity: 0.5, marginBottom: '8px' }} />
                  <p style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-secondary)', margin: 0 }}>
                    No hospital beds or cabins reserved yet.
                  </p>
                  <Link to="/hospitals" className="btn btn-primary" style={{ marginTop: '12px', display: 'inline-flex', padding: '8px 18px', fontSize: '0.78rem' }}>
                    View Hospital Resources & Reserve Bed →
                  </Link>
                </div>
              ) : (
                myHospitalBookings.map((bed) => (
                  <div 
                    key={bed.id} 
                    style={{ 
                      padding: '14px 16px', borderRadius: '12px', background: 'var(--bg-card)', 
                      border: '1.5px solid var(--border-default)', display: 'flex', justifyContent: 'space-between', 
                      alignItems: 'center', flexWrap: 'wrap', gap: '12px' 
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: 'rgba(139,92,246,0.12)', color: '#8b5cf6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Building2 size={22} />
                      </div>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontSize: '0.92rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                            {bed.hospitalName}
                          </span>
                          <span style={{ fontSize: '0.68rem', fontWeight: 700, padding: '2px 8px', borderRadius: '99px', background: 'rgba(139,92,246,0.15)', color: '#8b5cf6' }}>
                            {bed.category || 'Inpatient'}
                          </span>
                        </div>
                        <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--primary)', marginTop: '2px' }}>
                          {bed.bedType}
                        </div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                          Expected Admission: <strong>{bed.admissionDate}</strong> • Patient: <strong>{bed.patientName}</strong>
                        </div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                          Booking Reference ID: <strong style={{ fontFamily: 'monospace', color: '#16a34a' }}>{bed.referenceId}</strong>
                        </div>
                      </div>
                    </div>

                    <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
                      <span style={{ fontSize: '1rem', fontWeight: 900, color: '#8b5cf6' }}>
                        ৳{bed.estimatedDailyFee || bed.advancePaid} / day
                      </span>
                      <span style={{ 
                        fontSize: '0.68rem', fontWeight: 800, padding: '3px 10px', borderRadius: '6px',
                        background: 'rgba(34,197,94,0.15)', color: '#16a34a'
                      }}>
                        {bed.status || 'Confirmed'}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* TAB 3: PHARMACY MEDICINE ORDERS */}
          {historyTab === 'pharmacy' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {myPharmacyOrders.length === 0 ? (
                <div style={{ padding: '36px', textAlign: 'center', background: 'var(--bg-badge)', borderRadius: '12px' }}>
                  <Pill size={32} style={{ color: 'var(--text-muted)', opacity: 0.5, marginBottom: '8px' }} />
                  <p style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-secondary)', margin: 0 }}>
                    No pharmacy orders placed yet.
                  </p>
                  <Link to="/medicines" className="btn btn-primary" style={{ marginTop: '12px', display: 'inline-flex', padding: '8px 18px', fontSize: '0.78rem' }}>
                    Browse Medicines & Order →
                  </Link>
                </div>
              ) : (
                myPharmacyOrders.map((ord) => (
                  <div 
                    key={ord.id} 
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
                            {ord.pharmacyName}
                          </span>
                          <span style={{ fontSize: '0.68rem', fontFamily: 'monospace', color: 'var(--text-muted)' }}>
                            #{ord.id}
                          </span>
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '3px' }}>
                          Items: <strong>{(ord.items || []).join(', ')}</strong>
                        </div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                          📅 {ord.date} • Delivery Address: {ord.deliveryAddress || 'Rajshahi Delivery'}
                        </div>
                      </div>
                    </div>

                    <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
                      <span style={{ fontSize: '1rem', fontWeight: 900, color: 'var(--primary)' }}>
                        ৳{ord.totalAmount}
                      </span>
                      <span style={{ 
                        fontSize: '0.68rem', fontWeight: 800, padding: '3px 10px', borderRadius: '6px',
                        background: ord.status === 'Delivered' ? 'rgba(34,197,94,0.15)' : 'rgba(59,130,246,0.15)',
                        color: ord.status === 'Delivered' ? '#16a34a' : '#2563eb'
                      }}>
                        {ord.status || 'Pending Dispatch'}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* TAB 4: DIGITAL PRESCRIPTIONS */}
          {historyTab === 'prescriptions' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {myPrescriptions.length === 0 ? (
                <div style={{ padding: '36px', textAlign: 'center', background: 'var(--bg-badge)', borderRadius: '12px' }}>
                  <FileText size={32} style={{ color: 'var(--text-muted)', opacity: 0.5, marginBottom: '8px' }} />
                  <p style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-secondary)', margin: 0 }}>
                    No digital prescriptions on record yet.
                  </p>
                </div>
              ) : (
                myPrescriptions.map((rx) => (
                  <div key={rx.id} style={{ padding: '14px 16px', borderRadius: '12px', background: 'var(--bg-card)', border: '1.5px solid var(--border-default)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px', marginBottom: '8px' }}>
                      <div>
                        <span style={{ fontSize: '0.92rem', fontWeight: 800, color: 'var(--text-primary)' }}>{rx.doctorName}</span>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Date: {rx.date} • Prescription #{rx.id}</div>
                      </div>
                      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                        <span style={{ fontSize: '0.72rem', fontWeight: 800, padding: '3px 10px', borderRadius: '6px', background: 'rgba(13,124,110,0.1)', color: 'var(--primary)' }}>
                          Diagnosis: {rx.diagnosis}
                        </span>
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
                          <Store size={13} /> Find in Pharmacies
                        </button>
                      </div>
                    </div>
                    <div style={{ padding: '8px 12px', borderRadius: '8px', background: 'var(--bg-badge)', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                      <strong>Medicines:</strong> {(rx.medicines || []).map(m => `${m.name} (${m.dosage})`).join('; ')}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

      </div>

      {/* ─── RIGHT COLUMN (PROFILE, METRICS, MEDS) ─── */}
      <div className="right-sidebar">
        
        {/* Profile Card */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 14px', borderRadius: '12px', background: 'var(--bg-card)', border: '1px solid var(--border-default)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '42px', height: '42px', borderRadius: '50%', background: 'rgba(13,124,110,0.15)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '1rem' }}>
              {patientDisplayName.charAt(0)}
            </div>
            <div>
              <span style={{ fontSize: '0.85rem', fontWeight: 800, display: 'block', color: 'var(--text-primary)' }}>{patientDisplayName}</span>
              <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>{patientPhone}</span>
            </div>
          </div>
          <span style={{ fontSize: '0.65rem', fontWeight: 700, padding: '2px 8px', borderRadius: '6px', background: 'rgba(13,124,110,0.1)', color: 'var(--primary)' }}>
            Patient
          </span>
        </div>

        {/* 2x2 Metrics Grid */}
        <div className="metrics-grid">
          <div className="metric-card">
            <div className="metric-card-header">
              <Heart style={{ width: 16, height: 16, color: '#ef4444' }} />
              <span style={{ fontSize: '0.5625rem', fontWeight: 650 }}>Normal</span>
            </div>
            <div>
              <span className="metric-card-value">72 bpm</span>
              <p className="metric-card-label">Heart rate</p>
            </div>
            <svg viewBox="0 0 100 30" style={{ width: '100%', height: '24px' }}>
              <path d="M0,15 L30,15 L35,5 L40,25 L45,15 L100,15" fill="none" stroke="#ef4444" strokeWidth="2.5" />
            </svg>
          </div>

          <div className="metric-card">
            <div className="metric-card-header">
              <Thermometer style={{ width: 16, height: 16, color: '#0ea5e9' }} />
              <span style={{ fontSize: '0.5625rem', color: 'var(--text-muted)' }}>Normal</span>
            </div>
            <div>
              <span className="metric-card-value">98.4 F</span>
              <p className="metric-card-label">Body Temp</p>
            </div>
            <svg viewBox="0 0 100 30" style={{ width: '100%', height: '24px' }}>
              <path d="M0,15 Q25,5 50,15 T100,15" fill="none" stroke="#0ea5e9" strokeWidth="2" />
            </svg>
          </div>

          <div className="metric-card">
            <div className="metric-card-header">
              <Ruler style={{ width: 16, height: 16, color: '#8b5cf6' }} />
            </div>
            <div>
              <span className="metric-card-value">O+</span>
              <p className="metric-card-label">Blood Group</p>
            </div>
          </div>

          <div className="metric-card">
            <div className="metric-card-header">
              <Scale style={{ width: 16, height: 16, color: '#f59e0b' }} />
            </div>
            <div>
              <span className="metric-card-value">64 Kg</span>
              <p className="metric-card-label">Weight</p>
            </div>
          </div>
        </div>

        {/* Treatment calendar & Daily Meds */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontSize: '0.875rem', fontWeight: 800 }}>Treatment calendar</h3>
            <div style={{ display: 'flex', gap: '4px' }}>
              <button style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: 'var(--text-muted)' }}><ChevronLeft style={{ width: 16, height: 16 }} /></button>
              <button style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: 'var(--text-muted)' }}><ChevronRight style={{ width: 16, height: 16 }} /></button>
            </div>
          </div>

          <div className="calendar-strip">
            {calendarDays.map(day => (
              <button 
                key={day.number} 
                onClick={() => setActiveCalDay(day.number)}
                className={`calendar-day-btn ${activeCalDay === day.number ? 'active' : ''}`}
              >
                <span className="day-label">{day.label}</span>
                <span className="day-number">{day.number}</span>
              </button>
            ))}
          </div>

          <div style={{ marginTop: '6px' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-secondary)', marginBottom: '8px' }}>
              Daily Prescribed Dosages:
            </div>
            {medicationList.map(med => {
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
                    opacity: isDone ? 0.65 : 1
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <button style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: isDone ? 'var(--success)' : 'var(--text-muted)' }}>
                      {isDone ? <CheckCircle2 style={{ width: 18, height: 18 }} /> : <Circle style={{ width: 18, height: 18 }} />}
                    </button>
                    <div>
                      <span style={{ fontSize: '0.8125rem', fontWeight: 700, textDecoration: isDone ? 'line-through' : 'none', color: 'var(--text-primary)' }}>
                        {med.name}
                      </span>
                      <p style={{ fontSize: '0.625rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                        {med.instruction}
                      </p>
                    </div>
                  </div>
                  <ChevronRight style={{ width: 14, height: 14, color: 'var(--text-muted)' }} />
                </div>
              );
            })}
          </div>
        </div>

      </div>

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
                    Live inventory cross-referenced with your prescription from {rxAvailabilityModal.rx?.doctorName}
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
                      💊 {m.name} {m.dosage ? `(${m.dosage})` : ''}
                    </span>
                  ))}
                </div>
              </div>

              {rxAvailabilityModal.loading ? (
                <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
                  <RefreshCw size={24} style={{ animation: 'spin 1s linear infinite', marginBottom: '8px' }} />
                  <p style={{ fontSize: '0.85rem', fontWeight: 600 }}>Querying verified pharmacies in Rajshahi...</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    Available Pharmacies Nearby ({rxAvailabilityModal.data?.pharmacies?.length || 0}):
                  </span>

                  {(rxAvailabilityModal.data?.pharmacies || []).map((ph, idx) => (
                    <div key={idx} style={{
                      padding: '14px 16px', borderRadius: '14px', background: 'var(--bg-card)',
                      border: '1.5px solid var(--border-default)', display: 'flex', flexDirection: 'column', gap: '8px'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '8px' }}>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ fontSize: '0.92rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                              {ph.pharmacyName}
                            </span>
                            {ph.allAvailable ? (
                              <span style={{ fontSize: '0.68rem', fontWeight: 800, padding: '2px 8px', borderRadius: '99px', background: '#dcfce7', color: '#15803d' }}>
                                ✓ All Medicines In Stock
                              </span>
                            ) : (
                              <span style={{ fontSize: '0.68rem', fontWeight: 800, padding: '2px 8px', borderRadius: '99px', background: '#fef3c7', color: '#b45309' }}>
                                Partial Stock
                              </span>
                            )}
                          </div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <MapPin size={12} /> {ph.address} • <strong style={{ color: 'var(--primary)' }}>{ph.distanceKm} km away</strong>
                          </div>
                        </div>

                        <div style={{ textAlign: 'right' }}>
                          <span style={{ fontSize: '1rem', fontWeight: 900, color: 'var(--primary)' }}>
                            Est. ৳{ph.totalEstimatedPrice}
                          </span>
                          <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>
                            {ph.deliveryAvailable ? '🛵 Home Delivery Available' : '🏃 Pickup Only'}
                          </div>
                        </div>
                      </div>

                      {/* Stock detail chips */}
                      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '2px' }}>
                        {(ph.medicinesAvailable || []).map((med, mIdx) => (
                          <span key={mIdx} style={{
                            fontSize: '0.7rem', padding: '2px 8px', borderRadius: '6px',
                            background: med.inStock ? 'rgba(34,197,94,0.08)' : 'rgba(239,68,68,0.08)',
                            color: med.inStock ? '#16a34a' : '#dc2626',
                            border: `1px solid ${med.inStock ? 'rgba(34,197,94,0.2)' : 'rgba(239,68,68,0.2)'}`,
                            fontWeight: 700
                          }}>
                            {med.inStock ? '✓' : '✗'} {med.medicine} {med.price ? `(৳${med.price})` : ''}
                          </span>
                        ))}
                      </div>

                      {/* Pharmacy Actions */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '6px', paddingTop: '8px', borderTop: '1px solid var(--border-default)' }}>
                        <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                          📞 {ph.phone} • {ph.openingHours}
                        </span>

                        <div style={{ display: 'flex', gap: '6px' }}>
                          <a
                            href={`tel:${ph.phone}`}
                            className="btn btn-secondary"
                            style={{ padding: '5px 10px', fontSize: '0.72rem', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                          >
                            <Phone size={12} /> Call
                          </a>
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
                  ))}
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
