type Message = { role: 'system' | 'user' | 'assistant'; content: string };

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY ?? '';
const OPENROUTER_MODEL = process.env.OPENROUTER_MODEL ?? 'meta-llama/llama-3.1-8b-instruct:free';
const OPENROUTER_BASE_URL = 'https://openrouter.ai/api/v1';

export async function isOpenRouterReachable(): Promise<boolean> {
  if (!OPENROUTER_API_KEY) {
    return false;
  }
  try {
    const res = await fetch(`${OPENROUTER_BASE_URL}/models`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
      },
    });
    return res.ok;
  } catch {
    return false;
  }
}

export async function openRouterChat(messages: Message[]): Promise<string> {
  if (!OPENROUTER_API_KEY) {
    throw new Error('OPENROUTER_API_KEY is not configured');
  }

  const res = await fetch(`${OPENROUTER_BASE_URL}/chat/completions`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': process.env.VERCEL_URL 
        ? `https://${process.env.VERCEL_URL}`
        : 'http://localhost:3000',
      'X-Title': 'IELTS Writing Training Simulator',
    },
    body: JSON.stringify({
      model: OPENROUTER_MODEL,
      messages,
    })
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`OpenRouter request failed (${res.status}): ${errorText}`);
  }

  const data = await res.json() as {
    choices?: Array<{ message?: { content?: string } }>;
  };

  return data.choices?.[0]?.message?.content ?? '';
}

export function extractJson<T>(raw: string): T | null {
  const firstBrace = raw.indexOf('{');
  const lastBrace = raw.lastIndexOf('}');
  if (firstBrace === -1 || lastBrace === -1 || lastBrace <= firstBrace) return null;

  try {
    return JSON.parse(raw.slice(firstBrace, lastBrace + 1)) as T;
  } catch {
    return null;
  }
}
