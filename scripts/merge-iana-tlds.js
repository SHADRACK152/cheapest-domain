/**
 * Merges IANA TLD list into tld-prices.json
 * - Reads data/tlds-alpha-by-domain.txt (official IANA list)
 * - Includes IDN/punycode TLDs (XN--) by default
 * - Converts to lowercase dot-prefixed format (.com, .net, etc.)
 * - Adds TLDs missing from tld-prices.json with reg:0/renew:0 (unpriced)
 * - Sorts all TLD keys alphabetically
 */

const fs = require('fs');
const path = require('path');

const dataDir = path.join(__dirname, '..', 'data');
const ianaFile = path.join(dataDir, 'tlds-alpha-by-domain.txt');
const pricesFile = path.join(dataDir, 'tld-prices.json');
const includeIdn = process.env.INCLUDE_IDN !== 'false';

// 1. Parse IANA TLD file
const rawLines = fs.readFileSync(ianaFile, 'utf-8')
  .split('\n')
  .map(l => l.trim())
  .filter(l => l && !l.startsWith('#'));

const idnCount = rawLines.filter(l => l.toUpperCase().startsWith('XN--')).length;

const ianaTlds = rawLines
  .filter(l => includeIdn || !l.toUpperCase().startsWith('XN--'))
  .map(l => '.' + l.toLowerCase());

console.log(`IANA total TLDs     : ${rawLines.length}`);
console.log(`IANA IDN (XN--)     : ${idnCount}`);
console.log(`Include IDN         : ${includeIdn}`);
console.log(`IANA selected TLDs  : ${ianaTlds.length}`);

// 2. Read existing prices
const pricesData = JSON.parse(fs.readFileSync(pricesFile, 'utf-8'));
const existingKeys = Object.keys(pricesData.tlds);
console.log(`Existing TLDs in tld-prices.json: ${existingKeys.length}`);

// 3. Diff — find TLDs not yet in tld-prices.json
const missing = ianaTlds.filter(t => !existingKeys.includes(t));
const alreadyPresent = ianaTlds.filter(t => existingKeys.includes(t));

console.log(`Already present      : ${alreadyPresent.length}`);
console.log(`New TLDs to add      : ${missing.length}`);

// 4. Add missing TLDs with placeholder pricing (0 = unpriced, set via admin)
missing.forEach(tld => {
  pricesData.tlds[tld] = { reg: 0, renew: 0 };
});

// 5. Sort all TLD keys alphabetically
const sorted = {};
Object.keys(pricesData.tlds).sort().forEach(k => { sorted[k] = pricesData.tlds[k]; });
pricesData.tlds = sorted;

// 6. Update timestamp
pricesData.fetchedAt = new Date().toISOString();

// 7. Write back
fs.writeFileSync(pricesFile, JSON.stringify(pricesData, null, 2));

console.log(`\nDone! Total TLDs now : ${Object.keys(pricesData.tlds).length}`);
console.log(`Sample new TLDs added: ${missing.slice(0, 15).join(', ')}`);
