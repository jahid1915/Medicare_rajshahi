import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import NiramoyLogo from '../Common/NiramoyLogo';
import {
  Stethoscope, Pill, LayoutDashboard, LogOut, X, Menu,
  ShoppingCart, ChevronDown, Home
} from 'lucide-react';

const NAV_LINKS = [
  { label: 'Home', href: '/' },
  { label: 'Doctors', href: '/doctors' },
  { label: 'Pharmacies', href: '/pharmacies' },
  { label: 'Hospitals', href: '/hospitals' },
  { label: 'Medicines', href: '/medicines' },
];

function getDashboard(role) {
  if (['hospital_admin','hospital_management','receptionist'].includes(role)) return '/hospital-portal';
  if (['pharmacy_owner','pharmacist'].includes(role)) return '/pharmacy-portal';
  if (['doctor','specialist_doctor','nurse','lab_tech','radiology_tech'].includes(role)) return '/doctor-portal';
  if (['super_admin','compliance_auditor','researcher'].includes(role)) return '/admin';
  return '/dashboard';
}

export default function NiramoyNavbar() {
  const { user, logout } = useAuth();
  const { cartItems = [] } = useCart?.() || {};
  const location = useLocation();
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Hero pages get transparent navbar
  const isHero = location.pathname === '/';

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Close mobile menu on route change
  useEffect(() => { setMobileOpen(false); }, [location.pathname]);

  const solid = !isHero || scrolled;
  const cartCount = cartItems?.reduce?.((s, i) => s + (i.quantity || 1), 0) || 0;

  const initials = user?.name
    ? user.name.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase()
    : '?';

  return (
    <>
      <nav className={`navbar ${solid ? 'navbar--solid' : 'navbar--transparent'}`}
        role="navigation" aria-label="Main navigation">
        <div className="navbar__inner">

          {/* Logo */}
          <Link to="/" style={{ textDecoration: 'none' }} aria-label="Niramoy Home">
            <NiramoyLogo size="md" tagline="Rajshahi Digital Health" />
          </Link>

          {/* Desktop Nav */}
          <nav className="navbar__nav">
            {NAV_LINKS.map(link => (
              <Link
                key={link.href}
                to={link.href}
                className={`navbar__link ${location.pathname === link.href ||
                  (link.href !== '/' && location.pathname.startsWith(link.href)) ? 'active' : ''}`}
              >
                {link.label}
              </Link>
            ))}
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
              <div ref={dropdownRef} style={{ position: 'relative' }}>
                <button
                  className="navbar__user-btn"
                  onClick={() => setDropdownOpen(o => !o)}
                  aria-expanded={dropdownOpen}
                  aria-haspopup="true"
                >
                  <div className="navbar__avatar">{initials}</div>
                  <span style={{ maxWidth: 100, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {user.name?.split(' ')[0]}
                  </span>
                  <ChevronDown style={{ width: 14, height: 14, opacity: 0.6,
                    transform: dropdownOpen ? 'rotate(180deg)' : 'rotate(0)',
                    transition: 'transform 0.15s' }} />
                </button>

                {dropdownOpen && (
                  <div className="navbar__dropdown">
                    <div className="navbar__dropdown-header">
                      <strong>{user.name}</strong>
                      <span>{user.role?.replace(/_/g, ' ')}</span>
                    </div>
                    <Link
                      to={getDashboard(user.role)}
                      className="navbar__dropdown-item"
                      onClick={() => setDropdownOpen(false)}
                    >
                      <LayoutDashboard style={{ width: 15, height: 15 }} /> Dashboard
                    </Link>
                    <button
                      className="navbar__dropdown-item danger"
                      onClick={() => { logout(); navigate('/'); setDropdownOpen(false); }}
                    >
                      <LogOut style={{ width: 15, height: 15 }} /> Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link to="/signin" className="navbar__signin">Sign In</Link>
                <Link to="/register" className="navbar__cta">
                  Get Started
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
          <div className="navbar__mobile-panel">
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
              {NAV_LINKS.map(link => (
                <Link
                  key={link.href}
                  to={link.href}
                  className={`navbar__mobile-link ${location.pathname === link.href ||
                    (link.href !== '/' && location.pathname.startsWith(link.href)) ? 'active' : ''}`}
                >
                  {link.label}
                </Link>
              ))}
              {user && (
                <Link to={getDashboard(user.role)} className="navbar__mobile-link">
                  <LayoutDashboard style={{ width: 16, height: 16 }} /> Dashboard
                </Link>
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
                  <Link to="/signin" className="btn btn-ghost" style={{ width: '100%', justifyContent: 'center' }}>Sign In</Link>
                  <Link to="/register" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }}>Get Started</Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
