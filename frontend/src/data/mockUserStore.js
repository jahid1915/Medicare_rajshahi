// Central reactive store backed by localStorage for MediBridge AI

const STORAGE_KEY = 'medibridge_store_v1';

const defaultState = {
  activeFamilyMember: {
    id: 'user-me',
    name: 'Tanvir Hossain',
    relation: 'Me',
    age: 32,
    gender: 'Male',
    bloodGroup: 'O+',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'
  },
  familyMembers: [
    { id: 'user-me', name: 'Tanvir Hossain', relation: 'Me', age: 32, gender: 'Male', bloodGroup: 'O+' },
    { id: 'user-mother', name: 'Rabeya Begum', relation: 'Mother', age: 61, gender: 'Female', bloodGroup: 'B+' },
    { id: 'user-father', name: 'Delwar Hossain', relation: 'Father', age: 66, gender: 'Male', bloodGroup: 'A+' },
    { id: 'user-child', name: 'Aayan Hossain', relation: 'Child', age: 6, gender: 'Male', bloodGroup: 'O+' }
  ],
  appointments: [
    {
      id: 'apt-101',
      doctorId: 'doc-1',
      doctorName: 'Dr. Sarah Jenkins',
      specialty: 'Neurology',
      date: '2026-08-12',
      time: '07:30 PM',
      consultationType: 'Video Call',
      fee: 1000,
      currency: '৳',
      status: 'Confirmed',
      paymentTxnId: 'TXN-BKASH-892341',
      patientName: 'Tanvir Hossain',
      familyMemberId: 'user-me',
      aiSummary: 'Patient reported mild recurring throbbing right-sided headache for 5 days without severe visual aura. Safety screening cleared red flags.'
    }
  ],
  prescriptions: [
    {
      id: 'rx-501',
      doctorId: 'doc-1',
      doctorName: 'Dr. Sarah Jenkins',
      date: '2026-08-04',
      patientName: 'Tanvir Hossain',
      diagnosis: 'Tension Headache & Stress Fatigue',
      medicines: [
        { name: 'Napa Extra', dosage: '1 tablet after food', frequency: 'As needed (Max 3/day)', duration: '5 days' },
        { name: 'Sumatriptan 50mg', dosage: '1 tablet at onset of acute migraine', frequency: 'PRN', duration: '4 tablets' }
      ],
      advice: 'Maintain regular sleep routine (8 hours). Drink 2.5L water daily. Avoid prolonged screen time without 20-min breaks.',
      nextFollowUp: '14 Days'
    }
  ],
  timeline: [
    {
      id: 'tl-1',
      date: '2026-08-10',
      time: '10:15 PM',
      type: 'AI_CONSULTATION',
      title: 'Neurology AI Assistant Triage',
      description: 'Discussed recurring right-sided headache. AI cleared red flags and recommended scheduling a Neurology consultation.',
      badgeColor: 'info',
      familyMemberId: 'user-me'
    },
    {
      id: 'tl-2',
      date: '2026-08-04',
      time: '07:30 PM',
      type: 'DOCTOR_VISIT',
      title: 'Video Consultation with Dr. Sarah Jenkins',
      description: 'Diagnosis: Tension Headache. Digital Prescription #rx-501 issued.',
      badgeColor: 'primary',
      familyMemberId: 'user-me'
    },
    {
      id: 'tl-3',
      date: '2026-07-28',
      time: '09:00 AM',
      type: 'LAB_REPORT',
      title: 'CBC & Kidney Panel Report Uploaded',
      description: 'Hemoglobin: 14.2 g/dL (Normal). Serum Creatinine: 0.9 mg/dL (Normal).',
      badgeColor: 'success',
      familyMemberId: 'user-me'
    }
  ],
  pharmacyOrders: [
    {
      id: 'ord-301',
      pharmacyName: 'MediBridge Care Pharmacy - Laxmipur',
      date: '2026-08-04',
      items: ['Napa Extra (1 strip)', 'Sumatriptan 50mg (1 pack)'],
      totalAmount: 250,
      currency: '৳',
      status: 'Delivered',
      deliveryAddress: 'Laxmipur Moor, Rajshahi'
    }
  ],
  hospitalBookings: [
    {
      id: 'bed-bk-201',
      hospitalId: 'hosp-1',
      hospitalName: 'Rajshahi Medical College Hospital (RMCH)',
      bedType: 'VIP Cabin (Air Conditioned)',
      category: 'Cabins',
      admissionDate: '2026-08-15',
      patientName: 'Tanvir Hossain',
      phone: '01711223344',
      status: 'Confirmed',
      referenceId: 'RMCH-BED-88219',
      estimatedDailyFee: 1500,
      notes: 'Post-operative observation requested'
    }
  ],
  privacyPermissions: {
    aiAccess: true,
    doctorAccess: true,
    pharmacyAccess: true,
    reportAccess: true,
    familyAccess: true,
    thirdPartyAnalytics: false
  },
  auditLogs: [
    { id: 'log-1', timestamp: '2026-08-11 21:30:12', actor: 'Dr. Sarah Jenkins', action: 'VIEWED_PATIENT_RECORD', detail: 'Accessed AI Handover Summary #apt-101' },
    { id: 'log-2', timestamp: '2026-08-11 20:15:05', actor: 'Patient (Tanvir)', action: 'AI_TRIAGE_COMPLETED', detail: 'Neurology AI Assistant session completed' },
    { id: 'log-3', timestamp: '2026-08-04 19:40:22', actor: 'MediBridge Dhanmondi Pharmacy', action: 'VERIFIED_PRESCRIPTION', detail: 'Digital Prescription #rx-501 verified' }
  ]
};

export function getStoredState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (!parsed.hospitalBookings) parsed.hospitalBookings = defaultState.hospitalBookings;
      if (!parsed.pharmacyOrders) parsed.pharmacyOrders = defaultState.pharmacyOrders;
      if (!parsed.appointments) parsed.appointments = defaultState.appointments;
      return parsed;
    }
  } catch (e) {
    console.error('Failed to parse state from localStorage', e);
  }
  return defaultState;
}

export function saveStoredState(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.error('Failed to save state to localStorage', e);
  }
}

export function addAuditLog(actor, action, detail) {
  const state = getStoredState();
  const newLog = {
    id: `log-${Date.now()}`,
    timestamp: new Date().toLocaleString('sv-SE').replace('T', ' '),
    actor,
    action,
    detail
  };
  state.auditLogs = [newLog, ...state.auditLogs];
  saveStoredState(state);
  return newLog;
}
