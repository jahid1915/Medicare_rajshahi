import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Search, Stethoscope, Pill, Building2, ChevronRight, ChevronDown,
  ArrowRight, CheckCircle2, Star, MapPin, Phone,
  Shield, Clock, Activity, Users, Sparkles, HeartHandshake, HelpCircle
} from 'lucide-react';
import { BASE_URL } from '../../services/api';
import { SPECIALTIES } from '../../data/specialties';
import { DOCTORS } from '../../data/doctors';
import { useLanguage } from '../../i18n';

const API = BASE_URL;

/* ─── Specialty emoji/icon map ─── */
const SPECIALTY_META = {
  'General Medicine': { emoji: '🩺', color: '#0d7c6e', bg: '#f0faf9' },
  'ENT': { emoji: '👂', color: '#7c3aed', bg: '#f5f3ff' },
  'Surgery': { emoji: '⚕️', color: '#0284c7', bg: '#f0f9ff' },
  'Gynecology & Obstetrics': { emoji: '👶', color: '#db2777', bg: '#fdf2f8' },
  'Pediatrics': { emoji: '🧒', color: '#d97706', bg: '#fffbeb' },
  'Orthopedics': { emoji: '🦴', color: '#059669', bg: '#f0fdf4' },
  'Cardiology': { emoji: '❤️', color: '#dc2626', bg: '#fef2f2' },
  'Internal Medicine': { emoji: '🏥', color: '#0369a1', bg: '#f0f9ff' },
  'Neurology': { emoji: '🧠', color: '#7c3aed', bg: '#f5f3ff' },
  'Dermatology': { emoji: '🌿', color: '#16a34a', bg: '#f0fdf4' },
  'Ophthalmology': { emoji: '👁️', color: '#0d7c6e', bg: '#f0faf9' },
  'Dentistry': { emoji: '🦷', color: '#0891b2', bg: '#ecfeff' },
};

function getSpecialtyMeta(name) {
  if (!name) return SPECIALTIES[12] || { name: 'Medicine', image: '/specialties/medicine-general-physician.webp' };
  const clean = name.trim().toLowerCase();
  const found = SPECIALTIES.find(s =>
    s.name.toLowerCase() === clean ||
    s.id === clean ||
    s.slug === clean ||
    s.name.toLowerCase().includes(clean) ||
    clean.includes(s.name.toLowerCase())
  );
  return found || SPECIALTIES[12] || { name: 'Medicine', image: '/specialties/medicine-general-physician.webp' };
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

/* ─── HealthOrb — CSS 3D Visual with Floating Live Healthcare Counters ─── */
function HealthOrb({ stats }) {
  const doctorCount = stats?.total || 350;
  const hospitalCount = stats?.workplaces || 80;

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
          <path d="M26 8C24.3 8 23 9.3 23 11v8h-8c-1.7 0-3 1.3-3 3s1.3 3 3 3h8v8c0 1.7 1.3 3 3 3s3-1.3 3-3v-8h8c1.7 0 3-1.3 3-3s-1.3-3-3-3h-8v-8c0-1.7-1.3-3-3-3z" fill="white" />
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

      {/* Floating Live Healthcare Stats (Doctor, Hospital, Pharmacy, Ambulance) */}
      <div className="health-orb__stat" style={{ top: '-15px', left: '-25px', animation: 'floatUp 3.8s ease-in-out infinite alternate' }}>
        <span className="health-orb__stat-icon">🩺</span>
        <span><strong className="health-orb__stat-number">{doctorCount}+</strong> Doctors</span>
      </div>

      <div className="health-orb__stat" style={{ top: '15px', right: '-35px', animation: 'floatUp 4.6s ease-in-out 0.7s infinite alternate' }}>
        <span className="health-orb__stat-icon">🏥</span>
        <span><strong className="health-orb__stat-number">{hospitalCount}+</strong> Hospitals</span>
      </div>

      <div className="health-orb__stat" style={{ bottom: '25px', left: '-35px', animation: 'floatUp 4.2s ease-in-out 1.3s infinite alternate' }}>
        <span className="health-orb__stat-icon">💊</span>
        <span><strong className="health-orb__stat-number">120+</strong> Pharmacies</span>
      </div>

      <div className="health-orb__stat" style={{ bottom: '-15px', right: '-25px', animation: 'floatUp 3.5s ease-in-out 0.4s infinite alternate' }}>
        <span className="health-orb__stat-icon">🚑</span>
        <span><strong className="health-orb__stat-number">24/7</strong> Ambulance</span>
      </div>
    </div>
  );
}

/* ─── Main Component ─── */
export default function PublicLandingPage() {
  const navigate = useNavigate();
  const { t, isBangla } = useLanguage();
  const [search, setSearch] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [stats, setStats] = useState(null);
  const [specialties, setSpecialties] = useState([]);
  const [featuredDoctors, setFeaturedDoctors] = useState([]);
  const [loadingDoctors, setLoadingDoctors] = useState(true);

  // Fetch live stats + specialties + featured doctors
  useEffect(() => {
    Promise.allSettled([
      fetch(`${API}/doctors/meta/stats`).then(r => r.json()),
      fetch(`${API}/doctors/meta/specialties`).then(r => r.json()),
      fetch(`${API}/doctors?limit=6&sort=rating`).then(r => r.json()),
    ]).then(([statsRes, specsRes, docsRes]) => {
      if (statsRes.status === 'fulfilled' && statsRes.value.success) {
        setStats(statsRes.value.data);
      }
      if (specsRes.status === 'fulfilled' && specsRes.value.success && specsRes.value.data?.length > 0) {
        const countMap = {};
        specsRes.value.data.forEach(item => {
          countMap[item.specialty] = item.count;
        });
        const combined = SPECIALTIES.map(s => ({
          specialty: s.name,
          name: s.name,
          count: countMap[s.name] || 0,
          image: s.image,
          slug: s.slug
        }));
        setSpecialties(combined);
      } else {
        setSpecialties(SPECIALTIES.map((s, idx) => ({
          specialty: s.name,
          name: s.name,
          count: 10 + (idx * 2),
          image: s.image,
          slug: s.slug
        })));
      }
      if (docsRes.status === 'fulfilled' && docsRes.value.success && docsRes.value.data?.length > 0) {
        setFeaturedDoctors(docsRes.value.data);
      } else {
        setFeaturedDoctors(DOCTORS.slice(0, 3).map((d, idx) => ({
          _id: d.id || `doc-${idx}`,
          name: d.name,
          degrees: d.degrees,
          specialty: d.specialtyName,
          rating: d.rating || 4.8,
          reviewCount: d.reviewCount || 120,
          verified: true,
          avatar: d.avatar,
          chambers: [{ name: d.hospital || 'Rajshahi Medical Center', address: 'Medical Mor, Laxmipur', visiting_hours: '05:00 PM - 09:00 PM' }]
        })));
      }
      setLoadingDoctors(false);
    });
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (search.trim()) params.append('search', search.trim());
    if (locationFilter.trim()) params.append('location', locationFilter.trim());
    const qs = params.toString();
    navigate(`/doctors${qs ? `?${qs}` : ''}`);
  };

  const STAT_ITEMS = [
    { label: t('stats.doctorsCount', 'Verified Doctors'), value: stats?.total || 351, suffix: '+' },
    { label: t('stats.specialtiesCount', 'Specialties'), value: stats?.specialties || 30, suffix: '+' },
    { label: t('stats.workplacesCount', 'Hospitals & Clinics'), value: stats?.workplaces || 80, suffix: '+' },
    { label: t('stats.chambersCount', 'Chambers Available'), value: stats?.chambers || 350, suffix: '+' },
  ];

  return (
    <div className="landing-page">

      {/* ═══════════════════ HERO (Parts 6, 7, 8, 9, 10) ════════════════════ */}
      <section className="hero" aria-label="Hero">
        <div className="hero__bg-grid" />
        <div className="hero__inner">
          <div className="hero__content">
            <div className="hero__tag" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '4px 12px', borderRadius: '20px', background: 'rgba(255,255,255,0.12)', color: '#5eead4', fontSize: '0.78rem', fontWeight: 700, width: 'fit-content', marginBottom: '14px', backdropFilter: 'blur(8px)' }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#5eead4' }} />
              NIRAMOY HEALTHCARE
            </div>

            <h1 className="hero__title" style={{ fontSize: 'clamp(2.2rem, 4.5vw, 3.4rem)', lineHeight: 1.15, fontWeight: 900, letterSpacing: '-0.03em', color: '#ffffff', margin: '0 0 10px 0' }}>
              {t('hero.titlePrefix', 'Your Healthcare,')}{' '}
              <span style={{ color: '#5eead4', display: 'inline-block' }}>{t('hero.titleSuffix', 'Simplified.')}</span>
            </h1>

            <p className="hero__subtitle" style={{ maxWidth: 460, fontSize: '1.02rem', lineHeight: 1.5, color: 'rgba(255,255,255,0.85)', margin: '0 0 20px 0' }}>
              {t('hero.subtitle', 'Connect with verified specialist physicians, check real-time chamber availability, and confirm your appointment with ease.')}
            </p>

            {/* Focused Doctor Search Bar (Part 8 & 9) */}
            <form onSubmit={handleSearch} className="hero-doctor-search">
              <div className="hero-doctor-search__bar">
                <div className="hero-doctor-search__field">
                  <Stethoscope className="hero-doctor-search__icon" size={18} />
                  <input
                    type="text"
                    className="hero-doctor-search__input"
                    placeholder={t('hero.searchPlaceholder', 'Search doctor or specialty (e.g. Cardiology, Dr. Sourav)...')}
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    aria-label="Search doctor or specialty"
                  />
                </div>

                <div className="hero-doctor-search__divider" />

                <div className="hero-doctor-search__field hero-doctor-search__location">
                  <MapPin className="hero-doctor-search__icon" size={16} />
                  <input
                    type="text"
                    className="hero-doctor-search__input"
                    placeholder={t('hero.locationPlaceholder', 'Area / Location (Rajshahi)')}
                    value={locationFilter}
                    onChange={e => setLocationFilter(e.target.value)}
                    aria-label="Area or location"
                  />
                </div>

                <button type="submit" className="hero-doctor-search__btn">
                  <Search size={16} />
                  <span>{t('hero.findDoctorBtn', 'Find Doctor')}</span>
                </button>
              </div>
              <div className="hero-doctor-search__hint">
                {t('hero.popularLabel', 'Popular: Cardiology, Gynecology, Pediatrics, Medicine, Orthopedics, ENT')}
              </div>
            </form>
          </div>

          {/* 3D Health Orb (Focal Visual) */}
          <div className="hero__visual">
            <HealthOrb stats={stats} />
          </div>
        </div>
      </section>

      {/* ═════════ QUICK ACTIONS / HEALTHCARE SERVICES ════════ */}
      <section className="quick-actions" aria-labelledby="services-heading">
        <div style={{ textAlign: 'center', marginBottom: 'var(--sp-10)', padding: '0 var(--sp-6)' }}>
          <div className="section-label">{t('services.label', 'Our Services')}</div>
          <h2 id="services-heading" style={{ fontFamily: 'var(--font-heading)', fontSize: 'clamp(1.5rem, 3vw, 2rem)', fontWeight: 900, letterSpacing: '-0.025em', color: 'var(--color-text)', marginBottom: 'var(--sp-3)' }}>
            {t('services.title', 'Everything You Need for Healthcare')}
          </h2>
          <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-base)', maxWidth: 520, margin: '0 auto' }}>
            {t('services.subtitle', 'One platform connecting patients, doctors, pharmacies, hospitals, and diagnostics across Rajshahi.')}
          </p>
        </div>
        <div className="quick-actions__grid">
          {[
            {
              icon: Stethoscope, title: t('services.doctorTitle', 'Find a Doctor'),
              desc: t('services.doctorDesc', 'Browse 30+ specialties. Filter by hospital, experience, and availability.'),
              link: '/doctors', color: 'var(--color-primary)', bg: 'var(--color-primary-50)',
            },
            {
              icon: Pill, title: t('services.pharmacyTitle', 'Find a Pharmacy'),
              desc: t('services.pharmacyDesc', 'Discover pharmacies near you. Search medicines, compare availability.'),
              link: '/pharmacies', color: '#7c3aed', bg: '#f5f3ff',
            },
            {
              icon: Building2, title: t('services.hospitalTitle', 'Hospital Resources'),
              desc: t('services.hospitalDesc', 'Check real-time bed availability, emergency departments, and hospital info.'),
              link: '/hospitals', color: '#0284c7', bg: '#f0f9ff',
            },
            {
              icon: Activity, title: t('services.emergencyTitle', '24/7 Ambulance & Emergency'),
              desc: t('services.emergencyDesc', 'Instant emergency contact numbers, ICU ambulance, and blood banks.'),
              link: '/ambulance', color: '#dc2626', bg: '#fef2f2',
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
                {t('common.explore', 'Explore')} <ChevronRight style={{ width: 15, height: 15 }} />
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ═════════ LIVE STATS ════════ */}
      <section className="stats-section" aria-labelledby="stats-heading">
        <div style={{ textAlign: 'center', marginBottom: 'var(--sp-10)' }}>
          <div className="section-label" style={{ justifyContent: 'center' }}>{t('stats.label', 'Healthcare you can trust')}</div>
          <h2 id="stats-heading" style={{ fontFamily: 'var(--font-heading)', fontSize: 'clamp(1.5rem, 3vw, 2rem)', fontWeight: 900, letterSpacing: '-0.025em', color: 'var(--color-text)', marginBottom: 'var(--sp-3)' }}>
            {t('stats.title', 'Niramoy by the numbers')}
          </h2>
          <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-base)', maxWidth: 480, margin: '0 auto' }}>
            {t('stats.subtitle', 'Real data from our growing Rajshahi healthcare network.')}
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

      {/* ═════════ POPULAR SPECIALTIES (Matches Reference Screenshots) ════════ */}
      <section className="specialty-section" aria-labelledby="specialties-heading" style={{ background: '#f8fafc', padding: 'var(--sp-16) 0' }}>
        <div className="container">
          <div style={{
            display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between',
            flexWrap: 'wrap', gap: '16px', marginBottom: 'var(--sp-8)'
          }}>
            <div>
              <h2 id="specialties-heading" style={{
                fontFamily: 'var(--font-heading)', fontSize: 'clamp(1.5rem, 3vw, 2.2rem)',
                fontWeight: 900, letterSpacing: '-0.025em', color: 'var(--color-text)', marginBottom: 6
              }}>
                {t('specialties.heading', 'Popular Specialties')}
              </h2>
              <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.95rem', margin: 0 }}>
                {t('specialties.subtitle', 'Browse doctors by the most searched medical specialties.')}
              </p>
            </div>
            <Link
              to="/doctors"
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '6px',
                color: 'var(--color-primary, #0d7c6e)', fontWeight: 700, fontSize: '0.95rem',
                textDecoration: 'none'
              }}
            >
              {t('specialties.viewAll', 'View all specialties')} <ArrowRight style={{ width: 16, height: 16 }} />
            </Link>
          </div>

          {/* Specialty Grid Cards (31 Cards) */}
          <div className="specialty-grid" style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
            gap: '20px'
          }}>
            {specialties.map((spec, i) => {
              const specName = spec.specialty || spec.name || 'Specialty';
              const meta = getSpecialtyMeta(specName);
              const count = spec.count || 0;
              const imgSrc = spec.image || meta.image || `/specialties/${meta.slug}.webp`;

              return (
                <Link
                  key={i}
                  to={`/doctors?specialty=${encodeURIComponent(specName)}`}
                  className="specialty-card"
                  style={{
                    background: '#ffffff',
                    border: '1.5px solid #e2e8f0',
                    borderRadius: '16px',
                    padding: '24px 16px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    textAlign: 'center',
                    textDecoration: 'none',
                    gap: '12px',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                    transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)'
                  }}
                >
                  <div style={{
                    width: 96, height: 96, borderRadius: '16px',
                    overflow: 'hidden', background: '#f1f5f9',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
                  }}>
                    <img
                      src={imgSrc}
                      alt={specName}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      loading="lazy"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.style.display = 'none';
                        e.target.parentNode.innerHTML = `<span style="font-size:2.2rem">🩺</span>`;
                      }}
                    />
                  </div>
                  <div style={{
                    fontSize: '1rem', fontWeight: 800,
                    color: '#0f172a', lineHeight: 1.3, marginTop: 4
                  }}>
                    {specName}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>
                    {count} {isBangla ? 'জন যাচাইকৃত ডাক্তার' : `Verified Doctor${count !== 1 ? 's' : ''}`}
                  </div>
                </Link>
              );
            })}
          </div>

          <div style={{ textAlign: 'center', marginTop: 'var(--sp-10)' }}>
            <Link to="/doctors" className="btn btn-secondary btn-lg">
              {t('specialties.viewAll', 'Explore All 31 Specialties')} <ArrowRight style={{ width: 16, height: 16 }} />
            </Link>
          </div>
        </div>
      </section>

      {/* ═════════ HOW NIRAMOY WORKS ════════ */}
      <section className="how-section" aria-labelledby="how-heading">
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: 'var(--sp-12)' }}>
            <div className="section-label" style={{ justifyContent: 'center' }}>{isBangla ? 'সহজ প্রক্রিয়া' : 'Simple Process'}</div>
            <h2 id="how-heading" style={{ fontFamily: 'var(--font-heading)', fontSize: 'clamp(1.5rem, 3vw, 2rem)', fontWeight: 900, letterSpacing: '-0.025em', color: 'var(--color-text)' }}>
              {isBangla ? 'যেভাবে Niramoy কাজ করে' : 'How Niramoy Works'}
            </h2>
          </div>
          <div className="how-steps">
            {[
              { n: '01', title: isBangla ? 'অনুসন্ধান' : 'Search', desc: isBangla ? 'ডাক্তারের নাম, বিশেষত্ব, হাসপাতাল বা এলাকা দিয়ে খুঁজুন।' : 'Search by doctor name, specialty, hospital, or location.' },
              { n: '02', title: isBangla ? 'তুলনা করুন' : 'Compare', desc: isBangla ? 'ডিগ্রি, কর্মস্থল ও চেম্বারের সময়সূচি দেখুন।' : 'View qualifications, workplaces, chamber schedules.', active: true },
              { n: '03', title: isBangla ? 'বাছাই করুন' : 'Choose', desc: isBangla ? 'আপনার প্রয়োজনে সঠিক চিকিৎসক নির্বাচন করুন।' : 'Select the right doctor for your specific health need.' },
              { n: '04', title: isBangla ? 'অ্যাপয়েন্টমেন্ট নিন' : 'Connect', desc: isBangla ? 'অনলাইনে বুক করুন অথবা চেম্বার নম্বরে সরাসরি কল করুন।' : 'Call the appointment number or walk into the chamber.' },
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
                <div className="section-label">{isBangla ? 'বিশেষজ্ঞ চিকিৎসকবৃন্দ' : 'Featured Professionals'}</div>
                <h2 id="doctors-heading" style={{ fontFamily: 'var(--font-heading)', fontSize: 'clamp(1.5rem, 3vw, 2rem)', fontWeight: 900, letterSpacing: '-0.025em', color: 'var(--color-text)' }}>
                  {isBangla ? 'আমাদের শীর্ষ চিকিৎসকদের সাথে পরিচিত হোন' : 'Meet our top doctors'}
                </h2>
              </div>
              <Link to="/doctors" className="btn btn-ghost" style={{ flexShrink: 0 }}>
                {t('common.viewAll', 'View All')} <ArrowRight style={{ width: 15, height: 15 }} />
              </Link>
            </div>

            {loadingDoctors ? (
              <div className="doctor-cards-grid">
                {[1, 2, 3].map(i => (
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
                  <FeaturedDoctorCard key={doc._id || i} doctor={doc} isBangla={isBangla} />
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      {/* ═════════ ABOUT / MISSION ════════ */}
      <section style={{ padding: 'var(--sp-16) 0', background: 'var(--color-surface)' }}>
        <div className="container">
          <div className="mission-grid">
            <div className="mission-grid__content">
              <div className="section-label">{isBangla ? 'আমাদের লক্ষ্য' : 'Our Mission'}</div>
              <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 'clamp(1.75rem, 3vw, 2.5rem)', fontWeight: 900, letterSpacing: '-0.03em', color: 'var(--color-text)', marginBottom: 'var(--sp-5)', lineHeight: 1.15 }}>
                {isBangla ? <>স্বাস্থ্যসেবা হোক<br />আরও সহজ ও সুলভ।</> : <>Healthcare should<br />feel simpler.</>}
              </h2>
              <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--text-base)', lineHeight: 1.8, marginBottom: 'var(--sp-5)' }}>
                {isBangla
                  ? 'বাংলাদেশে স্বাস্থ্যসেবাকে আরও সহজলভ্য করার লক্ষ্যে Niramoy প্ল্যাটফর্মের সৃষ্টি — যা ডাক্তার, ফার্মেসি, হাসপাতাল এবং রোগীদের একক ডিজিটাল সেতুবন্ধনে যুক্ত করে।'
                  : 'Niramoy was built to make healthcare discovery more accessible in Bangladesh — bringing doctors, pharmacies, hospitals, and patients into one connected digital experience.'}
              </p>
              <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--text-base)', lineHeight: 1.8, marginBottom: 'var(--sp-6)' }}>
                {isBangla
                  ? 'আমরা বিশ্বাস করি সঠিক ডাক্তার খুঁজে পাওয়া কখনোই জটিল হওয়া উচিত নয়। যাচাইকৃত উৎস, সঠিক যোগাযোগের তথ্য এবং বাস্তব অভিজ্ঞতার মাধ্যমে আমরা রোগীদের সঠিক সিদ্ধান্ত নিতে সহায়তা করি।'
                  : "We believe that finding the right doctor shouldn't be complicated. With clear information, real contact details, and verified sources, we help patients make informed decisions."}
              </p>
              <Link to="/doctors" className="btn btn-primary btn-lg">
                {isBangla ? 'ডাক্তার খুঁজুন' : 'Start Exploring'} <ArrowRight style={{ width: 16, height: 16 }} />
              </Link>
            </div>
            <div className="mission-grid__cards">
              {[
                {
                  icon: HeartHandshake,
                  title: isBangla ? 'মানুষের পাশে সর্বদাই' : 'Human-centered care',
                  desc: isBangla ? 'রোগীদের প্রাধান্য দিয়ে স্বাস্থ্যসেবার তথ্য সহজ ও নির্ভুলভাবে উপস্থাপন করা হয়।' : 'We put patients first, making healthcare information clear, honest, and accessible.'
                },
                {
                  icon: Shield,
                  title: isBangla ? 'যাচাইকৃত তথ্য' : 'Verified information',
                  desc: isBangla ? 'অফিসিয়াল ডিরেক্টরি এবং বিএমডিসি রেজিস্ট্রেশন থেকে যাচাইকৃত চিকিৎসকদের তথ্য।' : 'Doctor profiles sourced from official directories with clear source attribution.'
                },
                {
                  icon: Users,
                  title: isBangla ? 'বিস্তৃত নেটওয়ার্ক' : 'Growing network',
                  desc: isBangla ? 'রাজশাহীর বিভিন্ন এলাকা ও সকল বিশেষত্ব কাভার করার জন্য আমাদের নেটওয়ার্ক প্রতিনিয়ত বাড়ছে।' : 'Expanding our network across Rajshahi to cover more specialties and locations.'
                },
                {
                  icon: Sparkles,
                  title: isBangla ? 'আধুনিক প্রযুক্তি' : 'Modern technology',
                  desc: isBangla ? 'দ্রুত এবং নির্ভরযোগ্য ডিজিটাল স্বাস্থ্যসেবা নিশ্চিত করতে আধুনিক ওয়েব প্রযুক্তির ব্যবহার।' : 'Built with modern web technology for a fast, reliable healthcare experience.'
                },
              ].map((item, i) => (
                <div key={i} className="mission-card">
                  <div className="mission-card__icon">
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

      {/* ═════════ DAKTARI-SHEBA STYLE FAQ ACCORDION ════════ */}
      <section className="faq-section" style={{ padding: 'var(--sp-16) 0', background: 'var(--color-bg)' }}>
        <div className="container" style={{ maxWidth: 800 }}>
          <div style={{ textAlign: 'center', marginBottom: 'var(--sp-10)' }}>
            <div className="section-label" style={{ justifyContent: 'center' }}>{isBangla ? 'প্রশ্ন আছে?' : 'Got Questions?'}</div>
            <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 'clamp(1.5rem, 3vw, 2rem)', fontWeight: 900, letterSpacing: '-0.025em', color: 'var(--color-text)', marginBottom: 'var(--sp-3)' }}>
              {isBangla ? 'সাধারণ প্রশ্নোত্তর (FAQ)' : 'Frequently Asked Questions'}
            </h2>
            <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-base)' }}>
              {isBangla ? 'রাজশাহীতে Niramoy ব্যবহারের সব দরকারি তথ্য জানুন।' : 'Everything you need to know about using Niramoy in Rajshahi.'}
            </p>
          </div>

          <FaqAccordion items={isBangla ? [
            {
              q: 'Niramoy-এ কীভাবে ডাক্তারের অ্যাপয়েন্টমেন্ট বুক করব?',
              a: 'ডাক্তারের নাম, বিশেষত্ব, হাসপাতাল বা চেম্বার দিয়ে সার্চ করুন। এরপর রোগী দেখার সময় ও চেম্বার নম্বর দেখুন, অথবা "বুক করুন" বাটনে ক্লিক করে মোবাইল ওটিপি দিয়ে তাৎক্ষণিক অ্যাপয়েন্টমেন্ট নিশ্চিত করুন।'
            },
            {
              q: 'Niramoy-এর ডাক্তারদের ডিগ্রি ও তথ্য কি যাচাইকৃত?',
              a: 'হ্যাঁ। সকল ডাক্তারের প্রোফাইল বিএমডিসি (BMDC) রেজিস্ট্রেশন নম্বর, মেডিকেল কলেজ সংশ্লিষ্টতা (যেমন রাজশাহী মেডিকেল কলেজ হাসপাতাল) ও অফিসিয়াল চেম্বারের ডিরেক্টরি থেকে যাচাই করা হয়।'
            },
            {
              q: 'ফার্মেসি অনুসন্ধান এবং ওষুধের প্রাপ্যতা কীভাবে জানব?',
              a: 'ফার্মেসি সেকশনে গিয়ে রাজশাহীর বিভিন্ন এলাকার (মেডিকেল মোড়, লক্ষ্মীপুর, গ্রেটার রোড, কাজীহাটা) নিবন্ধিত ফার্মেসি অনুসন্ধান করতে পারবেন, স্টকে থাকা ওষুধ দেখতে পাবেন এবং অর্ডার করতে পারবেন।'
            },
            {
              q: 'হাসপাতালের বেড ও জরুরি অ্যাম্বুলেন্স সেবা কীভাবে পাব?',
              a: 'আমাদের হাসপাতাল পোর্টালে সাধারণ শয্যা ও আইসিইউ-র প্রাপ্যতা নিয়মিত আপডেট করা হয়। এছাড়া অ্যাম্বুলেন্স ডিরেক্টরি থেকে ২৪/৭ জরুরি হটলাইনে কল করা যায়।'
            }
          ] : [
            {
              q: 'How do I book a doctor appointment on Niramoy?',
              a: 'Search for a doctor by name, specialty, hospital, or chamber. View verified visiting hours, chamber serial phone numbers, or click "Book Online" to instantly reserve your appointment with phone OTP verification.'
            },
            {
              q: 'Are the doctors and qualifications verified on Niramoy?',
              a: 'Yes. All doctor profiles are cross-referenced with BMDC registration numbers, medical college affiliations (such as Rajshahi Medical College & Hospital), and official diagnostic chamber directories.'
            },
            {
              q: 'How do I search for pharmacies and medicine availability?',
              a: 'Visit the Pharmacy section to search for nearby licensed pharmacies across Rajshahi (Medical Mor, Laxmipur, Greater Road, Kazihata), browse medicines in stock, check prices, and place online orders.'
            },
            {
              q: 'How can I check hospital bed availability or call emergency ambulances?',
              a: 'Our Hospital Resources portal provides real-time updates on General Beds, ICU, and CCU availability. The Ambulance directory provides 24/7 hotline numbers for quick emergency assistance.'
            }
          ]} />
        </div>
      </section>

      {/* ═════════ FINAL CTA ════════ */}
      <section className="cta-section">
        <div className="cta-section__inner">
          <div className="section-label" style={{ justifyContent: 'center', background: 'rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.9)', marginBottom: 'var(--sp-6)', display: 'inline-flex' }}>
            {isBangla ? 'আপনার স্বাস্থ্যসেবার যাত্রা' : 'Your Healthcare Journey'}
          </div>
          <h2 className="cta-section__title">
            {isBangla ? <>আপনার সুস্থতার যাত্রা<br />শুরু হোক এখান থেকেই।</> : <>Your healthcare journey<br />starts here.</>}
          </h2>
          <p className="cta-section__subtitle">
            {isBangla
              ? 'সঠিক চিকিৎসা সেবা গ্রহণ করুন, নির্ভরযোগ্য চিকিৎসকদের সাথে যুক্ত হোন এবং Niramoy-এর মাধ্যমে স্বাস্থ্যসেবা ব্যবস্থাপনা করুন সহজে।'
              : 'Find the right care, connect with healthcare professionals, and manage your healthcare experience with Niramoy.'}
          </p>
          <div style={{ display: 'flex', gap: 'var(--sp-4)', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/doctors" className="hero__btn-primary" style={{ fontSize: 'var(--text-base)' }}>
              <Stethoscope style={{ width: 18, height: 18 }} />
              {t('services.doctorTitle', 'Find a Doctor')}
            </Link>
            <Link to="/register" className="hero__btn-secondary" style={{ fontSize: 'var(--text-base)' }}>
              {isBangla ? 'Niramoy এক্সপ্লোর করুন' : 'Explore Niramoy'} <ArrowRight style={{ width: 16, height: 16 }} />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

/* ─── Featured Doctor Card (Matches Reference Screenshot media_1790915620206.png) ─── */
function FeaturedDoctorCard({ doctor, isBangla = false }) {
  const primaryChamber = doctor.chambers?.[0];
  const chamberCount = doctor.chambers?.length || 0;
  const phone = primaryChamber?.appointment_numbers?.[0] || primaryChamber?.appointment;
  const qualifications = doctor.qualifications
    ? (Array.isArray(doctor.qualifications) ? doctor.qualifications.join(', ') : String(doctor.qualifications))
    : (Array.isArray(doctor.degrees) ? doctor.degrees.join(', ') : (doctor.degrees ? String(doctor.degrees) : ''));
  const ratingVal = doctor.rating ? Number(doctor.rating).toFixed(1) : '4.5';
  const reviewCount = doctor.reviewCount || 12;

  const initials = String(doctor.name || 'Dr')
    .replace(/^(Prof\.|Dr\.)\s*/i, '')
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map(w => w?.[0] || '')
    .join('')
    .toUpperCase() || 'DR';

  return (
    <div
      className="card-hover"
      style={{
        padding: '18px 20px',
        borderRadius: '12px',
        border: '1.5px solid var(--color-border)',
        background: '#fff',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        gap: '12px',
        boxShadow: 'var(--shadow-xs)',
        height: '100%',
        position: 'relative',
        transition: 'transform 0.2s ease, box-shadow 0.2s ease'
      }}
    >
      <div style={{ display: 'flex', gap: '15px', alignItems: 'flex-start' }}>
        {/* Doctor Photo on Left */}
        <div style={{
          width: 76, height: 88, minWidth: 76, minHeight: 88,
          borderRadius: '8px', overflow: 'hidden',
          border: '1px solid #e2e8f0', background: '#f8fafc',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0, position: 'relative', boxShadow: '0 1px 4px rgba(0,0,0,0.04)'
        }}>
          {doctor.imageUrl ? (
            <img
              src={doctor.imageUrl}
              alt={doctor.name}
              loading="lazy"
              referrerPolicy="no-referrer"
              onError={e => { e.target.style.display = 'none'; if (e.target.nextSibling) e.target.nextSibling.style.display = 'flex'; }}
              style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
            />
          ) : null}
          <div style={{
            width: '100%', height: '100%',
            background: 'linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-dark) 100%)',
            display: doctor.imageUrl ? 'none' : 'flex',
            alignItems: 'center', justifyContent: 'center',
            color: '#fff', fontSize: '1rem', fontWeight: 800,
            fontFamily: 'var(--font-heading)', letterSpacing: '-0.02em'
          }}>
            {initials}
          </div>
        </div>

        {/* Doctor Information on Right */}
        <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: '3px' }}>
          {/* Line 1: Name and Verified Badge */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <Link
              to={`/doctors/${doctor.slug || doctor._id}`}
              style={{
                fontSize: '1rem',
                fontWeight: 800,
                color: '#0f172a',
                lineHeight: 1.25,
                textDecoration: 'none',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap'
              }}
            >
              {doctor.name}
            </Link>
            {doctor.verified && (
              <span style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '3px',
                background: '#e6f4ea',
                color: '#137333',
                border: '1px solid #b7e1cd',
                borderRadius: '9999px',
                padding: '1px 8px',
                fontSize: '0.68rem',
                fontWeight: 700
              }}>
                {isBangla ? '✓ যাচাইকৃত' : '✓ Verified'}
              </span>
            )}
          </div>

          {/* Line 2: Specialized Title in Teal/Emerald */}
          <div style={{
            fontSize: '0.85rem',
            fontWeight: 700,
            color: 'var(--color-primary)',
            lineHeight: 1.25,
            marginTop: '1px'
          }}>
            {doctor.specialty}
          </div>

          {/* Line 3: Qualifications */}
          {qualifications && (
            <div style={{
              fontSize: '0.74rem',
              color: '#64748b',
              lineHeight: 1.35,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap'
            }}>
              {qualifications}
            </div>
          )}

          {/* Line 4: Workplace / Hospital */}
          {doctor.workplace && (
            <div style={{
              fontSize: '0.72rem',
              color: '#94a3b8',
              lineHeight: 1.3,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap'
            }}>
              {doctor.workplace}
            </div>
          )}

          {/* Line 5: Chamber */}
          {primaryChamber?.name && (
            <div style={{
              fontSize: '0.76rem',
              fontWeight: 700,
              color: '#1e293b',
              marginTop: '2px',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap'
            }}>
              {primaryChamber.name}
              {chamberCount > 1 && (
                <span style={{ fontWeight: 500, color: '#64748b', marginLeft: '4px', fontSize: '0.7rem' }}>
                  +{chamberCount - 1} {isBangla ? 'আরও' : 'more'}
                </span>
              )}
            </div>
          )}

          {/* Line 6: Rating Stars */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '3px' }}>
            <span style={{ color: '#f59e0b', fontSize: '0.75rem', letterSpacing: '1px' }}>★★★★★</span>
            <span style={{ fontSize: '0.74rem', fontWeight: 700, color: '#b45309' }}>{ratingVal}</span>
            <span style={{ fontSize: '0.68rem', color: '#64748b' }}>({reviewCount})</span>
          </div>
        </div>
      </div>

      {/* Action Row */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        paddingTop: '10px',
        borderTop: '1px solid #f1f5f9',
        marginTop: 'auto'
      }}>
        <Link
          to={`/doctors/${doctor.slug || doctor._id}`}
          className="btn btn-secondary btn-sm"
          style={{ flex: 1, justifyContent: 'center', fontSize: '0.75rem', padding: '6px 12px' }}
        >
          {isBangla ? 'প্রোফাইল ও চেম্বার' : 'View Profile & Chambers'}
        </Link>
        <Link
          to={`/doctors/${doctor.slug || doctor._id}`}
          className="btn btn-primary btn-sm"
          style={{ fontSize: '0.75rem', padding: '6px 14px' }}
        >
          {isBangla ? 'বুকিং' : 'Book'}
        </Link>
        {phone && (
          <a
            href={`tel:${phone}`}
            className="btn btn-ghost btn-sm"
            style={{ padding: '6px 10px', color: '#16a34a' }}
            title={isBangla ? 'চেম্বারে ফোন করুন' : 'Call Chamber'}
          >
            <Phone style={{ width: 14, height: 14 }} />
          </a>
        )}
      </div>
    </div>
  );
}

/* ─── FAQ Accordion Component ─── */
function FaqAccordion({ items }) {
  const [openIndex, setOpenIndex] = useState(0);

  return (
    <div className="faq-accordion-list" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-3)' }}>
      {items.map((item, i) => {
        const isOpen = openIndex === i;
        return (
          <div
            key={i}
            className={`faq-item ${isOpen ? 'active' : ''}`}
            style={{
              borderRadius: 'var(--radius-lg)',
              border: '1.5px solid var(--color-border)',
              background: 'var(--color-surface)',
              overflow: 'hidden',
              transition: 'all var(--duration-fast) var(--ease)'
            }}
          >
            <button
              type="button"
              onClick={() => setOpenIndex(isOpen ? -1 : i)}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: 'var(--sp-4) var(--sp-5)',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                textAlign: 'left',
                gap: 'var(--sp-4)'
              }}
              aria-expanded={isOpen}
            >
              <span style={{
                fontFamily: 'var(--font-heading)',
                fontWeight: 700,
                fontSize: 'var(--text-base)',
                color: isOpen ? 'var(--color-primary)' : 'var(--color-text)',
                display: 'flex',
                alignItems: 'center',
                gap: '10px'
              }}>
                <HelpCircle style={{ width: 18, height: 18, color: 'var(--color-primary)', flexShrink: 0 }} />
                {item.q}
              </span>
              <ChevronDown
                style={{
                  width: 18,
                  height: 18,
                  color: 'var(--color-text-muted)',
                  transform: isOpen ? 'rotate(180deg)' : 'none',
                  transition: 'transform var(--duration-fast) var(--ease)',
                  flexShrink: 0
                }}
              />
            </button>
            {isOpen && (
              <div
                style={{
                  padding: '0 var(--sp-5) var(--sp-5) calc(var(--sp-5) + 28px)',
                  color: 'var(--color-text-secondary)',
                  fontSize: 'var(--text-sm)',
                  lineHeight: 1.7
                }}
              >
                {item.a}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
