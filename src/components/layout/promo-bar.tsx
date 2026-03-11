'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Tag, X, Copy, CheckCircle2, ChevronLeft, ChevronRight } from 'lucide-react';
import { TLD_DATA } from '@/lib/tld-registrar-data';
import { cn } from '@/lib/utils';

// ── Extract promo items at module load ────────────────────────────────────────

export interface PromoItem {
  code: string;
  registrar: string;
  url: string;
  tld: string;
  regPrice: number;
}

function buildPromos(): PromoItem[] {
  const seen = new Set<string>();
  const out: PromoItem[] = [];
  for (const entry of TLD_DATA) {
    for (const p of entry.prices) {
      if (p.promoCode) {
        const key = `${p.registrar}:${p.promoCode}`;
        if (!seen.has(key)) {
          seen.add(key);
          out.push({ code: p.promoCode, registrar: p.registrar, url: p.url, tld: entry.tld, regPrice: p.reg });
        }
      }
    }
  }
  return out;
}

const PROMOS = buildPromos();

// ── Component ─────────────────────────────────────────────────────────────────

interface Props {
  /** callback fires whenever bar height changes (dismissed=0px or shown=36px) */
  onHeightChange?: (px: number) => void;
}

const BAR_H = 36; // px
const STORAGE_KEY = 'promo-bar-v1-dismissed';

export function PromoBar({ onHeightChange }: Props) {
  const [visible, setVisible]   = useState(false); // hidden until hydration
  const [idx, setIdx]           = useState(0);
  const [copied, setCopied]     = useState<string | null>(null);
  const [paused, setPaused]     = useState(false);
  const timerRef                = useRef<ReturnType<typeof setInterval> | null>(null);

  // Restore dismissed state from localStorage after mount
  useEffect(() => {
    if (!sessionStorage.getItem(STORAGE_KEY) && PROMOS.length > 0) {
      setVisible(true);
      onHeightChange?.(BAR_H);
    }
  }, [onHeightChange]);

  // Auto-cycle promo items
  const startTimer = useCallback(() => {
    timerRef.current = setInterval(() => {
      setIdx((i) => (i + 1) % PROMOS.length);
    }, 4000);
  }, []);

  const stopTimer = useCallback(() => {
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
  }, []);

  useEffect(() => {
    if (visible && !paused) startTimer();
    else stopTimer();
    return stopTimer;
  }, [visible, paused, startTimer, stopTimer]);

  function dismiss() {
    setVisible(false);
    sessionStorage.setItem(STORAGE_KEY, '1');
    onHeightChange?.(0);
  }

  function copyCode(code: string) {
    navigator.clipboard.writeText(code).catch(() => {});
    setCopied(code);
    setTimeout(() => setCopied(null), 2000);
  }

  function prev() { setIdx((i) => (i - 1 + PROMOS.length) % PROMOS.length); }
  function next() { setIdx((i) => (i + 1) % PROMOS.length); }

  if (!visible || PROMOS.length === 0) return null;

  const item = PROMOS[idx];

  return (
    <div
      className="relative flex items-center h-9 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-500 text-white text-xs select-none overflow-hidden"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* Label pill */}
      <div className="shrink-0 flex items-center gap-1.5 bg-black/20 px-3 h-full font-bold text-[10px] uppercase tracking-widest">
        <Tag className="h-3 w-3" />
        <span className="hidden sm:inline">Promo</span>
      </div>

      {/* Prev arrow */}
      <button
        onClick={prev}
        className="shrink-0 p-2 hover:bg-black/10 transition-colors h-full"
        aria-label="Previous promo"
      >
        <ChevronLeft className="h-3.5 w-3.5" />
      </button>

      {/* Main ticker content */}
      <div className="flex-1 flex items-center justify-center gap-2 font-medium overflow-hidden px-2">
        <span className="text-amber-100 shrink-0 hidden sm:inline">
          {item.registrar}
        </span>
        <span className="text-white/50 hidden sm:inline">—</span>

        {/* Promo badge (copyable) */}
        <button
          onClick={() => copyCode(item.code)}
          className={cn(
            'inline-flex items-center gap-1.5 bg-white/20 hover:bg-white/35 border border-white/30 rounded px-2 py-0.5 font-mono font-bold text-xs transition-colors',
            copied === item.code && 'bg-green-500/30 border-green-300/50',
          )}
          title="Click to copy code"
        >
          {copied === item.code
            ? <CheckCircle2 className="h-3 w-3 text-green-200" />
            : <Copy className="h-3 w-3 opacity-70" />
          }
          {item.code}
        </button>

        <span className="text-white/80 truncate hidden sm:block">
          {/* Show "on .com — from $0.99" */}
          on&nbsp;<span className="font-bold text-white">{item.tld}</span>
          &nbsp;—&nbsp;from&nbsp;<span className="font-bold text-white">${item.regPrice.toFixed(2)}</span>
        </span>

        {/* Dot indicators */}
        <div className="hidden lg:flex items-center gap-1 ml-3 shrink-0">
          {PROMOS.map((_, i) => (
            <button
              key={i}
              onClick={() => setIdx(i)}
              className={cn(
                'rounded-full transition-all',
                i === idx ? 'w-4 h-1.5 bg-white' : 'w-1.5 h-1.5 bg-white/40 hover:bg-white/70',
              )}
            />
          ))}
        </div>
      </div>

      {/* Next arrow */}
      <button
        onClick={next}
        className="shrink-0 p-2 hover:bg-black/10 transition-colors h-full"
        aria-label="Next promo"
      >
        <ChevronRight className="h-3.5 w-3.5" />
      </button>

      {/* Counter */}
      <span className="shrink-0 text-[10px] text-white/60 pr-2 hidden sm:inline">
        {idx + 1}/{PROMOS.length}
      </span>

      {/* Dismiss */}
      <button
        onClick={dismiss}
        className="shrink-0 p-2 hover:bg-black/20 transition-colors h-full mr-1"
        aria-label="Dismiss promo bar"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
