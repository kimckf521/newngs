'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Icon } from '@/components/member/design-v1/parts';
/* ── Types ────────────────────────────────────────────────────────────────── */

interface ModuleVideo {
  vimeoId: string;
  label: string;
}

interface CourseModule {
  number: number;
  title: string;
  lessonUrl: string;
  testUrl: string | null;
  hasTest: boolean;
  questionKey: string | null;
  progress: number;
  description: string;
  topics: string[];
  videos: ModuleVideo[];
  pages: number;
}

/* ── Data ─────────────────────────────────────────────────────────────────── */

const MODULES: CourseModule[] = [
  {
    number: 1,
    title: 'Home, Family & Daily Life',
    lessonUrl: 'https://ngs.classportal.online/lessonmanager/lesson/view/id/3206/mid/2010',
    testUrl: 'https://ngs.classportal.online/assessment/assessment/instruction/id/2010',
    hasTest: true,
    questionKey: 'mod1',
    progress: 0,
    pages: 14,
    description:
      'Develop communication skills and extend vocabulary on the topic of Home, Family and Daily Life. Use pictures and audio to understand social trends, give and follow talks, read statistics, and practise sample IELTS tasks.',
    topics: [
      'Giving opinions',
      'Changes in the UK',
      'Reading about changes',
      'How We Spend Our Time',
      'Reading statistical information',
      'Types of family',
      'Family relations',
      'The nuclear family',
      'Giving your views about change',
      'Describing change',
      "Children's Health — A report on childhood obesity",
      'The Pursuit of Happiness',
    ],
    videos: [
      { vimeoId: '387654970', label: 'Giving opinions' },
      { vimeoId: '382427726', label: 'Video lesson' },
    ],
  },
  {
    number: 2,
    title: 'Politics and Socio-Cultural Issues',
    lessonUrl: 'https://ngs.classportal.online/lessonmanager/lesson/view/id/542/mid/434',
    testUrl: 'https://ngs.classportal.online/assessment/assessment/instruction/id/434',
    hasTest: true,
    questionKey: 'mod2',
    progress: 0,
    pages: 24,
    description:
      'Read newspapers and explore socio-cultural and political issues via TV, radio, and the Internet. Learn to listen for information in news programmes, understand and retell news stories, analyse radio interview techniques, and practise IELTS writing strategies.',
    topics: [
      'Newspapers and Their Contents',
      'Broadsheets vs Tabloids',
      'Academic Reading Passage',
      'How tabloid newspapers use language',
      'Relative clauses',
      'Using relative clauses',
      'Language using the past perfect tense',
      'Talking about the News',
      'Retelling a news story',
      'Using the passive',
      'Weather Reports',
      'Reading weather reports in newspapers',
      'Vocabulary for the weather',
      'Listening to a weather forecast',
      'Comparing news stories',
      'Listening to a radio interview',
      'Dealing with an interview',
      'IELTS Writing strategies',
      'Sample Writing Task',
    ],
    videos: [
      { vimeoId: '382421056', label: 'Video lesson 1' },
      { vimeoId: '387654807', label: 'Video lesson 2' },
      { vimeoId: '382426037', label: 'Video lesson 3' },
      { vimeoId: '382424058', label: 'Video lesson 4' },
    ],
  },
  {
    number: 3,
    title: 'Work and Professions',
    lessonUrl: 'https://ngs.classportal.online/lessonmanager/lesson/view/id/543/mid/435',
    testUrl: 'https://ngs.classportal.online/assessment/assessment/instruction/id/435',
    hasTest: true,
    questionKey: 'mod3',
    progress: 0,
    pages: 27,
    description:
      'Develop communication skills on the topics of Work and Professions. Listen to voicemail messages, use formal and informal language, and develop vocabulary relating to work. Read emails, magazine articles, and practise IELTS Academic Writing tasks.',
    topics: [
      'The workplace',
      'Arriving at work',
      'Useful vocabulary when discussing work',
      'Sample IELTS speaking questions',
      'Describing jobs to a new member of staff',
      'Checking what you have to do',
      'Listening to voicemail messages',
      'Writing a message',
      'Passing on messages',
      'Getting the style right',
      "Reporting people's words",
      'Phoning about a delivery',
      'Emails, Letters and Other Communications',
      'Correcting mistakes in spelling',
      'Sample IELTS Academic Writing Task',
      'Language used to compare and contrast information',
      'Instructions and Procedures',
      'Writing instructions',
      'Understanding office procedures',
      'Using the passive in language',
    ],
    videos: [
      { vimeoId: '382423626', label: 'Video lesson 1' },
      { vimeoId: '382422454', label: 'Video lesson 2' },
    ],
  },
  {
    number: 4,
    title: 'Health and Fitness',
    lessonUrl: 'https://ngs.classportal.online/lessonmanager/lesson/view/id/550/mid/436',
    testUrl: 'https://ngs.classportal.online/assessment/assessment/instruction/id/436',
    hasTest: true,
    questionKey: 'mod4',
    progress: 0,
    pages: 7,
    description:
      'Develop communication skills on the topics of Health & Fitness. Listen to dialogues about health issues and health club discussions, practise vocabulary for the IELTS Speaking assessment, and read comprehension exercises relating to health.',
    topics: [
      'Listening Assessment',
      "Academic Reading — Identifying Writer's Views and Claims",
      'Preparing for your IELTS Speaking Exam',
      'Sample IELTS Writing Assessment and Answer',
      'Academic Reading Sample Task',
      'Reading Comprehension Exercises',
    ],
    videos: [
      { vimeoId: '387654295', label: 'Video lesson' },
    ],
  },
  {
    number: 5,
    title: 'Citizenship & Politics',
    lessonUrl: 'https://ngs.classportal.online/lessonmanager/lesson/view/id/544/mid/437',
    testUrl: 'https://ngs.classportal.online/assessment/assessment/instruction/id/437',
    hasTest: true,
    questionKey: 'mod5',
    progress: 0,
    pages: 18,
    description:
      'Explore citizenship and politics. Give views and opinions about local issues, listen to and follow discussions, read newsletters and reports, and practise both IELTS Reading and Writing skills.',
    topics: [
      'Good Citizenship',
      'Useful vocabulary when discussing citizenship',
      'Using modal verbs',
      'Practise IELTS reading assessment',
      'Democracy',
      'Local democracy in action: an interview',
      'Working out meaning from context',
      'Writing and Righting Rights',
      'Making suggestions',
      "The Tenants' Association newsletter",
      'A committee meeting',
      'Direct and reported speech',
      'Are you an active citizen?',
      'Sample IELTS Writing Exam',
      'Getting things done',
    ],
    videos: [
      { vimeoId: '382423626', label: 'Video lesson 1' },
      { vimeoId: '382420259', label: 'Video lesson 2' },
    ],
  },
  {
    number: 6,
    title: 'Crime and Punishment',
    lessonUrl: 'https://ngs.classportal.online/lessonmanager/lesson/view/id/545/mid/438',
    testUrl: 'https://ngs.classportal.online/assessment/assessment/instruction/id/438',
    hasTest: true,
    questionKey: 'mod6',
    progress: 0,
    pages: 8,
    description:
      'Explore crime and punishment through comprehension exercises and audio. Listen to and follow discussions regarding crime, build vocabulary relating to crime and punishment, and read articles to practise reading comprehension skills.',
    topics: [
      'Listening — discussions about crime',
      'Vocabulary relating to crime and punishment',
      'IELTS Speaking question preparation',
      'Reading articles about crime',
      'Reading comprehension practice',
    ],
    videos: [],
  },
  {
    number: 7,
    title: 'The Environment',
    lessonUrl: 'https://ngs.classportal.online/lessonmanager/lesson/view/id/546/mid/439',
    testUrl: 'https://ngs.classportal.online/assessment/assessment/instruction/id/439',
    hasTest: true,
    questionKey: 'mod7',
    progress: 0,
    pages: 25,
    description:
      'Explore environmental problems and what we can do about them. Listen to a radio interview about local issues, learn vocabulary for the IELTS Speaking exam, and read and write letters and e-mails about environmental topics.',
    topics: [
      'How Green are We?',
      'Introduction to environmental issues',
      'Listening to a radio interview',
      'Tag questions',
      'Action in the Community',
      'Letters and News Stories on Environmental Issues',
      'IELTS Reading practice',
      'Summary',
    ],
    videos: [
      { vimeoId: '382422881', label: 'Video lesson 1' },
      { vimeoId: '387655177', label: 'Video lesson 2' },
      { vimeoId: '382427340', label: 'Video lesson 3' },
    ],
  },
  {
    number: 8,
    title: 'Technology and Social Networking',
    lessonUrl: 'https://ngs.classportal.online/lessonmanager/lesson/view/id/547/mid/440',
    testUrl: 'https://ngs.classportal.online/assessment/assessment/instruction/id/440',
    hasTest: true,
    questionKey: 'mod8',
    progress: 0,
    pages: 9,
    description:
      'Understand how technology has become central to modern life, especially social media. Listen to conversations about technology purchases and social networking habits, complete reading comprehension, and structure a 250-word IELTS Academic Writing task.',
    topics: [
      'The role of Social Media in everyday life',
      'Vocabulary — social media and technology',
      'Listening to conversations about technology',
      'Reading comprehension (multiple choice)',
      'IELTS Academic Writing Task 1',
      'IELTS Academic Writing — 250-word structure',
    ],
    videos: [
      { vimeoId: '382423132', label: 'Video lesson 1' },
      { vimeoId: '382426201', label: 'Video lesson 2' },
    ],
  },
  {
    number: 9,
    title: 'Science and Education',
    lessonUrl: 'https://ngs.classportal.online/lessonmanager/lesson/view/id/548/mid/441',
    testUrl: 'https://ngs.classportal.online/assessment/assessment/instruction/id/441',
    hasTest: true,
    questionKey: 'mod9',
    progress: 0,
    pages: 7,
    description:
      'Explore science and education through comprehension exercises and audio. Listen to and follow discussions regarding education, build vocabulary relating to education and science, and read articles to practise comprehension skills.',
    topics: [
      'Vocabulary relating to education and science',
      'Listening — discussions about education',
      'IELTS Speaking question preparation',
      'Reading articles about Education and Science',
      'Reading comprehension practice',
    ],
    videos: [],
  },
  {
    number: 10,
    title: 'The IELTS Exam',
    lessonUrl: 'https://ngs.classportal.online/lessonmanager/lesson/view/id/549/mid/442',
    testUrl: null,
    hasTest: false,
    questionKey: null,
    progress: 0,
    pages: 6,
    description:
      'A purely informative overview of the Academic IELTS Exam. Understand the key parts of the examination and helpful tips for tackling the more challenging sections. No assessment exercises — tick each page to confirm you have read through the information.',
    topics: [
      'Total Examination Duration — 2 hrs 45 mins',
      'Listening Paper overview',
      'Reading Paper overview',
      'Writing Paper overview',
      'Speaking Paper overview',
      'Exam tips and strategies',
    ],
    videos: [
      { vimeoId: '387653548', label: 'IELTS Exam overview 1' },
      { vimeoId: '387652587', label: 'IELTS Exam overview 2' },
      { vimeoId: '387653063', label: 'IELTS Exam overview 3' },
      { vimeoId: '382423132', label: 'Writing Task 1 tips' },
    ],
  },
];

/* ── i18n + theme ─────────────────────────────────────────────────────────── */
type Lang = 'en' | 'zh';
type Theme = 'light' | 'dark';

const TITLE_ZH: Record<number, string> = {
  1: '家庭与日常生活',
  2: '政治与社会文化议题',
  3: '工作与职业',
  4: '健康与健身',
  5: '公民与政治',
  6: '犯罪与刑罚',
  7: '环境',
  8: '科技与社交网络',
  9: '科学与教育',
  10: '雅思考试',
};

interface Strings {
  pageTitle: string;
  pageSubtitle: string;
  courseOverview: string;
  module: string;
  modules: string;
  complete: string;
  assessmentsComplete: string;
  overview: string;
  topicsCovered: string;
  pages: string;
  videoLessons: string;
  noVideo: string;
  mcqHeading: string;
  mcqName: string;
  mcqDesc: string;
  startPractice: string;
  courseSite: string;
  editContent: string;
  clickLoadVideo: string;
  source: string;
  expand: string;
  collapse: string;
  toggleTheme: string;
  back: string;
}

/* UI chrome is bilingual; module descriptions/topics stay English (it's an
 * English course — the interface localises, the content does not). */
const STR: Record<Lang, Strings> = {
  en: {
    pageTitle: 'English Language Course (IELTS Training)',
    pageSubtitle: 'Below is a list of all the modules in this course.',
    courseOverview: 'Course Overview',
    module: 'Module',
    modules: 'Modules',
    complete: 'Complete',
    assessmentsComplete: 'Assessments complete',
    overview: 'Overview',
    topicsCovered: 'Topics Covered',
    pages: 'pages',
    videoLessons: 'Video Lessons',
    noVideo: 'No video content in this module',
    mcqHeading: 'Multiple Choice Test · 30 Questions',
    mcqName: 'Multiple Choice Test',
    mcqDesc: '1-hour timed · 30 questions · Pass mark 80% (24/30)',
    startPractice: 'Start Practice',
    courseSite: 'Preview',
    editContent: 'Edit',
    clickLoadVideo: 'Click to load video',
    source: 'Source:',
    expand: 'Expand',
    collapse: 'Collapse',
    toggleTheme: 'Toggle light / dark',
    back: 'Back to course',
  },
  zh: {
    pageTitle: '英语课程（雅思培训）',
    pageSubtitle: '以下是本课程的所有模块。',
    courseOverview: '课程概览',
    module: '模块',
    modules: '模块总数',
    complete: '已完成',
    assessmentsComplete: '已完成测试',
    overview: '模块简介',
    topicsCovered: '涵盖主题',
    pages: '页',
    videoLessons: '视频课程',
    noVideo: '本模块暂无视频内容',
    mcqHeading: '选择题测试 · 30 题',
    mcqName: '选择题测试',
    mcqDesc: '限时 1 小时 · 30 题 · 及格分 80%（24/30）',
    startPractice: '开始练习',
    courseSite: '预览',
    editContent: '编辑',
    clickLoadVideo: '点击加载视频',
    source: '来源：',
    expand: '展开',
    collapse: '收起',
    toggleTheme: '切换浅色 / 深色',
    back: '返回课程',
  },
};

/* ── Sub-components ───────────────────────────────────────────────────────── */

function VideoPlaceholder({ vimeoId, label, lang }: ModuleVideo & { lang: Lang }) {
  const [loaded, setLoaded] = useState(false);
  return (
    <div className="overflow-hidden rounded-xl border border-slate-100 dark:border-white/10">
      <p className="border-b border-slate-100 bg-slate-50 px-3 py-2 text-xs font-medium text-slate-500 dark:border-white/10 dark:bg-white/5 dark:text-slate-400">{label}</p>
      {loaded ? (
        <iframe
          src={`https://player.vimeo.com/video/${vimeoId}`}
          className="aspect-video w-full"
          allow="autoplay; fullscreen; picture-in-picture"
          allowFullScreen
        />
      ) : (
        <button
          type="button"
          onClick={() => setLoaded(true)}
          className="group relative flex aspect-video w-full items-center justify-center bg-slate-900 transition hover:bg-slate-800"
        >
          <span className="grid h-14 w-14 place-items-center rounded-full bg-white/20 transition group-hover:bg-white/30">
            <svg className="ml-1 h-6 w-6 text-white" viewBox="0 0 24 24" fill="currentColor">
              <path d="M8 5v14l11-7z" />
            </svg>
          </span>
          <span className="absolute bottom-3 left-0 right-0 text-center text-xs text-white/60">
            {STR[lang].clickLoadVideo}
          </span>
        </button>
      )}
    </div>
  );
}

function ModuleCard({ mod, lang }: { mod: CourseModule; lang: Lang }) {
  const [open, setOpen] = useState(false);
  const s = STR[lang];
  const moduleTitle = lang === 'zh' ? (TITLE_ZH[mod.number] ?? mod.title) : mod.title;

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-white/10 dark:bg-night-700">
      {/* Header row */}
      <div className="flex items-center gap-4 p-5">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-sm font-bold text-slate-600 dark:bg-white/10 dark:text-slate-200">
          {mod.number}
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">
            {s.module} {mod.number}
          </p>
          <h3 className="font-grotesk text-base font-bold leading-tight text-slate-900 dark:text-white">{moduleTitle}</h3>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          {/* Progress bar */}
          <div className="hidden w-32 sm:block">
            <div className="h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-white/10">
              <div
                className="h-full rounded-full bg-ngs-gradient"
                style={{ width: `${mod.progress}%` }}
              />
            </div>
            <p className="mt-0.5 text-right text-[10px] text-slate-400 dark:text-slate-500">{mod.progress}%</p>
          </div>
          <Link
            href={`/admin/ielts_training/module/${mod.number}`}
            className="rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-slate-700 dark:bg-white dark:text-night dark:hover:bg-slate-200"
          >
            {s.courseSite}
          </Link>
          <Link
            href={`/admin/ielts_training/module/${mod.number}/edit`}
            className="hidden rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:bg-slate-50 dark:border-white/10 dark:text-slate-300 dark:hover:bg-white/5 sm:inline-block"
          >
            {s.editContent}
          </Link>
          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            className="ml-1 grid h-8 w-8 place-items-center rounded-lg border border-slate-200 text-slate-400 transition hover:bg-slate-50 dark:border-white/10 dark:hover:bg-white/5"
            aria-label={open ? s.collapse : s.expand}
          >
            <svg
              className={`h-4 w-4 transition-transform ${open ? 'rotate-180' : ''}`}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M6 9l6 6 6-6" />
            </svg>
          </button>
        </div>
      </div>

      {/* Expanded content */}
      {open && (
        <div className="space-y-6 border-t border-slate-100 px-5 pb-6 pt-5 dark:border-white/10">
          {/* Description */}
          <div>
            <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">{s.overview}</h4>
            <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300">{mod.description}</p>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            {/* Topics */}
            <div>
              <h4 className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">
                {s.topicsCovered} ({mod.pages} {s.pages})
              </h4>
              <ul className="space-y-1.5">
                {mod.topics.map((tp) => (
                  <li key={tp} className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-300">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-ngs-violet" />
                    {tp}
                  </li>
                ))}
              </ul>
            </div>

            {/* Videos */}
            {mod.videos.length > 0 ? (
              <div>
                <h4 className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">
                  {s.videoLessons} ({mod.videos.length})
                </h4>
                <div className="space-y-3">
                  {mod.videos.map((v) => (
                    <VideoPlaceholder key={v.vimeoId} {...v} lang={lang} />
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2 rounded-xl border border-dashed border-slate-200 p-4 text-sm text-slate-400 dark:border-white/15 dark:text-slate-500">
                <svg
                  className="h-5 w-5 shrink-0"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15.75 10.5l4.72-4.72a.75.75 0 011.28.53v11.38a.75.75 0 01-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25h-9A2.25 2.25 0 002.25 7.5v9a2.25 2.25 0 002.25 2.25z"
                  />
                </svg>
                {s.noVideo}
              </div>
            )}
          </div>

          {/* MCQ Quiz */}
          {mod.hasTest && mod.questionKey && (
            <div>
              <h4 className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">
                {s.mcqHeading}
              </h4>
              <div className="flex items-center justify-between gap-3 rounded-xl border border-pink-100 bg-pink-50 p-4 dark:border-pink-500/20 dark:bg-pink-500/10">
                <div className="flex items-center gap-3">
                  <span className="inline-block h-3 w-3 shrink-0 rounded-full bg-pink-500" />
                  <div>
                    <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">{s.mcqName}</p>
                    <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">{s.mcqDesc}</p>
                  </div>
                </div>
                <Link
                  href={`/admin/ielts_training/module/${mod.number}/test`}
                  className="shrink-0 rounded-lg bg-pink-500 px-3 py-1.5 text-xs font-bold text-white transition hover:bg-pink-600"
                >
                  {s.startPractice} →
                </Link>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function Stat({ value, label, accent }: { value: number; label: string; accent?: boolean }) {
  return (
    <div>
      <div
        className={`mx-auto mb-2 flex h-20 w-20 items-center justify-center rounded-full font-grotesk text-3xl font-bold text-white ${
          accent ? 'bg-ngs-gradient' : 'bg-slate-900 dark:bg-white/10'
        }`}
      >
        {String(value).padStart(2, '0')}
      </div>
      <p className="text-sm font-medium text-slate-600 dark:text-slate-300">{label}</p>
    </div>
  );
}

/* ── Main page ────────────────────────────────────────────────────────────── */

export function IeltsTrainingPage() {
  const totalModules = MODULES.length;
  const completed = MODULES.filter((m) => m.progress === 100).length;
  const assessmentsDone = 0;

  const [mounted, setMounted] = useState(false);
  const [theme, setTheme] = useState<Theme>('light');
  const [lang, setLang] = useState<Lang>('en');

  /* Shares the viewer's localStorage keys so theme/language carry across both. */
  useEffect(() => {
    try {
      const th = localStorage.getItem('ielts:theme');
      if (th === 'dark' || th === 'light') setTheme(th);
      const l = localStorage.getItem('ielts:lang');
      if (l === 'en' || l === 'zh') setLang(l);
    } catch {
      /* ignore */
    }
    setMounted(true);
  }, []);
  useEffect(() => { if (mounted) try { localStorage.setItem('ielts:theme', theme); } catch {} }, [theme, mounted]);
  useEffect(() => { if (mounted) try { localStorage.setItem('ielts:lang', lang); } catch {} }, [lang, mounted]);

  const s = STR[lang];

  return (
    <div className={theme === 'dark' ? 'dark' : ''}>
      <div className="min-h-screen bg-slate-50 font-sans text-slate-700 antialiased dark:bg-night dark:text-slate-300">
        {/* Top bar */}
        <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur dark:border-white/10 dark:bg-night-800/95">
          <div className="mx-auto flex max-w-5xl items-center gap-3 px-4 py-3">
            <Link
              href="/admin/courses/ielts"
              className="flex shrink-0 items-center gap-1.5 text-sm font-medium text-slate-500 transition hover:text-slate-900 dark:hover:text-white"
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 19l-7-7 7-7" /></svg>
              <span className="hidden sm:inline">{s.back}</span>
            </Link>
            <div className="hidden h-4 w-px bg-slate-200 dark:bg-white/10 sm:block" />
            <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-ngs-gradient text-sm font-black text-white">N</span>
            <p className="flex-1 truncate font-grotesk text-sm font-bold text-slate-900 dark:text-white">IELTS Training</p>
            <div className="flex items-center gap-1.5">
              {/* Language */}
              <div className="flex items-center rounded-lg border border-slate-200 p-0.5 dark:border-white/10">
                {(['en', 'zh'] as const).map((l) => (
                  <button
                    key={l}
                    type="button"
                    onClick={() => setLang(l)}
                    className={`rounded-md px-2 py-1 text-xs font-bold transition ${
                      lang === l ? 'bg-slate-900 text-white dark:bg-white dark:text-night' : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
                    }`}
                  >
                    {l === 'en' ? 'EN' : '中'}
                  </button>
                ))}
              </div>
              {/* Theme */}
              <button
                type="button"
                onClick={() => setTheme((th) => (th === 'dark' ? 'light' : 'dark'))}
                aria-label={s.toggleTheme}
                title={s.toggleTheme}
                className="grid h-8 w-8 place-items-center rounded-lg border border-slate-200 text-slate-500 transition hover:text-slate-900 dark:border-white/10 dark:text-slate-300 dark:hover:text-white"
              >
                <Icon name={theme === 'dark' ? 'sun' : 'moon'} className="h-4 w-4" />
              </button>
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="mx-auto max-w-5xl space-y-6 px-4 py-8">
          {/* Header */}
          <div>
            <h1 className="font-grotesk text-2xl font-bold text-slate-900 dark:text-white">{s.pageTitle}</h1>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{s.pageSubtitle}</p>
          </div>

          {/* Course overview stats */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-night-700">
            <h2 className="mb-5 text-xs font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">{s.courseOverview}</h2>
            <div className="grid grid-cols-3 gap-4 text-center">
              <Stat value={totalModules} label={s.modules} />
              <Stat value={completed} label={s.complete} />
              <Stat value={assessmentsDone} label={s.assessmentsComplete} accent />
            </div>
          </div>

          {/* Modules */}
          <div className="space-y-3">
            {MODULES.map((mod) => (
              <ModuleCard key={mod.number} mod={mod} lang={lang} />
            ))}
          </div>

          {/* Footer */}
          <p className="text-center text-xs text-slate-400 dark:text-slate-600">
            {s.source}{' '}
            <a
              href="https://ngs.classportal.online/assessment/assessment/module/id/429"
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-slate-600 dark:hover:text-slate-400"
            >
              ngs.classportal.online
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
