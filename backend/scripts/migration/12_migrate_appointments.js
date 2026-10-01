/**
 * STEP 12 — Migrate Appointments (29 documents)
 */

module.exports = async function step12_appointments(db, supabase) {
  const appointments = await db.collection("appointments").find({}).toArray();
  console.log(`Found ${appointments.length} appointments in MongoDB`);

  let migrated = 0, skipped = 0, failed = 0;

  for (const a of appointments) {
    const mongoId = a._id.toString();

    const { data: existing } = await supabase
      .from("migration_id_map")
      .select("supabase_id")
      .eq("entity_type", "appointment")
      .eq("mongodb_id", mongoId)
      .single();

    if (existing) { skipped++; continue; }

    // Resolve FKs
    const patientMongoId = (a.patientId || a.patient_id)?.toString();
    const doctorMongoId  = (a.doctorId  || a.doctor_id)?.toString();
    const branchMongoId  = (a.branchId  || a.branch_id)?.toString();

    const { data: patientMap } = patientMongoId ? await supabase
      .from("migration_id_map").select("supabase_id")
      .eq("entity_type", "user").eq("mongodb_id", patientMongoId).single() : { data: null };

    const { data: doctorMap } = doctorMongoId ? await supabase
      .from("migration_id_map").select("supabase_id")
      .eq("entity_type", "doctor").eq("mongodb_id", doctorMongoId).single() : { data: null };

    const { data: branchMap } = branchMongoId ? await supabase
      .from("migration_id_map").select("supabase_id")
      .eq("entity_type", "doctorbranch").eq("mongodb_id", branchMongoId).single() : { data: null };

    if (!patientMap || !doctorMap) {
      console.warn(`  ⚠️ Appointment ${mongoId}: patient or doctor not mapped — skipping`);
      skipped++;
      continue;
    }

    const aptDate = a.appointmentDate || a.appointment_date;

    const row = {
      legacy_mongodb_id:    mongoId,
      appointment_id:       a.appointmentId || null,
      serial_number:        a.serialNumber || null,
      patient_id:           patientMap.supabase_id,
      doctor_id:            doctorMap.supabase_id,
      branch_id:            branchMap?.supabase_id || null,
      chamber_index:        a.chamber_index || 0,
      appointment_date:     aptDate ? new Date(aptDate).toISOString().split("T")[0] : new Date().toISOString().split("T")[0],
      start_time:           a.startTime || null,
      end_time:             a.endTime || null,
      time_slot:            a.time_slot || a.startTime || "",
      appointment_type:     a.appointmentType || "Online Consultation",
      consultation_type:    a.consultation_type || "in_person",
      consultation_fee:     a.consultationFee || a.consultation_fee || 800,
      currency:             a.currency || "BDT",
      status:               a.status || "PENDING_PAYMENT",
      payment_status:       a.paymentStatus || "UNPAID",
      ssl_transaction_id:   a.sslTransactionId || null,
      hold_expires_at:      a.holdExpiresAt ? new Date(a.holdExpiresAt).toISOString() : null,
      email_delivery_status:a.emailDeliveryStatus || "PENDING",
      pdf_url:              a.pdfUrl || null,
      patient_name:         a.patientName || a.patient_name || null,
      patient_email:        a.patientEmail || null,
      patient_phone:        a.patientPhone || a.patient_phone || null,
      gender:               a.gender || null,
      age:                  a.age || null,
      address:              a.address || null,
      emergency_contact:    a.emergencyContact || null,
      blood_group:          a.bloodGroup || null,
      consultation_reason:  a.consultationReason || null,
      family_member_name:   a.family_member_name || null,
      symptoms:             a.symptoms || null,
      ai_triage_summary:    a.ai_triage_summary || null,
      doctor_notes:         a.doctor_notes || null,
      cancelled_at:         a.cancelled_at ? new Date(a.cancelled_at).toISOString() : null,
      cancel_reason:        a.cancel_reason || null,
      completed_at:         a.completed_at ? new Date(a.completed_at).toISOString() : null,
      created_at:           a.createdAt ? new Date(a.createdAt).toISOString() : new Date().toISOString(),
      updated_at:           a.updatedAt ? new Date(a.updatedAt).toISOString() : new Date().toISOString(),
    };

    const { data: inserted, error } = await supabase
      .from("appointments")
      .insert(row)
      .select("id")
      .single();

    if (error) {
      console.error(`  ❌ Failed appointment ${mongoId}: ${error.message}`);
      failed++;
      continue;
    }

    await supabase.from("migration_id_map").insert({
      entity_type: "appointment",
      mongodb_id: mongoId,
      supabase_id: inserted.id
    });

    console.log(`  ✅ Appointment ${a.appointmentId || mongoId} — ${a.status}`);
    migrated++;
  }

  console.log(`\nAppointments: ${migrated} migrated, ${skipped} skipped, ${failed} failed`);
  return { migrated, skipped, failed };
};
