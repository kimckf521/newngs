import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { CustomerServiceFab } from '@/components/layout/CustomerServiceFab';
import { PrivacyPolicyZh } from '@/components/sections/PrivacyPolicyZh';
import { Media } from '@/components/sections/Media';

export function PrivacyZh() {
  return (
    <>
      <Navbar locale="zh" />
      <PrivacyPolicyZh />
      <Media locale="zh" />
      <CustomerServiceFab locale="zh" />
      <Footer locale="zh" />
    </>
  );
}
