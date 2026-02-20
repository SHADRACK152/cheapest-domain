import { Domain, SearchResult } from '@/types';
import { DOMAIN_EXTENSIONS } from './constants';

/**
 * Free domain availability checker using DNS lookup
 * This runs in the browser/edge runtime without external API keys
 */
export async function checkDomainAvailabilityFree(domain: string): Promise<boolean> {
  try {
    // Method 1: Try DNS resolution (if domain has DNS records, it's likely registered)
    const dnsUrl = `https://dns.google/resolve?name=${domain}&type=A`;
    const dnsResponse = await fetch(dnsUrl, { 
      cache: 'no-store',
      headers: { 'Accept': 'application/json' }
    });
    
    if (dnsResponse.ok) {
      const dnsData = await dnsResponse.json();
      // If DNS records exist, domain is registered
      if (dnsData.Answer && dnsData.Answer.length > 0) {
        return false; // Not available (registered)
      }
    }

    // Method 2: Try to fetch the domain (if it responds, it's registered)
    try {
      const domainCheckUrl = `https://${domain}`;
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000); // 3 second timeout
      
      const response = await fetch(domainCheckUrl, {
        method: 'HEAD',
        mode: 'no-cors',
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      
      // If we get any response, domain is registered
      return false; // Not available
    } catch (fetchError) {
      // Fetch failed, might be available
      // But we can't be 100% sure without proper WHOIS
    }

    // If both checks fail, likely available (but not guaranteed)
    return true;
  } catch (error) {
    console.error('Domain availability check error:', error);
    // Default to unavailable on error (safer than showing false availability)
    return false;
  }
}

/**
 * Batch check multiple domains for availability
 */
export async function checkMultipleDomainsAvailability(domains: string[]): Promise<Map<string, boolean>> {
  const results = new Map<string, boolean>();
  
  // Check domains in parallel with a limit
  const checkPromises = domains.map(async (domain) => {
    const available = await checkDomainAvailabilityFree(domain);
    results.set(domain, available);
  });

  await Promise.all(checkPromises);
  return results;
}

/**
 * Real-world domain search with free DNS-based availability checking
 */
export async function searchDomainWithFreeCheck(query: string): Promise<SearchResult> {
  const cleanQuery = query.toLowerCase().trim();
  
  // Parse domain name and extension
  const extensionMatch = cleanQuery.match(/\.[a-z]{2,}(\.[a-z]{2,})?$/i);
  const hasExtension = !!extensionMatch;
  const extension = hasExtension ? extensionMatch[0] : '.com';
  const domainName = hasExtension 
    ? cleanQuery.substring(0, cleanQuery.lastIndexOf(extension)).replace(/[^a-z0-9-]/g, '')
    : cleanQuery.replace(/[^a-z0-9-]/g, '');

  // Find the extension details
  const extensionInfo = DOMAIN_EXTENSIONS.find(ext => ext.extension === extension);
  const basePrice = extensionInfo?.price || 8.99;
  const baseRenewPrice = extensionInfo?.renewPrice || 12.99;

  // Build list of domains to check
  const exactDomain = `${domainName}${extension}`;
  const alternativeDomains = DOMAIN_EXTENSIONS.slice(0, 10)
    .filter(ext => ext.extension !== extension)
    .map(ext => `${domainName}${ext.extension}`);

  // Check availability for all domains
  const domainsToCheck = [exactDomain, ...alternativeDomains];
  const availabilityMap = await checkMultipleDomainsAvailability(domainsToCheck);

  // Check exact domain
  const exactAvailable = availabilityMap.get(exactDomain) ?? false;

  const exact: Domain | null = {
    name: domainName,
    extension: extension,
    fullDomain: exactDomain,
    price: basePrice,
    renewPrice: baseRenewPrice,
    available: exactAvailable,
    premium: false,
  };

  // Generate suggestions with real availability
  const suggestions: Domain[] = [];
  const premium: Domain[] = [];
  const taken: Domain[] = [];

  // Add alternative extensions
  alternativeDomains.forEach((fullDomain) => {
    const ext = DOMAIN_EXTENSIONS.find(e => fullDomain.endsWith(e.extension));
    if (!ext) return;

    const available = availabilityMap.get(fullDomain) ?? false;

    const domain: Domain = {
      name: domainName,
      extension: ext.extension,
      fullDomain,
      price: ext.price,
      renewPrice: ext.renewPrice,
      available,
      premium: false,
    };

    if (available) {
      suggestions.push(domain);
    } else {
      taken.push(domain);
    }
  });

  // Generate alternative name suggestions
  const prefixes = ['get', 'my', 'the', 'try', 'go', 'new'];
  const suffixes = ['hub', 'lab', 'hq', 'now', 'app', 'online', 'site', 'zone'];
  
  const suggestedNames: string[] = [];
  prefixes.forEach((p) => suggestedNames.push(`${p}${domainName}`));
  suffixes.forEach((s) => suggestedNames.push(`${domainName}${s}`));

  // Add a few suggested names with popular extensions
  const popularExts = ['.com', '.net', '.co.ke', '.io'];
  for (const suggestedName of suggestedNames.slice(0, 4)) {
    for (const suggestedExt of popularExts.slice(0, 2)) {
      const ext = DOMAIN_EXTENSIONS.find(e => e.extension === suggestedExt);
      if (!ext) continue;

      suggestions.push({
        name: suggestedName,
        extension: suggestedExt,
        fullDomain: `${suggestedName}${suggestedExt}`,
        price: ext.price,
        renewPrice: ext.renewPrice,
        available: true, // Assume available for suggestions
        premium: false,
      });
    }
  }

  return {
    exact,
    suggestions: suggestions.slice(0, 10),
    premium,
    taken: taken.slice(0, 6),
  };
}
