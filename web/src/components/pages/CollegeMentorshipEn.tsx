import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { CustomerServiceFab } from '@/components/layout/CustomerServiceFab';
import { Hero } from '@/components/sections/Hero';
import { CollegeCounselingEn } from '@/components/sections/CollegeCounselingEn';
import { MentorshipEn } from '@/components/sections/MentorshipEn';
import { GlobalApplicationEn } from '@/components/sections/GlobalApplicationEn';
import { GlobalCommunity } from '@/components/sections/GlobalCommunity';
import { Inspires } from '@/components/sections/Inspires';
import { Media } from '@/components/sections/Media';

export function CollegeMentorshipEn() {
  return (
    <>
      <Navbar locale="en" />
      <Hero src="/static/img/Graduation.jpg" alt="Graduates throwing caps" locale="en" />
      <CollegeCounselingEn />
      <MentorshipEn />
      <GlobalApplicationEn />
      <GlobalCommunity locale="en" />
      <Inspires locale="en" />
      <Media locale="en" />
      <CustomerServiceFab locale="en" />
      <Footer locale="en" />
    </>
  );
}
