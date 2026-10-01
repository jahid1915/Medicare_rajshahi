/**
 * STEP 19 — Migrate OTP Verifications (66 documents)
 * 
 * NOTE: Most OTP records are likely expired. We migrate them for completeness
 * but do NOT recommend using them — new OTPs will be fresh.
 * Expired OTPs are harmless since otp_hash is bcrypt/crypto — not reversible.
 */

module.exports = async function step19_otpVerifications(db, supabase) {
  const otps = await db.collection("otpverifications").find({}).toArray();
  console.log(`Found ${otps.length} OTP verification records in MongoDB`);

  const now = new Date();
  let migrated = 0, skipped = 0, failed = 0, expired = 0;

  for (const o of otps) {
    const mongoId = o._id.toString();

    const { data: existing } = await supabase
      .from("migration_id_map")
      .select("supabase_id")
      .eq("entity_type", "otpverification")
      .eq("mongodb_id", mongoId)
      .single();

    if (existing) { skipped++; continue; }

    const isExpired = o.expires_at && new Date(o.expires_at) < now;
    if (isExpired) {
      expired++;
      // Still migrate for record keeping but note expiry
    }

    const row = {
      legacy_mongodb_id: mongoId,
      email:             o.email || null,
      phone:             o.phone || null,
      otp_hash:          o.otp_hash,     // hashed — not reversible, safe to store
      purpose:           o.purpose || "PATIENT_SIGNUP",
      expires_at:        o.expires_at ? new Date(o.expires_at).toISOString() : new Date(now.getTime() - 1).toISOString(),
      attempt_count:     Math.min(o.attempt_count || 0, 10),
      resend_count:      o.resend_count || 0,
      last_resend_at:    o.last_resend_at ? new Date(o.last_resend_at).toISOString() : new Date().toISOString(),
      verified:          o.verified || false,
      metadata:          o.metadata || {},
      created_at:        o.createdAt ? new Date(o.createdAt).toISOString() : new Date().toISOString(),
      updated_at:        o.updatedAt ? new Date(o.updatedAt).toISOString() : new Date().toISOString(),
    };

    const { data: inserted, error } = await supabase
      .from("otp_verifications")
      .insert(row)
      .select("id")
      .single();

    if (error) {
      console.error(`  ❌ Failed OTP ${mongoId}: ${error.message}`);
      failed++;
      continue;
    }

    await supabase.from("migration_id_map").insert({
      entity_type: "otpverification",
      mongodb_id: mongoId,
      supabase_id: inserted.id
    });

    migrated++;
  }

  console.log(`  Note: ${expired} of ${otps.length} OTP records were already expired (migrated for audit trail only)`);
  console.log(`\nOTP Verifications: ${migrated} migrated, ${skipped} skipped, ${failed} failed`);
  return { migrated, skipped, failed };
};
