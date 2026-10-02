const https = require('https');
const fs = require('fs');

function fetchUrl(url) {
  return new Promise((resolve) => {
    https.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8'
      },
      timeout: 10000
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ status: res.statusCode, html: data }));
    }).on('error', (err) => resolve({ status: 500, error: err.message, html: '' }))
      .on('timeout', () => resolve({ status: 408, error: 'timeout', html: '' }));
  });
}

function parseDoctorCards(html) {
  const doctors = [];
  // Match doctor card or blocks
  // In medic.bd: doctors have links like <a href="https://medic.bd/doctor/..." and img tags with alt="Dr. ..." or src="...uploads/doctors/..."
  const profileMatches = [...html.matchAll(/<a[^>]+href="(https:\/\/medic\.bd\/doctor\/[^"]+)"[^>]*>([\s\S]*?)<\/a>/gi)];
  
  // Or match img tags
  const imgMatches = [...html.matchAll(/<img[^>]+src="([^">]+)"[^>]*alt="([^">]*)"[^>]*>/gi)];
  for (const m of imgMatches) {
    const src = m[1];
    const alt = m[2].trim();
    if (alt && (alt.toLowerCase().includes('dr') || alt.toLowerCase().includes('prof')) && !alt.toLowerCase().includes('icon')) {
      doctors.push({ name: alt, imageUrl: src });
    }
  }
  return doctors;
}

(async () => {
  console.log('Testing page 1 parse...');
  const res = await fetchUrl('https://medic.bd/doctors/rajshahi-division?page=1');
  const docs = parseDoctorCards(res.html);
  console.log(`Found ${docs.length} doctor image entries on page 1:`);
  console.log(docs.slice(0, 5));
})();
