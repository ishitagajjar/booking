import Groq from 'groq-sdk';
import { config } from '../config';

const groq = new Groq({
  apiKey: config.groq.apiKey,
});

/**
 * Ask AI (Groq) with optional JSON mode
 */
export async function askAI(
  systemPrompt: string,
  userMessage: string,
  maxTokens = 500,
  jsonMode = false,
): Promise<string> {
  try {
    const response = await groq.chat.completions.create({
      model: config.groq.model,
      max_tokens: maxTokens,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userMessage },
      ],
      ...(jsonMode && { response_format: { type: 'json_object' } }),
    });
    return response.choices[0]?.message?.content || '';
  } catch (error) {
    console.error('Error calling Groq API:', error);
    throw error;
  }
}

/**
 * Stream AI response (for real-time chat)
 */
export async function streamAI(
  systemPrompt: string,
  userMessage: string,
  maxTokens = 1000,
) {
  return groq.chat.completions.create({
    model: config.groq.model,
    max_tokens: maxTokens,
    stream: true,
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userMessage },
    ],
  });
}

export { groq };
