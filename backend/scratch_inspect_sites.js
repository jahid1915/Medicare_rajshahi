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
      res.on('end', () => resolve({ status: res.statusCode, headers: res.headers, html: data }));
    }).on('error', reject);
  });
}

(async () => {
  try {
    const res1 = await fetchPage('https://medic.bd/doctors/rajshahi-division');
    console.log('Medic.bd status:', res1.status, 'HTML length:', res1.html.length);
    const doctorCards = res1.html.match(/<div[^>]*class="[^"]*doctor[^"]*"[^>]*>/gi) || [];
    console.log('Doctor cards found on medic.bd page 1:', doctorCards.length);
    
    // Check doctor links
    const docLinks = [...res1.html.matchAll(/href="(https:\/\/medic\.bd\/doctor\/[^"]+)"/g)].map(m => m[1]);
    const uniqueDocLinks = [...new Set(docLinks)];
    console.log('Unique doctor profile links:', uniqueDocLinks.length);

    // Check pagination
    const pageLinks = [...res1.html.matchAll(/href="([^"]*rajshahi-division[^"]*page=\d+[^"]*)"/g)].map(m => m[1]);
    console.log('Pagination links found:', [...new Set(pageLinks)]);

    const res2 = await fetchPage('https://bddoctordirectory.hamidslab.com/city/rajshahi/');
    console.log('BDDoctorDirectory status:', res2.status, 'HTML length:', res2.html.length);
    const bddocLinks = [...res2.html.matchAll(/href="(https:\/\/bddoctordirectory\.hamidslab\.com\/doctor\/[^"]+)"/g)].map(m => m[1]);
    console.log('BDDoctorDirectory doctor links on p1:', [...new Set(bddocLinks)].length);
  } catch (err) {
    console.error('Error fetching:', err);
  }
})();
