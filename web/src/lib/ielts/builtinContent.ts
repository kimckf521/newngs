import type { RichData } from './contentTypes';
import mod1Rich from '@/data/ielts_mod1_rich.json';
import mod2Rich from '@/data/ielts_mod2_rich.json';
import mod3Rich from '@/data/ielts_mod3_rich.json';
import mod4Rich from '@/data/ielts_mod4_rich.json';
import mod5Rich from '@/data/ielts_mod5_rich.json';
import mod6Rich from '@/data/ielts_mod6_rich.json';
import mod7Rich from '@/data/ielts_mod7_rich.json';
import mod8Rich from '@/data/ielts_mod8_rich.json';
import mod9Rich from '@/data/ielts_mod9_rich.json';
import mod10Rich from '@/data/ielts_mod10_rich.json';

/** The shipped default content for each module (extracted from
 *  ngs.classportal.online). Admin edits are stored as overrides on top of these
 *  defaults; "Reset to default" drops the override and falls back here. */
export const BUILTIN_RICH: Record<string, RichData> = {
  '1': mod1Rich as RichData,
  '2': mod2Rich as RichData,
  '3': mod3Rich as RichData,
  '4': mod4Rich as RichData,
  '5': mod5Rich as RichData,
  '6': mod6Rich as RichData,
  '7': mod7Rich as RichData,
  '8': mod8Rich as RichData,
  '9': mod9Rich as RichData,
  '10': mod10Rich as RichData,
};

export const MODULE_IDS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'] as const;

/** Bilingual module titles (the lesson content itself stays English). */
export const MODULE_TITLES: Record<string, { en: string; zh: string }> = {
  '1': { en: 'Home, Family & Daily Life', zh: '家庭与日常生活' },
  '2': { en: 'Politics and Socio-Cultural Issues', zh: '政治与社会文化议题' },
  '3': { en: 'Work and Professions', zh: '工作与职业' },
  '4': { en: 'Health and Fitness', zh: '健康与健身' },
  '5': { en: 'Citizenship & Politics', zh: '公民与政治' },
  '6': { en: 'Crime and Punishment', zh: '犯罪与刑罚' },
  '7': { en: 'The Environment', zh: '环境' },
  '8': { en: 'Technology and Social Networking', zh: '科技与社交网络' },
  '9': { en: 'Science and Education', zh: '科学与教育' },
  '10': { en: 'The IELTS Exam', zh: '雅思考试' },
};

/** Whether a module has a practice test (module 10 is reference-only). */
export function moduleHasTest(modId: string): boolean {
  return modId !== '10';
}
