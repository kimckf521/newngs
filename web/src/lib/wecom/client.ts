import 'server-only';
import { wecom } from './config';

const API = 'https://qyapi.weixin.qq.com/cgi-bin';

// access_token is cached ~2h by WeCom; memoise per server instance.
let cached: { value: string; exp: number } | null = null;

async function getAccessToken(): Promise<string | null> {
  const now = Date.now();
  if (cached && cached.exp > now) return cached.value;
  try {
    const res = await fetch(`${API}/gettoken?corpid=${encodeURIComponent(wecom.corpId)}&corpsecret=${encodeURIComponent(wecom.secret)}`);
    const data = (await res.json()) as { errcode?: number; access_token?: string; expires_in?: number };
    if (data.errcode === 0 && data.access_token) {
      cached = { value: data.access_token, exp: now + (data.expires_in ?? 7200) * 1000 - 60_000 };
      return cached.value;
    }
  } catch {
    /* ignore — caller treats null as "not delivered" */
  }
  return null;
}

/** Send a plain-text app message to the given staff UserIDs. Returns success. */
export async function sendTextToUsers(users: string[], content: string): Promise<boolean> {
  if (users.length === 0) return false;
  const at = await getAccessToken();
  if (!at) return false;
  try {
    const res = await fetch(`${API}/message/send?access_token=${at}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        touser: users.join('|'),
        msgtype: 'text',
        agentid: Number(wecom.agentId),
        text: { content },
        safe: 0,
      }),
    });
    const data = (await res.json()) as { errcode?: number };
    return data.errcode === 0;
  } catch {
    return false;
  }
}
