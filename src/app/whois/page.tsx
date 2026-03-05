'use client';

import { useState, Suspense, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Loader2,
  Shield,
  Calendar,
  RefreshCw,
  Clock,
  Globe,
  Building2,
  Server,
  Info,
  AlertCircle,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface RdapEvent {
  eventAction: string;
  eventDate: string;
}

interface RdapEntity {
  roles: string[];
  vcardArray?: any[];
  publicIds?: { type: string; identifier: string }[];
}

interface RdapNameserver {
  ldhName: string;
}

interface RdapResult {
  ldhName: string;
  status: string[];
  events: RdapEvent[];
  entities: RdapEntity[];
  nameservers: RdapNameserver[];
  handle?: string;
  port43?: string;
}

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString('en-KE', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  } catch {
    return iso;
  }
}

function getStatusColor(status: string): string {
  const s = status.toLowerCase();
  if (s.includes('active') || s.includes('ok')) return 'bg-green-100 text-green-700';
  if (s.includes('prohibited') || s.includes('locked')) return 'bg-blue-100 text-blue-700';
  if (s.includes('expired') || s.includes('delete')) return 'bg-red-100 text-red-700';
  if (s.includes('pending')) return 'bg-amber-100 text-amber-700';
  return 'bg-gray-100 text-gray-600';
}

function getEntityName(entity: RdapEntity): string {
  if (!entity.vcardArray) return 'Unknown';
  try {
    const vcard = entity.vcardArray[1];
    const fnField = vcard?.find((f: any) => f[0] === 'fn');
    return fnField?.[3] || 'Unknown';
  } catch {
    return 'Unknown';
  }
}

function WhoisContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [activeQuery, setActiveQuery] = useState(searchParams.get('q') || '');
  const [result, setResult] = useState<RdapResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);

  const doLookup = async (domain: string) => {
    const clean = domain.toLowerCase().trim();
    if (!clean) return;

    setIsLoading(true);
    setError(null);
    setResult(null);
    setNotFound(false);
    setActiveQuery(clean);
    router.replace(`/whois?q=${encodeURIComponent(clean)}`);

    try {
      const res = await fetch(`https://rdap.org/domain/${clean}`, {
        headers: { Accept: 'application/rdap+json' },
      });

      if (res.status === 404) {
        setNotFound(true);
        return;
      }

      if (!res.ok) {
        throw new Error(`RDAP lookup failed (HTTP ${res.status})`);
      }

      const data: RdapResult = await res.json();
      setResult(data);
    } catch (err) {
      setError((err as Error).message || 'Lookup failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    doLookup(query);
  };

  // Run lookup on mount if query param present
  useEffect(() => {
    const q = searchParams.get('q');
    if (q) doLookup(q);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const registrar = result?.entities?.find(e => e.roles.includes('registrar'));
  const registrant = result?.entities?.find(e => e.roles.includes('registrant'));
  const created = result?.events?.find(e => e.eventAction === 'registration');
  const updated = result?.events?.find(e => e.eventAction === 'last changed');
  const expiry = result?.events?.find(e => e.eventAction === 'expiration');

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 py-12 px-4">
      <div className="max-w-3xl mx-auto">

        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center h-14 w-14 rounded-2xl bg-primary-600 text-white mb-4 shadow-lg">
            <Search className="h-7 w-7" />
          </div>
          <h1 className="text-3xl font-bold text-[#111111] mb-2">WHOIS Lookup</h1>
          <p className="text-gray-500">Find out who owns a domain and when it expires</p>
        </div>

        {/* Search Form */}
        <form onSubmit={handleSubmit} className="flex gap-2 mb-10">
          <Input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Enter a domain, e.g. google.com"
            className="flex-1 h-12 text-base rounded-xl border-gray-200"
            autoFocus
          />
          <Button type="submit" size="lg" className="h-12 px-6 rounded-xl" disabled={isLoading || !query.trim()}>
            {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Search className="h-5 w-5" />}
          </Button>
        </form>

        <AnimatePresence mode="wait">

          {/* Loading */}
          {isLoading && (
            <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="text-center py-16"
            >
              <Loader2 className="h-10 w-10 animate-spin text-primary-600 mx-auto mb-4" />
              <p className="text-gray-500">Looking up <strong>{activeQuery}</strong>…</p>
            </motion.div>
          )}

          {/* Error */}
          {!isLoading && error && (
            <motion.div key="error" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700"
            >
              <AlertCircle className="h-5 w-5 flex-shrink-0" />
              <span>{error}</span>
            </motion.div>
          )}

          {/* Not Found */}
          {!isLoading && notFound && (
            <motion.div key="notfound" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              className="text-center py-16"
            >
              <div className="inline-flex items-center justify-center h-16 w-16 rounded-2xl bg-green-50 mb-4">
                <CheckCircle2 className="h-9 w-9 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-[#111111] mb-2">{activeQuery}</h2>
              <p className="text-green-600 font-semibold text-lg mb-1">Not Registered</p>
              <p className="text-gray-400 text-sm mb-6">This domain doesn&apos;t appear to be registered.</p>
              <Button onClick={() => router.push(`/search?q=${encodeURIComponent(activeQuery)}`)}>
                Check Price &amp; Register
              </Button>
            </motion.div>
          )}

          {/* Result */}
          {!isLoading && result && (
            <motion.div key="result" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              {/* Domain Header */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h2 className="text-2xl font-bold text-[#111111]">{result.ldhName || activeQuery}</h2>
                    {result.handle && (
                      <p className="text-sm text-gray-400 mt-1">Handle: {result.handle}</p>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {result.status?.map(s => (
                      <span key={s} className={cn('text-xs font-medium px-2.5 py-1 rounded-full', getStatusColor(s))}>
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Dates */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                  { label: 'Registered', icon: Calendar, value: created?.eventDate, color: 'text-blue-600', bg: 'bg-blue-50' },
                  { label: 'Last Updated', icon: RefreshCw, value: updated?.eventDate, color: 'text-amber-600', bg: 'bg-amber-50' },
                  { label: 'Expires', icon: Clock, value: expiry?.eventDate, color: 'text-red-600', bg: 'bg-red-50' },
                ].map(({ label, icon: Icon, value, color, bg }) => (
                  <div key={label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                    <div className={cn('inline-flex h-9 w-9 items-center justify-center rounded-xl mb-3', bg)}>
                      <Icon className={cn('h-4 w-4', color)} />
                    </div>
                    <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">{label}</p>
                    <p className="font-semibold text-[#111111] text-sm">
                      {value ? formatDate(value) : '—'}
                    </p>
                  </div>
                ))}
              </div>

              {/* Registrar */}
              {registrar && (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Building2 className="h-5 w-5 text-gray-400" />
                    <h3 className="font-semibold text-[#111111]">Registrar</h3>
                  </div>
                  <p className="text-gray-700">{getEntityName(registrar)}</p>
                  {registrar.publicIds?.find(p => p.type === 'IANA Registrar ID') && (
                    <p className="text-sm text-gray-400 mt-1">
                      IANA ID: {registrar.publicIds.find(p => p.type === 'IANA Registrar ID')?.identifier}
                    </p>
                  )}
                </div>
              )}

              {/* Name Servers */}
              {result.nameservers?.length > 0 && (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Server className="h-5 w-5 text-gray-400" />
                    <h3 className="font-semibold text-[#111111]">Name Servers</h3>
                  </div>
                  <div className="space-y-2">
                    {result.nameservers.map(ns => (
                      <div key={ns.ldhName} className="flex items-center gap-2">
                        <div className="h-1.5 w-1.5 rounded-full bg-primary-600 flex-shrink-0" />
                        <span className="text-gray-700 font-mono text-sm">{ns.ldhName}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* RDAP Source note */}
              <p className="text-center text-xs text-gray-400 flex items-center justify-center gap-1.5 pb-4">
                <Info className="h-3.5 w-3.5" />
                Data sourced from RDAP (Registration Data Access Protocol)
              </p>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  );
}

export default function WhoisPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
      </div>
    }>
      <WhoisContent />
    </Suspense>
  );
}
