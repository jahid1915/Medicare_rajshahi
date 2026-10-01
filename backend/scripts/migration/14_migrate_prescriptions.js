/**
 * STEP 14 — Migrate Prescriptions (23 documents)
 * Also migrates embedded medicine items into prescription_items table.
 */

module.exports = async function step14_prescriptions(db, supabase) {
  const prescriptions = await db.collection("prescriptions").find({}).toArray();
  console.log(`Found ${prescriptions.length} prescriptions in MongoDB`);

  let migrated = 0, skipped = 0, failed = 0;

  for (const rx of prescriptions) {
    const mongoId = rx._id.toString();

    const { data: existing } = await supabase
      .from("migration_id_map")
      .select("supabase_id")
      .eq("entity_type", "prescription")
      .eq("mongodb_id", mongoId)
      .single();

    if (existing) { skipped++; continue; }

    // Resolve FKs
    const { data: patientMap } = rx.patient_id ? await supabase
      .from("migration_id_map").select("supabase_id")
      .eq("entity_type", "user").eq("mongodb_id", rx.patient_id.toString()).single() : { data: null };

    const { data: doctorMap } = rx.doctor_id ? await supabase
      .from("migration_id_map").select("supabase_id")
      .eq("entity_type", "doctor").eq("mongodb_id", rx.doctor_id.toString()).single() : { data: null };

    const { data: aptMap } = rx.appointment_id ? await supabase
      .from("migration_id_map").select("supabase_id")
      .eq("entity_type", "appointment").eq("mongodb_id", rx.appointment_id.toString()).single() : { data: null };

    if (!patientMap) {
      console.warn(`  ⚠️ Prescription ${mongoId}: patient not mapped — skipping`);
      skipped++;
      continue;
    }

    const row = {
      legacy_mongodb_id:    mongoId,
      prescription_number:  rx.prescription_number,
      patient_id:           patientMap.supabase_id,
      doctor_id:            doctorMap?.supabase_id || null,
      appointment_id:       aptMap?.supabase_id || null,
      appointment_number:   rx.appointment_number || "",
      doctor_name:          rx.doctor_name || "Attending Physician",
      doctor_specialization:rx.doctor_specialization || "General Medicine",
      doctor_bmdc_reg:      rx.doctor_bmdc_reg || "",
      hospital_name:        rx.hospital_name || "",
      diagnosis:            rx.diagnosis || "",
      chief_complaints:     rx.chief_complaints || "",
      vitals:               rx.vitals || {},
      tests_advised:        rx.tests_advised || [],
      advice:               rx.advice || "",
      follow_up_date:       rx.follow_up_date ? new Date(rx.follow_up_date).toISOString().split("T")[0] : null,
      file_url:             rx.file_url || null,
      source_type:          rx.source_type || "teleconsultation",
      is_verified:          rx.is_verified !== false,
      created_at:           rx.createdAt ? new Date(rx.createdAt).toISOString() : new Date().toISOString(),
      updated_at:           rx.updatedAt ? new Date(rx.updatedAt).toISOString() : new Date().toISOString(),
    };

    const { data: inserted, error } = await supabase
      .from("prescriptions")
      .insert(row)
      .select("id")
      .single();

    if (error) {
      if (error.code === "23505") {
        console.warn(`  ⚠️ Duplicate prescription ${rx.prescription_number}`);
        skipped++;
      } else {
        console.error(`  ❌ Failed prescription ${mongoId}: ${error.message}`);
        failed++;
      }
      continue;
    }

    await supabase.from("migration_id_map").insert({
      entity_type: "prescription",
      mongodb_id: mongoId,
      supabase_id: inserted.id
    });

    // Migrate embedded medicine items
    if (Array.isArray(rx.medicines) && rx.medicines.length > 0) {
      const itemRows = rx.medicines.map((med, i) => ({
        prescription_id: inserted.id,
        medicine_name:   med.medicine_name || "Unknown",
        generic_name:    med.generic_name || "",
        dosage:          med.dosage || "",
        duration:        med.duration || "",
        timing:          med.timing || "After meal",
        instructions:    med.instructions || "",
        display_order:   i
      }));
      await supabase.from("prescription_items").insert(itemRows);
    }

    console.log(`  ✅ Prescription ${rx.prescription_number}`);
    migrated++;
  }

  console.log(`\nPrescriptions: ${migrated} migrated, ${skipped} skipped, ${failed} failed`);
  return { migrated, skipped, failed };
};
