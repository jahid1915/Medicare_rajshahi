const Doctor = require("../models/Doctor");
const DoctorBranch = require("../models/DoctorBranch");
const Hospital = require("../models/Hospital");
const Medicine = require("../models/Medicine");
const Pharmacy = require("../models/Pharmacy");
const PharmacyInventory = require("../models/PharmacyInventory");
const Appointment = require("../models/Appointment");
const Prescription = require("../models/Prescription");
const PharmacyOrder = require("../models/PharmacyOrder");

// ─── AMBULANCE REGISTRY (VERIFIED RAJSHAHI PROVIDERS) ────────────────────────
const RAJSHAHI_AMBULANCE_PROVIDERS = [
  {
    id: "AMB-RAJ-01",
    name: "RMCH Emergency Ambulance Dispatch Desk",
    operator: "Rajshahi Medical College Hospital",
    type: "ICU Ambulance",
    area: "Laxmipur",
    phone: "0721-775094",
    altPhone: "16263",
    available247: true,
    equipment: "ICU Ventilator, Cardiac Monitor, Oxygen, Defibrillator"
  },
  {
    id: "AMB-RAJ-02",
    name: "Red Crescent Emergency Fleet Rajshahi",
    operator: "Bangladesh Red Crescent Society (Rajshahi Unit)",
    type: "Basic Ambulance (BLS)",
    area: "Boalia",
    phone: "0721-772412",
    altPhone: "01712-114422",
    available247: true,
    equipment: "Oxygen Cylinder, Spine Stretcher, First Aid Kit"
  },
  {
    id: "AMB-RAJ-03",
    name: "Al-Madina Critical Care Ambulance Service",
    operator: "Al-Madina EMS Services",
    type: "ICU Ambulance",
    area: "Laxmipur",
    phone: "01711-239988",
    altPhone: "01715-449900",
    available247: true,
    equipment: "High-flow Oxygen, Syringe Pump, Resuscitation Kit"
  },
  {
    id: "AMB-RAJ-04",
    name: "Laxmipur Standard AC Ambulance Service",
    operator: "Rajshahi Medical Zone Transport",
    type: "AC Ambulance",
    area: "Laxmipur",
    phone: "01723-556677",
    altPhone: "01819-332211",
    available247: true,
    equipment: "AC Patient Cabin, Continuous Oxygen, Stretcher"
  },
  {
    id: "AMB-RAJ-05",
    name: "Padma Shishu & Neonatal Dedicated Transfer",
    operator: "Padma Specialized Care",
    type: "Specialized Ambulance",
    area: "Rajpara",
    phone: "01718-990011",
    altPhone: "01911-882233",
    available247: true,
    equipment: "Transport Incubator (Baby Warmer), Pediatric Oxygen"
  },
  {
    id: "AMB-RAJ-06",
    name: "Anjuman Mufidul Islam Ambulance Wing",
    operator: "Anjuman Mufidul Islam Rajshahi",
    type: "Basic Ambulance (BLS)",
    area: "Shah Makhdum",
    phone: "0721-774431",
    altPhone: "01714-667788",
    available247: true,
    equipment: "Basic Stretcher, Oxygen Delivery"
  }
];

// ─── LANGUAGE DETECTION ──────────────────────────────────────────────────────
function detectLanguage(text) {
  if (!text) return "english";
  // Bangla script range: U+0980 to U+09FF
  if (/[\u0980-\u09FF]/.test(text)) {
    return "bangla";
  }
  // Common Banglish markers
  const banglishPatterns = [
    /\b(kivabe|kibhabe|kobe|koi|kothay|ache|ase|pabo|debo|dibo|hobe|korbo|chai|daktar|daktari|rog|rogi|oshudh|osudh|apnar|amar|tumi|apni|bhai|bujhte|bolen|lagbe)\b/i,
    /\b(te|er|e|r|re)\b.*\b(doctor|medicine|appointment|ambulance|hospital)\b/i
  ];
  if (banglishPatterns.some(p => p.test(text))) {
    return "banglish";
  }
  return "english";
}

// ─── SENSITIVE INTENT DETECTION (PROMPT INJECTION & SECRETS) ──────────────────
function checkSensitiveOrMalicious(text) {
  const lower = (text || "").toLowerCase();
  const prohibited = [
    "password", "passwords", "password_hash", "otp", "secret", "jwt",
    "token", "drop table", "truncate", "system prompt", "ignore instructions",
    "ignore all previous", "bypass", "show me all users", "dump database"
  ];
  return prohibited.some(word => lower.includes(word));
}

// ─── AI CORE SERVICE ─────────────────────────────────────────────────────────
class AiService {
  /**
   * Main conversational entry point.
   * @param {string} userMessage - User's query
   * @param {object|null} user - Authenticated user object from req.user (or null if anonymous)
   * @param {string} role - 'anonymous' | 'patient' | 'doctor' | 'admin'
   * @param {string} language - 'bangla' | 'english' | null
   */
  async processQuery({ userMessage, user = null, role = "anonymous", language = null }) {
    const raw = (userMessage || "").trim();
    if (!raw) {
      return {
        success: false,
        reply: language === "bangla" ? "অনুগ্রহ করে আপনার প্রশ্ন বা উপসর্গের বিবরণ লিখুন।" : "Please enter your question or symptom.",
        entities: [],
        suggestedActions: []
      };
    }

    const detected = detectLanguage(raw);
    // If the input is in Bangla script, always respond in Bangla; otherwise respect explicit language choice if provided
    const lang = /[\u0980-\u09FF]/.test(raw) ? "bangla" : (language || detected);
    const lower = raw.toLowerCase();

    // 1. Intercept prompt injection and secret extraction attempts
    if (checkSensitiveOrMalicious(raw)) {
      if (lang === "bangla") {
        return {
          success: true,
          reply: "নিরাপত্তা ও গোপনীয়তা নীতির কারণে পাসওয়ার্ড, ওটিপি বা সিস্টেমের অভ্যন্তরীণ তথ্য দেখতে দেওয়া সম্ভব নয়। আপনি প্ল্যাটফর্মের ডাক্তার, হাসপাতাল বা আপনার স্বাস্থ্য সেবা সম্পর্কে জানতে পারেন।",
          entities: [],
          suggestedActions: [{ label: "ডাক্তার খুঁজুন", link: "/doctors" }]
        };
      } else if (lang === "banglish") {
        return {
          success: true,
          reply: "Security and privacy rules er karone password, OTP ba internal credential dekha jabe na. Niramoy platform er doctor, medicine ba hospital niye proshno korte paren.",
          entities: [],
          suggestedActions: [{ label: "Search Doctors", link: "/doctors" }]
        };
      } else {
        return {
          success: true,
          reply: "For patient security and privacy, system credentials, passwords, and OTP tokens are never disclosed. How can I assist you with doctors, hospital beds, medicines, or health services?",
          entities: [],
          suggestedActions: [{ label: "Find Doctors", link: "/doctors" }]
        };
      }
    }

    // 2. Critical Red Flag / Emergency Check
    if (
      lower.includes("chest pain") || lower.includes("heart attack") ||
      lower.includes("buke betha") || lower.includes("বুকে ব্যথা") ||
      lower.includes("cannot breathe") || lower.includes("rokto") ||
      lower.includes("unconscious") || lower.includes("জ্ঞান হারিয়েছে")
    ) {
      return this.handleEmergencyResponse(lang);
    }

    // 3. Private Patient Data Access Intent
    const isPrivateAppointmentIntent = (
      /(?:my|amar|আমার)\s*(?:appointment|অ্যাপয়েন্টমেন্ট)/i.test(raw) ||
      /(?:next|upcoming|last|পরবর্তী|লাস্ট)\s*(?:appointment|অ্যাপয়েন্টমেন্ট)/i.test(raw) ||
      /(?:appointment|অ্যাপয়েন্টমেন্ট)/i.test(raw) && /(?:আমার|amar|my|kobe|কবে|status)/i.test(raw)
    );
    const isPrivatePrescriptionIntent = (
      /(?:my|amar|আমার)\s*(?:prescription|প্রেসক্রিপশন)/i.test(raw) ||
      /(?:prescription|প্রেসক্রিপশন)\s*(?:show|dekhao|দেখান|দেখাও|-e|e|\?)/i.test(raw) ||
      /(?:prescription|প্রেসক্রিপশন)/i.test(raw) && /(?:আমার|amar|my|dekhao|দেখাও|show|ache|আছে)/i.test(raw)
    );
    const isPrivateOrderIntent = (
      /(?:my|amar|আমার)\s*(?:order|অর্ডার)/i.test(raw) ||
      /(?:order|অর্ডার)/i.test(raw) && /(?:আমার|amar|my|status|koi|কোথায়)/i.test(raw)
    );
    const isPrivateProfileIntent = (
      /(?:my|amar|আমার)\s*(?:profile|প্রোফাইল|info|তথ্য)/i.test(raw)
    );

    if (isPrivateAppointmentIntent || isPrivatePrescriptionIntent || isPrivateOrderIntent || isPrivateProfileIntent) {
      // LEVEL 1: Anonymous -> DENY with Enter Portal CTA
      if (!user) {
        if (lang === "bangla") {
          return {
            success: true,
            reply: "আপনার ব্যক্তিগত প্রেসক্রিপশন, অ্যাপয়েন্টমেন্ট বা অর্ডার দেখতে অনুগ্রহ করে প্রথমে Niramoy Patient Portal-এ প্রবেশ করুন।",
            entities: [],
            suggestedActions: [{ label: "Enter Portal (প্রবেশ করুন)", link: "/signin" }]
          };
        } else if (lang === "banglish") {
          return {
            success: true,
            reply: "Apnar private prescription, appointment ba order dekhte age Niramoy Patient Portal e Enter Portal korun.",
            entities: [],
            suggestedActions: [{ label: "Enter Portal", link: "/signin" }]
          };
        } else {
          return {
            success: true,
            reply: "To view your private medical records, appointments, or prescriptions, please sign in to the Niramoy Patient Portal.",
            entities: [],
            suggestedActions: [{ label: "Enter Portal", link: "/signin" }]
          };
        }
      }

      // LEVEL 2: Authenticated Patient -> Fetch user's own data strictly via user._id
      if (isPrivateAppointmentIntent) {
        return this.getMyAppointmentsTool(user, lang);
      }
      if (isPrivatePrescriptionIntent) {
        return this.getMyPrescriptionsTool(user, lang);
      }
      if (isPrivateOrderIntent) {
        return this.getMyOrdersTool(user, lang);
      }
      if (isPrivateProfileIntent) {
        return this.getMyProfileTool(user, lang);
      }
    }

    // 4. Ambulance Discovery Intent
    if (
      lower.includes("ambulance") || lower.includes("অ্যাম্বুলেন্স") ||
      lower.includes("ambulens") || lower.includes("emergency car")
    ) {
      return this.searchAmbulancesTool(raw, lang);
    }

    // 5. Platform Navigation & FAQ (How to book, How to use, Portal access)
    const isHowToQuery = (
      lower.includes("kivabe") || lower.includes("kibhabe") ||
      lower.includes("how to") || lower.includes("how do i") ||
      lower.includes("কিভাবে") || lower.includes("কীভাবে") ||
      lower.includes("niyom") || lower.includes("process") ||
      (lower.includes("portal") && (lower.includes("login") || lower.includes("enter") || lower.includes("sign") || lower.includes("dhukbo")))
    );

    if (isHowToQuery) {
      return this.getPlatformGuidanceTool(raw, lang);
    }

    // 6. Doctor Discovery Intent (Specialties, Names, Chambers)
    const isDoctorQuery = (
      lower.includes("doctor") || lower.includes("ডাক্তার") ||
      lower.includes("daktar") || lower.includes("specialist") ||
      lower.includes("বিশেষজ্ঞ") || lower.includes("physician") ||
      lower.includes("dermatolog") || lower.includes("skin") || lower.includes("চর্মরোগ") ||
      lower.includes("cardio") || lower.includes("heart") || lower.includes("হৃদরোগ") ||
      lower.includes("pediatr") || lower.includes("child") || lower.includes("shishu") ||
      lower.includes("gyne") || lower.includes("obs") || lower.includes("স্ত্রী") ||
      lower.includes("eye") || lower.includes("ophthalm") || lower.includes("চক্ষু") ||
      lower.includes("ortho") || lower.includes("neuro") || lower.includes("dent") ||
      (lower.includes("medicine") && (lower.includes("specialist") || lower.includes("doctor") || lower.includes("chamber")))
    );

    if (isDoctorQuery) {
      return this.searchDoctorsTool(raw, lang);
    }

    // 6. Medicine / Pharmacy Availability Intent
    const isMedicineQuery = (
      lower.includes("medicine") || lower.includes("ঔষধ") ||
      lower.includes("osudh") || lower.includes("oshudh") ||
      lower.includes("pharmacy") || lower.includes("ফার্মেসি") ||
      lower.includes("paracetamol") || lower.includes("napa") ||
      lower.includes("ace") || lower.includes("seclo") ||
      lower.includes("pantobex") || lower.includes("fexo") ||
      lower.includes("stock")
    );

    if (isMedicineQuery) {
      return this.searchMedicinesAndPharmaciesTool(raw, lang);
    }

    // 7. Hospital & Diagnostic Centers Intent
    const isHospitalQuery = (
      lower.includes("hospital") || lower.includes("হাসপাতাল") ||
      lower.includes("clinic") || lower.includes("diagnostic") ||
      lower.includes("ডায়াগনস্টিক") || lower.includes("rmch") ||
      lower.includes("bed") || lower.includes("icu")
    );

    if (isHospitalQuery) {
      return this.searchHospitalsTool(raw, lang);
    }

    // 8. General Health Education Fallback
    return this.getGeneralHealthGuidance(raw, lang);
  }

  // ─── EMERGENCY RESPONSE ────────────────────────────────────────────────────
  handleEmergencyResponse(lang) {
    if (lang === "bangla") {
      return {
        success: true,
        reply: "⚠️ জরুরি সতর্কতা: আপনার লক্ষণগুলো একটি সম্ভাব্য জরুরি চিকিৎসাগত পরিস্থিতির (যেমন হার্ট অ্যাটাক বা শ্বাসকষ্ট) ইঙ্গিত দিতে পারে। বিলম্ব না করে অবিলম্বে রাজশাহী মেডিকেল কলেজ হাসপাতাল (RMCH) জরুরি বিভাগে যান অথবা অ্যাম্বুলেন্স ডাকুন।",
        entities: [
          {
            type: "ambulance",
            title: "RMCH Emergency Ambulance",
            subtitle: "২৪/৭ জরুরি হটলাইন",
            details: "ফোন: 0721-775094 / জাতীয় হেল্পলাইন: 999",
            actionLabel: "কল করুন 999",
            link: "tel:999"
          }
        ],
        suggestedActions: [
          { label: "অ্যাম্বুলেন্স তালিকা", link: "/ambulance" },
          { label: "জরুরি হাসপাতাল", link: "/hospitals" }
        ]
      };
    } else if (lang === "banglish") {
      return {
        success: true,
        reply: "⚠️ EMERGENCY WARNING: Ei shob symptoms gurutoro emergency hote pare. Deri na kore ekhoni Rajshahi Medical College Hospital (RMCH) Emergency te jan ba 999 / 16263 e call korun.",
        entities: [
          {
            type: "ambulance",
            title: "RMCH Emergency Ambulance Dispatch",
            subtitle: "24/7 Emergency",
            details: "Phone: 0721-775094 | National Hotline: 999",
            actionLabel: "Call 999",
            link: "tel:999"
          }
        ],
        suggestedActions: [
          { label: "Ambulance Directory", link: "/ambulance" }
        ]
      };
    } else {
      return {
        success: true,
        reply: "⚠️ CRITICAL MEDICAL ALERT: Your symptoms may indicate an acute life-threatening medical emergency. Do not wait for online messages. Immediately call 999 or proceed to the Rajshahi Medical College Hospital (RMCH) Emergency Ward.",
        entities: [
          {
            type: "ambulance",
            title: "RMCH Emergency Dispatch Desk",
            subtitle: "24/7 Emergency Desk",
            details: "Tel: 0721-775094 | National Health Hotline: 16263",
            actionLabel: "Call 999",
            link: "tel:999"
          }
        ],
        suggestedActions: [
          { label: "Emergency Ambulance Fleet", link: "/ambulance" }
        ]
      };
    }
  }

  // ─── AMBULANCE SEARCH TOOL ─────────────────────────────────────────────────
  async searchAmbulancesTool(query, lang) {
    const list = RAJSHAHI_AMBULANCE_PROVIDERS.slice(0, 3);
    const entities = list.map(item => ({
      type: "ambulance",
      title: item.name,
      subtitle: `${item.type} • ${item.area}, Rajshahi`,
      details: `Phone: ${item.phone} | Alt: ${item.altPhone}`,
      actionLabel: `Call ${item.phone}`,
      link: `tel:${item.phone.replace(/[^0-9]/g, '')}`
    }));

    let reply = "";
    if (lang === "bangla") {
      reply = `রাজশাহীতে উপলব্ধ ভেরিফায়েড অ্যাম্বুলেন্স সেবাসমূহ নিচে দেওয়া হলো। জরুরি প্রয়োজনে সরাসরি ফোন নম্বরে যোগাযোগ করতে পারেন:`;
    } else if (lang === "banglish") {
      reply = `Rajshahi er verified ambulance providers gulo niche dewa holo. Emergency te direct call korte paren:`;
    } else {
      reply = `Here are verified emergency ambulance services in Rajshahi. You can call dispatch desks directly:`;
    }

    return {
      success: true,
      reply,
      entities,
      suggestedActions: [
        { label: "View All Ambulances", link: "/ambulance" },
        { label: "Emergency Hospital Beds", link: "/hospitals" }
      ]
    };
  }

  // ─── REAL DOCTOR SEARCH TOOL ───────────────────────────────────────────────
  async searchDoctorsTool(query, lang) {
    const lower = query.toLowerCase();
    let filter = { is_active: { $ne: false } };

    // Specialty matching
    if (lower.includes("skin") || lower.includes("চর্ম") || lower.includes("dermatolog")) {
      filter.$or = [
        { specialty: { $regex: /dermatol|skin|চর্ম/i } },
        { qualifications: { $regex: /DDV|dermatol/i } }
      ];
    } else if (lower.includes("heart") || lower.includes("হৃদরোগ") || lower.includes("cardio")) {
      filter.$or = [
        { specialty: { $regex: /cardio|heart|হৃদ/i } }
      ];
    } else if (lower.includes("child") || lower.includes("শিশু") || lower.includes("pediatric")) {
      filter.$or = [
        { specialty: { $regex: /pediatric|শিশু/i } }
      ];
    } else if (lower.includes("gyne") || lower.includes("স্ত্রী") || lower.includes("obs")) {
      filter.$or = [
        { specialty: { $regex: /gyne|obs|স্ত্রী/i } }
      ];
    } else if (lower.includes("eye") || lower.includes("চক্ষু") || lower.includes("ophthalm")) {
      filter.$or = [
        { specialty: { $regex: /eye|ophthalm|চক্ষু/i } }
      ];
    } else if (lower.includes("ortho") || lower.includes("হাড়") || lower.includes("bone")) {
      filter.$or = [
        { specialty: { $regex: /ortho|হাড়/i } }
      ];
    } else {
      // General search on name or specialty
      const cleanKeyword = lower.replace(/\b(doctor|ডাক্তার|daktar|ke|ache|ase|rajshahi|te|er|koi|show|find|list|kivabe)\b/gi, "").trim();
      if (cleanKeyword.length > 2) {
        filter.$or = [
          { name: { $regex: cleanKeyword, $options: "i" } },
          { specialty: { $regex: cleanKeyword, $options: "i" } },
          { qualifications: { $regex: cleanKeyword, $options: "i" } }
        ];
      }
    }

    try {
      const doctors = await Doctor.find(filter).limit(4).lean();
      if (!doctors || doctors.length === 0) {
        // Fallback: fetch top verified doctors
        const fallbackDoctors = await Doctor.find({ is_active: { $ne: false } }).limit(3).lean();
        return this.formatDoctorResults(fallbackDoctors, lang, false);
      }
      return this.formatDoctorResults(doctors, lang, true);
    } catch (err) {
      return {
        success: true,
        reply: "I couldn't retrieve the latest doctor directory right now. Please explore our verified Doctor Directory.",
        entities: [],
        suggestedActions: [{ label: "Browse Doctors", link: "/doctors" }]
      };
    }
  }

  formatDoctorResults(doctors, lang, matchedSpecific) {
    const entities = doctors.map(doc => {
      const chamber = (doc.chambers && doc.chambers[0]) ? doc.chambers[0].name : "Rajshahi Chamber";
      const fee = doc.consultation_fee ? `৳${doc.consultation_fee}` : "Regular Consultation";
      return {
        type: "doctor",
        id: doc._id,
        title: doc.name,
        subtitle: `${doc.specialty || "Specialist"} • ${doc.qualifications || "BMDC Registered"}`,
        details: `Chamber: ${chamber} | Fee: ${fee}`,
        actionLabel: "Book Appointment",
        link: doc.slug ? `/doctors/${doc.slug}` : `/doctors?id=${doc._id}`
      };
    });

    let reply = "";
    if (lang === "bangla") {
      reply = matchedSpecific
        ? `আপনার অনুসন্ধানের ভিত্তিতে রাজশাহীর ভেরিফায়েড বিশেষজ্ঞ ডাক্তারগণের তালিকা:`
        : `রাজশাহীতে উপলব্ধ কয়েকজন বিশেষজ্ঞ চিকিৎসকের তালিকা নিচে দেওয়া হলো:`;
    } else if (lang === "banglish") {
      reply = matchedSpecific
        ? `Apnar query onujayi Rajshahi er verified specialist doctor der list:`
        : `Rajshahi er available specialist doctor der list dewa holo:`;
    } else {
      reply = matchedSpecific
        ? `Here are verified specialist doctors matching your inquiry in Rajshahi:`
        : `Here are available verified specialists in Rajshahi:`;
    }

    return {
      success: true,
      reply,
      entities,
      suggestedActions: [
        { label: "All Doctors Directory", link: "/doctors" },
        { label: "Book Appointment", link: "/doctors" }
      ]
    };
  }

  // ─── REAL MEDICINE & PHARMACY SEARCH TOOL ──────────────────────────────────
  async searchMedicinesAndPharmaciesTool(query, lang) {
    const lower = query.toLowerCase();
    const cleanTerm = lower
      .replace(/\b(medicine|osudh|oshudh|pharmacy|stock|ache|ase|kon|pabo|te|er|ei|niramoy|e)\b/gi, "")
      .trim();

    try {
      let matchedMeds = [];
      if (cleanTerm.length > 1) {
        matchedMeds = await Medicine.find({
          $or: [
            { brand_name: { $regex: cleanTerm, $options: "i" } },
            { generic_name: { $regex: cleanTerm, $options: "i" } }
          ]
        }).limit(3).lean();
      }

      const pharmacies = await Pharmacy.find({ is_active: { $ne: false } }).limit(2).lean();

      const entities = [];
      if (matchedMeds.length > 0) {
        matchedMeds.forEach(m => {
          entities.push({
            type: "medicine",
            title: `${m.brand_name} ${m.strength || ""}`,
            subtitle: `${m.generic_name} • ${m.dosage_form || "Tablet"}`,
            details: `Manufacturer: ${m.manufacturer || "Certified BD Pharma"} | Price: ৳${m.price_per_unit || "Standard"}`,
            actionLabel: "Order Medicine",
            link: "/medicine"
          });
        });
      }

      pharmacies.forEach(p => {
        entities.push({
          type: "pharmacy",
          title: p.name,
          subtitle: `${p.area || "Laxmipur"}, Rajshahi`,
          details: `Address: ${p.address || "Medical College Road"} | Phone: ${p.phone || "017XXXXXXXX"}`,
          actionLabel: "View Pharmacy",
          link: `/pharmacy`
        });
      });

      let reply = "";
      if (lang === "bangla") {
        reply = matchedMeds.length > 0
          ? `আমরা আমাদের ডাটাবেজে ওষুধ ও সংশ্লিষ্ট ফার্মেসি তথ্য খুঁজে পেয়েছি:`
          : `রাজশাহীতে উপলব্ধ লাইসেন্সপ্রাপ্ত ফার্মেসি তালিকা নিচে দেওয়া হলো:`;
      } else if (lang === "banglish") {
        reply = matchedMeds.length > 0
          ? `Niramoy e matched medicine o pharmacy availability dewa holo:`
          : `Rajshahi er licensed pharmacy gulo ekhane paben:`;
      } else {
        reply = matchedMeds.length > 0
          ? `Found verified medicines and licensed partner pharmacies:`
          : `Here are licensed partner pharmacies in Rajshahi:`;
      }

      return {
        success: true,
        reply,
        entities,
        suggestedActions: [
          { label: "Search Medicine Catalog", link: "/medicine" },
          { label: "Pharmacy Stores", link: "/pharmacy" }
        ]
      };
    } catch (err) {
      return {
        success: true,
        reply: "I couldn't verify current live pharmacy stock at this moment. You can browse the Medicine Store directly.",
        entities: [],
        suggestedActions: [{ label: "Medicine Store", link: "/medicine" }]
      };
    }
  }

  // ─── REAL HOSPITAL SEARCH TOOL ─────────────────────────────────────────────
  async searchHospitalsTool(query, lang) {
    try {
      const hospitals = await Hospital.find().limit(3).lean();
      const entities = hospitals.map(h => ({
        type: "hospital",
        title: h.name,
        subtitle: `${h.type?.toUpperCase() || "HOSPITAL"} • ${h.area || h.city || "Rajshahi"}`,
        details: `Emergency: ${h.emergency_phone || h.phone || "Available"} | ICU: ${h.has_icu ? "Yes" : "No"} | Ambulance: ${h.has_ambulance ? "Yes" : "No"}`,
        actionLabel: "View Facilities",
        link: "/hospitals"
      }));

      let reply = "";
      if (lang === "bangla") {
        reply = `রাজশাহীর প্রধান হাসপাতাল ও স্বাস্থ্যসেবা কেন্দ্রগুলোর বিবরণ:`;
      } else if (lang === "banglish") {
        reply = `Rajshahi er prominent hospital o emergency center gulo niche dewa holo:`;
      } else {
        reply = `Here are prominent verified hospitals and medical facilities in Rajshahi:`;
      }

      return {
        success: true,
        reply,
        entities,
        suggestedActions: [
          { label: "View Bed Availability", link: "/hospitals" }
        ]
      };
    } catch (err) {
      return {
        success: true,
        reply: "Unable to retrieve hospital data right now.",
        entities: [],
        suggestedActions: [{ label: "Hospitals", link: "/hospitals" }]
      };
    }
  }

  // ─── PRIVATE USER DATA: APPOINTMENTS ───────────────────────────────────────
  async getMyAppointmentsTool(user, lang) {
    try {
      const appointments = await Appointment.find({
        $or: [{ patient_id: user._id }, { patientId: user._id }]
      })
      .sort({ appointmentDate: -1, createdAt: -1 })
      .limit(3)
      .populate("doctorId doctor_id", "name specialty")
      .lean();

      if (!appointments || appointments.length === 0) {
        const msg = lang === "bangla"
          ? "আপনার কোনো আসন্ন বা অতীত অ্যাপয়েন্টমেন্ট পাওয়া যায়নি। আপনি নতুন অ্যাপয়েন্টমেন্ট বুক করতে পারেন।"
          : lang === "banglish"
          ? "Apnar kono scheduled appointment pawa jayni. Niramoy e notun appointment book korte paren."
          : "You have no scheduled appointments on file. You can easily book a consultation today.";

        return {
          success: true,
          reply: msg,
          entities: [],
          suggestedActions: [{ label: "Book Doctor Appointment", link: "/doctors" }]
        };
      }

      const entities = appointments.map(appt => {
        const doctor = appt.doctorId || appt.doctor_id || {};
        const dateStr = appt.appointmentDate ? new Date(appt.appointmentDate).toLocaleDateString() : (appt.appointment_date || "Upcoming");
        return {
          type: "appointment",
          title: `Dr. ${doctor.name || "Attending Physician"}`,
          subtitle: `${doctor.specialty || "Specialist"} • Serial: ${appt.serialNumber || "Confirmed"}`,
          details: `Date: ${dateStr} • Time: ${appt.time_slot || appt.startTime || "Scheduled"} • Status: ${appt.status || "CONFIRMED"}`,
          actionLabel: "View in Dashboard",
          link: "/dashboard"
        };
      });

      const reply = lang === "bangla"
        ? `আপনার সাম্প্রতিক অ্যাপয়েন্টমেন্টের বিবরণ নিচে দেওয়া হলো:`
        : lang === "banglish"
        ? `Apnar scheduled appointment er details dewa holo:`
        : `Here are your scheduled appointments on Niramoy:`;

      return {
        success: true,
        reply,
        entities,
        suggestedActions: [
          { label: "Patient Dashboard", link: "/dashboard" },
          { label: "Book New Appointment", link: "/doctors" }
        ]
      };
    } catch (err) {
      return {
        success: true,
        reply: "Could not retrieve your appointments at this time.",
        entities: [],
        suggestedActions: [{ label: "Patient Dashboard", link: "/dashboard" }]
      };
    }
  }

  // ─── PRIVATE USER DATA: PRESCRIPTIONS ──────────────────────────────────────
  async getMyPrescriptionsTool(user, lang) {
    try {
      const prescriptions = await Prescription.find({ patient_id: user._id })
        .sort({ createdAt: -1 })
        .limit(3)
        .lean();

      if (!prescriptions || prescriptions.length === 0) {
        const msg = lang === "bangla"
          ? "আপনার কোনো ডিজিটাল প্রেসক্রিপশন পাওয়া যায়নি।"
          : lang === "banglish"
          ? "Apnar account e kono digital prescription pawa jayni."
          : "You have no digital prescriptions registered under your account.";

        return {
          success: true,
          reply: msg,
          entities: [],
          suggestedActions: [{ label: "Patient Dashboard", link: "/dashboard" }]
        };
      }

      const entities = prescriptions.map(rx => {
        const medCount = rx.medicines ? rx.medicines.length : 0;
        const medsSummary = (rx.medicines || []).slice(0, 2).map(m => m.medicine_name).join(", ");
        return {
          type: "prescription",
          title: `Rx: ${rx.prescription_number}`,
          subtitle: `Doctor: ${rx.doctor_name || "Specialist"} • ${medCount} medicine(s)`,
          details: `Diagnosis: ${rx.diagnosis || "Consultation"} • Medicines: ${medsSummary || "Check details"}`,
          actionLabel: "View Full Rx",
          link: "/dashboard"
        };
      });

      const reply = lang === "bangla"
        ? `আপনার ডিজিটাল প্রেসক্রিপশন রেকর্ড নিচে দেওয়া হলো:`
        : lang === "banglish"
        ? `Apnar digital prescription records niche dewa holo:`
        : `Here are your verified digital prescriptions:`;

      return {
        success: true,
        reply,
        entities,
        suggestedActions: [{ label: "Open Dashboard", link: "/dashboard" }]
      };
    } catch (err) {
      return {
        success: true,
        reply: "Could not load prescriptions right now.",
        entities: [],
        suggestedActions: [{ label: "Patient Dashboard", link: "/dashboard" }]
      };
    }
  }

  // ─── PRIVATE USER DATA: ORDERS ─────────────────────────────────────────────
  async getMyOrdersTool(user, lang) {
    try {
      const orders = await PharmacyOrder.find({ patient_id: user._id })
        .sort({ createdAt: -1 })
        .limit(3)
        .lean();

      if (!orders || orders.length === 0) {
        return {
          success: true,
          reply: "You have no active or previous medicine orders.",
          entities: [],
          suggestedActions: [{ label: "Order Medicines", link: "/medicine" }]
        };
      }

      const entities = orders.map(o => ({
        type: "order",
        title: `Order #${o.order_number || o._id.toString().slice(-6).toUpperCase()}`,
        subtitle: `Total: ৳${o.total_amount || 0} • Status: ${o.status || "PROCESSING"}`,
        details: `Delivery: ${o.delivery_address || "Rajshahi"}`,
        actionLabel: "Track Order",
        link: "/dashboard"
      }));

      return {
        success: true,
        reply: "Here are your recent pharmacy medicine orders:",
        entities,
        suggestedActions: [{ label: "Patient Dashboard", link: "/dashboard" }]
      };
    } catch (err) {
      return {
        success: true,
        reply: "Unable to retrieve orders at this time.",
        entities: [],
        suggestedActions: [{ label: "Patient Dashboard", link: "/dashboard" }]
      };
    }
  }

  // ─── PRIVATE USER DATA: PROFILE ────────────────────────────────────────────
  async getMyProfileTool(user, lang) {
    const maskedPhone = user.phone ? user.phone.replace(/(\d{3})\d{4}(\d{4})/, "$1****$2") : "Not set";
    const maskedEmail = user.email ? user.email.replace(/(.{2})(.*)(@.*)/, "$1***$3") : "Not set";

    const reply = lang === "bangla"
      ? `আপনার প্রোফাইল তথ্য: নাম: ${user.name}, মোবাইল: ${maskedPhone}, ইমেইল: ${maskedEmail}, রক্তের গ্রুপ: ${user.blood_group || "নির্ধারিত নয়"}।`
      : `Profile: Name: ${user.name}, Contact: ${maskedPhone}, Email: ${maskedEmail}, Blood Group: ${user.blood_group || "Not set"}.`;

    return {
      success: true,
      reply,
      entities: [],
      suggestedActions: [{ label: "Edit Profile", link: "/dashboard" }]
    };
  }

  // ─── PLATFORM GUIDANCE & HOW-TO ────────────────────────────────────────────
  getPlatformGuidanceTool(query, lang) {
    const lower = query.toLowerCase();

    if (lower.includes("appointment") || lower.includes("booking")) {
      if (lang === "bangla") {
        return {
          success: true,
          reply: "Niramoy-তে ডাক্তার অ্যাপয়েন্টমেন্ট বুক করার নিয়ম:\n1. 'ডাক্তার' ট্যাবে গিয়ে আপনার প্রয়োজনীয় বিশেষজ্ঞ ডাক্তার খুঁজুন।\n2. ডাক্তারের প্রোফাইলে গিয়ে পছন্দের শাখা (চেম্বার) এবং সময় নির্বাচন করুন।\n3. 'বুক অ্যাপয়েন্টমেন্ট' বাটনে ক্লিক করে পেমেন্ট সম্পন্ন করুন এবং আপনার ডিজিটাল সিরিয়াল স্লিপ ডাউনলোড করুন।",
          entities: [],
          suggestedActions: [{ label: "ডাক্তার খুঁজুন", link: "/doctors" }]
        };
      } else if (lang === "banglish") {
        return {
          success: true,
          reply: "Niramoy e doctor appointment newar niyom:\n1. 'Doctors' page e giye specialty ba doctor search korun.\n2. Doctor Profile e branch o date/slot select korun.\n3. 'Book Appointment' e click kore payment confirm korun o serial voucher paben.",
          entities: [],
          suggestedActions: [{ label: "Search Doctors", link: "/doctors" }]
        };
      } else {
        return {
          success: true,
          reply: "To book a doctor appointment on Niramoy:\n1. Visit the 'Doctors' directory to find a verified specialist.\n2. Select your preferred chamber branch, date, and time slot.\n3. Confirm with secure online checkout to receive your guaranteed serial token voucher.",
          entities: [],
          suggestedActions: [{ label: "Book Appointment", link: "/doctors" }]
        };
      }
    }

    if (lower.includes("portal") || lower.includes("login") || lower.includes("sign in")) {
      if (lang === "bangla") {
        return {
          success: true,
          reply: "পেশেন্ট পোর্টালে ঢুকতে উপরে ডানপাশের 'Enter Portal' বাটনে ক্লিক করুন। আপনার মোবাইল নম্বর বা ইমেইল এবং পাসওয়ার্ড দিয়ে প্রবেশ করতে পারবেন। নতুন হলে 'Become a Member' বাটনে ক্লিক করে ওটিপি দিয়ে অ্যাকাউন্ট খুলুন।",
          entities: [],
          suggestedActions: [
            { label: "Enter Portal (প্রবেশ করুন)", link: "/signin" },
            { label: "Become a Member (সদস্য হোন)", link: "/register" }
          ]
        };
      } else {
        return {
          success: true,
          reply: "To access the Patient Portal, click 'Enter Portal' in the top navigation bar. If you are new to Niramoy, select 'Become a Member' to sign up with verified Email/Phone OTP.",
          entities: [],
          suggestedActions: [
            { label: "Enter Portal", link: "/signin" },
            { label: "Become a Member", link: "/register" }
          ]
        };
      }
    }

    if (lower.includes("medicine") || lower.includes("order")) {
      return {
        success: true,
        reply: "To order medicine: Browse our 'Medicine' directory, search by brand or generic name, add required strips/bottles to cart, and check out with home delivery across Rajshahi.",
        entities: [],
        suggestedActions: [{ label: "Browse Medicines", link: "/medicine" }]
      };
    }

    return {
      success: true,
      reply: "Niramoy brings smart healthcare to Rajshahi: verified doctor chambers, hospital bed telemetry, digital prescriptions, licensed pharmacy delivery, and 24/7 ambulance dispatch.",
      entities: [],
      suggestedActions: [
        { label: "Find Doctors", link: "/doctors" },
        { label: "Emergency Ambulance", link: "/ambulance" }
      ]
    };
  }

  // ─── GENERAL HEALTH GUIDANCE ───────────────────────────────────────────────
  getGeneralHealthGuidance(query, lang) {
    if (lang === "bangla") {
      return {
        success: true,
        reply: "ধন্যবাদ আপনার প্রশ্নের জন্য। যেকোনো শারীরিক অসুস্থতায় নিজে নিজে অ্যান্টিবায়োটিক বা অতিরিক্ত ব্যথানাশক খাওয়া থেকে বিরত থাকুন। সঠিক রোগ নির্ণয়ের জন্য আমাদের নিবন্ধিত বিশেষজ্ঞ চিকিৎসকের পরামর্শ নিন।",
        entities: [],
        suggestedActions: [
          { label: "ডাক্তারের পরামর্শ নিন", link: "/doctors" },
          { label: "স্বাস্থ্য পরামর্শ পড়ুন", link: "/health-tips" }
        ]
      };
    } else if (lang === "banglish") {
      return {
        success: true,
        reply: "Thank you apnar query er jonno. Sothik diagnosis er jonno BMDC registered doctor er consultation newa uchit. Niramoy e specialized doctor খুজে booking nite paren.",
        entities: [],
        suggestedActions: [
          { label: "Find Doctors", link: "/doctors" },
          { label: "Health Tips", link: "/health-tips" }
        ]
      };
    } else {
      return {
        success: true,
        reply: "Thank you for asking. While general wellness habits like hydration, balanced nutrition, and rest support recovery, a clinical physical evaluation is required for accurate medical diagnosis. How may I connect you with a physician in Rajshahi today?",
        entities: [],
        suggestedActions: [
          { label: "Consult a Doctor", link: "/doctors" },
          { label: "Explore Health Tips", link: "/health-tips" }
        ]
      };
    }
  }
}

module.exports = new AiService();
