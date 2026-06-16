import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { CustomerServiceFab } from '@/components/layout/CustomerServiceFab';
import { Hero } from '@/components/sections/Hero';
import { FormHybridZh, IntroHybridZh } from '@/components/sections/FormHybridZh';
import { AdmissionsRequirementZh } from '@/components/sections/AdmissionsRequirementZh';
import { GlobalCommunity } from '@/components/sections/GlobalCommunity';
import { NgsGlobalZh } from '@/components/sections/NgsGlobalZh';
import { Media } from '@/components/sections/Media';

export function HybridLearningZh() {
  return (
    <>
      <Navbar locale="zh" />
      <Hero src="/static/img/classroom.jpg" alt="Students learning in a modern classroom" locale="zh" />
      <FormHybridZh />
      <IntroHybridZh />
      <AdmissionsRequirementZh />
      <GlobalCommunity locale="zh" />
      <NgsGlobalZh />
      <Media locale="zh" />
      <CustomerServiceFab locale="zh" />
      <Footer locale="zh" />
    </>
  );
}
