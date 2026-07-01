import { NextResponse } from 'next/server';
import { writeFile, readFile } from 'fs/promises';
import path from 'path';

const DEST = path.join(process.cwd(), 'src', 'data', 'ielts_lessons.json');

function cors(origin: string) {
  return {
    'Access-Control-Allow-Origin': origin || '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Private-Network': 'true',
  };
}

export async function POST(req: Request) {
  const origin = req.headers.get('origin') ?? '';
  try {
    const body = await req.json() as { key: string; pages: { page: number; html: string }[] };

    // Read existing file or start fresh
    let existing: Record<string, unknown> = {};
    try {
      existing = JSON.parse(await readFile(DEST, 'utf-8'));
    } catch { /* file doesn't exist yet */ }

    existing[body.key] = body.pages;
    await writeFile(DEST, JSON.stringify(existing, null, 2), 'utf-8');
    return NextResponse.json({ ok: true, saved: body.key }, { headers: cors(origin) });
  } catch (e) {
    return NextResponse.json({ ok: false, error: String(e) }, { status: 500, headers: cors(origin) });
  }
}

export async function OPTIONS(req: Request) {
  const origin = req.headers.get('origin') ?? '';
  return new NextResponse(null, { status: 204, headers: cors(origin) });
}
