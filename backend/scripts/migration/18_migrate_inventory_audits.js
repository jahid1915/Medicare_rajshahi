/**
 * STEP 18 — Migrate Inventory Audits (24 documents)
 */

module.exports = async function step18_inventoryAudits(db, supabase) {
  const audits = await db.collection("inventoryaudits").find({}).toArray();
  console.log(`Found ${audits.length} inventory audits in MongoDB`);

  let migrated = 0, skipped = 0, failed = 0;

  for (const a of audits) {
    const mongoId = a._id.toString();

    const { data: existing } = await supabase
      .from("migration_id_map")
      .select("supabase_id")
      .eq("entity_type", "inventoryaudit")
      .eq("mongodb_id", mongoId)
      .single();

    if (existing) { skipped++; continue; }

    const { data: pharmMap } = a.pharmacyId ? await supabase
      .from("migration_id_map").select("supabase_id")
      .eq("entity_type", "pharmacy").eq("mongodb_id", a.pharmacyId.toString()).single() : { data: null };

    const { data: medMap } = a.medicineId ? await supabase
      .from("migration_id_map").select("supabase_id")
      .eq("entity_type", "medicine").eq("mongodb_id", a.medicineId.toString()).single() : { data: null };

    const { data: userMap } = a.userId ? await supabase
      .from("migration_id_map").select("supabase_id")
      .eq("entity_type", "user").eq("mongodb_id", a.userId.toString()).single() : { data: null };

    if (!pharmMap || !medMap) {
      console.warn(`  ⚠️ Inventory audit ${mongoId}: pharmacy or medicine not mapped — skipping`);
      skipped++;
      continue;
    }

    const row = {
      legacy_mongodb_id: mongoId,
      pharmacy_id:       pharmMap.supabase_id,
      medicine_id:       medMap.supabase_id,
      user_id:           userMap?.supabase_id || null,
      action:            a.action,
      previous_quantity: a.previousQuantity || 0,
      new_quantity:      a.newQuantity,
      batch_number:      a.batchNumber || "",
      reason:            a.reason || "",
      timestamp_at:      a.timestamp ? new Date(a.timestamp).toISOString() : new Date().toISOString(),
      created_at:        a.createdAt ? new Date(a.createdAt).toISOString() : new Date().toISOString(),
      updated_at:        a.updatedAt ? new Date(a.updatedAt).toISOString() : new Date().toISOString(),
    };

    const { data: inserted, error } = await supabase
      .from("inventory_audits")
      .insert(row)
      .select("id")
      .single();

    if (error) {
      console.error(`  ❌ Failed inventory audit ${mongoId}: ${error.message}`);
      failed++;
      continue;
    }

    await supabase.from("migration_id_map").insert({
      entity_type: "inventoryaudit",
      mongodb_id: mongoId,
      supabase_id: inserted.id
    });

    migrated++;
  }

  console.log(`\nInventory Audits: ${migrated} migrated, ${skipped} skipped, ${failed} failed`);
  return { migrated, skipped, failed };
};
