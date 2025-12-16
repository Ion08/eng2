import type { TaskType } from './types';

export const TASK_RULES: Record<
  TaskType,
  {
    title: string;
    consistsOf: string;
    mustDo: string[];
    mustNotDo: string[];
    recommendedStructure: string;
    minWords: number;
    timerMinutes: number;
  }
> = {
  task1: {
    title: 'IELTS Writing Task 1 (Academic)',
    consistsOf:
      'You are given a visual (graph, chart, table, diagram, or map) and must summarise the main features in a factual, academic style.',
    mustDo: [
      'Select and report the key features and make relevant comparisons.',
      'Write an overview that summarises the main trends or stages.'
    ],
    mustNotDo: [
      'Do not give personal opinions or reasons unless the task explicitly asks for them.',
      'Do not list every single number without summarising trends.'
    ],
    recommendedStructure:
      'Introduction (paraphrase the task) → Overview (main trends) → Body 1 (key details) → Body 2 (comparisons / remaining key details).',
    minWords: 150,
    timerMinutes: 20
  },
  task2: {
    title: 'IELTS Writing Task 2 (Essay)',
    consistsOf:
      'You must write an essay responding to a point of view, argument, or problem.',
    mustDo: [
      'Address all parts of the task and present a clear position.',
      'Support ideas with explanation and relevant examples.'
    ],
    mustNotDo: [
      'Do not write a list of disconnected ideas; develop each main point.',
      'Do not use an informal tone (slang, text abbreviations).' 
    ],
    recommendedStructure:
      'Introduction (paraphrase + thesis) → Body 1 (main idea + support) → Body 2 (main idea + support) → Conclusion (summarise position).',
    minWords: 250,
    timerMinutes: 40
  }
};
