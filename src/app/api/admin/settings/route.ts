import { NextRequest, NextResponse } from 'next/server';
import { readFile, writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

const SETTINGS_FILE = join(process.cwd(), 'data', 'site-settings.json');

async function loadSettings() {
  try {
    if (existsSync(SETTINGS_FILE)) {
      const data = await readFile(SETTINGS_FILE, 'utf-8');
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('Error loading settings:', error);
  }
  return {};
}

async function saveSettings(settings: object) {
  const dataDir = join(process.cwd(), 'data');
  if (!existsSync(dataDir)) await mkdir(dataDir, { recursive: true });
  await writeFile(SETTINGS_FILE, JSON.stringify(settings, null, 2), 'utf-8');
}

export async function GET() {
  try {
    const settings = await loadSettings();
    return NextResponse.json({ success: true, settings });
  } catch (error) {
    console.error('Error fetching settings:', error);
    return NextResponse.json({ error: 'Failed to load settings' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const current = await loadSettings();

    // Deep-merge: overwrite only the sections provided
    const updated = { ...current };
    for (const key of Object.keys(body)) {
      updated[key] = { ...(current[key] ?? {}), ...body[key] };
    }

    await saveSettings(updated);
    return NextResponse.json({ success: true, settings: updated });
  } catch (error) {
    console.error('Error saving settings:', error);
    return NextResponse.json({ error: 'Failed to save settings' }, { status: 500 });
  }
}
