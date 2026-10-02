const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');

const targetDir = 'd:/Medi/frontend/public/doctor-images';
if (!fs.existsSync(targetDir)) {
  fs.mkdirSync(targetDir, { recursive: true });
}

function downloadImage(url, destPath) {
  return new Promise((resolve) => {
    const client = url.startsWith('https') ? https : http;
    const req = client.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Referer': url.includes('hamidslab') ? 'https://bddoctordirectory.hamidslab.com/' : 'https://medic.bd/'
      },
      timeout: 10000
    }, (res) => {
      if (res.statusCode === 200) {
        const fileStream = fs.createWriteStream(destPath);
        res.pipe(fileStream);
        fileStream.on('finish', () => {
          fileStream.close();
          const stats = fs.statSync(destPath);
          resolve({ success: true, size: stats.size });
        });
        fileStream.on('error', (err) => resolve({ success: false, error: err.message }));
      } else {
        resolve({ success: false, status: res.statusCode });
      }
    });
    req.on('error', (err) => resolve({ success: false, error: err.message }));
    req.on('timeout', () => { req.destroy(); resolve({ success: false, error: 'timeout' }); });
  });
}

(async () => {
  const t1 = await downloadImage('https://doctors.hamidslab.com/images/31/8931.jpg', path.join(targetDir, 'test_hamid.jpg'));
  console.log('Hamidslab download:', t1);

  const t2 = await downloadImage('https://medic.bd/assets/uploads/doctors/dr-a-k-m-asad-palash-260618054623.webp', path.join(targetDir, 'test_medic.webp'));
  console.log('Medic.bd download:', t2);
})();
