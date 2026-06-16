import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { CustomerServiceFab } from '@/components/layout/CustomerServiceFab';
import { TermsOfServiceZh } from '@/components/sections/TermsOfServiceZh';
import { Media } from '@/components/sections/Media';

export function TermsZh() {
  return (
    <>
      <Navbar locale="zh" />
      <TermsOfServiceZh />
      <Media locale="zh" />
      <CustomerServiceFab locale="zh" />
      <Footer locale="zh" />
    </>
  );
}
