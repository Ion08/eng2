# IELTS Writing Training & Exam Simulation

An IELTS Writing practice + exam simulation web app powered by cloud AI.

## Goals

- Practice mode: live grammar/spelling feedback + educational assistant tools.
- Test mode: timer + word count only (no hints), with an IELTS-like interface.
- Evaluation: explainable, consistent scoring aligned to IELTS public descriptors.
- Cloud AI via **OpenRouter** for intelligent features.

## Tech

- Next.js (React) + TypeScript
- Local analysis: rule-based scoring + open-source NLP utilities
- Cloud AI: **OpenRouter** (access to multiple AI models)
- Optional advanced grammar: LanguageTool (self-host)
- Vercel-ready deployment

## Run Locally

```bash
npm install
npm run dev
```

Open http://localhost:3000

## Setup: OpenRouter Cloud AI (Required for AI features)

This app uses [OpenRouter](https://openrouter.ai) to provide AI-powered features like:
- Question generation
- Intelligent paraphrasing
- Writing assistant chat

### Getting Started with OpenRouter

1. Sign up at [https://openrouter.ai](https://openrouter.ai)
2. Get your API key at [https://openrouter.ai/keys](https://openrouter.ai/keys)
3. Create a `.env.local` file:

```bash
OPENROUTER_API_KEY=your_api_key_here
OPENROUTER_MODEL=meta-llama/llama-3.1-8b-instruct:free
```

### Model Options

OpenRouter provides access to many models. Some options:

- `meta-llama/llama-3.1-8b-instruct:free` (free tier, default)
- `openai/gpt-3.5-turbo` (paid, faster)
- `openai/gpt-4` (paid, best quality)
- `anthropic/claude-3-sonnet` (paid, excellent for writing)

See all models at: [https://openrouter.ai/models](https://openrouter.ai/models)

**Note:** Without OpenRouter configured, the app will still work for manual questions and evaluation, but AI-powered features will be disabled.

## Deploy to Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)

1. Click the button above or connect your repository to Vercel
2. Add environment variables in Vercel dashboard:
   - `OPENROUTER_API_KEY` (required)
   - `OPENROUTER_MODEL` (optional)
3. Deploy!

## Optional: LanguageTool server (better grammar detection)

If you run a LanguageTool server, set:

```bash
LANGUAGETOOL_URL=http://localhost:8010
```

Without LanguageTool, the app falls back to lightweight local checks.
