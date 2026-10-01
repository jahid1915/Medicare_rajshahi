import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import ProtectedRoute from './components/Auth/ProtectedRoute';

// Layouts
import PublicLayout from './components/Layout/PublicLayout';
import DashboardLayout from './components/Layout/DashboardLayout';

// Public Pages
const PublicLandingPage = React.lazy(() => import('./components/Public/PublicLandingPage'));
const SignInPage = React.lazy(() => import('./components/Auth/SignInPage'));
const RegisterPage = React.lazy(() => import('./components/Auth/RegisterPage'));

// Pharmacy Ecosystem Components
const PharmacyDirectory = React.lazy(() => import('./components/Pharmacy/PharmacyDirectory'));
const PharmacyDetail = React.lazy(() => import('./components/Pharmacy/PharmacyDetail'));
const MedicineSearch = React.lazy(() => import('./components/Pharmacy/MedicineSearch'));
const MedicineCart = React.lazy(() => import('./components/Pharmacy/MedicineCart'));
const PharmacyOwnerDashboard = React.lazy(() => import('./components/Pharmacy/PharmacyOwnerDashboard'));

// Existing Components (re-used as route targets)
const PatientDashboard = React.lazy(() => import('./components/Dashboard/PatientDashboard'));
const AIVoiceChatContainer = React.lazy(() => import('./components/AI/AIVoiceChatContainer'));
const AIReportExplainer = React.lazy(() => import('./components/AI/AIReportExplainer'));
const DoctorDiscovery = React.lazy(() => import('./components/Doctor/DoctorDiscovery'));
const DoctorProfile = React.lazy(() => import('./components/Doctor/DoctorProfile'));
const TeleconsultationRoom = React.lazy(() => import('./components/Doctor/TeleconsultationRoom'));
const PharmacyStore = React.lazy(() => import('./components/Pharmacy/PharmacyStore'));
const DiagnosticCenterView = React.lazy(() => import('./components/Diagnostic/DiagnosticCenterView'));
const PrivacyConsentCenter = React.lazy(() => import('./components/Privacy/PrivacyConsentCenter'));
const AdminDashboard = React.lazy(() => import('./components/Admin/AdminDashboard'));
const AdminTransactions = React.lazy(() => import('./components/Admin/AdminTransactions'));
const WhatIfSimulator = React.lazy(() => import('./components/Simulation/WhatIfSimulator'));
const EarlyWarningCenter = React.lazy(() => import('./components/Admin/EarlyWarningCenter'));
const SpecialistWorkspaces = React.lazy(() => import('./components/Doctor/SpecialistWorkspaces'));
const MedicalMemoryTimeline = React.lazy(() => import('./components/Patient/MedicalMemoryTimeline'));
const DocumentComparisonView = React.lazy(() => import('./components/Diagnostic/DocumentComparisonView'));
const ResearchSuiteView = React.lazy(() => import('./components/Research/ResearchSuiteView'));
const IotTelemetryDashboard = React.lazy(() => import('./components/IoT/IotTelemetryDashboard'));
const HospitalResourceDashboard = React.lazy(() => import('./components/HospitalResource/HospitalResourceDashboard'));
const HospitalSearchPage = React.lazy(() => import('./components/Hospitals/HospitalSearchPage'));

// Public Platform & Resource Pages
const AboutPage = React.lazy(() => import('./components/Public/AboutPage'));
const HealthTipsPage = React.lazy(() => import('./components/Public/HealthTipsPage'));
const ContactPage = React.lazy(() => import('./components/Public/ContactPage'));
const FacilityDirectoryPage = React.lazy(() => import('./components/Public/FacilityDirectoryPage'));
const AmbulancePage = React.lazy(() => import('./components/Public/AmbulancePage'));
const AIPage = React.lazy(() => import('./components/Public/AIPage'));
const ResearchPage = React.lazy(() => import('./components/Public/ResearchPage'));

// Legal Pages
const TermsPage = React.lazy(() => import('./components/Legal/TermsPage'));
const PrivacyPolicyPage = React.lazy(() => import('./components/Legal/PrivacyPolicyPage'));
const CookiePolicyPage = React.lazy(() => import('./components/Legal/CookiePolicyPage'));
const MedicalDisclaimerPage = React.lazy(() => import('./components/Legal/MedicalDisclaimerPage'));

// Patient Family Health Timeline
const FamilyHealthTimeline = React.lazy(() => import('./components/Patient/FamilyHealthTimeline'));

// Placeholder components for routes not yet fully built
function ComingSoon({ title }) {
  return (
    <div style={{ padding: 40, textAlign: 'center' }}>
      <div style={{
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        width: 64, height: 64, borderRadius: 16, background: 'var(--primary-glow)',
        marginBottom: 16
      }}>
        <span style={{ fontSize: 28 }}>🚧</span>
      </div>
      <h2 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: 8, color: 'var(--text-primary)' }}>{title}</h2>
      <p style={{ color: 'var(--text-muted)', maxWidth: 400, margin: '0 auto' }}>
        This section is being built. The feature is part of the Niramoy platform roadmap.
      </p>
    </div>
  );
}

function ScrollToTop() {
  const { pathname } = useLocation();
  React.useEffect(() => {
    if (window.scrollY > 0) {
      window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
    }
  }, [pathname]);
  return null;
}

function PageLoader() {
  return (
    <div className="niramoy-page-loader" role="status" aria-live="polite">
      <div className="niramoy-page-loader__bar" />
      <div className="niramoy-page-loader__spinner" />
      <span style={{ fontSize: '0.85rem', color: '#5eead4', fontWeight: 600, letterSpacing: '0.02em' }}>
        Loading Niramoy healthcare services...
      </span>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <AuthProvider>
        <CartProvider>
          <React.Suspense fallback={<PageLoader />}>
          <Routes>
            {/* ═══ PUBLIC ROUTES (No auth required) ═══ */}
            <Route element={<PublicLayout />}>
              <Route index element={<PublicLandingPage />} />
              <Route path="doctors" element={<DoctorDiscovery />} />
              <Route path="doctors/:slug" element={<DoctorProfile />} />
              <Route path="hospitals" element={<HospitalSearchPage />} />
              <Route path="pharmacies" element={<PharmacyDirectory />} />
              <Route path="pharmacies/:id" element={<PharmacyDetail />} />
              <Route path="medicines" element={<MedicineSearch />} />
              <Route path="cart" element={<MedicineCart />} />
              <Route path="diagnostics" element={<DiagnosticCenterView />} />
              <Route path="facilities" element={<FacilityDirectoryPage />} />
              <Route path="find-facility" element={<FacilityDirectoryPage />} />
              <Route path="ambulance" element={<AmbulancePage />} />
              <Route path="emergency" element={<AmbulancePage />} />
              <Route path="ai" element={<AIPage />} />
              <Route path="ai-assistant" element={<AIPage />} />
              <Route path="about" element={<AboutPage />} />
              <Route path="health-tips" element={<HealthTipsPage />} />
              <Route path="contact" element={<ContactPage />} />
              <Route path="research" element={<ResearchPage />} />

              {/* Legal Pages */}
              <Route path="terms" element={<TermsPage />} />
              <Route path="privacy" element={<PrivacyPolicyPage />} />
              <Route path="cookie-policy" element={<CookiePolicyPage />} />
              <Route path="disclaimer" element={<MedicalDisclaimerPage />} />

              {/* Auth & Provider Registration Paths */}
              <Route path="signin" element={<SignInPage />} />
              <Route path="register" element={<RegisterPage />} />
              <Route path="register/doctor" element={<RegisterPage />} />
              <Route path="register/facility" element={<RegisterPage />} />
              <Route path="register/diagnostic" element={<RegisterPage />} />
              <Route path="register/pharmacy" element={<RegisterPage />} />
              <Route path="register/ambulance" element={<RegisterPage />} />
            </Route>

            {/* ═══ PATIENT DASHBOARD (auth required) ═══ */}
            <Route element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
              <Route path="dashboard" element={<PatientDashboard />} />
              <Route path="dashboard/ai-assistant" element={<AIVoiceChatContainer />} />
              <Route path="dashboard/appointments" element={<PatientDashboard initialTab="appointments" />} />
              <Route path="dashboard/prescriptions" element={<PatientDashboard initialTab="prescriptions" />} />
              <Route path="dashboard/medical-memory" element={<MedicalMemoryTimeline />} />
              <Route path="dashboard/doctors" element={<DoctorDiscovery />} />
              <Route path="dashboard/pharmacy" element={<PharmacyDirectory />} />
              <Route path="dashboard/medicines" element={<MedicineSearch />} />
              <Route path="dashboard/cart" element={<MedicineCart />} />
              <Route path="dashboard/pharmacy-orders" element={<PatientDashboard initialTab="pharmacy" />} />
              <Route path="dashboard/hospitals" element={<HospitalSearchPage />} />
              <Route path="dashboard/hospital-resources/:hospitalId" element={<HospitalResourceDashboard />} />
              <Route path="dashboard/diagnostics" element={<DiagnosticCenterView />} />
              <Route path="dashboard/payments" element={<ComingSoon title="Payment History" />} />
              <Route path="dashboard/family" element={<FamilyHealthTimeline />} />
              <Route path="dashboard/documents" element={<DocumentComparisonView />} />
              <Route path="dashboard/privacy" element={<PrivacyConsentCenter />} />
              <Route path="dashboard/report-explainer" element={<AIReportExplainer />} />
              <Route path="dashboard/telemedicine" element={<TeleconsultationRoom />} />
            </Route>

            {/* ═══ DOCTOR PORTAL (auth + doctor roles) ═══ */}
            <Route element={
              <ProtectedRoute roles={['doctor', 'specialist_doctor', 'nurse', 'lab_tech', 'radiology_tech']}>
                <DashboardLayout />
              </ProtectedRoute>
            }>
              <Route path="doctor-portal" element={<SpecialistWorkspaces />} />
              <Route path="doctor-portal/appointments" element={<ComingSoon title="Today's Patients" />} />
              <Route path="doctor-portal/consultations" element={<ComingSoon title="Consultations" />} />
              <Route path="doctor-portal/ai-copilot" element={<ComingSoon title="AI Clinical Copilot" />} />
              <Route path="doctor-portal/prescriptions" element={<ComingSoon title="Prescriptions" />} />
              <Route path="doctor-portal/patients" element={<ComingSoon title="Patient Records" />} />
              <Route path="doctor-portal/feedback" element={<ComingSoon title="AI Feedback" />} />
            </Route>

            {/* ═══ PHARMACY PORTAL (auth + pharmacy roles) ═══ */}
            <Route element={
              <ProtectedRoute roles={['pharmacy_owner', 'pharmacist', 'super_admin']}>
                <DashboardLayout />
              </ProtectedRoute>
            }>
              <Route path="pharmacy-portal" element={<PharmacyOwnerDashboard />} />
              <Route path="pharmacy-portal/orders" element={<PharmacyOwnerDashboard />} />
              <Route path="pharmacy-portal/inventory" element={<PharmacyOwnerDashboard />} />
              <Route path="pharmacy-portal/analytics" element={<PharmacyOwnerDashboard />} />
            </Route>

          {/* ═══ HOSPITAL PORTAL (auth + hospital roles) ═══ */}
          <Route element={
            <ProtectedRoute roles={['hospital_admin', 'hospital_management', 'receptionist', 'super_admin']}>
              <DashboardLayout />
            </ProtectedRoute>
          }>
            <Route path="hospital-portal" element={<AdminDashboard />} />
            <Route path="hospital-portal/beds" element={<ComingSoon title="Bed Management" />} />
            <Route path="hospital-portal/admissions" element={<ComingSoon title="Admissions" />} />
            <Route path="hospital-portal/emergency" element={<EarlyWarningCenter />} />
            <Route path="hospital-portal/ambulances" element={<ComingSoon title="Ambulance Fleet" />} />
            <Route path="hospital-portal/resources" element={<HospitalResourceDashboard />} />
            <Route path="hospital-portal/forecasting" element={<AdminDashboard />} />
            <Route path="hospital-portal/what-if" element={<WhatIfSimulator />} />
            <Route path="hospital-portal/iot" element={<IotTelemetryDashboard />} />
          </Route>

          {/* ═══ SUPER ADMIN (auth + admin roles) ═══ */}
          <Route element={
            <ProtectedRoute roles={['super_admin', 'compliance_auditor', 'researcher']}>
              <DashboardLayout />
            </ProtectedRoute>
          }>
            <Route path="admin" element={<AdminDashboard />} />
            <Route path="admin/users" element={<ComingSoon title="User Management" />} />
            <Route path="admin/hospitals" element={<HospitalSearchPage />} />
            <Route path="admin/pharmacies" element={<ComingSoon title="Pharmacy Management" />} />
            <Route path="admin/doctors" element={<DoctorDiscovery />} />
            <Route path="admin/payments" element={<AdminTransactions />} />
            <Route path="admin/ai" element={<ComingSoon title="AI Model Management" />} />
            <Route path="admin/research" element={<ResearchSuiteView />} />
            <Route path="admin/audit" element={<ComingSoon title="Audit Logs" />} />
            <Route path="admin/settings" element={<ComingSoon title="Platform Settings" />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        </React.Suspense>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
