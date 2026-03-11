'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Save, Loader2, CheckCircle2, Info, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface BlogContent {
  title: string; description: string; featuredLabel: string; categories: string[];
  postsPerPage: number; showAuthor: boolean; showDate: boolean;
}
const DEFAULTS: BlogContent = {
  title: 'Our Blog', description: 'Stay up to date with the latest news, guides and tips.',
  featuredLabel: 'Featured', categories: ['Guide', 'Education', 'Security', 'Tutorial', 'SEO', 'News'],
  postsPerPage: 9, showAuthor: true, showDate: true,
};

export default function BlogPageEditor() {
  const [data, setData] = useState<BlogContent>(DEFAULTS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [newCat, setNewCat] = useState('');

  useEffect(() => {
    fetch('/api/admin/content?section=blog').then(r => r.json())
      .then(d => setData({ ...DEFAULTS, ...d, categories: d?.categories ?? DEFAULTS.categories }))
      .finally(() => setLoading(false));
  }, []);

  async function handleSave() {
    setSaving(true);
    await fetch('/api/admin/content', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ section: 'blog', data }) });
    setSaving(false); setSaved(true); setTimeout(() => setSaved(false), 3000);
  }

  function addCategory() {
    const trimmed = newCat.trim();
    if (!trimmed || data.categories.includes(trimmed)) return;
    setData(prev => ({ ...prev, categories: [...prev.categories, trimmed] }));
    setNewCat('');
  }
  function removeCategory(cat: string) { setData(prev => ({ ...prev, categories: prev.categories.filter(c => c !== cat) })); }

  if (loading) return <div className="space-y-3">{[...Array(4)].map((_, i) => <div key={i} className="h-12 bg-gray-100 rounded-lg animate-pulse" />)}</div>;

  const catColors = ['bg-blue-100 text-blue-700', 'bg-purple-100 text-purple-700', 'bg-red-100 text-red-700', 'bg-green-100 text-green-700', 'bg-orange-100 text-orange-700', 'bg-indigo-100 text-indigo-700'];

  return (
    <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} className="max-w-2xl">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-orange-50 flex items-center justify-center"><BookOpen className="h-5 w-5 text-orange-600" /></div>
          <div><h1 className="text-lg font-bold text-gray-900">Blog Page</h1><p className="text-xs text-gray-500">Single type · Edit blog listing page settings</p></div>
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
              <input type="text" value={data.title} onChange={e => setData(prev => ({ ...prev, title: e.target.value }))}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Description</label>
              <textarea rows={2} value={data.description} onChange={e => setData(prev => ({ ...prev, description: e.target.value }))}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Featured label text</label>
              <input type="text" value={data.featuredLabel} onChange={e => setData(prev => ({ ...prev, featuredLabel: e.target.value }))}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-5 py-3 bg-gray-50 border-b border-gray-200">
            <span className="text-xs font-bold text-gray-700 uppercase tracking-wider">Categories</span>
          </div>
          <div className="px-5 py-4">
            <div className="flex flex-wrap gap-2 mb-3">
              {data.categories.map((cat, i) => (
                <span key={cat} className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${catColors[i % catColors.length]}`}>
                  {cat}
                  <button onClick={() => removeCategory(cat)} className="ml-0.5 hover:opacity-70"><Trash2 className="h-2.5 w-2.5" /></button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input type="text" placeholder="New category name…" value={newCat}
                onChange={e => setNewCat(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addCategory(); } }}
                className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
              <Button size="sm" variant="outline" onClick={addCategory} disabled={!newCat.trim()} className="gap-1.5">
                <Plus className="h-3.5 w-3.5" />Add
              </Button>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-5 py-3 bg-gray-50 border-b border-gray-200">
            <span className="text-xs font-bold text-gray-700 uppercase tracking-wider">Display Options</span>
          </div>
          <div className="px-5 py-4 space-y-3">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Posts per page</label>
              <input type="number" min={1} max={50} value={data.postsPerPage}
                onChange={e => setData(prev => ({ ...prev, postsPerPage: Number(e.target.value) }))}
                className="w-24 px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div className="flex gap-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={data.showAuthor} onChange={e => setData(prev => ({ ...prev, showAuthor: e.target.checked }))} className="rounded border-gray-300 text-blue-600" />
                <span className="text-sm text-gray-700">Show author</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={data.showDate} onChange={e => setData(prev => ({ ...prev, showDate: e.target.checked }))} className="rounded border-gray-300 text-blue-600" />
                <span className="text-sm text-gray-700">Show date</span>
              </label>
            </div>
          </div>
        </div>

        <p className="flex items-center gap-1.5 text-xs text-gray-400"><Info className="h-3.5 w-3.5" />Changes are saved to the content store.</p>
      </div>
    </motion.div>
  );
}
