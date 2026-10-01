/**
 * Niramoy API Client
 * Central fetch wrapper for all backend API calls
 */

const getApiBaseUrl = () => {
  if (import.meta.env.VITE_API_BASE_URL) return import.meta.env.VITE_API_BASE_URL;
  if (typeof window !== "undefined" && window.location.hostname !== "localhost" && window.location.hostname !== "127.0.0.1") {
    return "/api";
  }
  return "http://localhost:5000/api";
};

const BASE_URL = getApiBaseUrl();

async function request(method, path, body = null, requireAuth = false) {
  const headers = {};
  if (!(body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
  }

  if (requireAuth) {
    const token = localStorage.getItem("niramoy_token") || localStorage.getItem("medicare_token");
    if (token) headers["Authorization"] = `Bearer ${token}`;
  }

  const options = { method, headers };
  if (body) {
    options.body = (body instanceof FormData) ? body : JSON.stringify(body);
  }

  const response = await fetch(`${BASE_URL}${path}`, options);
  const data = await response.json();

  if (!response.ok) {
    const err = new Error(data.message || "API Error");
    err.code = data.code;
    err.statusCode = response.status;
    err.errors = data.errors || [];
    throw err;
  }

  return data;
}

// Auth API
export const authAPI = {
  register: (body) => request("POST", "/auth/register", body),
  login:    (body) => request("POST", "/auth/login", body),
  logout:   ()     => request("POST", "/auth/logout", {}, true),
  getMe:    ()     => request("GET",  "/auth/me", null, true),
  sendOtp:  (body) => request("POST", "/auth/send-otp", body),
  verifyOtp:(body) => request("POST", "/auth/verify-otp", body),
  getProfile: ()   => request("GET",  "/auth/profile", null, true),
  updateProfile: (body) => request("PUT", "/auth/profile", body, true),
  // Legacy aliases
  requestPatientOtp: (body) => request("POST", "/auth/send-otp", body),
  verifyPatientOtp:  (body) => request("POST", "/auth/verify-otp", body),
  resendPatientOtp:  (body) => request("POST", "/auth/send-otp", body)
};


// Hospitals API
export const hospitalsAPI = {
  getAll: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return request("GET", `/hospitals${qs ? "?" + qs : ""}`);
  },
  getById:       (id) => request("GET", `/hospitals/${id}`),
  getResources:  (id) => request("GET", `/hospitals/${id}/resources`),
  updateResource:(hospitalId, resourceId, body) =>
    request("PATCH", `/hospitals/${hospitalId}/resources/${resourceId}`, body, true)
};

// Doctors API
export const doctorsAPI = {
  getAll: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return request("GET", `/doctors${qs ? "?" + qs : ""}`);
  },
  getById: (id) => request("GET", `/doctors/${id}`),
  getBranches: (id) => request("GET", `/doctors/${id}/branches`),
  getBranchSchedules: (id, branchId) => request("GET", `/doctors/${id}/branches/${branchId}/schedules`),
  getAvailableSlots: (id, branchId, date) => request("GET", `/doctors/${id}/branches/${branchId}/slots?date=${date}`)
};

// Appointments API
export const appointmentsAPI = {
  create:      (body) => request("POST", "/appointments", body, true),
  getById:     (id)   => request("GET",  `/appointments/${id}`, null, true),
  getMine:     (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return request("GET", `/appointments/my${qs ? "?" + qs : ""}`, null, true);
  },
  getPdfUrl:   (id)   => {
    const token = localStorage.getItem("niramoy_token") || localStorage.getItem("medicare_token") || localStorage.getItem("token");
    return `${BASE_URL}/appointments/${id}/pdf${token ? `?token=${encodeURIComponent(token)}` : ""}`;
  },
  resendEmail: (id)   => request("POST", `/appointments/${id}/resend-email`, {}, true),
  cancel:      (id, body = {}) => request("POST", `/appointments/${id}/cancel`, body, true),
  updateStatus:(id, body = {}) => request("PATCH", `/appointments/${id}/status`, body, true)
};

// Payments API (SSLCOMMERZ)
export const paymentsAPI = {
  initiateSslCommerz: (body) => request("POST", "/payments/sslcommerz/initiate", body, true),
  create:             (body) => request("POST", "/payments/create", body, true),
  getById:            (id)   => request("GET",  `/payments/${id}`, null, true),
  getAll:             (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return request("GET", `/payments${qs ? "?" + qs : ""}`, null, true);
  },
  transitionStatus:   (id, body) => request("PATCH", `/payments/${id}/transition`, body, true),
  handleWebhook:      (body) => request("POST", "/payments/webhook", body)
};

// Pharmacies API
export const pharmaciesAPI = {
  getAll: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return request("GET", `/pharmacies${qs ? "?" + qs : ""}`);
  },
  getById:        (id) => request("GET", `/pharmacies/${id}`),
  getMyPharmacy:  () => request("GET", "/pharmacies/my-pharmacy", null, true),
  getInventory:   (id, params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return request("GET", `/pharmacies/${id}/inventory${qs ? "?" + qs : ""}`);
  },
  create:         (body) => request("POST", "/pharmacies", body, true),
  update:         (id, body) => request("PATCH", `/pharmacies/${id}`, body, true),
  addInventory:   (id, body) => request("POST", `/pharmacies/${id}/inventory`, body, true),
  deleteInventory:(id, itemId) => request("DELETE", `/pharmacies/${id}/inventory/${itemId}`, null, true),

  // Pharmacy Analytics & Excel Management
  getAnalytics:   () => request("GET", "/pharmacies/analytics", null, true),
  importExcelPreview: (formData) => request("POST", "/pharmacies/import/preview", formData, true),
  confirmExcelImport: (body) => request("POST", "/pharmacies/import/confirm", body, true),
  getExportUrl:   (filter = "all", category = "") => {
    const token = localStorage.getItem("token");
    const params = new URLSearchParams({ filter });
    if (category) params.append("category", category);
    if (token) params.append("token", token);
    return `${BASE_URL}/pharmacies/export?${params.toString()}`;
  },
  bulkUpdateStock: (body) => request("POST", "/pharmacies/inventory/bulk-update", body, true),
  checkPrescriptionAvailability: (prescriptionId) => request("GET", `/pharmacies/availability/by-prescription/${prescriptionId}`)
};

// Medicines API
export const medicinesAPI = {
  getAll: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return request("GET", `/medicines${qs ? "?" + qs : ""}`);
  },
  getById:        (id) => request("GET", `/medicines/${id}`),
  getCategories:  () => request("GET", "/medicines/meta/categories"),
  create:         (body) => request("POST", "/medicines", body, true)
};

// Pharmacy Orders API
export const pharmacyOrdersAPI = {
  create:         (body) => request("POST", "/pharmacy-orders", body, true),
  getMyOrders:    (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return request("GET", `/pharmacy-orders/my-orders${qs ? "?" + qs : ""}`, null, true);
  },
  getPharmacyOrders: (pharmacyId, params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return request("GET", `/pharmacy-orders/pharmacy/${pharmacyId}${qs ? "?" + qs : ""}`, null, true);
  },
  getById:        (id) => request("GET", `/pharmacy-orders/${id}`, null, true),
  updateStatus:   (id, body) => request("PATCH", `/pharmacy-orders/${id}/status`, body, true),
  verifyRx:       (id) => request("PATCH", `/pharmacy-orders/${id}/verify-prescription`, {}, true),
  cancel:         (id, body) => request("PATCH", `/pharmacy-orders/${id}/cancel`, body, true)
};

// Prescriptions API
export const prescriptionsAPI = {
  create:         (body) => request("POST", "/prescriptions", body, true),
  getMyPrescriptions: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return request("GET", `/prescriptions/my-prescriptions${qs ? "?" + qs : ""}`, null, true);
  },
  getById:        (id) => request("GET", `/prescriptions/${id}`, null, true)
};

// Notifications API
export const notificationsAPI = {
  getMyNotifications: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return request("GET", `/notifications${qs ? "?" + qs : ""}`, null, true);
  },
  markAsRead:    (id) => request("PATCH", `/notifications/${id}/read`, {}, true),
  markAllAsRead: () => request("PATCH", "/notifications/read-all", {}, true)
};

