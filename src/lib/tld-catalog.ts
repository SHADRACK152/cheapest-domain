/**
 * tld-catalog.ts
 *
 * Unified TLD catalog merging two data sources:
 *  1. tld-registrar-data.ts   — 54 hand-curated TLDs with full multi-registrar pricing (USD)
 *  2. data/tld-prices.json    — 1,000+ TLDs enriched from IANA + ICANN + Cloudflare (KES)
 *
 * Exports:
 *  - CatalogEntry  — extended TldEntry with brand/publicTld/operator fields
 *  - TLD_CATALOG   — all publicly-registrable priced TLDs, sorted popularity-first
 *  - BRAND_TLDS    — brand/corporate TLDs (not publicly registrable)
 *  - cheapestCatalog() — same API as cheapest() from tld-registrar-data
 */

import tldPricesRaw from '../../data/tld-prices.json';
import { TLD_DATA, TldEntry, RegistrarPrice } from './tld-registrar-data';

// ── Types ────────────────────────────────────────────────────────────────────

export type { RegistrarPrice };

/** CatalogEntry is TldEntry extended with enrichment metadata */
export type CatalogEntry = TldEntry & {
  /** true = brand/corporate TLD owned by one company — NOT publicly registrable */
  brand: boolean;
  /** true = available for public registration */
  publicTld: boolean;
  /** registry operator company name */
  operator: string | null;
};

// ── Helpers ──────────────────────────────────────────────────────────────────

const KES_TO_USD = 1 / (tldPricesRaw.exchange?.USD_TO_KES ?? 150);

function kesToUsd(kes: number): number {
  return Math.round(kes * KES_TO_USD * 100) / 100;
}

export function cheapestCatalog(entry: CatalogEntry | TldEntry) {
  const { prices } = entry;
  if (!prices.length) {
    return { cheapReg: 0, cheapRenew: 0, cheapRegName: '—', cheapRenewName: '—' };
  }
  const cheapReg   = Math.min(...prices.map((p) => p.reg));
  const cheapRenew = Math.min(...prices.map((p) => p.renew));
  return {
    cheapReg,
    cheapRenew,
    cheapRegName:   prices.find((p) => p.reg   === cheapReg)!.registrar,
    cheapRenewName: prices.find((p) => p.renew === cheapRenew)!.registrar,
  };
}

// ── Build catalog ─────────────────────────────────────────────────────────────

type RawTldEntry = {
  reg: number;
  renew: number;
  brand?: boolean;
  public?: boolean;
  operator?: string | null;
  registrars?: string[];
  sources?: {
    truehost?: { reg: number; renew: number };
    cloudflare_wholesale_usd?: { reg: number; renew: number };
  };
};

const priceEntries = tldPricesRaw.tlds as unknown as Record<string, RawTldEntry>;

// Detailed entries (54 curated TLDs) — enriched with catalog fields
const detailedTldsSet = new Set(TLD_DATA.map((e) => e.tld));

const detailedCatalog: CatalogEntry[] = TLD_DATA.map((e) => {
  const raw = priceEntries[e.tld];
  return {
    ...e,
    brand:    raw?.brand    ?? false,
    publicTld: raw?.public  ?? true,
    operator: raw?.operator ?? null,
  };
});

// Simple entries — all public priced TLDs not already in TLD_DATA
const simpleCatalog: CatalogEntry[] = (Object.entries(priceEntries)
  .filter(([tld, raw]) => {
    if (detailedTldsSet.has(tld))          return false; // already in detailed
    if (raw.brand === true)                return false; // brand/corporate
    if (!raw.reg && !raw.renew)            return false; // unpriced
    return true;
  })
  .map(([tld, raw]): CatalogEntry | null => {
    const isCcTld = /^\.[a-z]{2}$/.test(tld);

    // Build prices from available sources (USD)
    const prices: RegistrarPrice[] = [];

    if (raw.sources?.truehost) {
      prices.push({
        registrar: 'TrueHost',
        url: 'https://truehost.co.ke',
        reg:   kesToUsd(raw.sources.truehost.reg),
        renew: kesToUsd(raw.sources.truehost.renew),
        whoisPrivacy: false,
      });
    }

    if (raw.sources?.cloudflare_wholesale_usd) {
      prices.push({
        registrar: 'Cloudflare',
        url: 'https://cloudflare.com/products/registrar',
        reg:   raw.sources.cloudflare_wholesale_usd.reg,
        renew: raw.sources.cloudflare_wholesale_usd.renew,
        whoisPrivacy: true,
      });
    }

    // Only include TLDs with at least one verified registrar source.
    // TLDs with prices but no sources came from a legacy WHMCS cache and
    // may not be actively offered by any listed registrar — skip them here.
    // They are still searchable via truehost-fetcher (reads tld-prices.json directly).
    if (!prices.length) return null;

    return {
      tld,
      type:         isCcTld ? 'country' : 'new-generic',
      category:     [],
      whoisPrivacy: false,
      dnssec:       false,
      brand:        false,
      publicTld:    true,
      operator:     raw.operator ?? null,
      prices,
    };
  })
  .filter((e): e is CatalogEntry => e !== null));

/**
 * Full unified TLD catalog — publicly registrable + priced.
 * Detailed entries sorted by popularity first; simple entries alphabetically appended.
 */
export const TLD_CATALOG: CatalogEntry[] = [
  ...detailedCatalog.sort((a, b) => (b.popularity ?? 0) - (a.popularity ?? 0)),
  ...simpleCatalog.sort((a, b) => a.tld.localeCompare(b.tld)),
];

/** Brand/corporate TLDs — not publicly registrable (for reference / filtering) */
export const BRAND_TLDS: string[] = Object.entries(priceEntries)
  .filter(([, raw]) => raw.brand === true)
  .map(([tld]) => tld)
  .sort();
