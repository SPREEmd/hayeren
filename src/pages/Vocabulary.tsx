import { useState, useEffect } from "react";
import { vocabulary, VOCAB_CATEGORIES } from "../data/vocabulary";
import FlashCard from "../components/FlashCard";
import { useProgressStore } from "../store/progress";
import { speakArmenian, stopSpeech, speechSupported } from "../lib/speech";
import type { VocabCategory } from "../types";

type Mode = "browse" | "review";

export default function Vocabulary() {
  const [category, setCategory] = useState<VocabCategory | "all">("all");
  const [mode, setMode] = useState<Mode>("browse");
  const [cardIndex, setCardIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [showRomanization] = useState(true);
  const [autoPlay, setAutoPlay] = useState(false);
  const [sessionDone, setSessionDone] = useState(false);

  const { reviewWord, getCard, dueCount, learnedCount } = useProgressStore();

  const filtered =
    category === "all" ? vocabulary : vocabulary.filter((w) => w.category === category);

  const dueWords = vocabulary.filter((w) => Date.now() >= getCard(w.id).nextReview);

  const sessionWords = mode === "review" ? dueWords : filtered;
  const currentWord = sessionWords[cardIndex];
  const currentProgress = currentWord ? getCard(currentWord.id) : undefined;

  // Auto-play Armenian word whenever the active card changes
  useEffect(() => {
    if (autoPlay && currentWord) {
      speakArmenian(currentWord.armenian, currentWord.romanization);
    }
    return () => stopSpeech();
  }, [cardIndex, currentWord?.id, autoPlay]); // eslint-disable-line react-hooks/exhaustive-deps

  function startReview() {
    if (dueWords.length === 0) return;
    setMode("review");
    setCardIndex(0);
    setFlipped(false);
    setSessionDone(false);
  }

  function startBrowse() {
    setMode("browse");
    setCardIndex(0);
    setFlipped(false);
    setSessionDone(false);
  }

  function handleFlip() {
    setFlipped(true);
  }

  function advance(quality: 1 | 4 | 5) {
    if (!currentWord) return;
    reviewWord(currentWord.id, quality);
    const next = cardIndex + 1;
    if (next >= sessionWords.length) {
      setSessionDone(true);
    } else {
      setCardIndex(next);
      setFlipped(false);
    }
  }

  function handleCategoryChange(cat: VocabCategory | "all") {
    setCategory(cat);
    setCardIndex(0);
    setFlipped(false);
    setSessionDone(false);
    setMode("browse");
  }

  // ── Session done ───────────────────────────────────────────
  if (sessionDone) {
    return (
      <div className="pb-20 px-4 pt-10 flex flex-col items-center gap-6">
        <div className="text-5xl">🎉</div>
        <h2 className="text-2xl font-bold text-gray-900 text-center">Session complete!</h2>
        <p className="text-gray-500 text-center">
          You reviewed {sessionWords.length} word{sessionWords.length !== 1 ? "s" : ""}.
        </p>
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 w-full text-center">
          <div className="text-2xl font-bold text-emerald-700">{learnedCount()}</div>
          <div className="text-sm text-emerald-600">words learned so far</div>
        </div>
        <div className="flex gap-3 w-full">
          {dueWords.length > 0 && (
            <button
              onClick={startReview}
              className="flex-1 py-4 bg-indigo-600 text-white rounded-2xl font-semibold active:bg-indigo-700"
            >
              Review again ({dueWords.length})
            </button>
          )}
          <button
            onClick={startBrowse}
            className="flex-1 py-4 bg-white border border-gray-200 text-gray-700 rounded-2xl font-semibold active:bg-gray-50"
          >
            Browse cards
          </button>
        </div>
      </div>
    );
  }

  // ── Main page ──────────────────────────────────────────────
  return (
    <div className="flex flex-col overflow-hidden" style={{ height: "100dvh" }}>
      {/* Header */}
      <div className="flex-shrink-0 bg-white border-b border-gray-100 z-10 px-4 pt-4 pb-3">
        <div className="flex items-center justify-between mb-3">
          <h1 className="text-2xl font-bold text-gray-900">Vocabulary</h1>
          <div className="flex items-center gap-2">
            {/* Auto-play toggle */}
            {speechSupported() && (
              <button
                onClick={() => setAutoPlay((p) => !p)}
                title={autoPlay ? "Auto-play on (tap to disable)" : "Auto-play off"}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border transition-colors ${
                  autoPlay
                    ? "bg-indigo-600 text-white border-indigo-600"
                    : "bg-white text-gray-500 border-gray-200"
                }`}
              >
                <svg viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5">
                  <path d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM14.657 2.929a1 1 0 011.414 0A9.972 9.972 0 0119 10a9.972 9.972 0 01-2.929 7.071 1 1 0 01-1.414-1.414A7.971 7.971 0 0017 10c0-2.21-.894-4.208-2.343-5.657a1 1 0 010-1.414zm-2.829 2.828a1 1 0 011.415 0A5.983 5.983 0 0115 10a5.984 5.984 0 01-1.757 4.243 1 1 0 01-1.415-1.415A3.984 3.984 0 0013 10a3.983 3.983 0 00-1.172-2.828 1 1 0 010-1.415z" />
                </svg>
                Auto
              </button>
            )}
            <span className="bg-indigo-50 text-indigo-700 px-2 py-1 rounded-full text-xs font-medium">
              {learnedCount()} learned
            </span>
            {dueCount() > 0 && (
              <button
                onClick={startReview}
                className="bg-amber-400 text-amber-900 px-2 py-1 rounded-full text-xs font-medium active:bg-amber-500"
              >
                {dueCount()} due
              </button>
            )}
          </div>
        </div>

        {/* Browse / Review toggle */}
        <div className="flex gap-2 mb-3">
          <button
            onClick={startBrowse}
            className={`flex-1 py-2 rounded-xl text-sm font-medium transition-colors ${
              mode === "browse" ? "bg-indigo-600 text-white" : "bg-gray-100 text-gray-600"
            }`}
          >
            Browse
          </button>
          <button
            onClick={startReview}
            disabled={dueWords.length === 0}
            className={`flex-1 py-2 rounded-xl text-sm font-medium transition-colors disabled:opacity-40 ${
              mode === "review" ? "bg-amber-500 text-white" : "bg-gray-100 text-gray-600"
            }`}
          >
            Review {dueWords.length > 0 ? `(${dueWords.length})` : ""}
          </button>
        </div>

        {/* Category filter (browse only) */}
        {mode === "browse" && (
          <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
            {VOCAB_CATEGORIES.map(({ value, label, emoji }) => (
              <button
                key={value}
                onClick={() => handleCategoryChange(value)}
                className={`flex-shrink-0 flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium border transition-colors ${
                  category === value
                    ? "bg-indigo-600 text-white border-indigo-600"
                    : "bg-white text-gray-600 border-gray-200"
                }`}
              >
                <span>{emoji}</span>
                <span>{label}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Card area — fixed, does not scroll */}
      <div className="flex-shrink-0 px-4 pt-4">
        {sessionWords.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <div className="text-4xl mb-3">📭</div>
            <p>No cards in this category.</p>
          </div>
        ) : (
          <FlashCard
            word={currentWord}
            progress={currentProgress}
            flipped={flipped}
            onFlip={handleFlip}
            onGotIt={() => advance(4)}
            onAgain={() => advance(1)}
            showRomanization={showRomanization}
            index={cardIndex}
            total={sessionWords.length}
          />
        )}
      </div>

      {/* Word list — browse mode only, independent scroll */}
      {mode === "browse" && sessionWords.length > 0 && (
        <div
          className="flex-1 min-h-0 overflow-y-auto px-4 mt-4 no-scrollbar"
          style={{ paddingBottom: "calc(0.5rem + 56px + env(safe-area-inset-bottom, 0px))" }}
        >
          <h3 className="text-xs text-gray-400 uppercase tracking-wide mb-3">
            {filtered.length} words in this set
          </h3>
          <div className="space-y-2">
            {filtered.map((word, i) => {
              const card = getCard(word.id);
              const learned = card.repetitions > 0;
              return (
                <div
                  key={word.id}
                  className={`flex items-center px-4 py-3 rounded-xl border transition-colors ${
                    i === cardIndex ? "bg-indigo-50 border-indigo-200" : "bg-white border-gray-100"
                  }`}
                >
                  <button
                    onClick={() => {
                      setCardIndex(i);
                      setFlipped(false);
                    }}
                    className="flex-1 flex items-center justify-between text-left min-w-0"
                  >
                    <div className="min-w-0">
                      <span className="font-semibold text-gray-900">{word.armenian}</span>
                      <span className="text-gray-400 text-sm ml-2">{word.romanization}</span>
                    </div>
                    <div className="flex items-center gap-2 ml-2 flex-shrink-0">
                      <span className="text-gray-500 text-sm">{word.english}</span>
                      {learned && <span className="text-emerald-500 text-xs">✓</span>}
                    </div>
                  </button>
                  {speechSupported() && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        speakArmenian(word.armenian, word.romanization);
                      }}
                      aria-label={`Pronounce ${word.armenian}`}
                      className="ml-2 w-8 h-8 flex-shrink-0 flex items-center justify-center rounded-full text-gray-400 hover:text-indigo-500 hover:bg-indigo-50 active:bg-indigo-100 transition-colors"
                    >
                      <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                        <path d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM14.657 2.929a1 1 0 011.414 0A9.972 9.972 0 0119 10a9.972 9.972 0 01-2.929 7.071 1 1 0 01-1.414-1.414A7.971 7.971 0 0017 10c0-2.21-.894-4.208-2.343-5.657a1 1 0 010-1.414zm-2.829 2.828a1 1 0 011.415 0A5.983 5.983 0 0115 10a5.984 5.984 0 01-1.757 4.243 1 1 0 01-1.415-1.415A3.984 3.984 0 0013 10a3.983 3.983 0 00-1.172-2.828 1 1 0 010-1.415z" />
                      </svg>
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
