import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Search, MapPin, Building2, Stethoscope, Pill, Truck, Activity,
  Filter, Phone, ShieldCheck, ChevronRight, List, Map, ExternalLink,
  Clock, Navigation
} from 'lucide-react';
import { RAJSHAHI_HOSPITALS, RAJSHAHI_AREAS } from '../../data/rajshahiHospitals';

const CATEGORIES = [
  { id: 'all', label: 'All Facilities', icon: Building2 },
  { id: 'hospitals', label: 'Hospitals & Clinics', icon: Building2 },
  { id: 'doctors', label: 'Doctors', icon: Stethoscope },
  { id: 'diagnostics', label: 'Diagnostic Centers', icon: Activity },
  { id: 'pharmacies', label: 'Pharmacies', icon: Pill },
  { id: 'ambulance', label: 'Ambulance Services', icon: Truck }
];

// Unified Rajshahi facilities data aggregating existing verified entities
const DIRECTORY_DATA = [
  // Hospitals & Clinics
  {
    id: 'fac-hosp-1',
    name: 'Rajshahi Medical College Hospital (RMCH)',
    type: 'hospitals',
    categoryLabel: 'Govt. Referral Hospital',
    area: 'Laxmipur',
    address: 'Medical College Road, Laxmipur, Rajshahi',
    phone: '0721-775094',
    isVerified: true,
    services: ['Emergency 24/7', 'ICU/CCU', 'Blood Bank', 'Surgery', 'Pediatrics'],
    link: '/hospitals',
    lat: 24.3722,
    lng: 88.6042
  },
  {
    id: 'fac-hosp-2',
    name: 'Rajshahi Shishu Hospital',
    type: 'hospitals',
    categoryLabel: 'Specialized Govt. Pediatric Hospital',
    area: 'Boalia',
    address: 'Shishu Hospital Road, Boalia, Rajshahi',
    phone: '0721-772100',
    isVerified: true,
    services: ['Pediatrics', 'NICU', 'Pediatric Emergency'],
    link: '/hospitals',
    lat: 24.3704,
    lng: 88.6045
  },
  {
    id: 'fac-hosp-3',
    name: 'Islami Bank Medical College Hospital',
    type: 'hospitals',
    categoryLabel: 'Private Medical College Hospital',
    area: 'Shah Makhdum',
    address: 'Airport Road, Nawdapara, Rajshahi',
    phone: '0721-861410',
    isVerified: true,
    services: ['General Medicine', 'Cardiology', 'ICU', 'Dialysis'],
    link: '/hospitals',
    lat: 24.3980,
    lng: 88.6120
  },
  {
    id: 'fac-hosp-4',
    name: 'Barind Medical College Hospital',
    type: 'hospitals',
    categoryLabel: 'Private Teaching Hospital',
    area: 'Rajpara',
    address: 'Rajpara, Rajshahi',
    phone: '0721-774400',
    isVerified: true,
    services: ['Emergency', 'Surgery', 'Orthopedics', 'ICU'],
    link: '/hospitals',
    lat: 24.3750,
    lng: 88.5800
  },

  // Diagnostic Centers
  {
    id: 'fac-diag-1',
    name: 'Popular Diagnostic Centre - Rajshahi Branch',
    type: 'diagnostics',
    categoryLabel: 'Specialized Diagnostic & Imaging',
    area: 'Laxmipur',
    address: 'Medical College Gate, Laxmipur, Rajshahi',
    phone: '09613-787811',
    isVerified: true,
    services: ['MRI 3T', '128-Slice CT Scan', 'Automated Pathology', 'Digital X-Ray'],
    link: '/diagnostics',
    lat: 24.3718,
    lng: 88.6030
  },
  {
    id: 'fac-diag-2',
    name: 'Ibn Sina Diagnostic & Consultation Centre Rajshahi',
    type: 'diagnostics',
    categoryLabel: 'Comprehensive Diagnostics',
    area: 'Boalia',
    address: 'Zero Point, Saheb Bazar, Rajshahi',
    phone: '0721-776655',
    isVerified: true,
    services: ['Ultrasonography (4D)', 'Endoscopy', 'Clinical Biochemistry', 'ECG/Echo'],
    link: '/diagnostics',
    lat: 24.3680,
    lng: 88.6010
  },
  {
    id: 'fac-diag-3',
    name: 'Medinova Medical Services Rajshahi',
    type: 'diagnostics',
    categoryLabel: 'Imaging & Clinical Lab',
    area: 'Laxmipur',
    address: 'Hospital Road, Laxmipur, Rajshahi',
    phone: '0721-774211',
    isVerified: true,
    services: ['Digital Radiography', 'Hormone Analysis', 'Mammography', 'Microbiology'],
    link: '/diagnostics',
    lat: 24.3725,
    lng: 88.6048
  },

  // Pharmacies
  {
    id: 'fac-pharm-1',
    name: 'Laxmipur Model Pharmacy 24/7',
    type: 'pharmacies',
    categoryLabel: 'Licensed Retail Model Pharmacy',
    area: 'Laxmipur',
    address: 'Main Gate Opposite, RMCH, Laxmipur, Rajshahi',
    phone: '01711-889900',
    isVerified: true,
    services: ['24/7 Emergency Counter', 'Insulin Cold-chain', 'Prescription Delivery'],
    link: '/pharmacies',
    lat: 24.3720,
    lng: 88.6040
  },
  {
    id: 'fac-pharm-2',
    name: 'Saheb Bazar Central Medicine Corner',
    type: 'pharmacies',
    categoryLabel: 'Community Pharmacy Partner',
    area: 'Boalia',
    address: 'Zero Point Market, Boalia, Rajshahi',
    phone: '01712-445566',
    isVerified: true,
    services: ['Doorstep Delivery', 'Generic Substitutions', 'Chronic Care Refills'],
    link: '/pharmacies',
    lat: 24.3675,
    lng: 88.6005
  },
  {
    id: 'fac-pharm-3',
    name: 'Nawdapara Care Pharmacy',
    type: 'pharmacies',
    categoryLabel: 'Neighborhood Pharmacy',
    area: 'Shah Makhdum',
    address: 'Airport Road, Nawdapara, Rajshahi',
    phone: '01819-112233',
    isVerified: true,
    services: ['Retail Medicines', 'Home Delivery in 45 mins'],
    link: '/pharmacies',
    lat: 24.3975,
    lng: 88.6115
  },

  // Ambulances
  {
    id: 'fac-amb-1',
    name: 'RMCH Emergency Ambulance Dispatch Desk',
    type: 'ambulance',
    categoryLabel: 'Hospital Emergency Fleet (ICU/BLS)',
    area: 'Laxmipur',
    address: 'RMCH Emergency Compound, Laxmipur, Rajshahi',
    phone: '0721-775094',
    isVerified: true,
    services: ['ICU Ventilator Support', 'Cardiac Monitor', '24/7 Emergency Dispatch'],
    link: '/ambulance',
    lat: 24.3724,
    lng: 88.6041
  },
  {
    id: 'fac-amb-2',
    name: 'Red Crescent Rajshahi Ambulance Service',
    type: 'ambulance',
    categoryLabel: 'Subsidized Humanitarian Transport',
    area: 'Boalia',
    address: 'Red Crescent Bhaban, Boalia, Rajshahi',
    phone: '0721-772412',
    isVerified: true,
    services: ['Basic Life Support (BLS)', 'Oxygen Onboard', 'Emergency Transit'],
    link: '/ambulance',
    lat: 24.3690,
    lng: 88.6030
  },

  // Doctors / Specialty Chambers
  {
    id: 'fac-doc-1',
    name: 'Rajshahi Specialist Doctor Chambers (Laxmipur Hub)',
    type: 'doctors',
    categoryLabel: 'Physician Consultation Complex',
    area: 'Laxmipur',
    address: 'Laxmipur Main Road (opposite RMCH Gate 1), Rajshahi',
    phone: '01712-334455',
    isVerified: true,
    services: ['Medicine Specialists', 'Cardiologists', 'General Surgeons', 'Gynecologists'],
    link: '/doctors',
    lat: 24.3721,
    lng: 88.6038
  },
  {
    id: 'fac-doc-2',
    name: 'Padma Medical Chambers & Evening Clinics',
    type: 'doctors',
    categoryLabel: 'Multi-Specialty Evening Chambers',
    area: 'Boalia',
    address: 'Kumarpara, Boalia, Rajshahi',
    phone: '01715-667788',
    isVerified: true,
    services: ['Pediatricians', 'Orthopedic Specialists', 'Neurologists', 'Dermatology'],
    link: '/doctors',
    lat: 24.3685,
    lng: 88.6025
  }
];

export default function FacilityDirectoryPage() {
  const [activeCategory, setActiveCategory] = useState('all');
  const [selectedArea, setSelectedArea] = useState('All Areas');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState('list'); // 'list' | 'map'

  const filteredFacilities = useMemo(() => {
    return DIRECTORY_DATA.filter(fac => {
      const matchCat = activeCategory === 'all' || fac.type === activeCategory;
      const matchArea = selectedArea === 'All Areas' || fac.area.toLowerCase() === selectedArea.toLowerCase();
      const matchSearch = searchQuery.trim() === '' ||
        fac.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        fac.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
        fac.services.some(s => s.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchCat && matchArea && matchSearch;
    });
  }, [activeCategory, selectedArea, searchQuery]);

  return (
    <div className="facilities-directory-page" style={{ color: 'var(--color-text, #142422)', paddingBottom: '80px' }}>
      {/* Header Banner */}
      <section style={{
        background: 'linear-gradient(135deg, #0d7c6e 0%, #0a5f54 100%)',
        color: '#ffffff',
        padding: '52px 20px',
        position: 'relative'
      }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '8px',
            padding: '4px 12px', borderRadius: '99px',
            background: 'rgba(255,255,255,0.15)', fontSize: '0.8rem', fontWeight: 700, marginBottom: '14px'
          }}>
            <Building2 size={14} /> UNIFIED HEALTHCARE DIRECTORY
          </div>
          <h1 style={{ fontSize: 'clamp(2rem, 4vw, 2.7rem)', fontWeight: 900, margin: '0 0 10px 0', letterSpacing: '-0.02em' }}>
            Find a Healthcare Facility
          </h1>
          <p style={{ fontSize: '1.02rem', color: 'rgba(255,255,255,0.9)', maxWidth: '680px', margin: 0, lineHeight: 1.5 }}>
            Discover and connect with verified hospitals, doctor chambers, diagnostic imaging centers, licensed pharmacies, and ambulance dispatch in Rajshahi.
          </p>
        </div>
      </section>

      {/* Main Container */}
      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '36px 20px' }}>

        {/* Category Tabs */}
        <div style={{
          display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '12px',
          marginBottom: '24px', scrollbarWidth: 'none'
        }}>
          {CATEGORIES.map(cat => {
            const Icon = cat.icon;
            const active = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: '8px',
                  padding: '10px 18px',
                  borderRadius: '99px',
                  border: active ? '1.5px solid var(--color-primary, #0d7c6e)' : '1px solid var(--color-border, #e2eceb)',
                  background: active ? 'var(--color-primary, #0d7c6e)' : 'var(--color-surface, #ffffff)',
                  color: active ? '#ffffff' : 'var(--color-text-secondary, #2f4847)',
                  fontSize: '0.85rem',
                  fontWeight: active ? 700 : 500,
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  transition: 'all 0.15s ease'
                }}
              >
                <Icon size={16} />
                {cat.label}
              </button>
            );
          })}
        </div>

        {/* Search, Area Filter & Map/List Toggle */}
        <div style={{
          display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap',
          marginBottom: '28px', background: 'var(--color-surface, #ffffff)', padding: '16px',
          borderRadius: '16px', border: '1px solid var(--color-border, #e2eceb)'
        }}>
          {/* Search bar */}
          <div style={{ position: 'relative', flex: '1 1 260px' }}>
            <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted, #47615f)' }} />
            <input
              type="text"
              placeholder="Search by facility name, service, or landmark..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%', padding: '9px 12px 9px 38px', borderRadius: '8px',
                border: '1px solid var(--color-border, #e2eceb)', fontSize: '0.88rem', outline: 'none'
              }}
            />
          </div>

          {/* Area select */}
          <div style={{ flex: '0 1 180px' }}>
            <select
              value={selectedArea}
              onChange={(e) => setSelectedArea(e.target.value)}
              style={{
                width: '100%', padding: '9px 12px', borderRadius: '8px',
                border: '1px solid var(--color-border, #e2eceb)', fontSize: '0.88rem', outline: 'none', background: '#fff'
              }}
            >
              {RAJSHAHI_AREAS.map(a => <option key={a} value={a}>{a}</option>)}
            </select>
          </div>

          {/* Map / List View Toggle */}
          <div style={{ display: 'flex', borderRadius: '8px', border: '1px solid var(--color-border, #e2eceb)', overflow: 'hidden' }}>
            <button
              onClick={() => setViewMode('list')}
              style={{
                display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 14px',
                background: viewMode === 'list' ? 'var(--color-primary-50, #f0faf9)' : '#fff',
                color: viewMode === 'list' ? 'var(--color-primary, #0d7c6e)' : 'var(--color-text-secondary, #2f4847)',
                border: 'none', fontWeight: viewMode === 'list' ? 700 : 500, fontSize: '0.82rem', cursor: 'pointer'
              }}
            >
              <List size={15} /> List
            </button>
            <button
              onClick={() => setViewMode('map')}
              style={{
                display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 14px',
                background: viewMode === 'map' ? 'var(--color-primary-50, #f0faf9)' : '#fff',
                color: viewMode === 'map' ? 'var(--color-primary, #0d7c6e)' : 'var(--color-text-secondary, #2f4847)',
                border: 'none', borderLeft: '1px solid var(--color-border, #e2eceb)',
                fontWeight: viewMode === 'map' ? 700 : 500, fontSize: '0.82rem', cursor: 'pointer'
              }}
            >
              <Map size={15} /> Map View
            </button>
          </div>
        </div>

        {/* Results Count */}
        <div style={{ marginBottom: '20px', fontSize: '0.9rem', color: 'var(--color-text-muted, #47615f)' }}>
          Showing <strong>{filteredFacilities.length}</strong> healthcare facilities in Rajshahi
        </div>

        {/* View Content: List Mode vs Map Mode */}
        {viewMode === 'map' ? (
          <div style={{
            background: 'var(--color-surface, #ffffff)', border: '1px solid var(--color-border, #e2eceb)',
            borderRadius: '20px', padding: '24px', marginBottom: '40px'
          }}>
            <div style={{
              background: '#e6f4f2', borderRadius: '14px', height: '360px',
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              position: 'relative', overflow: 'hidden', border: '1px dashed var(--color-primary, #0d7c6e)'
            }}>
              <MapPin size={48} style={{ color: 'var(--color-primary, #0d7c6e)', marginBottom: '12px' }} />
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, margin: '0 0 6px 0', color: 'var(--color-text, #142422)' }}>
                Rajshahi Regional Healthcare Map
              </h3>
              <p style={{ fontSize: '0.88rem', color: 'var(--color-text-secondary, #2f4847)', maxWidth: '420px', textAlign: 'center', margin: '0 0 16px 0' }}>
                Centering on Rajshahi Medical Zone (Laxmipur, Boalia, Motihar). Below is the list of localized coordinates.
              </p>
              <div style={{
                display: 'inline-flex', gap: '8px', padding: '6px 14px', borderRadius: '99px',
                background: '#ffffff', fontSize: '0.8rem', fontWeight: 700, color: 'var(--color-primary, #0d7c6e)'
              }}>
                <Navigation size={14} /> Center: 24.3722° N, 88.6042° E (RMCH Hub)
              </div>
            </div>

            {/* Quick Map Pins Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px', marginTop: '24px' }}>
              {filteredFacilities.map(fac => (
                <div key={fac.id} style={{
                  padding: '14px', borderRadius: '12px', border: '1px solid var(--color-border, #e2eceb)',
                  background: 'var(--color-bg-muted, #f8fafc)', display: 'flex', flexDirection: 'column', gap: '6px'
                }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-primary, #0d7c6e)' }}>
                    {fac.area} • Lat: {fac.lat}, Lng: {fac.lng}
                  </div>
                  <div style={{ fontSize: '0.92rem', fontWeight: 800 }}>{fac.name}</div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--color-text-muted, #47615f)' }}>{fac.address}</div>
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${fac.lat},${fac.lng}`}
                    target="_blank"
                    rel="noreferrer"
                    style={{ fontSize: '0.78rem', color: 'var(--color-primary, #0d7c6e)', textDecoration: 'none', fontWeight: 700, marginTop: '4px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                  >
                    Open in Google Maps <ExternalLink size={12} />
                  </a>
                </div>
              ))}
            </div>
          </div>
        ) : (
          /* List Mode */
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
            {filteredFacilities.map(fac => (
              <div
                key={fac.id}
                style={{
                  background: 'var(--color-surface, #ffffff)',
                  border: '1px solid var(--color-border, #e2eceb)',
                  borderRadius: '16px',
                  padding: '24px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                  transition: 'border-color 0.2s, box-shadow 0.2s'
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                    <span style={{
                      padding: '3px 8px', borderRadius: '6px', fontSize: '0.72rem', fontWeight: 700,
                      background: 'var(--color-primary-50, #f0faf9)', color: 'var(--color-primary, #0d7c6e)'
                    }}>
                      {fac.categoryLabel}
                    </span>
                    {fac.isVerified && (
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px', fontSize: '0.72rem', fontWeight: 700, color: '#16a34a' }}>
                        <ShieldCheck size={13} /> Verified
                      </span>
                    )}
                  </div>

                  <h3 style={{ fontSize: '1.1rem', fontWeight: 900, margin: '0 0 6px 0', lineHeight: 1.3 }}>
                    {fac.name}
                  </h3>

                  <div style={{ fontSize: '0.82rem', color: 'var(--color-text-muted, #47615f)', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <MapPin size={13} /> {fac.address}
                  </div>

                  {/* Services chips */}
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px', marginBottom: '16px' }}>
                    {fac.services.map((s, idx) => (
                      <span key={idx} style={{
                        fontSize: '0.72rem', padding: '2px 7px', borderRadius: '4px',
                        background: 'var(--color-bg-muted, #f8fafc)', border: '1px solid var(--color-border, #e2eceb)',
                        color: 'var(--color-text-secondary, #2f4847)'
                      }}>
                        {s}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Card Actions */}
                <div style={{ borderTop: '1px solid var(--color-border, #e2eceb)', paddingTop: '14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted, #47615f)', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                    <Phone size={13} /> {fac.phone}
                  </span>
                  <Link
                    to={fac.link}
                    className="btn btn-secondary"
                    style={{ fontSize: '0.78rem', padding: '6px 12px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                  >
                    View Details <ChevronRight size={13} />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}
