import { NextResponse } from 'next/server';
import { TLD_DATA } from '@/lib/tld-registrar-data';

export interface PromoCode {
  code: string;
  registrar: string;
  url: string;
  tlds: string[];
  minRegPrice: number;
}

export async function GET() {
  const map: Record<string, PromoCode> = {};

  for (const entry of TLD_DATA) {
    for (const p of entry.prices) {
      if (!p.promoCode) continue;
      const key = `${p.registrar}::${p.promoCode}`;
      if (!map[key]) {
        map[key] = {
          code: p.promoCode,
          registrar: p.registrar,
          url: p.url,
          tlds: [entry.tld],
          minRegPrice: p.reg,
        };
      } else {
        map[key].tlds.push(entry.tld);
        map[key].minRegPrice = Math.min(map[key].minRegPrice, p.reg);
      }
    }
  }

  const codes = Object.values(map).sort((a, b) => a.minRegPrice - b.minRegPrice);
  return NextResponse.json({ success: true, codes, total: codes.length });
}
