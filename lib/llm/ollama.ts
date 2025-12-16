type OllamaMessage = { role: 'system' | 'user' | 'assistant'; content: string };

const OLLAMA_URL = process.env.OLLAMA_URL ?? 'http://localhost:11434';
const OLLAMA_MODEL = process.env.OLLAMA_MODEL ?? 'llama3.1:8b';

export async function isOllamaReachable(): Promise<boolean> {
  try {
    const res = await fetch(`${OLLAMA_URL}/api/tags`, { method: 'GET' });
    return res.ok;
  } catch {
    return false;
  }
}

export async function ollamaChat(messages: OllamaMessage[]): Promise<string> {
  const res = await fetch(`${OLLAMA_URL}/api/chat`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      model: OLLAMA_MODEL,
      stream: false,
      messages
    })
  });

  if (!res.ok) {
    throw new Error(`Ollama request failed (${res.status})`);
  }

  const data = (await res.json()) as {
    message?: { content?: string };
    response?: string;
  };

  return data.message?.content ?? data.response ?? '';
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
