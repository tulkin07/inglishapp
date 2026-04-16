export type TokenStatus = "correct" | "missing" | "extra";

export interface TokenDiff {
  word: string;
  status: TokenStatus;
}

function normalize(text: string): string {
  return text
    .toLowerCase()
    .replace(/[.,!?;:]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

export function diffSentence(
  expected: string,
  actual: string,
): { expectedTokens: TokenDiff[]; extraTokens: TokenDiff[] } {
  const expectedNorm = normalize(expected);
  const actualNorm = normalize(actual);

  const expectedWords = expectedNorm.split(" ").filter(Boolean);
  const actualWords = actualNorm.split(" ").filter(Boolean);

  const actualSet = new Set(actualWords);

  const expectedTokens: TokenDiff[] = expectedWords.map((w) => ({
    word: w,
    status: actualSet.has(w) ? "correct" : "missing",
  }));

  const expectedSet = new Set(expectedWords);
  const extraTokens: TokenDiff[] = actualWords
    .filter((w) => !expectedSet.has(w))
    .map((w) => ({ word: w, status: "extra" }));

  return { expectedTokens, extraTokens };
}

