const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const mongoose = require('mongoose');
const fs = require('fs');
const Doctor = require('d:/Medi/backend/models/Doctor');

(async () => {
  await mongoose.connect(process.env.MONGO_URI);
  const realDocs = await Doctor.find({ is_active: true, imageUrl: /^\/doctor-images\// })
    .sort({ verified: -1, reviewCount: -1, rating: -1 })
    .limit(12)
    .lean();

  const formatted = realDocs.map((d, i) => ({
    id: d._id.toString(),
    _id: d._id.toString(),
    slug: d.slug,
    name: d.name,
    specialty: d.specialty,
    specialtyName: d.specialty,
    degrees: d.qualifications || d.degrees?.join(', ') || '',
    qualifications: d.qualifications || d.degrees?.join(', ') || '',
    designation: d.designation || '',
    workplace: d.workplace || '',
    hospital: d.workplace || '',
    experienceYears: d.experience ? parseInt(d.experience) || 10 : 10,
    rating: d.rating || 4.8,
    reviewCount: d.reviewCount || 15,
    fee: 800,
    currency: '৳',
    imageUrl: d.imageUrl,
    avatar: d.imageUrl,
    verified: d.verified,
    chambers: d.chambers || []
  }));

  const fileContent = `/**
 * Niramoy — Real Rajshahi Doctors Fallback Cache
 * Real doctor records with local profile images
 */
export const DOCTORS = ${JSON.stringify(formatted, null, 2)};
`;

  fs.writeFileSync('d:/Medi/frontend/src/data/doctors.js', fileContent);
  console.log(`Updated frontend/src/data/doctors.js with ${formatted.length} real Rajshahi doctors!`);
  process.exit(0);
})();
