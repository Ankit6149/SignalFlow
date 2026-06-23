import { requireOwnerAccess } from "../_auth";
import { generateText } from "../../../lib/ai/generateText";

/**
 * Endpoint to test connectivity to a model provider.
 * Accepts optional temporary API keys that are used only for this request and never persisted.
 */
export async function POST(request) {
  const accessError = requireOwnerAccess(request);
  if (accessError) {
    return accessError;
  }

  try {
    const { provider, modelName, baseUrl, temporaryApiKey } = await request.json();

    if (!provider) {
      return new Response(JSON.stringify({ ok: false, error: "Missing provider parameter" }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }

    const testPrompt = 'Return only JSON: {"ok":true}';
    const config = {
      apiKey: temporaryApiKey || "",
      baseUrl: baseUrl || "",
      modelName: modelName || ""
    };

    let responseText;
    try {
      responseText = await generateText({
        provider,
        prompt: testPrompt,
        modelOverride: modelName,
        config
      });
    } catch (err) {
      return new Response(JSON.stringify({
        ok: false,
        provider,
        modelUsed: modelName,
        error: err.message,
        setupHint: getSetupHint(provider)
      }), {
        status: 200,
        headers: { "Content-Type": "application/json" }
      });
    }

    return new Response(JSON.stringify({
      ok: true,
      provider,
      configured: true,
      modelUsed: modelName,
      message: "Connection successful."
    }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });

  } catch (err) {
    return new Response(JSON.stringify({ ok: false, error: err.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}

function getSetupHint(provider) {
  switch (provider) {
    case "gemini":
      return "Add GEMINI_API_KEY in .env.local or Vercel Environment Variables.";
    case "groq":
      return "Add GROQ_API_KEY in .env.local or Vercel Environment Variables.";
    case "openrouter":
      return "Add OPENROUTER_API_KEY in .env.local or Vercel Environment Variables.";
    case "custom":
      return "Add CUSTOM_OPENAI_BASE_URL and CUSTOM_OPENAI_API_KEY in .env.local or Vercel.";
    case "ollama":
      return "Make sure Ollama is running locally (default: http://localhost:11434) and the requested model is pulled.";
    case "lmstudio":
      return "Make sure LM Studio is running locally (default: http://localhost:1234) and the requested model is loaded.";
    default:
      return "Configure the required environment variables or endpoint URL.";
  }
}
