/**
 * Locale resolution from pathname. Used by the language switcher and
 * by any component that needs to know which language it's rendering in.
 */

import type { Locale } from '@/lib/siteLinks';

/** All EN routes (with their `_en` suffix). */
export const EN_ROUTES = new Set<string>([
  '/index_en',
  '/privacy_en',
  '/termsofservice_en',
  '/cclr_programs_en',
  '/dual_track_learning_en',
  '/hybrid_learning_en',
  '/online_diploma_program_en',
  '/programs_en',
  '/college_mentorship_en',
  '/highschool_mapping_en',
  '/faculty_en',
  '/admissions_en',
  '/ngs_inspires_en',
  '/ngs_connects_en',
  '/in_progress_en',
  '/yinghua_online_en',
  '/ib_heros_en',
]);

export function localeForPath(pathname: string): Locale {
  return EN_ROUTES.has(pathname) ? 'en' : 'zh';
}

/**
 * For any page, look up its sibling route in the other locale.
 * Used by <LangSwitcher /> in the navbar.
 */
export const LOCALE_MIRROR: Record<string, { en: string; zh: string }> = {
  // ZH home is /, EN home is /index_en
  '/': { en: '/index_en', zh: '/' },
  '/index_en': { en: '/index_en', zh: '/' },

  '/privacy': { en: '/privacy_en', zh: '/privacy' },
  '/privacy_en': { en: '/privacy_en', zh: '/privacy' },

  '/termsofservice': { en: '/termsofservice_en', zh: '/termsofservice' },
  '/termsofservice_en': { en: '/termsofservice_en', zh: '/termsofservice' },

  '/cclr_programs': { en: '/cclr_programs_en', zh: '/cclr_programs' },
  '/cclr_programs_en': { en: '/cclr_programs_en', zh: '/cclr_programs' },

  '/dual_track_learning': { en: '/dual_track_learning_en', zh: '/dual_track_learning' },
  '/dual_track_learning_en': { en: '/dual_track_learning_en', zh: '/dual_track_learning' },

  '/hybrid_learning': { en: '/hybrid_learning_en', zh: '/hybrid_learning' },
  '/hybrid_learning_en': { en: '/hybrid_learning_en', zh: '/hybrid_learning' },

  '/online_diploma_program': { en: '/online_diploma_program_en', zh: '/online_diploma_program' },
  '/online_diploma_program_en': { en: '/online_diploma_program_en', zh: '/online_diploma_program' },

  '/programs': { en: '/programs_en', zh: '/programs' },
  '/programs_en': { en: '/programs_en', zh: '/programs' },

  '/college_mentorship': { en: '/college_mentorship_en', zh: '/college_mentorship' },
  '/college_mentorship_en': { en: '/college_mentorship_en', zh: '/college_mentorship' },

  '/highschool_mapping': { en: '/highschool_mapping_en', zh: '/highschool_mapping' },
  '/highschool_mapping_en': { en: '/highschool_mapping_en', zh: '/highschool_mapping' },

  '/faculty': { en: '/faculty_en', zh: '/faculty' },
  '/faculty_en': { en: '/faculty_en', zh: '/faculty' },

  '/admissions': { en: '/admissions_en', zh: '/admissions' },
  '/admissions_en': { en: '/admissions_en', zh: '/admissions' },

  '/ngs_inspires': { en: '/ngs_inspires_en', zh: '/ngs_inspires' },
  '/ngs_inspires_en': { en: '/ngs_inspires_en', zh: '/ngs_inspires' },

  '/ngs_connects': { en: '/ngs_connects_en', zh: '/ngs_connects' },
  '/ngs_connects_en': { en: '/ngs_connects_en', zh: '/ngs_connects' },

  '/in_progress': { en: '/in_progress_en', zh: '/in_progress' },
  '/in_progress_en': { en: '/in_progress_en', zh: '/in_progress' },

  '/yinghua_online': { en: '/yinghua_online_en', zh: '/yinghua_online' },
  '/yinghua_online_en': { en: '/yinghua_online_en', zh: '/yinghua_online' },

  '/ib_heros': { en: '/ib_heros_en', zh: '/ib_heros' },
  '/ib_heros_en': { en: '/ib_heros_en', zh: '/ib_heros' },
};
