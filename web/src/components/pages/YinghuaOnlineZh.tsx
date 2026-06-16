import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { CustomerServiceFab } from '@/components/layout/CustomerServiceFab';
import { Hero } from '@/components/sections/Hero';
import { YcsIntroZh } from '@/components/sections/YcsIntroZh';
import { YcsProgramsZh } from '@/components/sections/YcsProgramsZh';
import { DiplomaProgramZh } from '@/components/sections/DiplomaProgramZh';
import { YcsTeamsZh } from '@/components/sections/YcsTeamsZh';
import { FacultiesZh } from '@/components/sections/FacultiesZh';

export function YinghuaOnlineZh() {
  return (
    <>
      <Navbar locale="zh" />
      <Hero src="/static/img/ycs/ycs_banner.jpg" alt="YCS Online Banner" locale="zh" />
      <YcsIntroZh />
      <YcsProgramsZh />
      <DiplomaProgramZh />
      <YcsTeamsZh />
      <FacultiesZh />
      <CustomerServiceFab locale="zh" />
      <Footer locale="zh" />
    </>
  );
}
