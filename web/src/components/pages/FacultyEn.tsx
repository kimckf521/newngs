import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { CustomerServiceFab } from '@/components/layout/CustomerServiceFab';
import { Hero } from '@/components/sections/Hero';
import { FacultiesEn } from '@/components/sections/FacultiesEn';
import { ComprehensiveEn } from '@/components/sections/ComprehensiveEn';
import { StudentReviewsEn } from '@/components/sections/StudentReviewsEn';
import { GlobalCommunity } from '@/components/sections/GlobalCommunity';
import { PartnerWithNgsEn } from '@/components/sections/PartnerWithNgsEn';
import { Media } from '@/components/sections/Media';

export function FacultyEn() {
  return (
    <>
      <Navbar locale="en" />
      <Hero src="/static/img/Graduation.jpg" alt="Graduates throwing caps" locale="en" />
      <FacultiesEn />
      <ComprehensiveEn />
      <StudentReviewsEn />
      <GlobalCommunity locale="en" />
      <PartnerWithNgsEn />
      <Media locale="en" />
      <CustomerServiceFab locale="en" />
      <Footer locale="en" />
    </>
  );
}
