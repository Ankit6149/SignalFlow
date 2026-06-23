import { PROVIDERS } from "../types";

/**
 * Calls Groq Cloud chat completion endpoint.
 */
export async function generateGroq(prompt, modelOverride = null) {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    throw new Error("Groq API key is not configured in server environment variables.");
  }

  const model = modelOverride || PROVIDERS.groq.defaultModel || "llama3-8b-8192";
  const url = "https://api.groq.com/openai/v1/chat/completions";

  const body = {
    model,
    messages: [
      {
        role: "user",
        content: prompt
      }
    ],
    response_format: {
      type: "json_object"
    },
    temperature: 0.2
  };

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 35000); // 35s timeout

  const resp = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`
    },
    body: JSON.stringify(body),
    signal: controller.signal
  });

  clearTimeout(timeoutId);

  if (!resp.ok) {
    const errorDetails = await resp.text();
    throw new Error(`Groq API response failed (HTTP ${resp.status}): ${errorDetails}`);
  }

  const data = await resp.json();
  const rawText = data?.choices?.[0]?.message?.content;

  if (!rawText) {
    throw new Error("Empty chat content returned by Groq completions.");
  }

  return rawText;
}
