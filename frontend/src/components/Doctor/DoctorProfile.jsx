import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft, Star, CheckCircle2, MapPin, Clock, Phone,
  Building2, Award, BookOpen, Stethoscope, AlertCircle,
  ExternalLink, BadgeCheck, User, Share2, Copy, Check,
  Calendar, ShieldCheck, HeartPulse, Info
} from 'lucide-react';

const API = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

// ─── Fee Helper ───────────────────────────────────────────────────────────
function getConsultationFee(doctor) {
  if (!doctor) return 600;
  if (doctor.consultation_fee) return doctor.consultation_fee;
  const des = (doctor.designation || '').toLowerCase();
  const qual = (doctor.qualifications || '').toLowerCase();
  if (des.includes('professor') || des.includes('head')) return 1000;
  if (des.includes('associate professor') || qual.includes('fcps') || qual.includes('ms') || qual.includes('md')) return 800;
  if (des.includes('assistant professor') || des.includes('consultant')) return 700;
  return 600;
}

// ─── Avatar Fallback ──────────────────────────────────────────────────────
function DoctorAvatar({ src, name, size = 110 }) {
  const [failed, setFailed] = useState(false);
  const initials = (name || 'Dr')
    .replace(/^(Prof\.|Dr\.)\s*/i, '')
    .split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase();

  if (!src || failed) {
    return (
      <div style={{
        width: size, height: size, borderRadius: 'var(--radius-xl)',
        background: 'linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-dark) 100%)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: '#fff', fontSize: size * 0.32, fontWeight: 800,
        fontFamily: 'var(--font-heading)', letterSpacing: '-0.02em', flexShrink: 0,
        boxShadow: '0 8px 24px rgba(13, 124, 110, 0.25)', border: '3px solid #fff'
      }}>
        {initials}
      </div>
    );
  }
  return (
    <img
      src={src}
      alt={name}
      loading="lazy"
      referrerPolicy="no-referrer"
      onError={() => setFailed(true)}
      style={{
        width: size, height: size, borderRadius: 'var(--radius-xl)',
        objectFit: 'cover', flexShrink: 0, background: 'var(--color-primary-50)',
        border: '3px solid #fff', boxShadow: '0 8px 24px rgba(0,0,0,0.08)'
      }}
    />
  );
}

// ─── Chamber Sub-Card ─────────────────────────────────────────────────────
function ChamberCard({ chamber, index }) {
  const mapUrl = chamber.address
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(chamber.address + ', Rajshahi, Bangladesh')}`
    : null;

  return (
    <div style={{
      borderRadius: 'var(--radius-lg)',
      border: index === 0 ? '1.5px solid var(--color-primary)' : '1.5px solid var(--color-border)',
      background: '#fff',
      overflow: 'hidden',
      boxShadow: index === 0 ? '0 4px 20px rgba(13, 124, 110, 0.08)' : 'var(--shadow-xs)',
      transition: 'transform var(--duration-fast) var(--ease), box-shadow var(--duration-fast) var(--ease)'
    }}>
      {/* Chamber Header */}
      <div style={{
        padding: '14px 18px',
        background: index === 0 ? 'linear-gradient(135deg, var(--color-primary-50), #fff)' : 'var(--color-bg)',
        borderBottom: '1px solid var(--color-border)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 32, height: 32, borderRadius: 8,
            background: index === 0 ? 'var(--color-primary)' : 'var(--color-border)',
            color: index === 0 ? '#fff' : 'var(--color-text-secondary)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
          }}>
            <MapPin style={{ width: 16, height: 16 }} />
          </div>
          <div>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--color-text)', marginBottom: 2 }}>
              {chamber.name || `Chamber ${index + 1}`}
            </h4>
            {index === 0 && (
              <span style={{
                fontSize: '0.625rem', fontWeight: 800, color: 'var(--color-primary)',
                background: 'rgba(13, 124, 110, 0.1)', borderRadius: '99px', padding: '2px 8px',
                textTransform: 'uppercase', letterSpacing: '0.04em'
              }}>Primary Chamber</span>
            )}
          </div>
        </div>

        {mapUrl && (
          <a
            href={mapUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 5,
              fontSize: '0.72rem', fontWeight: 700, color: 'var(--color-primary)',
              background: '#fff', borderRadius: 'var(--radius-md)',
              padding: '6px 12px', textDecoration: 'none',
              border: '1px solid var(--color-border)',
              boxShadow: 'var(--shadow-xs)'
            }}
          >
            <MapPin style={{ width: 12, height: 12 }} /> View on Map
            <ExternalLink style={{ width: 11, height: 11, opacity: 0.7 }} />
          </a>
        )}
      </div>

      {/* Chamber Details */}
      <div style={{ padding: '18px', display: 'flex', flexDirection: 'column', gap: 14 }}>
        {/* Address */}
        {chamber.address && (
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
            <MapPin style={{ width: 15, height: 15, color: 'var(--color-text-muted)', marginTop: 2, flexShrink: 0 }} />
            <div>
              <div style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>Chamber Location</div>
              <div style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', lineHeight: 1.5, marginTop: 2 }}>
                {chamber.address}
              </div>
            </div>
          </div>
        )}

        {/* Visiting Hours */}
        {chamber.visiting_hours && (
          <div style={{
            display: 'flex', alignItems: 'flex-start', gap: 10,
            padding: '12px 14px', borderRadius: 'var(--radius-md)',
            background: 'var(--color-primary-50)', border: '1px solid rgba(13, 124, 110, 0.12)'
          }}>
            <Clock style={{ width: 16, height: 16, color: 'var(--color-primary)', marginTop: 2, flexShrink: 0 }} />
            <div>
              <div style={{ fontSize: '0.68rem', fontWeight: 800, color: 'var(--color-primary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Visiting Hours & Schedule</div>
              <div style={{ fontSize: '0.88rem', color: 'var(--color-text)', fontWeight: 700, marginTop: 2 }}>
                {chamber.visiting_hours}
              </div>
            </div>
          </div>
        )}

        {/* Appointment Numbers */}
        {chamber.appointment_numbers?.length > 0 && (
          <div>
            <div style={{ fontSize: '0.68rem', fontWeight: 800, color: 'var(--color-text-muted)', textTransform: 'uppercase', marginBottom: 8 }}>
              Appointment Numbers (Click to Call)
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {chamber.appointment_numbers.map((num, j) => (
                <a
                  key={j}
                  href={`tel:${num}`}
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: 8,
                    padding: '9px 16px', borderRadius: 'var(--radius-md)',
                    background: '#f0fdf4', border: '1.5px solid #86efac',
                    color: '#15803d', fontSize: '0.85rem', fontWeight: 700,
                    textDecoration: 'none', transition: 'all var(--duration-fast) var(--ease)'
                  }}
                >
                  <Phone style={{ width: 14, height: 14, color: '#16a34a' }} />
                  <span>{num}</span>
                </a>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Main DoctorProfile Component ──────────────────────────────────────────
export default function DoctorProfile() {
  const { slug } = useParams();
  const [doctor, setDoctor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    async function fetchDoctor() {
      if (!slug) return;
      setLoading(true);
      setError(null);
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

  const handleShare = () => {
    navigator.clipboard?.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // ── Loading Skeleton ───────────────────────────────────────────────
  if (loading) {
    return (
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: 'var(--sp-6) var(--sp-4)', display: 'flex', flexDirection: 'column', gap: 20 }}>
        <div style={{ height: 36, width: 220, borderRadius: 8, background: 'var(--color-border)', animation: 'pulse 1.5s ease-in-out infinite' }} />
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 340px', gap: 24 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div style={{ height: 260, borderRadius: 'var(--radius-xl)', background: '#fff', border: '1px solid var(--color-border)', padding: 24, animation: 'pulse 1.5s ease-in-out infinite' }} />
            <div style={{ height: 180, borderRadius: 'var(--radius-xl)', background: '#fff', border: '1px solid var(--color-border)', padding: 24, animation: 'pulse 1.5s ease-in-out infinite' }} />
          </div>
          <div style={{ height: 320, borderRadius: 'var(--radius-xl)', background: '#fff', border: '1px solid var(--color-border)', animation: 'pulse 1.5s ease-in-out infinite' }} />
        </div>
      </div>
    );
  }

  // ── Error State ───────────────────────────────────────────────────
  if (error || !doctor) {
    return (
      <div style={{ maxWidth: 600, margin: '60px auto', padding: 40, textAlign: 'center', background: '#fff', borderRadius: 'var(--radius-xl)', border: '1.5px solid var(--color-border)', boxShadow: 'var(--shadow-md)' }}>
        <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'var(--color-error-bg)', color: 'var(--color-error)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
          <AlertCircle style={{ width: 32, height: 32 }} />
        </div>
        <h2 style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--color-text)', marginBottom: 8 }}>Doctor Profile Not Found</h2>
        <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--text-sm)', marginBottom: 24 }}>
          {error || "We couldn't retrieve the requested doctor profile. It may have been moved or removed."}
        </p>
        <Link to="/doctors" className="btn btn-primary">
          <ArrowLeft style={{ width: 16, height: 16 }} /> Back to Doctors Directory
        </Link>
      </div>
    );
  }

  const primaryPhone = doctor.chambers?.[0]?.appointment_numbers?.[0];
  const qualificationsList = doctor.qualifications
    ? doctor.qualifications.split(/[,;]+/).map(q => q.trim()).filter(Boolean)
    : [];

  return (
    <div style={{ maxWidth: 1140, margin: '0 auto', padding: 'var(--sp-6) var(--sp-4)', display: 'flex', flexDirection: 'column', gap: 20 }}>

      {/* ── Top Bar / Breadcrumb Card ── */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12,
        padding: '12px 18px', background: '#fff', borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-xs)'
      }}>
        <Link
          to="/doctors"
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            fontSize: 'var(--text-sm)', fontWeight: 700, color: 'var(--color-primary)',
            textDecoration: 'none'
          }}
        >
          <ArrowLeft style={{ width: 16, height: 16 }} />
          <span>All Rajshahi Doctors</span>
        </Link>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', display: 'none', md: 'inline' }}>
            ID: {doctor._id?.slice(-6)}
          </span>
          <button
            onClick={handleShare}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              padding: '6px 12px', borderRadius: 'var(--radius-md)',
              border: '1px solid var(--color-border)', background: 'var(--color-bg)',
              fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--color-text-secondary)',
              cursor: 'pointer', transition: 'all var(--duration-fast)'
            }}
          >
            {copied ? <Check style={{ width: 13, height: 13, color: 'var(--color-success)' }} /> : <Share2 style={{ width: 13, height: 13 }} />}
            {copied ? 'Link Copied!' : 'Share Profile'}
          </button>
        </div>
      </div>

      {/* ── MAIN CARD SYSTEM GRID ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(300px, 340px)', gap: 24, alignItems: 'start' }} className="doctor-profile-grid">

        {/* ═════════ LEFT COLUMN: COMPREHENSIVE MEDICAL CARDS ═════════ */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

          {/* ── CARD 1: PRIMARY IDENTITY & SPECIALIZATION HERO CARD ── */}
          <div style={{
            background: '#fff', borderRadius: 'var(--radius-xl)',
            border: '1.5px solid var(--color-border)', padding: '28px',
            boxShadow: 'var(--shadow-sm)', position: 'relative', overflow: 'hidden'
          }}>
            {/* Top specialized field banner */}
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              gap: 8, flexWrap: 'wrap', marginBottom: 20, paddingBottom: 16,
              borderBottom: '1px solid var(--color-border-light)'
            }}>
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                padding: '6px 14px', borderRadius: '99px',
                background: 'var(--color-primary-50)', color: 'var(--color-primary)',
                border: '1.5px solid var(--color-primary-100)',
                fontSize: '0.8rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em'
              }}>
                <Stethoscope style={{ width: 15, height: 15 }} />
                <span>Specialized Field: {doctor.specialty}</span>
              </div>

              {doctor.verified && (
                <div style={{
                  display: 'inline-flex', alignItems: 'center', gap: 5,
                  padding: '5px 12px', borderRadius: '99px',
                  background: 'var(--color-success-bg)', color: 'var(--color-success)',
                  border: '1px solid rgba(22, 163, 74, 0.25)',
                  fontSize: '0.75rem', fontWeight: 700
                }}>
                  <CheckCircle2 style={{ width: 14, height: 14 }} /> Verified Practitioner
                </div>
              )}
            </div>

            {/* Doctor Identity Header */}
            <div style={{ display: 'flex', gap: 22, alignItems: 'flex-start', flexWrap: 'wrap' }}>
              <DoctorAvatar src={doctor.imageUrl} name={doctor.name} size={110} />

              <div style={{ flex: 1, minWidth: 220 }}>
                <h1 style={{
                  fontSize: 'clamp(1.3rem, 2.8vw, 1.8rem)', fontWeight: 900,
                  fontFamily: 'var(--font-heading)', color: 'var(--color-text)',
                  marginBottom: 6, letterSpacing: '-0.025em', lineHeight: 1.2
                }}>
                  {doctor.name}
                </h1>

                {/* Primary Specialty title */}
                <div style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--color-primary)', marginBottom: 6 }}>
                  {doctor.specialty}
                </div>

                {/* Designation */}
                {doctor.designation && (
                  <div style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', fontWeight: 600, marginBottom: 6 }}>
                    {doctor.designation}
                  </div>
                )}

                {/* Workplace */}
                {doctor.workplace && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--color-text-secondary)', fontSize: '0.82rem', marginBottom: 14 }}>
                    <Building2 style={{ width: 14, height: 14, color: 'var(--color-primary)', flexShrink: 0 }} />
                    <span>{doctor.workplace}</span>
                  </div>
                )}

                {/* Badges / Rating / Experience Row */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, alignItems: 'center' }}>
                  {doctor.rating > 0 && (
                    <div style={{
                      display: 'inline-flex', alignItems: 'center', gap: 5,
                      padding: '4px 10px', borderRadius: 'var(--radius-md)',
                      background: 'var(--color-warning-bg)', border: '1px solid rgba(217, 119, 6, 0.25)',
                      color: '#b45309', fontSize: '0.8rem', fontWeight: 800
                    }}>
                      <Star style={{ width: 14, height: 14, fill: '#f59e0b', stroke: '#f59e0b' }} />
                      <span>{doctor.rating.toFixed(1)}</span>
                      {doctor.reviewCount > 0 && (
                        <span style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', fontWeight: 500 }}>
                          ({doctor.reviewCount} reviews)
                        </span>
                      )}
                    </div>
                  )}

                  {doctor.experience && (
                    <div style={{
                      display: 'inline-flex', alignItems: 'center', gap: 5,
                      padding: '4px 10px', borderRadius: 'var(--radius-md)',
                      background: 'var(--color-bg)', border: '1px solid var(--color-border)',
                      color: 'var(--color-text-secondary)', fontSize: '0.8rem', fontWeight: 600
                    }}>
                      <Award style={{ width: 14, height: 14, color: 'var(--color-primary)' }} />
                      <span>{doctor.experience}</span>
                    </div>
                  )}

                  {doctor.bmdcRegistration && (
                    <div style={{
                      display: 'inline-flex', alignItems: 'center', gap: 5,
                      padding: '4px 10px', borderRadius: 'var(--radius-md)',
                      background: 'var(--color-primary-50)', border: '1px solid var(--color-primary-100)',
                      color: 'var(--color-primary)', fontSize: '0.8rem', fontWeight: 700
                    }}>
                      <BadgeCheck style={{ width: 14, height: 14 }} />
                      <span>BMDC: {doctor.bmdcRegistration}</span>
                    </div>
                  )}

                  <div style={{
                    display: 'inline-flex', alignItems: 'center', gap: 5,
                    padding: '4px 10px', borderRadius: 'var(--radius-md)',
                    background: '#f0fdf4', border: '1.5px solid #86efac',
                    color: '#15803d', fontSize: '0.8rem', fontWeight: 800
                  }}>
                    <span>Fee: ৳{getConsultationFee(doctor)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ── CARD 2: SPECIALIZATION & CLINICAL EXPERTISE CARD ── */}
          <div style={{
            background: '#fff', borderRadius: 'var(--radius-xl)',
            border: '1.5px solid var(--color-border)', padding: '24px',
            boxShadow: 'var(--shadow-xs)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18, paddingBottom: 12, borderBottom: '1px solid var(--color-border-light)' }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: 'var(--color-primary-50)', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Stethoscope style={{ width: 18, height: 18 }} />
              </div>
              <div>
                <h3 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--color-text)', marginBottom: 2 }}>
                  Specialization & Medical Focus
                </h3>
                <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                  Primary clinical domain and healthcare services
                </p>
              </div>
            </div>

            <div style={{
              display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 14
            }}>
              {/* Primary Specialty Block */}
              <div style={{
                padding: '16px', borderRadius: 'var(--radius-lg)',
                background: 'var(--color-primary-50)', border: '1px solid rgba(13, 124, 110, 0.15)'
              }}>
                <div style={{ fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--color-primary)', letterSpacing: '0.04em' }}>
                  Primary Specialized Field
                </div>
                <div style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--color-text)', marginTop: 4 }}>
                  {doctor.specialty}
                </div>
                <p style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', marginTop: 6, lineHeight: 1.5 }}>
                  Providing specialized patient consultations, expert diagnosis, and tailored treatment plans in Rajshahi.
                </p>
              </div>

              {/* BMDC & Credentials Block */}
              <div style={{
                padding: '16px', borderRadius: 'var(--radius-lg)',
                background: 'var(--color-bg)', border: '1px solid var(--color-border)'
              }}>
                <div style={{ fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--color-text-muted)', letterSpacing: '0.04em' }}>
                  Professional Registration
                </div>
                <div style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--color-text)', marginTop: 4, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <BadgeCheck style={{ width: 18, height: 18, color: 'var(--color-primary)' }} />
                  {doctor.bmdcRegistration ? `BMDC #${doctor.bmdcRegistration}` : 'Verified Clinical Practitioner'}
                </div>
                <p style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', marginTop: 6, lineHeight: 1.5 }}>
                  Registered with Bangladesh Medical & Dental Council (BMDC) with active practicing license.
                </p>
              </div>
            </div>
          </div>

          {/* ── CARD 3: ACADEMIC QUALIFICATIONS & TRAINING CARD ── */}
          <div style={{
            background: '#fff', borderRadius: 'var(--radius-xl)',
            border: '1.5px solid var(--color-border)', padding: '24px',
            boxShadow: 'var(--shadow-xs)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18, paddingBottom: 12, borderBottom: '1px solid var(--color-border-light)' }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: 'var(--color-primary-50)', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <BookOpen style={{ width: 18, height: 18 }} />
              </div>
              <div>
                <h3 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--color-text)', marginBottom: 2 }}>
                  Qualifications & Training
                </h3>
                <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                  Degrees, higher medical training, and clinical fellowships
                </p>
              </div>
            </div>

            {/* Degrees Chips */}
            {qualificationsList.length > 0 && (
              <div style={{ marginBottom: 18 }}>
                <div style={{ fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--color-text-muted)', marginBottom: 8, letterSpacing: '0.04em' }}>
                  Degrees & Credentials
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {qualificationsList.map((degree, idx) => (
                    <span
                      key={idx}
                      style={{
                        display: 'inline-flex', alignItems: 'center', gap: 6,
                        padding: '6px 14px', borderRadius: 'var(--radius-md)',
                        background: '#f8fafb', border: '1.5px solid var(--color-border)',
                        color: 'var(--color-text)', fontSize: '0.85rem', fontWeight: 700
                      }}
                    >
                      <CheckCircle2 style={{ width: 13, height: 13, color: 'var(--color-primary)' }} />
                      {degree}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Advanced Training */}
            {doctor.training && (
              <div style={{
                padding: '14px 16px', borderRadius: 'var(--radius-lg)',
                background: 'var(--color-bg)', border: '1px solid var(--color-border)',
                marginBottom: 12
              }}>
                <div style={{ fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--color-text-muted)', marginBottom: 4 }}>
                  Specialized Clinical Training
                </div>
                <div style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--color-text)', lineHeight: 1.5 }}>
                  {doctor.training}
                </div>
              </div>
            )}

            {/* Workplace & Affiliation info */}
            {doctor.workplace && (
              <div style={{
                padding: '14px 16px', borderRadius: 'var(--radius-lg)',
                background: 'var(--color-primary-50)', border: '1px solid rgba(13, 124, 110, 0.12)',
                display: 'flex', alignItems: 'center', gap: 12
              }}>
                <Building2 style={{ width: 20, height: 20, color: 'var(--color-primary)', flexShrink: 0 }} />
                <div>
                  <div style={{ fontSize: '0.68rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--color-primary)' }}>
                    Current Workplace / Hospital
                  </div>
                  <div style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--color-text)', marginTop: 2 }}>
                    {doctor.workplace}
                  </div>
                  {doctor.designation && (
                    <div style={{ fontSize: '0.78rem', color: 'var(--color-text-secondary)', marginTop: 2 }}>
                      {doctor.designation}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* ── CARD 4: CHAMBERS & VISITING SCHEDULE CARD SYSTEM ── */}
          <div style={{
            background: '#fff', borderRadius: 'var(--radius-xl)',
            border: '1.5px solid var(--color-border)', padding: '24px',
            boxShadow: 'var(--shadow-xs)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, marginBottom: 18, paddingBottom: 12, borderBottom: '1px solid var(--color-border-light)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: 'var(--color-primary-50)', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <MapPin style={{ width: 18, height: 18 }} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--color-text)', marginBottom: 2 }}>
                    Chambers & Visiting Schedules
                  </h3>
                  <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                    Visiting hours and contact numbers for direct appointments
                  </p>
                </div>
              </div>

              {doctor.chambers?.length > 0 && (
                <span style={{
                  fontSize: '0.72rem', fontWeight: 800, color: 'var(--color-primary)',
                  background: 'var(--color-primary-50)', border: '1px solid var(--color-primary-100)',
                  borderRadius: '99px', padding: '4px 10px'
                }}>
                  {doctor.chambers.length} Chamber{doctor.chambers.length > 1 ? 's' : ''} in Rajshahi
                </span>
              )}
            </div>

            {doctor.chambers?.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {doctor.chambers.map((ch, i) => (
                  <ChamberCard key={i} chamber={ch} index={i} />
                ))}
              </div>
            ) : (
              <div style={{ padding: '24px', textAlign: 'center', background: 'var(--color-bg)', borderRadius: 'var(--radius-lg)' }}>
                <Info style={{ width: 24, height: 24, color: 'var(--color-text-muted)', margin: '0 auto 8px' }} />
                <p style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>
                  Chamber visiting schedule not listed online. Please consult hospital directly at {doctor.workplace || 'Rajshahi Medical'}.
                </p>
              </div>
            )}
          </div>

        </div>

        {/* ═════════ RIGHT COLUMN: STICKY ACTION CARDS ═════════ */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

          {/* ── CARD 5: QUICK APPOINTMENT ACTION CARD (Sticky) ── */}
          <div style={{
            background: 'linear-gradient(180deg, #ffffff 0%, var(--color-primary-50) 100%)',
            borderRadius: 'var(--radius-xl)', border: '1.5px solid var(--color-primary-100)',
            padding: '24px', boxShadow: 'var(--shadow-md)', position: 'sticky', top: 90
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
              <div style={{ width: 10, height: 10, borderRadius: '50%', background: 'var(--color-success)', boxShadow: '0 0 0 3px rgba(22, 163, 74, 0.2)' }} />
              <span style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--color-primary)', letterSpacing: '0.04em' }}>
                Quick Booking Access
              </span>
            </div>

            <h3 style={{ fontSize: '1.2rem', fontWeight: 900, fontFamily: 'var(--font-heading)', color: 'var(--color-text)', marginBottom: 8, letterSpacing: '-0.02em' }}>
              Book an Appointment
            </h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', lineHeight: 1.5, marginBottom: 14 }}>
              Call the chamber coordinator or visit during consulting hours to secure your serial.
            </p>

            {/* Consultation Fee Highlight */}
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '10px 14px', borderRadius: 'var(--radius-md)',
              background: '#f0fdf4', border: '1.5px solid #86efac',
              marginBottom: 16
            }}>
              <div>
                <div style={{ fontSize: '0.68rem', fontWeight: 800, color: '#16a34a', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Consultation Fee
                </div>
                <div style={{ fontSize: '1.2rem', fontWeight: 900, color: '#15803d', marginTop: 1 }}>
                  ৳{getConsultationFee(doctor)} <span style={{ fontSize: '0.72rem', fontWeight: 600, color: '#16a34a' }}>/ visit</span>
                </div>
              </div>
              <div style={{ fontSize: '0.68rem', fontWeight: 700, color: '#15803d', background: '#dcfce7', padding: '3px 9px', borderRadius: '99px' }}>
                Standard
              </div>
            </div>

            {primaryPhone ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 18 }}>
                <a
                  href={`tel:${primaryPhone}`}
                  className="btn btn-primary"
                  style={{
                    width: '100%', justifyContent: 'center', padding: '14px 20px',
                    fontSize: '0.95rem', fontWeight: 800, gap: 10,
                    boxShadow: 'var(--shadow-primary)'
                  }}
                >
                  <Phone style={{ width: 18, height: 18 }} />
                  Call {primaryPhone}
                </a>

                {doctor.chambers?.[0]?.appointment_numbers?.length > 1 && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 4 }}>
                    <div style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>
                      Alternative Numbers:
                    </div>
                    {doctor.chambers[0].appointment_numbers.slice(1).map((n, i) => (
                      <a
                        key={i}
                        href={`tel:${n}`}
                        style={{
                          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                          padding: '8px 12px', borderRadius: 'var(--radius-md)',
                          background: '#fff', border: '1px solid var(--color-border)',
                          color: 'var(--color-primary)', fontSize: '0.8rem', fontWeight: 700,
                          textDecoration: 'none'
                        }}
                      >
                        <Phone style={{ width: 12, height: 12 }} /> {n}
                      </a>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div style={{
                padding: '12px', borderRadius: 'var(--radius-md)', background: '#fff',
                border: '1px solid var(--color-border)', fontSize: '0.8rem', color: 'var(--color-text-secondary)',
                marginBottom: 16, textAlign: 'center'
              }}>
                Call hospital reception or visit chamber directly for appointment serial.
              </div>
            )}

            {/* Chamber summary */}
            {doctor.chambers?.[0]?.visiting_hours && (
              <div style={{
                padding: '12px 14px', borderRadius: 'var(--radius-md)',
                background: '#fff', border: '1px solid rgba(13, 124, 110, 0.15)',
                fontSize: '0.78rem', color: 'var(--color-text)', display: 'flex', gap: 8, alignItems: 'flex-start'
              }}>
                <Clock style={{ width: 14, height: 14, color: 'var(--color-primary)', marginTop: 2, flexShrink: 0 }} />
                <div>
                  <div style={{ fontWeight: 800, color: 'var(--color-primary)', fontSize: '0.7rem', textTransform: 'uppercase' }}>Main Schedule</div>
                  <div style={{ fontWeight: 700, marginTop: 2 }}>{doctor.chambers[0].visiting_hours}</div>
                </div>
              </div>
            )}
          </div>

          {/* ── CARD 6: CONSULTATION CHECKLIST CARD ── */}
          <div style={{
            background: '#fff', borderRadius: 'var(--radius-xl)',
            border: '1.5px solid var(--color-border)', padding: '20px',
            boxShadow: 'var(--shadow-xs)'
          }}>
            <h4 style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--color-text)', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
              <ShieldCheck style={{ width: 16, height: 16, color: 'var(--color-primary)' }} />
              Patient Checklist
            </h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 10, padding: 0, margin: 0 }}>
              {[
                'Call before 11:00 AM for same-day serial booking.',
                'Bring previous prescriptions & diagnostic test reports.',
                'Arrive at least 15 minutes before your allotted serial.',
                'Wear comfortable clothing suitable for clinical examination.'
              ].map((tip, i) => (
                <li key={i} style={{ display: 'flex', gap: 8, fontSize: '0.77rem', color: 'var(--color-text-secondary)', lineHeight: 1.45 }}>
                  <CheckCircle2 style={{ width: 13, height: 13, color: 'var(--color-primary)', marginTop: 2, flexShrink: 0 }} />
                  <span>{tip}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* ── CARD 7: SOURCE & VERIFICATION CARD ── */}
          <div style={{
            background: '#fff', borderRadius: 'var(--radius-xl)',
            border: '1.5px solid var(--color-border)', padding: '18px',
            boxShadow: 'var(--shadow-xs)'
          }}>
            <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
              <Info style={{ width: 15, height: 15, color: 'var(--color-text-muted)', marginTop: 2, flexShrink: 0 }} />
              <div>
                <div style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--color-text)' }}>
                  Source: {doctor.source || 'BDDoctorDirectory'}
                </div>
                <div style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', marginTop: 2 }}>
                  {doctor.lastScraped
                    ? `Verified: ${new Date(doctor.lastScraped).toLocaleDateString('en-BD', { year: 'numeric', month: 'short', day: 'numeric' })}`
                    : 'Rajshahi Healthcare Verified Directory'}
                </div>
                {doctor.profileUrl && (
                  <a
                    href={doctor.profileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: 'inline-flex', alignItems: 'center', gap: 4,
                      fontSize: '0.7rem', fontWeight: 700, color: 'var(--color-primary)',
                      marginTop: 8, textDecoration: 'none'
                    }}
                  >
                    View Original Directory Profile <ExternalLink style={{ width: 10, height: 10 }} />
                  </a>
                )}
              </div>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
