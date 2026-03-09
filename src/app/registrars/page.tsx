'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Globe, Search, ChevronLeft, ChevronRight,
  ArrowUpDown, X, CheckCircle, Shield
} from 'lucide-react';
import { USD_TO_KES_RATE } from '@/lib/currency';
import { TLD_DATA, cheapest } from '@/lib/tld-registrar-data';

// ─── Types ────────────────────────────────────────────────────────────────────

type TldRow = {
  tld: string;
  type: string;
  category: string[];
  popularity?: number;
  whoisPrivacy: boolean;
  dnssec: boolean;
  cheapReg: number;
  cheapRenew: number;
  cheapRegName: string;
  cheapRenewName: string;
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
function fmt(usd: number, currency: Currency) {
  return currency === 'KES'
    ? `KES ${Math.round(usd * USD_TO_KES_RATE).toLocaleString()}`
    : `$${usd.toFixed(2)}`;
}

// Pre-compute cheapest prices for all TLDs once at module load
const ALL_ROWS: TldRow[] = TLD_DATA.map((e) => {
  const { cheapReg, cheapRenew, cheapRegName, cheapRenewName } = cheapest(e);
  return {
    tld: e.tld,
    type: e.type,
    category: e.category,
    popularity: e.popularity,
    whoisPrivacy: e.whoisPrivacy,
    dnssec: e.dnssec,
    cheapReg,
    cheapRenew,
    cheapRegName,
    cheapRenewName,
  };
});

// ─── Component ───────────────────────────────────────────────────────────────

export default function RegistrarsPage() {
  // Filters
  const [search, setSearch]     = useState('');
  const [type, setType]         = useState('');
  const [category, setCategory] = useState('');
  const [maxReg, setMaxReg]     = useState(100);
  const [sortField, setSortField] = useState('popularity');
  const [page, setPage]         = useState(1);
  const [perPage, setPerPage]   = useState(25);
  const [currency, setCurrency] = useState<Currency>('USD');

  // All filtering/sorting/pagination happens synchronously in-memory — no API call needed
  const { rows, total, totalPages } = useMemo(() => {
    let results = ALL_ROWS;
    if (search)   results = results.filter((e) => e.tld.includes(search.toLowerCase()));
    if (type)     results = results.filter((e) => e.type === type);
    if (category) results = results.filter((e) => e.category.includes(category));
    results = results.filter((e) => e.cheapReg <= maxReg);

    if (sortField === 'reg') {
      results = [...results].sort((a, b) => a.cheapReg - b.cheapReg);
    } else if (sortField === 'renew') {
      results = [...results].sort((a, b) => a.cheapRenew - b.cheapRenew);
    } else {
      results = [...results].sort((a, b) => (b.popularity ?? 0) - (a.popularity ?? 0));
    }

    const total = results.length;
    const totalPages = Math.ceil(total / perPage) || 1;
    const safePageN = Math.min(page, totalPages);
    const rows = results.slice((safePageN - 1) * perPage, safePageN * perPage);
    return { rows, total, totalPages };
  }, [search, type, category, maxReg, sortField, page, perPage]);

  const resetFilters = () => {
    setSearch(''); setType(''); setCategory('');
    setMaxReg(100); setSortField('popularity'); setPage(1);
  };

  return (
    <main className="min-h-screen bg-gray-50 pt-24 pb-20">
      <div className="container-wide">

        {/* ── Header ──────────────────────────────────────────────────── */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center space-y-3 mb-8">
          <span className="inline-flex items-center gap-2 rounded-full bg-primary-50 px-4 py-1.5 text-sm font-medium text-primary-600">
            <Globe className="h-4 w-4" />
            {total > 0 ? `${total} TLDs compared` : 'Domain Registrar Comparison'}
          </span>
          <h1 className="text-4xl md:text-5xl font-bold text-[#111111]">Compare Domain Prices</h1>
          <p className="text-gray-500 max-w-xl mx-auto">
            Real registration &amp; renewal prices across major registrars — click any TLD to see all options.
          </p>
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
            <label className="text-xs text-gray-400 font-medium">Max Reg Price: ${maxReg}</label>
            <input
              type="range" min={1} max={100} value={maxReg}
              onChange={(e) => setMaxReg(Number(e.target.value))}
              className="w-32 accent-primary-600"
            />
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
                <th className="text-left px-5 py-3 font-semibold">Domain</th>
                <th className="text-center px-5 py-3 font-semibold">
                  <span className="flex items-center justify-center gap-1"><ArrowUpDown className="h-3 w-3" />Cheapest Reg</span>
                </th>
                <th className="text-center px-5 py-3 font-semibold text-primary-600">
                  <span className="flex items-center justify-center gap-1"><ArrowUpDown className="h-3 w-3" />Cheapest Renewal</span>
                </th>
                <th className="text-center px-5 py-3 font-semibold">WHOIS Privacy</th>
                <th className="text-center px-5 py-3 font-semibold">DNSSEC</th>
                <th className="text-center px-5 py-3 font-semibold">Popularity</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center text-gray-400 text-sm">
                    No TLDs match your current filters.
                  </td>
                </tr>
              ) : rows.map((row) => (
                <tr
                  key={row.tld}
                  className="border-b border-gray-100 last:border-0 hover:bg-primary-50/30 transition-colors"
                >
                  <td className="px-5 py-3.5">
                    <Link href={`/registrars/${row.tld.replace(/^\./, '')}`} className="font-bold text-primary-600 text-base hover:underline">{row.tld}</Link>
                    <span className="ml-2 text-xs text-gray-400 capitalize">{row.type.replace('-', ' ')}</span>
                  </td>
                  <td className="px-5 py-3.5 text-center">
                    <div className="font-semibold text-gray-700">{fmt(row.cheapReg, currency)}</div>
                    <div className="text-xs text-gray-400">{row.cheapRegName}</div>
                  </td>
                  <td className="px-5 py-3.5 text-center">
                    <div className="font-bold text-primary-600">{fmt(row.cheapRenew, currency)}</div>
                    <div className="text-xs text-gray-400">{row.cheapRenewName}</div>
                  </td>
                  <td className="px-5 py-3.5 text-center">
                    {row.whoisPrivacy
                      ? <span className="inline-flex items-center gap-1 text-green-600 text-xs font-medium"><CheckCircle className="h-3.5 w-3.5" />Yes</span>
                      : <span className="text-xs text-gray-400">—</span>
                    }
                  </td>
                  <td className="px-5 py-3.5 text-center">
                    {row.dnssec
                      ? <span className="inline-flex items-center gap-1 text-green-600 text-xs font-medium"><Shield className="h-3.5 w-3.5" />Yes</span>
                      : <span className="text-xs text-gray-400">—</span>
                    }
                  </td>
                  <td className="px-5 py-3.5 text-center text-xs text-gray-500">
                    {row.popularity ? `#${row.popularity.toLocaleString()}` : '—'}
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



