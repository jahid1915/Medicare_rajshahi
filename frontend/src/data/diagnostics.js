export const DIAGNOSTICS = [
  {
    id: 'diag-1',
    name: 'Popular Diagnostic Centre - Dhanmondi',
    distanceKm: 1.1,
    rating: 4.8,
    homeCollectionAvailable: true,
    homeCollectionFee: 150,
    openStatus: 'Open Today (7 AM - 11 PM)',
    address: 'House 16, Road 2, Dhanmondi, Dhaka',
    tests: [
      { id: 't-1', name: 'Complete Blood Count (CBC)', category: 'Hematology', price: 400, sample: 'Blood', turnaround: '6 Hours' },
      { id: 't-2', name: 'Lipid Profile (Full)', category: 'Biochemistry', price: 1200, sample: 'Blood (Fasting)', turnaround: '12 Hours' },
      { id: 't-3', name: 'HbA1c (Diabetes Index)', category: 'Endocrinology', price: 800, sample: 'Blood', turnaround: '6 Hours' },
      { id: 't-4', name: 'Serum Creatinine & Electrolytes', category: 'Kidney Function', price: 750, sample: 'Blood', turnaround: '4 Hours' },
      { id: 't-5', name: 'Chest X-Ray (PA View)', category: 'Radiology', price: 600, sample: 'Imaging', turnaround: '2 Hours' }
    ]
  },
  {
    id: 'diag-2',
    name: 'Ibn Sina Diagnostic & Consultation Center',
    distanceKm: 2.3,
    rating: 4.7,
    homeCollectionAvailable: true,
    homeCollectionFee: 200,
    openStatus: 'Open Today (24/7)',
    address: 'House 48, Road 9/A, Dhanmondi, Dhaka',
    tests: [
      { id: 't-1', name: 'Complete Blood Count (CBC)', category: 'Hematology', price: 380, sample: 'Blood', turnaround: '5 Hours' },
      { id: 't-6', name: 'Thyroid Function Test (T3, T4, TSH)', category: 'Hormones', price: 1500, sample: 'Blood', turnaround: '12 Hours' },
      { id: 't-7', name: 'Brain MRI (1.5 Tesla)', category: 'Advanced Imaging', price: 6500, sample: 'Scan', turnaround: '24 Hours' },
      { id: 't-4', name: 'Serum Creatinine & Electrolytes', category: 'Kidney Function', price: 700, sample: 'Blood', turnaround: '4 Hours' }
    ]
  }
];
