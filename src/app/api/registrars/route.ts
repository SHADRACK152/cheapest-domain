import { NextResponse } from 'next/server';
import { TLD_CATALOG, cheapestCatalog, CatalogEntry } from '@/lib/tld-catalog';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  const tld       = searchParams.get('tld');         // single TLD detail
  const search    = searchParams.get('q') ?? '';      // search filter
  const type      = searchParams.get('type') ?? '';   // generic|country|new-generic|sponsored
  const category  = searchParams.get('category') ?? '';
  const maxReg    = parseFloat(searchParams.get('maxReg') ?? '9999');
  const maxRenew  = parseFloat(searchParams.get('maxRenew') ?? '9999');
  const sortField = searchParams.get('sort') ?? 'popularity'; // popularity|reg|renew
  const page      = Math.max(1, parseInt(searchParams.get('page') ?? '1'));
  const perPage   = Math.min(100, Math.max(10, parseInt(searchParams.get('per_page') ?? '25')));

  // ── Single TLD detail ───────────────────────────────────────────────────
  if (tld) {
    const entry = TLD_CATALOG.find((e) => e.tld === tld);
    if (!entry) return NextResponse.json({ error: 'TLD not found' }, { status: 404 });

    const { cheapReg, cheapRenew, cheapRegName, cheapRenewName } = cheapestCatalog(entry);
    const sortedPrices = [...entry.prices].sort((a, b) => a.renew - b.renew);

    return NextResponse.json({
      ...entry,
      prices: sortedPrices,
      cheapReg,
      cheapRenew,
      cheapRegName,
      cheapRenewName,
    });
  }

  // ── List + filter ───────────────────────────────────────────────────────
  let results: CatalogEntry[] = [...TLD_CATALOG];

  if (search)   results = results.filter((e) => e.tld.includes(search.toLowerCase()));
  if (type)     results = results.filter((e) => e.type === type);
  if (category) results = results.filter((e) => e.category.includes(category));

  // Price filters (based on cheapest available price)
  results = results.filter((e) => {
    const { cheapReg, cheapRenew } = cheapestCatalog(e);
    return cheapReg <= maxReg && cheapRenew <= maxRenew;
  });

  // Sort
  if (sortField === 'reg') {
    results.sort((a, b) => cheapestCatalog(a).cheapReg - cheapestCatalog(b).cheapReg);
  } else if (sortField === 'renew') {
    results.sort((a, b) => cheapestCatalog(a).cheapRenew - cheapestCatalog(b).cheapRenew);
  } else {
    // popularity (descending)
    results.sort((a, b) => (b.popularity ?? 0) - (a.popularity ?? 0));
  }

  const total = results.length;
  const totalPages = Math.ceil(total / perPage);
  const paginated = results.slice((page - 1) * perPage, page * perPage);

  const data = paginated.map((e) => {
    const { cheapReg, cheapRenew, cheapRegName, cheapRenewName } = cheapestCatalog(e);
    return {
      tld: e.tld,
      type: e.type,
      category: e.category,
      popularity: e.popularity,
      whoisPrivacy: e.whoisPrivacy,
      dnssec: e.dnssec,
      brand: e.brand,
      operator: e.operator,
      cheapReg,
      cheapRenew,
      cheapRegName,
      cheapRenewName,
    };
  });

  return NextResponse.json({
    total,
    page,
    perPage,
    totalPages,
    data,
  });
}

