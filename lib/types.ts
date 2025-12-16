export type TaskType = 'task1' | 'task2';

export type WritingMode = 'practice' | 'test';

export type Criterion =
  | 'task'
  | 'coherence'
  | 'lexical'
  | 'grammar';

export type Severity = 'minor' | 'moderate' | 'major';

export interface TaskConfig {
  taskType: TaskType;
  mode: WritingMode;
  prompt: string;
  createdAt: number;
}

export interface TextIssue {
  id: string;
  criterion: Criterion;
  category:
    | 'grammar'
    | 'spelling'
    | 'lexical'
    | 'cohesion'
    | 'task-response'
    | 'tone'
    | 'repetition'
    | 'structure';
  message: string;
  explanation: string;
  severity: Severity;
  bandImpact: number; // negative numbers only
  start: number;
  end: number;
  excerpt: string;
  suggestion?: string;
  improvedVersion?: string;
  improvedWhy?: string;
}

export interface CriterionResult {
  score: number; // 1..9 (0.5 steps allowed)
  summary: string;
  evidence: Record<string, string | number | boolean>;
}

export interface EvaluationResult {
  overall: number;
  criteria: {
    task: CriterionResult;
    coherence: CriterionResult;
    lexical: CriterionResult;
    grammar: CriterionResult;
  };
  issues: TextIssue[];
  stats: {
    wordCount: number;
    paragraphCount: number;
    sentenceCount: number;
    timeLimitMinutes: number;
    minWords: number;
  };
  caps: Array<{ reason: string; maxOverall: number }>;
}

export interface GrammarMatch {
  start: number;
  end: number;
  message: string;
  shortMessage?: string;
  replacements?: string[];
  ruleId?: string;
  type: 'grammar' | 'spelling' | 'style';
}
