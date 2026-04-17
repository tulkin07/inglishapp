/**
 * Fetches English definitions/examples (dictionaryapi.dev) and Uzbek translation (MyMemory public API).
 */

export interface FetchedWordInfo {
  word: string;
  meaningsEn: string[];
  examplesEn: string[];
  translationUz: string | null;
}

interface DictApiEntry {
  meanings?: Array<{
    definitions?: Array<{ definition?: string; example?: string }>;
  }>;
}

export async function fetchWordInfo(word: string): Promise<FetchedWordInfo> {
  const clean = word.trim();
  const meaningsEn: string[] = [];
  const examplesEn: string[] = [];

  try {
    const res = await fetch(
      `https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(clean)}`,
    );
    if (res.ok) {
      const data = (await res.json()) as DictApiEntry[];
      for (const entry of data) {
        for (const m of entry.meanings ?? []) {
          for (const d of m.definitions ?? []) {
            if (d.definition && !meaningsEn.includes(d.definition)) {
              meaningsEn.push(d.definition);
            }
            if (d.example && !examplesEn.includes(d.example)) {
              examplesEn.push(d.example);
            }
            if (meaningsEn.length >= 8) break;
          }
        }
      }
    }
  } catch {
    /* offline / blocked */
  }

  let translationUz: string | null = null;
  try {
    const tr = await fetch(
      `https://api.mymemory.translated.net/get?q=${encodeURIComponent(clean)}&langpair=en|uz`,
    );
    if (tr.ok) {
      const j = (await tr.json()) as {
        responseData?: { translatedText?: string };
      };
      const t = j.responseData?.translatedText?.trim();
      if (t && !/^ERROR/i.test(t)) translationUz = t;
    }
  } catch {
    /* ignore */
  }

  return {
    word: clean,
    meaningsEn: meaningsEn.slice(0, 6),
    examplesEn: examplesEn.slice(0, 4),
    translationUz,
  };
}
