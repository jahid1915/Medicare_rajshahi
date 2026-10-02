require('dotenv').config();
const mongoose = require('mongoose');
const Doctor = require('./models/Doctor');

(async () => {
  await mongoose.connect(process.env.MONGO_URI);
  const docs = await Doctor.find({ is_active: true }).lean();
  const without = docs.filter(d => !d.imageUrl || !d.imageUrl.startsWith('/doctor-images/'));
  console.log('Doctors without local image:', without.map(d => ({ name: d.name, specialty: d.specialty, img: d.imageUrl, profile: d.profileUrl })));
  process.exit(0);
})();
