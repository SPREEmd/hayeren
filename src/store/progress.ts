import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { CardProgress } from "../types";
import { createCard, reviewCard, isDue } from "../lib/srs";

interface ProgressState {
  cards: Record<string, CardProgress>;
  studiedDates: string[]; // ISO date strings e.g. "2026-04-01"
  masteredLetters: Record<string, boolean>; // Armenian char → true once answered correctly in quiz

  // Actions
  reviewWord: (id: string, quality: 1 | 4 | 5) => void;
  getCard: (id: string) => CardProgress;
  dueCount: () => number;
  learnedCount: () => number;
  masteredLetterCount: () => number;
  recordLetterCorrect: (armenian: string) => void;
  resetProgress: () => void;
}

function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

export const useProgressStore = create<ProgressState>()(
  persist(
    (set, get) => ({
      cards: {},
      studiedDates: [],
      masteredLetters: {},

      getCard(id) {
        return get().cards[id] ?? createCard(id);
      },

      reviewWord(id, quality) {
        const existing = get().cards[id] ?? createCard(id);
        const updated = reviewCard(existing, quality);
        const today = todayISO();
        set((state) => ({
          cards: { ...state.cards, [id]: updated },
          studiedDates: state.studiedDates.includes(today)
            ? state.studiedDates
            : [...state.studiedDates, today],
        }));
      },

      dueCount() {
        return Object.values(get().cards).filter(isDue).length;
      },

      learnedCount() {
        return Object.values(get().cards).filter((c) => c.repetitions > 0).length;
      },

      masteredLetterCount() {
        return Object.keys(get().masteredLetters).length;
      },

      recordLetterCorrect(armenian) {
        if (get().masteredLetters[armenian]) return; // already recorded
        const today = todayISO();
        set((state) => ({
          masteredLetters: { ...state.masteredLetters, [armenian]: true },
          studiedDates: state.studiedDates.includes(today)
            ? state.studiedDates
            : [...state.studiedDates, today],
        }));
      },

      resetProgress() {
        set({ cards: {}, studiedDates: [], masteredLetters: {} });
      },
    }),
    { name: "hayeren-progress" }
  )
);

/**
 * Streak = consecutive days studied, ending today or yesterday.
 * Allowing yesterday means the streak stays alive until end-of-day
 * even if the user hasn't studied yet today.
 */
export function calcStreak(studiedDates: string[]): number {
  if (studiedDates.length === 0) return 0;
  const sorted = [...studiedDates].sort().reverse();

  const today = todayISO();
  const yesterday = new Date(Date.now() - 86_400_000).toISOString().slice(0, 10);

  // Streak is broken if the most recent study day is older than yesterday
  if (sorted[0] !== today && sorted[0] !== yesterday) return 0;

  let streak = 0;
  let cursor = new Date(sorted[0]); // walk back from most-recent studied day
  for (const d of sorted) {
    const date = new Date(d);
    const diffDays = Math.round((cursor.getTime() - date.getTime()) / 86_400_000);
    if (diffDays === 0) {
      streak++;
      cursor = new Date(date.getTime() - 86_400_000);
    } else {
      break;
    }
  }
  return streak;
}
