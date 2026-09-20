import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  HeartPulse, LayoutDashboard, Sparkles, UserCheck, ShoppingBag,
  FileText, Activity, Users, Lock, LogOut, Sun, Moon,
  Building2, Sliders, AlertOctagon, BarChart2, Radio, Stethoscope,
  Pill, ClipboardList, Ambulance, CreditCard, Bell, CalendarDays,
  Heart, FolderOpen, Settings, Home
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
  const [theme, setTheme] = useState(localStorage.getItem('medicare_theme') || 'light');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('medicare_theme', theme);
  }, [theme]);

  const navItems = getNavForRole(user?.role);

  return (
    <div className="app-canvas">
      {/* Sidebar */}
      <aside className="sidebar">
        <div>
          {/* Brand */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              width: 40, height: 40, borderRadius: 12,
              background: 'var(--primary)', display: 'flex',
              alignItems: 'center', justifyContent: 'center', color: 'white'
            }}>
              <HeartPulse style={{ width: 22, height: 22 }} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.15rem', fontWeight: 900, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 4, letterSpacing: '-0.03em' }}>
                Medicare <span style={{ fontSize: '0.625rem', padding: '2px 6px', background: 'var(--bg-badge)', color: 'var(--primary)', borderRadius: 6, fontWeight: 700 }}>AI</span>
              </h2>
              <span style={{ fontSize: '0.625rem', color: 'var(--text-muted)', fontWeight: 600 }}>{getRoleLabel(user?.role)}</span>
            </div>
          </div>

          {/* User Info */}
          <div style={{ marginTop: 16, padding: '10px 12px', borderRadius: 10, background: 'var(--bg-badge)' }}>
            <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-primary)' }}>{user?.name}</div>
            <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: 2 }}>{user?.email}</div>
          </div>

          {/* Nav */}
          <nav style={{ marginTop: 20, display: 'flex', flexDirection: 'column', gap: 2 }}>
            {navItems.map(item => {
              const isActive = location.pathname === item.path ||
                (item.path !== '/dashboard' && item.path !== '/doctor-portal' && item.path !== '/pharmacy-portal' && item.path !== '/hospital-portal' && item.path !== '/admin' && location.pathname.startsWith(item.path));
              return (
                <button
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  className={`sidebar-btn ${isActive ? 'active' : ''}`}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 10, padding: '9px 12px',
                    borderRadius: 10, border: 'none', cursor: 'pointer', width: '100%', textAlign: 'left',
                    fontSize: '0.78rem', fontWeight: isActive ? 700 : 500,
                    background: isActive ? 'var(--primary-glow)' : 'transparent',
                    color: isActive ? 'var(--primary)' : 'var(--text-secondary)',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <item.icon style={{ width: 16, height: 16, flexShrink: 0 }} />
                  {item.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom Actions */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <button
            onClick={() => navigate('/')}
            style={{
              display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px',
              borderRadius: 8, border: 'none', cursor: 'pointer',
              fontSize: '0.75rem', fontWeight: 500, background: 'transparent',
              color: 'var(--text-muted)'
            }}
          >
            <Home style={{ width: 15, height: 15 }} /> Public Site
          </button>
          <button
            onClick={() => setTheme(t => t === 'dark' ? 'light' : 'dark')}
            style={{
              display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px',
              borderRadius: 8, border: 'none', cursor: 'pointer',
              fontSize: '0.75rem', fontWeight: 500, background: 'transparent',
              color: 'var(--text-muted)'
            }}
          >
            {theme === 'dark' ? <Sun style={{ width: 15, height: 15 }} /> : <Moon style={{ width: 15, height: 15 }} />}
            {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
          </button>
          <button
            onClick={() => { logout(); navigate('/'); }}
            style={{
              display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px',
              borderRadius: 8, border: 'none', cursor: 'pointer',
              fontSize: '0.75rem', fontWeight: 600, background: 'transparent',
              color: 'var(--danger)'
            }}
          >
            <LogOut style={{ width: 15, height: 15 }} /> Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden', width: '100%' }}>
        <div style={{ flex: 1, overflowY: 'auto' }}>
          <Outlet />
        </div>
      </div>
    </div>
  );
}
