import React from 'react';
import { Link } from 'react-router-dom';
import NiramoyLogo from '../Common/NiramoyLogo';
import {
  Phone, Mail, MapPin, ShieldCheck, HeartPulse, Stethoscope,
  Building2, Pill, Truck, Sparkles, AlertTriangle, ArrowRight,
  ExternalLink, FileText, Activity
} from 'lucide-react';

export default function NiramoyFooter() {
  const currentYear = new Date().getFullYear();

  return (
    <footer style={{
      background: '#0d1f1d',
      color: 'rgba(255, 255, 255, 0.75)',
      paddingTop: '64px',
      paddingBottom: '32px',
      borderTop: '1px solid rgba(255, 255, 255, 0.08)',
      fontSize: '0.88rem'
    }} role="contentinfo" aria-label="Site footer">
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 24px' }}>
        
        {/* Brand & Hotlines Header Row */}
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          flexWrap: 'wrap', gap: '24px', paddingBottom: '36px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)', marginBottom: '44px'
        }}>
          <div>
            <NiramoyLogo size="md" variant="light" tagline="Rajshahi Healthcare & Smart Hospital Platform" />
            <p style={{ margin: '10px 0 0 0', maxWidth: '440px', fontSize: '0.85rem', color: 'rgba(255, 255, 255, 0.65)', lineHeight: 1.6 }}>
              A unified digital healthcare ecosystem connecting patients, verified BMDC doctors, hospital bed telemetry, community pharmacies, and emergency ambulance dispatch across Rajshahi Division.
            </p>
          </div>

          {/* Quick Emergency Helplines Pill */}
          <div className="footer-emergency-bar" style={{
            display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap',
            background: 'rgba(255, 255, 255, 0.05)', padding: '12px 20px', borderRadius: '14px',
            border: '1px solid rgba(255, 255, 255, 0.1)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#ef4444', boxShadow: '0 0 8px #ef4444' }} />
              <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#fca5a5', textTransform: 'uppercase' }}>National Emergency:</span>
              <a href="tel:999" style={{ color: '#ffffff', fontWeight: 900, textDecoration: 'none' }}>999</a>
            </div>
            <span style={{ color: 'rgba(255, 255, 255, 0.2)' }}>|</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '0.78rem', fontWeight: 800, color: 'rgba(255, 255, 255, 0.7)', textTransform: 'uppercase' }}>Health Helpline:</span>
              <a href="tel:16263" style={{ color: '#ffffff', fontWeight: 900, textDecoration: 'none' }}>16263</a>
            </div>
            <span style={{ color: 'rgba(255, 255, 255, 0.2)' }}>|</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '0.78rem', fontWeight: 800, color: 'rgba(255, 255, 255, 0.7)', textTransform: 'uppercase' }}>Email:</span>
              <a href="mailto:support@niramoy.health" style={{ color: '#2dd4bf', fontWeight: 700, textDecoration: 'none' }}>support@niramoy.health</a>
            </div>
          </div>
        </div>

        {/* 5-Column Primary Navigation Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '36px',
          marginBottom: '48px'
        }}>

          {/* 1. Company */}
          <div>
            <div style={{ fontSize: '0.9rem', fontWeight: 800, color: '#ffffff', marginBottom: '16px', letterSpacing: '0.02em', display: 'flex', alignItems: 'center', gap: '6px' }}>
              Company
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <Link to="/about" className="footer-link">About Niramoy</Link>
              <Link to="/health-tips" className="footer-link">Health Tips & Resources</Link>
              <Link to="/contact" className="footer-link">Contact Us</Link>
              <Link to="/facilities" className="footer-link">Find a Healthcare Facility</Link>
            </div>
          </div>

          {/* 2. Healthcare Services */}
          <div>
            <div style={{ fontSize: '0.9rem', fontWeight: 800, color: '#ffffff', marginBottom: '16px', letterSpacing: '0.02em', display: 'flex', alignItems: 'center', gap: '6px' }}>
              Healthcare Services
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <Link to="/doctors" className="footer-link">Find Doctors</Link>
              <Link to="/hospitals" className="footer-link">Hospitals & Clinics</Link>
              <Link to="/diagnostics" className="footer-link">Diagnostic Centers</Link>
              <Link to="/pharmacies" className="footer-link">Pharmacies</Link>
              <Link to="/ambulance" className="footer-link">Ambulance & Emergency</Link>
              <Link to="/ai" className="footer-link">Niramoy AI Assistant</Link>
            </div>
          </div>

          {/* 3. Patient Services */}
          <div>
            <div style={{ fontSize: '0.9rem', fontWeight: 800, color: '#ffffff', marginBottom: '16px', letterSpacing: '0.02em', display: 'flex', alignItems: 'center', gap: '6px' }}>
              Patient Services
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <Link to="/doctors" className="footer-link">Doctor Appointment</Link>
              <Link to="/dashboard/telemedicine" className="footer-link">Online Consultation</Link>
              <Link to="/dashboard/prescriptions" className="footer-link">Prescriptions & Records</Link>
              <Link to="/medicines" className="footer-link">Medicine Search</Link>
              <Link to="/pharmacies" className="footer-link">Pharmacy Stock Availability</Link>
              <Link to="/dashboard/family" className="footer-link">Family Health Timeline</Link>
              <Link to="/ambulance" className="footer-link">Emergency Help (999)</Link>
            </div>
          </div>

          {/* 4. For Healthcare Professionals */}
          <div>
            <div style={{ fontSize: '0.9rem', fontWeight: 800, color: '#ffffff', marginBottom: '16px', letterSpacing: '0.02em', display: 'flex', alignItems: 'center', gap: '6px' }}>
              For Providers
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <Link to="/register/doctor" className="footer-link">Doctor Registration</Link>
              <Link to="/register/facility" className="footer-link">Hospital / Clinic Registration</Link>
              <Link to="/register/diagnostic" className="footer-link">Diagnostic Center Registration</Link>
              <Link to="/register/pharmacy" className="footer-link">Pharmacy Registration</Link>
              <Link to="/register/ambulance" className="footer-link">Ambulance Provider Registration</Link>
              <Link to="/doctor-portal" className="footer-link">Physician Portal</Link>
              <Link to="/pharmacy-portal" className="footer-link">Pharmacy Portal</Link>
            </div>
          </div>

          {/* 5. Research & Technology */}
          <div>
            <div style={{ fontSize: '0.9rem', fontWeight: 800, color: '#ffffff', marginBottom: '16px', letterSpacing: '0.02em', display: 'flex', alignItems: 'center', gap: '6px' }}>
              Research & Technology
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <Link to="/ai" className="footer-link">Niramoy AI Health Suite</Link>
              <Link to="/research" className="footer-link">Healthcare Research</Link>
              <Link to="/research#predictive-analytics" className="footer-link">AI Health Analytics</Link>
              <Link to="/research#smart-hospital" className="footer-link">Smart Hospital Telemetry</Link>
              <Link to="/research#medical-memory" className="footer-link">Digital Health Technology</Link>
            </div>
          </div>

        </div>

        {/* Dedicated Legal Section (Separated) */}
        <div style={{
          padding: '24px 0',
          borderTop: '1px solid rgba(255, 255, 255, 0.1)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px',
          marginBottom: '28px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', color: 'rgba(255, 255, 255, 0.5)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            <ShieldCheck size={16} color="#2dd4bf" /> Legal & Clinical Governance
          </div>

          <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap', fontSize: '0.84rem' }}>
            <Link to="/terms" className="footer-legal-link">Terms of Service</Link>
            <Link to="/privacy" className="footer-legal-link">Privacy Policy</Link>
            <Link to="/cookie-policy" className="footer-legal-link">Cookie Policy</Link>
            <Link to="/disclaimer" className="footer-legal-link">Medical Disclaimer</Link>
          </div>
        </div>

        {/* Bottom Copyright & Disclaimer Row */}
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          flexWrap: 'wrap', gap: '16px', fontSize: '0.78rem', color: 'rgba(255, 255, 255, 0.45)'
        }}>
          <div>
            © 2026 Niramoy. All rights reserved. Registered Rajshahi Healthcare & Smart Hospital Platform.
          </div>
          <div style={{ maxWidth: '580px', textAlign: 'right', lineHeight: 1.5 }}>
            Medical Notice: Niramoy provides digital health coordination and resource discovery. AI tools and articles do not provide clinical medical diagnosis. In life-threatening emergencies, call 999 or proceed to Rajshahi Medical College Hospital.
          </div>
        </div>

      </div>

      <style>{`
        .footer-link {
          color: rgba(255, 255, 255, 0.65);
          text-decoration: none;
          font-size: 0.85rem;
          transition: color 0.15s ease, transform 0.15s ease;
          display: inline-block;
        }
        .footer-link:hover {
          color: #2dd4bf;
          transform: translateX(2px);
        }
        .footer-legal-link {
          color: rgba(255, 255, 255, 0.7);
          text-decoration: none;
          transition: color 0.15s ease;
        }
        .footer-legal-link:hover {
          color: #ffffff;
          text-decoration: underline;
        }
      `}</style>
    </footer>
  );
}
