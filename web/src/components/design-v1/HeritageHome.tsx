import type { ReactNode } from 'react';
import Link from 'next/link';
import { siteLinks, externalLinks } from '@/lib/siteLinks';
import { founderStory } from '@/content/founder';
import { footer as footerContent } from '@/content/footer';
import type { Locale } from '@/i18n/types';
import { Container, Eyebrow, Button, ArrowLink, GoldRule, SectionLabel } from './ui';
import { HeritageHeader } from './HeritageHeader';
import { HeritageContact } from './HeritageContact';

/* ================================================================== *
 * "Heritage Prestige" homepage (/design-v1).
 * A light, architectural, editorial alternative — ivory paper, deep navy
 * ink, antique-gold hairlines, Playfair Display serif, no photography.
 * Bilingual; reuses the real NGS content where it adds substance.
 * ================================================================== */

type Stat = { n: string; l: string };
type Point = { rn: string; t: string; d: string };
type Card = { n: string; t: string; items: string[]; href: string };
type Step = { n: string; t: string; d: string };
type Hub = { c: string; r: string };
type Quote = { q: string; a: string; r: string };

type Content = {
  hero: { eyebrow: string; title: ReactNode; lead: string; primary: string; secondary: string; stats: Stat[] };
  accred: { label: string; items: string[] };
  promise: { kicker: string; title: ReactNode; intro: string; points: Point[] };
  framework: { kicker: string; title: string; intro: string; cards: Card[]; cta: string };
  approach: { kicker: string; title: string; steps: Step[] };
  founders: { kicker: string; title: ReactNode; role: string };
  presence: { kicker: string; title: ReactNode; intro: string; hubs: Hub[] };
  voices: { kicker: string; title: ReactNode; quotes: Quote[] };
  contact: { kicker: string; title: string; lead: string; emailLabel: string; phoneLabel: string; phone: string };
  footerTagline: string;
};

const gold = (s: ReactNode) => <span className="italic text-[#a8843a]">{s}</span>;

const content: Record<Locale, Content> = {
  en: {
    hero: {
      eyebrow: 'International Education · K-12 to University',
      title: <>An education worthy of your child’s {gold('ambition')}.</>,
      lead:
        'NextGen Scholars guides ambitious students toward the world’s leading universities — with first-rate mentors, accredited curricula and a plan composed for one student, across five global hubs.',
      primary: 'Explore Programmes',
      secondary: 'Arrange a Conversation',
      stats: [
        { n: '5', l: 'Global hubs, three continents' },
        { n: '4', l: 'Connected programme pathways' },
        { n: '100%', l: 'Personalised mentorship' },
      ],
    },
    accred: {
      label: 'Aligned with the world’s leading curricula & examination boards',
      items: ['UCAS', 'Pearson Edexcel', 'Oxford AQA', 'Cambridge (CIE)', 'College Board'],
    },
    promise: {
      kicker: 'Why families entrust us',
      title: <>The considered choice for an {gold('international')} future.</>,
      intro:
        'Every element of NextGen Scholars is composed around a single question: does this genuinely bring a young person closer to a confident, global future?',
      points: [
        { rn: 'i', t: 'Accredited, recognised curricula', d: 'Aligned with the world’s leading exam boards — A-Level, HKDSE and more — so credentials are honoured by universities worldwide.' },
        { rn: 'ii', t: 'Mentors of the first rank', d: 'Students learn alongside graduates of, and faculty connected to, the world’s leading universities and industry.' },
        { rn: 'iii', t: 'A plan for one student', d: 'Never one-size-fits-all. We map each student’s strengths and ambitions into a personalised academic and admissions plan.' },
        { rn: 'iv', t: 'Counsel you can rely upon', d: 'Regular reporting and an open line to our team mean parents always know how their child is progressing.' },
      ],
    },
    framework: {
      kicker: 'What we offer',
      title: 'A complete framework for international education.',
      intro: 'From classroom to campus to career — four connected pathways that prepare students for a global future.',
      cards: [
        { n: '01', t: 'Career · College · Life Readiness', items: ['Career Readiness', 'College Readiness', 'Life Readiness', 'Global Competency'], href: siteLinks.en.cclr },
        { n: '02', t: 'Partnership Programmes', items: ['Hybrid Programme', 'Dual-Track Programme', 'Online Diploma'], href: siteLinks.en.hybrid },
        { n: '03', t: 'NextGen Inspires', items: ['Global Industry Leaders', 'Global Universities', 'SPARK LAB', 'Global Alumni'], href: siteLinks.en.ngsInspires },
        { n: '04', t: 'NextGen Connects', items: ['School Visits', 'School Reports', 'Growth Mapping', 'Academic Clinics'], href: siteLinks.en.ngsConnects },
      ],
      cta: 'Discover',
    },
    approach: {
      kicker: 'The NGS approach',
      title: 'A clear path, from first conversation to campus.',
      steps: [
        { n: '01', t: 'Discover', d: 'We begin with a conversation to understand your child’s strengths, goals and aspirations.' },
        { n: '02', t: 'Compose', d: 'Our advisors design a personalised academic and admissions plan, matched to the right pathway.' },
        { n: '03', t: 'Mentor', d: 'Students learn with expert mentors, supported by progress reports and global enrichment.' },
        { n: '04', t: 'Flourish', d: 'With applications in hand, students step with confidence onto campus — and into a global community.' },
      ],
    },
    founders: {
      kicker: 'Who we are',
      title: <>Founded by educators, technologists & {gold('industry leaders')}.</>,
      role: 'Co-Founder',
    },
    presence: {
      kicker: 'Global presence',
      title: <>Five hubs. {gold('One community.')}</>,
      intro: 'NextGen Scholars operates across key cities on three continents — connecting students, schools and mentors worldwide.',
      hubs: [
        { c: 'San Francisco', r: 'United States' },
        { c: 'Melbourne', r: 'Australia' },
        { c: 'Hong Kong', r: 'China' },
        { c: 'Taiwan', r: 'China' },
        { c: 'Greater Bay Area', r: 'China' },
      ],
    },
    voices: {
      kicker: 'In their words',
      title: <>Trusted by students {gold('and families')}.</>,
      quotes: [
        { q: 'The teaching quality is simply outstanding — the tutors are highly knowledgeable and genuinely passionate about helping students succeed.', a: 'Noah', r: 'A-Level Mathematics & Physics' },
        { q: 'I can learn at my own pace and preferences, even while travelling with family. I finished my three main courses with NGS.', a: 'Lucy', r: 'NGS Student' },
        { q: 'I’ve seen significant improvement in IB Maths and Computer Science, and I feel well-prepared for my exams. I highly recommend NGS.', a: 'Tiffany', r: 'IB Diploma' },
      ],
    },
    contact: {
      kicker: 'Enquiries',
      title: 'Begin a conversation.',
      lead: 'Tell us about your school, your student, or your goals — our team will respond within two business days.',
      emailLabel: 'Email',
      phoneLabel: 'Telephone',
      phone: '400-806-1815',
    },
    footerTagline: 'International education for the next generation.',
  },
  zh: {
    hero: {
      eyebrow: '国际教育 · 从 K-12 到大学',
      title: <>配得上孩子{gold('志向')}的国际教育。</>,
      lead:
        'NextGen Scholars 以第一流的导师、权威认证课程与量身定制的规划，引领有志学子迈向世界顶尖大学 —— 遍及全球五大枢纽。',
      primary: '探索课程',
      secondary: '预约一次沟通',
      stats: [
        { n: '5', l: '横跨三大洲的全球枢纽' },
        { n: '4', l: '相互衔接的课程路径' },
        { n: '100%', l: '个性化导师辅导' },
      ],
    },
    accred: {
      label: '对接全球权威课程体系与考试局',
      items: ['UCAS', 'Pearson Edexcel', 'Oxford AQA', 'Cambridge (CIE)', 'College Board'],
    },
    promise: {
      kicker: '家长为何信赖我们',
      title: <>通往{gold('国际')}未来的明智之选。</>,
      intro:
        'NextGen Scholars 的每一处设计，都围绕同一个问题：这是否真正让孩子更接近一个自信而广阔的未来？',
      points: [
        { rn: 'i', t: '权威认证课程体系', d: '对接全球权威考试局 —— A-Level、HKDSE 等 —— 学历获世界各地大学认可。' },
        { rn: 'ii', t: '第一流的导师团队', d: '学生与来自世界顶尖大学的毕业生、师资及行业领袖共同学习、成长。' },
        { rn: 'iii', t: '为一个孩子定制的规划', d: '拒绝千篇一律。我们梳理每位学生的特长与志向，定制专属的学术与升学规划。' },
        { rn: 'iv', t: '值得信赖的陪伴', d: '定期报告与畅通的沟通，让家长随时了解孩子的进展与下一步。' },
      ],
    },
    framework: {
      kicker: '我们的课程',
      title: '完整的国际教育体系。',
      intro: '从课堂到校园再到职业 —— 四条相互衔接的路径，助力学生迈向全球未来。',
      cards: [
        { n: '01', t: '升学探索课程', items: ['职业准备', '大学准备', '生活准备', '全球胜任力'], href: siteLinks.zh.cclr },
        { n: '02', t: '线上学校课程', items: ['未来全域学习计划', '未来教育双轨计划', '未来无界文凭课程'], href: siteLinks.zh.hybrid },
        { n: '03', t: 'NextGen Inspires', items: ['全球产业领袖', '全球大学', 'SPARK LAB', '全球校友'], href: siteLinks.zh.ngsInspires },
        { n: '04', t: 'NextGen Connects', items: ['校园参访', '学校报告', '成长规划', '学术诊所'], href: siteLinks.zh.ngsConnects },
      ],
      cta: '了解详情',
    },
    approach: {
      kicker: 'NGS 的方法',
      title: '从第一次沟通，到走进理想校园。',
      steps: [
        { n: '01', t: '了解', d: '从一次深入的沟通开始，了解孩子的特长、目标，以及向往的大学。' },
        { n: '02', t: '规划', d: '顾问团队为孩子量身定制学术与升学规划，匹配最合适的课程与路径。' },
        { n: '03', t: '辅导', d: '学生在资深导师的陪伴下学习，并获得定期进展报告与全球拓展机会。' },
        { n: '04', t: '绽放', d: '当申请与学历水到渠成，孩子将自信地走进校园，融入全球社区。' },
      ],
    },
    founders: {
      kicker: '关于我们',
      title: <>由教育者、科技领袖与{gold('行业专家')}共同创立。</>,
      role: '联合创始人',
    },
    presence: {
      kicker: '全球网络',
      title: <>五大枢纽，{gold('一个社区。')}</>,
      intro: '未来学者遍布三大洲的核心城市 —— 连接世界各地的学生、学校与导师。',
      hubs: [
        { c: '三藩市', r: '美国' },
        { c: '墨尔本', r: '澳大利亚' },
        { c: '香港', r: '中国' },
        { c: '台湾', r: '中国' },
        { c: '大湾区', r: '中国' },
      ],
    },
    voices: {
      kicker: '他们这样说',
      title: <>深受学生{gold('与家庭')}信赖。</>,
      quotes: [
        { q: '两位老师都是学科学霸，教学非常耐心，相比在国际学校学习时提升很快。', a: 'Noah', r: 'A-Level 数学与物理' },
        { q: '我可以按照自己的节奏和喜好学习，即使在与家人旅行期间。我在 NGS 完成了三门主修课程。', a: 'Lucy', r: 'NGS 学员' },
        { q: '我对 IB 数学和计算机科学有了显著提升，感觉为考试做好了充分准备。我强烈推荐 NGS。', a: 'Tiffany', r: 'IB 文凭' },
      ],
    },
    contact: {
      kicker: '咨询',
      title: '开启一次对话。',
      lead: '告诉我们您的学校、学生或目标 —— 我们的团队将在两个工作日内回复。',
      emailLabel: '邮箱',
      phoneLabel: '电话',
      phone: '400-806-1815',
    },
    footerTagline: '为下一代而生的国际教育。',
  },
};

function initials(name: string) {
  return name.split(/\s+/).map((w) => w[0]).join('').slice(0, 2).toUpperCase();
}

export function HeritageHome({ locale, langHref }: { locale: Locale; langHref: string }) {
  const t = content[locale];
  const links = siteLinks[locale];
  const story = founderStory[locale];
  const f = footerContent[locale];

  return (
    <div className="ngs-redesign min-h-screen bg-[#f7f4ec] font-sans text-[#3c4250] antialiased">
      <HeritageHeader locale={locale} langHref={langHref} />

      <main>
        {/* ── Hero ─────────────────────────────────────────────── */}
        <section className="relative overflow-hidden">
          <div aria-hidden className="pointer-events-none absolute inset-0">
            <div className="absolute left-1/2 top-[120px] h-[1px] w-[min(92%,1080px)] -translate-x-1/2 bg-[#14253f]/10" />
          </div>
          <Container className="relative flex min-h-[92vh] flex-col items-center justify-center pb-24 pt-40 text-center">
            <span aria-hidden className="mb-7 font-display-serif text-2xl text-[#a8843a]">✦</span>
            <Eyebrow>{t.hero.eyebrow}</Eyebrow>
            <h1 className="mt-8 max-w-4xl font-display-serif text-[2.9rem] font-medium leading-[1.08] tracking-[-0.01em] text-[#14253f] sm:text-6xl lg:text-[4.6rem]">
              {t.hero.title}
            </h1>
            <p className="mt-8 max-w-2xl text-[17px] leading-relaxed text-[#3c4250]/85">{t.hero.lead}</p>
            <div className="mt-11 flex flex-col items-center gap-5 sm:flex-row">
              <Button href={links.programs} variant="solid">{t.hero.primary}</Button>
              <ArrowLink href="#enquire">{t.hero.secondary}</ArrowLink>
            </div>

            <div className="mt-20 w-full max-w-3xl border-t border-[#14253f]/10 pt-10">
              <dl className="grid grid-cols-1 gap-10 sm:grid-cols-3">
                {t.hero.stats.map((s, i) => (
                  <div key={s.l} className={`flex flex-col items-center ${i > 0 ? 'sm:border-l sm:border-[#14253f]/10' : ''}`}>
                    <dt className="font-display-serif text-5xl font-medium text-[#14253f]">{s.n}</dt>
                    <dd className="mt-3 max-w-[12rem] text-[12px] font-medium uppercase tracking-[0.16em] text-[#6f6a60]">{s.l}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </Container>
        </section>

        {/* ── Accreditation strip ──────────────────────────────── */}
        <section className="border-y border-[#14253f]/10 bg-[#efe9dd]">
          <Container className="py-9">
            <p className="text-center text-[11px] font-semibold uppercase tracking-[0.24em] text-[#6f6a60]">{t.accred.label}</p>
            <ul className="mt-6 flex flex-wrap items-center justify-center gap-x-8 gap-y-3">
              {t.accred.items.map((item, i) => (
                <li key={item} className="flex items-center gap-8">
                  {i > 0 && <span aria-hidden className="hidden h-1 w-1 rotate-45 bg-[#a8843a] sm:block" />}
                  <span className="font-display-serif text-lg text-[#14253f]">{item}</span>
                </li>
              ))}
            </ul>
          </Container>
        </section>

        {/* ── Promise ──────────────────────────────────────────── */}
        <section className="bg-[#f7f4ec]">
          <Container className="py-24 lg:py-28">
            <div className="grid gap-x-16 gap-y-12 lg:grid-cols-12">
              <div className="lg:col-span-5">
                <SectionLabel index="01">{t.promise.kicker}</SectionLabel>
                <h2 className="mt-7 font-display-serif text-[2.1rem] font-medium leading-[1.14] text-[#14253f] sm:text-[2.7rem]">
                  {t.promise.title}
                </h2>
                <p className="mt-7 max-w-md text-[16px] leading-relaxed text-[#3c4250]/85">{t.promise.intro}</p>
              </div>
              <div className="lg:col-span-7">
                <div className="grid gap-px overflow-hidden border border-[#14253f]/10 bg-[#14253f]/10 sm:grid-cols-2">
                  {t.promise.points.map((p) => (
                    <div key={p.t} className="bg-[#fffdf9] p-8">
                      <span className="font-display-serif text-xl italic text-[#a8843a]">{p.rn}</span>
                      <h3 className="mt-4 font-display-serif text-xl text-[#14253f]">{p.t}</h3>
                      <p className="mt-3 text-[14.5px] leading-relaxed text-[#6f6a60]">{p.d}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Container>
        </section>

        {/* ── Framework ────────────────────────────────────────── */}
        <section className="border-t border-[#14253f]/10 bg-[#efe9dd]">
          <Container className="py-24 lg:py-28">
            <div className="max-w-2xl">
              <SectionLabel index="02">{t.framework.kicker}</SectionLabel>
              <h2 className="mt-7 font-display-serif text-[2.1rem] font-medium leading-[1.14] text-[#14253f] sm:text-[2.7rem]">{t.framework.title}</h2>
              <p className="mt-6 text-[16px] leading-relaxed text-[#3c4250]/85">{t.framework.intro}</p>
            </div>
            <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {t.framework.cards.map((card) => (
                <Link key={card.t} href={card.href} className="group flex flex-col border-t-2 border-[#a8843a] bg-[#fffdf9] p-8 transition-shadow duration-300 hover:shadow-[0_30px_60px_-30px_rgba(20,37,63,0.3)]">
                  <span className="font-display-serif text-3xl italic text-[#a8843a]/80">{card.n}</span>
                  <h3 className="mt-5 font-display-serif text-xl leading-snug text-[#14253f]">{card.t}</h3>
                  <ul className="mt-5 flex-1 space-y-2.5">
                    {card.items.map((item) => (
                      <li key={item} className="flex items-start gap-2.5 text-[13.5px] text-[#6f6a60]">
                        <span aria-hidden className="mt-[7px] h-1 w-1 shrink-0 rotate-45 bg-[#a8843a]" />
                        {item}
                      </li>
                    ))}
                  </ul>
                  <span className="mt-7 inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#14253f]">
                    <span className="bg-gradient-to-r from-[#a8843a] to-[#a8843a] bg-[length:0%_1px] bg-left-bottom bg-no-repeat pb-1 transition-[background-size] duration-300 group-hover:bg-[length:100%_1px]">{t.framework.cta}</span>
                  </span>
                </Link>
              ))}
            </div>
          </Container>
        </section>

        {/* ── Approach ─────────────────────────────────────────── */}
        <section className="bg-[#f7f4ec]">
          <Container className="py-24 lg:py-28">
            <div className="max-w-2xl">
              <SectionLabel index="03">{t.approach.kicker}</SectionLabel>
              <h2 className="mt-7 font-display-serif text-[2.1rem] font-medium leading-[1.14] text-[#14253f] sm:text-[2.7rem]">{t.approach.title}</h2>
            </div>
            <ol className="mt-14 grid gap-x-10 gap-y-12 sm:grid-cols-2 lg:grid-cols-4">
              {t.approach.steps.map((s) => (
                <li key={s.t} className="relative border-t border-[#14253f]/15 pt-7">
                  <span aria-hidden className="absolute -top-px left-0 h-px w-12 bg-[#a8843a]" />
                  <span className="font-display-serif text-2xl italic text-[#a8843a]">{s.n}</span>
                  <h3 className="mt-3 font-display-serif text-xl text-[#14253f]">{s.t}</h3>
                  <p className="mt-3 text-[14.5px] leading-relaxed text-[#6f6a60]">{s.d}</p>
                </li>
              ))}
            </ol>
          </Container>
        </section>

        {/* ── Founders ─────────────────────────────────────────── */}
        <section className="border-y border-[#14253f]/10 bg-[#efe9dd]">
          <Container className="py-24 lg:py-28">
            <div className="grid gap-x-16 gap-y-12 lg:grid-cols-12">
              <div className="lg:col-span-6">
                <SectionLabel index="04">{t.founders.kicker}</SectionLabel>
                <h2 className="mt-7 font-display-serif text-[2.1rem] font-medium leading-[1.16] text-[#14253f] sm:text-[2.6rem]">{t.founders.title}</h2>
              </div>
              <div className="lg:col-span-6">
                <p className="font-display-serif text-[20px] leading-relaxed text-[#14253f]">{story.paragraphs[0]}</p>
                <div className="mt-5 space-y-4 text-[15px] leading-relaxed text-[#6f6a60]">
                  {story.paragraphs.slice(1).map((p) => (
                    <p key={p}>{p}</p>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-16 grid grid-cols-2 gap-px overflow-hidden border border-[#14253f]/10 bg-[#14253f]/10 sm:grid-cols-4">
              {story.founders.map((founder) => (
                <div key={founder.name} className="flex flex-col items-center bg-[#fffdf9] p-8 text-center">
                  <span className="flex h-16 w-16 items-center justify-center rounded-full border border-[#a8843a]/50 bg-[#14253f] font-display-serif text-lg text-[#f7f4ec]">
                    {initials(founder.name)}
                  </span>
                  <p className="mt-4 font-display-serif text-[17px] text-[#14253f]">{founder.name}</p>
                  <p className="mt-1.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#a8843a]">{t.founders.role}</p>
                </div>
              ))}
            </div>
          </Container>
        </section>

        {/* ── Presence ─────────────────────────────────────────── */}
        <section className="bg-[#14253f] text-[#f7f4ec]">
          <Container className="py-24 lg:py-28">
            <div className="max-w-2xl">
              <SectionLabel index="05" tone="light">{t.presence.kicker}</SectionLabel>
              <h2 className="mt-7 font-display-serif text-[2.1rem] font-medium leading-[1.14] sm:text-[2.7rem]">{t.presence.title}</h2>
              <p className="mt-6 text-[16px] leading-relaxed text-[#f7f4ec]/70">{t.presence.intro}</p>
            </div>
            <ul className="mt-14 grid gap-px overflow-hidden border border-[#f7f4ec]/15 bg-[#f7f4ec]/15 sm:grid-cols-2 lg:grid-cols-5">
              {t.presence.hubs.map((hub) => (
                <li key={hub.c} className="bg-[#14253f] px-6 py-9 text-center">
                  <p className="font-display-serif text-[22px] text-[#f7f4ec]">{hub.c}</p>
                  <span aria-hidden className="mx-auto mt-3 block h-px w-6 bg-[#c4a463]" />
                  <p className="mt-3 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#f7f4ec]/55">{hub.r}</p>
                </li>
              ))}
            </ul>
          </Container>
        </section>

        {/* ── Voices ───────────────────────────────────────────── */}
        <section className="bg-[#f7f4ec]">
          <Container className="py-24 lg:py-28">
            <div className="max-w-2xl">
              <SectionLabel index="06">{t.voices.kicker}</SectionLabel>
              <h2 className="mt-7 font-display-serif text-[2.1rem] font-medium leading-[1.14] text-[#14253f] sm:text-[2.7rem]">{t.voices.title}</h2>
            </div>
            <div className="mt-14 grid gap-px overflow-hidden border border-[#14253f]/10 bg-[#14253f]/10 lg:grid-cols-3">
              {t.voices.quotes.map((q) => (
                <figure key={q.a} className="flex flex-col bg-[#fffdf9] p-9">
                  <span aria-hidden className="font-display-serif text-5xl leading-none text-[#a8843a]/70">“</span>
                  <blockquote className="mt-4 flex-1 font-display-serif text-[18px] italic leading-relaxed text-[#14253f]">{q.q}</blockquote>
                  <figcaption className="mt-7 border-t border-[#14253f]/10 pt-5">
                    <span className="block text-[14px] font-semibold text-[#14253f]">{q.a}</span>
                    <span className="mt-1 block text-[11px] uppercase tracking-[0.16em] text-[#6f6a60]">{q.r}</span>
                  </figcaption>
                </figure>
              ))}
            </div>
          </Container>
        </section>

        {/* ── Contact ──────────────────────────────────────────── */}
        <section id="enquire" className="scroll-mt-24 bg-[#0c1830] text-[#f7f4ec]">
          <Container className="py-24 lg:py-28">
            <div className="grid gap-x-16 gap-y-12 lg:grid-cols-12">
              <div className="lg:col-span-5">
                <SectionLabel index="07" tone="light">{t.contact.kicker}</SectionLabel>
                <h2 className="mt-7 font-display-serif text-[2.4rem] font-medium leading-[1.1] sm:text-[3rem]">{t.contact.title}</h2>
                <p className="mt-6 max-w-md text-[16px] leading-relaxed text-[#f7f4ec]/70">{t.contact.lead}</p>
                <GoldRule className="mt-10" />
                <dl className="mt-8 space-y-6">
                  <div>
                    <dt className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#c4a463]">{t.contact.emailLabel}</dt>
                    <dd className="mt-1.5"><a href="mailto:info@nextgenscholars.asia" className="text-[16px] text-[#f7f4ec] transition-colors hover:text-[#c4a463]">info@nextgenscholars.asia</a></dd>
                  </div>
                  <div>
                    <dt className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#c4a463]">{t.contact.phoneLabel}</dt>
                    <dd className="mt-1.5 text-[16px] text-[#f7f4ec]">{t.contact.phone}</dd>
                  </div>
                </dl>
              </div>
              <div className="lg:col-span-7">
                <div className="bg-[#f7f4ec] p-8 text-[#3c4250] sm:p-11">
                  <HeritageContact locale={locale} />
                </div>
              </div>
            </div>
          </Container>
        </section>
      </main>

      {/* ── Footer ─────────────────────────────────────────────── */}
      <footer className="bg-[#0c1830] text-[#f7f4ec]">
        <div className="border-t border-[#f7f4ec]/10">
          <Container className="py-16">
            <div className="grid gap-x-10 gap-y-12 lg:grid-cols-12">
              <div className="lg:col-span-4">
                <p className="font-display-serif text-[22px] text-[#f7f4ec]">NextGen Scholars</p>
                <p className="mt-1 text-[9px] font-semibold uppercase tracking-[0.32em] text-[#c4a463]">International Education</p>
                <p className="mt-6 max-w-xs text-[14px] text-[#f7f4ec]/55">{t.footerTagline}</p>
                <div className="mt-7 space-y-1 text-[14px]">
                  <a href="mailto:info@nextgenscholars.asia" className="block text-[#f7f4ec]/80 hover:text-[#c4a463]">info@nextgenscholars.asia</a>
                  <p className="text-[#f7f4ec]/55">{f.contact.phone}</p>
                </div>
                <div className="mt-6 flex gap-5 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#f7f4ec]/60">
                  <a href={externalLinks.linkedin} target="_blank" rel="noopener noreferrer" className="hover:text-[#c4a463]">LinkedIn</a>
                  <a href={externalLinks.xiaohongshu} target="_blank" rel="noopener noreferrer" className="hover:text-[#c4a463]">RedNote</a>
                  <a href={externalLinks.customerServiceWeChat} target="_blank" rel="noopener noreferrer" className="hover:text-[#c4a463]">WeChat</a>
                </div>
              </div>

              <div className="lg:col-span-3">
                <h3 className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#f7f4ec]/45">{locale === 'zh' ? '探索' : 'Explore'}</h3>
                <ul className="mt-5 space-y-3">
                  {f.links.map((link) => (
                    <li key={link.href}><Link href={link.href} className="text-[14px] text-[#f7f4ec]/70 transition-colors hover:text-[#c4a463]">{link.label}</Link></li>
                  ))}
                </ul>
              </div>

              <div className="lg:col-span-5">
                <h3 className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#f7f4ec]/45">{locale === 'zh' ? '办公地点' : 'Offices'}</h3>
                <div className="mt-5 grid gap-6 sm:grid-cols-2">
                  {f.offices.map((office) => (
                    <div key={office.title}>
                      <p className="font-display-serif text-[15px] text-[#f7f4ec]">{office.title}</p>
                      <p className="mt-1 text-[13px] leading-relaxed text-[#f7f4ec]/50">{office.address}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-14 flex flex-col gap-5 border-t border-[#f7f4ec]/10 pt-8 text-[12px] text-[#f7f4ec]/45 lg:flex-row lg:justify-between">
              <div className="flex flex-wrap gap-x-6 gap-y-2">
                <a href="https://beian.miit.gov.cn/" target="_blank" rel="noopener noreferrer" className="hover:text-[#c4a463]">粤ICP备2025400078号-2</a>
                <span>增值电信业务许可证：粤B2-20252299</span>
                <span>粤公网安备 44030002008307号</span>
              </div>
              <div className="flex flex-col gap-2 lg:items-end">
                <div className="flex items-center gap-3">
                  <Link href={f.privacyHref} className="hover:text-[#c4a463]">{f.privacyLabel}</Link>
                  <span aria-hidden>·</span>
                  <Link href={f.termsHref} className="hover:text-[#c4a463]">{f.termsLabel}</Link>
                </div>
                <p>{f.copyright}</p>
              </div>
            </div>
          </Container>
        </div>
      </footer>
    </div>
  );
}
