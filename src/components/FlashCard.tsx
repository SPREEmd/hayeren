import { useState, useEffect, Fragment } from "react";
import type { Word, CardProgress } from "../types";
import { nextReviewLabel } from "../lib/srs";
import { speakArmenian, detectVoiceMode, speechSupported } from "../lib/speech";
import type { VoiceMode } from "../lib/speech";
import { syllabify } from "../lib/armenian";

// ── Pronunciation guide ────────────────────────────────────────────────────

// Four colours that cycle across syllables; index 0 is always the first syllable.
// Eastern Armenian stress falls on the last syllable of a word.
const COLORS_LIGHT = [
  "text-indigo-600",
  "text-rose-500",
  "text-emerald-600",
  "text-amber-500",
];
const COLORS_DARK = [
  "text-indigo-200",
  "text-rose-200",
  "text-emerald-200",
  "text-amber-200",
];

function PronunciationGuide({
  romanization,
  dark = false,
}: {
  romanization: string;
  dark?: boolean;
}) {
  const syllables = syllabify(romanization);
  if (syllables.length === 0) return null;

  const colors = dark ? COLORS_DARK : COLORS_LIGHT;
  // Last syllable carries stress in Eastern Armenian
  const stressIdx = syllables.length - 1;

  return (
    <div className="flex justify-center items-baseline gap-1 flex-wrap">
      {syllables.map((syl, i) => {
        const isStressed = i === stressIdx && syllables.length > 1;
        return (
          <Fragment key={i}>
            <span
              className={`font-mono tracking-wide ${colors[i % colors.length]} ${
                isStressed
                  ? "font-bold text-base underline decoration-dotted underline-offset-2"
                  : "font-medium text-sm"
              }`}
            >
              {syl}
            </span>
            {i < syllables.length - 1 && (
              <span className={`text-xs select-none ${dark ? "text-indigo-400" : "text-gray-300"}`}>
                ·
              </span>
            )}
          </Fragment>
        );
      })}
    </div>
  );
}

// ── Speaker button ─────────────────────────────────────────────────────────

function SpeakerButton({
  armenian,
  romanization,
  light = false,
}: {
  armenian: string;
  romanization?: string;
  light?: boolean;
}) {
  const [playing, setPlaying] = useState(false);
  const [voiceMode, setVoiceMode] = useState<VoiceMode | undefined>();

  useEffect(() => {
    if (!speechSupported()) return;
    detectVoiceMode().then(setVoiceMode);
  }, []);

  if (!speechSupported()) return null;

  async function handleSpeak(e: React.MouseEvent) {
    e.stopPropagation();
    setPlaying(true);
    await speakArmenian(armenian, romanization ?? armenian);
    setTimeout(() => setPlaying(false), 1800);
  }

  const showBadge = romanization !== undefined && voiceMode !== undefined;
  const isNative = voiceMode === "native";

  return (
    <button
      onClick={handleSpeak}
      aria-label={`Pronounce ${armenian}`}
      className={`relative flex items-center justify-center w-10 h-10 rounded-full transition-all active:scale-90 ${
        light
          ? playing ? "bg-white/30 text-white" : "bg-white/20 text-white/80 hover:bg-white/30"
          : playing ? "bg-indigo-100 text-indigo-700" : "bg-gray-100 text-gray-500 hover:bg-indigo-50 hover:text-indigo-500"
      }`}
    >
      {playing ? (
        <span className="flex gap-px items-end h-4">
          {[2, 4, 3, 4, 2].map((h, i) => (
            <span
              key={i}
              className={`w-0.5 rounded-full animate-pulse ${light ? "bg-white" : "bg-indigo-500"}`}
              style={{ height: `${h * 3}px`, animationDelay: `${i * 80}ms` }}
            />
          ))}
        </span>
      ) : (
        <svg viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
          <path d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM14.657 2.929a1 1 0 011.414 0A9.972 9.972 0 0119 10a9.972 9.972 0 01-2.929 7.071 1 1 0 01-1.414-1.414A7.971 7.971 0 0017 10c0-2.21-.894-4.208-2.343-5.657a1 1 0 010-1.414zm-2.829 2.828a1 1 0 011.415 0A5.983 5.983 0 0115 10a5.984 5.984 0 01-1.757 4.243 1 1 0 01-1.415-1.415A3.984 3.984 0 0013 10a3.983 3.983 0 00-1.172-2.828 1 1 0 010-1.415z" />
        </svg>
      )}

      {showBadge && (
        <span className={`absolute -top-1.5 -right-1.5 text-[8px] font-bold px-1 py-px rounded-full leading-none select-none ${
          isNative
            ? light ? "bg-white text-indigo-700" : "bg-indigo-600 text-white"
            : light ? "bg-amber-300 text-amber-900" : "bg-amber-400 text-amber-900"
        }`}>
          {isNative ? "ARM" : "ROM"}
        </span>
      )}
    </button>
  );
}

// ── FlashCard ──────────────────────────────────────────────────────────────

interface Props {
  word: Word;
  progress?: CardProgress;
  flipped: boolean;
  onFlip: () => void;
  onGotIt: () => void;
  onAgain: () => void;
  showRomanization: boolean;
  index: number;
  total: number;
}

export default function FlashCard({
  word,
  progress,
  flipped,
  onFlip,
  onGotIt,
  onAgain,
  showRomanization,
  index,
  total,
}: Props) {
  return (
    <div className="flex flex-col items-center gap-4">
      {/* Progress bar */}
      <div className="w-full flex items-center gap-3">
        <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-indigo-500 rounded-full transition-all"
            style={{ width: `${((index + 1) / total) * 100}%` }}
          />
        </div>
        <span className="text-xs text-gray-400 whitespace-nowrap">{index + 1} / {total}</span>
      </div>

      {/* Card */}
      <div
        className="flashcard-scene w-full cursor-pointer select-none"
        style={{ height: 300 }}
        onClick={onFlip}
      >
        <div className={`flashcard-inner ${flipped ? "flipped" : ""}`}>

          {/* ── Front ── */}
          <div className="flashcard-face bg-white rounded-2xl shadow-md border border-gray-100 flex flex-col items-center justify-center p-6 gap-2">
            <span className="text-xs text-gray-400 uppercase tracking-wide">Armenian</span>
            <span className="text-5xl font-bold text-gray-900 text-center leading-tight">
              {word.armenian}
            </span>
            <PronunciationGuide romanization={word.romanization} />
            {showRomanization && (
              <span className="text-xs text-gray-400">{word.romanization}</span>
            )}
            <div className="flex items-center gap-2 mt-1">
              <SpeakerButton armenian={word.armenian} romanization={word.romanization} />
              <span className="text-xs text-gray-300">tap to reveal</span>
            </div>
          </div>

          {/* ── Back ── */}
          <div className="flashcard-face flashcard-back bg-indigo-600 rounded-2xl shadow-md flex flex-col items-center justify-center p-5 gap-1.5">
            <span className="text-xs text-indigo-200 uppercase tracking-wide">English</span>
            <span className="text-3xl font-bold text-white text-center leading-tight">{word.english}</span>

            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="text-indigo-200 text-base">{word.armenian}</span>
              <SpeakerButton armenian={word.armenian} romanization={word.romanization} light />
            </div>

            <PronunciationGuide romanization={word.romanization} dark />

            {word.exampleSentence && (
              <div className="bg-indigo-700 rounded-xl px-3 py-2 text-center w-full mt-1">
                <div className="flex items-center justify-center gap-1.5">
                  <p className="text-indigo-100 text-xs">{word.exampleSentence.armenian}</p>
                  <SpeakerButton armenian={word.exampleSentence.armenian} light />
                </div>
                <p className="text-indigo-300 text-xs mt-0.5">{word.exampleSentence.english}</p>
              </div>
            )}

            {progress && (
              <span className="text-xs text-indigo-300 mt-0.5">{nextReviewLabel(progress)}</span>
            )}
          </div>
        </div>
      </div>

      {/* Got it / Again */}
      <div
        className={`w-full flex gap-3 transition-all duration-300 ${
          flipped ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2 pointer-events-none"
        }`}
      >
        <button
          onClick={onAgain}
          className="flex-1 py-4 rounded-2xl bg-red-50 text-red-600 font-semibold text-base border border-red-200 active:bg-red-100 transition-colors"
        >
          Again
        </button>
        <button
          onClick={onGotIt}
          className="flex-1 py-4 rounded-2xl bg-emerald-500 text-white font-semibold text-base shadow-sm active:bg-emerald-600 transition-colors"
        >
          Got it ✓
        </button>
      </div>
    </div>
  );
}
