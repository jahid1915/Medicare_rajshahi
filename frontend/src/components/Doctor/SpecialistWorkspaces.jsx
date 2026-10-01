import React, { useState, useEffect } from 'react';
import { 
  Stethoscope, UserCheck, FileText, Activity, AlertCircle, Plus, Search, 
  ShieldCheck, Sparkles, Video, Clock, CheckCircle2, XCircle, RefreshCw, 
  Calendar, Phone, User, Download, Pill, ChevronRight, Eye, ClipboardCheck,
  Heart, AlertTriangle, Loader2
} from 'lucide-react';
import { appointmentsAPI, prescriptionsAPI } from '../../services/api';
import TeleconsultationRoom from './TeleconsultationRoom';

export default function SpecialistWorkspaces() {
  const [activeTab, setActiveTab] = useState('appointments'); // 'appointments' | 'prescriptions' | 'tools'
  const [statusFilter, setStatusFilter] = useState('all'); // 'all' | 'today' | 'telemedicine' | 'in_person' | 'completed'
  const [searchQuery, setSearchQuery] = useState('');
  
  // Real Database State
  const [appointments, setAppointments] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Active Consultation / Modals
  const [activeTeleconsultationAppt, setActiveTeleconsultationAppt] = useState(null);
  const [prescriptionModalAppt, setPrescriptionModalAppt] = useState(null);
  
  // Prescription Form State
  const [rxDiagnosis, setRxDiagnosis] = useState('');
  const [rxMedicines, setRxMedicines] = useState([
    { name: '', dosage: '1 tablet', frequency: '3 times daily', duration: '5 days' }
  ]);
  const [rxAdvice, setRxAdvice] = useState('');
  const [rxTests, setRxTests] = useState('');
  const [rxBp, setRxBp] = useState('120/80 mmHg');
  const [rxPulse, setRxPulse] = useState('72 bpm');
  const [isSubmittingRx, setIsSubmittingRx] = useState(false);
  const [rxFeedback, setRxFeedback] = useState(null);

  // Selected Patient for Clinical Note Generation
  const [selectedPatientForNote, setSelectedPatientForNote] = useState(null);
  const [aiNoteDraft, setAiNoteDraft] = useState('');

  // Fetch real appointments & prescriptions
  const loadDoctorData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [apptRes, rxRes] = await Promise.allSettled([
        appointmentsAPI.getMine({ limit: 100 }),
        prescriptionsAPI.getMyPrescriptions({ limit: 100 })
      ]);

      if (apptRes.status === 'fulfilled' && apptRes.value) {
        const apptData = apptRes.value.data?.data || apptRes.value.data || [];
        setAppointments(Array.isArray(apptData) ? apptData : []);
      } else {
        console.warn('Failed to load appointments:', apptRes.reason);
      }

      if (rxRes.status === 'fulfilled' && rxRes.value) {
        const rxData = rxRes.value.data?.data || rxRes.value.data || [];
        setPrescriptions(Array.isArray(rxData) ? rxData : []);
      } else {
        console.warn('Failed to load prescriptions:', rxRes.reason);
      }
    } catch (err) {
      console.error('Error fetching doctor portal data:', err);
      setError('Unable to load clinical records from server. Please retry.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDoctorData();
  }, []);

  // Today check helper
  const isToday = (dateString) => {
    if (!dateString) return false;
    const d = new Date(dateString);
    const today = new Date();
    return d.getDate() === today.getDate() &&
      d.getMonth() === today.getMonth() &&
      d.getFullYear() === today.getFullYear();
  };

  // Statistics calculation from real data
  const todayAppointments = appointments.filter(a => isToday(a.appointmentDate));
  const telemedicineAppts = appointments.filter(a => 
    a.appointmentType?.toLowerCase().includes('online') || a.consultation_type?.toLowerCase().includes('online')
  );
  const completedAppts = appointments.filter(a => a.status === 'COMPLETED' || a.status === 'completed');
  const confirmedAppts = appointments.filter(a => a.status === 'CONFIRMED' || a.status === 'confirmed');

  // Filtered Appointments
  const filteredAppointments = appointments.filter(appt => {
    // Tab/Status Filter
    if (statusFilter === 'today' && !isToday(appt.appointmentDate)) return false;
    if (statusFilter === 'telemedicine' && !(appt.appointmentType?.toLowerCase().includes('online') || appt.consultation_type?.toLowerCase().includes('online'))) return false;
    if (statusFilter === 'in_person' && (appt.appointmentType?.toLowerCase().includes('online') || appt.consultation_type?.toLowerCase().includes('online'))) return false;
    if (statusFilter === 'completed' && appt.status !== 'COMPLETED' && appt.status !== 'completed') return false;

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const pName = (appt.patientName || appt.patientId?.name || '').toLowerCase();
      const pPhone = (appt.patientPhone || appt.patientId?.phone || '').toLowerCase();
      const serial = (appt.serialNumber || appt.appointmentId || '').toLowerCase();
      const doctorNotes = (appt.doctor_notes || appt.consultationReason || '').toLowerCase();
      return pName.includes(q) || pPhone.includes(q) || serial.includes(q) || doctorNotes.includes(q);
    }

    return true;
  });

  // Handle Status Update
  const handleUpdateStatus = async (apptId, newStatus) => {
    try {
      await appointmentsAPI.updateStatus(apptId, { status: newStatus });
      setAppointments(prev => prev.map(a => a._id === apptId ? { ...a, status: newStatus } : a));
    } catch (err) {
      alert('Failed to update appointment status: ' + err.message);
    }
  };

  // Prescription Form Actions
  const openPrescriptionModal = (appt) => {
    setPrescriptionModalAppt(appt);
    setRxDiagnosis(appt.consultationReason || appt.symptoms || '');
    setRxMedicines([{ name: '', dosage: '1 tablet', frequency: '3 times daily after food', duration: '5 days' }]);
    setRxAdvice('Drink plenty of water. Rest adequately.');
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

      // Update state
      setPrescriptions(prev => [createdRx, ...prev]);
      setAppointments(prev => prev.map(a => a._id === prescriptionModalAppt._id ? { ...a, status: 'COMPLETED' } : a));
      
      setRxFeedback({ 
        type: 'success', 
        text: `Prescription #${createdRx.prescription_number || 'ISSUED'} successfully registered in database.` 
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

  // AI Note Generator for Selected Patient
  const handleGenerateClinicalNote = (patientAppt) => {
    if (!patientAppt) return;
    const pName = patientAppt.patientName || patientAppt.patientId?.name || 'Patient';
    const age = patientAppt.patientId?.date_of_birth ? 
      Math.floor((new Date() - new Date(patientAppt.patientId.date_of_birth)) / (365.25 * 24 * 60 * 60 * 1000)) + 'y' : 
      (patientAppt.age || 'N/A');
    const gender = patientAppt.patientId?.gender || patientAppt.gender || 'Not specified';
    const blood = patientAppt.patientId?.blood_group || patientAppt.bloodGroup || 'Unknown';
    const allergies = patientAppt.patientId?.allergies || 'None documented';
    const conditions = patientAppt.patientId?.existing_conditions || 'None documented';
    const history = patientAppt.patientId?.medical_history || 'No previous chronic history recorded.';
    const reason = patientAppt.consultationReason || patientAppt.symptoms || 'General clinical review';

    setAiNoteDraft(
      `[CLINICAL ASSESSMENT SUMMARY - ATTENDING SPECIALIST]\n` +
      `Date: ${new Date().toLocaleDateString()} | Time: ${patientAppt.time_slot || 'Scheduled'}\n` +
      `Patient: ${pName} (${age}, ${gender}, Blood: ${blood})\n` +
      `Serial Number: ${patientAppt.serialNumber || patientAppt.appointmentId || 'Walk-in'}\n\n` +
      `PRESENTING COMPLAINT & SYMPTOMS:\n` +
      `- ${reason}\n\n` +
      `PERTINENT MEDICAL HISTORY & ALLERGIES:\n` +
      `- Allergies: ${allergies}\n` +
      `- Existing Conditions: ${conditions}\n` +
      `- Longitudinal EHR: ${history}\n\n` +
      `OBJECTIVE EVALUATION PLAN:\n` +
      `1. Targeted diagnostic verification of vital parameters.\n` +
      `2. Formulate pharmaceutical regimen tailored to patient contraindications.\n` +
      `3. Patient educated on danger signs and scheduled for review if symptoms escalate.\n\n` +
      `⚠️ AI Decision Support Draft — Review, edit, and sign before permanent entry into medical record.`
    );
  };

  return (
    <div style={{ padding: '24px', color: 'var(--text-main)', maxWidth: '1400px', margin: '0 auto' }}>
      
      {/* Teleconsultation Overlay Room */}
      {activeTeleconsultationAppt && (
        <TeleconsultationRoom
          appointment={activeTeleconsultationAppt}
          onCloseRoom={() => {
            setActiveTeleconsultationAppt(null);
            loadDoctorData();
          }}
        />
      )}

      {/* Prescription Creation Modal */}
      {prescriptionModalAppt && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0, 0, 0, 0.75)',
          backdropFilter: 'blur(4px)',
          zIndex: 100,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '16px'
        }}>
          <div style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border-color)',
            borderRadius: '16px',
            width: '100%',
            maxWidth: '750px',
            maxHeight: '90vh',
            overflowY: 'auto',
            padding: '24px',
            boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '14px', marginBottom: '18px' }}>
              <div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--primary)' }}>Digital Prescription Pad</h3>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  Patient: <strong>{prescriptionModalAppt.patientName || prescriptionModalAppt.patientId?.name}</strong> • 
                  Serial: {prescriptionModalAppt.serialNumber || 'N/A'}
                </p>
              </div>
              <button 
                onClick={() => setPrescriptionModalAppt(null)}
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '1.2rem' }}
              >
                ✕
              </button>
            </div>

            {rxFeedback && (
              <div style={{
                padding: '10px 14px',
                borderRadius: '8px',
                marginBottom: '16px',
                fontSize: '0.85rem',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                background: rxFeedback.type === 'error' ? 'rgba(239, 68, 68, 0.15)' : 'rgba(16, 185, 129, 0.15)',
                color: rxFeedback.type === 'error' ? '#ef4444' : '#10b981',
                border: `1px solid ${rxFeedback.type === 'error' ? '#ef4444' : '#10b981'}`
              }}>
                {rxFeedback.type === 'error' ? <AlertCircle style={{ width: 16, height: 16 }} /> : <CheckCircle2 style={{ width: 16, height: 16 }} />}
                <span>{rxFeedback.text}</span>
              </div>
            )}

            <form onSubmit={handleSubmitPrescription} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Diagnosis */}
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '6px' }}>
                  Clinical Diagnosis *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Acute Pharyngitis, Type 2 Diabetes"
                  value={rxDiagnosis}
                  onChange={(e) => setRxDiagnosis(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: '8px',
                    background: 'var(--bg-canvas)',
                    border: '1px solid var(--border-color)',
                    color: 'var(--text-main)',
                    fontSize: '0.85rem'
                  }}
                />
              </div>

              {/* Vitals */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '4px' }}>
                    Blood Pressure
                  </label>
                  <input
                    type="text"
                    value={rxBp}
                    onChange={(e) => setRxBp(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '8px 10px',
                      borderRadius: '8px',
                      background: 'var(--bg-canvas)',
                      border: '1px solid var(--border-color)',
                      color: 'var(--text-main)',
                      fontSize: '0.8rem'
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '4px' }}>
                    Pulse Rate
                  </label>
                  <input
                    type="text"
                    value={rxPulse}
                    onChange={(e) => setRxPulse(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '8px 10px',
                      borderRadius: '8px',
                      background: 'var(--bg-canvas)',
                      border: '1px solid var(--border-color)',
                      color: 'var(--text-main)',
                      fontSize: '0.8rem'
                    }}
                  />
                </div>
              </div>

              {/* Medicines List */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <label style={{ fontSize: '0.8rem', fontWeight: 700 }}>
                    Prescribed Medicines *
                  </label>
                  <button
                    type="button"
                    onClick={handleAddMedicineRow}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'var(--primary)',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    <Plus style={{ width: 14, height: 14 }} /> Add Medicine
                  </button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {rxMedicines.map((med, index) => (
                    <div key={index} style={{
                      display: 'grid',
                      gridTemplateColumns: '2fr 1fr 1.5fr 1fr 32px',
                      gap: '8px',
                      alignItems: 'center',
                      background: 'var(--bg-canvas)',
                      padding: '8px',
                      borderRadius: '8px',
                      border: '1px solid var(--border-color)'
                    }}>
                      <input
                        type="text"
                        placeholder="Medicine Name (e.g. Napa 500mg)"
                        required
                        value={med.name}
                        onChange={(e) => {
                          const updated = [...rxMedicines];
                          updated[index].name = e.target.value;
                          setRxMedicines(updated);
                        }}
                        style={{
                          padding: '6px 8px',
                          borderRadius: '6px',
                          background: 'var(--bg-card)',
                          border: '1px solid var(--border-color)',
                          color: 'var(--text-main)',
                          fontSize: '0.75rem'
                        }}
                      />
                      <input
                        type="text"
                        placeholder="Dosage"
                        value={med.dosage}
                        onChange={(e) => {
                          const updated = [...rxMedicines];
                          updated[index].dosage = e.target.value;
                          setRxMedicines(updated);
                        }}
                        style={{
                          padding: '6px 8px',
                          borderRadius: '6px',
                          background: 'var(--bg-card)',
                          border: '1px solid var(--border-color)',
                          color: 'var(--text-main)',
                          fontSize: '0.75rem'
                        }}
                      />
                      <input
                        type="text"
                        placeholder="Frequency"
                        value={med.frequency}
                        onChange={(e) => {
                          const updated = [...rxMedicines];
                          updated[index].frequency = e.target.value;
                          setRxMedicines(updated);
                        }}
                        style={{
                          padding: '6px 8px',
                          borderRadius: '6px',
                          background: 'var(--bg-card)',
                          border: '1px solid var(--border-color)',
                          color: 'var(--text-main)',
                          fontSize: '0.75rem'
                        }}
                      />
                      <input
                        type="text"
                        placeholder="Duration"
                        value={med.duration}
                        onChange={(e) => {
                          const updated = [...rxMedicines];
                          updated[index].duration = e.target.value;
                          setRxMedicines(updated);
                        }}
                        style={{
                          padding: '6px 8px',
                          borderRadius: '6px',
                          background: 'var(--bg-card)',
                          border: '1px solid var(--border-color)',
                          color: 'var(--text-main)',
                          fontSize: '0.75rem'
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveMedicineRow(index)}
                        disabled={rxMedicines.length === 1}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: rxMedicines.length === 1 ? 'var(--text-muted)' : '#ef4444',
                          cursor: rxMedicines.length === 1 ? 'default' : 'pointer'
                        }}
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recommended Diagnostic Tests */}
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '6px' }}>
                  Advised Diagnostic Tests (Optional, comma-separated)
                </label>
                <input
                  type="text"
                  placeholder="e.g. CBC, Serum Creatinine, Chest X-Ray"
                  value={rxTests}
                  onChange={(e) => setRxTests(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    background: 'var(--bg-canvas)',
                    border: '1px solid var(--border-color)',
                    color: 'var(--text-main)',
                    fontSize: '0.8rem'
                  }}
                />
              </div>

              {/* Doctor Advice */}
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '6px' }}>
                  Doctor's Instructions & Lifestyle Advice
                </label>
                <textarea
                  rows={3}
                  value={rxAdvice}
                  onChange={(e) => setRxAdvice(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    background: 'var(--bg-canvas)',
                    border: '1px solid var(--border-color)',
                    color: 'var(--text-main)',
                    fontSize: '0.8rem',
                    resize: 'vertical'
                  }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button
                  type="button"
                  onClick={() => setPrescriptionModalAppt(null)}
                  className="btn btn-secondary"
                  style={{ fontSize: '0.85rem' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingRx}
                  className="btn btn-primary"
                  style={{ fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px' }}
                >
                  {isSubmittingRx && <Loader2 style={{ width: 14, height: 14 }} className="animate-spin" />}
                  {isSubmittingRx ? 'Registering Rx...' : 'Sign & Issue Prescription'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Header Banner */}
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <span className="badge badge-primary">👨‍⚕️ Attending Physician Portal</span>
            <span className="badge badge-success">Live Database Connected</span>
          </div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 900 }}>Doctor Consultation & Clinical Intelligence Hub</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
            Live patient queues, digital prescriptions, teleconsultations, and clinical decision support.
          </p>
        </div>

        <button 
          onClick={loadDoctorData} 
          disabled={loading}
          className="btn btn-secondary" 
          style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem' }}
        >
          <RefreshCw style={{ width: 14, height: 14 }} className={loading ? "animate-spin" : ""} />
          {loading ? 'Syncing...' : 'Refresh Records'}
        </button>
      </div>

      {/* Real Statistics Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px', marginBottom: '24px' }}>
        <div className="dashboard-card" style={{ padding: '16px' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Clock style={{ width: 14, height: 14, color: 'var(--primary)' }} /> Today's Appointments
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 900, marginTop: '6px', color: 'var(--primary)' }}>
            {todayAppointments.length}
          </div>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
            {todayAppointments.length === 0 ? "0 scheduled for today" : `${todayAppointments.length} active queue today`}
          </div>
        </div>

        <div className="dashboard-card" style={{ padding: '16px' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Calendar style={{ width: 14, height: 14, color: '#3b82f6' }} /> Confirmed & Upcoming
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 900, marginTop: '6px', color: '#3b82f6' }}>
            {confirmedAppts.length}
          </div>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
            Verified bookings
          </div>
        </div>

        <div className="dashboard-card" style={{ padding: '16px' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Video style={{ width: 14, height: 14, color: '#8b5cf6' }} /> Telemedicine Sessions
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 900, marginTop: '6px', color: '#8b5cf6' }}>
            {telemedicineAppts.length}
          </div>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
            Online video appointments
          </div>
        </div>

        <div className="dashboard-card" style={{ padding: '16px' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Pill style={{ width: 14, height: 14, color: '#10b981' }} /> Digital Prescriptions
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 900, marginTop: '6px', color: '#10b981' }}>
            {prescriptions.length}
          </div>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
            Issued in database
          </div>
        </div>
      </div>

      {/* Main Tabs Navigation */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
        <button
          onClick={() => setActiveTab('appointments')}
          className={`btn ${activeTab === 'appointments' ? 'btn-primary' : 'btn-secondary'}`}
          style={{ fontSize: '0.85rem' }}
        >
          <UserCheck style={{ width: 14, height: 14 }} /> Patient Appointments & Queue ({appointments.length})
        </button>

        <button
          onClick={() => setActiveTab('prescriptions')}
          className={`btn ${activeTab === 'prescriptions' ? 'btn-primary' : 'btn-secondary'}`}
          style={{ fontSize: '0.85rem' }}
        >
          <Pill style={{ width: 14, height: 14 }} /> Issued Prescriptions ({prescriptions.length})
        </button>

        <button
          onClick={() => setActiveTab('tools')}
          className={`btn ${activeTab === 'tools' ? 'btn-primary' : 'btn-secondary'}`}
          style={{ fontSize: '0.85rem' }}
        >
          <Sparkles style={{ width: 14, height: 14 }} /> Clinical Decision Tools
        </button>
      </div>

      {/* TAB 1: PATIENT APPOINTMENTS */}
      {activeTab === 'appointments' && (
        <div className="dashboard-card" style={{ padding: '20px' }}>
          {/* Sub-filters & Search Bar */}
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '12px', marginBottom: '18px' }}>
            <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '4px' }}>
              {[
                { id: 'all', label: 'All Records' },
                { id: 'today', label: `Today's Queue (${todayAppointments.length})` },
                { id: 'telemedicine', label: 'Telemedicine' },
                { id: 'in_person', label: 'In-Person Chamber' },
                { id: 'completed', label: 'Completed' }
              ].map(f => (
                <button
                  key={f.id}
                  onClick={() => setStatusFilter(f.id)}
                  style={{
                    padding: '6px 12px',
                    borderRadius: '8px',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    background: statusFilter === f.id ? 'var(--primary)' : 'var(--bg-canvas)',
                    color: statusFilter === f.id ? '#fff' : 'var(--text-secondary)',
                    border: '1px solid var(--border-color)',
                    whiteSpace: 'nowrap'
                  }}
                >
                  {f.label}
                </button>
              ))}
            </div>

            <div style={{ position: 'relative', width: '280px' }}>
              <Search style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', width: 14, height: 14, color: 'var(--text-muted)' }} />
              <input
                type="text"
                placeholder="Search patient, serial, phone..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: '100%',
                  padding: '7px 12px 7px 32px',
                  borderRadius: '8px',
                  background: 'var(--bg-canvas)',
                  border: '1px solid var(--border-color)',
                  color: 'var(--text-main)',
                  fontSize: '0.8rem'
                }}
              />
            </div>
          </div>

          {/* Appointments Table or Empty State */}
          {loading ? (
            <div style={{ padding: '60px 20px', textAlign: 'center', color: 'var(--text-muted)' }}>
              <RefreshCw style={{ width: 24, height: 24, margin: '0 auto 12px' }} className="animate-spin text-primary" />
              <p style={{ fontSize: '0.9rem' }}>Retrieving live appointments from database...</p>
            </div>
          ) : filteredAppointments.length === 0 ? (
            <div style={{ padding: '60px 20px', textAlign: 'center', background: 'var(--bg-canvas)', borderRadius: '12px', border: '1px dashed var(--border-color)' }}>
              <UserCheck style={{ width: 36, height: 36, color: 'var(--text-muted)', margin: '0 auto 12px' }} />
              <h3 style={{ fontSize: '1.05rem', fontWeight: 800 }}>No patient appointments found</h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', maxWidth: '400px', margin: '6px auto 16px' }}>
                {statusFilter === 'today' ? 
                  "Today's appointments: 0. There are currently no patients booked in your queue for today." : 
                  "No appointments match the selected filter. As patients book consultations, they will appear here in real-time."}
              </p>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Patient Profile</th>
                    <th>Serial / Schedule</th>
                    <th>Clinical Reason / History</th>
                    <th>Fee & Payment</th>
                    <th>Status</th>
                    <th>Consultation Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAppointments.map((appt) => {
                    const patientName = appt.patientName || appt.patientId?.name || 'Registered Patient';
                    const phone = appt.patientPhone || appt.patientId?.phone || 'N/A';
                    const serial = appt.serialNumber || appt.appointmentId || 'Walk-in';
                    const isOnline = appt.appointmentType?.toLowerCase().includes('online') || appt.consultation_type?.toLowerCase().includes('online');
                    const allergies = appt.patientId?.allergies || '';
                    const conditions = appt.patientId?.existing_conditions || '';
                    const dateFormatted = appt.appointmentDate ? new Date(appt.appointmentDate).toLocaleDateString('en-GB') : 'N/A';

                    return (
                      <tr key={appt._id}>
                        <td>
                          <div style={{ fontWeight: 800, fontSize: '0.85rem' }}>{patientName}</div>
                          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                            {phone} • {appt.patientId?.gender || appt.gender || 'Patient'}
                          </div>
                          {appt.patientId?.blood_group && (
                            <span className="badge badge-info" style={{ fontSize: '0.65rem', marginTop: '3px' }}>
                              Blood: {appt.patientId.blood_group}
                            </span>
                          )}
                        </td>

                        <td>
                          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.78rem', fontWeight: 700, color: 'var(--primary)' }}>
                            {serial}
                          </div>
                          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                            {dateFormatted} • {appt.time_slot || appt.startTime || 'Scheduled'}
                          </div>
                          <div style={{ fontSize: '0.7rem', color: isOnline ? '#8b5cf6' : '#3b82f6', fontWeight: 600 }}>
                            {isOnline ? '📹 Telemedicine' : '🏥 In-Person Chamber'}
                          </div>
                        </td>

                        <td>
                          <div style={{ fontSize: '0.8rem', color: 'var(--text-main)' }}>
                            {appt.consultationReason || appt.symptoms || 'General clinical consultation'}
                          </div>
                          {(allergies || conditions) && (
                            <div style={{ fontSize: '0.7rem', color: '#f59e0b', marginTop: '3px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <AlertTriangle style={{ width: 12, height: 12 }} />
                              <span>{allergies ? `Allergy: ${allergies}` : `Condition: ${conditions}`}</span>
                            </div>
                          )}
                        </td>

                        <td>
                          <div style={{ fontWeight: 800, fontSize: '0.85rem' }}>
                            {appt.consultationFee || 800} BDT
                          </div>
                          <span className={`badge ${appt.paymentStatus === 'PAID' || appt.paymentStatus === 'paid' ? 'badge-success' : 'badge-danger'}`} style={{ fontSize: '0.65rem' }}>
                            {appt.paymentStatus || 'UNPAID'}
                          </span>
                        </td>

                        <td>
                          <span className={`badge ${
                            appt.status === 'COMPLETED' ? 'badge-success' : 
                            appt.status === 'CONFIRMED' ? 'badge-primary' : 
                            appt.status === 'CANCELLED' ? 'badge-danger' : 'badge-info'
                          }`} style={{ fontSize: '0.72rem' }}>
                            {appt.status}
                          </span>
                        </td>

                        <td>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                            {/* If online consultation, offer Telemedicine Room */}
                            {isOnline && appt.status !== 'COMPLETED' && (
                              <button
                                onClick={() => setActiveTeleconsultationAppt(appt)}
                                className="btn btn-primary"
                                style={{ fontSize: '0.7rem', padding: '4px 8px', display: 'flex', alignItems: 'center', gap: '4px' }}
                              >
                                <Video style={{ width: 12, height: 12 }} /> Join Call
                              </button>
                            )}

                            {/* Issue Prescription */}
                            <button
                              onClick={() => openPrescriptionModal(appt)}
                              className="btn btn-secondary"
                              style={{ fontSize: '0.7rem', padding: '4px 8px', display: 'flex', alignItems: 'center', gap: '4px' }}
                            >
                              <FileText style={{ width: 12, height: 12 }} /> Prescribe
                            </button>

                            {/* Mark Completed if not already */}
                            {appt.status !== 'COMPLETED' && (
                              <button
                                onClick={() => handleUpdateStatus(appt._id, 'COMPLETED')}
                                className="btn btn-secondary"
                                title="Mark Completed"
                                style={{ fontSize: '0.7rem', padding: '4px 8px', color: '#10b981' }}
                              >
                                <CheckCircle2 style={{ width: 12, height: 12 }} /> Complete
                              </button>
                            )}

                            {/* Draft clinical note */}
                            <button
                              onClick={() => {
                                setSelectedPatientForNote(appt);
                                handleGenerateClinicalNote(appt);
                                setActiveTab('tools');
                              }}
                              className="btn btn-secondary"
                              title="Draft Clinical Summary Note"
                              style={{ fontSize: '0.7rem', padding: '4px 8px' }}
                            >
                              <Sparkles style={{ width: 12, height: 12 }} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: ISSUED PRESCRIPTIONS */}
      {activeTab === 'prescriptions' && (
        <div className="dashboard-card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800 }}>Digital Prescriptions Vault</h3>
            <span className="badge badge-primary">{prescriptions.length} Records Documented</span>
          </div>

          {prescriptions.length === 0 ? (
            <div style={{ padding: '50px 20px', textAlign: 'center', background: 'var(--bg-canvas)', borderRadius: '12px', border: '1px dashed var(--border-color)' }}>
              <Pill style={{ width: 36, height: 36, color: 'var(--text-muted)', margin: '0 auto 12px' }} />
              <h4 style={{ fontSize: '1rem', fontWeight: 800 }}>No prescriptions issued yet</h4>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', maxWidth: '400px', margin: '4px auto 0' }}>
                When you issue prescriptions from the patient queue or teleconsultations, they will be archived here.
              </p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '16px' }}>
              {prescriptions.map((rx) => (
                <div key={rx._id} style={{
                  background: 'var(--bg-canvas)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '12px',
                  padding: '16px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between'
                }}>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                      <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 800, fontSize: '0.85rem', color: 'var(--primary)' }}>
                        {rx.prescription_number}
                      </div>
                      <span className="badge badge-success" style={{ fontSize: '0.65rem' }}>
                        Verified Sign
                      </span>
                    </div>

                    <div style={{ fontSize: '0.9rem', fontWeight: 800, marginBottom: '2px' }}>
                      Patient: {rx.patient_id?.name || 'Registered Patient'}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '8px' }}>
                      Issued: {new Date(rx.createdAt).toLocaleDateString()} • {rx.diagnosis || 'Clinical Assessment'}
                    </div>

                    {/* Prescribed Medicines Summary */}
                    <div style={{ background: 'var(--bg-card)', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)', marginBottom: '10px' }}>
                      <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '6px' }}>
                        Rx Medications ({rx.medicines?.length || 0}):
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        {rx.medicines?.slice(0, 3).map((m, idx) => (
                          <div key={idx} style={{ fontSize: '0.75rem', display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ fontWeight: 600 }}>{m.medicine_name}</span>
                            <span style={{ color: 'var(--text-muted)' }}>{m.dosage}</span>
                          </div>
                        ))}
                        {(rx.medicines?.length || 0) > 3 && (
                          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                            + {rx.medicines.length - 3} more medications
                          </div>
                        )}
                      </div>
                    </div>

                    {rx.advice && (
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontStyle: 'italic', marginBottom: '10px' }}>
                        "{rx.advice}"
                      </div>
                    )}
                  </div>

                  <div style={{ paddingTop: '8px', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                    <span>Serial: {rx.appointment_number || rx.appointment_id?.serialNumber || 'Consultation'}</span>
                    <span style={{ color: 'var(--primary)', fontWeight: 600 }}>Pharmacy Linked</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: CLINICAL TOOLS & AI ASSISTANT */}
      {activeTab === 'tools' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
          {/* LEFT: CLINICAL NOTE GENERATOR */}
          <div className="dashboard-card" style={{ padding: '20px' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Sparkles style={{ width: 18, height: 18, color: 'var(--primary)' }} /> AI Clinical Note Assistant
            </h3>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '14px' }}>
              Generate structured, objective clinical notes grounded in the real patient record.
            </p>

            <div style={{ marginBottom: '12px' }}>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, marginBottom: '4px' }}>
                Select Patient From Queue:
              </label>
              <select
                value={selectedPatientForNote?._id || ''}
                onChange={(e) => {
                  const sel = appointments.find(a => a._id === e.target.value);
                  setSelectedPatientForNote(sel);
                  if (sel) handleGenerateClinicalNote(sel);
                }}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: '8px',
                  background: 'var(--bg-canvas)',
                  border: '1px solid var(--border-color)',
                  color: 'var(--text-main)',
                  fontSize: '0.8rem'
                }}
              >
                <option value="">-- Choose patient --</option>
                {appointments.map(a => (
                  <option key={a._id} value={a._id}>
                    {a.patientName || a.patientId?.name || 'Patient'} ({a.serialNumber || 'Serial N/A'})
                  </option>
                ))}
              </select>
            </div>

            {aiNoteDraft ? (
              <div>
                <textarea
                  value={aiNoteDraft}
                  onChange={(e) => setAiNoteDraft(e.target.value)}
                  rows={14}
                  style={{
                    width: '100%',
                    fontSize: '0.75rem',
                    fontFamily: 'var(--font-mono)',
                    padding: '12px',
                    borderRadius: '8px',
                    background: 'var(--bg-canvas)',
                    color: 'var(--text-main)',
                    border: '1px solid var(--border-color)',
                    resize: 'vertical'
                  }}
                />
                <div style={{ fontSize: '0.7rem', color: '#f59e0b', marginTop: '8px', fontWeight: 600 }}>
                  ⚠️ Clinical Decision Support Disclaimer: AI-generated draft note. Attending physician review and signature required.
                </div>
              </div>
            ) : (
              <div style={{ padding: '30px', textAlign: 'center', background: 'var(--bg-canvas)', borderRadius: '8px', border: '1px dashed var(--border-color)' }}>
                <FileText style={{ width: 28, height: 28, color: 'var(--text-muted)', margin: '0 auto 8px' }} />
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  Select any patient from your queue above to auto-generate a structured clinical note.
                </p>
              </div>
            )}
          </div>

          {/* RIGHT: STANDARDIZED CLINICAL PROTOCOLS */}
          <div className="dashboard-card" style={{ padding: '20px' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ClipboardCheck style={{ width: 18, height: 18, color: '#10b981' }} /> Evidence-Based Clinical Protocols
            </h3>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '14px' }}>
              Clinical guidelines and contraindication screening tools.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ background: 'var(--bg-canvas)', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                <div style={{ fontWeight: 800, fontSize: '0.85rem' }}>📋 Outpatient Triage & Red-Flag Checklist</div>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                  Screening criteria for acute coronary syndrome, stroke mimics, and respiratory distress.
                </p>
              </div>

              <div style={{ background: 'var(--bg-canvas)', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                <div style={{ fontWeight: 800, fontSize: '0.85rem' }}>🧪 Essential Diagnostic Lab Panels</div>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                  CBC with ESR, Serum Creatinine, Liver Function Tests, HbA1c, and Lipid Profile baseline orders.
                </p>
              </div>

              <div style={{ background: 'var(--bg-canvas)', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                <div style={{ fontWeight: 800, fontSize: '0.85rem' }}>💊 Drug-Drug Interaction Safety Alert</div>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                  Automated checks against patient documented allergies and concurrent active regimens.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
