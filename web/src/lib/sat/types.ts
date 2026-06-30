/**
 * SAT (Digital / Bluebook) domain model + official content taxonomy.
 * ----------------------------------------------------------------------------
 * Mirrors the app's JSONB persistence convention (see lib/courses/types.ts):
 * the full object is stored in a `data` column; `id` (slug) + `published` are
 * promoted to columns. Three stored entities:
 *   - SatQuestion  → sat_questions  (the reusable item pool)
 *   - SatForm      → sat_forms      (a full 4-module practice test)
 *   - SatAttempt   → sat_attempts   (one student's run + computed score)
 *
 * Taxonomy strings are the official College Board domains/skills (Digital SAT
 * Suite Specifications). They double as DB tags and TS union types.
 */

export type SatSection = 'reading_writing' | 'math';
export type SatDifficulty = 'easy' | 'medium' | 'hard';
export type SatFormat = 'mc' | 'spr'; // multiple-choice | student-produced response (grid-in)
export type SatRoute = 'fixed' | 'upper' | 'lower';

/* ---------------------------------------------------------------- taxonomy */

// Reading & Writing — 4 domains.
export type RwDomain =
  | 'information_and_ideas'
  | 'craft_and_structure'
  | 'expression_of_ideas'
  | 'standard_english_conventions';

export type RwSkill =
  // Information and Ideas
  | 'central_ideas_and_details'
  | 'command_of_evidence_textual'
  | 'command_of_evidence_quantitative'
  | 'inferences'
  // Craft and Structure
  | 'words_in_context'
  | 'text_structure_and_purpose'
  | 'cross_text_connections'
  // Expression of Ideas
  | 'rhetorical_synthesis'
  | 'transitions'
  // Standard English Conventions
  | 'boundaries'
  | 'form_structure_and_sense';

// Math — 4 domains.
export type MathDomain =
  | 'algebra'
  | 'advanced_math'
  | 'problem_solving_and_data_analysis'
  | 'geometry_and_trigonometry';

export type MathSkill =
  // Algebra
  | 'linear_equations_in_one_variable'
  | 'linear_equations_in_two_variables'
  | 'linear_functions'
  | 'systems_of_two_linear_equations_in_two_variables'
  | 'linear_inequalities_in_one_or_two_variables'
  // Advanced Math
  | 'equivalent_expressions'
  | 'nonlinear_equations_and_systems'
  | 'nonlinear_functions'
  // Problem-Solving and Data Analysis
  | 'ratios_rates_proportional_relationships_and_units'
  | 'percentages'
  | 'one_variable_data_distributions_and_measures'
  | 'two_variable_data_models_and_scatterplots'
  | 'probability_and_conditional_probability'
  | 'inference_from_sample_statistics_and_margin_of_error'
  | 'evaluating_statistical_claims'
  // Geometry and Trigonometry
  | 'area_and_volume'
  | 'lines_angles_and_triangles'
  | 'right_triangles_and_trigonometry'
  | 'circles';

export type SatDomain = RwDomain | MathDomain;
export type SatSkill = RwSkill | MathSkill;

/** Human-readable labels for admin dropdowns / tags. */
export const SECTION_LABEL: Record<SatSection, string> = {
  reading_writing: 'Reading and Writing',
  math: 'Math',
};

export const DIFFICULTY_LABEL: Record<SatDifficulty, string> = {
  easy: 'Easy',
  medium: 'Medium',
  hard: 'Hard',
};

export const DOMAIN_LABEL: Record<SatDomain, string> = {
  // RW
  information_and_ideas: 'Information and Ideas',
  craft_and_structure: 'Craft and Structure',
  expression_of_ideas: 'Expression of Ideas',
  standard_english_conventions: 'Standard English Conventions',
  // Math
  algebra: 'Algebra',
  advanced_math: 'Advanced Math',
  problem_solving_and_data_analysis: 'Problem-Solving and Data Analysis',
  geometry_and_trigonometry: 'Geometry and Trigonometry',
};

export const SKILL_LABEL: Record<SatSkill, string> = {
  // Information and Ideas
  central_ideas_and_details: 'Central Ideas and Details',
  command_of_evidence_textual: 'Command of Evidence — Textual',
  command_of_evidence_quantitative: 'Command of Evidence — Quantitative',
  inferences: 'Inferences',
  // Craft and Structure
  words_in_context: 'Words in Context',
  text_structure_and_purpose: 'Text Structure and Purpose',
  cross_text_connections: 'Cross-Text Connections',
  // Expression of Ideas
  rhetorical_synthesis: 'Rhetorical Synthesis',
  transitions: 'Transitions',
  // Standard English Conventions
  boundaries: 'Boundaries',
  form_structure_and_sense: 'Form, Structure, and Sense',
  // Algebra
  linear_equations_in_one_variable: 'Linear equations in one variable',
  linear_equations_in_two_variables: 'Linear equations in two variables',
  linear_functions: 'Linear functions',
  systems_of_two_linear_equations_in_two_variables: 'Systems of two linear equations in two variables',
  linear_inequalities_in_one_or_two_variables: 'Linear inequalities in one or two variables',
  // Advanced Math
  equivalent_expressions: 'Equivalent expressions',
  nonlinear_equations_and_systems: 'Nonlinear equations & systems',
  nonlinear_functions: 'Nonlinear functions',
  // Problem-Solving and Data Analysis
  ratios_rates_proportional_relationships_and_units: 'Ratios, rates, proportional relationships, and units',
  percentages: 'Percentages',
  one_variable_data_distributions_and_measures: 'One-variable data: distributions and measures of center and spread',
  two_variable_data_models_and_scatterplots: 'Two-variable data: models and scatterplots',
  probability_and_conditional_probability: 'Probability and conditional probability',
  inference_from_sample_statistics_and_margin_of_error: 'Inference from sample statistics and margin of error',
  evaluating_statistical_claims: 'Evaluating statistical claims: observational studies and experiments',
  // Geometry and Trigonometry
  area_and_volume: 'Area and volume',
  lines_angles_and_triangles: 'Lines, angles, and triangles',
  right_triangles_and_trigonometry: 'Right triangles and trigonometry',
  circles: 'Circles',
};

/** Which domains belong to a section, and which skills belong to a domain —
 *  drives the dependent dropdowns in the admin authoring UI. */
export const DOMAINS_BY_SECTION: Record<SatSection, SatDomain[]> = {
  reading_writing: [
    'information_and_ideas',
    'craft_and_structure',
    'expression_of_ideas',
    'standard_english_conventions',
  ],
  math: ['algebra', 'advanced_math', 'problem_solving_and_data_analysis', 'geometry_and_trigonometry'],
};

export const SKILLS_BY_DOMAIN: Record<SatDomain, SatSkill[]> = {
  information_and_ideas: [
    'central_ideas_and_details',
    'inferences',
    'command_of_evidence_textual',
    'command_of_evidence_quantitative',
  ],
  craft_and_structure: ['words_in_context', 'text_structure_and_purpose', 'cross_text_connections'],
  expression_of_ideas: ['rhetorical_synthesis', 'transitions'],
  standard_english_conventions: ['boundaries', 'form_structure_and_sense'],
  algebra: [
    'linear_equations_in_one_variable',
    'linear_equations_in_two_variables',
    'linear_functions',
    'systems_of_two_linear_equations_in_two_variables',
    'linear_inequalities_in_one_or_two_variables',
  ],
  advanced_math: ['equivalent_expressions', 'nonlinear_equations_and_systems', 'nonlinear_functions'],
  problem_solving_and_data_analysis: [
    'ratios_rates_proportional_relationships_and_units',
    'percentages',
    'one_variable_data_distributions_and_measures',
    'two_variable_data_models_and_scatterplots',
    'probability_and_conditional_probability',
    'inference_from_sample_statistics_and_margin_of_error',
    'evaluating_statistical_claims',
  ],
  geometry_and_trigonometry: [
    'area_and_volume',
    'lines_angles_and_triangles',
    'right_triangles_and_trigonometry',
    'circles',
  ],
};

/* --------------------------------------------------------------- questions */

export type SatChoiceKey = 'A' | 'B' | 'C' | 'D';
export type SatChoice = { id: SatChoiceKey; text: string };

/** Student-produced response spec — drives §grading. Store every acceptable
 *  written form (e.g. ['7/2','3.5','3.50']); `tolerance` covers repeating
 *  decimals when an exact string list is impractical. */
export type SatSprAnswer = {
  accepted: string[];
  tolerance?: number;
  negativeAllowed?: boolean;
};

export type SatQuestionBase = {
  id: string;
  section: SatSection;
  domain: SatDomain;
  skill: SatSkill;
  difficulty: SatDifficulty;
  stem: string; // question prompt (plain text / light HTML)
  figureUrl?: string; // inline figure / graph / data table
  figureAlt?: string;
  explanation?: string; // rationale, shown in review/results
  source?: string; // e.g. '2025年3月亚太A', 'NGS original'
  published: boolean;
  createdAt?: number;
  updatedAt?: number;
  updatedBy?: string;
};

// Reading & Writing — always a passage + 4-choice MC.
export type SatRwQuestion = SatQuestionBase & {
  section: 'reading_writing';
  domain: RwDomain;
  skill: RwSkill;
  format: 'mc';
  passage: string; // the stimulus (required for RW)
  passageB?: string; // optional second passage (cross-text connections)
  choices: SatChoice[]; // exactly 4
  correct: SatChoiceKey;
};

// Math — MC (4-choice) OR SPR (grid-in). No passage.
export type SatMathQuestion = SatQuestionBase & {
  section: 'math';
  domain: MathDomain;
  skill: MathSkill;
} & (
    | { format: 'mc'; choices: SatChoice[]; correct: SatChoiceKey }
    | { format: 'spr'; answer: SatSprAnswer }
  );

export type SatQuestion = SatRwQuestion | SatMathQuestion;

/* ----------------------------------------------------------------- modules */

export const MODULE_QUESTION_COUNT: Record<SatSection, number> = {
  reading_writing: 27,
  math: 22,
};
export const MODULE_TIME_SEC: Record<SatSection, number> = {
  reading_writing: 32 * 60, // 1920
  math: 35 * 60, // 2100
};
export const SECTION_BREAK_SEC = 10 * 60; // 600
/** Operational (scored) questions per section — both modules, excluding the 2
 *  unscored "pretest" items per module. Used as the raw-score denominator. */
export const SECTION_OPERATIONAL_MAX: Record<SatSection, number> = {
  reading_writing: 50, // 25 + 25
  math: 40, // 20 + 20
};

export type SatModule = {
  id: string; // e.g. 'rw-m1'
  section: SatSection;
  index: 1 | 2;
  difficultyForm: SatRoute; // M1 'fixed'; M2 'upper' | 'lower'
  questionIds: string[]; // ordered refs into the question pool
  timeLimitSec: number;
};

/** A full practice form. Module-2 upper/lower variants are provided up front;
 *  the runner selects one per the Module-1 routing rule. */
export type SatForm = {
  id: string; // slug
  name: string;
  description?: string;
  modules: {
    rwM1: SatModule;
    rwM2Upper: SatModule;
    rwM2Lower: SatModule;
    mathM1: SatModule;
    mathM2Upper: SatModule;
    mathM2Lower: SatModule;
  };
  published: boolean;
  createdAt?: number;
  updatedAt?: number;
  updatedBy?: string;
};

/* ---------------------------------------------------------------- attempts */

export type SatModuleResult = {
  moduleId: string;
  section: SatSection;
  index: 1 | 2;
  route: SatRoute;
  answers: Record<string, string>; // questionId -> 'A'..'D' or SPR raw string
  marked: string[]; // questionId[] flagged for review
  correctCount: number;
  operationalCorrect: number; // correct among scored items (the raw-score input)
  startedAt: number;
  submittedAt?: number;
};

export type SatScores = { rw: number; math: number; total: number };

export type SatAttempt = {
  id: string;
  formId: string;
  uid?: string;
  studentName?: string;
  status: 'in_progress' | 'completed';
  rwRoute?: 'upper' | 'lower';
  mathRoute?: 'upper' | 'lower';
  modules: SatModuleResult[];
  scores?: SatScores; // 200–800 / 200–800 / 400–1600 (estimated)
  createdAt: number;
  updatedAt: number;
};

/* ------------------------------------------------------------- slug helpers
 * Copied from lib/courses/types.ts so the SAT layer is self-contained. */

export function uniqueSlug(base: string, taken: string[]): string {
  if (!taken.includes(base)) return base;
  let i = 2;
  while (taken.includes(`${base}-${i}`)) i++;
  return `${base}-${i}`;
}

export function slugify(name: string): string {
  const s = name
    .trim()
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 60);
  return s || `sat-${Date.now().toString(36)}`;
}

/* ------------------------------------------------------------------ guards */

export function isRw(q: SatQuestion): q is SatRwQuestion {
  return q.section === 'reading_writing';
}
export function isMath(q: SatQuestion): q is SatMathQuestion {
  return q.section === 'math';
}
export function isMc(q: SatQuestion): q is SatQuestion & { format: 'mc'; choices: SatChoice[]; correct: SatChoiceKey } {
  return (q as { format?: string }).format === 'mc';
}
export function isSpr(q: SatQuestion): q is SatMathQuestion & { format: 'spr'; answer: SatSprAnswer } {
  return (q as { format?: string }).format === 'spr';
}
