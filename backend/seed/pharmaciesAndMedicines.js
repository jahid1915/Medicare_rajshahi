const Pharmacy = require("../models/Pharmacy");
const Medicine = require("../models/Medicine");
const PharmacyInventory = require("../models/PharmacyInventory");

const rajshahiPharmacies = [
  {
    name: "Medicare Model Pharmacy - Laxmipur",
    slug: "medicare-model-pharmacy-laxmipur",
    license_number: "DGDA-RAJ-2024-0012",
    phone: "+880 1711-445566",
    email: "laxmipur@medicare-pharmacy.bd",
    address: "Holding 142, Medical College Main Gate Road, Laxmipur, Rajshahi",
    area: "Laxmipur",
    city: "Rajshahi",
    district: "Rajshahi",
    latitude: 24.3725,
    longitude: 88.5835,
    rating: 4.9,
    review_count: 142,
    is_verified: true,
    is_active: true,
    is_24_7: true,
    opening_hours: { open: "12:00 AM", close: "11:59 PM" },
    delivery_available: true,
    delivery_eta_mins: 20,
    delivery_fee: 30,
    free_delivery_above: 400,
    featured_notice: "24/7 Emergency & ICU Medicine Dispensing Center near RMCH",
    accepted_payment_methods: ["cash_on_delivery", "bkash", "nagad", "card", "sslcommerz"]
  },
  {
    name: "Lazz Pharma - Shaheb Bazar",
    slug: "lazz-pharma-shaheb-bazar",
    license_number: "DGDA-RAJ-2023-0881",
    phone: "+880 1819-334455",
    email: "shahebbazar@lazzpharma.com",
    address: "Zero Point Road, Shaheb Bazar, Rajshahi",
    area: "Shaheb Bazar",
    city: "Rajshahi",
    district: "Rajshahi",
    latitude: 24.3644,
    longitude: 88.6012,
    rating: 4.8,
    review_count: 215,
    is_verified: true,
    is_active: true,
    is_24_7: false,
    opening_hours: { open: "08:00 AM", close: "11:30 PM" },
    delivery_available: true,
    delivery_eta_mins: 30,
    delivery_fee: 35,
    free_delivery_above: 500,
    featured_notice: "Genuine imported insulin and oncology medications available",
    accepted_payment_methods: ["cash_on_delivery", "bkash", "nagad", "card", "sslcommerz"]
  },
  {
    name: "Padma Care Pharmacy - Kazihata",
    slug: "padma-care-pharmacy-kazihata",
    license_number: "DGDA-RAJ-2024-0329",
    phone: "+880 1722-667788",
    email: "care@padmapharmacy.com",
    address: "Kazihata More, Near Rajshahi City Hospital, Rajshahi",
    area: "Kazihata",
    city: "Rajshahi",
    district: "Rajshahi",
    latitude: 24.3708,
    longitude: 88.5891,
    rating: 4.7,
    review_count: 88,
    is_verified: true,
    is_active: true,
    is_24_7: true,
    opening_hours: { open: "12:00 AM", close: "11:59 PM" },
    delivery_available: true,
    delivery_eta_mins: 25,
    delivery_fee: 30,
    free_delivery_above: 450,
    featured_notice: "Temperature-controlled vaccine storage with unbroken cold chain",
    accepted_payment_methods: ["cash_on_delivery", "bkash", "nagad"]
  },
  {
    name: "Al-Shefa Drug House - Medical Road",
    slug: "al-shefa-drug-house-medical-road",
    license_number: "DGDA-RAJ-2022-0144",
    phone: "+880 1912-998877",
    email: "shefa@medicalroadraj.com",
    address: "Hospital Gate 2, Medical Road, Rajshahi",
    area: "Medical Road",
    city: "Rajshahi",
    district: "Rajshahi",
    latitude: 24.3738,
    longitude: 88.5821,
    rating: 4.6,
    review_count: 94,
    is_verified: true,
    is_active: true,
    is_24_7: true,
    opening_hours: { open: "12:00 AM", close: "11:59 PM" },
    delivery_available: true,
    delivery_eta_mins: 15,
    delivery_fee: 25,
    free_delivery_above: 350,
    featured_notice: "Immediate hospital corridor delivery available 24 hours",
    accepted_payment_methods: ["cash_on_delivery", "bkash", "nagad"]
  },
  {
    name: "Barendra Health Pharmacy - Talaimari",
    slug: "barendra-health-pharmacy-talaimari",
    license_number: "DGDA-RAJ-2024-0552",
    phone: "+880 1733-112244",
    email: "talaimari@barendrahealth.org",
    address: "RUET Bypass Road, Talaimari, Rajshahi",
    area: "Talaimari",
    city: "Rajshahi",
    district: "Rajshahi",
    latitude: 24.3639,
    longitude: 88.6288,
    rating: 4.8,
    review_count: 73,
    is_verified: true,
    is_active: true,
    is_24_7: false,
    opening_hours: { open: "08:30 AM", close: "11:00 PM" },
    delivery_available: true,
    delivery_eta_mins: 35,
    delivery_fee: 40,
    free_delivery_above: 500,
    featured_notice: "University campus express medicine drop-off service",
    accepted_payment_methods: ["cash_on_delivery", "bkash", "nagad", "card"]
  },
  {
    name: "Green Life Pharmacy - Court Station",
    slug: "green-life-pharmacy-court-station",
    license_number: "DGDA-RAJ-2023-0419",
    phone: "+880 1744-889900",
    email: "court@greenlifepharm.com",
    address: "Station Road, Court Chottor, Rajshahi",
    area: "Court Station",
    city: "Rajshahi",
    district: "Rajshahi",
    latitude: 24.3791,
    longitude: 88.5684,
    rating: 4.5,
    review_count: 51,
    is_verified: true,
    is_active: true,
    is_24_7: false,
    opening_hours: { open: "09:00 AM", close: "10:30 PM" },
    delivery_available: true,
    delivery_eta_mins: 40,
    delivery_fee: 40,
    free_delivery_above: 600,
    featured_notice: "Special discounts for senior citizens and chronic care patients",
    accepted_payment_methods: ["cash_on_delivery", "bkash", "nagad"]
  }
];

const bangladeshiMedicines = [
  {
    brand_name: "Napa Extra",
    generic_name: "Paracetamol + Caffeine",
    category: "Analgesic & Antipyretic",
    manufacturer: "Beximco Pharmaceuticals Ltd.",
    dosage_form: "Tablet",
    strength: "500mg + 65mg",
    unit: "strip of 10",
    unit_price: 30,
    requires_prescription: false,
    is_otc: true,
    description: "Fast dual-action relief from headache, body ache, fever, and migraine pain.",
    indications: "Fever, headache, dental pain, backache, neuralgia, migraine, rheumatic pain.",
    dosage_guidelines: "1-2 tablets every 4-6 hours, maximum 8 tablets in 24 hours.",
    side_effects: "Rare. Skin rashes, allergic reactions in sensitive individuals.",
    precautions: "Do not exceed stated dose. Avoid consuming excessive tea or coffee alongside."
  },
  {
    brand_name: "Ace Plus",
    generic_name: "Paracetamol + Caffeine",
    category: "Analgesic & Antipyretic",
    manufacturer: "Square Pharmaceuticals PLC",
    dosage_form: "Tablet",
    strength: "500mg + 65mg",
    unit: "strip of 10",
    unit_price: 30,
    requires_prescription: false,
    is_otc: true,
    description: "Synergistic analgesic formulation with enhanced paracetamol absorption.",
    indications: "Fever, mild to moderate muscular and neuralgic body pain.",
    dosage_guidelines: "1-2 tablets 3-4 times daily as required.",
    side_effects: "Mild palpitations or sleeplessness if sensitive to caffeine.",
    precautions: "Caution in patients with severe hepatic or renal impairment."
  },
  {
    brand_name: "Seclo 20",
    generic_name: "Omeprazole",
    category: "Gastrointestinal",
    manufacturer: "Square Pharmaceuticals PLC",
    dosage_form: "Capsule",
    strength: "20mg",
    unit: "strip of 10",
    unit_price: 70,
    requires_prescription: false,
    is_otc: true,
    description: "Proton pump inhibitor (PPI) providing long-lasting gastric acid suppression.",
    indications: "Gastric & duodenal ulcer, GERD, acid-related dyspepsia, NSAID-associated erosions.",
    dosage_guidelines: "1 capsule (20mg) once daily before breakfast.",
    side_effects: "Headache, nausea, abdominal bloating, constipation.",
    precautions: "Take before meal with a full glass of water. Swallow whole without chewing."
  },
  {
    brand_name: "Maxpro 20",
    generic_name: "Esomeprazole",
    category: "Gastrointestinal",
    manufacturer: "Incepta Pharmaceuticals Ltd.",
    dosage_form: "Tablet",
    strength: "20mg",
    unit: "strip of 10",
    unit_price: 80,
    requires_prescription: false,
    is_otc: true,
    description: "Advanced S-isomer of omeprazole for superior healing in erosive esophagitis and acid reflux.",
    indications: "Gastroesophageal reflux disease, Zollinger-Ellison syndrome, H. pylori eradication.",
    dosage_guidelines: "20mg to 40mg once daily before main meal.",
    side_effects: "Diarrhea, flatulence, dry mouth.",
    precautions: "Monitor bone density during prolonged therapy."
  },
  {
    brand_name: "Fexo 120",
    generic_name: "Fexofenadine Hydrochloride",
    category: "Antihistamine",
    manufacturer: "Square Pharmaceuticals PLC",
    dosage_form: "Tablet",
    strength: "120mg",
    unit: "strip of 10",
    unit_price: 90,
    requires_prescription: false,
    is_otc: true,
    description: "Non-sedating second generation antihistamine for rapid seasonal allergy relief.",
    indications: "Seasonal allergic rhinitis, sneezing, runny nose, itchy throat, chronic idiopathic urticaria.",
    dosage_guidelines: "120mg once daily with water.",
    side_effects: "Very mild drowsiness, fatigue, headache.",
    precautions: "Avoid taking with grapefruit, orange, or apple juices as they decrease absorption."
  },
  {
    brand_name: "Monas 10",
    generic_name: "Montelukast",
    category: "Respiratory",
    manufacturer: "The ACME Laboratories Ltd.",
    dosage_form: "Tablet",
    strength: "10mg",
    unit: "strip of 10",
    unit_price: 175,
    requires_prescription: true,
    is_otc: false,
    description: "Leukotriene receptor antagonist for prophylaxis and chronic treatment of bronchial asthma.",
    indications: "Chronic asthma, allergic rhinitis, exercise-induced bronchoconstriction.",
    dosage_guidelines: "10mg tablet once daily in the evening.",
    side_effects: "Abdominal pain, dream abnormalities, headache.",
    precautions: "Prescription required. Not intended for reversal of acute bronchospasm."
  },
  {
    brand_name: "Ceevit",
    generic_name: "Ascorbic Acid (Vitamin C)",
    category: "Vitamin & Mineral",
    manufacturer: "Square Pharmaceuticals PLC",
    dosage_form: "Tablet",
    strength: "250mg",
    unit: "strip of 10",
    unit_price: 25,
    requires_prescription: false,
    is_otc: true,
    description: "Chewable orange-flavored Vitamin C for immune defense and wound recovery.",
    indications: "Vitamin C deficiency, scurvy, common cold adjuvant, collagen formation.",
    dosage_guidelines: "Chew 1-2 tablets daily after meals.",
    side_effects: "None at recommended dosage.",
    precautions: "Caution in patients prone to oxalate kidney stones."
  },
  {
    brand_name: "Zithrin 500",
    generic_name: "Azithromycin",
    category: "Antibiotic",
    manufacturer: "Beximco Pharmaceuticals Ltd.",
    dosage_form: "Tablet",
    strength: "500mg",
    unit: "strip of 3",
    unit_price: 120,
    requires_prescription: true,
    is_otc: false,
    description: "Macrolide antibiotic indicated for bacterial infections of respiratory tract, skin, and soft tissue.",
    indications: "Community-acquired pneumonia, acute bronchitis, sinusitis, tonsillitis.",
    dosage_guidelines: "500mg once daily for 3 consecutive days, 1 hour before or 2 hours after food.",
    side_effects: "Nausea, loose stools, temporary stomach discomfort.",
    precautions: "Strictly prescription only. Complete full 3-day course to prevent antimicrobial resistance."
  },
  {
    brand_name: "Cef-3 200",
    generic_name: "Cefixime",
    category: "Antibiotic",
    manufacturer: "Square Pharmaceuticals PLC",
    dosage_form: "Capsule",
    strength: "200mg",
    unit: "strip of 7",
    unit_price: 350,
    requires_prescription: true,
    is_otc: false,
    description: "Third generation oral cephalosporin antibiotic with broad spectrum antibacterial activity.",
    indications: "Typhoid fever, complicated urinary tract infections, otitis media.",
    dosage_guidelines: "200-400mg daily in single or two divided doses.",
    side_effects: "Diarrhea, indigestion, skin rash.",
    precautions: "Requires valid physician prescription. Check for cephalosporin hypersensitivity."
  },
  {
    brand_name: "Combit 500",
    generic_name: "Metformin Hydrochloride",
    category: "Antidiabetic",
    manufacturer: "Square Pharmaceuticals PLC",
    dosage_form: "Tablet",
    strength: "500mg",
    unit: "strip of 10",
    unit_price: 45,
    requires_prescription: true,
    is_otc: false,
    description: "First-line biguanide anti-hyperglycemic agent for Type 2 diabetes management.",
    indications: "Type 2 Diabetes Mellitus, especially in overweight individuals.",
    dosage_guidelines: "500mg 2-3 times daily during or immediately after meals.",
    side_effects: "Gastrointestinal disturbances, metallic taste in mouth.",
    precautions: "Periodic renal function monitoring recommended. Valid prescription required."
  },
  {
    brand_name: "Atova 10",
    generic_name: "Atorvastatin Calcium",
    category: "Cardiovascular",
    manufacturer: "Beximco Pharmaceuticals Ltd.",
    dosage_form: "Tablet",
    strength: "10mg",
    unit: "strip of 10",
    unit_price: 130,
    requires_prescription: true,
    is_otc: false,
    description: "HMG-CoA reductase inhibitor (statin) for reducing LDL cholesterol and cardiovascular risk.",
    indications: "Hypercholesterolemia, dyslipidemia, prevention of coronary heart disease events.",
    dosage_guidelines: "10mg once daily in the evening.",
    side_effects: "Muscle aches, mild liver enzyme changes.",
    precautions: "Prescription only. Report unexplained muscle soreness or weakness promptly."
  },
  {
    brand_name: "ORSaline-N",
    generic_name: "Oral Rehydration Salts (WHO formula)",
    category: "Emergency & Critical",
    manufacturer: "Social Marketing Company (SMC)",
    dosage_form: "Sachet",
    strength: "WHO standard packet",
    unit: "sachet",
    unit_price: 6,
    requires_prescription: false,
    is_otc: true,
    description: "Life-saving electrolyte rehydration formulation recommended by WHO and UNICEF.",
    indications: "Dehydration from acute diarrhea, cholera, heat exhaustion, and vomiting.",
    dosage_guidelines: "Dissolve entire packet in exactly 500ml of clean drinking water. Drink after every loose stool.",
    side_effects: "None when properly diluted.",
    precautions: "Do not mix with boiling water or milk. Consume within 12 hours of reconstitution."
  },
  {
    brand_name: "Amodis 400",
    generic_name: "Metronidazole",
    category: "Gastrointestinal",
    manufacturer: "Square Pharmaceuticals PLC",
    dosage_form: "Tablet",
    strength: "400mg",
    unit: "strip of 10",
    unit_price: 25,
    requires_prescription: true,
    is_otc: false,
    description: "Nitroimidazole antimicrobial active against anaerobic bacteria and protozoa.",
    indications: "Amebiasis, giardiasis, trichomoniasis, dental infections.",
    dosage_guidelines: "400mg 3 times daily with meals for 5-7 days.",
    side_effects: "Metallic taste, dark urine, nausea.",
    precautions: "Do not consume alcohol during and 48 hours after treatment."
  },
  {
    brand_name: "E-Cap 400",
    generic_name: "Vitamin E (dl-Alpha Tocopheryl Acetate)",
    category: "Vitamin & Mineral",
    manufacturer: "Drug International Ltd.",
    dosage_form: "Capsule",
    strength: "400 IU",
    unit: "strip of 10",
    unit_price: 80,
    requires_prescription: false,
    is_otc: true,
    description: "Potent lipid-soluble antioxidant for cell membrane protection, hair, and dermatological vitality.",
    indications: "Antioxidant supplement, peripheral vascular disorders, skin nourishment.",
    dosage_guidelines: "1 soft capsule daily with meal.",
    side_effects: "Extremely rare at normal dosage.",
    precautions: "Consult physician if taking blood thinners."
  }
];

async function seedPharmaciesAndMedicines() {
  console.log("🌱 Seeding Rajshahi Pharmacies, Medicines, and Inventories...");

  // 1. Seed Pharmacies
  const savedPharmacies = [];
  for (const pData of rajshahiPharmacies) {
    const pharmacy = await Pharmacy.findOneAndUpdate(
      { slug: pData.slug },
      pData,
      { upsert: true, new: true, runValidators: true }
    );
    savedPharmacies.push(pharmacy);
  }
  console.log(`✅ Seeded ${savedPharmacies.length} Rajshahi Pharmacies`);

  // 2. Seed Medicines
  const savedMedicines = [];
  for (const mData of bangladeshiMedicines) {
    const medicine = await Medicine.findOneAndUpdate(
      { brand_name: mData.brand_name },
      mData,
      { upsert: true, new: true, runValidators: true }
    );
    savedMedicines.push(medicine);
  }
  console.log(`✅ Seeded ${savedMedicines.length} Medicines`);

  // 3. Populate Inventory for each pharmacy
  let inventoryCount = 0;
  for (const pharmacy of savedPharmacies) {
    for (const medicine of savedMedicines) {
      // Vary stock and price slightly per pharmacy
      const basePrice = medicine.unit_price;
      const stockQty = Math.floor(Math.random() * 200) + 20;
      const demandTrends = ["Surging", "High Demand", "Stable", "Stable"];
      const trend = demandTrends[Math.floor(Math.random() * demandTrends.length)];

      await PharmacyInventory.findOneAndUpdate(
        { pharmacy_id: pharmacy._id, medicine_id: medicine._id },
        {
          stock_quantity: stockQty,
          unit_price: basePrice,
          discounted_price: Math.random() > 0.6 ? Math.round(basePrice * 0.95) : null,
          batch_number: "BAT-" + Math.floor(100000 + Math.random() * 900000),
          expiry_date: new Date(Date.now() + 1000 * 60 * 60 * 24 * 365), // 1 year ahead
          in_stock: true,
          reorder_level: 25,
          demand_trend: trend,
          trend_reason: trend === "Surging" ? "Seasonal surge in Rajshahi area" : "Standard refill rate",
          risk_level: trend === "Surging" ? "Surge Warning" : "Normal",
          is_active: true
        },
        { upsert: true, new: true }
      );
      inventoryCount++;
    }
  }

  console.log(`✅ Seeded ${inventoryCount} Pharmacy Inventory records`);
}

module.exports = seedPharmaciesAndMedicines;
