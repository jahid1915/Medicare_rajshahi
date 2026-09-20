import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import NiramoyLogo from '../Common/NiramoyLogo';
import {
  LayoutDashboard, Sparkles, UserCheck, ShoppingBag,
  FileText, Activity, Users, Lock, LogOut, Sun, Moon,
  Building2, Sliders, AlertOctagon, BarChart2, Radio, Stethoscope,
  Pill, ClipboardList, Ambulance, CreditCard, CalendarDays,
  Heart, FolderOpen, Settings, Home, ChevronRight, Menu, X
} from 'lucide-react';

const PATIENT_NAV = [
  { path: '/dashboard', label: 'Health Overview', icon: LayoutDashboard },
  { path: '/dashboard/ai-assistant', label: 'AI Assistant', icon: Sparkles },
  { path: '/dashboard/appointments', label: 'Appointments', icon: CalendarDays },
  { path: '/dashboard/prescriptions', label: 'Prescriptions', icon: ClipboardList },
  { path: '/dashboard/medical-memory', label: 'Medical Memory', icon: Heart },
  { path: '/dashboard/doctors', label: 'Find Doctors', icon: UserCheck },
  { path: '/dashboard/pharmacy', label: 'Pharmacies', icon: Pill },
  { path: '/dashboard/medicines', label: 'Search Medicines', icon: ShoppingBag },
  { path: '/dashboard/cart', label: 'Medicine Cart', icon: ShoppingBag },
  { path: '/dashboard/hospitals', label: 'Hospitals & Beds', icon: Building2 },
  { path: '/dashboard/diagnostics', label: 'Diagnostics', icon: Activity },
  { path: '/dashboard/payments', label: 'Payments', icon: CreditCard },
  { path: '/dashboard/family', label: 'Family Health', icon: Users },
  { path: '/dashboard/documents', label: 'Documents', icon: FolderOpen },
  { path: '/dashboard/privacy', label: 'Privacy & Consent', icon: Lock },
];

const DOCTOR_NAV = [
  { path: '/doctor-portal', label: 'Overview', icon: LayoutDashboard },
  { path: '/doctor-portal/appointments', label: "Today's Patients", icon: CalendarDays },
  { path: '/doctor-portal/consultations', label: 'Consultations', icon: Stethoscope },
  { path: '/doctor-portal/ai-copilot', label: 'AI Copilot', icon: Sparkles },
  { path: '/doctor-portal/prescriptions', label: 'Prescriptions', icon: ClipboardList },
  { path: '/doctor-portal/patients', label: 'Patient Records', icon: Users },
  { path: '/doctor-portal/feedback', label: 'AI Feedback', icon: BarChart2 },
];

const PHARMACY_NAV = [
  { path: '/pharmacy-portal', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/pharmacy-portal/orders', label: 'Orders', icon: ShoppingBag },
  { path: '/pharmacy-portal/inventory', label: 'Inventory', icon: Pill },
  { path: '/pharmacy-portal/analytics', label: 'Analytics', icon: BarChart2 },
];

const HOSPITAL_NAV = [
  { path: '/hospital-portal', label: 'Command Center', icon: LayoutDashboard },
  { path: '/hospital-portal/beds', label: 'Bed Management', icon: Building2 },
  { path: '/hospital-portal/admissions', label: 'Admissions', icon: Users },
  { path: '/hospital-portal/emergency', label: 'Emergency', icon: AlertOctagon },
  { path: '/hospital-portal/ambulances', label: 'Ambulances', icon: Ambulance },
  { path: '/hospital-portal/resources', label: 'Resources', icon: Activity },
  { path: '/hospital-portal/forecasting', label: 'Forecasting', icon: BarChart2 },
  { path: '/hospital-portal/what-if', label: 'What-If Simulator', icon: Sliders },
  { path: '/hospital-portal/iot', label: 'IoT Telemetry', icon: Radio },
];

const ADMIN_NAV = [
  { path: '/admin', label: 'Platform Overview', icon: LayoutDashboard },
  { path: '/admin/users', label: 'Users', icon: Users },
  { path: '/admin/hospitals', label: 'Hospitals', icon: Building2 },
  { path: '/admin/pharmacies', label: 'Pharmacies', icon: Pill },
  { path: '/admin/doctors', label: 'Doctors', icon: Stethoscope },
  { path: '/admin/payments', label: 'Payments', icon: CreditCard },
  { path: '/admin/ai', label: 'AI Models', icon: Sparkles },
  { path: '/admin/research', label: 'Research', icon: BarChart2 },
  { path: '/admin/audit', label: 'Audit Logs', icon: FileText },
  { path: '/admin/settings', label: 'Settings', icon: Settings },
];

function getNavForRole(role) {
  if (['doctor', 'specialist_doctor', 'nurse', 'lab_tech', 'radiology_tech'].includes(role)) return DOCTOR_NAV;
  if (['pharmacy_owner', 'pharmacist'].includes(role)) return PHARMACY_NAV;
  if (['hospital_admin', 'hospital_management', 'receptionist'].includes(role)) return HOSPITAL_NAV;
  if (['super_admin', 'compliance_auditor', 'researcher'].includes(role)) return ADMIN_NAV;
  return PATIENT_NAV;
}

function getRoleLabel(role) {
  const labels = {
    patient: 'Patient Portal', doctor: 'Physician Portal', specialist_doctor: 'Specialist Portal',
    pharmacy_owner: 'Pharmacy Owner', pharmacist: 'Pharmacist Portal',
    hospital_admin: 'Hospital Admin', hospital_management: 'Hospital Staff',
    nurse: 'Nursing Portal', lab_tech: 'Lab Portal', radiology_tech: 'Radiology Portal',
    receptionist: 'Front Desk', ambulance_op: 'Ambulance Ops',
    researcher: 'Research Portal', compliance_auditor: 'Audit Portal', super_admin: 'Super Admin'
  };
  return labels[role] || 'Dashboard';
}

export default function DashboardLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const navItems = getNavForRole(user?.role);

  // Close mobile sidebar on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  return (
    <div className="dashboard-layout" style={{ display: 'flex', minHeight: '100vh', background: 'var(--color-bg)' }}>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          style={{
            position: 'fixed', inset: 0, background: 'rgba(13, 31, 30, 0.4)',
            backdropFilter: 'blur(4px)', zIndex: 90
          }}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`dashboard-sidebar ${mobileOpen ? 'open' : ''}`}
        style={{
          width: 270,
          background: 'var(--color-surface)',
          borderRight: '1px solid var(--color-border)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: 'var(--sp-6) var(--sp-4)',
          position: 'sticky',
          top: 0,
          height: '100vh',
          zIndex: 95,
          overflowY: 'auto'
        }}
      >
        <div>
          {/* Brand Header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--sp-6)', padding: '0 var(--sp-2)' }}>
            <Link
              to="/"
              style={{
                display: 'flex', alignItems: 'center', gap: 10,
                textDecoration: 'none', color: 'inherit'
              }}
            >
              <NiramoyLogo size="sm" tagline={getRoleLabel(user?.role)} />
            </Link>

            {mobileOpen && (
              <button
                onClick={() => setMobileOpen(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-secondary)' }}
              >
                <X style={{ width: 20, height: 20 }} />
              </button>
            )}
          </div>

          {/* User Card */}
          <div style={{
            padding: '12px 14px', borderRadius: 'var(--radius-lg)',
            background: 'var(--color-primary-50)', border: '1px solid rgba(13, 124, 110, 0.1)',
            marginBottom: 'var(--sp-6)'
          }}>
            <div style={{ fontSize: 'var(--text-sm)', fontWeight: 700, color: 'var(--color-text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {user?.name || 'User'}
            </div>
            <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)', marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {user?.email}
            </div>
          </div>

          {/* Navigation Links */}
          <nav style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {navItems.map(item => {
              const isActive = location.pathname === item.path ||
                (item.path !== '/dashboard' && item.path !== '/doctor-portal' && item.path !== '/pharmacy-portal' && item.path !== '/hospital-portal' && item.path !== '/admin' && location.pathname.startsWith(item.path));
              return (
                <button
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px',
                    borderRadius: 'var(--radius-lg)', border: 'none', cursor: 'pointer', width: '100%', textAlign: 'left',
                    fontSize: 'var(--text-sm)', fontWeight: isActive ? 700 : 500,
                    background: isActive ? 'var(--color-primary)' : 'transparent',
                    color: isActive ? 'white' : 'var(--color-text-secondary)',
                    transition: 'all var(--trans-fast)',
                    boxShadow: isActive ? '0 4px 12px rgba(13, 124, 110, 0.25)' : 'none'
                  }}
                >
                  <item.icon style={{ width: 17, height: 17, flexShrink: 0, color: isActive ? 'white' : 'currentColor' }} />
                  <span style={{ flex: 1 }}>{item.label}</span>
                  {isActive && <ChevronRight style={{ width: 14, height: 14, opacity: 0.8 }} />}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom Actions */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, paddingTop: 'var(--sp-4)', borderTop: '1px solid var(--color-border)' }}>
          <button
            onClick={() => navigate('/')}
            style={{
              display: 'flex', alignItems: 'center', gap: 10, padding: '9px 12px',
              borderRadius: 'var(--radius-md)', border: 'none', cursor: 'pointer',
              fontSize: 'var(--text-sm)', fontWeight: 500, background: 'transparent',
              color: 'var(--color-text-secondary)', transition: 'background var(--trans-fast)'
            }}
          >
            <Home style={{ width: 16, height: 16 }} /> Public Site
          </button>
          <button
            onClick={() => { logout(); navigate('/'); }}
            style={{
              display: 'flex', alignItems: 'center', gap: 10, padding: '9px 12px',
              borderRadius: 'var(--radius-md)', border: 'none', cursor: 'pointer',
              fontSize: 'var(--text-sm)', fontWeight: 600, background: 'rgba(220, 38, 38, 0.05)',
              color: 'var(--color-error)', transition: 'background var(--trans-fast)'
            }}
          >
            <LogOut style={{ width: 16, height: 16 }} /> Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, overflow: 'hidden' }}>
        {/* Mobile Top bar */}
        <header
          className="dashboard-mobile-bar"
          style={{
            display: 'none', alignItems: 'center', justifyContent: 'space-between',
            padding: '12px 18px', background: 'var(--color-surface)',
            borderBottom: '1px solid var(--color-border)', position: 'sticky', top: 0, zIndex: 40
          }}
        >
          <Link to="/" style={{ textDecoration: 'none' }}>
            <NiramoyLogo size="sm" showTagline={false} />
          </Link>
          <button
            onClick={() => setMobileOpen(true)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-primary)' }}
            aria-label="Open menu"
          >
            <Menu style={{ width: 22, height: 22 }} />
          </button>
        </header>

        {/* Router Outlet */}
        <main style={{ flex: 1, overflowY: 'auto', padding: 'var(--sp-6)' }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
