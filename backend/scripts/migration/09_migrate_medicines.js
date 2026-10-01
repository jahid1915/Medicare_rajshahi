/**
 * STEP 09 — Migrate Medicines (15 documents)
 */

module.exports = async function step09_medicines(db, supabase) {
  const medicines = await db.collection("medicines").find({}).toArray();
  console.log(`Found ${medicines.length} medicines in MongoDB`);

  let migrated = 0, skipped = 0, failed = 0;

  for (const m of medicines) {
    const mongoId = m._id.toString();

    const { data: existing } = await supabase
      .from("migration_id_map")
      .select("supabase_id")
      .eq("entity_type", "medicine")
      .eq("mongodb_id", mongoId)
      .single();

    if (existing) { skipped++; continue; }

    const row = {
      legacy_mongodb_id:    mongoId,
      brand_name:           m.brand_name,
      generic_name:         m.generic_name,
      category:             m.category,
      manufacturer:         m.manufacturer,
      dosage_form:          m.dosage_form || "Tablet",
      strength:             m.strength,
      unit:                 m.unit || "strip of 10",
      unit_price:           m.unit_price || 0,
      requires_prescription:m.requires_prescription || false,
      is_otc:               m.is_otc !== false,
      description:          m.description || "",
      indications:          m.indications || "",
      dosage_guidelines:    m.dosage_guidelines || "",
      side_effects:         m.side_effects || "",
      precautions:          m.precautions || "",
      image_url:            m.image_url || null,
      is_active:            m.is_active !== false,
      created_at:           m.createdAt ? new Date(m.createdAt).toISOString() : new Date().toISOString(),
      updated_at:           m.updatedAt ? new Date(m.updatedAt).toISOString() : new Date().toISOString(),
    };

    const { data: inserted, error } = await supabase
      .from("medicines")
      .insert(row)
      .select("id")
      .single();

    if (error) {
      console.error(`  ❌ Failed: ${m.brand_name} — ${error.message}`);
      failed++;
      continue;
    }

    await supabase.from("migration_id_map").insert({
      entity_type: "medicine",
      mongodb_id: mongoId,
      supabase_id: inserted.id
    });

    console.log(`  ✅ ${m.brand_name} (${m.generic_name})`);
    migrated++;
  }

  console.log(`\nMedicines: ${migrated} migrated, ${skipped} skipped, ${failed} failed`);
  return { migrated, skipped, failed };
};
