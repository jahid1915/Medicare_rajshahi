const fs = require('fs');

const medicDoctors = JSON.parse(fs.readFileSync('d:/Medi/backend/seed/medicbd_rajshahi_doctors.json', 'utf8'));
console.log('Total MedicBD doctors in seed file:', medicDoctors.length);

const withCustomImg = medicDoctors.filter(d => d.image_url && !d.image_url.includes('default-og-image') && !d.image_url.includes('default-doctor'));
console.log('MedicBD doctors with custom photo:', withCustomImg.length);

const defaultImg = medicDoctors.filter(d => d.image_url && (d.image_url.includes('default-og-image') || d.image_url.includes('default-doctor')));
console.log('MedicBD doctors with default placeholder:', defaultImg.length);

// Check BDDoctorDirectory
const bddocData = JSON.parse(fs.readFileSync('d:/Medi/rajshahi_doctors.json', 'utf8'));
const bddocList = bddocData.doctors || [];
console.log('Total BDDoctorDirectory doctors in json:', bddocList.length);
const bddocWithImg = bddocList.filter(d => d.image_url);
console.log('BDDoctorDirectory doctors with image:', bddocWithImg.length);
