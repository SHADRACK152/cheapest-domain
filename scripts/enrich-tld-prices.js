/**
 * enrich-tld-prices.js  (v2)
 *
 * 1. Downloads ICANN registry agreements CSV to classify TLDs as:
 *      - brand    → "Brand (Spec 13)" in agreement type = owned by one company, NOT publicly registrable
 *      - public   → generic/country, publicly available
 * 2. Fetches live pricing from TrueHost WHMCS (if .env.local creds set)
 * 3. Adds known Cloudflare at-cost USD pricing for well-known TLDs
 * 4. Merges registrar availability data
 * 5. Tags unregistrable brand TLDs so the UI can hide them
 *
 * Usage:
 *   node scripts/enrich-tld-prices.js
 *
 * Then commit data/tld-prices.json
 */

const https = require('https');
const fs    = require('fs');
const path  = require('path');

// ── Helpers ────────────────────────────────────────────────────────────────────

function httpsGet(url, redirectDepth = 0) {
  if (redirectDepth > 5) return Promise.reject(new Error('Too many redirects'));
  return new Promise((resolve, reject) => {
    https.get(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)', Accept: '*/*' },
    }, res => {
      if ((res.statusCode === 301 || res.statusCode === 302) && res.headers.location) {
        const next = res.headers.location.startsWith('http')
          ? res.headers.location
          : new URL(res.headers.location, url).href;
        resolve(httpsGet(next, redirectDepth + 1));
        return;
      }
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => resolve({ status: res.statusCode, body: data }));
    }).on('error', reject);
  });
}

function httpsPost(url, body, contentType = 'application/x-www-form-urlencoded') {
  return new Promise((resolve, reject) => {
    const u   = new URL(url);
    const buf = Buffer.from(body);
    const req = https.request({
      hostname: u.hostname,
      path: u.pathname + (u.search || ''),
      method: 'POST',
      headers: {
        'Content-Type': contentType,
        'Content-Length': buf.length,
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
        Accept: 'application/json',
      },
    }, res => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => resolve({ status: res.statusCode, body: data }));
    });
    req.on('error', reject);
    req.write(buf);
    req.end();
  });
}

/** Parse a simple CSV (quoted fields, no embedded newlines) */
function parseCSV(text) {
  const lines = text.trim().split('\n');
  const headers = [];
  // Parse header
  let cur = '', inQ = false;
  for (let i = 0; i < lines[0].length; i++) {
    const ch = lines[0][i];
    if (ch === '"') { inQ = !inQ; continue; }
    if (ch === ',' && !inQ) { headers.push(cur.trim()); cur = ''; continue; }
    cur += ch;
  }
  headers.push(cur.trim());

  return lines.slice(1).map(line => {
    const cols = [];
    cur = ''; inQ = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (ch === '"') { inQ = !inQ; continue; }
      if (ch === ',' && !inQ) { cols.push(cur.trim()); cur = ''; continue; }
      cur += ch;
    }
    cols.push(cur.trim());
    const row = {};
    headers.forEach((h, i) => { row[h] = cols[i] || ''; });
    return row;
  });
}

// ── Load .env.local ────────────────────────────────────────────────────────────

try {
  const envPath = path.join(__dirname, '../.env.local');
  if (fs.existsSync(envPath)) {
    fs.readFileSync(envPath, 'utf8').split('\n').forEach(line => {
      const [k, ...rest] = line.split('=');
      if (k && rest.length && !process.env[k.trim()]) {
        process.env[k.trim()] = rest.join('=').trim().replace(/^["']|["']$/g, '');
      }
    });
  }
} catch {}

// ── Load tld-prices.json ──────────────────────────────────────────────────────

const pricesFile = path.join(__dirname, '../data/tld-prices.json');
const pricesData = JSON.parse(fs.readFileSync(pricesFile, 'utf-8'));
const USD_TO_KES = pricesData.exchange?.USD_TO_KES || 150;

console.log(`\nLoaded tld-prices.json  — ${Object.keys(pricesData.tlds).length} TLDs, USD→KES rate: ${USD_TO_KES}`);

function usdToKes(usd) { return Math.round(parseFloat(usd || 0) * USD_TO_KES); }

// ── Step 1: ICANN Registry Agreements CSV ─────────────────────────────────────

async function fetchIcannClassification() {
  console.log('\n[1/3] Fetching ICANN registry agreements CSV...');
  const brandTlds   = new Set();
  const publicTlds  = new Set();
  const operatorMap = {};

  try {
    const res = await httpsGet('https://www.icann.org/en/registry-agreements/csvdownload');
    if (res.status !== 200) {
      console.log(`  ⚠ ICANN CSV HTTP ${res.status}`);
      return { brandTlds, publicTlds, operatorMap };
    }

    const rows = parseCSV(res.body);
    console.log(`  ✓ ICANN CSV: ${rows.length} registry entries`);

    rows.forEach(row => {
      const tld = (row['Top Level Domain'] || '').trim().toLowerCase();
      if (!tld) return;
      const key = '.' + tld;
      const agreementType = (row['Agreement Type'] || '').toLowerCase();
      operatorMap[key] = row['Operator'] || '';

      if (agreementType.includes('brand (spec 13)')) {
        brandTlds.add(key);
      } else {
        publicTlds.add(key);
      }
    });

    console.log(`  Brand TLDs (not publicly registrable) : ${brandTlds.size}`);
    console.log(`  Public/open TLDs                       : ${publicTlds.size}`);
  } catch (e) {
    console.log(`  ✗ ICANN CSV failed: ${e.message}`);
  }

  return { brandTlds, publicTlds, operatorMap };
}

// ── Step 2: TrueHost WHMCS pricing ───────────────────────────────────────────

async function fetchTruehost() {
  console.log('\n[2/3] Fetching TrueHost WHMCS pricing...');
  const IDENTIFIER = process.env.TRUEHOST_IDENTIFIER;
  const SECRET     = process.env.TRUEHOST_SECRET;
  const ACCESSKEY  = process.env.TRUEHOST_ACCESSKEY;
  const ENDPOINT   = process.env.TRUEHOST_ENDPOINT || 'https://truehost.co.ke/cloud/includes/api.php';

  if (!IDENTIFIER || !SECRET) {
    console.log('  ⚠ TRUEHOST_IDENTIFIER/SECRET not set in .env.local — skipping');
    console.log('    → Add credentials to .env.local and re-run to populate live TrueHost prices');
    return {};
  }

  const params = new URLSearchParams({
    identifier: IDENTIFIER,
    secret: SECRET,
    action: 'GetTLDPricing',
    responsetype: 'json',
  });
  if (ACCESSKEY) params.append('accesskey', ACCESSKEY);

  try {
    const res = await httpsPost(ENDPOINT, params.toString());
    if (res.status === 200) {
      const json = JSON.parse(res.body);
      if (json.result === 'success' && json.pricing) {
        console.log(`  ✓ TrueHost returned ${Object.keys(json.pricing).length} TLDs`);
        // Normalise: convert each entry to { reg, renew } in KES for year-1
        const normalised = {};
        for (const [tld, data] of Object.entries(json.pricing)) {
          const reg   = parseFloat((data.register  && data.register['1'])  || 0);
          const renew = parseFloat((data.renew      && data.renew['1'])     || 0);
          if (reg || renew) normalised[tld] = { reg, renew };
        }
        return normalised;
      }
      console.log(`  ⚠ TrueHost: ${json.result || json.message || res.body.slice(0, 120)}`);
    } else {
      console.log(`  ⚠ TrueHost HTTP ${res.status}: ${res.body.slice(0, 200)}`);
    }
  } catch (e) {
    console.log(`  ✗ TrueHost failed: ${e.message}`);
  }
  return {};
}

// ── Step 3: Cloudflare at-cost reference pricing (USD) ───────────────────────
// Source: https://developers.cloudflare.com/registrar/reference/tld-pricing/
// These are wholesale/at-cost prices — useful as price floor reference.

const CLOUDFLARE_PRICING_USD = {
  '.com': 9.15, '.net': 10.44, '.org': 10.44, '.info': 10.44, '.biz': 12.99,
  '.io': 32.00, '.me': 19.60, '.co': 26.00, '.us': 9.15, '.uk': 10.44,
  '.ca': 12.99, '.au': 19.60, '.de': 11.44, '.nl': 11.44, '.fr': 12.99,
  '.es': 12.99, '.it': 12.99, '.pl': 12.99, '.br': 25.00,
  '.in': 9.15, '.jp': 45.00, '.cn': 25.00, '.eu': 9.15,
  '.app': 14.00, '.dev': 12.00, '.page': 14.00, '.tools': 22.00,
  '.blog': 22.00, '.site': 17.85, '.online': 24.00, '.tech': 34.00,
  '.store': 22.00, '.shop': 22.00, '.live': 17.85, '.news': 22.00,
  '.media': 22.00, '.design': 34.00, '.world': 22.00, '.today': 20.00,
  '.space': 12.00, '.link': 5.00, '.click': 5.00, '.email': 20.00,
  '.zone': 22.00, '.club': 12.00, '.group': 12.00, '.team': 22.00,
  '.work': 9.15, '.works': 22.00, '.solutions': 22.00, '.services': 22.00,
  '.agency': 22.00, '.company': 12.00, '.business': 12.00, '.ventures': 22.00,
  '.network': 22.00, '.systems': 22.00, '.digital': 22.00, '.software': 22.00,
  '.cloud': 22.00, '.data': 22.00, '.ai': 79.00,
  '.health': 65.00, '.care': 34.00, '.life': 22.00,
  '.academy': 26.00, '.education': 12.00, '.school': 22.00, '.college': 34.00,
  '.university': 34.00, '.institute': 22.00, '.training': 22.00,
  '.estate': 22.00, '.house': 22.00, '.homes': 22.00, '.property': 22.00,
  '.realestate': 22.00, '.rent': 20.00,
  '.photography': 26.00, '.photos': 22.00, '.pictures': 12.00, '.gallery': 22.00,
  '.video': 22.00, '.audio': 22.00, '.music': 22.00, '.film': 56.00,
  '.tv': 30.00, '.movie': 22.00,
  '.restaurant': 34.00, '.cafe': 26.00, '.bar': 22.00,
  '.coffee': 26.00, '.beer': 26.00, '.wine': 22.00, '.kitchen': 22.00,
  '.yoga': 22.00, '.fitness': 22.00, '.sport': 22.00, '.football': 22.00,
  '.golf': 22.00, '.ski': 22.00,
  '.legal': 34.00, '.law': 22.00, '.attorney': 26.00, '.lawyer': 26.00,
  '.tax': 34.00, '.finance': 34.00, '.money': 22.00, '.bank': 100.00,
  '.insurance': 100.00, '.mortgage': 34.00, '.loan': 22.00, '.credit': 22.00,
  '.medical': 22.00, '.doctor': 34.00, '.pharmacy': 34.00, '.dental': 25.00,
  '.marketing': 26.00, '.consulting': 26.00, '.management': 26.00,
  '.partners': 22.00, '.investments': 34.00,
  '.africa': 22.00, '.london': 34.00, '.nyc': 22.00, '.berlin': 34.00,
  '.paris': 34.00, '.tokyo': 22.00, '.sydney': 34.00,
  '.miami': 22.00, '.vegas': 34.00, '.boston': 22.00,
  '.xxx': 75.00, '.sex': 75.00, '.adult': 75.00, '.porn': 75.00,
  '.xyz': 9.15, '.top': 4.00, '.pw': 9.15, '.cc': 19.50,
  '.gg': 32.00, '.vip': 12.00, '.pro': 12.00,
  '.name': 9.15, '.mobi': 10.44, '.coop': 34.00, '.aero': 90.00,
  '.tel': 9.15, '.travel': 56.00, '.museum': 75.00,
  '.accountant': 23.00, '.accountants': 110.00, '.actor': 28.00,
  '.apartments': 35.00, '.art': 14.00, '.asia': 13.00, '.associates': 22.00,
  '.auction': 22.00, '.bike': 22.00, '.bio': 20.00, '.black': 28.00,
  '.blue': 12.00, '.boutique': 22.00, '.builders': 22.00, '.cab': 22.00,
  '.camera': 35.00, '.camp': 35.00, '.capital': 35.00, '.cards': 22.00,
  '.careers': 35.00, '.cash': 22.00, '.catering': 22.00, '.center': 12.00,
  '.chat': 22.00, '.cheap': 22.00, '.christmas': 22.00, '.city': 12.00,
  '.claims': 35.00, '.cleaning': 22.00, '.clinic': 35.00, '.clothing': 22.00,
  '.codes': 35.00, '.community': 22.00, '.computer': 22.00, '.condos': 35.00,
  '.construction': 22.00, '.contractors': 22.00, '.cooking': 22.00,
  '.cool': 22.00, '.country': 22.00, '.coupons': 35.00, '.credit': 22.00,
  '.cruises': 35.00, '.dance': 12.00, '.dating': 35.00, '.deals': 22.00,
  '.delivery': 35.00, '.democrat': 22.00, '.diamonds': 35.00, '.diet': 22.00,
  '.direct': 22.00, '.directory': 12.00, '.discount': 22.00,
  '.domains': 35.00, '.earth': 12.00, '.eco': 65.00, '.engineering': 35.00,
  '.enterprises': 22.00, '.equipment': 12.00, '.events': 22.00,
  '.exchange': 22.00, '.expert': 35.00, '.exposed': 12.00, '.express': 22.00,
  '.fail': 22.00, '.farm': 22.00, '.fish': 22.00, '.flights': 35.00,
  '.florist': 22.00, '.forsale': 22.00, '.foundation': 22.00, '.fun': 12.00,
  '.fund': 35.00, '.furniture': 35.00, '.fyi': 12.00,
  '.games': 12.00, '.gift': 12.00, '.gifts': 22.00, '.gives': 22.00,
  '.glass': 35.00, '.global': 65.00, '.green': 65.00, '.gripe': 22.00,
  '.guide': 22.00, '.guru': 22.00, '.heating': 22.00, '.help': 12.00,
  '.hockey': 35.00, '.holdings': 35.00, '.holiday': 35.00, '.hospital': 35.00,
  '.hosting': 22.00, '.hot': 22.00, '.how': 12.00,
  '.immo': 22.00, '.immobilien': 22.00, '.industries': 22.00,
  '.ink': 12.00, '.land': 22.00, '.lease': 35.00, '.lgbt': 35.00,
  '.limited': 22.00, '.limo': 35.00, '.loans': 110.00, '.ltd': 12.00,
  '.maison': 35.00, '.management': 22.00, '.mba': 22.00,
  '.ninja': 12.00, '.one': 9.15, '.pet': 12.00, '.photography': 22.00,
  '.place': 12.00, '.plumbing': 35.00, '.plus': 22.00, '.press': 35.00,
  '.productions': 22.00, '.properties': 22.00, '.purchase': 22.00,
  '.recipes': 35.00, '.red': 12.00, '.rehab': 22.00, '.reise': 35.00,
  '.reisen': 12.00, '.reit': 65.00, '.repairs': 22.00, '.republican': 22.00,
  '.reviews': 12.00, '.rip': 12.00, '.rocks': 12.00, '.rodeo': 12.00,
  '.run': 12.00, '.sale': 22.00, '.salon': 35.00, '.sarl': 12.00,
  '.schule': 12.00, '.science': 22.00, '.scot': 22.00,
  '.singles': 22.00, '.soccer': 12.00, '.social': 22.00,
  '.solar': 35.00, '.surgery': 35.00,
  '.tattoo': 22.00, '.tienda': 35.00, '.tips': 12.00, '.tires': 35.00,
  '.today': 12.00, '.tours': 35.00, '.town': 22.00, '.toys': 35.00,
  '.trade': 22.00, '.vacations': 22.00, '.ventures': 35.00,
  '.viajes': 35.00, '.villas': 35.00, '.vision': 22.00,
  '.vodka': 12.00, '.voyage': 35.00,
  '.watch': 22.00, '.webcam': 22.00, '.wedding': 12.00,
  '.wiki': 12.00, '.wine': 35.00, '.wtf': 22.00,
  '.xn--p1ai': 9.15,  // .рф (Russia)
};

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  const [{ brandTlds, publicTlds, operatorMap }, truehostData] = await Promise.all([
    fetchIcannClassification(),
    fetchTruehost(),
  ]);

  console.log('\n─── Enriching tld-prices.json ───');

  let brandTagged = 0, cfFilled = 0, truehostFilled = 0, newFromTruehost = 0;

  // Apply ICANN classification flags
  for (const [tld, entry] of Object.entries(pricesData.tlds)) {
    if (brandTlds.has(tld)) {
      entry.brand    = true;
      entry.public   = false;
      entry.operator = operatorMap[tld] || null;
      brandTagged++;
    } else if (publicTlds.has(tld)) {
      entry.brand    = false;
      entry.public   = true;
      entry.operator = operatorMap[tld] || null;
    }
  }
  console.log(`  ICANN flags applied — ${brandTagged} brand TLDs marked as non-public`);

  // Apply Cloudflare at-cost pricing for unpriced public TLDs
  for (const [tld, usdPrice] of Object.entries(CLOUDFLARE_PRICING_USD)) {
    if (!usdPrice || !pricesData.tlds[tld]) continue;
    const entry = pricesData.tlds[tld];
    if (entry.brand === true) continue; // skip brand TLDs
    if (entry.reg === 0 && entry.renew === 0) {
      entry.reg   = usdToKes(usdPrice);
      entry.renew = usdToKes(usdPrice);
      entry.sources = { ...(entry.sources || {}), cloudflare_wholesale_usd: { reg: usdPrice, renew: usdPrice } };
      entry.registrars = [...new Set([...(entry.registrars || []), 'Cloudflare'])];
      cfFilled++;
    } else {
      // Already priced — add Cloudflare as an alternative registrar
      entry.registrars = [...new Set([...(entry.registrars || []), 'Cloudflare'])];
      entry.sources = { ...(entry.sources || {}), cloudflare_wholesale_usd: { reg: usdPrice, renew: usdPrice } };
    }
  }
  console.log(`  Cloudflare at-cost — filled ${cfFilled} previously-unpriced TLDs`);

  // Clean up: remove stale TrueHost attributions for TLDs with no verified WHMCS source.
  // Prices in the JSON may have come from a legacy WHMCS cache; without a live confirmation
  // via sources.truehost, we can't claim TrueHost actually sells the TLD.
  for (const entry of Object.values(pricesData.tlds)) {
    if (Array.isArray(entry.registrars) && entry.registrars.includes('TrueHost')) {
      if (!entry.sources?.truehost) {
        entry.registrars = entry.registrars.filter(r => r !== 'TrueHost');
        if (!entry.registrars.length) delete entry.registrars;
      }
    }
  }
  console.log(`  Stale TrueHost registrar tags cleaned`);

  // Apply TrueHost WHMCS pricing (authoritative — overwrites estimates)
  for (const [rawTld, prices] of Object.entries(truehostData)) {
    const tld = '.' + rawTld.toLowerCase().replace(/^\./, '');
    const reg   = prices.reg;
    const renew = prices.renew;
    if (!reg && !renew) continue;

    if (!pricesData.tlds[tld]) {
      pricesData.tlds[tld] = {
        reg, renew, brand: false, public: true,
        registrars: ['TrueHost'],
        sources: { truehost: { reg, renew } },
      };
      newFromTruehost++;
    } else {
      pricesData.tlds[tld].reg   = reg;
      pricesData.tlds[tld].renew = renew;
      pricesData.tlds[tld].registrars = [...new Set([...(pricesData.tlds[tld].registrars || []), 'TrueHost'])];
      pricesData.tlds[tld].sources = { ...(pricesData.tlds[tld].sources || {}), truehost: { reg, renew } };
      truehostFilled++;
    }
  }
  if (truehostFilled || newFromTruehost)
    console.log(`  TrueHost WHMCS     — updated ${truehostFilled}, added ${newFromTruehost} new`);

  // Sort keys alphabetically
  const sorted = {};
  Object.keys(pricesData.tlds).sort().forEach(k => { sorted[k] = pricesData.tlds[k]; });
  pricesData.tlds = sorted;

  // Final stats
  const allKeys       = Object.keys(pricesData.tlds);
  const brandCount    = allKeys.filter(k => pricesData.tlds[k].brand === true).length;
  const publicPriced  = allKeys.filter(k => pricesData.tlds[k].brand !== true && (pricesData.tlds[k].reg > 0 || pricesData.tlds[k].renew > 0)).length;
  const stillUnpriced = allKeys.filter(k => pricesData.tlds[k].brand !== true && pricesData.tlds[k].reg === 0 && pricesData.tlds[k].renew === 0);
  const withReg       = allKeys.filter(k => (pricesData.tlds[k].registrars || []).length > 0).length;

  console.log(`\n════════════════════════════════════════════`);
  console.log(`  Total TLDs                  : ${allKeys.length}`);
  console.log(`  Brand/corporate (not public): ${brandCount}  ← hidden from search/pricing UI`);
  console.log(`  Public + priced             : ${publicPriced}`);
  console.log(`  Public + still unpriced     : ${stillUnpriced.length}`);
  console.log(`  TLDs with registrar info    : ${withReg}`);
  console.log(`════════════════════════════════════════════`);

  if (stillUnpriced.length) {
    console.log(`\n  Remaining unpriced public TLDs:`);
    console.log(`  ${stillUnpriced.slice(0, 30).join(', ')}`);
    console.log(`\n  → Run node scripts/fetch-whmcs-prices.js (needs TRUEHOST creds in .env.local)`);
    console.log(`    OR set prices manually via /admin/domains`);
  }

  pricesData.fetchedAt = new Date().toISOString();
  fs.writeFileSync(pricesFile, JSON.stringify(pricesData, null, 2));

  // Write enrichment report
  const reportPath = path.join(__dirname, '../data/tld-enrichment-report.json');
  fs.writeFileSync(reportPath, JSON.stringify({
    generatedAt: pricesData.fetchedAt,
    totals: { all: allKeys.length, brand: brandCount, publicPriced, publicUnpriced: stillUnpriced.length, withRegistrars: withReg },
    unpricedPublicTlds: stillUnpriced,
  }, null, 2));

  console.log(`\n✅  data/tld-prices.json saved`);
  console.log(`📊  data/tld-enrichment-report.json saved\n`);
}

main().catch(e => { console.error('Fatal:', e); process.exit(1); });
