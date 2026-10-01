import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import NiramoyLogo from '../Common/NiramoyLogo';
import {
  Stethoscope, Pill, LayoutDashboard, LogOut, X, Menu,
  ShoppingCart, ChevronDown, Home, Building2, Activity,
  Truck, Sparkles, BookOpen, MapPin, Cpu, Info, Mail,
  UserPlus, ShieldCheck, HeartPulse
} from 'lucide-react';

const MAIN_NAV_LINKS = [
  { label: 'Home', href: '/' },
  { label: 'Doctors', href: '/doctors' },
  { label: 'Hospitals', href: '/hospitals' },
  { label: 'Diagnostics', href: '/diagnostics' },
  { label: 'Pharmacies', href: '/pharmacies' },
  { label: 'Ambulance', href: '/ambulance' },
  { label: 'AI', href: '/ai' },
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

  const solid = !isHero || scrolled;
  const cartCount = cartItems?.reduce?.((s, i) => s + (i.quantity || 1), 0) || 0;

  const initials = user?.name
    ? user.name.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase()
    : '?';

  const isMoreActive = MORE_NAV_LINKS.some(link => location.pathname === link.href);

  return (
    <>
      <nav className={`navbar ${scrolled ? 'navbar--scrolled' : (solid ? 'navbar--solid' : 'navbar--transparent')}`}
        role="navigation" aria-label="Main navigation">
        <div className="navbar__inner">

          {/* Logo */}
          <Link to="/" style={{ textDecoration: 'none' }} aria-label="Niramoy Home">
            <NiramoyLogo size="md" variant={scrolled || solid ? 'default' : 'light'} tagline="Rajshahi Digital Health" />
          </Link>

          {/* Desktop Nav */}
          <nav className="navbar__nav" style={{ gap: '4px' }}>
            {MAIN_NAV_LINKS.map(link => (
              <Link
                key={link.href}
                to={link.href}
                className={`navbar__link ${location.pathname === link.href ||
                  (link.href !== '/' && location.pathname.startsWith(link.href)) ? 'active' : ''}`}
                style={{ padding: '8px 12px', fontSize: '0.86rem' }}
              >
                {link.label}
              </Link>
            ))}

            {/* More ▾ Dropdown */}
            <div ref={moreDropdownRef} style={{ position: 'relative' }}>
              <button
                type="button"
                onClick={() => setMoreDropdownOpen(o => !o)}
                className={`navbar__link ${isMoreActive ? 'active' : ''}`}
                style={{
                  background: 'none', border: 'none', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', gap: '4px',
                  padding: '8px 12px', fontSize: '0.86rem', fontFamily: 'inherit'
                }}
                aria-expanded={moreDropdownOpen}
                aria-haspopup="true"
              >
                More <ChevronDown style={{
                  width: 14, height: 14,
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
                          <Icon size={16} style={{ marginTop: '2px', color: 'var(--color-primary, #0d7c6e)', flexShrink: 0 }} />
                          <div>
                            <div style={{ fontWeight: 700, fontSize: '0.85rem' }}>{item.label}</div>
                            <div style={{ fontSize: '0.72rem', color: 'var(--color-text-muted, #47615f)' }}>{item.desc}</div>
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
            {/* Cart */}
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
                  <span style={{ maxWidth: 100, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {user.name?.split(' ')[0]}
                  </span>
                  <ChevronDown style={{
                    width: 14, height: 14, opacity: 0.6,
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
                <Link to="/signin" className="navbar__signin">Enter Portal</Link>
                <Link to="/register" className="navbar__cta">
                  Become a Member
                </Link>
              </>
            )}

            {/* Mobile toggle */}
            <button
              className="navbar__mobile-toggle"
              onClick={() => setMobileOpen(true)}
              aria-label="Open mobile menu"
            >
              <Menu style={{ width: 22, height: 22 }} />
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="navbar__mobile-menu" role="dialog" aria-modal="true" aria-label="Mobile navigation"
          onClick={(e) => { if (e.target === e.currentTarget) setMobileOpen(false); }}>
          <div className="navbar__mobile-panel" style={{ maxHeight: '100vh', overflowY: 'auto' }}>
            <div className="navbar__mobile-header">
              <Link to="/" onClick={() => setMobileOpen(false)} style={{ textDecoration: 'none' }}>
                <NiramoyLogo size="sm" tagline="Rajshahi Health" />
              </Link>
              <button onClick={() => setMobileOpen(false)} style={{
                background: 'var(--color-bg-muted)', border: 'none', cursor: 'pointer',
                width: 36, height: 36, borderRadius: 'var(--radius-md)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'var(--color-text)'
              }} aria-label="Close menu">
                <X style={{ width: 18, height: 18 }} />
              </button>
            </div>

            <div className="navbar__mobile-nav">
              {/* Primary Services */}
              <div style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--color-text-muted, #47615f)', textTransform: 'uppercase', letterSpacing: '0.06em', padding: '8px 16px 4px 16px' }}>
                Healthcare Services
              </div>
              {MAIN_NAV_LINKS.map(link => (
                <Link
                  key={link.href}
                  to={link.href}
                  className={`navbar__mobile-link ${location.pathname === link.href ||
                    (link.href !== '/' && location.pathname.startsWith(link.href)) ? 'active' : ''}`}
                >
                  {link.label}
                </Link>
              ))}

              {/* Resources & More */}
              <div style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--color-text-muted, #47615f)', textTransform: 'uppercase', letterSpacing: '0.06em', padding: '16px 16px 4px 16px' }}>
                Platform & Resources
              </div>
              {MORE_NAV_LINKS.map(link => (
                <Link
                  key={link.href}
                  to={link.href}
                  className={`navbar__mobile-link ${location.pathname === link.href ? 'active' : ''}`}
                >
                  {link.label}
                </Link>
              ))}

              {/* Provider Quick Links */}
              <div style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--color-text-muted, #47615f)', textTransform: 'uppercase', letterSpacing: '0.06em', padding: '16px 16px 4px 16px' }}>
                For Healthcare Providers
              </div>
              <Link to="/register/doctor" className="navbar__mobile-link">Doctor Registration</Link>
              <Link to="/register/facility" className="navbar__mobile-link">Hospital / Clinic Registration</Link>
              <Link to="/register/pharmacy" className="navbar__mobile-link">Pharmacy Registration</Link>
              <Link to="/register/ambulance" className="navbar__mobile-link">Ambulance Fleet Registration</Link>

              {user && (
                <>
                  <div style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--color-text-muted, #47615f)', textTransform: 'uppercase', letterSpacing: '0.06em', padding: '16px 16px 4px 16px' }}>
                    Account Portal
                  </div>
                  <Link to={getDashboard(user.role)} className="navbar__mobile-link">
                    <LayoutDashboard style={{ width: 16, height: 16 }} /> Dashboard
                  </Link>
                </>
              )}
            </div>

            <div className="navbar__mobile-footer">
              {user ? (
                <>
                  <div style={{ padding: '10px 14px', background: 'var(--color-primary-50)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-primary-100)' }}>
                    <div style={{ fontSize: 'var(--text-sm)', fontWeight: 700, color: 'var(--color-text)' }}>{user.name}</div>
                    <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>{user.email}</div>
                  </div>
                  <button
                    onClick={() => { logout(); navigate('/'); setMobileOpen(false); }}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 8, padding: '11px 14px',
                      borderRadius: 'var(--radius-md)', border: 'none', cursor: 'pointer',
                      background: 'var(--color-error-bg)', color: 'var(--color-error)',
                      fontSize: 'var(--text-sm)', fontWeight: 700, width: '100%',
                      fontFamily: 'var(--font-body)'
                    }}
                  >
                    <LogOut style={{ width: 15, height: 15 }} /> Sign Out
                  </button>
                </>
              ) : (
                <>
                  <Link to="/signin" className="btn btn-ghost" style={{ width: '100%', justifyContent: 'center' }}>Enter Portal</Link>
                  <Link to="/register" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }}>Become a Member</Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
