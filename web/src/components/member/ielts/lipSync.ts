'use client';

/**
 * Lip-sync helper for the examiner avatar. Routes the iFlytek TTS <audio> element
 * through a Web Audio AnalyserNode and writes its live RMS loudness (0..1) into a
 * shared ref each frame, so the avatar's mouth opens in sync with the real voice.
 * Browser Web-Speech TTS exposes no audio stream, so that path can't be analysed —
 * the avatar falls back to a synthetic talking motion when the level stays ~0.
 */

let sharedAC: AudioContext | null = null;

function getAC(): AudioContext | null {
  try {
    const AC = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AC) return null;
    if (!sharedAC) sharedAC = new AC();
    if (sharedAC.state === 'suspended') void sharedAC.resume().catch(() => {});
    return sharedAC;
  } catch {
    return null;
  }
}

/** Create/resume the shared AudioContext from within a user gesture (e.g. the
 *  "start" click) so analysis is ready for the first spoken line. */
export function primeAudioContext(): void {
  getAC();
}

/**
 * Analyse an <audio> element's output into `levelRef` (0..1). Best-effort: if the
 * AudioContext isn't running yet (autoplay policy), it skips analysis WITHOUT
 * touching the element's output, so the examiner is never muted. Returns a stop fn.
 */
export function attachAudioLipSync(audio: HTMLAudioElement, levelRef: { current: number }): () => void {
  const ac = getAC();
  if (!ac || ac.state !== 'running') return () => { levelRef.current = 0; };
  let raf = 0;
  let src: MediaElementAudioSourceNode | null = null;
  let analyser: AnalyserNode | null = null;
  try {
    src = ac.createMediaElementSource(audio);
    analyser = ac.createAnalyser();
    analyser.fftSize = 256;
    src.connect(analyser);
    analyser.connect(ac.destination);
    const data = new Uint8Array(analyser.frequencyBinCount);
    const tick = () => {
      analyser!.getByteTimeDomainData(data);
      let sum = 0;
      for (let i = 0; i < data.length; i++) { const v = (data[i] - 128) / 128; sum += v * v; }
      levelRef.current = Math.min(1, Math.sqrt(sum / data.length) * 3.4);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
  } catch {
    // createMediaElementSource captures the element's output; if a later step
    // threw, make sure the audio still reaches the speakers.
    try { src?.connect(ac.destination); } catch { /* noop */ }
  }
  return () => {
    if (raf) cancelAnimationFrame(raf);
    levelRef.current = 0;
    try { src?.disconnect(); } catch { /* noop */ }
    try { analyser?.disconnect(); } catch { /* noop */ }
  };
}
