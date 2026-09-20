import React, { useState } from 'react';
import { 
  Bell, ChevronRight, User, Star, Calendar, 
  Clock, CheckCircle2, Circle, Heart, Thermometer, 
  Ruler, Scale, Sparkles, ChevronLeft, ArrowRight,
  Building2, Pill, Stethoscope, FileText, Phone, MapPin,
  CreditCard, ShieldCheck, Tag
} from 'lucide-react';
import { getStoredState, saveStoredState } from '../../data/mockUserStore';
import { DOCTORS } from '../../data/doctors';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';

export default function PatientDashboard({ initialTab = 'appointments', setActiveTab, onNavigateToDoctor }) {
  const { user } = useAuth();
  const state = getStoredState();

  const activeMember = state.activeFamilyMember || state.familyMembers[0];
  const patientDisplayName = user?.name || activeMember.name;
  const patientPhone = user?.phone || '01711223344';
  const patientEmail = user?.email || 'patient@niramoy.health';

  const myAppointments = state.appointments || [];
  const myHospitalBookings = state.hospitalBookings || [];
  const myPharmacyOrders = state.pharmacyOrders || [];
  const myPrescriptions = state.prescriptions || [];

  // Service History Tab: 'appointments' | 'beds' | 'pharmacy' | 'prescriptions'
  const [historyTab, setHistoryTab] = useState(initialTab);

  React.useEffect(() => {
    if (initialTab) setHistoryTab(initialTab);
  }, [initialTab]);

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

        {/* Quick Service Summary Counters */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '10px' }}>
          {[
            { label: 'Doctor Visits', count: myAppointments.length, color: 'var(--primary)', icon: Stethoscope },
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
                🩺 Doctors ({myAppointments.length})
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
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {myAppointments.length === 0 ? (
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
                myAppointments.map((apt) => {
                  const docProfile = DOCTORS.find(d => d.id === apt.doctorId) || { avatar: apt.doctorAvatar || 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=200&q=80' };
                  return (
                    <div 
                      key={apt.id} 
                      style={{ 
                        padding: '14px 16px', borderRadius: '12px', background: 'var(--bg-card)', 
                        border: '1.5px solid var(--border-default)', display: 'flex', justifyContent: 'space-between', 
                        alignItems: 'center', flexWrap: 'wrap', gap: '12px' 
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                        <img 
                          src={docProfile.avatar || apt.doctorAvatar} 
                          alt={apt.doctorName} 
                          style={{ width: '44px', height: '44px', borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--primary)' }} 
                        />
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ fontSize: '0.92rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                              {apt.doctorName}
                            </span>
                            <span style={{ fontSize: '0.68rem', fontWeight: 700, padding: '2px 8px', borderRadius: '99px', background: 'rgba(13,124,110,0.1)', color: 'var(--primary)' }}>
                              {apt.specialty}
                            </span>
                          </div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '3px' }}>
                            📅 {apt.date} at {apt.time} • Facility: {apt.hospital || 'Rajshahi Chamber'}
                          </div>
                          <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                            Patient: <strong>{apt.patientName}</strong> • Txn: <span style={{ fontFamily: 'monospace' }}>{apt.paymentTxnId}</span>
                          </div>
                        </div>
                      </div>

                      <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
                        <span style={{ fontSize: '1rem', fontWeight: 900, color: 'var(--primary)' }}>
                          {apt.currency || '৳'}{apt.fee}
                        </span>
                        <span style={{ 
                          fontSize: '0.68rem', fontWeight: 800, padding: '3px 10px', borderRadius: '6px',
                          background: apt.status === 'Confirmed' ? 'rgba(34,197,94,0.15)' : 'rgba(245,158,11,0.15)',
                          color: apt.status === 'Confirmed' ? '#16a34a' : '#d97706'
                        }}>
                          {apt.status || 'Confirmed'}
                        </span>
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
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <div>
                        <span style={{ fontSize: '0.92rem', fontWeight: 800, color: 'var(--text-primary)' }}>{rx.doctorName}</span>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Date: {rx.date} • Prescription #{rx.id}</div>
                      </div>
                      <span style={{ fontSize: '0.72rem', fontWeight: 800, padding: '3px 10px', borderRadius: '6px', background: 'rgba(13,124,110,0.1)', color: 'var(--primary)' }}>
                        Diagnosis: {rx.diagnosis}
                      </span>
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

        {/* Health Statistics Wave Chart Card */}
        <div className="dashboard-card" style={{ position: 'relative' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <div>
              <h3 style={{ fontSize: '1rem', fontWeight: 800 }}>Statistics of your health</h3>
              <p style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>Overall wellness score based on weekly reports</p>
            </div>
            <select className="input" style={{ width: 'auto', padding: '4px 10px', fontSize: '0.6875rem', fontWeight: 700, borderRadius: '8px' }}>
              <option>Show by Week</option>
              <option>Show by Month</option>
            </select>
          </div>

          <div style={{ position: 'relative', height: '160px', width: '100%' }}>
            <svg viewBox="0 0 500 150" style={{ width: '100%', height: '100%', overflow: 'visible' }}>
              <defs>
                <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#0d7c6e" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#0d7c6e" stopOpacity="0.0" />
                </linearGradient>
              </defs>
              <line x1="0" y1="30" x2="500" y2="30" stroke="#f1f5f9" strokeWidth="1" />
              <line x1="0" y1="75" x2="500" y2="75" stroke="#f1f5f9" strokeWidth="1" />
              <line x1="0" y1="120" x2="500" y2="120" stroke="#f1f5f9" strokeWidth="1" />
              <path 
                d="M 0 120 C 50 70, 100 80, 150 95 C 200 110, 250 40, 300 45 C 350 50, 400 90, 450 75 L 500 80 L 500 150 L 0 150 Z" 
                fill="url(#chartGrad)" 
              />
              <path 
                d="M 0 120 C 50 70, 100 80, 150 95 C 200 110, 250 40, 300 45 C 350 50, 400 90, 450 75 L 500 80" 
                fill="none" 
                stroke="#0d7c6e" 
                strokeWidth="3.5" 
                strokeLinecap="round" 
              />
              <circle cx="150" cy="95" r="5" fill="#ffffff" stroke="#0d7c6e" strokeWidth="2.5" />
              <circle cx="300" cy="45" r="5" fill="#ffffff" stroke="#0d7c6e" strokeWidth="2.5" />
              <circle cx="450" cy="75" r="5" fill="#ffffff" stroke="#0d7c6e" strokeWidth="2.5" />
            </svg>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px', fontSize: '0.625rem', color: 'var(--text-muted)', padding: '0 4px', fontWeight: 650 }}>
              <span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span>
            </div>
          </div>
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
    </div>
  );
}
