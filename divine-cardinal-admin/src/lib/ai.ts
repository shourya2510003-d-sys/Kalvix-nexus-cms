import { GoogleGenerativeAI } from '@google/generative-ai';

export async function generateAiContent(prompt: string, apiKey: string, provider: string, webhookUrl?: string): Promise<string> {
  if (provider === 'make.com') {
    if (!webhookUrl) throw new Error('Make.com Webhook URL is not configured in settings.');
    const res = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt })
    });
    const text = await res.text();
    // Make.com should respond with the final JSON string directly.
    return text;
  }

  if (!apiKey) {
    throw new Error('API_KEY is not configured in environment or settings.');
  }

  if (provider === 'groq') {
    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'openai/gpt-oss-120b',
        messages: [{ role: 'user', content: prompt }],
        response_format: { type: 'json_object' }
      })
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(`Groq API Error: ${data.error?.message || JSON.stringify(data)}`);
    }
    return data.choices[0].message.content;
  } else {
    // Default to Gemini
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ 
      model: 'gemini-3.6-flash',
      generationConfig: { responseMimeType: 'application/json' }
    });
    const result = await model.generateContent(prompt);
    return result.response.text();
  }
}
