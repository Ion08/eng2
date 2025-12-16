import { NextResponse } from 'next/server';
import { z } from 'zod';
import { evaluateWriting } from '@/lib/evaluation/evaluate';

export const runtime = 'nodejs';

const BodySchema = z.object({
  taskType: z.enum(['task1', 'task2']),
  prompt: z.string().min(10).max(4000),
  essay: z.string().min(1).max(20000)
});

export async function POST(req: Request) {
  try {
    const body = BodySchema.parse(await req.json());
    const result = await evaluateWriting(body);
    return NextResponse.json(result);
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Invalid request';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
