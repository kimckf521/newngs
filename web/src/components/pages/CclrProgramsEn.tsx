import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { CustomerServiceFab } from '@/components/layout/CustomerServiceFab';
import { Hero } from '@/components/sections/Hero';
import { CclrIntroEn, CclrDiagramEn } from '@/components/sections/CclrIntroEn';
import { PartnerWithUs } from '@/components/sections/PartnerWithUs';
import { OurPrograms } from '@/components/sections/OurPrograms';
import { IndexForm } from '@/components/sections/IndexForm';
import { GlobalCommunity } from '@/components/sections/GlobalCommunity';
import { Media } from '@/components/sections/Media';

export function CclrProgramsEn() {
  return (
    <>
      <Navbar locale="en" />
      <Hero src="/static/img/brian.jpg" alt="Brian, NGS founder" locale="en" />
      <CclrIntroEn />
      <CclrDiagramEn />
      <PartnerWithUs locale="en" />
      <OurPrograms locale="en" />
      <IndexForm locale="en" />
      <GlobalCommunity locale="en" />
      <Media locale="en" />
      <CustomerServiceFab locale="en" />
      <Footer locale="en" />
    </>
  );
}
