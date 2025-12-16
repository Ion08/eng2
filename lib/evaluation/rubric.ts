import type { CriterionResult, TaskType } from '@/lib/types';

export function clampScore(score: number) {
  return Math.min(9, Math.max(1, score));
}

export function roundToHalf(score: number) {
  return Math.round(score * 2) / 2;
}

export function scoreGrammar(params: {
  wordCount: number;
  grammarIssueCount: number;
  spellingIssueCount: number;
  avgSentenceLength: number;
}): CriterionResult {
  const { wordCount, grammarIssueCount, spellingIssueCount, avgSentenceLength } = params;
  const total = grammarIssueCount + spellingIssueCount;
  const per100 = wordCount ? (total / wordCount) * 100 : 100;

  let score: number;
  if (per100 <= 0.6) score = 9;
  else if (per100 <= 1.2) score = 8;
  else if (per100 <= 2.2) score = 7;
  else if (per100 <= 4.0) score = 6;
  else if (per100 <= 6.0) score = 5;
  else if (per100 <= 8.0) score = 4;
  else score = 3;

  // Very short, simple sentences often limit range.
  if (avgSentenceLength > 0 && avgSentenceLength < 11) score -= 0.5;
  if (avgSentenceLength > 26) score -= 0.5; // run-on risk

  score = roundToHalf(clampScore(score));

  return {
    score,
    summary:
      score >= 7
        ? 'Mostly accurate grammar with occasional slips.'
        : 'Frequent errors reduce clarity and limit grammatical control.',
    evidence: {
      grammarIssueCount,
      spellingIssueCount,
      errorPer100Words: Number(per100.toFixed(2)),
      avgSentenceLength: Number(avgSentenceLength.toFixed(1))
    }
  };
}

export function scoreLexical(params: {
  cttr: number;
  repetitionShare: number;
  informalHitCount: number;
}): CriterionResult {
  const { cttr, repetitionShare, informalHitCount } = params;

  let score: number;
  if (cttr >= 0.8) score = 9;
  else if (cttr >= 0.72) score = 8;
  else if (cttr >= 0.65) score = 7;
  else if (cttr >= 0.58) score = 6;
  else if (cttr >= 0.50) score = 5;
  else score = 4;

  if (repetitionShare > 0.06) score -= 0.5;
  if (repetitionShare > 0.09) score -= 0.5;
  if (informalHitCount >= 2) score -= 0.5;
  if (informalHitCount >= 5) score -= 0.5;

  score = roundToHalf(clampScore(score));

  return {
    score,
    summary:
      score >= 7
        ? 'Adequate range with some flexibility and precision.'
        : 'Limited range and/or repetition reduces lexical effectiveness.',
    evidence: {
      cttr: Number(cttr.toFixed(3)),
      repetitionShare: Number(repetitionShare.toFixed(3)),
      informalHitCount
    }
  };
}

export function scoreCoherence(params: {
  taskType: TaskType;
  paragraphCount: number;
  linkingPer100: number;
}): CriterionResult {
  const { taskType, paragraphCount, linkingPer100 } = params;

  let score = 8;

  if (paragraphCount <= 1) score = 4;
  else if (paragraphCount === 2) score = 5;
  else if (paragraphCount === 3) score = 6;
  else if (paragraphCount >= 4) score = 7.5;

  const expectedMin = taskType === 'task2' ? 4 : 3;
  if (paragraphCount < expectedMin) score -= 0.5;

  if (linkingPer100 < 0.6) score -= 1;
  else if (linkingPer100 < 1.1) score -= 0.5;

  score = roundToHalf(clampScore(score));

  return {
    score,
    summary:
      score >= 7
        ? 'Paragraphing is generally logical and cohesion devices are used appropriately.'
        : 'Organisation and cohesion are weak or inconsistent, reducing clarity.',
    evidence: {
      paragraphCount,
      linkingPer100Words: Number(linkingPer100.toFixed(2))
    }
  };
}

export function scoreTask(params: {
  taskType: TaskType;
  wordCount: number;
  minWords: number;
  promptSimilarity: number;
  hasThesisOrOverview: boolean;
  hasConclusion: boolean;
  personalOpinionInTask1: boolean;
}): { result: CriterionResult; caps: Array<{ reason: string; maxOverall: number }> } {
  const {
    taskType,
    wordCount,
    minWords,
    promptSimilarity,
    hasThesisOrOverview,
    hasConclusion,
    personalOpinionInTask1
  } = params;

  const caps: Array<{ reason: string; maxOverall: number }> = [];

  let score = 8;

  if (wordCount < minWords) {
    // Strong penalty and a cap: underlength scripts are penalised by IELTS examiners.
    const ratio = wordCount / minWords;
    if (ratio < 0.6) {
      score = 3.5;
      caps.push({ reason: 'Underlength (far below minimum word count).', maxOverall: 4 });
    } else if (ratio < 0.8) {
      score = 4.5;
      caps.push({ reason: 'Underlength (below minimum word count).', maxOverall: 5 });
    } else {
      score = 5.5;
      caps.push({ reason: 'Slightly under the minimum word count.', maxOverall: 6 });
    }
  }

  if (promptSimilarity < 0.08) {
    score = Math.min(score, 4);
    caps.push({ reason: 'Likely off-topic / weak relevance to the question.', maxOverall: 5 });
  } else if (promptSimilarity < 0.12) {
    score -= 1;
  }

  if (!hasThesisOrOverview) score -= 1;
  if (taskType === 'task2' && !hasConclusion) score -= 0.5;
  if (taskType === 'task1' && personalOpinionInTask1) score -= 1;

  score = roundToHalf(clampScore(score));

  return {
    result: {
      score,
      summary:
        score >= 7
          ? 'The response addresses the task with a clear focus.'
          : 'The response only partially addresses the task and/or lacks clarity of purpose.',
      evidence: {
        wordCount,
        minWords,
        promptSimilarity: Number(promptSimilarity.toFixed(3)),
        hasThesisOrOverview,
        hasConclusion,
        personalOpinionInTask1
      }
    },
    caps
  };
}
