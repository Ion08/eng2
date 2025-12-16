'use client';

import { useEffect, useMemo, useState } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { markdown } from '@codemirror/lang-markdown';
import type { Diagnostic } from '@codemirror/lint';
import { linter } from '@codemirror/lint';
import type { GrammarMatch } from '@/lib/types';

function matchesToDiagnostics(matches: GrammarMatch[], docLength: number): Diagnostic[] {
  return matches
    .map((m) => {
      const from = Math.max(0, Math.min(m.start, docLength));
      const to = Math.max(from, Math.min(m.end, docLength));
      return {
        from,
        to,
        severity: (m.type === 'spelling' ? 'error' : 'warning') as 'error' | 'warning',
        message:
          m.replacements && m.replacements.length
            ? `${m.message} Suggestions: ${m.replacements.slice(0, 3).join(', ')}`
            : m.message
      };
    })
    .filter((d) => d.to > d.from);
}

function debounce<T extends (...args: any[]) => void>(fn: T, ms: number) {
  let t: ReturnType<typeof setTimeout> | null = null;
  return (...args: Parameters<T>) => {
    if (t) clearTimeout(t);
    t = setTimeout(() => fn(...args), ms);
  };
}

export function PracticeEditor({
  value,
  onChange,
  onMatchesChange
}: {
  value: string;
  onChange: (v: string) => void;
  onMatchesChange: (m: GrammarMatch[]) => void;
}) {
  const [matches, setMatches] = useState<GrammarMatch[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [autocorrect, setAutocorrect] = useState(false);

  const debouncedAnalyze = useMemo(
    () =>
      debounce(async (text: string) => {
        if (text.trim().length < 15) {
          setMatches([]);
          onMatchesChange([]);
          return;
        }
        try {
          setBusy(true);
          setError(null);
          const res = await fetch('/api/analysis/grammar', {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({ text })
          });
          const data = await res.json();
          if (!res.ok) throw new Error(data?.error ?? 'Grammar check failed');
          setMatches(data.matches ?? []);
          onMatchesChange(data.matches ?? []);
        } catch (e) {
          setError(e instanceof Error ? e.message : 'Grammar check failed');
        } finally {
          setBusy(false);
        }
      }, 900),
    [onMatchesChange]
  );

  useEffect(() => {
    debouncedAnalyze(value);
  }, [value, debouncedAnalyze]);

  const extensions = useMemo(() => {
    return [
      markdown(),
      linter((view) => matchesToDiagnostics(matches, view.state.doc.length), {
        delay: 0
      })
    ];
  }, [matches]);

  function applySuggestion(match: GrammarMatch) {
    const replacement = match.replacements?.[0];
    if (!replacement) return;
    const next = value.slice(0, match.start) + replacement + value.slice(match.end);
    onChange(next);
  }

  return (
    <div className="panel">
      <h2>Writing area (practice mode)</h2>

      <CodeMirror
        value={value}
        height="420px"
        theme="dark"
        basicSetup={{
          lineNumbers: true,
          foldGutter: false,
          highlightActiveLine: true
        }}
        extensions={extensions}
        onChange={onChange}
      />

      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, marginTop: 10, flexWrap: 'wrap' }}>
        <div className="muted">
          {busy ? 'Analyzing…' : matches.length ? `${matches.length} issues detected` : 'No issues detected yet'}
          {error ? <span style={{ color: 'var(--danger)' }}> • {error}</span> : null}
        </div>
        <label style={{ display: 'flex', alignItems: 'center', gap: 8, margin: 0 }}>
          <input type="checkbox" checked={autocorrect} onChange={(e) => setAutocorrect(e.target.checked)} />
          Autocorrect suggestions (manual apply)
        </label>
      </div>

      {autocorrect && matches.length ? (
        <div style={{ marginTop: 10 }}>
          <div className="muted" style={{ marginBottom: 6 }}>
            Click to apply a suggestion (best-effort). Always verify meaning.
          </div>
          <div style={{ display: 'grid', gap: 8 }}>
            {matches
              .filter((m) => (m.replacements?.length ?? 0) > 0)
              .slice(0, 12)
              .map((m, idx) => (
                <div key={idx} className="issue">
                  <div className="issueHead">
                    <div>
                      <span className="pill">{m.type}</span> <span className="muted">{m.message}</span>
                    </div>
                    <button className="btn" onClick={() => applySuggestion(m)}>
                      Apply “{m.replacements?.[0]}”
                    </button>
                  </div>
                </div>
              ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
