'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { EvaluationResult, GrammarMatch, TaskConfig } from '@/lib/types';
import { TASK_RULES } from '@/lib/rules';
import { countWords } from '@/lib/text';
import { TaskRulesCard } from '@/components/TaskRulesCard';
import { Timer } from '@/components/Timer';
import { PracticeEditor } from '@/components/PracticeEditor';
import { PracticeTools } from '@/components/PracticeTools';
import { AssistantChat } from '@/components/AssistantChat';
import { EssayHighlighter } from '@/components/EssayHighlighter';

export default function WritePage() {
  const router = useRouter();

  const [config, setConfig] = useState<TaskConfig | null>(null);
  const [essay, setEssay] = useState('');
  const [grammarMatches, setGrammarMatches] = useState<GrammarMatch[]>([]);
  const [evaluation, setEvaluation] = useState<EvaluationResult | null>(null);
  const [submitBusy, setSubmitBusy] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [started, setStarted] = useState(false);

  const autoSubmittedRef = useRef(false);

  useEffect(() => {
    const raw = sessionStorage.getItem('ielts_config');
    if (!raw) {
      router.push('/');
      return;
    }
    try {
      const parsed = JSON.parse(raw) as TaskConfig;
      if (!parsed.prompt) throw new Error('Missing prompt');
      setConfig(parsed);
    } catch {
      router.push('/');
    }
  }, [router]);

  const rules = useMemo(() => (config ? TASK_RULES[config.taskType] : null), [config]);
  const wordCount = useMemo(() => countWords(essay), [essay]);

  async function submit() {
    if (!config) return;

    setSubmitBusy(true);
    setSubmitError(null);
    setEvaluation(null);

    try {
      const res = await fetch('/api/evaluate', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          taskType: config.taskType,
          prompt: config.prompt,
          essay
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data?.error ?? 'Evaluation failed');
      setEvaluation(data);
    } catch (e) {
      setSubmitError(e instanceof Error ? e.message : 'Evaluation failed');
    } finally {
      setSubmitBusy(false);
    }
  }

  function onExpire() {
    if (autoSubmittedRef.current) return;
    autoSubmittedRef.current = true;
    submit();
  }

  if (!config || !rules) {
    return (
      <div className="panel">
        <h2>Loading…</h2>
      </div>
    );
  }

  const testMode = config.mode === 'test';

  return (
    <>
      <div className="header">
        <h1 className="h1">
          {testMode ? 'IELTS Writing Test Mode' : 'IELTS Writing Practice Mode'} — {config.taskType.toUpperCase()}
        </h1>
        <button className="btn" onClick={() => router.push('/')}>New task</button>
      </div>

      {testMode ? (
        <div className="panel" style={{ marginBottom: 16 }}>
          <h2>Exam instructions</h2>
          <div className="muted">
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 8 }}>
              <span className="pill">Timer only</span>
              <span className="pill">Word count only</span>
              <span className="pill">No hints</span>
              <span className="pill">No grammar highlighting</span>
              <span className="pill">No AI tools</span>
            </div>
            <div style={{ marginTop: 10 }}>
              When you are ready, click <b>Begin test</b>. The timer starts immediately.
            </div>
          </div>
        </div>
      ) : null}

      {testMode && !started ? <TaskRulesCard taskType={config.taskType} /> : null}

      <div className={testMode ? undefined : 'grid'}>
        <div className="panel">
          <h2>Question</h2>
          <div className="muted" style={{ whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>
            {config.prompt}
          </div>

          <hr />

          {testMode ? (
            <>
              <div className="kpiRow">
                <Timer minutes={rules.timerMinutes} running={started} onExpire={onExpire} />
                <div className="kpi">
                  <div className="k">Word count</div>
                  <div className="v" style={{ color: wordCount < rules.minWords ? 'var(--danger)' : 'var(--ok)' }}>
                    {wordCount}
                  </div>
                  <div className="muted">Min: {rules.minWords}</div>
                </div>
              </div>

              <div style={{ height: 10 }} />

              {!started ? (
                <button className="btn btnPrimary" onClick={() => setStarted(true)}>
                  Begin test
                </button>
              ) : null}

              <div style={{ height: 10 }} />

              <textarea
                value={essay}
                onChange={(e) => setEssay(e.target.value)}
                placeholder="Write your answer here…"
                disabled={!started || submitBusy}
                style={{ minHeight: 420 }}
              />

              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, marginTop: 10, flexWrap: 'wrap' }}>
                <div className="muted">
                  {started ? 'Exam simulation: no assistance available.' : 'Start the test to enable writing.'}
                </div>
                <button className="btn btnPrimary" onClick={submit} disabled={!started || submitBusy}>
                  {submitBusy ? 'Evaluating…' : 'Submit'}
                </button>
              </div>
            </>
          ) : (
            <>
              <div className="kpiRow">
                <div className="kpi">
                  <div className="k">Word count</div>
                  <div className="v" style={{ color: wordCount < rules.minWords ? 'var(--danger)' : 'var(--ok)' }}>
                    {wordCount}
                  </div>
                  <div className="muted">Min: {rules.minWords}</div>
                </div>
                <div className="kpi">
                  <div className="k">Live issues</div>
                  <div className="v">{grammarMatches.length}</div>
                  <div className="muted">grammar/spelling/style</div>
                </div>
              </div>

              <div style={{ height: 12 }} />

              <PracticeEditor value={essay} onChange={setEssay} onMatchesChange={setGrammarMatches} />

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 12 }}>
                <button className="btn btnPrimary" onClick={submit} disabled={submitBusy}>
                  {submitBusy ? 'Evaluating…' : 'Submit for evaluation'}
                </button>
              </div>
            </>
          )}

          {submitError ? <div className="muted" style={{ color: 'var(--danger)', marginTop: 10 }}>{submitError}</div> : null}
        </div>

        {!testMode ? (
          <div style={{ display: 'grid', gap: 16 }}>
            <TaskRulesCard taskType={config.taskType} />
            <PracticeTools essay={essay} />
            <AssistantChat taskType={config.taskType} prompt={config.prompt} essay={essay} />
          </div>
        ) : null}
      </div>

      {evaluation ? (
        <div style={{ marginTop: 16, display: 'grid', gap: 16 }}>
          <div className="panel">
            <h2>Band scores</h2>
            <div className="kpiRow" style={{ marginTop: 10 }}>
              <div className="kpi">
                <div className="k">Overall</div>
                <div className="v">{evaluation.overall}</div>
              </div>
              <div className="kpi">
                <div className="k">Task</div>
                <div className="v">{evaluation.criteria.task.score}</div>
              </div>
              <div className="kpi">
                <div className="k">Coherence & Cohesion</div>
                <div className="v">{evaluation.criteria.coherence.score}</div>
              </div>
              <div className="kpi">
                <div className="k">Lexical Resource</div>
                <div className="v">{evaluation.criteria.lexical.score}</div>
              </div>
              <div className="kpi">
                <div className="k">Grammar</div>
                <div className="v">{evaluation.criteria.grammar.score}</div>
              </div>
            </div>

            {evaluation.caps.length ? (
              <div className="muted" style={{ marginTop: 10, color: 'var(--danger)' }}>
                <b>Score caps applied:</b>
                <ul>
                  {evaluation.caps.map((c, idx) => (
                    <li key={idx}>
                      {c.reason} (overall capped at {c.maxOverall})
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}

            <hr />
            <div className="muted">
              <b>Examiner-style summaries</b>
              <ul>
                <li><b>Task:</b> {evaluation.criteria.task.summary}</li>
                <li><b>Coherence & Cohesion:</b> {evaluation.criteria.coherence.summary}</li>
                <li><b>Lexical Resource:</b> {evaluation.criteria.lexical.summary}</li>
                <li><b>Grammar:</b> {evaluation.criteria.grammar.summary}</li>
              </ul>
            </div>
          </div>

          <EssayHighlighter text={essay} issues={evaluation.issues} />

          <div className="panel">
            <h2>Detailed feedback (actionable issues)</h2>
            <div style={{ display: 'grid', gap: 10 }}>
              {evaluation.issues.slice(0, 80).map((iss) => (
                <div key={iss.id} className="issue">
                  <div className="issueHead">
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
                      <span className="pill">{iss.criterion}</span>
                      <span className="pill">{iss.category}</span>
                      <span className="pill">{iss.severity}</span>
                      <span className="pill">impact {iss.bandImpact}</span>
                    </div>
                  </div>
                  <div className="muted" style={{ marginTop: 8 }}>
                    <div style={{ fontWeight: 700, color: 'var(--text)' }}>{iss.message}</div>
                    <div style={{ marginTop: 6, whiteSpace: 'pre-wrap' }}><b>Excerpt:</b> {iss.excerpt}</div>
                    <div style={{ marginTop: 6 }}><b>Why it hurts:</b> {iss.explanation}</div>
                    {iss.suggestion ? <div style={{ marginTop: 6 }}><b>Fix:</b> {iss.suggestion}</div> : null}
                    {iss.improvedVersion ? (
                      <div style={{ marginTop: 6 }}>
                        <b>Improved version (local edit):</b>
                        <div style={{ whiteSpace: 'pre-wrap' }}>{iss.improvedVersion}</div>
                        {iss.improvedWhy ? <div style={{ marginTop: 4 }}><b>How it helps:</b> {iss.improvedWhy}</div> : null}
                      </div>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {!testMode ? (
            <div className="panel">
              <h2>Practice-only note</h2>
              <div className="muted">
                Live tools (grammar highlighting, paraphrasing, assistant) are intentionally disabled in Test Mode to simulate real exam conditions.
              </div>
            </div>
          ) : null}
        </div>
      ) : null}
    </>
  );
}
