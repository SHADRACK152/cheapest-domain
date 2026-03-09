import { notFound } from 'next/navigation';
import Link from 'next/link';
import { TLD_DATA } from '@/lib/tld-registrar-data';
import { CheckCircle, Shield, Lock, ExternalLink, ArrowLeft, Trophy } from 'lucide-react';

export async function generateStaticParams() {
  return TLD_DATA.map((entry) => ({ tld: entry.tld.replace(/^\./, '') }));
}

export async function generateMetadata({ params }: { params: Promise<{ tld: string }> }) {
  const { tld } = await params;
  return {
    title: `Cheapest .${tld} Domain — Registrar Price Comparison`,
    description: `Compare registration and renewal prices for .${tld} domains across all major registrars.`,
  };
}

export default async function TldDetailPage({ params }: { params: Promise<{ tld: string }> }) {
  const { tld: slug } = await params;
  const tldKey = '.' + slug;

  const entry = TLD_DATA.find((e) => e.tld === tldKey);
  if (!entry) notFound();

  // Sort registrars by renewal price ascending
  const sorted = [...entry.prices].sort((a, b) => a.renew - b.renew);
  const cheapestReg = Math.min(...entry.prices.map((p) => p.reg));
  const cheapestRenew = Math.min(...entry.prices.map((p) => p.renew));

  return (
    <main className="min-h-screen bg-gray-50 pt-24 pb-20">
      <div className="container-wide max-w-4xl">

        {/* Back link */}
        <Link href="/registrars" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-primary-600 transition-colors mb-6">
          <ArrowLeft className="h-4 w-4" /> Back to all TLDs
        </Link>

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-2">
            <h1 className="text-5xl font-extrabold text-primary-600">{entry.tld}</h1>
            <span className="px-3 py-1 rounded-full bg-gray-100 text-gray-500 text-xs font-semibold capitalize">
              {entry.type.replace('-', ' ')}
            </span>
          </div>
          <p className="text-gray-500 text-sm mb-4">
            {entry.category.join(' · ')} — comparing {sorted.length} registrars
          </p>
          <div className="flex flex-wrap gap-3">
            <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium ${entry.whoisPrivacy ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
              <Lock className="h-3 w-3" /> WHOIS Privacy {entry.whoisPrivacy ? 'Available' : 'Not Available'}
            </div>
            <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium ${entry.dnssec ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
              <Shield className="h-3 w-3" /> DNSSEC {entry.dnssec ? 'Supported' : 'Not Supported'}
            </div>
            {entry.popularity && (
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-primary-50 text-primary-700">
                Popularity rank: #{entry.popularity.toLocaleString()}
              </div>
            )}
          </div>
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="bg-white rounded-2xl border border-gray-200 px-6 py-5">
            <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Cheapest Registration</p>
            <p className="text-3xl font-extrabold text-primary-600">${cheapestReg.toFixed(2)}</p>
            <p className="text-xs text-gray-400 mt-1">{sorted.find((p) => p.reg === cheapestReg)?.registrar}</p>
          </div>
          <div className="bg-white rounded-2xl border border-primary-200 px-6 py-5">
            <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Cheapest Renewal</p>
            <p className="text-3xl font-extrabold text-primary-600">${cheapestRenew.toFixed(2)}</p>
            <p className="text-xs text-gray-400 mt-1">{sorted[0]?.registrar}</p>
          </div>
        </div>

        {/* Registrar table */}
        <h2 className="text-lg font-bold text-[#111111] mb-3">All Registrars — sorted by renewal price</h2>
        <div className="rounded-2xl border border-gray-200 overflow-hidden bg-white shadow-sm">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-xs uppercase tracking-wide text-gray-500">
                <th className="text-center px-4 py-3 w-10">#</th>
                <th className="text-left px-5 py-3 font-semibold">Registrar</th>
                <th className="text-center px-5 py-3 font-semibold">Registration</th>
                <th className="text-center px-5 py-3 font-semibold text-primary-600">Renewal / yr</th>
                <th className="text-center px-5 py-3 font-semibold">Transfer</th>
                <th className="text-center px-5 py-3 font-semibold">Privacy</th>
                <th className="text-center px-5 py-3 font-semibold"></th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((p, i) => (
                <tr
                  key={p.registrar}
                  className={`border-b border-gray-100 last:border-0 transition-colors ${i === 0 ? 'bg-primary-50/40' : 'hover:bg-gray-50'}`}
                >
                  <td className="px-4 py-4 text-center text-xs font-bold text-gray-400">
                    {i === 0 ? <Trophy className="h-4 w-4 text-amber-500 mx-auto" /> : i + 1}
                  </td>
                  <td className="px-5 py-4">
                    <div className="font-semibold text-[#111111] flex items-center gap-2">
                      {p.registrar}
                      {i === 0 && (
                        <span className="text-xs bg-primary-100 text-primary-700 rounded-full px-2 py-0.5 font-medium">Best Renewal</span>
                      )}
                      {p.promoCode && (
                        <span className="text-xs bg-amber-100 text-amber-700 rounded-full px-2 py-0.5">Promo: {p.promoCode}</span>
                      )}
                    </div>
                  </td>
                  <td className="px-5 py-4 text-center">
                    <span className={`font-semibold ${p.reg === cheapestReg ? 'text-green-600' : 'text-gray-700'}`}>
                      ${p.reg.toFixed(2)}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-center">
                    <span className={`font-bold text-lg ${i === 0 ? 'text-primary-600' : 'text-gray-700'}`}>
                      ${p.renew.toFixed(2)}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-center text-gray-500">
                    {p.transfer ? `$${p.transfer.toFixed(2)}` : <span className="text-gray-300">—</span>}
                  </td>
                  <td className="px-5 py-4 text-center">
                    {p.whoisPrivacy
                      ? <span className="inline-flex items-center gap-1 text-green-600 text-xs font-medium"><CheckCircle className="h-3.5 w-3.5" />Free</span>
                      : <span className="text-gray-300 text-xs">—</span>
                    }
                  </td>
                  <td className="px-5 py-4 text-center">
                    <a
                      href={p.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                        i === 0
                          ? 'bg-primary-600 text-white hover:bg-primary-700'
                          : 'border border-gray-200 text-gray-600 hover:border-primary-300 hover:text-primary-600'
                      }`}
                    >
                      Visit <ExternalLink className="h-3 w-3" />
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className="text-center text-xs text-gray-400 mt-8">
          * Prices in USD per year. Promo rates may apply. Always verify on the registrar&apos;s website before purchasing.
        </p>
      </div>
    </main>
  );
}
