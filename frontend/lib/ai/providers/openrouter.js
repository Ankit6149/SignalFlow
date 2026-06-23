import { PROVIDERS } from "../types";

/**
 * Calls OpenRouter chat completions endpoint.
 */
export async function generateOpenRouter(prompt, modelOverride = null) {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    throw new Error("OpenRouter API key is not configured in server environment variables.");
  }

  const model = modelOverride || PROVIDERS.openrouter.defaultModel || "meta-llama/llama-3-8b-instruct:free";
  const url = "https://openrouter.ai/api/v1/chat/completions";

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
      Authorization: `Bearer ${apiKey}`,
      "HTTP-Referer": "https://github.com/Ankit6149/SignalFlow-Studio",
      "X-Title": "SignalFlow Studio"
    },
    body: JSON.stringify(body),
    signal: controller.signal
  });

  clearTimeout(timeoutId);

  if (!resp.ok) {
    const errorDetails = await resp.text();
    throw new Error(`OpenRouter API response failed (HTTP ${resp.status}): ${errorDetails}`);
  }

  const data = await resp.json();
  const rawText = data?.choices?.[0]?.message?.content;

  if (!rawText) {
    throw new Error("Empty chat content returned by OpenRouter.");
  }

  return rawText;
}
