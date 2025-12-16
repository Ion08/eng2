import type {
  EvaluationResult,
  GrammarMatch,
  TaskType
} from '@/lib/types';
import { TASK_RULES } from '@/lib/rules';
import { countWords } from '@/lib/text';
import { analyzeGrammar } from '@/lib/analysis/grammar';
import { basicMetrics } from '@/lib/analysis/metrics';
import { promptEssaySimilarity } from '@/lib/analysis/similarity';
import {
  issuesFromCohesion,
  issuesFromGrammar,
  issuesFromOffTopic,
  issuesFromRepetition,
  issuesFromTaskStructure,
  issuesFromTone
} from './issues';
import {
  clampScore,
  roundToHalf,
  scoreCoherence,
  scoreGrammar,
  scoreLexical,
  scoreTask
} from './rubric';

function detectThesisOrOverview(taskType: TaskType, text: string): boolean {
  const t = text.trim();
  if (!t) return false;

  if (taskType === 'task2') {
    const first = t.slice(0, 800);
    return /\b(i (agree|disagree|believe|think)|this essay (argues|will)|in this essay)\b/i.test(first);
  }

  return /\boverall\b|\bin general\b|\bgenerally\b|\bit is clear that\b/i.test(t);
}

function detectConclusion(text: string): boolean {
  const tail = text.slice(Math.max(0, text.length - 600));
  return /\bin conclusion\b|\bto conclude\b|\boverall\b|\bto sum up\b/i.test(tail);
}

function detectPersonalOpinionInTask1(text: string): boolean {
  return /\b(i think|i believe|in my opinion|i would say)\b/i.test(text);
}

export async function evaluateWriting(params: {
  taskType: TaskType;
  prompt: string;
  essay: string;
  grammarMatches?: GrammarMatch[];
}): Promise<EvaluationResult> {
  const { taskType, prompt, essay } = params;
  const rules = TASK_RULES[taskType];

  const wordCount = countWords(essay);
  const promptSimilarity = promptEssaySimilarity(prompt, essay);

  const grammarMatches = params.grammarMatches ?? (await analyzeGrammar(essay));
  const grammarIssueCount = grammarMatches.filter((m) => m.type === 'grammar' || m.type === 'style').length;
  const spellingIssueCount = grammarMatches.filter((m) => m.type === 'spelling').length;

  const metrics = basicMetrics(essay);

  const repetitionTop = metrics.topTokenFrequencies[0];
  const repetitionShare = repetitionTop
    ? repetitionTop.count / Math.max(1, metrics.tokensUnstemmed.length)
    : 0;

  const hasThesisOrOverview = detectThesisOrOverview(taskType, essay);
  const hasConclusion = taskType === 'task2' ? detectConclusion(essay) : true;
  const personalOpinionInTask1 = taskType === 'task1' ? detectPersonalOpinionInTask1(essay) : false;

  const task = scoreTask({
    taskType,
    wordCount,
    minWords: rules.minWords,
    promptSimilarity,
    hasThesisOrOverview,
    hasConclusion,
    personalOpinionInTask1
  });

  const coherence = scoreCoherence({
    taskType,
    paragraphCount: metrics.paragraphCount,
    linkingPer100: wordCount ? (metrics.linkingCount / wordCount) * 100 : 0
  });

  const lexical = scoreLexical({
    cttr: metrics.cttr,
    repetitionShare,
    informalHitCount: metrics.informalHits.length
  });

  const grammar = scoreGrammar({
    wordCount,
    grammarIssueCount,
    spellingIssueCount,
    avgSentenceLength: metrics.avgSentenceLength
  });

  // IELTS overall is an average rounded to nearest 0.5.
  let overall = roundToHalf((task.result.score + coherence.score + lexical.score + grammar.score) / 4);
  overall = clampScore(overall);

  for (const cap of task.caps) {
    overall = Math.min(overall, cap.maxOverall);
  }

  const issues = [
    ...issuesFromOffTopic({ prompt, essay, promptSimilarity }),
    ...issuesFromTaskStructure({
      taskType,
      text: essay,
      hasThesisOrOverview,
      hasConclusion,
      personalOpinionInTask1
    }),
    ...issuesFromCohesion(essay, metrics.linkingCount, wordCount),
    ...issuesFromTone(essay, metrics.informalHits),
    ...issuesFromRepetition(essay, metrics.tokensUnstemmed),
    ...issuesFromGrammar(essay, grammarMatches)
  ].sort((a, b) => a.start - b.start);

  return {
    overall,
    criteria: {
      task: task.result,
      coherence,
      lexical,
      grammar
    },
    issues,
    stats: {
      wordCount,
      paragraphCount: metrics.paragraphCount,
      sentenceCount: metrics.sentenceCount,
      timeLimitMinutes: rules.timerMinutes,
      minWords: rules.minWords
    },
    caps: task.caps
  };
}
