export interface CatalogEntry {
  id: string;
  title: string;
  discipline: string;
  description: string;
  file: string;
  version: number;
  lessonCount: number;
  estimatedMinutes: number;
  accentColor: string;
}

export interface Catalog {
  schemaVersion: number;
  modules: CatalogEntry[];
}

// Block types
export interface TextBlock {
  type: 'text';
  markdown: string;
  svg?: string;
  caption?: string;
}

export interface FlashCard {
  id: string;
  front: string;
  back: string;
}

export interface FlashcardBlock {
  type: 'flashcard';
  title: string;
  cards: FlashCard[];
}

export interface QuizQuestion {
  id: string;
  stem: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface QuizBlock {
  type: 'quiz';
  title: string;
  questions: QuizQuestion[];
}

export interface CompareItem {
  id: string;
  label: string;
}

export interface CompareAttribute {
  id: string;
  label: string;
  values: string[];
}

export interface CompareBlock {
  type: 'compare';
  title: string;
  items: CompareItem[];
  attributes: CompareAttribute[];
}

export interface ScenarioQuestion {
  id: string;
  stem: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface ScenarioBlock {
  type: 'scenario';
  title: string;
  context: string;
  questions: ScenarioQuestion[];
}

export interface IllustrationBlock {
  type: 'illustration';
  imageUrl: string;
  caption: string;
  alt: string;
}

export type Block =
  | TextBlock
  | FlashcardBlock
  | QuizBlock
  | CompareBlock
  | ScenarioBlock
  | IllustrationBlock;

export interface Lesson {
  id: string;
  title: string;
  xpReward: number;
  blocks: Block[];
}

export interface LevelDef {
  level: number;
  xpRequired: number;
  title: string;
}

export interface Module {
  schemaVersion: number;
  id: string;
  title: string;
  discipline: string;
  version: number;
  levels: LevelDef[];
  lessons: Lesson[];
}

export type LessonState = 'completed' | 'current' | 'locked';
