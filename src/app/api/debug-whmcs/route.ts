import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

async function callWhmcs(action: string, extra: Record<string, string> = {}) {
  const identifier = process.env.TRUEHOST_IDENTIFIER;
  const secret = process.env.TRUEHOST_SECRET;
  const endpoint = process.env.TRUEHOST_ENDPOINT;

  if (!identifier || !secret || !endpoint) {
    return { error: 'Credentials not set', identifier: !!identifier, secret: !!secret, endpoint };
  }

  const body = new URLSearchParams({
    identifier,
    secret,
    action,
    responsetype: 'json',
    ...extra,
  });

  const res = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: body.toString(),
    redirect: 'manual', // don't follow redirects — show raw response
  });

  const text = await res.text().catch(() => '');
  let json: unknown = null;
  try { json = JSON.parse(text); } catch { /* not JSON */ }

  return {
    action,
    httpStatus: res.status,
    location: res.headers.get('location') ?? null,
    isJson: json !== null,
    body: json ?? text.slice(0, 500),
  };
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const domain = searchParams.get('domain') || 'uwudqwyywwu.com';

  const [domainCheck, tldPricing] = await Promise.all([
    callWhmcs('DomainCheck', { domain, domains: domain }).catch((e: Error) => ({ error: e.message })),
    callWhmcs('GetTLDPricing', { currencyid: '1' }).catch((e: Error) => ({ error: e.message })),
  ]);

  // For pricing, trim to just first 5 TLDs to keep response readable
  let pricingSample: unknown = tldPricing;
  if (tldPricing && typeof tldPricing === 'object' && 'body' in tldPricing) {
    const body = (tldPricing as { body: unknown }).body;
    if (body && typeof body === 'object' && 'pricing' in body) {
      const pricing = (body as { pricing: Record<string, unknown> }).pricing;
      const keys = Object.keys(pricing).slice(0, 8);
      const sample: Record<string, unknown> = {};
      keys.forEach(k => { sample[k] = pricing[k]; });
      pricingSample = { ...tldPricing, body: { ...body as object, pricing: sample, _note: `Showing 8 of ${Object.keys(pricing).length} TLDs` } };
    }
  }

  return NextResponse.json({
    serverEnv: {
      hasIdentifier: !!process.env.TRUEHOST_IDENTIFIER,
      hasSecret: !!process.env.TRUEHOST_SECRET,
      endpoint: process.env.TRUEHOST_ENDPOINT ?? null,
    },
    domainCheck,
    tldPricing: pricingSample,
  });
}
