import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { CustomerServiceFab } from '@/components/layout/CustomerServiceFab';
import { ProgressZh } from '@/components/sections/ProgressZh';
import { Media } from '@/components/sections/Media';

export function IbHerosZh() {
  return (
    <>
      <Navbar locale="zh" />
      <ProgressZh />
      <Media locale="zh" />
      <CustomerServiceFab locale="zh" />
      <Footer locale="zh" />
    </>
  );
}
