'use client';

import type { TaskType } from '@/lib/types';
import { TASK_RULES } from '@/lib/rules';

export function TaskRulesCard({ taskType }: { taskType: TaskType }) {
  const r = TASK_RULES[taskType];
  return (
    <div className="panel">
      <h2>Task rules (enforced)</h2>
      <div className="muted">
        <div style={{ fontWeight: 800, color: 'var(--text)', marginBottom: 8 }}>{r.title}</div>
        <ul>
          <li><b>What the task consists of:</b> {r.consistsOf}</li>
          <li><b>What you must do:</b> {r.mustDo.join(' ')}</li>
          <li><b>What you must not do:</b> {r.mustNotDo.join(' ')}</li>
          <li><b>Recommended structure:</b> {r.recommendedStructure}</li>
          <li><b>Minimum word count:</b> {r.minWords}</li>
        </ul>
      </div>
    </div>
  );
}
