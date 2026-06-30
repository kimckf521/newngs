import { ModuleContentEditor } from '@/components/admin/ielts_training/ModuleContentEditor';
import { notFound } from 'next/navigation';

const VALID = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'];

export async function generateMetadata({ params }: { params: Promise<{ modId: string }> }) {
  const { modId } = await params;
  return { title: `Edit Module ${modId} — IELTS Training`, robots: { index: false } };
}

export default async function ModuleEditPage({ params }: { params: Promise<{ modId: string }> }) {
  const { modId } = await params;
  if (!VALID.includes(modId)) notFound();
  return <ModuleContentEditor modId={modId} />;
}
