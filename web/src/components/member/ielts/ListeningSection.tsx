'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import rawTest from './data/cam15-test1-listening.json';
import type { ColorTheme, ListeningTest, QGroup, TextSize } from './types';
import { scoreGroup, type Verdict } from './scoring';
import { BottomNav, GroupView, ResultsOverlay, SettingsPanel, SIZE, THEME, TopBar, listeningBand, range, useCountdown } from './shared';

const test = rawTest as unknown as ListeningTest;
const partOfQ = (n: number) => Math.floor((n - 1) / 10) + 1;

export function ListeningSection({
  theme,
  size,
  setTheme,
  setSize,
  onExit,
}: {
  theme: ColorTheme;
  size: TextSize;
  setTheme: (t: ColorTheme) => void;
  setSize: (s: TextSize) => void;
  onExit: () => void;
}) {
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [flagged, setFlagged] = useState<Set<number>>(new Set());
  const [current, setCurrent] = useState(1);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [secs, setSecs] = useCountdown(test.timeLimitMinutes * 60, !submitted, () => setSubmitted(true));
  const [timerHidden, setTimerHidden] = useState(false);

  const groupOfQ = useMemo(() => {
    const m = new Map<number, QGroup>();
    test.questionGroups.forEach((g) => g.questions.forEach((q) => m.set(q.n, g)));
    return m;
  }, []);
  const currentPart = partOfQ(current);
  const partGroups = test.questionGroups.filter((g) => g.part === currentPart);
  const partInfo = test.parts.find((p) => p.id === currentPart);

  const setAnswer = useCallback((n: number, v: string) => setAnswers((a) => ({ ...a, [n]: v })), []);
  const toggleFlag = useCallback((n: number) => {
    setFlagged((f) => {
      const next = new Set(f);
      next.has(n) ? next.delete(n) : next.add(n);
      return next;
    });
  }, []);
  const isAnswered = useCallback(
    (n: number) => {
      const g = groupOfQ.get(n)!;
      if (g.type === 'mcq' && /\bTWO\b/i.test(g.instructions)) {
        return (answers[g.questions[0].n] || '').split(',').filter(Boolean).length >= 2;
      }
      return !!answers[n];
    },
    [answers, groupOfQ]
  );

  const verdicts = useMemo<Verdict[]>(
    () => (submitted ? test.questionGroups.flatMap((g) => scoreGroup(g, answers)) : []),
    [submitted, answers]
  );
  const score = verdicts.filter((v) => v.correct).length;
  const th = THEME[theme];
  const answeredCount = range(1, 40).filter(isAnswered).length;

  return (
    <div className="fixed inset-0 z-[60] flex flex-col bg-white text-[#1a1a1a]" style={{ fontFamily: 'Arial, Helvetica, sans-serif' }}>
      <TopBar label="IELTS Listening" secs={secs} hidden={timerHidden} toggleHidden={() => setTimerHidden((v) => !v)} onSettings={() => setSettingsOpen(true)} onExit={onExit} />

      <AudioBar
        src={test.audio[currentPart - 1]}
        part={currentPart}
        totalParts={test.audio.length}
        onEnded={() => {
          if (currentPart < test.audio.length) setCurrent(currentPart * 10 + 1);
        }}
      />

      <div className="min-h-0 flex-1 overflow-y-auto" style={{ background: th.bg, color: th.fg }}>
        <div className="mx-auto max-w-3xl px-6 py-5" style={{ fontSize: SIZE[size], lineHeight: 1.6 }}>
          <div className="mb-4 border-b border-current/20 pb-2">
            <h2 className="text-[1.2em] font-bold">{partInfo?.title ?? `Part ${currentPart}`}</h2>
            <p className="text-[0.85em] opacity-75">Listen and answer questions {(currentPart - 1) * 10 + 1}–{currentPart * 10}.</p>
          </div>
          {partInfo?.figure ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={partInfo.figure.image} alt={partInfo.figure.alt ?? ''} className="mb-4 w-full rounded border border-current/15" />
          ) : null}
          {partGroups.map((g) => (
            <GroupView key={g.range} group={g} answers={answers} setAnswer={setAnswer} current={current} setCurrent={setCurrent} submitted={submitted} inputBg={th.input} fg={th.fg} />
          ))}
        </div>
      </div>

      <BottomNav
        total={40}
        parts={[['Part 1', range(1, 10)], ['Part 2', range(11, 20)], ['Part 3', range(21, 30)], ['Part 4', range(31, 40)]]}
        current={current}
        setCurrent={setCurrent}
        isAnswered={isAnswered}
        flagged={flagged}
        toggleFlag={toggleFlag}
        onSubmit={() => setSubmitted(true)}
      />

      {settingsOpen ? <SettingsPanel theme={theme} setTheme={setTheme} size={size} setSize={setSize} onClose={() => setSettingsOpen(false)} /> : null}

      {submitted ? (
        <ResultsOverlay
          title="Listening — results"
          subtitle="Cambridge IELTS 15 · Listening · Test 1"
          score={score}
          total={40}
          band={listeningBand(score)}
          verdicts={verdicts}
          answered={answeredCount}
          onReview={() => setSubmitted(false)}
          onRestart={() => {
            setAnswers({});
            setFlagged(new Set());
            setSecs(test.timeLimitMinutes * 60);
            setCurrent(1);
            setSubmitted(false);
          }}
        />
      ) : null}
    </div>
  );
}

function fmt(t: number) {
  if (!isFinite(t)) return '0:00';
  const m = Math.floor(t / 60);
  const s = Math.floor(t % 60);
  return `${m}:${String(s).padStart(2, '0')}`;
}

function AudioBar({ src, part, totalParts, onEnded }: { src: string; part: number; totalParts: number; onEnded: () => void }) {
  const ref = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [cur, setCur] = useState(0);
  const [dur, setDur] = useState(0);
  const [vol, setVol] = useState(1);

  useEffect(() => {
    setPlaying(false);
    setCur(0);
    setDur(0);
  }, [src]);

  const toggle = () => {
    const a = ref.current;
    if (!a) return;
    if (a.paused) {
      a.play();
      setPlaying(true);
    } else {
      a.pause();
      setPlaying(false);
    }
  };

  return (
    <div className="flex shrink-0 items-center gap-3 border-b border-[#d8d8d8] bg-[#f3f4f6] px-4 py-2 text-[#222]">
      <audio
        ref={ref}
        src={src}
        onTimeUpdate={(e) => setCur(e.currentTarget.currentTime)}
        onLoadedMetadata={(e) => setDur(e.currentTarget.duration)}
        onEnded={() => {
          setPlaying(false);
          onEnded();
        }}
      />
      <button type="button" onClick={toggle} className="flex h-9 w-9 items-center justify-center rounded-full bg-[#1565c0] text-white hover:bg-[#0f4ea0]" aria-label={playing ? 'Pause' : 'Play'}>
        {playing ? '❚❚' : '▶'}
      </button>
      <span className="shrink-0 text-[12px] font-bold">Audio · Part {part}/{totalParts}</span>
      <input
        type="range"
        min={0}
        max={dur || 0}
        step={1}
        value={cur}
        onChange={(e) => {
          const a = ref.current;
          if (a) {
            a.currentTime = Number(e.target.value);
            setCur(Number(e.target.value));
          }
        }}
        className="flex-1 accent-[#1565c0]"
        aria-label="Seek"
      />
      <span className="shrink-0 text-[11px] tabular-nums text-[#555]">{fmt(cur)} / {fmt(dur)}</span>
      <span className="shrink-0 text-[14px]" aria-hidden>🔊</span>
      <input
        type="range"
        min={0}
        max={1}
        step={0.05}
        value={vol}
        onChange={(e) => {
          const v = Number(e.target.value);
          setVol(v);
          if (ref.current) ref.current.volume = v;
        }}
        className="w-20 accent-[#1565c0]"
        aria-label="Volume"
      />
      <span className="shrink-0 text-[10px] text-[#888]" title="In the real test the recording plays once and cannot be paused or replayed.">plays once (real test)</span>
    </div>
  );
}
