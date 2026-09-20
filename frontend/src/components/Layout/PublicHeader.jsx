import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import {
  HeartPulse, Search, Menu, X, User, LogOut,
  Stethoscope, Building2, Pill, FlaskConical, Siren, Sparkles, ChevronDown, ShoppingCart
} from 'lucide-react';

const NAV_LINKS = [
  { path: '/', label: 'Home', icon: null },
  { path: '/doctors', label: 'Doctors', icon: Stethoscope },
  { path: '/hospitals', label: 'Hospitals', icon: Building2 },
  { path: '/pharmacies', label: 'Pharmacies', icon: Pill },
  { path: '/medicines', label: 'Medicines', icon: Search },
  { path: '/diagnostics', label: 'Diagnostics', icon: FlaskConical },
  { path: '/emergency', label: 'Emergency', icon: Siren, isEmergency: true },
];

export default function PublicHeader() {
  const { isAuthenticated, user, logout } = useAuth();
  const { totalItemsCount } = useCart();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const getDashboardPath = () => {
    if (!user) return '/dashboard';
    const role = user.role;
    if (['hospital_admin', 'hospital_management'].includes(role)) return '/hospital-portal';
    if (['pharmacy_owner', 'pharmacist'].includes(role)) return '/pharmacy-portal';
    if (['doctor', 'specialist_doctor'].includes(role)) return '/doctor-portal';
    if (role === 'super_admin') return '/admin';
    return '/dashboard';
  };

  return (
    <header className="public-header">
      <div className="public-header__inner">
        {/* Logo */}
        <Link to="/" className="public-header__logo">
          <div className="public-header__logo-icon">
            <HeartPulse style={{ width: 22, height: 22 }} />
          </div>
          <div>
            <span className="public-header__logo-text">
              Medicare <span className="public-header__logo-badge">AI</span>
            </span>
            <span className="public-header__logo-sub">Rajshahi Healthcare</span>
          </div>
        </Link>

        {/* Desktop Nav */}
        <nav className="public-header__nav">
          {NAV_LINKS.map(link => (
            <Link
              key={link.path}
              to={link.path}
              className={`public-header__nav-link ${location.pathname === link.path ? 'active' : ''} ${link.isEmergency ? 'emergency' : ''}`}
            >
              {link.icon && <link.icon style={{ width: 15, height: 15 }} />}
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Right Actions */}
        <div className="public-header__actions">
          {/* Cart Quick Button */}
          <Link
            to="/cart"
            style={{
              position: "relative",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: "38px",
              height: "38px",
              borderRadius: "10px",
              background: "rgba(255, 255, 255, 0.08)",
              border: "1px solid rgba(255, 255, 255, 0.12)",
              color: "var(--text-primary, #fff)",
              textDecoration: "none"
            }}
            title="View Medicine Cart"
          >
            <ShoppingCart size={18} />
            {totalItemsCount > 0 && (
              <span
                style={{
                  position: "absolute",
                  top: "-4px",
                  right: "-4px",
                  background: "var(--teal-500, #0d9488)",
                  color: "#fff",
                  fontSize: "0.72rem",
                  fontWeight: 800,
                  width: "18px",
                  height: "18px",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center"
                }}
              >
                {totalItemsCount}
              </span>
            )}
          </Link>

          {isAuthenticated ? (
            <div className="public-header__user-menu" style={{ position: 'relative' }}>
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="public-header__user-btn"
              >
                <div className="public-header__avatar">
                  {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                </div>
                <span className="public-header__user-name">{user?.name?.split(' ')[0]}</span>
                <ChevronDown style={{ width: 14, height: 14, opacity: 0.6 }} />
              </button>
              {userMenuOpen && (
                <div className="public-header__dropdown" onClick={() => setUserMenuOpen(false)}>
                  <div className="public-header__dropdown-header">
                    <strong>{user?.name}</strong>
                    <span>{user?.role?.replace(/_/g, ' ')}</span>
                  </div>
                  <Link to={getDashboardPath()} className="public-header__dropdown-item">
                    <User style={{ width: 15, height: 15 }} /> Dashboard
                  </Link>
                  <button onClick={logout} className="public-header__dropdown-item danger">
                    <LogOut style={{ width: 15, height: 15 }} /> Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="public-header__auth-btns">
              <Link to="/signin" className="btn-ghost">Sign In</Link>
              <Link to="/register" className="btn btn-primary btn-sm">Create Account</Link>
            </div>
          )}

          {/* Mobile Menu Toggle */}
          <button className="public-header__mobile-toggle" onClick={() => setMobileOpen(!mobileOpen)}>
            {mobileOpen ? <X style={{ width: 22, height: 22 }} /> : <Menu style={{ width: 22, height: 22 }} />}
          </button>
        </div>
      </div>

      {/* Mobile Nav */}
      {mobileOpen && (
        <div className="public-header__mobile-nav" onClick={() => setMobileOpen(false)}>
          {NAV_LINKS.map(link => (
            <Link key={link.path} to={link.path}
              className={`public-header__mobile-link ${location.pathname === link.path ? 'active' : ''} ${link.isEmergency ? 'emergency' : ''}`}>
              {link.icon && <link.icon style={{ width: 16, height: 16 }} />}
              {link.label}
            </Link>
          ))}
          {!isAuthenticated && (
            <>
              <Link to="/signin" className="public-header__mobile-link">Sign In</Link>
              <Link to="/register" className="public-header__mobile-link" style={{ color: 'var(--primary)' }}>Create Account</Link>
            </>
          )}
        </div>
      )}
    </header>
  );
}
