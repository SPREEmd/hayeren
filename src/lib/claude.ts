type ClaudeRole = "user" | "assistant";
export interface ChatMessage { role: ClaudeRole; content: string }

const isLocal = window.location.hostname === "localhost";
const ANTHROPIC_API_URL = "https://api.anthropic.com/v1/messages";

async function fetchClaude(body: object): Promise<Response> {
  if (isLocal) {
    const key = import.meta.env.VITE_ANTHROPIC_API_KEY as string;
    return fetch(ANTHROPIC_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": key,
        "anthropic-version": "2023-06-01",
        "anthropic-dangerous-direct-browser-access": "true",
      },
      body: JSON.stringify(body),
    });
  }

  // Production: route through Vercel serverless proxy
  const { system, messages, max_tokens } = body as {
    system: string;
    messages: ChatMessage[];
    max_tokens: number;
  };
  return fetch("/api/claude", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ system, messages, maxTokens: max_tokens }),
  });
}

/** Multi-turn chat — pass full conversation history, last message must be "user". */
export async function callClaudeChat(
  systemPrompt: string,
  messages: ChatMessage[],
  maxTokens = 600
): Promise<string> {
  const res = await fetchClaude({
    model: "claude-sonnet-4-20250514",
    max_tokens: maxTokens,
    system: systemPrompt,
    messages,
  });

  if (!res.ok) {
    const errBody = await res.text();
    console.error("[claude] HTTP", res.status, res.statusText);
    console.error("[claude] error body:", errBody);
    return "";
  }
  const data = await res.json();
  return data.content?.[0]?.text ?? "";
}

export async function callClaude(
  systemPrompt: string,
  userMessage: string,
  maxTokens = 500
): Promise<string> {
  const res = await fetchClaude({
    model: "claude-sonnet-4-20250514",
    max_tokens: maxTokens,
    system: systemPrompt,
    messages: [{ role: "user", content: userMessage }],
  });

  if (!res.ok) {
    const errBody = await res.text();
    console.error("[claude] HTTP", res.status, res.statusText);
    console.error("[claude] error body:", errBody);
    return "";
  }
  const data = await res.json();
  return data.content?.[0]?.text ?? "";
}

// ── Armenian pronunciation guide ────────────────────────────

const PRONUNCIATION_SYSTEM = `You are a pronunciation guide for Armenian language learners.
Given an Armenian word and its romanization, output ONLY a simple phonetic spelling
that an English speaker can read aloud to approximate the Armenian pronunciation.
Rules:
- Split into syllables with hyphens
- CAPITALIZE the stressed syllable
- Use familiar English letter combinations (sh, kh, ts, dz, zh, gh)
- Keep it short — one line, no punctuation, no explanation

Examples:
Barev → bah-REV
Shnorhakalutyun → snor-hah-kah-loo-TYOON
Mayr → mah-EER
Inch'pes ek' → inch-PES-ek
Yntanik' → ən-tah-NIK
Katù → kah-TOO`;

// In-memory cache survives the browser session; avoids repeat API calls
const pronunciationCache = new Map<string, string>();

export async function getArmenianPronunciation(
  armenian: string,
  romanization: string
): Promise<string> {
  if (pronunciationCache.has(armenian)) {
    return pronunciationCache.get(armenian)!;
  }

  try {
    const raw = await callClaude(
      PRONUNCIATION_SYSTEM,
      `Armenian: ${armenian}\nRomanization: ${romanization}`,
      40
    );
    const result = raw.trim() || romanization;
    pronunciationCache.set(armenian, result);
    return result;
  } catch {
    return romanization;
  }
}
