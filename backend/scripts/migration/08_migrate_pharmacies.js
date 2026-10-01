/**
 * STEP 08 — Migrate Pharmacies (56 documents)
 */

module.exports = async function step08_pharmacies(db, supabase) {
  const pharmacies = await db.collection("pharmacies").find({}).toArray();
  console.log(`Found ${pharmacies.length} pharmacies in MongoDB`);

  let migrated = 0, skipped = 0, failed = 0;

  for (const p of pharmacies) {
    const mongoId = p._id.toString();

    const { data: existing } = await supabase
      .from("migration_id_map")
      .select("supabase_id")
      .eq("entity_type", "pharmacy")
      .eq("mongodb_id", mongoId)
      .single();

    if (existing) { skipped++; continue; }

    // Resolve owner FK (may not exist yet if users run later — OK, will be null)
    let ownerSupabaseId = null;
    const ownerMongoId = (p.owner_id || p.owner_user_id || p.ownerUserId)?.toString();
    if (ownerMongoId) {
      const { data: ownerMap } = await supabase
        .from("migration_id_map")
        .select("supabase_id")
        .eq("entity_type", "user")
        .eq("mongodb_id", ownerMongoId)
        .single();
      ownerSupabaseId = ownerMap?.supabase_id || null;
    }

    const row = {
      legacy_mongodb_id:        mongoId,
      name:                     p.name,
      slug:                     p.slug || null,
      license_number:           p.license_number || null,
      owner_id:                 ownerSupabaseId,
      phone:                    p.phone,
      email:                    p.email || null,
      address:                  p.address,
      area:                     p.area,
      city:                     p.city || "Rajshahi",
      district:                 p.district || "Rajshahi",
      latitude:                 p.latitude || 24.3745,
      longitude:                p.longitude || 88.6042,
      rating:                   p.rating || 4.8,
      review_count:             p.review_count || 0,
      is_verified:              p.is_verified !== false,
      is_active:                p.is_active !== false && p.active !== false,
      is_24_7:                  p.is_24_7 || false,
      opening_hours:            p.opening_hours || { open: "08:00 AM", close: "11:00 PM" },
      delivery_available:       p.delivery_available !== false,
      delivery_eta_mins:        p.delivery_eta_mins || 30,
      delivery_fee:             p.delivery_fee || 40,
      free_delivery_above:      p.free_delivery_above || 500,
      banner_image:             p.banner_image || null,
      featured_notice:          p.featured_notice || null,
      accepted_payment_methods: p.accepted_payment_methods || [],
      created_at:               p.createdAt ? new Date(p.createdAt).toISOString() : new Date().toISOString(),
      updated_at:               p.updatedAt ? new Date(p.updatedAt).toISOString() : new Date().toISOString(),
    };

    const { data: inserted, error } = await supabase
      .from("pharmacies")
      .insert(row)
      .select("id")
      .single();

    if (error) {
      console.error(`  ❌ Failed: ${p.name} — ${error.message}`);
      failed++;
      continue;
    }

    await supabase.from("migration_id_map").insert({
      entity_type: "pharmacy",
      mongodb_id: mongoId,
      supabase_id: inserted.id
    });

    migrated++;
  }

  console.log(`\nPharmacies: ${migrated} migrated, ${skipped} skipped, ${failed} failed`);
  return { migrated, skipped, failed };
};
