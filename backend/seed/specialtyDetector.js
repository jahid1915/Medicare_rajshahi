/**
 * Specialty Detector
 * Infers doctor specialty from qualifications + designation
 * since scraped "specialty" field is always "Skip to content"
 */

const SPECIALTY_RULES = [
  // Highly specific — check first
  { pattern: /neurolog/i,                         specialty: "Neurology" },
  { pattern: /nephrol/i,                          specialty: "Nephrology" },
  { pattern: /hepatolog/i,                        specialty: "Hepatology" },
  { pattern: /cardiol|d-card|echocard/i,          specialty: "Cardiology" },
  { pattern: /oncolog|cancer/i,                   specialty: "Oncology" },
  { pattern: /endocrinol|diabetol/i,              specialty: "Endocrinology" },
  { pattern: /gastroenterol|gastro/i,             specialty: "Gastroenterology" },
  { pattern: /rheumato/i,                         specialty: "Rheumatology" },
  { pattern: /hematol/i,                          specialty: "Hematology" },
  { pattern: /pulmonolog|chest|respirat/i,        specialty: "Pulmonology" },
  { pattern: /dermatolog|skin/i,                  specialty: "Dermatology" },
  { pattern: /psychiatr|mental health/i,          specialty: "Psychiatry" },
  { pattern: /psycholog/i,                        specialty: "Psychology" },
  { pattern: /pediatric surg/i,                   specialty: "Pediatric Surgery" },
  { pattern: /neonatol|nicu/i,                    specialty: "Neonatology" },
  { pattern: /pediatric|paediatric|fcps \(paed/i, specialty: "Pediatrics" },
  { pattern: /gynaecolog|gynecolog|obstetric|fcps \(o&g\)|fcps \(obs/i, specialty: "Gynecology & Obstetrics" },
  { pattern: /orthop(ae|e)d/i,                    specialty: "Orthopedics" },
  { pattern: /urol/i,                             specialty: "Urology" },
  { pattern: /ophthalmol|eye|fcps \(ophthal/i,    specialty: "Ophthalmology" },
  { pattern: /ent|otolaryngol|dlo|head.?neck|rhinol/i, specialty: "ENT" },
  { pattern: /dental|dentist|bds|oral.?surg|maxillofa/i, specialty: "Dentistry" },
  { pattern: /neurosurg/i,                        specialty: "Neurosurgery" },
  { pattern: /cardiovascular surg|cardiac surg/i, specialty: "Cardiac Surgery" },
  { pattern: /plastic surg|reconstructive/i,       specialty: "Plastic Surgery" },
  { pattern: /colorect|proctolog/i,               specialty: "Colorectal Surgery" },
  { pattern: /vascular surg/i,                    specialty: "Vascular Surgery" },
  { pattern: /laparoscop/i,                       specialty: "Laparoscopic Surgery" },
  { pattern: /surg(ery|eon)|\bms\b.*surg|fcps \(surg/i, specialty: "Surgery" },
  { pattern: /radiol|imaging|sonol/i,             specialty: "Radiology" },
  { pattern: /pathol/i,                           specialty: "Pathology" },
  { pattern: /anesthes|anaesth/i,                 specialty: "Anesthesiology" },
  { pattern: /physical med|rehab/i,               specialty: "Physical Medicine" },
  { pattern: /sexual|androl/i,                    specialty: "Sexual Medicine" },
  { pattern: /pain manag/i,                       specialty: "Pain Management" },
  { pattern: /infect(ious)?.dis/i,                specialty: "Infectious Disease" },
  { pattern: /intern.?med|fcps \(med|md \(med|dcm/i, specialty: "Internal Medicine" },
  { pattern: /general med|mbbs.*bcs.*md/i,        specialty: "General Medicine" },
  { pattern: /family med/i,                       specialty: "Family Medicine" },
];

/**
 * Detect specialty from qualifications + designation text
 * @param {string|null} qualifications
 * @param {string|null} designation
 * @returns {string}
 */
function detectSpecialty(qualifications, designation) {
  const combined = [qualifications, designation]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  if (!combined.trim()) return "General Medicine";

  for (const rule of SPECIALTY_RULES) {
    if (rule.pattern.test(combined)) {
      return rule.specialty;
    }
  }

  // Fallback: check for MBBS only = General Medicine
  if (/mbbs/.test(combined)) return "General Medicine";

  return "General Practice";
}

module.exports = { detectSpecialty };
