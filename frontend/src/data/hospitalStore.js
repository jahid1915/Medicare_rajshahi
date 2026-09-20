// MediTwin AI - Centralized Operational & Clinical Store Engine
// Contains 500-Bed Digital Twin State, 14 User Roles, 20 Specialist Workspaces,
// IoT Vitals Feed, Ambulance Fleet, Pharmacy Inventory, Lab Queue & System Audit Logs

export const USER_ROLES = [
  { id: 'super_admin', title: 'Super Admin', icon: '🛡️', badge: 'System Root' },
  { id: 'hospital_admin', title: 'Hospital Administrator', icon: '🏛️', badge: 'Ops Lead' },
  { id: 'doctor', title: 'Attending Physician', icon: '🩺', badge: 'MD / Clinician' },
  { id: 'specialist_doctor', title: 'Specialist Physician', icon: '🔬', badge: 'Consultant' },
  { id: 'nurse', title: 'Charge Nurse', icon: '👩‍⚕️', badge: 'Clinical Staff' },
  { id: 'pharmacist', title: 'Chief Pharmacist', icon: '💊', badge: 'Pharmacy' },
  { id: 'lab_tech', title: 'Laboratory Technician', icon: '🧪', badge: 'Diagnostics' },
  { id: 'radiology_tech', title: 'Radiology Specialist', icon: '🩻', badge: 'Imaging' },
  { id: 'receptionist', title: 'Front Desk / Admissions', icon: '📋', badge: 'Front Office' },
  { id: 'ambulance_op', title: 'Ambulance Operator', icon: '🚑', badge: 'Emergency EMS' },
  { id: 'patient', title: 'Patient Portal', icon: '👤', badge: 'Personal Care' },
  { id: 'caregiver', title: 'Caregiver / Family', icon: '👨‍👩‍👧', badge: 'Family Access' },
  { id: 'researcher', title: 'Clinical Researcher', icon: '📊', badge: 'Data Science' },
  { id: 'system_auditor', title: 'Compliance Auditor', icon: '📜', badge: 'HIPAA Audit' }
];

export const SPECIALTY_WORKSPACES = [
  { id: 'gen_med', name: 'General Medicine', icon: '🩺', lead: 'Dr. Sarah Jenkins', patientsCount: 42, priority: 'Normal' },
  { id: 'cardiology', name: 'Cardiology', icon: '❤️', lead: 'Dr. Marcus Vance', patientsCount: 18, priority: 'High' },
  { id: 'neurology', name: 'Neurology', icon: '🧠', lead: 'Dr. Elena Rostova', patientsCount: 12, priority: 'High' },
  { id: 'neurosurgery', name: 'Neurosurgery', icon: '🔬', lead: 'Dr. Aris Thorne', patientsCount: 6, priority: 'Critical' },
  { id: 'nephrology', name: 'Nephrology', icon: '🫘', lead: 'Dr. Chloe Benitez', patientsCount: 14, priority: 'Normal' },
  { id: 'gastroenterology', name: 'Gastroenterology', icon: '🫄', lead: 'Dr. Tariq Al-Mansoor', patientsCount: 15, priority: 'Normal' },
  { id: 'pulmonology', name: 'Pulmonology', icon: '🫁', lead: 'Dr. Arthur Pendelton', patientsCount: 22, priority: 'High' },
  { id: 'endocrinology', name: 'Endocrinology', icon: '🩺', lead: 'Dr. Maya Lin', patientsCount: 19, priority: 'Normal' },
  { id: 'dermatology', name: 'Dermatology', icon: '🧬', lead: 'Dr. Hannah Schmidt', patientsCount: 11, priority: 'Low' },
  { id: 'pediatrics', name: 'Pediatrics', icon: '👶', lead: 'Dr. Noah Sterling', patientsCount: 28, priority: 'Normal' },
  { id: 'obgyn', name: 'Obstetrics & Gynecology', icon: '🤱', lead: 'Dr. Serena Williams', patientsCount: 31, priority: 'High' },
  { id: 'orthopedics', name: 'Orthopedics', icon: '🦴', lead: 'Dr. Vikram Patel', patientsCount: 25, priority: 'Normal' },
  { id: 'oncology', name: 'Oncology', icon: '🎗️', lead: 'Dr. Rebecca Stone', patientsCount: 16, priority: 'High' },
  { id: 'ophthalmology', name: 'Ophthalmology', icon: '👁️', lead: 'Dr. Kevin Zhao', patientsCount: 9, priority: 'Low' },
  { id: 'ent', name: 'ENT (Otolaryngology)', icon: '👂', lead: 'Dr. Carlos Mendez', patientsCount: 13, priority: 'Low' },
  { id: 'psychiatry', name: 'Psychiatry & Behavioral', icon: '🧘', lead: 'Dr. Julia Kim', patientsCount: 17, priority: 'Normal' },
  { id: 'urology', name: 'Urology', icon: '💧', lead: 'Dr. Alan Harper', patientsCount: 10, priority: 'Normal' },
  { id: 'emergency_med', name: 'Emergency Medicine', icon: '🚨', lead: 'Dr. Alexander Vance', patientsCount: 54, priority: 'Critical' },
  { id: 'radiology', name: 'Radiology & Imaging', icon: '🩻', lead: 'Dr. Samantha Reed', patientsCount: 38, priority: 'High' },
  { id: 'anesthesiology', name: 'Anesthesiology & OT', icon: '💉', lead: 'Dr. Dmitri Volkov', patientsCount: 14, priority: 'High' }
];

// Initial Synthetic 500-Bed Digital Twin Generator
export function generateHospitalBeds() {
  const departments = ['ICU', 'Emergency', 'Cardiology', 'General Ward', 'Pediatrics', 'Surgical Ward', 'Isolation Wards'];
  const beds = [];
  let bedId = 101;
  
  departments.forEach((dept) => {
    const count = dept === 'ICU' ? 60 : dept === 'Emergency' ? 80 : 60;
    for (let i = 0; i < count; i++) {
      const isOccupied = Math.random() < 0.78;
      const isCleaning = !isOccupied && Math.random() < 0.15;
      const isReserved = !isOccupied && !isCleaning && Math.random() < 0.2;
      
      beds.push({
        id: `BED-${bedId++}`,
        department: dept,
        roomNumber: `${dept.substring(0, 3)}-${Math.floor(i / 4) + 1}`,
        status: isOccupied ? 'Occupied' : isCleaning ? 'Cleaning' : isReserved ? 'Reserved' : 'Available',
        isIcu: dept === 'ICU',
        isEmergency: dept === 'Emergency',
        patientId: isOccupied ? `PAT-${Math.floor(1000 + Math.random() * 9000)}` : null,
        vitals: isOccupied ? {
          heartRate: Math.floor(65 + Math.random() * 35),
          spo2: Math.floor(92 + Math.random() * 8),
          temp: (36.4 + Math.random() * 1.8).toFixed(1),
          bpSystolic: Math.floor(110 + Math.random() * 30),
          bpDiastolic: Math.floor(70 + Math.random() * 18)
        } : null
      });
    }
  });
  return beds;
}

// Initial Pharmacy Inventory
export const PHARMACY_INVENTORY = [
  { id: 'MED-101', name: 'Amoxicillin 500mg', category: 'Antibiotic', stock: 1420, minThreshold: 300, expiryDays: 140, price: '$12.50', status: 'Optimal' },
  { id: 'MED-102', name: 'Atorvastatin 20mg', category: 'Cardiovascular', stock: 180, minThreshold: 400, expiryDays: 14, price: '$28.00', status: 'Stockout Risk' },
  { id: 'MED-103', name: 'Insulin Glargine 100U', category: 'Endocrine', stock: 450, minThreshold: 200, expiryDays: 45, price: '$65.00', status: 'Optimal' },
  { id: 'MED-104', name: 'Metformin 850mg', category: 'Diabetes', stock: 2100, minThreshold: 500, expiryDays: 320, price: '$8.40', status: 'Optimal' },
  { id: 'MED-105', name: 'Epinephrine 1mg Inj', category: 'Emergency', stock: 85, minThreshold: 100, expiryDays: 90, price: '$45.00', status: 'Low Stock' },
  { id: 'MED-106', name: 'Propofol 10mg/ml', category: 'Anesthesia', stock: 210, minThreshold: 150, expiryDays: 8, price: '$52.00', status: 'Expiring Soon' }
];

// Initial Ambulance Fleet
export const AMBULANCE_FLEET = [
  { id: 'AMB-01', code: 'Unit Red Alpha', status: 'Dispatched', driver: 'Marcus Bell', lat: 23.8103, lng: 90.4125, eta: '7 mins', destination: 'Main ER Bay' },
  { id: 'AMB-02', code: 'Unit Cardiac Express', status: 'Available', driver: 'David Miller', lat: 23.7925, lng: 90.4078, eta: 'Ready', destination: 'Station 2' },
  { id: 'AMB-03', code: 'Unit Neonatal Trans', status: 'In Transit', driver: 'Sarah Connor', lat: 23.8210, lng: 90.4250, eta: '14 mins', destination: 'Pediatric ICU' },
  { id: 'AMB-04', code: 'Unit Trauma One', status: 'Maintenance', driver: 'John Wick', lat: 23.7800, lng: 90.4000, eta: 'N/A', destination: 'Depot' }
];

// Synthetic Patient Medical Documents & OCR Data
export const MOCK_OCR_DOCUMENTS = [
  {
    id: 'DOC-2026-881',
    title: 'Comprehensive Metabolic Panel & Lipid Profile',
    date: '2026-06-12',
    hospital: 'MediTwin Central Hospital',
    doctor: 'Dr. Sarah Jenkins',
    type: 'Laboratory PDF',
    confidenceScore: 0.985,
    extractedData: {
      patientName: 'Alex Mercer',
      dob: '1988-04-14',
      tests: [
        { test: 'Fasting Blood Glucose', value: 118, unit: 'mg/dL', refRange: '70 - 99', status: 'Elevated' },
        { test: 'Total Cholesterol', value: 228, unit: 'mg/dL', refRange: '< 200', status: 'High' },
        { test: 'HbA1c', value: 6.4, unit: '%', refRange: '< 5.7', status: 'Prediabetes' },
        { test: 'Serum Creatinine', value: 0.95, unit: 'mg/dL', refRange: '0.74 - 1.35', status: 'Normal' }
      ],
      medicationsRecorded: ['Metformin 500mg daily', 'Atorvastatin 10mg daily'],
      documentedAllergies: ['Penicillin', 'Sulfa drugs']
    }
  },
  {
    id: 'DOC-2024-412',
    title: 'Hospital Discharge Summary & Clinical Assessment',
    date: '2024-11-04',
    hospital: 'St. Jude Heart Institute',
    doctor: 'Dr. Marcus Vance',
    type: 'Discharge Summary Scan',
    confidenceScore: 0.962,
    extractedData: {
      patientName: 'Alex Mercer',
      dob: '1988-04-14',
      diagnosis: 'Acute Chest Pain - Hypertensive Crisis (Resolved)',
      hospitalizationDates: '2024-11-01 to 2024-11-04',
      medicationsRecorded: ['Lisinopril 10mg daily', 'Aspirin 81mg daily'],
      documentedAllergies: ['Penicillin'] // Note: Missing Sulfa allergy! Conflict example!
    }
  },
  {
    id: 'DOC-2021-109',
    title: 'Outpatient Consultation & Allergy Registration',
    date: '2021-03-22',
    hospital: 'Metro General Clinic',
    doctor: 'Dr. Chloe Benitez',
    type: 'Clinical Notes Image',
    confidenceScore: 0.941,
    extractedData: {
      patientName: 'Alex Mercer',
      dob: '1988-04-14',
      diagnosis: 'Seasonal Allergic Rhinitis',
      medicationsRecorded: ['Cetirizine 10mg PRN'],
      documentedAllergies: ['Penicillin', 'Latex']
    }
  }
];

// System Audit Logs Container
let SYSTEM_AUDIT_LOGS = [
  { id: 'LOG-1001', timestamp: '2026-08-15 22:15:02', user: 'Dr. Sarah Jenkins', role: 'Doctor', action: 'PATIENT_TIMELINE_QUERY', detail: 'Queried Alex Mercer longitudinal AI history', confidenceScore: 0.98 },
  { id: 'LOG-1002', timestamp: '2026-08-15 22:18:40', user: 'Admin Vance', role: 'Hospital Admin', action: 'SIMULATION_TRIGGERED', detail: 'Ran What-If simulation (+40% ER arrivals scenario)', confidenceScore: 1.0 },
  { id: 'LOG-1003', timestamp: '2026-08-15 22:20:11', user: 'System Early Warning', role: 'System Auditor', action: 'ALERT_GENERATED', detail: 'Bed Occupancy Warning: Predicted ICU threshold breach (>92%)', confidenceScore: 0.94 }
];

export function getAuditLogs() {
  return SYSTEM_AUDIT_LOGS;
}

export function logSystemAction(user, role, action, detail, confidenceScore = 0.99) {
  const newLog = {
    id: `LOG-${1000 + SYSTEM_AUDIT_LOGS.length + 1}`,
    timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
    user,
    role,
    action,
    detail,
    confidenceScore
  };
  SYSTEM_AUDIT_LOGS = [newLog, ...SYSTEM_AUDIT_LOGS];
  return newLog;
}
