import { useState, useRef, Fragment } from "react";
import { callClaude } from "../lib/claude";
import { speakArmenian, speechSupported } from "../lib/speech";
import { syllabify } from "../lib/armenian";

// ── Types ──────────────────────────────────────────────────────────────────

type EnToHy = { dir: "en→hy"; armenian: string; romanization: string; tip: string };
type HyToEn = { dir: "hy→en"; english: string; notes: string };
type TranslationResult = EnToHy | HyToEn;

// ── Constants ──────────────────────────────────────────────────────────────

const SYSTEM_PROMPT =
  'You are an Armenian language translator. Return ONLY a JSON object with no extra text: ' +
  'for English input: {"armenian": "...", "romanization": "...", "tip": "..."} — ' +
  'for Armenian input: {"english": "...", "notes": "..."}';

const SYL_COLORS_LIGHT = ["text-indigo-600", "text-rose-500", "text-emerald-600", "text-amber-500"];
const SYL_COLORS_DARK  = ["text-indigo-200", "text-rose-200", "text-emerald-200", "text-amber-200"];

// ── Helpers ────────────────────────────────────────────────────────────────

function isArmenianText(text: string): boolean {
  return /[\u0531-\u058F]/.test(text);
}

function detectDirection(text: string): "en→hy" | "hy→en" {
  return isArmenianText(text) ? "hy→en" : "en→hy";
}

function parseResult(raw: string, dir: "en→hy" | "hy→en"): TranslationResult | null {
  try {
    const cleaned = raw.replace(/```json\n?|\n?```/g, "").trim();
    const json = JSON.parse(cleaned);
    if (dir === "en→hy") {
      return {
        dir,
        armenian: String(json.armenian ?? ""),
        romanization: String(json.romanization ?? ""),
        tip: String(json.tip ?? ""),
      };
    } else {
      return {
        dir,
        english: String(json.english ?? ""),
        notes: String(json.notes ?? ""),
      };
    }
  } catch {
    return null;
  }
}

function recognitionSupported(): boolean {
  return "SpeechRecognition" in window || "webkitSpeechRecognition" in window;
}

// ── Sub-components ─────────────────────────────────────────────────────────

function SyllableGuide({ romanization, dark }: { romanization: string; dark?: boolean }) {
  const syllables = syllabify(romanization);
  if (syllables.length === 0) return null;
  const colors = dark ? SYL_COLORS_DARK : SYL_COLORS_LIGHT;
  const stressIdx = syllables.length - 1;
  return (
    <div className="flex justify-center items-baseline gap-1 flex-wrap">
      {syllables.map((syl, i) => {
        const stressed = i === stressIdx && syllables.length > 1;
        return (
          <Fragment key={i}>
            <span
              className={`font-mono tracking-wide ${colors[i % colors.length]} ${
                stressed
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

function MicIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 flex-shrink-0">
      <path fillRule="evenodd" clipRule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z" />
    </svg>
  );
}

function SpeakerIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 flex-shrink-0">
      <path d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM14.657 2.929a1 1 0 011.414 0A9.972 9.972 0 0119 10a9.972 9.972 0 01-2.929 7.071 1 1 0 01-1.414-1.414A7.971 7.971 0 0017 10c0-2.21-.894-4.208-2.343-5.657a1 1 0 010-1.414zm-2.829 2.828a1 1 0 011.415 0A5.983 5.983 0 0115 10a5.984 5.984 0 01-1.757 4.243 1 1 0 01-1.415-1.415A3.984 3.984 0 0013 10a3.983 3.983 0 00-1.172-2.828 1 1 0 010-1.415z" />
    </svg>
  );
}

function CopyIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 flex-shrink-0">
      <path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" />
      <path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z" />
    </svg>
  );
}

// ── Result cards ───────────────────────────────────────────────────────────

function EnToHyCard({
  result,
  onCopy,
  copied,
}: {
  result: EnToHy;
  onCopy: (s: string) => void;
  copied: boolean;
}) {
  return (
    <div className="bg-indigo-600 rounded-2xl shadow-md p-5 flex flex-col gap-3">
      <div className="flex flex-col items-center gap-2 text-center">
        <span className="text-xs text-indigo-300 uppercase tracking-wide">Armenian</span>
        <span className="text-4xl font-bold text-white leading-tight">{result.armenian}</span>
        <SyllableGuide romanization={result.romanization} dark />
        <span className="text-indigo-200 text-sm font-mono">{result.romanization}</span>
      </div>

      {result.tip && (
        <div className="bg-indigo-700/60 rounded-xl px-4 py-2.5">
          <p className="text-indigo-100 text-xs text-center italic leading-snug">
            💡 {result.tip}
          </p>
        </div>
      )}

      <div className="flex gap-2 mt-1">
        {speechSupported() && (
          <button
            onClick={() => speakArmenian(result.armenian, result.romanization)}
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-white/20 text-white text-sm font-medium active:bg-white/30 transition-colors"
          >
            <SpeakerIcon />
            Listen
          </button>
        )}
        <button
          onClick={() => onCopy(result.armenian)}
          className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-white/20 text-white text-sm font-medium active:bg-white/30 transition-colors"
        >
          <CopyIcon />
          {copied ? "Copied!" : "Copy"}
        </button>
      </div>
    </div>
  );
}

function HyToEnCard({
  result,
  onCopy,
  copied,
}: {
  result: HyToEn;
  onCopy: (s: string) => void;
  copied: boolean;
}) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 flex flex-col gap-3">
      <div className="flex flex-col items-center gap-2 text-center">
        <span className="text-xs text-gray-400 uppercase tracking-wide">English</span>
        <span className="text-3xl font-bold text-gray-900 leading-tight">{result.english}</span>
      </div>

      {result.notes && (
        <div className="bg-gray-50 rounded-xl px-4 py-2.5">
          <p className="text-gray-500 text-xs text-center italic leading-snug">
            💡 {result.notes}
          </p>
        </div>
      )}

      <button
        onClick={() => onCopy(result.english)}
        className="flex items-center justify-center gap-2 py-3 rounded-xl bg-gray-100 text-gray-700 text-sm font-medium active:bg-gray-200 transition-colors"
      >
        <CopyIcon />
        {copied ? "Copied!" : "Copy"}
      </button>
    </div>
  );
}

// ── Translator page ────────────────────────────────────────────────────────

export default function Translator() {
  const [text, setText] = useState("");
  const [result, setResult] = useState<TranslationResult | null>(null);
  const [listening, setListening] = useState<"en" | "hy" | null>(null);
  const [translating, setTranslating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recognitionRef = useRef<any>(null);

  const detectedDir = text.trim() ? detectDirection(text) : null;

  async function translate(inputText: string) {
    const trimmed = inputText.trim();
    if (!trimmed) return;
    const dir = detectDirection(trimmed);
    setTranslating(true);
    setError(null);
    setResult(null);
    try {
      const raw = await callClaude(SYSTEM_PROMPT, trimmed, 300);
      const parsed = parseResult(raw, dir);
      if (parsed) {
        setResult(parsed);
      } else {
        setError("Couldn't parse the translation — please try again.");
      }
    } catch {
      setError("Translation failed. Check your connection and API key.");
    } finally {
      setTranslating(false);
    }
  }

  function startListening(lang: "en" | "hy") {
    if (!recognitionSupported()) return;
    recognitionRef.current?.stop();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const SR = (window as any).SpeechRecognition ?? (window as any).webkitSpeechRecognition;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const rec: any = new SR();
    rec.lang = lang === "en" ? "en-US" : "hy-AM";
    rec.continuous = false;
    rec.interimResults = false;
    recognitionRef.current = rec;

    rec.onstart = () => setListening(lang);
    rec.onresult = (e: any) => { // eslint-disable-line @typescript-eslint/no-explicit-any
      const transcript: string = e.results[0][0].transcript;
      setText(transcript);
      translate(transcript);
    };
    rec.onerror = () => setListening(null);
    rec.onend = () => setListening(null);
    rec.start();
  }

  function stopListening() {
    recognitionRef.current?.stop();
    setListening(null);
  }

  async function handleCopy(str: string) {
    try {
      await navigator.clipboard.writeText(str);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // clipboard unavailable
    }
  }

  return (
    <div className="flex flex-col overflow-hidden" style={{ height: "100dvh" }}>
      {/* Header */}
      <div className="flex-shrink-0 bg-white border-b border-gray-100 px-4 pt-4 pb-3">
        <h1 className="text-2xl font-bold text-gray-900">
          Translator{" "}
          <span className="text-indigo-500">·</span>{" "}
          <span className="font-normal text-gray-600">Թարգմանիչ</span>
        </h1>
        <p className="text-xs text-gray-400 mt-0.5">English ↔ Armenian · powered by Claude</p>
      </div>

      {/* Scrollable body */}
      <div
        className="flex-1 min-h-0 overflow-y-auto px-4 pt-5 no-scrollbar"
        style={{
          paddingBottom: "calc(1.5rem + 56px + env(safe-area-inset-bottom, 0px))",
        }}
      >
        {/* ── Input card ── */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          {/* Textarea */}
          <textarea
            value={text}
            onChange={(e) => {
              setText(e.target.value);
              setResult(null);
              setError(null);
            }}
            placeholder="Type in English or Armenian… or use the mic buttons below"
            rows={4}
            className="w-full resize-none text-gray-900 text-base placeholder-gray-400 outline-none leading-relaxed px-4 pt-4 pb-2"
          />

          {/* Detected direction */}
          <div className="px-4 pb-3 min-h-[28px] flex items-center">
            {listening ? (
              <div className="flex items-center gap-2 text-sm text-rose-500 font-medium">
                <span className="flex gap-0.5 items-end h-4">
                  {[2, 4, 3, 4, 2].map((h, i) => (
                    <span
                      key={i}
                      className="w-0.5 bg-rose-400 rounded-full animate-pulse"
                      style={{ height: `${h * 3}px`, animationDelay: `${i * 80}ms` }}
                    />
                  ))}
                </span>
                Listening in {listening === "en" ? "English" : "Armenian"}…
                <button
                  onClick={stopListening}
                  className="ml-auto text-xs text-gray-400 underline underline-offset-2"
                >
                  Stop
                </button>
              </div>
            ) : detectedDir ? (
              <span className="text-xs px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-600 font-medium">
                {detectedDir === "en→hy"
                  ? "🇬🇧 English → 🇦🇲 Armenian"
                  : "🇦🇲 Armenian → 🇬🇧 English"}
              </span>
            ) : null}
          </div>

          <div className="border-t border-gray-100" />

          {/* Mic buttons */}
          {recognitionSupported() && (
            <div className="flex gap-px">
              <button
                onClick={() =>
                  listening === "en" ? stopListening() : startListening("en")
                }
                className={`flex-1 flex items-center justify-center gap-2 py-3.5 text-sm font-medium transition-colors ${
                  listening === "en"
                    ? "bg-rose-50 text-rose-600"
                    : "bg-white text-gray-600 hover:bg-gray-50 active:bg-gray-100"
                }`}
              >
                <MicIcon />
                {listening === "en" ? "Listening…" : "Speak English"}
              </button>
              <div className="w-px bg-gray-100" />
              <button
                onClick={() =>
                  listening === "hy" ? stopListening() : startListening("hy")
                }
                className={`flex-1 flex items-center justify-center gap-2 py-3.5 text-sm font-medium transition-colors ${
                  listening === "hy"
                    ? "bg-rose-50 text-rose-600"
                    : "bg-white text-gray-600 hover:bg-gray-50 active:bg-gray-100"
                }`}
              >
                <MicIcon />
                {listening === "hy" ? "Listening…" : "Speak Armenian"}
              </button>
            </div>
          )}

          {/* Translate / Clear row */}
          <div className="flex gap-2 p-3 border-t border-gray-100">
            {text.trim() && (
              <button
                onClick={() => {
                  setText("");
                  setResult(null);
                  setError(null);
                }}
                className="px-4 py-2.5 rounded-xl text-sm text-gray-500 border border-gray-200 bg-white active:bg-gray-50 transition-colors"
              >
                Clear
              </button>
            )}
            <button
              onClick={() => translate(text)}
              disabled={!text.trim() || translating}
              className="flex-1 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-semibold disabled:opacity-40 active:bg-indigo-700 transition-colors"
            >
              {translating ? "Translating…" : "Translate"}
            </button>
          </div>
        </div>

        {/* ── Error ── */}
        {error && (
          <div className="mt-4 px-4 py-3 bg-red-50 border border-red-200 rounded-2xl text-sm text-red-600">
            {error}
          </div>
        )}

        {/* ── Loading skeleton ── */}
        {translating && (
          <div className="mt-4 bg-indigo-600 rounded-2xl p-5 flex flex-col gap-3 animate-pulse">
            <div className="h-4 bg-indigo-500 rounded w-20 mx-auto" />
            <div className="h-9 bg-indigo-500 rounded-lg w-48 mx-auto" />
            <div className="h-4 bg-indigo-500 rounded w-32 mx-auto" />
            <div className="h-10 bg-indigo-700/60 rounded-xl" />
            <div className="flex gap-2">
              <div className="flex-1 h-11 bg-indigo-500/50 rounded-xl" />
              <div className="flex-1 h-11 bg-indigo-500/50 rounded-xl" />
            </div>
          </div>
        )}

        {/* ── Result ── */}
        {result && !translating && (
          <div className="mt-4">
            {result.dir === "en→hy" ? (
              <EnToHyCard result={result} onCopy={handleCopy} copied={copied} />
            ) : (
              <HyToEnCard result={result} onCopy={handleCopy} copied={copied} />
            )}
          </div>
        )}

        {/* ── Usage hint (shown on empty state) ── */}
        {!result && !translating && !error && !text && (
          <div className="mt-8 flex flex-col items-center gap-3 text-center">
            <div className="text-4xl">🔤</div>
            <p className="text-gray-400 text-sm leading-relaxed max-w-xs">
              Type a word or phrase, or tap a mic button to speak. Armenian Unicode is detected
              automatically.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
