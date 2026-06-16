import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { CustomerServiceFab } from '@/components/layout/CustomerServiceFab';
import { Hero } from '@/components/sections/Hero';
import { K12SchoolEn } from '@/components/sections/K12SchoolEn';
import { HighschoolMappingProgramEn } from '@/components/sections/HighschoolMappingProgramEn';
import { HighschoolMappingSectionsEn } from '@/components/sections/HighschoolMappingSectionsEn';
import { GlobalCommunity } from '@/components/sections/GlobalCommunity';
import { Inspires } from '@/components/sections/Inspires';
import { Media } from '@/components/sections/Media';

export function HighschoolMappingEn() {
  return (
    <>
      <Navbar locale="en" />
      <Hero src="/static/img/NGSConnects.jpg" alt="NGS Connects community gathering" locale="en" />
      <K12SchoolEn />
      <HighschoolMappingProgramEn />
      <HighschoolMappingSectionsEn />
      <GlobalCommunity locale="en" />
      <Inspires locale="en" />
      <Media locale="en" />
      <CustomerServiceFab locale="en" />
      <Footer locale="en" />
    </>
  );
}
