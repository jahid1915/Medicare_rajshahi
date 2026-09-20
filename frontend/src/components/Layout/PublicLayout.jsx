import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import NiramoyNavbar from './PublicHeader';
import NiramoyLogo from '../Common/NiramoyLogo';

export default function PublicLayout() {
  const location = useLocation();
  const isHome = location.pathname === '/';

  return (
    <div className="public-layout">
      <NiramoyNavbar />
      <main className={`public-main ${isHome ? 'public-main--home' : 'public-main--padded'}`}>
        <Outlet />
      </main>
      <NiramoyFooter />
    </div>
  );
}

function NiramoyFooter() {
  return (
    <footer className="footer">
      <div className="footer__inner">
        <div className="footer__grid">
          {/* Brand */}
          <div>
            <div style={{ marginBottom: 'var(--sp-4)' }}>
              <NiramoyLogo size="md" tagline="Healthcare Made Simple" />
            </div>
            <p className="footer__brand-desc">
              Healthcare made simple. Find trusted doctors, pharmacies, and health services across Rajshahi — all in one place.
            </p>
          </div>

          {/* Explore */}
          <div>
            <div className="footer__col-title">Explore</div>
            <div className="footer__links">
              <Link to="/doctors" className="footer__link">Find Doctors</Link>
              <Link to="/pharmacies" className="footer__link">Pharmacies</Link>
              <Link to="/hospitals" className="footer__link">Hospitals</Link>
              <Link to="/medicines" className="footer__link">Search Medicines</Link>
              <Link to="/diagnostics" className="footer__link">Diagnostics</Link>
            </div>
          </div>

          {/* Portals */}
          <div>
            <div className="footer__col-title">For Professionals</div>
            <div className="footer__links">
              <Link to="/doctor-portal" className="footer__link">Doctor Portal</Link>
              <Link to="/pharmacy-portal" className="footer__link">Pharmacy Portal</Link>
              <Link to="/hospital-portal" className="footer__link">Hospital Portal</Link>
              <Link to="/register" className="footer__link">Partner with Niramoy</Link>
            </div>
          </div>

          {/* Account */}
          <div>
            <div className="footer__col-title">Account</div>
            <div className="footer__links">
              <Link to="/signin" className="footer__link">Sign In</Link>
              <Link to="/register" className="footer__link">Create Account</Link>
              <Link to="/dashboard" className="footer__link">My Dashboard</Link>
              <span className="footer__link" style={{ cursor: 'default', opacity: 0.6 }}>Privacy Policy</span>
              <span className="footer__link" style={{ cursor: 'default', opacity: 0.6 }}>Terms of Service</span>
            </div>
          </div>
        </div>

        <div className="footer__bottom">
          <p className="footer__copy">
            © {new Date().getFullYear()} Niramoy — Rajshahi Healthcare Platform
          </p>
          <p className="footer__disclaimer">
            Information is sourced from public directories. Always verify details before visiting. Not a substitute for professional medical advice.
          </p>
        </div>
      </div>
    </footer>
  );
}
