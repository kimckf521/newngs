import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { CustomerServiceFab } from '@/components/layout/CustomerServiceFab';
import { Hero } from '@/components/sections/Hero';
import { FormOnlineDiplomaEn, IntroOnlineDiplomaEn } from '@/components/sections/FormOnlineDiplomaEn';
import { AdmissionsRequirementEn } from '@/components/sections/AdmissionsRequirementEn';
import { GlobalCommunity } from '@/components/sections/GlobalCommunity';
import { NgsGlobalEn } from '@/components/sections/NgsGlobalEn';
import { Media } from '@/components/sections/Media';

export function OnlineDiplomaEn() {
  return (
    <>
      <Navbar locale="en" />
      <Hero src="/static/img/classroom.jpg" alt="Students learning in a modern classroom" locale="en" />
      <FormOnlineDiplomaEn />
      <IntroOnlineDiplomaEn />
      <AdmissionsRequirementEn />
      <GlobalCommunity locale="en" />
      <NgsGlobalEn />
      <Media locale="en" />
      <CustomerServiceFab locale="en" />
      <Footer locale="en" />
    </>
  );
}
