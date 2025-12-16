import natural from 'natural';

const { PorterStemmer } = natural;

const STOPWORDS = new Set([
  'the','a','an','and','or','but','if','while','of','to','in','on','for','with','as','by','at','from',
  'this','that','these','those','is','are','was','were','be','been','being','it','its','they','them','their',
  'i','you','he','she','we','us','my','your','our','me','him','her',
  'do','does','did','doing','done','have','has','had','having','will','would','can','could','may','might','must',
  'not','no','yes','also','very','more','most','some','any','many','much','such','than','then','there','here'
]);

function baseTokens(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z\s']/g, ' ')
    .split(/\s+/g)
    .map((t) => t.trim())
    .filter(Boolean)
    .filter((t) => !STOPWORDS.has(t));
}

export function tokenize(text: string): string[] {
  return baseTokens(text).map((t) => PorterStemmer.stem(t));
}

export function tokenizeUnstemmed(text: string): string[] {
  return baseTokens(text);
}

export function topFrequencies(tokens: string[], limit = 12): Array<{ token: string; count: number }> {
  const m = new Map<string, number>();
  for (const t of tokens) m.set(t, (m.get(t) ?? 0) + 1);
  return [...m.entries()]
    .map(([token, count]) => ({ token, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);
}
