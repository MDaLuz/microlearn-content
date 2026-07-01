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

// Simulated progress — first 4 lessons completed, 5th is current
export const getLessonState = (moduleId: string, lessonIndex: number): LessonState => {
  if (lessonIndex < 4) return 'completed';
  if (lessonIndex === 4) return 'current';
  return 'locked';
};

export const getModuleProgress = (moduleId: string): number => {
  const mod = getModule(moduleId);
  if (!mod) return 0;
  const completed = mod.lessons.filter((_, i) => getLessonState(moduleId, i) === 'completed').length;
  return completed / mod.lessons.length;
};
