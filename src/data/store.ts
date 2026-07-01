import catalog from './catalog.json';
import indoorGardening from './indoor-gardening.json';
import publicSpeaking from './public-speaking.json';
import type { Catalog, Module, LessonState } from './types';

export const getCatalog = (): Catalog => catalog as Catalog;

const moduleMap: Record<string, Module> = {
  'indoor-gardening': indoorGardening as unknown as Module,
  'public-speaking': publicSpeaking as unknown as Module,
};

export const getModule = (id: string): Module | null => moduleMap[id] ?? null;

// In-memory progress: seed first 4 indoor-gardening lessons as completed
const completedLessons = new Set<string>([
  'indoor-gardening:0',
  'indoor-gardening:1',
  'indoor-gardening:2',
  'indoor-gardening:3',
]);

export const markLessonCompleted = (moduleId: string, lessonIndex: number): void => {
  completedLessons.add(`${moduleId}:${lessonIndex}`);
};

export const getLessonState = (moduleId: string, lessonIndex: number): LessonState => {
  if (completedLessons.has(`${moduleId}:${lessonIndex}`)) return 'completed';
  const prevDone = lessonIndex === 0 || completedLessons.has(`${moduleId}:${lessonIndex - 1}`);
  return prevDone ? 'current' : 'locked';
};

export const getModuleProgress = (moduleId: string): number => {
  const mod = getModule(moduleId);
  if (!mod) return 0;
  const completed = mod.lessons.filter((_, i) => getLessonState(moduleId, i) === 'completed').length;
  return completed / mod.lessons.length;
};
