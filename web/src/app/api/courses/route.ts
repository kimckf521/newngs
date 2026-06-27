import { NextRequest, NextResponse } from 'next/server';
import { authorizedAdmin } from '@/lib/admin/apiAuth';
import { dbConfigured } from '@/lib/db/pg';
import {
  listAllCourses,
  listPublishedCourses,
  upsertCourse,
  deleteCourseById,
} from '@/lib/courses/serverStore';
import type { AdminCourse, CourseModule } from '@/lib/courses/types';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Courses API (PostgreSQL-backed).
 *  - GET ?scope=published → PUBLIC list of published courses (for the student
 *    portal). GET (no scope) → admin list of ALL courses (key-gated).
 *  - POST  {course} → upsert a course (key-gated).
 *  - DELETE ?id=...  → remove a course (key-gated).
 * Without DATABASE_URL the route reports not_configured and the console falls
 * back to its localStorage trial store.
 */

/** Validate + normalise an incoming course payload (untrusted client JSON). */
function parseCourse(body: unknown): AdminCourse | null {
  const c = body as Partial<AdminCourse> | null;
  if (!c || typeof c.id !== 'string' || !c.id || typeof c.name !== 'string' || !c.name) return null;
  const modules: CourseModule[] = Array.isArray(c.modules)
    ? c.modules
        .filter((m): m is CourseModule => Boolean(m) && typeof (m as CourseModule).title === 'string')
        .map((m) => ({
          title: String(m.title),
          ...(typeof m.progress === 'number' ? { progress: m.progress } : {}),
          ...(m.mcqButton ? { mcqButton: m.mcqButton } : {}),
        }))
    : [];
  return {
    id: c.id,
    name: c.name,
    description: typeof c.description === 'string' ? c.description : undefined,
    level: typeof c.level === 'string' ? c.level : undefined,
    track: typeof c.track === 'string' ? c.track : undefined,
    coverImage: typeof c.coverImage === 'string' ? c.coverImage : undefined,
    modules,
    published: Boolean(c.published),
    createdAt: typeof c.createdAt === 'number' ? c.createdAt : undefined,
    updatedBy: typeof c.updatedBy === 'string' ? c.updatedBy : undefined,
  };
}

export async function GET(req: NextRequest) {
  const scope = req.nextUrl.searchParams.get('scope');
  if (scope === 'published') {
    // Public — student-facing. Empty list (not an error) when unconfigured.
    if (!dbConfigured()) return NextResponse.json({ ok: true, courses: [] });
    try {
      return NextResponse.json({ ok: true, courses: await listPublishedCourses() });
    } catch {
      return NextResponse.json({ ok: false, error: 'unavailable' }, { status: 503 });
    }
  }
  if (!dbConfigured()) return NextResponse.json({ ok: false, error: 'not_configured' });
  if (!authorizedAdmin(req)) return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 });
  try {
    return NextResponse.json({ ok: true, courses: await listAllCourses() });
  } catch {
    return NextResponse.json({ ok: false, error: 'unavailable' }, { status: 503 });
  }
}

export async function POST(req: NextRequest) {
  if (!dbConfigured()) return NextResponse.json({ ok: false, error: 'not_configured' });
  if (!authorizedAdmin(req)) return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 });
  const course = parseCourse(await req.json().catch(() => null));
  if (!course) return NextResponse.json({ ok: false, error: 'bad_request' }, { status: 400 });
  try {
    const saved = await upsertCourse(course, course.updatedBy || 'admin');
    return NextResponse.json({ ok: true, course: saved });
  } catch {
    return NextResponse.json({ ok: false, error: 'unavailable' }, { status: 503 });
  }
}

export async function DELETE(req: NextRequest) {
  if (!dbConfigured()) return NextResponse.json({ ok: false, error: 'not_configured' });
  if (!authorizedAdmin(req)) return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 });
  const id = req.nextUrl.searchParams.get('id') || '';
  if (!id) return NextResponse.json({ ok: false, error: 'bad_request' }, { status: 400 });
  try {
    await deleteCourseById(id);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false, error: 'unavailable' }, { status: 503 });
  }
}
