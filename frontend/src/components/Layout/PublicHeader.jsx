import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useLanguage } from '../../i18n';
import NiramoyLogo from '../Common/NiramoyLogo';
import LanguageToggle from '../Common/LanguageToggle';
import {
  LayoutDashboard, LogOut, X, Menu, ShoppingCart
} from 'lucide-react';

const MAIN_NAV_ITEMS = [
  { id: 'home', key: 'nav.home', defaultLabel: 'Home', href: '/' },
  { id: 'doctors', key: 'nav.doctors', defaultLabel: 'Doctors', href: '/doctors' },
  { id: 'hospitals', key: 'nav.hospitals', defaultLabel: 'Hospitals', href: '/hospitals' },
  { id: 'diagnostics', key: 'nav.diagnostics', defaultLabel: 'Diagnostics', href: '/diagnostics' },
  { id: 'pharmacy', key: 'nav.pharmacy', defaultLabel: 'Pharmacy', href: '/pharmacies' },
  { id: 'medicine', key: 'nav.medicine', defaultLabel: 'Medicine', href: '/medicines' },
  { id: 'ai', key: 'nav.ai', defaultLabel: 'AI', href: '/ai' },
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
  const { t } = useLanguage();
  const location = useLocation();
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const userDropdownRef = useRef(null);

  // Performant scroll listener using requestAnimationFrame and 30px threshold
  useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const isScrolled = window.scrollY > 30;
          setScrolled(prev => prev !== isScrolled ? isScrolled : prev);
          ticking = false;
        });
        ticking = true;
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close dropdowns & mobile menu on route change
  useEffect(() => {
    setMobileOpen(false);
    setUserDropdownOpen(false);
  }, [location.pathname]);

  // Close user dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (userDropdownRef.current && !userDropdownRef.current.contains(e.target)) {
        setUserDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

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

  const cartCount = cartItems?.reduce?.((s, i) => s + (i.quantity || 1), 0) || 0;

  const initials = user?.name
    ? String(user.name).trim().split(/\s+/).slice(0, 2).map(w => w?.[0] || '').join('').toUpperCase() || 'U'
    : '?';

  // Pre-warm primary routes on idle
  useEffect(() => {
    const timer = setTimeout(() => {
      import('../Doctor/DoctorDiscovery');
      import('../Hospitals/HospitalSearchPage');
      import('../Pharmacy/PharmacyDirectory');
      import('../Diagnostic/DiagnosticCenterView');
      import('../Pharmacy/MedicineSearch');
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
      case '/medicines': import('../Pharmacy/MedicineSearch'); break;
      case '/ai': import('../Public/AIPage'); break;
      default: break;
    }
  };

  return (
    <>
      <nav
        className={`navbar ${scrolled ? 'navbar-scrolled' : 'navbar-top'}`}
        role="navigation"
        aria-label="Main navigation"
      >
        <div className="navbar__inner">

          {/* Brand Logo on the left */}
          <Link to="/" className="navbar__logo-link" aria-label="Niramoy Healthcare" title="Niramoy Healthcare Home">
            <NiramoyLogo size="md" variant="light" tagline="Rajshahi Digital Health" />
          </Link>

          {/* Desktop Navigation Menu — strictly Home through AI */}
          <nav className="navbar__nav" aria-label="Primary Navigation">
            {MAIN_NAV_ITEMS.map(link => {
              const isActive = link.href === '/'
                ? location.pathname === '/'
                : location.pathname.startsWith(link.href);
              const label = t(link.key, link.defaultLabel);
              return (
                <Link
                  key={link.href}
                  to={link.href}
                  className={`navbar__link ${isActive ? 'active' : ''}`}
                  onMouseEnter={() => prefetchRoute(link.href)}
                  onFocus={() => prefetchRoute(link.href)}
                >
                  {label}
                </Link>
              );
            })}
          </nav>

          {/* Right Action: Language Switcher, Cart, Sign in & Become a member CTA */}
          <div className="navbar__actions">
            {/* Global Language Switcher Slider: [ EN | বাংলা ] */}
            <LanguageToggle variant="nav" />

            {cartCount > 0 && (
              <Link to="/cart" className="navbar__cart" aria-label={`Cart (${cartCount} items)`}>
                <ShoppingCart style={{ width: 17, height: 17 }} />
                <span className="navbar__cart-count">{cartCount}</span>
              </Link>
            )}

            {user ? (
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
                </button>

                {userDropdownOpen && (
                  <div className="navbar__user-menu">
                    <div className="navbar__user-menu-header">
                      <strong>{user.name}</strong>
                      <span>{user.role?.replace(/_/g, ' ')}</span>
                    </div>
                    <Link
                      to={getDashboard(user.role)}
                      className="navbar__user-menu-item"
                      onClick={() => setUserDropdownOpen(false)}
                    >
                      <LayoutDashboard size={15} /> {t('nav.dashboard', 'Dashboard')}
                    </Link>
                    <button
                      className="navbar__user-menu-item danger"
                      onClick={() => { logout(); navigate('/'); setUserDropdownOpen(false); }}
                    >
                      <LogOut size={15} /> {t('nav.signOut', 'Sign Out')}
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link to="/signin" className="navbar__signin">
                  {t('nav.signIn', 'Sign in')}
                </Link>
                <Link to="/register" className="navbar__cta">
                  {t('nav.register', 'Become a member')}
                </Link>
              </>
            )}

            {/* Mobile Menu Toggle Button */}
            <button
              className="navbar__mobile-toggle"
              onClick={() => setMobileOpen(true)}
              aria-label="Open navigation menu"
            >
              <Menu size={22} />
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Drawer (Clean, limited strictly to Home through AI + Become a member) */}
      {mobileOpen && (
        <div
          className="navbar__mobile-overlay"
          role="dialog"
          aria-modal="true"
          aria-label="Mobile navigation"
          onClick={(e) => { if (e.target === e.currentTarget) setMobileOpen(false); }}
        >
          <div className="navbar__mobile-panel">
            <div className="navbar__mobile-header">
              <Link to="/" onClick={() => setMobileOpen(false)} style={{ textDecoration: 'none' }}>
                <NiramoyLogo size="sm" variant="light" tagline="Rajshahi Health" />
              </Link>
              <button
                onClick={() => setMobileOpen(false)}
                className="navbar__mobile-close"
                aria-label="Close navigation menu"
              >
                <X size={20} />
              </button>
            </div>

            <div className="navbar__mobile-body">
              <div className="navbar__mobile-links">
                {MAIN_NAV_ITEMS.map(link => {
                  const isActive = link.href === '/'
                    ? location.pathname === '/'
                    : location.pathname.startsWith(link.href);
                  const label = t(link.key, link.defaultLabel);
                  return (
                    <Link
                      key={link.href}
                      to={link.href}
                      onClick={() => setMobileOpen(false)}
                      className={`navbar__mobile-link ${isActive ? 'active' : ''}`}
                    >
                      <span>{label}</span>
                    </Link>
                  );
                })}
              </div>
            </div>

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
                    <span>{t('nav.dashboard', 'Dashboard')}</span>
                  </Link>
                  <button
                    onClick={() => { logout(); navigate('/'); setMobileOpen(false); }}
                    className="navbar__mobile-cta-btn"
                    style={{ background: 'rgba(239, 68, 68, 0.15)', color: '#f87171', border: '1px solid rgba(239, 68, 68, 0.3)' }}
                  >
                    <LogOut size={16} />
                    <span>{t('nav.signOut', 'Sign Out')}</span>
                  </button>
                </>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <Link
                    to="/register"
                    onClick={() => setMobileOpen(false)}
                    className="navbar__cta"
                    style={{ justifyContent: 'center', width: '100%', padding: '12px' }}
                  >
                    {t('nav.register', 'Become a member')}
                  </Link>
                  <Link
                    to="/signin"
                    onClick={() => setMobileOpen(false)}
                    className="navbar__signin"
                    style={{ textAlign: 'center', padding: '10px' }}
                  >
                    {t('nav.signIn', 'Sign in')}
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
