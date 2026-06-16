import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { CustomerServiceFab } from '@/components/layout/CustomerServiceFab';
import { Hero } from '@/components/sections/Hero';
import { K12SchoolZh } from '@/components/sections/K12SchoolZh';
import { HighschoolMappingProgramZh } from '@/components/sections/HighschoolMappingProgramZh';
import { HighschoolMappingSectionsZh } from '@/components/sections/HighschoolMappingSectionsZh';
import { GlobalCommunity } from '@/components/sections/GlobalCommunity';
import { Inspires } from '@/components/sections/Inspires';
import { Media } from '@/components/sections/Media';

export function HighschoolMappingZh() {
  return (
    <>
      <Navbar locale="zh" />
      <Hero src="/static/img/NGSConnects.jpg" alt="NGS Connects community gathering" locale="zh" />
      <K12SchoolZh />
      <HighschoolMappingProgramZh />
      <HighschoolMappingSectionsZh />
      <GlobalCommunity locale="zh" />
      <Inspires locale="zh" />
      <Media locale="zh" />
      <CustomerServiceFab locale="zh" />
      <Footer locale="zh" />
    </>
  );
}
