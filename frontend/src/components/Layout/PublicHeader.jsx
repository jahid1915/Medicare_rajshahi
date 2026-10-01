import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import NiramoyLogo from '../Common/NiramoyLogo';
import {
  Stethoscope, Pill, LayoutDashboard, LogOut, X, Menu,
  ShoppingCart, ChevronDown, Building2, Activity,
  Truck, Sparkles, BookOpen, MapPin, Cpu, Info, Mail,
  LogIn, UserPlus, PhoneCall, Shield, AlertCircle
} from 'lucide-react';

const MAIN_NAV_LINKS = [
  { label: 'Doctors', href: '/doctors', icon: Stethoscope },
  { label: 'Hospitals', href: '/hospitals', icon: Building2 },
  { label: 'Diagnostics', href: '/diagnostics', icon: Activity },
  { label: 'Pharmacies', href: '/pharmacies', icon: Pill },
  { label: 'Ambulance', href: '/ambulance', icon: Truck },
  { label: 'AI Health', href: '/ai', icon: Sparkles },
];

const MORE_NAV_LINKS = [
  { label: 'Health Tips', href: '/health-tips', icon: BookOpen, desc: 'Doctor-reviewed health guides' },
  { label: 'Find a Facility', href: '/facilities', icon: MapPin, desc: 'Unified directory & map' },
  { label: 'Research & Tech', href: '/research', icon: Cpu, desc: 'Smart hospital & AI models' },
  { label: 'About Niramoy', href: '/about', icon: Info, desc: 'Our mission & regional network' },
  { label: 'Contact Us', href: '/contact', icon: Mail, desc: 'Support & emergency helplines' },
];

function getDashboard(role) {
  if (['hospital_admin', 'hospital_management', 'receptionist'].includes(role)) return '/hospital-portal';
  if (['pharmacy_owner', 'pharmacist'].includes(role)) return '/pharmacy-portal';
  if (['doctor', 'specialist_doctor', 'nurse', 'lab_tech', 'radiology_tech'].includes(role)) return '/doctor-portal';
  if (['super_admin', 'compliance_auditor', 'researcher'].includes(role)) return '/admin';
  return '/dashboard';
}

export default function NiramoyNavbar() {
  const { user, logout } = useAuth();
  const { cartItems = [] } = useCart?.() || {};
  const location = useLocation();
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [moreDropdownOpen, setMoreDropdownOpen] = useState(false);

  const userDropdownRef = useRef(null);
  const moreDropdownRef = useRef(null);

  // Hero pages get transparent navbar
  const isHero = location.pathname === '/';

  useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          setScrolled(window.scrollY > 20);
          ticking = false;
        });
        ticking = true;
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close dropdowns on outside click
  useEffect(() => {
    const handler = (e) => {
      if (userDropdownRef.current && !userDropdownRef.current.contains(e.target)) {
        setUserDropdownOpen(false);
      }
      if (moreDropdownRef.current && !moreDropdownRef.current.contains(e.target)) {
        setMoreDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Close mobile menu & dropdowns on route change
  useEffect(() => {
    setMobileOpen(false);
    setUserDropdownOpen(false);
    setMoreDropdownOpen(false);
  }, [location.pathname]);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileOpen]);

  const solid = !isHero || scrolled;
  const cartCount = cartItems?.reduce?.((s, i) => s + (i.quantity || 1), 0) || 0;

  const initials = user?.name
    ? user.name.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase()
    : '?';

  // Pre-warm primary routes during idle time after initial page render
  useEffect(() => {
    const timer = setTimeout(() => {
      import('../Doctor/DoctorDiscovery');
      import('../Hospitals/HospitalSearchPage');
      import('../Pharmacy/PharmacyDirectory');
      import('../Diagnostic/DiagnosticCenterView');
      import('../Public/AmbulancePage');
      import('../Public/AIPage');
    }, 1200);
    return () => clearTimeout(timer);
  }, []);

  const prefetchRoute = (path) => {
    switch (path) {
      case '/doctors': import('../Doctor/DoctorDiscovery'); break;
      case '/hospitals': import('../Hospitals/HospitalSearchPage'); break;
      case '/diagnostics': import('../Diagnostic/DiagnosticCenterView'); break;
      case '/pharmacies': import('../Pharmacy/PharmacyDirectory'); break;
      case '/ambulance': import('../Public/AmbulancePage'); break;
      case '/ai': import('../Public/AIPage'); break;
      case '/health-tips': import('../Public/HealthTipsPage'); break;
      default: break;
    }
  };

  const isMoreActive = MORE_NAV_LINKS.some(link => location.pathname === link.href);

  return (
    <>
      <nav className={`navbar ${scrolled ? 'navbar--scrolled' : (solid ? 'navbar--solid' : 'navbar--transparent')}`}
        role="navigation" aria-label="Main navigation">
        <div className="navbar__inner">

          {/* Logo — Clicking takes directly to Landing / Homepage */}
          <Link to="/" className="navbar__logo-link" aria-label="Niramoy Healthcare Homepage" title="Go to Niramoy Homepage">
            <NiramoyLogo size="md" variant="light" tagline="Rajshahi Digital Health" />
          </Link>

          {/* Desktop Nav Items (No 'Home' button, logo acts as Home) */}
          <nav className="navbar__nav" aria-label="Primary Navigation">
            {MAIN_NAV_LINKS.map(link => {
              const Icon = link.icon;
              const isActive = location.pathname === link.href ||
                (link.href !== '/' && location.pathname.startsWith(link.href));
              return (
                <Link
                  key={link.href}
                  to={link.href}
                  className={`navbar__link ${isActive ? 'active' : ''}`}
                  onMouseEnter={() => prefetchRoute(link.href)}
                  onFocus={() => prefetchRoute(link.href)}
                >
                  <Icon size={14} className="navbar__link-icon" />
                  <span>{link.label}</span>
                </Link>
              );
            })}

            {/* More ▾ Dropdown */}
            <div ref={moreDropdownRef} style={{ position: 'relative' }}>
              <button
                type="button"
                onClick={() => setMoreDropdownOpen(o => !o)}
                className={`navbar__link ${isMoreActive ? 'active' : ''}`}
                style={{
                  background: isMoreActive ? undefined : 'transparent',
                  cursor: 'pointer',
                  fontFamily: 'inherit'
                }}
                aria-expanded={moreDropdownOpen}
                aria-haspopup="true"
              >
                <span>More</span>
                <ChevronDown style={{
                  width: 13, height: 13,
                  transform: moreDropdownOpen ? 'rotate(180deg)' : 'rotate(0)',
                  transition: 'transform 0.15s ease'
                }} />
              </button>

              {moreDropdownOpen && (
                <div className="navbar__dropdown" style={{ minWidth: '240px', left: 0, right: 'auto' }}>
                  <div style={{ padding: '8px 0' }}>
                    {MORE_NAV_LINKS.map(item => {
                      const Icon = item.icon;
                      return (
                        <Link
                          key={item.href}
                          to={item.href}
                          className="navbar__dropdown-item"
                          onClick={() => setMoreDropdownOpen(false)}
                          style={{ padding: '10px 16px', display: 'flex', gap: '10px', alignItems: 'flex-start' }}
                        >
                          <Icon size={16} style={{ marginTop: '2px', color: '#5eead4', flexShrink: 0 }} />
                          <div>
                            <div style={{ fontWeight: 700, fontSize: '0.85rem', color: '#ffffff' }}>{item.label}</div>
                            <div style={{ fontSize: '0.72rem', color: 'rgba(255, 255, 255, 0.7)' }}>{item.desc}</div>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </nav>

          {/* Right Actions */}
          <div className="navbar__actions">
            {/* Quick 24/7 SOS Helpline Pill */}
            <Link to="/ambulance" className="navbar__sos-pill" aria-label="24/7 Emergency Ambulance" title="24/7 Emergency Ambulance & Blood Support">
              <span className="navbar__sos-pulse" />
              <Truck size={14} />
              <span>SOS 24/7</span>
            </Link>

            {/* Cart Icon */}
            {cartCount > 0 && (
              <Link to="/cart" className="navbar__cart" aria-label={`Cart (${cartCount} items)`}>
                <ShoppingCart style={{ width: 18, height: 18 }} />
                <span className="navbar__cart-count">{cartCount}</span>
              </Link>
            )}

            {user ? (
              /* User Dropdown */
              <div ref={userDropdownRef} style={{ position: 'relative' }}>
                <button
                  className="navbar__user-btn"
                  onClick={() => setUserDropdownOpen(o => !o)}
                  aria-expanded={userDropdownOpen}
                  aria-haspopup="true"
                >
                  <div className="navbar__avatar">{initials}</div>
                  <span style={{ maxWidth: 90, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {user.name?.split(' ')[0]}
                  </span>
                  <ChevronDown style={{
                    width: 14, height: 14, opacity: 0.7,
                    transform: userDropdownOpen ? 'rotate(180deg)' : 'rotate(0)',
                    transition: 'transform 0.15s'
                  }} />
                </button>

                {userDropdownOpen && (
                  <div className="navbar__dropdown">
                    <div className="navbar__dropdown-header">
                      <strong>{user.name}</strong>
                      <span>{user.role?.replace(/_/g, ' ')}</span>
                    </div>
                    <Link
                      to={getDashboard(user.role)}
                      className="navbar__dropdown-item"
                      onClick={() => setUserDropdownOpen(false)}
                    >
                      <LayoutDashboard style={{ width: 15, height: 15 }} /> Dashboard
                    </Link>
                    <button
                      className="navbar__dropdown-item danger"
                      onClick={() => { logout(); navigate('/'); setUserDropdownOpen(false); }}
                    >
                      <LogOut style={{ width: 15, height: 15 }} /> Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link to="/signin" className="navbar__signin">
                  <LogIn size={14} />
                  <span>Portal</span>
                </Link>
                <Link to="/register" className="navbar__cta">
                  <span>Join Niramoy</span>
                </Link>
              </>
            )}

            {/* Mobile Menu Hamburger Toggle */}
            <button
              className="navbar__mobile-toggle"
              onClick={() => setMobileOpen(true)}
              aria-label="Open mobile menu"
            >
              <Menu size={22} />
            </button>
          </div>
        </div>
      </nav>

      {/* Modern Glassmorphic Mobile Drawer */}
      {mobileOpen && (
        <div
          className="navbar__mobile-overlay"
          role="dialog"
          aria-modal="true"
          aria-label="Mobile navigation"
          onClick={(e) => { if (e.target === e.currentTarget) setMobileOpen(false); }}
        >
          <div className="navbar__mobile-panel">
            {/* Mobile Header with Clickable Logo and Close */}
            <div className="navbar__mobile-header">
              <Link to="/" onClick={() => setMobileOpen(false)} style={{ textDecoration: 'none' }}>
                <NiramoyLogo size="sm" variant="light" tagline="Rajshahi Health" />
              </Link>
              <button
                onClick={() => setMobileOpen(false)}
                className="navbar__mobile-close"
                aria-label="Close menu"
              >
                <X size={20} />
              </button>
            </div>

            {/* Mobile Nav Links */}
            <div className="navbar__mobile-body">
              {/* Emergency Banner at top of mobile menu */}
              <Link to="/ambulance" onClick={() => setMobileOpen(false)} className="navbar__mobile-sos-card">
                <div className="navbar__mobile-sos-icon">
                  <Truck size={20} color="#ffffff" />
                </div>
                <div>
                  <div style={{ fontWeight: 800, fontSize: '0.9rem', color: '#ffffff' }}>24/7 Emergency Ambulance</div>
                  <div style={{ fontSize: '0.74rem', color: '#5eead4' }}>Call 16263 or find nearby vehicle</div>
                </div>
              </Link>

              {/* Primary Healthcare Services */}
              <div className="navbar__mobile-section-title">
                Healthcare Services
              </div>
              <div className="navbar__mobile-grid">
                {MAIN_NAV_LINKS.map(link => {
                  const Icon = link.icon;
                  const isActive = location.pathname === link.href ||
                    (link.href !== '/' && location.pathname.startsWith(link.href));
                  return (
                    <Link
                      key={link.href}
                      to={link.href}
                      onClick={() => setMobileOpen(false)}
                      className={`navbar__mobile-card ${isActive ? 'active' : ''}`}
                    >
                      <Icon size={18} className="navbar__mobile-card-icon" />
                      <span className="navbar__mobile-card-label">{link.label}</span>
                    </Link>
                  );
                })}
              </div>

              {/* Resources & More */}
              <div className="navbar__mobile-section-title" style={{ marginTop: '14px' }}>
                Platform & Resources
              </div>
              <div className="navbar__mobile-list">
                {MORE_NAV_LINKS.map(link => {
                  const Icon = link.icon;
                  const isActive = location.pathname === link.href;
                  return (
                    <Link
                      key={link.href}
                      to={link.href}
                      onClick={() => setMobileOpen(false)}
                      className={`navbar__mobile-list-item ${isActive ? 'active' : ''}`}
                    >
                      <Icon size={16} style={{ color: '#5eead4', flexShrink: 0 }} />
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '0.86rem', fontWeight: 600, color: '#ffffff' }}>{link.label}</div>
                        <div style={{ fontSize: '0.72rem', color: 'rgba(255, 255, 255, 0.65)' }}>{link.desc}</div>
                      </div>
                    </Link>
                  );
                })}
              </div>

              {/* Provider Quick Registration Links */}
              <div className="navbar__mobile-section-title" style={{ marginTop: '14px' }}>
                For Healthcare Providers
              </div>
              <div className="navbar__mobile-provider-links">
                <Link to="/register/doctor" onClick={() => setMobileOpen(false)}>Doctor Registration</Link>
                <Link to="/register/facility" onClick={() => setMobileOpen(false)}>Hospital Registration</Link>
                <Link to="/register/pharmacy" onClick={() => setMobileOpen(false)}>Pharmacy Registration</Link>
              </div>
            </div>

            {/* Mobile Footer Actions */}
            <div className="navbar__mobile-footer">
              {user ? (
                <>
                  <div className="navbar__mobile-user-card">
                    <div className="navbar__avatar">{initials}</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: '0.86rem', fontWeight: 700, color: '#ffffff', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user.name}</div>
                      <div style={{ fontSize: '0.72rem', color: '#5eead4' }}>{user.role?.replace(/_/g, ' ')}</div>
                    </div>
                  </div>
                  <Link
                    to={getDashboard(user.role)}
                    onClick={() => setMobileOpen(false)}
                    className="navbar__mobile-cta-btn"
                    style={{ background: 'rgba(94, 234, 212, 0.15)', color: '#5eead4', border: '1px solid rgba(94, 234, 212, 0.3)' }}
                  >
                    <LayoutDashboard size={16} />
                    <span>Open Dashboard</span>
                  </Link>
                  <button
                    onClick={() => { logout(); navigate('/'); setMobileOpen(false); }}
                    className="navbar__mobile-cta-btn"
                    style={{ background: 'rgba(239, 68, 68, 0.15)', color: '#f87171', border: '1px solid rgba(239, 68, 68, 0.3)' }}
                  >
                    <LogOut size={16} />
                    <span>Sign Out</span>
                  </button>
                </>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <Link
                    to="/signin"
                    onClick={() => setMobileOpen(false)}
                    className="navbar__mobile-cta-btn"
                    style={{ background: 'rgba(255, 255, 255, 0.1)', color: '#ffffff', border: '1px solid rgba(255, 255, 255, 0.2)' }}
                  >
                    <LogIn size={15} />
                    <span>Sign In</span>
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setMobileOpen(false)}
                    className="navbar__mobile-cta-btn"
                    style={{ background: 'linear-gradient(135deg, #14b8a6 0%, #0d9488 100%)', color: '#ffffff', border: 'none' }}
                  >
                    <UserPlus size={15} />
                    <span>Register</span>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
