'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Percent, Save, Loader2, CheckCircle2, Plus, Trash2, X, Copy, Check, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface PromoCode { id: string; title: string; code: string; discount: string; description?: string; expiresAt?: string; active: boolean; }
const EMPTY: Omit<PromoCode, 'id'> = { title: '', code: '', discount: '', description: '', expiresAt: '', active: true };

function genCode() { return Math.random().toString(36).substring(2, 8).toUpperCase(); }

export default function PromoCodesPage() {
  const [codes, setCodes] = useState<PromoCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [modal, setModal] = useState<{ open: boolean; editing: PromoCode | null }>({ open: false, editing: null });
  const [form, setForm] = useState<Omit<PromoCode, 'id'>>(EMPTY);
  const [copied, setCopied] = useState('');

  useEffect(() => {
    fetch('/api/admin/content?section=promoCodes').then(r => r.json())
      .then(d => { if (d?.codes && Array.isArray(d.codes)) setCodes(d.codes.map((c: Omit<PromoCode, 'id'> & { id?: string }, i: number) => ({ ...c, id: c.id ?? String(i) }))); })
      .finally(() => setLoading(false));
  }, []);

  async function persistSave(updated: PromoCode[]) {
    setSaving(true);
    await fetch('/api/admin/content', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ section: 'promoCodes', data: { codes: updated } }) });
    setSaving(false); setSaved(true); setTimeout(() => setSaved(false), 2000);
  }

  function openAdd() { setForm({ ...EMPTY, code: genCode() }); setModal({ open: true, editing: null }); }
  function openEdit(c: PromoCode) { setForm({ title: c.title, code: c.code, discount: c.discount, description: c.description ?? '', expiresAt: c.expiresAt ?? '', active: c.active }); setModal({ open: true, editing: c }); }
  function closeModal() { setModal({ open: false, editing: null }); }

  function handleModalSave() {
    if (!form.code.trim() || !form.title.trim()) return;
    let updated: PromoCode[];
    if (modal.editing) {
      updated = codes.map(c => c.id === modal.editing!.id ? { ...c, ...form } : c);
    } else {
      updated = [...codes, { ...form, id: Date.now().toString() }];
    }
    setCodes(updated);
    persistSave(updated);
    closeModal();
  }

  function handleDelete(id: string) {
    const updated = codes.filter(c => c.id !== id);
    setCodes(updated);
    persistSave(updated);
  }

  function copyCode(code: string) { navigator.clipboard.writeText(code); setCopied(code); setTimeout(() => setCopied(''), 2000); }

  if (loading) return <div className="space-y-3">{[...Array(3)].map((_, i) => <div key={i} className="h-16 bg-gray-100 rounded-xl animate-pulse" />)}</div>;

  return (
    <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} className="max-w-2xl">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-purple-50 flex items-center justify-center"><Percent className="h-5 w-5 text-purple-600" /></div>
          <div><h1 className="text-lg font-bold text-gray-900">Promo Codes Page</h1><p className="text-xs text-gray-500">Single type · Manage promotional codes displayed on the site</p></div>
        </div>
        <div className="flex items-center gap-2">
          {saving && <Loader2 className="h-4 w-4 animate-spin text-gray-400" />}
          {saved && <CheckCircle2 className="h-4 w-4 text-green-500" />}
          <Button size="sm" onClick={openAdd} className="gap-2 bg-blue-600 hover:bg-blue-700 text-white"><Plus className="h-4 w-4" />Add code</Button>
        </div>
      </div>

      {codes.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-xl border border-dashed border-gray-200">
          <Percent className="h-10 w-10 text-gray-200 mx-auto mb-3" />
          <p className="text-sm text-gray-500">No promo codes yet</p>
          <Button size="sm" onClick={openAdd} className="mt-4 gap-1.5 bg-blue-600 hover:bg-blue-700 text-white"><Plus className="h-3.5 w-3.5" />Add first code</Button>
        </div>
      ) : (
        <div className="space-y-3">
          {codes.map(promo => (
            <motion.div key={promo.id} layout className="bg-white rounded-xl border border-gray-200 px-5 py-4 flex items-center gap-4 group hover:shadow-sm transition-shadow">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold text-gray-900">{promo.title}</p>
                  <span className={`text-[11px] px-2 py-0.5 rounded-full font-medium ${promo.active ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-500'}`}>{promo.active ? 'Active' : 'Inactive'}</span>
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <code className="text-xs font-mono bg-gray-100 px-2.5 py-0.5 rounded-md text-gray-700 tracking-widest">{promo.code}</code>
                  <button onClick={() => copyCode(promo.code)} className="text-gray-400 hover:text-blue-600 transition-colors">
                    {copied === promo.code ? <Check className="h-3.5 w-3.5 text-green-500" /> : <Copy className="h-3.5 w-3.5" />}
                  </button>
                  {promo.discount && <span className="text-xs text-green-600 font-semibold">{promo.discount} off</span>}
                </div>
                {promo.description && <p className="text-xs text-gray-400 mt-0.5">{promo.description}</p>}
                {promo.expiresAt && <p className="text-xs text-gray-400 mt-0.5">Expires: {promo.expiresAt}</p>}
              </div>
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button variant="ghost" size="sm" onClick={() => openEdit(promo)} className="h-7 w-7 p-0 text-gray-400 hover:text-blue-600"><Save className="h-3.5 w-3.5" /></Button>
                <Button variant="ghost" size="sm" onClick={() => handleDelete(promo.id)} className="h-7 w-7 p-0 text-gray-400 hover:text-red-500"><Trash2 className="h-3.5 w-3.5" /></Button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <p className="mt-4 flex items-center gap-1.5 text-xs text-gray-400"><Info className="h-3.5 w-3.5" />Changes are auto-saved when you add or delete codes.</p>

      <AnimatePresence>
        {modal.open && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }} className="bg-white rounded-2xl shadow-xl w-full max-w-md">
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                <h2 className="font-semibold text-gray-900">{modal.editing ? 'Edit Promo Code' : 'New Promo Code'}</h2>
                <Button variant="ghost" size="sm" onClick={closeModal} className="h-7 w-7 p-0"><X className="h-4 w-4" /></Button>
              </div>
              <div className="px-6 py-5 space-y-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Title<span className="text-red-500 ml-0.5">*</span></label>
                  <input type="text" placeholder="e.g. New Year Sale" value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Code<span className="text-red-500 ml-0.5">*</span></label>
                  <div className="flex gap-2">
                    <input type="text" placeholder="PROMO2025" value={form.code} onChange={e => setForm(p => ({ ...p, code: e.target.value.toUpperCase() }))} className="flex-1 px-3 py-2 text-sm font-mono border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    <Button variant="outline" size="sm" onClick={() => setForm(p => ({ ...p, code: genCode() }))} className="shrink-0">Generate</Button>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Discount label</label>
                  <input type="text" placeholder="e.g. 20% or KES 500" value={form.discount} onChange={e => setForm(p => ({ ...p, discount: e.target.value }))} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Description</label>
                  <input type="text" placeholder="e.g. Valid on first domain registration" value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Expiry date</label>
                  <input type="text" placeholder="e.g. Dec 31, 2025" value={form.expiresAt} onChange={e => setForm(p => ({ ...p, expiresAt: e.target.value }))} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={form.active} onChange={e => setForm(p => ({ ...p, active: e.target.checked }))} className="rounded border-gray-300 text-blue-600" />
                  <span className="text-sm text-gray-700">Active (visible on site)</span>
                </label>
              </div>
              <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-2">
                <Button variant="outline" size="sm" onClick={closeModal}>Cancel</Button>
                <Button size="sm" onClick={handleModalSave} disabled={!form.code.trim() || !form.title.trim()} className="bg-blue-600 hover:bg-blue-700 text-white">
                  {modal.editing ? 'Save changes' : 'Create code'}
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
