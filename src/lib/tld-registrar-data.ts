/**
 * Comprehensive TLD registrar pricing data
 * Prices in USD. Updated manually + supplemented by live fetch from public sources.
 * 
 * Data sourced from:
 * - Individual registrar pricing pages
 * - TLDbee public comparisons
 * - ICANN registrar accreditation list
 */

export type RegistrarPrice = {
  registrar: string;
  url: string;
  reg: number;    // first year registration
  renew: number;  // annual renewal
  transfer?: number;
  promoCode?: string;
  whoisPrivacy: boolean;
};

export type TldEntry = {
  tld: string;
  type: 'generic' | 'country' | 'sponsored' | 'new-generic';
  category: string[];
  popularity?: number; // Alexa/similarweb rank proxy
  whoisPrivacy: boolean;
  dnssec: boolean;
  prices: RegistrarPrice[];
};

// Helper to compute cheapest reg/renewal across all registrars
export function cheapest(entry: TldEntry) {
  const prices = entry.prices;
  const cheapReg     = Math.min(...prices.map((p) => p.reg));
  const cheapRenew   = Math.min(...prices.map((p) => p.renew));
  const cheapRegName = prices.find((p) => p.reg === cheapReg)!.registrar;
  const cheapRenewName = prices.find((p) => p.renew === cheapRenew)!.registrar;
  return { cheapReg, cheapRenew, cheapRegName, cheapRenewName };
}

export const TLD_DATA: TldEntry[] = [
  // ── Top Generic TLDs ────────────────────────────────────────────────────────
  {
    tld: '.com', type: 'generic', category: ['popular', 'business'], popularity: 1357580, whoisPrivacy: true, dnssec: true,
    prices: [
      { registrar: 'Spaceship',         url: 'https://spaceship.com',                         reg: 5.87,  renew: 9.77,  transfer: 8.17, whoisPrivacy: true },
      { registrar: 'Cloudflare',        url: 'https://cloudflare.com/products/registrar',      reg: 9.15,  renew: 9.15,  transfer: 9.15, whoisPrivacy: true },
      { registrar: 'Porkbun',           url: 'https://porkbun.com',                            reg: 7.49,  renew: 10.99, transfer: 8.99, whoisPrivacy: true },
      { registrar: 'Dynadot',           url: 'https://dynadot.com',                            reg: 8.99,  renew: 11.99, transfer: 8.99, whoisPrivacy: true },
      { registrar: 'TrueHost',          url: 'https://truehost.co.ke',                         reg: 8.00,  renew: 10.67, transfer: 8.00, whoisPrivacy: false },
      { registrar: 'Namecheap',         url: 'https://namecheap.com',                          reg: 8.88,  renew: 13.98, transfer: 8.98, whoisPrivacy: true },
      { registrar: 'Name.com',          url: 'https://name.com',                               reg: 9.99,  renew: 13.99, transfer: 9.99, whoisPrivacy: false },
      { registrar: 'Google Domains',    url: 'https://domains.google',                         reg: 12.00, renew: 12.00, transfer: 12.00, whoisPrivacy: true },
      { registrar: 'Hover',             url: 'https://hover.com',                              reg: 12.99, renew: 14.99, transfer: 12.99, whoisPrivacy: true },
      { registrar: 'Hostinger',         url: 'https://hostinger.com',                          reg: 9.99,  renew: 14.99, transfer: 9.99, whoisPrivacy: true },
      { registrar: 'IONOS',             url: 'https://ionos.com',                              reg: 1.00,  renew: 15.00, whoisPrivacy: false },
      { registrar: 'Bluehost',          url: 'https://bluehost.com',                           reg: 12.99, renew: 17.99, whoisPrivacy: true },
      { registrar: 'GoDaddy',           url: 'https://godaddy.com',                            reg: 0.99,  renew: 21.99, transfer: 9.99, whoisPrivacy: false },
      { registrar: 'Network Solutions', url: 'https://networksolutions.com',                   reg: 3.98,  renew: 37.99, whoisPrivacy: false },
    ],
  },
  {
    tld: '.net', type: 'generic', category: ['popular', 'tech'], popularity: 227501, whoisPrivacy: true, dnssec: true,
    prices: [
      { registrar: 'Spaceship',         url: 'https://spaceship.com',                         reg: 10.44, renew: 11.11, transfer: 11.11, whoisPrivacy: true },
      { registrar: 'Cloudflare',        url: 'https://cloudflare.com/products/registrar',      reg: 10.44, renew: 10.44, whoisPrivacy: true },
      { registrar: 'Porkbun',           url: 'https://porkbun.com',                            reg: 9.79,  renew: 12.99, whoisPrivacy: true },
      { registrar: 'Dynadot',           url: 'https://dynadot.com',                            reg: 10.99, renew: 12.99, whoisPrivacy: true },
      { registrar: 'TrueHost',          url: 'https://truehost.co.ke',                         reg: 12.37, renew: 13.40, whoisPrivacy: false },
      { registrar: 'Google Domains',    url: 'https://domains.google',                         reg: 12.00, renew: 12.00, whoisPrivacy: true },
      { registrar: 'Namecheap',         url: 'https://namecheap.com',                          reg: 10.98, renew: 15.98, whoisPrivacy: true },
      { registrar: 'Name.com',          url: 'https://name.com',                               reg: 11.99, renew: 15.99, whoisPrivacy: false },
      { registrar: 'Hover',             url: 'https://hover.com',                              reg: 14.99, renew: 16.99, whoisPrivacy: true },
      { registrar: 'Hostinger',         url: 'https://hostinger.com',                          reg: 11.99, renew: 17.99, whoisPrivacy: true },
      { registrar: 'GoDaddy',           url: 'https://godaddy.com',                            reg: 1.99,  renew: 24.99, whoisPrivacy: false },
      { registrar: 'Network Solutions', url: 'https://networksolutions.com',                   reg: 4.98,  renew: 46.99, whoisPrivacy: false },
    ],
  },
  {
    tld: '.org', type: 'generic', category: ['popular', 'nonprofit'], popularity: 177126, whoisPrivacy: true, dnssec: true,
    prices: [
      { registrar: 'Spaceship',         url: 'https://spaceship.com',                         reg: 6.68,  renew: 9.99,  whoisPrivacy: true },
      { registrar: 'Cloudflare',        url: 'https://cloudflare.com/products/registrar',      reg: 9.93,  renew: 9.93,  whoisPrivacy: true },
      { registrar: 'Porkbun',           url: 'https://porkbun.com',                            reg: 7.48,  renew: 11.98, whoisPrivacy: true },
      { registrar: 'Dynadot',           url: 'https://dynadot.com',                            reg: 9.99,  renew: 12.99, whoisPrivacy: true },
      { registrar: 'Google Domains',    url: 'https://domains.google',                         reg: 12.00, renew: 12.00, whoisPrivacy: true },
      { registrar: 'TrueHost',          url: 'https://truehost.co.ke',                         reg: 8.00,  renew: 10.00, whoisPrivacy: false },
      { registrar: 'Namecheap',         url: 'https://namecheap.com',                          reg: 8.48,  renew: 13.98, whoisPrivacy: true },
      { registrar: 'Name.com',          url: 'https://name.com',                               reg: 10.99, renew: 13.99, whoisPrivacy: false },
      { registrar: 'Hover',             url: 'https://hover.com',                              reg: 13.99, renew: 15.99, whoisPrivacy: true },
      { registrar: 'Hostinger',         url: 'https://hostinger.com',                          reg: 10.99, renew: 14.99, whoisPrivacy: true },
      { registrar: 'GoDaddy',           url: 'https://godaddy.com',                            reg: 4.99,  renew: 22.99, whoisPrivacy: false },
      { registrar: 'Network Solutions', url: 'https://networksolutions.com',                   reg: 9.98,  renew: 44.99, whoisPrivacy: false },
    ],
  },
  {
    tld: '.io', type: 'country', category: ['popular', 'tech', 'startup'], popularity: 158409, whoisPrivacy: false, dnssec: false,
    prices: [
      { registrar: 'Spaceship',         url: 'https://spaceship.com',                         reg: 14.98, renew: 38.95, whoisPrivacy: false },
      { registrar: 'Cloudflare',        url: 'https://cloudflare.com/products/registrar',      reg: 29.00, renew: 29.00, whoisPrivacy: false },
      { registrar: 'Porkbun',           url: 'https://porkbun.com',                            reg: 25.98, renew: 31.98, whoisPrivacy: false },
      { registrar: 'Dynadot',           url: 'https://dynadot.com',                            reg: 32.99, renew: 35.99, whoisPrivacy: false },
      { registrar: 'Namecheap',         url: 'https://namecheap.com',                          reg: 32.98, renew: 39.98, whoisPrivacy: false },
      { registrar: 'TrueHost',          url: 'https://truehost.co.ke',                         reg: 34.70, renew: 48.33, whoisPrivacy: false },
      { registrar: 'Name.com',          url: 'https://name.com',                               reg: 34.99, renew: 44.99, whoisPrivacy: false },
      { registrar: 'Hover',             url: 'https://hover.com',                              reg: 39.99, renew: 44.99, whoisPrivacy: false },
      { registrar: 'Hostinger',         url: 'https://hostinger.com',                          reg: 29.99, renew: 49.99, whoisPrivacy: false },
      { registrar: 'GoDaddy',           url: 'https://godaddy.com',                            reg: 6.99,  renew: 59.99, whoisPrivacy: false },
    ],
  },
  {
    tld: '.co', type: 'country', category: ['popular', 'business'], popularity: 213644, whoisPrivacy: true, dnssec: true,
    prices: [
      { registrar: 'Spaceship',         url: 'https://spaceship.com',                         reg: 2.94,  renew: 24.00, whoisPrivacy: true },
      { registrar: 'Porkbun',           url: 'https://porkbun.com',                            reg: 8.98,  renew: 25.98, whoisPrivacy: true },
      { registrar: 'Cloudflare',        url: 'https://cloudflare.com/products/registrar',      reg: 27.00, renew: 27.00, whoisPrivacy: true },
      { registrar: 'Dynadot',           url: 'https://dynadot.com',                            reg: 24.99, renew: 27.99, whoisPrivacy: true },
      { registrar: 'TrueHost',          url: 'https://truehost.co.ke',                         reg: 24.17, renew: 28.33, whoisPrivacy: false },
      { registrar: 'Namecheap',         url: 'https://namecheap.com',                          reg: 24.98, renew: 29.98, whoisPrivacy: true },
      { registrar: 'IONOS',             url: 'https://ionos.com',                              reg: 25.00, renew: 30.00, whoisPrivacy: false },
      { registrar: 'Google Domains',    url: 'https://domains.google',                         reg: 30.00, renew: 30.00, whoisPrivacy: true },
      { registrar: 'Hover',             url: 'https://hover.com',                              reg: 29.99, renew: 32.99, whoisPrivacy: true },
      { registrar: 'Hostinger',         url: 'https://hostinger.com',                          reg: 27.99, renew: 33.99, whoisPrivacy: true },
      { registrar: 'Name.com',          url: 'https://name.com',                               reg: 29.99, renew: 34.99, whoisPrivacy: false },
      { registrar: 'Bluehost',          url: 'https://bluehost.com',                           reg: 24.99, renew: 34.99, whoisPrivacy: true },
      { registrar: 'GoDaddy',           url: 'https://godaddy.com',                            reg: 3.99,  renew: 34.99, whoisPrivacy: false },
      { registrar: 'Network Solutions', url: 'https://networksolutions.com',                   reg: 29.99, renew: 44.99, whoisPrivacy: false },
    ],
  },
  {
    tld: '.xyz', type: 'new-generic', category: ['popular', 'affordable'], popularity: 193031, whoisPrivacy: true, dnssec: true,
    prices: [
      { registrar: 'Spaceship',         url: 'https://spaceship.com',                         reg: 0.98,  renew: 10.18, whoisPrivacy: true },
      { registrar: 'Cloudflare',        url: 'https://cloudflare.com/products/registrar',      reg: 10.18, renew: 10.18, whoisPrivacy: true },
      { registrar: 'Porkbun',           url: 'https://porkbun.com',                            reg: 0.99,  renew: 11.98, whoisPrivacy: true },
      { registrar: 'Dynadot',           url: 'https://dynadot.com',                            reg: 1.99,  renew: 12.99, whoisPrivacy: true },
      { registrar: 'TrueHost',          url: 'https://truehost.co.ke',                         reg: 1.33,  renew: 11.33, whoisPrivacy: false },
      { registrar: 'Namecheap',         url: 'https://namecheap.com',                          reg: 1.48,  renew: 12.98, whoisPrivacy: true },
      { registrar: 'Name.com',          url: 'https://name.com',                               reg: 1.99,  renew: 12.99, whoisPrivacy: false },
      { registrar: 'Hover',             url: 'https://hover.com',                              reg: 9.99,  renew: 14.99, whoisPrivacy: true },
      { registrar: 'Hostinger',         url: 'https://hostinger.com',                          reg: 0.99,  renew: 11.99, whoisPrivacy: true },
      { registrar: 'IONOS',             url: 'https://ionos.com',                              reg: 1.00,  renew: 12.00, whoisPrivacy: false },
      { registrar: 'GoDaddy',           url: 'https://godaddy.com',                            reg: 0.99,  renew: 14.99, whoisPrivacy: false },
    ],
  },
  {
    tld: '.me', type: 'country', category: ['popular', 'personal'], popularity: 139561, whoisPrivacy: true, dnssec: true,
    prices: [
      { registrar: 'Spaceship',         url: 'https://spaceship.com',                         reg: 1.98,  renew: 14.19, whoisPrivacy: true },
      { registrar: 'Cloudflare',        url: 'https://cloudflare.com/products/registrar',      reg: 14.19, renew: 14.19, whoisPrivacy: true },
      { registrar: 'Porkbun',           url: 'https://porkbun.com',                            reg: 4.98,  renew: 14.98, whoisPrivacy: true },
      { registrar: 'Dynadot',           url: 'https://dynadot.com',                            reg: 8.99,  renew: 16.99, whoisPrivacy: true },
      { registrar: 'Google Domains',    url: 'https://domains.google',                         reg: 12.00, renew: 12.00, whoisPrivacy: true },
      { registrar: 'TrueHost',          url: 'https://truehost.co.ke',                         reg: 8.47,  renew: 19.57, whoisPrivacy: false },
      { registrar: 'Namecheap',         url: 'https://namecheap.com',                          reg: 5.98,  renew: 19.98, whoisPrivacy: true },
      { registrar: 'Name.com',          url: 'https://name.com',                               reg: 8.99,  renew: 20.99, whoisPrivacy: false },
      { registrar: 'GoDaddy',           url: 'https://godaddy.com',                            reg: 1.99,  renew: 24.99, whoisPrivacy: false },
    ],
  },
  {
    tld: '.ai', type: 'country', category: ['popular', 'tech', 'ai'], popularity: 125639, whoisPrivacy: false, dnssec: false,
    prices: [
      { registrar: 'Spaceship',         url: 'https://spaceship.com',                         reg: 68.98, renew: 68.98, whoisPrivacy: false },
      { registrar: 'Porkbun',           url: 'https://porkbun.com',                            reg: 79.98, renew: 79.98, whoisPrivacy: false },
      { registrar: 'Dynadot',           url: 'https://dynadot.com',                            reg: 79.99, renew: 79.99, whoisPrivacy: false },
      { registrar: 'Namecheap',         url: 'https://namecheap.com',                          reg: 89.98, renew: 74.98, whoisPrivacy: false },
      { registrar: 'Name.com',          url: 'https://name.com',                               reg: 79.99, renew: 79.99, whoisPrivacy: false },
      { registrar: 'GoDaddy',           url: 'https://godaddy.com',                            reg: 69.99, renew: 89.99, whoisPrivacy: false },
    ],
  },
  {
    tld: '.info', type: 'generic', category: ['information'], popularity: 112715, whoisPrivacy: true, dnssec: true,
    prices: [
      { registrar: 'Spaceship',         url: 'https://spaceship.com',                         reg: 2.73,  renew: 13.17, whoisPrivacy: true },
      { registrar: 'Cloudflare',        url: 'https://cloudflare.com/products/registrar',      reg: 10.44, renew: 10.44, whoisPrivacy: true },
      { registrar: 'Porkbun',           url: 'https://porkbun.com',                            reg: 2.48,  renew: 12.98, whoisPrivacy: true },
      { registrar: 'Dynadot',           url: 'https://dynadot.com',                            reg: 2.99,  renew: 14.99, whoisPrivacy: true },
      { registrar: 'TrueHost',          url: 'https://truehost.co.ke',                         reg: 3.33,  renew: 13.33, whoisPrivacy: false },
      { registrar: 'Namecheap',         url: 'https://namecheap.com',                          reg: 2.98,  renew: 16.98, whoisPrivacy: true },
      { registrar: 'Hover',             url: 'https://hover.com',                              reg: 14.99, renew: 17.99, whoisPrivacy: true },
      { registrar: 'Name.com',          url: 'https://name.com',                               reg: 3.99,  renew: 17.99, whoisPrivacy: false },
      { registrar: 'Hostinger',         url: 'https://hostinger.com',                          reg: 1.99,  renew: 14.99, whoisPrivacy: true },
      { registrar: 'IONOS',             url: 'https://ionos.com',                              reg: 1.00,  renew: 15.00, whoisPrivacy: false },
      { registrar: 'GoDaddy',           url: 'https://godaddy.com',                            reg: 0.99,  renew: 19.99, whoisPrivacy: false },
      { registrar: 'Network Solutions', url: 'https://networksolutions.com',                   reg: 3.98,  renew: 39.99, whoisPrivacy: false },
    ],
  },
  {
    tld: '.top', type: 'new-generic', category: ['affordable'], popularity: 118876, whoisPrivacy: true, dnssec: true,
    prices: [
      { registrar: 'Spaceship',         url: 'https://spaceship.com',                         reg: 1.02,  renew: 3.17,  whoisPrivacy: true },
      { registrar: 'Porkbun',           url: 'https://porkbun.com',                            reg: 1.49,  renew: 4.99,  whoisPrivacy: true },
      { registrar: 'Dynadot',           url: 'https://dynadot.com',                            reg: 1.99,  renew: 5.99,  whoisPrivacy: true },
      { registrar: 'Namecheap',         url: 'https://namecheap.com',                          reg: 2.98,  renew: 7.98,  whoisPrivacy: true },
      { registrar: 'GoDaddy',           url: 'https://godaddy.com',                            reg: 1.99,  renew: 9.99,  whoisPrivacy: false },
      { registrar: 'Hostinger',         url: 'https://hostinger.com',                          reg: 0.99,  renew: 6.99,  whoisPrivacy: true },
    ],
  },
  {
    tld: '.biz', type: 'generic', category: ['business'], popularity: 53718, whoisPrivacy: true, dnssec: true,
    prices: [
      { registrar: 'Spaceship',         url: 'https://spaceship.com',                         reg: 1.15,  renew: 13.68, whoisPrivacy: true },
      { registrar: 'Cloudflare',        url: 'https://cloudflare.com/products/registrar',      reg: 13.68, renew: 13.68, whoisPrivacy: true },
      { registrar: 'Porkbun',           url: 'https://porkbun.com',                            reg: 3.48,  renew: 13.98, whoisPrivacy: true },
      { registrar: 'Dynadot',           url: 'https://dynadot.com',                            reg: 4.99,  renew: 14.99, whoisPrivacy: true },
      { registrar: 'TrueHost',          url: 'https://truehost.co.ke',                         reg: 4.00,  renew: 14.67, whoisPrivacy: false },
      { registrar: 'Namecheap',         url: 'https://namecheap.com',                          reg: 3.98,  renew: 17.98, whoisPrivacy: true },
      { registrar: 'Hover',             url: 'https://hover.com',                              reg: 14.99, renew: 18.99, whoisPrivacy: true },
      { registrar: 'Name.com',          url: 'https://name.com',                               reg: 6.99,  renew: 18.99, whoisPrivacy: false },
      { registrar: 'Hostinger',         url: 'https://hostinger.com',                          reg: 3.99,  renew: 17.99, whoisPrivacy: true },
      { registrar: 'GoDaddy',           url: 'https://godaddy.com',                            reg: 0.99,  renew: 21.99, whoisPrivacy: false },
      { registrar: 'Network Solutions', url: 'https://networksolutions.com',                   reg: 4.98,  renew: 38.99, whoisPrivacy: false },
    ],
  },
  {
    tld: '.online', type: 'new-generic', category: ['affordable', 'business'], popularity: 67143, whoisPrivacy: true, dnssec: true,
    prices: [
      { registrar: 'Spaceship',         url: 'https://spaceship.com',                         reg: 1.01,  renew: 25.18, whoisPrivacy: true },
      { registrar: 'Cloudflare',        url: 'https://cloudflare.com/products/registrar',      reg: 25.18, renew: 25.18, whoisPrivacy: true },
      { registrar: 'Porkbun',           url: 'https://porkbun.com',                            reg: 2.98,  renew: 32.98, whoisPrivacy: true },
      { registrar: 'Dynadot',           url: 'https://dynadot.com',                            reg: 3.99,  renew: 34.99, whoisPrivacy: true },
      { registrar: 'Namecheap',         url: 'https://namecheap.com',                          reg: 4.98,  renew: 39.98, whoisPrivacy: true },
      { registrar: 'Hostinger',         url: 'https://hostinger.com',                          reg: 1.99,  renew: 36.99, whoisPrivacy: true },
      { registrar: 'GoDaddy',           url: 'https://godaddy.com',                            reg: 0.99,  renew: 44.99, whoisPrivacy: false },
    ],
  },
  {
    tld: '.shop', type: 'new-generic', category: ['ecommerce', 'business'], popularity: 45835, whoisPrivacy: true, dnssec: true,
    prices: [
      { registrar: 'Spaceship',         url: 'https://spaceship.com',                         reg: 0.85,  renew: 25.21, whoisPrivacy: true },
      { registrar: 'Porkbun',           url: 'https://porkbun.com',                            reg: 1.98,  renew: 26.98, whoisPrivacy: true },
      { registrar: 'Dynadot',           url: 'https://dynadot.com',                            reg: 2.99,  renew: 27.99, whoisPrivacy: true },
      { registrar: 'Namecheap',         url: 'https://namecheap.com',                          reg: 3.98,  renew: 31.98, whoisPrivacy: true },
      { registrar: 'Hostinger',         url: 'https://hostinger.com',                          reg: 1.99,  renew: 29.99, whoisPrivacy: true },
      { registrar: 'GoDaddy',           url: 'https://godaddy.com',                            reg: 0.99,  renew: 39.99, whoisPrivacy: false },
    ],
  },
  {
    tld: '.store', type: 'new-generic', category: ['ecommerce'], popularity: 30000, whoisPrivacy: true, dnssec: true,
    prices: [
      { registrar: 'Porkbun',           url: 'https://porkbun.com',                            reg: 2.98,  renew: 27.98, whoisPrivacy: true },
      { registrar: 'Spaceship',         url: 'https://spaceship.com',                         reg: 1.02,  renew: 29.18, whoisPrivacy: true },
      { registrar: 'Dynadot',           url: 'https://dynadot.com',                            reg: 4.99,  renew: 29.99, whoisPrivacy: true },
      { registrar: 'Namecheap',         url: 'https://namecheap.com',                          reg: 4.98,  renew: 34.98, whoisPrivacy: true },
      { registrar: 'Hostinger',         url: 'https://hostinger.com',                          reg: 1.99,  renew: 29.99, whoisPrivacy: true },
      { registrar: 'GoDaddy',           url: 'https://godaddy.com',                            reg: 0.99,  renew: 39.99, whoisPrivacy: false },
    ],
  },
  {
    tld: '.app', type: 'new-generic', category: ['tech', 'apps'], popularity: 56245, whoisPrivacy: true, dnssec: true,
    prices: [
      { registrar: 'Spaceship',         url: 'https://spaceship.com',                         reg: 4.98,  renew: 12.18, whoisPrivacy: true },
      { registrar: 'Cloudflare',        url: 'https://cloudflare.com/products/registrar',      reg: 12.18, renew: 12.18, whoisPrivacy: true },
      { registrar: 'Porkbun',           url: 'https://porkbun.com',                            reg: 13.98, renew: 15.98, whoisPrivacy: true },
      { registrar: 'Google Domains',    url: 'https://domains.google',                         reg: 14.00, renew: 14.00, whoisPrivacy: true },
      { registrar: 'Dynadot',           url: 'https://dynadot.com',                            reg: 14.99, renew: 16.99, whoisPrivacy: true },
      { registrar: 'TrueHost',          url: 'https://truehost.co.ke',                         reg: 13.33, renew: 16.00, whoisPrivacy: false },
      { registrar: 'Namecheap',         url: 'https://namecheap.com',                          reg: 14.98, renew: 17.98, whoisPrivacy: true },
      { registrar: 'Hover',             url: 'https://hover.com',                              reg: 19.99, renew: 21.99, whoisPrivacy: true },
      { registrar: 'Name.com',          url: 'https://name.com',                               reg: 17.99, renew: 20.99, whoisPrivacy: false },
      { registrar: 'GoDaddy',           url: 'https://godaddy.com',                            reg: 6.99,  renew: 22.99, whoisPrivacy: false },
    ],
  },
  {
    tld: '.dev', type: 'new-generic', category: ['tech', 'developer'], popularity: 77256, whoisPrivacy: true, dnssec: true,
    prices: [
      { registrar: 'Spaceship',         url: 'https://spaceship.com',                         reg: 5.38,  renew: 10.18, whoisPrivacy: true },
      { registrar: 'Cloudflare',        url: 'https://cloudflare.com/products/registrar',      reg: 11.00, renew: 11.00, whoisPrivacy: true },
      { registrar: 'Porkbun',           url: 'https://porkbun.com',                            reg: 10.98, renew: 13.98, whoisPrivacy: true },
      { registrar: 'Google Domains',    url: 'https://domains.google',                         reg: 12.00, renew: 12.00, whoisPrivacy: true },
      { registrar: 'Dynadot',           url: 'https://dynadot.com',                            reg: 12.99, renew: 14.99, whoisPrivacy: true },
      { registrar: 'TrueHost',          url: 'https://truehost.co.ke',                         reg: 12.00, renew: 14.67, whoisPrivacy: false },
      { registrar: 'Namecheap',         url: 'https://namecheap.com',                          reg: 12.98, renew: 16.98, whoisPrivacy: true },
      { registrar: 'Hover',             url: 'https://hover.com',                              reg: 15.99, renew: 18.99, whoisPrivacy: true },
      { registrar: 'Name.com',          url: 'https://name.com',                               reg: 15.99, renew: 18.99, whoisPrivacy: false },
      { registrar: 'GoDaddy',           url: 'https://godaddy.com',                            reg: 7.99,  renew: 21.99, whoisPrivacy: false },
    ],
  },
  {
    tld: '.tech', type: 'new-generic', category: ['tech'], popularity: 59169, whoisPrivacy: true, dnssec: true,
    prices: [
      { registrar: 'Spaceship',         url: 'https://spaceship.com',                         reg: 1.53,  renew: 40.18, whoisPrivacy: true },
      { registrar: 'Porkbun',           url: 'https://porkbun.com',                            reg: 4.98,  renew: 37.98, whoisPrivacy: true },
      { registrar: 'Cloudflare',        url: 'https://cloudflare.com/products/registrar',      reg: 40.18, renew: 40.18, whoisPrivacy: true },
      { registrar: 'Dynadot',           url: 'https://dynadot.com',                            reg: 6.99,  renew: 39.99, whoisPrivacy: true },
      { registrar: 'Namecheap',         url: 'https://namecheap.com',                          reg: 7.48,  renew: 49.98, whoisPrivacy: true },
      { registrar: 'TrueHost',          url: 'https://truehost.co.ke',                         reg: 7.76,  renew: 49.84, whoisPrivacy: false },
      { registrar: 'Hostinger',         url: 'https://hostinger.com',                          reg: 6.99,  renew: 44.99, whoisPrivacy: true },
      { registrar: 'GoDaddy',           url: 'https://godaddy.com',                            reg: 1.99,  renew: 54.99, whoisPrivacy: false },
    ],
  },
  {
    tld: '.tv', type: 'country', category: ['media', 'streaming'], popularity: 48539, whoisPrivacy: false, dnssec: false,
    prices: [
      { registrar: 'Spaceship',         url: 'https://spaceship.com',                         reg: 9.98,  renew: 24.98, whoisPrivacy: false },
      { registrar: 'Porkbun',           url: 'https://porkbun.com',                            reg: 19.98, renew: 26.98, whoisPrivacy: false },
      { registrar: 'Dynadot',           url: 'https://dynadot.com',                            reg: 21.99, renew: 28.99, whoisPrivacy: false },
      { registrar: 'Namecheap',         url: 'https://namecheap.com',                          reg: 32.98, renew: 39.98, whoisPrivacy: false },
      { registrar: 'GoDaddy',           url: 'https://godaddy.com',                            reg: 29.99, renew: 44.99, whoisPrivacy: false },
    ],
  },
  {
    tld: '.cc', type: 'country', category: ['short', 'business'], popularity: 59076, whoisPrivacy: true, dnssec: true,
    prices: [
      { registrar: 'Spaceship',         url: 'https://spaceship.com',                         reg: 3.08,  renew: 8.00,  whoisPrivacy: true },
      { registrar: 'Cloudflare',        url: 'https://cloudflare.com/products/registrar',      reg: 8.00,  renew: 8.00,  whoisPrivacy: true },
      { registrar: 'Porkbun',           url: 'https://porkbun.com',                            reg: 6.98,  renew: 9.98,  whoisPrivacy: true },
      { registrar: 'Dynadot',           url: 'https://dynadot.com',                            reg: 7.99,  renew: 10.99, whoisPrivacy: true },
      { registrar: 'Namecheap',         url: 'https://namecheap.com',                          reg: 7.98,  renew: 11.98, whoisPrivacy: true },
      { registrar: 'GoDaddy',           url: 'https://godaddy.com',                            reg: 3.99,  renew: 15.99, whoisPrivacy: false },
    ],
  },
  {
    tld: '.us', type: 'country', category: ['usa', 'government'], popularity: 69579, whoisPrivacy: false, dnssec: true,
    prices: [
      { registrar: 'Namecheap',         url: 'https://namecheap.com',                          reg: 0.99,  renew: 8.48,  whoisPrivacy: false, promoCode: '99SPECIAL' },
      { registrar: 'Spaceship',         url: 'https://spaceship.com',                         reg: 4.24,  renew: 6.48,  whoisPrivacy: false },
      { registrar: 'Porkbun',           url: 'https://porkbun.com',                            reg: 4.49,  renew: 6.99,  whoisPrivacy: false },
      { registrar: 'Dynadot',           url: 'https://dynadot.com',                            reg: 5.99,  renew: 7.99,  whoisPrivacy: false },
      { registrar: 'Google Domains',    url: 'https://domains.google',                         reg: 12.00, renew: 12.00, whoisPrivacy: false },
      { registrar: 'GoDaddy',           url: 'https://godaddy.com',                            reg: 0.99,  renew: 14.99, whoisPrivacy: false },
    ],
  },
  {
    tld: '.eu', type: 'country', category: ['europe'], popularity: 73473, whoisPrivacy: false, dnssec: true,
    prices: [
      { registrar: 'Spaceship',         url: 'https://spaceship.com',                         reg: 1.55,  renew: 4.91,  whoisPrivacy: false },
      { registrar: 'Porkbun',           url: 'https://porkbun.com',                            reg: 3.48,  renew: 6.98,  whoisPrivacy: false },
      { registrar: 'Dynadot',           url: 'https://dynadot.com',                            reg: 4.99,  renew: 6.99,  whoisPrivacy: false },
      { registrar: 'Namecheap',         url: 'https://namecheap.com',                          reg: 4.98,  renew: 9.98,  whoisPrivacy: false },
      { registrar: 'GoDaddy',           url: 'https://godaddy.com',                            reg: 4.99,  renew: 11.99, whoisPrivacy: false },
    ],
  },
  {
    tld: '.de', type: 'country', category: ['germany', 'europe'], popularity: 64867, whoisPrivacy: false, dnssec: true,
    prices: [
      { registrar: 'Spaceship',         url: 'https://spaceship.com',                         reg: 2.68,  renew: 3.24,  whoisPrivacy: false },
      { registrar: 'Porkbun',           url: 'https://porkbun.com',                            reg: 4.98,  renew: 5.98,  whoisPrivacy: false },
      { registrar: 'Dynadot',           url: 'https://dynadot.com',                            reg: 4.99,  renew: 5.99,  whoisPrivacy: false },
      { registrar: 'Namecheap',         url: 'https://namecheap.com',                          reg: 4.98,  renew: 7.98,  whoisPrivacy: false },
      { registrar: 'GoDaddy',           url: 'https://godaddy.com',                            reg: 3.99,  renew: 9.99,  whoisPrivacy: false },
    ],
  },
  {
    tld: '.in', type: 'country', category: ['india', 'asia'], popularity: 94432, whoisPrivacy: false, dnssec: true,
    prices: [
      { registrar: 'Spaceship',         url: 'https://spaceship.com',                         reg: 5.03,  renew: 5.54,  whoisPrivacy: false },
      { registrar: 'Dynadot',           url: 'https://dynadot.com',                            reg: 5.54,  renew: 5.54,  whoisPrivacy: false },
      { registrar: 'Porkbun',           url: 'https://porkbun.com',                            reg: 4.98,  renew: 6.98,  whoisPrivacy: false },
      { registrar: 'Namecheap',         url: 'https://namecheap.com',                          reg: 6.98,  renew: 9.98,  whoisPrivacy: false },
      { registrar: 'GoDaddy',           url: 'https://godaddy.com',                            reg: 3.99,  renew: 11.99, whoisPrivacy: false },
    ],
  },
  {
    tld: '.gg', type: 'country', category: ['gaming', 'esports'], popularity: 72894, whoisPrivacy: false, dnssec: false,
    prices: [
      { registrar: 'Spaceship',         url: 'https://spaceship.com',                         reg: 49.67, renew: 51.60, whoisPrivacy: false },
      { registrar: 'Porkbun',           url: 'https://porkbun.com',                            reg: 49.98, renew: 54.98, whoisPrivacy: false },
      { registrar: 'Namecheap',         url: 'https://namecheap.com',                          reg: 54.98, renew: 59.98, whoisPrivacy: false },
      { registrar: 'GoDaddy',           url: 'https://godaddy.com',                            reg: 39.99, renew: 64.99, whoisPrivacy: false },
    ],
  },
  {
    tld: '.work', type: 'new-generic', category: ['business', 'jobs'], popularity: 47305, whoisPrivacy: true, dnssec: true,
    prices: [
      { registrar: 'Spaceship',         url: 'https://spaceship.com',                         reg: 1.69,  renew: 6.18,  whoisPrivacy: true },
      { registrar: 'Cloudflare',        url: 'https://cloudflare.com/products/registrar',      reg: 6.18,  renew: 6.18,  whoisPrivacy: true },
      { registrar: 'Porkbun',           url: 'https://porkbun.com',                            reg: 2.98,  renew: 8.98,  whoisPrivacy: true },
      { registrar: 'Dynadot',           url: 'https://dynadot.com',                            reg: 3.99,  renew: 9.99,  whoisPrivacy: true },
      { registrar: 'Namecheap',         url: 'https://namecheap.com',                          reg: 4.98,  renew: 11.98, whoisPrivacy: true },
      { registrar: 'GoDaddy',           url: 'https://godaddy.com',                            reg: 2.99,  renew: 14.99, whoisPrivacy: false },
    ],
  },
  {
    tld: '.pw', type: 'country', category: ['affordable', 'personal'], popularity: 53738, whoisPrivacy: false, dnssec: false,
    prices: [
      { registrar: 'Spaceship',         url: 'https://spaceship.com',                         reg: 0.90,  renew: 14.98, whoisPrivacy: false },
      { registrar: 'Porkbun',           url: 'https://porkbun.com',                            reg: 1.98,  renew: 15.98, whoisPrivacy: false },
      { registrar: 'Namecheap',         url: 'https://namecheap.com',                          reg: 2.98,  renew: 14.98, whoisPrivacy: false },
      { registrar: 'Hostinger',         url: 'https://hostinger.com',                          reg: 0.99,  renew: 12.99, whoisPrivacy: false },
    ],
  },

  // ── African TLDs ──────────────────────────────────────────────────────────
  {
    tld: '.co.ke', type: 'country', category: ['africa', 'kenya'], popularity: 55000, whoisPrivacy: false, dnssec: false,
    prices: [
      { registrar: 'TrueHost',          url: 'https://truehost.co.ke',                         reg: 6.66,  renew: 8.00,  whoisPrivacy: false },
      { registrar: 'KenyaWebExperts',   url: 'https://kenyawebexperts.com',                    reg: 7.50,  renew: 9.00,  whoisPrivacy: false },
      { registrar: 'Sasahost',          url: 'https://sasahost.co.ke',                         reg: 8.00,  renew: 9.50,  whoisPrivacy: false },
      { registrar: 'Wingubox',          url: 'https://wingubox.com',                           reg: 8.50,  renew: 10.00, whoisPrivacy: false },
      { registrar: 'Namecheap',         url: 'https://namecheap.com',                          reg: 9.98,  renew: 14.98, whoisPrivacy: false },
      { registrar: 'GoDaddy',           url: 'https://godaddy.com',                            reg: 8.99,  renew: 19.99, whoisPrivacy: false },
    ],
  },
  {
    tld: '.ke', type: 'country', category: ['africa', 'kenya'], popularity: 20000, whoisPrivacy: false, dnssec: false,
    prices: [
      { registrar: 'TrueHost',          url: 'https://truehost.co.ke',                         reg: 20.00, renew: 20.00, whoisPrivacy: false },
      { registrar: 'KenyaWebExperts',   url: 'https://kenyawebexperts.com',                    reg: 22.00, renew: 22.00, whoisPrivacy: false },
      { registrar: 'Sasahost',          url: 'https://sasahost.co.ke',                         reg: 23.00, renew: 23.00, whoisPrivacy: false },
      { registrar: 'Namecheap',         url: 'https://namecheap.com',                          reg: 25.98, renew: 25.98, whoisPrivacy: false },
    ],
  },
  {
    tld: '.africa', type: 'new-generic', category: ['africa'], popularity: 12000, whoisPrivacy: true, dnssec: true,
    prices: [
      { registrar: 'TrueHost',          url: 'https://truehost.co.ke',                         reg: 12.00, renew: 13.33, whoisPrivacy: false },
      { registrar: 'Porkbun',           url: 'https://porkbun.com',                            reg: 11.98, renew: 15.98, whoisPrivacy: true },
      { registrar: 'Dynadot',           url: 'https://dynadot.com',                            reg: 13.99, renew: 17.99, whoisPrivacy: true },
      { registrar: 'Namecheap',         url: 'https://namecheap.com',                          reg: 14.98, renew: 17.98, whoisPrivacy: true },
      { registrar: 'Name.com',          url: 'https://name.com',                               reg: 15.99, renew: 19.99, whoisPrivacy: false },
      { registrar: 'GoDaddy',           url: 'https://godaddy.com',                            reg: 9.99,  renew: 21.99, whoisPrivacy: false },
    ],
  },
  {
    tld: '.ng', type: 'country', category: ['africa', 'nigeria'], popularity: 15000, whoisPrivacy: false, dnssec: false,
    prices: [
      { registrar: 'TrueHost',          url: 'https://truehost.co.ke',                         reg: 20.00, renew: 20.00, whoisPrivacy: false },
      { registrar: 'Namecheap',         url: 'https://namecheap.com',                          reg: 22.98, renew: 24.98, whoisPrivacy: false },
      { registrar: 'Name.com',          url: 'https://name.com',                               reg: 24.99, renew: 26.99, whoisPrivacy: false },
      { registrar: 'GoDaddy',           url: 'https://godaddy.com',                            reg: 19.99, renew: 34.99, whoisPrivacy: false },
    ],
  },
  {
    tld: '.za', type: 'country', category: ['africa', 'south-africa'], popularity: 18000, whoisPrivacy: false, dnssec: false,
    prices: [
      { registrar: 'Dynadot',           url: 'https://dynadot.com',                            reg: 12.99, renew: 14.99, whoisPrivacy: false },
      { registrar: 'Namecheap',         url: 'https://namecheap.com',                          reg: 14.98, renew: 16.98, whoisPrivacy: false },
      { registrar: 'Name.com',          url: 'https://name.com',                               reg: 16.99, renew: 18.99, whoisPrivacy: false },
      { registrar: 'GoDaddy',           url: 'https://godaddy.com',                            reg: 9.99,  renew: 19.99, whoisPrivacy: false },
    ],
  },
  {
    tld: '.gh', type: 'country', category: ['africa', 'ghana'], popularity: 8000, whoisPrivacy: false, dnssec: false,
    prices: [
      { registrar: 'TrueHost',          url: 'https://truehost.co.ke',                         reg: 18.00, renew: 18.00, whoisPrivacy: false },
      { registrar: 'Namecheap',         url: 'https://namecheap.com',                          reg: 24.98, renew: 24.98, whoisPrivacy: false },
      { registrar: 'GoDaddy',           url: 'https://godaddy.com',                            reg: 19.99, renew: 29.99, whoisPrivacy: false },
    ],
  },

  // ── Popular ccTLDs ──────────────────────────────────────────────────────────
  {
    tld: '.uk', type: 'country', category: ['uk', 'europe'], popularity: 45000, whoisPrivacy: false, dnssec: true,
    prices: [
      { registrar: 'Spaceship',         url: 'https://spaceship.com',                         reg: 6.98,  renew: 8.98,  whoisPrivacy: false },
      { registrar: 'Porkbun',           url: 'https://porkbun.com',                            reg: 7.98,  renew: 9.98,  whoisPrivacy: false },
      { registrar: 'Namecheap',         url: 'https://namecheap.com',                          reg: 7.98,  renew: 11.98, whoisPrivacy: false },
      { registrar: 'GoDaddy',           url: 'https://godaddy.com',                            reg: 3.99,  renew: 14.99, whoisPrivacy: false },
    ],
  },
  {
    tld: '.ca', type: 'country', category: ['canada'], popularity: 40000, whoisPrivacy: false, dnssec: true,
    prices: [
      { registrar: 'Spaceship',         url: 'https://spaceship.com',                         reg: 4.98,  renew: 14.18, whoisPrivacy: false },
      { registrar: 'Porkbun',           url: 'https://porkbun.com',                            reg: 7.98,  renew: 14.98, whoisPrivacy: false },
      { registrar: 'Namecheap',         url: 'https://namecheap.com',                          reg: 8.98,  renew: 16.98, whoisPrivacy: false },
      { registrar: 'GoDaddy',           url: 'https://godaddy.com',                            reg: 2.99,  renew: 19.99, whoisPrivacy: false },
    ],
  },
  {
    tld: '.au', type: 'country', category: ['australia'], popularity: 38000, whoisPrivacy: false, dnssec: true,
    prices: [
      { registrar: 'Spaceship',         url: 'https://spaceship.com',                         reg: 8.98,  renew: 11.98, whoisPrivacy: false },
      { registrar: 'Porkbun',           url: 'https://porkbun.com',                            reg: 12.98, renew: 14.98, whoisPrivacy: false },
      { registrar: 'Namecheap',         url: 'https://namecheap.com',                          reg: 14.98, renew: 16.98, whoisPrivacy: false },
      { registrar: 'GoDaddy',           url: 'https://godaddy.com',                            reg: 12.99, renew: 19.99, whoisPrivacy: false },
    ],
  },
  {
    tld: '.fr', type: 'country', category: ['france', 'europe'], popularity: 35000, whoisPrivacy: false, dnssec: true,
    prices: [
      { registrar: 'Spaceship',         url: 'https://spaceship.com',                         reg: 5.38,  renew: 7.18,  whoisPrivacy: false },
      { registrar: 'Porkbun',           url: 'https://porkbun.com',                            reg: 6.98,  renew: 8.98,  whoisPrivacy: false },
      { registrar: 'Namecheap',         url: 'https://namecheap.com',                          reg: 6.98,  renew: 9.98,  whoisPrivacy: false },
      { registrar: 'GoDaddy',           url: 'https://godaddy.com',                            reg: 4.99,  renew: 13.99, whoisPrivacy: false },
    ],
  },
  {
    tld: '.nl', type: 'country', category: ['netherlands', 'europe'], popularity: 30000, whoisPrivacy: false, dnssec: true,
    prices: [
      { registrar: 'Spaceship',         url: 'https://spaceship.com',                         reg: 4.18,  renew: 5.98,  whoisPrivacy: false },
      { registrar: 'Porkbun',           url: 'https://porkbun.com',                            reg: 5.98,  renew: 7.98,  whoisPrivacy: false },
      { registrar: 'Namecheap',         url: 'https://namecheap.com',                          reg: 6.98,  renew: 9.98,  whoisPrivacy: false },
      { registrar: 'GoDaddy',           url: 'https://godaddy.com',                            reg: 3.99,  renew: 12.99, whoisPrivacy: false },
    ],
  },
  {
    tld: '.es', type: 'country', category: ['spain', 'europe'], popularity: 28000, whoisPrivacy: false, dnssec: true,
    prices: [
      { registrar: 'Spaceship',         url: 'https://spaceship.com',                         reg: 4.38,  renew: 7.18,  whoisPrivacy: false },
      { registrar: 'Porkbun',           url: 'https://porkbun.com',                            reg: 6.98,  renew: 9.98,  whoisPrivacy: false },
      { registrar: 'Namecheap',         url: 'https://namecheap.com',                          reg: 7.98,  renew: 11.98, whoisPrivacy: false },
      { registrar: 'GoDaddy',           url: 'https://godaddy.com',                            reg: 4.99,  renew: 13.99, whoisPrivacy: false },
    ],
  },
  {
    tld: '.jp', type: 'country', category: ['japan', 'asia'], popularity: 42000, whoisPrivacy: false, dnssec: true,
    prices: [
      { registrar: 'Spaceship',         url: 'https://spaceship.com',                         reg: 14.98, renew: 18.98, whoisPrivacy: false },
      { registrar: 'Dynadot',           url: 'https://dynadot.com',                            reg: 18.99, renew: 20.99, whoisPrivacy: false },
      { registrar: 'Namecheap',         url: 'https://namecheap.com',                          reg: 27.98, renew: 27.98, whoisPrivacy: false },
      { registrar: 'GoDaddy',           url: 'https://godaddy.com',                            reg: 29.99, renew: 34.99, whoisPrivacy: false },
    ],
  },
  {
    tld: '.cn', type: 'country', category: ['china', 'asia'], popularity: 25000, whoisPrivacy: false, dnssec: false,
    prices: [
      { registrar: 'Dynadot',           url: 'https://dynadot.com',                            reg: 11.99, renew: 13.99, whoisPrivacy: false },
      { registrar: 'Namecheap',         url: 'https://namecheap.com',                          reg: 14.98, renew: 14.98, whoisPrivacy: false },
      { registrar: 'GoDaddy',           url: 'https://godaddy.com',                            reg: 19.99, renew: 24.99, whoisPrivacy: false },
    ],
  },
  {
    tld: '.br', type: 'country', category: ['brazil', 'south-america'], popularity: 22000, whoisPrivacy: false, dnssec: true,
    prices: [
      { registrar: 'Dynadot',           url: 'https://dynadot.com',                            reg: 24.99, renew: 27.99, whoisPrivacy: false },
      { registrar: 'Namecheap',         url: 'https://namecheap.com',                          reg: 27.98, renew: 27.98, whoisPrivacy: false },
      { registrar: 'GoDaddy',           url: 'https://godaddy.com',                            reg: 29.99, renew: 34.99, whoisPrivacy: false },
    ],
  },

  // ── Business / Niche TLDs ────────────────────────────────────────────────
  {
    tld: '.blog', type: 'new-generic', category: ['blog', 'content'], popularity: 20000, whoisPrivacy: true, dnssec: true,
    prices: [
      { registrar: 'Porkbun',           url: 'https://porkbun.com',                            reg: 2.98,  renew: 26.98, whoisPrivacy: true },
      { registrar: 'Spaceship',         url: 'https://spaceship.com',                         reg: 3.14,  renew: 28.18, whoisPrivacy: true },
      { registrar: 'Dynadot',           url: 'https://dynadot.com',                            reg: 4.99,  renew: 28.99, whoisPrivacy: true },
      { registrar: 'Namecheap',         url: 'https://namecheap.com',                          reg: 4.98,  renew: 29.98, whoisPrivacy: true },
      { registrar: 'GoDaddy',           url: 'https://godaddy.com',                            reg: 2.99,  renew: 34.99, whoisPrivacy: false },
    ],
  },
  {
    tld: '.news', type: 'new-generic', category: ['media', 'news'], popularity: 18000, whoisPrivacy: true, dnssec: true,
    prices: [
      { registrar: 'Porkbun',           url: 'https://porkbun.com',                            reg: 2.98,  renew: 19.98, whoisPrivacy: true },
      { registrar: 'Spaceship',         url: 'https://spaceship.com',                         reg: 3.34,  renew: 22.18, whoisPrivacy: true },
      { registrar: 'Dynadot',           url: 'https://dynadot.com',                            reg: 4.99,  renew: 22.99, whoisPrivacy: true },
      { registrar: 'Namecheap',         url: 'https://namecheap.com',                          reg: 4.98,  renew: 24.98, whoisPrivacy: true },
      { registrar: 'GoDaddy',           url: 'https://godaddy.com',                            reg: 2.99,  renew: 29.99, whoisPrivacy: false },
    ],
  },
  {
    tld: '.site', type: 'new-generic', category: ['affordable', 'business'], popularity: 25000, whoisPrivacy: true, dnssec: true,
    prices: [
      { registrar: 'Spaceship',         url: 'https://spaceship.com',                         reg: 0.98,  renew: 22.18, whoisPrivacy: true },
      { registrar: 'Porkbun',           url: 'https://porkbun.com',                            reg: 1.98,  renew: 23.98, whoisPrivacy: true },
      { registrar: 'Hostinger',         url: 'https://hostinger.com',                          reg: 0.99,  renew: 19.99, whoisPrivacy: true },
      { registrar: 'Namecheap',         url: 'https://namecheap.com',                          reg: 2.98,  renew: 29.98, whoisPrivacy: true },
      { registrar: 'GoDaddy',           url: 'https://godaddy.com',                            reg: 0.99,  renew: 34.99, whoisPrivacy: false },
    ],
  },
  {
    tld: '.live', type: 'new-generic', category: ['media', 'streaming', 'events'], popularity: 15000, whoisPrivacy: true, dnssec: true,
    prices: [
      { registrar: 'Porkbun',           url: 'https://porkbun.com',                            reg: 2.98,  renew: 13.98, whoisPrivacy: true },
      { registrar: 'Spaceship',         url: 'https://spaceship.com',                         reg: 1.69,  renew: 15.18, whoisPrivacy: true },
      { registrar: 'Dynadot',           url: 'https://dynadot.com',                            reg: 3.99,  renew: 15.99, whoisPrivacy: true },
      { registrar: 'Namecheap',         url: 'https://namecheap.com',                          reg: 4.98,  renew: 17.98, whoisPrivacy: true },
      { registrar: 'GoDaddy',           url: 'https://godaddy.com',                            reg: 2.99,  renew: 21.99, whoisPrivacy: false },
    ],
  },
  {
    tld: '.club', type: 'new-generic', category: ['community', 'social'], popularity: 22000, whoisPrivacy: true, dnssec: true,
    prices: [
      { registrar: 'Spaceship',         url: 'https://spaceship.com',                         reg: 0.98,  renew: 9.18,  whoisPrivacy: true },
      { registrar: 'Porkbun',           url: 'https://porkbun.com',                            reg: 2.98,  renew: 9.98,  whoisPrivacy: true },
      { registrar: 'Dynadot',           url: 'https://dynadot.com',                            reg: 3.99,  renew: 11.99, whoisPrivacy: true },
      { registrar: 'Namecheap',         url: 'https://namecheap.com',                          reg: 3.98,  renew: 12.98, whoisPrivacy: true },
      { registrar: 'GoDaddy',           url: 'https://godaddy.com',                            reg: 0.99,  renew: 16.99, whoisPrivacy: false },
    ],
  },
  {
    tld: '.media', type: 'new-generic', category: ['media', 'content'], popularity: 12000, whoisPrivacy: true, dnssec: true,
    prices: [
      { registrar: 'Porkbun',           url: 'https://porkbun.com',                            reg: 4.98,  renew: 27.98, whoisPrivacy: true },
      { registrar: 'Spaceship',         url: 'https://spaceship.com',                         reg: 3.34,  renew: 29.18, whoisPrivacy: true },
      { registrar: 'Dynadot',           url: 'https://dynadot.com',                            reg: 6.99,  renew: 30.99, whoisPrivacy: true },
      { registrar: 'Namecheap',         url: 'https://namecheap.com',                          reg: 6.98,  renew: 32.98, whoisPrivacy: true },
      { registrar: 'GoDaddy',           url: 'https://godaddy.com',                            reg: 4.99,  renew: 39.99, whoisPrivacy: false },
    ],
  },
  {
    tld: '.world', type: 'new-generic', category: ['general'], popularity: 11000, whoisPrivacy: true, dnssec: true,
    prices: [
      { registrar: 'Porkbun',           url: 'https://porkbun.com',                            reg: 2.98,  renew: 21.98, whoisPrivacy: true },
      { registrar: 'Spaceship',         url: 'https://spaceship.com',                         reg: 2.04,  renew: 23.18, whoisPrivacy: true },
      { registrar: 'Dynadot',           url: 'https://dynadot.com',                            reg: 4.99,  renew: 24.99, whoisPrivacy: true },
      { registrar: 'Namecheap',         url: 'https://namecheap.com',                          reg: 4.98,  renew: 26.98, whoisPrivacy: true },
      { registrar: 'GoDaddy',           url: 'https://godaddy.com',                            reg: 2.99,  renew: 31.99, whoisPrivacy: false },
    ],
  },
  {
    tld: '.design', type: 'new-generic', category: ['creative', 'design'], popularity: 14000, whoisPrivacy: true, dnssec: true,
    prices: [
      { registrar: 'Porkbun',           url: 'https://porkbun.com',                            reg: 3.98,  renew: 42.98, whoisPrivacy: true },
      { registrar: 'Spaceship',         url: 'https://spaceship.com',                         reg: 4.28,  renew: 44.18, whoisPrivacy: true },
      { registrar: 'Dynadot',           url: 'https://dynadot.com',                            reg: 6.99,  renew: 44.99, whoisPrivacy: true },
      { registrar: 'Namecheap',         url: 'https://namecheap.com',                          reg: 6.98,  renew: 49.98, whoisPrivacy: true },
      { registrar: 'GoDaddy',           url: 'https://godaddy.com',                            reg: 4.99,  renew: 59.99, whoisPrivacy: false },
    ],
  },
  {
    tld: '.health', type: 'new-generic', category: ['health', 'medical'], popularity: 8000, whoisPrivacy: true, dnssec: true,
    prices: [
      { registrar: 'Porkbun',           url: 'https://porkbun.com',                            reg: 49.98, renew: 69.98, whoisPrivacy: true },
      { registrar: 'Dynadot',           url: 'https://dynadot.com',                            reg: 59.99, renew: 74.99, whoisPrivacy: true },
      { registrar: 'Namecheap',         url: 'https://namecheap.com',                          reg: 64.98, renew: 79.98, whoisPrivacy: true },
      { registrar: 'GoDaddy',           url: 'https://godaddy.com',                            reg: 59.99, renew: 84.99, whoisPrivacy: false },
    ],
  },
];
