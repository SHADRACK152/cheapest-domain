// test-apis.js — quick connectivity test for pricing APIs
const https = require('https');

function postJson(hostname, path, body) {
  return new Promise((resolve, reject) => {
    const buf = Buffer.from(JSON.stringify(body));
    const req = https.request({
      hostname, path, method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': buf.length,
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'application/json',
      },
    }, res => {
      const location = res.headers['location'] || '';
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => resolve({ status: res.statusCode, location, body: d }));
    });
    req.on('error', reject);
    req.write(buf);
    req.end();
  });
}

function getUrl(url) {
  return new Promise((resolve, reject) => {
    const u = new URL(url);
    https.get({
      hostname: u.hostname, path: u.pathname + (u.search || ''),
      headers: { 'User-Agent': 'Mozilla/5.0', Accept: 'application/json' },
    }, res => {
      const location = res.headers['location'] || '';
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => resolve({ status: res.statusCode, location, body: d }));
    }).on('error', reject);
  });
}

async function main() {
  console.log('Testing APIs...\n');

  // 1. Porkbun
  try {
    const r = await postJson('porkbun.com', '/api/json/v3/pricing/get', { secretapikey: '', apikey: '' });
    console.log(`Porkbun  HTTP ${r.status}  body[0:200]: ${r.body.slice(0,200)}`);
  } catch(e) { console.log(`Porkbun  ERROR: ${e.message}`); }

  // 2. Dynadot (following redirect manually)
  try {
    const r1 = await getUrl('https://www.dynadot.com/domain/tld.json');
    console.log(`Dynadot  HTTP ${r1.status}  location: ${r1.location}  body[0:200]: ${r1.body.slice(0,200)}`);
    if (r1.status >= 300 && r1.status < 400 && r1.location) {
      const r2 = await getUrl(r1.location.startsWith('http') ? r1.location : 'https://www.dynadot.com' + r1.location);
      console.log(`Dynadot  redirect→ HTTP ${r2.status}  body[0:200]: ${r2.body.slice(0,200)}`);
    }
  } catch(e) { console.log(`Dynadot  ERROR: ${e.message}`); }

  // 3. ntldstats public API (alternative)
  try {
    const r = await getUrl('https://ntldstats.com/api/tld/_all');
    console.log(`ntldstats HTTP ${r.status}  body[0:200]: ${r.body.slice(0,200)}`);
  } catch(e) { console.log(`ntldstats ERROR: ${e.message}`); }
}

main();
