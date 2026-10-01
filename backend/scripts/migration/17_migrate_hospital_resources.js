/**
 * STEP 17 — Migrate Hospital Resources (8 documents)
 */

module.exports = async function step17_hospitalResources(db, supabase) {
  const resources = await db.collection("hospitalresources").find({}).toArray();
  console.log(`Found ${resources.length} hospital resources in MongoDB`);

  let migrated = 0, skipped = 0, failed = 0;

  for (const r of resources) {
    const mongoId = r._id.toString();

    const { data: existing } = await supabase
      .from("migration_id_map")
      .select("supabase_id")
      .eq("entity_type", "hospitalresource")
      .eq("mongodb_id", mongoId)
      .single();

    if (existing) { skipped++; continue; }

    const { data: hospitalMap } = r.hospital_id ? await supabase
      .from("migration_id_map").select("supabase_id")
      .eq("entity_type", "hospital").eq("mongodb_id", r.hospital_id.toString()).single() : { data: null };

    if (!hospitalMap) {
      console.warn(`  ⚠️ Resource ${mongoId}: hospital not mapped — skipping`);
      skipped++;
      continue;
    }

    const row = {
      legacy_mongodb_id:   mongoId,
      hospital_id:         hospitalMap.supabase_id,
      resource_type:       r.resource_type,
      resource_name:       r.resource_name,
      total_capacity:      r.total_capacity || null,
      available_count:     r.available_count || null,
      occupied_count:      r.occupied_count || null,
      reserved_count:      r.reserved_count || 0,
      maintenance_count:   r.maintenance_count || 0,
      occupancy_percentage:r.occupancy_percentage || null,
      status:              r.status || "unknown",
      is_bookable:         r.is_bookable || false,
      booking_policy:      r.booking_policy || "information_only",
      price_per_day:       r.price_per_day || null,
      last_updated:        r.last_updated ? new Date(r.last_updated).toISOString() : null,
      source:              r.source || "manual",
      verification_status: r.verification_status || "unverified",
      created_at:          r.createdAt ? new Date(r.createdAt).toISOString() : new Date().toISOString(),
      updated_at:          r.updatedAt ? new Date(r.updatedAt).toISOString() : new Date().toISOString(),
    };

    const { data: inserted, error } = await supabase
      .from("hospital_resources")
      .insert(row)
      .select("id")
      .single();

    if (error) {
      console.error(`  ❌ Failed resource ${mongoId}: ${error.message}`);
      failed++;
      continue;
    }

    await supabase.from("migration_id_map").insert({
      entity_type: "hospitalresource",
      mongodb_id: mongoId,
      supabase_id: inserted.id
    });

    console.log(`  ✅ ${r.resource_name} (${r.resource_type}) — ${r.status}`);
    migrated++;
  }

  console.log(`\nHospital Resources: ${migrated} migrated, ${skipped} skipped, ${failed} failed`);
  return { migrated, skipped, failed };
};
