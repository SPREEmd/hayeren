export type VoiceMode = "native" | "romanized" | "tts";

const isLocal = window.location.hostname === "localhost";

// ── Module-level cache ─────────────────────────────────────────────────────

let cachedMode: VoiceMode | undefined;
let detectionPromise: Promise<VoiceMode> | undefined;

// ── Voice loading ──────────────────────────────────────────────────────────

/** Resolves once the browser's voice list is populated (async in Chrome). */
function waitForVoices(): Promise<SpeechSynthesisVoice[]> {
  return new Promise((resolve) => {
    const voices = window.speechSynthesis.getVoices();
    if (voices.length > 0) { resolve(voices); return; }
    const handler = () => resolve(window.speechSynthesis.getVoices());
    window.speechSynthesis.addEventListener("voiceschanged", handler, { once: true });
    setTimeout(() => resolve([]), 2500);
  });
}

/**
 * Find the best Armenian voice from the loaded voice list.
 * Preference order: exact "hy-AM" → any "hy" variant → null.
 * Only call this after waitForVoices() has resolved.
 */
function pickArmenianVoice(): SpeechSynthesisVoice | null {
  const voices = window.speechSynthesis.getVoices();
  return (
    voices.find((v) => v.lang === "hy-AM") ??
    voices.find((v) => v.lang.startsWith("hy")) ??
    null
  );
}

// ── Mode detection (used by SpeakerButton badge) ───────────────────────────

export function detectVoiceMode(): Promise<VoiceMode> {
  if (cachedMode !== undefined) return Promise.resolve(cachedMode);
  if (detectionPromise) return detectionPromise;
  detectionPromise = waitForVoices().then((voices) => {
    cachedMode = voices.some((v) => v.lang.startsWith("hy")) ? "native" : "romanized";
    return cachedMode;
  });
  return detectionPromise;
}

// ── Google TTS (via proxy in prod, skipped locally) ────────────────────────

let ttsAvailable: boolean | undefined;

/**
 * Speak Armenian text via the /api/tts server proxy (Google TTS).
 * Skipped entirely on localhost — returns false so the caller falls back
 * to Web Speech API. Returns true on success, false otherwise.
 */
export async function speakArmenianTTS(armenian: string): Promise<boolean> {
  if (isLocal) return false;
  if (ttsAvailable === false) return false;

  try {
    const res = await fetch("/api/tts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: armenian }),
    });

    if (!res.ok) {
      ttsAvailable = false;
      return false;
    }

    const { audioContent } = await res.json() as { audioContent: string };
    if (!audioContent) { ttsAvailable = false; return false; }

    const binary = atob(audioContent);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);

    const blob = new Blob([bytes], { type: "audio/mpeg" });
    const url = URL.createObjectURL(blob);
    const audio = new Audio(url);
    audio.addEventListener("ended", () => URL.revokeObjectURL(url), { once: true });
    await audio.play();

    ttsAvailable = true;
    return true;
  } catch {
    ttsAvailable = false;
    return false;
  }
}

// ── Public API ─────────────────────────────────────────────────────────────

/**
 * Speak an Armenian word using the best available method:
 *   1. Google TTS via /api/tts (production only — highest quality)
 *   2. Native hy-AM browser voice (Web Speech API)
 *   3. Romanization via en-US voice (fallback, slower rate for clarity)
 */
export async function speakArmenian(
  armenian: string,
  romanization: string
): Promise<void> {
  // Try Google TTS first (no-op on localhost)
  const usedTTS = await speakArmenianTTS(armenian);
  if (usedTTS) return;

  // Fall back to Web Speech API
  if (!("speechSynthesis" in window)) return;
  window.speechSynthesis.cancel();

  const mode = await detectVoiceMode();
  const utt = new SpeechSynthesisUtterance();

  if (mode === "native") {
    const voice = pickArmenianVoice();
    utt.text = armenian;
    utt.lang = voice?.lang ?? "hy-AM";
    utt.rate = 0.85;
    if (voice) utt.voice = voice;
  } else {
    utt.text = romanization;
    utt.lang = "en-US";
    utt.rate = 0.7;
  }

  window.speechSynthesis.speak(utt);
}

/** Cancel any ongoing speech. */
export function stopSpeech(): void {
  if ("speechSynthesis" in window) window.speechSynthesis.cancel();
}

/** True if the browser supports speech synthesis. */
export function speechSupported(): boolean {
  return "speechSynthesis" in window;
}
