import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { CustomerServiceFab } from '@/components/layout/CustomerServiceFab';
import { PrivacyPolicyEn } from '@/components/sections/PrivacyPolicyEn';
import { Media } from '@/components/sections/Media';

export function PrivacyEn() {
  return (
    <>
      <Navbar locale="en" />
      <PrivacyPolicyEn />
      <Media locale="en" />
      <CustomerServiceFab locale="en" />
      <Footer locale="en" />
    </>
  );
}
