export const PHARMACIES = [
  {
    id: 'pharm-1',
    name: 'MediBridge Care Pharmacy - Dhanmondi',
    status: 'open',
    distanceKm: 0.8,
    lat: 23.7461,
    lng: 90.3742,
    address: 'Road 8/A, Dhanmondi, Dhaka',
    phone: '+880 1711-000111',
    rating: 4.8,
    deliveryAvailable: true,
    deliveryEtaMins: 25,
    deliveryFee: 40,
    currency: '৳',
    lastInventoryUpdate: '10 mins ago',
    inventory: [
      { name: 'Napa Extra (Paracetamol 500mg + Caffeine 65mg)', price: 30, unit: 'strip of 10', inStock: true, stockCount: 450 },
      { name: 'Seclo 20mg (Omeprazole)', price: 70, unit: 'strip of 10', inStock: true, stockCount: 220 },
      { name: 'Sumatriptan 50mg (Migraine Relief)', price: 180, unit: 'pack of 4', inStock: true, stockCount: 65 },
      { name: 'Azithromycin 500mg', price: 120, unit: 'strip of 3', inStock: true, stockCount: 90 },
      { name: 'Ceevit 250mg (Vitamin C)', price: 25, unit: 'strip of 10', inStock: true, stockCount: 300 },
      { name: 'ORSaline N (Oral Rehydration)', price: 6, unit: 'sachet', inStock: true, stockCount: 600 }
    ],
    mlDemandForecasting: [
      { medicine: 'Napa Extra', demandTrend: '+42%', reason: 'Seasonal viral flu spike predicted next 7 days', riskLevel: 'High Demand' },
      { medicine: 'ORSaline N', demandTrend: '+28%', reason: 'Heatwave advisory forecast', riskLevel: 'Moderate Surge' },
      { medicine: 'Azithromycin 500mg', demandTrend: 'Stable', reason: 'Normal respiratory prescription volume', riskLevel: 'Normal' }
    ]
  },
  {
    id: 'pharm-2',
    name: 'Lazz Pharma - Panthapath',
    status: 'open',
    distanceKm: 1.4,
    lat: 23.7512,
    lng: 90.3871,
    address: 'Green Road, Panthapath, Dhaka',
    phone: '+880 1819-222333',
    rating: 4.9,
    deliveryAvailable: true,
    deliveryEtaMins: 35,
    deliveryFee: 50,
    currency: '৳',
    lastInventoryUpdate: '5 mins ago',
    inventory: [
      { name: 'Napa Extra (Paracetamol 500mg + Caffeine 65mg)', price: 30, unit: 'strip of 10', inStock: true, stockCount: 800 },
      { name: 'Seclo 20mg (Omeprazole)', price: 70, unit: 'strip of 10', inStock: true, stockCount: 400 },
      { name: 'Sumatriptan 50mg (Migraine Relief)', price: 180, unit: 'pack of 4', inStock: true, stockCount: 120 },
      { name: 'Atorvastatin 10mg (Cholesterol)', price: 140, unit: 'strip of 10', inStock: true, stockCount: 150 },
      { name: 'Metformin 500mg (Diabetes)', price: 45, unit: 'strip of 10', inStock: true, stockCount: 500 }
    ],
    mlDemandForecasting: [
      { medicine: 'Sumatriptan 50mg', demandTrend: '+35%', reason: 'Weather pressure change migraine risk', riskLevel: 'High Demand' },
      { medicine: 'Metformin 500mg', demandTrend: '+15%', reason: 'Routine refill cycle', riskLevel: 'Normal' }
    ]
  },
  {
    id: 'pharm-3',
    name: 'Tamanna Pharmacy - Gulshan',
    status: 'closed',
    distanceKm: 4.2,
    lat: 23.7925,
    lng: 90.4078,
    address: 'Gulshan 2 Circle, Dhaka',
    phone: '+880 1911-444555',
    rating: 4.6,
    deliveryAvailable: false,
    deliveryEtaMins: 0,
    deliveryFee: 0,
    currency: '৳',
    lastInventoryUpdate: '2 hours ago (Closed)',
    inventory: [
      { name: 'Napa Extra (Paracetamol 500mg + Caffeine 65mg)', price: 30, unit: 'strip of 10', inStock: false, stockCount: 0 },
      { name: 'Seclo 20mg (Omeprazole)', price: 70, unit: 'strip of 10', inStock: true, stockCount: 100 }
    ],
    mlDemandForecasting: []
  }
];
