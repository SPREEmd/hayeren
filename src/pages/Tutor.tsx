import { useState, useEffect, useRef } from "react";
import { callClaude, callClaudeChat } from "../lib/claude";
import type { ChatMessage } from "../lib/claude";
import { speakArmenian, speechSupported } from "../lib/speech";

// ── Constants ──────────────────────────────────────────────────────────────

const SYSTEM_PROMPT =
  "You are Ara, a warm and encouraging Armenian language tutor. " +
  "The user is a beginner learning Eastern Armenian. Keep responses concise (3-5 sentences). " +
  "Always include Armenian script with romanization in parentheses when introducing words. " +
  "Celebrate small wins. Never make them feel bad for mistakes.";

const WORD_SYSTEM =
  'You are an Armenian dictionary. Given an Armenian word, return ONLY a JSON object: ' +
  '{"romanization": "...", "meaning": "..."}. Keep meaning to 3-5 words.';

const STORAGE_KEY = "hayeren-tutor-history";

// Non-global regexes — global regexes are stateful (lastIndex) and break .test() in loops
const ARMENIAN_SPLIT_RE = /([\u0531-\u0587]+)/;   // for split() — captures Armenian segments
const ARMENIAN_TEST_RE  = /^[\u0531-\u0587]+$/;    // for testing individual string parts

const WELCOME: TutorMessage = {
  id: "welcome",
  role: "ara",
  text: "Բարև! (Barev!) That means 'Hello' in Armenian 🎉 I'm Ara, your Armenian language tutor. What would you like to learn today? Ask me about words, phrases, grammar — or just practice chatting!",
  timestamp: 0,
};

// ── Types ──────────────────────────────────────────────────────────────────

interface TutorMessage {
  id: string;
  role: "user" | "ara";
  text: string;
  timestamp: number;
}

interface WordInfo {
  word: string;
  loading: boolean;
  romanization: string;
  meaning: string;
}

// ── Word lookup ────────────────────────────────────────────────────────────

const wordCache = new Map<string, { romanization: string; meaning: string }>();

async function lookupWord(word: string): Promise<{ romanization: string; meaning: string }> {
  if (wordCache.has(word)) return wordCache.get(word)!;
  try {
    const raw = await callClaude(WORD_SYSTEM, word, 80);
    const cleaned = raw.replace(/```json\n?|\n?```/g, "").trim();
    const json = JSON.parse(cleaned);
    const result = {
      romanization: String(json.romanization ?? ""),
      meaning: String(json.meaning ?? ""),
    };
    wordCache.set(word, result);
    return result;
  } catch {
    return { romanization: "", meaning: "" };
  }
}

// ── sessionStorage ─────────────────────────────────────────────────────────

function loadHistory(): TutorMessage[] {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as TutorMessage[];
  } catch { /* ignore */ }
  return [WELCOME];
}

function saveHistory(msgs: TutorMessage[]) {
  try { sessionStorage.setItem(STORAGE_KEY, JSON.stringify(msgs)); } catch { /* ignore */ }
}

// ── MessageContent — renders text with tappable Armenian words ─────────────

function MessageContent({
  text,
  isAra,
  onWordTap,
}: {
  text: string;
  isAra: boolean;
  onWordTap: (word: string) => void;
}) {
  // split() with a capture group interleaves the captured Armenian segments
  const parts = text.split(ARMENIAN_SPLIT_RE);
  return (
    <>
      {parts.map((part, i) =>
        ARMENIAN_TEST_RE.test(part) ? (
          <button
            key={i}
            onClick={() => onWordTap(part)}
            className={`inline font-medium underline decoration-dotted underline-offset-2 ${
              isAra
                ? "decoration-indigo-300 hover:decoration-indigo-100"
                : "decoration-white/60"
            }`}
          >
            {part}
          </button>
        ) : (
          <span key={i}>{part}</span>
        )
      )}
    </>
  );
}

// ── TypingIndicator ────────────────────────────────────────────────────────

function TypingIndicator() {
  return (
    <div className="flex items-start gap-2.5 px-4">
      <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0 text-sm font-bold text-indigo-600">
        A
      </div>
      <div className="bg-white border border-gray-100 rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm">
        <div className="flex gap-1.5 items-center h-5">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
              style={{ animationDelay: `${i * 0.15}s` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

// ── WordPopup ──────────────────────────────────────────────────────────────

function WordPopup({ info, onClose }: { info: WordInfo; onClose: () => void }) {
  return (
    <div className="flex-shrink-0 px-4 pb-2">
      <div className="bg-white rounded-2xl border border-indigo-200 shadow-lg p-4 flex items-start justify-between gap-3">
        <div className="flex flex-col gap-0.5 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold text-indigo-700 leading-none">{info.word}</span>
            {!info.loading && info.romanization && speechSupported() && (
              <button
                onClick={() => speakArmenian(info.word, info.romanization)}
                className="w-7 h-7 flex items-center justify-center rounded-full bg-indigo-50 text-indigo-500 active:bg-indigo-100 flex-shrink-0"
                aria-label="Pronounce"
              >
                <svg viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5">
                  <path d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM14.657 2.929a1 1 0 011.414 0A9.972 9.972 0 0119 10a9.972 9.972 0 01-2.929 7.071 1 1 0 01-1.414-1.414A7.971 7.971 0 0017 10c0-2.21-.894-4.208-2.343-5.657a1 1 0 010-1.414zm-2.829 2.828a1 1 0 011.415 0A5.983 5.983 0 0115 10a5.984 5.984 0 01-1.757 4.243 1 1 0 01-1.415-1.415A3.984 3.984 0 0013 10a3.983 3.983 0 00-1.172-2.828 1 1 0 010-1.415z" />
                </svg>
              </button>
            )}
          </div>
          {info.loading ? (
            <span className="text-sm text-gray-400 animate-pulse">Looking up…</span>
          ) : (
            <>
              {info.romanization && (
                <span className="text-sm font-mono text-indigo-500">{info.romanization}</span>
              )}
              {info.meaning && (
                <span className="text-sm text-gray-600">{info.meaning}</span>
              )}
              {!info.romanization && !info.meaning && (
                <span className="text-sm text-gray-400">No result found.</span>
              )}
            </>
          )}
        </div>
        <button
          onClick={onClose}
          className="w-7 h-7 flex items-center justify-center rounded-full text-gray-400 hover:bg-gray-100 active:bg-gray-200 flex-shrink-0 mt-0.5"
          aria-label="Close"
        >
          <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
            <path fillRule="evenodd" clipRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" />
          </svg>
        </button>
      </div>
    </div>
  );
}

// ── Tutor page ─────────────────────────────────────────────────────────────

export default function Tutor() {
  const [messages, setMessages] = useState<TutorMessage[]>(() => loadHistory());
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [wordPopup, setWordPopup] = useState<WordInfo | null>(null);
  const [listening, setListening] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  // ── Word tap ─────────────────────────────────────────────────────────────

  async function handleWordTap(word: string) {
    if (wordPopup?.word === word && !wordPopup.loading) {
      setWordPopup(null);
      return;
    }
    setWordPopup({ word, loading: true, romanization: "", meaning: "" });
    const info = await lookupWord(word);
    setWordPopup({ word, loading: false, ...info });
  }

  // ── Voice input ───────────────────────────────────────────────────────────

  function recognitionSupported() {
    return "SpeechRecognition" in window || "webkitSpeechRecognition" in window;
  }

  function startListening() {
    if (!recognitionSupported()) return;
    recognitionRef.current?.stop();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const SR = (window as any).SpeechRecognition ?? (window as any).webkitSpeechRecognition;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const rec: any = new SR();
    rec.lang = "en-US";
    rec.continuous = false;
    rec.interimResults = false;
    recognitionRef.current = rec;

    rec.onstart = () => setListening(true);
    rec.onresult = (e: any) => { // eslint-disable-line @typescript-eslint/no-explicit-any
      const transcript: string = e.results[0][0].transcript;
      rec.stop();           // stop immediately — don't wait for onend
      setListening(false);  // switch to processing state right away
      setInput(transcript);
      sendMessageText(transcript);
    };
    rec.onerror = () => setListening(false);
    rec.onend = () => setListening(false);
    rec.start();
  }

  function stopListening() {
    recognitionRef.current?.stop();
    setListening(false);
  }

  // ── Send ──────────────────────────────────────────────────────────────────

  async function sendMessageText(text: string) {
    const trimmed = text.trim();
    if (!trimmed || isLoading) return;

    const userMsg: TutorMessage = {
      id: Date.now().toString(),
      role: "user",
      text: trimmed,
      timestamp: Date.now(),
    };

    const nextHistory = [...messages, userMsg];
    setMessages(nextHistory);
    saveHistory(nextHistory);
    setInput("");
    setIsLoading(true);
    setWordPopup(null);
    inputRef.current?.focus();

    const apiMessages: ChatMessage[] = nextHistory
      .filter((m) => m.id !== "welcome")
      .map((m) => ({
        role: m.role === "user" ? "user" : "assistant",
        content: m.text,
      }));

    try {
      const responseText = await callClaudeChat(SYSTEM_PROMPT, apiMessages, 600);
      if (responseText) {
        const araMsg: TutorMessage = {
          id: (Date.now() + 1).toString(),
          role: "ara",
          text: responseText,
          timestamp: Date.now(),
        };
        const finalHistory = [...nextHistory, araMsg];
        setMessages(finalHistory);
        saveHistory(finalHistory);
      }
    } catch { /* logged in callClaudeChat */ } finally {
      setIsLoading(false);
    }
  }

  function sendMessage() {
    sendMessageText(input);
  }

  // ── Clear chat ────────────────────────────────────────────────────────────

  function clearChat() {
    const fresh = [WELCOME];
    setMessages(fresh);
    saveHistory(fresh);
    setWordPopup(null);
    setInput("");
    inputRef.current?.focus();
  }

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    // paddingBottom pushes all content above the fixed BottomNav (56px) + safe area.
    // Without this, the fixed nav sits on top of the input row and blocks interaction.
    <div
      className="flex flex-col overflow-hidden"
      style={{
        height: "100dvh",
        paddingBottom: "calc(56px + env(safe-area-inset-bottom, 0px))",
      }}
    >
      {/* Header */}
      <div className="flex-shrink-0 bg-white border-b border-gray-100 px-4 pt-4 pb-3 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900 leading-tight">
            Ara{" "}
            <span className="text-indigo-500">·</span>{" "}
            <span className="font-normal text-gray-500 text-base">Armenian Tutor</span>
          </h1>
          <p className="text-xs text-gray-400 mt-0.5">Tap any Armenian word to look it up</p>
        </div>
        <button
          onClick={clearChat}
          title="New conversation"
          className="w-9 h-9 flex items-center justify-center rounded-full text-gray-400 hover:bg-gray-100 active:bg-gray-200 transition-colors"
        >
          <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
            <path fillRule="evenodd" clipRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" />
          </svg>
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 min-h-0 overflow-y-auto py-4 flex flex-col gap-4 no-scrollbar">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex items-end gap-2.5 px-4 ${
              msg.role === "user" ? "flex-row-reverse" : "flex-row"
            }`}
          >
            {msg.role === "ara" && (
              <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0 text-sm font-bold text-indigo-600 mb-0.5">
                A
              </div>
            )}
            <div
              className={`max-w-[82%] rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm ${
                msg.role === "user"
                  ? "bg-indigo-600 text-white rounded-br-sm"
                  : "bg-white border border-gray-100 text-gray-800 rounded-bl-sm"
              }`}
            >
              <MessageContent
                text={msg.text}
                isAra={msg.role === "ara"}
                onWordTap={handleWordTap}
              />
            </div>
          </div>
        ))}

        {isLoading && <TypingIndicator />}
        <div ref={messagesEndRef} />
      </div>

      {/* Word popup — inline, above input row, no z-index tricks needed */}
      {wordPopup && <WordPopup info={wordPopup} onClose={() => setWordPopup(null)} />}

      {/* Input row */}
      <div className="flex-shrink-0 bg-white border-t border-gray-100 px-4 py-3 flex items-center gap-2">
        {/* Mic button — only shown if SpeechRecognition is available */}
        {recognitionSupported() && (
          <button
            onClick={listening ? stopListening : startListening}
            aria-label={listening ? "Stop listening" : "Speak your message"}
            className={`w-10 h-10 flex-shrink-0 flex items-center justify-center rounded-full transition-colors ${
              listening
                ? "bg-rose-500 text-white"
                : isLoading
                ? "bg-amber-400 text-white"
                : "bg-gray-100 text-gray-500 hover:bg-gray-200 active:bg-gray-300"
            }`}
          >
            {listening ? (
              // Waveform animation while listening
              <span className="flex gap-px items-end h-4">
                {[2, 4, 3, 4, 2].map((h, i) => (
                  <span
                    key={i}
                    className="w-0.5 bg-white rounded-full animate-pulse"
                    style={{ height: `${h * 3}px`, animationDelay: `${i * 80}ms` }}
                  />
                ))}
              </span>
            ) : isLoading ? (
              // Spinner while waiting for API response
              <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
              </svg>
            ) : (
              <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                <path fillRule="evenodd" clipRule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z" />
              </svg>
            )}
          </button>
        )}

        {/* Text input — controlled, onChange wired to setInput */}
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              sendMessage();
            }
          }}
          placeholder="Type your message..."
          className="flex-1 bg-gray-100 rounded-full px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 outline-none min-w-0"
          disabled={isLoading}
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="sentences"
          spellCheck={false}
        />

        {/* Send button */}
        <button
          onClick={sendMessage}
          disabled={!input.trim() || isLoading}
          aria-label="Send message"
          className="w-10 h-10 flex-shrink-0 flex items-center justify-center rounded-full bg-indigo-600 text-white disabled:opacity-40 active:bg-indigo-700 transition-colors"
        >
          <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 translate-x-px">
            <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
          </svg>
        </button>
      </div>
    </div>
  );
}
