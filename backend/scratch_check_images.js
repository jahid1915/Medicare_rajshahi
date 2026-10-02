require('dotenv').config({ path: 'd:/Medi/backend/.env' });
const mongoose = require('mongoose');
const Doctor = require('d:/Medi/backend/models/Doctor');

(async () => {
  await mongoose.connect(process.env.MONGO_URI);
  const total = await Doctor.countDocuments();
  const withImg = await Doctor.countDocuments({ 
    imageUrl: { $ne: null, $nin: ['', 'https://medic.bd/assets/images/default-og-image.webp'] } 
  });
  const defaultOg = await Doctor.countDocuments({
    imageUrl: 'https://medic.bd/assets/images/default-og-image.webp'
  });
  const noImg = await Doctor.countDocuments({
    $or: [{ imageUrl: null }, { imageUrl: '' }]
  });
  const sample = await Doctor.find({ 
    imageUrl: { $ne: null, $nin: ['', 'https://medic.bd/assets/images/default-og-image.webp'] } 
  }).select('name imageUrl source').limit(10).lean();
  
  console.log(JSON.stringify({ total, withImg, defaultOg, noImg, sample }, null, 2));
  process.exit(0);
})();
