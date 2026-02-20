import { Domain, SearchResult } from '@/types';
import { DOMAIN_EXTENSIONS } from './constants';

const TAKEN_DOMAINS = [
  'google', 'facebook', 'amazon', 'microsoft', 'apple',
  'netflix', 'twitter', 'github', 'vercel', 'stripe',
];

const PREMIUM_WORDS = [
  'cloud', 'digital', 'smart', 'tech', 'web',
  'app', 'dev', 'code', 'data', 'ai',
];

function generateSuggestions(query: string): string[] {
  const prefixes = ['get', 'my', 'the', 'try', 'go'];
  const suffixes = ['hub', 'lab', 'hq', 'now', 'app', 'io', 'site', 'zone'];

  const suggestions: string[] = [];
  prefixes.forEach((p) => suggestions.push(`${p}${query}`));
  suffixes.forEach((s) => suggestions.push(`${query}${s}`));

  return suggestions.slice(0, 8);
}

export function mockSearchDomain(query: string): SearchResult {
  const cleanQuery = query.toLowerCase().trim();
  
  // Parse domain name and extension
  const extensionMatch = cleanQuery.match(/\.[a-z]{2,}(\.[a-z]{2,})?$/i);
  const hasExtension = !!extensionMatch;
  const extension = hasExtension ? extensionMatch[0] : '.com';
  const domainName = hasExtension 
    ? cleanQuery.substring(0, cleanQuery.lastIndexOf(extension)).replace(/[^a-z0-9-]/g, '')
    : cleanQuery.replace(/[^a-z0-9-]/g, '');

  const isTaken = TAKEN_DOMAINS.some((d) => domainName.includes(d));
  const isPremium = PREMIUM_WORDS.some((w) => domainName.includes(w));

  // Find the extension details or use default pricing
  const extensionInfo = DOMAIN_EXTENSIONS.find(ext => ext.extension === extension);
  const basePrice = extensionInfo?.price || 8.99;
  const baseRenewPrice = extensionInfo?.renewPrice || 12.99;

  const extensions = DOMAIN_EXTENSIONS.slice(0, 6);
  const exact: Domain | null = !isTaken
    ? {
        name: domainName,
        extension: extension,
        fullDomain: `${domainName}${extension}`,
        price: basePrice,
        renewPrice: baseRenewPrice,
        available: true,
        premium: isPremium,
      }
    : null;

  const suggestions: Domain[] = [];
  const suggestedNames = generateSuggestions(domainName);

  suggestedNames.forEach((name) => {
    const ext = extensions[Math.floor(Math.random() * extensions.length)];
    suggestions.push({
      name,
      extension: ext.extension,
      fullDomain: `${name}${ext.extension}`,
      price: ext.price + (isPremium ? 10 : 0),
      renewPrice: ext.renewPrice,
      available: true,
      premium: false,
    });
  });

  const premium: Domain[] = isPremium
    ? [
        {
          name: domainName,
          extension: '.com',
          fullDomain: `${domainName}.com`,
          price: 999.99,
          renewPrice: 12.99,
          available: true,
          premium: true,
        },
        {
          name: domainName,
          extension: '.io',
          fullDomain: `${domainName}.io`,
          price: 499.99,
          renewPrice: 39.99,
          available: true,
          premium: true,
        },
      ]
    : [];

  const taken: Domain[] = isTaken
    ? extensions.map((ext) => ({
        name: domainName,
        extension: ext.extension,
        fullDomain: `${domainName}${ext.extension}`,
        price: ext.price,
        renewPrice: ext.renewPrice,
        available: false,
        premium: false,
      }))
    : [];

  return { exact, suggestions, premium, taken };
}
