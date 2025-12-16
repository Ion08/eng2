import { NextResponse } from 'next/server';
import { z } from 'zod';
import { isOllamaReachable, ollamaChat } from '@/lib/llm/ollama';

export const runtime = 'nodejs';

const BodySchema = z.object({
  prompt: z.string().min(10).max(4000),
  taskType: z.enum(['task1', 'task2']),
  essay: z.string().max(20000),
  userMessage: z.string().min(1).max(2000)
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

    const system = `You are a strict IELTS Writing teacher and examiner.

Rules:
- Be concrete and specific; avoid generic advice.
- Use IELTS criteria: Task Response/Achievement, Coherence & Cohesion, Lexical Resource, Grammatical Range & Accuracy.
- Point out errors and propose improved academic alternatives.
- In Practice Mode you may give feedback during writing.

Context:
TASK TYPE: ${body.taskType}
QUESTION: ${body.prompt}
CANDIDATE TEXT (may be partial):
${body.essay}`;

    const reply = await ollamaChat([
      { role: 'system', content: system },
      { role: 'user', content: body.userMessage }
    ]);

    return NextResponse.json({ reply });
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Invalid request';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
