/**
 * WeCom (企业微信) self-built-app config, read from server-only env vars.
 * All blank until you create the internal app in the WeCom admin console and
 * set these — until then isWeComConfigured() is false and the relay is inert
 * (the web inbox at /admin/inbox remains the fallback).
 *
 *   WECOM_CORP_ID      企业ID (我的企业 → 企业信息)
 *   WECOM_AGENT_ID     应用 AgentId (应用管理 → your app)
 *   WECOM_SECRET       应用 Secret (same page)
 *   WECOM_TOKEN        接收消息 Token (应用 → 接收消息 → API接收)
 *   WECOM_AES_KEY      接收消息 EncodingAESKey (same page; 43 chars)
 *   WECOM_AGENT_USERS  comma-separated staff UserIDs to notify (e.g. "zhangsan,lisi")
 */
export const wecom = {
  corpId: process.env.WECOM_CORP_ID ?? '',
  agentId: process.env.WECOM_AGENT_ID ?? '',
  secret: process.env.WECOM_SECRET ?? '',
  token: process.env.WECOM_TOKEN ?? '',
  aesKey: process.env.WECOM_AES_KEY ?? '',
  agentUsers: (process.env.WECOM_AGENT_USERS ?? '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean),
};

/** True once the callback can be verified + messages decrypted. */
export function isWeComConfigured(): boolean {
  return Boolean(wecom.corpId && wecom.agentId && wecom.secret && wecom.token && wecom.aesKey);
}

/** True once we can also PUSH visitor messages to staff. */
export function isWeComPushReady(): boolean {
  return isWeComConfigured() && wecom.agentUsers.length > 0;
}
