'use client';

import { useState, Suspense, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, Loader2, Calendar, RefreshCw, Clock,
  Building2, Server, Info, AlertCircle, CheckCircle2,
  User, Shield, Globe, FileText,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

interface RdapEvent  { eventAction: string; eventDate: string; }
interface RdapPublicId { type: string; identifier: string; }
interface RdapNameserver { ldhName: string; unicodeName?: string; }
interface RdapSecureDns { delegationSigned?: boolean; dsData?: any[]; keyData?: any[]; }
interface RdapEntity {
  roles: string[];
  vcardArray?: any[];
  publicIds?: RdapPublicId[];
  handle?: string;
  entities?: RdapEntity[];
}
interface RdapResult {
  ldhName: string;
  unicodeName?: string;
  status: string[];
  events: RdapEvent[];
  entities: RdapEntity[];
  nameservers: RdapNameserver[];
  secureDNS?: RdapSecureDns;
  handle?: string;
  port43?: string;
  remarks?: { title: string; description: string[] }[];
}

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString('en-KE', {
      year: 'numeric', month: 'long', day: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
  } catch { return iso; }
}

function getStatusColor(status: string) {
  const s = status.toLowerCase();
  if (s.includes('active') || s === 'ok') return 'bg-green-100 text-green-700 border-green-200';
  if (s.includes('prohibited') || s.includes('locked')) return 'bg-blue-100 text-blue-700 border-blue-200';
  if (s.includes('expired') || s.includes('delete')) return 'bg-red-100 text-red-700 border-red-200';
  if (s.includes('pending')) return 'bg-amber-100 text-amber-700 border-amber-200';
  return 'bg-gray-100 text-gray-600 border-gray-200';
}

function daysUntil(iso: string): number | null {
  try {
    return Math.ceil((new Date(iso).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
  } catch { return null; }
}

function parseVcard(entity: RdapEntity): Record<string, string> {
  const out: Record<string, string> = {};
  if (!entity.vcardArray) return out;
  try {
    for (const field of (entity.vcardArray[1] ?? [])) {
      const [name, , , value] = field;
      if (!name || value == null) continue;
      if (name === 'fn')    out.name       = String(value);
      if (name === 'org')   out.org        = Array.isArray(value) ? value.filter(Boolean).join(', ') : String(value);
      if (name === 'email') out.email      = String(value);
      if (name === 'tel')   out.phone      = String(value);
      if (name === 'url')   out.url        = String(value);
      if (name === 'adr') {
        // vCard adr: [poBox, extAddr, street, city, state, postalCode, country]
        const parts = Array.isArray(value) ? value : [];
        if (parts[2]) out.street     = String(parts[2]);
        if (parts[3]) out.city       = String(parts[3]);
        if (parts[4]) out.state      = String(parts[4]);
        if (parts[5]) out.postalCode = String(parts[5]);
        if (parts[6]) out.country    = String(parts[6]);
      }
    }
  } catch { /* ignore */ }
  return out;
}

function getIanaId(e: RdapEntity) {
  return e.publicIds?.find(p => p.type === 'IANA Registrar ID')?.identifier ?? null;
}

function Section({ icon: Icon, title, children }: { icon: React.ElementType; title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
      <div className="flex items-center gap-2 mb-4">
        <Icon className="h-5 w-5 text-gray-400" />
        <h3 className="font-semibold text-[#111111]">{title}</h3>
      </div>
      {children}
    </div>
  );
}

function Row({ label, value }: { label: string; value?: React.ReactNode }) {
  if (!value) return null;
  return (
    <div className="flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-4 py-2 border-b border-gray-50 last:border-0">
      <span className="text-xs text-gray-400 uppercase tracking-wide sm:w-40 flex-shrink-0 pt-0.5">{label}</span>
      <span className="text-sm text-gray-800 break-all">{value}</span>
    </div>
  );
}

function ContactCard({ entity }: { entity: RdapEntity }) {
  const v = parseVcard(entity);
  const ianaId = getIanaId(entity);
  const abuse = entity.entities?.find(e => e.roles.includes('abuse'));
  const av = abuse ? parseVcard(abuse) : null;
  const abuseVcard = abuse;
  const abuseIanaId = abuseVcard ? getIanaId(abuseVcard) : null;
  const roleLabel = entity.roles.map(r => r.charAt(0).toUpperCase() + r.slice(1)).join(' / ');
  return (
    <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
      <p className="text-xs font-semibold text-primary-600 uppercase tracking-wider mb-3">{roleLabel}</p>
      <Row label="Name"         value={v.name} />
      <Row label="Organization" value={v.org} />
      <Row label="Handle"       value={entity.handle} />
      <Row label="IANA ID"      value={ianaId ?? undefined} />
      <Row label="Email"        value={v.email ? <a href={`mailto:${v.email}`} className="text-primary-600 hover:underline">{v.email}</a> : undefined} />
      <Row label="Phone"        value={v.phone} />
      <Row label="Street"       value={v.street} />
      <Row label="City"         value={v.city} />
      <Row label="State"        value={v.state} />
      <Row label="Postal Code"  value={v.postalCode} />
      <Row label="Country"      value={v.country} />
      <Row label="URL"          value={v.url ? <a href={v.url} target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:underline">{v.url}</a> : undefined} />
      {av?.email && <Row label="Abuse Email" value={<a href={`mailto:${av.email}`} className="text-red-600 hover:underline">{av.email}</a>} />}
      {av?.phone && <Row label="Abuse Phone" value={av.phone} />}
    </div>
  );
}

function WhoisContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [query, setQuery]           = useState(searchParams.get('q') || '');
  const [activeQuery, setActiveQuery] = useState(searchParams.get('q') || '');
  const [result, setResult]         = useState<RdapResult | null>(null);
  const [isLoading, setIsLoading]   = useState(false);
  const [error, setError]           = useState<string | null>(null);
  const [notFound, setNotFound]     = useState(false);
  const [lastFetched, setLastFetched] = useState<Date | null>(null);

  const doLookup = async (domain: string) => {
    const clean = domain.toLowerCase().trim();
    if (!clean) return;
    setIsLoading(true); setError(null); setResult(null); setNotFound(false);
    setActiveQuery(clean);
    router.replace(`/whois?q=${encodeURIComponent(clean)}`);
    try {
      const res = await fetch(`https://rdap.org/domain/${clean}`, { headers: { Accept: 'application/rdap+json' } });
      if (res.status === 404) { setNotFound(true); return; }
      if (!res.ok) throw new Error(`RDAP lookup failed (HTTP ${res.status})`);
      setResult(await res.json());
      setLastFetched(new Date());
    } catch (err) {
      setError((err as Error).message || 'Lookup failed. Please try again.');
    } finally { setIsLoading(false); }
  };

  useEffect(() => {
    const q = searchParams.get('q');
    if (q) doLookup(q);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const allEntities  = result?.entities ?? [];
  const registrar    = allEntities.find(e => e.roles.includes('registrar'));
  const registrant   = allEntities.find(e => e.roles.includes('registrant'));
  const admin        = allEntities.find(e => e.roles.includes('administrative'));
  const tech         = allEntities.find(e => e.roles.includes('technical'));
  const reseller     = allEntities.find(e => e.roles.includes('reseller'));
  const contacts     = [registrar, registrant, admin, tech, reseller].filter(Boolean) as RdapEntity[];

  const eventMap: Record<string, string> = {};
  result?.events?.forEach(ev => { eventMap[ev.eventAction] = ev.eventDate; });
  const allEvents = result?.events ? [...result.events].sort((a, b) => new Date(a.eventDate).getTime() - new Date(b.eventDate).getTime()) : [];

  const daysLeft = eventMap['expiration'] ? daysUntil(eventMap['expiration']) : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 py-12 px-4">
      <div className="max-w-3xl mx-auto">

        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center h-14 w-14 rounded-2xl bg-primary-600 text-white mb-4 shadow-lg">
            <Search className="h-7 w-7" />
          </div>
          <h1 className="text-3xl font-bold text-[#111111] mb-2">WHOIS Lookup</h1>
          <p className="text-gray-500">Find out who owns a domain and when it expires</p>
        </div>

        <form onSubmit={e => { e.preventDefault(); doLookup(query); }} className="flex gap-2 mb-10">
          <Input value={query} onChange={e => setQuery(e.target.value)}
            placeholder="e.g. google.com or trovalabs.com"
            className="flex-1 h-12 text-base rounded-xl border-gray-200" autoFocus />
          <Button type="submit" size="lg" className="h-12 px-6 rounded-xl" disabled={isLoading || !query.trim()}>
            {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Search className="h-5 w-5" />}
          </Button>
        </form>

        <AnimatePresence mode="wait">

          {isLoading && (
            <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-center py-16">
              <Loader2 className="h-10 w-10 animate-spin text-primary-600 mx-auto mb-4" />
              <p className="text-gray-500">Looking up <strong>{activeQuery}</strong>...</p>
            </motion.div>
          )}

          {!isLoading && error && (
            <motion.div key="error" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700">
              <AlertCircle className="h-5 w-5 flex-shrink-0" /><span>{error}</span>
            </motion.div>
          )}

          {!isLoading && notFound && (
            <motion.div key="notfound" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-center py-16">
              <div className="inline-flex items-center justify-center h-16 w-16 rounded-2xl bg-green-50 mb-4">
                <CheckCircle2 className="h-9 w-9 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-[#111111] mb-2">{activeQuery}</h2>
              <p className="text-green-600 font-semibold text-lg mb-1">Not Registered</p>
              <p className="text-gray-400 text-sm mb-6">This domain does not appear to be registered - it may be available!</p>
              <Button onClick={() => router.push(`/search?q=${encodeURIComponent(activeQuery)}`)}>Check Price &amp; Register</Button>
            </motion.div>
          )}

          {!isLoading && result && (
            <motion.div key="result" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">

              {/* Domain header */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div>
                    <h2 className="text-2xl font-bold text-[#111111]">{result.unicodeName || result.ldhName || activeQuery}</h2>
                    {result.handle && <p className="text-xs text-gray-400 mt-1 font-mono">{result.handle}</p>}
                    {result.port43 && <p className="text-xs text-gray-400 mt-0.5">WHOIS: {result.port43}</p>}
                    {lastFetched && (
                      <p className="text-xs text-gray-400 mt-1">
                        Last checked: {lastFetched.toLocaleTimeString('en-KE', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                      </p>
                    )}
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="gap-1.5 text-xs h-8"
                      disabled={isLoading}
                      onClick={() => doLookup(activeQuery)}
                    >
                      <RefreshCw className={cn('h-3.5 w-3.5', isLoading && 'animate-spin')} />
                      Refresh
                    </Button>
                    <div className="flex flex-wrap justify-end gap-2">
                      {result.status?.map(s => (
                        <span key={s} className={cn('text-xs font-medium px-2.5 py-1 rounded-full border', getStatusColor(s))}>{s}</span>
                      ))}
                    </div>
                  </div>
                </div>
                {daysLeft !== null && daysLeft <= 60 && (
                  <div className={cn('mt-4 flex items-center gap-2 text-sm rounded-xl px-4 py-3',
                    daysLeft <= 14 ? 'bg-red-50 text-red-700' : 'bg-amber-50 text-amber-700')}>
                    <AlertCircle className="h-4 w-4 flex-shrink-0" />
                    {daysLeft <= 0 ? 'This domain has expired!' : `Expires in ${daysLeft} day${daysLeft === 1 ? '' : 's'}`}
                  </div>
                )}
              </div>

              {/* Dates */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {([
                  { label: 'Registered',   icon: Calendar,  key: 'registration', color: 'text-blue-600',  bg: 'bg-blue-50'  },
                  { label: 'Last Updated', icon: RefreshCw, key: 'last changed',  color: 'text-amber-600', bg: 'bg-amber-50' },
                  { label: 'Expires',      icon: Clock,     key: 'expiration',    color: 'text-red-600',   bg: 'bg-red-50'   },
                ] as const).map(({ label, icon: Icon, key, color, bg }) => (
                  <div key={label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                    <div className={cn('inline-flex h-9 w-9 items-center justify-center rounded-xl mb-3', bg)}>
                      <Icon className={cn('h-4 w-4', color)} />
                    </div>
                    <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">{label}</p>
                    <p className="font-semibold text-[#111111] text-sm">{eventMap[key] ? formatDate(eventMap[key]) : '-'}</p>
                  </div>
                ))}
              </div>

              {/* Contacts */}
              {contacts.length > 0 && (
                <Section icon={User} title="Contacts">
                  <div className="space-y-3">
                    {contacts.map((e, i) => <ContactCard key={i} entity={e} />)}
                  </div>
                </Section>
              )}

              {/* Name Servers */}
              {result.nameservers?.length > 0 && (
                <Section icon={Server} title="Name Servers">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {result.nameservers.map(ns => (
                      <div key={ns.ldhName} className="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2">
                        <div className="h-1.5 w-1.5 rounded-full bg-primary-600 flex-shrink-0" />
                        <span className="text-gray-700 font-mono text-sm truncate">{ns.unicodeName || ns.ldhName}</span>
                      </div>
                    ))}
                  </div>
                </Section>
              )}

              {/* DNSSEC */}
              {result.secureDNS && (
                <Section icon={Shield} title="DNSSEC">
                  <Row label="Delegation Signed"
                    value={<span className={result.secureDNS.delegationSigned ? 'text-green-600 font-medium' : 'text-gray-500'}>
                      {result.secureDNS.delegationSigned ? 'Yes - Signed' : 'No - Not signed'}
                    </span>}
                  />
                  {result.secureDNS.dsData?.map((ds: any, i: number) => (
                    <Row key={i} label={`DS Record ${i + 1}`}
                      value={<span className="font-mono text-xs">{ds.keytag} {ds.algorithm} {ds.digestType} {String(ds.digest ?? '').slice(0, 24)}...</span>}
                    />
                  ))}
                </Section>
              )}

              {/* Full Event History */}
              {allEvents.length > 3 && (
                <Section icon={FileText} title="Full Event History">
                  {allEvents.map((ev, i) => (
                    <div key={i} className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 py-2 border-b border-gray-50 last:border-0">
                      <span className="text-xs text-gray-400 uppercase tracking-wide sm:w-44 flex-shrink-0">{ev.eventAction}</span>
                      <span className="text-sm text-gray-700">{formatDate(ev.eventDate)}</span>
                    </div>
                  ))}
                </Section>
              )}

              {/* Remarks */}
              {result.remarks && result.remarks.length > 0 && (
                <Section icon={Info} title="Remarks">
                  {result.remarks.map((r, i) => (
                    <div key={i} className="mb-3 last:mb-0">
                      {r.title && <p className="text-sm font-semibold text-gray-700 mb-1">{r.title}</p>}
                      {r.description?.map((d, j) => <p key={j} className="text-sm text-gray-500">{d}</p>)}
                    </div>
                  ))}
                </Section>
              )}

              <p className="text-center text-xs text-gray-400 flex items-center justify-center gap-1.5 pb-4">
                <Info className="h-3.5 w-3.5" />
                Data sourced from RDAP - some fields may be redacted for privacy (GDPR/RDDS)
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
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary-600" /></div>}>
      <WhoisContent />
    </Suspense>
  );
}
