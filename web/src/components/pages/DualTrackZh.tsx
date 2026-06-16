import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { CustomerServiceFab } from '@/components/layout/CustomerServiceFab';
import { Hero } from '@/components/sections/Hero';
import { FormDualTrackZh, IntroDualTrackZh } from '@/components/sections/FormDualTrackZh';
import { AdmissionsRequirementZh } from '@/components/sections/AdmissionsRequirementZh';
import { GlobalCommunity } from '@/components/sections/GlobalCommunity';
import { NgsGlobalZh } from '@/components/sections/NgsGlobalZh';
import { Media } from '@/components/sections/Media';

export function DualTrackZh() {
  return (
    <>
      <Navbar locale="zh" />
      <Hero src="/static/img/classroom.jpg" alt="Students learning in a modern classroom" locale="zh" />
      <FormDualTrackZh />
      <IntroDualTrackZh />
      <AdmissionsRequirementZh />
      <GlobalCommunity locale="zh" />
      <NgsGlobalZh />
      <Media locale="zh" />
      <CustomerServiceFab locale="zh" />
      <Footer locale="zh" />
    </>
  );
}
