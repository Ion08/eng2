import { createRequire } from 'module';

export type SpellDictionary = {
  spellCheck: (word: string) => boolean;
  getSuggestions: (word: string, limit?: number) => string[];
};

let dictPromise: Promise<SpellDictionary | null> | null = null;

export async function getEnglishDictionary(): Promise<SpellDictionary | null> {
  if (dictPromise) return dictPromise;

  dictPromise = new Promise((resolve) => {
    try {
      const require = createRequire(import.meta.url);
      const SpellChecker = require('simple-spellchecker');
      const dictionary = require('dictionary-en-us');

      SpellChecker.getDictionary(
        'en-US',
        dictionary,
        (err: unknown, dict: SpellDictionary) => {
          if (err) resolve(null);
          else resolve(dict);
        }
      );
    } catch {
      resolve(null);
    }
  });

  return dictPromise;
}
