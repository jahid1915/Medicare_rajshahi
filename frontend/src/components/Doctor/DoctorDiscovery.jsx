import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  Search, Star, MapPin, Award, UserCheck, Filter, X,
  ChevronDown, Phone, Clock, RefreshCw, AlertCircle, Users,
  Building2, Stethoscope, CheckCircle2, SlidersHorizontal
} from 'lucide-react';

const API = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
const LIMIT = 12;

// ─── Doctor Avatar Fallback ───────────────────────────────────────────────
function DoctorAvatar({ src, name, size = 72 }) {
  const [failed, setFailed] = useState(false);
  const initials = (name || 'Dr')
    .replace(/^(Prof\.|Dr\.)\s*/i, '')
    .split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase();

  if (!src || failed) {
    return (
      <div style={{
        width: size, height: size, borderRadius: 'var(--radius-md)',
        background: 'linear-gradient(135deg, var(--primary) 0%, #0ea5e9 100%)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: '#fff', fontSize: size * 0.3, fontWeight: 800,
        fontFamily: 'var(--font-heading)', letterSpacing: '-0.02em',
        flexShrink: 0
      }}>
        {initials}
      </div>
    );
  }
  return (
    <img
      src={src} alt={name}
      loading="lazy"
      onError={() => setFailed(true)}
      style={{
        width: size, height: size, borderRadius: 'var(--radius-md)',
        objectFit: 'cover', flexShrink: 0,
        background: 'var(--bg-badge)'
      }}
    />
  );
}

// ─── Star Rating ──────────────────────────────────────────────────────────
function StarRating({ rating, reviewCount }) {
  if (!rating) return null;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
      <Star style={{ width: 13, height: 13, fill: '#f59e0b', stroke: '#f59e0b' }} />
      <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#f59e0b' }}>{rating.toFixed(1)}</span>
      {reviewCount > 0 && (
        <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>({reviewCount})</span>
      )}
    </div>
  );
}

// ─── Skeleton Card ────────────────────────────────────────────────────────
function SkeletonCard() {
  return (
    <div className="glass-card" style={{ padding: 'var(--space-5)', display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
      <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
        <div style={{ width: 72, height: 72, borderRadius: 'var(--radius-md)', background: 'var(--bg-badge)', flexShrink: 0, animation: 'pulse 1.5s ease-in-out infinite' }} />
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div style={{ height: 16, width: '70%', borderRadius: 6, background: 'var(--bg-badge)', animation: 'pulse 1.5s ease-in-out infinite' }} />
          <div style={{ height: 12, width: '50%', borderRadius: 6, background: 'var(--bg-badge)', animation: 'pulse 1.5s ease-in-out infinite' }} />
          <div style={{ height: 12, width: '80%', borderRadius: 6, background: 'var(--bg-badge)', animation: 'pulse 1.5s ease-in-out infinite' }} />
        </div>
      </div>
      <div style={{ height: 40, borderRadius: 8, background: 'var(--bg-badge)', animation: 'pulse 1.5s ease-in-out infinite' }} />
      <div style={{ height: 36, borderRadius: 8, background: 'var(--bg-badge)', animation: 'pulse 1.5s ease-in-out infinite' }} />
    </div>
  );
}

// ─── Doctor Card ──────────────────────────────────────────────────────────
function DoctorCard({ doctor }) {
  const primaryChamber = doctor.chambers?.[0];
  const chamberCount = doctor.chambers?.length || 0;

  return (
    <div className="glass-card glass-card-lift" style={{
      padding: 'var(--space-5)',
      display: 'flex', flexDirection: 'column', gap: 'var(--space-4)',
      transition: 'transform var(--transition-fast), box-shadow var(--transition-fast)',
      cursor: 'pointer', position: 'relative', overflow: 'hidden'
    }}>
      {/* Verified ribbon */}
      {doctor.verified && (
        <div style={{
          position: 'absolute', top: 12, right: 12,
          display: 'flex', alignItems: 'center', gap: 3,
          background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.3)',
          borderRadius: 'var(--radius-full)', padding: '2px 8px',
          fontSize: '0.6rem', fontWeight: 700, color: 'var(--success)'
        }}>
          <CheckCircle2 style={{ width: 10, height: 10 }} /> Verified
        </div>
      )}

      {/* Top: Avatar + Info */}
      <div style={{ display: 'flex', gap: 'var(--space-3)', paddingRight: doctor.verified ? 64 : 0 }}>
        <DoctorAvatar src={doctor.imageUrl} name={doctor.name} size={72} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <h3 style={{
            fontSize: '0.875rem', fontWeight: 750, color: 'var(--text-primary)',
            lineHeight: 1.3, marginBottom: 2,
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'
          }}>{doctor.name}</h3>

          <p style={{ fontSize: '0.75rem', fontWeight: 650, color: 'var(--primary)', marginBottom: 2 }}>
            {doctor.specialty}
          </p>

          {doctor.designation && (
            <p style={{
              fontSize: '0.65rem', color: 'var(--text-muted)', lineHeight: 1.3,
              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'
            }}>
              {doctor.designation}
            </p>
          )}

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-2)', marginTop: 6, alignItems: 'center' }}>
            <StarRating rating={doctor.rating} reviewCount={doctor.reviewCount} />
            {doctor.experience && (
              <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 2 }}>
                <Award style={{ width: 11, height: 11 }} /> {doctor.experience}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Workplace */}
      {doctor.workplace && (
        <div style={{
          display: 'flex', alignItems: 'flex-start', gap: 6,
          padding: 'var(--space-2) var(--space-3)',
          background: 'var(--bg-badge)', borderRadius: 'var(--radius-sm)',
          border: '1px solid var(--border-subtle)'
        }}>
          <Building2 style={{ width: 12, height: 12, color: 'var(--primary)', marginTop: 1, flexShrink: 0 }} />
          <span style={{ fontSize: '0.675rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
            {doctor.workplace}
          </span>
        </div>
      )}

      {/* Primary Chamber */}
      {primaryChamber && (
        <div style={{
          padding: 'var(--space-3)',
          background: 'var(--bg-badge)', borderRadius: 'var(--radius-sm)',
          border: '1px solid var(--border-subtle)',
          display: 'flex', flexDirection: 'column', gap: 4
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              {primaryChamber.name}
            </span>
            {chamberCount > 1 && (
              <span style={{
                fontSize: '0.575rem', fontWeight: 700,
                background: 'var(--primary-glow)', color: 'var(--primary)',
                borderRadius: 'var(--radius-full)', padding: '1px 6px'
              }}>+{chamberCount - 1} more</span>
            )}
          </div>
          {primaryChamber.visiting_hours && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <Clock style={{ width: 10, height: 10, color: 'var(--text-muted)' }} />
              <span style={{ fontSize: '0.625rem', color: 'var(--text-muted)' }}>{primaryChamber.visiting_hours}</span>
            </div>
          )}
          {primaryChamber.address && (
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 4 }}>
              <MapPin style={{ width: 10, height: 10, color: 'var(--text-muted)', marginTop: 1, flexShrink: 0 }} />
              <span style={{ fontSize: '0.6rem', color: 'var(--text-muted)', lineHeight: 1.3 }}>
                {primaryChamber.address}
              </span>
            </div>
          )}
        </div>
      )}

      {/* Actions */}
      <div style={{
        display: 'flex', gap: 'var(--space-2)',
        paddingTop: 'var(--space-3)', borderTop: '1px solid var(--border-subtle)'
      }}>
        <Link
          to={`/doctors/${doctor.slug}`}
          className="btn"
          style={{
            flex: 1, fontSize: '0.725rem', padding: '8px 12px', textAlign: 'center',
            background: 'var(--primary)', color: '#fff', borderRadius: 'var(--radius-sm)',
            textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center',
            gap: 4, fontWeight: 700, transition: 'opacity var(--transition-fast)'
          }}
        >
          <UserCheck style={{ width: 13, height: 13 }} /> View Profile
        </Link>
        {primaryChamber?.appointment_numbers?.[0] && (
          <a
            href={`tel:${primaryChamber.appointment_numbers[0]}`}
            style={{
              padding: '8px 12px', borderRadius: 'var(--radius-sm)',
              background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)',
              color: 'var(--success)', display: 'flex', alignItems: 'center', gap: 4,
              fontSize: '0.725rem', fontWeight: 700, textDecoration: 'none',
              transition: 'background var(--transition-fast)'
            }}
            title="Call for appointment"
          >
            <Phone style={{ width: 13, height: 13 }} /> Call
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
        background: 'linear-gradient(135deg, var(--primary) 0%, #0369a1 100%)',
        borderRadius: 'var(--radius-xl)', padding: 'var(--space-8)',
        color: '#fff', position: 'relative', overflow: 'hidden'
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
        <div className="grid-responsive-2">
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
          <div className="grid-responsive-2">
            {doctors.map((doc, i) => (
              <div key={doc._id || doc.slug} style={{ animation: `fadeIn 0.3s var(--ease-out) ${i * 0.04}s both` }}>
                <DoctorCard doctor={doc} />
              </div>
            ))}
          </div>
          <Pagination page={page} totalPages={totalPages} onPageChange={p => { fetchDoctors(p); window.scrollTo({ top: 0, behavior: 'smooth' }); }} />
        </>
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
