import { NextRequest, NextResponse } from 'next/server';
import { searchDomain } from '@/lib/domain-api';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q');

  if (!query) {
    return NextResponse.json({ error: 'Missing query parameter "q"' }, { status: 400 });
  }

  try {
    // Use central searchDomain which prefers TrueHost API (or WHMCS creds) then falls back
    const results = await searchDomain(query);

    return NextResponse.json({ success: true, query, data: results, source: 'domain-service' });
  } catch (error) {
    console.error('Search domain error:', error);
    return NextResponse.json(
      {
        error: 'Failed to check domain availability',
        message: error instanceof Error ? error.message : 'Unknown error',
        query,
      },
      { status: 500 }
    );
  }
}
