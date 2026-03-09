'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, AlertTriangle, TrendingDown, ExternalLink, Globe, Loader2, ArrowUpDown } from 'lucide-react';
import { Button } from '@/components/ui/button';

type RegistrarEntry = {
  rank: number;
  name: string;
  first: number;
  renewal: number;
  url: string;
  badge: 'best' | 'good' | 'warning' | 'neutral';
  note: string;
};

type TldData = {
  tld: string;
  registrars: RegistrarEntry[];
};

const badgeConfig = {
  best:    { color: 'bg-primary-50 text-primary-700',  icon: <TrendingDown className="h-3 w-3" /> },
  good:    { color: 'bg-green-50 text-green-700',       icon: <CheckCircle className="h-3 w-3" /> },
  warning: { color: 'bg-red-50 text-red-700',           icon: <AlertTriangle className="h-3 w-3" /> },
  neutral: { color: 'bg-gray-100 text-gray-600',        icon: null },
};

export default function RegistrarsPage() {
  const [tlds, setTlds] = useState<string[]>([]);
  const [activeTld, setActiveTld] = useState('.com');
  const [data, setData] = useState<TldData | null>(null);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<'renewal' | 'first'>('renewal');

  // Load TLD list once
  useEffect(() => {
    fetch('/api/registrars')
      .then((r) => r.json())
      .then((d) => setTlds(d.tlds ?? []));
  }, []);

  // Load data whenever active TLD changes
  useEffect(() => {
    setLoading(true);
    fetch(`/api/registrars?tld=${encodeURIComponent(activeTld)}`)
      .then((r) => r.json())
      .then((d) => { setData(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, [activeTld]);

  const sorted = data
    ? [...data.registrars].sort((a, b) =>
        sortBy === 'renewal' ? a.renewal - b.renewal : a.first - b.first
      )
    : [];

  return (
    <main className="min-h-screen bg-gray-50 pt-24 pb-20">
      <div className="container-wide">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-3 mb-10"
        >
          <span className="inline-flex items-center gap-2 rounded-full bg-primary-50 px-4 py-1.5 text-sm font-medium text-primary-600">
            <Globe className="h-4 w-4" />
            {sorted.length > 0 ? `${sorted.length} Registrars Compared` : 'Registrar Comparison'}
          </span>
          <h1 className="text-4xl md:text-5xl font-bold text-[#111111]">
            Compare Domain Registrars
          </h1>
          <p className="text-gray-500 max-w-xl mx-auto text-lg">
            Every registrar ranked by real cost. Pick a TLD and see who&apos;s actually cheapest — first year <em>and</em> renewal.
          </p>
        </motion.div>

        {/* TLD Tabs */}
        <div className="flex flex-wrap justify-center gap-2 mb-8">
          {tlds.map((tld) => (
            <button
              key={tld}
              onClick={() => setActiveTld(tld)}
              className={`px-5 py-2 rounded-full text-sm font-semibold border transition-all duration-200 ${
                activeTld === tld
                  ? 'bg-primary-600 text-white border-primary-600 shadow-md'
                  : 'bg-white text-gray-600 border-gray-200 hover:border-primary-300 hover:text-primary-600'
              }`}
            >
              {tld}
            </button>
          ))}
        </div>

        {/* Sort Toggle */}
        <div className="flex items-center justify-end gap-2 mb-4">
          <span className="text-xs text-gray-400 font-medium">Sort by:</span>
          <button
            onClick={() => setSortBy('renewal')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
              sortBy === 'renewal' ? 'bg-primary-600 text-white border-primary-600' : 'bg-white text-gray-500 border-gray-200 hover:border-primary-300'
            }`}
          >
            <ArrowUpDown className="h-3 w-3" /> Renewal Price
          </button>
          <button
            onClick={() => setSortBy('first')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
              sortBy === 'first' ? 'bg-primary-600 text-white border-primary-600' : 'bg-white text-gray-500 border-gray-200 hover:border-primary-300'
            }`}
          >
            <ArrowUpDown className="h-3 w-3" /> First Year
          </button>
        </div>

        {/* Table */}
        <motion.div
          key={activeTld}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
        >
          {loading ? (
            <div className="flex justify-center items-center py-24">
              <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
            </div>
          ) : (
            <div className="overflow-x-auto rounded-2xl border border-gray-200 shadow-sm bg-white">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="text-center px-4 py-4 font-semibold text-gray-400 w-12">#</th>
                    <th className="text-left px-6 py-4 font-semibold text-[#111111]">Registrar</th>
                    <th className="text-center px-6 py-4 font-semibold text-[#111111]">First Year</th>
                    <th className="text-center px-6 py-4 font-semibold text-primary-600">
                      Renewal / yr
                      <span className="ml-1 text-[10px] text-gray-400 font-normal">(real cost)</span>
                    </th>
                    <th className="text-left px-6 py-4 font-semibold text-[#111111] hidden md:table-cell">Notes</th>
                    <th className="text-center px-6 py-4 font-semibold text-[#111111]">Register</th>
                  </tr>
                </thead>
                <tbody>
                  {sorted.map((r, i) => {
                    const { color, icon } = badgeConfig[r.badge];
                    const isBest = i === 0;
                    return (
                      <tr
                        key={r.name}
                        className={`border-b border-gray-100 last:border-0 transition-colors ${
                          isBest ? 'bg-primary-50/40 hover:bg-primary-50/60' : 'hover:bg-gray-50'
                        }`}
                      >
                        <td className="px-4 py-4 text-center text-xs font-bold text-gray-400">
                          {isBest ? '🏆' : i + 1}
                        </td>
                        <td className="px-6 py-4 font-semibold text-[#111111]">
                          {r.name}
                          {isBest && (
                            <span className="ml-2 inline-flex items-center gap-1 text-xs bg-primary-100 text-primary-700 rounded-full px-2 py-0.5 font-medium">
                              <CheckCircle className="h-3 w-3" /> Best Value
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-center text-gray-600 font-medium">
                          ${r.first.toFixed(2)}
                        </td>
                        <td className="px-6 py-4 text-center font-bold text-lg">
                          <span className={
                            r.badge === 'warning' ? 'text-red-600'
                            : isBest ? 'text-primary-600'
                            : 'text-gray-700'
                          }>
                            ${r.renewal.toFixed(2)}
                          </span>
                        </td>
                        <td className="px-6 py-4 hidden md:table-cell">
                          <span className={`inline-flex items-center gap-1.5 text-xs rounded-full px-3 py-1 font-medium ${color}`}>
                            {icon}
                            {r.note}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <a href={r.url} target="_blank" rel="noopener noreferrer">
                            <Button size="sm" variant={isBest ? 'default' : 'outline'} className="gap-1.5 text-xs">
                              Visit <ExternalLink className="h-3 w-3" />
                            </Button>
                          </a>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </motion.div>

        {/* Footer note */}
        <p className="text-center text-xs text-gray-400 mt-8">
          * Prices in USD. Promo/first-year rates may differ. Always verify on the registrar&apos;s website before purchasing.
        </p>
      </div>
    </main>
  );
}
