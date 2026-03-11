'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { ScanSearch, Globe, FileCode, Map, CheckCircle2, AlertCircle, XCircle, ExternalLink, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface SeoPage {
  path: string;
  title: string;
  description: string;
  score: number;
  issues: string[];
}

const SEO_PAGES: SeoPage[] = [
  {
    path: '/',
    title: 'Cheapest Domains | Find the Best Domain Prices',
    description: 'Compare domain prices across registrars and find the cheapest domain deals.',
    score: 88,
    issues: [],
  },
  {
    path: '/pricing',
    title: 'Domain Pricing',
    description: 'View pricing for all TLDs from top registrars.',
    score: 72,
    issues: ['Description too short (< 120 chars)', 'Missing Open Graph image'],
  },
  {
    path: '/blog',
    title: 'Blog',
    description: '',
    score: 45,
    issues: ['Missing meta description', 'Title too generic', 'Missing canonical URL'],
  },
  {
    path: '/search',
    title: 'Domain Search',
    description: 'Search and register your perfect domain name at the best price.',
    score: 91,
    issues: [],
  },
];

const GLOBAL_SETTINGS = [
  { key: 'Site Name',         value: 'Cheapest Domains'                         },
  { key: 'Default Language',  value: 'en-KE'                                    },
  { key: 'Canonical Domain',  value: 'https://cheapestdomains.co.ke'            },
  { key: 'robots.txt',        value: 'Allow all crawlers'                       },
  { key: 'Sitemap',           value: '/sitemap.xml  ✓ Generated'                },
  { key: 'Structured Data',   value: 'Organization + WebSite schemas'           },
];

function ScoreBadge({ score }: { score: number }) {
  const color = score >= 80 ? 'text-green-700 bg-green-50 border-green-200'
    : score >= 60 ? 'text-yellow-700 bg-yellow-50 border-yellow-200'
    : 'text-red-700 bg-red-50 border-red-200';
  return (
    <span className={cn('text-xs font-bold px-2.5 py-1 rounded-full border', color)}>
      {score}
    </span>
  );
}

export default function AdminSeoPage() {
  const [expanded, setExpanded] = useState<string | null>(null);

  const avgScore = Math.round(SEO_PAGES.reduce((s, p) => s + p.score, 0) / SEO_PAGES.length);
  const totalIssues = SEO_PAGES.reduce((s, p) => s + p.issues.length, 0);

  return (
    <div>
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-sky-50 flex items-center justify-center">
              <ScanSearch className="h-5 w-5 text-sky-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">SEO Manager</h1>
              <p className="text-sm text-gray-500 mt-0.5">Monitor and optimise search engine visibility</p>
            </div>
          </div>
          <a href="/sitemap.xml" target="_blank" rel="noreferrer">
            <Button variant="outline" size="sm" className="gap-2">
              <Map className="h-4 w-4" />
              View Sitemap
            </Button>
          </a>
        </div>

        {/* Overview stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Avg SEO Score',   value: `${avgScore}/100`,          icon: ScanSearch, color: 'text-sky-600 bg-sky-50'    },
            { label: 'Pages Audited',   value: SEO_PAGES.length,           icon: Globe,      color: 'text-blue-600 bg-blue-50'  },
            { label: 'Open Issues',     value: totalIssues,                 icon: AlertCircle,color: totalIssues > 0 ? 'text-yellow-600 bg-yellow-50' : 'text-green-600 bg-green-50' },
            { label: 'Sitemap Status',  value: 'Live',                      icon: Map,        color: 'text-green-600 bg-green-50' },
          ].map(s => (
            <div key={s.label} className="bg-white rounded-xl border border-gray-200 p-4 flex items-center gap-3">
              <div className={cn('w-9 h-9 rounded-lg flex items-center justify-center shrink-0', s.color)}>
                <s.icon className="h-4 w-4" />
              </div>
              <div>
                <p className="text-lg font-bold text-gray-900">{s.value}</p>
                <p className="text-xs text-gray-500">{s.label}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Page-level SEO */}
          <div className="lg:col-span-2 space-y-3">
            <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Pages</h2>
            {SEO_PAGES.map(page => (
              <div key={page.path} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <button
                  className="w-full flex items-center gap-4 px-5 py-4 text-left hover:bg-gray-50 transition-colors"
                  onClick={() => setExpanded(expanded === page.path ? null : page.path)}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-sm font-semibold text-gray-900">{page.path}</span>
                      {page.score >= 80
                        ? <CheckCircle2 className="h-3.5 w-3.5 text-green-500 shrink-0" />
                        : page.score >= 60
                        ? <AlertCircle className="h-3.5 w-3.5 text-yellow-500 shrink-0" />
                        : <XCircle className="h-3.5 w-3.5 text-red-500 shrink-0" />
                      }
                    </div>
                    <p className="text-xs text-gray-500 truncate">{page.title}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <ScoreBadge score={page.score} />
                    <ChevronDown className={cn('h-4 w-4 text-gray-400 transition-transform', expanded === page.path && 'rotate-180')} />
                  </div>
                </button>

                {expanded === page.path && (
                  <div className="border-t border-gray-100 px-5 py-4 space-y-3">
                    <div>
                      <p className="text-xs font-semibold text-gray-500 mb-1">Meta Title</p>
                      <p className="text-sm text-gray-800 bg-gray-50 rounded px-3 py-2">{page.title}</p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-gray-500 mb-1">Meta Description</p>
                      <p className={cn('text-sm rounded px-3 py-2', page.description ? 'text-gray-800 bg-gray-50' : 'text-red-500 bg-red-50 italic')}>
                        {page.description || 'Missing — add a meta description'}
                      </p>
                    </div>
                    {page.issues.length > 0 && (
                      <div>
                        <p className="text-xs font-semibold text-gray-500 mb-2">Issues</p>
                        <ul className="space-y-1.5">
                          {page.issues.map(issue => (
                            <li key={issue} className="flex items-start gap-2 text-xs text-yellow-700">
                              <AlertCircle className="h-3.5 w-3.5 mt-0.5 shrink-0 text-yellow-500" />
                              {issue}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    <a
                      href={page.path}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-700"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                      Preview live page
                    </a>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Global settings */}
          <div className="space-y-5">
            <div>
              <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Global Settings</h2>
              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                {GLOBAL_SETTINGS.map((s, i) => (
                  <div
                    key={s.key}
                    className={cn('px-4 py-3', i !== GLOBAL_SETTINGS.length - 1 && 'border-b border-gray-100')}
                  >
                    <p className="text-xs text-gray-400 mb-0.5">{s.key}</p>
                    <p className="text-xs font-medium text-gray-800">{s.value}</p>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Resources</h2>
              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                {[
                  { label: 'robots.txt', href: '/robots.txt',     icon: FileCode },
                  { label: 'sitemap.xml', href: '/sitemap.xml',   icon: Map      },
                ].map((r, i) => (
                  <a
                    key={r.label}
                    href={r.href}
                    target="_blank"
                    rel="noreferrer"
                    className={cn('flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors', i !== 0 && 'border-t border-gray-100')}
                  >
                    <r.icon className="h-4 w-4 text-gray-400" />
                    <span className="text-sm font-mono text-gray-700">{r.label}</span>
                    <ExternalLink className="h-3.5 w-3.5 text-gray-400 ml-auto" />
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
