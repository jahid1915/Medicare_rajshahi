require('dotenv').config({ path: 'd:/Medi/backend/.env' });
const mongoose = require('mongoose');
const fs = require('fs');
const Doctor = require('d:/Medi/backend/models/Doctor');

(async () => {
  await mongoose.connect(process.env.MONGO_URI);
  const noImgDoctors = await Doctor.find({
    $or: [
      { imageUrl: null },
      { imageUrl: '' },
      { imageUrl: 'https://medic.bd/assets/images/default-og-image.webp' }
    ]
  }).select('name specialty profileUrl source source_metadata').lean();

  console.log('Doctors without real image:', noImgDoctors.length);
  console.log(JSON.stringify(noImgDoctors, null, 2));

  // Let's also inspect medicbd_rajshahi_doctors.json for doctors that have real uploaded images (not default-og-image)
  const medicDoctors = JSON.parse(fs.readFileSync('d:/Medi/backend/seed/medicbd_rajshahi_doctors.json', 'utf8'));
  const realMedicImgs = medicDoctors.filter(d => d.image_url && !d.image_url.includes('default-og-image'));
  console.log('MedicBD doctors with real images in JSON:', realMedicImgs.length);
  console.log('Sample real MedicBD images:', JSON.stringify(realMedicImgs.slice(0, 5).map(d => ({ name: d.name, img: d.image_url })), null, 2));

  process.exit(0);
})();
