import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { filename, data } = body;
    if (!filename || !data) return NextResponse.json({ success: false, error: 'missing' }, { status: 400 });

    const matches = data.match(/^data:(.+);base64,(.+)$/);
    if (!matches) return NextResponse.json({ success: false, error: 'invalid data' }, { status: 400 });

    const mime = matches[1];
    const b64 = matches[2];
    const buffer = Buffer.from(b64, 'base64');

    const uploadsDir = path.join(process.cwd(), 'public', 'uploads', 'blog');
    if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

    const outPath = path.join(uploadsDir, filename);
    fs.writeFileSync(outPath, buffer);

    const url = `/uploads/blog/${filename}`;
    return NextResponse.json({ success: true, url });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err?.message || String(err) }, { status: 500 });
  }
}
