const fs = require('fs');
let code = fs.readFileSync('frontend/src/App.jsx', 'utf8');

const importsToReplace = [
  'PublicLandingPage', 'SignInPage', 'RegisterPage',
  'PharmacyDirectory', 'PharmacyDetail', 'MedicineSearch', 'MedicineCart', 'PharmacyOwnerDashboard',
  'PatientDashboard', 'AIVoiceChatContainer', 'AIReportExplainer', 'DoctorDiscovery', 'DoctorProfile',
  'TeleconsultationRoom', 'PharmacyStore', 'DiagnosticCenterView', 'PrivacyConsentCenter', 'AdminDashboard',
  'AdminTransactions', 'WhatIfSimulator', 'EarlyWarningCenter', 'SpecialistWorkspaces', 'MedicalMemoryTimeline',
  'DocumentComparisonView', 'ResearchSuiteView', 'IotTelemetryDashboard', 'HospitalResourceDashboard', 'HospitalSearchPage'
];

importsToReplace.forEach(component => {
  const regex = new RegExp(`import ${component} from '([^']+)';`);
  code = code.replace(regex, `const ${component} = React.lazy(() => import('$1'));`);
});

code = code.replace('<Routes>', `<React.Suspense fallback={<div style={{padding: 40, textAlign: "center"}}>Loading module...</div>}>\n          <Routes>`);
code = code.replace('</Routes>', `</Routes>\n        </React.Suspense>`);

fs.writeFileSync('frontend/src/App.jsx', code);
console.log('App.jsx refactored to use React.lazy');
