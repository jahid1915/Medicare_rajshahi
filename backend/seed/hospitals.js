const Hospital = require("../models/Hospital");
const HospitalResource = require("../models/HospitalResource");

const HOSPITALS_DATA = [
  {
    name: "Rajshahi Medical College Hospital",
    short_name: "RMCH",
    type: "government",
    city: "Rajshahi", district: "Rajshahi", division: "Rajshahi",
    area: "Laxmipur",
    address: "Medical College Road, Laxmipur, Rajshahi 6000",
    phone: "0721-775094",
    emergency_phone: "0721-775094",
    latitude: 24.3722, longitude: 88.6042,
    is_verified: true,
    verification_level: "admin_verified",
    has_icu: true, has_ccu: true, has_nicu: true, has_picu: false,
    has_emergency: true, has_blood_bank: true, has_pharmacy: true,
    has_diagnostic: true, has_ambulance: true, has_dialysis: true,
    bed_count_approx: 1200,
    description: "The premier government medical institution in Rajshahi Division and the main referral hospital for the region.",
    services: ["General Medicine","Surgery","Cardiology","Neurology","Pediatrics","Obstetrics","Orthopedics","Oncology","Dialysis","ICU","CCU","NICU","Emergency","Blood Bank","Pharmacy","Radiology"]
  },
  {
    name: "Rajshahi Shishu Hospital",
    short_name: "Shishu Hospital",
    type: "government",
    city: "Rajshahi", district: "Rajshahi", division: "Rajshahi",
    area: "Boalia",
    address: "Shishu Hospital Road, Boalia, Rajshahi",
    phone: null, emergency_phone: null,
    latitude: 24.3704, longitude: 88.6045,
    is_verified: false,
    has_icu: true, has_nicu: true, has_emergency: true,
    has_blood_bank: false, has_pharmacy: true, has_diagnostic: true,
    bed_count_approx: null,
    description: "Dedicated government children hospital serving Rajshahi Division.",
    services: ["Pediatrics","NICU","ICU","Emergency","General Medicine","Surgery"]
  },
  {
    name: "Rajshahi Eye Hospital & Training Institute",
    short_name: "Eye Hospital",
    type: "government",
    city: "Rajshahi", district: "Rajshahi", division: "Rajshahi",
    area: "Rajpara",
    address: "Rajpara, Rajshahi",
    phone: null, emergency_phone: null,
    latitude: null, longitude: null,
    is_verified: false,
    has_icu: false, has_emergency: false,
    has_pharmacy: true, has_diagnostic: true,
    bed_count_approx: null,
    description: "Specialized ophthalmic hospital providing eye care and surgical services.",
    services: ["Ophthalmology","Eye Surgery","Refraction","Glaucoma","Retina","Cataract"]
  },
  {
    name: "Popular Medical Centre, Rajshahi",
    short_name: "Popular Medical",
    type: "private",
    city: "Rajshahi", district: "Rajshahi", division: "Rajshahi",
    area: "Boalia",
    address: "Alupatti, Boalia, Rajshahi",
    phone: null, emergency_phone: null,
    latitude: 24.3655, longitude: 88.6021,
    is_verified: false,
    has_icu: true, has_emergency: true,
    has_pharmacy: true, has_diagnostic: true, has_ambulance: true,
    bed_count_approx: null,
    description: "Leading private multi-specialty hospital in Rajshahi with modern facilities.",
    services: ["General Medicine","Surgery","ICU","Emergency","Diagnostic","Pathology","Orthopedics"]
  },
  {
    name: "Ibn Sina Hospital, Rajshahi",
    short_name: "Ibn Sina",
    type: "private",
    city: "Rajshahi", district: "Rajshahi", division: "Rajshahi",
    area: "Motihar",
    address: "Motihar, Rajshahi",
    phone: null, emergency_phone: null,
    latitude: null, longitude: null,
    is_verified: false,
    has_icu: true, has_emergency: true,
    has_pharmacy: true, has_diagnostic: true,
    bed_count_approx: null,
    description: "Multi-specialty private hospital with modern diagnostic and treatment facilities.",
    services: ["General Medicine","Surgery","ICU","Diagnostic","Pathology"]
  },
  {
    name: "Impulse Hospital, Rajshahi",
    short_name: "Impulse Hospital",
    type: "private",
    city: "Rajshahi", district: "Rajshahi", division: "Rajshahi",
    area: "Shah Makhdum",
    address: "Shah Makhdum, Rajshahi",
    phone: null, emergency_phone: null,
    latitude: null, longitude: null,
    is_verified: false,
    has_icu: true,
    has_pharmacy: true, has_diagnostic: true,
    bed_count_approx: null,
    description: "Modern private hospital providing specialized medical services.",
    services: ["General Medicine","Surgery","ICU","Orthopedics","Diagnostic"]
  }
];

async function seedHospitals() {
  console.log("Seeding hospitals...");
  await Hospital.deleteMany({ city: "Rajshahi" });

  const hospitals = await Hospital.insertMany(HOSPITALS_DATA);
  console.log(`Created ${hospitals.length} hospitals`);

  // Create placeholder resource records for RMCH only
  const rmch = hospitals.find(h => h.short_name === "RMCH");
  if (rmch) {
    const resources = [
      { resource_type: "general_bed", resource_name: "General Bed", total_capacity: null, available_count: null, status: "unknown" },
      { resource_type: "cabin",       resource_name: "Cabin",        total_capacity: null, available_count: null, status: "unknown" },
      { resource_type: "icu",         resource_name: "ICU",          total_capacity: null, available_count: null, status: "unknown" },
      { resource_type: "ccu",         resource_name: "CCU",          total_capacity: null, available_count: null, status: "unknown" },
      { resource_type: "nicu",        resource_name: "NICU",         total_capacity: null, available_count: null, status: "unknown" },
      { resource_type: "emergency_bed",resource_name:"Emergency Bed",total_capacity: null, available_count: null, status: "unknown" },
      { resource_type: "operation_theatre",resource_name:"Operation Theatre",total_capacity: null, available_count: null, status: "unknown" },
      { resource_type: "dialysis_unit",resource_name:"Dialysis Unit",total_capacity: null, available_count: null, status: "unknown" }
    ].map(r => ({ ...r, hospital_id: rmch._id, source: "manual", verification_status: "unverified" }));

    await HospitalResource.deleteMany({ hospital_id: rmch._id });
    await HospitalResource.insertMany(resources);
    console.log(`Created ${resources.length} placeholder resources for RMCH`);
  }

  return hospitals;
}

module.exports = seedHospitals;
