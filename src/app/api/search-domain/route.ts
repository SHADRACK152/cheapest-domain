import { NextRequest, NextResponse } from 'next/server';
import { fetchTrueHostResults } from '@/lib/truehost-fetcher';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q');

  if (!query) {
    return NextResponse.json(
      { error: 'Missing query parameter "q"' },
      { status: 400 }
    );
  }

  try {
    // Fetch domain search results from TrueHost Kenya
    const results = await fetchTrueHostResults(query);

    return NextResponse.json({
      success: true,
      query,
      data: results,
      source: 'truehost',
    });
  } catch (error) {
    console.error('Search domain error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to check domain availability', 
        message: error instanceof Error ? error.message : 'Unknown error',
        query 
      },
      { status: 500 }
    );
  }
}
