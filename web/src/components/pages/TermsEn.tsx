import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { CustomerServiceFab } from '@/components/layout/CustomerServiceFab';
import { TermsOfServiceEn } from '@/components/sections/TermsOfServiceEn';
import { Media } from '@/components/sections/Media';

export function TermsEn() {
  return (
    <>
      <Navbar locale="en" />
      <TermsOfServiceEn />
      <Media locale="en" />
      <CustomerServiceFab locale="en" />
      <Footer locale="en" />
    </>
  );
}
