import { ModuleLessonViewer } from '@/components/admin/ielts_training/ModuleLessonViewer';
import { notFound } from 'next/navigation';

const VALID = ['1','2','3','4','5','6','7','8','9','10'];

export function generateStaticParams() {
  return VALID.map((modId) => ({ modId }));
}

export async function generateMetadata({ params }: { params: Promise<{ modId: string }> }) {
  const { modId } = await params;
  return { title: `Module ${modId} — IELTS Training`, robots: { index: false } };
}

export default async function ModuleLessonPage({ params }: { params: Promise<{ modId: string }> }) {
  const { modId } = await params;
  if (!VALID.includes(modId)) notFound();
  return <ModuleLessonViewer modId={modId} />;
}
