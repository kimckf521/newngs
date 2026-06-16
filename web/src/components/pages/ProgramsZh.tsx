import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { CustomerServiceFab } from '@/components/layout/CustomerServiceFab';
import { Hero } from '@/components/sections/Hero';
import { ProgrammesZh } from '@/components/sections/ProgrammesZh';
import { ProgramOptionsZh } from '@/components/sections/ProgramOptionsZh';
import { TakeChargeZh } from '@/components/sections/TakeChargeZh';
import { ComprehensiveZh } from '@/components/sections/ComprehensiveZh';
import { StudentReviewsZh } from '@/components/sections/StudentReviewsZh';
import { GlobalCommunity } from '@/components/sections/GlobalCommunity';
import { PartnerWithNgsZh } from '@/components/sections/PartnerWithNgsZh';
import { Media } from '@/components/sections/Media';

export function ProgramsZh() {
  return (
    <>
      <Navbar locale="zh" />
      <Hero src="/static/img/Graduation.jpg" alt="Graduates throwing caps" locale="zh" />
      <ProgrammesZh />
      <ProgramOptionsZh />
      <TakeChargeZh />
      <ComprehensiveZh />
      <StudentReviewsZh />
      <GlobalCommunity locale="zh" />
      <PartnerWithNgsZh />
      <Media locale="zh" />
      <CustomerServiceFab locale="zh" />
      <Footer locale="zh" />
    </>
  );
}
