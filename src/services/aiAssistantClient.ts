import { AIAssistantRequest, AIAssistantResponse } from '../types.ts';

export async function queryAITradingAssistant(
  payload: AIAssistantRequest
): Promise<AIAssistantResponse> {
  const res = await fetch('/api/ai/trading-assistant', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.error || `AI assistant request failed (${res.status})`);
  }

  return res.json();
}
