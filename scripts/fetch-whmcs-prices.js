/**
 * fetch-whmcs-prices.js
 *
 * Run locally (not from Vercel/CI) to pull live TLD pricing from TrueHost WHMCS
 * and cache the result to data/tld-prices.json.
 *
 * Usage:
 *   node scripts/fetch-whmcs-prices.js
 *
 * Then commit data/tld-prices.json so Vercel can read it at runtime without
 * needing a direct WHMCS connection.
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

// Load from .env.local if present
try {
  const envFile = fs.readFileSync(path.join(__dirname, '../.env.local'), 'utf8');
  envFile.split('\n').forEach(line => {
    const [k, ...rest] = line.split('=');
    if (k && rest.length && !process.env[k.trim()]) {
      process.env[k.trim()] = rest.join('=').trim();
    }
  });
} catch {}

const IDENTIFIER = process.env.TRUEHOST_IDENTIFIER;
const SECRET     = process.env.TRUEHOST_SECRET;
const ACCESSKEY  = process.env.TRUEHOST_ACCESSKEY;
const ENDPOINT   = process.env.TRUEHOST_ENDPOINT || 'https://truehost.co.ke/cloud/includes/api.php';

if (!IDENTIFIER || !SECRET) {
  console.error('❌ TRUEHOST_IDENTIFIER and TRUEHOST_SECRET must be set in .env.local');
  process.exit(1);
}

function post(action, extra) {
  return new Promise((resolve, reject) => {
    const params = { identifier: IDENTIFIER, secret: SECRET, action, responsetype: 'json', ...extra };
    if (ACCESSKEY) params.accesskey = ACCESSKEY;
    const body = new URLSearchParams(params).toString();
    const u = new URL(ENDPOINT);
    const opts = {
      hostname: u.hostname,
      path: u.pathname,
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': Buffer.byteLength(body),
        'User-Agent': 'Mozilla/5.0 (compatible; CheapestDomains/1.0)',
        'Accept': 'application/json',
      },
    };
    let data = '';
    const req = https.request(opts, (res) => {
      res.on('data', (c) => (data += c));
      res.on('end', () => resolve({ status: res.statusCode, body: data }));
    });
    req.on('error', (e) => resolve({ status: 0, body: `ERROR: ${e.message}` }));
    req.write(body);
    req.end();
  });
}

(async () => {
  console.log('📡 Fetching TLD pricing from WHMCS...');
  console.log(`   Endpoint: ${ENDPOINT}`);

  const r = await post('GetTLDPricing', { currencyid: 1 });

  if (r.status === 0) {
    console.error('❌ Network error:', r.body);
    process.exit(1);
  }

  let json;
  try {
    json = JSON.parse(r.body);
  } catch {
    console.error(`❌ Non-JSON response (HTTP ${r.status}):`, r.body.slice(0, 500));
    process.exit(1);
  }

  if (json.result === 'error') {
    console.error(`❌ WHMCS error: ${json.message}`);
    console.error('   Check your credentials in .env.local');
    process.exit(1);
  }

  if (!json.pricing) {
    console.error('❌ No pricing data in response:', JSON.stringify(json).slice(0, 300));
    process.exit(1);
  }

  // Transform WHMCS pricing into our format
  // WHMCS: { pricing: { '.com': { register: { '1': '10.00' }, renew: { '1': '12.00' } } } }
  const output = {};
  const pricing = json.pricing;

  Object.entries(pricing).forEach(([tld, data]) => {
    const ext = tld.startsWith('.') ? tld : `.${tld}`;
    const reg   = parseFloat(data?.register?.['1'] ?? data?.register ?? '0') || 0;
    const renew = parseFloat(data?.renew?.['1']    ?? data?.renew    ?? '0') || 0;
    if (reg > 0) {
      output[ext] = { reg, renew: renew || reg };
    }
  });

  const tldCount = Object.keys(output).length;
  if (tldCount === 0) {
    console.error('❌ Pricing parsed but 0 TLDs found. Raw keys:', Object.keys(pricing).slice(0, 10));
    process.exit(1);
  }

  const outPath = path.join(__dirname, '../data/tld-prices.json');
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, JSON.stringify({
    fetchedAt: new Date().toISOString(),
    currencyId: 1,
    currency: json.currency ?? 'USD',
    exchange: { USD_TO_KES: parseFloat(process.env.USD_TO_KES_RATE) || 150 },
    tlds: output,
  }, null, 2));

  console.log(`✅ Saved ${tldCount} TLDs to data/tld-prices.json`);
  console.log('   Sample:', JSON.stringify(Object.fromEntries(Object.entries(output).slice(0, 5)), null, 2));
  console.log('\n📌 Now commit data/tld-prices.json so Vercel uses live prices automatically.');
})();
