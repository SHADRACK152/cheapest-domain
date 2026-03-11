'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowUpAZ, Save, Loader2, CheckCircle2, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface TldAzContent { title: string; description: string; showPrices: boolean; groupByLetter: boolean; }
const DEFAULTS: TldAzContent = {
  title: 'All Domain Extensions A–Z',
  description: 'Browse all 1,348+ domain extensions alphabetically. Compare prices and find the perfect TLD for your brand.',
  showPrices: true, groupByLetter: true,
};

export default function TldsAzPageEditor() {
  const [data, setData] = useState<TldAzContent>(DEFAULTS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch('/api/admin/content?section=tldAz').then(r => r.json())
      .then(d => setData({ ...DEFAULTS, ...d }))
      .finally(() => setLoading(false));
  }, []);

  async function handleSave() {
    setSaving(true);
    await fetch('/api/admin/content', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ section: 'tldAz', data }) });
    setSaving(false); setSaved(true); setTimeout(() => setSaved(false), 3000);
  }

  if (loading) return <div className="space-y-3">{[...Array(3)].map((_, i) => <div key={i} className="h-12 bg-gray-100 rounded-lg animate-pulse" />)}</div>;

  return (
    <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} className="max-w-2xl">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-violet-50 flex items-center justify-center"><ArrowUpAZ className="h-5 w-5 text-violet-600" /></div>
          <div><h1 className="text-lg font-bold text-gray-900">Tlds From a-z Page</h1><p className="text-xs text-gray-500">Single type · Alphabetical TLD listing page settings</p></div>
        </div>
        <Button size="sm" onClick={handleSave} disabled={saving} className={`gap-2 ${saved ? 'bg-green-600 hover:bg-green-700' : 'bg-blue-600 hover:bg-blue-700'} text-white`}>
          {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : saved ? <CheckCircle2 className="h-3.5 w-3.5" /> : <Save className="h-3.5 w-3.5" />}
          {saving ? 'Saving…' : saved ? 'Saved!' : 'Save'}
        </Button>
      </div>

      <div className="space-y-6">
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-5 py-3 bg-gray-50 border-b border-gray-200">
            <span className="text-xs font-bold text-gray-700 uppercase tracking-wider">Page Header</span>
          </div>
          <div className="px-5 py-4 space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Page Title</label>
              <input type="text" value={data.title} onChange={e => setData(p => ({ ...p, title: e.target.value }))}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Description</label>
              <textarea rows={3} value={data.description} onChange={e => setData(p => ({ ...p, description: e.target.value }))}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-5 py-3 bg-gray-50 border-b border-gray-200">
            <span className="text-xs font-bold text-gray-700 uppercase tracking-wider">Display Options</span>
          </div>
          <div className="px-5 py-4 flex gap-6">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={data.showPrices} onChange={e => setData(p => ({ ...p, showPrices: e.target.checked }))} className="rounded border-gray-300 text-blue-600" />
              <span className="text-sm text-gray-700">Show prices in listing</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={data.groupByLetter} onChange={e => setData(p => ({ ...p, groupByLetter: e.target.checked }))} className="rounded border-gray-300 text-blue-600" />
              <span className="text-sm text-gray-700">Group by letter (A, B, C…)</span>
            </label>
          </div>
        </div>

        <p className="flex items-center gap-1.5 text-xs text-gray-400"><Info className="h-3.5 w-3.5" />Changes are saved to the content store.</p>
      </div>
    </motion.div>
  );
}
