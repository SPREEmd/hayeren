import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { alphabet } from "../data/alphabet";
import { speakArmenian, speechSupported } from "../lib/speech";

// ── 5 preview letters spread across the Aybuben ───────────────────────────

const PREVIEW_LETTERS = [alphabet[0], alphabet[4], alphabet[1], alphabet[5], alphabet[7]];
// Ա (a), Ե (ye/e), Բ (b), Զ (z), Ը (ə) — vowels + consonants, diverse sounds

// ── Dot indicator ─────────────────────────────────────────────────────────

function Dots({ current, total }: { current: number; total: number }) {
  return (
    <div className="flex items-center justify-center gap-2">
      {Array.from({ length: total }, (_, i) => (
        <div
          key={i}
          className={`h-2 rounded-full transition-all duration-300 ${
            i === current ? "w-6 bg-indigo-600" : "w-2 bg-gray-200"
          }`}
        />
      ))}
    </div>
  );
}

// ── Screen 1 — Welcome ─────────────────────────────────────────────────────

function Screen1({ onNext, onSkip }: { onNext: () => void; onSkip: () => void }) {
  return (
    <div className="flex flex-col h-full px-6 pt-14 pb-10">
      {/* Hero */}
      <div className="flex-1 flex flex-col items-center justify-center gap-6 text-center">
        <div className="w-24 h-24 rounded-3xl bg-indigo-600 flex items-center justify-center shadow-lg">
          <span className="text-5xl font-bold text-white leading-none">Հ</span>
        </div>

        <div>
          <h1 className="text-4xl font-bold text-gray-900 tracking-tight">Հայerен</h1>
          <p className="text-base text-gray-400 mt-1 font-medium">hayeren · Armenian</p>
        </div>

        <p className="text-lg text-gray-600 leading-relaxed max-w-xs">
          Learn to read, write, and speak Eastern Armenian — from scratch.
        </p>

        {/* Feature bullets */}
        <div className="w-full max-w-xs flex flex-col gap-3 text-left">
          {[
            { icon: "🔤", text: "38-letter Aybuben script" },
            { icon: "🧠", text: "Spaced repetition vocabulary" },
            { icon: "🎙️", text: "Voice translation & pronunciation" },
            { icon: "🤖", text: "AI tutor Ara, always ready to help" },
          ].map(({ icon, text }) => (
            <div key={text} className="flex items-center gap-3">
              <span className="text-xl w-8 text-center flex-shrink-0">{icon}</span>
              <span className="text-sm text-gray-600">{text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom */}
      <div className="flex flex-col gap-3">
        <Dots current={0} total={3} />
        <button
          onClick={onNext}
          className="w-full py-4 bg-indigo-600 text-white font-semibold text-base rounded-2xl active:bg-indigo-700 transition-colors shadow-sm"
        >
          Get Started →
        </button>
        <button
          onClick={onSkip}
          className="text-sm text-gray-400 py-1 active:text-gray-600"
        >
          Skip intro
        </button>
      </div>
    </div>
  );
}

// ── Screen 2 — Letter preview ──────────────────────────────────────────────

function Screen2({ onNext, onSkip }: { onNext: () => void; onSkip: () => void }) {
  const [tapped, setTapped] = useState<string | null>(null);

  function handleTap(letter: typeof PREVIEW_LETTERS[0]) {
    setTapped(letter.armenian);
    if (speechSupported()) {
      speakArmenian(letter.armenian, letter.romanization);
    }
  }

  return (
    <div className="flex flex-col h-full px-5 pt-12 pb-10">
      {/* Header */}
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">The Armenian Alphabet</h2>
        <p className="text-sm text-gray-400 mt-1">
          Այbuben (Aybuben) · 38 unique letters
        </p>
        {speechSupported() && (
          <p className="text-xs text-indigo-500 mt-1.5">Tap a letter to hear it</p>
        )}
      </div>

      {/* Letter rows */}
      <div className="flex-1 flex flex-col justify-center gap-3">
        {PREVIEW_LETTERS.map((letter) => {
          const active = tapped === letter.armenian;
          return (
            <button
              key={letter.armenian}
              onClick={() => handleTap(letter)}
              className={`flex items-center gap-4 rounded-2xl px-4 py-3.5 text-left transition-all active:scale-[0.98] ${
                active
                  ? "bg-indigo-600 shadow-md"
                  : "bg-indigo-50 hover:bg-indigo-100"
              }`}
            >
              {/* Large letter */}
              <span
                className={`text-4xl font-bold leading-none w-10 text-center flex-shrink-0 ${
                  active ? "text-white" : "text-indigo-600"
                }`}
              >
                {letter.armenian}
              </span>

              {/* Sound info */}
              <div className="flex-1 min-w-0">
                <div
                  className={`font-semibold text-sm ${
                    active ? "text-white" : "text-gray-800"
                  }`}
                >
                  "{letter.romanization}"
                </div>
                <div
                  className={`text-xs mt-0.5 ${
                    active ? "text-indigo-200" : "text-gray-500"
                  }`}
                >
                  {letter.soundDescription}
                </div>
              </div>

              {/* Example word */}
              <div className="flex flex-col items-end flex-shrink-0">
                <span className="text-2xl leading-none">{letter.emoji}</span>
                <span
                  className={`text-xs mt-0.5 ${
                    active ? "text-indigo-200" : "text-gray-400"
                  }`}
                >
                  {letter.exampleWord.english}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Bottom */}
      <div className="flex flex-col gap-3 mt-6">
        <Dots current={1} total={3} />
        <button
          onClick={onNext}
          className="w-full py-4 bg-indigo-600 text-white font-semibold text-base rounded-2xl active:bg-indigo-700 transition-colors shadow-sm"
        >
          Next →
        </button>
        <button
          onClick={onSkip}
          className="text-sm text-gray-400 py-1 active:text-gray-600"
        >
          Skip intro
        </button>
      </div>
    </div>
  );
}

// ── Screen 3 — Choose starting point ──────────────────────────────────────

const STARTING_POINTS = [
  {
    path: "/alphabet",
    icon: "Ա",
    title: "Alphabet",
    subtitle: "Այbubен",
    description: "Learn all 38 letters and their sounds first",
    color: "from-blue-500 to-indigo-500",
    recommended: true,
  },
  {
    path: "/vocabulary",
    icon: "📚",
    title: "Vocabulary",
    subtitle: "Բarrrabashar",
    description: "Dive into 100+ common words with flashcards",
    color: "from-emerald-500 to-teal-500",
    recommended: false,
  },
  {
    path: "/translate",
    icon: "🎙️",
    title: "Translator",
    subtitle: "Thargmanich",
    description: "Try translating English to Armenian right away",
    color: "from-orange-500 to-rose-500",
    recommended: false,
  },
] as const;

function Screen3({ onFinish }: { onFinish: (path: string) => void }) {
  return (
    <div className="flex flex-col h-full px-5 pt-12 pb-10">
      {/* Header */}
      <div className="text-center mb-7">
        <h2 className="text-2xl font-bold text-gray-900">Where would you like to start?</h2>
        <p className="text-sm text-gray-400 mt-1.5">You can change this at any time</p>
      </div>

      {/* Option cards */}
      <div className="flex-1 flex flex-col justify-center gap-4">
        {STARTING_POINTS.map(({ path, icon, title, description, color, recommended }) => (
          <button
            key={path}
            onClick={() => onFinish(path)}
            className={`relative flex items-center gap-4 bg-gradient-to-br ${color} text-white rounded-2xl p-5 text-left shadow-md active:scale-[0.97] transition-transform`}
          >
            {recommended && (
              <span className="absolute top-3 right-3 text-[10px] font-bold bg-white/25 text-white px-2 py-0.5 rounded-full uppercase tracking-wide">
                Recommended
              </span>
            )}
            <span className="text-4xl leading-none flex-shrink-0 w-10 text-center">
              {icon}
            </span>
            <div className="flex-1 min-w-0">
              <div className="font-bold text-lg leading-tight">{title}</div>
              <div className="text-sm opacity-80 mt-0.5 leading-snug">{description}</div>
            </div>
            <svg
              viewBox="0 0 20 20"
              fill="currentColor"
              className="w-5 h-5 opacity-60 flex-shrink-0"
            >
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
              />
            </svg>
          </button>
        ))}
      </div>

      {/* Bottom */}
      <div className="flex flex-col gap-3 mt-6">
        <Dots current={2} total={3} />
        <button
          onClick={() => onFinish("/")}
          className="text-sm text-gray-400 py-1 active:text-gray-600"
        >
          Go to Home instead
        </button>
      </div>
    </div>
  );
}

// ── Onboarding shell ───────────────────────────────────────────────────────

interface Props {
  onComplete: () => void;
}

export default function Onboarding({ onComplete }: Props) {
  const navigate = useNavigate();
  const [screen, setScreen] = useState(0);
  const [fading, setFading] = useState(false);

  function go(next: number) {
    setFading(true);
    setTimeout(() => {
      setScreen(next);
      setFading(false);
    }, 140);
  }

  function finish(path: string) {
    onComplete();
    navigate(path);
  }

  function skip() {
    finish("/");
  }

  return (
    // Full-screen overlay on top of the app and the fixed BottomNav
    <div className="fixed inset-0 z-[200] bg-white flex justify-center overflow-hidden">
      <div
        className={`w-full max-w-lg transition-opacity duration-150 ${
          fading ? "opacity-0" : "opacity-100"
        }`}
        style={{ height: "100dvh" }}
      >
        {screen === 0 && <Screen1 onNext={() => go(1)} onSkip={skip} />}
        {screen === 1 && <Screen2 onNext={() => go(2)} onSkip={skip} />}
        {screen === 2 && <Screen3 onFinish={finish} />}
      </div>
    </div>
  );
}
