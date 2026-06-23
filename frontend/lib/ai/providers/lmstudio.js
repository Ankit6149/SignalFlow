import { PROVIDERS } from "../types";

/**
 * Calls local LM Studio chat completions endpoint.
 */
export async function generateLMStudio(prompt, modelOverride = null, config = {}) {
  const baseUrl = config.baseUrl || process.env.LMSTUDIO_BASE_URL || "http://localhost:1234/v1";
  const url = `${baseUrl.replace(/\/$/, "")}/chat/completions`;

  // LM Studio doesn't strictly validate model name, but uses loaded model by default
  const model = modelOverride || config.modelName || PROVIDERS.lmstudio.defaultModel || "any";

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
  const timeoutId = setTimeout(() => controller.abort(), 45000); // 45s timeout for local running SLMs

  const resp = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(body),
    signal: controller.signal
  });

  clearTimeout(timeoutId);

  if (!resp.ok) {
    const errorDetails = await resp.text();
    throw new Error(`LM Studio response failed (HTTP ${resp.status}): ${errorDetails}`);
  }

  const data = await resp.json();
  const rawText = data?.choices?.[0]?.message?.content;

  if (!rawText) {
    throw new Error("Empty chat content returned by LM Studio.");
  }

  return rawText;
}
