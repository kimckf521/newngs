'use client';

import Link from 'next/link';
import { useCallback, useEffect, useRef, useState } from 'react';
import type { LiveConversation, LiveMessage } from '@/lib/livechat/types';

const KEY_LS = 'ngs-agent-key';
const NAME_LS = 'ngs-agent-name';

/**
 * Live-chat agent console. Polls the agent API for open conversations + the
 * selected thread, lets staff reply / close. Lives behind the /admin AdminGate;
 * the API itself is gated by LIVECHAT_AGENT_KEY (sent as x-livechat-key) in
 * production — set it here once and it's remembered in this browser.
 */
export default function InboxPage() {
  const [agentKey, setAgentKey] = useState('');
  const [agentName, setAgentName] = useState('');
  const [savedHint, setSavedHint] = useState(false);
  const [convos, setConvos] = useState<LiveConversation[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [messages, setMessages] = useState<LiveMessage[]>([]);
  const [reply, setReply] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try {
      setAgentKey(localStorage.getItem(KEY_LS) ?? '');
      setAgentName(localStorage.getItem(NAME_LS) ?? '');
    } catch {
      /* ignore */
    }
  }, []);

  const authHeaders = useCallback((): Record<string, string> => {
    const h: Record<string, string> = { 'Content-Type': 'application/json' };
    if (agentKey) h['x-livechat-key'] = agentKey;
    return h;
  }, [agentKey]);

  useEffect(() => {
    let active = true;
    const poll = async () => {
      try {
        const res = await fetch('/api/livechat/agent', { headers: authHeaders() });
        if (!res.ok) return;
        const data = (await res.json()) as { conversations?: LiveConversation[] };
        if (active && Array.isArray(data.conversations)) setConvos(data.conversations);
      } catch {
        /* ignore */
      }
    };
    void poll();
    const id = setInterval(poll, 4000);
    return () => {
      active = false;
      clearInterval(id);
    };
  }, [authHeaders]);

  useEffect(() => {
    if (!selected) {
      setMessages([]);
      return;
    }
    let active = true;
    const poll = async () => {
      try {
        const res = await fetch(`/api/livechat/agent?conversationId=${encodeURIComponent(selected)}`, { headers: authHeaders() });
        if (!res.ok) return;
        const data = (await res.json()) as { messages?: LiveMessage[] };
        if (active && Array.isArray(data.messages)) setMessages(data.messages);
      } catch {
        /* ignore */
      }
    };
    void poll();
    const id = setInterval(poll, 2500);
    return () => {
      active = false;
      clearInterval(id);
    };
  }, [selected, authHeaders]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [messages]);

  const saveSettings = () => {
    try {
      localStorage.setItem(KEY_LS, agentKey);
      localStorage.setItem(NAME_LS, agentName);
    } catch {
      /* ignore */
    }
    setSavedHint(true);
    setTimeout(() => setSavedHint(false), 1500);
  };

  const sendReply = async () => {
    const text = reply.trim();
    if (!text || !selected) return;
    setReply('');
    setMessages((m) => [...m, { id: `tmp-${Date.now()}`, role: 'agent', text, createdAt: Date.now(), agentName: agentName || '顾问' }]);
    try {
      await fetch('/api/livechat/agent', {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({ conversationId: selected, text, agentName }),
      });
    } catch {
      /* next poll reconciles */
    }
  };

  const closeConvo = async () => {
    if (!selected) return;
    try {
      await fetch('/api/livechat/agent', {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({ conversationId: selected, action: 'close' }),
      });
    } catch {
      /* ignore */
    }
    setSelected(null);
  };

  const fmt = (ts: number) => new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return (
    <main style={{ maxWidth: 960, margin: '0 auto', padding: '32px 24px', fontFamily: 'system-ui, sans-serif', color: '#111' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
        <h1 style={{ fontSize: 24, fontWeight: 800, letterSpacing: '-0.01em' }}>Live chat inbox</h1>
        <Link href="/admin" style={{ color: '#9333ea', fontSize: 13, textDecoration: 'none' }}>← Pages</Link>
      </div>

      <div style={{ marginTop: 14, display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center', background: '#f7f7f8', border: '1px solid #ececec', borderRadius: 12, padding: '10px 12px' }}>
        <input value={agentName} onChange={(e) => setAgentName(e.target.value)} placeholder="Your name (shown to visitors)" style={{ flex: '1 1 180px', minWidth: 0, padding: '7px 10px', border: '1px solid #ddd', borderRadius: 8, fontSize: 13 }} />
        <input value={agentKey} onChange={(e) => setAgentKey(e.target.value)} placeholder="Agent key (prod only)" type="password" style={{ flex: '1 1 160px', minWidth: 0, padding: '7px 10px', border: '1px solid #ddd', borderRadius: 8, fontSize: 13 }} />
        <button type="button" onClick={saveSettings} style={{ padding: '7px 16px', border: 'none', borderRadius: 8, background: 'linear-gradient(115deg,#ec1c8b,#8b2fd6,#16c8e6)', color: '#fff', fontWeight: 600, fontSize: 13, cursor: 'pointer' }}>
          {savedHint ? 'Saved ✓' : 'Save'}
        </button>
      </div>

      <div style={{ marginTop: 16, display: 'grid', gridTemplateColumns: '300px 1fr', gap: 16, alignItems: 'start' }}>
        {/* Conversation list */}
        <div style={{ border: '1px solid #ececec', borderRadius: 12, overflow: 'hidden', minHeight: 480 }}>
          <div style={{ padding: '10px 14px', borderBottom: '1px solid #f0f0f0', fontSize: 13, fontWeight: 600, color: '#555' }}>
            Open ({convos.length})
          </div>
          {convos.length === 0 && <p style={{ padding: '16px 14px', fontSize: 13, color: '#999' }}>No open conversations.</p>}
          {convos.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => setSelected(c.id)}
              style={{ display: 'block', width: '100%', textAlign: 'left', padding: '12px 14px', border: 'none', borderBottom: '1px solid #f4f4f4', background: selected === c.id ? '#f3e8ff' : '#fff', cursor: 'pointer' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, fontSize: 12, color: '#888' }}>
                <span>{c.locale === 'en' ? 'EN' : '中文'}{c.lastRole === 'visitor' ? ' · new' : ''}</span>
                <span>{fmt(c.updatedAt)}</span>
              </div>
              <div style={{ marginTop: 3, fontSize: 13, color: '#222', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {c.lastMessage || '(no messages yet)'}
              </div>
            </button>
          ))}
        </div>

        {/* Chat view */}
        <div style={{ border: '1px solid #ececec', borderRadius: 12, display: 'flex', flexDirection: 'column', height: 480 }}>
          {!selected ? (
            <div style={{ margin: 'auto', color: '#aaa', fontSize: 14 }}>Select a conversation</div>
          ) : (
            <>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', borderBottom: '1px solid #f0f0f0' }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: '#555' }}>Conversation</span>
                <button type="button" onClick={closeConvo} style={{ fontSize: 12, color: '#b91c1c', background: 'none', border: '1px solid #f0c0c0', borderRadius: 8, padding: '4px 10px', cursor: 'pointer' }}>
                  Close
                </button>
              </div>
              <div ref={scrollRef} style={{ flex: 1, overflowY: 'auto', padding: '14px', display: 'flex', flexDirection: 'column', gap: 8 }}>
                {messages.map((m) => (
                  <div key={m.id} style={{ alignSelf: m.role === 'agent' ? 'flex-end' : 'flex-start', maxWidth: '78%' }}>
                    <div style={{ padding: '8px 12px', borderRadius: 12, fontSize: 14, whiteSpace: 'pre-wrap', background: m.role === 'agent' ? 'linear-gradient(115deg,#ec1c8b,#8b2fd6,#16c8e6)' : '#f1f1f3', color: m.role === 'agent' ? '#fff' : '#222' }}>
                      {m.text}
                    </div>
                    <div style={{ fontSize: 10, color: '#bbb', marginTop: 2, textAlign: m.role === 'agent' ? 'right' : 'left' }}>{fmt(m.createdAt)}</div>
                  </div>
                ))}
              </div>
              <form
                onSubmit={(e) => { e.preventDefault(); void sendReply(); }}
                style={{ display: 'flex', gap: 8, padding: 10, borderTop: '1px solid #f0f0f0' }}
              >
                <input
                  value={reply}
                  onChange={(e) => setReply(e.target.value)}
                  placeholder="Type a reply…"
                  style={{ flex: 1, padding: '9px 12px', border: '1px solid #ddd', borderRadius: 10, fontSize: 14 }}
                />
                <button type="submit" disabled={!reply.trim()} style={{ padding: '0 18px', border: 'none', borderRadius: 10, background: 'linear-gradient(115deg,#ec1c8b,#8b2fd6,#16c8e6)', color: '#fff', fontWeight: 600, fontSize: 14, cursor: 'pointer', opacity: reply.trim() ? 1 : 0.5 }}>
                  Send
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </main>
  );
}
