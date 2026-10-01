import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Home, Stethoscope, Calendar, Pill, User } from 'lucide-react';

export default function MobileBottomNav() {
  const { user } = useAuth();
  const location = useLocation();

  const navItems = [
    { label: 'Home', href: '/', icon: Home, exact: true },
    { label: 'Doctors', href: '/doctors', icon: Stethoscope },
    { label: 'Appointments', href: user ? '/dashboard' : '/signin', icon: Calendar },
    { label: 'Pharmacy', href: '/pharmacies', icon: Pill },
    { label: 'Profile', href: user ? '/dashboard' : '/signin', icon: User },
  ];

  const isActive = (item) => {
    if (item.exact) return location.pathname === item.href;
    return location.pathname.startsWith(item.href);
  };

  return (
    <nav 
      className="mobile-bottom-nav" 
      aria-label="Mobile Bottom Navigation"
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        height: '64px',
        backgroundColor: 'var(--bg-card, #ffffff)',
        borderTop: '1px solid var(--border-color, #e2e8f0)',
        display: 'flex',
        justifyContent: 'space-around',
        alignItems: 'center',
        zIndex: 90,
        boxShadow: '0 -2px 10px rgba(0, 0, 0, 0.05)',
        paddingBottom: 'env(safe-area-inset-bottom, 0px)'
      }}
    >
      {navItems.map((item) => {
        const Icon = item.icon;
        const active = isActive(item);
        return (
          <Link
            key={item.label}
            to={item.href}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              flex: 1,
              height: '100%',
              textDecoration: 'none',
              color: active ? 'var(--color-primary, #0d7c6e)' : 'var(--text-muted, #64748b)',
              fontSize: '0.68rem',
              fontWeight: active ? 700 : 500,
              transition: 'all 0.15s ease',
              minWidth: '48px',
              minHeight: '48px'
            }}
          >
            <Icon 
              style={{ 
                width: 20, 
                height: 20, 
                marginBottom: '3px',
                strokeWidth: active ? 2.5 : 2
              }} 
            />
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
