import type { GrammarMatch, TaskType, TextIssue } from '@/lib/types';
import { clipExcerpt, splitSentences } from '@/lib/text';
import { LINKING_WORDS } from '@/lib/analysis/metrics';
import { tokenize } from '@/lib/analysis/tokens';

const SYNONYMS: Record<string, string[]> = {
  important: ['significant', 'crucial', 'essential'],
  good: ['beneficial', 'advantageous', 'positive'],
  bad: ['detrimental', 'negative', 'harmful'],
  big: ['substantial', 'considerable', 'significant'],
  small: ['minor', 'limited', 'modest'],
  people: ['individuals', 'citizens', 'members of society'],
  thing: ['factor', 'aspect', 'issue']
};

function escapeRegExp(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function severityFromType(t: GrammarMatch['type']): 'minor' | 'moderate' | 'major' {
  if (t === 'style') return 'minor';
  if (t === 'spelling') return 'moderate';
  return 'moderate';
}

function impactFromSeverity(sev: TextIssue['severity']): number {
  if (sev === 'minor') return -0.1;
  if (sev === 'moderate') return -0.2;
  return -0.4;
}

export function issuesFromGrammar(text: string, matches: GrammarMatch[]): TextIssue[] {
  return matches.slice(0, 120).map((m, idx) => {
    const severity = severityFromType(m.type);
    const suggestion = m.replacements?.[0];
    const improvedVersion = suggestion
      ? text.slice(0, m.start) + suggestion + text.slice(m.end)
      : undefined;

    return {
      id: `g_${idx}`,
      criterion: 'grammar',
      category: m.type === 'spelling' ? 'spelling' : 'grammar',
      message: m.shortMessage ?? m.message,
      explanation:
        m.type === 'spelling'
          ? 'Spelling mistakes draw attention and reduce the impression of accuracy.'
          : 'Grammar errors reduce clarity and can limit the band for Grammatical Range and Accuracy.',
      severity,
      bandImpact: impactFromSeverity(severity),
      start: m.start,
      end: m.end,
      excerpt: clipExcerpt(text, m.start, m.end),
      suggestion,
      improvedVersion,
      improvedWhy: suggestion
        ? 'Using a correct form improves accuracy and reduces the frequency of noticeable errors.'
        : undefined
    } satisfies TextIssue;
  });
}

export function issuesFromRepetition(text: string, tokens: string[]): TextIssue[] {
  const freq = new Map<string, number>();
  for (const t of tokens) freq.set(t, (freq.get(t) ?? 0) + 1);

  const sorted = [...freq.entries()].sort((a, b) => b[1] - a[1]);
  const issues: TextIssue[] = [];

  for (const [t, count] of sorted.slice(0, 6)) {
    if (count < 7) continue;

    const share = count / Math.max(1, tokens.length);
    if (share < 0.03) continue;

    const re = new RegExp(`\\b${escapeRegExp(t)}\\b`, 'i');
    const m = re.exec(text);
    const start = m?.index ?? 0;
    const end = start + t.length;

    const syn = SYNONYMS[t]?.slice(0, 3);
    const suggestion = syn ? `Consider alternatives: ${syn.join(', ')}.` : undefined;

    issues.push({
      id: `rep_${t}`,
      criterion: 'lexical',
      category: 'repetition',
      message: `Repetition: “${t}” is used ${count} times.`,
      explanation:
        'Frequent repetition limits lexical range and can make the argument sound mechanical.',
      severity: share > 0.07 ? 'major' : 'moderate',
      bandImpact: share > 0.07 ? -0.5 : -0.3,
      start,
      end,
      excerpt: clipExcerpt(text, start, end),
      suggestion,
      improvedWhy:
        'Varying vocabulary improves the Lexical Resource score and helps maintain reader interest.'
    });
  }

  return issues;
}

export function issuesFromTone(
  text: string,
  informalHits: Array<{ start: number; end: number; label: string; match: string }>
) {
  return informalHits.slice(0, 10).map((h, idx) => ({
    id: `tone_${idx}`,
    criterion: 'lexical',
    category: 'tone',
    message: `Informal tone detected (${h.label}): “${h.match}”.`,
    explanation:
      'IELTS Writing expects an academic tone. Informal wording can reduce the Lexical Resource score.',
    severity: 'moderate',
    bandImpact: -0.3,
    start: h.start,
    end: h.end,
    excerpt: clipExcerpt(text, h.start, h.end),
    suggestion: 'Replace informal wording with a more academic alternative (e.g., avoid contractions and slang).',
    improvedWhy: 'A more formal register aligns better with IELTS examiner expectations.'
  })) as TextIssue[];
}

export function issuesFromCohesion(text: string, linkingCount: number, wordCount: number): TextIssue[] {
  const per100 = wordCount ? (linkingCount / wordCount) * 100 : 0;
  if (per100 >= 1.1) return [];

  const start = 0;
  const end = Math.min(text.length, 220);

  return [
    {
      id: 'coh_1',
      criterion: 'coherence',
      category: 'cohesion',
      message: 'Limited use of clear linking devices.',
      explanation:
        'Coherence and Cohesion improves when ideas are connected with appropriate linking words (used accurately, not overused).',
      severity: per100 < 0.6 ? 'major' : 'moderate',
      bandImpact: per100 < 0.6 ? -0.5 : -0.3,
      start,
      end,
      excerpt: clipExcerpt(text, start, end),
      suggestion: `Consider adding precise connectors where logical (e.g., ${LINKING_WORDS.slice(0, 6).join(', ')}).`,
      improvedWhy: 'Clear logical connections make your argument easier to follow and raise CC.'
    }
  ];
}

export function issuesFromTaskStructure(params: {
  taskType: TaskType;
  text: string;
  hasThesisOrOverview: boolean;
  hasConclusion: boolean;
  personalOpinionInTask1: boolean;
}): TextIssue[] {
  const { taskType, text, hasThesisOrOverview, hasConclusion, personalOpinionInTask1 } = params;
  const issues: TextIssue[] = [];

  if (!hasThesisOrOverview) {
    const end = Math.min(text.length, 260);
    issues.push({
      id: 'task_thesis',
      criterion: 'task',
      category: 'structure',
      message:
        taskType === 'task2'
          ? 'Thesis/position is unclear in the introduction.'
          : 'Overview is missing or unclear.',
      explanation:
        taskType === 'task2'
          ? 'Examiners expect a clear position (thesis) early in Task 2, aligned with the question.'
          : 'Task 1 requires an overview summarising the main trends/stages; without it, TA is limited.',
      severity: 'major',
      bandImpact: -0.7,
      start: 0,
      end,
      excerpt: clipExcerpt(text, 0, end),
      suggestion:
        taskType === 'task2'
          ? 'Add 1 sentence that clearly states your position and previews your main reasons.'
          : 'Add an overview sentence (e.g., “Overall, …”) summarising the main trends.',
      improvedWhy:
        'A clear thesis/overview improves task fulfilment and helps the reader understand your direction.'
    });
  }

  if (taskType === 'task2' && !hasConclusion) {
    const start = Math.max(0, text.length - 300);
    issues.push({
      id: 'task_conc',
      criterion: 'task',
      category: 'structure',
      message: 'Conclusion is missing or too weak.',
      explanation:
        'A conclusion should restate your position and summarise your key ideas without adding new arguments.',
      severity: 'moderate',
      bandImpact: -0.3,
      start,
      end: text.length,
      excerpt: clipExcerpt(text, start, text.length),
      suggestion: 'Add a brief conclusion that clearly restates your position and summarises the main points.',
      improvedWhy: 'A controlled ending improves Task Response and overall coherence.'
    });
  }

  if (taskType === 'task1' && personalOpinionInTask1) {
    const m = /\b(i think|i believe|in my opinion|i would say)\b/i.exec(text);
    const start = m?.index ?? 0;
    const end = start + (m?.[0].length ?? 1);
    issues.push({
      id: 'task1_opinion',
      criterion: 'task',
      category: 'task-response',
      message: 'Personal opinion language detected in Task 1.',
      explanation:
        'Task 1 is primarily descriptive. Personal opinions are usually inappropriate and can reduce Task Achievement.',
      severity: 'major',
      bandImpact: -0.6,
      start,
      end,
      excerpt: clipExcerpt(text, start, end),
      suggestion: 'Remove opinion phrases and describe the data/process factually.',
      improvedWhy: 'A factual style better matches Task 1 requirements.'
    });
  }

  return issues;
}

export function issuesFromOffTopic(params: {
  prompt: string;
  essay: string;
  promptSimilarity: number;
}): TextIssue[] {
  const { prompt, essay, promptSimilarity } = params;
  if (promptSimilarity >= 0.12) return [];

  const promptTokens = new Set(tokenize(prompt));
  const sentences = splitSentences(essay);

  let worst = { idx: 0, overlap: 1 };
  for (let i = 0; i < sentences.length; i++) {
    const toks = tokenize(sentences[i]);
    const overlap = toks.length
      ? toks.filter((t) => promptTokens.has(t)).length / toks.length
      : 0;
    if (overlap < worst.overlap) worst = { idx: i, overlap };
  }

  const target = sentences[worst.idx] ?? essay.slice(0, 120);
  const start = Math.max(0, essay.indexOf(target));
  const end = start + target.length;

  return [
    {
      id: 'offtopic_1',
      criterion: 'task',
      category: 'task-response',
      message: 'Relevance to the question appears weak (possible off-topic content).',
      explanation:
        'When content does not directly address the question, Task Response/Task Achievement is capped even if language is strong.',
      severity: 'major',
      bandImpact: -1.0,
      start,
      end,
      excerpt: clipExcerpt(essay, start, end),
      suggestion:
        'Ensure each body paragraph directly answers the prompt. Replace general statements with specific, prompt-linked arguments.',
      improvedWhy: 'Stronger relevance improves task fulfilment and can raise the overall band substantially.'
    }
  ];
}
