'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { ImageIcon, Plus, Edit2, Trash2, X, Save, Loader2, Link as LinkIcon, ToggleLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface Banner {
  id: string; title: string; subtitle?: string; imageUrl: string; linkUrl?: string;
  position: 'top' | 'sidebar' | 'inline' | 'footer'; active: boolean; createdAt?: string;
}
const EMPTY: Omit<Banner, 'id' | 'createdAt'> = { title: '', subtitle: '', imageUrl: '', linkUrl: '', position: 'top', active: true };

const POSITIONS = ['top', 'sidebar', 'inline', 'footer'] as const;
const POS_COLORS: Record<string, string> = {
  top: 'bg-blue-100 text-blue-700', sidebar: 'bg-purple-100 text-purple-700',
  inline: 'bg-green-100 text-green-700', footer: 'bg-orange-100 text-orange-700',
};

export default function BannersPage() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<{ open: boolean; editing: Banner | null }>({ open: false, editing: null });
  const [form, setForm] = useState<Omit<Banner, 'id' | 'createdAt'>>(EMPTY);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch('/api/admin/collections/banners').then(r => r.json())
      .then(d => { if (Array.isArray(d)) setBanners(d); })
      .finally(() => setLoading(false));
  }, []);

  function openAdd() { setForm(EMPTY); setModal({ open: true, editing: null }); }
  function openEdit(b: Banner) { setForm({ title: b.title, subtitle: b.subtitle ?? '', imageUrl: b.imageUrl, linkUrl: b.linkUrl ?? '', position: b.position, active: b.active }); setModal({ open: true, editing: b }); }
  function closeModal() { setModal({ open: false, editing: null }); }

  async function handleSave() {
    if (!form.title.trim()) return;
    setSaving(true);
    try {
      if (modal.editing) {
        const res = await fetch('/api/admin/collections/banners', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...modal.editing, ...form }) });
        const updated = await res.json();
        setBanners(prev => prev.map(b => b.id === updated.id ? updated : b));
      } else {
        const res = await fetch('/api/admin/collections/banners', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
        const created = await res.json();
        setBanners(prev => [...prev, created]);
      }
      closeModal();
    } finally { setSaving(false); }
  }

  async function toggleActive(banner: Banner) {
    const res = await fetch('/api/admin/collections/banners', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...banner, active: !banner.active }) });
    const updated = await res.json();
    setBanners(prev => prev.map(b => b.id === updated.id ? updated : b));
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this banner?')) return;
    await fetch(`/api/admin/collections/banners?id=${id}`, { method: 'DELETE' });
    setBanners(prev => prev.filter(b => b.id !== id));
  }

  return (
    <div>
      <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Banners</h1>
            <p className="text-sm text-gray-500 mt-0.5">{banners.length} entries · {banners.filter(b => b.active).length} active</p>
          </div>
          <Button size="sm" onClick={openAdd} className="gap-2 bg-blue-600 hover:bg-blue-700 text-white"><Plus className="h-4 w-4" />Add new</Button>
        </div>

        {loading ? (
          <div className="space-y-3">{[...Array(3)].map((_, i) => <div key={i} className="h-20 bg-gray-100 rounded-xl animate-pulse" />)}</div>
        ) : banners.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-xl border border-dashed border-gray-200">
            <ImageIcon className="h-10 w-10 text-gray-200 mx-auto mb-3" />
            <p className="text-sm text-gray-500">No banners yet</p>
            <Button size="sm" onClick={openAdd} className="mt-4 gap-1.5 bg-blue-600 hover:bg-blue-700 text-white"><Plus className="h-3.5 w-3.5" />Add first banner</Button>
          </div>
        ) : (
          <div className="space-y-3">
            {banners.map(banner => (
              <motion.div key={banner.id} layout className={cn('bg-white rounded-xl border p-4 flex items-center gap-4 group transition-all', banner.active ? 'border-gray-200' : 'border-gray-100 opacity-60')}>
                <div className="relative w-20 h-12 rounded-lg overflow-hidden bg-gray-100 shrink-0">
                  {banner.imageUrl ? <Image src={banner.imageUrl} alt={banner.title} fill className="object-cover" /> : <div className="w-full h-full flex items-center justify-center"><ImageIcon className="h-5 w-5 text-gray-300" /></div>}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-sm text-gray-900 truncate">{banner.title}</p>
                    <span className={cn('text-[11px] px-2 py-0.5 rounded-full font-medium', POS_COLORS[banner.position])}>{banner.position}</span>
                    <span className={cn('text-[11px] px-2 py-0.5 rounded-full font-medium', banner.active ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-500')}>{banner.active ? 'Active' : 'Inactive'}</span>
                  </div>
                  {banner.subtitle && <p className="text-xs text-gray-500 mt-0.5 truncate">{banner.subtitle}</p>}
                  {banner.linkUrl && <p className="text-xs text-blue-500 flex items-center gap-1 mt-0.5 truncate"><LinkIcon className="h-3 w-3" />{banner.linkUrl}</p>}
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button variant="ghost" size="sm" onClick={() => toggleActive(banner)} className="h-7 w-7 p-0 text-gray-400 hover:text-blue-600"><ToggleLeft className="h-4 w-4" /></Button>
                  <Button variant="ghost" size="sm" onClick={() => openEdit(banner)} className="h-7 w-7 p-0 text-gray-400 hover:text-blue-600"><Edit2 className="h-3.5 w-3.5" /></Button>
                  <Button variant="ghost" size="sm" onClick={() => handleDelete(banner.id)} className="h-7 w-7 p-0 text-gray-400 hover:text-red-500"><Trash2 className="h-3.5 w-3.5" /></Button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>

      <AnimatePresence>
        {modal.open && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }} className="bg-white rounded-2xl shadow-xl w-full max-w-md">
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                <h2 className="font-semibold text-gray-900">{modal.editing ? 'Edit Banner' : 'New Banner'}</h2>
                <Button variant="ghost" size="sm" onClick={closeModal} className="h-7 w-7 p-0"><X className="h-4 w-4" /></Button>
              </div>
              <div className="px-6 py-5 space-y-4">
                {[
                  { label: 'Title', key: 'title', placeholder: 'Banner title', required: true },
                  { label: 'Subtitle', key: 'subtitle', placeholder: 'Optional subtitle' },
                  { label: 'Image URL', key: 'imageUrl', placeholder: 'https://...' },
                  { label: 'Link URL', key: 'linkUrl', placeholder: 'https://destination.com' },
                ].map(({ label, key, placeholder, required }) => (
                  <div key={key}>
                    <label className="block text-xs font-medium text-gray-700 mb-1">{label}{required && <span className="text-red-500 ml-0.5">*</span>}</label>
                    <input type="text" placeholder={placeholder} value={(form as Record<string, unknown>)[key] as string ?? ''}
                      onChange={e => setForm(prev => ({ ...prev, [key]: e.target.value }))}
                      className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                ))}
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Position</label>
                  <div className="flex gap-2 flex-wrap">
                    {POSITIONS.map(p => (
                      <button key={p} onClick={() => setForm(prev => ({ ...prev, position: p }))}
                        className={cn('text-xs px-3 py-1.5 rounded-lg border capitalize transition-colors', form.position === p ? 'bg-blue-600 text-white border-blue-600' : 'border-gray-200 text-gray-600 hover:bg-gray-50')}>
                        {p}
                      </button>
                    ))}
                  </div>
                </div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={form.active} onChange={e => setForm(prev => ({ ...prev, active: e.target.checked }))} className="rounded border-gray-300 text-blue-600" />
                  <span className="text-sm text-gray-700">Active (visible on site)</span>
                </label>
              </div>
              <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-2">
                <Button variant="outline" size="sm" onClick={closeModal}>Cancel</Button>
                <Button size="sm" onClick={handleSave} disabled={saving || !form.title.trim()} className="gap-2 bg-blue-600 hover:bg-blue-700 text-white">
                  {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
                  {modal.editing ? 'Save changes' : 'Create banner'}
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
