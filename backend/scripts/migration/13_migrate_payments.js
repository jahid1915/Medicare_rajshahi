/**
 * STEP 13 — Migrate Payments (36 documents)
 */

module.exports = async function step13_payments(db, supabase) {
  const payments = await db.collection("payments").find({}).toArray();
  console.log(`Found ${payments.length} payments in MongoDB`);

  let migrated = 0, skipped = 0, failed = 0;

  for (const p of payments) {
    const mongoId = p._id.toString();

    const { data: existing } = await supabase
      .from("migration_id_map")
      .select("supabase_id")
      .eq("entity_type", "payment")
      .eq("mongodb_id", mongoId)
      .single();

    if (existing) { skipped++; continue; }

    const patientMongoId = (p.patient_id || p.patientId)?.toString();
    const aptMongoId     = (p.appointment_id || p.appointmentId)?.toString();

    const { data: patientMap } = patientMongoId ? await supabase
      .from("migration_id_map").select("supabase_id")
      .eq("entity_type", "user").eq("mongodb_id", patientMongoId).single() : { data: null };

    const { data: aptMap } = aptMongoId ? await supabase
      .from("migration_id_map").select("supabase_id")
      .eq("entity_type", "appointment").eq("mongodb_id", aptMongoId).single() : { data: null };

    if (!patientMap) {
      console.warn(`  ⚠️ Payment ${mongoId}: patient not mapped — skipping`);
      skipped++;
      continue;
    }

    const row = {
      legacy_mongodb_id:      mongoId,
      payment_number:         p.payment_number || null,
      patient_id:             patientMap.supabase_id,
      appointment_id:         aptMap?.supabase_id || null,
      amount:                 p.amount,
      currency:               p.currency || "BDT",
      gateway:                p.gateway || "sslcommerz",
      method:                 p.method || null,
      transaction_id:         p.transaction_id || null,
      gateway_transaction_id: p.gateway_transaction_id || null,
      session_key:            p.session_key || null,
      validation_id:          p.validation_id || null,
      bank_transaction_id:    p.bank_transaction_id || null,
      risk_level:             p.risk_level || "0",
      idempotency_key:        p.idempotency_key || null,
      status:                 p.status || "initiated",
      gateway_response:       p.gateway_response || null,
      raw_gateway_reference:  p.raw_gateway_reference || null,
      service_type:           p.service_type || "doctor_appointment",
      customer_name:          p.customer_name || null,
      customer_phone:         p.customer_phone || null,
      customer_email:         p.customer_email || null,
      paid_at:                p.paid_at ? new Date(p.paid_at).toISOString() : null,
      failed_at:              p.failed_at ? new Date(p.failed_at).toISOString() : null,
      failure_reason:         p.failure_reason || null,
      status_history:         p.status_history || [],
      created_at:             p.createdAt ? new Date(p.createdAt).toISOString() : new Date().toISOString(),
      updated_at:             p.updatedAt ? new Date(p.updatedAt).toISOString() : new Date().toISOString(),
    };

    const { data: inserted, error } = await supabase
      .from("payments")
      .insert(row)
      .select("id")
      .single();

    if (error) {
      if (error.code === "23505") {
        console.warn(`  ⚠️ Duplicate payment ${p.payment_number}: ${error.message}`);
        skipped++;
      } else {
        console.error(`  ❌ Failed payment ${mongoId}: ${error.message}`);
        failed++;
      }
      continue;
    }

    await supabase.from("migration_id_map").insert({
      entity_type: "payment",
      mongodb_id: mongoId,
      supabase_id: inserted.id
    });

    // Update appointment.payment_id if applicable
    if (aptMap?.supabase_id) {
      await supabase
        .from("appointments")
        .update({ payment_id: inserted.id })
        .eq("id", aptMap.supabase_id);
    }

    console.log(`  ✅ Payment ${p.payment_number || mongoId} — ${p.status} — ${p.amount} BDT`);
    migrated++;
  }

  console.log(`\nPayments: ${migrated} migrated, ${skipped} skipped, ${failed} failed`);
  return { migrated, skipped, failed };
};
