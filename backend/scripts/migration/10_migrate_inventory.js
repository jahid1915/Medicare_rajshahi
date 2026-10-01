/**
 * STEP 10 — Migrate Pharmacy Inventories (133 documents)
 */

module.exports = async function step10_inventory(db, supabase) {
  const inventories = await db.collection("pharmacyinventories").find({}).toArray();
  console.log(`Found ${inventories.length} pharmacy inventory records in MongoDB`);

  let migrated = 0, skipped = 0, failed = 0;

  for (const inv of inventories) {
    const mongoId = inv._id.toString();

    const { data: existing } = await supabase
      .from("migration_id_map")
      .select("supabase_id")
      .eq("entity_type", "pharmacyinventory")
      .eq("mongodb_id", mongoId)
      .single();

    if (existing) { skipped++; continue; }

    // Resolve pharmacy FK
    const { data: pharmMap } = await supabase
      .from("migration_id_map")
      .select("supabase_id")
      .eq("entity_type", "pharmacy")
      .eq("mongodb_id", inv.pharmacy_id?.toString())
      .single();

    if (!pharmMap) {
      console.warn(`  ⚠️ Inventory ${mongoId}: pharmacy not mapped — skipping`);
      skipped++;
      continue;
    }

    // Resolve medicine FK
    const { data: medMap } = await supabase
      .from("migration_id_map")
      .select("supabase_id")
      .eq("entity_type", "medicine")
      .eq("mongodb_id", inv.medicine_id?.toString())
      .single();

    if (!medMap) {
      console.warn(`  ⚠️ Inventory ${mongoId}: medicine not mapped — skipping`);
      skipped++;
      continue;
    }

    // Calculate available_quantity
    const stock = inv.stock_quantity || 0;
    const reserved = inv.reserved_quantity || 0;
    const available = Math.max(0, stock - reserved);

    const row = {
      legacy_mongodb_id:  mongoId,
      pharmacy_id:        pharmMap.supabase_id,
      medicine_id:        medMap.supabase_id,
      stock_quantity:     stock,
      reserved_quantity:  reserved,
      available_quantity: available,
      unit_price:         inv.unit_price || 0,
      discounted_price:   inv.discounted_price || null,
      batch_number:       inv.batch_number || "",
      expiry_date:        inv.expiry_date ? new Date(inv.expiry_date).toISOString().split("T")[0] : null,
      in_stock:           inv.in_stock !== false,
      reorder_level:      inv.reorder_level || 20,
      stock_status:       inv.stock_status || "IN_STOCK",
      demand_trend:       inv.demand_trend || "Stable",
      trend_reason:       inv.trend_reason || "",
      risk_level:         inv.risk_level || "Normal",
      is_active:          inv.is_active !== false,
      created_at:         inv.createdAt ? new Date(inv.createdAt).toISOString() : new Date().toISOString(),
      updated_at:         inv.updatedAt ? new Date(inv.updatedAt).toISOString() : new Date().toISOString(),
    };

    const { data: inserted, error } = await supabase
      .from("pharmacy_inventories")
      .insert(row)
      .select("id")
      .single();

    if (error) {
      if (error.code === "23505") {
        // Unique violation (pharmacy_id + medicine_id) — already exists
        skipped++;
      } else {
        console.error(`  ❌ Failed inventory ${mongoId}: ${error.message}`);
        failed++;
      }
      continue;
    }

    await supabase.from("migration_id_map").insert({
      entity_type: "pharmacyinventory",
      mongodb_id: mongoId,
      supabase_id: inserted.id
    });

    migrated++;
    if (migrated % 20 === 0) {
      process.stdout.write(`\r  Progress: ${migrated} inventory records migrated...`);
    }
  }

  console.log(`\nPharmacy Inventories: ${migrated} migrated, ${skipped} skipped, ${failed} failed`);
  return { migrated, skipped, failed };
};
