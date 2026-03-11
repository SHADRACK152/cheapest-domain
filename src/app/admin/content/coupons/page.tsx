'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Ticket, Plus, Edit2, Trash2, X, Save, Loader2, Copy, Check, CalendarDays } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface Coupon {
  id: string; code: string; title: string; type: 'percentage' | 'fixed';
  discount: number; minOrder?: number; maxUses?: number; usedCount: number;
  expiresAt?: string; active: boolean; createdAt?: string;
}
const EMPTY: Omit<Coupon, 'id' | 'createdAt' | 'usedCount'> = { code: '', title: '', type: 'percentage', discount: 10, minOrder: 0, maxUses: 0, expiresAt: '', active: true };

function genCode() { return Math.random().toString(36).substring(2, 8).toUpperCase(); }
function isExpired(d?: string) { return !!d && new Date(d) < new Date(); }

export default function CouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<{ open: boolean; editing: Coupon | null }>({ open: false, editing: null });
  const [form, setForm] = useState<Omit<Coupon, 'id' | 'createdAt' | 'usedCount'>>(EMPTY);
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState('');

  useEffect(() => {
    fetch('/api/admin/collections/coupons').then(r => r.json())
      .then(d => { if (Array.isArray(d)) setCoupons(d); })
      .finally(() => setLoading(false));
  }, []);

  function openAdd() { setForm({ ...EMPTY, code: genCode() }); setModal({ open: true, editing: null }); }
  function openEdit(c: Coupon) { setForm({ code: c.code, title: c.title, type: c.type, discount: c.discount, minOrder: c.minOrder, maxUses: c.maxUses, expiresAt: c.expiresAt ?? '', active: c.active }); setModal({ open: true, editing: c }); }
  function closeModal() { setModal({ open: false, editing: null }); }

  function copyCode(code: string) {
    navigator.clipboard.writeText(code);
    setCopied(code);
    setTimeout(() => setCopied(''), 2000);
  }

  async function handleSave() {
    if (!form.code.trim() || !form.title.trim()) return;
    setSaving(true);
    try {
      if (modal.editing) {
        const res = await fetch('/api/admin/collections/coupons', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...modal.editing, ...form }) });
        const updated = await res.json();
        setCoupons(prev => prev.map(c => c.id === updated.id ? updated : c));
      } else {
        const res = await fetch('/api/admin/collections/coupons', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...form, usedCount: 0 }) });
        const created = await res.json();
        setCoupons(prev => [...prev, created]);
      }
      closeModal();
    } finally { setSaving(false); }
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this coupon?')) return;
    await fetch(`/api/admin/collections/coupons?id=${id}`, { method: 'DELETE' });
    setCoupons(prev => prev.filter(c => c.id !== id));
  }

  return (
    <div>
      <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Coupons</h1>
            <p className="text-sm text-gray-500 mt-0.5">{coupons.length} entries · {coupons.filter(c => c.active && !isExpired(c.expiresAt)).length} active</p>
          </div>
          <Button size="sm" onClick={openAdd} className="gap-2 bg-blue-600 hover:bg-blue-700 text-white"><Plus className="h-4 w-4" />Add new</Button>
        </div>

        {loading ? (
          <div className="space-y-3">{[...Array(3)].map((_, i) => <div key={i} className="h-16 bg-gray-100 rounded-xl animate-pulse" />)}</div>
        ) : coupons.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-xl border border-dashed border-gray-200">
            <Ticket className="h-10 w-10 text-gray-200 mx-auto mb-3" />
            <p className="text-sm text-gray-500">No coupons yet</p>
            <Button size="sm" onClick={openAdd} className="mt-4 gap-1.5 bg-blue-600 hover:bg-blue-700 text-white"><Plus className="h-3.5 w-3.5" />Add first coupon</Button>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-3 text-left">Coupon</th>
                  <th className="px-6 py-3 text-left">Discount</th>
                  <th className="px-6 py-3 text-left">Usage</th>
                  <th className="px-6 py-3 text-left">Expires</th>
                  <th className="px-6 py-3 text-left">Status</th>
                  <th className="px-6 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {coupons.map(coupon => {
                  const expired = isExpired(coupon.expiresAt);
                  return (
                    <tr key={coupon.id} className={cn('hover:bg-gray-50', (!coupon.active || expired) && 'opacity-60')}>
                      <td className="px-6 py-3">
                        <p className="text-sm font-semibold text-gray-900">{coupon.title}</p>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <code className="text-xs font-mono bg-gray-100 px-2 py-0.5 rounded text-gray-700">{coupon.code}</code>
                          <button onClick={() => copyCode(coupon.code)} className="text-gray-400 hover:text-blue-600">
                            {copied === coupon.code ? <Check className="h-3 w-3 text-green-500" /> : <Copy className="h-3 w-3" />}
                          </button>
                        </div>
                      </td>
                      <td className="px-6 py-3">
                        <span className="text-sm font-semibold text-green-600">
                          {coupon.type === 'percentage' ? `${coupon.discount}%` : `KES ${coupon.discount}`}
                        </span>
                        {coupon.minOrder ? <p className="text-xs text-gray-400">Min order: KES {coupon.minOrder}</p> : null}
                      </td>
                      <td className="px-6 py-3 text-sm text-gray-600">
                        {coupon.usedCount ?? 0}{coupon.maxUses ? ` / ${coupon.maxUses}` : ' used'}
                      </td>
                      <td className="px-6 py-3">
                        {coupon.expiresAt ? (
                          <span className={cn('text-xs flex items-center gap-1', expired ? 'text-red-500' : 'text-gray-500')}>
                            <CalendarDays className="h-3 w-3" />{new Date(coupon.expiresAt).toLocaleDateString()}
                          </span>
                        ) : <span className="text-xs text-gray-400">Never</span>}
                      </td>
                      <td className="px-6 py-3">
                        <span className={cn('text-xs px-2.5 py-1 rounded-full font-medium', coupon.active && !expired ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500')}>
                          {expired ? 'Expired' : coupon.active ? 'Active' : 'Disabled'}
                        </span>
                      </td>
                      <td className="px-6 py-3">
                        <div className="flex items-center justify-end gap-1">
                          <Button variant="ghost" size="sm" onClick={() => openEdit(coupon)} className="h-7 w-7 p-0 text-gray-400 hover:text-blue-600"><Edit2 className="h-3.5 w-3.5" /></Button>
                          <Button variant="ghost" size="sm" onClick={() => handleDelete(coupon.id)} className="h-7 w-7 p-0 text-gray-400 hover:text-red-500"><Trash2 className="h-3.5 w-3.5" /></Button>
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
                <h2 className="font-semibold text-gray-900">{modal.editing ? 'Edit Coupon' : 'New Coupon'}</h2>
                <Button variant="ghost" size="sm" onClick={closeModal} className="h-7 w-7 p-0"><X className="h-4 w-4" /></Button>
              </div>
              <div className="px-6 py-5 space-y-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Title<span className="text-red-500 ml-0.5">*</span></label>
                  <input type="text" placeholder="e.g. Summer Sale" value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Code<span className="text-red-500 ml-0.5">*</span></label>
                  <div className="flex gap-2">
                    <input type="text" placeholder="COUPONCODE" value={form.code} onChange={e => setForm(p => ({ ...p, code: e.target.value.toUpperCase() }))}
                      className="flex-1 px-3 py-2 text-sm font-mono border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    <Button variant="outline" size="sm" onClick={() => setForm(p => ({ ...p, code: genCode() }))} className="shrink-0">Regenerate</Button>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Type</label>
                    <select value={form.type} onChange={e => setForm(p => ({ ...p, type: e.target.value as 'percentage' | 'fixed' }))}
                      className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
                      <option value="percentage">Percentage %</option>
                      <option value="fixed">Fixed amount</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Discount</label>
                    <input type="number" min={0} value={form.discount} onChange={e => setForm(p => ({ ...p, discount: Number(e.target.value) }))}
                      className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Min order (KES)</label>
                    <input type="number" min={0} value={form.minOrder ?? ''} onChange={e => setForm(p => ({ ...p, minOrder: Number(e.target.value) }))}
                      className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Max uses (0 = unlimited)</label>
                    <input type="number" min={0} value={form.maxUses ?? ''} onChange={e => setForm(p => ({ ...p, maxUses: Number(e.target.value) }))}
                      className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Expires (leave blank for no expiry)</label>
                  <input type="datetime-local" value={form.expiresAt} onChange={e => setForm(p => ({ ...p, expiresAt: e.target.value }))}
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={form.active} onChange={e => setForm(p => ({ ...p, active: e.target.checked }))} className="rounded border-gray-300 text-blue-600" />
                  <span className="text-sm text-gray-700">Active</span>
                </label>
              </div>
              <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-2">
                <Button variant="outline" size="sm" onClick={closeModal}>Cancel</Button>
                <Button size="sm" onClick={handleSave} disabled={saving || !form.code.trim() || !form.title.trim()} className="gap-2 bg-blue-600 hover:bg-blue-700 text-white">
                  {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
                  {modal.editing ? 'Save changes' : 'Create coupon'}
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
