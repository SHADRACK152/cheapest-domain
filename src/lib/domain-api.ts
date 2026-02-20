import { Domain, SearchResult } from '@/types';
import { DOMAIN_EXTENSIONS } from './constants';

// Priority: TrueHost API > Namecheap API > Free DNS Checking
const USE_TRUEHOST = !!process.env.TRUEHOST_API_KEY;
const USE_NAMECHEAP = !!process.env.NAMECHEAP_API_KEY;

interface NamecheapAvailability {
  domain: string;
  available: boolean;
  premiumPrice?: number;
}

/**
 * Check domain availability using Namecheap API
 */
async function checkNamecheapAvailability(domains: string[]): Promise<NamecheapAvailability[]> {
  const apiKey = process.env.NAMECHEAP_API_KEY;
  const apiUser = process.env.NAMECHEAP_API_USER;
  const clientIp = process.env.NAMECHEAP_CLIENT_IP;
  const apiUrl = process.env.NAMECHEAP_API_URL || 'https://api.sandbox.namecheap.com/xml.response';

  if (!apiKey || !apiUser || !clientIp) {
    throw new Error('Namecheap API credentials not configured');
  }

  const domainList = domains.join(',');
  const url = `${apiUrl}?ApiUser=${apiUser}&ApiKey=${apiKey}&UserName=${apiUser}&ClientIp=${clientIp}&Command=namecheap.domains.check&DomainList=${domainList}`;

  try {
    const response = await fetch(url);
    const xmlText = await response.text();
    
    // Parse XML response (simplified - you may want to use xml2js library)
    const results: NamecheapAvailability[] = [];
    const domainRegex = /<DomainCheckResult Domain="([^"]+)" Available="([^"]+)"(?:[^>]*IsPremiumName="true"[^>]*PremiumRegistrationPrice="([^"]+)")?/g;
    
    let match;
    while ((match = domainRegex.exec(xmlText)) !== null) {
      results.push({
        domain: match[1],
        available: match[2] === 'true',
        premiumPrice: match[3] ? parseFloat(match[3]) : undefined,
      });
    }
    
    return results;
  } catch (error) {
    console.error('Namecheap API error:', error);
    throw error;
  }
}

/**
 * Check domain availability using WHOIS (free alternative)
 */
async function checkWhoisAvailability(domain: string): Promise<boolean> {
  try {
    // Using a free WHOIS API service
    const response = await fetch(`https://www.whoisxmlapi.com/whoisserver/WhoisService?apiKey=${process.env.WHOIS_API_KEY}&domainName=${domain}&outputFormat=JSON`);
    const data = await response.json();
    
    // Domain is available if WHOIS returns no registrant data
    return !data.WhoisRecord?.registrant;
  } catch (error) {
    console.error('WHOIS lookup error:', error);
    // Default to unavailable on error
    return false;
  }
}

/**
 * Search for domain availability with real API data
 */
export async function searchDomain(query: string): Promise<SearchResult> {
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

  // Priority 1: Use TrueHost API (native integration for TrueHost ecosystem)
  if (USE_TRUEHOST) {
    try {
      const { searchTrueHostDomains } = await import('./truehost-api');
      return await searchTrueHostDomains(query);
    } catch (error) {
      console.error('TrueHost API failed, falling back to free DNS check:', error);
      // Fall through to free DNS checking
    }
  }

  // Priority 2: Use Namecheap API (if configured)
  if (USE_NAMECHEAP) {
    try {
    // Build list of domains to check
    const domainsToCheck = [
      `${domainName}${extension}`,
      ...DOMAIN_EXTENSIONS.slice(0, 10).map(ext => `${domainName}${ext.extension}`)
    ];

    // Remove duplicates
    const uniqueDomains = Array.from(new Set(domainsToCheck));

    // Check availability via Namecheap API
    const availabilityResults = await checkNamecheapAvailability(uniqueDomains);

    // Map results to our Domain type
    const exact = availabilityResults.find(r => r.domain === `${domainName}${extension}`);
    const extensionInfo = DOMAIN_EXTENSIONS.find(ext => ext.extension === extension);

    const exactDomain: Domain | null = exact ? {
      name: domainName,
      extension: extension,
      fullDomain: exact.domain,
      price: exact.premiumPrice || extensionInfo?.price || 8.99,
      renewPrice: extensionInfo?.renewPrice || 12.99,
      available: exact.available,
      premium: !!exact.premiumPrice,
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
        price: result.premiumPrice || ext?.price || 8.99,
        renewPrice: ext?.renewPrice || 12.99,
        available: result.available,
        premium: !!result.premiumPrice,
      };

      if (result.premiumPrice) {
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
      console.error('Namecheap API failed, falling back to free DNS check:', error);
      // Fall through to free DNS checking
    }
  }

  // Priority 3: Free DNS-based checking (always available, no API key needed)
  try {
    const { searchDomainWithFreeCheck } = await import('./free-domain-check');
    return await searchDomainWithFreeCheck(query);
  } catch (error) {
    console.error('All domain checking methods failed:', error);
    throw new Error('Unable to check domain availability. Please try again later.');
  }
}
