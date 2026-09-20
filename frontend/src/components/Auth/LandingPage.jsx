import React, { useState } from 'react';
import { 
  Heart, ShieldAlert, Sparkles, User, Key, Mail, 
  ArrowRight, ShieldCheck, Moon, Sun, HeartPulse,
  Activity, Video, ShoppingBag, Lock, ChevronRight, X
} from 'lucide-react';

export default function LandingPage({ onLogin, theme, toggleTheme }) {
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('patient'); // patient, doctor, admin
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onLogin(activeTab, name || (activeTab.charAt(0).toUpperCase() + activeTab.slice(1) + ' User'));
    setIsLoginOpen(false);
  };

  const handleDemoLogin = (role) => {
    let demoName = 'Tanvir Hossain';
    if (role === 'doctor') demoName = 'Dr. Sarah Jenkins';
    if (role === 'admin') demoName = 'System Admin';
    onLogin(role, demoName);
    setIsLoginOpen(false);
  };

  const tabDetails = {
    patient: {
      title: 'Patient Portal',
      description: 'Access AI symptom triage, schedule video appointments, and manage digital prescriptions.',
      badgeColor: 'badge-primary',
      demoUser: 'Tanvir Hossain'
    },
    doctor: {
      title: 'Clinician Gate',
      description: 'Review AI clinical handovers, launch HD teleconsultation rooms, and sign medical documents.',
      badgeColor: 'badge-accent',
      demoUser: 'Dr. Sarah Jenkins'
    },
    admin: {
      title: 'Admin Control',
      description: 'Monitor data governance, review consent audit trails, and inspect diagnostic performance metrics.',
      badgeColor: 'badge-warning',
      demoUser: 'System Admin'
    }
  };

  const features = [
    {
      icon: Sparkles,
      title: 'AI Symptom Navigator',
      desc: 'Specialty-aware RAG triage. Evaluates symptoms against 12 core specialties and flags critical warnings.',
      color: 'var(--primary)'
    },
    {
      icon: Video,
      title: 'HD Teleconsultation Rooms',
      desc: 'Instant video sessions with specialists. Integrates clinician notes, digital prescriptions, and BDT billing.',
      color: '#0ea5e9'
    },
    {
      icon: ShoppingBag,
      title: 'Medicine Logistics Map',
      desc: 'Interactive pharmacy inventory tracking. Uses machine learning models to forecast medicine stock demand.',
      color: '#10b981'
    },
    {
      icon: Lock,
      title: 'Data Consent Matrix',
      desc: 'HIPAA-compliant granular privacy controls with live immutable security encryption access logs.',
      color: '#8b5cf6'
    }
  ];

  const specialties = [
    { emoji: '🧠', name: 'Neurology', focus: 'Headaches, stroke recovery' },
    { emoji: '🫀', name: 'Cardiology', focus: 'Heart pain, vital tracking' },
    { emoji: '👶', name: 'Pediatrics', focus: 'Infant growth, childhood care' },
    { emoji: '🦴', name: 'Orthopedics', focus: 'Sports pain, bone support' },
    { emoji: '🧪', name: 'Nephrology', focus: 'Kidney function, dialysis' },
    { emoji: '🩺', name: 'General Medicine', focus: 'Flu, infection, checkups' }
  ];

  return (
    <div style={{
      width: '100vw',
      minHeight: '100vh',
      background: 'var(--bg-dashboard)',
      color: 'var(--text-primary)',
      display: 'flex',
      flexDirection: 'column',
      fontFamily: 'var(--font-sans)',
      overflowX: 'hidden'
    }}>
      
      {/* ─── STICKY HEADER & NAVBAR ─── */}
      <header style={{
        position: 'sticky',
        top: 0,
        zIndex: 100,
        padding: '16px 40px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottom: '1px solid var(--border-subtle)',
        background: 'var(--bg-surface)',
        backdropFilter: 'blur(8px)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '36px',
            height: '36px',
            borderRadius: '10px',
            background: 'var(--primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white'
          }}>
            <HeartPulse style={{ width: '20px', height: '20px' }} />
          </div>
          <span style={{ fontSize: '1.2rem', fontWeight: 850, letterSpacing: '-0.02em', color: 'var(--text-primary)' }}>
            MediBridge <span style={{ color: 'var(--primary)' }}>AI</span>
          </span>
        </div>

        {/* Center Nav Links */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
          <a href="#features" style={{ fontSize: '0.8125rem', fontWeight: 650, color: 'var(--text-secondary)' }}>Features</a>
          <a href="#specialties" style={{ fontSize: '0.8125rem', fontWeight: 650, color: 'var(--text-secondary)' }}>Specialties</a>
          <a href="#workflow" style={{ fontSize: '0.8125rem', fontWeight: 650, color: 'var(--text-secondary)' }}>How it Works</a>
          <a href="#compliance" style={{ fontSize: '0.8125rem', fontWeight: 650, color: 'var(--text-secondary)' }}>Compliance</a>
        </nav>

        {/* Right CTA / Theme controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button
            onClick={toggleTheme}
            style={{
              padding: '8px 12px',
              borderRadius: '8px',
              background: 'var(--bg-badge)',
              border: '1.5px solid var(--border-default)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              color: 'var(--text-secondary)',
              fontSize: '0.75rem',
              fontWeight: 700
            }}
          >
            {theme === 'dark' ? <Sun style={{ width: '14px', height: '14px', color: '#f59e0b' }} /> : <Moon style={{ width: '14px', height: '14px' }} />}
          </button>

          <button 
            onClick={() => setIsLoginOpen(true)}
            className="btn btn-primary"
            style={{ padding: '8px 16px', borderRadius: '8px', fontSize: '0.75rem' }}
          >
            Launch App Portal
          </button>
        </div>
      </header>

      {/* ─── HERO SECTION ─── */}
      <section style={{
        maxWidth: '1200px',
        width: '100%',
        margin: '0 auto',
        padding: '80px 24px 60px 24px',
        display: 'grid',
        gridTemplateColumns: '1.1fr 0.9fr',
        alignItems: 'center',
        gap: '60px'
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div>
            <span className="badge badge-primary" style={{ marginBottom: '12px' }}>
              <Sparkles style={{ width: 12, height: 12, marginRight: 4 }} /> The Intelligent Front-Door to Modern Healthcare
            </span>
            <h1 style={{ fontSize: '3.2rem', fontWeight: 900, lineHeight: 1.1, letterSpacing: '-0.03em', color: 'var(--text-primary)' }}>
              Virtual medical <br />
              <span style={{ color: 'var(--primary)' }}>ecosystem</span> in seconds
            </h1>
            <p style={{ fontSize: '0.95rem', color: 'var(--text-muted)', marginTop: '16px', lineHeight: 1.6, maxWidth: '500px' }}>
              Coordinates symptom triage, registered specialist discovery, HD teleconsultations, and automated pharmacy logistics under one secure clinical system.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            <button onClick={() => { setActiveTab('patient'); setIsLoginOpen(true); }} className="btn btn-primary" style={{ padding: '12px 24px', borderRadius: '10px' }}>
              Enter Patient Gate <ArrowRight style={{ width: 14, height: 14, marginLeft: 6 }} />
            </button>
            <button onClick={() => { setActiveTab('doctor'); setIsLoginOpen(true); }} className="btn btn-secondary" style={{ padding: '12px 24px', borderRadius: '10px' }}>
              For Registered Clinicians
            </button>
          </div>

          {/* Quick Metrics */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', borderTop: '1px solid var(--border-default)', paddingTop: '24px', marginTop: '12px' }}>
            <div>
              <strong style={{ fontSize: '1.5rem', fontWeight: 850 }}>50k+</strong>
              <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', display: 'block', marginTop: '2px' }}>Patient Screenings</span>
            </div>
            <div>
              <strong style={{ fontSize: '1.5rem', fontWeight: 850 }}>48+</strong>
              <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', display: 'block', marginTop: '2px' }}>Registered Specialists</span>
            </div>
            <div>
              <strong style={{ fontSize: '1.5rem', fontWeight: 850 }}>99.8%</strong>
              <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', display: 'block', marginTop: '2px' }}>Triage Safety Accuracy</span>
            </div>
          </div>
        </div>

        {/* SVG ECG Animation Card */}
        <div className="dashboard-card" style={{
          padding: '32px',
          background: 'var(--bg-surface)',
          borderRadius: '24px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          height: '280px',
          overflow: 'hidden'
        }}>
          <div className="bg-dots-pattern" style={{ position: 'absolute', inset: 0, opacity: 0.3 }} />
          
          {/* Pulse Orb */}
          <div style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            zIndex: 2,
            animation: 'pulse-ring 2s infinite ease-in-out'
          }}>
            <Heart style={{ width: '40px', height: '40px', color: 'var(--danger)', fill: 'var(--danger)' }} />
          </div>

          <svg viewBox="0 0 400 100" style={{ width: '100%', height: '100%', zIndex: 1, position: 'relative', overflow: 'visible' }}>
            <path 
              className="heartbeat-line"
              d="M0,50 L100,50 L120,50 L130,20 L140,80 L150,50 L160,50 L170,40 L180,60 L190,50 L250,50 L270,10 L285,90 L300,50 L400,50" 
              fill="none" 
              stroke="var(--primary)" 
              strokeWidth="4" 
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>

          <div style={{ position: 'absolute', bottom: '16px', right: '20px', display: 'flex', gap: '8px', fontSize: '0.6875rem', color: 'var(--text-muted)', fontWeight: 650 }}>
            <span>ECG Live feed</span>
            <span>•</span>
            <span style={{ color: 'var(--success)' }}>Active Signal</span>
          </div>
        </div>
      </section>

      {/* ─── PLATFORM FEATURES SECTION ─── */}
      <section id="features" style={{
        background: 'var(--bg-surface)',
        borderTop: '1px solid var(--border-subtle)',
        borderBottom: '1px solid var(--border-subtle)',
        padding: '80px 24px'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '48px' }}>
            <span className="badge badge-primary">Dynamic Capabilities</span>
            <h2 style={{ fontSize: '1.85rem', fontWeight: 850, marginTop: '8px' }}>Clinical Intelligence Across Every Gateway</h2>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: '4px' }}>Four interconnected layers providing end-to-end medical logistics.</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '24px' }}>
            {features.map((f, i) => {
              const Icon = f.icon;
              return (
                <div key={i} className="dashboard-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div style={{
                    width: '42px',
                    height: '42px',
                    borderRadius: '10px',
                    background: 'var(--bg-app-outer)',
                    color: f.color,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <Icon style={{ width: '20px', height: '20px' }} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '0.9375rem', fontWeight: 800, color: 'var(--text-primary)' }}>{f.title}</h3>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '6px', lineHeight: 1.5 }}>{f.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ─── ACTIVE SPECIALTIES CAROUSEL ─── */}
      <section id="specialties" style={{ padding: '80px 24px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '48px' }}>
            <span className="badge badge-primary">Specialty Grid</span>
            <h2 style={{ fontSize: '1.85rem', fontWeight: 850, marginTop: '8px' }}>Multi-Specialty Clinical Framework</h2>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: '4px' }}>AI navigation mapped against registered specialist schedules.</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px' }}>
            {specialties.map((spec, i) => (
              <div key={i} className="dashboard-card" style={{ padding: '16px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '2rem' }}>{spec.emoji}</span>
                <div>
                  <strong style={{ fontSize: '0.8125rem', display: 'block', color: 'var(--text-primary)' }}>{spec.name}</strong>
                  <span style={{ fontSize: '0.625rem', color: 'var(--text-muted)', display: 'block', marginTop: '2px' }}>{spec.focus}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── HOW IT WORKS WORKFLOW ─── */}
      <section id="workflow" style={{
        background: 'var(--bg-surface)',
        borderTop: '1px solid var(--border-subtle)',
        borderBottom: '1px solid var(--border-subtle)',
        padding: '80px 24px'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '48px' }}>
            <span className="badge badge-primary">Platform Workflow</span>
            <h2 style={{ fontSize: '1.85rem', fontWeight: 850, marginTop: '8px' }}>The 4-Step Patient Journey</h2>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: '4px' }}>From initial symptom checking to prescription delivery.</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '24px', position: 'relative' }}>
            {[
              { num: '1', title: 'AI Symptom Screening', desc: 'Describe symptoms via voice or text. AI filters warnings and builds clinical summary.' },
              { num: '2', title: 'Clinician Handover', desc: 'If flag warnings trigger, AI prepares clinical notes and matches verified specialists.' },
              { num: '3', title: 'HD Video Consultation', desc: 'Conduct online consultations, evaluate reports, and obtain digitally signed prescriptions.' },
              { num: '4', title: 'Fulfillment & Logistics', desc: 'Order meds via live stock map or schedule diagnostic collection at home.' }
            ].map((step, idx) => (
              <div key={idx} className="dashboard-card" style={{ padding: '24px', position: 'relative', overflow: 'visible' }}>
                <div style={{
                  position: 'absolute',
                  top: '-16px',
                  left: '20px',
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  background: 'var(--primary)',
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 800,
                  fontSize: '0.875rem',
                  boxShadow: 'var(--shadow-primary)'
                }}>
                  {step.num}
                </div>
                <div style={{ marginTop: '8px' }}>
                  <h4 style={{ fontSize: '0.875rem', fontWeight: 800, color: 'var(--text-primary)' }}>{step.title}</h4>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '6px', lineHeight: 1.5 }}>{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── SYSTEM COMPLIANCE & FOOTER ─── */}
      <section id="compliance" style={{ padding: '60px 24px', textAlign: 'center' }}>
        <div style={{ maxWidth: '600px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Standard Compliant Operations</h3>
          <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
            MediBridge AI is fully compliant under HIPAA, BMDC, and GDPR standards. All medical records remain encrypted, with immutable tracking log feeds.
          </p>
          <button onClick={() => setIsLoginOpen(true)} className="btn btn-primary" style={{ padding: '10px 20px', fontSize: '0.75rem' }}>
            Open Portal Launcher
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer style={{
        padding: '24px 40px',
        borderTop: '1px solid var(--border-default)',
        background: 'var(--bg-surface)'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>© 2026 MediBridge AI Platform. BMDC Registered.</span>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', gap: '12px' }}>
            <span style={{ cursor: 'pointer' }} onClick={() => setIsLoginOpen(true)}>Admin Panel</span>
            <span>•</span>
            <span style={{ cursor: 'pointer' }} onClick={() => setIsLoginOpen(true)}>Log Audit</span>
          </span>
        </div>
      </footer>

      {/* ─── OVERLAY MODAL DRAWER (LOGIN GATEWAYS) ─── */}
      {isLoginOpen && (
        <div className="modal-overlay" style={{ animation: 'fadeIn 200ms ease' }}>
          <div className="modal-content" style={{ maxWidth: '440px', padding: '24px', position: 'relative' }}>
            
            {/* Close Button */}
            <button 
              onClick={() => setIsLoginOpen(false)}
              style={{
                position: 'absolute', top: '16px', right: '16px',
                background: 'none', border: 'none', cursor: 'pointer',
                color: 'var(--text-muted)'
              }}
            >
              <X style={{ width: 18, height: 18 }} />
            </button>

            <div style={{ marginBottom: '16px' }}>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800 }}>Portal Entrance</h3>
              <p style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', marginTop: '2px' }}>Choose your corresponding medical access portal</p>
            </div>

            {/* Tabs */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr 1fr',
              gap: '4px',
              background: 'var(--bg-badge)',
              padding: '3px',
              borderRadius: '8px',
              marginBottom: '16px'
            }}>
              {['patient', 'doctor', 'admin'].map(tab => (
                <button
                  key={tab}
                  onClick={() => { setActiveTab(tab); setIsSignUp(false); }}
                  style={{
                    padding: '8px 4px', borderRadius: '6px', border: 'none',
                    fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer',
                    background: activeTab === tab ? 'var(--primary)' : 'transparent',
                    color: activeTab === tab ? 'white' : 'var(--text-muted)',
                    boxShadow: activeTab === tab ? 'var(--shadow-primary)' : 'none'
                  }}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </div>

            {/* Description */}
            <div style={{
              padding: '10px 12px', borderRadius: '8px',
              background: 'var(--bg-badge)', borderLeft: '3px solid var(--primary)',
              fontSize: '0.6875rem', color: 'var(--text-secondary)', lineHeight: 1.4,
              marginBottom: '16px'
            }}>
              <strong>{tabDetails[activeTab].title}</strong>: {tabDetails[activeTab].description}
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {isSignUp && (
                <div style={{ position: 'relative' }}>
                  <User style={{ width: 14, height: 14, color: 'var(--text-muted)', position: 'absolute', left: '10px', top: '10px' }} />
                  <input type="text" placeholder="Full Name" required value={name} onChange={(e) => setName(e.target.value)} className="input" style={{ paddingLeft: '32px' }} />
                </div>
              )}
              <div style={{ position: 'relative' }}>
                <Mail style={{ width: 14, height: 14, color: 'var(--text-muted)', position: 'absolute', left: '10px', top: '10px' }} />
                <input type="email" placeholder="Email Address" required value={email} onChange={(e) => setEmail(e.target.value)} className="input" style={{ paddingLeft: '32px' }} />
              </div>
              <div style={{ position: 'relative' }}>
                <Key style={{ width: 14, height: 14, color: 'var(--text-muted)', position: 'absolute', left: '10px', top: '10px' }} />
                <input type="password" placeholder="Password" required value={password} onChange={(e) => setPassword(e.target.value)} className="input" style={{ paddingLeft: '32px' }} />
              </div>

              <button type="submit" className="btn btn-primary" style={{ padding: '10px', fontSize: '0.75rem', width: '100%', marginTop: '4px' }}>
                {isSignUp ? 'Create Credentials' : 'Authenticate Access'} <ArrowRight style={{ width: 12, height: 12, marginLeft: 4 }} />
              </button>
            </form>

            {/* Evaluation bypass button */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', borderTop: '1px solid var(--border-default)', marginTop: '16px', paddingTop: '12px' }}>
              <span style={{ fontSize: '0.5625rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', textAlign: 'center' }}>
                ⚡ Developer Evaluation Bypass
              </span>
              <button 
                onClick={() => handleDemoLogin(activeTab)}
                className="btn btn-secondary"
                style={{
                  width: '100%', fontWeight: 750, fontSize: '0.75rem',
                  border: '1.5px solid var(--primary)', color: 'var(--primary)',
                  background: 'var(--primary-glow)', padding: '8px'
                }}
              >
                Sign In as Demo {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
              </button>
            </div>

            {/* Toggle */}
            <div style={{ textAlign: 'center', fontSize: '0.6875rem', color: 'var(--text-muted)', marginTop: '12px' }}>
              {isSignUp ? 'Already registered?' : 'Need registration?'} {' '}
              <button onClick={() => setIsSignUp(!isSignUp)} style={{ background: 'none', border: 'none', color: 'var(--primary)', fontWeight: 700, cursor: 'pointer' }}>
                {isSignUp ? 'Sign In Portal' : 'Register Account'}
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
