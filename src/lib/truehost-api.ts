import { Domain, SearchResult } from '@/types';
import { DOMAIN_EXTENSIONS } from './constants';

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
 * Check domain availability using TrueHost API
 */
export async function checkTrueHostAvailability(domains: string[]): Promise<TrueHostDomainCheck[]> {
  const apiKey = process.env.TRUEHOST_API_KEY;
  const apiUrl = process.env.TRUEHOST_API_URL || 'https://api.truehost.co.ke/v1';

  if (!apiKey) {
    throw new Error('TrueHost API key not configured. Add TRUEHOST_API_KEY to .env.local');
  }

  try {
    // Build the API request
    const response = await fetch(`${apiUrl}/domains/check`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        domains: domains,
      }),
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

    const exactDomain: Domain | null = exact ? {
      name: domainName,
      extension: extension,
      fullDomain: exact.domain,
      price: exact.price || extensionInfo?.price || 8.99,
      renewPrice: extensionInfo?.renewPrice || 12.99,
      available: exact.available,
      premium: exact.premium || false,
    } : null;

    // Categorize suggestions
    const suggestions: Domain[] = [];
    const premium: Domain[] = [];
    const taken: Domain[] = [];

    availabilityResults.forEach(result => {
      if (result.domain === `${domainName}${extension}`) return; // Skip exact match

      const ext = DOMAIN_EXTENSIONS.find(e => result.domain.endsWith(e.extension));
      const domain: Domain = {
        name: domainName,
        extension: ext?.extension || extension,
        fullDomain: result.domain,
        price: result.price || ext?.price || 8.99,
        renewPrice: ext?.renewPrice || 12.99,
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
