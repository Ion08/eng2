import { NextResponse } from 'next/server';
import { z } from 'zod';
import { analyzeGrammar } from '@/lib/analysis/grammar';

export const runtime = 'nodejs';

const BodySchema = z.object({
  text: z.string().min(1).max(20000)
});

export async function POST(req: Request) {
  try {
    const body = BodySchema.parse(await req.json());
    const matches = await analyzeGrammar(body.text);
    return NextResponse.json({ matches });
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Invalid request';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
