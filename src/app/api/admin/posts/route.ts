import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function POST(req: Request) {
  try {
    const post = await req.json();
    const file = path.join(process.cwd(), 'data', 'blog-posts.json');
    const raw = fs.readFileSync(file, 'utf8');
    const arr = JSON.parse(raw || '[]');
    arr.unshift(post);
    fs.writeFileSync(file, JSON.stringify(arr, null, 2), 'utf8');
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err?.message || String(err) }, { status: 500 });
  }
}
