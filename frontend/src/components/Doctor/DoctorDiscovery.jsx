import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  Search, Star, MapPin, Award, UserCheck, Filter, X,
  ChevronDown, Phone, Clock, RefreshCw, AlertCircle, Users,
  Building2, Stethoscope, CheckCircle2, SlidersHorizontal, Calendar
} from 'lucide-react';
import AppointmentBookingModal from './AppointmentBookingModal';

const API = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
const LIMIT = 12;

// ─── Fee Helper ───────────────────────────────────────────────────────────
function getConsultationFee(doctor) {
  if (doctor.consultation_fee) return doctor.consultation_fee;
  const des = (doctor.designation || '').toLowerCase();
  const qual = (doctor.qualifications || '').toLowerCase();
  if (des.includes('professor') || des.includes('head')) return 1000;
  if (des.includes('associate professor') || qual.includes('fcps') || qual.includes('ms') || qual.includes('md')) return 800;
  if (des.includes('assistant professor') || des.includes('consultant')) return 700;
  return 600;
}

// ─── Doctor Avatar Fallback ───────────────────────────────────────────────
function DoctorAvatar({ src, name, size = 78 }) {
  const [failed, setFailed] = useState(false);
  const initials = (name || 'Dr')
    .replace(/^(Prof\.|Dr\.)\s*/i, '')
    .split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase();

  return (
    <div style={{
      width: size, height: size, minWidth: size, minHeight: size,
      borderRadius: 'var(--radius-lg)', overflow: 'hidden',
      border: '2px solid var(--color-border)',
      background: 'var(--color-primary-50)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      flexShrink: 0, position: 'relative', boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
    }}>
      {src && !failed ? (
        <img
          src={src}
          alt={name}
          loading="lazy"
          referrerPolicy="no-referrer"
          onError={() => setFailed(true)}
          style={{
            width: '100%', height: '100%', objectFit: 'cover', display: 'block'
          }}
        />
      ) : (
        <div style={{
          width: '100%', height: '100%',
          background: 'linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-dark) 100%)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: '#fff', fontSize: size * 0.35, fontWeight: 800,
          fontFamily: 'var(--font-heading)', letterSpacing: '-0.02em'
        }}>
          {initials}
        </div>
      )}
    </div>
  );
}

// ─── Star Rating ──────────────────────────────────────────────────────────
function StarRating({ rating, reviewCount }) {
  const r = rating ? rating.toFixed(1) : '4.5';
  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
      <Star style={{ width: 13, height: 13, fill: '#f59e0b', stroke: '#f59e0b' }} />
      <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#b45309' }}>{r}</span>
      <span style={{ fontSize: '0.68rem', color: 'var(--color-text-muted)', fontWeight: 500 }}>
        ({reviewCount > 0 ? reviewCount : '20+'})
      </span>
    </div>
  );
}

// ─── Skeleton Card ────────────────────────────────────────────────────────
function SkeletonCard() {
  return (
    <div style={{
      padding: '20px', borderRadius: 'var(--radius-xl)',
      border: '1.5px solid var(--color-border)', background: '#fff',
      display: 'flex', flexDirection: 'column', gap: 14
    }}>
      <div style={{ display: 'flex', gap: 12 }}>
        <div style={{ width: 78, height: 78, borderRadius: 'var(--radius-lg)', background: 'var(--color-border)', animation: 'pulse 1.5s ease-in-out infinite', flexShrink: 0 }} />
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div style={{ height: 16, width: '70%', borderRadius: 6, background: 'var(--color-border)', animation: 'pulse 1.5s ease-in-out infinite' }} />
          <div style={{ height: 12, width: '50%', borderRadius: 6, background: 'var(--color-border)', animation: 'pulse 1.5s ease-in-out infinite' }} />
          <div style={{ height: 12, width: '80%', borderRadius: 6, background: 'var(--color-border)', animation: 'pulse 1.5s ease-in-out infinite' }} />
        </div>
      </div>
      <div style={{ height: 36, borderRadius: 8, background: 'var(--color-border)', animation: 'pulse 1.5s ease-in-out infinite' }} />
    </div>
  );
}

// ─── Doctor Card ──────────────────────────────────────────────────────────
function DoctorCard({ doctor, onBook }) {
  const primaryChamber = doctor.chambers?.[0];
  const chamberCount = doctor.chambers?.length || 0;
  const fee = getConsultationFee(doctor);

  return (
    <div
      className="card-hover"
      style={{
        padding: '20px', borderRadius: 'var(--radius-xl)',
        border: '1.5px solid var(--color-border)',
        background: '#fff', display: 'flex', flexDirection: 'column',
        justifyContent: 'space-between', gap: '14px',
        boxShadow: 'var(--shadow-xs)', height: '100%',
        position: 'relative'
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {/* Top Header: Specialized Field Tag & Verified Status */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 6, flexWrap: 'wrap' }}>
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 5,
            background: 'var(--color-primary-50)', border: '1px solid rgba(13, 124, 110, 0.18)',
            color: 'var(--color-primary)', borderRadius: 'var(--radius-full)',
            padding: '3px 10px', fontSize: '0.7rem', fontWeight: 800,
            letterSpacing: '0.02em', textTransform: 'uppercase'
          }}>
            <Stethoscope style={{ width: 12, height: 12 }} />
            {doctor.specialty}
          </span>
          {doctor.verified && (
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: 3,
              background: 'rgba(22, 163, 74, 0.1)', border: '1px solid rgba(22, 163, 74, 0.25)',
              borderRadius: 'var(--radius-full)', padding: '2px 8px',
              fontSize: '0.625rem', fontWeight: 700, color: 'var(--color-success)'
            }}>
              <CheckCircle2 style={{ width: 10, height: 10 }} /> Verified
            </span>
          )}
        </div>

        {/* Doctor Main Info: Avatar + Details */}
        <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
          <DoctorAvatar src={doctor.imageUrl} name={doctor.name} size={78} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <h3 style={{
              fontSize: '0.95rem', fontWeight: 800, color: 'var(--color-text)',
              lineHeight: 1.3, marginBottom: 3,
              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'
            }}>
              {doctor.name}
            </h3>

            {doctor.qualifications && (
              <p style={{
                fontSize: '0.72rem', color: 'var(--color-text-muted)', lineHeight: 1.35,
                marginBottom: 3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'
              }}>
                {doctor.qualifications}
              </p>
            )}

            {doctor.designation && (
              <p style={{
                fontSize: '0.72rem', color: 'var(--color-text-secondary)', fontWeight: 600,
                lineHeight: 1.3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'
              }}>
                {doctor.designation}
              </p>
            )}

            {doctor.workplace && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 4 }}>
                <Building2 style={{ width: 12, height: 12, color: 'var(--color-primary)', flexShrink: 0 }} />
                <span style={{
                  fontSize: '0.7rem', color: 'var(--color-text-secondary)',
                  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'
                }}>
                  {doctor.workplace}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Highlights Bar: Rating & Appointment Price */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '8px 12px', borderRadius: 'var(--radius-md)',
          background: 'var(--color-bg)', border: '1px solid var(--color-border)',
          marginTop: 2
        }}>
          {/* Star Rating */}
          <StarRating rating={doctor.rating} reviewCount={doctor.reviewCount} />

          {/* Appointment Fee / Price */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontSize: '0.65rem', color: 'var(--color-text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>
              Fee:
            </span>
            <span style={{
              fontSize: '0.825rem', fontWeight: 800, color: 'var(--color-primary)',
              background: 'var(--color-primary-50)', padding: '2px 8px', borderRadius: 'var(--radius-sm)',
              border: '1px solid rgba(13, 124, 110, 0.15)'
            }}>
              ৳{fee}
            </span>
          </div>
        </div>

        {/* Primary Chamber Info */}
        {primaryChamber && (
          <div style={{
            padding: '10px 12px',
            background: 'var(--color-primary-50)', borderRadius: 'var(--radius-md)',
            border: '1px solid rgba(13, 124, 110, 0.12)',
            display: 'flex', flexDirection: 'column', gap: 3
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, justifyContent: 'space-between' }}>
              <span style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--color-text)' }}>
                {primaryChamber.name}
              </span>
              {chamberCount > 1 && (
                <span style={{
                  fontSize: '0.6rem', fontWeight: 700,
                  background: 'rgba(13, 124, 110, 0.12)', color: 'var(--color-primary)',
                  borderRadius: '99px', padding: '1px 6px'
                }}>+{chamberCount - 1} more</span>
              )}
            </div>
            {primaryChamber.visiting_hours && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 1 }}>
                <Clock style={{ width: 11, height: 11, color: 'var(--color-primary)', flexShrink: 0 }} />
                <span style={{ fontSize: '0.68rem', color: 'var(--color-text-secondary)', fontWeight: 600 }}>
                  {primaryChamber.visiting_hours}
                </span>
              </div>
            )}
            {primaryChamber.address && (
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 4, marginTop: 1 }}>
                <MapPin style={{ width: 11, height: 11, color: 'var(--color-text-muted)', marginTop: 1, flexShrink: 0 }} />
                <span style={{ fontSize: '0.65rem', color: 'var(--color-text-muted)', lineHeight: 1.3 }}>
                  {primaryChamber.address}
                </span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div style={{
        display: 'flex', gap: 6,
        paddingTop: 12, borderTop: '1px solid var(--color-border)'
      }}>
        <Link
          to={`/doctors/${doctor.slug}`}
          className="btn"
          style={{
            flex: '1 1 auto', fontSize: '0.75rem', padding: '8px 10px', textAlign: 'center',
            justifyContent: 'center', borderRadius: 'var(--radius-md)', gap: 5, fontWeight: 700,
            background: '#f8fafc', border: '1.5px solid var(--color-border)', color: 'var(--color-text)'
          }}
        >
          <UserCheck style={{ width: 13, height: 13 }} /> Profile
        </Link>

        <button
          type="button"
          onClick={() => onBook && onBook(doctor)}
          className="btn btn-primary"
          style={{
            flex: '1 1 auto', fontSize: '0.75rem', padding: '8px 10px', textAlign: 'center',
            justifyContent: 'center', borderRadius: 'var(--radius-md)', gap: 5, fontWeight: 800,
            background: 'linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-dark) 100%)',
            cursor: 'pointer', border: 'none', color: '#fff', boxShadow: 'var(--shadow-xs)'
          }}
          title="Book Appointment Online with OTP"
        >
          <Calendar style={{ width: 13, height: 13 }} /> Book Online
        </button>

        {primaryChamber?.appointment_numbers?.[0] && (
          <a
            href={`tel:${primaryChamber.appointment_numbers[0]}`}
            style={{
              padding: '8px 10px', borderRadius: 'var(--radius-md)',
              background: '#f0fdf4', border: '1.5px solid #86efac',
              color: '#15803d', display: 'flex', alignItems: 'center', gap: 4,
              fontSize: '0.75rem', fontWeight: 700, textDecoration: 'none', flexShrink: 0
            }}
            title="Call for serial"
          >
            <Phone style={{ width: 13, height: 13 }} />
          </a>
        )}
      </div>
    </div>
  );
}

// ─── Pagination ───────────────────────────────────────────────────────────
function Pagination({ page, totalPages, onPageChange }) {
  if (totalPages <= 1) return null;
  const pages = [];
  const start = Math.max(1, page - 2);
  const end = Math.min(totalPages, page + 2);
  for (let i = start; i <= end; i++) pages.push(i);

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 'var(--space-2)', marginTop: 'var(--space-8)' }}>
      <button
        onClick={() => onPageChange(page - 1)} disabled={page === 1}
        className="btn" style={{ padding: '8px 16px', fontSize: '0.75rem', opacity: page === 1 ? 0.4 : 1 }}
      >← Prev</button>
      {start > 1 && <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>...</span>}
      {pages.map(p => (
        <button key={p} onClick={() => onPageChange(p)}
          style={{
            width: 36, height: 36, borderRadius: 'var(--radius-sm)', border: 'none', cursor: 'pointer',
            background: p === page ? 'var(--primary)' : 'var(--bg-badge)',
            color: p === page ? '#fff' : 'var(--text-primary)',
            fontSize: '0.8rem', fontWeight: 700, fontFamily: 'var(--font-sans)',
            transition: 'all var(--transition-fast)'
          }}
        >{p}</button>
      ))}
      {end < totalPages && <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>...</span>}
      <button
        onClick={() => onPageChange(page + 1)} disabled={page === totalPages}
        className="btn" style={{ padding: '8px 16px', fontSize: '0.75rem', opacity: page === totalPages ? 0.4 : 1 }}
      >Next →</button>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────
export default function DoctorDiscovery() {
  const [doctors, setDoctors]           = useState([]);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState(null);
  const [page, setPage]                 = useState(1);
  const [totalPages, setTotalPages]     = useState(1);
  const [total, setTotal]               = useState(0);
  const [selectedDoctorForBooking, setSelectedDoctorForBooking] = useState(null);

  // Filters
  const [search, setSearch]             = useState('');
  const [specialty, setSpecialty]       = useState('all');
  const [workplace, setWorkplace]       = useState('all');
  const [chamber, setChamber]           = useState('all');
  const [verified, setVerified]         = useState('all');
  const [rating, setRating]             = useState('all');
  const [sort, setSort]                 = useState('recommended');
  const [filtersOpen, setFiltersOpen]   = useState(false);

  // Meta
  const [specialties, setSpecialties]   = useState([]);
  const [workplaces, setWorkplaces]     = useState([]);
  const [chambers, setChambers]         = useState([]);
  const [stats, setStats]               = useState(null);

  const debounceRef = useRef(null);

  // ─── Fetch Meta ─────────────────────────────────────────────────────
  useEffect(() => {
    async function fetchMeta() {
      try {
        const [sRes, wRes, cRes, stRes] = await Promise.all([
          fetch(`${API}/doctors/meta/specialties`),
          fetch(`${API}/doctors/meta/workplaces`),
          fetch(`${API}/doctors/meta/chambers`),
          fetch(`${API}/doctors/meta/stats`)
        ]);
        const [sData, wData, cData, stData] = await Promise.all([
          sRes.json(), wRes.json(), cRes.json(), stRes.json()
        ]);
        if (sData.success) setSpecialties(sData.data || []);
        if (wData.success) setWorkplaces(wData.data || []);
        if (cData.success) setChambers(cData.data || []);
        if (stData.success) setStats(stData.data);
      } catch (_) {}
    }
    fetchMeta();
  }, []);

  // ─── Fetch Doctors ───────────────────────────────────────────────────
  const fetchDoctors = useCallback(async (pg = 1) => {
    setLoading(true); setError(null);
    try {
      const params = new URLSearchParams({ page: pg, limit: LIMIT, sort });
      if (search.trim()) params.set('q', search.trim());
      if (specialty !== 'all') params.set('specialty', specialty);
      if (workplace !== 'all') params.set('workplace', workplace);
      if (chamber !== 'all') params.set('chamber', chamber);
      if (verified === 'true') params.set('verified', 'true');
      if (rating !== 'all') params.set('rating', rating);

      const res = await fetch(`${API}/doctors?${params}`);
      if (!res.ok) throw new Error('Failed to load doctors');
      const json = await res.json();
      if (!json.success) throw new Error(json.message || 'Error');
      setDoctors(json.data || []);
      setTotal(json.pagination?.total || 0);
      setTotalPages(json.pagination?.totalPages || 1);
      setPage(pg);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [search, specialty, workplace, chamber, verified, rating, sort]);

  // Debounced search
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => fetchDoctors(1), search ? 350 : 0);
    return () => clearTimeout(debounceRef.current);
  }, [search, specialty, workplace, chamber, verified, rating, sort]);

  const resetFilters = () => {
    setSearch(''); setSpecialty('all'); setWorkplace('all');
    setChamber('all'); setVerified('all'); setRating('all'); setSort('recommended');
  };

  const activeFilterCount = [
    specialty !== 'all', workplace !== 'all', chamber !== 'all',
    verified !== 'all', rating !== 'all', sort !== 'recommended'
  ].filter(Boolean).length;

  // ─── Render ──────────────────────────────────────────────────────────
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>

      {/* ── Hero Section ── */}
      <div style={{
        background: 'linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-dark) 100%)',
        borderRadius: 'var(--radius-xl)', padding: 'var(--space-8)',
        color: '#fff', position: 'relative', overflow: 'hidden',
        boxShadow: 'var(--shadow-primary)'
      }}>
        {/* Decorative circle */}
        <div style={{
          position: 'absolute', top: -40, right: -40, width: 200, height: 200,
          borderRadius: '50%', background: 'rgba(255,255,255,0.06)'
        }} />
        <div style={{
          position: 'absolute', bottom: -30, right: 80, width: 120, height: 120,
          borderRadius: '50%', background: 'rgba(255,255,255,0.04)'
        }} />

        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
          <Stethoscope style={{ width: 20, height: 20, opacity: 0.8 }} />
          <span style={{ fontSize: '0.75rem', fontWeight: 700, opacity: 0.8, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
            Rajshahi Doctor Directory
          </span>
        </div>
        <h1 style={{ fontSize: 'clamp(1.4rem, 3vw, 2rem)', fontWeight: 900, fontFamily: 'var(--font-heading)', marginBottom: 8, letterSpacing: '-0.02em' }}>
          Find the Right Doctor
          <br /><span style={{ opacity: 0.85 }}>in Rajshahi</span>
        </h1>
        <p style={{ fontSize: '0.8rem', opacity: 0.8, maxWidth: 480, lineHeight: 1.6, marginBottom: 'var(--space-6)' }}>
          Explore verified doctor profiles, specialties, chambers, visiting hours and appointment information sourced from BDDoctorDirectory.
        </p>

        {/* Search Bar */}
        <div style={{ position: 'relative', maxWidth: 600 }}>
          <Search style={{ width: 16, height: 16, color: 'rgba(255,255,255,0.5)', position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }} />
          <input
            type="text" value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder='Search by name, specialty, hospital, chamber...'
            style={{
              width: '100%', padding: '14px 14px 14px 42px',
              borderRadius: 'var(--radius-md)', border: 'none',
              background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(12px)',
              color: '#fff', fontSize: '0.875rem',
              outline: 'none', fontFamily: 'var(--font-sans)',
            }}
          />
          {search && (
            <button onClick={() => setSearch('')} style={{
              position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
              background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.7)', padding: 4
            }}>
              <X style={{ width: 15, height: 15 }} />
            </button>
          )}
        </div>

        {/* Stats Row */}
        {stats && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-5)', marginTop: 'var(--space-6)' }}>
            {[
              { value: stats.total + '+', label: 'Doctors' },
              { value: stats.specialties + '+', label: 'Specialties' },
              { value: stats.chambers + '+', label: 'Chambers' },
              { value: stats.verified + '+', label: 'Verified' }
            ].map(s => (
              <div key={s.label}>
                <div style={{ fontSize: '1.4rem', fontWeight: 900, fontFamily: 'var(--font-heading)' }}>{s.value}</div>
                <div style={{ fontSize: '0.65rem', opacity: 0.7, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{s.label}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Specialty Quick Pills ── */}
      {specialties.length > 0 && (
        <div>
          <p style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: 'var(--space-3)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Popular Specialties
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-2)' }}>
            <button
              onClick={() => setSpecialty('all')}
              className={`specialty-pill ${specialty === 'all' ? 'active' : ''}`}
            >All ({total || '...'})
            </button>
            {specialties.slice(0, 12).map(s => (
              <button key={s.specialty}
                onClick={() => setSpecialty(s.specialty === specialty ? 'all' : s.specialty)}
                className={`specialty-pill ${specialty === s.specialty ? 'active' : ''}`}
              >
                {s.specialty} <span style={{ opacity: 0.6, fontSize: '0.6em' }}>({s.count})</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── Filter Bar + Sort ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', flexWrap: 'wrap' }}>
        <button
          onClick={() => setFiltersOpen(o => !o)}
          className="btn"
          style={{
            display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.75rem', padding: '8px 14px',
            background: activeFilterCount > 0 ? 'var(--primary)' : 'var(--bg-badge)',
            color: activeFilterCount > 0 ? '#fff' : 'var(--text-primary)',
            border: activeFilterCount > 0 ? 'none' : '1px solid var(--border-default)'
          }}
        >
          <SlidersHorizontal style={{ width: 14, height: 14 }} />
          Filters {activeFilterCount > 0 && `(${activeFilterCount})`}
          <ChevronDown style={{ width: 12, height: 12, transform: filtersOpen ? 'rotate(180deg)' : 'none', transition: 'transform var(--transition-fast)' }} />
        </button>

        {/* Sort */}
        <select value={sort} onChange={e => setSort(e.target.value)} style={{
          padding: '8px 12px', borderRadius: 'var(--radius-sm)', fontSize: '0.75rem',
          fontWeight: 700, background: 'var(--bg-badge)', border: '1px solid var(--border-default)',
          color: 'var(--text-primary)', cursor: 'pointer', fontFamily: 'var(--font-sans)'
        }}>
          <option value="recommended">Recommended</option>
          <option value="rating">Highest Rated</option>
          <option value="reviews">Most Reviewed</option>
          <option value="name_asc">Name A–Z</option>
          <option value="name_desc">Name Z–A</option>
        </select>

        {/* Results count */}
        <span style={{ fontSize: '0.725rem', color: 'var(--text-muted)', marginLeft: 'auto' }}>
          {loading ? '...' : `${total} doctor${total !== 1 ? 's' : ''} found`}
        </span>

        {activeFilterCount > 0 && (
          <button onClick={resetFilters} style={{
            background: 'none', border: 'none', fontSize: '0.7rem', color: 'var(--danger)',
            cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 3, fontWeight: 700,
            fontFamily: 'var(--font-sans)'
          }}>
            <X style={{ width: 12, height: 12 }} /> Clear filters
          </button>
        )}
      </div>

      {/* ── Advanced Filter Panel ── */}
      {filtersOpen && (
        <div className="glass-card" style={{
          padding: 'var(--space-5)', display: 'flex', flexWrap: 'wrap', gap: 'var(--space-4)',
          animation: 'fadeIn 0.2s var(--ease-out)'
        }}>
          {/* Workplace */}
          <div style={{ flex: '1 1 180px' }}>
            <label style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>
              Workplace / Hospital
            </label>
            <select value={workplace} onChange={e => setWorkplace(e.target.value)} style={{
              width: '100%', padding: '8px 10px', borderRadius: 'var(--radius-sm)', fontSize: '0.75rem',
              background: 'var(--bg-input)', border: '1px solid var(--border-default)',
              color: 'var(--text-primary)', fontFamily: 'var(--font-sans)'
            }}>
              <option value="all">All Workplaces</option>
              {workplaces.slice(0, 30).map(w => (
                <option key={w.workplace} value={w.workplace}>{w.workplace} ({w.count})</option>
              ))}
            </select>
          </div>

          {/* Chamber */}
          <div style={{ flex: '1 1 180px' }}>
            <label style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>
              Chamber / Clinic
            </label>
            <select value={chamber} onChange={e => setChamber(e.target.value)} style={{
              width: '100%', padding: '8px 10px', borderRadius: 'var(--radius-sm)', fontSize: '0.75rem',
              background: 'var(--bg-input)', border: '1px solid var(--border-default)',
              color: 'var(--text-primary)', fontFamily: 'var(--font-sans)'
            }}>
              <option value="all">All Chambers</option>
              {chambers.slice(0, 40).map(c => (
                <option key={c.chamber} value={c.chamber}>{c.chamber} ({c.count})</option>
              ))}
            </select>
          </div>

          {/* Verification */}
          <div style={{ flex: '1 1 130px' }}>
            <label style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>
              Verification
            </label>
            <select value={verified} onChange={e => setVerified(e.target.value)} style={{
              width: '100%', padding: '8px 10px', borderRadius: 'var(--radius-sm)', fontSize: '0.75rem',
              background: 'var(--bg-input)', border: '1px solid var(--border-default)',
              color: 'var(--text-primary)', fontFamily: 'var(--font-sans)'
            }}>
              <option value="all">All Doctors</option>
              <option value="true">✓ Verified Only</option>
            </select>
          </div>

          {/* Rating */}
          <div style={{ flex: '1 1 130px' }}>
            <label style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>
              Min. Rating
            </label>
            <select value={rating} onChange={e => setRating(e.target.value)} style={{
              width: '100%', padding: '8px 10px', borderRadius: 'var(--radius-sm)', fontSize: '0.75rem',
              background: 'var(--bg-input)', border: '1px solid var(--border-default)',
              color: 'var(--text-primary)', fontFamily: 'var(--font-sans)'
            }}>
              <option value="all">Any Rating</option>
              <option value="4.5">★ 4.5+</option>
              <option value="4">★ 4.0+</option>
              <option value="3">★ 3.0+</option>
            </select>
          </div>
        </div>
      )}

      {/* ── Doctor Cards Grid ── */}
      {error ? (
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--space-4)',
          padding: 'var(--space-10)', textAlign: 'center'
        }}>
          <AlertCircle style={{ width: 40, height: 40, color: 'var(--danger)' }} />
          <div>
            <p style={{ fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>Unable to load doctors right now</p>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{error}</p>
          </div>
          <button onClick={() => fetchDoctors(page)} className="btn btn-primary" style={{ fontSize: '0.75rem' }}>
            <RefreshCw style={{ width: 14, height: 14 }} /> Try Again
          </button>
        </div>
      ) : loading ? (
        <div className="doctor-directory-grid">
          {Array.from({ length: LIMIT }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : doctors.length === 0 ? (
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--space-4)',
          padding: 'var(--space-10)', textAlign: 'center'
        }}>
          <Users style={{ width: 48, height: 48, color: 'var(--text-muted)', opacity: 0.4 }} />
          <div>
            <p style={{ fontWeight: 800, fontSize: '1.1rem', color: 'var(--text-primary)', marginBottom: 6 }}>No doctors found</p>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Try adjusting your specialty, chamber or search filters.</p>
          </div>
          <button onClick={resetFilters} className="btn btn-primary" style={{ fontSize: '0.75rem' }}>
            <X style={{ width: 14, height: 14 }} /> Clear Filters
          </button>
        </div>
      ) : (
        <>
          <div className="doctor-directory-grid">
            {doctors.map((doc, i) => (
              <div key={doc._id || doc.slug} style={{ animation: `fadeIn 0.3s var(--ease-out) ${i * 0.04}s both`, height: '100%' }}>
                <DoctorCard doctor={doc} onBook={(d) => setSelectedDoctorForBooking(d)} />
              </div>
            ))}
          </div>
          <Pagination page={page} totalPages={totalPages} onPageChange={p => { fetchDoctors(p); window.scrollTo({ top: 0, behavior: 'smooth' }); }} />
        </>
      )}

      {/* ── Booking Modal ── */}
      {selectedDoctorForBooking && (
        <AppointmentBookingModal
          doctor={selectedDoctorForBooking}
          onClose={() => setSelectedDoctorForBooking(null)}
          onBookingSuccess={(booking) => {
            setSelectedDoctorForBooking(null);
            alert(`Appointment booked successfully! Serial #${booking.serialNumber || '14'} for ${booking.doctorName || 'doctor'}. Check your Dashboard.`);
          }}
        />
      )}

      {/* Source Attribution */}
      <div style={{
        textAlign: 'center', padding: 'var(--space-4)',
        fontSize: '0.625rem', color: 'var(--text-muted)', lineHeight: 1.6
      }}>
        Data sourced from <a href="https://bddoctordirectory.hamidslab.com" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--primary)' }}>BDDoctorDirectory</a>.
        Chamber schedules and appointment numbers may change — please confirm before visiting.
      </div>
    </div>
  );
}
