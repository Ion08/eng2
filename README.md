# IELTS Writing Training & Exam Simulation

A local-first IELTS Writing practice + exam simulation web app.

## Goals

- Practice mode: live grammar/spelling feedback + educational assistant tools.
- Test mode: timer + word count only (no hints), with an IELTS-like interface.
- Evaluation: explainable, consistent scoring aligned to IELTS public descriptors.
- **No paid APIs**. Optional local AI via open-source models.

## Tech

- Next.js (React) + TypeScript
- Local analysis: rule-based scoring + open-source NLP utilities
- Optional local LLM: **Ollama** (open-source models)
- Optional advanced grammar: LanguageTool (self-host)

## Run

```bash
npm install
npm run dev
```

Open http://localhost:3000

## Optional: Local LLM (question generation, paraphrasing, assistant)

Install Ollama and pull an open model (examples):

```bash
ollama pull llama3.1:8b
# or
ollama pull mistral:7b
```

Create `.env.local`:

```bash
OLLAMA_URL=http://localhost:11434
OLLAMA_MODEL=llama3.1:8b
```

If Ollama is not available, the app will still work for **manual questions** and deterministic evaluation, but AI tools will be disabled.

## Optional: LanguageTool server (better grammar detection)

If you run a LanguageTool server, set:

```bash
LANGUAGETOOL_URL=http://localhost:8010
```

Without LanguageTool, the app falls back to lightweight local checks.
