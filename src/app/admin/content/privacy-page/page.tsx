'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Shield, Save, Loader2, CheckCircle2, Info, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface PrivacyContent { lastUpdated: string; content: string; }
const DEFAULTS: PrivacyContent = {
  lastUpdated: 'February 15, 2026',
  content: `## Privacy Policy

**Last updated:** February 15, 2026

We are committed to protecting your privacy. This policy explains how we collect, use, and safeguard your personal information.

## Information We Collect
- Account registration details (name, email)
- Domain search queries and registration information
- Payment information (processed securely via payment providers)
- Usage data and analytics

## How We Use Your Information
We use your information to:
- Process domain registrations and renewals
- Send order confirmations and support responses
- Improve our services and user experience
- Send important account notifications

## Data Security
We implement industry-standard security measures to protect your data.

## Contact
For privacy concerns, contact us at privacy@cheapestdomains.co.ke`,
};

export default function PrivacyPageEditor() {
  const [data, setData] = useState<PrivacyContent>(DEFAULTS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch('/api/admin/content?section=privacy').then(r => r.json())
      .then(d => setData({ ...DEFAULTS, ...d }))
      .finally(() => setLoading(false));
  }, []);

  async function handleSave() {
    setSaving(true);
    await fetch('/api/admin/content', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ section: 'privacy', data }) });
    setSaving(false); setSaved(true); setTimeout(() => setSaved(false), 3000);
  }

  if (loading) return <div className="space-y-3"><div className="h-12 bg-gray-100 rounded-lg animate-pulse" /><div className="h-96 bg-gray-100 rounded-xl animate-pulse" /></div>;

  return (
    <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} className="max-w-3xl">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center"><Shield className="h-5 w-5 text-blue-600" /></div>
          <div><h1 className="text-lg font-bold text-gray-900">Privacy Page</h1><p className="text-xs text-gray-500">Single type · Privacy policy content</p></div>
        </div>
        <Button size="sm" onClick={handleSave} disabled={saving} className={`gap-2 ${saved ? 'bg-green-600 hover:bg-green-700' : 'bg-blue-600 hover:bg-blue-700'} text-white`}>
          {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : saved ? <CheckCircle2 className="h-3.5 w-3.5" /> : <Save className="h-3.5 w-3.5" />}
          {saving ? 'Saving…' : saved ? 'Saved!' : 'Save'}
        </Button>
      </div>

      <div className="mb-4 flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-lg px-4 py-3">
        <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
        <p className="text-xs text-amber-700">Privacy policies have legal implications. Ensure content is reviewed by a legal professional before publishing.</p>
      </div>

      <div className="space-y-4">
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-5 py-3 bg-gray-50 border-b border-gray-200">
            <span className="text-xs font-bold text-gray-700 uppercase tracking-wider">Metadata</span>
          </div>
          <div className="px-5 py-4">
            <label className="block text-xs font-semibold text-gray-700 mb-1">Last Updated Date</label>
            <input type="text" placeholder="e.g. February 15, 2026" value={data.lastUpdated}
              onChange={e => setData(prev => ({ ...prev, lastUpdated: e.target.value }))}
              className="w-full max-w-xs px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-5 py-3 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
            <span className="text-xs font-bold text-gray-700 uppercase tracking-wider">Policy Content</span>
            <span className="text-xs text-gray-400">Markdown / HTML supported</span>
          </div>
          <div className="px-5 py-4">
            <textarea
              rows={28}
              value={data.content}
              onChange={e => setData(prev => ({ ...prev, content: e.target.value }))}
              className="w-full px-4 py-3 text-sm font-mono border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y leading-relaxed"
              spellCheck={false}
            />
            <p className="text-xs text-gray-400 mt-2 flex items-center gap-1"><Info className="h-3 w-3" />{data.content.length} characters · Supports Markdown headings, bold, lists and links</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
