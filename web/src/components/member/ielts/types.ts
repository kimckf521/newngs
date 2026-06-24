export type Para = { label: string | null; text: string };

export type Passage = {
  id: number;
  title: string;
  subtitle?: string;
  paragraphs: Para[];
};

export type Choice = { key: string; text: string };

export type Question = {
  n: number;
  text: string;
  options: Choice[];
  answer: string;
};

export type QType =
  | 'note-completion'
  | 'table-completion'
  | 'summary-completion'
  | 'sentence-completion'
  | 'short-answer'
  | 'form-completion'
  | 'flow-chart-completion'
  | 'tfng'
  | 'ynng'
  | 'mcq'
  | 'matching'
  | 'matching-information'
  | 'matching-features'
  | 'matching-headings'
  | 'map-labelling'
  | 'plan-labelling';

export type QGroup = {
  passageId?: number;
  part?: number;
  range: string;
  type: QType;
  instructions: string;
  wordLimit?: string | null;
  optionBank: Choice[];
  questions: Question[];
};

export type Figure = { image: string; page?: number; alt?: string } | null;

export type ListeningTest = {
  book: string;
  test: number;
  section: string;
  timeLimitMinutes: number;
  audio: string[];
  parts: { id: number; title: string; figure: Figure }[];
  questionGroups: QGroup[];
};

export type WritingTask = {
  task: number;
  minutes: number;
  minWords: number;
  prompt: string;
  figureImage?: string;
  figureAlt?: string;
};

export type WritingTest = {
  book: string;
  test: number;
  section: string;
  timeLimitMinutes: number;
  tasks: WritingTask[];
};

export type SpeakingTest = {
  book: string;
  test: number;
  section: string;
  part1: { intro: string; topic: string; questions: string[] };
  part2: { task: string; bullets: string[]; closing: string; rubric: string; prepSeconds: number; talkSeconds: number };
  part3: { topics: { title: string; questions: string[] }[] };
};

export type ReadingTest = {
  book: string;
  test: number;
  section: string;
  timeLimitMinutes: number;
  passages: Passage[];
  questionGroups: QGroup[];
};

export type ColorTheme = 'default' | 'inverse' | 'cream' | 'contrast';
export type TextSize = 'standard' | 'large' | 'xlarge';
