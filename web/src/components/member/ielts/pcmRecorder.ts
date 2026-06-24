'use client';

/**
 * Captures the microphone and produces a 16 kHz mono 16-bit WAV Blob — the
 * format Tencent ASR's 16k_en engine accepts (MediaRecorder's webm/opus is not
 * accepted). Uses WebAudio + ScriptProcessor (broad browser support).
 */

export type PcmRecorder = { stop: () => Promise<Blob>; cancel: () => void };

export type PcmRecorderOptions = {
  /** Called per audio frame with the frame's RMS energy (0..~1). Used for
   *  voice-activity detection (hands-free / auto-send). */
  onFrame?: (rms: number) => void;
  /** Called live with 16kHz mono 16-bit PCM in 1280-byte (640-sample / 40ms)
   *  frames, for real-time streaming ASR while the user is still speaking. */
  onPcm16?: (frame: Int16Array) => void;
};

const STREAM_FRAME = 640; // samples = 1280 bytes = 40ms @ 16kHz

export async function startPcmRecording(deviceId?: string, opts?: PcmRecorderOptions): Promise<PcmRecorder> {
  const audio: MediaTrackConstraints = { channelCount: 1, echoCancellation: true, noiseSuppression: true };
  // Prefer the chosen device but don't hard-fail if it has since vanished —
  // `ideal` falls back to the system default instead of throwing OverconstrainedError.
  if (deviceId) audio.deviceId = { ideal: deviceId };
  const stream = await navigator.mediaDevices.getUserMedia({ audio });
  const AC: typeof AudioContext = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
  const ctx = new AC();
  const source = ctx.createMediaStreamSource(stream);
  const proc = ctx.createScriptProcessor(4096, 1, 1);
  const chunks: Float32Array[] = [];
  const onFrame = opts?.onFrame;
  const onPcm16 = opts?.onPcm16;
  let pcmPending: Int16Array | null = null; // 16k int16 carry-over < one frame
  proc.onaudioprocess = (e) => {
    const buf = e.inputBuffer.getChannelData(0);
    chunks.push(new Float32Array(buf));
    if (onFrame) {
      let sum = 0;
      for (let i = 0; i < buf.length; i++) sum += buf[i] * buf[i];
      onFrame(Math.sqrt(sum / buf.length));
    }
    if (onPcm16) {
      const ds = downsample(buf, ctx.sampleRate, 16000);
      const i16 = new Int16Array(ds.length);
      for (let i = 0; i < ds.length; i++) {
        const s = Math.max(-1, Math.min(1, ds[i]));
        i16[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
      }
      let merged: Int16Array;
      if (pcmPending && pcmPending.length) {
        merged = new Int16Array(pcmPending.length + i16.length);
        merged.set(pcmPending);
        merged.set(i16, pcmPending.length);
      } else {
        merged = i16;
      }
      let off = 0;
      while (merged.length - off >= STREAM_FRAME) {
        onPcm16(merged.slice(off, off + STREAM_FRAME));
        off += STREAM_FRAME;
      }
      pcmPending = off < merged.length ? merged.slice(off) : null;
    }
  };
  source.connect(proc);
  proc.connect(ctx.destination);

  const teardown = () => {
    try {
      proc.disconnect();
      source.disconnect();
    } catch {
      /* noop */
    }
    stream.getTracks().forEach((t) => t.stop());
  };

  return {
    async stop() {
      const inRate = ctx.sampleRate;
      teardown();
      await ctx.close();
      const pcm = downsample(flatten(chunks), inRate, 16000);
      return encodeWav(pcm, 16000);
    },
    cancel() {
      teardown();
      void ctx.close();
    },
  };
}

function flatten(chunks: Float32Array[]): Float32Array {
  let len = 0;
  for (const c of chunks) len += c.length;
  const out = new Float32Array(len);
  let o = 0;
  for (const c of chunks) {
    out.set(c, o);
    o += c.length;
  }
  return out;
}

function downsample(input: Float32Array, inRate: number, outRate: number): Float32Array {
  if (outRate >= inRate) return input;
  const ratio = inRate / outRate;
  const outLen = Math.floor(input.length / ratio);
  const out = new Float32Array(outLen);
  for (let i = 0; i < outLen; i++) {
    // average the source window to reduce aliasing
    const start = Math.floor(i * ratio);
    const end = Math.min(Math.floor((i + 1) * ratio), input.length);
    let sum = 0;
    for (let j = start; j < end; j++) sum += input[j];
    out[i] = sum / Math.max(1, end - start);
  }
  return out;
}

function encodeWav(samples: Float32Array, sampleRate: number): Blob {
  const buf = new ArrayBuffer(44 + samples.length * 2);
  const dv = new DataView(buf);
  const wr = (off: number, s: string) => {
    for (let i = 0; i < s.length; i++) dv.setUint8(off + i, s.charCodeAt(i));
  };
  wr(0, 'RIFF');
  dv.setUint32(4, 36 + samples.length * 2, true);
  wr(8, 'WAVE');
  wr(12, 'fmt ');
  dv.setUint32(16, 16, true);
  dv.setUint16(20, 1, true); // PCM
  dv.setUint16(22, 1, true); // mono
  dv.setUint32(24, sampleRate, true);
  dv.setUint32(28, sampleRate * 2, true); // byte rate
  dv.setUint16(32, 2, true); // block align
  dv.setUint16(34, 16, true); // bits per sample
  wr(36, 'data');
  dv.setUint32(40, samples.length * 2, true);
  let off = 44;
  for (let i = 0; i < samples.length; i++) {
    const s = Math.max(-1, Math.min(1, samples[i]));
    dv.setInt16(off, s < 0 ? s * 0x8000 : s * 0x7fff, true);
    off += 2;
  }
  return new Blob([buf], { type: 'audio/wav' });
}
