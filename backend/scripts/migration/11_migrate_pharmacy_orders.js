/**
 * STEP 11 — Migrate Pharmacy Orders (2 documents)
 * Also creates pharmacy_order_items from embedded arrays.
 */

module.exports = async function step11_pharmacyOrders(db, supabase) {
  const orders = await db.collection("pharmacyorders").find({}).toArray();
  console.log(`Found ${orders.length} pharmacy orders in MongoDB`);

  let migrated = 0, skipped = 0, failed = 0;

  for (const o of orders) {
    const mongoId = o._id.toString();

    const { data: existing } = await supabase
      .from("migration_id_map")
      .select("supabase_id")
      .eq("entity_type", "pharmacyorder")
      .eq("mongodb_id", mongoId)
      .single();

    if (existing) { skipped++; continue; }

    // Resolve patient FK
    const { data: patientMap } = await supabase
      .from("migration_id_map")
      .select("supabase_id")
      .eq("entity_type", "user")
      .eq("mongodb_id", o.patient_id?.toString())
      .single();

    // Resolve pharmacy FK
    const { data: pharmMap } = await supabase
      .from("migration_id_map")
      .select("supabase_id")
      .eq("entity_type", "pharmacy")
      .eq("mongodb_id", o.pharmacy_id?.toString())
      .single();

    if (!patientMap || !pharmMap) {
      console.warn(`  ⚠️ Order ${mongoId}: patient or pharmacy not mapped — skipping`);
      skipped++;
      continue;
    }

    const row = {
      legacy_mongodb_id:      mongoId,
      order_number:           o.order_number || `ORD-RX-${mongoId.slice(-8).toUpperCase()}`,
      patient_id:             patientMap.supabase_id,
      pharmacy_id:            pharmMap.supabase_id,
      prescription_required:  o.prescription_required || false,
      prescription_image:     o.prescription_image || null,
      prescription_verified:  o.prescription_verified || false,
      subtotal:               o.subtotal || 0,
      delivery_fee:           o.delivery_fee || 40,
      discount:               o.discount || 0,
      total_amount:           o.total_amount || 0,
      delivery_address:       o.delivery_address || {},
      delivery_type:          o.delivery_type || "home_delivery",
      payment_method:         o.payment_method || "cash_on_delivery",
      payment_status:         o.payment_status || "pending",
      status:                 o.status || "pending",
      timeline:               o.timeline || [],
      cancel_reason:          o.cancel_reason || "",
      notes:                  o.notes || "",
      created_at:             o.createdAt ? new Date(o.createdAt).toISOString() : new Date().toISOString(),
      updated_at:             o.updatedAt ? new Date(o.updatedAt).toISOString() : new Date().toISOString(),
    };

    const { data: inserted, error } = await supabase
      .from("pharmacy_orders")
      .insert(row)
      .select("id")
      .single();

    if (error) {
      console.error(`  ❌ Failed order ${mongoId}: ${error.message}`);
      failed++;
      continue;
    }

    await supabase.from("migration_id_map").insert({
      entity_type: "pharmacyorder",
      mongodb_id: mongoId,
      supabase_id: inserted.id
    });

    // Migrate order items
    if (Array.isArray(o.items) && o.items.length > 0) {
      const itemInserts = [];
      for (const item of o.items) {
        const { data: medMap } = await supabase
          .from("migration_id_map")
          .select("supabase_id")
          .eq("entity_type", "medicine")
          .eq("mongodb_id", item.medicine_id?.toString())
          .single();

        if (!medMap) {
          console.warn(`    ⚠️ Item medicine ${item.medicine_id} not mapped — using placeholder`);
        }

        itemInserts.push({
          order_id:    inserted.id,
          medicine_id: medMap?.supabase_id || null,
          brand_name:  item.brand_name || "Unknown",
          generic_name:item.generic_name || "",
          dosage_form: item.dosage_form || "Tablet",
          strength:    item.strength || "",
          quantity:    item.quantity || 1,
          unit_price:  item.unit_price || 0,
          total_price: item.total_price || 0,
        });
      }

      if (itemInserts.length > 0 && itemInserts[0].medicine_id) {
        await supabase.from("pharmacy_order_items").insert(itemInserts);
      }
    }

    console.log(`  ✅ Order ${o.order_number} (${o.status})`);
    migrated++;
  }

  console.log(`\nPharmacy Orders: ${migrated} migrated, ${skipped} skipped, ${failed} failed`);
  return { migrated, skipped, failed };
};
