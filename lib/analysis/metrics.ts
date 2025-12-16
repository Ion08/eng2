import { splitParagraphs, splitSentences, countWords } from '@/lib/text';
import { tokenize, tokenizeUnstemmed, topFrequencies } from './tokens';

export const LINKING_WORDS = [
  'however',
  'therefore',
  'moreover',
  'furthermore',
  'in addition',
  'on the other hand',
  'for example',
  'for instance',
  'as a result',
  'consequently',
  'in contrast',
  'in conclusion',
  'overall'
];

const INFORMAL_PATTERNS: Array<{ re: RegExp; label: string }> = [
  { re: /\b(can't|won't|don't|doesn't|didn't|isn't|aren't|wasn't|weren't|it's|that's|there's|I'm|you're|we're)\b/gi, label: 'contractions' },
  { re: /\b(kinda|sorta|gonna|wanna|kids|a lot|lots of|cool|stuff)\b/gi, label: 'informal wording' }
];

export function basicMetrics(text: string) {
  const wordCount = countWords(text);
  const paragraphs = splitParagraphs(text);
  const sentences = splitSentences(text);

  const avgSentenceLength = sentences.length ? wordCount / sentences.length : 0;

  const tokens = tokenize(text);
  const tokensUnstemmed = tokenizeUnstemmed(text);
  const unique = new Set(tokens).size;
  const cttr = tokens.length ? unique / Math.sqrt(2 * tokens.length) : 0;

  const top = topFrequencies(tokensUnstemmed, 12);

  const linkingCount = LINKING_WORDS.reduce((acc, w) => {
    const re = new RegExp(`\\b${w.replace(/\s+/g, '\\s+')}\\b`, 'gi');
    const m = text.match(re);
    return acc + (m ? m.length : 0);
  }, 0);

  const informalHits: Array<{ start: number; end: number; label: string; match: string }> = [];
  for (const p of INFORMAL_PATTERNS) {
    // eslint-disable-next-line no-constant-condition
    while (true) {
      const m = p.re.exec(text);
      if (!m) break;
      informalHits.push({
        start: m.index,
        end: m.index + m[0].length,
        label: p.label,
        match: m[0]
      });
    }
    p.re.lastIndex = 0;
  }

  return {
    wordCount,
    paragraphCount: paragraphs.length,
    sentenceCount: sentences.length,
    avgSentenceLength,
    tokens,
    tokensUnstemmed,
    cttr,
    topTokenFrequencies: top,
    linkingCount,
    informalHits
  };
}
