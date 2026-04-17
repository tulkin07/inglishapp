import type { VocabEntry } from "@/types/vocab";

const DISTRACTORS = [
  "A large vehicle used for transporting goods by road.",
  "The feeling of wanting to know more about something.",
  "To move quickly on foot for exercise or sport.",
  "A sweet food made from cocoa and sugar.",
  "The time of day when the sun first appears.",
  "A building where people go to borrow books.",
  "To make something new or invent something.",
  "The season between summer and winter.",
  "A person who teaches students at a school.",
  "To speak quietly so others cannot hear easily.",
  "A round object thrown or kicked in sports.",
  "The liquid that falls from clouds as rain.",
  "A small insect that can fly and sting.",
  "To cut food into small pieces with a knife.",
  "The front part of the head with eyes and nose.",
];

function shuffle<T>(items: T[]): T[] {
  const a = [...items];
  for (let i = a.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function uniqueShort(text: string, max = 120): string {
  const t = text.trim();
  return t.length > max ? `${t.slice(0, max)}…` : t;
}

export function primaryMeaning(entry: VocabEntry): string {
  if (entry.meaningsEn[0]) return uniqueShort(entry.meaningsEn[0]);
  if (entry.translationUz) return uniqueShort(entry.translationUz);
  return entry.word;
}

/**
 * Exactly 10 options: correct meaning + 9 unique distractors.
 */
export function buildMeaningQuiz(
  target: VocabEntry,
  all: VocabEntry[],
): { options: string[]; correctIndex: number } {
  const correct = primaryMeaning(target);
  const used = new Set<string>([correct.toLowerCase()]);

  const candidates: string[] = [];
  for (const w of all) {
    if (w.id === target.id) continue;
    const m = w.meaningsEn[0] ?? w.translationUz;
    if (!m) continue;
    const s = uniqueShort(m);
    const low = s.toLowerCase();
    if (used.has(low)) continue;
    used.add(low);
    candidates.push(s);
  }

  shuffle(candidates);
  const nineWrongs: string[] = [];
  for (const c of candidates) {
    nineWrongs.push(c);
    if (nineWrongs.length === 9) break;
  }

  let dIdx = 0;
  while (nineWrongs.length < 9) {
    const d = uniqueShort(DISTRACTORS[dIdx % DISTRACTORS.length]);
    dIdx += 1;
    const low = d.toLowerCase();
    if (used.has(low)) continue;
    used.add(low);
    nineWrongs.push(d);
  }

  const options = shuffle([correct, ...nineWrongs]);
  const correctIndex = options.findIndex(
    (o) => o.toLowerCase() === correct.toLowerCase(),
  );

  return { options, correctIndex };
}

/** Quiz: pick correct Uzbek translation for the English word (10 options). */
export function buildTranslationQuiz(
  target: VocabEntry,
  all: VocabEntry[],
): { options: string[]; correctIndex: number } | null {
  const correct = target.translationUz?.trim();
  if (!correct) return null;

  const used = new Set<string>([correct.toLowerCase()]);
  const candidates: string[] = [];

  for (const w of all) {
    if (w.id === target.id) continue;
    const t = w.translationUz?.trim();
    if (!t) continue;
    const low = t.toLowerCase();
    if (used.has(low)) continue;
    used.add(low);
    candidates.push(uniqueShort(t, 80));
  }

  shuffle(candidates);
  const nineWrongs: string[] = [];
  for (const c of candidates) {
    nineWrongs.push(c);
    if (nineWrongs.length === 9) break;
  }

  const uzDistractors = [
    "kitob",
    "daraxt",
    "osmon",
    "suv",
    "osh",
    "maktab",
    "doʻst",
    "vaqt",
    "yulduz",
    "hayot",
    "ish",
    "uy",
    "yoʻl",
    "bolalar",
    "ona",
  ];

  let z = 0;
  while (nineWrongs.length < 9) {
    const d = uzDistractors[z % uzDistractors.length];
    z += 1;
    const low = d.toLowerCase();
    if (used.has(low)) continue;
    used.add(low);
    nineWrongs.push(d);
  }

  const options = shuffle([uniqueShort(correct, 80), ...nineWrongs]);
  const correctIndex = options.findIndex(
    (o) => o.toLowerCase() === correct.toLowerCase(),
  );

  return { options, correctIndex };
}
