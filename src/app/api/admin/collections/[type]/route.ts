import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const COLLECTIONS_PATH = path.join(process.cwd(), 'data', 'collections.json');

function read() {
  return JSON.parse(fs.readFileSync(COLLECTIONS_PATH, 'utf8'));
}
function write(data: unknown) {
  fs.writeFileSync(COLLECTIONS_PATH, JSON.stringify(data, null, 2), 'utf8');
}

export async function GET(_req: NextRequest, { params }: { params: Promise<{ type: string }> }) {
  const { type } = await params;
  try {
    const all = read();
    return NextResponse.json(all[type] ?? []);
  } catch {
    return NextResponse.json({ error: 'Failed to read' }, { status: 500 });
  }
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ type: string }> }) {
  const { type } = await params;
  try {
    const body = await request.json();
    const all = read();
    const item = { ...body, id: Date.now().toString(), createdAt: new Date().toISOString() };
    if (!Array.isArray(all[type])) all[type] = [];
    all[type].push(item);
    write(all);
    return NextResponse.json(item);
  } catch {
    return NextResponse.json({ error: 'Failed to create' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ type: string }> }) {
  const { type } = await params;
  try {
    const body = await request.json();
    const all = read();
    if (!Array.isArray(all[type])) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    const idx = all[type].findIndex((i: { id: string }) => i.id === body.id);
    if (idx === -1) return NextResponse.json({ error: 'Item not found' }, { status: 404 });
    all[type][idx] = { ...all[type][idx], ...body };
    write(all);
    return NextResponse.json(all[type][idx]);
  } catch {
    return NextResponse.json({ error: 'Failed to update' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ type: string }> }) {
  const { type } = await params;
  try {
    const id = request.nextUrl.searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });
    const all = read();
    if (!Array.isArray(all[type])) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    all[type] = all[type].filter((i: { id: string }) => i.id !== id);
    write(all);
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Failed to delete' }, { status: 500 });
  }
}
