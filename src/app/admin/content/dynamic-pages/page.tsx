'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { FileCode, Plus, Edit2, Trash2, X, Save, Loader2, Eye, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface DynamicPage {
  id: string; title: string; slug: string; template: string;
  metaDescription?: string; content?: string; published: boolean;
  publishedAt?: string; createdAt?: string;
}
const TEMPLATES = ['blank', 'landing', 'promo', 'faq', 'feature'] as const;
const EMPTY: Omit<DynamicPage, 'id' | 'createdAt'> = { title: '', slug: '', template: 'blank', metaDescription: '', content: '', published: false };

function toSlug(str: string) { return str.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''); }

export default function DynamicPagesPage() {
  const [pages, setPages] = useState<DynamicPage[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<{ open: boolean; editing: DynamicPage | null }>({ open: false, editing: null });
  const [form, setForm] = useState<Omit<DynamicPage, 'id' | 'createdAt'>>(EMPTY);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch('/api/admin/collections/dynamicPages').then(r => r.json())
      .then(d => { if (Array.isArray(d)) setPages(d); })
      .finally(() => setLoading(false));
  }, []);

  function openAdd() { setForm(EMPTY); setModal({ open: true, editing: null }); }
  function openEdit(p: DynamicPage) {
    setForm({ title: p.title, slug: p.slug, template: p.template, metaDescription: p.metaDescription ?? '', content: p.content ?? '', published: p.published });
    setModal({ open: true, editing: p });
  }
  function closeModal() { setModal({ open: false, editing: null }); }

  async function handleSave() {
    if (!form.title.trim()) return;
    setSaving(true);
    const payload = { ...form, slug: form.slug || toSlug(form.title), publishedAt: form.published ? (modal.editing?.publishedAt || new Date().toISOString()) : undefined };
    try {
      if (modal.editing) {
        const res = await fetch('/api/admin/collections/dynamicPages', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...modal.editing, ...payload }) });
        const updated = await res.json();
        setPages(prev => prev.map(p => p.id === updated.id ? updated : p));
      } else {
        const res = await fetch('/api/admin/collections/dynamicPages', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
        const created = await res.json();
        setPages(prev => [...prev, created]);
      }
      closeModal();
    } finally { setSaving(false); }
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this page?')) return;
    await fetch(`/api/admin/collections/dynamicPages?id=${id}`, { method: 'DELETE' });
    setPages(prev => prev.filter(p => p.id !== id));
  }

  return (
    <div>
      <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Dynamic Pages</h1>
            <p className="text-sm text-gray-500 mt-0.5">{pages.length} pages · {pages.filter(p => p.published).length} published</p>
          </div>
          <Button size="sm" onClick={openAdd} className="gap-2 bg-blue-600 hover:bg-blue-700 text-white"><Plus className="h-4 w-4" />Add new</Button>
        </div>

        {loading ? (
          <div className="space-y-3">{[...Array(3)].map((_, i) => <div key={i} className="h-20 bg-gray-100 rounded-xl animate-pulse" />)}</div>
        ) : pages.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-xl border border-dashed border-gray-200">
            <FileCode className="h-10 w-10 text-gray-200 mx-auto mb-3" />
            <p className="text-sm text-gray-500">No dynamic pages yet</p>
            <p className="text-xs text-gray-400 mt-1 max-w-xs mx-auto">Create custom landing pages, promo pages, and more that are generated on-demand.</p>
            <Button size="sm" onClick={openAdd} className="mt-4 gap-1.5 bg-blue-600 hover:bg-blue-700 text-white"><Plus className="h-3.5 w-3.5" />Create first page</Button>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-3 text-left">Page</th>
                  <th className="px-6 py-3 text-left">Slug</th>
                  <th className="px-6 py-3 text-left">Template</th>
                  <th className="px-6 py-3 text-left">Status</th>
                  <th className="px-6 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {pages.map(page => (
                  <tr key={page.id} className="hover:bg-gray-50">
                    <td className="px-6 py-3">
                      <p className="text-sm font-semibold text-gray-900">{page.title}</p>
                      {page.metaDescription && <p className="text-xs text-gray-400 mt-0.5 truncate max-w-xs">{page.metaDescription}</p>}
                    </td>
                    <td className="px-6 py-3">
                      <span className="text-xs font-mono text-gray-500">/{page.slug}</span>
                    </td>
                    <td className="px-6 py-3">
                      <span className="text-xs px-2.5 py-1 rounded-full bg-gray-100 text-gray-600 capitalize">{page.template}</span>
                    </td>
                    <td className="px-6 py-3">
                      <span className={cn('text-xs px-2.5 py-1 rounded-full font-medium', page.published ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500')}>
                        {page.published ? 'Published' : 'Draft'}
                      </span>
                    </td>
                    <td className="px-6 py-3">
                      <div className="flex items-center justify-end gap-1">
                        {page.published && (
                          <Link href={`/${page.slug}`} target="_blank">
                            <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-gray-400 hover:text-blue-600"><Eye className="h-3.5 w-3.5" /></Button>
                          </Link>
                        )}
                        <Button variant="ghost" size="sm" onClick={() => openEdit(page)} className="h-7 w-7 p-0 text-gray-400 hover:text-blue-600"><Edit2 className="h-3.5 w-3.5" /></Button>
                        <Button variant="ghost" size="sm" onClick={() => handleDelete(page.id)} className="h-7 w-7 p-0 text-gray-400 hover:text-red-500"><Trash2 className="h-3.5 w-3.5" /></Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>

      <AnimatePresence>
        {modal.open && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }} className="bg-white rounded-2xl shadow-xl w-full max-w-lg">
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                <h2 className="font-semibold text-gray-900">{modal.editing ? 'Edit Page' : 'New Dynamic Page'}</h2>
                <Button variant="ghost" size="sm" onClick={closeModal} className="h-7 w-7 p-0"><X className="h-4 w-4" /></Button>
              </div>
              <div className="px-6 py-5 space-y-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Title<span className="text-red-500 ml-0.5">*</span></label>
                  <input type="text" placeholder="Page title" value={form.title}
                    onChange={e => setForm(p => ({ ...p, title: e.target.value, slug: p.slug || toSlug(e.target.value) }))}
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Slug (URL path)</label>
                  <div className="flex items-center">
                    <span className="px-3 py-2 text-sm text-gray-500 bg-gray-50 border border-r-0 border-gray-200 rounded-l-lg"><Globe className="h-3.5 w-3.5" /></span>
                    <input type="text" placeholder="page-slug" value={form.slug} onChange={e => setForm(p => ({ ...p, slug: toSlug(e.target.value) }))}
                      className="flex-1 px-3 py-2 text-sm font-mono border border-gray-200 rounded-r-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Template</label>
                  <div className="flex flex-wrap gap-2">
                    {TEMPLATES.map(t => (
                      <button key={t} onClick={() => setForm(p => ({ ...p, template: t }))}
                        className={cn('text-xs px-3 py-1.5 rounded-lg border capitalize transition-colors', form.template === t ? 'bg-blue-600 text-white border-blue-600' : 'border-gray-200 text-gray-600 hover:bg-gray-50')}>
                        {t}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Meta description</label>
                  <textarea rows={2} placeholder="SEO description…" value={form.metaDescription}
                    onChange={e => setForm(p => ({ ...p, metaDescription: e.target.value }))}
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Content (HTML / Markdown)</label>
                  <textarea rows={6} placeholder="Page content…" value={form.content}
                    onChange={e => setForm(p => ({ ...p, content: e.target.value }))}
                    className="w-full px-3 py-2 text-sm font-mono border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
                </div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={form.published} onChange={e => setForm(p => ({ ...p, published: e.target.checked }))} className="rounded border-gray-300 text-blue-600" />
                  <span className="text-sm text-gray-700">Publish immediately</span>
                </label>
              </div>
              <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-2">
                <Button variant="outline" size="sm" onClick={closeModal}>Cancel</Button>
                <Button size="sm" onClick={handleSave} disabled={saving || !form.title.trim()} className="gap-2 bg-blue-600 hover:bg-blue-700 text-white">
                  {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
                  {modal.editing ? 'Save changes' : 'Create page'}
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
