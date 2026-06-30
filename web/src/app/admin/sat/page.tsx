import { SatAdminPage } from '@/components/admin/sat/SatAdminPage';

export const metadata = {
  title: 'SAT Question Bank — Admin',
  robots: { index: false, follow: false },
};

export default function SatAdminRoute() {
  return <SatAdminPage />;
}
