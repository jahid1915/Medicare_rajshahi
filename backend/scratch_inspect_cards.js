const https = require('https');

function fetchPage(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { 
      headers: { 
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36' 
      } 
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data));
    }).on('error', reject);
  });
}

(async () => {
  const html = await fetchPage('https://medic.bd/doctors/rajshahi-division');
  // Find img tags inside doctor profiles
  const imgRegex = /<img[^>]+src="([^">]+)"[^>]*alt="([^">]*)"/g;
  let match;
  const results = [];
  while ((match = imgRegex.exec(html)) !== null) {
    if (match[1].includes('uploads/doctors') || match[1].includes('doctor') || match[2].toLowerCase().includes('dr')) {
      results.push({ src: match[1], alt: match[2] });
    }
  }
  console.log('Found', results.length, 'doctor images on p1:');
  console.log(JSON.stringify(results.slice(0, 10), null, 2));

  // Check BDDoctorDirectory HTML structure
  const bddocHtml = await fetchPage('https://bddoctordirectory.hamidslab.com/city/rajshahi/');
  const bddocImgs = [];
  const bddocRegex = /<img[^>]+src="([^">]+)"/g;
  while ((match = bddocRegex.exec(bddocHtml)) !== null) {
    bddocImgs.push(match[1]);
  }
  console.log('BDDoctorDirectory images sample:', bddocImgs.slice(0, 10));
  const linkSample = [...bddocHtml.matchAll(/href="([^"]+)"/g)].map(m => m[1]).filter(l => l.includes('doctor') || l.includes('rajshahi'));
  console.log('BDDoctorDirectory doctor links sample:', linkSample.slice(0, 10));
})();
