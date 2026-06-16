/**
 * Shared i18n types. Locale strings live in `src/content/<section>.ts`
 * with `{ en, zh }` shape; section components take a `locale` prop and
 * pick the right entry.
 */

export type Locale = 'en' | 'zh';

export type Localized<T> = Record<Locale, T>;
