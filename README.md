# Learn Anything

Interactive lessons for any topic built with Next.js.

## Features

- **Chat Interface** - Type what you want to learn
- **Smart Templates** - Auto-detects subject type (language, coding, finance, math, etc.)
- **Interactive Components** - Quizzes, code editors, flashcards, charts
- **Progress Tracking** - See your completion and streaks
- **Clean UI** - Focused, distraction-free learning

## Quick Start

```bash
# Install dependencies
npm install

# Copy env file
cp .env.example .env

# Add your API key
# GROQ_API_KEY=gsk_...

# Run dev server
npm run dev

# Open http://localhost:3000
```

## Supported Templates

| Template | Best For | Components |
|----------|----------|------------|
| **Language** | Spanish, French, Japanese | Flashcards, Conversation, Grammar Quiz |
| **Coding** | Python, JavaScript, React | Code Editor, Challenges, Debugging |
| **Finance** | Stocks, Trading, Crypto | Charts, Pattern Quiz, Scenarios |
| **Math** | Calculus, Algebra, Statistics | Step Solver, Practice Problems |
| **Science** | Physics, Chemistry, Biology | Diagrams, Models, Lab Sim |
| **History** | Wars, Civilizations, Events | Timeline, Maps, Primary Sources |
| **General** | Any other topic | Quiz, Notes, Summary |

## Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS |
| UI | shadcn/ui components |
| LLM | Groq (Llama 3 / Mixtral) |
| Database | MongoDB Atlas (optional) |
| Deploy | Vercel |

## Project Structure

```
learn-anything/
├── app/
│   ├── api/
│   │   └── chat/          # Lesson generation
│   ├── components/        # Reusable UI
│   ├── dashboard/         # User stats
│   ├── lesson/[id]/       # Lesson viewer
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx           # Main chat
├── lib/
│   ├── types.ts           # TypeScript types
│   ├── utils.ts           # Helpers
│   └── templates.ts       # Template logic
├── .env
├── package.json
└── README.md
```

## Deployment

```bash
# Build for production
npm run build

# Deploy to Vercel
vercel

# Or any Node.js host
npm start
```

## API Keys

Get your Groq API key from:
https://console.groq.com/keys

Add to `.env`:
```
GROQ_API_KEY=gsk_...
```

## License

MIT
