'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Home, Save, Loader2, CheckCircle2, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface HomeContent {
  hero: { badge: string; headline: string; headlineGradient: string; subheadline: string };
  features: { headline: string; subheadline: string };
  cta: { headline: string; body: string; primaryBtn: string; secondaryBtn: string };
}
const DEFAULTS: HomeContent = {
  hero: { badge: 'Transparent Pricing — No Renewal Surprises', headline: 'Cheapest Domains. No Hidden Fees.', headlineGradient: 'No Hidden Fees.', subheadline: 'Compare real prices across registrars — register and renew affordably.' },
  features: { headline: 'Why Choose CheapestDomains', subheadline: 'Everything you need to manage your online presence, at prices that make sense.' },
  cta: { headline: 'Ready to Find the Best Domain Deal?', body: "Compare domain prices and avoid expensive renewals. Our mission is to help you find affordable domain names without misleading pricing structures.", primaryBtn: 'Compare Domain Deals', secondaryBtn: 'Read Our Blog' },
};

function Field({ label, value, onChange, hint, rows }: { label: string; value: string; onChange: (v: string) => void; hint?: string; rows?: number }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-gray-700 mb-1">{label}</label>
      {rows ? (
        <textarea rows={rows} value={value} onChange={e => onChange(e.target.value)}
          className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
      ) : (
        <input type="text" value={value} onChange={e => onChange(e.target.value)}
          className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
      )}
      {hint && <p className="text-xs text-gray-400 mt-1">{hint}</p>}
    </div>
  );
}

export default function HomePageEditor() {
  const [data, setData] = useState<HomeContent>(DEFAULTS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch('/api/admin/content?section=home').then(r => r.json())
      .then(d => setData({ hero: { ...DEFAULTS.hero, ...d?.hero }, features: { ...DEFAULTS.features, ...d?.features }, cta: { ...DEFAULTS.cta, ...d?.cta } }))
      .finally(() => setLoading(false));
  }, []);

  async function handleSave() {
    setSaving(true);
    await fetch('/api/admin/content', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ section: 'home', data }) });
    setSaving(false); setSaved(true); setTimeout(() => setSaved(false), 3000);
  }

  const set = (section: keyof HomeContent, key: string) => (v: string) => setData(prev => ({ ...prev, [section]: { ...prev[section], [key]: v } }));

  if (loading) return <div className="space-y-3">{[...Array(5)].map((_, i) => <div key={i} className="h-12 bg-gray-100 rounded-lg animate-pulse" />)}</div>;

  return (
    <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} className="max-w-2xl">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center"><Home className="h-5 w-5 text-blue-600" /></div>
          <div><h1 className="text-lg font-bold text-gray-900">Home Page</h1><p className="text-xs text-gray-500">Single type · Edit the homepage content</p></div>
        </div>
        <Button size="sm" onClick={handleSave} disabled={saving} className={`gap-2 ${saved ? 'bg-green-600 hover:bg-green-700' : 'bg-blue-600 hover:bg-blue-700'} text-white`}>
          {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : saved ? <CheckCircle2 className="h-3.5 w-3.5" /> : <Save className="h-3.5 w-3.5" />}
          {saving ? 'Saving…' : saved ? 'Saved!' : 'Save'}
        </Button>
      </div>

      <div className="space-y-6">
        {/* Hero Section */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-5 py-3 bg-gray-50 border-b border-gray-200 flex items-center gap-2">
            <span className="text-xs font-bold text-gray-700 uppercase tracking-wider">Hero Section</span>
            <div className="flex-1 h-px bg-gray-200" />
          </div>
          <div className="px-5 py-4 space-y-4">
            <Field label="Badge text" value={data.hero.badge} onChange={set('hero', 'badge')} hint="The pill/badge shown above the headline" />
            <Field label="Headline" value={data.hero.headline} onChange={set('hero', 'headline')} />
            <Field label="Headline gradient part" value={data.hero.headlineGradient} onChange={set('hero', 'headlineGradient')} hint="The part of the headline shown with gradient styling" />
            <Field label="Subheadline" value={data.hero.subheadline} onChange={set('hero', 'subheadline')} rows={2} />
          </div>
        </div>

        {/* Features Section */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-5 py-3 bg-gray-50 border-b border-gray-200 flex items-center gap-2">
            <span className="text-xs font-bold text-gray-700 uppercase tracking-wider">Features Section</span>
            <div className="flex-1 h-px bg-gray-200" />
          </div>
          <div className="px-5 py-4 space-y-4">
            <Field label="Section headline" value={data.features.headline} onChange={set('features', 'headline')} />
            <Field label="Section subheadline" value={data.features.subheadline} onChange={set('features', 'subheadline')} rows={2} />
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-5 py-3 bg-gray-50 border-b border-gray-200 flex items-center gap-2">
            <span className="text-xs font-bold text-gray-700 uppercase tracking-wider">CTA Section</span>
            <div className="flex-1 h-px bg-gray-200" />
          </div>
          <div className="px-5 py-4 space-y-4">
            <Field label="Headline" value={data.cta.headline} onChange={set('cta', 'headline')} />
            <Field label="Body text" value={data.cta.body} onChange={set('cta', 'body')} rows={3} />
            <div className="grid grid-cols-2 gap-3">
              <Field label="Primary button text" value={data.cta.primaryBtn} onChange={set('cta', 'primaryBtn')} />
              <Field label="Secondary button text" value={data.cta.secondaryBtn} onChange={set('cta', 'secondaryBtn')} />
            </div>
          </div>
        </div>

        <p className="flex items-center gap-1.5 text-xs text-gray-400"><Info className="h-3.5 w-3.5" />Changes are saved to the content store and take effect immediately on next page load.</p>
      </div>
    </motion.div>
  );
}
