import { AdvisorChat } from '@/components/chat/AdvisorChat';
import type { Locale } from '@/i18n/types';

/**
 * Floating "咨询顾问" widget for the v1 dark site. Now an on-site AI advisor
 * (DeepSeek-backed) with a one-tap handoff to the WeChat 客服 desk for humans —
 * replaces the old "open WeChat" link. Fixed bottom-right on every page
 * (rendered by the site shell). The button + chat panel live in AdvisorChat.
 */
export function ContactFabV1({ locale = 'zh' }: { locale?: Locale }) {
  return <AdvisorChat locale={locale} />;
}
