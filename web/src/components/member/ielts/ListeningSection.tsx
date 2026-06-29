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

  // Exam audio flow: nothing plays until the sound check is passed; then the
  // recording plays through once (no pause/seek/replay) — faithful to the real test.
  const [started, setStarted] = useState(false);
  const [practice, setPractice] = useState(false);
  const [vol, setVol] = useState(1);
  const [reviewMode, setReviewMode] = useState(false);

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

  // Real test: when the recording finishes you get 2 minutes to check answers.
  const onAllAudioEnded = useCallback(() => {
    setReviewMode(true);
    setSecs((s) => Math.min(s, 120));
  }, [setSecs]);

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

      <ListeningAudio audios={test.audio} started={started} practice={practice} vol={vol} setVol={setVol} reviewMode={reviewMode} onAllEnded={onAllAudioEnded} />
      {reviewMode ? (
        <div className="shrink-0 bg-[#fff3cd] px-4 py-1.5 text-center text-[12px] font-bold text-[#8a6d00]">
          The recording has ended. You now have 2 minutes to check your answers.
        </div>
      ) : null}

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

      {!started && !submitted ? (
        <SoundCheck vol={vol} setVol={setVol} practice={practice} setPractice={setPractice} onStart={() => setStarted(true)} />
      ) : null}

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
            setStarted(false);
            setReviewMode(false);
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

/* ---------- pre-test sound check (auto-start gate) ---------- */

function SoundCheck({
  vol,
  setVol,
  practice,
  setPractice,
  onStart,
}: {
  vol: number;
  setVol: (v: number) => void;
  practice: boolean;
  setPractice: (b: boolean) => void;
  onStart: () => void;
}) {
  const playTone = () => {
    try {
      const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const ctx = new Ctx();
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.connect(g);
      g.connect(ctx.destination);
      osc.type = 'sine';
      osc.frequency.value = 440;
      g.gain.value = Math.min(0.2, vol * 0.25);
      osc.start();
      setTimeout(() => { osc.stop(); ctx.close(); }, 700);
    } catch { /* no audio context */ }
  };
  return (
    <div className="fixed inset-0 z-[85] flex items-center justify-center bg-[#1f2530]/95 p-4" style={{ fontFamily: 'Arial, Helvetica, sans-serif' }}>
      <div className="w-[450px] rounded-lg bg-white p-6 text-center text-[#222] shadow-2xl">
        <div className="text-[40px]" aria-hidden>🎧</div>
        <h3 className="mt-2 text-[18px] font-bold">Sound check</h3>
        <p className="mx-auto mt-1 max-w-[380px] text-[13px] leading-relaxed text-[#555]">
          Put on your headphones, play the test sound and set a comfortable volume. In the real test the recording plays
          <b> once</b> and cannot be paused, rewound or replayed.
        </p>
        <button type="button" onClick={playTone} className="mt-4 rounded border border-[#bbb] bg-[#f6f6f6] px-4 py-2 text-[13px] font-bold hover:bg-[#e2e2e2]">▶ Play test sound</button>
        <div className="mt-4 flex items-center gap-3">
          <span aria-hidden>🔊</span>
          <input type="range" min={0} max={1} step={0.05} value={vol} onChange={(e) => setVol(Number(e.target.value))} className="flex-1 accent-[#1565c0]" aria-label="Volume" />
        </div>
        <label className="mt-4 flex items-start gap-2 rounded border border-[#eee] bg-[#fafafa] p-2.5 text-left text-[12px]">
          <input type="checkbox" checked={practice} onChange={(e) => setPractice(e.target.checked)} className="mt-0.5" />
          <span><b>Practice mode</b> — allow pausing, rewinding and replaying the audio. This is <b>not</b> like the real exam; leave it off to practise under real conditions.</span>
        </label>
        <button type="button" onClick={onStart} className="mt-5 w-full rounded bg-[#1565c0] px-4 py-2.5 text-[14px] font-bold text-white hover:bg-[#0f4ea0]">Start the Listening test</button>
      </div>
    </div>
  );
}

/* ---------- audio bar ----------
 * Exam mode: the recording plays through all parts once, with a volume control
 * only — no play/pause, seek or replay, and it does NOT move the question screen.
 * Practice mode (opt-in): full transport controls for study.
 */
function ListeningAudio({
  audios,
  started,
  practice,
  vol,
  setVol,
  reviewMode,
  onAllEnded,
}: {
  audios: string[];
  started: boolean;
  practice: boolean;
  vol: number;
  setVol: (v: number) => void;
  reviewMode: boolean;
  onAllEnded: () => void;
}) {
  const ref = useRef<HTMLAudioElement>(null);
  const [part, setPart] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [finished, setFinished] = useState(false);
  const [cur, setCur] = useState(0);
  const [dur, setDur] = useState(0);

  // Auto-play on start and at each part boundary (continuous recording).
  useEffect(() => {
    if (!started || finished) return;
    const a = ref.current;
    if (!a) return;
    a.volume = vol;
    const p = a.play();
    if (p && typeof p.then === 'function') p.then(() => setPlaying(true)).catch(() => setPlaying(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [started, part]);

  useEffect(() => {
    if (ref.current) ref.current.volume = vol;
  }, [vol]);

  const handleEnded = () => {
    if (part < audios.length - 1) {
      setCur(0);
      setPart((p) => p + 1);
    } else {
      setPlaying(false);
      setFinished(true);
      onAllEnded();
    }
  };

  const toggle = () => {
    const a = ref.current;
    if (!a) return;
    if (a.paused) { a.play(); setPlaying(true); } else { a.pause(); setPlaying(false); }
  };
  const replay = () => {
    const a = ref.current;
    if (!a) return;
    a.currentTime = 0;
    a.play();
    setPlaying(true);
    setFinished(false);
  };

  return (
    <div className="flex shrink-0 items-center gap-3 border-b border-[#d8d8d8] bg-[#f3f4f6] px-4 py-2 text-[#222]">
      <audio
        ref={ref}
        src={audios[part]}
        onEnded={handleEnded}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onTimeUpdate={(e) => setCur(e.currentTarget.currentTime)}
        onLoadedMetadata={(e) => setDur(e.currentTarget.duration)}
      />

      <span className="shrink-0 text-[14px]" aria-hidden>🔊</span>
      <input
        type="range"
        min={0}
        max={1}
        step={0.05}
        value={vol}
        onChange={(e) => setVol(Number(e.target.value))}
        className="w-24 shrink-0 accent-[#1565c0]"
        aria-label="Volume"
      />

      <span className="shrink-0 text-[12px] font-bold">
        {finished || reviewMode ? 'Audio finished' : started ? 'Audio playing' : 'Audio ready'}
        <span className="ml-1 font-normal text-[#666]">· Part {Math.min(part + 1, audios.length)} of {audios.length}</span>
      </span>

      {playing && !practice ? (
        <span className="flex shrink-0 items-center gap-1 text-[11px] text-[#1565c0]">
          <span className="h-2 w-2 animate-pulse rounded-full bg-[#1565c0]" />playing
        </span>
      ) : null}

      {/* Exam mode: a resume affordance only if the browser interrupted playback (no scrub/replay). */}
      {!practice && started && !playing && !finished ? (
        <button type="button" onClick={toggle} className="shrink-0 rounded border border-[#bbb] bg-white px-2 py-0.5 text-[11px] hover:bg-[#e2e2e2]">Resume audio</button>
      ) : null}

      {/* Practice mode: full transport controls for study. */}
      {practice ? (
        <div className="flex min-w-0 flex-1 items-center gap-2">
          <button type="button" onClick={toggle} className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#1565c0] text-[11px] text-white hover:bg-[#0f4ea0]" aria-label={playing ? 'Pause' : 'Play'}>
            {playing ? '❚❚' : '▶'}
          </button>
          <input
            type="range"
            min={0}
            max={dur || 0}
            step={1}
            value={cur}
            onChange={(e) => {
              const a = ref.current;
              if (a) { a.currentTime = Number(e.target.value); setCur(Number(e.target.value)); }
            }}
            className="min-w-0 flex-1 accent-[#1565c0]"
            aria-label="Seek"
          />
          <span className="shrink-0 text-[11px] tabular-nums text-[#555]">{fmt(cur)} / {fmt(dur)}</span>
          <button type="button" onClick={replay} className="shrink-0 rounded border border-[#bbb] bg-white px-2 py-0.5 text-[11px] hover:bg-[#e2e2e2]">↺ Replay</button>
          <span className="shrink-0 text-[10px] font-bold text-[#c8102e]">practice mode — not like the real exam</span>
        </div>
      ) : (
        <div className="flex-1" />
      )}
    </div>
  );
}
