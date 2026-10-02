/**
 * Niramoy — Collect & Download Doctor Images Script
 * 
 * Sources:
 * 1. BDDoctorDirectory (https://bddoctordirectory.hamidslab.com/city/rajshahi/)
 * 2. MedicBD (https://medic.bd/doctors/rajshahi-division)
 * 
 * Downloads real images directly to frontend/public/doctor-images/
 * Updates doctor records in MongoDB with local image URLs.
 */

const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');
const mongoose = require('mongoose');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const Doctor = require('../models/Doctor');

const TARGET_DIR = path.join(__dirname, '../../frontend/public/doctor-images');
if (!fs.existsSync(TARGET_DIR)) {
  fs.mkdirSync(TARGET_DIR, { recursive: true });
}

function normalizeName(name) {
  return (name || '')
    .toLowerCase()
    .replace(/^(prof\.|dr\.|doctor|associate\s+prof\.|asst\.\s+prof\.)\s*/gi, '')
    .replace(/[^\w\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function downloadImage(url, destPath) {
  return new Promise((resolve) => {
    if (!url || typeof url !== 'string' || !url.startsWith('http')) {
      return resolve({ success: false, reason: 'invalid_url' });
    }

    // Skip known default placeholder
    if (url.includes('default-og-image') || url.includes('default-doctor-male')) {
      return resolve({ success: false, reason: 'placeholder' });
    }

    const client = url.startsWith('https') ? https : http;
    const req = client.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Referer': url.includes('hamidslab') ? 'https://bddoctordirectory.hamidslab.com/' : 'https://medic.bd/'
      },
      timeout: 12000
    }, (res) => {
      // Follow redirects
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        let redirectUrl = res.headers.location;
        if (!redirectUrl.startsWith('http')) {
          const parsed = new URL(url);
          redirectUrl = `${parsed.protocol}//${parsed.host}${redirectUrl}`;
        }
        return downloadImage(redirectUrl, destPath).then(resolve);
      }

      if (res.statusCode !== 200) {
        return resolve({ success: false, status: res.statusCode });
      }

      const fileStream = fs.createWriteStream(destPath);
      res.pipe(fileStream);

      fileStream.on('finish', () => {
        fileStream.close();
        try {
          const stats = fs.statSync(destPath);
          if (stats.size > 500) {
            resolve({ success: true, size: stats.size });
          } else {
            // Remove empty/too small file
            fs.unlinkSync(destPath);
            resolve({ success: false, reason: 'file_too_small' });
          }
        } catch (e) {
          resolve({ success: false, error: e.message });
        }
      });

      fileStream.on('error', (err) => {
        try { fs.unlinkSync(destPath); } catch (_) {}
        resolve({ success: false, error: err.message });
      });
    });

    req.on('error', (err) => resolve({ success: false, error: err.message }));
    req.on('timeout', () => {
      req.destroy();
      resolve({ success: false, error: 'timeout' });
    });
  });
}

// Helper to batch execute with concurrency limit
async function asyncPool(limit, array, fn) {
  const ret = [];
  const executing = [];
  for (const item of array) {
    const p = Promise.resolve().then(() => fn(item));
    ret.push(p);
    if (limit <= array.length) {
      const e = p.then(() => executing.splice(executing.indexOf(e), 1));
      executing.push(e);
      if (executing.length >= limit) {
        await Promise.race(executing);
      }
    }
  }
  return Promise.all(ret);
}

async function run() {
  console.log('=== Connecting to MongoDB ===');
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected to MongoDB');

  // 1. Remove dummy test attackers
  const delRes = await Doctor.deleteMany({ name: /attacker/i });
  console.log(`Cleaned up ${delRes.deletedCount} dummy test records`);

  // 2. Load dataset sources
  const bddocPath = path.join(__dirname, '../../rajshahi_doctors.json');
  let bddocList = [];
  if (fs.existsSync(bddocPath)) {
    const raw = JSON.parse(fs.readFileSync(bddocPath, 'utf8'));
    bddocList = raw.doctors || [];
  }
  console.log(`Loaded ${bddocList.length} doctors from rajshahi_doctors.json (BDDoctorDirectory)`);

  const medicPath = path.join(__dirname, '../seed/medicbd_rajshahi_doctors.json');
  let medicList = [];
  if (fs.existsSync(medicPath)) {
    medicList = JSON.parse(fs.readFileSync(medicPath, 'utf8'));
  }
  console.log(`Loaded ${medicList.length} doctors from medicbd_rajshahi_doctors.json (MedicBD)`);

  // Build name-to-image lookups
  const nameToBddocImg = new Map();
  for (const doc of bddocList) {
    if (doc.image_url) {
      const norm = normalizeName(doc.name);
      if (norm) nameToBddocImg.set(norm, doc.image_url);
    }
  }

  const nameToMedicImg = new Map();
  for (const doc of medicList) {
    if (doc.image_url && !doc.image_url.includes('default-og-image') && !doc.image_url.includes('default-doctor')) {
      const norm = normalizeName(doc.name);
      if (norm) nameToMedicImg.set(norm, doc.image_url);
    }
  }

  // 3. Load all active doctors in MongoDB
  const doctors = await Doctor.find({ is_active: true });
  console.log(`Found ${doctors.length} active doctors in MongoDB to process`);

  let downloadedCount = 0;
  let alreadyExistsCount = 0;
  let failedCount = 0;
  let updatedDbCount = 0;

  console.log(`\n=== Starting download & local caching of doctor images ===`);

  await asyncPool(8, doctors, async (doctor) => {
    const slug = doctor.slug || doctor._id.toString();
    const norm = normalizeName(doctor.name);

    // Identify candidate image URLs:
    // 1) existing imageUrl in DB (if external)
    // 2) BDDoctorDirectory image
    // 3) MedicBD image
    const candidates = [];

    if (doctor.imageUrl && doctor.imageUrl.startsWith('http') && !doctor.imageUrl.includes('default-')) {
      candidates.push(doctor.imageUrl);
    }
    if (nameToBddocImg.has(norm)) {
      const url = nameToBddocImg.get(norm);
      if (!candidates.includes(url)) candidates.push(url);
    }
    if (nameToMedicImg.has(norm)) {
      const url = nameToMedicImg.get(norm);
      if (!candidates.includes(url)) candidates.push(url);
    }

    if (candidates.length === 0) {
      return;
    }

    // Determine target local filename
    const ext = candidates[0].includes('.webp') ? '.webp' : '.jpg';
    const filename = `${slug}${ext}`;
    const destPath = path.join(TARGET_DIR, filename);
    const localUrl = `/doctor-images/${filename}`;

    // If file already exists and is valid size, just update DB if needed
    if (fs.existsSync(destPath) && fs.statSync(destPath).size > 500) {
      alreadyExistsCount++;
      if (doctor.imageUrl !== localUrl) {
        doctor.imageUrl = localUrl;
        await doctor.save();
        updatedDbCount++;
      }
      return;
    }

    // Try downloading candidates in order
    let downloaded = false;
    for (const candUrl of candidates) {
      const res = await downloadImage(candUrl, destPath);
      if (res.success) {
        downloaded = true;
        downloadedCount++;
        doctor.imageUrl = localUrl;
        await doctor.save();
        updatedDbCount++;
        break;
      }
    }

    if (!downloaded) {
      failedCount++;
    }
  });

  console.log('\n=== Download & Sync Summary ===');
  console.log(`Newly downloaded: ${downloadedCount}`);
  console.log(`Already existed locally: ${alreadyExistsCount}`);
  console.log(`Failed / No valid image: ${failedCount}`);
  console.log(`Updated in MongoDB: ${updatedDbCount}`);

  // Check how many doctors now have /doctor-images/ URL
  const withLocal = await Doctor.countDocuments({ imageUrl: /^\/doctor-images\// });
  const total = await Doctor.countDocuments({ is_active: true });
  console.log(`\nDoctors with local image in DB: ${withLocal} / ${total}`);

  // List sample files created
  const files = fs.readdirSync(TARGET_DIR);
  console.log(`Total image files in frontend/public/doctor-images: ${files.length}`);
  console.log('Sample files:', files.slice(0, 10));

  process.exit(0);
}

run().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
