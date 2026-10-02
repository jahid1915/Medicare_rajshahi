/**
 * Niramoy Doctor Deduplication Service
 * Production-quality deduplication with multi-signal matching.
 */

const SPECIALTY_ALIASES = {
  'cardiologist': 'Cardiology', 'cardiology specialist': 'Cardiology', 'consultant cardiologist': 'Cardiology',
  'heart specialist': 'Cardiology', 'cardiac specialist': 'Cardiology', 'cardio': 'Cardiology',
  'neurologist': 'Neurology', 'neurology specialist': 'Neurology', 'brain specialist': 'Neurology',
  'neurosurgeon': 'Neurosurgery', 'neurosurgery specialist': 'Neurosurgery',
  'nephrologist': 'Nephrology', 'kidney specialist': 'Nephrology', 'kidney specialist (nephrologist)': 'Nephrology',
  'gastroenterologist': 'Gastroenterology & Hepatology', 'gastroenterology specialist': 'Gastroenterology & Hepatology',
  'hepatologist': 'Gastroenterology & Hepatology', 'gastroenterology': 'Gastroenterology & Hepatology',
  'gastroenterology & hepatology': 'Gastroenterology & Hepatology', 'liver specialist': 'Gastroenterology & Hepatology',
  'gynecologist': 'Gynecology & Obstetrics', 'gynaecologist': 'Gynecology & Obstetrics',
  'obstetrician': 'Gynecology & Obstetrics', 'gynecology specialist': 'Gynecology & Obstetrics',
  'gynecology & obstetrics': 'Gynecology & Obstetrics', 'gynaecology & obstetrics': 'Gynecology & Obstetrics',
  'gynecologist & obstetrician': 'Gynecology & Obstetrics',
  'pediatrician': 'Pediatrics', 'paediatrician': 'Pediatrics', 'child specialist': 'Pediatrics',
  'child medicine specialist': 'Pediatrics', 'child specialist (pediatrician)': 'Pediatrics',
  'orthopedic surgeon': 'Orthopedics', 'orthopaedic surgeon': 'Orthopedics', 'bone specialist': 'Orthopedics',
  'orthopaedics': 'Orthopedics', 'orthopedic': 'Orthopedics',
  'ent specialist': 'ENT', 'ear nose throat': 'ENT', 'ear, nose & throat': 'ENT', 'otolaryngologist': 'ENT',
  'ophthalmologist': 'Ophthalmology', 'eye specialist': 'Ophthalmology', 'eye specialist (ophthalmologist)': 'Ophthalmology',
  'dermatologist': 'Dermatology & Venereology', 'skin specialist': 'Dermatology & Venereology',
  'skin specialist (dermatologist)': 'Dermatology & Venereology', 'dermatology': 'Dermatology & Venereology',
  'general physician': 'Medicine', 'general practitioner': 'Medicine',
  'medicine specialist': 'Medicine', 'internal medicine specialist': 'Medicine',
  'general practice': 'Medicine', 'internal medicine': 'Medicine', 'physician': 'Medicine',
  'medicine': 'Medicine',
  'general surgeon': 'General Surgery', 'surgeon': 'General Surgery', 'surgery': 'General Surgery',
  'urologist': 'Urology', 'urology specialist': 'Urology',
  'oncologist': 'Oncology', 'cancer specialist': 'Oncology', 'cancer specialist (oncologist)': 'Oncology',
  'psychiatrist': 'Psychiatry & Mental Health', 'psychiatry': 'Psychiatry & Mental Health',
  'psychologist': 'Psychiatry & Mental Health', 'psychologist & counsellor': 'Psychiatry & Mental Health',
  'endocrinologist': 'Endocrinology & Diabetes', 'diabetes specialist': 'Endocrinology & Diabetes',
  'diabetes & hormone specialist': 'Endocrinology & Diabetes', 'diabetologist': 'Endocrinology & Diabetes',
  'endocrinology': 'Endocrinology & Diabetes', 'endocrinology & diabetes': 'Endocrinology & Diabetes',
  'pulmonologist': 'Pulmonology & Respiratory Medicine', 'chest specialist': 'Pulmonology & Respiratory Medicine',
  'respiratory specialist': 'Pulmonology & Respiratory Medicine', 'pulmonology': 'Pulmonology & Respiratory Medicine',
  'rheumatologist': 'Rheumatology', 'rheumatology specialist': 'Rheumatology',
  'hematologist': 'Hematology', 'haematologist': 'Hematology', 'blood specialist': 'Hematology',
  'dentist': 'Dentistry', 'dental surgeon': 'Dentistry', 'oral surgeon': 'Dentistry',
  'radiologist': 'Radiology & Imaging', 'radiology specialist': 'Radiology & Imaging', 'radiology': 'Radiology & Imaging',
  'pathologist': 'Pathology & Laboratory Medicine', 'laboratory medicine': 'Pathology & Laboratory Medicine',
  'anesthesiologist': 'Anaesthesiology', 'anaesthesiologist': 'Anaesthesiology', 'anaesthesiology': 'Anaesthesiology',
  'physical medicine specialist': 'Physical Medicine & Rehabilitation', 'physical medicine': 'Physical Medicine & Rehabilitation',
  'cardiac surgeon': 'Cardiothoracic surgery', 'cardiothoracic surgeon': 'Cardiothoracic surgery',
  'cardiovascular surgeon': 'Cardiothoracic surgery', 'cardiothoracic surgery': 'Cardiothoracic surgery',
  'pediatric surgeon': 'Pediatric Surgery', 'paediatric surgeon': 'Pediatric Surgery',
  'nutritionist': 'Nutrition & Dietetics', 'dietitian': 'Nutrition & Dietetics',
  'infertility specialist': 'Reproductive Medicine & Infertility', 'reproductive medicine': 'Reproductive Medicine & Infertility',
  'plastic surgeon': 'General Surgery', 'cosmetic surgeon': 'General Surgery',
  'vascular surgeon': 'General Surgery', 'colorectal surgeon': 'General Surgery',
  'infectious disease specialist': 'Medicine', 'family physician': 'Medicine',
  'neurosurgeon 154': 'Neurosurgery', 'neurologist 283': 'Neurology',
  'homeopathy': 'Alternative Medicine', 'homeopathic': 'Alternative Medicine', 'ayurveda': 'Alternative Medicine', 'unani': 'Alternative Medicine',
  'nuclear medicine specialist': 'Nuclear Medicine', 'nuclear medicine': 'Nuclear Medicine',
};

const CANONICAL_SPECIALTIES = [
  'Alternative Medicine',
  'Anaesthesiology',
  'Cardiology',
  'Cardiothoracic surgery',
  'Dentistry',
  'Dermatology & Venereology',
  'Endocrinology & Diabetes',
  'ENT',
  'Gastroenterology & Hepatology',
  'General Surgery',
  'Gynecology & Obstetrics',
  'Hematology',
  'Medicine',
  'Nephrology',
  'Neurology',
  'Neurosurgery',
  'Nuclear Medicine',
  'Nutrition & Dietetics',
  'Oncology',
  'Ophthalmology',
  'Orthopedics',
  'Pathology & Laboratory Medicine',
  'Pediatric Surgery',
  'Pediatrics',
  'Physical Medicine & Rehabilitation',
  'Psychiatry & Mental Health',
  'Pulmonology & Respiratory Medicine',
  'Radiology & Imaging',
  'Reproductive Medicine & Infertility',
  'Rheumatology',
  'Urology'
];

function normalizeName(name) {
  if (!name || typeof name !== 'string') return '';
  return name.toLowerCase()
    .replace(/\b(prof\.|professor|dr\.|dr|doctor|brig\.|gen\.|col\.|major|ms\.|mrs\.|mr\.?)\s*/gi, '')
    .replace(/\(.*?\)/g, '').replace(/[.,\-_/]/g, ' ').replace(/\s+/g, ' ').trim();
}

function normalizeNameStrict(name) {
  if (!name || typeof name !== 'string') return '';
  return name.toLowerCase()
    .replace(/\b(prof\.|professor|dr\.|dr|doctor|md\.?|mohammad|mohammed|sk|sheikh)\s*/gi, '')
    .replace(/\(.*?\)/g, '').replace(/[^a-z0-9]/gi, ' ').replace(/\s+/g, ' ').trim();
}

function normalizePhone(phone) {
  if (!phone || typeof phone !== 'string') return null;
  const digits = phone.replace(/[^0-9]/g, '');
  if (digits.length < 8) return null;
  if (digits.startsWith('880') && digits.length === 13) return '0' + digits.slice(3);
  if (digits.startsWith('0') && digits.length === 11) return digits;
  return digits.length >= 8 ? digits : null;
}

function normalizeSpecialty(rawSpecialty) {
  if (!rawSpecialty || typeof rawSpecialty !== 'string') return null;
  const raw = rawSpecialty.trim();
  if (raw === 'Skip to content' || raw === '') return null;
  const clean = raw.toLowerCase();
  if (SPECIALTY_ALIASES[clean]) return SPECIALTY_ALIASES[clean];
  for (const [alias, canonical] of Object.entries(SPECIALTY_ALIASES)) {
    if (clean.includes(alias)) return canonical;
  }
  const found = CANONICAL_SPECIALTIES.find(s => s.toLowerCase() === clean || s.toLowerCase().includes(clean));
  if (found) return found;
  return raw;
}

function generateSignals(doc) {
  const phones = [];
  if (Array.isArray(doc.chambers)) {
    doc.chambers.forEach(ch => {
      if (Array.isArray(ch.appointment_numbers)) {
        ch.appointment_numbers.forEach(p => { const n = normalizePhone(p); if (n) phones.push(n); });
      }
      if (ch.phone) { const n = normalizePhone(ch.phone); if (n) phones.push(n); }
    });
  }
  ['phone', 'mobile'].forEach(f => { const n = normalizePhone(doc[f]); if (n) phones.push(n); });
  return {
    normalizedName: normalizeName(doc.name),
    strictName: normalizeNameStrict(doc.name),
    bmdc: doc.bmdcRegistration || doc.bmdc_registration || null,
    phones: [...new Set(phones)],
    specialty: normalizeSpecialty(doc.specialty),
    workplace: (doc.workplace || '').toLowerCase().trim(),
    profileUrl: (doc.profileUrl || doc.profile_url || doc.source_metadata?.profile_url || '').toLowerCase().trim(),
    sourceProfileUrl: (doc.source_metadata?.profile_url || doc.profileUrl || doc.profile_url || '').toLowerCase().trim(),
  };
}

function calculateMatchConfidence(sigA, sigB) {
  const reasons = [];
  let score = 0;
  if (sigA.bmdc && sigB.bmdc && sigA.bmdc.trim().toLowerCase() !== sigB.bmdc.trim().toLowerCase()) {
    return { confidence: 0, reasons: ['Conflicting BMDC numbers'], level: 'none', blocked: true };
  }
  if (sigA.bmdc && sigB.bmdc && sigA.bmdc.trim().toLowerCase() === sigB.bmdc.trim().toLowerCase()) {
    score += 0.95; reasons.push('BMDC registration match');
  }
  const phoneIntersect = sigA.phones.filter(p => sigB.phones.includes(p));
  if (phoneIntersect.length > 0) { score += 0.85; reasons.push('Phone match: ' + phoneIntersect.join(', ')); }
  if (sigA.sourceProfileUrl && sigB.sourceProfileUrl && sigA.sourceProfileUrl === sigB.sourceProfileUrl) {
    score += 0.90; reasons.push('Source profile URL match');
  }
  const nameMatch = sigA.normalizedName && sigB.normalizedName && sigA.normalizedName === sigB.normalizedName;
  const strictNameMatch = sigA.strictName && sigB.strictName && sigA.strictName === sigB.strictName;
  if (nameMatch) { score += 0.45; reasons.push('Normalized name match'); }
  else if (strictNameMatch) { score += 0.35; reasons.push('Strict name match'); }
  const specMatch = sigA.specialty && sigB.specialty && sigA.specialty.toLowerCase() === sigB.specialty.toLowerCase();
  if (specMatch && (nameMatch || strictNameMatch)) { score += 0.30; reasons.push('Specialty match'); }
  const wpMatch = sigA.workplace && sigB.workplace &&
    (sigA.workplace.includes(sigB.workplace.slice(0,8)) || sigB.workplace.includes(sigA.workplace.slice(0,8)));
  if (wpMatch && (nameMatch || strictNameMatch)) { score += 0.20; reasons.push('Workplace match'); }
  const confidence = Math.min(score, 1.0);
  let level = 'none';
  if (confidence >= 0.80) level = 'strong';
  else if (confidence >= 0.55) level = 'moderate';
  else if (confidence >= 0.35) level = 'weak';
  return { confidence, reasons, level, blocked: false };
}

function mergeDoctors(existingDoc, newData) {
  const updates = {};
  ['designation','workplace','experience','biography','bmdcRegistration','imageUrl','normalized_name','profileUrl'].forEach(f => {
    if (!existingDoc[f] && newData[f]) updates[f] = newData[f];
  });
  if (!existingDoc.qualifications && newData.qualifications) updates.qualifications = newData.qualifications;
  const existingDegrees = new Set((existingDoc.degrees || []).map(d => d.trim()));
  const newDegrees = (newData.degrees || []).filter(d => d && !existingDegrees.has(d.trim()));
  if (newDegrees.length > 0) updates.degrees = [...(existingDoc.degrees || []), ...newDegrees];
  const existingSpecs = new Set([...(existingDoc.specialties||[]).map(s=>normalizeSpecialty(s)), normalizeSpecialty(existingDoc.specialty)].filter(Boolean));
  const newSpecs = [...(newData.specialties||[]).map(s=>normalizeSpecialty(s)), normalizeSpecialty(newData.specialty)].filter(s=>s&&!existingSpecs.has(s));
  if (newSpecs.length > 0) updates.specialties = [...(existingDoc.specialties||[]), ...newSpecs];
  if (!existingDoc.specialty || existingDoc.specialty === 'General Practice' || existingDoc.specialty === 'Skip to content') {
    const newSpec = normalizeSpecialty(newData.specialty);
    if (newSpec && newSpec !== 'General Practice' && newSpec !== 'Skip to content') updates.specialty = newSpec;
  }
  const existingChamberKeys = new Set((existingDoc.chambers||[]).map(ch=>`${(ch.name||'').toLowerCase().trim()}||${(ch.address||'').toLowerCase().trim()}`));
  const newChambers = (newData.chambers||[]).filter(ch => {
    const key = `${(ch.name||'').toLowerCase().trim()}||${(ch.address||'').toLowerCase().trim()}`;
    return !existingChamberKeys.has(key);
  });
  if (newChambers.length > 0) updates.chambers = [...(existingDoc.chambers||[]), ...newChambers];
  const existingSources = existingDoc.sources || [];
  const newSource = newData.source_entry || null;
  if (newSource) {
    const isDupSource = existingSources.some(s => s.website === newSource.website || (s.profileUrl && s.profileUrl === newSource.profileUrl));
    if (!isDupSource) updates.sources = [...existingSources, newSource];
  }
  if (newData.name && !(existingDoc.source_names||[]).includes(newData.name)) {
    updates.source_names = [...(existingDoc.source_names||[]), newData.name];
  }
  if (newData.rating && (!existingDoc.rating || newData.rating > existingDoc.rating)) {
    updates.rating = newData.rating;
    if (newData.reviewCount) updates.reviewCount = newData.reviewCount;
  }
  if (!existingDoc.imageUrl && newData.imageUrl) updates.imageUrl = newData.imageUrl;
  updates.lastUpdated = new Date();
  return updates;
}

function findDuplicate(candidate, existingDoctors) {
  const candidateSignals = generateSignals(candidate);
  let bestMatch = null;
  let bestResult = { confidence: 0, reasons: [], level: 'none', blocked: false };
  for (const existing of existingDoctors) {
    const existingSignals = generateSignals(existing);
    const result = calculateMatchConfidence(candidateSignals, existingSignals);
    if (result.blocked) continue;
    if (result.confidence > bestResult.confidence) { bestResult = result; bestMatch = existing; }
  }
  return { match: bestMatch, ...bestResult };
}

function findBySourceUrl(sourceUrl, existingDoctors) {
  if (!sourceUrl) return null;
  const normalizedUrl = sourceUrl.toLowerCase().trim();
  return existingDoctors.find(doc => {
    const docUrl = (doc.profileUrl || doc.source_metadata?.profile_url || '').toLowerCase();
    const sources = (doc.sources || []).map(s => (s.profileUrl || '').toLowerCase());
    return docUrl === normalizedUrl || sources.includes(normalizedUrl);
  }) || null;
}

function deduplicateDoctors(doctors) {
  if (!Array.isArray(doctors)) return [];
  const seen = new Set();
  return doctors.filter(doc => {
    const id = (doc._id || doc.id || '').toString();
    if (!id || seen.has(id)) return false;
    seen.add(id);
    return true;
  });
}

function deduplicateSpecialties(specialties) {
  if (!Array.isArray(specialties)) return [];
  const seen = new Map();
  specialties.forEach(spec => {
    const name = normalizeSpecialty(spec.specialty || spec.name || '');
    if (!name) return;
    if (!seen.has(name)) seen.set(name, { name, count: spec.count || 0 });
    else seen.get(name).count += (spec.count || 0);
  });
  return Array.from(seen.values()).sort((a, b) => b.count - a.count);
}

module.exports = {
  normalizeName, normalizeNameStrict, normalizePhone, normalizeSpecialty,
  generateSignals, calculateMatchConfidence, mergeDoctors, findDuplicate,
  findBySourceUrl, deduplicateDoctors, deduplicateSpecialties,
  SPECIALTY_ALIASES, CANONICAL_SPECIALTIES,
};
