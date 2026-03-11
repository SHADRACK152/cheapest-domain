import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const CONTENT_PATH = path.join(process.cwd(), 'data', 'site-content.json');

function readContent() {
  return JSON.parse(fs.readFileSync(CONTENT_PATH, 'utf8'));
}

function writeContent(data: unknown) {
  fs.writeFileSync(CONTENT_PATH, JSON.stringify(data, null, 2), 'utf8');
}

export async function GET(request: NextRequest) {
  try {
    const section = request.nextUrl.searchParams.get('section');
    const content = readContent();
    return NextResponse.json(section ? (content[section] ?? {}) : content);
  } catch {
    return NextResponse.json({ error: 'Failed to read content' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const { section, data } = await request.json();
    if (!section) return NextResponse.json({ error: 'section is required' }, { status: 400 });
    const content = readContent();
    content[section] = { ...content[section], ...data };
    writeContent(content);
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Failed to write content' }, { status: 500 });
  }
}
