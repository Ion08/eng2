'use client';

import { useMemo, useState } from 'react';
import type { TaskType } from '@/lib/types';

type ChatMsg = { role: 'user' | 'assistant'; content: string };

export function AssistantChat({ taskType, prompt, essay }: { taskType: TaskType; prompt: string; essay: string }) {
  const [messages, setMessages] = useState<ChatMsg[]>([
    {
      role: 'assistant',
      content:
        'Ask me about your draft (errors, academic alternatives, cohesion, task response). I will respond in IELTS examiner terms.'
    }
  ]);
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const lastEssay = useMemo(() => essay.slice(-3000), [essay]);

  async function send() {
    const q = input.trim();
    if (!q) return;

    setError(null);
    setBusy(true);
    setMessages((m) => [...m, { role: 'user', content: q }]);
    setInput('');

    try {
      const res = await fetch('/api/llm/chat', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ taskType, prompt, essay: lastEssay, userMessage: q })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error ?? 'Assistant failed');
      setMessages((m) => [...m, { role: 'assistant', content: data.reply }]);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Assistant failed');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="panel">
      <h2>Live AI assistant (practice only)</h2>
      <div style={{ maxHeight: 280, overflow: 'auto', paddingRight: 6 }}>
        {messages.map((m, i) => (
          <div
            key={i}
            className="muted"
            style={{
              marginBottom: 10,
              whiteSpace: 'pre-wrap',
              borderLeft: `3px solid ${m.role === 'user' ? 'rgba(122,162,255,0.6)' : 'rgba(255,255,255,0.15)'}`,
              paddingLeft: 10
            }}
          >
            <b style={{ color: 'var(--text)' }}>{m.role === 'user' ? 'You' : 'Assistant'}:</b> {m.content}
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', gap: 10, marginTop: 10 }}>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask a specific question (e.g., ‘Is my thesis clear?’)…"
        />
        <button className="btn" disabled={busy || input.trim().length === 0} onClick={send}>
          {busy ? '…' : 'Send'}
        </button>
      </div>

      {error ? <div className="muted" style={{ color: 'var(--danger)', marginTop: 8 }}>{error}</div> : null}
      <div className="muted" style={{ marginTop: 10 }}>
        Note: This assistant uses a local open-source model via Ollama, not a paid API.
      </div>
    </div>
  );
}
