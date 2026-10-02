const https = require('https');

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

(async () => {
  const res = await fetchUrl('https://bddoctordirectory.hamidslab.com/city/rajshahi/');
  console.log('Status:', res.status, 'HTML length:', res.html.length);
  // Match doctor card or blocks
  // Find doctor images with alt or titles
  const imgMatches = [...res.html.matchAll(/<img[^>]+src="([^">]+)"[^>]*alt="([^">]*)"[^>]*>/gi)];
  console.log('Img count on BDDoctorDirectory p1:', imgMatches.length);
  const docImgs = imgMatches.filter(m => m[1].includes('hamidslab.com/images') || m[2].toLowerCase().includes('dr'));
  console.log('Doc images sample:', docImgs.slice(0, 5).map(m => ({ src: m[1], alt: m[2] })));
})();
