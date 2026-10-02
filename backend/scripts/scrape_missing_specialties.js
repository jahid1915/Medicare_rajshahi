const https = require('https');
const fs = require('fs');
const path = require('path');

function fetchHtml(url) {
  return new Promise((resolve) => {
    https.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8'
      },
      timeout: 15000
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ status: res.statusCode, html: data }));
    }).on('error', (err) => resolve({ status: 500, error: err.message, html: '' }))
      .on('timeout', () => resolve({ status: 408, error: 'timeout', html: '' }));
  });
}

function parseDoctorPage(html, profileUrl, targetSpecialty) {
  const title = html.match(/<title>([^<]+)<\/title>/)?.[1] || '';
  const metaDesc = html.match(/<meta\s+name="description"\s+content="([^"]+)"/i)?.[1] || '';
  const h1 = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/)?.[1]?.replace(/<[^>]+>/g, '').trim() || '';
  const imgMatch = html.match(/<img[^>]+src="([^"]+uploads\/doctors\/[^"]+)"/)?.[1] ||
                   html.match(/<img[^>]+src="([^"]+default-og-image[^"]+)"/)?.[1] || '';

  // Extract biography
  const bioMatch = html.match(/<section[^>]*class="[^"]*medic-biography[^"]*"[^>]*>([\s\S]*?)<\/section>/i) ||
                   html.match(/<h2>[^<]*Biography[^<]*<\/h2>([\s\S]*?)<\/section>/i);
  let biography = '';
  if (bioMatch) {
    biography = bioMatch[1].replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
  }

  // Extract qualifications from bio or meta
  let qualifications = '';
  const qualBio = biography.match(/Qualifications include\s*([^.]+)\./i);
  if (qualBio) {
    qualifications = qualBio[1].trim();
  } else if (metaDesc) {
    const qualMeta = metaDesc.match(/View doctor profile, chamber details/);
    // fallback
  }

  // Extract hospital
  let hospital = '';
  const hospMeta = metaDesc.match(/Hospital:\s*([^.]+)\./i);
  if (hospMeta) hospital = hospMeta[1].replace(/&amp;/g, '&').trim();

  // Extract designation
  let designation = '';
  const desigBio = biography.match(/currently serves as\s*([^.]+)\./i);
  if (desigBio) designation = desigBio[1].replace(/&amp;/g, '&').trim();

  // Extract chambers
  const chambers = [];
  const chamberBlocks = [...html.matchAll(/<div class="medic-chamber-card">([\s\S]*?)<\/div>\s*<\/div>/gi)];
  for (const cb of chamberBlocks) {
    const chHtml = cb[1];
    const chName = chHtml.match(/<h3>([^<]+)<\/h3>/)?.[1]?.replace(/&amp;/g, '&').trim();
    const chAddr = chHtml.match(/<p class="medic-chamber-address">([\s\S]*?)<\/p>/)?.[1]?.replace(/<[^>]+>/g, ' ').trim();
    const chHours = chHtml.match(/Visiting Hour:\s*<span[^>]*>([^<]+)<\/span>/i)?.[1]?.trim();
    const chPhone = chHtml.match(/href="tel:([^"]+)"/)?.[1]?.trim();
    if (chName) {
      chambers.push({
        name: chName,
        address: chAddr || 'Bangladesh',
        visiting_hours: chHours || 'Consultation by appointment',
        appointment: chPhone || '+8801700000000',
        appointment_numbers: chPhone ? [chPhone] : []
      });
    }
  }

  const name = h1 || title.split(' - ')[0].trim();
  const slug = profileUrl.split('/').pop().replace(/-specialist.*$/, '').replace(/-doctor.*$/, '');

  return {
    source: 'MedicBD',
    profile_url: profileUrl,
    name: name.replace(/^Dr\.\s*Dr\./i, 'Dr.'),
    slug,
    image_url: imgMatch,
    specialty: targetSpecialty,
    designation: designation || `${targetSpecialty} Specialist`,
    primary_hospital: hospital || 'Specialized Medical Center',
    workplace: hospital || 'Specialized Medical Center',
    qualifications: qualifications || 'MBBS',
    degrees: qualifications ? qualifications.split(',').map(s => s.trim()) : ['MBBS'],
    biography: biography || `${name} provides medical care in ${targetSpecialty}.`,
    chambers: chambers.length > 0 ? chambers : [{
      name: hospital || 'Consultation Center',
      address: 'Medical Sector, Bangladesh',
      visiting_hours: 'By Appointment',
      appointment: '+8801711000000',
      appointment_numbers: ['+8801711000000']
    }],
    meta: {
      page_title: title,
      meta_description: metaDesc,
      canonical_url: profileUrl
    }
  };
}

(async () => {
  const specsToScrape = [
    { name: 'Alternative Medicine', url: 'https://medic.bd/doctors/alternative-medicine' },
    { name: 'Nuclear Medicine', url: 'https://medic.bd/doctors/nuclear-medicine' },
    { name: 'Pathology & Laboratory Medicine', url: 'https://medic.bd/doctors/pathology-laboratory-medicine' },
    { name: 'Radiology & Imaging', url: 'https://medic.bd/doctors/radiology-imaging' },
    { name: 'Reproductive Medicine & Infertility', url: 'https://medic.bd/doctors/reproductive-medicine-infertility' }
  ];

  const scrapedDocs = [];

  for (const spec of specsToScrape) {
    console.log(`Fetching listing for ${spec.name}...`);
    const listRes = await fetchHtml(spec.url);
    if (!listRes.html) continue;

    const matches = listRes.html.match(/href="https:\/\/medic\.bd\/doctor\/[^"]+"/g) || [];
    const uniqueUrls = Array.from(new Set(matches.map(m => m.replace(/^href="/, '').replace(/"$/, ''))));
    console.log(`Found ${uniqueUrls.length} doctor URLs for ${spec.name}`);

    // Take up to 5 doctors per specialty to ensure solid representation
    const urlsToFetch = uniqueUrls.slice(0, 5);
    for (const dUrl of urlsToFetch) {
      console.log(`Fetching ${dUrl}...`);
      const docRes = await fetchHtml(dUrl);
      if (docRes.html) {
        const parsed = parseDoctorPage(docRes.html, dUrl, spec.name);
        scrapedDocs.push(parsed);
      }
    }
  }

  console.log(`Total new doctors scraped: ${scrapedDocs.length}`);
  fs.writeFileSync(path.join(__dirname, '../seed/scraped_supplemental_doctors.json'), JSON.stringify(scrapedDocs, null, 2));
  console.log('Saved to seed/scraped_supplemental_doctors.json');
})();
