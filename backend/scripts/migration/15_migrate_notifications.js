/**
 * STEP 15 — Migrate Notifications (32 documents)
 */

module.exports = async function step15_notifications(db, supabase) {
  const notifications = await db.collection("notifications").find({}).toArray();
  console.log(`Found ${notifications.length} notifications in MongoDB`);

  let migrated = 0, skipped = 0, failed = 0;

  for (const n of notifications) {
    const mongoId = n._id.toString();

    const { data: existing } = await supabase
      .from("migration_id_map")
      .select("supabase_id")
      .eq("entity_type", "notification")
      .eq("mongodb_id", mongoId)
      .single();

    if (existing) { skipped++; continue; }

    const { data: userMap } = n.user_id ? await supabase
      .from("migration_id_map").select("supabase_id")
      .eq("entity_type", "user").eq("mongodb_id", n.user_id.toString()).single() : { data: null };

    if (!userMap) {
      console.warn(`  ⚠️ Notification ${mongoId}: user not mapped — skipping`);
      skipped++;
      continue;
    }

    const row = {
      legacy_mongodb_id: mongoId,
      user_id:           userMap.supabase_id,
      type:              n.type || "general",
      title:             n.title,
      message:           n.message,
      is_read:           n.is_read || false,
      reference_id:      n.reference_id?.toString() || null,
      reference_type:    n.reference_type || null,
      channels:          n.channels || ["in_app"],
      created_at:        n.createdAt ? new Date(n.createdAt).toISOString() : new Date().toISOString(),
      updated_at:        n.updatedAt ? new Date(n.updatedAt).toISOString() : new Date().toISOString(),
    };

    const { data: inserted, error } = await supabase
      .from("notifications")
      .insert(row)
      .select("id")
      .single();

    if (error) {
      console.error(`  ❌ Failed notification ${mongoId}: ${error.message}`);
      failed++;
      continue;
    }

    await supabase.from("migration_id_map").insert({
      entity_type: "notification",
      mongodb_id: mongoId,
      supabase_id: inserted.id
    });

    migrated++;
  }

  console.log(`\nNotifications: ${migrated} migrated, ${skipped} skipped, ${failed} failed`);
  return { migrated, skipped, failed };
};
