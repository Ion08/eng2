import { tokenize } from './tokens';

function cosine(a: Map<string, number>, b: Map<string, number>): number {
  let dot = 0;
  let a2 = 0;
  let b2 = 0;

  for (const v of a.values()) a2 += v * v;
  for (const v of b.values()) b2 += v * v;

  for (const [k, va] of a.entries()) {
    const vb = b.get(k) ?? 0;
    dot += va * vb;
  }

  if (a2 === 0 || b2 === 0) return 0;
  return dot / (Math.sqrt(a2) * Math.sqrt(b2));
}

function tf(tokens: string[]): Map<string, number> {
  const m = new Map<string, number>();
  for (const t of tokens) m.set(t, (m.get(t) ?? 0) + 1);
  return m;
}

export function promptEssaySimilarity(prompt: string, essay: string): number {
  const p = tokenize(prompt);
  const e = tokenize(essay);
  return cosine(tf(p), tf(e));
}
