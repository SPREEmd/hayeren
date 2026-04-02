import type { Letter } from "../types";
import { categoryColors } from "../data/alphabet";

interface Props {
  letter: Letter;
  onClick?: () => void;
  compact?: boolean;
}

export default function LetterCard({ letter, onClick, compact = false }: Props) {
  const colorClass = categoryColors[letter.category];

  if (compact) {
    return (
      <button
        onClick={onClick}
        className={`flex flex-col items-center justify-center rounded-xl border-2 p-3 min-h-[80px] w-full active:scale-95 transition-transform cursor-pointer ${colorClass}`}
      >
        <span className="text-3xl font-bold leading-none">{letter.armenian}</span>
        <span className="text-xs mt-1 opacity-70">{letter.romanization}</span>
      </button>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
      {/* Header */}
      <div className={`flex items-center justify-center gap-6 py-8 ${colorClass} border-b-2`}>
        <div className="text-center">
          <div className="text-7xl font-bold leading-none">{letter.armenian}</div>
          <div className="text-4xl font-bold leading-none mt-1 opacity-70">{letter.lowercase}</div>
        </div>
      </div>

      {/* Details */}
      <div className="p-5 space-y-4">
        <div className="text-center">
          <div className="text-2xl font-semibold text-gray-700">{letter.romanization}</div>
          <div className="text-gray-400 text-sm font-mono">{letter.ipa}</div>
          <div className="text-gray-500 text-sm mt-1">{letter.soundDescription}</div>
        </div>

        <div className="border-t pt-4">
          <p className="text-xs text-gray-400 uppercase tracking-wide mb-2">Example word</p>
          <div className="flex items-center gap-3 bg-gray-50 rounded-xl p-3">
            <span className="text-3xl">{letter.emoji}</span>
            <div>
              <div className="text-xl font-bold text-gray-800">{letter.exampleWord.armenian}</div>
              <div className="text-sm text-gray-500">{letter.exampleWord.romanization}</div>
              <div className="text-sm text-indigo-600 font-medium">{letter.exampleWord.english}</div>
            </div>
          </div>
        </div>

        <div className="flex justify-center">
          <span className={`text-xs px-3 py-1 rounded-full border font-medium capitalize ${colorClass}`}>
            {letter.category}
          </span>
        </div>
      </div>
    </div>
  );
}
