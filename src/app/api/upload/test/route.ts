import { NextResponse } from 'next/server';
import { existsSync } from 'fs';
import { join } from 'path';

export async function GET() {
  const uploadsDir = join(process.cwd(), 'public', 'uploads', 'blog');
  
  return NextResponse.json({
    cwd: process.cwd(),
    uploadsDir: uploadsDir,
    uploadsExists: existsSync(uploadsDir),
    publicExists: existsSync(join(process.cwd(), 'public')),
    nodeVersion: process.version,
    platform: process.platform,
  });
}
