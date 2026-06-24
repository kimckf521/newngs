'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import rawTest from './data/cam15-test1-speaking.json';
import type { ColorTheme, SpeakingTest, TextSize } from './types';
import { SettingsPanel, SIZE, THEME, TopBar } from './shared';

const test = rawTest as unknown as SpeakingTest;

function clock(s: number) {
  const m = Math.floor(Math.max(0, s) / 60);
  const x = Math.max(0, s) % 60;
  return `${m}:${String(x).padStart(2, '0')}`;
}

/* ---------- examiner voice (Web Speech API) ---------- */

type Speaker = {
  supported: boolean;
  voices: SpeechSynthesisVoice[];
  voiceURI: string;
  setVoiceURI: (v: string) => void;
  speaking: boolean;
  speak: (text: string, onEnd?: () => void) => void;
  cancel: () => void;
};

function useSpeak(): Speaker {
  const supported = typeof window !== 'undefined' && 'speechSynthesis' in window;
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [voiceURI, setVoiceURI] = useState('');
  const [speaking, setSpeaking] = useState(false);

  useEffect(() => {
    if (!supported) return;
    const load = () => {
      const v = window.speechSynthesis.getVoices().filter((x) => x.lang.toLowerCase().startsWith('en'));
      // Prefer LOCAL/offline voices (work in mainland China — no blocked cloud call);
      // prefer en-GB (examiner); push Google cloud voices (blocked in China) to the end.
      const score = (x: SpeechSynthesisVoice) =>
        (x.localService ? 0 : 100) + (x.lang === 'en-GB' ? 0 : x.lang.startsWith('en-GB') ? 1 : 8) + (/google/i.test(x.name) ? 40 : 0);
      v.sort((a, b) => score(a) - score(b));
      setVoices(v);
      setVoiceURI((cur) => cur || v[0]?.voiceURI || '');
    };
    load();
    window.speechSynthesis.onvoiceschanged = load;
    return () => {
      window.speechSynthesis.onvoiceschanged = null;
      window.speechSynthesis.cancel();
    };
  }, [supported]);

  const speak = useCallback(
    (text: string, onEnd?: () => void) => {
      if (!supported) {
        onEnd?.();
        return;
      }
      const u = new SpeechSynthesisUtterance(text.replace(/\[[^\]]*\]/g, ''));
      const v = voices.find((x) => x.voiceURI === voiceURI);
      if (v) u.voice = v;
      u.rate = 0.95;
      u.onend = () => {
        setSpeaking(false);
        onEnd?.();
      };
      u.onerror = () => {
        setSpeaking(false);
        onEnd?.();
      };
      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(u);
      setSpeaking(true);
    },
    [supported, voices, voiceURI]
  );

  const cancel = useCallback(() => {
    if (supported) window.speechSynthesis.cancel();
    setSpeaking(false);
  }, [supported]);

  return { supported, voices, voiceURI, setVoiceURI, speaking, speak, cancel };
}

function Ask({ text, speak }: { text: string; speak: Speaker['speak'] }) {
  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        speak(text);
      }}
      title="Hear the examiner ask this"
      aria-label="Hear the examiner ask this"
      className="shrink-0 rounded-full border border-current/30 px-2 py-0.5 text-[0.8em] hover:bg-current/10"
    >
      🔊
    </button>
  );
}

/* ---------- candidate recording (MediaRecorder) ---------- */

function useRecorder() {
  const [status, setStatus] = useState<'idle' | 'recording' | 'recorded'>('idle');
  const [url, setUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const mr = useRef<MediaRecorder | null>(null);
  const chunks = useRef<BlobPart[]>([]);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  const start = useCallback(async () => {
    setError(null);
    if (typeof navigator === 'undefined' || !navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === 'undefined') {
      setError('Audio recording is not supported in this browser.');
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      chunks.current = [];
      const m = new MediaRecorder(stream);
      mr.current = m;
      m.ondataavailable = (e) => {
        if (e.data.size) chunks.current.push(e.data);
      };
      m.onstop = () => {
        const blob = new Blob(chunks.current, { type: m.mimeType || 'audio/webm' });
        setUrl((u) => {
          if (u) URL.revokeObjectURL(u);
          return URL.createObjectURL(blob);
        });
        stream.getTracks().forEach((t) => t.stop());
        setStatus('recorded');
        if (timer.current) clearInterval(timer.current);
      };
      m.start();
      setStatus('recording');
      setElapsed(0);
      timer.current = setInterval(() => setElapsed((e) => e + 1), 1000);
    } catch {
      setError('Microphone unavailable or permission denied. Allow microphone access to record.');
    }
  }, []);

  const stop = useCallback(() => {
    if (mr.current && mr.current.state !== 'inactive') mr.current.stop();
  }, []);
  const reset = useCallback(() => {
    setUrl((u) => {
      if (u) URL.revokeObjectURL(u);
      return null;
    });
    setStatus('idle');
    setElapsed(0);
  }, []);

  return { status, url, error, elapsed, start, stop, reset };
}

function RecorderControls({ hint }: { hint: string }) {
  const r = useRecorder();
  return (
    <div className="mt-4 rounded-lg border border-current/20 p-4">
      <div className="flex flex-wrap items-center gap-3">
        {r.status !== 'recording' ? (
          <button type="button" onClick={r.start} className="flex items-center gap-2 rounded-full bg-[#c8102e] px-4 py-2 text-[13px] font-bold text-white hover:bg-[#a50d24]">
            <span className="inline-block h-2.5 w-2.5 rounded-full bg-white" /> Record answer
          </button>
        ) : (
          <button type="button" onClick={r.stop} className="flex items-center gap-2 rounded-full bg-[#333] px-4 py-2 text-[13px] font-bold text-white">
            <span className="inline-block h-2.5 w-2.5 animate-pulse rounded-sm bg-[#ff5a5a]" /> Stop · {clock(r.elapsed)}
          </button>
        )}
        {r.status === 'recorded' ? (
          <button type="button" onClick={r.reset} className="rounded border border-current/30 px-3 py-1.5 text-[12px]">Re-record</button>
        ) : null}
        <span className="text-[12px] opacity-70">{hint}</span>
      </div>
      {r.error ? <p className="mt-2 text-[12px] text-[#c8102e]">{r.error}</p> : null}
      {r.url ? <audio controls src={r.url} className="mt-3 w-full" /> : null}
    </div>
  );
}

/* ---------- guided interview (ask aloud -> record -> next) ---------- */

function Interview({ questions, sp }: { questions: { topic?: string; text: string }[]; sp: Speaker }) {
  const [i, setI] = useState(-1);
  const ask = (idx: number) => {
    setI(idx);
    sp.speak(questions[idx].text);
  };
  return (
    <div className="mt-4">
      <div className="flex flex-wrap items-center gap-2 rounded-lg bg-current/5 p-3">
        {i < 0 ? (
          <button type="button" onClick={() => ask(0)} className="rounded bg-[#1565c0] px-4 py-2 text-[13px] font-bold text-white hover:bg-[#0f4ea0]">
            ▶ Start interview — examiner reads each question
          </button>
        ) : (
          <>
            <button type="button" onClick={() => sp.speak(questions[i].text)} className="rounded border border-current/30 px-3 py-1.5 text-[12px]">🔊 Repeat</button>
            <button type="button" disabled={i >= questions.length - 1} onClick={() => ask(i + 1)} className="rounded bg-[#1565c0] px-3 py-1.5 text-[12px] font-bold text-white hover:bg-[#0f4ea0] disabled:opacity-40">Next question ▸</button>
            <span className="text-[12px] opacity-70">Question {i + 1} of {questions.length}{sp.speaking ? ' · examiner speaking…' : ''}</span>
          </>
        )}
        {!sp.supported ? <span className="text-[12px] text-[#c8102e]">Examiner voice not supported in this browser.</span> : null}
      </div>

      <ul className="mt-3 space-y-2">
        {questions.map((q, idx) => (
          <li key={idx} className={`flex items-start gap-2 rounded p-1.5 ${i === idx ? 'bg-[#d6e4f5]/60 outline outline-1 outline-[#1976d2]' : ''}`}>
            <Ask text={q.text} speak={sp.speak} />
            <span>{q.text}</span>
          </li>
        ))}
      </ul>

      <RecorderControls hint="The examiner asks; you record your answer, then play it back." />
    </div>
  );
}

/* ---------- section ---------- */

export function SpeakingSection({
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
  const [part, setPart] = useState(1);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const sp = useSpeak();
  const th = THEME[theme];

  useEffect(() => () => sp.cancel(), [sp]);

  return (
    <div className="fixed inset-0 z-[60] flex flex-col bg-white text-[#1a1a1a]" style={{ fontFamily: 'Arial, Helvetica, sans-serif' }}>
      <TopBar label="IELTS Speaking — Practice" onSettings={() => setSettingsOpen(true)} onExit={onExit} />

      <div className="flex shrink-0 flex-wrap items-center gap-2 border-b border-[#d8d8d8] bg-[#f3f4f6] px-4 py-2">
        {[1, 2, 3].map((p) => (
          <button key={p} type="button" onClick={() => { sp.cancel(); setPart(p); }} className={`rounded border px-3 py-1 text-[12px] ${part === p ? 'border-[#1976d2] bg-[#d6e4f5] font-bold' : 'border-[#bbb] bg-white'}`}>
            Part {p}
          </button>
        ))}
        <span className="text-[11px] text-[#777]">{part === 1 ? 'Interview · 4–5 min' : part === 2 ? 'Long turn · cue card' : 'Discussion · 4–5 min'}</span>
        <label className="ml-auto flex items-center gap-2 text-[11px] text-[#555]">
          Examiner voice
          {sp.supported && sp.voices.length ? (
            <select value={sp.voiceURI} onChange={(e) => sp.setVoiceURI(e.target.value)} className="max-w-[200px] rounded border border-[#bbb] bg-white px-1 py-0.5 text-[12px]">
              {sp.voices.map((v) => (
                <option key={v.voiceURI} value={v.voiceURI}>{v.name} ({v.lang}){v.localService ? ' · offline' : ''}</option>
              ))}
            </select>
          ) : (
            <span className="text-[#999]">{sp.supported ? 'loading…' : 'not supported'}</span>
          )}
        </label>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto" style={{ background: th.bg, color: th.fg }}>
        <div className="mx-auto max-w-2xl px-6 py-6" style={{ fontSize: SIZE[size], lineHeight: 1.6 }}>
          {part === 1 ? <Part1 sp={sp} /> : part === 2 ? <Part2 sp={sp} /> : <Part3 sp={sp} />}
        </div>
      </div>

      {settingsOpen ? <SettingsPanel theme={theme} setTheme={setTheme} size={size} setSize={setSize} onClose={() => setSettingsOpen(false)} /> : null}
    </div>
  );
}

function Part1({ sp }: { sp: Speaker }) {
  const d = test.part1;
  return (
    <div>
      <h2 className="text-[1.2em] font-bold">Part 1 — Interview</h2>
      <p className="mt-1 text-[0.85em] italic opacity-75">{d.intro}</p>
      <p className="mt-4 text-[0.8em] font-bold uppercase tracking-wide opacity-60">Topic</p>
      <p className="text-[1.05em] font-bold">{d.topic}</p>
      <Interview questions={d.questions.map((text) => ({ text }))} sp={sp} />
    </div>
  );
}

function Part2({ sp }: { sp: Speaker }) {
  const d = test.part2;
  const [phase, setPhase] = useState<'idle' | 'prep' | 'talk' | 'done'>('idle');
  const [left, setLeft] = useState(0);
  const r = useRecorder();

  const startTalk = useCallback(() => {
    setPhase('talk');
    setLeft(d.talkSeconds);
    r.start();
  }, [d.talkSeconds, r]);

  useEffect(() => {
    if (phase !== 'prep' && phase !== 'talk') return;
    const id = setInterval(() => setLeft((l) => l - 1), 1000);
    return () => clearInterval(id);
  }, [phase]);

  useEffect(() => {
    if (left > 0) return;
    if (phase === 'prep') startTalk();
    else if (phase === 'talk') {
      r.stop();
      setPhase('done');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [left, phase]);

  const cueText = `${d.task} You should say: ${d.bullets.join('; ')}; ${d.closing}`;

  return (
    <div>
      <h2 className="text-[1.2em] font-bold">Part 2 — Long turn</h2>
      <p className="mt-1 text-[0.85em] italic opacity-75">{d.rubric}</p>

      <div className="mt-4 rounded-lg border-2 border-current/30 p-4">
        <div className="flex items-start justify-between gap-2">
          <p className="text-[1.05em] font-bold">{d.task}</p>
          <Ask text={cueText} speak={sp.speak} />
        </div>
        <p className="mt-3 font-bold">You should say:</p>
        <ul className="mt-1 space-y-1">
          {d.bullets.map((b, i) => (
            <li key={i} className="ml-4 list-disc">{b}</li>
          ))}
        </ul>
        <p className="mt-2">{d.closing}</p>
      </div>

      {phase === 'prep' || phase === 'talk' ? (
        <div className={`mt-5 flex items-center justify-between rounded-lg px-4 py-3 ${phase === 'prep' ? 'bg-[#fff3cd] text-[#5a4a00]' : 'bg-[#fde2e2] text-[#8a1020]'}`}>
          <span className="text-[14px] font-bold">{phase === 'prep' ? 'Preparation — make notes' : 'Speaking — talk now 🔴'}</span>
          <span className="text-[26px] font-bold tabular-nums">{clock(left)}</span>
        </div>
      ) : null}

      <div className="mt-4 flex flex-wrap items-center gap-3">
        {phase === 'idle' ? (
          <button type="button" onClick={() => { sp.speak(cueText); setPhase('prep'); setLeft(d.prepSeconds); }} className="rounded bg-[#1565c0] px-4 py-2 text-[13px] font-bold text-white hover:bg-[#0f4ea0]">
            Examiner reads task → start preparation (1 min)
          </button>
        ) : null}
        {phase === 'prep' ? (
          <button type="button" onClick={startTalk} className="rounded bg-[#1565c0] px-4 py-2 text-[13px] font-bold text-white hover:bg-[#0f4ea0]">Skip to talking now</button>
        ) : null}
        {phase === 'talk' ? (
          <button type="button" onClick={() => { r.stop(); setPhase('done'); }} className="rounded bg-[#333] px-4 py-2 text-[13px] font-bold text-white">Stop</button>
        ) : null}
        {phase === 'done' ? (
          <button type="button" onClick={() => { r.reset(); setPhase('idle'); setLeft(0); }} className="rounded border border-current/30 px-4 py-2 text-[13px]">Try again</button>
        ) : null}
      </div>

      {r.error ? <p className="mt-3 text-[12px] text-[#c8102e]">{r.error}</p> : null}
      {r.url && phase === 'done' ? (
        <div className="mt-4">
          <p className="mb-1 text-[12px] font-bold opacity-70">Your recording</p>
          <audio controls src={r.url} className="w-full" />
        </div>
      ) : null}
    </div>
  );
}

function Part3({ sp }: { sp: Speaker }) {
  const d = test.part3;
  const flat = d.topics.flatMap((t) => t.questions.map((text) => ({ topic: t.title, text })));
  return (
    <div>
      <h2 className="text-[1.2em] font-bold">Part 3 — Discussion</h2>
      <p className="mt-1 text-[0.85em] italic opacity-75">Two-way discussion of more abstract questions linked to the Part 2 topic.</p>
      {d.topics.map((t, i) => (
        <p key={i} className="mt-3 text-[0.8em] font-bold uppercase tracking-wide opacity-60">{t.title}</p>
      ))}
      <Interview questions={flat} sp={sp} />
    </div>
  );
}
