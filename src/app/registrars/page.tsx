'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Globe, Search, ChevronLeft, ChevronRight,
  ArrowUpDown, X, CheckCircle, Shield
} from 'lucide-react';

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

type ListResponse = {
  total: number;
  page: number;
  perPage: number;
  totalPages: number;
  data: TldRow[];
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

// ─── Component ───────────────────────────────────────────────────────────────

export default function RegistrarsPage() {
  const [rows, setRows]         = useState<TldRow[]>([]);
  const [total, setTotal]       = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading]   = useState(true);

  // Filters
  const [search, setSearch]     = useState('');
  const [type, setType]         = useState('');
  const [category, setCategory] = useState('');
  const [maxReg, setMaxReg]     = useState(100);
  const [sortField, setSortField] = useState('popularity');
  const [page, setPage]         = useState(1);
  const [perPage, setPerPage]   = useState(25);

  const fetchData = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({
      q: search, type, category,
      maxReg: String(maxReg),
      sort: sortField,
      page: String(page),
      per_page: String(perPage),
    });
    try {
      const res = await fetch(`/api/registrars?${params}`);
      const data: ListResponse = await res.json();
      setRows(data.data ?? []);
      setTotal(data.total ?? 0);
      setTotalPages(data.totalPages ?? 0);
    } finally {
      setLoading(false);
    }
  }, [search, type, category, maxReg, sortField, page, perPage]);

  useEffect(() => { fetchData(); }, [fetchData]);

  // Reset page when filters change
  useEffect(() => { setPage(1); }, [search, type, category, maxReg, sortField, perPage]);

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
        </div>

        {/* ── Showing count ────────────────────────────────────────────── */}
        <div className="text-xs text-gray-400 mb-3 pl-1">
          Showing {((page - 1) * perPage) + 1}–{Math.min(page * perPage, total)} of <strong>{total}</strong> TLDs
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
              {loading ? (
                Array.from({ length: perPage }).map((_, i) => (
                  <tr key={i} className="border-b border-gray-100 animate-pulse">
                    {Array.from({ length: 6 }).map((_, j) => (
                      <td key={j} className="px-5 py-4"><div className="h-4 bg-gray-100 rounded w-full" /></td>
                    ))}
                  </tr>
                ))
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
                    <div className="font-semibold text-gray-700">${row.cheapReg.toFixed(2)}</div>
                    <div className="text-xs text-gray-400">{row.cheapRegName}</div>
                  </td>
                  <td className="px-5 py-3.5 text-center">
                    <div className="font-bold text-primary-600">${row.cheapRenew.toFixed(2)}</div>
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
          * Prices in USD. Promo rates may apply. Always verify on the registrar&apos;s website.
        </p>
      </div>
    </main>
  );
}



