import React, { useState } from 'react';
import { 
  Bell, ChevronRight, User, Star, Calendar, 
  Clock, CheckCircle2, Circle, Heart, Thermometer, 
  Ruler, Scale, Sparkles, ChevronLeft, ArrowRight
} from 'lucide-react';
import { getStoredState, saveStoredState } from '../../data/mockUserStore';
import { DOCTORS } from '../../data/doctors';

export default function PatientDashboard({ setActiveTab, onNavigateToDoctor }) {
  const state = getStoredState();
  const activeMember = state.activeFamilyMember || state.familyMembers[0];
  const myAppointments = state.appointments.filter(a => a.familyMemberId === activeMember.id);
  const myPrescriptions = state.prescriptions.filter(p => p.patientName === activeMember.name);

  // States
  const [activeCalDay, setActiveCalDay] = useState(12); // Default to Wed 12
  const [completedMeds, setCompletedMeds] = useState({});
  const [searchQuery, setSearchQuery] = useState('');

  // Sample static calendar days
  const calendarDays = [
    { label: 'Mon', number: 10 },
    { label: 'Tue', number: 11 },
    { label: 'Wed', number: 12 },
    { label: 'Thu', number: 13 },
    { label: 'Fri', number: 14 },
    { label: 'Sat', number: 15 }
  ];

  // Default mock medications list based on Dribbble shot, merged with active prescriptions if any
  const defaultMeds = [
    { id: 'm1', name: 'Vitamin C', instruction: 'Before a meal every day' },
    { id: 'm2', name: 'Ibuprofen', instruction: 'Before a meal every day' }
  ];

  // Merge with real prescriptions
  const realMeds = [];
  myPrescriptions.forEach(p => {
    p.medicines.forEach((m, idx) => {
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

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // Direct user to Doctor Discovery with pre-filled search
      setActiveTab('doctor-discovery');
    }
  };

  return (
    <div className="dashboard-grid">
      {/* ─── CENTER COLUMN (MAIN STATS & APPOINTMENTS) ─── */}
      <div className="center-content">
        
        {/* Top search & Welcome banner */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>Welcome back,</span>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '2px' }}>
              Hello, {activeMember.name}
            </h1>
          </div>
          
          <form onSubmit={handleSearchSubmit} style={{ width: '100%', maxWidth: '320px', position: 'relative' }}>
            <input 
              type="text" 
              placeholder="Search doctors, clinical specialties..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input"
              style={{
                borderRadius: '12px',
                paddingLeft: '16px',
                background: 'var(--bg-input)',
                border: '1.5px solid var(--border-default)',
                fontSize: '0.75rem'
              }}
            />
          </form>
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

          {/* Smooth SVG Wave Line Chart */}
          <div style={{ position: 'relative', height: '180px', width: '100%' }}>
            <svg viewBox="0 0 500 150" style={{ width: '100%', height: '100%', overflow: 'visible' }}>
              <defs>
                <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#0a5394" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#0a5394" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Grid Lines */}
              <line x1="0" y1="30" x2="500" y2="30" stroke="#f1f5f9" strokeWidth="1" />
              <line x1="0" y1="75" x2="500" y2="75" stroke="#f1f5f9" strokeWidth="1" />
              <line x1="0" y1="120" x2="500" y2="120" stroke="#f1f5f9" strokeWidth="1" />

              {/* Filled Area Gradient */}
              <path 
                d="M 0 120 C 50 70, 100 80, 150 95 C 200 110, 250 40, 300 45 C 350 50, 400 90, 450 75 L 500 80 L 500 150 L 0 150 Z" 
                fill="url(#chartGrad)" 
              />

              {/* Main Line Stroke */}
              <path 
                d="M 0 120 C 50 70, 100 80, 150 95 C 200 110, 250 40, 300 45 C 350 50, 400 90, 450 75 L 500 80" 
                fill="none" 
                stroke="#0a5394" 
                strokeWidth="3.5" 
                strokeLinecap="round"
              />

              {/* Dots on line intersections */}
              <circle cx="150" cy="95" r="5" fill="#ffffff" stroke="#0a5394" strokeWidth="2.5" />
              <circle cx="300" cy="45" r="5" fill="#ffffff" stroke="#0a5394" strokeWidth="2.5" />
              <circle cx="450" cy="75" r="5" fill="#ffffff" stroke="#0a5394" strokeWidth="2.5" />
            </svg>
            
            {/* Days list on bottom */}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px', fontSize: '0.625rem', color: 'var(--text-muted)', padding: '0 4px', fontWeight: 650 }}>
              <span>Mon</span>
              <span>Tue</span>
              <span>Wed</span>
              <span>Thu</span>
              <span>Fri</span>
              <span>Sat</span>
              <span>Sun</span>
            </div>
          </div>
        </div>

        {/* My Appointments list */}
        <div className="dashboard-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 800 }}>My appointments</h3>
            <button onClick={() => setActiveTab('doctor-discovery')} className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: '0.6875rem' }}>
              Find Doctor <ArrowRight style={{ width: 12, height: 12 }} />
            </button>
          </div>

          <div style={{ overflowX: 'auto' }}>
            {myAppointments.length === 0 ? (
              <div style={{ padding: '32px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                No upcoming consultations scheduled. Book doctors in the "Doctors" tab.
              </div>
            ) : (
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Doctor Name</th>
                    <th>Specialist</th>
                    <th>Date</th>
                    <th>Time</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {myAppointments.map((apt) => {
                    // Match doctor profile
                    const docProfile = DOCTORS.find(d => d.id === apt.doctorId) || { avatar: 'https://via.placeholder.com/150' };
                    return (
                      <tr key={apt.id}>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <img 
                              src={docProfile.avatar} 
                              alt={apt.doctorName} 
                              style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover', border: '1px solid var(--border-default)' }} 
                            />
                            <span style={{ fontWeight: 700 }}>{apt.doctorName}</span>
                          </div>
                        </td>
                        <td style={{ color: 'var(--text-secondary)' }}>{apt.specialty}</td>
                        <td style={{ fontWeight: 500 }}>{apt.date}</td>
                        <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem' }}>{apt.time}</td>
                        <td>
                          <span className={`badge ${apt.status === 'Confirmed' ? 'badge-success' : 'badge-warning'}`}>
                            {apt.status}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>

      </div>

      {/* ─── RIGHT COLUMN (PROFILE, METRICS, CALENDAR) ─── */}
      <div className="right-sidebar">
        
        {/* Top Header Profile badge */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <button style={{ padding: '8px', border: '1.5px solid var(--border-default)', background: 'white', borderRadius: '50%', cursor: 'pointer', color: 'var(--text-secondary)' }}>
            <Bell style={{ width: 16, height: 16 }} />
          </button>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ textAlign: 'right' }}>
              <span style={{ fontSize: '0.8125rem', fontWeight: 800, display: 'block', color: 'var(--text-primary)' }}>{activeMember.name}</span>
              <span style={{ fontSize: '0.625rem', color: 'var(--text-muted)' }}>{activeMember.age} years • {activeMember.relation}</span>
            </div>
            <img 
              src={activeMember.avatar || 'https://via.placeholder.com/150'} 
              alt={activeMember.name} 
              style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover', border: '2px solid white', boxShadow: 'var(--shadow-sm)' }} 
            />
          </div>
        </div>

        {/* 2x2 Metrics Grid */}
        <div className="metrics-grid">
          
          {/* Heart rate */}
          <div className="metric-card">
            <div className="metric-card-header">
              <Heart style={{ width: 16, height: 16, color: '#ef4444' }} />
              <span style={{ fontSize: '0.5625rem', fontWeight: 650 }}>Live</span>
            </div>
            <div>
              <span className="metric-card-value">114 bpm</span>
              <p className="metric-card-label">Heart rate</p>
            </div>
            {/* Heartbeat pulse wave mini SVG */}
            <svg viewBox="0 0 100 30" style={{ width: '100%', height: '24px' }}>
              <path d="M0,15 L30,15 L35,5 L40,25 L45,15 L100,15" fill="none" stroke="#ef4444" strokeWidth="2.5" />
            </svg>
          </div>

          {/* Temperature */}
          <div className="metric-card">
            <div className="metric-card-header">
              <Thermometer style={{ width: 16, height: 16, color: '#0ea5e9' }} />
              <span style={{ fontSize: '0.5625rem', color: 'var(--text-muted)' }}>Normal</span>
            </div>
            <div>
              <span className="metric-card-value">36 C</span>
              <p className="metric-card-label">Temperature</p>
            </div>
            {/* Temperature wave SVG */}
            <svg viewBox="0 0 100 30" style={{ width: '100%', height: '24px' }}>
              <path d="M0,15 Q25,5 50,15 T100,15" fill="none" stroke="#0ea5e9" strokeWidth="2" />
            </svg>
          </div>

          {/* Height */}
          <div className="metric-card">
            <div className="metric-card-header">
              <Ruler style={{ width: 16, height: 16, color: '#8b5cf6' }} />
            </div>
            <div>
              <span className="metric-card-value">158 cm</span>
              <p className="metric-card-label">Height</p>
            </div>
            {/* Height bars SVG */}
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: '6px', height: '24px', paddingLeft: '4px' }}>
              <div style={{ width: '5px', height: '60%', background: '#8b5cf6', borderRadius: '2px' }} />
              <div style={{ width: '5px', height: '100%', background: '#0a5394', borderRadius: '2px' }} />
              <div style={{ width: '5px', height: '75%', background: '#10b981', borderRadius: '2px' }} />
            </div>
          </div>

          {/* Weight */}
          <div className="metric-card">
            <div className="metric-card-header">
              <Scale style={{ width: 16, height: 16, color: '#f59e0b' }} />
            </div>
            <div>
              <span className="metric-card-value">58.0 Kg</span>
              <p className="metric-card-label">Weight</p>
            </div>
            {/* Weight indicators slider SVG */}
            <svg viewBox="0 0 100 30" style={{ width: '100%', height: '24px' }}>
              <line x1="10" y1="15" x2="90" y2="15" stroke="var(--border-default)" strokeWidth="4" strokeLinecap="round" />
              <circle cx="58" cy="15" r="5" fill="#f59e0b" />
            </svg>
          </div>
        </div>

        {/* Treatment calendar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontSize: '0.875rem', fontWeight: 800 }}>Treatment calendar</h3>
            <div style={{ display: 'flex', gap: '4px' }}>
              <button style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: 'var(--text-muted)' }}><ChevronLeft style={{ width: 16, height: 16 }} /></button>
              <button style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: 'var(--text-muted)' }}><ChevronRight style={{ width: 16, height: 16 }} /></button>
            </div>
          </div>

          {/* Calendar row strip */}
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

          {/* Active prescription medications checklist */}
          <div style={{ marginTop: '8px' }}>
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
