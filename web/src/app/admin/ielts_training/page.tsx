import { IeltsTrainingPage } from '@/components/admin/ielts_training/IeltsTrainingPage';

export const metadata = {
  title: 'IELTS Training Course — Admin',
  robots: { index: false, follow: false },
};

export default function IeltsTrainingRoute() {
  return <IeltsTrainingPage />;
}
