import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft, Star, CheckCircle2, MapPin, Clock, Phone,
  Building2, Award, BookOpen, Stethoscope, AlertCircle,
  ExternalLink, RefreshCw, BadgeCheck, User
} from 'lucide-react';

const API = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

// ─── Avatar Fallback ──────────────────────────────────────────────────────
function DoctorAvatar({ src, name, size = 100 }) {
  const [failed, setFailed] = useState(false);
  const initials = (name || 'Dr')
    .replace(/^(Prof\.|Dr\.)\s*/i, '')
    .split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase();

  if (!src || failed) {
    return (
      <div style={{
        width: size, height: size, borderRadius: 'var(--radius-lg)',
        background: 'linear-gradient(135deg, var(--primary) 0%, #0ea5e9 100%)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: '#fff', fontSize: size * 0.3, fontWeight: 800,
        fontFamily: 'var(--font-heading)', letterSpacing: '-0.02em', flexShrink: 0
      }}>
        {initials}
      </div>
    );
  }
  return (
    <img src={src} alt={name}
      onError={() => setFailed(true)}
      style={{
        width: size, height: size, borderRadius: 'var(--radius-lg)',
        objectFit: 'cover', flexShrink: 0, background: 'var(--bg-badge)'
      }}
    />
  );
}

// ─── Info Row ─────────────────────────────────────────────────────────────
function InfoRow({ icon: Icon, label, value, color }) {
  if (!value) return null;
  return (
    <div style={{ display: 'flex', gap: 'var(--space-3)', alignItems: 'flex-start', padding: 'var(--space-3) 0', borderBottom: '1px solid var(--border-subtle)' }}>
      <div style={{
        width: 32, height: 32, borderRadius: 'var(--radius-sm)',
        background: color || 'var(--primary-glow)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
      }}>
        <Icon style={{ width: 15, height: 15, color: 'var(--primary)' }} />
      </div>
      <div>
        <p style={{ fontSize: '0.625rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 2 }}>{label}</p>
        <p style={{ fontSize: '0.8rem', color: 'var(--text-primary)', lineHeight: 1.5 }}>{value}</p>
      </div>
    </div>
  );
}

// ─── Chamber Card ─────────────────────────────────────────────────────────
function ChamberCard({ chamber, index }) {
  const mapUrl = chamber.address
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(chamber.address + ', Rajshahi, Bangladesh')}`
    : null;

  return (
    <div style={{
      borderRadius: 'var(--radius-md)', border: '1px solid var(--border-default)',
      background: 'var(--bg-card)', overflow: 'hidden'
    }}>
      {/* Chamber Header */}
      <div style={{
        padding: 'var(--space-4) var(--space-5)',
        background: index === 0 ? 'linear-gradient(135deg, var(--primary-glow), transparent)' : 'var(--bg-badge)',
        borderBottom: '1px solid var(--border-default)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8
      }}>
        <div>
          <h3 style={{ fontSize: '0.875rem', fontWeight: 750, color: 'var(--text-primary)', marginBottom: 2 }}>
            {chamber.name || `Chamber ${index + 1}`}
          </h3>
          {index === 0 && (
            <span style={{
              fontSize: '0.575rem', fontWeight: 700, color: 'var(--primary)',
              background: 'var(--primary-glow)', borderRadius: 'var(--radius-full)', padding: '2px 8px',
              textTransform: 'uppercase', letterSpacing: '0.05em'
            }}>Primary Chamber</span>
          )}
        </div>
        {mapUrl && (
          <a href={mapUrl} target="_blank" rel="noopener noreferrer" style={{
            display: 'flex', alignItems: 'center', gap: 4,
            fontSize: '0.7rem', fontWeight: 700, color: 'var(--primary)',
            background: 'var(--primary-glow)', borderRadius: 'var(--radius-sm)',
            padding: '6px 10px', textDecoration: 'none',
            border: '1px solid var(--border-primary)',
            transition: 'opacity var(--transition-fast)'
          }}>
            <MapPin style={{ width: 12, height: 12 }} /> View Map
            <ExternalLink style={{ width: 10, height: 10, opacity: 0.6 }} />
          </a>
        )}
      </div>

      {/* Chamber Body */}
      <div style={{ padding: 'var(--space-4) var(--space-5)', display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
        {/* Address */}
        {chamber.address && (
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
            <MapPin style={{ width: 14, height: 14, color: 'var(--text-muted)', marginTop: 2, flexShrink: 0 }} />
            <span style={{ fontSize: '0.775rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>{chamber.address}</span>
          </div>
        )}

        {/* Visiting Hours */}
        {chamber.visiting_hours && (
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
            <Clock style={{ width: 14, height: 14, color: 'var(--primary)', marginTop: 2, flexShrink: 0 }} />
            <div>
              <p style={{ fontSize: '0.625rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 2 }}>Visiting Hours</p>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-primary)', fontWeight: 600 }}>{chamber.visiting_hours}</p>
            </div>
          </div>
        )}

        {/* Appointment Numbers */}
        {chamber.appointment_numbers?.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)', marginTop: 4 }}>
            <p style={{ fontSize: '0.625rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Appointment</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-2)' }}>
              {chamber.appointment_numbers.map((num, j) => (
                <a key={j} href={`tel:${num}`} style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  padding: '8px 14px', borderRadius: 'var(--radius-sm)',
                  background: 'rgba(16,185,129,0.08)', border: '1.5px solid rgba(16,185,129,0.3)',
                  color: 'var(--success)', fontSize: '0.8rem', fontWeight: 700, textDecoration: 'none',
                  fontFamily: 'var(--font-sans)', transition: 'background var(--transition-fast)'
                }}>
                  <Phone style={{ width: 13, height: 13 }} />
                  {num}
                </a>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────
export default function DoctorProfile() {
  const { slug } = useParams();
  const [doctor, setDoctor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchDoctor() {
      if (!slug) return;
      setLoading(true); setError(null);
      try {
        const res = await fetch(`${API}/doctors/${slug}`);
        const json = await res.json();
        if (!json.success || !json.data) throw new Error(json.message || 'Doctor not found');
        setDoctor(json.data);
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    }
    fetchDoctor();
  }, [slug]);

  // ── Loading ────────────────────────────────────────────────────────
  if (loading) return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
      <div style={{ height: 20, width: 120, borderRadius: 6, background: 'var(--bg-badge)', animation: 'pulse 1.5s ease-in-out infinite' }} />
      <div className="glass-card" style={{ padding: 'var(--space-6)', display: 'flex', gap: 'var(--space-5)', flexWrap: 'wrap' }}>
        <div style={{ width: 100, height: 100, borderRadius: 'var(--radius-lg)', background: 'var(--bg-badge)', animation: 'pulse 1.5s ease-in-out infinite', flexShrink: 0 }} />
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 12 }}>
          {[200, 150, 120, 180].map((w, i) => (
            <div key={i} style={{ height: 14, width: w, borderRadius: 6, background: 'var(--bg-badge)', animation: 'pulse 1.5s ease-in-out infinite' }} />
          ))}
        </div>
      </div>
    </div>
  );

  // ── Error ──────────────────────────────────────────────────────────
  if (error) return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--space-5)', padding: 'var(--space-10)', textAlign: 'center' }}>
      <AlertCircle style={{ width: 48, height: 48, color: 'var(--danger)' }} />
      <div>
        <p style={{ fontWeight: 800, fontSize: '1.1rem', color: 'var(--text-primary)', marginBottom: 6 }}>Doctor profile not found</p>
        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{error}</p>
      </div>
      <Link to="/doctors" className="btn btn-primary" style={{ fontSize: '0.75rem' }}>
        <ArrowLeft style={{ width: 14, height: 14 }} /> Back to Doctors
      </Link>
    </div>
  );

  if (!doctor) return null;

  const primaryPhone = doctor.chambers?.[0]?.appointment_numbers?.[0];

  // ── Render ────────────────────────────────────────────────────────
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)', maxWidth: 860, margin: '0 auto' }}>

      {/* Back link */}
      <Link to="/doctors" style={{
        display: 'inline-flex', alignItems: 'center', gap: 6,
        fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)',
        textDecoration: 'none', transition: 'color var(--transition-fast)'
      }}>
        <ArrowLeft style={{ width: 14, height: 14 }} /> Back to Doctors
      </Link>

      {/* ── Profile Header ── */}
      <div className="glass-card" style={{ padding: 'var(--space-6)' }}>
        <div style={{ display: 'flex', gap: 'var(--space-5)', flexWrap: 'wrap', alignItems: 'flex-start' }}>
          <DoctorAvatar src={doctor.imageUrl} name={doctor.name} size={100} />

          <div style={{ flex: 1, minWidth: 200 }}>
            {/* Verified Badge */}
            {doctor.verified && (
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: 4,
                background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)',
                borderRadius: 'var(--radius-full)', padding: '3px 10px',
                fontSize: '0.65rem', fontWeight: 700, color: 'var(--success)',
                marginBottom: 8
              }}>
                <CheckCircle2 style={{ width: 11, height: 11 }} /> Verified Doctor
              </div>
            )}

            <h1 style={{ fontSize: 'clamp(1.1rem, 2.5vw, 1.5rem)', fontWeight: 900, fontFamily: 'var(--font-heading)', color: 'var(--text-primary)', marginBottom: 4, letterSpacing: '-0.02em' }}>
              {doctor.name}
            </h1>

            <p style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--primary)', marginBottom: 4 }}>
              {doctor.specialty}
            </p>

            {doctor.designation && (
              <p style={{ fontSize: '0.775rem', color: 'var(--text-secondary)', marginBottom: 4 }}>
                {doctor.designation}
              </p>
            )}

            {doctor.workplace && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 10 }}>
                <Building2 style={{ width: 13, height: 13, color: 'var(--text-muted)' }} />
                <span style={{ fontSize: '0.775rem', color: 'var(--text-secondary)' }}>{doctor.workplace}</span>
              </div>
            )}

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-3)', alignItems: 'center' }}>
              {doctor.rating && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <Star style={{ width: 14, height: 14, fill: '#f59e0b', stroke: '#f59e0b' }} />
                  <span style={{ fontSize: '0.825rem', fontWeight: 800, color: '#f59e0b' }}>{doctor.rating.toFixed(1)}</span>
                  {doctor.reviewCount > 0 && <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>({doctor.reviewCount} reviews)</span>}
                </div>
              )}
              {doctor.experience && (
                <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  <Award style={{ width: 13, height: 13 }} /> {doctor.experience}
                </span>
              )}
            </div>
          </div>

          {/* Quick CTA */}
          {primaryPhone && (
            <a href={`tel:${primaryPhone}`} style={{
              display: 'flex', alignItems: 'center', gap: 6,
              background: 'linear-gradient(135deg, #10b981, #059669)',
              color: '#fff', padding: '10px 18px', borderRadius: 'var(--radius-md)',
              fontSize: '0.8rem', fontWeight: 800, textDecoration: 'none',
              transition: 'opacity var(--transition-fast)', flexShrink: 0
            }}>
              <Phone style={{ width: 15, height: 15 }} /> Call for Appointment
            </a>
          )}
        </div>
      </div>

      {/* ── Professional Information ── */}
      <div className="glass-card" style={{ padding: 'var(--space-6)' }}>
        <h2 style={{ fontSize: '0.875rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: 'var(--space-4)', display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 28, height: 28, borderRadius: 'var(--radius-sm)', background: 'var(--primary-glow)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <User style={{ width: 14, height: 14, color: 'var(--primary)' }} />
          </div>
          Professional Information
        </h2>
        <div>
          <InfoRow icon={BookOpen} label="Qualifications" value={doctor.qualifications} />
          <InfoRow icon={Award} label="Training" value={doctor.training} />
          <InfoRow icon={Stethoscope} label="Designation" value={doctor.designation} />
          <InfoRow icon={Building2} label="Workplace" value={doctor.workplace} />
          <InfoRow icon={Award} label="Experience" value={doctor.experience} />
          {doctor.bmdcRegistration && (
            <InfoRow icon={BadgeCheck} label="BMDC Registration" value={doctor.bmdcRegistration} />
          )}
        </div>
      </div>

      {/* ── Chambers ── */}
      {doctor.chambers?.length > 0 && (
        <div>
          <h2 style={{ fontSize: '0.875rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: 'var(--space-4)', display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 28, height: 28, borderRadius: 'var(--radius-sm)', background: 'rgba(16,185,129,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <MapPin style={{ width: 14, height: 14, color: 'var(--success)' }} />
            </div>
            Chambers & Appointment
            <span style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--text-muted)', background: 'var(--bg-badge)', borderRadius: 'var(--radius-full)', padding: '2px 8px' }}>
              {doctor.chambers.length} location{doctor.chambers.length > 1 ? 's' : ''}
            </span>
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
            {doctor.chambers.map((chamber, i) => (
              <ChamberCard key={i} chamber={chamber} index={i} />
            ))}
          </div>
        </div>
      )}

      {/* ── Source Attribution ── */}
      <div className="glass-card" style={{ padding: 'var(--space-4) var(--space-5)' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, flexWrap: 'wrap' }}>
          <AlertCircle style={{ width: 14, height: 14, color: 'var(--warning)', flexShrink: 0, marginTop: 2 }} />
          <div>
            <p style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 2 }}>
              Source: {doctor.source || 'BDDoctorDirectory'}
              {doctor.lastScraped && ` · Last updated: ${new Date(doctor.lastScraped).toLocaleDateString('en-BD', { year: 'numeric', month: 'long', day: 'numeric' })}`}
            </p>
            <p style={{ fontSize: '0.65rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
              Information sourced from BDDoctorDirectory. Chamber schedules and appointment numbers may change — please confirm before visiting.
              {doctor.profileUrl && (
                <> <a href={doctor.profileUrl} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--primary)' }}>View original profile <ExternalLink style={{ width: 9, height: 9 }} /></a></>
              )}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
