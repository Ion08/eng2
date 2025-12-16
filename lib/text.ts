const WORD_RE = /[A-Za-zÀ-ÖØ-öø-ÿ0-9']+/g;

export function countWords(text: string): number {
  const m = text.match(WORD_RE);
  return m ? m.length : 0;
}

export function splitParagraphs(text: string): string[] {
  return text
    .split(/\n\s*\n/g)
    .map((p) => p.trim())
    .filter(Boolean);
}

export function splitSentences(text: string): string[] {
  const cleaned = text.replace(/\s+/g, ' ').trim();
  if (!cleaned) return [];

  // Conservative sentence splitting: punctuation + space + capital letter.
  const parts = cleaned
    .split(/(?<=[.!?])\s+(?=[A-Z])/g)
    .map((s) => s.trim())
    .filter(Boolean);

  return parts.length ? parts : [cleaned];
}

export function clipExcerpt(text: string, start: number, end: number, pad = 28) {
  const s = Math.max(0, start - pad);
  const e = Math.min(text.length, end + pad);
  const prefix = s > 0 ? '…' : '';
  const suffix = e < text.length ? '…' : '';
  return prefix + text.slice(s, e) + suffix;
}
