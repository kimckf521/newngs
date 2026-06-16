import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { CustomerServiceFab } from '@/components/layout/CustomerServiceFab';
import { Hero } from '@/components/sections/Hero';
import { CollegeCounselingZh } from '@/components/sections/CollegeCounselingZh';
import { MentorshipZh } from '@/components/sections/MentorshipZh';
import { GlobalApplicationZh } from '@/components/sections/GlobalApplicationZh';
import { GlobalCommunity } from '@/components/sections/GlobalCommunity';
import { Inspires } from '@/components/sections/Inspires';
import { Media } from '@/components/sections/Media';

export function CollegeMentorshipZh() {
  return (
    <>
      <Navbar locale="zh" />
      <Hero src="/static/img/Graduation.jpg" alt="Graduates throwing caps" locale="zh" />
      <CollegeCounselingZh />
      <MentorshipZh />
      <GlobalApplicationZh />
      <GlobalCommunity locale="zh" />
      <Inspires locale="zh" />
      <Media locale="zh" />
      <CustomerServiceFab locale="zh" />
      <Footer locale="zh" />
    </>
  );
}
