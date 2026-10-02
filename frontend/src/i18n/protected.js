/**
 * NIRAMOY INTERNATIONALIZATION — PROTECTED CONTENT ARCHITECTURE
 * 
 * Defines immutable, protected database values and brand invariants.
 * According to Niramoy Core Policies:
 * - Brand MUST ALWAYS be "Niramoy", NEVER "নিরাময়".
 * - Real-world medical & entity data (Medicine names, Doctor names, Hospital names,
 *   Pharmacy names, Diagnostic Center names, BMDC numbers, Phones, Emails, URLs,
 *   Registration IDs) MUST NEVER be transformed or machine-translated.
 * - Only UI labels, system prompts, descriptions, and interface elements translate.
 */

export const PROTECTED_ENTITIES = Object.freeze({
  BRAND_NAME: 'Niramoy',
  BRAND_LOGO_TEXT: 'Niramoy',
  BRAND_TAGLINE_EN: 'Healthcare Made Simple',
  BRAND_TAGLINE_BN: 'স্বাস্থ্যসেবা হোক সহজ', // Tagline translation allowed, brand name remains Niramoy
});

/**
 * Returns true if the key or field is designated as protected data.
 */
export const isProtectedField = (fieldName) => {
  if (!fieldName || typeof fieldName !== 'string') return false;
  const normalized = fieldName.toLowerCase().replace(/[-_]/g, '');
  const protectedFieldList = [
    'brand',
    'medicinename',
    'brandname',
    'genericname',
    'doctorname',
    'hospitalname',
    'pharmacyname',
    'diagnosticname',
    'bmdc',
    'bmdcnumber',
    'phone',
    'phonenumber',
    'mobile',
    'email',
    'emailaddress',
    'url',
    'website',
    'registrationnumber',
    'regno',
    'serialid',
    'serialnumber',
    'bookingid',
    'orderid',
    'prescriptionid',
    'id',
    '_id',
    'slug'
  ];
  return protectedFieldList.includes(normalized);
};

/**
 * Guarantee helper: Ensures text passes through untouched if it matches protected entities or branding.
 */
export const protectValue = (value) => {
  if (value === null || value === undefined) return '';
  // If it's a string, guarantee "Niramoy" is never converted to Bengali script
  if (typeof value === 'string') {
    return value.replace(/নিরাময়/g, 'Niramoy');
  }
  return value;
};
