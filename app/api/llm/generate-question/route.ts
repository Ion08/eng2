import { NextResponse } from 'next/server';
import { z } from 'zod';
import { extractJson, isOpenRouterReachable, openRouterChat } from '@/lib/llm/openrouter';

export const runtime = 'nodejs';

const BodySchema = z.object({
  taskType: z.enum(['task1', 'task2'])
});

function systemPrompt(taskType: 'task1' | 'task2') {
  if (taskType === 'task1') {
    return `You are an IELTS Writing examiner. Generate ONE IELTS Academic Writing Task 1 prompt in an official style.

Constraints:
- Must match real IELTS Task 1 format (graph/chart/table/diagram/map/process).
- Must require a 150-word academic report.
- Must be indistinguishable from an official prompt.
- No explanations.

Output STRICT JSON only: {"prompt": "..."}`;
  }

  return `You are an IELTS Writing examiner. Generate ONE IELTS Writing Task 2 prompt in an official style.

Constraints:
- Must match real IELTS Task 2 formats (opinion / discussion / advantages-disadvantages / problem-solution / two-part).
- Must require a 250-word essay.
- Must be indistinguishable from an official prompt.
- No explanations.

Output STRICT JSON only: {"prompt": "..."}`;
}

export async function POST(req: Request) {
  try {
    const body = BodySchema.parse(await req.json());

    const ok = await isOpenRouterReachable();
    if (!ok) {
      return NextResponse.json(
        {
          error:
            'Cloud AI is not available. Please configure OPENROUTER_API_KEY, or enter your own question.'
        },
        { status: 503 }
      );
    }

    const raw = await openRouterChat([
      { role: 'system', content: systemPrompt(body.taskType) },
      { role: 'user', content: 'Generate now.' }
    ]);

    const json = extractJson<{ prompt: string }>(raw);
    const prompt = json?.prompt?.trim() || raw.trim();

    if (prompt.length < 20) {
      return NextResponse.json({ error: 'Model returned an empty prompt.' }, { status: 500 });
    }

    return NextResponse.json({ prompt });
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Invalid request';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
