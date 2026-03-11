'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  Globe,
  Key,
  Mail,
  DollarSign,
  Search,
  Save,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Eye,
  EyeOff,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

// ── Types ──────────────────────────────────────────────────────────────────────

interface SiteSettings {
  site: {
    name: string;
    tagline: string;
    contactEmail: string;
    logoUrl: string;
    faviconUrl: string;
    maintenanceMode: boolean;
  };
  api: {
    whmcsUrl: string;
    whmcsApiIdentifier: string;
    whmcsApiSecret: string;
    truehostApiKey: string;
    resellerApiUrl: string;
  };
  email: {
    smtpHost: string;
    smtpPort: number;
    smtpUser: string;
    smtpPassword: string;
    fromName: string;
    fromAddress: string;
  };
  currency: {
    default: string;
    kesRate: number;
    showMultipleCurrencies: boolean;
  };
  seo: {
    metaTitleTemplate: string;
    defaultMetaDescription: string;
    googleAnalyticsId: string;
    googleSearchConsoleId: string;
  };
}

const defaultSettings: SiteSettings = {
  site: { name: '', tagline: '', contactEmail: '', logoUrl: '', faviconUrl: '', maintenanceMode: false },
  api: { whmcsUrl: '', whmcsApiIdentifier: '', whmcsApiSecret: '', truehostApiKey: '', resellerApiUrl: '' },
  email: { smtpHost: '', smtpPort: 587, smtpUser: '', smtpPassword: '', fromName: '', fromAddress: '' },
  currency: { default: 'USD', kesRate: 130, showMultipleCurrencies: true },
  seo: { metaTitleTemplate: '', defaultMetaDescription: '', googleAnalyticsId: '', googleSearchConsoleId: '' },
};

// ── Helpers ────────────────────────────────────────────────────────────────────

type Section = keyof SiteSettings;

const SECTIONS: { id: Section; label: string; icon: React.ElementType }[] = [
  { id: 'site',     label: 'Site',     icon: Globe       },
  { id: 'api',      label: 'API Keys', icon: Key         },
  { id: 'email',    label: 'Email',    icon: Mail        },
  { id: 'currency', label: 'Currency', icon: DollarSign  },
  { id: 'seo',      label: 'SEO',      icon: Search      },
];

function Field({
  label,
  description,
  children,
}: {
  label: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 py-4 border-b border-gray-100 last:border-0">
      <div>
        <label className="block text-sm font-medium text-gray-700">{label}</label>
        {description && <p className="text-xs text-gray-400 mt-0.5">{description}</p>}
      </div>
      <div className="md:col-span-2">{children}</div>
    </div>
  );
}

function Input({ className, ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={cn(
        'w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white',
        className,
      )}
    />
  );
}

function SecretInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  const [show, setShow] = useState(false);
  return (
    <div className="relative">
      <Input {...props} type={show ? 'text' : 'password'} className="pr-10" />
      <button
        type="button"
        onClick={() => setShow((v) => !v)}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
      >
        {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
      </button>
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────────

export default function SettingsPage() {
  const [settings, setSettings] = useState<SiteSettings>(defaultSettings);
  const [activeSection, setActiveSection] = useState<Section>('site');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');

  // Load settings
  useEffect(() => {
    async function load() {
      try {
        const res = await fetch('/api/admin/settings');
        const data = await res.json();
        if (data.success) {
          setSettings({ ...defaultSettings, ...data.settings });
        }
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, []);

  // Generic updater: set(section, field, value)
  const set = useCallback(
    <S extends Section, F extends keyof SiteSettings[S]>(
      section: S,
      field: F,
      value: SiteSettings[S][F],
    ) => {
      setSettings((prev) => ({
        ...prev,
        [section]: { ...prev[section], [field]: value },
      }));
    },
    [],
  );

  async function handleSave() {
    setIsSaving(true);
    setSaveStatus('idle');
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ [activeSection]: settings[activeSection] }),
      });
      const data = await res.json();
      if (data.success) {
        setSaveStatus('success');
        setTimeout(() => setSaveStatus('idle'), 3000);
      } else {
        setSaveStatus('error');
      }
    } catch {
      setSaveStatus('error');
    } finally {
      setIsSaving(false);
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  const s = settings[activeSection];

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-sm text-gray-500 mt-1">Manage site configuration, API keys, email, currency, and SEO defaults.</p>
      </div>

      <div className="flex gap-6">
        {/* Sidebar Tabs */}
        <nav className="w-44 shrink-0">
          <ul className="space-y-1">
            {SECTIONS.map(({ id, label, icon: Icon }) => (
              <li key={id}>
                <button
                  onClick={() => setActiveSection(id)}
                  className={cn(
                    'w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                    activeSection === id
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900',
                  )}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  {label}
                </button>
              </li>
            ))}
          </ul>
        </nav>

        {/* Panel */}
        <motion.div
          key={activeSection}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex-1 bg-white rounded-xl border border-gray-200 shadow-sm"
        >
          <div className="px-6 py-5 border-b border-gray-100">
            <h2 className="font-semibold text-gray-900 capitalize">
              {SECTIONS.find((s) => s.id === activeSection)?.label} Settings
            </h2>
          </div>

          <div className="px-6 py-2">
            {/* ── SITE ─────────────────────────────────── */}
            {activeSection === 'site' && (
              <>
                <Field label="Site Name" description="Displayed in the browser tab and header.">
                  <Input
                    value={(s as SiteSettings['site']).name}
                    onChange={(e) => set('site', 'name', e.target.value)}
                    placeholder="CheapestDomain"
                  />
                </Field>
                <Field label="Tagline">
                  <Input
                    value={(s as SiteSettings['site']).tagline}
                    onChange={(e) => set('site', 'tagline', e.target.value)}
                    placeholder="Find the Cheapest Domains Worldwide"
                  />
                </Field>
                <Field label="Contact Email">
                  <Input
                    type="email"
                    value={(s as SiteSettings['site']).contactEmail}
                    onChange={(e) => set('site', 'contactEmail', e.target.value)}
                    placeholder="support@cheapestdomain.com"
                  />
                </Field>
                <Field label="Logo URL" description="Leave blank to use the default text logo.">
                  <Input
                    value={(s as SiteSettings['site']).logoUrl}
                    onChange={(e) => set('site', 'logoUrl', e.target.value)}
                    placeholder="https://..."
                  />
                </Field>
                <Field label="Favicon URL">
                  <Input
                    value={(s as SiteSettings['site']).faviconUrl}
                    onChange={(e) => set('site', 'faviconUrl', e.target.value)}
                    placeholder="https://..."
                  />
                </Field>
                <Field label="Maintenance Mode" description="Disables the public site for visitors.">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={(s as SiteSettings['site']).maintenanceMode}
                      onChange={(e) => set('site', 'maintenanceMode', e.target.checked)}
                      className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-600">Enable maintenance mode</span>
                  </label>
                </Field>
              </>
            )}

            {/* ── API ─────────────────────────────────── */}
            {activeSection === 'api' && (
              <>
                <Field label="WHMCS URL" description="Base URL of your WHMCS installation.">
                  <Input
                    value={(s as SiteSettings['api']).whmcsUrl}
                    onChange={(e) => set('api', 'whmcsUrl', e.target.value)}
                    placeholder="https://billing.example.com"
                  />
                </Field>
                <Field label="WHMCS API Identifier">
                  <SecretInput
                    value={(s as SiteSettings['api']).whmcsApiIdentifier}
                    onChange={(e) => set('api', 'whmcsApiIdentifier', e.target.value)}
                    placeholder="API identifier"
                  />
                </Field>
                <Field label="WHMCS API Secret">
                  <SecretInput
                    value={(s as SiteSettings['api']).whmcsApiSecret}
                    onChange={(e) => set('api', 'whmcsApiSecret', e.target.value)}
                    placeholder="API secret"
                  />
                </Field>
                <Field label="TrueHost API Key">
                  <SecretInput
                    value={(s as SiteSettings['api']).truehostApiKey}
                    onChange={(e) => set('api', 'truehostApiKey', e.target.value)}
                    placeholder="Reseller API key"
                  />
                </Field>
                <Field label="Reseller API URL" description="Override the default TrueHost reseller endpoint.">
                  <Input
                    value={(s as SiteSettings['api']).resellerApiUrl}
                    onChange={(e) => set('api', 'resellerApiUrl', e.target.value)}
                    placeholder="https://..."
                  />
                </Field>
              </>
            )}

            {/* ── EMAIL ─────────────────────────────────── */}
            {activeSection === 'email' && (
              <>
                <Field label="SMTP Host">
                  <Input
                    value={(s as SiteSettings['email']).smtpHost}
                    onChange={(e) => set('email', 'smtpHost', e.target.value)}
                    placeholder="smtp.mailgun.org"
                  />
                </Field>
                <Field label="SMTP Port">
                  <Input
                    type="number"
                    value={(s as SiteSettings['email']).smtpPort}
                    onChange={(e) => set('email', 'smtpPort', Number(e.target.value))}
                    placeholder="587"
                  />
                </Field>
                <Field label="SMTP Username">
                  <Input
                    value={(s as SiteSettings['email']).smtpUser}
                    onChange={(e) => set('email', 'smtpUser', e.target.value)}
                  />
                </Field>
                <Field label="SMTP Password">
                  <SecretInput
                    value={(s as SiteSettings['email']).smtpPassword}
                    onChange={(e) => set('email', 'smtpPassword', e.target.value)}
                  />
                </Field>
                <Field label="From Name">
                  <Input
                    value={(s as SiteSettings['email']).fromName}
                    onChange={(e) => set('email', 'fromName', e.target.value)}
                    placeholder="CheapestDomain"
                  />
                </Field>
                <Field label="From Address">
                  <Input
                    type="email"
                    value={(s as SiteSettings['email']).fromAddress}
                    onChange={(e) => set('email', 'fromAddress', e.target.value)}
                    placeholder="noreply@cheapestdomain.com"
                  />
                </Field>
              </>
            )}

            {/* ── CURRENCY ─────────────────────────────────── */}
            {activeSection === 'currency' && (
              <>
                <Field label="Default Currency">
                  <select
                    value={(s as SiteSettings['currency']).default}
                    onChange={(e) => set('currency', 'default', e.target.value)}
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  >
                    <option value="USD">USD – US Dollar</option>
                    <option value="KES">KES – Kenyan Shilling</option>
                    <option value="EUR">EUR – Euro</option>
                    <option value="GBP">GBP – British Pound</option>
                    <option value="NGN">NGN – Nigerian Naira</option>
                    <option value="ZAR">ZAR – South African Rand</option>
                  </select>
                </Field>
                <Field label="KES / USD Rate" description="1 USD = ? KES">
                  <Input
                    type="number"
                    value={(s as SiteSettings['currency']).kesRate}
                    onChange={(e) => set('currency', 'kesRate', Number(e.target.value))}
                    placeholder="130"
                  />
                </Field>
                <Field label="Show Multiple Currencies" description="Let visitors switch between USD and KES.">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={(s as SiteSettings['currency']).showMultipleCurrencies}
                      onChange={(e) => set('currency', 'showMultipleCurrencies', e.target.checked)}
                      className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-600">Enable currency switcher</span>
                  </label>
                </Field>
              </>
            )}

            {/* ── SEO ─────────────────────────────────── */}
            {activeSection === 'seo' && (
              <>
                <Field label="Title Template" description="Use %s for the page title.">
                  <Input
                    value={(s as SiteSettings['seo']).metaTitleTemplate}
                    onChange={(e) => set('seo', 'metaTitleTemplate', e.target.value)}
                    placeholder="%s | CheapestDomain"
                  />
                </Field>
                <Field label="Default Meta Description">
                  <textarea
                    value={(s as SiteSettings['seo']).defaultMetaDescription}
                    onChange={(e) => set('seo', 'defaultMetaDescription', e.target.value)}
                    rows={3}
                    placeholder="Find and compare the cheapest domain registrations worldwide."
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white resize-none"
                  />
                </Field>
                <Field label="Google Analytics ID" description="G-XXXXXXXXXX measurement ID.">
                  <Input
                    value={(s as SiteSettings['seo']).googleAnalyticsId}
                    onChange={(e) => set('seo', 'googleAnalyticsId', e.target.value)}
                    placeholder="G-XXXXXXXXXX"
                  />
                </Field>
                <Field label="Google Search Console" description="Verification meta tag content only.">
                  <Input
                    value={(s as SiteSettings['seo']).googleSearchConsoleId}
                    onChange={(e) => set('seo', 'googleSearchConsoleId', e.target.value)}
                    placeholder="verification token"
                  />
                </Field>
              </>
            )}
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm">
              {saveStatus === 'success' && (
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex items-center gap-1.5 text-green-600"
                >
                  <CheckCircle2 className="h-4 w-4" /> Saved successfully
                </motion.span>
              )}
              {saveStatus === 'error' && (
                <span className="flex items-center gap-1.5 text-red-600">
                  <AlertCircle className="h-4 w-4" /> Failed to save
                </span>
              )}
            </div>
            <Button onClick={handleSave} disabled={isSaving} size="sm" className="gap-2">
              {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              Save Changes
            </Button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
