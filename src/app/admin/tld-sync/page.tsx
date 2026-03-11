'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { RefreshCw, Globe, CheckCircle2, AlertCircle, Clock, Database, TrendingUp, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface SyncStats {
  total: number;
  withPrices: number;
  withTruehost: number;
  lastSync: string | null;
}

interface SyncLog {
  time: string;
  message: string;
  type: 'info' | 'success' | 'error';
}

export default function AdminTldSyncPage() {
  const [stats, setStats] = useState<SyncStats>({ total: 0, withPrices: 0, withTruehost: 0, lastSync: null });
  const [logs, setLogs] = useState<SyncLog[]>([]);
  const [syncing, setSyncing] = useState(false);
  const [loadingStats, setLoadingStats] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  async function fetchStats() {
    try {
      const res = await fetch('/api/pricing?action=stats');
      if (!res.ok) throw new Error();
      const data = await res.json();
      setStats({
        total:        data.total        ?? 0,
        withPrices:   data.withPrices   ?? 0,
        withTruehost: data.withTruehost ?? 0,
        lastSync:     data.lastSync     ?? null,
      });
    } catch {
      // Fall back to reading manifest via public stats endpoint
      try {
        const res2 = await fetch('/api/stats');
        if (res2.ok) {
          const d = await res2.json();
          setStats(s => ({ ...s, total: d.domains?.types ?? 1348 }));
        }
      } catch { /* silent */ }
    } finally {
      setLoadingStats(false);
    }
  }

  async function handleSync() {
    if (syncing) return;
    setSyncing(true);
    setLogs([]);

    const addLog = (message: string, type: SyncLog['type'] = 'info') =>
      setLogs(prev => [{ time: new Date().toLocaleTimeString(), message, type }, ...prev]);

    addLog('Starting TLD price sync from TrueHost API…');
    try {
      const res = await fetch('/api/pricing?action=sync', { method: 'POST' });
      const data = await res.json();

      if (!res.ok) {
        addLog(`Sync failed: ${data.error ?? res.statusText}`, 'error');
        return;
      }

      addLog(`Fetched ${data.fetched ?? '—'} TLDs from TrueHost`, 'success');
      addLog(`Updated ${data.updated ?? '—'} price entries`, 'success');
      if (data.errors?.length) {
        addLog(`${data.errors.length} TLDs had errors`, 'error');
      }
      addLog('Sync complete.', 'success');
      await fetchStats();
    } catch {
      addLog('Network error. Check API credentials in .env.local.', 'error');
    } finally {
      setSyncing(false);
    }
  }

  const coverage = stats.total > 0 ? Math.round((stats.withTruehost / stats.total) * 100) : 0;

  return (
    <div>
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center">
              <RefreshCw className="h-5 w-5 text-emerald-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">TLD-Sync</h1>
              <p className="text-sm text-gray-500 mt-0.5">Sync live domain pricing from TrueHost WHMCS API</p>
            </div>
          </div>
          <Button
            className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white"
            onClick={handleSync}
            disabled={syncing}
          >
            <Zap className={cn('h-4 w-4', syncing && 'animate-pulse')} />
            {syncing ? 'Syncing…' : 'Sync Now'}
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Total TLDs',      value: loadingStats ? '—' : stats.total,        icon: Globe,        color: 'text-blue-600 bg-blue-50'     },
            { label: 'With Prices',     value: loadingStats ? '—' : stats.withPrices,   icon: Database,     color: 'text-green-600 bg-green-50'   },
            { label: 'TrueHost Priced', value: loadingStats ? '—' : stats.withTruehost, icon: CheckCircle2, color: 'text-emerald-600 bg-emerald-50'},
            { label: 'Coverage',        value: loadingStats ? '—' : `${coverage}%`,     icon: TrendingUp,   color: 'text-purple-600 bg-purple-50' },
          ].map(s => (
            <div key={s.label} className="bg-white rounded-xl border border-gray-200 p-4 flex items-center gap-3">
              <div className={cn('w-9 h-9 rounded-lg flex items-center justify-center shrink-0', s.color)}>
                <s.icon className="h-4 w-4" />
              </div>
              <div>
                <p className="text-xl font-bold text-gray-900">{s.value}</p>
                <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Coverage bar */}
        {!loadingStats && stats.total > 0 && (
          <div className="bg-white rounded-xl border border-gray-200 p-5 mb-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-semibold text-gray-800">TrueHost Price Coverage</p>
              <span className="text-sm font-bold text-emerald-600">{coverage}%</span>
            </div>
            <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${coverage}%` }}
                transition={{ duration: 1, ease: 'easeOut' }}
                className="h-full bg-emerald-500 rounded-full"
              />
            </div>
            <p className="text-xs text-gray-400 mt-2">
              {stats.withTruehost.toLocaleString()} of {stats.total.toLocaleString()} TLDs have live prices
            </p>
          </div>
        )}

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Sync log */}
          <div>
            <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Sync Log</h2>
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden min-h-[220px]">
              {logs.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-48 text-gray-400">
                  <RefreshCw className="h-8 w-8 mb-3 opacity-30" />
                  <p className="text-sm">Click <strong>Sync Now</strong> to start</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {logs.map((log, i) => (
                    <div key={i} className="flex items-start gap-3 px-4 py-3">
                      {log.type === 'success'
                        ? <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                        : log.type === 'error'
                        ? <AlertCircle className="h-4 w-4 text-red-500 mt-0.5 shrink-0" />
                        : <RefreshCw className="h-4 w-4 text-blue-400 mt-0.5 shrink-0" />
                      }
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-800">{log.message}</p>
                      </div>
                      <span className="text-xs text-gray-400 shrink-0">{log.time}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Config info */}
          <div className="space-y-4">
            <div>
              <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">API Configuration</h2>
              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                {[
                  { key: 'Endpoint',   value: 'truehost.co.ke/cloud/includes/api.php' },
                  { key: 'Action',     value: 'GetTLDPricing'                         },
                  { key: 'Currency',   value: 'KES (Kenyan Shilling)'                 },
                  { key: 'Identifier', value: process.env.NEXT_PUBLIC_HAS_TRUEHOST ? '✓ Configured' : 'Set TRUEHOST_IDENTIFIER in .env.local' },
                ].map((row, i) => (
                  <div key={row.key} className={cn('flex items-center justify-between px-4 py-3', i !== 3 && 'border-b border-gray-100')}>
                    <span className="text-xs text-gray-500">{row.key}</span>
                    <span className="text-xs font-medium text-gray-800 font-mono">{row.value}</span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Last Sync</h2>
              <div className="bg-white rounded-xl border border-gray-200 px-4 py-3 flex items-center gap-3">
                <Clock className="h-4 w-4 text-gray-400 shrink-0" />
                <span className="text-sm text-gray-700">
                  {stats.lastSync
                    ? new Date(stats.lastSync).toLocaleString('en-KE')
                    : 'No sync recorded — run the enrichment script or click Sync Now'
                  }
                </span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
