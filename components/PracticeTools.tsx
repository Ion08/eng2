'use client';

import { useMemo, useState } from 'react';

const LINKING_CATALOG = [
  { group: 'Contrast', items: ['However,', 'Nevertheless,', 'In contrast,', 'On the other hand,'] },
  { group: 'Result', items: ['Therefore,', 'Consequently,', 'As a result,', 'Thus,'] },
  { group: 'Addition', items: ['Moreover,', 'Furthermore,', 'In addition,', 'Additionally,'] },
  { group: 'Example', items: ['For example,', 'For instance,', 'To illustrate,'] },
  { group: 'Conclusion', items: ['In conclusion,', 'To sum up,', 'Overall,'] }
];

export function PracticeTools({ essay }: { essay: string }) {
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const [output, setOutput] = useState<string | null>(null);
  const [why, setWhy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const repeated = useMemo(() => {
    const words = essay
      .toLowerCase()
      .replace(/[^a-z\s']/g, ' ')
      .split(/\s+/g)
      .filter(Boolean)
      .filter((w) => w.length > 3);

    const stop = new Set(['this', 'that', 'there', 'where', 'when', 'which', 'would', 'could', 'should', 'have', 'has', 'had', 'with', 'from', 'into', 'about', 'also']);

    const m = new Map<string, number>();
    for (const w of words) {
      if (stop.has(w)) continue;
      m.set(w, (m.get(w) ?? 0) + 1);
    }
    return [...m.entries()]
      .filter(([, c]) => c >= 6)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6);
  }, [essay]);

  async function paraphrase() {
    setBusy(true);
    setError(null);
    setOutput(null);
    setWhy(null);
    try {
      const res = await fetch('/api/llm/paraphrase', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ text: input })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error ?? 'Failed to paraphrase');
      setOutput(data.rewrite);
      setWhy(data.why || null);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to paraphrase');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="panel">
      <h2>Practice tools (training only)</h2>

      <div className="muted">
        <b>Vocabulary / repetition watch:</b>
        <div style={{ marginTop: 6 }}>
          {repeated.length === 0 ? (
            <span>No strong repetition signals detected yet.</span>
          ) : (
            <ul>
              {repeated.map(([w, c]) => (
                <li key={w}>
                  “{w}” × {c}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <hr />

      <div>
        <label>Paraphrasing tool (sentence / short paragraph)</label>
        <textarea value={input} onChange={(e) => setInput(e.target.value)} placeholder="Paste a sentence to rewrite in a more academic way…" />
        <div style={{ display: 'flex', gap: 10, marginTop: 10 }}>
          <button className="btn" disabled={busy || input.trim().length < 5} onClick={paraphrase}>
            {busy ? 'Rewriting…' : 'Rewrite'}
          </button>
        </div>
        {error ? <div className="muted" style={{ color: 'var(--danger)', marginTop: 8 }}>{error}</div> : null}
        {output ? (
          <div className="muted" style={{ marginTop: 10 }}>
            <div style={{ fontWeight: 700, color: 'var(--text)' }}>Rewrite</div>
            <div style={{ whiteSpace: 'pre-wrap' }}>{output}</div>
            {why ? (
              <div style={{ marginTop: 6 }}>
                <b>Why this improves the score:</b> {why}
              </div>
            ) : null}
          </div>
        ) : null}
      </div>

      <hr />

      <div className="muted">
        <b>Linking words / cohesion catalog</b>
        <div style={{ marginTop: 8 }}>
          {LINKING_CATALOG.map((g) => (
            <div key={g.group} style={{ marginBottom: 10 }}>
              <div style={{ fontWeight: 700, color: 'var(--text)' }}>{g.group}</div>
              <div>{g.items.join(' ')}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
