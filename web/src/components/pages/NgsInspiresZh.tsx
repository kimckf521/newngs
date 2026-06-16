import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { CustomerServiceFab } from '@/components/layout/CustomerServiceFab';
import { Hero } from '@/components/sections/Hero';
import { IntroInspiresZh } from '@/components/sections/IntroInspiresZh';
import { Inspires } from '@/components/sections/Inspires';
import { GlobalIndustryLeadersZh } from '@/components/sections/GlobalIndustryLeadersZh';
import { SparkLabZh } from '@/components/sections/SparkLabZh';
import { GlobalUniversitiesZh } from '@/components/sections/GlobalUniversitiesZh';
import { SubscribeInspiresZh } from '@/components/sections/SubscribeInspiresZh';
import { GlobalCommunity } from '@/components/sections/GlobalCommunity';
import { Media } from '@/components/sections/Media';

export function NgsInspiresZh() {
  return (
    <>
      <Navbar locale="zh" />
      <Hero src="/static/img/Graduation.jpg" alt="Graduates celebrating with caps in the air" locale="zh" />
      <IntroInspiresZh />
      <Inspires locale="zh" />
      <GlobalIndustryLeadersZh />
      <SparkLabZh />
      <GlobalUniversitiesZh />
      <SubscribeInspiresZh />
      <GlobalCommunity locale="zh" />
      <Media locale="zh" />
      <CustomerServiceFab locale="zh" />
      <Footer locale="zh" />
    </>
  );
}
