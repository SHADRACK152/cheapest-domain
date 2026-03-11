import { Domain, SearchResult } from '@/types';
import { DOMAIN_EXTENSIONS } from './constants';
import { ensureKes, kesToUsd, usdToKes } from './currency';

/**
 * TrueHost Domain API Integration
 * 
 * TrueHost Kenya - Domain registration and hosting provider
 * Website: https://truehost.co.ke
 * 
 * API Endpoints (update based on actual TrueHost API documentation):
 * - Domain Check: /api/domains/check
 * - Domain Register: /api/domains/register
 * - Domain Transfer: /api/domains/transfer
 * - Pricing: /api/domains/pricing
 */

interface TrueHostDomainCheck {
  domain: string;
  available: boolean;
  price?: number;
  premium?: boolean;
  currency?: string;
}

interface TrueHostApiResponse {
  success: boolean;
  data?: TrueHostDomainCheck[];
  message?: string;
  error?: string;
}

/**
 * Generic WHMCS-style API caller (Identifier + Secret)
 * Posts form-urlencoded data to the provided endpoint with `action` and `responsetype=json`.
 */
async function callWhmcsApi(action: string, params: Record<string, any> = {}) {
  const identifier = process.env.TRUEHOST_IDENTIFIER;
  const secret = process.env.TRUEHOST_SECRET;
  const endpoint = process.env.TRUEHOST_ENDPOINT;

  if (!identifier || !secret || !endpoint) {
    throw new Error('WHMCS credentials not configured (TRUEHOST_IDENTIFIER/TRUEHOST_SECRET/TRUEHOST_ENDPOINT)');
  }

  const body = new URLSearchParams();
  body.append('identifier', identifier);
  body.append('secret', secret);
  body.append('action', action);
  body.append('responsetype', 'json');
  // accesskey is required by some WHMCS configurations (TrueHost)
  const accesskey = process.env.TRUEHOST_ACCESSKEY;
  if (accesskey) body.append('accesskey', accesskey);

  Object.entries(params).forEach(([k, v]) => {
    if (v === undefined || v === null) return;
    body.append(k, typeof v === 'object' ? JSON.stringify(v) : String(v));
  });

  const resp = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Accept': 'application/json, text/plain, */*',
      'Accept-Language': 'en-US,en;q=0.9',
      'User-Agent': 'Mozilla/5.0 (compatible; CheapestDomains/1.0; +https://cheapestdomains.co.ke)',
      'Referer': 'https://truehost.co.ke/cloud/',
      'Origin': 'https://cheapestdomains.co.ke',
      'Cache-Control': 'no-cache',
    },
    body: body.toString(),
    redirect: 'follow',
  });

  const text = await resp.text().catch(() => '');

  // Detect Cloudflare bot challenge (returned as HTML even with 403/503)
  if (
    resp.status === 403 ||
    (resp.status >= 400 && text.includes('Just a moment')) ||
    text.includes('cf-browser-verification') ||
    text.includes('cloudflare')
  ) {
    throw new Error(`CLOUDFLARE_BLOCK: TrueHost endpoint is protected by Cloudflare (HTTP ${resp.status}). Please ask TrueHost to whitelist the API path or disable Bot Fight Mode for /cloud/includes/api/`);
  }

  let json: any = null;
  try { json = text ? JSON.parse(text) : null; } catch { json = null; }

  // WHMCS sometimes returns a JSON body with { result: 'error', message: '...' }
  if (json && json.result === 'error') {
    return json; // let caller handle error shape
  }

  if (!resp.ok) {
    throw new Error(`WHMCS API ${action} failed: ${resp.status} ${resp.statusText} ${text.slice(0, 200)}`);
  }

  return json ?? text;
}

/**
 * Check domain availability using TrueHost API
 */
export async function checkTrueHostAvailability(domains: string[]): Promise<TrueHostDomainCheck[]> {
  const apiKey = process.env.TRUEHOST_API_KEY;
  const apiUrl = process.env.TRUEHOST_API_URL || 'https://api.truehost.co.ke/v1';

  // Prefer WHMCS-style credentials if provided
  if (process.env.TRUEHOST_IDENTIFIER && process.env.TRUEHOST_SECRET && process.env.TRUEHOST_ENDPOINT) {
    try {
      // Try a WHMCS-style domain check action. Common WHMCS action names vary by provider;
      // we'll attempt a flexible sequence and parse common response shapes.
      const joined = domains.join(',');
        const resp = await callWhmcsApi('DomainCheck', { domain: joined, domains: joined });

        // If WHMCS returned an error payload, surface it as a specific error
        if (resp && resp.result === 'error') {
          const msg = String(resp.message || resp?.error || 'WHMCS API error');
          if (msg.toLowerCase().includes('invalid ip')) {
            throw new Error(`WHMCS_INVALID_IP: ${msg}`);
          }
          throw new Error(`WHMCS_ERROR: ${msg}`);
        }

        // Attempt to find domain data in common locations
        const payload = resp?.data || resp?.domains || resp || null;

        // If payload is an object keyed by domain names
        if (payload && typeof payload === 'object' && !Array.isArray(payload)) {
          const out: TrueHostDomainCheck[] = domains.map(d => {
            const info = payload[d] || payload[d.toLowerCase()] || {};
            const available = (info.available ?? info.is_available ?? (info.status === 'available')) || (info === 'available');
            const price = info.price ?? info.registration_price ?? info.reg_price ?? undefined;
            const premium = info.premium ?? info.is_premium ?? false;
            return { domain: d, available: Boolean(available), price, premium };
          });
          return out;
        }

        // If payload is an array of records
        if (Array.isArray(payload)) {
          return payload.map((p: any) => ({
            domain: p.domain || p.name,
            available: Boolean(p.available ?? p.is_available ?? (p.status === 'available')),
            price: p.price ?? p.registration_price,
            premium: Boolean(p.premium ?? p.is_premium),
          }));
        }

        // Unknown shape — throw so caller can handle fallback
        throw new Error('Unexpected WHMCS domain check response shape');
    } catch (err) {
      // WHMCS credentials were configured but the call failed.
      // Re-throw so the caller (domain-api.ts) can fall back to the local price table.
      throw err;
    }
  }

  if (!apiKey) {
    throw new Error('TrueHost API key not configured. Add TRUEHOST_API_KEY or WHMCS credentials to environment');
  }

  try {
    // Build the API request (Bearer-style)
    const response = await fetch(`${apiUrl}/domains/check`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'Accept': 'application/json',
      },
      body: JSON.stringify({ domains }),
    });

    if (!response.ok) {
      throw new Error(`TrueHost API error: ${response.status} ${response.statusText}`);
    }

    const result: TrueHostApiResponse = await response.json();

    if (!result.success) {
      throw new Error(result.error || result.message || 'TrueHost API request failed');
    }

    return result.data || [];
  } catch (error) {
    console.error('TrueHost API error:', error);
    throw error;
  }
}

/**
 * Get domain pricing from TrueHost
 */
export async function getTrueHostPricing(extension: string): Promise<{ price: number; renewPrice: number } | null> {
  const apiKey = process.env.TRUEHOST_API_KEY;
  const apiUrl = process.env.TRUEHOST_API_URL || 'https://api.truehost.co.ke/v1';

  // WHMCS-style pricing via Identifier/Secret
  if (process.env.TRUEHOST_IDENTIFIER && process.env.TRUEHOST_SECRET && process.env.TRUEHOST_ENDPOINT) {
    try {
      // Try common WHMCS actions to retrieve pricing. Providers differ; we attempt a generic "GetTLDs"/"GetTLDPricing" action.
      const actions = ['GetTLDPricing', 'GetTLDs', 'GetTLDList', 'gettldpricing', 'gettlds'];
      for (const action of actions) {
        try {
          const resp = await callWhmcsApi(action, {});

          // If WHMCS returned an error payload, surface it
          if (resp && resp.result === 'error') {
            const msg = String(resp.message || resp?.error || 'WHMCS API error');
            if (msg.toLowerCase().includes('invalid ip')) {
              throw new Error(`WHMCS_INVALID_IP: ${msg}`);
            }
            throw new Error(`WHMCS_ERROR: ${msg}`);
          }

          const payload = resp?.data || resp?.tlds || resp;
          if (!payload) continue;

          // If array
          if (Array.isArray(payload)) {
            const match = payload.find((p: any) => (p.tld || p.extension || p.name) === extension || (`.${p.tld}` || p.extension) === extension);
            if (match) {
              const price = match.registration_price ?? match.price ?? match.reg_price ?? match.cost ?? 0;
              const renew = match.renewal_price ?? match.renew_price ?? price;
              return { price, renewPrice: renew };
            }
          }

          // If object keyed by tld
          if (typeof payload === 'object') {
            for (const key of Object.keys(payload)) {
              const entry = payload[key];
              const keyNormalized = key.startsWith('.') ? key : `.${key}`;
              if (keyNormalized === extension) {
                const price = entry.registration_price ?? entry.price ?? entry.reg_price ?? entry.cost ?? 0;
                const renew = entry.renewal_price ?? entry.renew_price ?? price;
                return { price, renewPrice: renew };
              }
            }
          }
        } catch (e) {
          // try next action
        }
      }
    } catch (err) {
      console.warn('WHMCS pricing lookup failed, falling back to Bearer API or defaults:', err);
    }
  }

  if (!apiKey) {
    return null;
  }

  try {
    const response = await fetch(`${apiUrl}/domains/pricing?extension=${encodeURIComponent(extension)}`, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      return null;
    }

    const result = await response.json();
    return {
      price: result.data?.registration_price || 0,
      renewPrice: result.data?.renewal_price || 0,
    };
  } catch (error) {
    console.error('TrueHost pricing error:', error);
    return null;
  }
}

/**
 * Search domains using TrueHost API
 */
export async function searchTrueHostDomains(query: string): Promise<SearchResult> {
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

  // Build list of domains to check
  const domainsToCheck = [
    `${domainName}${extension}`,
    ...DOMAIN_EXTENSIONS.slice(0, 10).map(ext => `${domainName}${ext.extension}`)
  ];

  // Remove duplicates
  const uniqueDomains = Array.from(new Set(domainsToCheck));

  try {
    // Check availability via TrueHost API
    const availabilityResults = await checkTrueHostAvailability(uniqueDomains);

    // Map results to our Domain type
    const exact = availabilityResults.find(r => r.domain === `${domainName}${extension}`);
    const extensionInfo = DOMAIN_EXTENSIONS.find(ext => ext.extension === extension);

    const exactDomain: Domain | null = exact ? (() => {
      const baseUsd = exact.price ?? extensionInfo?.price ?? 8.99;
      const renewUsd = extensionInfo?.renewPrice ?? 12.99;
      const priceKES = ensureKes(exact.price, baseUsd);
      const renewKES = ensureKes(undefined, renewUsd);
      return {
        name: domainName,
        extension: extension,
        fullDomain: exact.domain,
        price: kesToUsd(priceKES),
        renewPrice: kesToUsd(renewKES),
        priceKES,
        renewPriceKES: renewKES,
        currency: 'KES',
        available: exact.available,
        premium: exact.premium || false,
      } as Domain;
    })() : null;

    // Categorize suggestions
    const suggestions: Domain[] = [];
    const premium: Domain[] = [];
    const taken: Domain[] = [];

    availabilityResults.forEach(result => {
      if (result.domain === `${domainName}${extension}`) return; // Skip exact match

      const ext = DOMAIN_EXTENSIONS.find(e => result.domain.endsWith(e.extension));
      const usdPrice = result.price ?? ext?.price ?? 8.99;
      const usdRenew = ext?.renewPrice ?? 12.99;
      const priceKES = ensureKes(result.price, usdPrice);
      const renewKES = ensureKes(undefined, usdRenew);
      const domain: Domain = {
        name: domainName,
        extension: ext?.extension || extension,
        fullDomain: result.domain,
        price: kesToUsd(priceKES),
        renewPrice: kesToUsd(renewKES),
        priceKES,
        renewPriceKES: renewKES,
        currency: 'KES',
        available: result.available,
        premium: result.premium || false,
      };

      if (result.premium) {
        premium.push(domain);
      } else if (result.available) {
        suggestions.push(domain);
      } else {
        taken.push(domain);
      }
    });

    return {
      exact: exactDomain,
      suggestions: suggestions.slice(0, 8),
      premium,
      taken,
    };
  } catch (error) {
    console.error('TrueHost search error:', error);
    throw error;
  }
}

/**
 * Register domain through TrueHost
 */
export async function registerTrueHostDomain(
  domain: string,
  years: number = 1,
  customerData: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    country: string;
  }
): Promise<{ success: boolean; orderId?: string; message?: string }> {
  const apiKey = process.env.TRUEHOST_API_KEY;
  const apiUrl = process.env.TRUEHOST_API_URL || 'https://api.truehost.co.ke/v1';

  if (!apiKey) {
    throw new Error('TrueHost API key not configured');
  }

  try {
    const response = await fetch(`${apiUrl}/domains/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        domain,
        years,
        customer: customerData,
      }),
    });

    const result = await response.json();

    return {
      success: result.success || false,
      orderId: result.data?.order_id,
      message: result.message,
    };
  } catch (error) {
    console.error('TrueHost registration error:', error);
    throw error;
  }
}
