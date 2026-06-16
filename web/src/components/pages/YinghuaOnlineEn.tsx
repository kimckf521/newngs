import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { CustomerServiceFab } from '@/components/layout/CustomerServiceFab';
import { ProgressEn } from '@/components/sections/ProgressEn';
import { Media } from '@/components/sections/Media';

/**
 * The Django EN template for YCSOnline incorrectly includes Chinese partials.
 * For now, we render the in-progress placeholder. The full English YCS page
 * can be built later by translating the ZH content.
 */
export function YinghuaOnlineEn() {
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
