/**
 * STEP 06 — Migrate Doctor Schedules (2,135 documents)
 * High-performance: In-memory cache & batch insertion.
 */

const BATCH_SIZE = 200;

module.exports = async function step06_schedules(db, supabase) {
  const total = await db.collection("doctorschedules").countDocuments();
  console.log(`Found ${total} doctor schedules in MongoDB`);

  // Pre-load all doctor mappings into memory
  const { data: allDocMaps } = await supabase
    .from("migration_id_map")
    .select("mongodb_id, supabase_id")
    .eq("entity_type", "doctor");
  const docMapLookup = new Map((allDocMaps || []).map(m => [m.mongodb_id, m.supabase_id]));
  console.log(`Loaded ${docMapLookup.size} doctor mappings from Supabase`);

  // Pre-load all branch mappings into memory
  const { data: allBranchMaps } = await supabase
    .from("migration_id_map")
    .select("mongodb_id, supabase_id")
    .eq("entity_type", "doctorbranch");
  const branchMapLookup = new Map((allBranchMaps || []).map(m => [m.mongodb_id, m.supabase_id]));
  console.log(`Loaded ${branchMapLookup.size} branch mappings from Supabase`);

  // Pre-load existing schedule mappings
  const { data: allExisting } = await supabase
    .from("migration_id_map")
    .select("mongodb_id")
    .eq("entity_type", "doctorschedule");
  const existingSet = new Set((allExisting || []).map(m => m.mongodb_id));

  let migrated = 0, skipped = 0, failed = 0;
  let offset = 0;

  while (offset < total) {
    const batch = await db.collection("doctorschedules")
      .find({}).skip(offset).limit(BATCH_SIZE).toArray();

    const rowsToInsert = [];

    for (const s of batch) {
      const mongoId = s._id.toString();

      if (existingSet.has(mongoId)) {
        skipped++;
        continue;
      }

      const doctorSupabaseId = docMapLookup.get(s.doctorId?.toString());
      if (!doctorSupabaseId) {
        skipped++;
        continue;
      }

      const branchSupabaseId = branchMapLookup.get(s.branchId?.toString());
      if (!branchSupabaseId) {
        skipped++;
        continue;
      }

      rowsToInsert.push({
        legacy_mongodb_id: mongoId,
        doctor_id:         doctorSupabaseId,
        branch_id:         branchSupabaseId,
        day_of_week:       s.dayOfWeek,
        day_name:          s.dayName || null,
        start_time:        s.startTime,
        end_time:          s.endTime,
        slot_duration:     s.slotDuration || 20,
        max_patients:      s.maxPatients || 20,
        consultation_type: s.consultationType || "both",
        active:            s.active !== false,
        created_at:        s.createdAt ? new Date(s.createdAt).toISOString() : new Date().toISOString(),
        updated_at:        s.updatedAt ? new Date(s.updatedAt).toISOString() : new Date().toISOString(),
      });
    }

    if (rowsToInsert.length > 0) {
      const { data: inserted, error } = await supabase
        .from("doctor_schedules")
        .insert(rowsToInsert)
        .select("id, legacy_mongodb_id");

      if (error) {
        console.error(`  ❌ Batch error: ${error.message} — falling back to single inserts`);
        for (const row of rowsToInsert) {
          const { data: single, error: sErr } = await supabase
            .from("doctor_schedules").insert(row).select("id").single();
          if (sErr) { failed++; continue; }
          await supabase.from("migration_id_map").insert({
            entity_type: "doctorschedule",
            mongodb_id: row.legacy_mongodb_id,
            supabase_id: single.id
          });
          migrated++;
        }
      } else {
        const mapRows = (inserted || []).map(ins => ({
          entity_type: "doctorschedule",
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
    console.log(`  Schedules: ${migrated} migrated so far (${Math.min(offset, total)}/${total} processed)...`);
  }

  console.log(`\nDoctor Schedules: ${migrated} migrated, ${skipped} skipped, ${failed} failed`);
  return { migrated, skipped, failed };
};
