export type VoiceMode = "native" | "romanized";

// ── Module-level cache ─────────────────────────────────────────────────────

let cachedMode: VoiceMode | undefined;
let detectionPromise: Promise<VoiceMode> | undefined;

// ── Voice loading ──────────────────────────────────────────────────────────

function waitForVoices(): Promise<SpeechSynthesisVoice[]> {
  return new Promise((resolve) => {
    const voices = window.speechSynthesis.getVoices();
    if (voices.length > 0) { resolve(voices); return; }
    const handler = () => resolve(window.speechSynthesis.getVoices());
    window.speechSynthesis.addEventListener("voiceschanged", handler, { once: true });
    setTimeout(() => resolve([]), 2500);
  });
}

function pickArmenianVoice(): SpeechSynthesisVoice | null {
  const voices = window.speechSynthesis.getVoices();
  return (
    voices.find((v) => v.lang === "hy-AM") ??
    voices.find((v) => v.lang.startsWith("hy")) ??
    null
  );
}

// ── Mode detection ─────────────────────────────────────────────────────────

export function detectVoiceMode(): Promise<VoiceMode> {
  if (cachedMode !== undefined) return Promise.resolve(cachedMode);
  if (detectionPromise) return detectionPromise;
  detectionPromise = waitForVoices().then((voices) => {
    cachedMode = voices.some((v) => v.lang.startsWith("hy")) ? "native" : "romanized";
    return cachedMode;
  });
  return detectionPromise;
}

// ── Public API ─────────────────────────────────────────────────────────────

/**
 * Speak an Armenian word using the best available browser voice:
 *   native    — hy-AM preferred, then any hy variant; speaks Armenian script at 0.85×
 *   romanized — en-US fallback; speaks the romanization at 0.7×
 */
export async function speakArmenian(
  armenian: string,
  romanization: string
): Promise<void> {
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

export function stopSpeech(): void {
  if ("speechSynthesis" in window) window.speechSynthesis.cancel();
}

export function speechSupported(): boolean {
  return "speechSynthesis" in window;
}
