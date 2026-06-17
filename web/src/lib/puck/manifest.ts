import type { Locale } from '@/i18n/types';

/** Pages the admin can edit. Phase 1 = homepage (zh + en). Phases 2–3 extend
 *  this from siteLinks to cover every route. */
export type EditablePage = {
  route: string; // siteLinks key / page doc key
  locale: Locale;
  label: string;
  urlPath: string; // public URL, for "view live" links
};

export const editablePages: EditablePage[] = [
  { route: 'home', locale: 'zh', label: '首页 · Home', urlPath: '/' },
  { route: 'home', locale: 'en', label: 'Home (English)', urlPath: '/index_en' },
];
