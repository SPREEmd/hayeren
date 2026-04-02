import type { VercelRequest, VercelResponse } from "@vercel/node";

const ANTHROPIC_API_URL = "https://api.anthropic.com/v1/messages";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { system, message, messages, maxTokens = 500 } = req.body as {
    system: string;
    message?: string;
    messages?: { role: "user" | "assistant"; content: string }[];
    maxTokens?: number;
  };

  if (!system || (!message && !messages)) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: "API key not configured" });
  }

  const body = {
    model: "claude-sonnet-4-20250514",
    max_tokens: maxTokens,
    system,
    messages: messages ?? [{ role: "user", content: message }],
  };

  const upstream = await fetch(ANTHROPIC_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify(body),
  });

  if (!upstream.ok) {
    const err = await upstream.text();
    console.error("[api/claude] upstream error", upstream.status, err);
    return res.status(upstream.status).json({ error: err });
  }

  const data = await upstream.json();
  return res.status(200).json(data);
}
