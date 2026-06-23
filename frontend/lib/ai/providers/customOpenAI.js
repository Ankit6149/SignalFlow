import { PROVIDERS } from "../types";

/**
 * Calls a custom user-configured OpenAI-compatible completions gateway.
 */
export async function generateCustomOpenAI(prompt, modelOverride = null, config = {}) {
  const baseUrl = config.baseUrl || process.env.CUSTOM_OPENAI_BASE_URL;
  if (!baseUrl) {
    throw new Error("Custom OpenAI Base URL is not configured (missing CUSTOM_OPENAI_BASE_URL).");
  }

  const apiKey = config.apiKey || process.env.CUSTOM_OPENAI_API_KEY;
  const model = modelOverride || config.modelName || PROVIDERS.custom.defaultModel || "custom-model";
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

  let resp;
  try {
    resp = await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify(body),
      signal: controller.signal
    });
  } catch (err) {
    if (err.name === "AbortError") {
      throw new Error("Request to custom OpenAI API timed out after 35 seconds.");
    }
    throw err;
  } finally {
    clearTimeout(timeoutId);
  }

  if (!resp.ok) {
    let errorDetails = "";
    try {
      const errorJson = await resp.json();
      errorDetails = errorJson?.error?.message || JSON.stringify(errorJson);
    } catch {
      errorDetails = await resp.text();
    }
    throw new Error(`Custom OpenAI endpoint response failed (HTTP ${resp.status}): ${errorDetails}`);
  }

  const data = await resp.json();
  const rawText = data?.choices?.[0]?.message?.content;

  if (!rawText) {
    throw new Error("Empty chat content returned by custom OpenAI endpoint.");
  }

  return rawText;
}
