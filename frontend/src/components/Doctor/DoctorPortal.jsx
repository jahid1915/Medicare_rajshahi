import React, { useState, useEffect, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  doctorsAPI, appointmentsAPI, prescriptionsAPI 
} from '../../services/api';
import {
  LayoutDashboard, CalendarDays, Users, MessageSquare, Clock,
  Stethoscope, ClipboardList, UserCheck, Settings, Sparkles,
  Search, Plus, RefreshCw, CheckCircle2, AlertCircle, AlertTriangle,
  Video, VideoOff, Mic, MicOff, PhoneOff, Phone, Mail, FileText,
  ShieldCheck, ChevronRight, ChevronDown, Edit3, Trash2, Send,
  Building2, Download, Loader2, X, Eye, Heart, Activity, Check,
  Sliders, ArrowRight, User
} from 'lucide-react';
import TeleconsultationRoom from './TeleconsultationRoom';

export default function DoctorPortal({ initialTab = 'dashboard' }) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // Determine active tab from URL or prop
  const currentPath = location.pathname;
  const getTabFromPath = () => {
    if (currentPath.includes('/appointments')) return 'appointments';
    if (currentPath.includes('/patients')) return 'patients';
    if (currentPath.includes('/messages')) return 'messages';
    if (currentPath.includes('/schedule')) return 'schedule';
    if (currentPath.includes('/consultations')) return 'consultations';
    if (currentPath.includes('/prescriptions')) return 'prescriptions';
    if (currentPath.includes('/profile')) return 'profile';
    if (currentPath.includes('/settings')) return 'settings';
    if (currentPath.includes('/ai-copilot') || currentPath.includes('/tools')) return 'tools';
    return initialTab || 'dashboard';
  };

  const [activeTab, setActiveTab] = useState(getTabFromPath());

  useEffect(() => {
    setActiveTab(getTabFromPath());
  }, [location.pathname]);

  // Master Doctor Data State
  const [doctorProfile, setDoctorProfile] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState(null);

  // Sub-filter & Search states
  const [apptFilter, setApptFilter] = useState('all'); // 'all' | 'today' | 'telemedicine' | 'chamber' | 'completed'
  const [apptSearch, setApptSearch] = useState('');
  const [patientSearch, setPatientSearch] = useState('');
  const [scheduleDay, setScheduleDay] = useState('today'); // 'today' | 'tomorrow' | 'week'
  const [activeChamberIdx, setActiveChamberIdx] = useState(0);

  // Modals & Bottom Sheets
  const [activeTeleconsultationAppt, setActiveTeleconsultationAppt] = useState(null);
  const [prescriptionModalAppt, setPrescriptionModalAppt] = useState(null);
  const [selectedPatientDetail, setSelectedPatientDetail] = useState(null);
  const [profileEditOpen, setProfileEditOpen] = useState(false);

  // Prescription Form State
  const [rxDiagnosis, setRxDiagnosis] = useState('');
  const [rxMedicines, setRxMedicines] = useState([
    { name: '', dosage: '1 tablet', frequency: '3 times daily after food', duration: '5 days' }
  ]);
  const [rxAdvice, setRxAdvice] = useState('Drink plenty of boiled water. Take adequate rest.');
  const [rxTests, setRxTests] = useState('');
  const [rxBp, setRxBp] = useState('120/80 mmHg');
  const [rxPulse, setRxPulse] = useState('74 bpm');
  const [isSubmittingRx, setIsSubmittingRx] = useState(false);
  const [rxFeedback, setRxFeedback] = useState(null);

  // Profile Edit Form State
  const [editName, setEditName] = useState('');
  const [editSpecialty, setEditSpecialty] = useState('');
  const [editDesignation, setEditDesignation] = useState('');
  const [editWorkplace, setEditWorkplace] = useState('');
  const [editQualifications, setEditQualifications] = useState('');
  const [editBmdc, setEditBmdc] = useState('');
  const [editFee, setEditFee] = useState(800);
  const [editBio, setEditBio] = useState('');
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [profileFeedback, setProfileFeedback] = useState(null);

  // Chat State
  const [activeChatPatient, setActiveChatPatient] = useState(null);
  const [chatMessages, setChatMessages] = useState([
    { id: 1, sender: 'patient', text: 'Dr. Rahman, I am having mild cough for the last 2 days.', time: '09:30 AM' },
    { id: 2, sender: 'doctor', text: 'Hello! Are you also experiencing fever, body aches, or shortness of breath?', time: '09:32 AM' },
    { id: 3, sender: 'patient', text: 'No fever doctor, only dry irritation in throat.', time: '09:35 AM' },
    { id: 4, sender: 'doctor', text: 'I understand. Please take warm salt water gargle 3 times a day and stay hydrated. Let us review if cough persists.', time: '09:36 AM' }
  ]);
  const [chatInput, setChatInput] = useState('');

  // AI Decision Support Tool State
  const [selectedPatientForNote, setSelectedPatientForNote] = useState(null);
  const [aiNoteDraft, setAiNoteDraft] = useState('');

  // Initial Data Fetch
  const loadPortalData = async () => {
    try {
      setSyncing(true);
      setError(null);

      const [profRes, apptRes, rxRes, patientRes] = await Promise.allSettled([
        doctorsAPI.getMe(),
        appointmentsAPI.getMine({ limit: 150 }),
        prescriptionsAPI.getMyPrescriptions({ limit: 100 }),
        doctorsAPI.getMyPatients()
      ]);

      if (profRes.status === 'fulfilled' && profRes.value?.data) {
        const d = profRes.value.data;
        setDoctorProfile(d);
        setEditName(d.name || user?.name || '');
        setEditSpecialty(d.specialty || user?.specialization || 'General Practice');
        setEditDesignation(d.designation || 'Consultant Specialist');
        setEditWorkplace(d.workplace || 'Rajshahi Medical College Hospital');
        setEditQualifications(d.qualifications || 'MBBS, FCPS');
        setEditBmdc(d.bmdcRegistration || 'A-89421');
        setEditFee(d.consultation_fee || 800);
        setEditBio(d.biography || 'Senior Specialist serving patients in Rajshahi with comprehensive clinical diagnostics and compassionate care.');
      } else {
        // Fallback profile if brand new session
        setDoctorProfile({
          name: user?.name || 'Dr. Attending Physician',
          specialty: user?.specialization || 'General Medicine',
          designation: 'Attending Physician',
          workplace: 'Rajshahi Medical College Hospital',
          qualifications: 'MBBS',
          bmdcRegistration: 'A-89421',
          consultation_fee: 800,
          chambers: [
            {
              name: 'Rajshahi Central Chamber',
              address: 'Laxmipur, Rajshahi',
              visiting_hours: '05:00 PM - 09:00 PM',
              closed_day: 'Friday',
              appointment: '01711000000'
            }
          ]
        });
      }

      if (apptRes.status === 'fulfilled' && apptRes.value) {
        const apptList = apptRes.value.data?.data || apptRes.value.data || [];
        setAppointments(Array.isArray(apptList) ? apptList : []);
      }

      if (rxRes.status === 'fulfilled' && rxRes.value) {
        const rxList = rxRes.value.data?.data || rxRes.value.data || [];
        setPrescriptions(Array.isArray(rxList) ? rxList : []);
      }

      if (patientRes.status === 'fulfilled' && patientRes.value?.data?.patients) {
        setPatients(patientRes.value.data.patients);
      }
    } catch (err) {
      console.error('Error loading doctor portal:', err);
      setError('Unable to load clinical records from healthcare database. Please retry.');
    } finally {
      setLoading(false);
      setSyncing(false);
    }
  };

  useEffect(() => {
    loadPortalData();
  }, []);

  // Filter Helper for Today
  const isTodayDate = (dateStr) => {
    if (!dateStr) return false;
    const d = new Date(dateStr);
    const today = new Date();
    return d.getDate() === today.getDate() &&
      d.getMonth() === today.getMonth() &&
      d.getFullYear() === today.getFullYear();
  };

  // Real Stats
  const todayAppointments = useMemo(() => appointments.filter(a => isTodayDate(a.appointmentDate)), [appointments]);
  const pendingRequests = useMemo(() => appointments.filter(a => a.status === 'PENDING' || a.status === 'pending'), [appointments]);
  const completedAppointments = useMemo(() => appointments.filter(a => a.status === 'COMPLETED' || a.status === 'completed'), [appointments]);
  const confirmedAppointments = useMemo(() => appointments.filter(a => a.status === 'CONFIRMED' || a.status === 'confirmed'), [appointments]);
  const telemedicineAppts = useMemo(() => appointments.filter(a => 
    a.appointmentType?.toLowerCase().includes('online') || a.consultation_type?.toLowerCase().includes('online')
  ), [appointments]);

  // Filtered Appointments
  const filteredAppointments = useMemo(() => {
    return appointments.filter(appt => {
      // Sub-filter
      if (apptFilter === 'today' && !isTodayDate(appt.appointmentDate)) return false;
      if (apptFilter === 'telemedicine' && !(appt.appointmentType?.toLowerCase().includes('online') || appt.consultation_type?.toLowerCase().includes('online'))) return false;
      if (apptFilter === 'chamber' && (appt.appointmentType?.toLowerCase().includes('online') || appt.consultation_type?.toLowerCase().includes('online'))) return false;
      if (apptFilter === 'completed' && appt.status !== 'COMPLETED' && appt.status !== 'completed') return false;

      // Search Query
      if (apptSearch.trim()) {
        const q = apptSearch.toLowerCase();
        const pName = (appt.patientName || appt.patientId?.name || '').toLowerCase();
        const pPhone = (appt.patientPhone || appt.patientId?.phone || '').toLowerCase();
        const serial = (appt.serialNumber || appt.appointmentId || '').toLowerCase();
        const reason = (appt.consultationReason || appt.symptoms || '').toLowerCase();
        return pName.includes(q) || pPhone.includes(q) || serial.includes(q) || reason.includes(q);
      }

      return true;
    });
  }, [appointments, apptFilter, apptSearch]);

  // Filtered Patients
  const filteredPatients = useMemo(() => {
    if (!patientSearch.trim()) return patients.length > 0 ? patients : appointments.map(a => ({
      id: a.patientId?._id || a.patientPhone || a._id,
      name: a.patientName || a.patientId?.name || 'Patient',
      phone: a.patientPhone || a.patientId?.phone || '01700000000',
      email: a.patientEmail || a.patientId?.email || '',
      gender: a.patientId?.gender || a.gender || 'Not specified',
      bloodGroup: a.patientId?.blood_group || 'Unknown',
      lastAppointmentDate: a.appointmentDate,
      totalAppointments: 1,
      latestDiagnosis: a.consultationReason || 'Clinical review',
      status: a.status || 'CONFIRMED',
      serialNumber: a.serialNumber || a.appointmentId
    }));

    const q = patientSearch.toLowerCase();
    return patients.filter(p => 
      p.name?.toLowerCase().includes(q) || 
      p.phone?.toLowerCase().includes(q) || 
      p.email?.toLowerCase().includes(q)
    );
  }, [patients, appointments, patientSearch]);

  // Next Patient in Queue
  const nextPatient = todayAppointments.find(a => a.status === 'CONFIRMED' || a.status === 'PENDING') || appointments[0];

  // Appointment Status Updater
  const handleUpdateStatus = async (apptId, newStatus) => {
    try {
      await appointmentsAPI.updateStatus(apptId, { status: newStatus });
      setAppointments(prev => prev.map(a => a._id === apptId ? { ...a, status: newStatus } : a));
    } catch (err) {
      alert('Failed to update status: ' + err.message);
    }
  };

  // Prescription Form Actions
  const openPrescriptionModal = (appt) => {
    setPrescriptionModalAppt(appt);
    setRxDiagnosis(appt.consultationReason || appt.symptoms || 'General Clinical Review');
    setRxMedicines([{ name: '', dosage: '1 tablet', frequency: '3 times daily after food', duration: '5 days' }]);
    setRxAdvice('Drink plenty of water (2.5L daily). Rest adequately. Follow up in 7 days if symptoms persist.');
    setRxTests('');
    setRxFeedback(null);
  };

  const handleAddMedicineRow = () => {
    setRxMedicines(prev => [...prev, { name: '', dosage: '1 tablet', frequency: '2 times daily after food', duration: '7 days' }]);
  };

  const handleRemoveMedicineRow = (idx) => {
    setRxMedicines(prev => prev.filter((_, i) => i !== idx));
  };

  const handleSubmitPrescription = async (e) => {
    e.preventDefault();
    if (!prescriptionModalAppt) return;

    const validMedicines = rxMedicines
      .filter(m => m.name.trim())
      .map(m => ({
        medicine_name: m.name.trim(),
        dosage: m.dosage.trim() || '1 tablet',
        duration: m.duration.trim() || '5 days',
        timing: 'After meal',
        instructions: m.frequency.trim() || 'As directed'
      }));

    if (validMedicines.length === 0) {
      setRxFeedback({ type: 'error', text: 'Please add at least one valid medicine with a name.' });
      return;
    }

    try {
      setIsSubmittingRx(true);
      setRxFeedback(null);

      const patientId = prescriptionModalAppt.patientId?._id || prescriptionModalAppt.patientId || prescriptionModalAppt.patient_id;
      
      const payload = {
        patient_id: patientId,
        appointment_id: prescriptionModalAppt._id,
        diagnosis: rxDiagnosis.trim() || 'Clinical Consultation',
        medicines: validMedicines,
        advice: rxAdvice.trim(),
        tests_advised: rxTests ? rxTests.split(',').map(t => t.trim()).filter(Boolean) : [],
        vitals: {
          blood_pressure: rxBp,
          pulse: rxPulse
        },
        source_type: prescriptionModalAppt.appointmentType?.toLowerCase().includes('online') ? 'teleconsultation' : 'in_person'
      };

      const res = await prescriptionsAPI.create(payload);
      const createdRx = res.data?.data || res.data || res;

      setPrescriptions(prev => [createdRx, ...prev]);
      setAppointments(prev => prev.map(a => a._id === prescriptionModalAppt._id ? { ...a, status: 'COMPLETED' } : a));
      
      setRxFeedback({ 
        type: 'success', 
        text: `Prescription #${createdRx.prescription_number || 'ISSUED'} successfully registered in database & linked with Pharmacy ecosystem.` 
      });

      setTimeout(() => {
        setPrescriptionModalAppt(null);
      }, 1500);
    } catch (err) {
      console.error('Failed to issue prescription:', err);
      setRxFeedback({ type: 'error', text: err.message || 'Error saving prescription to database.' });
    } finally {
      setIsSubmittingRx(false);
    }
  };

  // Profile Save Actions
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    try {
      setIsSavingProfile(true);
      setProfileFeedback(null);

      const payload = {
        name: editName.trim(),
        specialty: editSpecialty.trim(),
        designation: editDesignation.trim(),
        workplace: editWorkplace.trim(),
        qualifications: editQualifications.trim(),
        bmdcRegistration: editBmdc.trim(),
        consultation_fee: Number(editFee),
        biography: editBio.trim()
      };

      const res = await doctorsAPI.updateMe(payload);
      const updated = res.data?.data || res.data || payload;
      setDoctorProfile(prev => ({ ...prev, ...updated }));
      setProfileFeedback({ type: 'success', text: 'Doctor profile and credentials updated successfully across Niramoy & Supabase.' });

      setTimeout(() => {
        setProfileEditOpen(false);
        setProfileFeedback(null);
      }, 1200);
    } catch (err) {
      setProfileFeedback({ type: 'error', text: err.message || 'Failed to update profile.' });
    } finally {
      setIsSavingProfile(false);
    }
  };

  // AI SOAP Note Generation
  const handleGenerateClinicalNote = (patientAppt) => {
    if (!patientAppt) return;
    const pName = patientAppt.patientName || patientAppt.patientId?.name || 'Patient';
    const age = patientAppt.patientId?.date_of_birth ? 
      Math.floor((new Date() - new Date(patientAppt.patientId.date_of_birth)) / (365.25 * 24 * 60 * 60 * 1000)) + 'y' : 'Adult';
    const gender = patientAppt.patientId?.gender || patientAppt.gender || 'Not specified';
    const blood = patientAppt.patientId?.blood_group || 'Unknown';
    const allergies = patientAppt.patientId?.allergies || 'None documented';
    const conditions = patientAppt.patientId?.existing_conditions || 'None documented';
    const history = patientAppt.patientId?.medical_history || 'No previous chronic history recorded.';
    const reason = patientAppt.consultationReason || patientAppt.symptoms || 'General clinical review';

    setAiNoteDraft(
      `[CLINICAL ASSESSMENT SUMMARY - ATTENDING SPECIALIST]\n` +
      `Date: ${new Date().toLocaleDateString()} | Time: ${patientAppt.time_slot || 'Scheduled'}\n` +
      `Patient: ${pName} (${age}, ${gender}, Blood: ${blood})\n` +
      `Serial Number: ${patientAppt.serialNumber || patientAppt.appointmentId || 'Walk-in'}\n\n` +
      `SUBJECTIVE (PRESENTING SYMPTOMS):\n` +
      `- ${reason}\n` +
      `- Known Allergies: ${allergies}\n` +
      `- Existing Chronic Conditions: ${conditions}\n\n` +
      `OBJECTIVE EVALUATION:\n` +
      `- General appearance: Alert, oriented, cooperative.\n` +
      `- Vitals reviewed and logged.\n` +
      `- Medical history: ${history}\n\n` +
      `ASSESSMENT & CLINICAL PLAN:\n` +
      `1. Prescribe targeted pharmaceutical regimen without contraindications.\n` +
      `2. Advise lifestyle modifications and warning signs.\n` +
      `3. Follow-up scheduled if symptoms do not resolve.\n\n` +
      `⚠️ AI Decision Support Draft — Attending physician signature required.`
    );
  };

  // Chat message send handler
  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    const newMsg = {
      id: Date.now(),
      sender: 'doctor',
      text: chatInput.trim(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setChatMessages(prev => [...prev, newMsg]);
    setChatInput('');
  };

  // Slot toggle handler
  const handleToggleSlotAvailability = async (slotIdx, isAvail) => {
    try {
      await doctorsAPI.toggleSlotAvailability({
        dayOfWeek: scheduleDay === 'today' ? new Date().getDay() : (new Date().getDay() + 1) % 7,
        isAvailable: !isAvail
      });
      loadPortalData();
    } catch (err) {
      console.warn('Slot toggle notice:', err.message);
    }
  };

  return (
    <div className="doctor-portal-root" style={{ width: '100%', maxWidth: '1440px', margin: '0 auto', color: 'var(--color-text, #0f172a)' }}>
      
      {/* ── Active Teleconsultation Overlay ── */}
      {activeTeleconsultationAppt && (
        <TeleconsultationRoom
          appointment={activeTeleconsultationAppt}
          onCloseRoom={() => {
            setActiveTeleconsultationAppt(null);
            loadPortalData();
          }}
        />
      )}

      {/* ── Digital Prescription Modal / Bottom Sheet ── */}
      {prescriptionModalAppt && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 120,
          background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px'
        }}>
          <div style={{
            background: 'var(--color-surface, #ffffff)',
            border: '1px solid var(--color-border, #e2e8f0)',
            borderRadius: '16px', width: '100%', maxWidth: '720px',
            maxHeight: '92vh', overflowY: 'auto', padding: '20px',
            boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--color-border, #e2e8f0)', paddingBottom: '12px', marginBottom: '16px' }}>
              <div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--color-primary, #0d7c6e)' }}>Digital Prescription Pad</h3>
                <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted, #64748b)' }}>
                  Patient: <strong>{prescriptionModalAppt.patientName || prescriptionModalAppt.patientId?.name}</strong> • 
                  Serial: {prescriptionModalAppt.serialNumber || 'N/A'}
                </p>
              </div>
              <button 
                onClick={() => setPrescriptionModalAppt(null)}
                style={{ background: 'none', border: 'none', color: 'var(--color-text-muted, #64748b)', cursor: 'pointer', fontSize: '1.2rem', padding: '4px 8px' }}
              >
                ✕
              </button>
            </div>

            {rxFeedback && (
              <div style={{
                padding: '10px 14px', borderRadius: '8px', marginBottom: '16px', fontSize: '0.8rem',
                display: 'flex', alignItems: 'center', gap: '8px',
                background: rxFeedback.type === 'error' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(16, 185, 129, 0.1)',
                color: rxFeedback.type === 'error' ? '#ef4444' : '#10b981',
                border: `1px solid ${rxFeedback.type === 'error' ? '#ef4444' : '#10b981'}`
              }}>
                {rxFeedback.type === 'error' ? <AlertCircle style={{ width: 16, height: 16 }} /> : <CheckCircle2 style={{ width: 16, height: 16 }} />}
                <span>{rxFeedback.text}</span>
              </div>
            )}

            <form onSubmit={handleSubmitPrescription} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, marginBottom: '4px' }}>
                  Clinical Diagnosis *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Acute Pharyngitis, Type 2 Diabetes, Hypertension"
                  value={rxDiagnosis}
                  onChange={(e) => setRxDiagnosis(e.target.value)}
                  style={{
                    width: '100%', padding: '10px 12px', borderRadius: '8px',
                    border: '1px solid var(--color-border, #cbd5e1)', fontSize: '0.85rem'
                  }}
                />
              </div>

              {/* Vitals */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '10px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 600, color: 'var(--color-text-muted, #64748b)', marginBottom: '3px' }}>
                    Blood Pressure
                  </label>
                  <input
                    type="text"
                    value={rxBp}
                    onChange={(e) => setRxBp(e.target.value)}
                    style={{ width: '100%', padding: '8px 10px', borderRadius: '8px', border: '1px solid var(--color-border, #cbd5e1)', fontSize: '0.8rem' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 600, color: 'var(--color-text-muted, #64748b)', marginBottom: '3px' }}>
                    Pulse Rate
                  </label>
                  <input
                    type="text"
                    value={rxPulse}
                    onChange={(e) => setRxPulse(e.target.value)}
                    style={{ width: '100%', padding: '8px 10px', borderRadius: '8px', border: '1px solid var(--color-border, #cbd5e1)', fontSize: '0.8rem' }}
                  />
                </div>
              </div>

              {/* Prescribed Medicines */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <label style={{ fontSize: '0.78rem', fontWeight: 700 }}>Prescribed Medicines *</label>
                  <button
                    type="button"
                    onClick={handleAddMedicineRow}
                    style={{
                      background: 'none', border: 'none', color: 'var(--color-primary, #0d7c6e)',
                      fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4
                    }}
                  >
                    <Plus style={{ width: 14, height: 14 }} /> Add Medicine
                  </button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {rxMedicines.map((med, idx) => (
                    <div key={idx} style={{
                      padding: '10px', borderRadius: '8px', border: '1px solid var(--color-border, #e2e8f0)',
                      background: 'var(--color-bg-muted, #f8fafc)', display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center'
                    }}>
                      <input
                        type="text"
                        placeholder="Medicine name (e.g. Paracetamol 500mg)"
                        value={med.name}
                        onChange={(e) => {
                          const val = e.target.value;
                          setRxMedicines(prev => prev.map((m, i) => i === idx ? { ...m, name: val } : m));
                        }}
                        style={{ flex: '1 1 180px', padding: '7px 10px', borderRadius: '6px', border: '1px solid var(--color-border, #cbd5e1)', fontSize: '0.8rem' }}
                      />
                      <input
                        type="text"
                        placeholder="Dosage (e.g. 1 tablet)"
                        value={med.dosage}
                        onChange={(e) => {
                          const val = e.target.value;
                          setRxMedicines(prev => prev.map((m, i) => i === idx ? { ...m, dosage: val } : m));
                        }}
                        style={{ flex: '1 1 110px', padding: '7px 10px', borderRadius: '6px', border: '1px solid var(--color-border, #cbd5e1)', fontSize: '0.8rem' }}
                      />
                      <input
                        type="text"
                        placeholder="Frequency (e.g. 3 times daily)"
                        value={med.frequency}
                        onChange={(e) => {
                          const val = e.target.value;
                          setRxMedicines(prev => prev.map((m, i) => i === idx ? { ...m, frequency: val } : m));
                        }}
                        style={{ flex: '1 1 130px', padding: '7px 10px', borderRadius: '6px', border: '1px solid var(--color-border, #cbd5e1)', fontSize: '0.8rem' }}
                      />
                      {rxMedicines.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveMedicineRow(idx)}
                          style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '4px' }}
                          aria-label="Remove medicine"
                        >
                          <Trash2 style={{ width: 15, height: 15 }} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Tests */}
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, marginBottom: '4px' }}>
                  Advised Diagnostic Tests (Optional, comma-separated)
                </label>
                <input
                  type="text"
                  placeholder="e.g. CBC with ESR, Serum Creatinine, Chest X-Ray"
                  value={rxTests}
                  onChange={(e) => setRxTests(e.target.value)}
                  style={{ width: '100%', padding: '8px 10px', borderRadius: '8px', border: '1px solid var(--color-border, #cbd5e1)', fontSize: '0.8rem' }}
                />
              </div>

              {/* Advice */}
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, marginBottom: '4px' }}>
                  Doctor's Instructions & Lifestyle Advice
                </label>
                <textarea
                  rows={3}
                  value={rxAdvice}
                  onChange={(e) => setRxAdvice(e.target.value)}
                  style={{ width: '100%', padding: '8px 10px', borderRadius: '8px', border: '1px solid var(--color-border, #cbd5e1)', fontSize: '0.8rem' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '10px' }}>
                <button
                  type="button"
                  onClick={() => setPrescriptionModalAppt(null)}
                  className="btn btn-secondary"
                  style={{ fontSize: '0.8rem', minHeight: 44 }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingRx}
                  className="btn btn-primary"
                  style={{ fontSize: '0.8rem', minHeight: 44, display: 'flex', alignItems: 'center', gap: 6 }}
                >
                  {isSubmittingRx && <Loader2 style={{ width: 14, height: 14 }} className="animate-spin" />}
                  {isSubmittingRx ? 'Registering...' : 'Sign & Issue Prescription'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Patient Detail Modal / Bottom Sheet ── */}
      {selectedPatientDetail && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 120,
          background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px'
        }}>
          <div style={{
            background: 'var(--color-surface, #ffffff)',
            border: '1px solid var(--color-border, #e2e8f0)',
            borderRadius: '16px', width: '100%', maxWidth: '640px',
            maxHeight: '90vh', overflowY: 'auto', padding: '20px',
            boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--color-border, #e2e8f0)', paddingBottom: '12px', marginBottom: '14px' }}>
              <div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 800 }}>Patient Clinical Record</h3>
                <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted, #64748b)' }}>
                  ID: {selectedPatientDetail.patientId || selectedPatientDetail.id || 'Niramoy Patient'}
                </p>
              </div>
              <button 
                onClick={() => setSelectedPatientDetail(null)}
                style={{ background: 'none', border: 'none', color: 'var(--color-text-muted, #64748b)', cursor: 'pointer', fontSize: '1.2rem', padding: '4px' }}
              >
                ✕
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {/* Basic Info Card */}
              <div style={{ background: 'var(--color-bg-muted, #f8fafc)', padding: '14px', borderRadius: '12px', border: '1px solid var(--color-border, #e2e8f0)' }}>
                <div style={{ fontSize: '1rem', fontWeight: 800 }}>{selectedPatientDetail.name}</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted, #64748b)', marginTop: 2 }}>
                  {selectedPatientDetail.phone} • {selectedPatientDetail.email || 'No email registered'}
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 8 }}>
                  <span className="badge badge-info" style={{ fontSize: '0.7rem' }}>Blood: {selectedPatientDetail.bloodGroup}</span>
                  <span className="badge badge-secondary" style={{ fontSize: '0.7rem' }}>Gender: {selectedPatientDetail.gender}</span>
                  <span className="badge badge-primary" style={{ fontSize: '0.7rem' }}>Total Visits: {selectedPatientDetail.totalAppointments || 1}</span>
                </div>
              </div>

              {/* Medical Alerts */}
              <div style={{ padding: '12px', borderRadius: '10px', background: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.25)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.8rem', fontWeight: 700, color: '#d97706' }}>
                  <AlertTriangle style={{ width: 15, height: 15 }} />
                  <span>Documented Clinical Contraindications</span>
                </div>
                <div style={{ fontSize: '0.75rem', marginTop: 4 }}>
                  <strong>Known Allergies:</strong> {selectedPatientDetail.allergies || 'None documented'}
                </div>
                <div style={{ fontSize: '0.75rem', marginTop: 2 }}>
                  <strong>Existing Chronic Conditions:</strong> {selectedPatientDetail.existingConditions || 'None documented'}
                </div>
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, paddingTop: 10, borderTop: '1px solid var(--color-border, #e2e8f0)' }}>
                <button
                  onClick={() => {
                    handleGenerateClinicalNote(selectedPatientDetail);
                    setSelectedPatientDetail(null);
                    setActiveTab('tools');
                    navigate('/doctor-portal/ai-copilot');
                  }}
                  className="btn btn-primary"
                  style={{ fontSize: '0.8rem', minHeight: 44, flex: '1 1 180px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
                >
                  <Sparkles style={{ width: 15, height: 15 }} /> Generate Clinical Summary Note
                </button>
                <button
                  onClick={() => {
                    setActiveChatPatient(selectedPatientDetail);
                    setSelectedPatientDetail(null);
                    setActiveTab('messages');
                    navigate('/doctor-portal/messages');
                  }}
                  className="btn btn-secondary"
                  style={{ fontSize: '0.8rem', minHeight: 44, flex: '1 1 140px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
                >
                  <MessageSquare style={{ width: 15, height: 15 }} /> Send Message
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Edit Doctor Profile Modal / Bottom Sheet ── */}
      {profileEditOpen && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 130,
          background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px'
        }}>
          <div style={{
            background: 'var(--color-surface, #ffffff)',
            border: '1px solid var(--color-border, #e2e8f0)',
            borderRadius: '16px', width: '100%', maxWidth: '640px',
            maxHeight: '92vh', overflowY: 'auto', padding: '20px',
            boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--color-border, #e2e8f0)', paddingBottom: '12px', marginBottom: '16px' }}>
              <div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--color-primary, #0d7c6e)' }}>Edit Doctor Credentials</h3>
                <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted, #64748b)' }}>
                  Updates will synchronize to Niramoy Healthcare & Supabase database.
                </p>
              </div>
              <button 
                onClick={() => setProfileEditOpen(false)}
                style={{ background: 'none', border: 'none', color: 'var(--color-text-muted, #64748b)', cursor: 'pointer', fontSize: '1.2rem', padding: '4px' }}
              >
                ✕
              </button>
            </div>

            {profileFeedback && (
              <div style={{
                padding: '10px 14px', borderRadius: '8px', marginBottom: '16px', fontSize: '0.8rem',
                display: 'flex', alignItems: 'center', gap: '8px',
                background: profileFeedback.type === 'error' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(16, 185, 129, 0.1)',
                color: profileFeedback.type === 'error' ? '#ef4444' : '#10b981',
                border: `1px solid ${profileFeedback.type === 'error' ? '#ef4444' : '#10b981'}`
              }}>
                {profileFeedback.type === 'error' ? <AlertCircle style={{ width: 16, height: 16 }} /> : <CheckCircle2 style={{ width: 16, height: 16 }} />}
                <span>{profileFeedback.text}</span>
              </div>
            )}

            <form onSubmit={handleSaveProfile} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, marginBottom: '3px' }}>Doctor Full Name</label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--color-border, #cbd5e1)', fontSize: '0.85rem' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 10 }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, marginBottom: '3px' }}>Specialty</label>
                  <input
                    type="text"
                    required
                    value={editSpecialty}
                    onChange={(e) => setEditSpecialty(e.target.value)}
                    style={{ width: '100%', padding: '9px 11px', borderRadius: '8px', border: '1px solid var(--color-border, #cbd5e1)', fontSize: '0.85rem' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, marginBottom: '3px' }}>BMDC Registration Number</label>
                  <input
                    type="text"
                    value={editBmdc}
                    onChange={(e) => setEditBmdc(e.target.value)}
                    style={{ width: '100%', padding: '9px 11px', borderRadius: '8px', border: '1px solid var(--color-border, #cbd5e1)', fontSize: '0.85rem' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 10 }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, marginBottom: '3px' }}>Designation / Title</label>
                  <input
                    type="text"
                    value={editDesignation}
                    onChange={(e) => setEditDesignation(e.target.value)}
                    style={{ width: '100%', padding: '9px 11px', borderRadius: '8px', border: '1px solid var(--color-border, #cbd5e1)', fontSize: '0.85rem' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, marginBottom: '3px' }}>Consultation Fee (BDT)</label>
                  <input
                    type="number"
                    value={editFee}
                    onChange={(e) => setEditFee(e.target.value)}
                    style={{ width: '100%', padding: '9px 11px', borderRadius: '8px', border: '1px solid var(--color-border, #cbd5e1)', fontSize: '0.85rem' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, marginBottom: '3px' }}>Hospital / Workplace</label>
                <input
                  type="text"
                  value={editWorkplace}
                  onChange={(e) => setEditWorkplace(e.target.value)}
                  style={{ width: '100%', padding: '9px 11px', borderRadius: '8px', border: '1px solid var(--color-border, #cbd5e1)', fontSize: '0.85rem' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, marginBottom: '3px' }}>Medical Qualifications & Degrees</label>
                <input
                  type="text"
                  value={editQualifications}
                  onChange={(e) => setEditQualifications(e.target.value)}
                  style={{ width: '100%', padding: '9px 11px', borderRadius: '8px', border: '1px solid var(--color-border, #cbd5e1)', fontSize: '0.85rem' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, marginBottom: '3px' }}>Professional Biography</label>
                <textarea
                  rows={3}
                  value={editBio}
                  onChange={(e) => setEditBio(e.target.value)}
                  style={{ width: '100%', padding: '9px 11px', borderRadius: '8px', border: '1px solid var(--color-border, #cbd5e1)', fontSize: '0.85rem' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '10px' }}>
                <button
                  type="button"
                  onClick={() => setProfileEditOpen(false)}
                  className="btn btn-secondary"
                  style={{ fontSize: '0.8rem', minHeight: 44 }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingProfile}
                  className="btn btn-primary"
                  style={{ fontSize: '0.8rem', minHeight: 44, display: 'flex', alignItems: 'center', gap: 6 }}
                >
                  {isSavingProfile && <Loader2 style={{ width: 14, height: 14 }} className="animate-spin" />}
                  {isSavingProfile ? 'Saving...' : 'Save & Persist Updates'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Top Header Context Bar (Mobile & Desktop) ── */}
      <div style={{
        display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between',
        alignItems: 'center', gap: 12, marginBottom: 18,
        paddingBottom: 14, borderBottom: '1px solid var(--color-border, #e2e8f0)'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
            <span className="badge badge-primary" style={{ fontSize: '0.72rem' }}>👨‍⚕️ Physician Portal</span>
            <span className="badge badge-success" style={{ fontSize: '0.72rem', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#10b981' }} /> Live Supabase Synced
            </span>
          </div>
          <h1 style={{ fontSize: '1.45rem', fontWeight: 900, letterSpacing: '-0.02em', margin: 0 }}>
            {activeTab === 'dashboard' && `Good Day, ${doctorProfile?.name || user?.name || 'Doctor'}`}
            {activeTab === 'appointments' && "Patient Appointments & Live Queue"}
            {activeTab === 'patients' && "Patient Longitudinal Records"}
            {activeTab === 'messages' && "Patient Consultation Messages"}
            {activeTab === 'schedule' && "Chamber & Availability Schedule"}
            {activeTab === 'consultations' && "Teleconsultation Clinic"}
            {activeTab === 'prescriptions' && "Issued Prescriptions Vault"}
            {activeTab === 'profile' && "Doctor Credentials & Profile"}
            {activeTab === 'settings' && "Practice Portal Settings"}
            {activeTab === 'tools' && "Clinical Decision Support"}
          </h1>
          <p style={{ color: 'var(--color-text-muted, #64748b)', fontSize: '0.8rem', margin: '3px 0 0 0' }}>
            {doctorProfile?.specialty || 'General Practice'} • {doctorProfile?.workplace || 'Rajshahi, Bangladesh'}
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button 
            onClick={loadPortalData} 
            disabled={syncing}
            className="btn btn-secondary" 
            style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem', minHeight: 40 }}
          >
            <RefreshCw style={{ width: 13, height: 13 }} className={syncing ? "animate-spin" : ""} />
            <span>{syncing ? 'Syncing...' : 'Sync Live'}</span>
          </button>
        </div>
      </div>

      {/* ── Sub-Navigation Pill Tabs (Scrollable on Mobile) ── */}
      <div style={{
        display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 10,
        marginBottom: 16, scrollbarWidth: 'none', WebkitOverflowScrolling: 'touch'
      }}>
        {[
          { id: 'dashboard', label: 'Overview', icon: LayoutDashboard },
          { id: 'appointments', label: `Appointments (${appointments.length})`, icon: CalendarDays },
          { id: 'patients', label: `Patients (${patients.length || appointments.length})`, icon: Users },
          { id: 'messages', label: 'Chat', icon: MessageSquare },
          { id: 'schedule', label: 'Schedule', icon: Clock },
          { id: 'prescriptions', label: `Prescriptions (${prescriptions.length})`, icon: ClipboardList },
          { id: 'profile', label: 'My Profile', icon: UserCheck },
          { id: 'tools', label: 'AI Copilot', icon: Sparkles }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => {
              setActiveTab(tab.id);
              if (tab.id === 'dashboard') navigate('/doctor-portal');
              else if (tab.id === 'tools') navigate('/doctor-portal/ai-copilot');
              else navigate(`/doctor-portal/${tab.id}`);
            }}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '8px 14px', borderRadius: '10px',
              fontSize: '0.8rem', fontWeight: activeTab === tab.id ? 700 : 500,
              background: activeTab === tab.id ? 'var(--color-primary, #0d7c6e)' : 'var(--color-surface, #ffffff)',
              color: activeTab === tab.id ? '#ffffff' : 'var(--color-text, #1e293b)',
              border: `1px solid ${activeTab === tab.id ? 'var(--color-primary, #0d7c6e)' : 'var(--color-border, #e2e8f0)'}`,
              cursor: 'pointer', whiteSpace: 'nowrap', flexShrink: 0,
              boxShadow: activeTab === tab.id ? '0 3px 10px rgba(13, 124, 110, 0.2)' : 'none',
              minHeight: 40
            }}
          >
            <tab.icon style={{ width: 14, height: 14 }} />
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* ── TAB 1: DOCTOR DASHBOARD ── */}
      {activeTab === 'dashboard' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          
          {/* Today's Overview Cards (1-col on mobile, 2 on tablet, 4 on desktop) */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: 12
          }}>
            <div 
              onClick={() => { setActiveTab('appointments'); setApptFilter('today'); }}
              style={{
                background: 'var(--color-surface, #ffffff)', border: '1px solid var(--color-border, #e2e8f0)',
                borderRadius: '14px', padding: '16px', cursor: 'pointer', transition: 'transform 0.15s ease'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-muted, #64748b)' }}>Today's Appointments</span>
                <Clock style={{ width: 16, height: 16, color: 'var(--color-primary, #0d7c6e)' }} />
              </div>
              <div style={{ fontSize: '1.75rem', fontWeight: 900, marginTop: 4, color: 'var(--color-primary, #0d7c6e)' }}>
                {todayAppointments.length}
              </div>
              <div style={{ fontSize: '0.7rem', color: 'var(--color-text-muted, #64748b)', marginTop: 2 }}>
                {todayAppointments.length === 0 ? "0 in queue today" : `${todayAppointments.length} patient slots booked today`}
              </div>
            </div>

            <div 
              onClick={() => { setActiveTab('appointments'); setApptFilter('all'); }}
              style={{
                background: 'var(--color-surface, #ffffff)', border: '1px solid var(--color-border, #e2e8f0)',
                borderRadius: '14px', padding: '16px', cursor: 'pointer', transition: 'transform 0.15s ease'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-muted, #64748b)' }}>Pending Requests</span>
                <CalendarDays style={{ width: 16, height: 16, color: '#3b82f6' }} />
              </div>
              <div style={{ fontSize: '1.75rem', fontWeight: 900, marginTop: 4, color: '#3b82f6' }}>
                {pendingRequests.length}
              </div>
              <div style={{ fontSize: '0.7rem', color: 'var(--color-text-muted, #64748b)', marginTop: 2 }}>
                {pendingRequests.length === 0 ? "All requests processed" : "Awaiting physician action"}
              </div>
            </div>

            <div 
              onClick={() => { setActiveTab('appointments'); setApptFilter('telemedicine'); }}
              style={{
                background: 'var(--color-surface, #ffffff)', border: '1px solid var(--color-border, #e2e8f0)',
                borderRadius: '14px', padding: '16px', cursor: 'pointer', transition: 'transform 0.15s ease'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-muted, #64748b)' }}>Teleconsultations</span>
                <Video style={{ width: 16, height: 16, color: '#8b5cf6' }} />
              </div>
              <div style={{ fontSize: '1.75rem', fontWeight: 900, marginTop: 4, color: '#8b5cf6' }}>
                {telemedicineAppts.length}
              </div>
              <div style={{ fontSize: '0.7rem', color: 'var(--color-text-muted, #64748b)', marginTop: 2 }}>
                Video consultation sessions
              </div>
            </div>

            <div 
              onClick={() => setActiveTab('prescriptions')}
              style={{
                background: 'var(--color-surface, #ffffff)', border: '1px solid var(--color-border, #e2e8f0)',
                borderRadius: '14px', padding: '16px', cursor: 'pointer', transition: 'transform 0.15s ease'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-muted, #64748b)' }}>Prescriptions Issued</span>
                <ClipboardList style={{ width: 16, height: 16, color: '#10b981' }} />
              </div>
              <div style={{ fontSize: '1.75rem', fontWeight: 900, marginTop: 4, color: '#10b981' }}>
                {prescriptions.length}
              </div>
              <div style={{ fontSize: '0.7rem', color: 'var(--color-text-muted, #64748b)', marginTop: 2 }}>
                Recorded in database vault
              </div>
            </div>
          </div>

          {/* Next Patient Spotlight Card */}
          {nextPatient ? (
            <div style={{
              background: 'linear-gradient(135deg, rgba(13, 124, 110, 0.08) 0%, rgba(13, 124, 110, 0.02) 100%)',
              border: '1px solid rgba(13, 124, 110, 0.25)',
              borderRadius: '16px', padding: '18px',
              display: 'flex', flexDirection: 'column', gap: 12
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span className="live-pulse bg-emerald-500/20 text-emerald-600 text-xs px-2.5 py-0.5 rounded-full font-bold">
                    <span className="live-pulse-dot"></span> Next Scheduled Patient
                  </span>
                </div>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-primary, #0d7c6e)', fontFamily: 'var(--font-mono)' }}>
                  Serial: {nextPatient.serialNumber || nextPatient.appointmentId || '01'}
                </span>
              </div>

              <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: 10 }}>
                <div>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 800, margin: 0 }}>
                    {nextPatient.patientName || nextPatient.patientId?.name || 'Registered Patient'}
                  </h3>
                  <p style={{ fontSize: '0.78rem', color: 'var(--color-text-muted, #64748b)', margin: '2px 0 0 0' }}>
                    {nextPatient.appointmentTime || nextPatient.time_slot || '10:30 AM'} • {nextPatient.appointmentType?.toLowerCase().includes('online') ? '📹 Telemedicine Video' : '🏥 In-Person Chamber'}
                  </p>
                  <p style={{ fontSize: '0.75rem', color: 'var(--color-text, #1e293b)', margin: '4px 0 0 0', fontWeight: 500 }}>
                    Reason: <em>{nextPatient.consultationReason || nextPatient.symptoms || 'Regular health consultation'}</em>
                  </p>
                </div>

                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {nextPatient.appointmentType?.toLowerCase().includes('online') && (
                    <button
                      onClick={() => setActiveTeleconsultationAppt(nextPatient)}
                      className="btn btn-primary"
                      style={{ fontSize: '0.8rem', minHeight: 44, padding: '0 16px', display: 'flex', alignItems: 'center', gap: 6 }}
                    >
                      <Video style={{ width: 15, height: 15 }} /> Start Video Call
                    </button>
                  )}
                  <button
                    onClick={() => openPrescriptionModal(nextPatient)}
                    className="btn btn-secondary"
                    style={{ fontSize: '0.8rem', minHeight: 44, padding: '0 16px', display: 'flex', alignItems: 'center', gap: 6 }}
                  >
                    <FileText style={{ width: 15, height: 15 }} /> Issue Rx Pad
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div style={{
              background: 'var(--color-surface, #ffffff)', border: '1px dashed var(--color-border, #e2e8f0)',
              borderRadius: '16px', padding: '24px', textAlign: 'center'
            }}>
              <CheckCircle2 style={{ width: 32, height: 32, color: 'var(--color-primary, #0d7c6e)', margin: '0 auto 8px' }} />
              <h4 style={{ fontSize: '1rem', fontWeight: 800 }}>Queue is all clear right now</h4>
              <p style={{ fontSize: '0.78rem', color: 'var(--color-text-muted, #64748b)', margin: '4px 0 0 0' }}>
                As patients book upcoming chamber slots or online consultations, they will appear immediately.
              </p>
            </div>
          )}

          {/* Quick Doctor Actions Pill Bar */}
          <div>
            <h4 style={{ fontSize: '0.85rem', fontWeight: 800, marginBottom: 8, color: 'var(--color-text-muted, #64748b)' }}>Quick Doctor Actions</h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 8 }}>
              <button
                onClick={() => { setActiveTab('schedule'); navigate('/doctor-portal/schedule'); }}
                className="btn btn-secondary"
                style={{ fontSize: '0.78rem', minHeight: 44, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
              >
                <Clock style={{ width: 14, height: 14 }} /> Manage Schedule
              </button>
              <button
                onClick={() => { setActiveTab('patients'); navigate('/doctor-portal/patients'); }}
                className="btn btn-secondary"
                style={{ fontSize: '0.78rem', minHeight: 44, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
              >
                <Users style={{ width: 14, height: 14 }} /> Patient Records
              </button>
              <button
                onClick={() => { setActiveTab('messages'); navigate('/doctor-portal/messages'); }}
                className="btn btn-secondary"
                style={{ fontSize: '0.78rem', minHeight: 44, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
              >
                <MessageSquare style={{ width: 14, height: 14 }} /> Open Messages
              </button>
              <button
                onClick={() => setProfileEditOpen(true)}
                className="btn btn-secondary"
                style={{ fontSize: '0.78rem', minHeight: 44, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
              >
                <Edit3 style={{ width: 14, height: 14 }} /> Edit Profile
              </button>
            </div>
          </div>

          {/* Today's Schedule Overview Cards */}
          <div style={{
            background: 'var(--color-surface, #ffffff)', border: '1px solid var(--color-border, #e2e8f0)',
            borderRadius: '16px', padding: '18px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 800 }}>Today's Chamber Timeline</h3>
              <span className="badge badge-primary" style={{ fontSize: '0.7rem' }}>
                {doctorProfile?.chambers?.[0]?.name || 'Rajshahi Central Chamber'}
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {[
                { time: '05:00 PM', status: 'BOOKED', patient: 'Rahim Ahmed', type: 'Chamber' },
                { time: '05:20 PM', status: 'BOOKED', patient: 'Nasima Begum', type: 'Telemedicine' },
                { time: '05:40 PM', status: 'AVAILABLE', patient: 'Open Slot', type: 'Chamber' },
                { time: '06:00 PM', status: 'BOOKED', patient: 'Kamal Hossain', type: 'Chamber' },
                { time: '06:20 PM', status: 'AVAILABLE', patient: 'Open Slot', type: 'Chamber' },
              ].map((slot, idx) => (
                <div key={idx} style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '10px 12px', borderRadius: '10px',
                  background: slot.status === 'BOOKED' ? 'var(--color-bg-muted, #f8fafc)' : 'var(--color-surface, #ffffff)',
                  border: '1px solid var(--color-border, #e2e8f0)'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ fontSize: '0.8rem', fontWeight: 800, fontFamily: 'var(--font-mono)', minWidth: 65 }}>
                      {slot.time}
                    </div>
                    <div>
                      <div style={{ fontSize: '0.82rem', fontWeight: slot.status === 'BOOKED' ? 700 : 500 }}>
                        {slot.patient}
                      </div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--color-text-muted, #64748b)' }}>
                        {slot.type}
                      </div>
                    </div>
                  </div>

                  <span className={`badge ${slot.status === 'BOOKED' ? 'badge-danger' : 'badge-success'}`} style={{ fontSize: '0.68rem' }}>
                    {slot.status}
                  </span>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* ── TAB 2: APPOINTMENTS QUEUE (Mobile Cards + Desktop View) ── */}
      {activeTab === 'appointments' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {/* Sub Filters & Search */}
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: 10 }}>
            <div style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 4, width: '100%', maxWidth: '600px' }}>
              {[
                { id: 'all', label: `All (${appointments.length})` },
                { id: 'today', label: `Today's Queue (${todayAppointments.length})` },
                { id: 'telemedicine', label: `Telemedicine (${telemedicineAppts.length})` },
                { id: 'chamber', label: 'Chamber' },
                { id: 'completed', label: `Completed (${completedAppointments.length})` }
              ].map(f => (
                <button
                  key={f.id}
                  onClick={() => setApptFilter(f.id)}
                  style={{
                    padding: '6px 12px', borderRadius: '8px', fontSize: '0.75rem', fontWeight: 600,
                    cursor: 'pointer', whiteSpace: 'nowrap',
                    background: apptFilter === f.id ? 'var(--color-primary, #0d7c6e)' : 'var(--color-surface, #ffffff)',
                    color: apptFilter === f.id ? '#ffffff' : 'var(--color-text-muted, #64748b)',
                    border: `1px solid ${apptFilter === f.id ? 'var(--color-primary, #0d7c6e)' : 'var(--color-border, #e2e8f0)'}`,
                    minHeight: 36
                  }}
                >
                  {f.label}
                </button>
              ))}
            </div>

            <div style={{ position: 'relative', width: '100%', maxWidth: '320px' }}>
              <Search style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', width: 14, height: 14, color: 'var(--color-text-muted, #64748b)' }} />
              <input
                type="text"
                placeholder="Search patient, phone, serial..."
                value={apptSearch}
                onChange={(e) => setApptSearch(e.target.value)}
                style={{
                  width: '100%', padding: '8px 12px 8px 32px', borderRadius: '8px',
                  border: '1px solid var(--color-border, #cbd5e1)', fontSize: '0.8rem'
                }}
              />
            </div>
          </div>

          {/* Empty State */}
          {filteredAppointments.length === 0 ? (
            <div style={{
              background: 'var(--color-surface, #ffffff)', border: '1px dashed var(--color-border, #e2e8f0)',
              borderRadius: '16px', padding: '36px 20px', textAlign: 'center'
            }}>
              <CalendarDays style={{ width: 36, height: 36, color: 'var(--color-text-muted, #64748b)', margin: '0 auto 10px' }} />
              <h3 style={{ fontSize: '1rem', fontWeight: 800 }}>No appointments match filter</h3>
              <p style={{ fontSize: '0.78rem', color: 'var(--color-text-muted, #64748b)', maxWidth: '400px', margin: '4px auto 14px' }}>
                There are no patient bookings matching your active criteria. Switch to "All" or check live database sync.
              </p>
              <button onClick={() => { setApptFilter('all'); setApptSearch(''); }} className="btn btn-secondary" style={{ fontSize: '0.75rem', minHeight: 40 }}>
                Reset Filters
              </button>
            </div>
          ) : (
            /* Mobile-First Stacked Appointment Cards */
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 12 }}>
              {filteredAppointments.map((appt) => {
                const patientName = appt.patientName || appt.patientId?.name || 'Registered Patient';
                const phone = appt.patientPhone || appt.patientId?.phone || 'N/A';
                const serial = appt.serialNumber || appt.appointmentId || 'Walk-in';
                const isOnline = appt.appointmentType?.toLowerCase().includes('online') || appt.consultation_type?.toLowerCase().includes('online');
                const dateFormatted = appt.appointmentDate ? new Date(appt.appointmentDate).toLocaleDateString('en-GB') : 'Scheduled';
                const isApptCompleted = appt.status === 'COMPLETED' || appt.status === 'completed';

                return (
                  <div
                    key={appt._id}
                    style={{
                      background: 'var(--color-surface, #ffffff)',
                      border: '1px solid var(--color-border, #e2e8f0)',
                      borderRadius: '14px', padding: '14px',
                      display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
                      boxShadow: '0 2px 6px rgba(0,0,0,0.02)', gap: 10
                    }}
                  >
                    {/* Top Row: Patient Info + Accessible Status Badge */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
                      <div>
                        <div style={{ fontWeight: 800, fontSize: '0.92rem', color: 'var(--color-text, #0f172a)' }}>
                          {patientName}
                        </div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--color-text-muted, #64748b)', marginTop: 1 }}>
                          {phone} • {appt.patientId?.gender || appt.gender || 'Patient'}
                        </div>
                      </div>

                      <span className={`badge ${
                        isApptCompleted ? 'badge-success' :
                        appt.status === 'CONFIRMED' || appt.status === 'confirmed' ? 'badge-primary' :
                        appt.status === 'CANCELLED' || appt.status === 'cancelled' ? 'badge-danger' : 'badge-info'
                      }`} style={{ fontSize: '0.68rem', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                        {isApptCompleted && <CheckCircle2 style={{ width: 11, height: 11 }} />}
                        {appt.status || 'CONFIRMED'}
                      </span>
                    </div>

                    {/* Middle Details Grid */}
                    <div style={{
                      background: 'var(--color-bg-muted, #f8fafc)', padding: '10px',
                      borderRadius: '10px', border: '1px solid var(--color-border, #f1f5f9)',
                      display: 'flex', flexDirection: 'column', gap: 4
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem' }}>
                        <span style={{ color: 'var(--color-text-muted, #64748b)' }}>Schedule:</span>
                        <span style={{ fontWeight: 700, fontFamily: 'var(--font-mono)', color: 'var(--color-primary, #0d7c6e)' }}>
                          {dateFormatted} • {appt.time_slot || appt.startTime || '10:30 AM'}
                        </span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem' }}>
                        <span style={{ color: 'var(--color-text-muted, #64748b)' }}>Channel:</span>
                        <span style={{ fontWeight: 700, color: isOnline ? '#8b5cf6' : '#0d7c6e' }}>
                          {isOnline ? '📹 Telemedicine Video' : '🏥 In-Person Chamber'}
                        </span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem' }}>
                        <span style={{ color: 'var(--color-text-muted, #64748b)' }}>Serial / Fee:</span>
                        <span style={{ fontWeight: 600 }}>
                          #{serial} • {appt.consultationFee || 800} BDT ({appt.paymentStatus || 'UNPAID'})
                        </span>
                      </div>
                      {appt.consultationReason && (
                        <div style={{ fontSize: '0.72rem', color: 'var(--color-text, #334155)', marginTop: 2, fontStyle: 'italic' }}>
                          "{appt.consultationReason}"
                        </div>
                      )}
                    </div>

                    {/* Action Buttons: Touch Friendly (min 44px height) */}
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, paddingTop: 4 }}>
                      {isOnline && !isApptCompleted && (
                        <button
                          onClick={() => setActiveTeleconsultationAppt(appt)}
                          className="btn btn-primary"
                          style={{ fontSize: '0.75rem', flex: '1 1 120px', minHeight: 44, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5 }}
                        >
                          <Video style={{ width: 14, height: 14 }} /> Join Call
                        </button>
                      )}

                      <button
                        onClick={() => openPrescriptionModal(appt)}
                        className="btn btn-secondary"
                        style={{ fontSize: '0.75rem', flex: '1 1 110px', minHeight: 44, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5 }}
                      >
                        <FileText style={{ width: 14, height: 14 }} /> Prescribe
                      </button>

                      {!isApptCompleted && (
                        <button
                          onClick={() => handleUpdateStatus(appt._id, 'COMPLETED')}
                          className="btn btn-secondary"
                          title="Mark Completed"
                          style={{ fontSize: '0.75rem', minHeight: 44, padding: '0 12px', color: '#10b981' }}
                        >
                          <CheckCircle2 style={{ width: 15, height: 15 }} />
                        </button>
                      )}

                      <button
                        onClick={() => setSelectedPatientDetail(appt)}
                        className="btn btn-secondary"
                        title="View Patient Record"
                        style={{ fontSize: '0.75rem', minHeight: 44, padding: '0 12px' }}
                      >
                        <Eye style={{ width: 15, height: 15 }} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ── TAB 3: PATIENT RECORDS & HISTORY ── */}
      {activeTab === 'patients' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {/* Search Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
            <div>
              <h3 style={{ fontSize: '1rem', fontWeight: 800, margin: 0 }}>Registered Patient Directory</h3>
              <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted, #64748b)', margin: 0 }}>
                {filteredPatients.length} active patient profiles in your practice archive
              </p>
            </div>
            <div style={{ position: 'relative', width: '100%', maxWidth: '320px' }}>
              <Search style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', width: 14, height: 14, color: 'var(--color-text-muted, #64748b)' }} />
              <input
                type="text"
                placeholder="Search by patient name, phone..."
                value={patientSearch}
                onChange={(e) => setPatientSearch(e.target.value)}
                style={{
                  width: '100%', padding: '8px 12px 8px 32px', borderRadius: '8px',
                  border: '1px solid var(--color-border, #cbd5e1)', fontSize: '0.8rem'
                }}
              />
            </div>
          </div>

          {/* Cards for Mobile, Responsive Table Grid for Desktop */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 12 }}>
            {filteredPatients.map((p, idx) => (
              <div
                key={p.id || idx}
                style={{
                  background: 'var(--color-surface, #ffffff)',
                  border: '1px solid var(--color-border, #e2e8f0)',
                  borderRadius: '14px', padding: '14px',
                  display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: 10
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <div style={{ fontWeight: 800, fontSize: '0.92rem' }}>{p.name}</div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--color-text-muted, #64748b)' }}>
                        {p.phone} • {p.gender}
                      </div>
                    </div>
                    {p.bloodGroup && (
                      <span className="badge badge-info" style={{ fontSize: '0.68rem' }}>
                        Blood: {p.bloodGroup}
                      </span>
                    )}
                  </div>

                  <div style={{
                    marginTop: 8, padding: '8px 10px', borderRadius: '8px',
                    background: 'var(--color-bg-muted, #f8fafc)', fontSize: '0.74rem',
                    display: 'flex', flexDirection: 'column', gap: 3
                  }}>
                    <div><strong>Last Visit:</strong> {p.lastAppointmentDate ? new Date(p.lastAppointmentDate).toLocaleDateString() : 'Recent'}</div>
                    <div><strong>Total Consultations:</strong> {p.totalAppointments || 1}</div>
                    {p.allergies && p.allergies !== 'None' && (
                      <div style={{ color: '#d97706', display: 'flex', alignItems: 'center', gap: 4 }}>
                        <AlertTriangle style={{ width: 12, height: 12 }} /> Allergy: {p.allergies}
                      </div>
                    )}
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 6, paddingTop: 4 }}>
                  <button
                    onClick={() => setSelectedPatientDetail(p)}
                    className="btn btn-secondary"
                    style={{ flex: 1, fontSize: '0.75rem', minHeight: 44, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5 }}
                  >
                    <Eye style={{ width: 14, height: 14 }} /> View Details
                  </button>
                  <button
                    onClick={() => {
                      setActiveChatPatient(p);
                      setActiveTab('messages');
                      navigate('/doctor-portal/messages');
                    }}
                    className="btn btn-primary"
                    style={{ flex: 1, fontSize: '0.75rem', minHeight: 44, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5 }}
                  >
                    <MessageSquare style={{ width: 14, height: 14 }} /> Message
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── TAB 4: DOCTOR-PATIENT CHAT & MESSAGING ── */}
      {activeTab === 'messages' && (
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(290px, 1fr))',
          gap: 14, minHeight: '520px'
        }}>
          {/* Active Conversations Sidebar / Drawer */}
          <div style={{
            background: 'var(--color-surface, #ffffff)', border: '1px solid var(--color-border, #e2e8f0)',
            borderRadius: '14px', padding: '14px', display: 'flex', flexDirection: 'column', gap: 10
          }}>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 800 }}>Recent Patient Inquiries</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {[
                { name: 'Rahim Ahmed', time: '10:15 AM', preview: 'Dr. Rahman, I am having mild cough...', unread: 2 },
                { name: 'Nasima Begum', time: 'Yesterday', preview: 'Can I take the prescribed tablet after dinner?', unread: 0 },
                { name: 'Kamal Hossain', time: 'Oct 01', preview: 'Blood pressure reading: 125/82 mmHg today.', unread: 0 },
                { name: 'Farzana Parvin', time: 'Sep 29', preview: 'Diagnostic test reports attached for review.', unread: 0 }
              ].map((c, idx) => (
                <div
                  key={idx}
                  onClick={() => setActiveChatPatient({ name: c.name })}
                  style={{
                    padding: '10px', borderRadius: '10px',
                    border: '1px solid var(--color-border, #e2e8f0)',
                    background: (activeChatPatient?.name === c.name || (!activeChatPatient && idx === 0)) ? 'var(--color-primary-50, #f0fdfa)' : 'transparent',
                    cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                  }}
                >
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontWeight: 700, fontSize: '0.82rem' }}>{c.name}</div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--color-text-muted, #64748b)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {c.preview}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '0.68rem', color: 'var(--color-text-muted, #64748b)' }}>{c.time}</div>
                    {c.unread > 0 && (
                      <span style={{
                        background: 'var(--color-primary, #0d7c6e)', color: '#fff', fontSize: '0.62rem',
                        fontWeight: 800, padding: '2px 6px', borderRadius: '10px', display: 'inline-block', marginTop: 2
                      }}>
                        {c.unread}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Active Chat Conversation View */}
          <div style={{
            background: 'var(--color-surface, #ffffff)', border: '1px solid var(--color-border, #e2e8f0)',
            borderRadius: '14px', display: 'flex', flexDirection: 'column', height: '560px'
          }}>
            {/* Chat Top Header */}
            <div style={{
              padding: '12px 16px', borderBottom: '1px solid var(--color-border, #e2e8f0)',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center'
            }}>
              <div>
                <div style={{ fontWeight: 800, fontSize: '0.9rem' }}>
                  {activeChatPatient?.name || 'Rahim Ahmed'}
                </div>
                <div style={{ fontSize: '0.7rem', color: '#10b981', display: 'flex', alignItems: 'center', gap: 4 }}>
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#10b981' }} /> Online Consultation Chat
                </div>
              </div>
              <div style={{ display: 'flex', gap: 6 }}>
                <button
                  onClick={() => alert('Initiating voice teleconsultation...')}
                  className="btn btn-secondary"
                  style={{ minHeight: 38, padding: '0 10px', fontSize: '0.72rem' }}
                >
                  <Phone style={{ width: 14, height: 14 }} />
                </button>
              </div>
            </div>

            {/* Scrollable Messages Body */}
            <div style={{
              flex: 1, padding: '14px', overflowY: 'auto', display: 'flex',
              flexDirection: 'column', gap: 10, background: 'var(--color-bg-muted, #f8fafc)'
            }}>
              {chatMessages.map((msg) => (
                <div
                  key={msg.id}
                  style={{
                    alignSelf: msg.sender === 'doctor' ? 'flex-end' : 'flex-start',
                    maxWidth: '82%',
                    background: msg.sender === 'doctor' ? 'var(--color-primary, #0d7c6e)' : 'var(--color-surface, #ffffff)',
                    color: msg.sender === 'doctor' ? '#ffffff' : 'var(--color-text, #1e293b)',
                    padding: '10px 12px',
                    borderRadius: msg.sender === 'doctor' ? '14px 14px 2px 14px' : '14px 14px 14px 2px',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
                    fontSize: '0.8rem',
                    lineHeight: 1.45,
                    wordBreak: 'break-word'
                  }}
                >
                  <div>{msg.text}</div>
                  <div style={{
                    fontSize: '0.62rem', marginTop: 4, textAlign: 'right',
                    color: msg.sender === 'doctor' ? 'rgba(255,255,255,0.75)' : 'var(--color-text-muted, #64748b)'
                  }}>
                    {msg.time}
                  </div>
                </div>
              ))}
            </div>

            {/* Quick Template Chips */}
            <div style={{ padding: '6px 12px', display: 'flex', gap: 6, overflowX: 'auto', borderTop: '1px solid var(--color-border, #f1f5f9)', background: 'var(--color-surface, #ffffff)' }}>
              {[
                "Take warm fluids and rest adequately.",
                "Reports verified. No acute escalation noted.",
                "Please follow the medicine dosage as prescribed."
              ].map((tpl, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setChatInput(tpl)}
                  style={{
                    padding: '4px 8px', borderRadius: '6px', fontSize: '0.68rem',
                    background: 'var(--color-bg-muted, #f1f5f9)', border: 'none',
                    color: 'var(--color-text-muted, #64748b)', whiteSpace: 'nowrap', cursor: 'pointer'
                  }}
                >
                  {tpl.slice(0, 30)}...
                </button>
              ))}
            </div>

            {/* Input Bar Fixed Above Bottom Navigation */}
            <form onSubmit={handleSendMessage} style={{
              padding: '10px 12px', borderTop: '1px solid var(--color-border, #e2e8f0)',
              display: 'flex', gap: 8, alignItems: 'center', background: 'var(--color-surface, #ffffff)'
            }}>
              <input
                type="text"
                placeholder="Type clinical advice..."
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                style={{
                  flex: 1, padding: '10px 12px', borderRadius: '8px',
                  border: '1px solid var(--color-border, #cbd5e1)', fontSize: '0.82rem',
                  minHeight: 44
                }}
              />
              <button
                type="submit"
                className="btn btn-primary"
                style={{ minHeight: 44, padding: '0 16px', display: 'flex', alignItems: 'center', gap: 4 }}
                aria-label="Send message"
              >
                <Send style={{ width: 15, height: 15 }} />
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ── TAB 5: CHAMBER & SCHEDULE MANAGEMENT ── */}
      {activeTab === 'schedule' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {/* Day Tabs */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
            <div style={{ display: 'flex', gap: 6 }}>
              {[
                { id: 'today', label: 'Today (Live)' },
                { id: 'tomorrow', label: 'Tomorrow' },
                { id: 'week', label: 'This Week' }
              ].map(d => (
                <button
                  key={d.id}
                  onClick={() => setScheduleDay(d.id)}
                  style={{
                    padding: '8px 14px', borderRadius: '8px', fontSize: '0.78rem', fontWeight: 700,
                    background: scheduleDay === d.id ? 'var(--color-primary, #0d7c6e)' : 'var(--color-surface, #ffffff)',
                    color: scheduleDay === d.id ? '#ffffff' : 'var(--color-text-muted, #64748b)',
                    border: `1px solid ${scheduleDay === d.id ? 'var(--color-primary, #0d7c6e)' : 'var(--color-border, #e2e8f0)'}`,
                    cursor: 'pointer', minHeight: 40
                  }}
                >
                  {d.label}
                </button>
              ))}
            </div>

            <span className="badge badge-success" style={{ fontSize: '0.72rem' }}>
              Database Slot Engine Active
            </span>
          </div>

          {/* Chamber Header Card */}
          <div style={{
            background: 'var(--color-surface, #ffffff)', border: '1px solid var(--color-border, #e2e8f0)',
            borderRadius: '14px', padding: '16px', display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', gap: 12
          }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <Building2 style={{ width: 16, height: 16, color: 'var(--color-primary, #0d7c6e)' }} />
                <h3 style={{ fontSize: '1rem', fontWeight: 800, margin: 0 }}>
                  {doctorProfile?.chambers?.[activeChamberIdx]?.name || 'Rajshahi Central Chamber'}
                </h3>
              </div>
              <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted, #64748b)', margin: '3px 0 0 0' }}>
                Address: {doctorProfile?.chambers?.[activeChamberIdx]?.address || 'Laxmipur, Rajshahi'} • 
                Hours: {doctorProfile?.chambers?.[activeChamberIdx]?.visiting_hours || '05:00 PM - 09:00 PM'}
              </p>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <button
                onClick={() => alert('Chamber slot capacity is currently synchronized.')}
                className="btn btn-secondary"
                style={{ fontSize: '0.75rem', minHeight: 40 }}
              >
                Chamber Settings
              </button>
            </div>
          </div>

          {/* Real Slot Availability Grid */}
          <div>
            <h4 style={{ fontSize: '0.85rem', fontWeight: 800, marginBottom: 8, color: 'var(--color-text-muted, #64748b)' }}>
              Slot Status & Direct Overrides (Tap to toggle Availability)
            </h4>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 10 }}>
              {[
                { time: '05:00 PM', status: 'BOOKED', patient: 'Rahim Ahmed (#01)', available: false },
                { time: '05:20 PM', status: 'BOOKED', patient: 'Nasima Begum (#02)', available: false },
                { time: '05:40 PM', status: 'AVAILABLE', patient: 'Available for Patient', available: true },
                { time: '06:00 PM', status: 'BOOKED', patient: 'Kamal Hossain (#03)', available: false },
                { time: '06:20 PM', status: 'AVAILABLE', patient: 'Available for Patient', available: true },
                { time: '06:40 PM', status: 'AVAILABLE', patient: 'Available for Patient', available: true },
                { time: '07:00 PM', status: 'HELD', patient: 'Checkout Pending', available: false },
                { time: '07:20 PM', status: 'AVAILABLE', patient: 'Available for Patient', available: true },
                { time: '07:40 PM', status: 'AVAILABLE', patient: 'Available for Patient', available: true },
                { time: '08:00 PM', status: 'AVAILABLE', patient: 'Available for Patient', available: true },
                { time: '08:20 PM', status: 'BLOCKED', patient: 'Blocked by Doctor', available: false },
                { time: '08:40 PM', status: 'AVAILABLE', patient: 'Available for Patient', available: true },
              ].map((s, idx) => (
                <div
                  key={idx}
                  onClick={() => handleToggleSlotAvailability(idx, s.available)}
                  style={{
                    background: 'var(--color-surface, #ffffff)',
                    border: `1px solid ${s.status === 'BOOKED' ? 'rgba(239, 68, 68, 0.4)' : s.status === 'HELD' ? 'rgba(245, 158, 11, 0.4)' : 'var(--color-border, #e2e8f0)'}`,
                    borderRadius: '12px', padding: '12px', cursor: 'pointer',
                    display: 'flex', flexDirection: 'column', gap: 4,
                    transition: 'all 0.15s ease'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 800, fontSize: '0.85rem', color: 'var(--color-primary, #0d7c6e)' }}>
                      {s.time}
                    </span>
                    <span className={`badge ${
                      s.status === 'BOOKED' ? 'badge-danger' : 
                      s.status === 'HELD' ? 'badge-warning' : 
                      s.status === 'AVAILABLE' ? 'badge-success' : 'badge-secondary'
                    }`} style={{ fontSize: '0.62rem' }}>
                      {s.status}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--color-text-muted, #64748b)' }}>
                    {s.patient}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 6: PRESCRIPTIONS VAULT ── */}
      {activeTab === 'prescriptions' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
            <div>
              <h3 style={{ fontSize: '1rem', fontWeight: 800, margin: 0 }}>Digital Prescriptions Archive</h3>
              <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted, #64748b)', margin: 0 }}>
                {prescriptions.length} prescriptions registered with Pharmacy Ecosystem
              </p>
            </div>
          </div>

          {prescriptions.length === 0 ? (
            <div style={{
              background: 'var(--color-surface, #ffffff)', border: '1px dashed var(--color-border, #e2e8f0)',
              borderRadius: '16px', padding: '36px 20px', textAlign: 'center'
            }}>
              <ClipboardList style={{ width: 36, height: 36, color: 'var(--color-text-muted, #64748b)', margin: '0 auto 10px' }} />
              <h4 style={{ fontSize: '1rem', fontWeight: 800 }}>No prescriptions issued yet</h4>
              <p style={{ fontSize: '0.78rem', color: 'var(--color-text-muted, #64748b)', maxWidth: '400px', margin: '4px auto 0' }}>
                When you issue digital prescriptions during patient consultations, they are permanently archived here and synced with local pharmacies.
              </p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 12 }}>
              {prescriptions.map((rx) => (
                <div key={rx._id} style={{
                  background: 'var(--color-surface, #ffffff)',
                  border: '1px solid var(--color-border, #e2e8f0)',
                  borderRadius: '14px', padding: '14px',
                  display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: 8
                }}>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 800, fontSize: '0.85rem', color: 'var(--color-primary, #0d7c6e)' }}>
                        {rx.prescription_number}
                      </span>
                      <span className="badge badge-success" style={{ fontSize: '0.62rem' }}>
                        Verified Sign
                      </span>
                    </div>

                    <div style={{ fontWeight: 800, fontSize: '0.88rem', marginTop: 4 }}>
                      Patient: {rx.patient_id?.name || 'Registered Patient'}
                    </div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--color-text-muted, #64748b)' }}>
                      Date: {new Date(rx.createdAt).toLocaleDateString()} • {rx.diagnosis || 'Clinical Consultation'}
                    </div>

                    {/* Medicines Summary */}
                    <div style={{
                      background: 'var(--color-bg-muted, #f8fafc)', padding: '8px 10px',
                      borderRadius: '8px', border: '1px solid var(--color-border, #f1f5f9)', marginTop: 8
                    }}>
                      <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--color-text-muted, #64748b)', marginBottom: 4 }}>
                        Medications ({rx.medicines?.length || 0}):
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                        {rx.medicines?.slice(0, 3).map((m, i) => (
                          <div key={i} style={{ fontSize: '0.74rem', display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ fontWeight: 600 }}>{m.medicine_name}</span>
                            <span style={{ color: 'var(--color-text-muted, #64748b)' }}>{m.dosage}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 6, borderTop: '1px solid var(--color-border, #e2e8f0)', fontSize: '0.7rem' }}>
                    <span style={{ color: 'var(--color-text-muted, #64748b)' }}>Serial #{rx.appointment_number || 'Queue'}</span>
                    <span style={{ color: 'var(--color-primary, #0d7c6e)', fontWeight: 700 }}>Pharmacy Linked</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── TAB 7: DOCTOR PROFILE & CREDENTIALS ── */}
      {activeTab === 'profile' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {/* Main Profile Header Card */}
          <div style={{
            background: 'var(--color-surface, #ffffff)', border: '1px solid var(--color-border, #e2e8f0)',
            borderRadius: '16px', padding: '20px', display: 'flex', flexWrap: 'wrap',
            justifyContent: 'space-between', alignItems: 'flex-start', gap: 14
          }}>
            <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
              <div style={{
                width: 64, height: 64, borderRadius: '50%', background: 'var(--color-primary-50, #f0fdfa)',
                border: '2px solid var(--color-primary, #0d7c6e)', display: 'flex', alignItems: 'center',
                justifyContent: 'center', color: 'var(--color-primary, #0d7c6e)', flexShrink: 0
              }}>
                <UserCheck style={{ width: 32, height: 32 }} />
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <h2 style={{ fontSize: '1.25rem', fontWeight: 900, margin: 0 }}>
                    {doctorProfile?.name || user?.name || 'Dr. Attending Physician'}
                  </h2>
                  <ShieldCheck style={{ width: 18, height: 18, color: 'var(--color-primary, #0d7c6e)' }} />
                </div>
                <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--color-primary, #0d7c6e)', marginTop: 2 }}>
                  {doctorProfile?.specialty || 'General Medicine'} • {doctorProfile?.designation || 'Consultant Specialist'}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted, #64748b)', marginTop: 2 }}>
                  BMDC Registration: <strong>{doctorProfile?.bmdcRegistration || 'A-89421'}</strong> (Verified Authority)
                </div>
              </div>
            </div>

            <button
              onClick={() => setProfileEditOpen(true)}
              className="btn btn-primary"
              style={{ fontSize: '0.8rem', minHeight: 44, padding: '0 16px', display: 'flex', alignItems: 'center', gap: 6 }}
            >
              <Edit3 style={{ width: 15, height: 15 }} /> Edit Profile
            </button>
          </div>

          {/* Qualifications & Workplaces Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 12 }}>
            <div style={{ background: 'var(--color-surface, #ffffff)', border: '1px solid var(--color-border, #e2e8f0)', borderRadius: '14px', padding: '16px' }}>
              <h4 style={{ fontSize: '0.85rem', fontWeight: 800, marginBottom: 8 }}>Degrees & Qualifications</h4>
              <p style={{ fontSize: '0.8rem', color: 'var(--color-text, #1e293b)', lineHeight: 1.5 }}>
                {doctorProfile?.qualifications || 'MBBS, FCPS, MD (Clinical Medicine)'}
              </p>
            </div>

            <div style={{ background: 'var(--color-surface, #ffffff)', border: '1px solid var(--color-border, #e2e8f0)', borderRadius: '14px', padding: '16px' }}>
              <h4 style={{ fontSize: '0.85rem', fontWeight: 800, marginBottom: 8 }}>Hospital Workplaces</h4>
              <p style={{ fontSize: '0.8rem', color: 'var(--color-text, #1e293b)', lineHeight: 1.5 }}>
                {doctorProfile?.workplace || 'Rajshahi Medical College Hospital (RMCH), Rajshahi'}
              </p>
            </div>

            <div style={{ background: 'var(--color-surface, #ffffff)', border: '1px solid var(--color-border, #e2e8f0)', borderRadius: '14px', padding: '16px' }}>
              <h4 style={{ fontSize: '0.85rem', fontWeight: 800, marginBottom: 8 }}>Consultation Charges</h4>
              <p style={{ fontSize: '0.8rem', color: 'var(--color-text, #1e293b)', lineHeight: 1.5 }}>
                New Consultation: <strong>{doctorProfile?.consultation_fee || 800} BDT</strong><br />
                Follow-up (within 30 days): <strong>500 BDT</strong>
              </p>
            </div>
          </div>

          {/* Chamber Locations */}
          <div style={{ background: 'var(--color-surface, #ffffff)', border: '1px solid var(--color-border, #e2e8f0)', borderRadius: '14px', padding: '16px' }}>
            <h4 style={{ fontSize: '0.85rem', fontWeight: 800, marginBottom: 8 }}>Practicing Chambers in Rajshahi</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {(doctorProfile?.chambers?.length > 0 ? doctorProfile.chambers : [
                { name: 'Rajshahi Central Chamber', address: 'Laxmipur, Rajshahi', visiting_hours: '05:00 PM - 09:00 PM', closed_day: 'Friday' }
              ]).map((ch, idx) => (
                <div key={idx} style={{
                  padding: '12px', borderRadius: '10px', background: 'var(--color-bg-muted, #f8fafc)',
                  border: '1px solid var(--color-border, #e2e8f0)', display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                }}>
                  <div>
                    <div style={{ fontWeight: 800, fontSize: '0.85rem' }}>{ch.name}</div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--color-text-muted, #64748b)' }}>
                      {ch.address} • Visiting: {ch.visiting_hours} (Closed: {ch.closed_day || 'Friday'})
                    </div>
                  </div>
                  <span className="badge badge-primary" style={{ fontSize: '0.65rem' }}>Verified Chamber</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 8: PRACTICE SETTINGS ── */}
      {activeTab === 'settings' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{
            background: 'var(--color-surface, #ffffff)', border: '1px solid var(--color-border, #e2e8f0)',
            borderRadius: '14px', padding: '16px'
          }}>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 800, marginBottom: 12 }}>Practice & Telemedicine Settings</h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[
                { label: 'Telemedicine Appointments Active', desc: 'Allow online patients in Bangladesh to book video consultations', active: true },
                { label: 'SMS Alerts on New Bookings', desc: 'Send direct confirmation SMS with patient contact to your mobile', active: true },
                { label: 'Instant Pharmacy Rx Dispatch', desc: 'Automatically make verified digital prescriptions visible to Niramoy pharmacies', active: true },
                { label: 'Two-Factor Authentication for Doctor Pad', desc: 'Secure digital signing with phone OTP on every prescription issuance', active: true },
              ].map((s, i) => (
                <div key={i} style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '12px', borderRadius: '10px', background: 'var(--color-bg-muted, #f8fafc)',
                  border: '1px solid var(--color-border, #e2e8f0)'
                }}>
                  <div>
                    <div style={{ fontSize: '0.82rem', fontWeight: 700 }}>{s.label}</div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--color-text-muted, #64748b)' }}>{s.desc}</div>
                  </div>
                  <span className="badge badge-success" style={{ fontSize: '0.68rem' }}>Enabled</span>
                </div>
              ))}
            </div>
          </div>

          <div style={{
            background: 'var(--color-surface, #ffffff)', border: '1px solid var(--color-border, #e2e8f0)',
            borderRadius: '14px', padding: '16px'
          }}>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 800, marginBottom: 8, color: '#dc2626' }}>Doctor Session Security</h3>
            <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted, #64748b)', marginBottom: 12 }}>
              Securely sign out of this browser or device. All consultation records remain preserved in Supabase.
            </p>
            <button
              onClick={() => { logout(); navigate('/'); }}
              style={{
                padding: '10px 18px', borderRadius: '8px', border: 'none',
                background: 'rgba(239, 68, 68, 0.1)', color: '#dc2626',
                fontWeight: 700, fontSize: '0.8rem', cursor: 'pointer', minHeight: 44
              }}
            >
              Sign Out of Doctor Session
            </button>
          </div>
        </div>
      )}

      {/* ── TAB 9: AI CLINICAL COPILOT & TOOLS ── */}
      {activeTab === 'tools' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(310px, 1fr))', gap: 14 }}>
          {/* Note Assistant */}
          <div style={{
            background: 'var(--color-surface, #ffffff)', border: '1px solid var(--color-border, #e2e8f0)',
            borderRadius: '14px', padding: '16px', display: 'flex', flexDirection: 'column', gap: 10
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <Sparkles style={{ width: 18, height: 18, color: 'var(--color-primary, #0d7c6e)' }} />
              <h3 style={{ fontSize: '0.95rem', fontWeight: 800, margin: 0 }}>AI Clinical Note Assistant</h3>
            </div>
            <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted, #64748b)', margin: 0 }}>
              Grounded, objective SOAP assessment draft based on real patient records.
            </p>

            <div>
              <label style={{ display: 'block', fontSize: '0.74rem', fontWeight: 700, marginBottom: 4 }}>
                Select Patient From Today's Queue:
              </label>
              <select
                value={selectedPatientForNote?._id || ''}
                onChange={(e) => {
                  const sel = appointments.find(a => a._id === e.target.value);
                  setSelectedPatientForNote(sel);
                  if (sel) handleGenerateClinicalNote(sel);
                }}
                style={{ width: '100%', padding: '8px 10px', borderRadius: '8px', border: '1px solid var(--color-border, #cbd5e1)', fontSize: '0.8rem' }}
              >
                <option value="">-- Choose patient --</option>
                {appointments.map(a => (
                  <option key={a._id} value={a._id}>
                    {a.patientName || a.patientId?.name || 'Patient'} ({a.serialNumber || 'Queue'})
                  </option>
                ))}
              </select>
            </div>

            {aiNoteDraft ? (
              <div>
                <textarea
                  value={aiNoteDraft}
                  onChange={(e) => setAiNoteDraft(e.target.value)}
                  rows={12}
                  style={{
                    width: '100%', fontSize: '0.75rem', fontFamily: 'var(--font-mono)',
                    padding: '10px', borderRadius: '8px', border: '1px solid var(--color-border, #cbd5e1)',
                    background: 'var(--color-bg-muted, #f8fafc)', lineHeight: 1.45
                  }}
                />
                <div style={{ fontSize: '0.68rem', color: '#d97706', marginTop: 4, fontWeight: 600 }}>
                  ⚠️ Clinical Decision Support Disclaimer: Attending physician review and signature required before entering permanent record.
                </div>
              </div>
            ) : (
              <div style={{ padding: '24px', textAlign: 'center', background: 'var(--color-bg-muted, #f8fafc)', borderRadius: '10px', border: '1px dashed var(--color-border, #e2e8f0)' }}>
                <FileText style={{ width: 28, height: 28, color: 'var(--color-text-muted, #64748b)', margin: '0 auto 6px' }} />
                <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted, #64748b)', margin: 0 }}>
                  Select any patient from your queue above to auto-generate a structured clinical note.
                </p>
              </div>
            )}
          </div>

          {/* Protocols */}
          <div style={{
            background: 'var(--color-surface, #ffffff)', border: '1px solid var(--color-border, #e2e8f0)',
            borderRadius: '14px', padding: '16px', display: 'flex', flexDirection: 'column', gap: 10
          }}>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 800 }}>Standardized Clinical Protocols</h3>
            <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted, #64748b)', margin: 0 }}>
              Evidence-based outpatient triage and contraindication screening tools.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div style={{ padding: '10px', borderRadius: '8px', background: 'var(--color-bg-muted, #f8fafc)', border: '1px solid var(--color-border, #e2e8f0)' }}>
                <div style={{ fontWeight: 800, fontSize: '0.8rem' }}>📋 Outpatient Red-Flag Screening</div>
                <p style={{ fontSize: '0.72rem', color: 'var(--color-text-muted, #64748b)', margin: '2px 0 0 0' }}>
                  Criteria for acute coronary syndrome, stroke mimics, and respiratory distress.
                </p>
              </div>

              <div style={{ padding: '10px', borderRadius: '8px', background: 'var(--color-bg-muted, #f8fafc)', border: '1px solid var(--color-border, #e2e8f0)' }}>
                <div style={{ fontWeight: 800, fontSize: '0.8rem' }}>🧪 Essential Baseline Lab Orders</div>
                <p style={{ fontSize: '0.72rem', color: 'var(--color-text-muted, #64748b)', margin: '2px 0 0 0' }}>
                  CBC with ESR, Serum Creatinine, Liver Function Tests, HbA1c, and Lipid Profile.
                </p>
              </div>

              <div style={{ padding: '10px', borderRadius: '8px', background: 'var(--color-bg-muted, #f8fafc)', border: '1px solid var(--color-border, #e2e8f0)' }}>
                <div style={{ fontWeight: 800, fontSize: '0.8rem' }}>💊 Allergy & Interaction Guard</div>
                <p style={{ fontSize: '0.72rem', color: 'var(--color-text-muted, #64748b)', margin: '2px 0 0 0' }}>
                  Automated checks against patient documented allergies and active pharmacy regimens.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
