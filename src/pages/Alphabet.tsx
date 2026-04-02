import { useState, useRef } from "react";
import { alphabet, categoryColors } from "../data/alphabet";
import LetterCard from "../components/LetterCard";
import type { Letter } from "../types";

const CATEGORIES = ["all", "vowel", "stop", "fricative", "affricate", "nasal", "liquid"] as const;

export default function Alphabet() {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [filter, setFilter] = useState<typeof CATEGORIES[number]>("all");

  const touchStartX = useRef<number | null>(null);

  const filtered = filter === "all" ? alphabet : alphabet.filter((l) => l.category === filter);

  function openLetter(letter: Letter) {
    const idx = alphabet.indexOf(letter);
    setSelectedIndex(idx);
  }

  function closeLetter() {
    setSelectedIndex(null);
  }

  function goNext() {
    if (selectedIndex === null) return;
    setSelectedIndex((selectedIndex + 1) % alphabet.length);
  }

  function goPrev() {
    if (selectedIndex === null) return;
    setSelectedIndex((selectedIndex - 1 + alphabet.length) % alphabet.length);
  }

  function onTouchStart(e: React.TouchEvent) {
    touchStartX.current = e.touches[0].clientX;
  }

  function onTouchEnd(e: React.TouchEvent) {
    if (touchStartX.current === null) return;
    const diff = e.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(diff) > 50) {
      diff < 0 ? goNext() : goPrev();
    }
    touchStartX.current = null;
  }

  const selectedLetter = selectedIndex !== null ? alphabet[selectedIndex] : null;

  return (
    <div className="pb-20">
      {/* Header */}
      <div className="sticky top-0 bg-white border-b border-gray-100 z-10 px-4 pt-4 pb-3">
        <h1 className="text-2xl font-bold text-gray-900 mb-3">Alphabet · Այբուբեն</h1>
        {/* Category filter */}
        <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`flex-shrink-0 px-3 py-1 rounded-full text-sm font-medium border transition-colors capitalize ${
                filter === cat
                  ? cat === "all"
                    ? "bg-indigo-600 text-white border-indigo-600"
                    : categoryColors[cat as Letter["category"]]
                  : "bg-white text-gray-500 border-gray-200"
              }`}
            >
              {cat === "all" ? `All (${alphabet.length})` : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      <div className="px-4 pt-4 grid grid-cols-4 gap-3 sm:grid-cols-5 md:grid-cols-6">
        {filtered.map((letter) => (
          <LetterCard
            key={letter.armenian}
            letter={letter}
            compact
            onClick={() => openLetter(letter)}
          />
        ))}
      </div>

      {/* Detail modal */}
      {selectedLetter && (
        <div
          className="fixed inset-0 bg-black/50 z-40 flex items-end sm:items-center justify-center"
          onClick={closeLetter}
        >
          <div
            className="w-full max-w-md mx-auto bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl"
            onClick={(e) => e.stopPropagation()}
            onTouchStart={onTouchStart}
            onTouchEnd={onTouchEnd}
          >
            {/* Nav controls */}
            <div className="flex items-center justify-between px-4 pt-4 pb-2">
              <button
                onClick={goPrev}
                className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-100 text-gray-600 active:bg-gray-200 text-lg"
              >
                ‹
              </button>
              <span className="text-sm text-gray-400">
                {selectedIndex! + 1} / {alphabet.length}
              </span>
              <button
                onClick={goNext}
                className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-100 text-gray-600 active:bg-gray-200 text-lg"
              >
                ›
              </button>
            </div>

            <div className="px-4 pb-6">
              <LetterCard letter={selectedLetter} />
            </div>

            <div className="text-center text-xs text-gray-300 pb-4">Swipe left/right to navigate</div>
          </div>
        </div>
      )}
    </div>
  );
}
