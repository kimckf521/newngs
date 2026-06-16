import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { CustomerServiceFab } from '@/components/layout/CustomerServiceFab';
import { Hero } from '@/components/sections/Hero';
import { CclrIntroZh, CclrDiagramZh } from '@/components/sections/CclrIntroZh';
import { PartnerWithUs } from '@/components/sections/PartnerWithUs';
import { OurPrograms } from '@/components/sections/OurPrograms';
import { IndexForm } from '@/components/sections/IndexForm';
import { GlobalCommunity } from '@/components/sections/GlobalCommunity';
import { Media } from '@/components/sections/Media';

export function CclrProgramsZh() {
  return (
    <>
      <Navbar locale="zh" />
      <Hero src="/static/img/brian.jpg" alt="Brian, NGS founder" locale="zh" />
      <CclrIntroZh />
      <CclrDiagramZh />
      <PartnerWithUs locale="zh" />
      <OurPrograms locale="zh" />
      <IndexForm locale="zh" />
      <GlobalCommunity locale="zh" />
      <Media locale="zh" />
      <CustomerServiceFab locale="zh" />
      <Footer locale="zh" />
    </>
  );
}
