export interface VocabEntry {
  id: string;
  word: string;
  /** Short English definitions (from dictionary) */
  meaningsEn: string[];
  /** Example sentences */
  examplesEn: string[];
  /** Uzbek translation when available */
  translationUz: string | null;
  addedAt: string;
}
