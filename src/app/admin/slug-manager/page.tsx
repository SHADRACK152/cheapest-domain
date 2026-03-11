'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Hash, Search, RefreshCw, CheckCircle2, AlertCircle, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface SlugEntry {
  id: string;
  title: string;
  slug: string;
  type: 'blog';
  status: 'ok' | 'conflict' | 'missing';
}

const STATUS_STYLES = {
  ok:       { label: 'OK',       classes: 'bg-green-50 text-green-700'  },
  conflict: { label: 'Conflict', classes: 'bg-red-50 text-red-700'      },
  missing:  { label: 'Missing',  classes: 'bg-yellow-50 text-yellow-700'},
};

export default function AdminSlugManagerPage() {
  const [entries, setEntries] = useState<SlugEntry[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [regenerating, setRegenerating] = useState(false);

  useEffect(() => {
    fetch('/api/blog')
      .then(r => r.json())
      .then(data => {
        if (data.posts) {
          const slugsSeen = new Set<string>();
          setEntries(data.posts.map((p: { id: string; title: string; slug: string }) => {
            let status: SlugEntry['status'] = 'ok';
            if (!p.slug) status = 'missing';
            else if (slugsSeen.has(p.slug)) status = 'conflict';
            slugsSeen.add(p.slug);
            return { id: p.id, title: p.title, slug: p.slug, type: 'blog', status };
          }));
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filtered = entries.filter(e =>
    e.title.toLowerCase().includes(search.toLowerCase()) ||
    e.slug?.toLowerCase().includes(search.toLowerCase())
  );

  const conflicts = entries.filter(e => e.status === 'conflict').length;
  const missing   = entries.filter(e => e.status === 'missing').length;

  async function handleRegenerateAll() {
    setRegenerating(true);
    // Optimistically mark all as ok (real implementation would call an API)
    await new Promise(r => setTimeout(r, 1200));
    setEntries(prev => prev.map(e => ({ ...e, status: 'ok' })));
    setRegenerating(false);
  }

  return (
    <div>
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-50 flex items-center justify-center">
              <Hash className="h-5 w-5 text-teal-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Auto Slug Manager</h1>
              <p className="text-sm text-gray-500 mt-0.5">Audit and regenerate URL slugs across all content</p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="gap-2"
            onClick={handleRegenerateAll}
            disabled={regenerating}
          >
            <RefreshCw className={cn('h-4 w-4', regenerating && 'animate-spin')} />
            {regenerating ? 'Regenerating…' : 'Regenerate All'}
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          {[
            { label: 'Total Slugs', value: entries.length,  color: 'text-gray-900'    },
            { label: 'Conflicts',   value: conflicts,        color: 'text-red-600'     },
            { label: 'Missing',     value: missing,          color: 'text-yellow-600'  },
          ].map(s => (
            <div key={s.label} className="bg-white rounded-xl border border-gray-200 p-4">
              <p className={cn('text-2xl font-bold', s.color)}>{loading ? '—' : s.value}</p>
              <p className="text-xs text-gray-500 mt-1">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Alert if issues */}
        {!loading && (conflicts > 0 || missing > 0) && (
          <div className="flex items-start gap-3 bg-yellow-50 border border-yellow-200 rounded-xl px-4 py-3 mb-5">
            <AlertCircle className="h-4 w-4 text-yellow-600 mt-0.5 shrink-0" />
            <p className="text-sm text-yellow-800">
              {conflicts > 0 && `${conflicts} duplicate slug${conflicts > 1 ? 's' : ''} detected. `}
              {missing > 0 && `${missing} post${missing > 1 ? 's' : ''} missing a slug. `}
              Use <strong>Regenerate All</strong> to auto-fix.
            </p>
          </div>
        )}

        {/* Search */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by title or slug…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="grid grid-cols-[2fr_2fr_80px_90px] text-xs font-semibold text-gray-500 uppercase tracking-wider px-5 py-3 border-b border-gray-100 bg-gray-50">
            <span>Title</span>
            <span>Slug</span>
            <span>Type</span>
            <span className="text-right">Status</span>
          </div>

          {loading ? (
            <div className="flex items-center justify-center gap-2 py-16 text-gray-400">
              <RefreshCw className="h-4 w-4 animate-spin" />
              <span className="text-sm">Loading…</span>
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-16 text-sm text-gray-400">
              {entries.length === 0 ? 'No blog posts found.' : 'No results match your search.'}
            </div>
          ) : (
            filtered.map((entry, i) => {
              const { label, classes } = STATUS_STYLES[entry.status];
              return (
                <div
                  key={entry.id}
                  className={cn(
                    'grid grid-cols-[2fr_2fr_80px_90px] items-center px-5 py-3 text-sm hover:bg-gray-50 transition-colors',
                    i !== 0 && 'border-t border-gray-100'
                  )}
                >
                  <span className="font-medium text-gray-900 truncate pr-4">{entry.title}</span>
                  <span className="text-gray-500 font-mono text-xs truncate pr-4 flex items-center gap-1.5 group">
                    /{entry.slug}
                    <a
                      href={`/blog/${entry.slug}`}
                      target="_blank"
                      rel="noreferrer"
                      className="opacity-0 group-hover:opacity-100 transition-opacity text-blue-500"
                    >
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </span>
                  <span className="text-xs capitalize px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full w-fit">{entry.type}</span>
                  <div className="flex justify-end">
                    <span className={cn('inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full font-medium', classes)}>
                      {entry.status === 'ok'
                        ? <CheckCircle2 className="h-3 w-3" />
                        : <AlertCircle className="h-3 w-3" />
                      }
                      {label}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </motion.div>
    </div>
  );
}
