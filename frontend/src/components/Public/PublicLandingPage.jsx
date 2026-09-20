import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Search, Stethoscope, Building2, Pill, FlaskConical, Siren,
  Sparkles, Video, HeartPulse, Shield, Clock, MapPin,
  ArrowRight, Star, Activity, Ambulance, Phone, ChevronRight,
  Zap, Brain, Users, FileCheck, TrendingUp, BedDouble
} from 'lucide-react';

const FEATURES = [
  {
    icon: Stethoscope, title: 'Find Doctors',
    desc: 'Browse 20+ specialties. Filter by hospital, experience, fee, language & availability.',
    link: '/doctors', color: '#0a5394'
  },
  {
    icon: Building2, title: 'Hospital Resources',
    desc: 'Real-time ICU, CCU, NICU bed availability. Emergency departments & blood banks.',
    link: '/hospitals', color: '#10b981'
  },
  {
    icon: Pill, title: 'Pharmacy Marketplace',
    desc: 'Search medicines across multiple pharmacies. Compare prices, check delivery estimates.',
    link: '/pharmacies', color: '#8b5cf6'
  },
  {
    icon: FlaskConical, title: 'Diagnostic Centers',
    desc: 'Book lab tests, imaging & diagnostics. Home sample collection & digital reports.',
    link: '/diagnostics', color: '#f59e0b'
  },
  {
    icon: Video, title: 'Telemedicine',
    desc: 'HD video consultation with specialists. AI-assisted notes & digital prescriptions.',
    link: '/doctors', color: '#0ea5e9'
  },
  {
    icon: Sparkles, title: 'AI Health Assistant',
    desc: 'Voice & text-based health triage in Bengali & English. Smart specialist routing.',
    link: '/ai-assistant', color: '#ec4899'
  },
];

const STATS = [
  { value: '15+', label: 'Rajshahi Hospitals', icon: Building2 },
  { value: '100+', label: 'Registered Doctors', icon: Stethoscope },
  { value: '20+', label: 'Medical Specialties', icon: Activity },
  { value: '24/7', label: 'Emergency Access', icon: Siren },
];

export default function PublicLandingPage() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/doctors?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <div className="public-landing">
      {/* ─── HERO SECTION ─── */}
      <section className="hero-section">
        <div className="hero-content">
          <div className="hero-badge">
            <Sparkles style={{ width: 14, height: 14 }} />
            Intelligent Healthcare Platform — Rajshahi Division
          </div>
          <h1 className="hero-title">
            Your Health, <br/>
            <span className="hero-title-accent">Intelligently Connected</span>
          </h1>
          <p className="hero-subtitle">
            Find doctors, check hospital bed availability, order medicines, book diagnostics, 
            and access AI-powered health assistance — all in one platform.
          </p>

          {/* Global Search */}
          <form className="hero-search" onSubmit={handleSearch}>
            <Search style={{ width: 20, height: 20, color: 'var(--text-muted)', flexShrink: 0 }} />
            <input
              type="text"
              placeholder="Search doctors, hospitals, medicines, tests..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="hero-search-input"
            />
            <button type="submit" className="btn btn-primary">
              Search <ArrowRight style={{ width: 16, height: 16 }} />
            </button>
          </form>

          {/* Quick Actions */}
          <div className="hero-quick-actions">
            <Link to="/doctors" className="hero-quick-btn">
              <Stethoscope style={{ width: 18, height: 18 }} /> Find Doctors
            </Link>
            <Link to="/hospitals" className="hero-quick-btn">
              <BedDouble style={{ width: 18, height: 18 }} /> Check Beds
            </Link>
            <Link to="/emergency" className="hero-quick-btn emergency">
              <Siren style={{ width: 18, height: 18 }} /> Emergency
            </Link>
            <Link to="/pharmacies" className="hero-quick-btn">
              <Pill style={{ width: 18, height: 18 }} /> Pharmacies
            </Link>
          </div>
        </div>

        {/* Hero Stats */}
        <div className="hero-stats">
          {STATS.map((s, i) => (
            <div key={i} className="hero-stat">
              <s.icon style={{ width: 22, height: 22, color: 'var(--primary)', opacity: 0.8 }} />
              <div className="hero-stat-value">{s.value}</div>
              <div className="hero-stat-label">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ─── FEATURES GRID ─── */}
      <section className="landing-section">
        <div className="section-header">
          <h2 className="section-title">Everything You Need for Healthcare</h2>
          <p className="section-subtitle">One platform connecting patients, doctors, pharmacies, hospitals & diagnostics</p>
        </div>
        <div className="features-grid">
          {FEATURES.map((f, i) => (
            <Link key={i} to={f.link} className="feature-card" style={{ '--accent': f.color }}>
              <div className="feature-card__icon" style={{ background: `${f.color}15`, color: f.color }}>
                <f.icon style={{ width: 24, height: 24 }} />
              </div>
              <h3 className="feature-card__title">{f.title}</h3>
              <p className="feature-card__desc">{f.desc}</p>
              <span className="feature-card__link">
                Explore <ChevronRight style={{ width: 14, height: 14 }} />
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* ─── AI SECTION ─── */}
      <section className="landing-section ai-section">
        <div className="ai-section__content">
          <div className="ai-section__text">
            <div className="hero-badge" style={{ marginBottom: 16 }}>
              <Brain style={{ width: 14, height: 14 }} /> Doctor-in-the-Loop Clinical AI
            </div>
            <h2 className="section-title" style={{ textAlign: 'left' }}>AI That Assists,<br/>Doctors Who Decide</h2>
            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: 24, fontSize: '0.95rem' }}>
              Medicare AI uses clinical RAG, similar case retrieval, and outcome tracking to provide 
              evidence-based decision support. Every AI suggestion is reviewed and validated by qualified 
              physicians before becoming part of the learning dataset.
            </p>
            <div className="ai-pillars">
              <div className="ai-pillar"><FileCheck style={{ width: 16, height: 16 }} /> Evidence-Based Retrieval</div>
              <div className="ai-pillar"><Shield style={{ width: 16, height: 16 }} /> Safety Layer Active</div>
              <div className="ai-pillar"><Users style={{ width: 16, height: 16 }} /> Physician-Supervised</div>
              <div className="ai-pillar"><TrendingUp style={{ width: 16, height: 16 }} /> Outcome Tracking</div>
            </div>
          </div>
          <div className="ai-section__visual">
            <div className="ai-flow-card">
              <div className="ai-flow-step">Patient Query</div>
              <div className="ai-flow-arrow">↓</div>
              <div className="ai-flow-step accent">Clinical RAG + Similar Cases</div>
              <div className="ai-flow-arrow">↓</div>
              <div className="ai-flow-step">AI Suggestion</div>
              <div className="ai-flow-arrow">↓</div>
              <div className="ai-flow-step accent">Doctor Review & Validation</div>
              <div className="ai-flow-arrow">↓</div>
              <div className="ai-flow-step">Clinical Outcome Tracking</div>
              <div className="ai-flow-arrow">↓</div>
              <div className="ai-flow-step highlight">Continuous Improvement</div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── EMERGENCY CTA ─── */}
      <section className="emergency-cta">
        <div className="emergency-cta__inner">
          <div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: 8 }}>
              <Siren style={{ width: 24, height: 24, verticalAlign: 'middle' }} /> Emergency Services
            </h2>
            <p style={{ opacity: 0.9, maxWidth: 500, lineHeight: 1.6 }}>
              Instant access to nearest hospitals, available emergency beds, ICU status, 
              ambulance services, and emergency phone numbers.
            </p>
          </div>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <Link to="/emergency" className="btn" style={{ background: 'white', color: '#dc2626', fontWeight: 700, padding: '12px 24px' }}>
              <Siren style={{ width: 18, height: 18 }} /> Find Emergency Help
            </Link>
            <a href="tel:999" className="btn" style={{ background: 'rgba(255,255,255,0.15)', color: 'white', fontWeight: 700, padding: '12px 24px', border: '1px solid rgba(255,255,255,0.3)' }}>
              <Phone style={{ width: 18, height: 18 }} /> Call 999
            </a>
          </div>
        </div>
      </section>

      {/* ─── CTA ─── */}
      <section className="landing-section" style={{ textAlign: 'center', paddingBottom: 80 }}>
        <h2 className="section-title">Ready to Get Started?</h2>
        <p className="section-subtitle" style={{ marginBottom: 32 }}>
          Browse doctors, hospitals and pharmacies freely. Create an account when you're ready to book.
        </p>
        <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link to="/doctors" className="btn btn-primary" style={{ padding: '14px 32px', fontSize: '1rem' }}>
            Find a Doctor <ArrowRight style={{ width: 18, height: 18 }} />
          </Link>
          <Link to="/register" className="btn-ghost" style={{ padding: '14px 32px', fontSize: '1rem', border: '2px solid var(--border-default)' }}>
            Create Free Account
          </Link>
        </div>
      </section>
    </div>
  );
}
