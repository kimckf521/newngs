'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { ColorTheme, TextSize } from './types';
import { SettingsPanel, SIZE, THEME, TopBar, useMic } from './shared';
import { startPcmRecording, type PcmRecorder } from './pcmRecorder';
import { startRealtimeAsr, type RealtimeAsr } from './realtimeAsr';
import { ExaminerAvatar } from './ExaminerAvatar';
import { attachAudioLipSync, primeAudioContext } from './lipSync';

type Turn = { role: 'examiner' | 'candidate'; text: string };
type Bilingual = { en: string; zh: string };
type Bands = {
  fluency: number; lexical: number; grammar: number; pronunciation: number; overall: number;
  feedback: { fluency: Bilingual; lexical: Bilingual; grammar: Bilingual; pronunciation: Bilingual };
  tips: Bilingual[]; summary: Bilingual;
};

const TOTAL_OPTIONS = [
  { label: 'Quick · 5 min', sec: 300 },
  { label: 'Standard · 8 min', sec: 480 },
  { label: 'Full · 12 min', sec: 720 },
];

// English voices verified to be authorized on the account (others silently fall
// back to a Chinese voice). The 超拟人 (large-model) voices Grant/Lila are far
// more natural but need the 超拟人合成 service licensed on the iFlytek app
// (otherwise they return 11200 "licc limit"); once it's enabled, set
// NEXT_PUBLIC_IELTS_TTS_X5=1 and they appear in the picker — no code change.
const IFLYTEK_VOICES = [
  { id: 'x4_EnUs_Laura_education', label: 'Laura · US female' },
  { id: 'x2_EnUs_Catherine', label: 'Catherine · US female' },
  ...(process.env.NEXT_PUBLIC_IELTS_TTS_X5 === '1'
    ? [
        { id: 'x5_EnUs_Grant_flow', label: 'Grant · US male · 超拟人' },
        { id: 'x5_EnUs_Lila_flow', label: 'Lila · US female · 超拟人' },
      ]
    : []),
];

// Voice-activity-detection tuning for hands-free mode.
const CALIB_MS = 500; // initial window to learn the room's noise floor
// End-of-turn pause. Lower = snappier replies; too low cuts people off mid-thought.
// 900ms is a good balance (was 1400ms — the single biggest fixed delay per turn).
const SILENCE_MS = 900;
const MAX_UTTER_MS = 45000; // safety cap on a single answer
const NO_SPEECH_MS = 15000; // re-arm the mic if nothing is said (bounds memory)

// Read a persisted preference. Safe in a useState initializer because AiExaminer
// only ever mounts client-side (after a launcher click), never during SSR.
function loadPref<T>(key: string, parse: (v: string) => T, fallback: T): T {
  try { const v = localStorage.getItem(key); return v == null ? fallback : parse(v); } catch { return fallback; }
}

async function blobToB64(blob: Blob): Promise<string> {
  const bytes = new Uint8Array(await blob.arrayBuffer());
  let s = '';
  const CH = 0x8000;
  for (let i = 0; i < bytes.length; i += CH) s += String.fromCharCode(...bytes.subarray(i, i + CH));
  return btoa(s);
}

function useEnglishVoice() {
  const ref = useRef<SpeechSynthesisVoice | null>(null);
  useEffect(() => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    const pick = () => {
      const v = window.speechSynthesis.getVoices().filter((x) => x.lang.toLowerCase().startsWith('en'));
      const score = (x: SpeechSynthesisVoice) => (x.localService ? 0 : 100) + (x.lang === 'en-GB' ? 0 : 8) + (/google/i.test(x.name) ? 40 : 0);
      v.sort((a, b) => score(a) - score(b));
      ref.current = v[0] ?? null;
    };
    pick();
    window.speechSynthesis.onvoiceschanged = pick;
    return () => { window.speechSynthesis.onvoiceschanged = null; window.speechSynthesis.cancel(); };
  }, []);
  return ref;
}

export function AiExaminer({
  theme, size, setTheme, setSize, onExit,
}: {
  theme: ColorTheme; size: TextSize; setTheme: (t: ColorTheme) => void; setSize: (s: TextSize) => void; onExit: () => void;
}) {
  const [phase, setPhase] = useState<'intro' | 'live' | 'grading' | 'report'>('intro');
  const [totalSec, setTotalSec] = useState(480);
  const [remaining, setRemaining] = useState(480);
  const [turns, setTurns] = useState<Turn[]>([]);
  const [pending, setPending] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [recording, setRecording] = useState(false);
  const [transcribing, setTranscribing] = useState(false);
  const [text, setText] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [bands, setBands] = useState<Bands | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [handsFree, setHandsFree] = useState(() => loadPref('ielts.handsFree', (v) => v === '1', true));
  const [level, setLevel] = useState(0); // 0..1 live mic level for the meter
  const [voiceMode, setVoiceMode] = useState<'browser' | 'iflytek'>(() => loadPref('ielts.voiceMode', (v) => (v === 'iflytek' ? 'iflytek' : 'browser'), 'browser'));
  const [vcn, setVcn] = useState(() => loadPref('ielts.vcn', (v) => (IFLYTEK_VOICES.some((x) => x.id === v) ? v : IFLYTEK_VOICES[0].id), IFLYTEK_VOICES[0].id));
  const [showTranscript, setShowTranscript] = useState(() => loadPref('ielts.showTranscript', (v) => v === '1', false)); // off = like the real test (voice only)
  const [asrProvider, setAsrProvider] = useState<'tencent' | 'iflytek'>(() => loadPref('ielts.asrProvider', (v) => (v === 'iflytek' ? 'iflytek' : 'tencent'), 'tencent'));
  const [realtimeAsr, setRealtimeAsr] = useState(() => loadPref('ielts.realtimeAsr', (v) => v === '1', true));

  const voice = useEnglishVoice();
  const mic = useMic();
  const voiceModeRef = useRef(voiceMode);
  const vcnRef = useRef(vcn);
  const asrProviderRef = useRef(asrProvider);
  const realtimeRef = useRef(realtimeAsr);
  const rtRef = useRef<RealtimeAsr | null>(null); // active realtime-ASR session
  const rtUnavailable = useRef(false); // set after a failed realtime attempt — skip it for the rest of the session
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const mouthLevelRef = useRef(0); // 0..1 live mouth openness for lip-sync
  const lipStopRef = useRef<(() => void) | null>(null);
  const speechEpoch = useRef(0); // bumped to cancel an in-flight spoken turn
  const recRef = useRef<PcmRecorder | null>(null);
  const voiceAnswers = useRef<{ wavB64: string; text: string }[]>([]);
  const turnsRef = useRef<Turn[]>([]);
  turnsRef.current = turns;
  const remainingRef = useRef(remaining);
  remainingRef.current = remaining;
  const totalSecRef = useRef(totalSec);
  totalSecRef.current = totalSec;
  const scrollRef = useRef<HTMLDivElement>(null);
  const th = THEME[theme];

  // refs the audio-thread VAD callback reads (it must stay identity-stable)
  const phaseRef = useRef(phase);
  const handsFreeRef = useRef(handsFree);
  const micIdRef = useRef(mic.deviceId);
  const startListeningRef = useRef<() => void>(() => {});
  const stopAndSendRef = useRef<() => void>(() => {});
  const vad = useRef({ started: 0, lastVoice: 0, hasSpoken: false, floor: 0.03, stopping: false });
  const lastLevelPush = useRef(0);
  useEffect(() => { phaseRef.current = phase; }, [phase]);
  // State is seeded from localStorage in the useState initializers above, so each
  // effect just keeps its ref current and persists changes.
  useEffect(() => {
    handsFreeRef.current = handsFree;
    try { localStorage.setItem('ielts.handsFree', handsFree ? '1' : '0'); } catch { /* noop */ }
  }, [handsFree]);
  useEffect(() => { micIdRef.current = mic.deviceId; }, [mic.deviceId]);
  useEffect(() => {
    voiceModeRef.current = voiceMode;
    try { localStorage.setItem('ielts.voiceMode', voiceMode); } catch { /* noop */ }
  }, [voiceMode]);
  useEffect(() => {
    vcnRef.current = vcn;
    try { localStorage.setItem('ielts.vcn', vcn); } catch { /* noop */ }
  }, [vcn]);
  useEffect(() => {
    try { localStorage.setItem('ielts.showTranscript', showTranscript ? '1' : '0'); } catch { /* noop */ }
  }, [showTranscript]);
  useEffect(() => {
    asrProviderRef.current = asrProvider;
    try { localStorage.setItem('ielts.asrProvider', asrProvider); } catch { /* noop */ }
  }, [asrProvider]);
  useEffect(() => {
    realtimeRef.current = realtimeAsr;
    rtUnavailable.current = false; // re-probe after the user toggles it
    try { localStorage.setItem('ielts.realtimeAsr', realtimeAsr ? '1' : '0'); } catch { /* noop */ }
  }, [realtimeAsr]);

  const stopAudio = useCallback(() => {
    try { lipStopRef.current?.(); } catch { /* noop */ }
    lipStopRef.current = null;
    mouthLevelRef.current = 0;
    const a = audioRef.current;
    if (!a) return;
    audioRef.current = null;
    a.onended = null; a.onerror = null;
    try { a.pause(); } catch { /* noop */ }
    if (a.src) { try { URL.revokeObjectURL(a.src); } catch { /* noop */ } }
  }, []);

  // Cancel any in-flight spoken turn (new turn, grading, exit).
  const stopAllSpeech = useCallback(() => {
    speechEpoch.current += 1;
    if (typeof window !== 'undefined') window.speechSynthesis?.cancel();
    stopAudio();
    setSpeaking(false);
  }, [stopAudio]);

  // Speak via the browser voice (offline, prefers en-GB "Daniel"). Resolves when done.
  const browserSpeakOne = useCallback((t: string, epoch: number) => new Promise<void>((resolve) => {
    if (speechEpoch.current !== epoch) return resolve();
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) { setTimeout(resolve, 200); return; }
    const u = new SpeechSynthesisUtterance(t);
    if (voice.current) u.voice = voice.current;
    u.rate = 1.1; // slightly brisk, like a real examiner keeping the test moving
    u.onend = () => { setSpeaking(false); resolve(); };
    u.onerror = () => { setSpeaking(false); resolve(); };
    setSpeaking(true);
    window.speechSynthesis.speak(u); // queues — we serialize via the caller
  }), [voice]);

  // Speak ONE sentence/chunk. iFlytek mode synthesizes MP3 (falls back to the
  // browser voice on any failure). Resolves when playback ends. A stale epoch
  // (a newer turn started) resolves immediately so the queue unwinds cleanly.
  const speakOne = useCallback((t: string, epoch: number): Promise<void> => {
    const text = t.trim();
    if (!text || speechEpoch.current !== epoch) return Promise.resolve();
    if (voiceModeRef.current !== 'iflytek') return browserSpeakOne(text, epoch);
    return new Promise<void>((resolve) => {
      setSpeaking(true);
      fetch('/api/ielts/tts', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ text, vcn: vcnRef.current }) })
        .then(async (res) => {
          if (speechEpoch.current !== epoch) return resolve();
          if (!res.ok) throw new Error('tts_unavailable');
          const url = URL.createObjectURL(await res.blob());
          const a = new Audio(url);
          audioRef.current = a;
          lipStopRef.current = attachAudioLipSync(a, mouthLevelRef); // mouth lip-sync from real audio
          a.onended = () => { stopAudio(); setSpeaking(false); resolve(); };
          a.onerror = () => { stopAudio(); browserSpeakOne(text, epoch).then(resolve); };
          await a.play();
        })
        .catch(() => browserSpeakOne(text, epoch).then(resolve));
    });
  }, [browserSpeakOne, stopAudio]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [turns, pending]);

  // countdown
  useEffect(() => {
    if (phase !== 'live') return;
    const id = setInterval(() => setRemaining((r) => (r <= 1 ? 0 : r - 1)), 1000);
    return () => clearInterval(id);
  }, [phase]);
  useEffect(() => {
    if (phase === 'live' && remaining === 0) void grade();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [remaining, phase]);

  // cleanup on unmount
  useEffect(() => () => {
    try { recRef.current?.cancel(); } catch { /* noop */ }
    try { rtRef.current?.cancel(); } catch { /* noop */ }
    try { audioRef.current?.pause(); } catch { /* noop */ }
    if (typeof window !== 'undefined') window.speechSynthesis?.cancel();
  }, []);

  const askExaminer = useCallback(async (history: Turn[]) => {
    // Claim a fresh epoch — cancels any still-playing prior turn.
    speechEpoch.current += 1;
    const epoch = speechEpoch.current;
    if (typeof window !== 'undefined') window.speechSynthesis?.cancel();
    stopAudio();
    setPending(true);
    setError(null);

    const elapsed = totalSecRef.current - remainingRef.current;
    const closing = remainingRef.current <= 12; // the timer (not the model) decides the wrap-up turn
    let turnIndex = -1;
    setTurns((t) => { turnIndex = t.length; return [...t, { role: 'examiner', text: '' }]; });

    try {
      const res = await fetch('/api/ielts/examiner', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ history, elapsedSec: elapsed, totalSec: totalSecRef.current, closing }),
      });
      if (!res.ok || !res.body) throw new Error('examiner_unavailable');

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let full = '';
      let spokenUpto = 0;
      let firstSpoken = false;
      // Serialize TTS: each chunk waits for the previous one to finish playing.
      let speakChain: Promise<void> = Promise.resolve();
      const enqueue = (s: string) => { const text = s.trim(); if (text) speakChain = speakChain.then(() => speakOne(text, epoch)); };

      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        if (speechEpoch.current !== epoch) { try { await reader.cancel(); } catch { /* noop */ } break; }
        full += decoder.decode(value, { stream: true });
        const idx = turnIndex;
        setTurns((t) => { if (!t[idx]) return t; const c = [...t]; c[idx] = { role: 'examiner', text: full }; return c; });
        // Speak the FIRST complete sentence the moment it's available (the big win).
        if (!firstSpoken) {
          const m = full.slice(spokenUpto).match(/[.!?](\s|$)/);
          if (m && m.index != null) {
            const end = spokenUpto + m.index + 1;
            enqueue(full.slice(spokenUpto, end));
            spokenUpto = end;
            firstSpoken = true;
            setPending(false); // examiner has started speaking
          }
        }
      }
      setPending(false);
      // Speak the remainder (or the whole reply if it had no sentence boundary).
      enqueue(firstSpoken ? full.slice(spokenUpto) : full);

      void speakChain.then(() => {
        if (speechEpoch.current !== epoch || phaseRef.current !== 'live') return;
        if (closing) setTimeout(() => void grade(), 300);
        else if (handsFreeRef.current) startListeningRef.current();
      });
    } catch {
      if (speechEpoch.current === epoch) {
        setError('The examiner is unavailable right now. Please try again.');
        setPending(false);
        setTurns((t) => (t[t.length - 1]?.role === 'examiner' && !t[t.length - 1].text ? t.slice(0, -1) : t));
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [speakOne, stopAudio]);

  const begin = useCallback((sec: number) => {
    primeAudioContext(); // unlock the AudioContext within this click so lip-sync works on the first line
    setTotalSec(sec); setRemaining(sec); setTurns([]); setBands(null); setError(null); voiceAnswers.current = []; setPhase('live');
    void askExaminer([]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const submitAnswer = useCallback((answer: string) => {
    const a = answer.trim();
    if (!a) return;
    const next = [...turnsRef.current, { role: 'candidate' as const, text: a }];
    setTurns(next);
    setText('');
    void askExaminer(next);
  }, [askExaminer]);

  // ---- recording (manual push-to-talk OR hands-free VAD) ----

  const resetVad = useCallback(() => {
    vad.current = { started: performance.now(), lastVoice: 0, hasSpoken: false, floor: 0.03, stopping: false };
  }, []);

  // Runs on the audio thread for every frame in hands-free mode.
  const handleFrame = useCallback((rms: number) => {
    const v = vad.current;
    if (v.stopping) return;
    const now = performance.now();
    if (now - lastLevelPush.current > 90) { lastLevelPush.current = now; setLevel(Math.min(1, rms * 12)); }
    // learn the noise floor first, then gate on it
    if (now - v.started < CALIB_MS) { v.floor = Math.min(v.floor, rms); return; }
    const threshold = Math.max(0.012, v.floor * 3.5);
    if (rms > threshold) { v.hasSpoken = true; v.lastVoice = now; }
    if (v.hasSpoken) {
      if (now - v.lastVoice > SILENCE_MS || now - v.started > MAX_UTTER_MS) {
        v.stopping = true;
        stopAndSendRef.current();
      }
    } else if (now - v.started > NO_SPEECH_MS) {
      // nobody spoke — re-arm a fresh listen so the buffer doesn't grow forever
      v.stopping = true;
      startListeningRef.current();
    }
  }, []);

  const beginRecording = useCallback(async (useVad: boolean) => {
    setError(null);
    try {
      if (recRef.current) { try { recRef.current.cancel(); } catch { /* noop */ } recRef.current = null; }
      if (rtRef.current) { try { rtRef.current.cancel(); } catch { /* noop */ } rtRef.current = null; }
      // Real-time ASR (Tencent only): transcribe WHILE the user speaks so the
      // transcript is ready on stop. Best-effort — falls back to one-shot.
      let onPcm16: ((f: Int16Array) => void) | undefined;
      if (realtimeRef.current && asrProviderRef.current === 'tencent' && !rtUnavailable.current) {
        const rt = await startRealtimeAsr().catch(() => null);
        rtRef.current = rt;
        if (rt) onPcm16 = (f) => rt.pushFrame(f);
        else rtUnavailable.current = true;
      }
      recRef.current = await startPcmRecording(micIdRef.current || undefined, useVad ? { onFrame: handleFrame, onPcm16 } : { onPcm16 });
      if (useVad) resetVad();
      setLevel(0);
      setRecording(true);
    } catch {
      if (rtRef.current) { try { rtRef.current.cancel(); } catch { /* noop */ } rtRef.current = null; }
      setError('Microphone unavailable — type your answer below, or pick a mic in Audio settings.');
      if (useVad) setHandsFree(false);
    }
  }, [handleFrame, resetVad]);

  const stopAndSend = useCallback(async () => {
    const rec = recRef.current;
    if (!rec) return;
    recRef.current = null;
    const rt = rtRef.current;
    rtRef.current = null;
    setRecording(false);
    setLevel(0);
    setTranscribing(true);
    try {
      const wav = await rec.stop();
      // Prefer the realtime transcript (already done) — no post-stop round-trip.
      let transcript = '';
      if (rt) {
        transcript = (await rt.finalize()).trim();
        if (rt.failed()) rtUnavailable.current = true; // stop trying realtime this session
      }
      // Fall back to one-shot ASR if realtime was off / unavailable / empty.
      if (!transcript) {
        const res = await fetch(`/api/ielts/asr?provider=${asrProviderRef.current}`, { method: 'POST', headers: { 'Content-Type': 'audio/wav' }, body: wav });
        const data = (await res.json()) as { transcript?: string; error?: string };
        transcript = (data.transcript || '').trim();
      }
      if (transcript) {
        voiceAnswers.current.push({ wavB64: await blobToB64(wav), text: transcript });
        submitAnswer(transcript);
      } else if (handsFreeRef.current && phaseRef.current === 'live') {
        // hands-free: silently re-open the mic instead of stalling on an error
        setTranscribing(false);
        startListeningRef.current();
        return;
      } else {
        setError("Didn't catch that — try again, or type your answer below.");
      }
    } catch {
      setError('Transcription failed — type your answer below to continue.');
    } finally {
      setTranscribing(false);
    }
  }, [submitAnswer]);

  // keep the audio-thread refs pointed at the latest closures
  useEffect(() => {
    startListeningRef.current = () => void beginRecording(true);
    stopAndSendRef.current = () => void stopAndSend();
  }, [beginRecording, stopAndSend]);

  const toggleHandsFree = useCallback(() => {
    setHandsFree((prev) => {
      const next = !prev;
      // turning OFF while auto-listening → stop the VAD recorder
      if (!next && recRef.current) {
        try { recRef.current.cancel(); } catch { /* noop */ }
        recRef.current = null;
        if (rtRef.current) { try { rtRef.current.cancel(); } catch { /* noop */ } rtRef.current = null; }
        setRecording(false);
        setLevel(0);
      }
      // turning ON while it's the candidate's turn → start listening now
      if (next && phaseRef.current === 'live' && !recRef.current && !pending && !speaking && !transcribing
        && turnsRef.current[turnsRef.current.length - 1]?.role === 'examiner') {
        setTimeout(() => void beginRecording(true), 50);
      }
      return next;
    });
  }, [beginRecording, pending, speaking, transcribing]);

  const grade = useCallback(async () => {
    if (phaseRef.current !== 'live') return; // guard against double-entry (timer + closing turn)
    if (recRef.current) { try { recRef.current.cancel(); } catch { /* noop */ } recRef.current = null; setRecording(false); }
    if (rtRef.current) { try { rtRef.current.cancel(); } catch { /* noop */ } rtRef.current = null; }
    if (turnsRef.current.filter((t) => t.role === 'candidate').length === 0) {
      setError('Say a few answers first, then finish to get your band score.');
      return;
    }
    stopAllSpeech();
    setPhase('grading');

    // Measure pronunciation on the candidate's spoken answers (iFlytek ISE).
    // Typed answers have no audio, so this is skipped → grader estimates instead.
    let pronunciation: number | undefined;
    try {
      const va = voiceAnswers.current.filter((a) => a.text.trim()).sort((a, b) => b.text.length - a.text.length).slice(0, 4);
      if (va.length) {
        const results = await Promise.all(
          va.map((a) =>
            fetch('/api/ielts/pronounce', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ audioBase64: a.wavB64, text: a.text }) })
              .then((r) => (r.ok ? r.json() : null))
              .catch(() => null),
          ),
        );
        const totals = results
          .map((r) => (r as { score?: { total: number; rejected: boolean } } | null)?.score)
          .filter((s): s is { total: number; rejected: boolean } => !!s && !s.rejected && s.total > 0)
          .map((s) => s.total);
        if (totals.length) pronunciation = Math.round(totals.reduce((x, y) => x + y, 0) / totals.length);
      }
    } catch {
      /* pronunciation is optional */
    }

    try {
      const res = await fetch('/api/ielts/grade', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ history: turnsRef.current, pronunciation }),
      });
      if (!res.ok) throw new Error('grade');
      const b = (await res.json()) as Bands;
      setBands(b);
      setPhase('report');
      // best-effort: persist the session to CloudBase (never blocks / never surfaced).
      const audio = voiceAnswers.current
        .filter((a) => a.wavB64 && a.text.trim())
        .slice(0, 16)
        .map((a) => ({ wavB64: a.wavB64, text: a.text }));
      void fetch('/api/ielts/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ history: turnsRef.current, bands: b, durationSec: totalSecRef.current - remainingRef.current, audio }),
      }).catch(() => {});
    } catch {
      setError('Grading failed. Please try again.');
      setPhase('live');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stopAllSpeech]);

  const busy = pending || transcribing;

  return (
    <div className="fixed inset-0 z-[60] flex flex-col bg-white text-[#1a1a1a]" style={{ fontFamily: 'Arial, Helvetica, sans-serif' }}>
      <TopBar
        label="IELTS Speaking — AI Examiner"
        secs={phase === 'live' ? remaining : undefined}
        onSettings={() => setSettingsOpen(true)}
        onExit={() => { stopAllSpeech(); try { recRef.current?.cancel(); } catch { /* noop */ } onExit(); }}
      />

      <div className="min-h-0 flex-1 overflow-y-auto" style={{ background: th.bg, color: th.fg }} ref={scrollRef}>
        <div className="mx-auto max-w-2xl px-6 py-6" style={{ fontSize: SIZE[size], lineHeight: 1.6 }}>
          {phase === 'intro' ? (
            <div className="rounded-lg border border-current/15 p-6">
              <h2 className="text-[1.25em] font-bold">AI Speaking Examiner</h2>
              <p className="mt-2 text-[0.9em] opacity-80">
                A live, spoken IELTS-style interview. The examiner speaks each question; you reply by speaking (or typing). It adapts to your level and runs the three parts, then gives an estimated band score with feedback.
              </p>
              <p className="mt-2 text-[0.8em] opacity-60">Choose a length — you can finish early any time.</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {TOTAL_OPTIONS.map((o) => (
                  <button key={o.sec} type="button" onClick={() => begin(o.sec)} className="rounded bg-[#1565c0] px-4 py-2 text-[13px] font-bold text-white hover:bg-[#0f4ea0]">
                    {o.label}
                  </button>
                ))}
              </div>
              <div className="mt-4 flex flex-col gap-2 border-t border-current/10 pt-3 text-[0.78em] opacity-80">
                <label className="flex items-center gap-2">
                  <input type="checkbox" checked={handsFree} onChange={toggleHandsFree} />
                  <span><b>Hands-free conversation</b> — the examiner listens automatically after each question and replies when you pause (no buttons). Turn off to use push-to-talk.</span>
                </label>
                <label className="flex items-center gap-2">
                  <input type="checkbox" checked={showTranscript} onChange={() => setShowTranscript((v) => !v)} />
                  <span><b>Show transcript</b> — off by default so it works like the real test (you only hear the examiner). Turn on to read the conversation.</span>
                </label>
                <div className="flex flex-wrap items-center gap-2">
                  <span aria-hidden>🎙️</span>
                  <span>Microphone: <b>{mic.devices.find((d) => d.deviceId === mic.deviceId)?.label || 'System default'}</b></span>
                  <button type="button" onClick={() => setSettingsOpen(true)} className="rounded border border-current/30 px-2 py-0.5 hover:bg-current/10">Audio settings</button>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <span aria-hidden>🔊</span>
                  <span>Examiner voice:</span>
                  <div className="flex overflow-hidden rounded-full border border-current/30 text-[0.95em]">
                    <button type="button" onClick={() => setVoiceMode('browser')} className={`px-2.5 py-0.5 ${voiceMode === 'browser' ? 'bg-[#1565c0] text-white' : ''}`}>Browser (British)</button>
                    <button type="button" onClick={() => setVoiceMode('iflytek')} className={`px-2.5 py-0.5 ${voiceMode === 'iflytek' ? 'bg-[#1565c0] text-white' : ''}`}>iFlytek (natural)</button>
                  </div>
                  <span className="opacity-60">{voiceMode === 'iflytek' ? 'cloud neural voice — US accent, very natural' : 'free, offline, en-GB if your device has it'}</span>
                </div>
              </div>
            </div>
          ) : null}

          {phase !== 'intro' ? (
            <div>
              {phase === 'live' ? (
                <div className="mb-3 flex items-center justify-between">
                  <span className="text-[0.7em] font-bold uppercase tracking-wide opacity-50">{showTranscript ? 'Conversation' : 'Voice mode'}</span>
                  <button type="button" onClick={() => setShowTranscript((v) => !v)} className="rounded border border-current/30 px-2 py-0.5 text-[0.72em] hover:bg-current/10">
                    {showTranscript ? '🙈 Hide transcript' : '👁 Show transcript'}
                  </button>
                </div>
              ) : null}
              {showTranscript || phase !== 'live' ? (
                <div className="space-y-3">
                  {turns.map((t, i) => (
                    <div key={i} className={`flex ${t.role === 'candidate' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[80%] rounded-2xl px-4 py-2 ${t.role === 'examiner' ? 'bg-current/10' : 'bg-[#1565c0] text-white'}`}>
                        <div className={`mb-0.5 text-[0.7em] font-bold uppercase tracking-wide ${t.role === 'examiner' ? 'opacity-50' : 'text-white/70'}`}>
                          {t.role === 'examiner' ? 'Examiner' : 'You'}
                        </div>
                        {t.text}
                      </div>
                    </div>
                  ))}
                  {pending ? <div className="text-[0.8em] opacity-50">Examiner is thinking…</div> : null}
                  {speaking ? <div className="text-[0.8em] opacity-50">🔊 Examiner speaking…</div> : null}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center gap-3 py-10 text-center">
                  <ExaminerAvatar state={pending ? 'thinking' : speaking ? 'speaking' : recording ? 'listening' : 'idle'} levelRef={mouthLevelRef} />
                  <p className="text-[1.05em] font-bold">{pending ? 'Examiner is thinking…' : speaking ? 'Examiner is speaking…' : recording ? 'Listening — your turn to speak' : 'One moment…'}</p>
                  <p className="text-[0.8em] opacity-60">Question {Math.max(1, turns.filter((t) => t.role === 'examiner').length)} · transcript hidden, just like the real test.</p>
                </div>
              )}
            </div>
          ) : null}

          {phase === 'grading' ? <p className="mt-6 text-center text-[0.9em] opacity-70">Assessing your speaking against the IELTS band descriptors…</p> : null}
          {phase === 'report' && bands ? <Report bands={bands} onRestart={() => setPhase('intro')} onExit={onExit} /> : null}
        </div>
      </div>

      {phase === 'live' ? (
        <footer className="shrink-0 border-t border-[#c8c8c8] bg-[#ececec] px-4 py-2.5 text-[#222]">
          {error ? <p className="mb-2 text-[12px] text-[#c8102e]">{error}</p> : null}

          {/* row 1: mode + voice controls/status */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex overflow-hidden rounded-full border border-[#bbb] text-[12px]">
              <button type="button" onClick={() => { if (!handsFree) toggleHandsFree(); }} className={`px-3 py-1 font-bold ${handsFree ? 'bg-[#1565c0] text-white' : 'bg-white text-[#444]'}`}>Hands-free</button>
              <button type="button" onClick={() => { if (handsFree) toggleHandsFree(); }} className={`px-3 py-1 font-bold ${!handsFree ? 'bg-[#1565c0] text-white' : 'bg-white text-[#444]'}`}>Push to talk</button>
            </div>

            {handsFree ? (
              recording ? (
                <div className="flex flex-1 items-center gap-3">
                  <span className="flex shrink-0 items-center gap-2 rounded-full bg-[#c8102e] px-3 py-1.5 text-[12px] font-bold text-white">
                    <span className="inline-block h-2.5 w-2.5 animate-pulse rounded-full bg-white" /> Listening
                  </span>
                  <div className="h-2 w-32 overflow-hidden rounded bg-[#d9d9d9]">
                    <div className="h-full rounded bg-[#1b7a32]" style={{ width: `${Math.round(level * 100)}%`, transition: 'width 90ms linear' }} />
                  </div>
                  <span className="text-[12px] text-[#666]">just speak — I&apos;ll reply when you pause</span>
                  <button type="button" onClick={() => void stopAndSend()} className="rounded-full bg-[#333] px-3 py-1.5 text-[12px] font-bold text-white">Send now</button>
                </div>
              ) : (
                <span className="text-[12px] text-[#777]">{busy || speaking ? 'Examiner is responding…' : 'Hands-free is on — listening starts automatically after each question.'}</span>
              )
            ) : !recording ? (
              <button type="button" disabled={busy || speaking} onClick={() => void beginRecording(false)} className="flex items-center gap-2 rounded-full bg-[#c8102e] px-4 py-2 text-[13px] font-bold text-white hover:bg-[#a50d24] disabled:opacity-40">
                <span className="inline-block h-2.5 w-2.5 rounded-full bg-white" /> Record answer
              </button>
            ) : (
              <button type="button" onClick={() => void stopAndSend()} className="flex items-center gap-2 rounded-full bg-[#333] px-4 py-2 text-[13px] font-bold text-white">
                <span className="inline-block h-2.5 w-2.5 animate-pulse rounded-sm bg-[#ff5a5a]" /> Stop &amp; send
              </button>
            )}

            <button type="button" onClick={() => void grade()} className="ml-auto rounded bg-[#1565c0] px-3 py-2 text-[12px] font-bold text-white hover:bg-[#0f4ea0]">Finish &amp; grade</button>
          </div>

          {/* row 2: typed fallback */}
          <div className="mt-2 flex items-center gap-2">
            <span className="text-[12px] text-[#888]">or type</span>
            <input
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') submitAnswer(text); }}
              disabled={busy}
              placeholder="type your answer and press Enter"
              className="h-9 flex-1 rounded border border-[#bbb] px-3 text-[13px]"
            />
            <button type="button" disabled={busy || !text.trim()} onClick={() => submitAnswer(text)} className="rounded border border-[#bbb] bg-white px-3 py-1.5 text-[12px] hover:bg-[#e2e2e2] disabled:opacity-40">Send</button>
          </div>
          {transcribing ? <p className="mt-2 text-[12px] text-[#666]">Transcribing your answer…</p> : null}
        </footer>
      ) : null}

      {settingsOpen ? <SettingsPanel theme={theme} setTheme={setTheme} size={size} setSize={setSize} mic={mic} voice={{ mode: voiceMode, setMode: setVoiceMode, vcn, setVcn, voices: IFLYTEK_VOICES }} asr={{ provider: asrProvider, setProvider: setAsrProvider, realtime: realtimeAsr, setRealtime: setRealtimeAsr }} onClose={() => setSettingsOpen(false)} /> : null}
    </div>
  );
}

function Band({ label, score }: { label: string; score: number }) {
  return (
    <div className="rounded-lg bg-current/5 p-3 text-center">
      <div className="text-[11px] font-bold uppercase tracking-wide opacity-60">{label}</div>
      <div className="text-[22px] font-bold">{score.toFixed(1)}</div>
    </div>
  );
}

const REPORT_T = {
  en: { overall: 'Estimated overall band', tips: 'Tips', disclaimer: 'Practice estimate generated by AI — not an official IELTS score.', restart: 'New session', back: 'Back to tests' },
  zh: { overall: '预估总分', tips: '提升建议', disclaimer: 'AI 生成的练习预估分，非官方雅思成绩。', restart: '重新开始', back: '返回测试' },
};

function Report({ bands, onRestart, onExit }: { bands: Bands; onRestart: () => void; onExit: () => void }) {
  const [lang, setLang] = useState<'en' | 'zh'>(() => loadPref('ielts.feedbackLang', (v) => (v === 'zh' ? 'zh' : 'en'), 'en'));
  const choose = (l: 'en' | 'zh') => { setLang(l); try { localStorage.setItem('ielts.feedbackLang', l); } catch { /* noop */ } };
  const L = (b?: Bilingual) => (b ? (lang === 'zh' ? b.zh || b.en : b.en || b.zh) : '');
  const t = REPORT_T[lang];
  // [en label, zh label, feedback key, score]
  const crit: [string, string, keyof Bands['feedback'], number][] = [
    ['Fluency & coherence', '流利度与连贯性', 'fluency', bands.fluency],
    ['Lexical resource', '词汇资源', 'lexical', bands.lexical],
    ['Grammatical range', '语法多样性与准确性', 'grammar', bands.grammar],
    ['Pronunciation', '发音', 'pronunciation', bands.pronunciation],
  ];
  return (
    <div className="rounded-lg border border-current/15 p-5">
      <div className="mb-3 flex justify-end">
        <div className="flex overflow-hidden rounded-full border border-current/30 text-[0.78em]">
          <button type="button" onClick={() => choose('en')} className={`px-3 py-0.5 ${lang === 'en' ? 'bg-[#1565c0] text-white' : ''}`}>English</button>
          <button type="button" onClick={() => choose('zh')} className={`px-3 py-0.5 ${lang === 'zh' ? 'bg-[#1565c0] text-white' : ''}`}>中文</button>
        </div>
      </div>
      <div className="flex items-end gap-5">
        <div>
          <div className="text-[11px] font-bold uppercase tracking-wide opacity-60">{t.overall}</div>
          <div className="text-[44px] font-bold leading-none">{bands.overall.toFixed(1)}</div>
        </div>
        <p className="flex-1 text-[0.85em] opacity-80" lang={lang}>{L(bands.summary)}</p>
      </div>
      <div className="mt-4 grid grid-cols-4 gap-2">
        {crit.map(([en, zh, , score]) => (
          <Band key={en} label={lang === 'zh' ? zh : en} score={score} />
        ))}
      </div>
      <div className="mt-4 space-y-3">
        {crit.map(([en, zh, key]) => (
          <div key={key}>
            <p className="text-[0.85em] font-bold">{lang === 'zh' ? zh : en}</p>
            <p className="text-[0.85em] opacity-80" lang={lang}>{L(bands.feedback[key])}</p>
          </div>
        ))}
      </div>
      {bands.tips?.length ? (
        <div className="mt-4">
          <p className="text-[0.85em] font-bold">{t.tips}</p>
          <ul className="mt-1 list-disc space-y-1 pl-5 text-[0.85em] opacity-80">
            {bands.tips.map((tip, i) => <li key={i} lang={lang}>{L(tip)}</li>)}
          </ul>
        </div>
      ) : null}
      <p className="mt-4 text-[12px] opacity-50">{t.disclaimer}</p>
      <div className="mt-4 flex gap-2">
        <button type="button" onClick={onRestart} className="rounded bg-[#1565c0] px-4 py-2 text-[13px] font-bold text-white hover:bg-[#0f4ea0]">{t.restart}</button>
        <button type="button" onClick={onExit} className="rounded border border-current/30 px-4 py-2 text-[13px]">{t.back}</button>
      </div>
    </div>
  );
}
