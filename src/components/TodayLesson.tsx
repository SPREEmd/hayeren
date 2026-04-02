import { useState } from "react";
import { useProgressStore } from "../store/progress";
import { vocabulary } from "../data/vocabulary";
import { callClaude } from "../lib/claude";
import type { CardProgress, Word } from "../types";

// ── Types ──────────────────────────────────────────────────────────────────

interface LessonQuestion {
  type: "multiple_choice" | "fill_blank" | "translate";
  prompt: string;
  armenian?: string;
  options: string[];
  answer: string;
  explanation: string;
}

// ── Helpers ────────────────────────────────────────────────────────────────

function getStruggledWords(cards: Record<string, CardProgress>): Word[] {
  return vocabulary
    .map((w) => ({ word: w, lapses: cards[w.id]?.lapses ?? 0 }))
    .filter((x) => x.lapses > 0)
    .sort((a, b) => b.lapses - a.lapses)
    .slice(0, 5)
    .map((x) => x.word);
}

// First 5 easy words — used when user hasn't gotten anything wrong yet
const BEGINNER_DEFAULTS: Word[] = vocabulary.filter((w) => w.difficulty === 1).slice(0, 5);

function buildWordList(words: Word[]): string {
  return words.map((w) => `${w.armenian} (${w.english})`).join(", ");
}

function parseLesson(raw: string): LessonQuestion[] {
  const cleaned = raw.replace(/```json\n?|\n?```/g, "").trim();
  const arr = JSON.parse(cleaned);
  if (!Array.isArray(arr)) throw new Error("Expected array");
  return arr
    .filter(
      (q) =>
        q.type && q.prompt && Array.isArray(q.options) && q.options.length >= 2 && q.answer
    )
    .slice(0, 5)
    .map((q) => ({
      type: q.type as LessonQuestion["type"],
      prompt: String(q.prompt),
      armenian: q.armenian ? String(q.armenian) : undefined,
      options: (q.options as unknown[]).map(String),
      answer: String(q.answer),
      explanation: String(q.explanation ?? ""),
    }));
}

// Encouragement messages — ordered highest score first so .find() works correctly
const ENCOURAGEMENT = [
  { min: 5, headline: "Կատարյալ! (Perfect!)", sub: "You nailed every question! 🌟" },
  { min: 4, headline: "Շատ լավ! (Very good!)", sub: "Almost flawless — great job! 💪" },
  { min: 3, headline: "Լավ է! (Good!)", sub: "Solid effort! Keep practicing. 👏" },
  { min: 0, headline: "Շնորհակալություն! (Thank you!)", sub: "Every attempt makes you stronger. 🤗" },
] as const;

type LessonState = "idle" | "loading" | "active" | "done";

// ── TodayLesson ────────────────────────────────────────────────────────────

export default function TodayLesson() {
  const cards = useProgressStore((s) => s.cards);

  const [lessonState, setLessonState] = useState<LessonState>("idle");
  const [questions, setQuestions] = useState<LessonQuestion[]>([]);
  const [qIdx, setQIdx] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const struggledWords = getStruggledWords(cards);
  const isDefaultLesson = struggledWords.length < 3;

  // ── Generate lesson ──────────────────────────────────────────────────────

  async function generateLesson() {
    setLessonState("loading");
    setError(null);

    const words = isDefaultLesson
      ? [
          ...struggledWords,
          ...BEGINNER_DEFAULTS.filter((w) => !struggledWords.includes(w)),
        ].slice(0, 5)
      : struggledWords;

    const wordList = buildWordList(words);

    const systemPrompt =
      `You are an Armenian tutor. The user struggles with these words: ${wordList}. ` +
      `Create a 5-question lesson. Return ONLY a JSON array:\n` +
      `[{"type":"multiple_choice|fill_blank|translate","prompt":"...","armenian":"...","options":["opt1","opt2","opt3","opt4"],"answer":"must match one option exactly","explanation":"..."}]\n` +
      `Types: multiple_choice, fill_blank, translate. Return ONLY the JSON array, no other text.`;

    try {
      const raw = await callClaude(systemPrompt, "Generate the lesson.", 1000);
      const parsed = parseLesson(raw);
      if (parsed.length === 0) throw new Error("No valid questions parsed");
      setQuestions(parsed);
      setQIdx(0);
      setSelected(null);
      setScore(0);
      setLessonState("active");
    } catch {
      setError("Couldn't generate a lesson — check your API connection.");
      setLessonState("idle");
    }
  }

  // ── Answer handling ───────────────────────────────────────────────────────

  function handleSelect(opt: string) {
    if (selected !== null) return;
    setSelected(opt);
    if (opt === questions[qIdx].answer) {
      setScore((s) => s + 1);
    }
  }

  function handleNext() {
    if (qIdx + 1 >= questions.length) {
      setLessonState("done");
    } else {
      setQIdx((i) => i + 1);
      setSelected(null);
    }
  }

  // ── Idle card ─────────────────────────────────────────────────────────────

  if (lessonState === "idle") {
    return (
      <div className="bg-gradient-to-br from-violet-500 to-purple-600 rounded-2xl p-5 shadow-md">
        <div className="flex items-start justify-between mb-3">
          <div>
            <div className="text-lg font-bold text-white">Today's Lesson ✨</div>
            <div className="text-sm text-purple-200 mt-0.5">
              {isDefaultLesson
                ? "5 beginner vocabulary questions to get started"
                : `5 questions targeting ${struggledWords.length} word${struggledWords.length !== 1 ? "s" : ""} you've missed`}
            </div>
          </div>
          <span className="text-3xl">📝</span>
        </div>

        {!isDefaultLesson && struggledWords.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {struggledWords.map((w) => (
              <span
                key={w.id}
                className="text-xs bg-white/20 text-white rounded-full px-2.5 py-0.5"
              >
                {w.armenian}
              </span>
            ))}
          </div>
        )}

        {error && (
          <p className="text-xs text-red-200 bg-red-500/30 rounded-lg px-3 py-2 mb-3">
            {error}
          </p>
        )}

        <button
          onClick={generateLesson}
          className="w-full py-3 bg-white text-purple-700 font-semibold rounded-xl active:bg-purple-50 transition-colors text-sm"
        >
          Start Lesson →
        </button>
      </div>
    );
  }

  // ── Loading card ──────────────────────────────────────────────────────────

  if (lessonState === "loading") {
    return (
      <div className="bg-gradient-to-br from-violet-500 to-purple-600 rounded-2xl p-5 shadow-md">
        <div className="animate-pulse space-y-3">
          <div className="h-5 bg-white/30 rounded-lg w-40" />
          <div className="h-4 bg-white/20 rounded w-56" />
          <div className="space-y-2 mt-2">
            <div className="h-11 bg-white/20 rounded-xl" />
            <div className="grid grid-cols-2 gap-2">
              <div className="h-12 bg-white/20 rounded-xl" />
              <div className="h-12 bg-white/20 rounded-xl" />
              <div className="h-12 bg-white/20 rounded-xl" />
              <div className="h-12 bg-white/20 rounded-xl" />
            </div>
          </div>
        </div>
        <p className="text-xs text-purple-200 text-center mt-4">
          Ara is preparing your lesson…
        </p>
      </div>
    );
  }

  // ── Done card ─────────────────────────────────────────────────────────────

  if (lessonState === "done") {
    const enc =
      ENCOURAGEMENT.find((e) => score >= e.min) ?? ENCOURAGEMENT[ENCOURAGEMENT.length - 1];
    const accuracy = Math.round((score / questions.length) * 100);
    const trophy = score === questions.length ? "🏆" : score >= 3 ? "⭐" : "💙";

    return (
      <div className="bg-gradient-to-br from-violet-500 to-purple-600 rounded-2xl p-5 shadow-md text-white">
        <div className="text-center mb-5">
          <div className="text-5xl mb-2">{trophy}</div>
          <div className="text-lg font-bold">{enc.headline}</div>
          <div className="text-sm text-purple-200 mt-0.5">{enc.sub}</div>
        </div>

        <div className="grid grid-cols-3 gap-2 mb-5">
          <div className="bg-white/20 rounded-xl p-3 text-center">
            <div className="text-xl font-bold">
              {score}/{questions.length}
            </div>
            <div className="text-xs text-purple-200 mt-0.5">Score</div>
          </div>
          <div className="bg-white/20 rounded-xl p-3 text-center">
            <div className="text-xl font-bold">{accuracy}%</div>
            <div className="text-xs text-purple-200 mt-0.5">Accuracy</div>
          </div>
          <div className="bg-white/20 rounded-xl p-3 text-center">
            <div className="text-xl font-bold">{questions.length}</div>
            <div className="text-xs text-purple-200 mt-0.5">Questions</div>
          </div>
        </div>

        <button
          onClick={() => {
            setLessonState("idle");
            setScore(0);
            setSelected(null);
          }}
          className="w-full py-3 bg-white text-purple-700 font-semibold rounded-xl active:bg-purple-50 transition-colors text-sm"
        >
          Try again
        </button>
      </div>
    );
  }

  // ── Active question ───────────────────────────────────────────────────────

  const q = questions[qIdx];
  const answered = selected !== null;
  const wasCorrect = answered && selected === q.answer;

  const TYPE_LABEL: Record<LessonQuestion["type"], string> = {
    multiple_choice: "Multiple choice",
    fill_blank: "Fill in the blank",
    translate: "Translate",
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
      {/* Coloured header bar */}
      <div className="bg-gradient-to-r from-violet-500 to-purple-600 px-4 py-3 flex items-center justify-between">
        <span className="text-xs text-purple-200 uppercase tracking-wide font-medium">
          Today's Lesson
        </span>
        <span className="text-xs text-white font-semibold tabular-nums">
          {qIdx + 1} / {questions.length}
        </span>
      </div>

      {/* Progress bar */}
      <div className="h-1 bg-purple-100">
        <div
          className="h-full bg-purple-500 transition-all duration-500"
          style={{
            width: `${((qIdx + (answered ? 1 : 0)) / questions.length) * 100}%`,
          }}
        />
      </div>

      <div className="p-4 flex flex-col gap-3">
        {/* Question type */}
        <span className="text-xs text-gray-400 uppercase tracking-wide">
          {TYPE_LABEL[q.type] ?? q.type}
        </span>

        {/* Armenian script */}
        {q.armenian && (
          <div className="text-2xl font-bold text-gray-900 text-center py-1 leading-tight">
            {q.armenian}
          </div>
        )}

        {/* Prompt */}
        <p className="text-sm text-gray-700 leading-relaxed">{q.prompt}</p>

        {/* Options grid — 2-col for 4 options, 1-col otherwise */}
        <div
          className={`grid gap-2 ${q.options.length >= 4 ? "grid-cols-2" : "grid-cols-1"}`}
        >
          {q.options.map((opt, i) => {
            let cls =
              "border-2 border-gray-200 bg-white text-gray-800 active:bg-gray-50";
            let badge: React.ReactNode = null;

            if (answered) {
              if (opt === q.answer) {
                cls = "border-2 border-emerald-400 bg-emerald-50 text-emerald-800";
                badge = (
                  <span className="absolute top-1.5 right-1.5 w-4 h-4 flex items-center justify-center rounded-full bg-emerald-500 text-white text-[9px] font-bold">
                    ✓
                  </span>
                );
              } else if (opt === selected) {
                cls = "border-2 border-red-300 bg-red-50 text-red-800";
                badge = (
                  <span className="absolute top-1.5 right-1.5 w-4 h-4 flex items-center justify-center rounded-full bg-red-400 text-white text-[9px] font-bold">
                    ✗
                  </span>
                );
              } else {
                cls = "border-2 border-gray-100 bg-white text-gray-400 opacity-40";
              }
            }

            return (
              <button
                key={i}
                onClick={() => handleSelect(opt)}
                disabled={answered}
                className={`relative px-3 py-3 rounded-xl text-sm font-medium text-left leading-snug min-h-[48px] transition-colors ${cls}`}
              >
                {badge}
                {opt}
              </button>
            );
          })}
        </div>

        {/* Feedback */}
        {answered && (
          <div
            className={`rounded-xl px-4 py-3 ${
              wasCorrect ? "bg-emerald-50" : "bg-red-50"
            }`}
          >
            <p
              className={`font-semibold text-sm mb-0.5 ${
                wasCorrect ? "text-emerald-700" : "text-red-700"
              }`}
            >
              {wasCorrect ? "Correct! 🎉" : "Not quite."}
            </p>
            {q.explanation && (
              <p className="text-xs text-gray-600 leading-relaxed">{q.explanation}</p>
            )}
          </div>
        )}

        {/* Next / See results */}
        {answered && (
          <button
            onClick={handleNext}
            className="w-full py-3 bg-purple-600 text-white font-semibold rounded-xl active:bg-purple-700 transition-colors text-sm"
          >
            {qIdx + 1 >= questions.length ? "See results" : "Next →"}
          </button>
        )}
      </div>
    </div>
  );
}
