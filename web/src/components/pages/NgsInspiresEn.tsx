import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { CustomerServiceFab } from '@/components/layout/CustomerServiceFab';
import { Hero } from '@/components/sections/Hero';
import { IntroInspiresEn } from '@/components/sections/IntroInspiresEn';
import { Inspires } from '@/components/sections/Inspires';
import { GlobalIndustryLeadersEn } from '@/components/sections/GlobalIndustryLeadersEn';
import { SparkLabEn } from '@/components/sections/SparkLabEn';
import { GlobalUniversitiesEn } from '@/components/sections/GlobalUniversitiesEn';
import { SubscribeInspiresEn } from '@/components/sections/SubscribeEn';
import { GlobalCommunity } from '@/components/sections/GlobalCommunity';
import { Media } from '@/components/sections/Media';

export function NgsInspiresEn() {
  return (
    <>
      <Navbar locale="en" />
      <Hero src="/static/img/Graduation.jpg" alt="Graduates celebrating with caps in the air" locale="en" />
      <IntroInspiresEn />
      <Inspires locale="en" />
      <GlobalIndustryLeadersEn />
      <SparkLabEn />
      <GlobalUniversitiesEn />
      <SubscribeInspiresEn />
      <GlobalCommunity locale="en" />
      <Media locale="en" />
      <CustomerServiceFab locale="en" />
      <Footer locale="en" />
    </>
  );
}
