# Migration to OpenRouter Cloud AI

This document describes the migration from a local Ollama-based AI setup to OpenRouter cloud-based AI.

## Summary

The application has been migrated from using local Ollama models to OpenRouter cloud AI service. This makes the application Vercel-friendly and removes the need for local AI infrastructure.

## Changes Made

### 1. New OpenRouter Integration
- **Created**: `lib/llm/openrouter.ts` - New OpenRouter client that replaces the Ollama client
- Uses OpenRouter API (https://openrouter.ai/api/v1)
- Compatible with OpenAI API format
- Supports multiple AI models through a single interface

### 2. API Routes Updated
All AI-powered API routes have been updated to use OpenRouter:
- `app/api/llm/chat/route.ts` - Writing assistant chat
- `app/api/llm/generate-question/route.ts` - IELTS question generation
- `app/api/llm/paraphrase/route.ts` - Text paraphrasing tool

### 3. Configuration Changes
- **`.env.example`**: Updated with OpenRouter environment variables
  - `OPENROUTER_API_KEY` - Required API key from OpenRouter
  - `OPENROUTER_MODEL` - Optional model selection (defaults to free Llama 3.1)
- **`next.config.js`**: Added Vercel optimizations
  - Disabled powered-by header
  - Enabled compression
  - Added external packages configuration for NLP libraries

### 4. Documentation Updates
- **`README.md`**: Complete rewrite with:
  - OpenRouter setup instructions
  - Model selection guide
  - Vercel deployment instructions
  - Removed Ollama references
- **Component updates**: Updated UI text to reflect cloud AI usage

### 5. Vercel Optimization
- **`vercel.json`**: Created Vercel configuration file
- **`.gitignore`**: Added Vercel-specific entries
- Next.js configuration optimized for serverless deployment

### 6. Bug Fixes
- Fixed TypeScript error in `components/PracticeEditor.tsx` (severity type casting)
- Updated `package.json` to use correct `simple-spellchecker` version (1.0.2)

## Environment Variables

### Required
```bash
OPENROUTER_API_KEY=your_api_key_here
```

### Optional
```bash
OPENROUTER_MODEL=meta-llama/llama-3.1-8b-instruct:free
LANGUAGETOOL_URL=http://localhost:8010
```

## Model Options

OpenRouter provides access to many models:

- **Free tier**: `meta-llama/llama-3.1-8b-instruct:free` (default)
- **Paid options**:
  - `openai/gpt-3.5-turbo` - Fast and affordable
  - `openai/gpt-4` - Best quality
  - `anthropic/claude-3-sonnet` - Excellent for writing tasks

See all models at: https://openrouter.ai/models

## Deployment

### Vercel
1. Connect your repository to Vercel
2. Add environment variables in Vercel dashboard:
   - `OPENROUTER_API_KEY` (required)
   - `OPENROUTER_MODEL` (optional)
3. Deploy

The application is now fully compatible with Vercel's serverless architecture.

## Breaking Changes

- Local Ollama setup is no longer supported
- `OLLAMA_URL` and `OLLAMA_MODEL` environment variables are deprecated
- Application now requires internet connection for AI features
- OpenRouter API key is required for AI functionality

## Migration Steps for Existing Users

1. Sign up for OpenRouter account at https://openrouter.ai
2. Get API key from https://openrouter.ai/keys
3. Update your `.env.local`:
   ```bash
   # Remove old variables
   # OLLAMA_URL=...
   # OLLAMA_MODEL=...
   
   # Add new variables
   OPENROUTER_API_KEY=your_api_key_here
   OPENROUTER_MODEL=meta-llama/llama-3.1-8b-instruct:free
   ```
4. Restart your development server

## Benefits

1. **No local infrastructure**: No need to run Ollama locally
2. **Vercel-friendly**: Deploys seamlessly to Vercel
3. **Model flexibility**: Easy access to multiple AI models
4. **Scalability**: Cloud-based AI scales automatically
5. **Reliability**: Professional API with high uptime
6. **Free tier available**: Free Llama 3.1 model for testing

## Support

For OpenRouter-specific issues:
- Documentation: https://openrouter.ai/docs
- API Status: https://status.openrouter.ai

For application issues, please file a GitHub issue.
