import React, { useState } from 'react';
import { Search, Star, Calendar, Clock, UserCheck, Sparkles, MapPin, Award, Globe } from 'lucide-react';
import { DOCTORS } from '../../data/doctors';
import { SPECIALTIES } from '../../data/specialties';
import AppointmentBookingModal from './AppointmentBookingModal';

export default function DoctorDiscovery({ initialSpecialtyId = null, onBookingComplete }) {
  const [selectedSpecialtyFilter, setSelectedSpecialtyFilter] = useState(initialSpecialtyId || 'all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDoctorForBooking, setSelectedDoctorForBooking] = useState(null);

  const filteredDoctors = DOCTORS.filter(doc => {
    if (selectedSpecialtyFilter !== 'all' && doc.specialtyId !== selectedSpecialtyFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return doc.name.toLowerCase().includes(q) || doc.specialtyName.toLowerCase().includes(q) || doc.bio.toLowerCase().includes(q);
    }
    return true;
  });

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
      {/* Header Card */}
      <div className="glass-card" style={{ padding: 'var(--space-6) var(--space-8)' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 'var(--space-4)', marginBottom: 'var(--space-5)' }}>
          <div className="section-header">
            <h2><div className="section-icon" style={{ background: 'rgba(59,130,246,0.1)', color: 'var(--info)' }}><UserCheck style={{ width: 22, height: 22 }} /></div>
              Specialist Discovery & Booking</h2>
            <p>Browse verified doctors with real-time schedule availability and transparent consultation fees.</p>
          </div>
          <span className="live-pulse" style={{ background: 'rgba(16,185,129,0.1)', color: 'var(--success)' }}>
            <span className="live-pulse-dot" /> Live Schedule
          </span>
        </div>

        {/* Search */}
        <div style={{ position: 'relative', marginBottom: 'var(--space-4)' }}>
          <Search style={{ width: 16, height: 16, color: 'var(--text-muted)', position: 'absolute', left: 14, top: 12 }} />
          <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
            placeholder='Search by name, specialty, or concern (e.g. "kidney specialist tomorrow")...'
            className="input" style={{ paddingLeft: 40, borderRadius: 'var(--radius-md)' }}
          />
        </div>

        {/* Specialty Pills */}
        <div style={{ display: 'flex', gap: 'var(--space-2)', overflowX: 'auto', paddingBottom: 4 }}>
          <button onClick={() => setSelectedSpecialtyFilter('all')}
            className={`specialty-pill ${selectedSpecialtyFilter === 'all' ? 'active' : ''}`}>
            All ({DOCTORS.length})
          </button>
          {SPECIALTIES.map(s => (
            <button key={s.id} onClick={() => setSelectedSpecialtyFilter(s.id)}
              className={`specialty-pill ${selectedSpecialtyFilter === s.id ? 'active' : ''}`}>
              {s.name}
            </button>
          ))}
        </div>
      </div>

      {/* Doctor Cards Grid */}
      <div className="grid-responsive-2">
        {filteredDoctors.map((doc, i) => (
          <div key={doc.id} className="glass-card glass-card-lift" style={{
            padding: 'var(--space-6)',
            display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: 'var(--space-5)',
            animation: `fadeIn 0.3s var(--ease-out) ${i * 0.05}s both`,
          }}>
            {/* Doctor Info Row */}
            <div style={{ display: 'flex', gap: 'var(--space-4)' }}>
              <img src={doc.avatar} alt={doc.name} className="avatar avatar-lg" style={{ borderRadius: 'var(--radius-lg)' }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 2 }}>
                  <h3 style={{ fontSize: '1rem', fontWeight: 750 }}>{doc.name}</h3>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.75rem', fontWeight: 700, color: '#f59e0b' }}>
                    <Star style={{ width: 14, height: 14, fill: '#f59e0b', stroke: '#f59e0b' }} />
                    {doc.rating} <span style={{ fontSize: '0.625rem', fontWeight: 500, color: 'var(--text-muted)' }}>({doc.reviewCount})</span>
                  </div>
                </div>
                <p style={{ fontSize: '0.75rem', fontWeight: 650, color: 'var(--primary)' }}>{doc.title}</p>
                <p style={{ fontSize: '0.625rem', color: 'var(--text-muted)', marginTop: 2 }}>{doc.degrees}</p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-3)', fontSize: '0.625rem', color: 'var(--text-muted)', marginTop: 6 }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                    <MapPin style={{ width: 11, height: 11 }} />{doc.hospital}
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                    <Award style={{ width: 11, height: 11 }} />{doc.experienceYears} years
                  </span>
                </div>
              </div>
            </div>

            {/* Bio */}
            <p style={{
              fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: 1.5,
              padding: 'var(--space-3)', borderRadius: 'var(--radius-sm)',
              background: 'var(--bg-badge)', border: '1px solid var(--border-subtle)',
              display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
            }}>
              {doc.bio}
            </p>

            {/* Availability */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.6875rem' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--text-muted)', fontWeight: 500 }}>
                  <Calendar style={{ width: 13, height: 13, color: 'var(--primary)' }} /> Next Available Slots:
                </span>
                <span className={`badge ${doc.availableToday ? 'badge-success' : 'badge-info'}`} style={{ fontSize: '0.5625rem' }}>
                  {doc.availableToday ? '🟢 Open Today' : '📅 Tomorrow'}
                </span>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-1)' }}>
                {(doc.availableToday ? doc.slotsToday : doc.slotsTomorrow)?.map((slot, j) => (
                  <span key={j} style={{
                    fontSize: '0.625rem', fontFamily: 'var(--font-mono)', fontWeight: 600,
                    padding: '3px 8px', borderRadius: 'var(--radius-xs)',
                    background: 'var(--bg-badge)', border: '1px solid var(--border-subtle)',
                    color: 'var(--text-primary)',
                  }}>
                    {slot}
                  </span>
                ))}
              </div>
            </div>

            {/* Bottom Action */}
            <div style={{
              paddingTop: 'var(--space-4)',
              borderTop: '1px solid var(--border-subtle)',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            }}>
              <div>
                <span style={{ fontSize: '0.5625rem', color: 'var(--text-muted)', display: 'block' }}>Consultation Fee</span>
                <span style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--primary)' }}>{doc.currency}{doc.fee}</span>
              </div>
              <button onClick={() => setSelectedDoctorForBooking(doc)} className="btn btn-primary" style={{ fontSize: '0.75rem', padding: '10px 20px' }}>
                <Clock style={{ width: 14, height: 14 }} /> Book Appointment
              </button>
            </div>
          </div>
        ))}
      </div>

      {selectedDoctorForBooking && (
        <AppointmentBookingModal doctor={selectedDoctorForBooking}
          onClose={() => setSelectedDoctorForBooking(null)}
          onBookingSuccess={(apt) => { setSelectedDoctorForBooking(null); if (onBookingComplete) onBookingComplete(apt); }}
        />
      )}
    </div>
  );
}
