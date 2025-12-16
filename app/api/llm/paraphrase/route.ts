import { NextResponse } from 'next/server';
import { z } from 'zod';
import { extractJson, isOllamaReachable, ollamaChat } from '@/lib/llm/ollama';

export const runtime = 'nodejs';

const BodySchema = z.object({
  text: z.string().min(3).max(2000)
});

export async function POST(req: Request) {
  try {
    const body = BodySchema.parse(await req.json());

    const ok = await isOllamaReachable();
    if (!ok) {
      return NextResponse.json(
        { error: 'Local AI is not available (Ollama not reachable).' },
        { status: 503 }
      );
    }

    const raw = await ollamaChat([
      {
        role: 'system',
        content:
          'Rewrite the user text into a more academic IELTS-friendly version while preserving meaning. Output STRICT JSON only: {"rewrite":"...","why":"..."}.'
      },
      { role: 'user', content: body.text }
    ]);

    const json = extractJson<{ rewrite: string; why?: string }>(raw);
    if (!json?.rewrite) {
      return NextResponse.json({ error: 'Model returned invalid output.' }, { status: 500 });
    }

    return NextResponse.json({ rewrite: json.rewrite.trim(), why: json.why?.trim() ?? '' });
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Invalid request';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
