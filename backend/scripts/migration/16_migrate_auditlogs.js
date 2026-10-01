/**
 * STEP 16 — Migrate Audit Logs (77 documents)
 */

module.exports = async function step16_auditLogs(db, supabase) {
  const logs = await db.collection("auditlogs").find({}).toArray();
  console.log(`Found ${logs.length} audit logs in MongoDB`);

  let migrated = 0, skipped = 0, failed = 0;

  for (const log of logs) {
    const mongoId = log._id.toString();

    const { data: existing } = await supabase
      .from("migration_id_map")
      .select("supabase_id")
      .eq("entity_type", "auditlog")
      .eq("mongodb_id", mongoId)
      .single();

    if (existing) { skipped++; continue; }

    // Resolve actor FK (optional)
    let actorSupabaseId = null;
    if (log.actor_id) {
      const { data: actorMap } = await supabase
        .from("migration_id_map")
        .select("supabase_id")
        .eq("entity_type", "user")
        .eq("mongodb_id", log.actor_id.toString())
        .single();
      actorSupabaseId = actorMap?.supabase_id || null;
    }

    const row = {
      legacy_mongodb_id: mongoId,
      actor_id:          actorSupabaseId,
      actor_name:        log.actor_name || null,
      actor_role:        log.actor_role || null,
      action:            log.action,
      resource_type:     log.resource_type || null,
      resource_id:       log.resource_id?.toString() || null,
      old_value:         log.old_value || null,
      new_value:         log.new_value || null,
      ip_address:        log.ip_address || null,
      user_agent:        log.user_agent || null,
      detail:            log.detail || null,
      created_at:        log.createdAt ? new Date(log.createdAt).toISOString() : new Date().toISOString(),
      updated_at:        log.updatedAt ? new Date(log.updatedAt).toISOString() : new Date().toISOString(),
    };

    const { data: inserted, error } = await supabase
      .from("audit_logs")
      .insert(row)
      .select("id")
      .single();

    if (error) {
      console.error(`  ❌ Failed audit log ${mongoId}: ${error.message}`);
      failed++;
      continue;
    }

    await supabase.from("migration_id_map").insert({
      entity_type: "auditlog",
      mongodb_id: mongoId,
      supabase_id: inserted.id
    });

    migrated++;
  }

  console.log(`\nAudit Logs: ${migrated} migrated, ${skipped} skipped, ${failed} failed`);
  return { migrated, skipped, failed };
};
