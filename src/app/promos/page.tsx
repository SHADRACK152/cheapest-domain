'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { Tag, Copy, CheckCircle2, ExternalLink, Search, Filter } from 'lucide-react';
import { TLD_DATA } from '@/lib/tld-registrar-data';

// ── Build full promo list (one entry per promo code, with all TLDs it covers) ─

interface PromoCard {
  code: string;
  registrar: string;
  url: string;
  tlds: { tld: string; regPrice: number }[];
  minRegPrice: number;
}

function buildPromoCards(): PromoCard[] {
  const map = new Map<string, PromoCard>();

  for (const entry of TLD_DATA) {
    for (const p of entry.prices) {
      if (!p.promoCode) continue;
      const key = `${p.registrar}::${p.promoCode}`;
      if (!map.has(key)) {
        map.set(key, {
          code: p.promoCode,
          registrar: p.registrar,
          url: p.url,
          tlds: [],
          minRegPrice: Infinity,
        });
      }
      const card = map.get(key)!;
      card.tlds.push({ tld: entry.tld, regPrice: p.reg });
      if (p.reg < card.minRegPrice) card.minRegPrice = p.reg;
    }
  }

  return Array.from(map.values()).sort((a, b) => a.minRegPrice - b.minRegPrice);
}

const ALL_PROMOS = buildPromoCards();
const ALL_REGISTRARS = Array.from(new Set(ALL_PROMOS.map((p) => p.registrar))).sort();

// Registrar brand colours (tailwind bg classes, fallback to gray)
const BRAND_COLORS: Record<string, string> = {
  GoDaddy: 'bg-green-600',
  Namecheap: 'bg-orange-500',
  Hostinger: 'bg-purple-600',
  IONOS: 'bg-blue-600',
  TrueHost: 'bg-red-600',
  Porkbun: 'bg-pink-500',
  Dynadot: 'bg-cyan-600',
  Spaceship: 'bg-indigo-600',
  Cloudflare: 'bg-orange-400',
};

export default function PromosPage() {
  const [search, setSearch] = useState('');
  const [activeRegistrar, setActiveRegistrar] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  const filtered = useMemo(() => {
    let list = ALL_PROMOS;
    if (activeRegistrar) list = list.filter((p) => p.registrar === activeRegistrar);
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter(
        (p) =>
          p.code.toLowerCase().includes(q) ||
          p.registrar.toLowerCase().includes(q) ||
          p.tlds.some((t) => t.tld.toLowerCase().includes(q)),
      );
    }
    return list;
  }, [search, activeRegistrar]);

  function copyCode(code: string) {
    navigator.clipboard.writeText(code).then(() => {
      setCopied(code);
      setTimeout(() => setCopied(null), 2000);
    });
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* ── Hero ───────────────────────────────────────────────────────────── */}
      <div className="bg-gradient-to-br from-primary-600 to-primary-800 text-white py-16 px-4">
        <div className="max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-white/20 rounded-full px-4 py-1.5 text-sm font-medium mb-4">
            <Tag className="w-4 h-4" />
            <span>{ALL_PROMOS.length} active deals</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold mb-3">
            Domain Promo Codes &amp; Deals
          </h1>
          <p className="text-primary-100 text-lg max-w-2xl mx-auto">
            Save on your next domain registration with the latest promo codes from
            top registrars. Click any code to copy it instantly.
          </p>
        </div>
      </div>

      {/* ── Filters ────────────────────────────────────────────────────────── */}
      <div className="sticky top-[var(--header-h,64px)] z-20 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 py-3 flex flex-col sm:flex-row gap-3">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by code, registrar or TLD…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          {/* Registrar filter */}
          <div className="flex items-center gap-2 flex-wrap">
            <Filter className="w-4 h-4 text-gray-400 shrink-0" />
            <button
              onClick={() => setActiveRegistrar(null)}
              className={`text-xs px-3 py-1.5 rounded-full font-medium transition-colors ${
                activeRegistrar === null
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              All
            </button>
            {ALL_REGISTRARS.map((r) => (
              <button
                key={r}
                onClick={() => setActiveRegistrar(r === activeRegistrar ? null : r)}
                className={`text-xs px-3 py-1.5 rounded-full font-medium transition-colors ${
                  activeRegistrar === r
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}
              >
                {r}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Table ──────────────────────────────────────────────────────────── */}
      <div className="max-w-5xl mx-auto px-4 py-10">
        {filtered.length === 0 ? (
          <div className="text-center py-24 text-gray-400">
            <Tag className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="text-lg font-medium">No promo codes found</p>
            <p className="text-sm mt-1">Try adjusting your search or filter</p>
          </div>
        ) : (
          <div className="rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden shadow-sm">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wide">
                  <th className="px-4 py-3 text-left font-semibold">#</th>
                  <th className="px-4 py-3 text-left font-semibold">Registrar</th>
                  <th className="px-4 py-3 text-left font-semibold">Promo Code</th>
                  <th className="px-4 py-3 text-left font-semibold">1st-Year Price</th>
                  <th className="px-4 py-3 text-left font-semibold">Applies To</th>
                  <th className="px-4 py-3 text-left font-semibold">Link</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {filtered.map((promo, i) => {
                  const brandBg = BRAND_COLORS[promo.registrar] ?? 'bg-gray-600';
                  const isCopied = copied === promo.code;
                  return (
                    <tr
                      key={`${promo.registrar}::${promo.code}`}
                      className="bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800/60 transition-colors"
                    >
                      {/* # */}
                      <td className="px-4 py-3 text-gray-400 font-medium tabular-nums">{i + 1}</td>

                      {/* Registrar */}
                      <td className="px-4 py-3">
                        <span className={`inline-block text-white text-xs font-semibold px-2.5 py-1 rounded-full ${brandBg}`}>
                          {promo.registrar}
                        </span>
                      </td>

                      {/* Promo code */}
                      <td className="px-4 py-3">
                        <button
                          onClick={() => copyCode(promo.code)}
                          title="Click to copy"
                          className={`inline-flex items-center gap-2 font-mono font-bold text-sm px-3 py-1.5 rounded-lg border-2 border-dashed transition-all ${
                            isCopied
                              ? 'border-green-400 bg-green-50 dark:bg-green-950 text-green-700 dark:text-green-400'
                              : 'border-primary-300 dark:border-primary-700 bg-primary-50 dark:bg-primary-950 text-primary-700 dark:text-primary-300 hover:border-primary-500 hover:bg-primary-100 dark:hover:bg-primary-900'
                          }`}
                        >
                          {promo.code}
                          {isCopied
                            ? <CheckCircle2 className="w-4 h-4 text-green-500" />
                            : <Copy className="w-3.5 h-3.5 opacity-50" />}
                        </button>
                      </td>

                      {/* Price */}
                      <td className="px-4 py-3 tabular-nums font-semibold text-gray-900 dark:text-white whitespace-nowrap">
                        ${promo.minRegPrice.toFixed(2)}
                        <span className="text-gray-400 font-normal text-xs ml-1">/ yr</span>
                      </td>

                      {/* TLD badges */}
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-1.5">
                          {promo.tlds.map(({ tld, regPrice }) => (
                            <Link
                              key={tld}
                              href={`/registrars/${tld.replace('.', '')}`}
                              className="inline-flex items-center gap-1 text-xs bg-gray-100 dark:bg-gray-800 hover:bg-primary-100 dark:hover:bg-primary-900 text-gray-700 dark:text-gray-300 hover:text-primary-700 dark:hover:text-primary-300 rounded-full px-2.5 py-1 font-medium transition-colors"
                              title={`$${regPrice.toFixed(2)}/yr`}
                            >
                              {tld}
                            </Link>
                          ))}
                        </div>
                      </td>

                      {/* Visit link */}
                      <td className="px-4 py-3">
                        <a
                          href={promo.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-xs font-semibold text-primary-600 dark:text-primary-400 hover:underline whitespace-nowrap"
                        >
                          Visit
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Disclaimer */}
        <p className="mt-8 text-center text-xs text-gray-400 max-w-xl mx-auto">
          Promo codes and prices shown are for the first registration year only.
          Renewal rates are typically higher. Always verify the final price on the
          registrar&apos;s website before purchasing.
        </p>
      </div>
    </div>
  );
}
