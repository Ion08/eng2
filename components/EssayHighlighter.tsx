'use client';

import type { TextIssue } from '@/lib/types';

function escapeHtml(s: string) {
  return s
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

export function EssayHighlighter({ text, issues }: { text: string; issues: TextIssue[] }) {
  const sorted = [...issues]
    .filter((i) => i.end > i.start)
    .sort((a, b) => a.start - b.start)
    .slice(0, 60);

  // Simple overlap handling: keep earliest segment; skip segments that overlap previously added ranges.
  const ranges: Array<{ start: number; end: number }> = [];
  for (const i of sorted) {
    const last = ranges[ranges.length - 1];
    if (last && i.start < last.end) continue;
    ranges.push({ start: i.start, end: i.end });
  }

  let html = '';
  let cursor = 0;
  for (const r of ranges) {
    html += escapeHtml(text.slice(cursor, r.start));
    html += `<span class="highlight">${escapeHtml(text.slice(r.start, r.end))}</span>`;
    cursor = r.end;
  }
  html += escapeHtml(text.slice(cursor));

  return (
    <div className="panel">
      <h2>Essay with highlighted issues</h2>
      <div
        className="muted"
        style={{ whiteSpace: 'pre-wrap', lineHeight: 1.7 }}
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </div>
  );
}
