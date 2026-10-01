// Central reactive store backed by localStorage for Niramoy

const STORAGE_KEY = 'niramoy_user_store_v2_clean';

const defaultState = {
  activeFamilyMember: null,
  familyMembers: [],
  appointments: [],
  prescriptions: [],
  timeline: [],
  pharmacyOrders: [],
  hospitalBookings: [],
  privacyPermissions: {
    aiAccess: true,
    doctorAccess: true,
    pharmacyAccess: true,
    reportAccess: true,
    familyAccess: true,
    thirdPartyAnalytics: false
  },
  auditLogs: []
};

export function getStoredState() {
  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem('medibridge_store_v1'); // Clean legacy dummy data
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        return { ...defaultState, ...parsed };
      }
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
