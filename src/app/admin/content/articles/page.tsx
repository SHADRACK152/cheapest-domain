'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { FileText, Plus, Search, Edit2, Trash2, Eye, CheckCircle2, AlertCircle, Calendar, Clock, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface Article {
  id: string; title: string; slug: string; excerpt: string; category: string;
  status: 'draft' | 'published' | 'scheduled'; featuredImage: string;
  author: string; date: string; readTime: string;
}

const STATUS_COLORS = {
  published: 'bg-green-100 text-green-700',
  draft:     'bg-gray-100 text-gray-600',
  scheduled: 'bg-blue-100 text-blue-700',
};

const CATEGORY_COLORS: Record<string, string> = {
  Guide:'bg-blue-100 text-blue-700', Education:'bg-purple-100 text-purple-700',
  Security:'bg-red-100 text-red-700', Tutorial:'bg-green-100 text-green-700',
  SEO:'bg-orange-100 text-orange-700', News:'bg-indigo-100 text-indigo-700',
};

export default function ArticlesPage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [selected, setSelected] = useState<string[]>([]);

  useEffect(() => {
    fetch('/api/blog').then(r => r.json())
      .then(d => { if (d.posts) setArticles(d.posts); })
      .finally(() => setLoading(false));
  }, []);

  async function handleDelete(id: string) {
    if (!confirm('Delete this article? This cannot be undone.')) return;
    await fetch(`/api/blog/${id}`, { method: 'DELETE' });
    setArticles(prev => prev.filter(a => a.id !== id));
  }

  const filtered = articles.filter(a => {
    const matchSearch = !search || a.title.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'All' || a.status === statusFilter.toLowerCase();
    return matchSearch && matchStatus;
  });

  const published = articles.filter(a => a.status === 'published').length;
  const drafts    = articles.filter(a => a.status === 'draft').length;

  return (
    <div>
      <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Article</h1>
            <p className="text-sm text-gray-500 mt-0.5">{articles.length} entries · {published} published · {drafts} drafts</p>
          </div>
          <Link href="/admin/blog/new">
            <Button size="sm" className="gap-2 bg-blue-600 hover:bg-blue-700 text-white">
              <Plus className="h-4 w-4" /> Add new
            </Button>
          </Link>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3 mb-5">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text" placeholder="Search articles…" value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex items-center gap-1.5">
            <Filter className="h-4 w-4 text-gray-400" />
            {['All','Published','Draft','Scheduled'].map(s => (
              <button key={s} onClick={() => setStatusFilter(s)}
                className={cn('text-xs px-3 py-1.5 rounded-full border transition-colors',
                  statusFilter === s ? 'bg-blue-600 text-white border-blue-600' : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                )}>{s}</button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200 text-xs font-semibold text-gray-500 uppercase tracking-wider">
              <tr>
                <th className="px-6 py-3 text-left">
                  <input type="checkbox" className="rounded border-gray-300"
                    onChange={e => setSelected(e.target.checked ? filtered.map(a => a.id) : [])}
                    checked={selected.length > 0 && selected.length === filtered.length}
                  />
                </th>
                <th className="px-4 py-3 text-left">Article</th>
                <th className="px-4 py-3 text-left">Category</th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3 text-left">Date</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                [...Array(4)].map((_, i) => (
                  <tr key={i}><td colSpan={6} className="px-6 py-4"><div className="h-4 bg-gray-100 rounded animate-pulse w-3/4" /></td></tr>
                ))
              ) : filtered.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-16 text-sm text-gray-400">No articles found</td></tr>
              ) : filtered.map(article => (
                <tr key={article.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-3">
                    <input type="checkbox" className="rounded border-gray-300"
                      checked={selected.includes(article.id)}
                      onChange={() => setSelected(prev => prev.includes(article.id) ? prev.filter(i => i !== article.id) : [...prev, article.id])}
                    />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-gray-100 shrink-0">
                        {article.featuredImage ? (
                          <Image src={article.featuredImage} alt={article.title} fill className="object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <FileText className="h-5 w-5 text-gray-300" />
                          </div>
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-gray-900 truncate max-w-xs">{article.title}</p>
                        <p className="text-xs text-gray-400 truncate max-w-xs mt-0.5">{article.excerpt}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <Badge className={cn('text-xs', CATEGORY_COLORS[article.category] ?? 'bg-gray-100 text-gray-600')}>{article.category}</Badge>
                  </td>
                  <td className="px-4 py-3">
                    <span className={cn('inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full font-medium', STATUS_COLORS[article.status])}>
                      {article.status === 'published' ? <CheckCircle2 className="h-3 w-3" /> : <AlertCircle className="h-3 w-3" />}
                      {article.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-xs text-gray-500 flex items-center gap-1">
                      <Calendar className="h-3 w-3" />{article.date}
                    </span>
                    <span className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                      <Clock className="h-3 w-3" />{article.readTime}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <Link href={`/blog/${article.slug}`} target="_blank">
                        <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-gray-400 hover:text-blue-600"><Eye className="h-3.5 w-3.5" /></Button>
                      </Link>
                      <Link href={`/admin/blog/edit/${article.id}`}>
                        <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-gray-400 hover:text-blue-600"><Edit2 className="h-3.5 w-3.5" /></Button>
                      </Link>
                      <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-gray-400 hover:text-red-500" onClick={() => handleDelete(article.id)}>
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}
