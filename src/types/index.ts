export interface Letter {
  armenian: string;
  lowercase: string;
  romanization: string;
  ipa: string;
  soundDescription: string;
  exampleWord: {
    armenian: string;
    english: string;
    romanization: string;
  };
  emoji: string;
  category: "stop" | "fricative" | "nasal" | "liquid" | "vowel" | "affricate";
}

export interface Word {
  id: string;
  armenian: string;
  romanization: string;
  english: string;
  category: VocabCategory;
  difficulty: 1 | 2 | 3;
  exampleSentence?: {
    armenian: string;
    english: string;
  };
}

export type VocabCategory =
  | "greetings"
  | "numbers"
  | "colors"
  | "family"
  | "food"
  | "body"
  | "verbs"
  | "adjectives"
  | "places"
  | "time";

export interface CardProgress {
  id: string;
  easeFactor: number;
  interval: number;
  repetitions: number;
  nextReview: number;
  lapses: number;
}
