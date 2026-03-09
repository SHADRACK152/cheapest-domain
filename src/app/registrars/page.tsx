'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, AlertTriangle, TrendingDown, ExternalLink, Globe } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

// ─── Data ────────────────────────────────────────────────────────────────────

type RegistrarRow = {
  name: string;
  region: 'local' | 'international';
  url: string;
  first: string;
  renewal: string;
  badge: 'best' | 'good' | 'warning' | 'neutral';
  note: string;
};

type TldData = {
  label: string;
  registrars: RegistrarRow[];
};

const tldData: Record<string, TldData> = {
  '.com': {
    label: '.com',
    registrars: [
      { name: 'TrueHost',        region: 'local',         url: 'https://truehost.co.ke',      first: '$8.00',  renewal: '$10.67', badge: 'best',    note: 'Best local price' },
      { name: 'Porkbun',         region: 'international', url: 'https://porkbun.com',         first: '$7.49',  renewal: '$10.99', badge: 'best',    note: 'Cheapest renewal globally' },
      { name: 'Cloudflare',      region: 'international', url: 'https://cloudflare.com',      first: '$9.15',  renewal: '$9.15',  badge: 'good',    note: 'At-cost, no markup' },
      { name: 'Namecheap',       region: 'international', url: 'https://namecheap.com',       first: '$8.88',  renewal: '$13.98', badge: 'good',    note: 'Good first-year deal' },
      { name: 'Hostinger',       region: 'international', url: 'https://hostinger.com',       first: '$9.99',  renewal: '$14.99', badge: 'neutral', note: 'Competitive pricing' },
      { name: 'Google Domains',  region: 'international', url: 'https://domains.google',      first: '$12.00', renewal: '$12.00', badge: 'good',    note: 'Consistent, no surprises' },
      { name: 'GoDaddy',         region: 'international', url: 'https://godaddy.com',         first: '$0.99',  renewal: '$21.99', badge: 'warning', note: 'High renewal price' },
    ],
  },
  '.org': {
    label: '.org',
    registrars: [
      { name: 'TrueHost',        region: 'local',         url: 'https://truehost.co.ke',      first: '$8.00',  renewal: '$10.00', badge: 'best',    note: 'Best local price' },
      { name: 'Porkbun',         region: 'international', url: 'https://porkbun.com',         first: '$7.48',  renewal: '$11.98', badge: 'best',    note: 'Cheapest first year' },
      { name: 'Namecheap',       region: 'international', url: 'https://namecheap.com',       first: '$8.48',  renewal: '$13.98', badge: 'good',    note: 'Popular choice' },
      { name: 'Cloudflare',      region: 'international', url: 'https://cloudflare.com',      first: '$9.93',  renewal: '$9.93',  badge: 'good',    note: 'At-cost pricing' },
      { name: 'Google Domains',  region: 'international', url: 'https://domains.google',      first: '$12.00', renewal: '$12.00', badge: 'good',    note: 'Consistent pricing' },
      { name: 'GoDaddy',         region: 'international', url: 'https://godaddy.com',         first: '$4.99',  renewal: '$22.99', badge: 'warning', note: 'Very high renewal' },
    ],
  },
  '.net': {
    label: '.net',
    registrars: [
      { name: 'TrueHost',        region: 'local',         url: 'https://truehost.co.ke',      first: '$12.37', renewal: '$13.40', badge: 'best',    note: 'Best local price' },
      { name: 'Porkbun',         region: 'international', url: 'https://porkbun.com',         first: '$9.79',  renewal: '$12.99', badge: 'best',    note: 'Lowest renewal' },
      { name: 'Namecheap',       region: 'international', url: 'https://namecheap.com',       first: '$10.98', renewal: '$15.98', badge: 'good',    note: 'Good support' },
      { name: 'Cloudflare',      region: 'international', url: 'https://cloudflare.com',      first: '$10.44', renewal: '$10.44', badge: 'good',    note: 'At-cost pricing' },
      { name: 'Google Domains',  region: 'international', url: 'https://domains.google',      first: '$12.00', renewal: '$12.00', badge: 'good',    note: 'No price hikes' },
      { name: 'GoDaddy',         region: 'international', url: 'https://godaddy.com',         first: '$1.99',  renewal: '$24.99', badge: 'warning', note: 'Bait-and-switch pricing' },
    ],
  },
  '.co.ke': {
    label: '.co.ke',
    registrars: [
      { name: 'TrueHost',        region: 'local',         url: 'https://truehost.co.ke',      first: '$6.66',  renewal: '$8.00',  badge: 'best',    note: 'Most affordable' },
      { name: 'KenyaWebExperts', region: 'local',         url: 'https://kenyawebexperts.com', first: '$7.50',  renewal: '$9.00',  badge: 'good',    note: 'Local support' },
      { name: 'Safaricom eDomains', region: 'local',      url: 'https://safaricom.co.ke',     first: '$10.00', renewal: '$10.00', badge: 'neutral', note: 'Convenience via M-Pesa' },
      { name: 'Namecheap',       region: 'international', url: 'https://namecheap.com',       first: '$9.98',  renewal: '$14.98', badge: 'neutral', note: 'Limited .co.ke support' },
    ],
  },
  '.ke': {
    label: '.ke',
    registrars: [
      { name: 'TrueHost',        region: 'local',         url: 'https://truehost.co.ke',      first: '$20.00', renewal: '$20.00', badge: 'best',    note: 'Best local option' },
      { name: 'KenyaWebExperts', region: 'local',         url: 'https://kenyawebexperts.com', first: '$22.00', renewal: '$22.00', badge: 'good',    note: 'Local registrar' },
      { name: 'Namecheap',       region: 'international', url: 'https://namecheap.com',       first: '$25.98', renewal: '$25.98', badge: 'neutral', note: 'International option' },
    ],
  },
  '.io': {
    label: '.io',
    registrars: [
      { name: 'TrueHost',        region: 'local',         url: 'https://truehost.co.ke',      first: '$34.70', renewal: '$48.33', badge: 'good',    note: 'Local billing in KES' },
      { name: 'Porkbun',         region: 'international', url: 'https://porkbun.com',         first: '$25.98', renewal: '$31.98', badge: 'best',    note: 'Cheapest .io globally' },
      { name: 'Namecheap',       region: 'international', url: 'https://namecheap.com',       first: '$32.98', renewal: '$39.98', badge: 'good',    note: 'Popular for startups' },
      { name: 'Cloudflare',      region: 'international', url: 'https://cloudflare.com',      first: '$29.00', renewal: '$29.00', badge: 'best',    note: 'At-cost, consistent' },
      { name: 'GoDaddy',         region: 'international', url: 'https://godaddy.com',         first: '$6.99',  renewal: '$59.99', badge: 'warning', note: 'Very high renewal' },
    ],
  },
  '.africa': {
    label: '.africa',
    registrars: [
      { name: 'TrueHost',        region: 'local',         url: 'https://truehost.co.ke',      first: '$12.00', renewal: '$13.33', badge: 'best',    note: 'Top pick for Africa' },
      { name: 'Namecheap',       region: 'international', url: 'https://namecheap.com',       first: '$14.98', renewal: '$17.98', badge: 'good',    note: 'Good support' },
      { name: 'GoDaddy',         region: 'international', url: 'https://godaddy.com',         first: '$9.99',  renewal: '$21.99', badge: 'warning', note: 'High renewal' },
    ],
  },
  '.ng': {
    label: '.ng',
    registrars: [
      { name: 'TrueHost',        region: 'local',         url: 'https://truehost.co.ke',      first: '$20.00', renewal: '$20.00', badge: 'best',    note: 'Affordable option' },
      { name: 'Namecheap',       region: 'international', url: 'https://namecheap.com',       first: '$22.98', renewal: '$24.98', badge: 'good',    note: 'Reliable registrar' },
    ],
  },
};

const TLDS = Object.keys(tldData);

const badgeConfig = {
  best:    { color: 'bg-primary-50 text-primary-700',  icon: <TrendingDown className="h-3 w-3" /> },
  good:    { color: 'bg-green-50 text-green-700',       icon: <CheckCircle className="h-3 w-3" /> },
  warning: { color: 'bg-red-50 text-red-700',           icon: <AlertTriangle className="h-3 w-3" /> },
  neutral: { color: 'bg-gray-100 text-gray-600',        icon: null },
};

// ─── Component ───────────────────────────────────────────────────────────────

export default function RegistrarsPage() {
  const [activeTld, setActiveTld] = useState('.com');
  const data = tldData[activeTld];

  const local = data.registrars.filter((r) => r.region === 'local');
  const international = data.registrars.filter((r) => r.region === 'international');

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
            Local & International Registrars
          </span>
          <h1 className="text-4xl md:text-5xl font-bold text-[#111111]">
            Compare Registrar Prices
          </h1>
          <p className="text-gray-500 max-w-xl mx-auto text-lg">
            Pick a domain extension to see first-year and renewal prices side by side — no hidden surprises.
          </p>
        </motion.div>

        {/* TLD Tabs */}
        <div className="flex flex-wrap justify-center gap-2 mb-10">
          {TLDS.map((tld) => (
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

        {/* Table */}
        <motion.div
          key={activeTld}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          className="space-y-8"
        >
          {/* Local Registrars */}
          {local.length > 0 && (
            <div>
              <h2 className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-3 pl-1">
                🇰🇪 Local Registrars
              </h2>
              <RegistrarTable rows={local} />
            </div>
          )}

          {/* International Registrars */}
          {international.length > 0 && (
            <div>
              <h2 className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-3 pl-1">
                🌍 International Registrars
              </h2>
              <RegistrarTable rows={international} />
            </div>
          )}
        </motion.div>

        {/* Footer note */}
        <p className="text-center text-xs text-gray-400 mt-10">
          * Prices shown in USD. May vary based on promotions. Always verify on the registrar&apos;s website before purchasing.
        </p>
      </div>
    </main>
  );
}

function RegistrarTable({ rows }: { rows: RegistrarRow[] }) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-gray-200 shadow-sm bg-white">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-gray-50 border-b border-gray-200">
            <th className="text-left px-6 py-4 font-semibold text-[#111111]">Registrar</th>
            <th className="text-center px-6 py-4 font-semibold text-[#111111]">First Year</th>
            <th className="text-center px-6 py-4 font-semibold text-primary-600">Renewal Price</th>
            <th className="text-left px-6 py-4 font-semibold text-[#111111]">Notes</th>
            <th className="text-center px-6 py-4 font-semibold text-[#111111]">Register</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => {
            const { color, icon } = badgeConfig[r.badge];
            const isBest = r.badge === 'best';
            return (
              <tr
                key={r.name}
                className={`border-b border-gray-100 last:border-0 transition-colors ${
                  isBest ? 'bg-primary-50/30 hover:bg-primary-50/50' : 'hover:bg-gray-50'
                }`}
              >
                <td className="px-6 py-4 font-semibold text-[#111111]">
                  {r.name}
                  {isBest && (
                    <span className="ml-2 inline-flex items-center gap-1 text-xs bg-primary-100 text-primary-700 rounded-full px-2 py-0.5 font-medium">
                      <CheckCircle className="h-3 w-3" /> Best Value
                    </span>
                  )}
                </td>
                <td className="px-6 py-4 text-center text-gray-600 font-medium">{r.first}</td>
                <td className="px-6 py-4 text-center font-bold">
                  <span className={
                    r.badge === 'warning' ? 'text-red-600'
                    : r.badge === 'best' ? 'text-primary-600'
                    : 'text-gray-700'
                  }>
                    {r.renewal}
                  </span>
                </td>
                <td className="px-6 py-4">
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
  );
}
