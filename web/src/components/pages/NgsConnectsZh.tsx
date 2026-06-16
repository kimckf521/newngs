import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { CustomerServiceFab } from '@/components/layout/CustomerServiceFab';
import { Hero } from '@/components/sections/Hero';
import { ConnectsCardsZh } from '@/components/sections/ConnectsCardsZh';
import { IntroConnectsZh } from '@/components/sections/IntroConnectsZh';
import { HighschoolMappingSectionsZh } from '@/components/sections/HighschoolMappingSectionsZh';
import { ConnectToSchoolsZh } from '@/components/sections/ConnectToSchoolsZh';
import { ConnectToParentsZh } from '@/components/sections/ConnectToParentsZh';
import { ConnectToExpertsZh } from '@/components/sections/ConnectToExpertsZh';
import { SubscribeConnectsZh } from '@/components/sections/SubscribeConnectsZh';
import { Media } from '@/components/sections/Media';

export function NgsConnectsZh() {
  return (
    <>
      <Navbar locale="zh" />
      <Hero src="/static/img/painting.jpg" alt="Students engaging in creative arts" locale="zh" />
      <ConnectsCardsZh />
      <IntroConnectsZh />
      <HighschoolMappingSectionsZh />
      <ConnectToSchoolsZh />
      <ConnectToParentsZh />
      <ConnectToExpertsZh />
      <SubscribeConnectsZh />
      <Media locale="zh" />
      <CustomerServiceFab locale="zh" />
      <Footer locale="zh" />
    </>
  );
}
