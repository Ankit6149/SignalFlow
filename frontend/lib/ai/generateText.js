import { generateGemini } from "./providers/gemini";
import { generateGroq } from "./providers/groq";
import { generateOpenRouter } from "./providers/openrouter";
import { generateOllama } from "./providers/ollama";
import { generateLMStudio } from "./providers/lmstudio";
import { generateCustomOpenAI } from "./providers/customOpenAI";

/**
 * Route a raw text request to the selected provider.
 */
export async function generateText({ provider, prompt, modelOverride = null, config = {} }) {
  const p = (provider || "prompt").trim().toLowerCase();

  switch (p) {
    case "gemini":
      return await generateGemini(prompt, modelOverride, config);
    case "groq":
      return await generateGroq(prompt, modelOverride, config);
    case "openrouter":
      return await generateOpenRouter(prompt, modelOverride, config);
    case "ollama":
      return await generateOllama(prompt, modelOverride, config);
    case "lmstudio":
      return await generateLMStudio(prompt, modelOverride, config);
    case "custom":
      return await generateCustomOpenAI(prompt, modelOverride, config);
    default:
      throw new Error(`Text generation not supported for provider mode: "${provider}"`);
  }
}
