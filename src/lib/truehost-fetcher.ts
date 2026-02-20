/**
 * TrueHost Domain Search Fetcher
 * 
 * Fetches REAL domain availability using DNS checks
 * Uses TrueHost Kenya official pricing
 */

import { Domain, SearchResult } from '@/types';
import { DOMAIN_EXTENSIONS } from './constants';

/**
 * Currency conversion utilities
 * Exchange rate: 1 USD ≈ 150 KES (update regularly)
 */
const USD_TO_KES_RATE = 150;
const KES_TO_USD_RATE = 1 / USD_TO_KES_RATE;

export function convertUSDtoKES(usd: number): number {
  return Math.round(usd * USD_TO_KES_RATE);
}

export function convertKEStoUSD(kes: number): number {
  return Math.round(kes * KES_TO_USD_RATE * 100) / 100;
}

/**
 * Get default price in KES for extension (TrueHost Kenya published prices)
 */
function getDefaultPriceKES(extension: string): number {
  // TrueHost Kenya actual prices in KES (as of 2026)
  // Source: https://truehost.co.ke/domain-registration
  const kesExtensionPrices: Record<string, number> = {
    '.com': 1500,
    '.net': 1600,
    '.org': 1600,
    '.co.ke': 999,
    '.ke': 2500,
    '.ac.ke': 999,
    '.or.ke': 999,
    '.info': 1800,
    '.biz': 1800,
    '.xyz': 1200,
    '.online': 3500,
    '.store': 5500,
    '.africa': 1800,
    '.io': 4500,
    '.ng': 1800,
    '.me': 2500,
    '.tech': 2800,
    '.website': 1500,
    '.site': 1500,
    '.space': 1200,
  };
  
  return kesExtensionPrices[extension] || 1500;
}

/**
 * Fetch domain search results with real availability data
 * Uses DNS checking for accurate, real-time domain availability
 * Prices from TrueHost Kenya official rates
 */
export async function fetchTrueHostResults(query: string): Promise<SearchResult> {
  const cleanQuery = query.toLowerCase().trim();
  
  // Parse domain name and extension
  const extensionMatch = cleanQuery.match(/\.[a-z]{2,}(\.[a-z]{2,})?$/i);
  const hasExtension = !!extensionMatch;
  const extension = hasExtension ? extensionMatch[0] : '.com';
  const domainName = hasExtension 
    ? cleanQuery.substring(0, cleanQuery.lastIndexOf(extension)).replace(/[^a-z0-9-]/g, '')
    : cleanQuery.replace(/[^a-z0-9-]/g, '');

  if (!domainName) {
    throw new Error('Invalid domain name');
  }

  console.log(`🔍 Checking real availability for: ${domainName}${extension}`);

  // Build list of domains to check (exact match + alternatives)
  const domainsToCheck = [
    `${domainName}${extension}`,
    // Kenya TLDs (priority for TrueHost)
    ...(!extension.includes('.ke') ? [
      `${domainName}.co.ke`,
      `${domainName}.ke`,
      `${domainName}.ac.ke`,
      `${domainName}.or.ke`,
    ] : []),
    // Popular TLDs
    ...(extension !== '.com' ? [`${domainName}.com`] : []),
    ...(extension !== '.net' ? [`${domainName}.net`] : []),
    ...(extension !== '.org' ? [`${domainName}.org`] : []),
    `${domainName}.africa`,
    `${domainName}.io`,
    `${domainName}.ng`,
  ];

  // Remove duplicates
  const uniqueDomains = Array.from(new Set(domainsToCheck)).slice(0, 15);

  console.log(`📋 Checking ${uniqueDomains.length} domains...`);

  // Check availability for all domains
  const results = await Promise.all(
    uniqueDomains.map(async (domain) => {
      const ext = domain.substring(domain.indexOf('.'));
      const name = domain.substring(0, domain.indexOf('.'));
      const isAvailable = await checkRealDomainAvailability(domain);
      const priceKES = getDefaultPriceKES(ext);
      
      console.log(`${isAvailable ? '✅' : '❌'} ${domain} - ${isAvailable ? 'Available' : 'Taken'}`);
      
      return {
        name,
        extension: ext,
        fullDomain: domain,
        price: convertKEStoUSD(priceKES),
        renewPrice: convertKEStoUSD(priceKES * 1.2),
        available: isAvailable,
        premium: false,
        priceKES,
        renewPriceKES: priceKES * 1.2,
      };
    })
  );

  // Separate exact match from alternatives
  const exactMatch = results.find(d => d.fullDomain === `${domainName}${extension}`);
  const alternatives = results.filter(d => d.fullDomain !== `${domainName}${extension}`);
  
  // Categorize alternatives
  const available = alternatives.filter(d => d.available);
  const taken = alternatives.filter(d => !d.available);

  console.log(`✨ Results: ${available.length} available, ${taken.length} taken`);

  return {
    exact: exactMatch || null,
    suggestions: available,
    premium: [],
    taken: taken,
  };
}

/**
 * TLDs that support RDAP (Registration Data Access Protocol).
 * RDAP queries the actual domain registry — far more accurate than DNS.
 * Returns HTTP 200 = registered/taken, HTTP 404 = not found/available.
 */
const RDAP_SUPPORTED_TLDS = new Set([
  '.com', '.net', '.org', '.info', '.biz', '.mobi',
  '.io', '.co', '.me', '.tv', '.cc', '.us',
  '.africa', '.ng', '.xyz', '.online', '.store',
  '.tech', '.website', '.site', '.space', '.app', '.dev',
]);

/**
 * Determine the extension of a domain (supports multi-part like .co.ke)
 */
function getDomainExtension(domain: string): string {
  // Handle two-part ccTLD extensions like .co.ke, .ac.ke, .or.ke
  const parts = domain.split('.');
  if (parts.length >= 3) {
    const lastTwo = `.${parts[parts.length - 2]}.${parts[parts.length - 1]}`;
    // Known multi-part ccTLDs
    if (['.co.ke', '.ac.ke', '.or.ke', '.ne.ke', '.go.ke'].includes(lastTwo)) {
      return lastTwo;
    }
  }
  return domain.substring(domain.indexOf('.'));
}

/**
 * Check domain availability via RDAP (most accurate for gTLDs).
 * Returns true = available, false = taken, null = inconclusive.
 */
async function checkWithRDAP(domain: string): Promise<boolean | null> {
  try {
    const response = await fetch(`https://rdap.org/domain/${domain}`, {
      headers: { 'Accept': 'application/rdap+json' },
      signal: AbortSignal.timeout(8000),
      redirect: 'follow',
    });

    if (response.status === 404) return true;  // Domain not registered = available
    if (response.status === 200) return false; // Domain found = taken
    // Other status codes (429 rate limit, 5xx errors) = inconclusive
    return null;
  } catch {
    return null; // Network error = inconclusive, fall back to DNS
  }
}

/**
 * Query a single DNS record type via Cloudflare DoH.
 * Returns: { nxdomain: boolean, hasRecords: boolean }
 */
async function queryDNSRecord(
  domain: string,
  type: 'A' | 'NS' | 'SOA',
  provider: 'cloudflare' | 'google' = 'cloudflare'
): Promise<{ nxdomain: boolean; hasRecords: boolean } | null> {
  try {
    const url =
      provider === 'cloudflare'
        ? `https://cloudflare-dns.com/dns-query?name=${domain}&type=${type}`
        : `https://dns.google/resolve?name=${domain}&type=${type}`;

    const response = await fetch(url, {
      headers: { Accept: 'application/dns-json' },
      signal: AbortSignal.timeout(6000),
    });

    if (!response.ok) return null;

    const data = await response.json();

    // Status 3 = NXDOMAIN — domain definitively does not exist
    if (data.Status === 3) return { nxdomain: true, hasRecords: false };

    // Status 0 = NOERROR
    if (data.Status === 0) {
      const hasRecords = Array.isArray(data.Answer) && data.Answer.length > 0;
      return { nxdomain: false, hasRecords };
    }

    // Status 2 = SERVFAIL or other error — inconclusive
    return null;
  } catch {
    return null;
  }
}

/**
 * Check domain availability using multi-record DNS inspection.
 *
 * Strategy:
 *  1. Query A records — NXDOMAIN means definitely available; A records mean taken.
 *  2. If A check is inconclusive, query NS records — NS records indicate a
 *     registered domain even if it has no web hosting (parked domains, etc.).
 *  3. SOA records as final tie-breaker.
 *  4. Fall back to Google DNS if Cloudflare gives no answer.
 */
async function checkWithDNS(domain: string): Promise<boolean> {
  // --- Round 1: A record via Cloudflare ---
  const aCloudflare = await queryDNSRecord(domain, 'A', 'cloudflare');

  if (aCloudflare?.nxdomain) return true;   // NXDOMAIN = available
  if (aCloudflare?.hasRecords) return false; // Has A records = taken

  // --- Round 2: NS record via Cloudflare (catches parked/nameserver-only domains) ---
  const nsCloudflare = await queryDNSRecord(domain, 'NS', 'cloudflare');

  if (nsCloudflare?.nxdomain) return true;   // NXDOMAIN = available
  if (nsCloudflare?.hasRecords) return false; // Has NS records = taken

  // --- Round 3: retry with Google DNS ---
  const [aGoogle, nsGoogle] = await Promise.all([
    queryDNSRecord(domain, 'A', 'google'),
    queryDNSRecord(domain, 'NS', 'google'),
  ]);

  if (aGoogle?.nxdomain || nsGoogle?.nxdomain) return true;
  if (aGoogle?.hasRecords || nsGoogle?.hasRecords) return false;

  // --- Round 4: SOA record (authoritative indicator of zone existence) ---
  const soaGoogle = await queryDNSRecord(domain, 'SOA', 'google');
  if (soaGoogle?.nxdomain) return true;
  if (soaGoogle?.hasRecords) return false;

  // All checks inconclusive — conservative default: assume taken
  console.warn(`⚠️  Inconclusive DNS for ${domain}, marking as taken`);
  return false;
}

/**
 * Check real domain availability.
 *
 * Priority:
 *  1. RDAP — authoritative registry lookup for supported gTLDs
 *  2. Multi-record DNS — NS + A + SOA checks for all TLDs (including ccTLDs)
 */
async function checkRealDomainAvailability(domain: string): Promise<boolean> {
  const ext = getDomainExtension(domain);

  // Use RDAP for supported gTLDs — most accurate method
  if (RDAP_SUPPORTED_TLDS.has(ext)) {
    const rdapResult = await checkWithRDAP(domain);
    if (rdapResult !== null) {
      return rdapResult;
    }
    // RDAP inconclusive (rate-limited / error) — fall through to DNS
    console.warn(`⚠️  RDAP inconclusive for ${domain}, falling back to DNS`);
  }

  // DNS multi-record check (used for ccTLDs and RDAP fallback)
  return checkWithDNS(domain);
}
