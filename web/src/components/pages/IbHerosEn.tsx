import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { CustomerServiceFab } from '@/components/layout/CustomerServiceFab';
import { ProgressEn } from '@/components/sections/ProgressEn';
import { Media } from '@/components/sections/Media';

export function IbHerosEn() {
  return (
    <>
      <Navbar locale="en" />
      <ProgressEn />
      <Media locale="en" />
      <CustomerServiceFab locale="en" />
      <Footer locale="en" />
    </>
  );
}
