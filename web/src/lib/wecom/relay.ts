import 'server-only';
import { addMessage, getConversationByCode, listOpenConversations } from '@/lib/livechat/store';
import type { LiveConversation } from '@/lib/livechat/types';
import { isWeComPushReady, wecom } from './config';
import { sendTextToUsers } from './client';

/** Push an inbound visitor message to staff in WeCom. No-op unless configured. */
export async function pushVisitorMessage(conv: LiveConversation, text: string): Promise<void> {
  if (!isWeComPushReady()) return;
  const loc = conv.locale === 'en' ? 'EN' : '中文';
  const body =
    `🟢 访客 #${conv.code} · ${loc}${conv.page ? ` · ${conv.page}` : ''}\n` +
    `${text}\n\n` +
    `↩️ 回复请发送：#${conv.code} 你的内容`;
  await sendTextToUsers(wecom.agentUsers, body);
}

const REPLY_RE = /^#([A-Za-z0-9]{2,8})\s+([\s\S]+)$/;

/**
 * Route a staff reply (received from the WeCom callback) back to a conversation:
 *  - "#CODE message" → that conversation by its short code (reliable, stateless,
 *    works even with multiple server instances).
 *  - bare message → the most-recently-active OPEN conversation (single-thread
 *    convenience). Use #CODE when juggling several visitors at once.
 * Returns true if the reply was delivered to a conversation.
 */
export async function routeStaffReply(fromUser: string, content: string): Promise<boolean> {
  const trimmed = content.trim();
  const m = REPLY_RE.exec(trimmed);
  let conv: LiveConversation | null;
  let text: string;
  if (m) {
    conv = await getConversationByCode(m[1].toUpperCase());
    text = m[2].trim();
  } else {
    conv = (await listOpenConversations())[0] ?? null;
    text = trimmed;
  }
  if (!conv || !text) return false;
  // Show a friendly, consistent label to the visitor (not the raw WeCom UserID).
  await addMessage(conv.id, 'agent', text, '顾问');
  return true;
}
