import React from 'react';
import NiramoyLogo from '../Common/NiramoyLogo';
import { 
  LayoutDashboard, Sparkles, UserCheck, ShoppingBag, 
  FileText, Activity, Users, Lock, LogOut, HeartPulse, Sun, Moon, ShieldAlert,
  Building2, Sliders, AlertOctagon, BarChart2, Radio, Play, Stethoscope, MapPin, Ambulance
} from 'lucide-react';
import { USER_ROLES } from '../../data/hospitalStore';

const PATIENT_NAV = [
  { id: 'dashboard', label: 'Patient Dashboard', icon: LayoutDashboard },
  { id: 'timeline', label: 'Medical Memory Timeline', icon: Users },
  { id: 'ai-assistant', label: 'AI Health Assistant', icon: Sparkles },
  { id: 'doctor-discovery', label: 'Find Doctors', icon: UserCheck },
  { id: 'hospitals', label: 'Hospitals & Resources', icon: Building2 },
  { id: 'pharmacy', label: 'Pharmacy', icon: ShoppingBag },
  { id: 'report-explainer', label: 'Report Explainer', icon: FileText },
  { id: 'comparison', label: 'Document Comparison', icon: Activity },
  { id: 'privacy', label: 'Privacy & Consent', icon: Lock }
];

const CLINICAL_NAV = [
  { id: 'specialists', label: 'Specialist Workspaces', icon: Stethoscope },
  { id: 'timeline', label: 'Medical Memory Timeline', icon: Users },
  { id: 'comparison', label: 'Document Comparison', icon: FileText },
  { id: 'iot', label: 'IoT Vitals Telemetry', icon: Radio },
  { id: 'telemedicine', label: 'Teleconsultation Room', icon: UserCheck }
];

const ADMIN_OPS_NAV = [
  { id: 'admin-dashboard', label: 'Operations Command Center', icon: LayoutDashboard },
  { id: 'hospitals', label: 'Hospital Resources', icon: Building2 },
  { id: 'what-if', label: 'What-If Simulator', icon: Sliders },
  { id: 'early-warning', label: 'Early Warning Center', icon: AlertOctagon },
  { id: 'forecasting', label: 'ML Forecasting', icon: BarChart2 },
  { id: 'iot', label: 'IoT Smart Gateway', icon: Radio },
  { id: 'research', label: 'Research & Cohort Suite', icon: Activity }
];

export default function Sidebar({ 
  activeTab, setActiveTab, activeRole, setActiveRole,
  theme, toggleTheme, onLogout, currentUser, onStartMasterDemo
}) {
  const activeRoleObj = USER_ROLES.find(r => r.id === activeRole) || USER_ROLES[2];

  let currentNavItems = PATIENT_NAV;
  if (['doctor', 'specialist_doctor', 'nurse', 'lab_tech', 'radiology_tech'].includes(activeRole)) {
    currentNavItems = CLINICAL_NAV;
  } else if (['super_admin', 'hospital_admin', 'pharmacist', 'ambulance_op', 'researcher', 'system_auditor', 'receptionist'].includes(activeRole)) {
    currentNavItems = ADMIN_OPS_NAV;
  }

  return (
    <aside className="sidebar">
      <div>
        {/* Brand Header */}
        <div style={{ marginBottom: '8px' }}>
          <NiramoyLogo size="md" tagline="Rajshahi Healthcare" />
        </div>

        {/* 14 ROLE SWITCHER DROP DOWN */}
        <div style={{ marginTop: '16px' }}>
          <label style={{ fontSize: '0.65rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Active User Role Persona:</label>
          <select
            value={activeRole}
            onChange={(e) => {
              const newRole = e.target.value;
              setActiveRole(newRole);
              if (['doctor', 'specialist_doctor', 'nurse'].includes(newRole)) setActiveTab('specialists');
              else if (['super_admin', 'hospital_admin'].includes(newRole)) setActiveTab('hospitals');
              else if (newRole === 'researcher') setActiveTab('research');
              else setActiveTab('dashboard');
            }}
            style={{
              width: '100%',
              marginTop: '4px',
              padding: '6px 8px',
              borderRadius: '8px',
              fontSize: '0.75rem',
              fontWeight: 700,
              background: 'var(--bg-badge)',
              color: 'var(--text-primary)',
              border: '1.5px solid var(--border-default)'
            }}
          >
            {USER_ROLES.map(role => (
              <option key={role.id} value={role.id}>
                {role.icon} {role.title} ({role.badge})
              </option>
            ))}
          </select>
        </div>

        {/* Master Demo Showcase Trigger Button */}
        <button
          onClick={onStartMasterDemo}
          className="btn btn-primary"
          style={{
            width: '100%',
            marginTop: '12px',
            fontSize: '0.75rem',
            padding: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px'
          }}
        >
          <Play style={{ width: 14, height: 14 }} /> Launch 12-Step Master Demo
        </button>

        {/* Menu Navigation List */}
        <nav style={{ marginTop: '20px' }}>
          <ul className="sidebar-menu">
            {currentNavItems.map(item => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <li key={item.id} className={`sidebar-item ${isActive ? 'active' : ''}`}>
                  <button onClick={() => setActiveTab(item.id)}>
                    <Icon style={{ width: '18px', height: '18px', opacity: isActive ? 1 : 0.7 }} />
                    {item.label}
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>

      {/* Footer Controls */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {/* Theme Toggle & Logout */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid var(--border-default)', paddingTop: '16px' }}>
          <button
            onClick={toggleTheme}
            style={{
              padding: '8px 12px',
              borderRadius: '8px',
              background: 'var(--bg-badge)',
              border: '1.5px solid var(--border-default)',
              fontSize: '0.75rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              color: 'var(--text-secondary)'
            }}
          >
            {theme === 'dark' ? <Sun style={{ width: '14px', height: '14px', color: '#f59e0b' }} /> : <Moon style={{ width: '14px', height: '14px' }} />}
            Theme
          </button>
          
          <button
            onClick={onLogout}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              fontSize: '0.75rem',
              fontWeight: 650
            }}
          >
            <LogOut style={{ width: '16px', height: '16px' }} />
            Log out
          </button>
        </div>
      </div>
    </aside>
  );
}
