'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Tag, Plus, Edit2, Trash2, X, Save, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface Category {
  id: string; name: string; slug: string; description?: string;
  color: string; postCount?: number; createdAt?: string;
}
const COLORS = ['blue','purple','red','green','orange','indigo','pink','yellow','teal','cyan'] as const;
const EMPTY: Omit<Category, 'id' | 'createdAt'> = { name: '', slug: '', description: '', color: 'blue' };

const COLOR_CLASSES: Record<string, { bg: string; text: string; light: string }> = {
  blue:   { bg: 'bg-blue-500',   text: 'text-blue-700',   light: 'bg-blue-100'   },
  purple: { bg: 'bg-purple-500', text: 'text-purple-700', light: 'bg-purple-100' },
  red:    { bg: 'bg-red-500',    text: 'text-red-700',    light: 'bg-red-100'    },
  green:  { bg: 'bg-green-500',  text: 'text-green-700',  light: 'bg-green-100'  },
  orange: { bg: 'bg-orange-500', text: 'text-orange-700', light: 'bg-orange-100' },
  indigo: { bg: 'bg-indigo-500', text: 'text-indigo-700', light: 'bg-indigo-100' },
  pink:   { bg: 'bg-pink-500',   text: 'text-pink-700',   light: 'bg-pink-100'   },
  yellow: { bg: 'bg-yellow-500', text: 'text-yellow-700', light: 'bg-yellow-100' },
  teal:   { bg: 'bg-teal-500',   text: 'text-teal-700',   light: 'bg-teal-100'   },
  cyan:   { bg: 'bg-cyan-500',   text: 'text-cyan-700',   light: 'bg-cyan-100'   },
};

function toSlug(name: string) { return name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''); }

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<{ open: boolean; editing: Category | null }>({ open: false, editing: null });
  const [form, setForm] = useState<Omit<Category, 'id' | 'createdAt'>>(EMPTY);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch('/api/admin/collections/categories').then(r => r.json())
      .then(d => { if (Array.isArray(d)) setCategories(d); })
      .finally(() => setLoading(false));
  }, []);

  function openAdd() { setForm(EMPTY); setModal({ open: true, editing: null }); }
  function openEdit(c: Category) { setForm({ name: c.name, slug: c.slug, description: c.description ?? '', color: c.color }); setModal({ open: true, editing: c }); }
  function closeModal() { setModal({ open: false, editing: null }); }

  async function handleSave() {
    if (!form.name.trim()) return;
    setSaving(true);
    try {
      const payload = { ...form, slug: form.slug || toSlug(form.name) };
      if (modal.editing) {
        const res = await fetch('/api/admin/collections/categories', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...modal.editing, ...payload }) });
        const updated = await res.json();
        setCategories(prev => prev.map(c => c.id === updated.id ? updated : c));
      } else {
        const res = await fetch('/api/admin/collections/categories', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
        const created = await res.json();
        setCategories(prev => [...prev, created]);
      }
      closeModal();
    } finally { setSaving(false); }
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this category?')) return;
    await fetch(`/api/admin/collections/categories?id=${id}`, { method: 'DELETE' });
    setCategories(prev => prev.filter(c => c.id !== id));
  }

  return (
    <div>
      <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Category</h1>
            <p className="text-sm text-gray-500 mt-0.5">{categories.length} {categories.length === 1 ? 'entry' : 'entries'}</p>
          </div>
          <Button size="sm" onClick={openAdd} className="gap-2 bg-blue-600 hover:bg-blue-700 text-white"><Plus className="h-4 w-4" />Add new</Button>
        </div>

        {loading ? (
          <div className="flex flex-wrap gap-3">{[...Array(6)].map((_, i) => <div key={i} className="h-9 w-28 bg-gray-100 rounded-full animate-pulse" />)}</div>
        ) : categories.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-xl border border-dashed border-gray-200">
            <Tag className="h-10 w-10 text-gray-200 mx-auto mb-3" />
            <p className="text-sm text-gray-500">No categories yet</p>
            <Button size="sm" onClick={openAdd} className="mt-4 gap-1.5 bg-blue-600 hover:bg-blue-700 text-white"><Plus className="h-3.5 w-3.5" />Add first category</Button>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-3 text-left">Category</th>
                  <th className="px-6 py-3 text-left">Slug</th>
                  <th className="px-6 py-3 text-left">Description</th>
                  <th className="px-6 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {categories.map(cat => {
                  const colors = COLOR_CLASSES[cat.color] ?? COLOR_CLASSES.blue;
                  return (
                    <tr key={cat.id} className="hover:bg-gray-50">
                      <td className="px-6 py-3">
                        <span className={cn('inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium', colors.light, colors.text)}>
                          <span className={cn('w-2 h-2 rounded-full', colors.bg)} />{cat.name}
                        </span>
                      </td>
                      <td className="px-6 py-3 text-sm text-gray-500 font-mono">/{cat.slug}</td>
                      <td className="px-6 py-3 text-sm text-gray-500 max-w-xs truncate">{cat.description || '—'}</td>
                      <td className="px-6 py-3">
                        <div className="flex items-center justify-end gap-1">
                          <Button variant="ghost" size="sm" onClick={() => openEdit(cat)} className="h-7 w-7 p-0 text-gray-400 hover:text-blue-600"><Edit2 className="h-3.5 w-3.5" /></Button>
                          <Button variant="ghost" size="sm" onClick={() => handleDelete(cat.id)} className="h-7 w-7 p-0 text-gray-400 hover:text-red-500"><Trash2 className="h-3.5 w-3.5" /></Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>

      <AnimatePresence>
        {modal.open && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }} className="bg-white rounded-2xl shadow-xl w-full max-w-md">
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                <h2 className="font-semibold text-gray-900">{modal.editing ? 'Edit Category' : 'New Category'}</h2>
                <Button variant="ghost" size="sm" onClick={closeModal} className="h-7 w-7 p-0"><X className="h-4 w-4" /></Button>
              </div>
              <div className="px-6 py-5 space-y-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Name<span className="text-red-500 ml-0.5">*</span></label>
                  <input type="text" placeholder="Category name" value={form.name}
                    onChange={e => setForm(prev => ({ ...prev, name: e.target.value, slug: prev.slug || toSlug(e.target.value) }))}
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Slug</label>
                  <input type="text" placeholder="category-slug" value={form.slug}
                    onChange={e => setForm(prev => ({ ...prev, slug: toSlug(e.target.value) }))}
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Description</label>
                  <textarea rows={2} placeholder="Short description…" value={form.description}
                    onChange={e => setForm(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-2">Color</label>
                  <div className="flex flex-wrap gap-2">
                    {COLORS.map(c => (
                      <button key={c} onClick={() => setForm(prev => ({ ...prev, color: c }))}
                        className={cn('w-7 h-7 rounded-full transition-all', COLOR_CLASSES[c].bg, form.color === c ? 'ring-2 ring-offset-2 ring-gray-400 scale-110' : 'hover:scale-105')}
                      />
                    ))}
                  </div>
                </div>
              </div>
              <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-2">
                <Button variant="outline" size="sm" onClick={closeModal}>Cancel</Button>
                <Button size="sm" onClick={handleSave} disabled={saving || !form.name.trim()} className="gap-2 bg-blue-600 hover:bg-blue-700 text-white">
                  {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
                  {modal.editing ? 'Save changes' : 'Create category'}
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
