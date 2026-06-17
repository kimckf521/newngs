/**
 * Shared types for the live "talk to a human" chat (visitor <-> agent).
 * Used by both the visitor widget (AdvisorChat) and the agent console
 * (/admin/inbox), and by the API routes / store.
 */
export type LiveRole = 'visitor' | 'agent' | 'system';

export interface LiveMessage {
  id: string;
  role: LiveRole;
  text: string;
  createdAt: number;
  agentName?: string;
}

export interface LiveConversation {
  id: string;
  /** Short human code (e.g. "K3F9") shown to WeCom agents for routing replies. */
  code?: string;
  status: 'open' | 'closed';
  locale: string;
  page?: string;
  createdAt: number;
  updatedAt: number;
  lastMessage: string;
  lastRole: LiveRole;
  agentName?: string;
}

/** What the poll endpoint returns to either side. */
export interface LivePoll {
  status: LiveConversation['status'] | 'none';
  agentName?: string;
  messages: LiveMessage[];
}

export const MAX_MESSAGE_LEN = 2000;
export const MAX_MESSAGES_PER_CONVERSATION = 200;
