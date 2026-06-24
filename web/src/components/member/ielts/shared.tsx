'use client';

import { useCallback, useEffect, useState } from 'react';
import type { ColorTheme, QGroup, TextSize } from './types';
import { scoreGroup, type Verdict } from './scoring';

export const TF = ['TRUE', 'FALSE', 'NOT GIVEN'];
export const YN = ['YES', 'NO', 'NOT GIVEN'];

export const THEME: Record<ColorTheme, { bg: string; fg: string; mark: string; input: string }> = {
  default: { bg: '#ffffff', fg: '#1a1a1a', mark: '#ffe680', input: '#ffffff' },
  cream: { bg: '#fffbea', fg: '#1a1a1a', mark: '#ffd54a', input: '#fffdf3' },
  inverse: { bg: '#000000', fg: '#ffffff', mark: '#7a5cff', input: '#111111' },
  contrast: { bg: '#000000', fg: '#ffe680', mark: '#3b6ea5', input: '#111111' },
};
export const SIZE: Record<TextSize, number> = { standard: 16, large: 19, xlarge: 22 };

export function range(a: number, b: number) {
  return Array.from({ length: b - a + 1 }, (_, i) => a + i);
}

export function useCountdown(initial: number, running: boolean, onExpire: () => void) {
  const [secs, setSecs] = useState(initial);
  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => setSecs((s) => (s <= 1 ? 0 : s - 1)), 1000);
    return () => clearInterval(id);
  }, [running]);
  useEffect(() => {
    if (secs === 0) onExpire();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [secs]);
  return [secs, setSecs] as const;
}

export function fmtTimer(secs: number, hover: boolean) {
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  if (hover || secs < 60) return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')} left`;
  return `${m} minute${m === 1 ? '' : 's'} left`;
}

// Official raw-score (/40) → band conversion tables. Listening and Academic
// Reading use DIFFERENT tables (Reading is graded a little harder). These are
// the standard published conversions; exact cutoffs can vary slightly per test.
const LISTENING_TABLE: [number, string][] = [
  [39, '9.0'], [37, '8.5'], [35, '8.0'], [32, '7.5'], [30, '7.0'], [26, '6.5'],
  [23, '6.0'], [18, '5.5'], [16, '5.0'], [13, '4.5'], [10, '4.0'], [6, '3.5'], [4, '3.0'],
];
const ACADEMIC_READING_TABLE: [number, string][] = [
  [39, '9.0'], [37, '8.5'], [35, '8.0'], [33, '7.5'], [30, '7.0'], [27, '6.5'],
  [23, '6.0'], [19, '5.5'], [15, '5.0'], [13, '4.5'], [10, '4.0'], [8, '3.5'], [6, '3.0'],
];
function fromTable(t: [number, string][], score: number): string {
  for (const [min, band] of t) if (score >= min) return band;
  return '<3.0';
}
export const listeningBand = (score: number) => fromTable(LISTENING_TABLE, score);
export const academicReadingBand = (score: number) => fromTable(ACADEMIC_READING_TABLE, score);

/* ---------- top bar ---------- */

export function TopBar({
  label,
  secs,
  hidden,
  toggleHidden,
  onSettings,
  onExit,
}: {
  label: string;
  secs?: number;
  hidden?: boolean;
  toggleHidden?: () => void;
  onSettings: () => void;
  onExit: () => void;
}) {
  const [hover, setHover] = useState(false);
  const hasTimer = typeof secs === 'number';
  const warn = hasTimer && secs! <= 600;
  const danger = hasTimer && secs! <= 300;
  return (
    <header className="flex h-12 shrink-0 items-center justify-between border-b border-[#c8c8c8] bg-[#ececec] px-3 text-[#222]">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onExit}
          className="rounded border border-[#bbb] bg-[#f6f6f6] px-2 py-1 text-[12px] text-[#333] hover:bg-[#e2e2e2]"
        >
          ‹ Tests
        </button>
        <div className="flex flex-col leading-tight">
          <span className="text-[13px] font-bold tracking-tight">{label}</span>
          <span className="text-[11px] text-[#666]">Demo Candidate — XXX 000000</span>
        </div>
      </div>
      <div className="flex items-center gap-2">
        {hasTimer ? (
          !hidden ? (
            <span
              onMouseEnter={() => setHover(true)}
              onMouseLeave={() => setHover(false)}
              className={`rounded px-3 py-1 text-[13px] font-bold tabular-nums ${
                danger ? 'animate-pulse bg-[#c8102e] text-white' : warn ? 'bg-[#c8102e] text-white' : 'text-[#111]'
              }`}
            >
              {fmtTimer(secs!, hover)}
            </span>
          ) : (
            <span className="px-3 py-1 text-[13px] text-[#888]">Time hidden</span>
          )
        ) : null}
        {hasTimer && toggleHidden ? <BarBtn onClick={toggleHidden}>{hidden ? 'Show' : 'Hide'}</BarBtn> : null}
        <BarBtn onClick={onSettings}>Settings</BarBtn>
        <BarBtn onClick={() => alert('On-screen help is not available in this demo.')}>Help</BarBtn>
      </div>
    </header>
  );
}

export function BarBtn({ children, onClick }: { children: React.ReactNode; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded border border-[#bbb] bg-[#f6f6f6] px-3 py-1 text-[12px] text-[#333] hover:bg-[#e2e2e2] active:bg-[#d5d5d5]"
    >
      {children}
    </button>
  );
}

/* ---------- question group (shared by reading + listening) ---------- */

const COMPLETION = new Set([
  'note-completion', 'table-completion', 'summary-completion', 'sentence-completion',
  'short-answer', 'form-completion', 'flow-chart-completion',
]);
const MATCHING = new Set([
  'matching-information', 'matching-features', 'matching-headings', 'matching',
  'map-labelling', 'plan-labelling',
]);

export function GroupView({
  group,
  answers,
  setAnswer,
  current,
  setCurrent,
  submitted,
  inputBg,
  fg,
}: {
  group: QGroup;
  answers: Record<number, string>;
  setAnswer: (n: number, v: string) => void;
  current: number;
  setCurrent: (n: number) => void;
  submitted: boolean;
  inputBg: string;
  fg: string;
}) {
  const chooseTwo = group.type === 'mcq' && /\bTWO\b/i.test(group.instructions);
  const isRadioWord = group.type === 'tfng' || group.type === 'ynng';
  const words = group.type === 'ynng' ? YN : TF;
  const isMatching = MATCHING.has(group.type);

  return (
    <div className="mb-7">
      <div className="mb-1 text-[0.95em] font-bold">Questions {group.range}</div>
      <p className="mb-3 whitespace-pre-wrap text-[0.92em] italic opacity-85">{group.instructions}</p>

      {isMatching && group.optionBank.length > 0 ? (
        <ul className="mb-3 rounded border border-current/20 p-3 text-[0.9em]">
          {group.optionBank.map((o) => (
            <li key={o.key} className="flex gap-2">
              <span className="w-7 shrink-0 font-bold">{o.key}</span>
              <span>{o.text}</span>
            </li>
          ))}
        </ul>
      ) : null}

      {chooseTwo ? (
        <ChooseTwo group={group} answers={answers} setAnswer={setAnswer} setCurrent={setCurrent} />
      ) : (
        <ol className="space-y-3">
          {group.questions.map((q) => (
            <li
              key={q.n}
              id={`q-${q.n}`}
              onClick={() => setCurrent(q.n)}
              className={`rounded p-2 ${current === q.n ? 'outline outline-2 outline-[#1976d2]' : ''}`}
            >
              <div className="flex gap-2">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded bg-[#1976d2] text-[0.8em] font-bold text-white">
                  {q.n}
                </span>
                <div className="flex-1">
                  {isRadioWord ? (
                    <>
                      <p className="mb-1">{q.text}</p>
                      <div className="flex flex-wrap gap-x-5 gap-y-1">
                        {words.map((w) => (
                          <label key={w} className="flex cursor-pointer items-center gap-1.5 text-[0.9em]">
                            <input type="radio" name={`q${q.n}`} checked={answers[q.n] === w} onChange={() => setAnswer(q.n, w)} />
                            {w}
                          </label>
                        ))}
                      </div>
                    </>
                  ) : q.options.length > 0 ? (
                    <>
                      <p className="mb-1">{q.text}</p>
                      <div className="space-y-1">
                        {q.options.map((o) => (
                          <label key={o.key} className="flex cursor-pointer items-start gap-2 text-[0.92em]">
                            <input type="radio" name={`q${q.n}`} className="mt-1" checked={answers[q.n] === o.key} onChange={() => setAnswer(q.n, o.key)} />
                            <span>
                              <b className="mr-1">{o.key}</b>
                              {o.text}
                            </span>
                          </label>
                        ))}
                      </div>
                    </>
                  ) : isMatching ? (
                    <div className="flex items-start gap-2">
                      <span className="flex-1">{q.text}</span>
                      <select
                        value={answers[q.n] || ''}
                        onChange={(e) => setAnswer(q.n, e.target.value)}
                        className="rounded border border-current/40 px-1 py-0.5 text-[0.9em]"
                        style={{ background: inputBg, color: fg }}
                      >
                        <option value="">—</option>
                        {group.optionBank.map((o) => (
                          <option key={o.key} value={o.key}>
                            {o.key}
                          </option>
                        ))}
                      </select>
                    </div>
                  ) : (
                    <GapText text={q.text} value={answers[q.n] || ''} onChange={(v) => setAnswer(q.n, v)} inputBg={inputBg} fg={fg} />
                  )}
                  {submitted ? <Mark n={q.n} answers={answers} group={group} /> : null}
                </div>
              </div>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}

function ChooseTwo({
  group,
  answers,
  setAnswer,
  setCurrent,
}: {
  group: QGroup;
  answers: Record<number, string>;
  setAnswer: (n: number, v: string) => void;
  setCurrent: (n: number) => void;
}) {
  const first = group.questions[0];
  const picked = (answers[first.n] || '').split(',').filter(Boolean);
  const toggle = (key: string) => {
    let next = picked.includes(key) ? picked.filter((k) => k !== key) : [...picked, key];
    if (next.length > 2) next = next.slice(-2);
    setAnswer(first.n, next.join(','));
  };
  return (
    <div onClick={() => setCurrent(first.n)} className="rounded p-2">
      <p className="mb-2">
        <b>{group.questions.map((q) => q.n).join(' & ')}</b> &nbsp;{first.text}
      </p>
      <div className="space-y-1">
        {first.options.map((o) => (
          <label key={o.key} className="flex cursor-pointer items-start gap-2 text-[0.92em]">
            <input type="checkbox" className="mt-1" checked={picked.includes(o.key)} onChange={() => toggle(o.key)} />
            <span>
              <b className="mr-1">{o.key}</b>
              {o.text}
            </span>
          </label>
        ))}
      </div>
    </div>
  );
}

function GapText({
  text,
  value,
  onChange,
  inputBg,
  fg,
}: {
  text: string;
  value: string;
  onChange: (v: string) => void;
  inputBg: string;
  fg: string;
}) {
  const parts = text.split(/_{3,}/);
  const input = (
    <input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="mx-1 w-36 rounded border border-current/40 px-1 py-0.5 align-baseline text-[0.95em]"
      style={{ background: inputBg, color: fg }}
      autoComplete="off"
      spellCheck={false}
    />
  );
  if (parts.length === 1) {
    return (
      <span>
        {text} {input}
      </span>
    );
  }
  return (
    <span>
      {parts.map((p, i) => (
        <span key={i}>
          {p}
          {i < parts.length - 1 ? input : null}
        </span>
      ))}
    </span>
  );
}

function Mark({ n, answers, group }: { n: number; answers: Record<number, string>; group: QGroup }) {
  const v = scoreGroup(group, answers).find((x) => x.n === n);
  if (!v) return null;
  return (
    <p className={`mt-1 text-[0.82em] ${v.correct ? 'text-[#1b7a32]' : 'text-[#c8102e]'}`}>
      {v.correct ? '✓ Correct' : `✗ Your answer: ${v.your} · Correct: ${v.key}`}
    </p>
  );
}

/* ---------- bottom navigator (reading + listening) ---------- */

export function BottomNav({
  total,
  parts,
  current,
  setCurrent,
  isAnswered,
  flagged,
  toggleFlag,
  onSubmit,
}: {
  total: number;
  parts: [string, number[]][];
  current: number;
  setCurrent: (n: number) => void;
  isAnswered: (n: number) => boolean;
  flagged: Set<number>;
  toggleFlag: (n: number) => void;
  onSubmit: () => void;
}) {
  return (
    <footer className="flex shrink-0 items-center gap-3 border-t border-[#c8c8c8] bg-[#ececec] px-3 py-1.5 text-[#222]">
      <label className="flex shrink-0 items-center gap-1 text-[12px]">
        <input type="checkbox" checked={flagged.has(current)} onChange={() => toggleFlag(current)} />
        Review
      </label>
      <div className="flex flex-1 items-center gap-3 overflow-x-auto">
        {parts.map(([label, nums]) => (
          <div key={label} className="flex items-center gap-1">
            <span className="shrink-0 px-1 text-[11px] font-bold text-[#555]">{label}</span>
            {nums.map((n) => {
              const ans = isAnswered(n);
              const fl = flagged.has(n);
              const cur = current === n;
              return (
                <button
                  key={n}
                  type="button"
                  onClick={() => {
                    setCurrent(n);
                    document.getElementById(`q-${n}`)?.scrollIntoView({ block: 'center' });
                  }}
                  className={[
                    'flex h-7 w-7 shrink-0 items-center justify-center border text-[12px] tabular-nums',
                    fl ? 'rounded-full' : 'rounded-[2px]',
                    cur ? 'border-[#1976d2] bg-[#d6e4f5] font-bold' : 'border-[#bbb] bg-white',
                    ans ? 'font-bold underline decoration-2 underline-offset-2' : '',
                  ].join(' ')}
                  title={`Question ${n}${ans ? ' · answered' : ''}${fl ? ' · flagged' : ''}`}
                >
                  {n}
                </button>
              );
            })}
          </div>
        ))}
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <button type="button" onClick={() => setCurrent(Math.max(1, current - 1))} className="h-7 w-8 rounded border border-[#bbb] bg-white text-[15px] hover:bg-[#e2e2e2]" aria-label="Previous">‹</button>
        <button type="button" onClick={() => setCurrent(Math.min(total, current + 1))} className="h-7 w-8 rounded border border-[#bbb] bg-white text-[15px] hover:bg-[#e2e2e2]" aria-label="Next">›</button>
        <button type="button" onClick={onSubmit} className="h-7 rounded bg-[#1565c0] px-3 text-[12px] font-bold text-white hover:bg-[#0f4ea0]">Submit</button>
      </div>
    </footer>
  );
}

/* ---------- settings ---------- */

export type MicControls = {
  devices: { deviceId: string; label: string }[];
  deviceId: string;
  setDeviceId: (id: string) => void;
  refresh: () => void;
  status: 'idle' | 'asking' | 'ready' | 'denied';
};

export type VoiceControls = {
  mode: 'browser' | 'iflytek';
  setMode: (m: 'browser' | 'iflytek') => void;
  vcn: string;
  setVcn: (v: string) => void;
  voices: { id: string; label: string }[];
};

export type AsrControls = {
  provider: 'tencent' | 'iflytek';
  setProvider: (p: 'tencent' | 'iflytek') => void;
  realtime: boolean;
  setRealtime: (b: boolean) => void;
};

export function SettingsPanel({
  theme,
  setTheme,
  size,
  setSize,
  mic,
  voice,
  asr,
  onClose,
}: {
  theme: ColorTheme;
  setTheme: (t: ColorTheme) => void;
  size: TextSize;
  setSize: (s: TextSize) => void;
  mic?: MicControls;
  voice?: VoiceControls;
  asr?: AsrControls;
  onClose: () => void;
}) {
  const themes: [ColorTheme, string][] = [
    ['default', 'Black on white'],
    ['cream', 'Black on cream'],
    ['inverse', 'White on black'],
    ['contrast', 'Yellow on black'],
  ];
  const sizes: [TextSize, string][] = [
    ['standard', 'Standard'],
    ['large', 'Large'],
    ['xlarge', 'Extra large'],
  ];
  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/30" onClick={onClose}>
      <div className="w-[360px] rounded bg-white p-5 text-[#222] shadow-xl" onClick={(e) => e.stopPropagation()} style={{ fontFamily: 'Arial, Helvetica, sans-serif' }}>
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-[15px] font-bold">Settings</h3>
          <button type="button" onClick={onClose} className="text-[#666] hover:text-black">✕</button>
        </div>
        <p className="mb-1 text-[12px] font-bold text-[#555]">Text size</p>
        <div className="mb-4 flex gap-2">
          {sizes.map(([k, label]) => (
            <button key={k} type="button" onClick={() => setSize(k)} className={`flex-1 rounded border px-2 py-1.5 text-[12px] ${size === k ? 'border-[#1565c0] bg-[#d6e4f5] font-bold' : 'border-[#bbb] bg-[#f6f6f6]'}`}>
              {label}
            </button>
          ))}
        </div>
        <p className="mb-1 text-[12px] font-bold text-[#555]">Colours</p>
        <div className="grid grid-cols-2 gap-2">
          {themes.map(([k, label]) => (
            <button key={k} type="button" onClick={() => setTheme(k)} className={`rounded border px-2 py-2 text-[12px] ${theme === k ? 'border-[#1565c0] font-bold ring-2 ring-[#1565c0]' : 'border-[#bbb]'}`} style={{ background: THEME[k].bg, color: THEME[k].fg }}>
              {label}
            </button>
          ))}
        </div>
        {mic ? (
          <>
            <p className="mb-1 mt-4 flex items-center gap-1 text-[12px] font-bold text-[#555]">
              <span aria-hidden>🎙️</span> Microphone
            </p>
            <div className="flex gap-2">
              <select
                value={mic.deviceId}
                onChange={(e) => mic.setDeviceId(e.target.value)}
                className="min-w-0 flex-1 rounded border border-[#bbb] bg-white px-2 py-1.5 text-[12px]"
              >
                <option value="">System default microphone</option>
                {mic.devices.map((d) => (
                  <option key={d.deviceId} value={d.deviceId}>
                    {d.label}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={mic.refresh}
                className="shrink-0 rounded border border-[#bbb] bg-[#f6f6f6] px-3 py-1.5 text-[12px] hover:bg-[#e2e2e2]"
              >
                {mic.status === 'asking' ? '…' : 'Detect'}
              </button>
            </div>
            <p className="mt-1 text-[11px] text-[#888]">
              {mic.status === 'denied'
                ? 'Microphone access was blocked — enable it in your browser, then Detect.'
                : mic.devices.length === 0
                  ? 'Click Detect and allow microphone access to list your devices.'
                  : `${mic.devices.length} microphone${mic.devices.length === 1 ? '' : 's'} found. The selected one is used for recording.`}
            </p>
          </>
        ) : null}
        {voice ? (
          <>
            <p className="mb-1 mt-4 flex items-center gap-1 text-[12px] font-bold text-[#555]">
              <span aria-hidden>🔊</span> Examiner voice
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => voice.setMode('browser')}
                className={`flex-1 rounded border px-2 py-1.5 text-[12px] ${voice.mode === 'browser' ? 'border-[#1565c0] bg-[#d6e4f5] font-bold' : 'border-[#bbb] bg-[#f6f6f6]'}`}
              >
                Browser (British)
              </button>
              <button
                type="button"
                onClick={() => voice.setMode('iflytek')}
                className={`flex-1 rounded border px-2 py-1.5 text-[12px] ${voice.mode === 'iflytek' ? 'border-[#1565c0] bg-[#d6e4f5] font-bold' : 'border-[#bbb] bg-[#f6f6f6]'}`}
              >
                iFlytek (natural)
              </button>
            </div>
            {voice.mode === 'iflytek' ? (
              <select
                value={voice.vcn}
                onChange={(e) => voice.setVcn(e.target.value)}
                className="mt-2 w-full rounded border border-[#bbb] bg-white px-2 py-1.5 text-[12px]"
              >
                {voice.voices.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.label}
                  </option>
                ))}
              </select>
            ) : null}
            <p className="mt-1 text-[11px] text-[#888]">
              {voice.mode === 'iflytek'
                ? 'Cloud neural voice (US accent, very natural). Changes apply to the examiner’s next line.'
                : 'Free and offline; uses your device’s en-GB voice (e.g. “Daniel”) if available.'}
            </p>
          </>
        ) : null}
        {asr ? (
          <>
            <p className="mb-1 mt-4 flex items-center gap-1 text-[12px] font-bold text-[#555]">
              <span aria-hidden>📝</span> Speech recognition
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => asr.setProvider('tencent')}
                className={`flex-1 rounded border px-2 py-1.5 text-[12px] ${asr.provider === 'tencent' ? 'border-[#1565c0] bg-[#d6e4f5] font-bold' : 'border-[#bbb] bg-[#f6f6f6]'}`}
              >
                Tencent (faster)
              </button>
              <button
                type="button"
                onClick={() => asr.setProvider('iflytek')}
                className={`flex-1 rounded border px-2 py-1.5 text-[12px] ${asr.provider === 'iflytek' ? 'border-[#1565c0] bg-[#d6e4f5] font-bold' : 'border-[#bbb] bg-[#f6f6f6]'}`}
              >
                iFlytek (compare)
              </button>
            </div>
            <p className="mt-1 text-[11px] text-[#888]">
              Which engine transcribes your spoken answers. Tencent is faster; iFlytek is an alternative to A/B accuracy on accented English.
            </p>
            {asr.provider === 'tencent' ? (
              <label className="mt-2 flex items-start gap-2 text-[12px]">
                <input type="checkbox" checked={asr.realtime} onChange={(e) => asr.setRealtime(e.target.checked)} className="mt-0.5" />
                <span>
                  <b>Real-time streaming</b> — transcribe while you speak so the examiner replies sooner. Needs Tencent
                  real-time ASR enabled on the account; otherwise it falls back to one-shot automatically.
                </span>
              </label>
            ) : null}
          </>
        ) : null}
      </div>
    </div>
  );
}

/* ---------- microphone selection (AI examiner) ---------- */

/**
 * Enumerate audio-input devices and remember the chosen one. Device *labels*
 * are only exposed after a getUserMedia grant, so `refresh()` primes a one-shot
 * permission then re-enumerates. The selection persists in localStorage and the
 * list auto-refreshes when devices are plugged/unplugged.
 */
export function useMic() {
  const [devices, setDevices] = useState<{ deviceId: string; label: string }[]>([]);
  const [deviceId, setDeviceIdState] = useState('');
  const [status, setStatus] = useState<MicControls['status']>('idle');

  const setDeviceId = useCallback((id: string) => {
    setDeviceIdState(id);
    try { localStorage.setItem('ielts.micId', id); } catch { /* noop */ }
  }, []);

  const enumerate = useCallback(async () => {
    try {
      const list = await navigator.mediaDevices.enumerateDevices();
      const mics = list
        .filter((d) => d.kind === 'audioinput')
        .map((d, i) => ({ deviceId: d.deviceId, label: d.label || `Microphone ${i + 1}` }));
      setDevices(mics);
      setStatus((s) => (mics.some((m) => m.label && !/^Microphone \d+$/.test(m.label)) ? 'ready' : s));
    } catch { /* enumeration unavailable */ }
  }, []);

  // Prime a permission grant so labels resolve, then re-enumerate.
  const refresh = useCallback(async () => {
    if (!navigator.mediaDevices?.getUserMedia) return;
    setStatus('asking');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach((t) => t.stop());
      setStatus('ready');
    } catch {
      setStatus('denied');
    }
    await enumerate();
  }, [enumerate]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('ielts.micId');
      if (saved) setDeviceIdState(saved);
    } catch { /* noop */ }
    enumerate();
    const md = navigator.mediaDevices;
    md?.addEventListener?.('devicechange', enumerate);
    return () => md?.removeEventListener?.('devicechange', enumerate);
  }, [enumerate]);

  return { devices, deviceId, setDeviceId, refresh, status } as MicControls;
}

/* ---------- results overlay (reading + listening) ---------- */

export function ResultsOverlay({
  title,
  subtitle,
  score,
  total,
  band,
  verdicts,
  answered,
  onReview,
  onRestart,
}: {
  title: string;
  subtitle: string;
  score: number;
  total: number;
  band: string;
  verdicts: Verdict[];
  answered: number;
  onReview: () => void;
  onRestart: () => void;
}) {
  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/40 p-4">
      <div className="flex max-h-[86vh] w-[560px] flex-col rounded bg-white text-[#222] shadow-2xl" style={{ fontFamily: 'Arial, Helvetica, sans-serif' }}>
        <div className="border-b border-[#ddd] p-5">
          <h3 className="text-[18px] font-bold">{title}</h3>
          <p className="mt-1 text-[13px] text-[#666]">{subtitle}</p>
          <div className="mt-3 flex items-end gap-6">
            <div>
              <div className="text-[34px] font-bold leading-none">
                {score}
                <span className="text-[18px] text-[#888]">/{total}</span>
              </div>
              <div className="text-[12px] text-[#666]">{answered} answered</div>
            </div>
            <div className="rounded bg-[#d6e4f5] px-4 py-2">
              <div className="text-[11px] font-bold uppercase tracking-wide text-[#1565c0]">Band score</div>
              <div className="text-[26px] font-bold leading-none text-[#0f4ea0]">{band}</div>
            </div>
          </div>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto p-5">
          <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-[13px]">
            {verdicts.map((v) => (
              <div key={v.n} className="flex items-center justify-between border-b border-[#f0f0f0] py-0.5">
                <span className="tabular-nums">
                  <b>{v.n}.</b> {v.correct ? <span className="text-[#1b7a32]">✓</span> : <span className="text-[#c8102e]">✗</span>}
                </span>
                <span className="ml-2 truncate text-right text-[#555]" title={`Correct: ${v.key}`}>
                  {v.correct ? v.key : `${v.your} → ${v.key}`}
                </span>
              </div>
            ))}
          </div>
        </div>
        <div className="flex justify-end gap-2 border-t border-[#ddd] p-4">
          <button type="button" onClick={onReview} className="rounded border border-[#bbb] bg-[#f6f6f6] px-4 py-2 text-[13px] hover:bg-[#e2e2e2]">Review answers</button>
          <button type="button" onClick={onRestart} className="rounded bg-[#1565c0] px-4 py-2 text-[13px] font-bold text-white hover:bg-[#0f4ea0]">Restart</button>
        </div>
      </div>
    </div>
  );
}
