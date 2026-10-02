import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../i18n';
import {
  Home, Stethoscope, Calendar, Pill, User, LayoutDashboard,
  CalendarDays, Users, MessageSquare, MoreHorizontal, Clock,
  ClipboardList, Sparkles, UserCheck, Settings, LogOut, X,
  ChevronRight, ShieldCheck, Video
} from 'lucide-react';

export default function MobileBottomNav() {
  const { user, logout } = useAuth();
  const { t } = useLanguage();
  const location = useLocation();
  const navigate = useNavigate();
  const [moreOpen, setMoreOpen] = useState(false);

  const isDoctorMode = location.pathname.startsWith('/doctor-portal') ||
    ['doctor', 'specialist_doctor'].includes(user?.role);

  // Patient Nav
  const patientNavItems = [
    { label: t('nav.home', 'Home'), href: '/', icon: Home, exact: true },
    { label: t('nav.doctors', 'Doctors'), href: '/doctors', icon: Stethoscope },
    { label: t('doctorPortal.appointments', 'Appointments'), href: user ? '/dashboard' : '/signin', icon: Calendar },
    { label: t('nav.pharmacy', 'Pharmacy'), href: '/pharmacies', icon: Pill },
    { label: t('doctorPortal.profile', 'Profile'), href: user ? '/dashboard' : '/signin', icon: User },
  ];

  // Doctor Nav (Mobile First as per Part 3)
  const doctorNavItems = [
    { label: t('nav.home', 'Home'), href: '/doctor-portal', icon: LayoutDashboard, exact: true },
    { label: t('doctorPortal.appointments', 'Appointments'), href: '/doctor-portal/appointments', icon: CalendarDays },
    { label: t('doctorPortal.patients', 'Patients'), href: '/doctor-portal/patients', icon: Users },
    { label: t('doctorPortal.messages', 'Messages'), href: '/doctor-portal/messages', icon: MessageSquare },
    { label: t('common.details', 'More'), href: '#more', icon: MoreHorizontal, isAction: true },
  ];

  const navItems = isDoctorMode ? doctorNavItems : patientNavItems;

  const isActive = (item) => {
    if (item.isAction) return moreOpen;
    if (item.exact) return location.pathname === item.href;
    return location.pathname.startsWith(item.href);
  };

  const handleMoreItemClick = (path) => {
    setMoreOpen(false);
    navigate(path);
  };

  return (
    <>
      {/* Doctor "More" Bottom Sheet Modal */}
      {isDoctorMode && moreOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 150,
            background: 'rgba(15, 23, 42, 0.5)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'flex-end',
            animation: 'fadeIn 0.2s ease-out'
          }}
          onClick={() => setMoreOpen(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: 'var(--color-surface, #ffffff)',
              borderTopLeftRadius: '20px',
              borderTopRightRadius: '20px',
              padding: '20px 20px calc(24px + env(safe-area-inset-bottom, 0px))',
              boxShadow: '0 -10px 25px rgba(0,0,0,0.15)',
              maxHeight: '80vh',
              overflowY: 'auto'
            }}
          >
            {/* Sheet Handle */}
            <div style={{ width: 40, height: 4, borderRadius: 2, background: 'var(--color-border, #cbd5e1)', margin: '0 auto 16px' }} />

            {/* Doctor Info Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, paddingBottom: 12, borderBottom: '1px solid var(--color-border, #e2e8f0)' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--color-text, #0f172a)' }}>
                    {user?.name || 'Dr. Attending Physician'}
                  </span>
                  <ShieldCheck style={{ width: 16, height: 16, color: 'var(--color-primary, #0d7c6e)' }} />
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted, #64748b)', marginTop: 2 }}>
                  Physician Management Portal
                </div>
              </div>
              <button
                onClick={() => setMoreOpen(false)}
                style={{
                  background: 'var(--color-bg-muted, #f1f5f9)',
                  border: 'none',
                  borderRadius: '50%',
                  width: 32,
                  height: 32,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  color: 'var(--color-text-muted, #64748b)'
                }}
                aria-label="Close menu"
              >
                <X style={{ width: 18, height: 18 }} />
              </button>
            </div>

            {/* Secondary Doctor Menu Items */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {[
                { label: 'Schedule & Chamber Hours', path: '/doctor-portal/schedule', icon: Clock },
                { label: 'Teleconsultation Room', path: '/doctor-portal/consultations', icon: Video },
                { label: 'Digital Prescriptions Vault', path: '/doctor-portal/prescriptions', icon: ClipboardList },
                { label: 'AI Clinical Copilot & Tools', path: '/doctor-portal/ai-copilot', icon: Sparkles },
                { label: 'Doctor Profile & Qualifications', path: '/doctor-portal/profile', icon: UserCheck },
                { label: 'Practice Settings', path: '/doctor-portal/settings', icon: Settings },
                { label: 'Public Patient Portal', path: '/', icon: Home },
              ].map((item) => (
                <button
                  key={item.path}
                  onClick={() => handleMoreItemClick(item.path)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px 14px',
                    borderRadius: '12px',
                    border: 'none',
                    background: location.pathname === item.path ? 'var(--color-primary-50, #f0fdfa)' : 'transparent',
                    color: location.pathname === item.path ? 'var(--color-primary, #0d7c6e)' : 'var(--color-text, #1e293b)',
                    fontWeight: location.pathname === item.path ? 700 : 500,
                    fontSize: '0.85rem',
                    cursor: 'pointer',
                    textAlign: 'left',
                    minHeight: 46
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <item.icon style={{ width: 18, height: 18, color: 'var(--color-primary, #0d7c6e)' }} />
                    <span>{item.label}</span>
                  </div>
                  <ChevronRight style={{ width: 16, height: 16, opacity: 0.5 }} />
                </button>
              ))}

              {/* Logout Button */}
              <button
                onClick={() => {
                  setMoreOpen(false);
                  logout();
                  navigate('/');
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: '12px 14px',
                  borderRadius: '12px',
                  border: 'none',
                  background: 'rgba(239, 68, 68, 0.08)',
                  color: '#dc2626',
                  fontWeight: 700,
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  marginTop: 6,
                  minHeight: 46
                }}
              >
                <LogOut style={{ width: 18, height: 18 }} />
                <span>Sign Out of Doctor Session</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Bottom Bar */}
      <nav
        className="mobile-bottom-nav"
        aria-label="Mobile Bottom Navigation"
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          height: '60px',
          backgroundColor: 'var(--color-surface, #ffffff)',
          borderTop: '1px solid var(--color-border, #e2e8f0)',
          display: 'flex',
          justifyContent: 'space-around',
          alignItems: 'center',
          zIndex: 90,
          boxShadow: '0 -2px 10px rgba(0, 0, 0, 0.04)',
          paddingBottom: 'env(safe-area-inset-bottom, 0px)'
        }}
      >
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item);

          if (item.isAction) {
            return (
              <button
                key={item.label}
                onClick={() => setMoreOpen(!moreOpen)}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flex: 1,
                  height: '100%',
                  background: 'transparent',
                  border: 'none',
                  color: active ? 'var(--color-primary, #0d7c6e)' : 'var(--color-text-muted, #64748b)',
                  fontSize: '0.68rem',
                  fontWeight: active ? 700 : 500,
                  cursor: 'pointer',
                  minWidth: '48px',
                  minHeight: '48px'
                }}
              >
                <Icon
                  style={{
                    width: 20,
                    height: 20,
                    marginBottom: '2px',
                    strokeWidth: active ? 2.5 : 2
                  }}
                />
                <span>{item.label}</span>
              </button>
            );
          }

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
                color: active ? 'var(--color-primary, #0d7c6e)' : 'var(--color-text-muted, #64748b)',
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
                  marginBottom: '2px',
                  strokeWidth: active ? 2.5 : 2
                }}
              />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}
