import { generateGemini } from "./providers/gemini";
import { generateGroq } from "./providers/groq";
import { generateOpenRouter } from "./providers/openrouter";
import { generateOllama } from "./providers/ollama";
import { generateLMStudio } from "./providers/lmstudio";
import { generateCustomOpenAI } from "./providers/customOpenAI";

/**
 * Route a raw text request to the selected provider.
 */
export async function generateText({ provider, prompt, modelOverride = null }) {
  const p = (provider || "prompt").trim().toLowerCase();

  switch (p) {
    case "gemini":
      return await generateGemini(prompt, modelOverride);
    case "groq":
      return await generateGroq(prompt, modelOverride);
    case "openrouter":
      return await generateOpenRouter(prompt, modelOverride);
    case "ollama":
      return await generateOllama(prompt, modelOverride);
    case "lmstudio":
      return await generateLMStudio(prompt, modelOverride);
    case "custom":
      return await generateCustomOpenAI(prompt, modelOverride);
    default:
      throw new Error(`Text generation not supported for provider mode: "${provider}"`);
  }
}
