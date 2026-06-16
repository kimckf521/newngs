import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { CustomerServiceFab } from '@/components/layout/CustomerServiceFab';
import { Hero } from '@/components/sections/Hero';
import { AdmissionsPlansZh } from '@/components/sections/AdmissionsPlansZh';
import { TakeChargeZh } from '@/components/sections/TakeChargeZh';
import { StudentReviewsZh } from '@/components/sections/StudentReviewsZh';
import { GlobalCommunity } from '@/components/sections/GlobalCommunity';
import { PartnerWithNgsZh } from '@/components/sections/PartnerWithNgsZh';
import { Media } from '@/components/sections/Media';

export function AdmissionsZh() {
  return (
    <>
      <Navbar locale="zh" />
      <Hero src="/static/img/Graduation.jpg" alt="Graduates celebrating with caps in the air" locale="zh" />
      <AdmissionsPlansZh />
      <TakeChargeZh />
      <StudentReviewsZh />
      <GlobalCommunity locale="zh" />
      <PartnerWithNgsZh />
      <Media locale="zh" />
      <CustomerServiceFab locale="zh" />
      <Footer locale="zh" />
    </>
  );
}
