import type { VercelRequest, VercelResponse } from "@vercel/node";

const GOOGLE_TTS_URL = "https://texttospeech.googleapis.com/v1/text:synthesize";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { text } = req.body as { text: string };

  if (!text) {
    return res.status(400).json({ error: "Missing required field: text" });
  }

  const apiKey = process.env.GOOGLE_TTS_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: "TTS API key not configured" });
  }

  const upstream = await fetch(`${GOOGLE_TTS_URL}?key=${apiKey}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      input: { text },
      voice: { languageCode: "hy-AM" },
      audioConfig: { audioEncoding: "MP3", speakingRate: 0.85 },
    }),
  });

  if (!upstream.ok) {
    const err = await upstream.text();
    console.error("[api/tts] upstream error", upstream.status, err);
    return res.status(upstream.status).json({ error: err });
  }

  const data = await upstream.json() as { audioContent: string };
  return res.status(200).json({ audioContent: data.audioContent });
}
