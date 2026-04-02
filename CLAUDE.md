# CLAUDE.md — Hayeren Armenian Learning App
# Project Brief for Claude Code

> Drop this file in the root of your project repo.
> Claude Code will read it at the start of every session.

---

## What this project is

**Hayeren** (Հայերեն — Armenian for "Armenian language") is a mobile-first
Progressive Web App (PWA) for learning the Armenian language from scratch.
It is built by a solo developer as a portfolio project and real learning tool.

The app teaches Eastern Armenian (standard dialect), covering the 38-letter
Aybuben alphabet, core vocabulary, basic grammar, and conversational phrases.
It uses the Claude API as an AI backbone for tutoring, translation, and
adaptive lesson generation.

---

## Tech stack

| Layer | Choice | Why |
|---|---|---|
| Framework | React + TypeScript | Industry standard, strongly typed |
| Build tool | Vite | Fast dev server, PWA plugin support |
| Styling | Tailwind CSS | Mobile-first utility classes |
| PWA | vite-plugin-pwa | Offline support, installable on mobile |
| Routing | React Router v6 | Client-side navigation |
| State | Zustand | Lightweight global store |
| Persistence | localStorage + IndexedDB | User progress, no backend needed |
| AI | Claude API (claude-sonnet-4-20250514) | Tutor, translator, lesson generator |
| Voice | Web Speech API | Built into Chrome + Safari, free |
| Deployment | Vercel | Free tier, auto-deploy from GitHub |

**No backend required.** The Claude API key is set as a Vercel environment
variable. All user data stays on-device.

---

## Project structure

```
hayeren/
├── CLAUDE.md                  ← this file
├── public/
│   ├── manifest.json          ← PWA manifest
│   └── icons/                 ← App icons (192x192, 512x512)
├── src/
│   ├── main.tsx
│   ├── App.tsx
│   ├── data/
│   │   ├── alphabet.ts        ← All 38 letters with metadata
│   │   └── vocabulary.ts      ← 500+ words by category
│   ├── store/
│   │   └── progress.ts        ← Zustand store for SRS + stats
│   ├── lib/
│   │   ├── claude.ts          ← Claude API wrapper
│   │   ├── srs.ts             ← SM-2 spaced repetition algorithm
│   │   └── speech.ts          ← Web Speech API helpers
│   ├── pages/
│   │   ├── Home.tsx
│   │   ├── Alphabet.tsx
│   │   ├── Vocabulary.tsx
│   │   ├── Quiz.tsx
│   │   ├── Translator.tsx
│   │   └── Tutor.tsx
│   ├── components/
│   │   ├── LetterCard.tsx
│   │   ├── FlashCard.tsx
│   │   ├── QuizQuestion.tsx
│   │   ├── ProgressBar.tsx
│   │   ├── BottomNav.tsx
│   │   └── MicButton.tsx
│   └── types/
│       └── index.ts
├── .env.local                 ← VITE_CLAUDE_API_KEY=sk-ant-...
├── vite.config.ts
├── tailwind.config.ts
└── package.json
```

---

## Data models

### Letter (src/data/alphabet.ts)

```typescript
interface Letter {
  armenian: string;        // e.g. "Ա"
  lowercase: string;       // e.g. "ա"
  romanization: string;    // e.g. "a"
  ipa: string;             // e.g. "/ɑ/"
  soundDescription: string; // e.g. "as in father"
  exampleWord: {
    armenian: string;      // e.g. "Խնձոր"
    english: string;       // e.g. "apple"
    romanization: string;  // e.g. "Khndzohr"
  };
  emoji: string;           // e.g. "🍎"
  category: "stop" | "fricative" | "nasal" | "liquid" | "vowel" | "affricate";
}
```

### Vocabulary word (src/data/vocabulary.ts)

```typescript
interface Word {
  id: string;
  armenian: string;
  romanization: string;
  english: string;
  category: VocabCategory;
  difficulty: 1 | 2 | 3;
  exampleSentence?: {
    armenian: string;
    english: string;
  };
}

type VocabCategory =
  | "greetings"
  | "numbers"
  | "colors"
  | "family"
  | "food"
  | "body"
  | "verbs"
  | "adjectives"
  | "places"
  | "time";
```

### SRS card state (src/store/progress.ts)

```typescript
interface CardProgress {
  id: string;
  easeFactor: number;     // SM-2: starts at 2.5
  interval: number;       // days until next review
  repetitions: number;    // times reviewed correctly
  nextReview: number;     // Unix timestamp
  lapses: number;         // times forgotten
}
```

---

## Features — build in this order

### Phase 1 — Core (build first)

#### 1. Alphabet browser
- Grid of all 38 letters, tappable
- Each letter opens a detail card showing:
  - Large Armenian letter (both cases)
  - Romanization + IPA
  - Sound description
  - Example word with emoji, Armenian spelling, English translation, and romanization
- Swipe left/right to navigate between letters on mobile

#### 2. Alphabet quiz
- Show a letter → user picks which example word/emoji it matches
- 4 multiple-choice options
- Show correct answer + word details after each pick
- Track score and streak

#### 3. Vocabulary flashcards
- Cards show Armenian front, English + romanization on flip
- Categories filterable (greetings, food, numbers, etc.)
- Mark as "got it" or "again" — feeds into SRS

#### 4. Spaced repetition system (SRS)
- Implement SM-2 algorithm in src/lib/srs.ts
- Due cards surface automatically in a "Review" session
- Daily review count shown on home screen

---

### Phase 2 — AI features

#### 5. Two-way voice translator

**This is the headline feature.** Build it as a dedicated full-screen page.

Flow:
1. User taps mic button
2. Web SpeechRecognition captures speech in English (or Armenian)
3. Text sent to Claude API with translation prompt
4. Response shown: Armenian script + romanization + pronunciation tip
5. SpeechSynthesis reads the Armenian translation aloud
6. User can tap any word to get a breakdown

Claude API system prompt for translator:
```
You are an Armenian language translator. When given English text, return ONLY a JSON object:
{
  "armenian": "<Armenian script>",
  "romanization": "<pronunciation guide>",
  "literal": "<word-for-word breakdown>",
  "tip": "<one short pronunciation tip>"
}
When given Armenian text, return:
{
  "english": "<English translation>",
  "notes": "<any cultural or linguistic notes>"
}
Return ONLY the JSON object. No other text.
```

Language detection: if input contains Armenian Unicode characters (U+0531–U+058F),
treat as Armenian → English. Otherwise treat as English → Armenian.

#### 6. AI tutor chat

- Persistent chat interface (history stored in sessionStorage)
- Warm, encouraging persona (see system prompt below)
- Understands context: knows user is a beginner learning Armenian
- Tapping any Armenian word in the chat opens a popup with its breakdown

Claude API system prompt for tutor:
```
You are Ara, a warm and encouraging Armenian language tutor. The user is a
complete beginner learning Eastern Armenian. Keep responses concise (3-5
sentences max unless they ask for more). Always include Armenian script with
romanization in parentheses when introducing words. Use simple English.
Celebrate small wins. If they try to write Armenian even imperfectly, praise
the attempt before correcting. Never make them feel bad for mistakes.
```

#### 7. Adaptive lesson generator

- On the home screen, a "Today's Lesson" card
- Claude generates a 5-question mini-lesson based on which words the user
  keeps getting wrong (pulled from SRS lapse data)
- Lesson types: fill-in-the-blank, match the word, translate this phrase

Claude prompt for lesson generation:
```
The user is learning Armenian and struggles with these words: {wordList}.
Create a 5-question lesson. Return ONLY a JSON array of question objects:
[{
  "type": "multiple_choice" | "fill_blank" | "translate",
  "prompt": "<question text>",
  "armenian": "<Armenian if relevant>",
  "options": ["<opt1>", "<opt2>", "<opt3>", "<opt4>"],
  "answer": "<correct answer>",
  "explanation": "<brief explanation>"
}]
```

---

### Phase 3 — Polish

#### 8. Progress dashboard (Home screen)
- Streak counter (days studied in a row)
- Letters mastered (% of 38)
- Words learned (count)
- Cards due for review today
- Weekly activity heatmap (simple grid, no library needed)

#### 9. Onboarding flow
- 3-screen intro on first launch
- Screen 1: Welcome + what the app does
- Screen 2: Quick alphabet preview (show 5 letters with their sounds)
- Screen 3: Choose starting point (Alphabet / Vocabulary / Jump to Translator)
- Store onboarding completion in localStorage

#### 10. Settings
- Toggle: show romanization (on by default, can hide for challenge mode)
- Toggle: auto-play pronunciation on card flip
- Reset progress button (with confirmation)

---

## Claude API integration (src/lib/claude.ts)

```typescript
const CLAUDE_API_URL = "https://api.anthropic.com/v1/messages";

async function callClaude(
  systemPrompt: string,
  userMessage: string,
  maxTokens = 500
): Promise<string> {
  const response = await fetch(CLAUDE_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": import.meta.env.VITE_CLAUDE_API_KEY,
      "anthropic-version": "2023-06-01",
      "anthropic-dangerous-direct-browser-access": "true",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: maxTokens,
      system: systemPrompt,
      messages: [{ role: "user", content: userMessage }],
    }),
  });

  const data = await response.json();
  return data.content?.[0]?.text ?? "";
}
```

**Important:** The `anthropic-dangerous-direct-browser-access` header allows
browser-to-API calls during development. In production, proxy through a
Vercel Edge Function to keep the key server-side.

---

## Voice / speech (src/lib/speech.ts)

```typescript
// Speech recognition (user speaks → text)
export function startListening(
  onResult: (text: string) => void,
  lang: "en-US" | "hy-AM" = "en-US"
): () => void {
  const SpeechRecognition =
    window.SpeechRecognition || window.webkitSpeechRecognition;
  const recognition = new SpeechRecognition();
  recognition.lang = lang;
  recognition.continuous = false;
  recognition.interimResults = false;
  recognition.onresult = (e) => onResult(e.results[0][0].transcript);
  recognition.start();
  return () => recognition.stop();
}

// Speech synthesis (text → Armenian spoken aloud)
export function speak(text: string, lang = "hy-AM") {
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = lang;
  utterance.rate = 0.85; // slightly slower for learning
  window.speechSynthesis.speak(utterance);
}
```

---

## Mobile UX rules

- All tap targets minimum 44px height
- Bottom navigation bar (5 tabs: Home, Alphabet, Vocabulary, Translate, Tutor)
- No hover-only interactions — everything must work with tap
- Swipe gestures on flashcards (right = correct, left = wrong)
- Safe area insets for iPhone notch: use `env(safe-area-inset-bottom)`
- Test on 375px width (iPhone SE) — the minimum target viewport

---

## Environment setup

```bash
# .env.local (never commit this file)
VITE_CLAUDE_API_KEY=sk-ant-your-key-here
```

For Vercel deployment:
- Add `VITE_CLAUDE_API_KEY` in Vercel project settings → Environment Variables
- The `VITE_` prefix exposes it to the browser bundle
- For production security, refactor to use a Vercel Edge Function as a proxy

---

## Portfolio talking points

When presenting this project in interviews, lead with:

1. **AI integration** — Claude API powers three distinct features
   (translator, tutor, lesson generator) with different prompting strategies
2. **Algorithm implementation** — SM-2 spaced repetition, a real cognitive
   science algorithm used by Anki and Duolingo
3. **Progressive Web App** — installable on any phone without an app store,
   works offline for core features
4. **Voice I/O** — Web Speech API for both recognition and synthesis,
   enabling a hands-free study mode
5. **TypeScript throughout** — strict types on all data models and API responses
6. **Prompt engineering** — structured JSON outputs from Claude to power
   dynamic UI without a traditional backend

---

## Commands Claude Code should know

```bash
npm run dev          # start dev server at localhost:5173
npm run build        # production build
npm run preview      # preview production build locally
npm run type-check   # tsc --noEmit
```

---

## What NOT to build (keep it simple)

- No user accounts or authentication
- No database or backend server
- No social features
- No audio recording/storage
- No video content
- No in-app purchases

All of these can be added later. Ship the core loop first.

---

## First session checklist

When starting a new Claude Code session on this project:

1. Read this CLAUDE.md file
2. Check what already exists in src/
3. Ask which phase/feature to work on next
4. Never delete existing progress without confirming
5. Never commit API keys
6. Always keep mobile-first in mind — if it doesn't work on 375px, it's not done
