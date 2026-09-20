const mongoose = require("mongoose");
const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../.env") });

const User = require("../models/User");
const Hospital = require("../models/Hospital");
const Pharmacy = require("../models/Pharmacy");
const Payment = require("../models/Payment");

async function seed() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("Connected to MongoDB for Demo & Transactions seeding...");

  // Find RMCH hospital
  const rmch = await Hospital.findOne({ name: /Rajshahi Medical College Hospital/i }) || await Hospital.findOne({});
  // Find Laxmipur pharmacy
  const pharmacy = await Pharmacy.findOne({ area: /Laxmipur/i }) || await Pharmacy.findOne({});

  // 1. Create or update Demo Users
  const demoUsers = [
    {
      name: "Platform Super Admin",
      email: "admin@niramoy.health",
      phone: "+8801711000001",
      password: "Admin@123456",
      role: "super_admin",
      is_active: true,
      is_verified: true
    },
    {
      name: "Dr. Farhana Ahmed (RMCH Admin)",
      email: "hospital.admin@niramoy.health",
      phone: "+8801711000002",
      password: "Hospital@123456",
      role: "hospital_admin",
      hospital_id: rmch ? rmch._id : null,
      is_active: true,
      is_verified: true
    },
    {
      name: "Mahbubur Rahman (Pharmacy Owner)",
      email: "pharmacy.owner@niramoy.health",
      phone: "+8801711000003",
      password: "Pharmacy@123456",
      role: "pharmacy_owner",
      pharmacy_id: pharmacy ? pharmacy._id : null,
      is_active: true,
      is_verified: true
    },
    {
      name: "Prof. Dr. Md. Jahangir Kabir",
      email: "doctor@niramoy.health",
      phone: "+8801711000004",
      password: "Doctor@123456",
      role: "doctor",
      hospital_id: rmch ? rmch._id : null,
      is_active: true,
      is_verified: true
    },
    {
      name: "Tahmidur Rahman (Patient)",
      email: "patient@niramoy.health",
      phone: "+8801711000005",
      password: "Patient@123456",
      role: "patient",
      gender: "male",
      blood_group: "B+",
      address: "Kazihata, Rajshahi",
      is_active: true,
      is_verified: true
    }
  ];

  for (const u of demoUsers) {
    const existing = await User.findOne({ email: u.email });
    if (!existing) {
      const created = await User.create(u);
      console.log(`Created demo user: ${u.email} (${u.role})`);
      if (u.role === "pharmacy_owner" && pharmacy) {
        await Pharmacy.findByIdAndUpdate(pharmacy._id, { owner_id: created._id });
      }
    } else {
      console.log(`User already exists: ${u.email}`);
    }
  }

  const patient = await User.findOne({ email: "patient@niramoy.health" });

  // 2. Seed realistic platform transactions if empty or minimal
  const paymentCount = await Payment.countDocuments();
  if (paymentCount < 5) {
    console.log("Seeding realistic platform transactions with transition histories...");

    const sampleTransactions = [
      {
        payment_number: "PAY-20260920-8421",
        patient_id: patient._id,
        amount: 800,
        currency: "BDT",
        gateway: "sslcommerz",
        method: "bkash",
        service_type: "doctor_appointment",
        hospital_id: rmch ? rmch._id : null,
        customer_name: "Tahmidur Rahman",
        customer_phone: "01711000005",
        customer_email: "patient@niramoy.health",
        transaction_id: "TXN-BKS-99382104",
        gateway_transaction_id: "SSL-VAL-294819",
        status: "successful",
        paid_at: new Date(Date.now() - 3600000 * 4),
        status_history: [
          {
            from_status: null,
            to_status: "initiated",
            changed_at: new Date(Date.now() - 3600000 * 4.5),
            actor_role: "patient",
            actor_name: "Tahmidur Rahman",
            note: "Patient initiated doctor appointment payment via bKash"
          },
          {
            from_status: "initiated",
            to_status: "pending",
            changed_at: new Date(Date.now() - 3600000 * 4.4),
            actor_role: "system",
            actor_name: "Payment Gateway",
            note: "Redirected to bKash PGW. Session token generated."
          },
          {
            from_status: "pending",
            to_status: "processing",
            changed_at: new Date(Date.now() - 3600000 * 4.2),
            actor_role: "gateway_webhook",
            actor_name: "bKash IPN Callback",
            note: "Customer PIN and OTP verified on mobile payment terminal"
          },
          {
            from_status: "processing",
            to_status: "successful",
            changed_at: new Date(Date.now() - 3600000 * 4),
            actor_role: "system",
            actor_name: "SSLCommerz Validator",
            note: "Payment settled successfully. Appointment ticket #APT-9048 confirmed.",
            gateway_ref: "SSL-VAL-294819"
          }
        ]
      },
      {
        payment_number: "PAY-20260920-7712",
        patient_id: patient._id,
        amount: 1450,
        currency: "BDT",
        gateway: "sslcommerz",
        method: "nagad",
        service_type: "pharmacy_order",
        pharmacy_id: pharmacy ? pharmacy._id : null,
        customer_name: "Nazmul Huda",
        customer_phone: "01812993812",
        customer_email: "nazmul.raj@gmail.com",
        transaction_id: "TXN-NGD-4481029",
        gateway_transaction_id: "SSL-VAL-883192",
        status: "successful",
        paid_at: new Date(Date.now() - 3600000 * 8),
        status_history: [
          {
            from_status: null,
            to_status: "initiated",
            changed_at: new Date(Date.now() - 3600000 * 8.3),
            actor_role: "patient",
            actor_name: "Nazmul Huda",
            note: "Medicine order cart checkout for Laxmipur Pharmacy delivery"
          },
          {
            from_status: "initiated",
            to_status: "pending",
            changed_at: new Date(Date.now() - 3600000 * 8.2),
            actor_role: "system",
            actor_name: "SSLCommerz Engine",
            note: "Nagad direct checkout endpoint dispatched"
          },
          {
            from_status: "pending",
            to_status: "successful",
            changed_at: new Date(Date.now() - 3600000 * 8),
            actor_role: "gateway_webhook",
            actor_name: "Nagad Webhook IPN",
            note: "Instant settlement confirmed. Pharmacy order #RX-491 dispatched for preparation.",
            gateway_ref: "SSL-VAL-883192"
          }
        ]
      },
      {
        payment_number: "PAY-20260920-6531",
        patient_id: patient._id,
        amount: 3500,
        currency: "BDT",
        gateway: "sslcommerz",
        method: "card",
        service_type: "hospital_admission",
        hospital_id: rmch ? rmch._id : null,
        customer_name: "Begum Rokeya",
        customer_phone: "01720394819",
        customer_email: "rokeya.family@yahoo.com",
        transaction_id: "TXN-VISA-9912048",
        gateway_transaction_id: "SSL-VAL-118204",
        status: "successful",
        paid_at: new Date(Date.now() - 3600000 * 14),
        status_history: [
          {
            from_status: null,
            to_status: "initiated",
            changed_at: new Date(Date.now() - 3600000 * 14.5),
            actor_role: "patient",
            actor_name: "Begum Rokeya",
            note: "Hospital Bed & Cabin advance deposit initiated for RMCH admission"
          },
          {
            from_status: "initiated",
            to_status: "pending",
            changed_at: new Date(Date.now() - 3600000 * 14.3),
            actor_role: "system",
            actor_name: "Payment Gateway",
            note: "3D-Secure 2.0 card authentication initiated via City Bank VISA"
          },
          {
            from_status: "pending",
            to_status: "processing",
            changed_at: new Date(Date.now() - 3600000 * 14.1),
            actor_role: "system",
            actor_name: "VISA 3DS Server",
            note: "Cardholder OTP validated via bank gateway"
          },
          {
            from_status: "processing",
            to_status: "successful",
            changed_at: new Date(Date.now() - 3600000 * 14),
            actor_role: "system",
            actor_name: "Hospital Financial Gateway",
            note: "Advance room reservation fee captured. RMCH Cabin #C-204 locked.",
            gateway_ref: "SSL-VAL-118204"
          }
        ]
      },
      {
        payment_number: "PAY-20260920-5209",
        patient_id: patient._id,
        amount: 600,
        currency: "BDT",
        gateway: "sslcommerz",
        method: "bkash",
        service_type: "doctor_appointment",
        hospital_id: rmch ? rmch._id : null,
        customer_name: "Sadia Afrin",
        customer_phone: "01918239012",
        customer_email: "sadia.afrin@outlook.com",
        transaction_id: "TXN-BKS-2201948",
        status: "failed",
        failed_at: new Date(Date.now() - 3600000 * 20),
        failure_reason: "User cancelled session on bKash authentication page",
        status_history: [
          {
            from_status: null,
            to_status: "initiated",
            changed_at: new Date(Date.now() - 3600000 * 20.3),
            actor_role: "patient",
            actor_name: "Sadia Afrin",
            note: "Consultation appointment booking initiated"
          },
          {
            from_status: "initiated",
            to_status: "pending",
            changed_at: new Date(Date.now() - 3600000 * 20.2),
            actor_role: "system",
            actor_name: "Payment Gateway",
            note: "Waiting for user authentication on mobile wallet screen"
          },
          {
            from_status: "pending",
            to_status: "failed",
            changed_at: new Date(Date.now() - 3600000 * 20),
            actor_role: "system",
            actor_name: "SSLCommerz Failure Handler",
            note: "User cancelled session on bKash authentication page"
          }
        ]
      },
      {
        payment_number: "PAY-20260920-4102",
        patient_id: patient._id,
        amount: 1200,
        currency: "BDT",
        gateway: "sslcommerz",
        method: "nagad",
        service_type: "doctor_appointment",
        hospital_id: rmch ? rmch._id : null,
        customer_name: "Kamrul Hasan",
        customer_phone: "01739201948",
        customer_email: "kamrul.hasan@gmail.com",
        transaction_id: "TXN-NGD-9912401",
        gateway_transaction_id: "SSL-VAL-339182",
        status: "refunded",
        paid_at: new Date(Date.now() - 3600000 * 28),
        status_history: [
          {
            from_status: null,
            to_status: "initiated",
            changed_at: new Date(Date.now() - 3600000 * 29),
            actor_role: "patient",
            actor_name: "Kamrul Hasan",
            note: "Doctor consultation booked with visiting chamber"
          },
          {
            from_status: "initiated",
            to_status: "pending",
            changed_at: new Date(Date.now() - 3600000 * 28.8),
            actor_role: "system",
            actor_name: "Payment Gateway",
            note: "Nagad redirect active"
          },
          {
            from_status: "pending",
            to_status: "successful",
            changed_at: new Date(Date.now() - 3600000 * 28.5),
            actor_role: "gateway_webhook",
            actor_name: "Nagad Webhook IPN",
            note: "Payment completed successfully",
            gateway_ref: "SSL-VAL-339182"
          },
          {
            from_status: "successful",
            to_status: "refunded",
            changed_at: new Date(Date.now() - 3600000 * 6),
            actor_role: "super_admin",
            actor_name: "Platform Super Admin",
            note: "Doctor emergency leave: Full refund of ৳1200 credited back to Nagad account #01739201948."
          }
        ]
      },
      {
        payment_number: "PAY-20260920-3011",
        patient_id: patient._id,
        amount: 2150,
        currency: "BDT",
        gateway: "sslcommerz",
        method: "bkash",
        service_type: "diagnostic_test",
        hospital_id: rmch ? rmch._id : null,
        customer_name: "Faridur Islam",
        customer_phone: "01788291039",
        customer_email: "farid.raj@gmail.com",
        transaction_id: "TXN-BKS-7719204",
        status: "processing",
        status_history: [
          {
            from_status: null,
            to_status: "initiated",
            changed_at: new Date(Date.now() - 3600000 * 0.8),
            actor_role: "patient",
            actor_name: "Faridur Islam",
            note: "Complete Blood Count + Lipid Profile test booking"
          },
          {
            from_status: "initiated",
            to_status: "pending",
            changed_at: new Date(Date.now() - 3600000 * 0.7),
            actor_role: "system",
            actor_name: "Payment Gateway",
            note: "Awaiting gateway confirmation"
          },
          {
            from_status: "pending",
            to_status: "processing",
            changed_at: new Date(Date.now() - 3600000 * 0.3),
            actor_role: "system",
            actor_name: "bKash Core Clearing",
            note: "Transaction received by bKash. Settlement reconciliation in progress."
          }
        ]
      },
      {
        payment_number: "PAY-20260920-1928",
        patient_id: patient._id,
        amount: 520,
        currency: "BDT",
        gateway: "cash",
        method: "cash",
        service_type: "pharmacy_order",
        pharmacy_id: pharmacy ? pharmacy._id : null,
        customer_name: "Md. Al-Amin",
        customer_phone: "01511203948",
        customer_email: "alamin.raj@gmail.com",
        status: "pending",
        status_history: [
          {
            from_status: null,
            to_status: "initiated",
            changed_at: new Date(Date.now() - 3600000 * 1.5),
            actor_role: "patient",
            actor_name: "Md. Al-Amin",
            note: "Cash on delivery selected for urgent prescription delivery"
          },
          {
            from_status: "initiated",
            to_status: "pending",
            changed_at: new Date(Date.now() - 3600000 * 1.4),
            actor_role: "system",
            actor_name: "Niramoy Dispatch Engine",
            note: "Awaiting physical cash collection by delivery courier"
          }
        ]
      }
    ];

    await Payment.insertMany(sampleTransactions);
    console.log(`Successfully seeded ${sampleTransactions.length} platform transactions with full status transition history.`);
  }

  console.log("Seeding finished successfully.");
  process.exit(0);
}

seed().catch(err => {
  console.error("Seeding failed:", err);
  process.exit(1);
});
