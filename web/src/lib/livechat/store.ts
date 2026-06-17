import 'server-only';
import {
  MAX_MESSAGES_PER_CONVERSATION,
  type LiveConversation,
  type LiveMessage,
  type LiveRole,
} from './types';

/**
 * Live-chat persistence with a PLUGGABLE backend:
 *  - Production: Tencent CloudBase (@cloudbase/node-sdk) — collections
 *    `chat_conversations` (doc id = conversationId) and `chat_messages`.
 *  - Dev / demo (no CloudBase creds): an in-memory store kept on globalThis so
 *    it survives HMR. Lets the full visitor<->agent flow be tested locally
 *    without any backend (mirrors the demo-auth fallback elsewhere in the app).
 *
 * Both the visitor API and the agent API go through this module — the only
 * source of truth — so neither side needs client-side CloudBase realtime/auth.
 */

const ENV_ID = process.env.NEXT_PUBLIC_CLOUDBASE_ENV_ID;
const SECRET_ID = process.env.CLOUDBASE_SECRET_ID;
const SECRET_KEY = process.env.CLOUDBASE_SECRET_KEY;
const HAS_CREDS = Boolean(
  (process.env.TENCENTCLOUD_SECRETID && process.env.TENCENTCLOUD_SECRETKEY) || (SECRET_ID && SECRET_KEY),
);
const USE_CLOUDBASE = Boolean(ENV_ID && HAS_CREDS);

const CONVERSATIONS = 'chat_conversations';
const MESSAGES = 'chat_messages';

export function isLiveChatPersistent(): boolean {
  return USE_CLOUDBASE;
}

// ── In-memory demo backend ────────────────────────────────────────────────
type Mem = { conversations: Map<string, LiveConversation>; messages: Map<string, LiveMessage[]> };
const mem: Mem = ((globalThis as unknown as { __ngsLiveChat?: Mem }).__ngsLiveChat ??= {
  conversations: new Map(),
  messages: new Map(),
});

// ── CloudBase node-sdk backend ────────────────────────────────────────────
// `any` here is deliberate: the node-sdk database handle is dynamically shaped.
let dbPromise: Promise<any | null> | null = null;
async function getDb(): Promise<any | null> {
  if (!USE_CLOUDBASE) return null;
  if (!dbPromise) {
    dbPromise = import('@cloudbase/node-sdk')
      .then((mod: any) => {
        const cloudbase = mod.default ?? mod;
        const app = cloudbase.init(
          SECRET_ID && SECRET_KEY
            ? { env: ENV_ID, secretId: SECRET_ID, secretKey: SECRET_KEY }
            : { env: ENV_ID },
        );
        return app.database();
      })
      .catch(() => {
        dbPromise = null;
        return null;
      });
  }
  return dbPromise;
}

function genId(prefix: string): string {
  return `${prefix}_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;
}

function genCode(): string {
  // Short, human-friendly code shown to WeCom agents (e.g. "K3F9") for reply routing.
  return Math.random().toString(36).slice(2, 6).toUpperCase();
}

/** Create the conversation if it doesn't exist; return it. */
export async function ensureConversation(
  id: string,
  locale: string,
  page?: string,
): Promise<LiveConversation> {
  const now = Date.now();
  const fresh: LiveConversation = {
    id,
    code: genCode(),
    status: 'open',
    locale,
    page,
    createdAt: now,
    updatedAt: now,
    lastMessage: '',
    lastRole: 'system',
  };
  const db = await getDb();
  if (db) {
    const existing = (await db.collection(CONVERSATIONS).doc(id).get())?.data?.[0] as
      | LiveConversation
      | undefined;
    if (existing) return existing;
    await db.collection(CONVERSATIONS).doc(id).set(fresh);
    return fresh;
  }
  let conv = mem.conversations.get(id);
  if (!conv) {
    conv = fresh;
    mem.conversations.set(id, conv);
    mem.messages.set(id, []);
  }
  return conv;
}

export async function getConversation(id: string): Promise<LiveConversation | null> {
  const db = await getDb();
  if (db) {
    return ((await db.collection(CONVERSATIONS).doc(id).get())?.data?.[0] as LiveConversation) ?? null;
  }
  return mem.conversations.get(id) ?? null;
}

export async function getConversationByCode(code: string): Promise<LiveConversation | null> {
  const db = await getDb();
  if (db) {
    const res = await db.collection(CONVERSATIONS).where({ code }).limit(1).get();
    return ((res?.data ?? [])[0] as LiveConversation) ?? null;
  }
  for (const c of mem.conversations.values()) if (c.code === code) return c;
  return null;
}

export async function addMessage(
  conversationId: string,
  role: LiveRole,
  text: string,
  agentName?: string,
): Promise<LiveMessage> {
  const msg: LiveMessage = {
    id: genId('m'),
    role,
    text,
    createdAt: Date.now(),
    ...(agentName ? { agentName } : {}),
  };
  const db = await getDb();
  if (db) {
    await db.collection(MESSAGES).add({ conversationId, ...msg });
    await db.collection(CONVERSATIONS).doc(conversationId).update({
      updatedAt: msg.createdAt,
      lastMessage: text.slice(0, 120),
      lastRole: role,
      status: 'open',
      ...(agentName ? { agentName } : {}),
    });
    return msg;
  }
  const list = mem.messages.get(conversationId) ?? [];
  list.push(msg);
  if (list.length > MAX_MESSAGES_PER_CONVERSATION) list.splice(0, list.length - MAX_MESSAGES_PER_CONVERSATION);
  mem.messages.set(conversationId, list);
  const conv = mem.conversations.get(conversationId);
  if (conv) {
    conv.updatedAt = msg.createdAt;
    conv.lastMessage = text.slice(0, 120);
    conv.lastRole = role;
    conv.status = 'open';
    if (agentName) conv.agentName = agentName;
  }
  return msg;
}

export async function getMessages(conversationId: string): Promise<LiveMessage[]> {
  const db = await getDb();
  if (db) {
    const res = await db
      .collection(MESSAGES)
      .where({ conversationId })
      .orderBy('createdAt', 'asc')
      .limit(MAX_MESSAGES_PER_CONVERSATION)
      .get();
    return (res?.data ?? []) as LiveMessage[];
  }
  return mem.messages.get(conversationId) ?? [];
}

export async function listOpenConversations(): Promise<LiveConversation[]> {
  const db = await getDb();
  if (db) {
    const res = await db
      .collection(CONVERSATIONS)
      .where({ status: 'open' })
      .orderBy('updatedAt', 'desc')
      .limit(100)
      .get();
    return (res?.data ?? []) as LiveConversation[];
  }
  return [...mem.conversations.values()]
    .filter((c) => c.status === 'open')
    .sort((a, b) => b.updatedAt - a.updatedAt);
}

export async function closeConversation(id: string): Promise<void> {
  const db = await getDb();
  if (db) {
    await db.collection(CONVERSATIONS).doc(id).update({ status: 'closed', updatedAt: Date.now() });
    return;
  }
  const conv = mem.conversations.get(id);
  if (conv) conv.status = 'closed';
}
