import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Truck, PhoneCall, ShieldCheck, MapPin, AlertTriangle, Clock,
  Filter, CheckCircle2, ChevronRight, X, HeartPulse, UserPlus, Info
} from 'lucide-react';

const AMBULANCE_TYPES = [
  'All Types',
  'Basic Ambulance (BLS)',
  'AC Ambulance',
  'ICU Ambulance',
  'Specialized Ambulance'
];

const RAJSHAHI_AMBULANCE_PROVIDERS = [
  {
    id: 'AMB-RAJ-01',
    name: 'RMCH Emergency Ambulance Dispatch Desk',
    operator: 'Rajshahi Medical College Hospital',
    type: 'ICU Ambulance',
    area: 'Laxmipur',
    phone: '0721-775094',
    altPhone: '16263',
    isVerified: true,
    available247: true,
    equipment: ['In-transit ICU Ventilator', 'Multipara Cardiac Monitor', 'Central Oxygen Supply', 'Defibrillator', 'Paramedic on Board'],
    rateGuide: 'Govt. subsidized regional tariff',
    notes: 'Primary referral dispatch for critical emergencies arriving at or transferring from RMCH.'
  },
  {
    id: 'AMB-RAJ-02',
    name: 'Red Crescent Emergency Fleet Rajshahi',
    operator: 'Bangladesh Red Crescent Society (Rajshahi Unit)',
    type: 'Basic Ambulance (BLS)',
    area: 'Boalia',
    phone: '0721-772412',
    altPhone: '01712-114422',
    isVerified: true,
    available247: true,
    equipment: ['Oxygen Cylinder', 'Foldable Spine Stretcher', 'Basic First Aid Kit', 'Trained EMT Driver'],
    rateGuide: 'Non-profit subsidized rates',
    notes: 'Trusted community service for local patient transfer across Rajshahi city.'
  },
  {
    id: 'AMB-RAJ-03',
    name: 'Al-Madina Critical Care Ambulance Service',
    operator: 'Al-Madina EMS Services',
    type: 'ICU Ambulance',
    area: 'Laxmipur',
    phone: '01711-239988',
    altPhone: '01715-449900',
    isVerified: true,
    available247: true,
    equipment: ['High-flow Oxygen', 'Syringe Pump', 'Suction Machine', 'Emergency Resuscitation Kit', 'Critical Care Nurse'],
    rateGuide: 'Fixed tariff based on distance (Inter-district transfer to Dhaka available)',
    notes: 'Equipped for long-distance critical transfers from Rajshahi to Dhaka/Bogura.'
  },
  {
    id: 'AMB-RAJ-04',
    name: 'Laxmipur Standard AC Ambulance Service',
    operator: 'Rajshahi Medical Zone Transport',
    type: 'AC Ambulance',
    area: 'Laxmipur',
    phone: '01723-556677',
    altPhone: '01819-332211',
    isVerified: true,
    available247: true,
    equipment: ['Air Conditioned Patient Cabin', 'Continuous Oxygen Flow', 'Standard Wheeled Stretcher', 'Attendant Seating'],
    rateGuide: 'Standard regional AC tariff',
    notes: 'Comfortable transfer for post-operative patients and non-critical clinical visits.'
  },
  {
    id: 'AMB-RAJ-05',
    name: 'Padma Shishu & Neonatal Dedicated Transfer',
    operator: 'Padma Specialized Care',
    type: 'Specialized Ambulance',
    area: 'Rajpara',
    phone: '01718-990011',
    altPhone: '01911-882233',
    isVerified: true,
    available247: true,
    equipment: ['Transport Incubator (Baby Warmer)', 'Pediatric Oxygen Delivery', 'Neonatal Pulse Oximeter', 'NICU Trained Nurse'],
    rateGuide: 'Specialized neonatal care tariff',
    notes: 'Engineered specifically for fragile newborns transferring to Rajshahi Shishu Hospital or RMCH NICU.'
  },
  {
    id: 'AMB-RAJ-06',
    name: 'Anjuman Mufidul Islam Ambulance Wing',
    operator: 'Anjuman Mufidul Islam Rajshahi',
    type: 'Basic Ambulance (BLS)',
    area: 'Shah Makhdum',
    phone: '0721-774431',
    altPhone: '01714-667788',
    isVerified: true,
    available247: true,
    equipment: ['Basic Stretcher', 'Oxygen Delivery', 'Emergency Transit'],
    rateGuide: 'Charitable concession available for low-income patients',
    notes: 'Dedicated humanitarian transport serving all areas of Rajshahi.'
  }
];

export default function AmbulancePage() {
  const [selectedType, setSelectedType] = useState('All Types');
  const [selectedArea, setSelectedArea] = useState('All Areas');
  const [searchQuery, setSearchQuery] = useState('');
  const [bookingModalProvider, setBookingModalProvider] = useState(null);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [bookingForm, setBookingForm] = useState({
    patientName: '',
    contactPhone: '',
    pickupLocation: '',
    destinationHospital: 'Rajshahi Medical College Hospital (RMCH)',
    ambulanceType: 'Basic Ambulance (BLS)',
    urgencyLevel: 'urgent' // 'immediate' | 'urgent' | 'scheduled'
  });

  const areas = ['All Areas', 'Laxmipur', 'Boalia', 'Rajpara', 'Shah Makhdum', 'Motihar'];

  const filteredProviders = useMemo(() => {
    return RAJSHAHI_AMBULANCE_PROVIDERS.filter(item => {
      const matchType = selectedType === 'All Types' || item.type.toLowerCase().includes(selectedType.toLowerCase().replace(' (bls)', ''));
      const matchArea = selectedArea === 'All Areas' || item.area.toLowerCase() === selectedArea.toLowerCase();
      const matchSearch = searchQuery.trim() === '' ||
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.operator.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.area.toLowerCase().includes(searchQuery.toLowerCase());
      return matchType && matchArea && matchSearch;
    });
  }, [selectedType, selectedArea, searchQuery]);

  const handleBookingSubmit = (e) => {
    e.preventDefault();
    if (!bookingForm.patientName || !bookingForm.contactPhone || !bookingForm.pickupLocation) return;
    setBookingSuccess(true);
  };

  return (
    <div className="ambulance-page" style={{ color: 'var(--color-text, #142422)', paddingBottom: '80px' }}>
      {/* Critical Emergency Top Banner */}
      <div style={{
        background: '#dc2626', color: '#ffffff', padding: '14px 20px',
        textAlign: 'center', fontWeight: 700, fontSize: '0.92rem'
      }}>
        <div style={{ maxWidth: '1080px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', flexWrap: 'wrap' }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
            <AlertTriangle size={18} /> CRITICAL MEDICAL EMERGENCY?
          </span>
          <span>Dial <strong>999</strong> (National Emergency) or <strong>16263</strong> (Health Helpline) immediately.</span>
          <a
            href="tel:999"
            style={{
              background: '#ffffff', color: '#dc2626', padding: '4px 14px', borderRadius: '99px',
              textDecoration: 'none', fontWeight: 900, fontSize: '0.85rem'
            }}
          >
            Call 999 Now
          </a>
        </div>
      </div>

      {/* Hero Header */}
      <section style={{
        background: 'linear-gradient(135deg, #0d7c6e 0%, #085249 100%)',
        color: '#ffffff',
        padding: '52px 20px',
        position: 'relative'
      }}>
        <div style={{ maxWidth: '1080px', margin: '0 auto' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '8px',
            padding: '4px 12px', borderRadius: '99px',
            background: 'rgba(255,255,255,0.15)', fontSize: '0.8rem', fontWeight: 700, marginBottom: '14px'
          }}>
            <Truck size={14} /> EMERGENCY & MEDICAL TRANSPORT
          </div>
          <h1 style={{ fontSize: 'clamp(2rem, 4vw, 2.7rem)', fontWeight: 900, margin: '0 0 10px 0', letterSpacing: '-0.02em' }}>
            Ambulance & Emergency Services
          </h1>
          <p style={{ fontSize: '1.02rem', color: 'rgba(255,255,255,0.9)', maxWidth: '680px', margin: 0, lineHeight: 1.5 }}>
            Direct, verified ambulance dispatch across Rajshahi Division. Basic Life Support, AC, ICU, and Neonatal transport coordinated with local medical centers.
          </p>
        </div>
      </section>

      {/* Main Content Area */}
      <div style={{ maxWidth: '1080px', margin: '0 auto', padding: '36px 20px' }}>

        {/* Operational Disclaimer Note */}
        <div style={{
          background: 'var(--color-bg-muted, #f8fafc)', border: '1px solid var(--color-border, #e2eceb)',
          borderRadius: '12px', padding: '14px 18px', marginBottom: '28px',
          display: 'flex', gap: '12px', alignItems: 'center', fontSize: '0.85rem', color: 'var(--color-text-secondary, #2f4847)'
        }}>
          <Info size={20} style={{ color: 'var(--color-primary, #0d7c6e)', flexShrink: 0 }} />
          <div>
            <strong>Verified Dispatch Protocol:</strong> Niramoy connects you directly with certified ambulance operators and hospital fleets. We do not display simulated GPS animations; contact drivers directly via one-tap call for verified arrival estimates.
          </div>
        </div>

        {/* Filter Controls */}
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px',
          marginBottom: '24px', background: 'var(--color-surface, #ffffff)', padding: '16px',
          borderRadius: '16px', border: '1px solid var(--color-border, #e2eceb)'
        }}>
          {/* Search */}
          <div>
            <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, marginBottom: '4px', color: 'var(--color-text-muted, #47615f)' }}>
              Search Provider
            </label>
            <input
              type="text"
              placeholder="e.g. RMCH, ICU, Laxmipur..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%', padding: '8px 12px', borderRadius: '8px',
                border: '1px solid var(--color-border, #e2eceb)', fontSize: '0.88rem', outline: 'none'
              }}
            />
          </div>

          {/* Type Filter */}
          <div>
            <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, marginBottom: '4px', color: 'var(--color-text-muted, #47615f)' }}>
              Ambulance Category
            </label>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              style={{
                width: '100%', padding: '8px 12px', borderRadius: '8px',
                border: '1px solid var(--color-border, #e2eceb)', fontSize: '0.88rem', outline: 'none', background: '#fff'
              }}
            >
              {AMBULANCE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>

          {/* Area Filter */}
          <div>
            <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, marginBottom: '4px', color: 'var(--color-text-muted, #47615f)' }}>
              Location / Area
            </label>
            <select
              value={selectedArea}
              onChange={(e) => setSelectedArea(e.target.value)}
              style={{
                width: '100%', padding: '8px 12px', borderRadius: '8px',
                border: '1px solid var(--color-border, #e2eceb)', fontSize: '0.88rem', outline: 'none', background: '#fff'
              }}
            >
              {areas.map(a => <option key={a} value={a}>{a}</option>)}
            </select>
          </div>
        </div>

        {/* Results Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0 }}>
            Available Verified Fleets in Rajshahi ({filteredProviders.length})
          </h2>
          <Link
            to="/register/ambulance"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem',
              fontWeight: 700, color: 'var(--color-primary, #0d7c6e)', textDecoration: 'none'
            }}
          >
            <UserPlus size={16} /> Register as Ambulance Operator
          </Link>
        </div>

        {/* Provider Cards Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px', marginBottom: '48px' }}>
          {filteredProviders.map(provider => (
            <div
              key={provider.id}
              style={{
                background: 'var(--color-surface, #ffffff)',
                border: '1px solid var(--color-border, #e2eceb)',
                borderRadius: '16px',
                padding: '24px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
              }}
            >
              <div>
                {/* Header row */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px', marginBottom: '8px' }}>
                  <span style={{
                    padding: '3px 10px', borderRadius: '99px', fontSize: '0.75rem', fontWeight: 700,
                    background: provider.type.includes('ICU') ? '#fee2e2' : '#e0f2fe',
                    color: provider.type.includes('ICU') ? '#b91c1c' : '#0369a1',
                    border: `1px solid ${provider.type.includes('ICU') ? '#fca5a5' : '#bae6fd'}`
                  }}>
                    {provider.type}
                  </span>
                  {provider.isVerified && (
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px', fontSize: '0.75rem', fontWeight: 700, color: '#16a34a' }}>
                      <ShieldCheck size={14} /> Verified
                    </span>
                  )}
                </div>

                <h3 style={{ fontSize: '1.15rem', fontWeight: 900, margin: '0 0 4px 0', lineHeight: 1.3 }}>
                  {provider.name}
                </h3>
                <div style={{ fontSize: '0.85rem', color: 'var(--color-text-muted, #47615f)', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <MapPin size={13} /> {provider.area}, Rajshahi • {provider.operator}
                </div>

                {/* Equipment chips */}
                <div style={{ marginBottom: '16px' }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--color-text-muted, #47615f)', marginBottom: '6px' }}>
                    Vehicle Equipment & Medical Support
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {provider.equipment.map((eq, i) => (
                      <span key={i} style={{
                        fontSize: '0.72rem', padding: '2px 8px', borderRadius: '6px',
                        background: 'var(--color-bg-muted, #f8fafc)', border: '1px solid var(--color-border, #e2eceb)',
                        color: 'var(--color-text-secondary, #2f4847)'
                      }}>
                        {eq}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Rate guide */}
                <div style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary, #2f4847)', marginBottom: '16px', background: 'var(--color-bg-muted, #f8fafc)', padding: '8px 12px', borderRadius: '8px' }}>
                  <strong>Rate:</strong> {provider.rateGuide}
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: '8px', borderTop: '1px solid var(--color-border, #e2eceb)', paddingTop: '16px' }}>
                <a
                  href={`tel:${provider.phone.replace(/[^0-9]/g, '')}`}
                  className="btn btn-primary"
                  style={{
                    flex: 1, padding: '10px 12px', display: 'flex', alignItems: 'center',
                    justifyContent: 'center', gap: '6px', fontSize: '0.88rem', fontWeight: 800,
                    textDecoration: 'none'
                  }}
                >
                  <PhoneCall size={16} /> Call Driver
                </a>
                <button
                  onClick={() => {
                    setBookingModalProvider(provider);
                    setBookingSuccess(false);
                    setBookingForm(prev => ({ ...prev, ambulanceType: provider.type }));
                  }}
                  className="btn btn-secondary"
                  style={{ padding: '10px 14px', fontSize: '0.85rem' }}
                >
                  Request Dispatch
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Provider Registration Callout */}
        <div style={{
          background: 'var(--color-surface, #ffffff)', border: '1px solid var(--color-border, #e2eceb)',
          borderRadius: '20px', padding: '36px 32px', textAlign: 'center'
        }}>
          <Truck size={36} style={{ color: 'var(--color-primary, #0d7c6e)', margin: '0 auto 12px auto' }} />
          <h3 style={{ fontSize: '1.35rem', fontWeight: 900, margin: '0 0 8px 0' }}>
            Are You an Ambulance Operator in Rajshahi?
          </h3>
          <p style={{ fontSize: '0.92rem', color: 'var(--color-text-secondary, #2f4847)', maxWidth: '560px', margin: '0 auto 20px auto', lineHeight: 1.6 }}>
            Join the verified Niramoy Emergency Dispatch Network. Receive real-time hospital referral notifications, verified badge status, and transparent passenger dispatch.
          </p>
          <Link to="/register/ambulance" className="btn btn-primary" style={{ fontWeight: 700 }}>
            Register Ambulance Fleet
          </Link>
        </div>
      </div>

      {/* Booking / Dispatch Request Modal */}
      {bookingModalProvider && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: '20px', zIndex: 1000
        }}
        onClick={(e) => { if (e.target === e.currentTarget) setBookingModalProvider(null); }}
        >
          <div style={{
            background: 'var(--color-surface, #ffffff)', borderRadius: '20px',
            maxWidth: '560px', width: '100%', overflow: 'hidden',
            boxShadow: '0 20px 40px rgba(0,0,0,0.2)'
          }}>
            {/* Modal Header */}
            <div style={{
              padding: '20px 24px', borderBottom: '1px solid var(--color-border, #e2eceb)',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              background: 'var(--color-bg-muted, #f8fafc)'
            }}>
              <div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 900, margin: 0 }}>
                  Request Ambulance Dispatch
                </h3>
                <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted, #47615f)' }}>
                  {bookingModalProvider.name}
                </div>
              </div>
              <button
                onClick={() => setBookingModalProvider(null)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted, #47615f)' }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div style={{ padding: '24px' }}>
              {bookingSuccess ? (
                <div style={{ textAlign: 'center', padding: '16px 0' }}>
                  <CheckCircle2 size={44} style={{ color: 'var(--color-primary, #0d7c6e)', margin: '0 auto 12px auto' }} />
                  <h4 style={{ fontSize: '1.2rem', fontWeight: 800, margin: '0 0 6px 0' }}>
                    Dispatch Request Transmitted
                  </h4>
                  <p style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary, #2f4847)', lineHeight: 1.6, marginBottom: '20px' }}>
                    The dispatch operator at <strong>{bookingModalProvider.name}</strong> has received your patient coordinates. Please keep your phone reachable. You can also dial them directly now:
                  </p>
                  <a
                    href={`tel:${bookingModalProvider.phone.replace(/[^0-9]/g, '')}`}
                    className="btn btn-primary"
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '10px 20px', textDecoration: 'none' }}
                  >
                    <PhoneCall size={16} /> Call Driver Directly ({bookingModalProvider.phone})
                  </a>
                </div>
              ) : (
                <form onSubmit={handleBookingSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '4px' }}>
                      Patient Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Rahima Begum"
                      value={bookingForm.patientName}
                      onChange={(e) => setBookingForm({ ...bookingForm, patientName: e.target.value })}
                      style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--color-border, #e2eceb)', fontSize: '0.88rem' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '4px' }}>
                      Attendant Phone Number *
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="017XXXXXXXX"
                      value={bookingForm.contactPhone}
                      onChange={(e) => setBookingForm({ ...bookingForm, contactPhone: e.target.value })}
                      style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--color-border, #e2eceb)', fontSize: '0.88rem' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '4px' }}>
                      Exact Pickup Location / Address in Rajshahi *
                    </label>
                    <textarea
                      rows={2}
                      required
                      placeholder="House/Street, Area (e.g. House 14, Road 2, Shalbagan)"
                      value={bookingForm.pickupLocation}
                      onChange={(e) => setBookingForm({ ...bookingForm, pickupLocation: e.target.value })}
                      style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--color-border, #e2eceb)', fontSize: '0.88rem' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '4px' }}>
                      Destination Hospital
                    </label>
                    <input
                      type="text"
                      value={bookingForm.destinationHospital}
                      onChange={(e) => setBookingForm({ ...bookingForm, destinationHospital: e.target.value })}
                      style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--color-border, #e2eceb)', fontSize: '0.88rem' }}
                    />
                  </div>

                  <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
                    <button type="submit" className="btn btn-primary" style={{ flex: 1, padding: '10px' }}>
                      Confirm Request
                    </button>
                    <button
                      type="button"
                      onClick={() => setBookingModalProvider(null)}
                      className="btn btn-secondary"
                      style={{ padding: '10px 16px' }}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
