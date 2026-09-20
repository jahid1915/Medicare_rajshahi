import React from 'react';
import { Outlet } from 'react-router-dom';
import PublicHeader from './PublicHeader';
import { HeartPulse, Phone, Mail, MapPin } from 'lucide-react';

export default function PublicLayout() {
  return (
    <div className="public-layout">
      <PublicHeader />
      <main className="public-main">
        <Outlet />
      </main>
      <footer className="public-footer">
        <div className="public-footer__inner">
          <div className="public-footer__brand">
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
              <div style={{
                width: 36, height: 36, borderRadius: 10,
                background: 'var(--primary)', display: 'flex',
                alignItems: 'center', justifyContent: 'center', color: 'white'
              }}>
                <HeartPulse style={{ width: 20, height: 20 }} />
              </div>
              <span style={{ fontWeight: 800, fontSize: '1.1rem', color: 'var(--text-primary)' }}>
                Medicare AI
              </span>
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.6, maxWidth: 320 }}>
              Intelligent Healthcare & Smart Hospital Ecosystem serving Rajshahi Division. 
              AI-assisted clinical decision support under physician supervision.
            </p>
          </div>

          <div className="public-footer__links">
            <div>
              <h4>Platform</h4>
              <a href="/doctors">Find Doctors</a>
              <a href="/hospitals">Hospitals</a>
              <a href="/pharmacies">Pharmacies</a>
              <a href="/diagnostics">Diagnostics</a>
            </div>
            <div>
              <h4>Services</h4>
              <a href="/emergency">Emergency</a>
              <a href="/medicines">Search Medicines</a>
              <a href="/signin">Sign In</a>
              <a href="/register">Create Account</a>
            </div>
            <div>
              <h4>Contact</h4>
              <span><Phone style={{ width: 13, height: 13 }} /> 0721-XXXXXXX</span>
              <span><Mail style={{ width: 13, height: 13 }} /> info@medicare-rajshahi.com</span>
              <span><MapPin style={{ width: 13, height: 13 }} /> Rajshahi, Bangladesh</span>
            </div>
          </div>
        </div>
        <div className="public-footer__bottom">
          <span>© {new Date().getFullYear()} Medicare AI — Rajshahi Healthcare Platform</span>
          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
            Clinical decision-support platform. Not a substitute for professional medical advice.
          </span>
        </div>
      </footer>
    </div>
  );
}
