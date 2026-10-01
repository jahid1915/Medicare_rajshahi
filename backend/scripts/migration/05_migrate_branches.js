/**
 * STEP 05 — Migrate Doctor Branches (427 documents)
 * Idempotent: uses legacy_mongodb_id and high-performance in-memory cache & batching.
 */

const BATCH_SIZE = 100;

module.exports = async function step05_branches(db, supabase) {
  const total = await db.collection("doctorbranches").countDocuments();
  console.log(`Found ${total} doctor branches in MongoDB`);

  // Pre-load all doctor mappings into memory
  const { data: allDocMaps } = await supabase
    .from("migration_id_map")
    .select("mongodb_id, supabase_id")
    .eq("entity_type", "doctor");
  const docMapLookup = new Map((allDocMaps || []).map(m => [m.mongodb_id, m.supabase_id]));
  console.log(`Loaded ${docMapLookup.size} doctor mappings from Supabase`);

  // Pre-load existing branch mappings
  const { data: allExisting } = await supabase
    .from("migration_id_map")
    .select("mongodb_id")
    .eq("entity_type", "doctorbranch");
  const existingSet = new Set((allExisting || []).map(m => m.mongodb_id));

  let migrated = 0, skipped = 0, failed = 0;
  let offset = 0;

  while (offset < total) {
    const batch = await db.collection("doctorbranches")
      .find({}).skip(offset).limit(BATCH_SIZE).toArray();

    const rowsToInsert = [];

    for (const b of batch) {
      const mongoId = b._id.toString();

      if (existingSet.has(mongoId)) {
        skipped++;
        continue;
      }

      const doctorSupabaseId = docMapLookup.get(b.doctorId?.toString());
      if (!doctorSupabaseId) {
        console.warn(`  ⚠️ Branch ${mongoId}: doctor ${b.doctorId} not found in migration map — skipping`);
        skipped++;
        continue;
      }

      rowsToInsert.push({
        legacy_mongodb_id: mongoId,
        doctor_id:         doctorSupabaseId,
        name:              b.name,
        address:           b.address,
        city:              b.city || "Rajshahi",
        phone:             b.phone || null,
        room_number:       b.roomNumber || "",
        consultation_fee:  b.consultationFee || 800,
        active:            b.active !== false,
        created_at:        b.createdAt ? new Date(b.createdAt).toISOString() : new Date().toISOString(),
        updated_at:        b.updatedAt ? new Date(b.updatedAt).toISOString() : new Date().toISOString(),
      });
    }

    if (rowsToInsert.length > 0) {
      const { data: inserted, error } = await supabase
        .from("doctor_branches")
        .insert(rowsToInsert)
        .select("id, legacy_mongodb_id");

      if (error) {
        console.error(`  ❌ Batch error: ${error.message} — falling back to single inserts`);
        for (const row of rowsToInsert) {
          const { data: single, error: sErr } = await supabase
            .from("doctor_branches").insert(row).select("id").single();
          if (sErr) { failed++; continue; }
          await supabase.from("migration_id_map").insert({
            entity_type: "doctorbranch",
            mongodb_id: row.legacy_mongodb_id,
            supabase_id: single.id
          });
          migrated++;
        }
      } else {
        const mapRows = (inserted || []).map(ins => ({
          entity_type: "doctorbranch",
          mongodb_id: ins.legacy_mongodb_id,
          supabase_id: ins.id
        }));
        if (mapRows.length > 0) {
          await supabase.from("migration_id_map").insert(mapRows);
        }
        migrated += (inserted || []).length;
      }
    }

    offset += BATCH_SIZE;
    console.log(`  Branches: ${migrated} migrated so far...`);
  }

  console.log(`\nDoctor Branches: ${migrated} migrated, ${skipped} skipped, ${failed} failed`);
  return { migrated, skipped, failed };
};
