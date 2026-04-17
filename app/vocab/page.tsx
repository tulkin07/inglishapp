"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import type { VocabEntry } from "@/types/vocab";
import { fetchWordInfo } from "@/utils/fetch-word-info";
import {
  loadVocab,
  newId,
  saveVocab,
} from "@/utils/vocab-storage";
import {
  buildMeaningQuiz,
  buildTranslationQuiz,
  primaryMeaning,
} from "@/utils/vocab-quiz";

type Tab = "add" | "study" | "test";

export default function VocabPage() {
  const [entries, setEntries] = useState<VocabEntry[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState<Tab>("add");
  const [studyIndex, setStudyIndex] = useState(0);
  const [flip, setFlip] = useState(false);

  const [testMode, setTestMode] = useState<"meaning" | "translation">(
    "meaning",
  );
  const [testIndex, setTestIndex] = useState(0);
  const [testScore, setTestScore] = useState(0);
  const [answered, setAnswered] = useState(false);
  const [picked, setPicked] = useState<number | null>(null);

  useEffect(() => {
    setEntries(loadVocab());
  }, []);

  const studyEntry = entries[studyIndex];

  const quizEntries = useMemo(() => {
    if (testMode === "translation") {
      return entries.filter((e) => e.translationUz);
    }
    return entries;
  }, [entries, testMode]);

  const currentQuiz = useMemo(() => {
    if (quizEntries.length === 0) return null;
    const t = quizEntries[testIndex];
    if (!t) return null;
    if (testMode === "translation") {
      return buildTranslationQuiz(t, entries);
    }
    return buildMeaningQuiz(t, entries);
  }, [entries, quizEntries, testIndex, testMode]);

  const addWords = async () => {
    const lines = input
      .split(/\n/)
      .map((s) => s.trim())
      .filter(Boolean);
    if (lines.length === 0) return;

    setLoading(true);
    try {
      let list = loadVocab();
      for (const line of lines) {
        if (list.some((e) => e.word.toLowerCase() === line.toLowerCase())) {
          continue;
        }
        const info = await fetchWordInfo(line);
        const entry: VocabEntry = {
          id: newId(),
          word: info.word,
          meaningsEn: info.meaningsEn,
          examplesEn: info.examplesEn,
          translationUz: info.translationUz,
          addedAt: new Date().toISOString(),
        };
        list = [...list, entry];
      }
      saveVocab(list);
      setEntries(list);
      setInput("");
    } finally {
      setLoading(false);
    }
  };

  const removeWord = (id: string) => {
    const list = loadVocab().filter((e) => e.id !== id);
    saveVocab(list);
    setEntries(list);
    setStudyIndex((i) => Math.min(i, Math.max(0, list.length - 1)));
  };

  const resetTest = useCallback(() => {
    setTestIndex(0);
    setTestScore(0);
    setAnswered(false);
    setPicked(null);
  }, []);

  useEffect(() => {
    resetTest();
  }, [testMode, entries.length, resetTest]);

  useEffect(() => {
    if (studyIndex >= entries.length && entries.length > 0) {
      setStudyIndex(entries.length - 1);
    }
  }, [entries.length, studyIndex]);

  const onPickOption = (idx: number) => {
    if (answered || !currentQuiz) return;
    setPicked(idx);
    setAnswered(true);
    if (idx === currentQuiz.correctIndex) {
      setTestScore((s) => s + 1);
    }
  };

  const nextQuestion = () => {
    if (testIndex >= quizEntries.length - 1) return;
    setTestIndex((i) => i + 1);
    setAnswered(false);
    setPicked(null);
  };

  return (
    <div className="flex flex-1 flex-col gap-5 py-2">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
            Vocabulary
          </p>
          <h2 className="text-xl font-semibold">Mening so&apos;zlarim</h2>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
            So&apos;zlarni kiriting — tizim ma&apos;no, misol va o&apos;zbekcha
            tarjima olib keladi. Keyin tez yodlash va 10 ta variantli test.
          </p>
        </div>
        <Link
          href="/"
          className="text-sm font-medium text-emerald-600 hover:text-emerald-500 dark:text-emerald-400"
        >
          ← Bosh sahifa
        </Link>
      </div>

      <div className="flex flex-wrap gap-2">
        {(
          [
            ["add", "So'z qo'shish"],
            ["study", "Tez yodlash"],
            ["test", "Test (10 variant)"],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            onClick={() => setTab(id)}
            className={`rounded-full px-4 py-2 text-xs font-semibold transition ${
              tab === id
                ? "bg-emerald-500 text-emerald-950"
                : "border border-slate-300 bg-background text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === "add" && (
        <section className="space-y-3 rounded-2xl border border-slate-200 bg-background p-4 dark:border-slate-800">
          <label className="block text-sm font-medium text-slate-800 dark:text-slate-200">
            Har qatorda bitta so&apos;z (masalan, ertalab 20 ta)
          </label>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            rows={8}
            placeholder={"hello\npractice\nconfidence\n..."}
            className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
          />
          <button
            type="button"
            disabled={loading || !input.trim()}
            onClick={addWords}
            className="inline-flex h-11 items-center justify-center rounded-full bg-emerald-500 px-6 text-sm font-semibold text-emerald-950 disabled:opacity-50"
          >
            {loading
              ? "Ma'lumot yuklanmoqda..."
              : "Lug'atdan olish va saqlash"}
          </button>
          <p className="text-xs text-slate-500">
            Internet orqali inglizcha ma&apos;no va o&apos;zbekcha tarjima
            olinadi (bepul API). Bir xil so&apos;z ikki marta qo&apos;shilmaydi.
          </p>

          {entries.length > 0 && (
            <div className="mt-4 border-t border-slate-200 pt-4 dark:border-slate-800">
              <h3 className="text-sm font-semibold">
                Saqlangan: {entries.length} ta
              </h3>
              <ul className="mt-2 max-h-48 space-y-1 overflow-y-auto text-sm">
                {entries.map((e) => (
                  <li
                    key={e.id}
                    className="flex items-center justify-between gap-2 rounded-lg bg-slate-50 px-2 py-1 dark:bg-slate-900/80"
                  >
                    <span>
                      <strong>{e.word}</strong>
                      {e.translationUz && (
                        <span className="text-slate-600 dark:text-slate-400">
                          {" "}
                          — {e.translationUz}
                        </span>
                      )}
                    </span>
                    <button
                      type="button"
                      onClick={() => removeWord(e.id)}
                      className="text-xs text-rose-600 hover:underline"
                    >
                      O'chirish
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </section>
      )}

      {tab === "study" && (
        <section className="rounded-2xl border border-slate-200 bg-background p-4 dark:border-slate-800">
          {entries.length === 0 ? (
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Avval &quot;So&apos;z qo&apos;shish&quot; bo&apos;limida so&apos;z
              kiriting.
            </p>
          ) : (
            <>
              <div className="mb-3 flex items-center justify-between gap-2">
                <span className="text-xs text-slate-500">
                  {studyIndex + 1} / {entries.length}
                </span>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setStudyIndex((i) => Math.max(0, i - 1));
                      setFlip(false);
                    }}
                    className="rounded-full border border-slate-300 px-3 py-1 text-xs dark:border-slate-600"
                  >
                    Oldingi
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setStudyIndex((i) =>
                        Math.min(entries.length - 1, i + 1),
                      );
                      setFlip(false);
                    }}
                    className="rounded-full border border-slate-300 px-3 py-1 text-xs dark:border-slate-600"
                  >
                    Keyingi
                  </button>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setFlip(!flip)}
                className="w-full rounded-2xl border-2 border-dashed border-emerald-500/50 bg-emerald-500/5 p-8 text-center transition hover:bg-emerald-500/10"
              >
                {!flip ? (
                  <div>
                    <p className="text-xs uppercase tracking-widest text-emerald-700 dark:text-emerald-400">
                      So&apos;z
                    </p>
                    <p className="mt-2 text-3xl font-bold text-slate-900 dark:text-white">
                      {studyEntry?.word}
                    </p>
                    <p className="mt-4 text-xs text-slate-500">
                      Bosib — tarjima va misollarni ko&apos;ring
                    </p>
                  </div>
                ) : (
                  <div className="text-left text-sm">
                    {studyEntry?.translationUz && (
                      <p className="mb-2">
                        <span className="font-semibold text-emerald-700 dark:text-emerald-400">
                          O&apos;zbekcha:{" "}
                        </span>
                        {studyEntry.translationUz}
                      </p>
                    )}
                    {studyEntry?.meaningsEn.map((m, i) => (
                      <p key={i} className="mb-1 text-slate-700 dark:text-slate-300">
                        <span className="text-slate-500">{i + 1}. </span>
                        {m}
                      </p>
                    ))}
                    {studyEntry?.examplesEn.length ? (
                      <div className="mt-3 border-t border-slate-200 pt-3 dark:border-slate-700">
                        <p className="text-xs font-semibold text-slate-500">
                          Misollar
                        </p>
                        {studyEntry.examplesEn.map((ex, i) => (
                          <p
                            key={i}
                            className="mt-1 italic text-slate-600 dark:text-slate-400"
                          >
                            &quot;{ex}&quot;
                          </p>
                        ))}
                      </div>
                    ) : null}
                  </div>
                )}
              </button>
            </>
          )}
        </section>
      )}

      {tab === "test" && (
        <section className="space-y-4 rounded-2xl border border-slate-200 bg-background p-4 dark:border-slate-800">
          {entries.length === 0 ? (
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Avval so&apos;z qo&apos;shing.
            </p>
          ) : (
            <>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setTestMode("meaning")}
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${
                    testMode === "meaning"
                      ? "bg-sky-500 text-white"
                      : "border border-slate-300 dark:border-slate-600"
                  }`}
                >
                  To&apos;g&apos;ri ma&apos;noni tanlang (EN)
                </button>
                <button
                  type="button"
                  onClick={() => setTestMode("translation")}
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${
                    testMode === "translation"
                      ? "bg-sky-500 text-white"
                      : "border border-slate-300 dark:border-slate-600"
                  }`}
                >
                  To&apos;g&apos;ri tarjimani tanlang (UZ)
                </button>
              </div>

              {testMode === "translation" && quizEntries.length === 0 && (
                <p className="text-sm text-amber-700 dark:text-amber-400">
                  Hech bir so&apos;zda o&apos;zbekcha tarjima yo&apos;q. So&apos;z
                  qo&apos;shganingizda internet orqali tarjima kelishi kerak; yoki
                  ma&apos;no testidan foydalaning.
                </p>
              )}

              {currentQuiz && quizEntries[testIndex] && (
                <>
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span>
                      Savol {testIndex + 1} / {quizEntries.length}
                    </span>
                    <span>Ball: {testScore}</span>
                  </div>
                  <p className="text-lg font-semibold text-slate-900 dark:text-white">
                    {testMode === "meaning"
                      ? `"${quizEntries[testIndex].word}" — qaysi ma'no to'g'ri?`
                      : `"${quizEntries[testIndex].word}" — qaysi tarjima to'g'ri?`}
                  </p>
                  <div className="grid gap-2 sm:grid-cols-2">
                    {currentQuiz.options.map((opt, idx) => {
                      const isCorrect = idx === currentQuiz.correctIndex;
                      const wrongPick =
                        answered && picked === idx && idx !== currentQuiz.correctIndex;
                      return (
                        <button
                          key={`${idx}-${opt.slice(0, 20)}`}
                          type="button"
                          disabled={answered}
                          onClick={() => onPickOption(idx)}
                          className={`rounded-xl border px-3 py-3 text-left text-sm transition ${
                            answered && isCorrect
                              ? "border-emerald-500 bg-emerald-500/15"
                              : wrongPick
                                ? "border-rose-500 bg-rose-500/10"
                                : "border-slate-200 hover:border-emerald-400 dark:border-slate-700"
                          }`}
                        >
                          <span className="mr-2 font-mono text-xs text-slate-400">
                            {idx + 1}.
                          </span>
                          {opt}
                        </button>
                      );
                    })}
                  </div>
                  {answered && (
                    <div className="rounded-xl bg-slate-50 p-3 text-sm dark:bg-slate-900/80">
                      <p>
                        {picked === currentQuiz.correctIndex ? (
                          <span className="text-emerald-600 dark:text-emerald-400">
                            To&apos;g&apos;ri!
                          </span>
                        ) : (
                          <span className="text-rose-600">
                            Xato. To&apos;g&apos;ri javob:{" "}
                            <strong>
                              {currentQuiz.options[currentQuiz.correctIndex]}
                            </strong>
                          </span>
                        )}
                      </p>
                      {testMode === "meaning" && (
                        <p className="mt-1 text-slate-600 dark:text-slate-400">
                          Asosiy ma&apos;no:{" "}
                          {primaryMeaning(quizEntries[testIndex])}
                        </p>
                      )}
                    </div>
                  )}
                  <div className="flex gap-2">
                    {testIndex < quizEntries.length - 1 ? (
                      <button
                        type="button"
                        disabled={!answered}
                        onClick={nextQuestion}
                        className="rounded-full bg-emerald-500 px-5 py-2 text-sm font-semibold text-emerald-950 disabled:opacity-40"
                      >
                        Keyingi savol
                      </button>
                    ) : (
                      answered && (
                        <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                          Test tugadi! Natija: {testScore} / {quizEntries.length}
                        </p>
                      )
                    )}
                    <button
                      type="button"
                      onClick={resetTest}
                      className="rounded-full border border-slate-300 px-4 py-2 text-sm dark:border-slate-600"
                    >
                      Qayta boshlash
                    </button>
                  </div>
                </>
              )}

            </>
          )}
        </section>
      )}
    </div>
  );
}
