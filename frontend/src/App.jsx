import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import ProtectedRoute from './components/Auth/ProtectedRoute';

// Layouts
import PublicLayout from './components/Layout/PublicLayout';
import DashboardLayout from './components/Layout/DashboardLayout';

// Public Pages
import PublicLandingPage from './components/Public/PublicLandingPage';
import SignInPage from './components/Auth/SignInPage';
import RegisterPage from './components/Auth/RegisterPage';

// Pharmacy Ecosystem Components
import PharmacyDirectory from './components/Pharmacy/PharmacyDirectory';
import PharmacyDetail from './components/Pharmacy/PharmacyDetail';
import MedicineSearch from './components/Pharmacy/MedicineSearch';
import MedicineCart from './components/Pharmacy/MedicineCart';
import PharmacyOwnerDashboard from './components/Pharmacy/PharmacyOwnerDashboard';

// Existing Components (re-used as route targets)
import PatientDashboard from './components/Dashboard/PatientDashboard';
import AIVoiceChatContainer from './components/AI/AIVoiceChatContainer';
import AIReportExplainer from './components/AI/AIReportExplainer';
import DoctorDiscovery from './components/Doctor/DoctorDiscovery';
import DoctorProfile from './components/Doctor/DoctorProfile';
import TeleconsultationRoom from './components/Doctor/TeleconsultationRoom';
import PharmacyStore from './components/Pharmacy/PharmacyStore';
import DiagnosticCenterView from './components/Diagnostic/DiagnosticCenterView';
import PrivacyConsentCenter from './components/Privacy/PrivacyConsentCenter';
import AdminDashboard from './components/Admin/AdminDashboard';
import AdminTransactions from './components/Admin/AdminTransactions';
import WhatIfSimulator from './components/Simulation/WhatIfSimulator';
import EarlyWarningCenter from './components/Admin/EarlyWarningCenter';
import SpecialistWorkspaces from './components/Doctor/SpecialistWorkspaces';
import MedicalMemoryTimeline from './components/Patient/MedicalMemoryTimeline';
import DocumentComparisonView from './components/Diagnostic/DocumentComparisonView';
import ResearchSuiteView from './components/Research/ResearchSuiteView';
import IotTelemetryDashboard from './components/IoT/IotTelemetryDashboard';
import HospitalResourceDashboard from './components/HospitalResource/HospitalResourceDashboard';
import HospitalSearchPage from './components/Hospitals/HospitalSearchPage';

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

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
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
              <Route path="emergency" element={<ComingSoon title="Emergency Services" />} />
              <Route path="ai-assistant" element={<ComingSoon title="AI Health Assistant" />} />
              <Route path="signin" element={<SignInPage />} />
              <Route path="register" element={<RegisterPage />} />
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
              <Route path="dashboard/family" element={<ComingSoon title="Family Health" />} />
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
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
