'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { TrendingDown, AlertTriangle, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

const registrars = [
  {
    name: 'TrueHost',
    comFirst: '$8.00',
    comRenewal: '$10.67',
    notes: 'Best long-term price',
    badge: 'best',
  },
  {
    name: 'Namecheap',
    comFirst: '$8.88',
    comRenewal: '$13.98',
    notes: 'Good renewal price',
    badge: 'good',
  },
  {
    name: 'GoDaddy',
    comFirst: '$0.99',
    comRenewal: '$21.99',
    notes: 'Cheap first year, high renewal',
    badge: 'warning',
  },
  {
    name: 'Hostinger',
    comFirst: '$9.99',
    comRenewal: '$14.99',
    notes: 'Competitive pricing',
    badge: 'good',
  },
  {
    name: 'Google Domains',
    comFirst: '$12.00',
    comRenewal: '$12.00',
    notes: 'Consistent pricing, no tricks',
    badge: 'good',
  },
];

export function RegistrarComparisonSection() {
  return (
    <section className="py-20 md:py-28">
      <div className="container-wide">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center space-y-4 mb-12"
        >
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-[#111111]">
            Quick Domain Price Comparison
          </h2>
          <p className="text-lg text-gray-500 max-w-2xl mx-auto">
            We always show <strong className="text-[#111111]">first year AND renewal price</strong> — because the renewal price is the real cost of owning a domain.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="overflow-x-auto rounded-2xl border border-gray-200 shadow-sm"
        >
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left px-6 py-4 font-semibold text-[#111111]">Registrar</th>
                <th className="text-center px-6 py-4 font-semibold text-[#111111]">.com First Year</th>
                <th className="text-center px-6 py-4 font-semibold text-primary-600">.com Renewal</th>
                <th className="text-left px-6 py-4 font-semibold text-[#111111]">Notes</th>
              </tr>
            </thead>
            <tbody>
              {registrars.map((r, i) => (
                <tr
                  key={r.name}
                  className={`border-b border-gray-100 hover:bg-gray-50 transition-colors ${i === 0 ? 'bg-primary-50/30' : ''}`}
                >
                  <td className="px-6 py-4 font-medium text-[#111111]">
                    {r.name}
                    {i === 0 && (
                      <span className="ml-2 inline-flex items-center gap-1 text-xs bg-primary-100 text-primary-700 rounded-full px-2 py-0.5 font-medium">
                        <CheckCircle className="h-3 w-3" /> Recommended
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-center text-gray-600">{r.comFirst}</td>
                  <td className="px-6 py-4 text-center font-semibold">
                    <span className={r.badge === 'warning' ? 'text-red-600' : r.badge === 'best' ? 'text-primary-600' : 'text-gray-700'}>
                      {r.comRenewal}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1.5 text-xs rounded-full px-3 py-1 font-medium ${
                      r.badge === 'warning'
                        ? 'bg-red-50 text-red-700'
                        : r.badge === 'best'
                        ? 'bg-primary-50 text-primary-700'
                        : 'bg-gray-100 text-gray-600'
                    }`}>
                      {r.badge === 'warning' && <AlertTriangle className="h-3 w-3" />}
                      {r.badge === 'best' && <TrendingDown className="h-3 w-3" />}
                      {r.notes}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4"
        >
          <p className="text-xs text-gray-400">
            * Prices are approximate and may vary. Always verify on the registrar&apos;s website before purchasing.
          </p>
          <Link href="/pricing">
            <Button variant="outline">See Full Domain Price List</Button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
