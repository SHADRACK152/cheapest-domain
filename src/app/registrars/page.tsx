'use client';

import { useState, useMemo, useCallback } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Globe, Search, ChevronLeft, ChevronRight,
  ArrowUpDown, X, CheckCircle, Shield, Copy, CheckCircle2, Tag,
} from 'lucide-react';
import { USD_TO_KES_RATE } from '@/lib/currency';
import { TLD_CATALOG, cheapestCatalog } from '@/lib/tld-catalog';
import { cn } from '@/lib/utils';

// ─── Types ────────────────────────────────────────────────────────────────────

type TldRow = {
  tld: string;
  type: string;
  category: string[];
  popularity?: number;
  brand: boolean;
  publicTld: boolean;
  operator: string | null;
  isIdn: boolean;
  whoisPrivacy: boolean;
  dnssec: boolean;
  priced: boolean;
  cheapReg: number | null;
  cheapRenew: number | null;
  cheapRegName: string;
  cheapRenewName: string;
  cheapRegPromo?: string;
  cheapRegUrl?: string;
};

const TLD_TYPES = ['', 'generic', 'country', 'new-generic', 'sponsored'];
const TYPE_LABELS: Record<string, string> = {
  '': 'All Types',
  'generic': 'Generic',
  'country': 'Country (ccTLD)',
  'new-generic': 'New Generic',
  'sponsored': 'Sponsored',
};

const CATEGORIES = [
  '', 'popular', 'tech', 'startup', 'business', 'ecommerce', 'africa',
  'kenya', 'media', 'personal', 'gaming', 'blog', 'creative', 'ai',
];

const PER_PAGE_OPTIONS = [10, 25, 50, 100];

type Currency = 'USD' | 'KES';
function fmt(usd: number | null, currency: Currency) {
  if (usd === null) return 'N/A';
  return currency === 'KES'
    ? `KES ${Math.round(usd * USD_TO_KES_RATE).toLocaleString()}`
    : `$${usd.toFixed(2)}`;
}

// Pre-compute cheapest prices for all TLDs once at module load
const ALL_ROWS: TldRow[] = TLD_CATALOG.map((e) => {
  const { cheapReg, cheapRenew, cheapRegName, cheapRenewName } = cheapestCatalog(e);
  const cheapRegEntry = e.prices.find((p) => p.reg === cheapReg);
  const priced = e.prices.length > 0;

  return {
    tld: e.tld,
    type: e.type,
    category: e.category,
    popularity: e.popularity,
    brand: e.brand,
    publicTld: e.publicTld,
    operator: e.operator,
    isIdn: e.tld.startsWith('.xn--'),
    whoisPrivacy: e.whoisPrivacy,
    dnssec: e.dnssec,
    priced,
    cheapReg: priced ? cheapReg : null,
    cheapRenew: priced ? cheapRenew : null,
    cheapRegName: priced ? cheapRegName : 'Unavailable',
    cheapRenewName: priced ? cheapRenewName : 'Unavailable',
    cheapRegPromo: cheapRegEntry?.promoCode,
    cheapRegUrl:   cheapRegEntry?.url,
  };
});

// ─── Component ───────────────────────────────────────────────────────────────

export default function RegistrarsPage() {
  // Filters
  const [search, setSearch]       = useState('');
  const [type, setType]           = useState('');
  const [category, setCategory]   = useState('');
  const [maxReg, setMaxReg]       = useState<number | null>(null);
  const [sortField, setSortField] = useState('popularity');
  const [page, setPage]           = useState(1);
  const [perPage, setPerPage]     = useState(25);
  const [currency, setCurrency]   = useState<Currency>('USD');
  const [includeBrand, setIncludeBrand] = useState(true);
  const [includeIdn, setIncludeIdn] = useState(true);
  const [copied, setCopied]       = useState<string | null>(null);

  const copyCode = useCallback((code: string) => {
    navigator.clipboard.writeText(code).catch(() => {});
    setCopied(code);
    setTimeout(() => setCopied(null), 2000);
  }, []);

  const promoCount = useMemo(() => ALL_ROWS.filter((r) => r.cheapRegPromo).length, []);

  // All filtering/sorting/pagination happens synchronously in-memory — no API call needed
  const { rows, total, totalPages } = useMemo(() => {
    let results = ALL_ROWS;
    if (search)   results = results.filter((e) => e.tld.includes(search.toLowerCase()));
    if (type)     results = results.filter((e) => e.type === type);
    if (category) results = results.filter((e) => e.category.includes(category));
    if (!includeBrand) results = results.filter((e) => !e.brand);
    if (!includeIdn) results = results.filter((e) => !e.isIdn);
    if (maxReg !== null) {
      results = results.filter((e) => e.priced && e.cheapReg !== null && e.cheapReg <= maxReg);
    }

    if (sortField === 'reg') {
      results = [...results].sort((a, b) => (a.cheapReg ?? Number.POSITIVE_INFINITY) - (b.cheapReg ?? Number.POSITIVE_INFINITY));
    } else if (sortField === 'renew') {
      results = [...results].sort((a, b) => (a.cheapRenew ?? Number.POSITIVE_INFINITY) - (b.cheapRenew ?? Number.POSITIVE_INFINITY));
    } else {
      results = [...results].sort((a, b) => (b.popularity ?? 0) - (a.popularity ?? 0));
    }

    const total = results.length;
    const totalPages = Math.ceil(total / perPage) || 1;
    const safePageN = Math.min(page, totalPages);
    const rows = results.slice((safePageN - 1) * perPage, safePageN * perPage);
    return { rows, total, totalPages };
  }, [search, type, category, includeBrand, includeIdn, maxReg, sortField, page, perPage]);

  const resetFilters = () => {
    setSearch(''); setType(''); setCategory('');
    setIncludeBrand(true); setIncludeIdn(true);
    setMaxReg(null); setSortField('popularity'); setPage(1);
  };

  return (
    <main className="min-h-screen bg-gray-50 pt-24 pb-20">
      <div className="container-wide">

        {/* ── Header ──────────────────────────────────────────────────── */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center space-y-3 mb-8">
          <span className="inline-flex items-center gap-2 rounded-full bg-primary-50 px-4 py-1.5 text-sm font-medium text-primary-600">
            <Globe className="h-4 w-4" />
            {total > 0 ? `${total} TLDs shown` : 'Domain Registrar Comparison'}
          </span>
          <h1 className="text-4xl md:text-5xl font-bold text-[#111111]">Compare Domain Prices</h1>
          <p className="text-gray-500 max-w-xl mx-auto">
            Real registration &amp; renewal prices across major registrars — click any TLD to see all options.
          </p>
          {promoCount > 0 && (
            <div className="inline-flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-full px-4 py-1.5 text-sm text-amber-700 font-medium">
              <Tag className="h-4 w-4" />
              {promoCount} TLDs have active promo codes — look for the <span className="font-bold mx-1">🏷</span> badge
            </div>
          )}
        </motion.div>

        {/* ── Filters ─────────────────────────────────────────────────── */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4 mb-4 flex flex-wrap gap-3 items-end">
          {/* Search */}
          <div className="relative flex-1 min-w-[180px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search TLDs (.com, .io...)"
              className="w-full pl-9 pr-4 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-400"
            />
          </div>

          {/* Type */}
          <div className="flex flex-col gap-1">
            <label className="text-xs text-gray-400 font-medium">Type</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-400"
            >
              {TLD_TYPES.map((t) => (
                <option key={t} value={t}>{TYPE_LABELS[t]}</option>
              ))}
            </select>
          </div>

          {/* Category */}
          <div className="flex flex-col gap-1">
            <label className="text-xs text-gray-400 font-medium">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-400 capitalize"
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>{c || 'All Categories'}</option>
              ))}
            </select>
          </div>

          {/* Max Reg Price */}
          <div className="flex flex-col gap-1">
            <label className="text-xs text-gray-400 font-medium">
              Max Reg Price: {maxReg === null ? 'Any' : `$${maxReg}`}
            </label>
            <input
              type="range" min={1} max={500} value={maxReg ?? 500}
              onChange={(e) => setMaxReg(Number(e.target.value))}
              className="w-32 accent-primary-600"
            />
            <button
              type="button"
              onClick={() => setMaxReg(null)}
              className="text-[11px] text-primary-600 hover:underline text-left"
            >
              Clear price cap
            </button>
          </div>

          <div className="flex items-center gap-3 px-2 py-2 rounded-xl border border-gray-200 bg-gray-50">
            <label className="inline-flex items-center gap-1.5 text-xs text-gray-600">
              <input
                type="checkbox"
                checked={includeBrand}
                onChange={(e) => setIncludeBrand(e.target.checked)}
                className="accent-primary-600"
              />
              Include Brand TLDs
            </label>
            <label className="inline-flex items-center gap-1.5 text-xs text-gray-600">
              <input
                type="checkbox"
                checked={includeIdn}
                onChange={(e) => setIncludeIdn(e.target.checked)}
                className="accent-primary-600"
              />
              Include IDN (xn--)
            </label>
          </div>

          {/* Sort */}
          <div className="flex flex-col gap-1">
            <label className="text-xs text-gray-400 font-medium">Sort by</label>
            <div className="flex gap-1">
              {[['popularity','Popular'],['reg','Cheapest Reg'],['renew','Cheapest Renewal']].map(([val, label]) => (
                <button
                  key={val}
                  onClick={() => setSortField(val)}
                  className={`px-3 py-2 rounded-xl text-xs font-semibold border transition-all ${
                    sortField === val ? 'bg-primary-600 text-white border-primary-600' : 'bg-white text-gray-500 border-gray-200 hover:border-primary-300'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Rows per page */}
          <div className="flex flex-col gap-1">
            <label className="text-xs text-gray-400 font-medium">Rows</label>
            <select
              value={perPage}
              onChange={(e) => setPerPage(Number(e.target.value))}
              className="px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-400"
            >
              {PER_PAGE_OPTIONS.map((n) => <option key={n} value={n}>{n}</option>)}
            </select>
          </div>

          <button onClick={resetFilters} className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border border-gray-200 text-gray-500 hover:border-red-300 hover:text-red-500 transition-all">
            <X className="h-3 w-3" /> Reset
          </button>

          {/* Currency toggle */}
          <div className="ml-auto flex items-center gap-1 bg-gray-100 rounded-xl p-1">
            {(['USD', 'KES'] as Currency[]).map((c) => (
              <button
                key={c}
                onClick={() => setCurrency(c)}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  currency === c ? 'bg-primary-600 text-white shadow-sm' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        {/* ── Showing count ────────────────────────────────────────────── */}
        <div className="text-xs text-gray-400 mb-3 pl-1">
          {total === 0
            ? 'No TLDs match your current filters'
            : <>Showing {((Math.min(page, totalPages) - 1) * perPage) + 1}–{Math.min(Math.min(page, totalPages) * perPage, total)} of <strong>{total}</strong> TLDs</>}
        </div>

        {/* ── Table ───────────────────────────────────────────────────── */}
        <div className="overflow-x-auto rounded-2xl border border-gray-200 shadow-sm bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-xs uppercase tracking-wide text-gray-500">
                <th className="text-left px-5 py-3.5 font-semibold">Domain</th>
                <th className="text-center px-4 py-3.5 font-semibold">
                  <span className="flex items-center justify-center gap-1"><ArrowUpDown className="h-3 w-3" />Cheapest Reg</span>
                </th>
                <th className="text-center px-4 py-3.5 font-semibold text-primary-600">
                  <span className="flex items-center justify-center gap-1"><ArrowUpDown className="h-3 w-3" />Cheapest Renewal</span>
                </th>
                <th className="text-center px-4 py-3.5 font-semibold text-amber-600">Promo Code</th>
                <th className="text-center px-4 py-3.5 font-semibold">WHOIS Privacy</th>
                <th className="text-center px-4 py-3.5 font-semibold">DNSSEC</th>
                <th className="text-center px-4 py-3.5 font-semibold">Popularity</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-12 text-center text-gray-400 text-sm">
                    No TLDs match your current filters.
                  </td>
                </tr>
              ) : rows.map((row, rowIdx) => (
                <tr
                  key={row.tld}
                  className={cn(
                    'border-b border-gray-100 last:border-0 transition-colors',
                    row.cheapRegPromo ? 'hover:bg-amber-50/40' : 'hover:bg-primary-50/30',
                    rowIdx % 2 === 0 ? '' : 'bg-gray-50/40',
                  )}
                >
                  {/* Domain */}
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2">
                      <Link href={`/registrars/${row.tld.replace(/^\./, '')}`} className="font-bold text-primary-600 text-base hover:underline">{row.tld}</Link>
                      <span className={cn(
                        'text-[10px] font-semibold px-1.5 py-0.5 rounded-full capitalize',
                        row.type === 'generic'     && 'bg-blue-50 text-blue-600',
                        row.type === 'country'     && 'bg-green-50 text-green-600',
                        row.type === 'new-generic' && 'bg-violet-50 text-violet-600',
                        row.type === 'sponsored'   && 'bg-orange-50 text-orange-600',
                      )}>{row.type.replace('-', ' ')}</span>
                      {row.brand && <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-rose-50 text-rose-700">brand</span>}
                      {row.isIdn && <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700">idn</span>}
                      {!row.publicTld && <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-gray-100 text-gray-700">restricted</span>}
                    </div>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {row.category.slice(0, 2).map((c) => (
                        <span key={c} className="text-[10px] text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded capitalize">{c}</span>
                      ))}
                      {!row.category.length && row.operator && (
                        <span className="text-[10px] text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded">{row.operator}</span>
                      )}
                    </div>
                  </td>

                  {/* Cheapest Reg */}
                  <td className="px-4 py-3.5 text-center">
                    <div className="font-semibold text-gray-800">{fmt(row.cheapReg, currency)}</div>
                    <div className="text-[11px] text-gray-400 mt-0.5">{row.cheapRegName}</div>
                  </td>

                  {/* Cheapest Renewal */}
                  <td className="px-4 py-3.5 text-center">
                    <div className="font-bold text-primary-600">{fmt(row.cheapRenew, currency)}</div>
                    <div className="text-[11px] text-gray-400 mt-0.5">{row.cheapRenewName}</div>
                  </td>

                  {/* Promo Code */}
                  <td className="px-4 py-3.5 text-center">
                    {row.cheapRegPromo ? (
                      <button
                        onClick={() => copyCode(row.cheapRegPromo!)}
                        title="Click to copy promo code"
                        className={cn(
                          'inline-flex items-center gap-1.5 bg-amber-50 border border-amber-200 hover:bg-amber-100 text-amber-700 rounded-lg px-2.5 py-1 font-mono text-xs font-bold transition-colors',
                          copied === row.cheapRegPromo && 'bg-green-50 border-green-200 text-green-700',
                        )}
                      >
                        {copied === row.cheapRegPromo
                          ? <CheckCircle2 className="h-3 w-3 text-green-500" />
                          : <Copy className="h-3 w-3 opacity-60" />}
                        {row.cheapRegPromo}
                      </button>
                    ) : (
                      <span className="text-gray-300 text-xs">—</span>
                    )}
                  </td>

                  {/* WHOIS Privacy */}
                  <td className="px-4 py-3.5 text-center">
                    {row.whoisPrivacy
                      ? <span className="inline-flex items-center gap-1 text-green-600 text-xs font-medium"><CheckCircle className="h-3.5 w-3.5" />Free</span>
                      : <span className="text-xs text-gray-300">—</span>
                    }
                  </td>

                  {/* DNSSEC */}
                  <td className="px-4 py-3.5 text-center">
                    {row.dnssec
                      ? <span className="inline-flex items-center gap-1 text-green-600 text-xs font-medium"><Shield className="h-3.5 w-3.5" />Yes</span>
                      : <span className="text-xs text-gray-300">—</span>
                    }
                  </td>

                  {/* Popularity */}
                  <td className="px-4 py-3.5 text-center">
                    {row.popularity
                      ? <span className="text-xs font-medium text-gray-500">#{row.popularity.toLocaleString()}</span>
                      : <span className="text-gray-300 text-xs">—</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* ── Pagination ──────────────────────────────────────────────── */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-6">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="p-2 rounded-lg border border-gray-200 hover:border-primary-300 disabled:opacity-30 transition-all"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            {Array.from({ length: Math.min(7, totalPages) }, (_, i) => {
              const pageNum = totalPages <= 7 ? i + 1
                : page <= 4 ? i + 1
                : page >= totalPages - 3 ? totalPages - 6 + i
                : page - 3 + i;
              return (
                <button
                  key={pageNum}
                  onClick={() => setPage(pageNum)}
                  className={`w-9 h-9 rounded-lg text-sm font-semibold border transition-all ${
                    page === pageNum ? 'bg-primary-600 text-white border-primary-600' : 'border-gray-200 text-gray-600 hover:border-primary-300'
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="p-2 rounded-lg border border-gray-200 hover:border-primary-300 disabled:opacity-30 transition-all"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        )}

        <p className="text-center text-xs text-gray-400 mt-8">
          * Prices in {currency}. {currency === 'KES' ? `Converted at 1 USD = ${USD_TO_KES_RATE} KES. ` : ''}Promo rates may apply. Always verify on the registrar&apos;s website.
        </p>
      </div>
    </main>
  );
}



