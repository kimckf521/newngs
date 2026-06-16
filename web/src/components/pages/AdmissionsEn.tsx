import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { CustomerServiceFab } from '@/components/layout/CustomerServiceFab';
import { Hero } from '@/components/sections/Hero';
import { AdmissionsPlansEn } from '@/components/sections/AdmissionsPlansEn';
import { TakeChargeEn } from '@/components/sections/TakeChargeEn';
import { StudentReviewsEn } from '@/components/sections/StudentReviewsEn';
import { GlobalCommunity } from '@/components/sections/GlobalCommunity';
import { PartnerWithNgsEn } from '@/components/sections/PartnerWithNgsEn';
import { Media } from '@/components/sections/Media';

export function AdmissionsEn() {
  return (
    <>
      <Navbar locale="en" />
      <Hero src="/static/img/Graduation.jpg" alt="Graduates celebrating with caps in the air" locale="en" />
      <AdmissionsPlansEn />
      <TakeChargeEn />
      <StudentReviewsEn />
      <GlobalCommunity locale="en" />
      <PartnerWithNgsEn />
      <Media locale="en" />
      <CustomerServiceFab locale="en" />
      <Footer locale="en" />
    </>
  );
}
