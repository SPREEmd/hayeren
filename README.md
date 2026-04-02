# Հայերեն · Hayeren

### An AI-powered Armenian language learning app — live at [hayeren.vercel.app](https://hayeren.vercel.app)

![React](https://img.shields.io/badge/React-18-blue?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)
![Vite](https://img.shields.io/badge/Vite-7-purple?logo=vite)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-38BDF8?logo=tailwindcss)
![Claude API](https://img.shields.io/badge/Claude-API-orange)
![PWA](https://img.shields.io/badge/PWA-installable-green)
![Vercel](https://img.shields.io/badge/Deployed-Vercel-black?logo=vercel)

---

## What it is

Hayeren is a mobile-first Progressive Web App for learning Eastern Armenian from scratch. It covers the full 38-letter Aybuben alphabet, 100+ vocabulary words with spaced repetition, a two-way voice translator, and an AI tutor — all powered by the Claude API.

Built as a solo portfolio project in one weekend using Claude Code.

---

## Live demo

**[hayeren.vercel.app](https://hayeren.vercel.app)**

Installable on iPhone (Safari → Share → Add to Home Screen) and Android (Chrome → Add to Home Screen).

---

## Features

### Alphabet browser
- All 38 Armenian letters with romanization, IPA, and sound description
- Each letter paired with a picture, example word in Armenian script, English translation, and romanization
- Tap any letter to see full detail card
- Swipe gestures to navigate between letters on mobile

### Alphabet quiz
- Show a letter — pick which picture/emoji matches it from 4 choices
- Score and streak tracking
- Full word revealed after each answer

### Vocabulary flashcards
- 100+ words organized by category (greetings, numbers, colors, family, food, verbs, and more)
- Cards flip on tap to reveal English translation and romanization
- Syllable-by-syllable pronunciation guide on each card

### Spaced repetition (SM-2)
- Implemented the SM-2 algorithm from scratch in TypeScript
- Cards resurface based on performance — harder words appear more often
- Daily review queue on the home screen
- Same algorithm used by Anki and Duolingo

### Two-way voice translator
- Speak in English → get Armenian script + romanization + pronunciation tip
- Speak or type in Armenian → get English translation
- Auto-detects language direction using Unicode range detection
- Powered by the Claude API with structured JSON output

### AI tutor — Ara
- Conversational tutor with a warm, encouraging persona
- Knows you're a beginner — keeps explanations simple
- Always includes Armenian script with romanization when introducing words
- Tapping any Armenian word in the chat opens a pronunciation popup
- Conversation history persists within the session

### Adaptive lesson generator
- Pulls which words you've gotten wrong most from the SRS store
- Sends them to Claude to generate a custom 5-question mini-lesson
- Three question types: multiple choice, fill in the blank, translation
- Ara gives encouragement at the end based on your score

### Progress dashboard
- Daily study streak counter
- Letters mastered percentage
- Total words learned
- Cards due for review today
- Weekly activity grid

### Onboarding
- 3-screen intro on first launch
- Choose where to start: Alphabet, Vocabulary, or Translator

---

## Tech stack

| Layer | Choice |
|---|---|
| Framework | React 18 + TypeScript |
| Build | Vite 7 |
| Styling | Tailwind CSS |
| State | Zustand |
| Persistence | localStorage |
| AI | Claude API (claude-sonnet-4-20250514) |
| Voice | Web Speech API (SpeechRecognition + SpeechSynthesis) |
| PWA | vite-plugin-pwa + Workbox |
| Deployment | Vercel |

---

## How to run locally

```bash
# Clone the repo
git clone https://github.com/SPREEmd/hayeren.git
cd hayeren

# Install dependencies
npm install

# Add your Anthropic API key
echo "VITE_ANTHROPIC_API_KEY=sk-ant-your-key-here" > .env.local

# Start the dev server
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

Get an Anthropic API key at [console.anthropic.com](https://console.anthropic.com)

---

## Project structure

```
src/
├── data/
│   ├── alphabet.ts      # All 38 letters with metadata
│   └── vocabulary.ts    # 100+ words by category
├── lib/
│   ├── claude.ts        # Claude API wrapper
│   ├── speech.ts        # Web Speech API helpers
│   └── srs.ts           # SM-2 spaced repetition algorithm
├── pages/
│   ├── Home.tsx         # Dashboard + today's lesson
│   ├── Alphabet.tsx     # Letter browser + detail cards
│   ├── Vocabulary.tsx   # Flashcard system
│   ├── Quiz.tsx         # Alphabet picture quiz
│   ├── Translator.tsx   # Two-way voice translator
│   └── Tutor.tsx        # AI tutor chat
├── store/
│   └── progress.ts      # Zustand store for SRS + stats
└── components/
    ├── BottomNav.tsx
    ├── FlashCard.tsx
    ├── LetterCard.tsx
    └── TodayLesson.tsx
```

---

## What I learned building this

- Prompt engineering for structured outputs — getting Claude to return clean JSON for the translator and lesson generator required careful system prompt design
- The SM-2 algorithm — implementing spaced repetition from scratch taught me how interval scheduling and ease factors work together
- PWA deployment — working through Node version conflicts, package-lock mismatches, and Vercel runtime configuration in production
- Web Speech API limitations — Armenian (`hy-AM`) has limited TTS support across devices, which led me to build a pronunciation guide fallback
- Mobile UX patterns — fixed headers with independently scrolling content lists, safe-area insets for iPhone notch, minimum 44px tap targets

---

## Roadmap

- [ ] Armenian TTS via server-side Google Cloud proxy
- [ ] Sentence building exercises  
- [ ] User accounts + cross-device progress sync
- [ ] Audio recording for pronunciation feedback
- [ ] Western Armenian dialect support

---

## License

MIT
