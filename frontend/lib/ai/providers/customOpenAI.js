import { PROVIDERS } from "../types";

/**
 * Calls a custom user-configured OpenAI-compatible completions gateway.
 */
export async function generateCustomOpenAI(prompt, modelOverride = null) {
  const baseUrl = process.env.CUSTOM_OPENAI_BASE_URL;
  if (!baseUrl) {
    throw new Error("Custom OpenAI Base URL is not configured in server environment variables.");
  }

  const apiKey = process.env.CUSTOM_OPENAI_API_KEY;
  const model = modelOverride || PROVIDERS.custom.defaultModel || "custom-model";
  const url = `${baseUrl.replace(/\/$/, "")}/chat/completions`;

  const headers = {
    "Content-Type": "application/json"
  };

  if (apiKey) {
    headers["Authorization"] = `Bearer ${apiKey}`;
  }

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
    headers,
    body: JSON.stringify(body),
    signal: controller.signal
  });

  clearTimeout(timeoutId);

  if (!resp.ok) {
    const errorDetails = await resp.text();
    throw new Error(`Custom OpenAI endpoint response failed (HTTP ${resp.status}): ${errorDetails}`);
  }

  const data = await resp.json();
  const rawText = data?.choices?.[0]?.message?.content;

  if (!rawText) {
    throw new Error("Empty chat content returned by custom OpenAI endpoint.");
  }

  return rawText;
}
