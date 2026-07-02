'use client';

import { useMemo, useState } from 'react';
import type { SatQuestion, SatSection, SatDomain, SatSkill, SatDifficulty } from '@/lib/sat/types';
import { DOMAINS_BY_SECTION, SKILLS_BY_DOMAIN } from '@/lib/sat/types';
import { C, SAT_FONT, ThemeLangToggle } from './shared';
import { useSatTheme, useSatLang, secLabel, domLabel, skillLabel, diffLabel } from './i18n';

/** Pick a slice of the bank to drill: section → domain → skill → difficulty →
 *  count. Shows the live match count, then hands a shuffled set to the runner. */
export function PracticeSetup({ pool, onStart, onBack }: { pool: SatQuestion[]; onStart: (qs: SatQuestion[], title: string) => void; onBack: () => void }) {
  const { dark } = useSatTheme();
  const { lang } = useSatLang();
  const [section, setSection] = useState<SatSection | 'all'>('all');
  const [domain, setDomain] = useState<SatDomain | 'all'>('all');
  const [skill, setSkill] = useState<SatSkill | 'all'>('all');
  const [difficulty, setDifficulty] = useState<SatDifficulty | 'all'>('all');
  const [origin, setOrigin] = useState<'all' | 'official' | 'original'>('all');
  const [count, setCount] = useState<number>(10);

  const domains: SatDomain[] = section === 'all' ? [] : DOMAINS_BY_SECTION[section];
  const skills: SatSkill[] = domain === 'all' ? [] : SKILLS_BY_DOMAIN[domain];
  // The 题源 toggle only appears once real-exam questions have been imported.
  const hasOfficial = useMemo(() => pool.some((q) => q.origin === 'official'), [pool]);

  const matches = useMemo(
    () => pool.filter((q) =>
      (section === 'all' || q.section === section) &&
      (domain === 'all' || q.domain === domain) &&
      (skill === 'all' || q.skill === skill) &&
      (difficulty === 'all' || q.difficulty === difficulty) &&
      (origin === 'all' || (q.origin ?? 'original') === origin),
    ),
    [pool, section, domain, skill, difficulty, origin],
  );

  function start() {
    const shuffled = [...matches].sort(() => Math.random() - 0.5);
    const set = count > 0 ? shuffled.slice(0, count) : shuffled;
    const parts = [
      origin === 'official' ? (lang === 'zh' ? '真题' : 'Real SAT') : null,
      skill !== 'all' ? skillLabel(skill, lang) : domain !== 'all' ? domLabel(domain, lang) : section !== 'all' ? secLabel(section, lang) : (lang === 'zh' ? '全部题目' : 'All questions'),
      difficulty !== 'all' ? diffLabel(difficulty, lang) : null,
    ].filter(Boolean);
    onStart(set, parts.join(' · '));
  }

  return (
    <div className={`sat-app fixed inset-0 z-[60] flex flex-col overflow-y-auto ${dark ? 'sat-dark' : ''}`} style={{ background: C.bg, color: C.ink, fontFamily: SAT_FONT }}>
      <header className="flex h-[60px] shrink-0 items-center gap-3 px-5" style={{ borderBottom: `1px solid ${C.hairline}` }}>
        <button type="button" onClick={onBack} className="rounded-full px-3 py-1.5 text-[13px] font-semibold" style={{ background: C.tint, color: C.blue }}>‹ {lang === 'zh' ? '返回' : 'Back'}</button>
        <div className="text-[15px] font-bold">{lang === 'zh' ? '按考点刷题' : 'Practice by skill'}</div>
        <div className="ml-auto"><ThemeLangToggle /></div>
      </header>

      <div className="mx-auto w-[min(680px,94vw)] py-8">
        <p className="text-[14px]" style={{ color: C.muted }}>{lang === 'zh' ? '不限时地专项练习任意考点，每题作答后即显示答案与解析。答错的题会自动加入你的错题本。' : 'Drill any skill untimed, with the answer and explanation after each question. Wrong answers go to your notebook automatically.'}</p>

        {hasOfficial ? (
          <div className="mt-6">
            <div className="mb-1.5 text-[12px] font-semibold" style={{ color: C.muted }}>{lang === 'zh' ? '题源' : 'Question source'}</div>
            <div className="inline-flex overflow-hidden rounded-full border" style={{ borderColor: C.border }}>
              {([
                ['all', lang === 'zh' ? '全部' : 'All'],
                ['official', lang === 'zh' ? '★ 真题演练' : '★ Real SAT'],
                ['original', lang === 'zh' ? '原创题' : 'Original'],
              ] as ['all' | 'official' | 'original', string][]).map(([v, lbl], i) => (
                <button key={v} type="button" onClick={() => setOrigin(v)}
                  className="px-4 py-1.5 text-[13px] font-semibold"
                  style={{ ...(origin === v ? { background: C.blue, color: '#fff' } : { background: C.panel, color: C.ink }), borderLeft: i ? `1px solid ${C.border}` : undefined }}>
                  {lbl}
                </button>
              ))}
            </div>
            {origin === 'official' ? <p className="mt-1.5 text-[12px]" style={{ color: C.muted }}>{lang === 'zh' ? '真实历年 SAT 考题(亚太/北美),附中文解析。' : 'Real questions from past SAT exams (Asia-Pacific / North America), with explanations.'}</p> : null}
          </div>
        ) : null}

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <Picker label={lang === 'zh' ? '部分' : 'Section'} value={section} onChange={(v) => { setSection(v as SatSection | 'all'); setDomain('all'); setSkill('all'); }}
            options={[['all', lang === 'zh' ? '全部部分' : 'All sections'], ...(['reading_writing', 'math'] as SatSection[]).map((s) => [s, secLabel(s, lang)] as [string, string])]} />
          <Picker label={lang === 'zh' ? '领域' : 'Domain'} value={domain} disabled={section === 'all'} onChange={(v) => { setDomain(v as SatDomain | 'all'); setSkill('all'); }}
            options={[['all', section === 'all' ? (lang === 'zh' ? '请先选择部分' : 'Pick a section first') : (lang === 'zh' ? '全部领域' : 'All domains')], ...domains.map((d) => [d, domLabel(d, lang)] as [string, string])]} />
          <Picker label={lang === 'zh' ? '考点' : 'Skill'} value={skill} disabled={domain === 'all'} onChange={(v) => setSkill(v as SatSkill | 'all')}
            options={[['all', domain === 'all' ? (lang === 'zh' ? '全部（选择领域以细分）' : 'All (pick a domain to narrow)') : (lang === 'zh' ? '全部考点' : 'All skills')], ...skills.map((s) => [s, skillLabel(s, lang)] as [string, string])]} />
          <Picker label={lang === 'zh' ? '难度' : 'Difficulty'} value={difficulty} onChange={(v) => setDifficulty(v as SatDifficulty | 'all')}
            options={[['all', lang === 'zh' ? '任意难度' : 'Any difficulty'], ...(['easy', 'medium', 'hard'] as SatDifficulty[]).map((d) => [d, diffLabel(d, lang)] as [string, string])]} />
        </div>

        <div className="mt-5">
          <div className="mb-1.5 text-[12px] font-semibold" style={{ color: C.muted }}>{lang === 'zh' ? '题目数量' : 'How many questions'}</div>
          <div className="flex gap-2">
            {[5, 10, 20, 0].map((n) => (
              <button key={n} type="button" onClick={() => setCount(n)}
                className="rounded-full border px-4 py-1.5 text-[13px] font-semibold"
                style={count === n ? { background: C.blue, color: '#fff', borderColor: C.blue } : { background: C.panel, color: C.ink, borderColor: C.border }}>
                {n === 0 ? (lang === 'zh' ? '全部' : 'All') : n}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-6 flex items-center justify-between rounded-lg border p-4" style={{ borderColor: C.border, background: C.panel2 }}>
          <span className="text-[14px]" style={{ color: C.muted }}>{lang === 'zh'
            ? <><b style={{ color: C.ink }}>{matches.length}</b> 道题符合条件{count > 0 && matches.length > count ? ` · 练习 ${count} 题` : ''}</>
            : <><b style={{ color: C.ink }}>{matches.length}</b> questions match{count > 0 && matches.length > count ? ` · drilling ${count}` : ''}</>}</span>
          <button type="button" onClick={start} disabled={!matches.length} className="rounded-full px-7 py-2.5 text-[14px] font-bold text-white disabled:opacity-40" style={{ background: C.blue }}>
            {lang === 'zh' ? '开始练习' : 'Start practice'}
          </button>
        </div>
      </div>
    </div>
  );
}

function Picker({ label, value, onChange, options, disabled }: { label: string; value: string; onChange: (v: string) => void; options: [string, string][]; disabled?: boolean }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[12px] font-semibold" style={{ color: C.muted }}>{label}</span>
      <select value={value} disabled={disabled} onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border px-3 py-2.5 text-[14px] disabled:opacity-50" style={{ borderColor: C.border, color: C.ink, background: C.panel }}>
        {options.map(([v, lbl]) => <option key={v} value={v}>{lbl}</option>)}
      </select>
    </label>
  );
}
