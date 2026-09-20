import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Search, Stethoscope, Pill, Building2, ChevronRight,
  ArrowRight, CheckCircle2, Star, MapPin, Phone,
  Shield, Clock, Activity, Users, Sparkles, HeartHandshake
} from 'lucide-react';

const API = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

/* ─── Specialty emoji/icon map ─── */
const SPECIALTY_META = {
  'General Medicine': { emoji: '🩺', color: '#0d7c6e', bg: '#f0faf9' },
  'ENT':              { emoji: '👂', color: '#7c3aed', bg: '#f5f3ff' },
  'Surgery':          { emoji: '⚕️', color: '#0284c7', bg: '#f0f9ff' },
  'Gynecology & Obstetrics': { emoji: '👶', color: '#db2777', bg: '#fdf2f8' },
  'Pediatrics':       { emoji: '🧒', color: '#d97706', bg: '#fffbeb' },
  'Orthopedics':      { emoji: '🦴', color: '#059669', bg: '#f0fdf4' },
  'Cardiology':       { emoji: '❤️', color: '#dc2626', bg: '#fef2f2' },
  'Internal Medicine':{ emoji: '🏥', color: '#0369a1', bg: '#f0f9ff' },
  'Neurology':        { emoji: '🧠', color: '#7c3aed', bg: '#f5f3ff' },
  'Dermatology':      { emoji: '🌿', color: '#16a34a', bg: '#f0fdf4' },
  'Ophthalmology':    { emoji: '👁️', color: '#0d7c6e', bg: '#f0faf9' },
  'Dentistry':        { emoji: '🦷', color: '#0891b2', bg: '#ecfeff' },
};

function getSpecialtyMeta(name) {
  if (!name) return { emoji: '🩺', color: '#0d7c6e', bg: '#f0faf9' };
  if (SPECIALTY_META[name]) return SPECIALTY_META[name];
  const found = Object.entries(SPECIALTY_META).find(([k]) =>
    name.toLowerCase().includes(k.toLowerCase()) || k.toLowerCase().includes(name.toLowerCase())
  );
  if (found) return found[1];
  return { emoji: '🩺', color: '#0d7c6e', bg: '#f0faf9' };
}

/* ─── Animated Stat Counter ─── */
function StatNumber({ value, suffix = '' }) {
  const [display, setDisplay] = useState(0);
  const ref = useRef(null);
  const numericValue = parseInt(String(value).replace(/\D/g, ''), 10) || 0;

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      let start = 0;
      const step = Math.ceil(numericValue / 40);
      const id = setInterval(() => {
        start += step;
        if (start >= numericValue) { setDisplay(numericValue); clearInterval(id); }
        else setDisplay(start);
      }, 30);
      observer.disconnect();
    }, { threshold: 0.5 });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [numericValue]);

  return <span ref={ref}>{display.toLocaleString()}{suffix}</span>;
}

/* ─── HealthOrb — CSS 3D Visual ─── */
function HealthOrb() {
  return (
    <div className="health-orb" aria-hidden="true">
      {/* Pulse ring */}
      <div className="health-orb__pulse" />
      {/* Rotating rings */}
      <div className="health-orb__ring" />
      <div className="health-orb__ring" />
      <div className="health-orb__ring" />
      {/* Core */}
      <div className="health-orb__core">
        <svg width="52" height="52" viewBox="0 0 52 52" fill="none">
          <path d="M26 8C24.3 8 23 9.3 23 11v8h-8c-1.7 0-3 1.3-3 3s1.3 3 3 3h8v8c0 1.7 1.3 3 3 3s3-1.3 3-3v-8h8c1.7 0 3-1.3 3-3s-1.3-3-3-3h-8v-8c0-1.7-1.3-3-3-3z" fill="white"/>
        </svg>
      </div>
      {/* Orbiting nodes */}
      {[
        { top: 20, left: '50%', transform: 'translateX(-50%)', size: 8, opacity: 0.9 },
        { bottom: 24, right: 40, size: 6, opacity: 0.7 },
        { top: '50%', left: 16, transform: 'translateY(-50%)', size: 7, opacity: 0.8 },
        { top: 50, right: 20, size: 5, opacity: 0.6 },
      ].map((s, i) => (
        <div key={i} className="health-orb__node" style={{
          ...s, width: s.size, height: s.size,
          animation: `float ${3.5 + i * 0.7}s ease-in-out ${i * 0.4}s infinite alternate`
        }} />
      ))}
      {/* Floating stat badges */}
      <div className="health-orb__stat" style={{ top: -10, right: -30, animation: 'float 3.5s ease-in-out infinite' }}>
        <Activity style={{ width: 12, height: 12, color: '#10b981' }} />
        351 Doctors
      </div>
      <div className="health-orb__stat" style={{ bottom: 20, left: -40, animation: 'float 4.5s ease-in-out 1s infinite' }}>
        <Star style={{ width: 12, height: 12, color: '#f59e0b', fill: '#f59e0b' }} />
        Verified
      </div>
    </div>
  );
}

/* ─── Main Component ─── */
export default function PublicLandingPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [stats, setStats] = useState(null);
  const [specialties, setSpecialties] = useState([]);
  const [featuredDoctors, setFeaturedDoctors] = useState([]);
  const [loadingDoctors, setLoadingDoctors] = useState(true);

  // Fetch live stats + specialties + featured doctors
  useEffect(() => {
    Promise.allSettled([
      fetch(`${API}/doctors/meta/stats`).then(r => r.json()),
      fetch(`${API}/doctors/meta/specialties`).then(r => r.json()),
      fetch(`${API}/doctors?limit=3&sort=-rating`).then(r => r.json()),
    ]).then(([statsRes, specsRes, docsRes]) => {
      if (statsRes.status === 'fulfilled' && statsRes.value.success) {
        setStats(statsRes.value.data);
      }
      if (specsRes.status === 'fulfilled' && specsRes.value.success) {
        setSpecialties(specsRes.value.data?.slice(0, 12) || []);
      }
      if (docsRes.status === 'fulfilled' && docsRes.value.success) {
        setFeaturedDoctors(docsRes.value.data || []);
      }
      setLoadingDoctors(false);
    });
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (search.trim()) navigate(`/doctors?search=${encodeURIComponent(search.trim())}`);
    else navigate('/doctors');
  };

  const STAT_ITEMS = [
    { label: 'Verified Doctors', value: stats?.total || 351, suffix: '+' },
    { label: 'Specialties', value: stats?.specialties || 30, suffix: '+' },
    { label: 'Hospitals & Clinics', value: stats?.workplaces || 80, suffix: '+' },
    { label: 'Chambers Available', value: stats?.chambers || 350, suffix: '+' },
  ];

  return (
    <div className="landing-page">

      {/* ═══════════════════ HERO ════════════════════ */}
      <section className="hero" aria-label="Hero">
        <div className="hero__bg-grid" />
        <div className="hero__inner">
          <div className="hero__content">
            <div className="hero__tag">
              <CheckCircle2 style={{ width: 12, height: 12 }} />
              Rajshahi Division Healthcare Platform
            </div>

            <h1 className="hero__title">
              Healthcare,{' '}
              <span className="hero__title-muted">Made Simple.</span>
            </h1>

            <p className="hero__subtitle">
              Find trusted doctors, discover nearby pharmacies, manage appointments,
              and take better care of your health — all in one place.
            </p>

            <div className="hero__actions">
              <Link to="/doctors" className="hero__btn-primary">
                <Stethoscope style={{ width: 18, height: 18 }} />
                Find a Doctor
              </Link>
              <Link to="/pharmacies" className="hero__btn-secondary">
                Explore Niramoy
                <ArrowRight style={{ width: 16, height: 16 }} />
              </Link>
            </div>

            {/* Search Bar */}
            <form onSubmit={handleSearch} className="hero-search" style={{ margin: 0, marginTop: 'var(--sp-6)' }}>
              <div className="hero-search__bar">
                <Search style={{ width: 18, height: 18, color: 'rgba(255,255,255,0.6)', flexShrink: 0 }} />
                <input
                  type="text"
                  className="hero-search__input"
                  placeholder="Search doctors, specialties, hospitals…"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  aria-label="Search doctors and specialties"
                />
                <button type="submit" className="hero-search__btn">
                  Search <ArrowRight style={{ width: 14, height: 14 }} />
                </button>
              </div>
            </form>

            {/* Trust indicators */}
            <div className="hero__trust" style={{ marginTop: 'var(--sp-5)' }}>
              <div className="hero__trust-item">
                <CheckCircle2 style={{ width: 13, height: 13, color: '#5eead4' }} />
                Verified Healthcare Professionals
              </div>
              <div className="hero__trust-item">
                <Clock style={{ width: 13, height: 13, color: '#5eead4' }} />
                Easy Appointment Access
              </div>
              <div className="hero__trust-item">
                <Shield style={{ width: 13, height: 13, color: '#5eead4' }} />
                Trusted Health Information
              </div>
            </div>
          </div>

          {/* 3D Health Orb */}
          <div className="hero__visual">
            <HealthOrb />
          </div>
        </div>
      </section>

      {/* ═════════ QUICK ACTIONS ════════ */}
      <section className="quick-actions" aria-labelledby="services-heading">
        <div style={{ textAlign: 'center', marginBottom: 'var(--sp-10)', padding: '0 var(--sp-6)' }}>
          <div className="section-label">Our Services</div>
          <h2 id="services-heading" style={{ fontFamily: 'var(--font-heading)', fontSize: 'clamp(1.5rem, 3vw, 2rem)', fontWeight: 900, letterSpacing: '-0.025em', color: 'var(--color-text)', marginBottom: 'var(--sp-3)' }}>
            Everything You Need for Healthcare
          </h2>
          <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-base)', maxWidth: 520, margin: '0 auto' }}>
            One platform connecting patients, doctors, pharmacies, hospitals, and diagnostics.
          </p>
        </div>
        <div className="quick-actions__grid">
          {[
            {
              icon: Stethoscope, title: 'Find a Doctor',
              desc: 'Browse 30+ specialties. Filter by hospital, experience, and availability.',
              link: '/doctors', color: 'var(--color-primary)', bg: 'var(--color-primary-50)',
            },
            {
              icon: Pill, title: 'Find a Pharmacy',
              desc: 'Discover pharmacies near you. Search medicines, compare availability.',
              link: '/pharmacies', color: '#7c3aed', bg: '#f5f3ff',
            },
            {
              icon: Building2, title: 'Hospital Resources',
              desc: 'Check real-time bed availability, emergency departments, and hospital info.',
              link: '/hospitals', color: '#0284c7', bg: '#f0f9ff',
            },
            {
              icon: Activity, title: 'Health Services',
              desc: 'Diagnostics, telemedicine, prescriptions, and more healthcare tools.',
              link: '/diagnostics', color: '#d97706', bg: '#fffbeb',
            },
          ].map((item, i) => (
            <Link
              key={i}
              to={item.link}
              className="quick-action-card"
              style={{ '--card-color': item.color, '--card-color-bg': item.bg }}
            >
              <div className="quick-action-icon">
                <item.icon style={{ width: 24, height: 24 }} />
              </div>
              <div>
                <div className="quick-action-title">{item.title}</div>
              </div>
              <p className="quick-action-desc">{item.desc}</p>
              <div className="quick-action-link">
                Explore <ChevronRight style={{ width: 15, height: 15 }} />
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ═════════ LIVE STATS ════════ */}
      <section className="stats-section" aria-labelledby="stats-heading">
        <div style={{ textAlign: 'center', marginBottom: 'var(--sp-10)' }}>
          <div className="section-label" style={{ justifyContent: 'center' }}>Healthcare you can trust</div>
          <h2 id="stats-heading" style={{ fontFamily: 'var(--font-heading)', fontSize: 'clamp(1.5rem, 3vw, 2rem)', fontWeight: 900, letterSpacing: '-0.025em', color: 'var(--color-text)', marginBottom: 'var(--sp-3)' }}>
            Niramoy by the numbers
          </h2>
          <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-base)', maxWidth: 480, margin: '0 auto' }}>
            Real data from our growing Rajshahi healthcare network.
          </p>
        </div>
        <div className="stats-grid">
          {STAT_ITEMS.map((s, i) => (
            <div key={i} className="stat-card">
              <div className="stat-value">
                <StatNumber value={s.value} suffix={s.suffix} />
              </div>
              <div className="stat-label">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ═════════ FEATURED SPECIALTIES ════════ */}
      {specialties.length > 0 && (
        <section className="specialty-section" aria-labelledby="specialties-heading">
          <div className="container">
            <div style={{ textAlign: 'center', marginBottom: 'var(--sp-10)' }}>
              <div className="section-label" style={{ justifyContent: 'center' }}>Browse by specialty</div>
              <h2 id="specialties-heading" style={{ fontFamily: 'var(--font-heading)', fontSize: 'clamp(1.5rem, 3vw, 2rem)', fontWeight: 900, letterSpacing: '-0.025em', color: 'var(--color-text)' }}>
                Find the right specialist
              </h2>
            </div>
            <div className="specialty-grid">
              {specialties.map((spec, i) => {
                const specName = spec.specialty || spec.name || 'Specialty';
                const count = spec.count || 0;
                const meta = getSpecialtyMeta(specName);
                return (
                  <Link
                    key={i}
                    to={`/doctors?specialty=${encodeURIComponent(specName)}`}
                    className="specialty-card"
                    style={{ '--card-color': meta.color }}
                  >
                    <div className="specialty-card__icon" style={{ background: meta.bg, color: meta.color }}>
                      <span style={{ fontSize: '1.6rem' }}>{meta.emoji}</span>
                    </div>
                    <div style={{
                      fontSize: '0.625rem', fontWeight: 800, textTransform: 'uppercase',
                      letterSpacing: '0.06em', color: meta.color, background: meta.bg,
                      padding: '2px 8px', borderRadius: '99px', marginTop: 2
                    }}>
                      Specialized Field
                    </div>
                    <div className="specialty-card__name" style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--color-text)', lineHeight: 1.25 }}>
                      {specName}
                    </div>
                    <div className="specialty-card__count" style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', fontWeight: 600 }}>
                      {count} Verified Doctors
                    </div>
                  </Link>
                );
              })}
            </div>
            <div style={{ textAlign: 'center', marginTop: 'var(--sp-8)' }}>
              <Link to="/doctors" className="btn btn-secondary btn-lg">
                View All Specialties <ArrowRight style={{ width: 16, height: 16 }} />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* ═════════ HOW NIRAMOY WORKS ════════ */}
      <section className="how-section" aria-labelledby="how-heading">
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: 'var(--sp-12)' }}>
            <div className="section-label" style={{ justifyContent: 'center' }}>Simple Process</div>
            <h2 id="how-heading" style={{ fontFamily: 'var(--font-heading)', fontSize: 'clamp(1.5rem, 3vw, 2rem)', fontWeight: 900, letterSpacing: '-0.025em', color: 'var(--color-text)' }}>
              How Niramoy Works
            </h2>
          </div>
          <div className="how-steps">
            {[
              { n: '01', title: 'Search', desc: 'Search by doctor name, specialty, hospital, or location.' },
              { n: '02', title: 'Compare', desc: 'View qualifications, workplaces, chamber schedules.', active: true },
              { n: '03', title: 'Choose', desc: 'Select the right doctor for your specific health need.' },
              { n: '04', title: 'Connect', desc: 'Call the appointment number or walk into the chamber.' },
            ].map((step, i) => (
              <div key={i} className="how-step">
                <div className={`how-step__num ${step.active ? 'active' : ''}`}>{step.n}</div>
                <div className="how-step__title">{step.title}</div>
                <div className="how-step__desc">{step.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═════════ FEATURED DOCTORS ════════ */}
      {(loadingDoctors || featuredDoctors.length > 0) && (
        <section className="featured-doctors" aria-labelledby="doctors-heading">
          <div className="container">
            <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: 'var(--sp-4)', marginBottom: 'var(--sp-8)' }}>
              <div>
                <div className="section-label">Featured Professionals</div>
                <h2 id="doctors-heading" style={{ fontFamily: 'var(--font-heading)', fontSize: 'clamp(1.5rem, 3vw, 2rem)', fontWeight: 900, letterSpacing: '-0.025em', color: 'var(--color-text)' }}>
                  Meet our top doctors
                </h2>
              </div>
              <Link to="/doctors" className="btn btn-ghost" style={{ flexShrink: 0 }}>
                View All <ArrowRight style={{ width: 15, height: 15 }} />
              </Link>
            </div>

            {loadingDoctors ? (
              <div className="doctor-cards-grid">
                {[1,2,3].map(i => (
                  <div key={i} className="doctor-card">
                    <div className="skeleton" style={{ width: 60, height: 60, borderRadius: 12 }} />
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      <div className="skeleton" style={{ height: 14, width: '70%' }} />
                      <div className="skeleton" style={{ height: 12, width: '50%' }} />
                      <div className="skeleton" style={{ height: 12, width: '60%' }} />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="doctor-cards-grid">
                {featuredDoctors.map((doc, i) => (
                  <FeaturedDoctorCard key={doc._id || i} doctor={doc} />
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      {/* ═════════ ABOUT ════════ */}
      <section style={{ padding: 'var(--sp-20) 0', background: 'var(--color-surface)' }}>
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--sp-16)', alignItems: 'center' }}>
            <div>
              <div className="section-label">Our Mission</div>
              <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 'clamp(1.75rem, 3vw, 2.5rem)', fontWeight: 900, letterSpacing: '-0.03em', color: 'var(--color-text)', marginBottom: 'var(--sp-5)', lineHeight: 1.15 }}>
                Healthcare should<br/>feel simpler.
              </h2>
              <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--text-base)', lineHeight: 1.8, marginBottom: 'var(--sp-5)' }}>
                Niramoy was built to make healthcare discovery more accessible in Bangladesh —
                bringing doctors, pharmacies, hospitals, and patients into one connected digital experience.
              </p>
              <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--text-base)', lineHeight: 1.8, marginBottom: 'var(--sp-6)' }}>
                We believe that finding the right doctor shouldn't be complicated. With clear information,
                real contact details, and verified sources, we help patients make informed decisions.
              </p>
              <Link to="/doctors" className="btn btn-primary btn-lg">
                Start Exploring <ArrowRight style={{ width: 16, height: 16 }} />
              </Link>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-4)' }}>
              {[
                { icon: HeartHandshake, title: 'Human-centered care', desc: 'We put patients first, making healthcare information clear, honest, and accessible.' },
                { icon: Shield, title: 'Verified information', desc: 'Doctor profiles sourced from official directories with clear source attribution.' },
                { icon: Users, title: 'Growing network', desc: 'Expanding our network across Rajshahi to cover more specialties and locations.' },
                { icon: Sparkles, title: 'Modern technology', desc: 'Built with modern web technology for a fast, reliable healthcare experience.' },
              ].map((item, i) => (
                <div key={i} style={{ display: 'flex', gap: 'var(--sp-4)', padding: 'var(--sp-4)', borderRadius: 'var(--radius-lg)', border: '1.5px solid var(--color-border)', background: 'var(--color-bg)', transition: 'all var(--duration-normal) var(--ease)' }}>
                  <div style={{ width: 44, height: 44, borderRadius: 'var(--radius-md)', background: 'var(--color-primary-50)', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <item.icon style={{ width: 20, height: 20 }} />
                  </div>
                  <div>
                    <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, color: 'var(--color-text)', marginBottom: 4, fontSize: 'var(--text-sm)' }}>{item.title}</div>
                    <div style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)', lineHeight: 1.6 }}>{item.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ═════════ FINAL CTA ════════ */}
      <section className="cta-section">
        <div className="cta-section__inner">
          <div className="section-label" style={{ justifyContent: 'center', background: 'rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.9)', marginBottom: 'var(--sp-6)', display: 'inline-flex' }}>
            Your Healthcare Journey
          </div>
          <h2 className="cta-section__title">Your healthcare journey<br/>starts here.</h2>
          <p className="cta-section__subtitle">
            Find the right care, connect with healthcare professionals, and manage your healthcare experience with Niramoy.
          </p>
          <div style={{ display: 'flex', gap: 'var(--sp-4)', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/doctors" className="hero__btn-primary" style={{ fontSize: 'var(--text-base)' }}>
              <Stethoscope style={{ width: 18, height: 18 }} />
              Find a Doctor
            </Link>
            <Link to="/register" className="hero__btn-secondary" style={{ fontSize: 'var(--text-base)' }}>
              Explore Niramoy <ArrowRight style={{ width: 16, height: 16 }} />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

/* ─── Featured Doctor Card ─── */
function FeaturedDoctorCard({ doctor }) {
  const initials = (doctor.name || 'Dr')
    .replace(/^(Prof\.|Dr\.)\s*/i, '')
    .split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase();

  const phone = doctor.chambers?.[0]?.appointment_numbers?.[0];

  return (
    <div className="doctor-card card-hover">
      {/* Specialized Field Tag at Top */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 6, marginBottom: 'var(--sp-3)' }}>
        <span style={{
          display: 'inline-flex', alignItems: 'center', gap: 5,
          padding: '3px 10px', borderRadius: 'var(--radius-full)',
          background: 'var(--color-primary-50)', color: 'var(--color-primary)',
          fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase',
          letterSpacing: '0.04em', border: '1px solid var(--color-primary-100)'
        }}>
          <Stethoscope style={{ width: 12, height: 12 }} />
          {doctor.specialty}
        </span>
        {doctor.experience && (
          <span style={{ fontSize: '0.68rem', color: 'var(--color-text-muted)', fontWeight: 600 }}>
            {doctor.experience}
          </span>
        )}
      </div>

      {/* Header */}
      <div style={{ display: 'flex', gap: 'var(--sp-4)', alignItems: 'flex-start' }}>
        {/* Avatar */}
        <div style={{ position: 'relative', flexShrink: 0 }}>
          {doctor.imageUrl ? (
            <img
              src={doctor.imageUrl}
              alt={doctor.name}
              loading="lazy"
              onError={e => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
              style={{ width: 60, height: 60, borderRadius: 'var(--radius-lg)', objectFit: 'cover', border: '2px solid var(--color-border)' }}
            />
          ) : null}
          <div style={{
            width: 60, height: 60, borderRadius: 'var(--radius-lg)',
            background: 'linear-gradient(135deg, var(--color-primary) 0%, var(--color-secondary) 100%)',
            display: doctor.imageUrl ? 'none' : 'flex',
            alignItems: 'center', justifyContent: 'center',
            color: 'white', fontWeight: 900, fontSize: '1.1rem',
            fontFamily: 'var(--font-heading)'
          }}>
            {initials}
          </div>
          {doctor.verified && (
            <div style={{
              position: 'absolute', bottom: -4, right: -4,
              width: 18, height: 18, borderRadius: '50%',
              background: 'var(--color-success)', border: '2px solid white',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <CheckCircle2 style={{ width: 10, height: 10, color: 'white' }} />
            </div>
          )}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, color: 'var(--color-text)', fontSize: 'var(--text-base)', marginBottom: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {doctor.name}
          </div>
          <div style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--color-primary)', marginBottom: 3 }}>
            {doctor.specialty}
          </div>
          {doctor.rating > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <Star style={{ width: 12, height: 12, fill: '#f59e0b', stroke: '#f59e0b' }} />
              <span style={{ fontSize: 'var(--text-xs)', fontWeight: 700, color: '#b45309' }}>{doctor.rating.toFixed(1)}</span>
              {doctor.reviewCount > 0 && <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>({doctor.reviewCount})</span>}
            </div>
          )}
        </div>
      </div>

      {/* Info */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-2)' }}>
        {doctor.qualifications && (
          <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', lineHeight: 1.5 }}>
            {doctor.qualifications}
          </p>
        )}
        {doctor.workplace && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <Building2 style={{ width: 12, height: 12, color: 'var(--color-text-muted)', flexShrink: 0 }} />
            <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {doctor.workplace}
            </span>
          </div>
        )}
        {doctor.chambers?.[0]?.address && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <MapPin style={{ width: 12, height: 12, color: 'var(--color-text-muted)', flexShrink: 0 }} />
            <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {doctor.chambers[0].address}
            </span>
          </div>
        )}
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', gap: 'var(--sp-2)', marginTop: 'auto', paddingTop: 'var(--sp-3)', borderTop: '1px solid var(--color-border-light)' }}>
        <Link
          to={`/doctors/${doctor.slug}`}
          className="btn btn-primary btn-sm"
          style={{ flex: 1, justifyContent: 'center' }}
        >
          View Profile
        </Link>
        {phone && (
          <a
            href={`tel:${phone}`}
            className="btn btn-secondary btn-sm"
            aria-label={`Call ${doctor.name}`}
          >
            <Phone style={{ width: 13, height: 13 }} />
          </a>
        )}
      </div>
    </div>
  );
}
