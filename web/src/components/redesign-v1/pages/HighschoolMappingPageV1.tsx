import Image from 'next/image';
import { siteLinks, externalLinks } from '@/lib/siteLinks';
import type { Locale } from '@/i18n/types';
import {
  PageHero,
  Section,
  SectionHeading,
  FeatureCard,
  GlassCard,
  GradientText,
  Badge,
  Button,
} from '../ui';
import { ContactV1 } from '../ContactV1';

/* ------------------------------------------------------------------ *
 * /highschool_mapping — NGS High-School Mapping Program. Bold dark "v1"
 * port of the legacy K12SchoolZh/En + HighschoolMappingProgram +
 * HighschoolMappingSections + GlobalCommunity content. K-12 international
 * high-school planning / mapping, ending with the shared <ContactV1>.
 * ------------------------------------------------------------------ */

type Pillar = { number: number; title: string; items: string[] };
type Specialist = { name: string; credential: string; img: string; imgDescriptor: string; bio: string[] };

const content: Record<Locale, {
  hero: { eyebrow: string; title: React.ReactNode; lead: string; book: string; talk: string };
  program: {
    eyebrow: string;
    title: React.ReactNode;
    paragraphs: string[];
    imageAlt: string;
    cta: string;
  };
  pillars: { eyebrow: string; title: React.ReactNode; sub: string; curricula: string[]; list: Pillar[]; cta: string };
  community: { eyebrow: string; title: React.ReactNode; sub: string; locations: string[] };
  specialists: { eyebrow: string; title: React.ReactNode; sub: string; role: string; list: Specialist[] };
}> = {
  en: {
    hero: {
      eyebrow: 'NGS High-School Mapping',
      title: (
        <>
          A clear roadmap to the <GradientText>right high school</GradientText>
        </>
      ),
      lead:
        'The NGS High-School Mapping Program gives students a structured roadmap that aligns their high-school journey with their future academic and career aspirations.',
      book: 'Book a free call',
      talk: 'Talk to an advisor',
    },
    program: {
      eyebrow: 'The program',
      title: (
        <>
          High-school planning, <GradientText>mapped end to end</GradientText>
        </>
      ),
      paragraphs: [
        'By mapping out key milestones — curriculum and course selection, extracurricular activities and skill development — the program ensures students are well-prepared for college readiness and beyond.',
        'It empowers students to set meaningful goals, manage their progress effectively, and make informed decisions throughout high school — building a strong foundation for success in higher education and life.',
      ],
      imageAlt: 'NGS students on a high-school mapping campus visit',
      cta: 'Book a free call',
    },
    pillars: {
      eyebrow: 'High-school mapping',
      title: (
        <>
          Four pillars across <GradientText>every curriculum</GradientText>
        </>
      ),
      sub: 'A complete service across A-Level, IB, AP and HKDSE — from choosing the right school to walking through the entrance exam.',
      curricula: ['A-Level', 'IB', 'AP', 'HKDSE'],
      list: [
        {
          number: 1,
          title: 'School Visits',
          items: ['Growth mapping', 'School list', 'On-site school visits', 'Interview & test scheduling'],
        },
        {
          number: 2,
          title: 'School Reports',
          items: [
            'School profile',
            'Curriculum systems',
            'School board',
            'School leadership',
            'School faculty',
            'Student demographics',
            'Track record & university placement',
          ],
        },
        {
          number: 3,
          title: 'Entrance-Exam Preparation',
          items: ['General assessment', 'English exam coaching', 'Math exam coaching', 'Interview preparation'],
        },
        {
          number: 4,
          title: 'Academic Planning',
          items: [
            'Online Diploma Program',
            'Hybrid (distance) learning',
            'Dual-track learning',
            'On-campus exam arrangements',
            'High-school diploma',
            'University applications',
          ],
        },
      ],
      cta: 'Book a free call',
    },
    community: {
      eyebrow: 'NextGen global community',
      title: (
        <>
          Guidance from a <GradientText>worldwide network</GradientText>
        </>
      ),
      sub: 'Your mapping team draws on schools, mentors and alumni across our global community.',
      locations: ['San Francisco', 'Melbourne', 'Hong Kong', 'Taiwan', 'Greater Bay Area, China'],
    },
    specialists: {
      eyebrow: 'Your specialists',
      title: (
        <>
          NGS K-12 <GradientText>school specialists</GradientText>
        </>
      ),
      sub: 'Mentors from leading global universities who know the international-school landscape inside out.',
      role: 'NGS K-12 school specialist',
      list: [
        {
          name: 'Scarlett Sampson',
          credential: 'MBA @ University of Texas',
          img: '/static/img/profiles/Scarlet.jpg',
          imgDescriptor: 'MBA, University of Texas',
          bio: [
            'Fortune 500 executive & Silicon Valley tech leader',
            '20+ years leading engineering teams',
            'Expert interviewer who has hired 500+ graduates',
            'Deep connections across tech & business sectors',
            'Career coaching, leadership development & academic mentoring',
          ],
        },
        {
          name: 'Paul Chiu',
          credential: 'Masters in Double E @ Melbourne U',
          img: '/static/img/profiles/Paul.jpg',
          imgDescriptor: 'IB/A-Level/AP STEM tutor',
          bio: [
            'IB / A-Level / AP expert in Math, Physics, Chemistry & CS',
            'Super responsive — answers all questions and researches the tough ones',
            'AMC12 1st place · AP CS A: 5/5 · 3+ years tutoring experience',
          ],
        },
        {
          name: 'Nancy Wu',
          credential: 'Mechanical Engineering @ Melbourne U',
          img: '/static/img/profiles/Nancy.jpg',
          imgDescriptor: 'IB graduate, STEM mentor',
          bio: [
            'IB top graduate (Singapore); expert across multiple curricula',
            'Co-founder of Zeta Technology, advancing AI & Web3 education',
            `Former engineer on ACRUX, Australia${'’'}s first student-built satellite`,
            'STEM education & college guidance for Singapore & Australian universities',
          ],
        },
        {
          name: 'Valerie Zhou',
          credential: 'Business Management @ Essex University',
          img: '/static/img/profiles/Valerie.jpg',
          imgDescriptor: 'IELTS mentor',
          bio: [
            'IELTS perfect-score mentor and independent artist',
            '15+ years of experience in tier-one international schools in China',
            'Native-level proficiency in English, Mandarin & Cantonese',
          ],
        },
      ],
    },
  },
  zh: {
    hero: {
      eyebrow: 'NGS 国际高中规划',
      title: (
        <>
          清晰的<GradientText>择校路线图</GradientText>
        </>
      ),
      lead:
        'NGS 国际高中规划咨询为学生提供清晰、全景化的路线规划图，帮助学生将高中学习与未来学业及职业目标紧密结合。',
      book: '预约免费咨询',
      talk: '咨询顾问',
    },
    program: {
      eyebrow: '规划服务',
      title: (
        <>
          高中规划，<GradientText>全程陪伴</GradientText>
        </>
      ),
      paragraphs: [
        'NGS 国际高中规划涵盖国际课程路线选择、高中选课、课外活动与技能发展等关键决策，确保学生为大学及未来发展做好充分准备。',
        '本服务旨在帮助学生设定符合自我发展的目标，有效进行学业规划，并作出最适合个人发展和家庭综合情况的求学路径选择。',
      ],
      imageAlt: 'NGS 学生高中规划探校参访',
      cta: '预约免费咨询',
    },
    pillars: {
      eyebrow: '高中规划',
      title: (
        <>
          四大模块，<GradientText>覆盖全课程体系</GradientText>
        </>
      ),
      sub: '覆盖 A-Level、IB、AP 与 HKDSE 的完整服务 —— 从选对学校到走进入学考试，全程陪伴。',
      curricula: ['A-Level', 'IB', 'AP', 'HKDSE'],
      list: [
        {
          number: 1,
          title: 'K12 国际学校探校',
          items: ['成长地图', '学校清单', '实地探校', '入学考试预约'],
        },
        {
          number: 2,
          title: '学校综合情况报告',
          items: [
            '学校简介',
            '课程体系',
            '学校董事会',
            '学校管理层',
            '教职员工',
            '学生分布',
            '毕业成绩及大学录取',
          ],
        },
        {
          number: 3,
          title: '入学考试准备',
          items: ['综合水平测试', '英文考试辅导', '数学考试辅导', '面试辅导'],
        },
        {
          number: 4,
          title: '学术规划',
          items: [
            '未来无界文凭课程',
            '未来全域学习计划',
            '未来教育双轨计划',
            '在校考试安排',
            '高中文凭',
            '大学申请',
          ],
        },
      ],
      cta: '预约免费咨询',
    },
    community: {
      eyebrow: '未来学者全球社区',
      title: (
        <>
          来自<GradientText>全球网络</GradientText>的指导
        </>
      ),
      sub: '您的规划团队依托遍布全球社区的学校、导师与校友资源。',
      locations: ['美国三藩市', '澳大利亚墨尔本', '中国香港', '中国台湾', '中国大湾区'],
    },
    specialists: {
      eyebrow: '专属导师',
      title: (
        <>
          K-12 国际学校<GradientText>择校指导老师</GradientText>
        </>
      ),
      sub: '来自全球顶尖大学的导师，深谙国际学校生态与升学路径。',
      role: 'NGS K-12 国际学校择校指导老师',
      list: [
        {
          name: 'Scarlett Sampson',
          credential: 'MBA @ University of Texas',
          img: '/static/img/profiles/Scarlet.jpg',
          imgDescriptor: '德州大学 MBA',
          bio: [
            '财富 500 强高管 & 硅谷科技领袖',
            '20+ 年工程团队领导经验',
            '面试专家，已招募 500+ 毕业生',
            '深厚产业人脉（科技／商业）',
            '职业辅导、领导力、导师培养与学业指导',
          ],
        },
        {
          name: 'Paul Chiu',
          credential: 'Masters in Double E @ Melbourne U',
          img: '/static/img/profiles/Paul.jpg',
          imgDescriptor: 'IB/A-Level/AP 理科导师',
          bio: [
            '精通 IB / A-Level / AP 数理化与计算机',
            '超快响应，难题深挖与资料扩展',
            'AMC12 冠军 · AP CS A：5/5 · 3+ 年授课经验',
          ],
        },
        {
          name: 'Nancy Wu',
          credential: 'Mechanical Engineering @ Melbourne U',
          img: '/static/img/profiles/Nancy.jpg',
          imgDescriptor: 'IB 毕业生 · 理科导师',
          bio: [
            '新加坡 IB 顶尖毕业生，多体系专家',
            'Zeta Technology 联合创始人（AI & Web3 教育）',
            '曾参与澳洲首颗学生自建卫星 ACRUX 项目',
            '擅长新加坡与澳洲院校升学指导',
          ],
        },
        {
          name: 'Valerie Zhou',
          credential: 'Business Management @ Essex University',
          img: '/static/img/profiles/Valerie.jpg',
          imgDescriptor: '雅思满分导师',
          bio: [
            '雅思满分导师，独立艺术家',
            '在中国一线国际学校 15+ 年经验',
            '英语 / 普通话 / 粤语母语级流利',
          ],
        },
      ],
    },
  },
};

export function HighschoolMappingPageV1({ locale }: { locale: Locale }) {
  const t = content[locale];
  const links = siteLinks[locale];

  return (
    <>
      <PageHero
        eyebrow={t.hero.eyebrow}
        title={t.hero.title}
        lead={t.hero.lead}
        primary={{ label: t.hero.book, href: externalLinks.customerServiceWeChat, external: true }}
        secondary={{ label: t.hero.talk, href: '#contact' }}
      />

      {/* The program — intro + visit photo */}
      <Section tone="night-800" glow="violet" glowPosition="right">
        <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
          <div>
            <SectionHeading eyebrow={t.program.eyebrow} title={t.program.title} />
            <div className="mt-8 space-y-5">
              {t.program.paragraphs.map((p) => (
                <p key={p} className="text-[15px] leading-relaxed text-white/65">
                  {p}
                </p>
              ))}
            </div>
            <div className="mt-9">
              <Button href={externalLinks.customerServiceWeChat} external variant="gradient">
                {t.program.cta}
              </Button>
            </div>
          </div>
          <div className="relative aspect-[4/3] overflow-hidden rounded-3xl border border-white/10">
            <Image
              src="/static/img/vanke.JPG"
              alt={t.program.imageAlt}
              fill
              sizes="(min-width:1024px) 45vw, 100vw"
              className="object-cover"
            />
            <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-night/50 to-transparent" />
          </div>
        </div>
      </Section>

      {/* Four pillars + curriculum badges */}
      <Section tone="night" glow="cyan" glowPosition="left">
        <SectionHeading eyebrow={t.pillars.eyebrow} title={t.pillars.title} sub={t.pillars.sub} />
        <div className="mt-8 flex flex-wrap gap-2.5">
          {t.pillars.curricula.map((c) => (
            <Badge key={c}>{c}</Badge>
          ))}
        </div>
        <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          {t.pillars.list.map((p) => (
            <FeatureCard key={p.title} number={p.number} title={p.title} items={p.items} />
          ))}
        </div>
        <div className="mt-12">
          <Button href={externalLinks.customerServiceWeChat} external variant="gradient">
            {t.pillars.cta}
          </Button>
        </div>
      </Section>

      {/* Global community */}
      <Section tone="night-800" glow="magenta" glowPosition="center">
        <SectionHeading eyebrow={t.community.eyebrow} title={t.community.title} sub={t.community.sub} align="center" />
        <div className="mx-auto mt-10 flex max-w-3xl flex-wrap justify-center gap-2.5">
          {t.community.locations.map((loc) => (
            <Badge key={loc}>{loc}</Badge>
          ))}
        </div>
      </Section>

      {/* K-12 school specialists */}
      <Section tone="night" glow="violet" glowPosition="left">
        <SectionHeading eyebrow={t.specialists.eyebrow} title={t.specialists.title} sub={t.specialists.sub} />
        <div className="mt-12 grid gap-5 md:grid-cols-2">
          {t.specialists.list.map((s) => (
            <GlassCard key={s.name} className="flex h-full flex-col p-7 sm:flex-row sm:gap-6">
              <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-2xl border border-white/10">
                <Image src={s.img} alt={`${s.name} — ${s.imgDescriptor}`} fill sizes="80px" className="object-cover" />
              </div>
              <div className="mt-5 sm:mt-0">
                <h3 className="font-grotesk text-lg font-bold text-white">{s.name}</h3>
                <p className="mt-1 text-sm text-white/55">{s.credential}</p>
                <ul className="mt-4 space-y-2">
                  {s.bio.map((line) => (
                    <li key={line} className="flex items-start gap-2.5 text-sm leading-relaxed text-white/70">
                      <span aria-hidden className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-ngs-gradient" />
                      {line}
                    </li>
                  ))}
                </ul>
              </div>
            </GlassCard>
          ))}
        </div>
        <div className="mt-12">
          <Button href={links.faculty} variant="glass" withArrow>
            {locale === 'zh' ? '查看全部师资' : 'Meet the full faculty'}
          </Button>
        </div>
      </Section>

      <ContactV1 locale={locale} />
    </>
  );
}
