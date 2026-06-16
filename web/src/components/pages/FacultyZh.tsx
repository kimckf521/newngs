import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { CustomerServiceFab } from '@/components/layout/CustomerServiceFab';
import { Hero } from '@/components/sections/Hero';
import { FacultiesZh } from '@/components/sections/FacultiesZh';
import { ComprehensiveZh } from '@/components/sections/ComprehensiveZh';
import { StudentReviewsZh } from '@/components/sections/StudentReviewsZh';
import { GlobalCommunity } from '@/components/sections/GlobalCommunity';
import { PartnerWithNgsZh } from '@/components/sections/PartnerWithNgsZh';
import { Media } from '@/components/sections/Media';

export function FacultyZh() {
  return (
    <>
      <Navbar locale="zh" />
      <Hero src="/static/img/Graduation.jpg" alt="Graduates throwing caps" locale="zh" />
      <FacultiesZh />
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
