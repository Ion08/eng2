'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { TaskConfig, TaskType, WritingMode } from '@/lib/types';
import { TASK_RULES } from '@/lib/rules';

type QuestionSource = 'manual' | 'ai';

export default function HomePage() {
  const router = useRouter();

  const [taskType, setTaskType] = useState<TaskType>('task2');
  const [mode, setMode] = useState<WritingMode>('practice');
  const [source, setSource] = useState<QuestionSource>('manual');
  const [prompt, setPrompt] = useState('');
  const [aiBusy, setAiBusy] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

  const rules = useMemo(() => TASK_RULES[taskType], [taskType]);

  async function generatePrompt() {
    setAiError(null);
    setAiBusy(true);
    try {
      const res = await fetch('/api/llm/generate-question', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ taskType })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error ?? 'Failed to generate question');
      setPrompt(data.prompt);
    } catch (e) {
      setAiError(e instanceof Error ? e.message : 'Failed to generate question');
    } finally {
      setAiBusy(false);
    }
  }

  function start() {
    const config: TaskConfig = {
      taskType,
      mode,
      prompt: prompt.trim(),
      createdAt: Date.now()
    };
    sessionStorage.setItem('ielts_config', JSON.stringify(config));
    router.push('/write');
  }

  const canStart = prompt.trim().length > 10;

  return (
    <>
      <div className="header">
        <h1 className="h1">IELTS Writing Training & Exam Simulation</h1>
        <span className="badge">No paid APIs • Local-first</span>
      </div>

      <div className="grid">
        <div className="panel">
          <h2>Step 1 — Task configuration</h2>

          <div className="row">
            <div>
              <label>IELTS Writing Task</label>
              <select value={taskType} onChange={(e) => setTaskType(e.target.value as TaskType)}>
                <option value="task1">Task 1</option>
                <option value="task2">Task 2</option>
              </select>
            </div>

            <div>
              <label>Writing mode</label>
              <select value={mode} onChange={(e) => setMode(e.target.value as WritingMode)}>
                <option value="practice">Practice mode (training)</option>
                <option value="test">Test mode (exam simulation)</option>
              </select>
            </div>
          </div>

          <div style={{ height: 12 }} />

          <div className="row">
            <div>
              <label>Question source</label>
              <select value={source} onChange={(e) => setSource(e.target.value as QuestionSource)}>
                <option value="manual">I will enter my own IELTS question</option>
                <option value="ai">AI generates an official-style IELTS question</option>
              </select>
            </div>
            <div style={{ display: 'flex', alignItems: 'end', gap: 10 }}>
              {source === 'ai' ? (
                <button className="btn" onClick={generatePrompt} disabled={aiBusy}>
                  {aiBusy ? 'Generating…' : 'Generate question'}
                </button>
              ) : null}
              <button className="btn btnPrimary" onClick={start} disabled={!canStart}>
                Start writing
              </button>
            </div>
          </div>

          <div style={{ height: 12 }} />

          <div>
            <label>IELTS question prompt</label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder={source === 'ai' ? 'Generate a prompt (or paste your own)…' : 'Paste your IELTS question…'}
            />
            {aiError ? <div className="muted" style={{ color: 'var(--danger)', marginTop: 8 }}>{aiError}</div> : null}
            <div className="muted" style={{ marginTop: 8 }}>
              Minimum word count: <b>{rules.minWords}</b> • Test timer: <b>{rules.timerMinutes} min</b>
            </div>
          </div>
        </div>

        <div className="panel">
          <h2>Step 2 — Rules that will be enforced</h2>
          <div className="muted">
            <div style={{ fontWeight: 700, color: 'var(--text)' }}>{rules.title}</div>
            <ul>
              <li><b>What it consists of:</b> {rules.consistsOf}</li>
              <li><b>You must do:</b> {rules.mustDo.join(' ')}</li>
              <li><b>You must not do:</b> {rules.mustNotDo.join(' ')}</li>
              <li><b>Recommended structure:</b> {rules.recommendedStructure}</li>
              <li><b>Minimum word count:</b> {rules.minWords}</li>
            </ul>
          </div>
        </div>
      </div>

      <div style={{ marginTop: 14 }} className="muted">
        The evaluation engine is deterministic and explainable. AI is used only for optional training tools (question generation, paraphrasing, assistant) via open-source local models.
      </div>
    </>
  );
}
