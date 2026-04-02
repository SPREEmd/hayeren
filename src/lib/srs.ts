import type { CardProgress } from "../types";

const MS_PER_DAY = 86_400_000;

export function createCard(id: string): CardProgress {
  return {
    id,
    easeFactor: 2.5,
    interval: 0,
    repetitions: 0,
    nextReview: Date.now(),
    lapses: 0,
  };
}

/**
 * SM-2 algorithm.
 *
 * quality:
 *   5 — perfect recall
 *   4 — correct after hesitation (maps to "Got it" button)
 *   1 — incorrect (maps to "Again" button)
 */
export function reviewCard(card: CardProgress, quality: 1 | 4 | 5): CardProgress {
  const now = Date.now();

  if (quality < 3) {
    // Failed — reset repetitions, push back 1 day
    return {
      ...card,
      repetitions: 0,
      interval: 1,
      lapses: card.lapses + 1,
      nextReview: now + MS_PER_DAY,
    };
  }

  // Passed — advance interval
  let newInterval: number;
  if (card.repetitions === 0) {
    newInterval = 1;
  } else if (card.repetitions === 1) {
    newInterval = 6;
  } else {
    newInterval = Math.round(card.interval * card.easeFactor);
  }

  // Update ease factor (SM-2 formula, clamped to ≥ 1.3)
  const newEase = Math.max(
    1.3,
    card.easeFactor + 0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02)
  );

  return {
    ...card,
    repetitions: card.repetitions + 1,
    interval: newInterval,
    easeFactor: newEase,
    nextReview: now + newInterval * MS_PER_DAY,
  };
}

/** Returns true if the card is due for review now. */
export function isDue(card: CardProgress): boolean {
  return Date.now() >= card.nextReview;
}

/** Human-readable next-review label. */
export function nextReviewLabel(card: CardProgress): string {
  const diff = card.nextReview - Date.now();
  if (diff <= 0) return "Due now";
  const days = Math.ceil(diff / MS_PER_DAY);
  if (days === 1) return "Due tomorrow";
  return `Due in ${days} days`;
}
