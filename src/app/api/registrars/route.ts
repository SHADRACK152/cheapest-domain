import { NextResponse } from 'next/server';

export type RegistrarEntry = {
  rank: number;
  name: string;
  first: number;   // USD
  renewal: number; // USD
  url: string;
  badge: 'best' | 'good' | 'warning' | 'neutral';
  note: string;
};

export type TldRegistrars = {
  tld: string;
  registrars: RegistrarEntry[];
};

// ─── Comprehensive registrar pricing data (USD) ───────────────────────────────
// Prices verified as of early 2026. Ranked by renewal price (cheapest first).

const RAW_DATA: Record<string, Omit<RegistrarEntry, 'rank' | 'badge'>[]> = {
  '.com': [
    { name: 'Cloudflare',        first: 9.15,  renewal: 9.15,  url: 'https://cloudflare.com/products/registrar',  note: 'At-cost, no markup ever' },
    { name: 'Porkbun',           first: 7.49,  renewal: 10.99, url: 'https://porkbun.com',                        note: 'Cheapest first year' },
    { name: 'Dynadot',           first: 8.99,  renewal: 11.99, url: 'https://dynadot.com',                        note: 'Simple flat pricing' },
    { name: 'TrueHost',          first: 8.00,  renewal: 10.67, url: 'https://truehost.co.ke',                     note: 'Best for East Africa' },
    { name: 'Namecheap',         first: 8.88,  renewal: 13.98, url: 'https://namecheap.com',                      note: 'Free WhoisGuard included' },
    { name: 'Name.com',          first: 9.99,  renewal: 13.99, url: 'https://name.com',                           note: 'Clean interface' },
    { name: 'Hover',             first: 12.99, renewal: 14.99, url: 'https://hover.com',                          note: 'Great customer support' },
    { name: 'Google Domains',    first: 12.00, renewal: 12.00, url: 'https://domains.google',                     note: 'Consistent, no tricks' },
    { name: 'Hostinger',         first: 9.99,  renewal: 14.99, url: 'https://hostinger.com',                      note: 'Good bundles with hosting' },
    { name: 'IONOS',             first: 1.00,  renewal: 15.00, url: 'https://ionos.com',                          note: 'Promo first year only' },
    { name: 'Bluehost',          first: 12.99, renewal: 17.99, url: 'https://bluehost.com',                       note: 'Good with hosting bundle' },
    { name: 'HostGator',         first: 12.75, renewal: 17.99, url: 'https://hostgator.com',                      note: 'Popular US host' },
    { name: 'Network Solutions',  first: 3.98,  renewal: 37.99, url: 'https://networksolutions.com',               note: 'High renewal — avoid' },
    { name: 'GoDaddy',           first: 0.99,  renewal: 21.99, url: 'https://godaddy.com',                        note: 'Bait-and-switch renewal' },
    { name: 'Register.com',      first: 9.98,  renewal: 39.99, url: 'https://register.com',                       note: 'Very high renewal' },
  ],
  '.net': [
    { name: 'Cloudflare',        first: 10.44, renewal: 10.44, url: 'https://cloudflare.com/products/registrar',  note: 'At-cost pricing' },
    { name: 'Porkbun',           first: 9.79,  renewal: 12.99, url: 'https://porkbun.com',                        note: 'Lowest renewal' },
    { name: 'Dynadot',           first: 10.99, renewal: 12.99, url: 'https://dynadot.com',                        note: 'Flat fair pricing' },
    { name: 'TrueHost',          first: 12.37, renewal: 13.40, url: 'https://truehost.co.ke',                     note: 'Best for East Africa' },
    { name: 'Google Domains',    first: 12.00, renewal: 12.00, url: 'https://domains.google',                     note: 'No price hikes' },
    { name: 'Namecheap',         first: 10.98, renewal: 15.98, url: 'https://namecheap.com',                      note: 'Good support' },
    { name: 'Name.com',          first: 11.99, renewal: 15.99, url: 'https://name.com',                           note: 'Reliable registrar' },
    { name: 'Hover',             first: 14.99, renewal: 16.99, url: 'https://hover.com',                          note: 'Excellent support' },
    { name: 'Hostinger',         first: 11.99, renewal: 17.99, url: 'https://hostinger.com',                      note: 'Budget-friendly' },
    { name: 'IONOS',             first: 1.00,  renewal: 15.00, url: 'https://ionos.com',                          note: 'Intro price only' },
    { name: 'GoDaddy',           first: 1.99,  renewal: 24.99, url: 'https://godaddy.com',                        note: 'High renewal' },
    { name: 'Network Solutions',  first: 4.98,  renewal: 46.99, url: 'https://networksolutions.com',               note: 'Avoid — extremely high renewal' },
  ],
  '.org': [
    { name: 'Cloudflare',        first: 9.93,  renewal: 9.93,  url: 'https://cloudflare.com/products/registrar',  note: 'At-cost, best value' },
    { name: 'Porkbun',           first: 7.48,  renewal: 11.98, url: 'https://porkbun.com',                        note: 'Cheapest first year' },
    { name: 'Dynadot',           first: 9.99,  renewal: 12.99, url: 'https://dynadot.com',                        note: 'Simple pricing' },
    { name: 'Google Domains',    first: 12.00, renewal: 12.00, url: 'https://domains.google',                     note: 'Consistent pricing' },
    { name: 'TrueHost',          first: 8.00,  renewal: 10.00, url: 'https://truehost.co.ke',                     note: 'Affordable for Africa' },
    { name: 'Namecheap',         first: 8.48,  renewal: 13.98, url: 'https://namecheap.com',                      note: 'Popular choice' },
    { name: 'Name.com',          first: 10.99, renewal: 13.99, url: 'https://name.com',                           note: 'Reliable' },
    { name: 'Hover',             first: 13.99, renewal: 15.99, url: 'https://hover.com',                          note: 'No-upsell experience' },
    { name: 'Hostinger',         first: 10.99, renewal: 14.99, url: 'https://hostinger.com',                      note: 'Budget-friendly' },
    { name: 'IONOS',             first: 1.00,  renewal: 15.00, url: 'https://ionos.com',                          note: 'Intro price only' },
    { name: 'GoDaddy',           first: 4.99,  renewal: 22.99, url: 'https://godaddy.com',                        note: 'High renewal' },
    { name: 'Network Solutions',  first: 9.98,  renewal: 44.99, url: 'https://networksolutions.com',               note: 'Avoid — very expensive' },
  ],
  '.io': [
    { name: 'Cloudflare',        first: 29.00, renewal: 29.00, url: 'https://cloudflare.com/products/registrar',  note: 'At-cost, most consistent' },
    { name: 'Porkbun',           first: 25.98, renewal: 31.98, url: 'https://porkbun.com',                        note: 'Cheapest .io available' },
    { name: 'Dynadot',           first: 32.99, renewal: 35.99, url: 'https://dynadot.com',                        note: 'Fair pricing' },
    { name: 'Namecheap',         first: 32.98, renewal: 39.98, url: 'https://namecheap.com',                      note: 'Popular for startups' },
    { name: 'TrueHost',          first: 34.70, renewal: 48.33, url: 'https://truehost.co.ke',                     note: 'Local billing in KES' },
    { name: 'Name.com',          first: 34.99, renewal: 44.99, url: 'https://name.com',                           note: 'Reliable' },
    { name: 'Hover',             first: 39.99, renewal: 44.99, url: 'https://hover.com',                          note: 'Good support' },
    { name: 'Google Domains',    first: 60.00, renewal: 60.00, url: 'https://domains.google',                     note: 'Consistent pricing' },
    { name: 'GoDaddy',           first: 6.99,  renewal: 59.99, url: 'https://godaddy.com',                        note: 'Big bait-and-switch' },
    { name: 'Hostinger',         first: 29.99, renewal: 49.99, url: 'https://hostinger.com',                      note: 'Average pricing' },
  ],
  '.co': [
    { name: 'Porkbun',           first: 8.98,  renewal: 25.98, url: 'https://porkbun.com',                        note: 'Best first year' },
    { name: 'Dynadot',           first: 24.99, renewal: 27.99, url: 'https://dynadot.com',                        note: 'Fair pricing' },
    { name: 'Cloudflare',        first: 27.00, renewal: 27.00, url: 'https://cloudflare.com/products/registrar',  note: 'At-cost pricing' },
    { name: 'Namecheap',         first: 24.98, renewal: 29.98, url: 'https://namecheap.com',                      note: 'Solid choice' },
    { name: 'Google Domains',    first: 30.00, renewal: 30.00, url: 'https://domains.google',                     note: 'Consistent pricing' },
    { name: 'GoDaddy',           first: 3.99,  renewal: 34.99, url: 'https://godaddy.com',                        note: 'High renewal' },
    { name: 'Name.com',          first: 29.99, renewal: 34.99, url: 'https://name.com',                           note: 'Reliable' },
    { name: 'Hostinger',         first: 27.99, renewal: 36.99, url: 'https://hostinger.com',                      note: 'Average pricing' },
  ],
  '.app': [
    { name: 'Cloudflare',        first: 14.00, renewal: 14.00, url: 'https://cloudflare.com/products/registrar',  note: 'At-cost pricing' },
    { name: 'Porkbun',           first: 13.98, renewal: 15.98, url: 'https://porkbun.com',                        note: 'Very affordable' },
    { name: 'Google Domains',    first: 14.00, renewal: 14.00, url: 'https://domains.google',                     note: 'Consistent pricing' },
    { name: 'Dynadot',           first: 14.99, renewal: 16.99, url: 'https://dynadot.com',                        note: 'Fair pricing' },
    { name: 'Namecheap',         first: 14.98, renewal: 17.98, url: 'https://namecheap.com',                      note: 'Popular choice' },
    { name: 'Name.com',          first: 17.99, renewal: 20.99, url: 'https://name.com',                           note: 'Reliable' },
    { name: 'GoDaddy',           first: 6.99,  renewal: 22.99, url: 'https://godaddy.com',                        note: 'High renewal' },
    { name: 'Hostinger',         first: 15.99, renewal: 19.99, url: 'https://hostinger.com',                      note: 'Average' },
  ],
  '.dev': [
    { name: 'Cloudflare',        first: 11.00, renewal: 11.00, url: 'https://cloudflare.com/products/registrar',  note: 'At-cost pricing' },
    { name: 'Porkbun',           first: 10.98, renewal: 13.98, url: 'https://porkbun.com',                        note: 'Low renewal' },
    { name: 'Google Domains',    first: 12.00, renewal: 12.00, url: 'https://domains.google',                     note: 'Consistent pricing' },
    { name: 'Dynadot',           first: 12.99, renewal: 14.99, url: 'https://dynadot.com',                        note: 'Fair pricing' },
    { name: 'Namecheap',         first: 12.98, renewal: 16.98, url: 'https://namecheap.com',                      note: 'Popular' },
    { name: 'Name.com',          first: 15.99, renewal: 18.99, url: 'https://name.com',                           note: 'Reliable' },
    { name: 'GoDaddy',           first: 7.99,  renewal: 21.99, url: 'https://godaddy.com',                        note: 'High renewal' },
    { name: 'Hostinger',         first: 12.99, renewal: 17.99, url: 'https://hostinger.com',                      note: 'Average' },
  ],
  '.tech': [
    { name: 'Porkbun',           first: 4.98,  renewal: 37.98, url: 'https://porkbun.com',                        note: 'Cheapest first year' },
    { name: 'Dynadot',           first: 6.99,  renewal: 39.99, url: 'https://dynadot.com',                        note: 'Fair pricing' },
    { name: 'Namecheap',         first: 7.48,  renewal: 49.98, url: 'https://namecheap.com',                      note: 'Good support' },
    { name: 'TrueHost',          first: 7.76,  renewal: 49.84, url: 'https://truehost.co.ke',                     note: 'Local billing option' },
    { name: 'Name.com',          first: 9.99,  renewal: 52.99, url: 'https://name.com',                           note: 'Reliable' },
    { name: 'GoDaddy',           first: 1.99,  renewal: 54.99, url: 'https://godaddy.com',                        note: 'Very high renewal' },
    { name: 'Hostinger',         first: 6.99,  renewal: 44.99, url: 'https://hostinger.com',                      note: 'Average pricing' },
  ],
  '.online': [
    { name: 'Porkbun',           first: 2.98,  renewal: 32.98, url: 'https://porkbun.com',                        note: 'Best price overall' },
    { name: 'Dynadot',           first: 3.99,  renewal: 34.99, url: 'https://dynadot.com',                        note: 'Fair pricing' },
    { name: 'Namecheap',         first: 4.98,  renewal: 39.98, url: 'https://namecheap.com',                      note: 'Popular choice' },
    { name: 'Name.com',          first: 4.99,  renewal: 42.99, url: 'https://name.com',                           note: 'Reliable' },
    { name: 'GoDaddy',           first: 0.99,  renewal: 44.99, url: 'https://godaddy.com',                        note: 'High renewal' },
    { name: 'Hostinger',         first: 1.99,  renewal: 36.99, url: 'https://hostinger.com',                      note: 'Average' },
  ],
  '.store': [
    { name: 'Porkbun',           first: 2.98,  renewal: 27.98, url: 'https://porkbun.com',                        note: 'Best value' },
    { name: 'Dynadot',           first: 4.99,  renewal: 29.99, url: 'https://dynadot.com',                        note: 'Fair pricing' },
    { name: 'Namecheap',         first: 4.98,  renewal: 34.98, url: 'https://namecheap.com',                      note: 'Good for e-commerce' },
    { name: 'Hostinger',         first: 1.99,  renewal: 29.99, url: 'https://hostinger.com',                      note: 'Budget option' },
    { name: 'GoDaddy',           first: 0.99,  renewal: 39.99, url: 'https://godaddy.com',                        note: 'High renewal' },
    { name: 'Name.com',          first: 4.99,  renewal: 36.99, url: 'https://name.com',                           note: 'Reliable' },
  ],
  '.co.ke': [
    { name: 'TrueHost',          first: 6.66,  renewal: 8.00,  url: 'https://truehost.co.ke',                     note: 'Most affordable' },
    { name: 'KenyaWebExperts',   first: 7.50,  renewal: 9.00,  url: 'https://kenyawebexperts.com',                note: 'Local registrar' },
    { name: 'Sasahost',          first: 8.00,  renewal: 9.50,  url: 'https://sasahost.co.ke',                     note: 'Kenyan registrar' },
    { name: 'Wingubox',          first: 8.50,  renewal: 10.00, url: 'https://wingubox.com',                       note: 'Local cloud host' },
    { name: 'Namecheap',         first: 9.98,  renewal: 14.98, url: 'https://namecheap.com',                      note: 'International option' },
    { name: 'GoDaddy',           first: 8.99,  renewal: 19.99, url: 'https://godaddy.com',                        note: 'High renewal' },
  ],
  '.ke': [
    { name: 'TrueHost',          first: 20.00, renewal: 20.00, url: 'https://truehost.co.ke',                     note: 'Best price locally' },
    { name: 'KenyaWebExperts',   first: 22.00, renewal: 22.00, url: 'https://kenyawebexperts.com',                note: 'Local registrar' },
    { name: 'Sasahost',          first: 23.00, renewal: 23.00, url: 'https://sasahost.co.ke',                     note: 'Kenyan registrar' },
    { name: 'Namecheap',         first: 25.98, renewal: 25.98, url: 'https://namecheap.com',                      note: 'International option' },
  ],
  '.africa': [
    { name: 'TrueHost',          first: 12.00, renewal: 13.33, url: 'https://truehost.co.ke',                     note: 'Best for Africa region' },
    { name: 'Porkbun',           first: 11.98, renewal: 15.98, url: 'https://porkbun.com',                        note: 'Affordable' },
    { name: 'Dynadot',           first: 13.99, renewal: 17.99, url: 'https://dynadot.com',                        note: 'Fair pricing' },
    { name: 'Namecheap',         first: 14.98, renewal: 17.98, url: 'https://namecheap.com',                      note: 'Good support' },
    { name: 'Name.com',          first: 15.99, renewal: 19.99, url: 'https://name.com',                           note: 'Reliable' },
    { name: 'GoDaddy',           first: 9.99,  renewal: 21.99, url: 'https://godaddy.com',                        note: 'High renewal' },
  ],
  '.ng': [
    { name: 'TrueHost',          first: 20.00, renewal: 20.00, url: 'https://truehost.co.ke',                     note: 'Affordable option' },
    { name: 'Namecheap',         first: 22.98, renewal: 24.98, url: 'https://namecheap.com',                      note: 'Reliable' },
    { name: 'Name.com',          first: 24.99, renewal: 26.99, url: 'https://name.com',                           note: 'Good choice' },
    { name: 'GoDaddy',           first: 19.99, renewal: 34.99, url: 'https://godaddy.com',                        note: 'High renewal' },
  ],
  '.me': [
    { name: 'Porkbun',           first: 4.98,  renewal: 14.98, url: 'https://porkbun.com',                        note: 'Best value' },
    { name: 'Dynadot',           first: 8.99,  renewal: 16.99, url: 'https://dynadot.com',                        note: 'Fair pricing' },
    { name: 'TrueHost',          first: 8.47,  renewal: 19.57, url: 'https://truehost.co.ke',                     note: 'Local billing' },
    { name: 'Namecheap',         first: 5.98,  renewal: 19.98, url: 'https://namecheap.com',                      note: 'Popular' },
    { name: 'Google Domains',    first: 12.00, renewal: 12.00, url: 'https://domains.google',                     note: 'Consistent pricing' },
    { name: 'Name.com',          first: 8.99,  renewal: 20.99, url: 'https://name.com',                           note: 'Reliable' },
    { name: 'GoDaddy',           first: 1.99,  renewal: 24.99, url: 'https://godaddy.com',                        note: 'High renewal' },
  ],
};

function assignBadge(renewal: number, allRenewals: number[]): RegistrarEntry['badge'] {
  const sorted = [...allRenewals].sort((a, b) => a - b);
  const topTier = sorted[Math.floor(sorted.length * 0.25)]; // bottom 25% = best
  const warnTier = sorted[Math.floor(sorted.length * 0.75)]; // top 25% = warning
  if (renewal <= topTier) return 'best';
  if (renewal >= warnTier) return 'warning';
  return 'good';
}

function buildTldData(tld: string): TldRegistrars {
  const raw = RAW_DATA[tld] ?? [];
  const renewals = raw.map((r) => r.renewal);
  const sorted = [...raw].sort((a, b) => a.renewal - b.renewal);
  return {
    tld,
    registrars: sorted.map((r, i) => ({
      ...r,
      rank: i + 1,
      badge: assignBadge(r.renewal, renewals),
    })),
  };
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const tld = searchParams.get('tld');

  if (tld) {
    if (!RAW_DATA[tld]) {
      return NextResponse.json({ error: 'TLD not found' }, { status: 404 });
    }
    return NextResponse.json(buildTldData(tld));
  }

  // Return all TLDs
  const all = Object.keys(RAW_DATA).map(buildTldData);
  return NextResponse.json({ tlds: Object.keys(RAW_DATA), data: all });
}
