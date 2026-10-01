import React from 'react';
import { Link } from 'react-router-dom';
import {
  HeartPulse, ShieldCheck, Stethoscope, Building2, Pill,
  Truck, Cpu, Users, Award, MapPin, ArrowRight, CheckCircle2,
  Activity, PhoneCall, Sparkles, Network, Clock
} from 'lucide-react';

export default function AboutPage() {
  const pillars = [
    {
      icon: Stethoscope,
      title: 'Verified Doctors & Specialists',
      desc: 'Connecting patients with BMDC-verified physicians across general medicine, surgery, pediatrics, gynecology, and cardiology with transparent chamber schedules.'
    },
    {
      icon: Building2,
      title: 'Smart Hospital & Resource Visibility',
      desc: 'Real-time telemetry for hospital beds, ICU units, CCU facilities, and emergency departments across public and private healthcare centers in Rajshahi.'
    },
    {
      icon: Pill,
      title: 'Connected Local Pharmacies',
      desc: 'Instant medicine availability checks and doorstep delivery from licensed community pharmacies, avoiding counterfeit drugs and stockouts.'
    },
    {
      icon: Activity,
      title: 'Diagnostic Centers & Digital Reports',
      desc: 'Booking diagnostic imaging and pathology tests with standardized digital lab report delivery directly into your secure patient health timeline.'
    },
    {
      icon: Truck,
      title: 'Rapid Ambulance & Emergency Dispatch',
      desc: 'Fast, verified ambulance dispatch (BLS, AC, ICU) coordinated with local emergency medical operators for rapid transfer to Rajshahi Medical College Hospital.'
    },
    {
      icon: Cpu,
      title: 'Intelligent Healthcare Assistant',
      desc: 'Assisting patients and clinicians with clinical decision support, symptom triage warnings, medicine reminders, and health memory timelines.'
    }
  ];

  const values = [
    {
      title: 'Clinical Trust First',
      desc: 'We never compromise on physician credential verification or clinical safety. Every doctor profile is anchored to legitimate BMDC records.'
    },
    {
      title: 'Regional Accessibility',
      desc: 'Designed ground-up for Rajshahi Division with high responsiveness, offline resilience, and bilingual accessibility for patients from urban and rural areas.'
    },
    {
      title: 'Zero Counterfeit & Real Stock',
      desc: 'We partner directly with registered pharmacies and licensed distributors to ensure genuine medicines and transparent retail pricing.'
    },
    {
      title: 'Patient Privacy by Default',
      desc: 'Prescriptions, diagnostic imaging, and medical history are strictly isolated to authenticated patients and authorized consulting clinicians.'
    }
  ];

  return (
    <div className="about-page" style={{ color: 'var(--color-text, #142422)', paddingBottom: '80px' }}>
      {/* Hero Section */}
      <section style={{
        background: 'linear-gradient(135deg, #0d7c6e 0%, #085249 100%)',
        color: '#ffffff',
        padding: '72px 20px',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{ maxWidth: '840px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '8px',
            padding: '6px 16px', borderRadius: '99px',
            background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(8px)',
            fontSize: '0.85rem', fontWeight: 700, marginBottom: '20px',
            letterSpacing: '0.04em'
          }}>
            <Sparkles size={16} /> NIRAMOY HEALTHCARE ECOSYSTEM
          </div>
          <h1 style={{
            fontSize: 'clamp(2.2rem, 5vw, 3.4rem)',
            fontWeight: 900,
            lineHeight: 1.15,
            letterSpacing: '-0.03em',
            margin: '0 0 16px 0'
          }}>
            About Niramoy
          </h1>
          <p style={{
            fontSize: 'clamp(1.05rem, 2vw, 1.35rem)',
            color: 'rgba(255,255,255,0.92)',
            maxWidth: '680px',
            margin: '0 auto 28px auto',
            lineHeight: 1.5,
            fontWeight: 400
          }}>
            Building a smarter, connected healthcare ecosystem for Bangladesh.
          </p>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/doctors" className="btn btn-primary" style={{ background: '#ffffff', color: '#0d7c6e', fontWeight: 700 }}>
              Find Doctors
            </Link>
            <Link to="/hospitals" className="btn btn-secondary" style={{ background: 'transparent', borderColor: 'rgba(255,255,255,0.5)', color: '#ffffff' }}>
              Explore Hospitals & Beds
            </Link>
          </div>
        </div>
      </section>

      {/* Mission & Purpose */}
      <section style={{ maxWidth: '1100px', margin: '0 auto', padding: '64px 20px 32px 20px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '48px', alignItems: 'center' }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: 'var(--color-primary, #0d7c6e)', fontWeight: 700, fontSize: '0.85rem', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              <Network size={16} /> Our Foundation
            </div>
            <h2 style={{ fontSize: '2rem', fontWeight: 900, letterSpacing: '-0.02em', margin: '0 0 16px 0', lineHeight: 1.25 }}>
              Connecting the Entire Healthcare Chain
            </h2>
            <p style={{ fontSize: '1rem', lineHeight: 1.7, color: 'var(--color-text-secondary, #2f4847)', marginBottom: '16px' }}>
              Healthcare in Bangladesh has long suffered from fragmented records, uncertain bed availability during critical hours, and difficulty locating genuine medicines and chamber schedules.
            </p>
            <p style={{ fontSize: '1rem', lineHeight: 1.7, color: 'var(--color-text-secondary, #2f4847)', marginBottom: '24px' }}>
              Niramoy serves as an integrated digital bridge uniting <strong>patients, physicians, hospitals, diagnostic centers, community pharmacies, and ambulance operators</strong> into one synchronized network, starting with Rajshahi Division.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
              <div style={{ padding: '16px', background: 'var(--color-surface, #ffffff)', border: '1px solid var(--color-border, #e2eceb)', borderRadius: '12px' }}>
                <div style={{ fontSize: '1.8rem', fontWeight: 900, color: 'var(--color-primary, #0d7c6e)' }}>350+</div>
                <div style={{ fontSize: '0.85rem', color: 'var(--color-text-muted, #47615f)', fontWeight: 600 }}>BMDC Doctors Listed</div>
              </div>
              <div style={{ padding: '16px', background: 'var(--color-surface, #ffffff)', border: '1px solid var(--color-border, #e2eceb)', borderRadius: '12px' }}>
                <div style={{ fontSize: '1.8rem', fontWeight: 900, color: 'var(--color-primary, #0d7c6e)' }}>24/7</div>
                <div style={{ fontSize: '0.85rem', color: 'var(--color-text-muted, #47615f)', fontWeight: 600 }}>Emergency Telemetry</div>
              </div>
            </div>
          </div>

          <div style={{ background: 'var(--color-bg-muted, #f8fafc)', padding: '32px', borderRadius: '20px', border: '1px solid var(--color-border, #e2eceb)' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, margin: '0 0 20px 0' }}>
              What Niramoy Delivers
            </h3>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {[
                'Single digital profile for patient medical memory, history, and prescriptions',
                'Transparent doctor chamber fees, visiting hours, and instant booking slots',
                'Live bed and ICU availability telemetry across Rajshahi hospitals',
                'Doorstep medicine fulfillment via licensed local pharmacies',
                'One-tap verified ambulance dispatch for medical emergencies',
                'Safe AI-guided symptom navigation with clinical escalation protocols'
              ].map((item, idx) => (
                <li key={idx} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start', fontSize: '0.92rem', lineHeight: 1.5 }}>
                  <CheckCircle2 size={18} style={{ color: 'var(--color-primary, #0d7c6e)', flexShrink: 0, marginTop: '2px' }} />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* 6 Connected Pillars */}
      <section style={{ maxWidth: '1100px', margin: '0 auto', padding: '48px 20px' }}>
        <div style={{ textAlign: 'center', maxWidth: '640px', margin: '0 auto 40px auto' }}>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 900, letterSpacing: '-0.02em', margin: '0 0 10px 0' }}>
            The 6 Pillars of the Niramoy Platform
          </h2>
          <p style={{ fontSize: '0.95rem', color: 'var(--color-text-muted, #47615f)' }}>
            Engineered to make every touchpoint of your medical journey reliable, traceable, and rapid.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
          {pillars.map((pillar, idx) => {
            const Icon = pillar.icon;
            return (
              <div key={idx} style={{
                background: 'var(--color-surface, #ffffff)',
                border: '1px solid var(--color-border, #e2eceb)',
                borderRadius: '16px',
                padding: '24px',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
                boxShadow: 'var(--shadow-sm, 0 1px 3px rgba(0,0,0,0.05))',
                transition: 'transform 0.2s, box-shadow 0.2s'
              }}>
                <div style={{
                  width: '44px', height: '44px', borderRadius: '12px',
                  background: 'var(--color-primary-50, #f0faf9)', color: 'var(--color-primary, #0d7c6e)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                  <Icon size={22} />
                </div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 800, margin: 0, color: 'var(--color-text, #142422)' }}>
                  {pillar.title}
                </h3>
                <p style={{ fontSize: '0.88rem', color: 'var(--color-text-secondary, #2f4847)', lineHeight: 1.6, margin: 0 }}>
                  {pillar.desc}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Core Principles */}
      <section style={{ maxWidth: '1100px', margin: '0 auto', padding: '48px 20px' }}>
        <div style={{
          background: 'var(--color-surface, #ffffff)', border: '1px solid var(--color-border, #e2eceb)',
          borderRadius: '20px', padding: '40px 32px'
        }}>
          <h2 style={{ fontSize: '1.6rem', fontWeight: 900, marginBottom: '24px', textAlign: 'center' }}>
            Our Guiding Standards
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '28px' }}>
            {values.map((v, i) => (
              <div key={i}>
                <h4 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--color-primary, #0d7c6e)', margin: '0 0 8px 0' }}>
                  {v.title}
                </h4>
                <p style={{ fontSize: '0.88rem', color: 'var(--color-text-secondary, #2f4847)', lineHeight: 1.6, margin: 0 }}>
                  {v.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Call to action */}
      <section style={{ maxWidth: '960px', margin: '48px auto 0 auto', padding: '0 20px', textAlign: 'center' }}>
        <div style={{
          background: 'var(--color-primary-50, #f0faf9)', border: '1px solid var(--color-primary-100, #ccebe8)',
          borderRadius: '20px', padding: '40px 24px'
        }}>
          <h2 style={{ fontSize: '1.6rem', fontWeight: 900, margin: '0 0 10px 0', color: 'var(--color-text, #142422)' }}>
            Join the Connected Healthcare Network
          </h2>
          <p style={{ fontSize: '0.95rem', color: 'var(--color-text-secondary, #2f4847)', maxWidth: '540px', margin: '0 auto 24px auto', lineHeight: 1.6 }}>
            Whether you are a patient seeking specialized care or a healthcare professional managing clinical chambers, Niramoy is ready to empower you.
          </p>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/register" className="btn btn-primary">
              Create Free Patient Account
            </Link>
            <Link to="/register/doctor" className="btn btn-secondary" style={{ background: '#ffffff' }}>
              Doctor Registration
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
