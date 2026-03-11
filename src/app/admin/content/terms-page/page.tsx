'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Lock, Save, Loader2, CheckCircle2, Info, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface TermsContent { lastUpdated: string; content: string; }
const DEFAULTS: TermsContent = {
  lastUpdated: 'February 15, 2026',
  content: `## Terms of Service

**Last updated:** February 15, 2026

By using CheapestDomains, you agree to these terms. Please read them carefully.

## 1. Acceptance of Terms
By accessing our services, you accept these Terms of Service in full. If you disagree, discontinue use immediately.

## 2. Domain Registration
- Domain registrations are subject to availability and registry rules
- You are responsible for providing accurate registration information
- Domain names, once registered, may not be refunded unless specifically offered

## 3. Payment Terms
- All payments are processed in KES (Kenyan Shillings) by default
- Prices shown are inclusive of all applicable fees unless stated otherwise
- Renewal prices may differ from initial registration prices

## 4. Prohibited Uses
You may not use our service to:
- Register domains for spam or malicious purposes
- Violate any applicable laws or regulations
- Infringe on intellectual property rights

## 5. Limitation of Liability
CheapestDomains shall not be liable for any indirect, incidental or consequential damages.

## 6. Contact
For questions about these terms, contact legal@cheapestdomains.co.ke`,
};

export default function TermsPageEditor() {
  const [data, setData] = useState<TermsContent>(DEFAULTS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch('/api/admin/content?section=terms').then(r => r.json())
      .then(d => setData({ ...DEFAULTS, ...d }))
      .finally(() => setLoading(false));
  }, []);

  async function handleSave() {
    setSaving(true);
    await fetch('/api/admin/content', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ section: 'terms', data }) });
    setSaving(false); setSaved(true); setTimeout(() => setSaved(false), 3000);
  }

  if (loading) return <div className="space-y-3"><div className="h-12 bg-gray-100 rounded-lg animate-pulse" /><div className="h-96 bg-gray-100 rounded-xl animate-pulse" /></div>;

  return (
    <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} className="max-w-3xl">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-gray-100 flex items-center justify-center"><Lock className="h-5 w-5 text-gray-600" /></div>
          <div><h1 className="text-lg font-bold text-gray-900">Terms Page</h1><p className="text-xs text-gray-500">Single type · Terms of service content</p></div>
        </div>
        <Button size="sm" onClick={handleSave} disabled={saving} className={`gap-2 ${saved ? 'bg-green-600 hover:bg-green-700' : 'bg-blue-600 hover:bg-blue-700'} text-white`}>
          {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : saved ? <CheckCircle2 className="h-3.5 w-3.5" /> : <Save className="h-3.5 w-3.5" />}
          {saving ? 'Saving…' : saved ? 'Saved!' : 'Save'}
        </Button>
      </div>

      <div className="mb-4 flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-lg px-4 py-3">
        <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
        <p className="text-xs text-amber-700">Terms of service have legal implications. Have content reviewed by a legal professional before publishing.</p>
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
            <span className="text-xs font-bold text-gray-700 uppercase tracking-wider">Terms Content</span>
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
