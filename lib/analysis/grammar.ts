import type { GrammarMatch } from '@/lib/types';
import { createRequire } from 'module';
import { getEnglishDictionary } from './spell';

const require = createRequire(import.meta.url);
const writeGood = require('write-good') as (text: string) => Array<{ index: number; offset: number; reason: string }>;

function normalizeLanguageToolUrl(base: string) {
  if (!base) return base;
  return base.endsWith('/') ? base.slice(0, -1) : base;
}

export async function analyzeGrammar(text: string): Promise<GrammarMatch[]> {
  const lt = process.env.LANGUAGETOOL_URL;
  if (lt) {
    const url = normalizeLanguageToolUrl(lt) + '/v2/check';
    const body = new URLSearchParams();
    body.set('text', text);
    body.set('language', 'en-US');

    const res = await fetch(url, {
      method: 'POST',
      headers: { 'content-type': 'application/x-www-form-urlencoded' },
      body
    });

    if (!res.ok) {
      throw new Error(`LanguageTool request failed (${res.status})`);
    }

    const data = (await res.json()) as {
      matches: Array<{
        offset: number;
        length: number;
        message: string;
        shortMessage?: string;
        rule?: { id?: string; issueType?: string };
        replacements?: Array<{ value: string }>;
      }>;
    };

    return data.matches.map((m) => ({
      start: m.offset,
      end: m.offset + m.length,
      message: m.message,
      shortMessage: m.shortMessage,
      replacements: (m.replacements ?? []).map((r) => r.value).slice(0, 5),
      ruleId: m.rule?.id,
      type: m.rule?.issueType === 'misspelling' ? 'spelling' : 'grammar'
    }));
  }

  // Local fallback: spelling + lightweight style/clarity issues.
  const matches: GrammarMatch[] = [];

  const dict = await getEnglishDictionary();
  if (dict) {
    const wordRe = /[A-Za-z']+/g;
    let m: RegExpExecArray | null;
    // eslint-disable-next-line no-cond-assign
    while ((m = wordRe.exec(text))) {
      const w = m[0];
      if (w.length <= 2) continue;
      // Ignore proper nouns in Title Case (best-effort).
      if (w[0] === w[0].toUpperCase() && w.slice(1) === w.slice(1).toLowerCase()) {
        continue;
      }
      if (!dict.spellCheck(w)) {
        matches.push({
          start: m.index,
          end: m.index + w.length,
          message: 'Possible spelling mistake.',
          replacements: dict.getSuggestions(w, 4),
          type: 'spelling'
        });
      }
    }
  }

  const wg = writeGood(text);
  for (const issue of wg) {
    matches.push({
      start: issue.index,
      end: issue.index + issue.offset,
      message: issue.reason,
      type: 'style'
    });
  }

  return matches.sort((a, b) => a.start - b.start);
}
