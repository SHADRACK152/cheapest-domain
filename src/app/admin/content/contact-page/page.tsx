'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Mail, Save, Loader2, CheckCircle2, Info, Phone, MapPin, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ContactContent {
  title: string; description: string; email: string; phone: string;
  address: string; hours: string; whatsapp?: string; formTitle?: string; formDescription?: string;
}
const DEFAULTS: ContactContent = {
  title: 'Get In Touch', description: "Have a question or need help? We're here for you 24/7.",
  email: 'support@cheapestdomains.co.ke', phone: '+254 700 000 000',
  address: 'Nairobi, Kenya', hours: 'Mon – Sun, 24/7',
  whatsapp: '', formTitle: 'Send us a message', formDescription: "Fill out the form and we'll respond within 1 hour.",
};

function Field({ label, value, onChange, hint, icon: Icon, rows }: { label: string; value: string; onChange: (v: string) => void; hint?: string; icon?: React.ComponentType<{ className?: string }>; rows?: number }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-gray-700 mb-1">{label}</label>
      <div className="relative">
        {Icon && <Icon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />}
        {rows ? (
          <textarea rows={rows} value={value} onChange={e => onChange(e.target.value)}
            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
        ) : (
          <input type="text" value={value} onChange={e => onChange(e.target.value)}
            className={`w-full ${Icon ? 'pl-9' : 'px-3'} pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500`} />
        )}
      </div>
      {hint && <p className="text-xs text-gray-400 mt-1">{hint}</p>}
    </div>
  );
}

export default function ContactPageEditor() {
  const [data, setData] = useState<ContactContent>(DEFAULTS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch('/api/admin/content?section=contact').then(r => r.json())
      .then(d => setData({ ...DEFAULTS, ...d }))
      .finally(() => setLoading(false));
  }, []);

  async function handleSave() {
    setSaving(true);
    await fetch('/api/admin/content', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ section: 'contact', data }) });
    setSaving(false); setSaved(true); setTimeout(() => setSaved(false), 3000);
  }

  const set = (key: keyof ContactContent) => (v: string) => setData(prev => ({ ...prev, [key]: v }));

  if (loading) return <div className="space-y-3">{[...Array(6)].map((_, i) => <div key={i} className="h-12 bg-gray-100 rounded-lg animate-pulse" />)}</div>;

  return (
    <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} className="max-w-2xl">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-green-50 flex items-center justify-center"><Mail className="h-5 w-5 text-green-600" /></div>
          <div><h1 className="text-lg font-bold text-gray-900">Contact Page</h1><p className="text-xs text-gray-500">Single type · Edit contact information and labels</p></div>
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
            <Field label="Page Title" value={data.title} onChange={set('title')} />
            <Field label="Description" value={data.description} onChange={set('description')} rows={2} />
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-5 py-3 bg-gray-50 border-b border-gray-200">
            <span className="text-xs font-bold text-gray-700 uppercase tracking-wider">Contact Information</span>
          </div>
          <div className="px-5 py-4 space-y-4">
            <Field label="Email address" value={data.email} onChange={set('email')} icon={Mail} />
            <Field label="Phone number" value={data.phone} onChange={set('phone')} icon={Phone} />
            <Field label="WhatsApp number" value={data.whatsapp ?? ''} onChange={set('whatsapp')} hint="Include country code, e.g. +254712345678" />
            <Field label="Office address" value={data.address} onChange={set('address')} icon={MapPin} />
            <Field label="Support hours" value={data.hours} onChange={set('hours')} icon={Clock} hint="e.g. Mon – Sun, 24/7" />
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-5 py-3 bg-gray-50 border-b border-gray-200">
            <span className="text-xs font-bold text-gray-700 uppercase tracking-wider">Contact Form</span>
          </div>
          <div className="px-5 py-4 space-y-4">
            <Field label="Form title" value={data.formTitle ?? ''} onChange={set('formTitle')} />
            <Field label="Form description" value={data.formDescription ?? ''} onChange={set('formDescription')} rows={2} />
          </div>
        </div>

        <p className="flex items-center gap-1.5 text-xs text-gray-400"><Info className="h-3.5 w-3.5" />Changes are saved to the content store.</p>
      </div>
    </motion.div>
  );
}
