import 'server-only';
import { env, requireDeepSeekKey } from '@/lib/env';

/**
 * LLM transport for the AI advisor — returns the assistant reply as a plain
 * UTF-8 text stream, provider-agnostic so /api/chat stays trivial.
 *
 * Backend selection:
 *  1. CloudBase native AI gateway (生文模型) — PRIMARY. Used whenever CloudBase
 *     server credentials exist (the Run managed identity TENCENTCLOUD_*, or
 *     CLOUDBASE_SECRET_ID/KEY elsewhere). No API key, no endpoint to manage —
 *     auth + routing are handled by @cloudbase/node-sdk's app.ai().
 *  2. Direct DeepSeek API — FALLBACK. Used when CloudBase creds are absent
 *     (e.g. local dev with only DEEPSEEK_API_KEY), so the chat keeps working
 *     off-platform. Throws if no key → caller maps that to the WeChat handoff.
 *
 * NOTE (mirrors lib/puck/server.ts): we must NOT touch @cloudbase/node-sdk
 * unless a credential source exists — without one its prepareCredentials throws
 * an UNHANDLED promise rejection that the caller's try/catch can't see and that
 * crashes `next dev`. Hence the explicit HAS_CLOUDBASE_CREDS gate.
 */

export type ChatMessage = { role: 'system' | 'user' | 'assistant'; content: string };

const ENV_ID = process.env.NEXT_PUBLIC_CLOUDBASE_ENV_ID;
const SECRET_ID = process.env.CLOUDBASE_SECRET_ID;
const SECRET_KEY = process.env.CLOUDBASE_SECRET_KEY;
const HAS_CLOUDBASE_CREDS = Boolean(
  (process.env.TENCENTCLOUD_SECRETID && process.env.TENCENTCLOUD_SECRETKEY) || (SECRET_ID && SECRET_KEY),
);

/** Whether the native CloudBase AI gateway is usable (env id + credentials). */
export function canUseCloudBaseAI(): boolean {
  return Boolean(ENV_ID && HAS_CLOUDBASE_CREDS);
}

/** Which backend will serve the next request (for logging / diagnostics). */
export function activeChatBackend(): 'cloudbase' | 'deepseek-api' {
  return canUseCloudBaseAI() ? 'cloudbase' : 'deepseek-api';
}

export type ChatBackend = 'auto' | 'deepseek';

export async function streamChatReply(
  messages: ChatMessage[],
  opts?: { backend?: ChatBackend },
): Promise<ReadableStream<Uint8Array>> {
  // 'deepseek' forces the direct DeepSeek API (low latency, China-accessible) —
  // used by the IELTS speaking examiner where the CloudBase gateway is too slow
  // for a live turn-by-turn conversation. 'auto' keeps the advisor's behaviour
  // (CloudBase AI gateway primary, DeepSeek fallback).
  if (opts?.backend === 'deepseek') return streamViaDeepSeekApi(messages);
  return canUseCloudBaseAI() ? streamViaCloudBase(messages) : streamViaDeepSeekApi(messages);
}

/**
 * Non-streaming convenience: accumulate the full assistant reply as a string.
 * Used by the IELTS speaking examiner + grader, which need the complete text
 * (to speak it / to parse a JSON verdict).
 */
export async function completeChatReply(messages: ChatMessage[], opts?: { backend?: ChatBackend }): Promise<string> {
  const stream = await streamChatReply(messages, opts);
  const reader = stream.getReader();
  const decoder = new TextDecoder();
  let out = '';
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    if (value) out += decoder.decode(value, { stream: true });
  }
  out += decoder.decode();
  return out;
}

/** Native CloudBase AI gateway via app.ai().createModel(provider).streamText(). */
async function streamViaCloudBase(messages: ChatMessage[]): Promise<ReadableStream<Uint8Array>> {
  const mod: any = await import('@cloudbase/node-sdk');
  const cloudbase: any = mod.default ?? mod;
  const app = cloudbase.init(
    SECRET_ID && SECRET_KEY ? { env: ENV_ID, secretId: SECRET_ID, secretKey: SECRET_KEY } : { env: ENV_ID },
  );
  const model = app.ai().createModel(env.CLOUDBASE_AI_PROVIDER);
  const result: any = await model.streamText({ model: env.CLOUDBASE_AI_MODEL, messages, temperature: 0.4 });
  // streamText resolves with an `error` field for setup failures (e.g. the
  // model isn't 开通'd, or the env has no AI quota) — surface it as a throw so
  // the route returns a clean 503 → WeChat fallback.
  if (result?.error) {
    throw new Error(typeof result.error === 'string' ? result.error : 'cloudbase_ai_error');
  }
  const reader: ReadableStreamDefaultReader<string> = result.textStream.getReader();
  const encoder = new TextEncoder();
  return new ReadableStream<Uint8Array>({
    async pull(controller) {
      const { done, value } = await reader.read();
      if (done) {
        controller.close();
        return;
      }
      if (value) controller.enqueue(encoder.encode(value));
    },
    cancel() {
      void reader.cancel();
    },
  });
}

/** Direct DeepSeek API (OpenAI-compatible SSE) → plain text. Fallback path. */
async function streamViaDeepSeekApi(messages: ChatMessage[]): Promise<ReadableStream<Uint8Array>> {
  const apiKey = requireDeepSeekKey(); // throws if missing → 503 in the route
  const upstream = await fetch(`${env.DEEPSEEK_BASE_URL}/chat/completions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({ model: env.DEEPSEEK_MODEL, messages, stream: true, temperature: 0.4, max_tokens: 1024 }),
  });
  if (!upstream.ok || !upstream.body) {
    const detail = await upstream.text().catch(() => '');
    throw new Error(`deepseek_upstream_${upstream.status}: ${detail.slice(0, 200)}`);
  }
  const reader = upstream.body.getReader();
  const decoder = new TextDecoder();
  const encoder = new TextEncoder();
  let buffer = '';
  return new ReadableStream<Uint8Array>({
    async pull(controller) {
      const { done, value } = await reader.read();
      if (done) {
        controller.close();
        return;
      }
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() ?? '';
      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed.startsWith('data:')) continue;
        const data = trimmed.slice(5).trim();
        if (data === '[DONE]') {
          controller.close();
          return;
        }
        try {
          const json = JSON.parse(data) as { choices?: { delta?: { content?: string } }[] };
          const delta = json.choices?.[0]?.delta?.content;
          if (delta) controller.enqueue(encoder.encode(delta));
        } catch {
          /* keepalive / partial chunk */
        }
      }
    },
    cancel() {
      void reader.cancel();
    },
  });
}
