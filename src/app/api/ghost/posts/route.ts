import { NextResponse } from 'next/server';
import { fetchGhostPosts } from '@/lib/ghost-client';

export async function GET() {
  try {
    const posts = await fetchGhostPosts({ limit: 100 });
    return NextResponse.json({ success: true, posts });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err?.message || 'Unknown error' }, { status: 500 });
  }
}
