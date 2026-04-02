import { useState } from "react";
import { alphabet } from "../data/alphabet";
import type { Letter } from "../types";
import { speakArmenian, speechSupported } from "../lib/speech";
import { useProgressStore } from "../store/progress";

// ── Types ──────────────────────────────────────────────────────────────────

interface Option {
  letter: Letter;
  isCorrect: boolean;
}

interface Question {
  letter: Letter;
  options: Option[];
}

// ── Helpers ────────────────────────────────────────────────────────────────

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function buildAllQuestions(): Question[] {
  return shuffle(alphabet).map((letter) => {
    const distractors = shuffle(
      alphabet.filter((l) => l.armenian !== letter.armenian)
    ).slice(0, 3);
    return {
      letter,
      options: shuffle([
        { letter, isCorrect: true },
        ...distractors.map((l) => ({ letter: l, isCorrect: false })),
      ]),
    };
  });
}

// ── Speaker icon ───────────────────────────────────────────────────────────

const SpeakerIcon = () => (
  <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
    <path d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM14.657 2.929a1 1 0 011.414 0A9.972 9.972 0 0119 10a9.972 9.972 0 01-2.929 7.071 1 1 0 01-1.414-1.414A7.971 7.971 0 0017 10c0-2.21-.894-4.208-2.343-5.657a1 1 0 010-1.414zm-2.829 2.828a1 1 0 011.415 0A5.983 5.983 0 0115 10a5.984 5.984 0 01-1.757 4.243 1 1 0 01-1.415-1.415A3.984 3.984 0 0013 10a3.983 3.983 0 00-1.172-2.828 1 1 0 010-1.415z" />
  </svg>
);

// ── QuizSession ────────────────────────────────────────────────────────────

function QuizSession({ onRestart }: { onRestart: () => void }) {
  const [questions] = useState<Question[]>(() => buildAllQuestions());
  const [idx, setIdx] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [maxStreak, setMaxStreak] = useState(0);
  const [sessionDone, setSessionDone] = useState(false);
  const recordLetterCorrect = useProgressStore((s) => s.recordLetterCorrect);

  const q = questions[idx];
  const answered = selected !== null;
  const wasCorrect = answered && q.options[selected].isCorrect;

  function handleSelect(optIdx: number) {
    if (answered) return;
    const correct = q.options[optIdx].isCorrect;
    setSelected(optIdx);
    if (correct) {
      setScore((s) => s + 1);
      setStreak((s) => {
        const next = s + 1;
        setMaxStreak((m) => Math.max(m, next));
        return next;
      });
      recordLetterCorrect(q.letter.armenian);
    } else {
      setStreak(0);
    }
    // Speak the letter regardless of whether answer was right or wrong
    if (speechSupported()) {
      speakArmenian(q.letter.armenian, q.letter.romanization);
    }
  }

  function handleNext() {
    if (idx + 1 >= questions.length) {
      setSessionDone(true);
    } else {
      setIdx((i) => i + 1);
      setSelected(null);
    }
  }

  // ── Session complete ───────────────────────────────────────────────────

  if (sessionDone) {
    const accuracy = Math.round((score / questions.length) * 100);
    return (
      <div className="pb-24 px-4 pt-10 flex flex-col items-center gap-6">
        <div className="text-6xl">🏆</div>
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900">Quiz complete!</h2>
          <p className="text-gray-400 text-sm mt-1">You covered all 38 letters.</p>
        </div>

        <div className="w-full grid grid-cols-3 gap-3">
          <div className="bg-indigo-50 rounded-2xl p-4 text-center">
            <div className="text-2xl font-bold text-indigo-700">
              {score}/{questions.length}
            </div>
            <div className="text-xs text-indigo-500 mt-0.5">Score</div>
          </div>
          <div className="bg-emerald-50 rounded-2xl p-4 text-center">
            <div className="text-2xl font-bold text-emerald-700">{accuracy}%</div>
            <div className="text-xs text-emerald-600 mt-0.5">Accuracy</div>
          </div>
          <div className="bg-amber-50 rounded-2xl p-4 text-center">
            <div className="text-2xl font-bold text-amber-700">{maxStreak}</div>
            <div className="text-xs text-amber-600 mt-0.5">Best streak</div>
          </div>
        </div>

        {accuracy === 100 && (
          <p className="text-emerald-600 font-semibold text-sm">
            Perfect score! You know every letter. 🎉
          </p>
        )}

        <button
          onClick={onRestart}
          className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-semibold text-base active:bg-indigo-700 transition-colors"
        >
          Play again
        </button>
      </div>
    );
  }

  // ── Active question ────────────────────────────────────────────────────

  return (
    <div className="pb-24">
      {/* Header */}
      <div className="sticky top-0 bg-white border-b border-gray-100 z-10 px-4 py-3 flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900">Alphabet Quiz</h1>
        <div className="flex items-center gap-2">
          {streak >= 2 && (
            <span className="bg-amber-50 text-amber-700 text-xs font-bold px-2.5 py-1 rounded-full">
              🔥 {streak}
            </span>
          )}
          <span className="bg-indigo-50 text-indigo-700 text-xs font-medium px-2.5 py-1 rounded-full">
            {score} correct
          </span>
          <span className="text-xs text-gray-400 tabular-nums">
            {idx + 1} / {questions.length}
          </span>
        </div>
      </div>

      <div className="px-4 pt-5 flex flex-col gap-4">
        {/* Progress bar */}
        <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-indigo-500 rounded-full transition-all duration-500"
            style={{ width: `${((idx + (answered ? 1 : 0)) / questions.length) * 100}%` }}
          />
        </div>

        {/* Letter card */}
        <div className="bg-indigo-600 rounded-3xl flex flex-col items-center justify-center py-8 gap-1 shadow-md">
          <span className="text-8xl font-bold text-white leading-none tracking-tight">
            {q.letter.armenian}
          </span>
          <span className="text-3xl text-indigo-300 font-medium leading-none mt-2">
            {q.letter.lowercase}
          </span>
          <span className="text-xs text-indigo-400 mt-3 uppercase tracking-widest">
            Which word uses this letter?
          </span>
        </div>

        {/* 2×2 option grid */}
        <div className="grid grid-cols-2 gap-3">
          {q.options.map((opt, i) => {
            let borderClass = "border-2 border-gray-200 bg-white active:bg-gray-50";
            let badge: React.ReactNode = null;

            if (answered) {
              if (opt.isCorrect) {
                borderClass = "border-2 border-emerald-400 bg-emerald-50";
                badge = (
                  <span className="absolute top-2 right-2 w-5 h-5 flex items-center justify-center rounded-full bg-emerald-500 text-white text-xs font-bold">
                    ✓
                  </span>
                );
              } else if (i === selected) {
                borderClass = "border-2 border-red-300 bg-red-50";
                badge = (
                  <span className="absolute top-2 right-2 w-5 h-5 flex items-center justify-center rounded-full bg-red-400 text-white text-xs font-bold">
                    ✗
                  </span>
                );
              } else {
                borderClass = "border-2 border-gray-100 bg-white opacity-40";
              }
            }

            return (
              <button
                key={i}
                onClick={() => handleSelect(i)}
                disabled={answered}
                className={`relative flex flex-col items-center justify-center gap-1.5 py-5 px-3 rounded-2xl transition-all ${borderClass}`}
              >
                {badge}
                <span className="text-4xl leading-none">{opt.letter.emoji}</span>
                <span className="text-sm font-semibold text-gray-800 text-center leading-tight mt-0.5">
                  {opt.letter.exampleWord.english}
                </span>
                <span className="text-xs text-gray-400 text-center">
                  {opt.letter.exampleWord.armenian}
                </span>
              </button>
            );
          })}
        </div>

        {/* Reveal panel — shown after answering */}
        {answered && (
          <div
            className={`rounded-2xl border p-4 flex flex-col gap-3 ${
              wasCorrect
                ? "bg-emerald-50 border-emerald-200"
                : "bg-red-50 border-red-200"
            }`}
          >
            {/* Result line */}
            <div className="flex items-center gap-2">
              {wasCorrect ? (
                <>
                  <span className="text-emerald-700 font-bold">Correct!</span>
                  {streak >= 2 && (
                    <span className="text-xs text-amber-600 font-medium bg-amber-100 px-2 py-0.5 rounded-full">
                      🔥 {streak} in a row
                    </span>
                  )}
                </>
              ) : (
                <span className="text-red-700 font-bold">The answer was:</span>
              )}
            </div>

            {/* Letter breakdown */}
            <div className="bg-white rounded-xl p-3 flex items-center gap-3 shadow-sm">
              <div className="flex flex-col items-center w-12">
                <span className="text-3xl font-bold text-indigo-700 leading-none">
                  {q.letter.armenian}
                </span>
                <span className="text-lg text-indigo-300 leading-none mt-0.5">
                  {q.letter.lowercase}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline gap-2">
                  <span className="font-mono text-indigo-700 font-bold text-sm">
                    {q.letter.romanization}
                  </span>
                  <span className="text-gray-400 text-xs">{q.letter.ipa}</span>
                </div>
                <div className="text-xs text-gray-500 mt-0.5 leading-snug">
                  {q.letter.soundDescription}
                </div>
              </div>
            </div>

            {/* Example word */}
            <div className="bg-white rounded-xl p-3 flex items-center gap-3 shadow-sm">
              <span className="text-3xl leading-none">{q.letter.emoji}</span>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-gray-800 text-sm">
                  {q.letter.exampleWord.armenian}
                </div>
                <div className="text-xs text-gray-500 mt-0.5">
                  {q.letter.exampleWord.english} · {q.letter.exampleWord.romanization}
                </div>
              </div>
              {speechSupported() && (
                <button
                  onClick={() =>
                    speakArmenian(
                      q.letter.exampleWord.armenian,
                      q.letter.exampleWord.romanization
                    )
                  }
                  aria-label="Pronounce word"
                  className="w-9 h-9 flex-shrink-0 flex items-center justify-center rounded-full bg-indigo-50 text-indigo-500 active:bg-indigo-100 transition-colors"
                >
                  <SpeakerIcon />
                </button>
              )}
            </div>

            {/* Next button */}
            <button
              onClick={handleNext}
              className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-semibold text-base active:bg-indigo-700 transition-colors"
            >
              {idx + 1 >= questions.length ? "See results" : "Next →"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Quiz page ──────────────────────────────────────────────────────────────

export default function Quiz() {
  const [sessionKey, setSessionKey] = useState(0);
  return (
    <QuizSession
      key={sessionKey}
      onRestart={() => setSessionKey((k) => k + 1)}
    />
  );
}
