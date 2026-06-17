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
  Stat,
  IconStar,
  IconCap,
  IconUsers,
  IconGlobe,
  IconSpark,
} from '../ui';
import { ContactV1 } from '../ContactV1';

/* ------------------------------------------------------------------ *
 * /college_mentorship — University admissions mentorship & counseling.
 * Bold dark "v1" rebuild of the legacy CollegeMentorship pages:
 * faithful port of the Mentorship, GlobalApplication, College Counseling
 * faculty, Inspires pillars and Global Community sections.
 * ------------------------------------------------------------------ */

const FLAGS = '🇺🇸 🇬🇧 🇨🇦 🇦🇺 🇭🇰 🇸🇬';

type Pillar = { title: string; items: string[] };
type Advisor = { name: string; img: string; bio: string[] };
type Pillar2 = { icon: React.ReactNode; title: string; body: string };

const content: Record<Locale, {
  hero: { eyebrow: string; title: React.ReactNode; lead: string; primary: string; secondary: string };
  stats: { value: string; label: string }[];
  program: {
    eyebrow: string;
    title: React.ReactNode;
    paragraphs: React.ReactNode[];
    cta: string;
  };
  application: {
    eyebrow: string;
    title: React.ReactNode;
    sub: string;
    pillars: Pillar[];
  };
  inspires: { eyebrow: string; title: React.ReactNode; sub: string; cards: Pillar2[] };
  counseling: {
    eyebrow: string;
    title: React.ReactNode;
    sub: string;
    advisors: Advisor[];
  };
  community: {
    eyebrow: string;
    title: React.ReactNode;
    sub: string;
    locations: React.ReactNode;
  };
}> = {
  en: {
    hero: {
      eyebrow: 'College mentorship',
      title: (
        <>
          Your roadmap to a <GradientText>dream university</GradientText>
        </>
      ),
      lead:
        'The NGS College Mentorship Program is a personalized guidance initiative that empowers students to navigate the complex journey of college admissions — with Four-on-one mentorship behind every decision.',
      primary: 'Book a free consultation',
      secondary: 'Talk to an advisor',
    },
    stats: [
      { value: '4-on-1', label: 'Dedicated mentor team per student' },
      { value: '6', label: 'Destination regions: US · UK · CA · AU · HK · SG' },
      { value: '500+', label: 'Graduates interviewed by our advisors' },
      { value: '1:1', label: 'Personalised application strategy' },
    ],
    program: {
      eyebrow: 'The program',
      title: (
        <>
          A <GradientText>Four-on-one</GradientText> mentorship built around the student
        </>
      ),
      paragraphs: [
        <>
          The <strong className="text-white">NGS College Mentorship Program</strong> is a personalized guidance
          initiative designed to empower students in navigating the complex journey of college admissions.
          Through <strong className="text-white">Four-on-one</strong> mentorship, students receive tailored
          support in identifying their passions, refining their academic and extracurricular profiles, and
          building a strategic plan for university applications.
        </>,
        <>
          The program emphasizes informed decision-making, helping students select the right colleges and
          programs while meeting application requirements and deadlines. With expert mentorship, students are
          equipped to confidently pursue their higher education goals and thrive in their academic future.
        </>,
      ],
      cta: 'Book a free consultation',
    },
    application: {
      eyebrow: 'Global application',
      title: (
        <>
          Everything a <GradientText>complete application</GradientText> needs
        </>
      ),
      sub: 'From academic planning to portfolios, exams and an optional diploma — we cover the full path to universities in the US, UK, Canada, Australia, Hong Kong and Singapore.',
      pillars: [
        {
          title: 'Comprehensive College Plan',
          items: [
            'Academic Planning',
            'College List',
            'PS / CV Writing',
            'Reference Letters',
            'Interview Prep',
            'Meet Industry Mentors',
            'Find Your Tribe',
          ],
        },
        {
          title: 'Portfolio Preparation',
          items: ['Visual Arts Portfolio', 'Music & Performance Portfolio'],
        },
        {
          title: 'Exam Preparation',
          items: ['SAT / IELTS Prep', 'Essay Writing Clinic', 'Subject Tutoring', 'Competition Tutoring'],
        },
        {
          title: 'Diploma (Optional)',
          items: [
            'Distance Learning',
            'Hybrid Learning',
            'Dual-track Learning',
            'On-campus Exams',
            'High School Diploma',
          ],
        },
      ],
    },
    inspires: {
      eyebrow: 'NextGen Inspires',
      title: (
        <>
          A global community <GradientText>behind every applicant</GradientText>
        </>
      ),
      sub: 'Mentorship at NGS extends far beyond the application — students plug into a worldwide network of leaders, universities, peers and alumni.',
      cards: [
        {
          icon: <IconStar />,
          title: 'Global Industry Leaders',
          body: 'Expert-led webinars, mentorship programs and career workshops give students first-hand insight into emerging trends, career pathways and the real-world skills that win in a competitive global market.',
        },
        {
          icon: <IconCap />,
          title: 'Global Universities',
          body: 'Long-term partnerships with renowned universities worldwide open exclusive admissions guidance, programme introductions, campus tours and networking opportunities.',
        },
        {
          icon: <IconSpark />,
          title: 'SPARK LAB',
          body: 'An interactive platform connecting K-12 students worldwide to collaborate, innovate and create — building a global perspective and the confidence to lead.',
        },
        {
          icon: <IconUsers />,
          title: 'Global Alumni',
          body: 'A thriving network of international alumni who have already reached their academic and professional goals, offering mentorship, guidance and inspiration to those walking a similar path.',
        },
      ],
    },
    counseling: {
      eyebrow: 'College counseling team',
      title: (
        <>
          Meet your <GradientText>admissions mentors</GradientText>
        </>
      ),
      sub: 'Industry insiders and top graduates who have guided students into the world’s leading universities.',
      advisors: [
        {
          name: 'Scarlett Sampson | MBA @ University of Texas',
          img: '/static/img/profiles/Scarlet.jpg',
          bio: [
            'Fortune 500 Executive & Silicon Valley Tech Leader',
            '20+ years leading engineering teams',
            'Expert interviewer who has hired 500+ graduates',
            'Industry insider with deep connections in tech & business',
            'Career coaching, leadership development & academic mentoring',
          ],
        },
        {
          name: 'Nancy Wu | Mechanical Engineering @ Melbourne U',
          img: '/static/img/profiles/Nancy.jpg',
          bio: [
            'Top IB graduate from Singapore; expert across multiple curriculums',
            'Co-founder of Zeta Technology — AI & Web3-powered education',
            'Former engineer on ACRUX, Australia’s first student-built satellite',
            'STEM education & college guidance for Singapore & Australian universities',
          ],
        },
        {
          name: 'Nicole Wen | Law @ University of Bristol | IB 40',
          img: '/static/img/profiles/Nicole.jpg',
          bio: [
            'Specialises in English, TOK, Extended Essay and university applications',
            'Bilingual (English / Chinese) — makes complex concepts simple',
            'Mentored a student into Cambridge Law',
            'Strong academic writing support',
          ],
        },
        {
          name: 'Valerie Zhou | Business Management @ Essex University',
          img: '/static/img/profiles/Valerie.jpg',
          bio: [
            'IELTS perfect-score mentor and independent artist',
            '15 years of experience in tier-one international schools',
            'Native-level English, Mandarin and Cantonese',
            'Contemporary art curator and visual artist',
          ],
        },
      ],
    },
    community: {
      eyebrow: 'Global community',
      title: (
        <>
          The <GradientText>NextGen global</GradientText> community
        </>
      ),
      sub: 'A network spanning four continents, connecting students to mentors and universities wherever they aim.',
      locations: (
        <>
          San Francisco · Melbourne
          <br />
          Hong Kong · Taiwan · Greater Bay Area, China
        </>
      ),
    },
  },
  zh: {
    hero: {
      eyebrow: '升学辅导课程',
      title: (
        <>
          通往<GradientText>梦校</GradientText>的升学路线图
        </>
      ),
      lead:
        'NGS 升学辅导课程是一项针对每个学生量身定制的个性化大学升学辅导课程，帮助学生从容应对繁重的高中课业与复杂的大学申请流程 —— 由 4 对 1 导师团队陪伴每一个关键决策。',
      primary: '预约免费咨询',
      secondary: '咨询顾问',
    },
    stats: [
      { value: '4 对 1', label: '每位学生专属导师团队' },
      { value: '6', label: '升学目的地：美 · 英 · 加 · 澳 · 港 · 新' },
      { value: '500+', label: '顾问累计面试录用的毕业生' },
      { value: '1 对 1', label: '个性化申请策略' },
    ],
    program: {
      eyebrow: '课程介绍',
      title: (
        <>
          以学生为中心的 <GradientText>4 对 1</GradientText> 导师计划
        </>
      ),
      paragraphs: [
        <>
          <strong className="text-white">NGS 升学辅导课程</strong>{' '}
          是一项针对每个学生度身制定的个性化大学升学辅导课程，旨在帮助学生从容应付繁重的高中课业和复杂的大学升学流程。通过{' '}
          <strong className="text-white">4 对 1</strong>{' '}
          导师计划，学生可以获得全方位的支持，保证他们时间规划系统合理，在完成学术目标和课外项目的同时，为大学申请制定系统性目标和行动计划。
        </>,
        <>
          本课程重点在于保证学生在充分知情的情况下，做出最适合个人长期发展的各项重要决策，帮助学生在满足申请要求和截止日期的同时，选择合适的大学和课程。在 NGS 升学老师的指导下，学生们有能力自信地冲击梦校，并在未来的学术生涯中茁壮成长。
        </>,
      ],
      cta: '预约免费咨询',
    },
    application: {
      eyebrow: '全球升学',
      title: (
        <>
          一份<GradientText>完整申请</GradientText>所需的全部环节
        </>
      ),
      sub: '从学术规划到作品集、考试与可选文凭 —— 全程覆盖美国、英国、加拿大、澳大利亚、香港与新加坡的升学路径。',
      pillars: [
        {
          title: '全面的大学申请辅导',
          items: ['学术规划', '梦校清单', '申请文书写作', '推荐信', '面试准备', '职业导师', '同龄伙伴'],
        },
        {
          title: '作品集准备',
          items: ['视觉艺术作品集', '音乐 / 表演作品集'],
        },
        {
          title: '考试准备',
          items: ['SAT / IELTS 冲刺', '写作诊所', '科目辅导', '竞赛辅导'],
        },
        {
          title: '文凭（可选）',
          items: ['线上课程', '线上 + 线下课程', '双轨课程', '国际科目考试', '高中文凭'],
        },
      ],
    },
    inspires: {
      eyebrow: 'NextGen Inspires',
      title: (
        <>
          每位申请者<GradientText>背后的全球社区</GradientText>
        </>
      ),
      sub: 'NGS 的导师计划远不止于申请本身 —— 学生还将接入一个连接全球领袖、大学、同龄伙伴与校友的网络。',
      cards: [
        {
          icon: <IconStar />,
          title: '全球行业领袖',
          body: '通过行业专家主讲的线上研讨会、导师计划与职业发展工作坊，学生可深入了解新兴趋势、职业路径，以及在竞争激烈的全球市场中取得成功所需的实战技能。',
        },
        {
          icon: <IconCap />,
          title: '全球高校直连',
          body: '与世界知名大学建立长期合作，为学生提供独家升学指导、专业介绍、校园参观以及众多交流拓展机会，助力他们迈向更广阔的未来。',
        },
        {
          icon: <IconSpark />,
          title: 'SPARK LAB',
          body: '一个连接全球中学生的互动平台，鼓励他们协作、创新与创作，培养全球视野，并引导他们在塑造未来中发挥领导作用。',
        },
        {
          icon: <IconUsers />,
          title: '全球校友',
          body: '一个充满活力的跨国校友网络，这些校友已实现各自的学术与职业目标，为学生提供导师支持、指导建议与灵感启发。',
        },
      ],
    },
    counseling: {
      eyebrow: '升学指导团队',
      title: (
        <>
          认识你的<GradientText>升学导师</GradientText>
        </>
      ),
      sub: '行业内部人士与顶尖毕业生，已帮助众多学生迈入世界一流大学。',
      advisors: [
        {
          name: 'Scarlett Sampson | MBA @ University of Texas',
          img: '/static/img/profiles/Scarlet.jpg',
          bio: [
            '财富 500 强企业高管 & 硅谷科技领袖',
            '超过 20 年领导工程团队经验',
            '面试专家，已面试并录用 500+ 毕业生',
            '行业内部人士：深厚的科技与商业人脉',
            '擅长职业辅导、领导力培养、导师培养与学业指导',
          ],
        },
        {
          name: 'Nancy Wu | Mechanical Engineering @ Melbourne U',
          img: '/static/img/profiles/Nancy.jpg',
          bio: [
            '新加坡 IB 顶尖毕业生；精通多种课程体系',
            'Zeta Technology 联合创始人，专注 AI 与 Web3 教育',
            '曾任澳大利亚首颗学生自建卫星 ACRUX 工程师',
            '擅长新加坡及澳洲大学升学辅导，STEM 教育经验丰富',
          ],
        },
        {
          name: 'Nicole Wen | Law @ University of Bristol | IB 40',
          img: '/static/img/profiles/Nicole.jpg',
          bio: [
            '专长于英语、TOK、拓展论文与大学申请',
            '中英文双语，能将复杂概念讲解得浅显易懂',
            '曾指导学生成功考入剑桥大学法律专业',
            '擅长学术写作辅导',
          ],
        },
        {
          name: 'Valerie Zhou | Business Management @ Essex University',
          img: '/static/img/profiles/Valerie.jpg',
          bio: [
            '雅思满分导师，同时是独立艺术家',
            '在中国顶尖国际学校有 15 年工作经验',
            '英语、普通话、粤语母语级流利',
            '当代艺术策展人 & 视觉艺术家',
          ],
        },
      ],
    },
    community: {
      eyebrow: '全球社区',
      title: (
        <>
          未来学者<GradientText>全球社区</GradientText>
        </>
      ),
      sub: '一个横跨四大洲的网络，无论学生志在何方，都能连接到对应的导师与大学。',
      locations: (
        <>
          美国三藩市 · 澳大利亚墨尔本
          <br />
          中国香港 · 中国台湾 · 中国大湾区
        </>
      ),
    },
  },
};

export function CollegeMentorshipPageV1({ locale }: { locale: Locale }) {
  const t = content[locale];
  const links = siteLinks[locale];

  return (
    <>
      <PageHero
        eyebrow={t.hero.eyebrow}
        title={t.hero.title}
        lead={t.hero.lead}
        primary={{ label: t.hero.primary, href: externalLinks.customerServiceWeChat, external: true }}
        secondary={{ label: t.hero.secondary, href: '#contact' }}
      >
        <div className="mt-14 w-full">
          <dl className="grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-4">
            {t.stats.map((s) => (
              <Stat key={s.label} value={s.value} label={s.label} className="text-center" />
            ))}
          </dl>
        </div>
      </PageHero>

      {/* Program overview */}
      <Section tone="night-800" glow="violet" glowPosition="right">
        <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
          <div className="relative aspect-[4/3] overflow-hidden rounded-3xl border border-white/10">
            <Image
              src="/static/img/bridgecity.jpg"
              alt=""
              fill
              sizes="(min-width:1024px) 45vw, 100vw"
              className="object-cover"
            />
            <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-night/60 to-transparent" />
          </div>
          <div>
            <SectionHeading eyebrow={t.program.eyebrow} title={t.program.title} />
            <div className="mt-8 space-y-5 text-[15px] leading-relaxed text-white/70">
              {t.program.paragraphs.map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </div>
            <div className="mt-9">
              <Button href={externalLinks.customerServiceWeChat} external variant="gradient">
                {t.program.cta}
              </Button>
            </div>
          </div>
        </div>
      </Section>

      {/* Global application — four pillars */}
      <Section tone="night" glow="cyan" glowPosition="left">
        <SectionHeading eyebrow={t.application.eyebrow} title={t.application.title} sub={t.application.sub} />
        <div className="mt-8 flex flex-wrap gap-2.5">
          <Badge>{FLAGS}</Badge>
        </div>
        <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          {t.application.pillars.map((p, i) => (
            <FeatureCard key={p.title} number={i + 1} title={p.title} items={p.items} />
          ))}
        </div>
      </Section>

      {/* NextGen Inspires — global community pillars */}
      <Section tone="night-800" glow="magenta" glowPosition="center">
        <SectionHeading
          eyebrow={t.inspires.eyebrow}
          title={t.inspires.title}
          sub={t.inspires.sub}
          align="center"
        />
        <div className="mx-auto mt-12 grid max-w-6xl gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {t.inspires.cards.map((c) => (
            <FeatureCard key={c.title} icon={c.icon} title={c.title} description={c.body} />
          ))}
        </div>
      </Section>

      {/* College counseling team */}
      <Section tone="night" glow="violet" glowPosition="right">
        <SectionHeading eyebrow={t.counseling.eyebrow} title={t.counseling.title} sub={t.counseling.sub} />
        <div className="mt-12 grid gap-5 md:grid-cols-2">
          {t.counseling.advisors.map((a) => {
            const [advisorName, ...credentialParts] = a.name.split('|');
            const credential = credentialParts.join('|').trim();
            return (
              <GlassCard key={a.name} className="flex h-full gap-5 p-7">
                <Image
                  src={a.img}
                  alt={advisorName.trim()}
                  width={88}
                  height={88}
                  className="h-20 w-20 shrink-0 rounded-2xl object-cover ring-1 ring-white/15"
                />
                <div>
                  <h3 className="font-grotesk text-base font-bold text-white">{advisorName.trim()}</h3>
                  {credential && (
                    <p className="mt-1 text-xs font-medium uppercase tracking-[0.08em] text-ngs-cyan/80">
                      {credential}
                    </p>
                  )}
                  <ul className="mt-4 space-y-2">
                    {a.bio.map((line) => (
                      <li key={line} className="flex items-start gap-2.5 text-sm leading-relaxed text-white/65">
                        <span aria-hidden className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-ngs-gradient" />
                        {line}
                      </li>
                    ))}
                  </ul>
                </div>
              </GlassCard>
            );
          })}
        </div>
      </Section>

      {/* Global community */}
      <Section tone="night-800" glow="cyan" glowPosition="left">
        <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
          <div>
            <SectionHeading eyebrow={t.community.eyebrow} title={t.community.title} sub={t.community.sub} />
            <div className="mt-8 flex items-center gap-3 text-white/60">
              <IconGlobe className="text-ngs-cyan" />
              <p className="text-[15px] leading-relaxed text-white/70">{t.community.locations}</p>
            </div>
            <div className="relative mt-8 aspect-[2/1] w-full overflow-hidden">
              <Image
                src="/static/img/world-map.png"
                alt=""
                fill
                sizes="(min-width:1024px) 45vw, 100vw"
                className="object-contain object-left"
              />
            </div>
          </div>
          <div className="relative aspect-[3/2] overflow-hidden rounded-3xl border border-white/10">
            <Image
              src="/static/img/harvard.jpg"
              alt=""
              fill
              sizes="(min-width:1024px) 45vw, 100vw"
              className="object-cover"
            />
            <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-night/50 to-transparent" />
          </div>
        </div>
      </Section>

      <ContactV1 locale={locale} />
    </>
  );
}
