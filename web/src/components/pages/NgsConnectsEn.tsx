import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { CustomerServiceFab } from '@/components/layout/CustomerServiceFab';
import { Hero } from '@/components/sections/Hero';
import { ConnectsCardsEn } from '@/components/sections/ConnectsCardsEn';
import { IntroConnectsEn } from '@/components/sections/IntroConnectsEn';
import { HighschoolMappingSectionsEn } from '@/components/sections/HighschoolMappingSectionsEn';
import { ConnectToSchoolsEn } from '@/components/sections/ConnectToSchoolsEn';
import { ConnectToParentsEn } from '@/components/sections/ConnectToParentsEn';
import { ConnectToExpertsEn } from '@/components/sections/ConnectToExpertsEn';
import { SubscribeConnectsEn } from '@/components/sections/SubscribeEn';
import { Media } from '@/components/sections/Media';

export function NgsConnectsEn() {
  return (
    <>
      <Navbar locale="en" />
      <Hero src="/static/img/painting.jpg" alt="Students engaging in creative arts" locale="en" />
      <ConnectsCardsEn />
      <IntroConnectsEn />
      <HighschoolMappingSectionsEn />
      <ConnectToSchoolsEn />
      <ConnectToParentsEn />
      <ConnectToExpertsEn />
      <SubscribeConnectsEn />
      <Media locale="en" />
      <CustomerServiceFab locale="en" />
      <Footer locale="en" />
    </>
  );
}
