/**
 * STEP 03 — Migrate Specialties (extracted from doctors)
 * Normalizes all doctor specialties into a dedicated table.
 * Idempotent: uses unique name constraint.
 */

function toSlug(name) {
  return name.toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

module.exports = async function step03_specialties(db, supabase) {
  const doctors = await db.collection("doctors").find({}, {
    projection: { specialty: 1, specialties: 1 }
  }).toArray();

  console.log(`Extracting specialties from ${doctors.length} doctors...`);

  const specialtySet = new Set();

  for (const d of doctors) {
    if (d.specialty && d.specialty.trim()) specialtySet.add(d.specialty.trim());
    if (Array.isArray(d.specialties)) {
      for (const s of d.specialties) {
        if (s && s.trim()) specialtySet.add(s.trim());
      }
    }
  }

  const specialties = Array.from(specialtySet).sort();
  console.log(`Found ${specialties.length} unique specialties`);

  let migrated = 0, skipped = 0;

  for (const name of specialties) {
    const slug = toSlug(name);

    const { data: existing } = await supabase
      .from("specialties")
      .select("id")
      .eq("name", name)
      .single();

    if (existing) {
      skipped++;
      continue;
    }

    const { error } = await supabase
      .from("specialties")
      .insert({ name, slug });

    if (error && error.code !== "23505") { // 23505 = unique violation (already exists)
      console.error(`  ❌ Failed: ${name} — ${error.message}`);
    } else {
      migrated++;
    }
  }

  // Print summary
  const { data: allSpecs } = await supabase.from("specialties").select("name").order("name");
  console.log(`\n  Sample specialties in Supabase:`);
  (allSpecs || []).slice(0, 10).forEach(s => console.log(`    • ${s.name}`));
  if ((allSpecs || []).length > 10) console.log(`    ... and ${allSpecs.length - 10} more`);

  console.log(`\nSpecialties: ${migrated} migrated, ${skipped} already existed`);
  return { migrated, skipped };
};
