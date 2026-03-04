// Simple currency conversion utilities for the app
// Exchange rate: 1 USD = 150 KES (adjust if needed)
export const USD_TO_KES_RATE = 150;
export const KES_TO_USD_RATE = 1 / USD_TO_KES_RATE;

export function usdToKes(usd: number): number {
  return Math.round(usd * USD_TO_KES_RATE);
}

export function kesToUsd(kes: number): number {
  return Math.round((kes * KES_TO_USD_RATE) * 100) / 100;
}

// Normalize a price value to KES. If `value` looks like a KES amount (>= 50),
// treat it as KES. Otherwise assume USD and convert.
export function ensureKes(value: number | undefined, fallbackUsd: number = 8.99): number {
  if (value === undefined || value === null) {
    return usdToKes(fallbackUsd);
  }
  // heuristic: if value looks large, assume KES
  if (value >= 50) return Math.round(value);
  return usdToKes(value);
}
