export const PROVIDERS = {
  prompt: {
    id: "prompt",
    label: "Prompt only",
    description: "Generates a clean instructions prompt for copy-pasting to a free chatbot.",
    isLocal: true,
    isFree: true,
    isConfigured: () => true,
    defaultModel: "manual-copy"
  },
  template: {
    id: "template",
    label: "Template fallback",
    description: "Uses a deterministic rule-based local generator (offline-friendly).",
    isLocal: true,
    isFree: true,
    isConfigured: () => true,
    defaultModel: "deterministic-local"
  },
  gemini: {
    id: "gemini",
    label: "Google Gemini",
    description: "Google's Gemini models via official BYOK API.",
    isLocal: false,
    isFree: false,
    isConfigured: () => Boolean(process.env.GEMINI_API_KEY),
    defaultModel: process.env.DEFAULT_MODEL_NAME || "gemini-1.5-flash"
  },
  groq: {
    id: "groq",
    label: "Groq",
    description: "Ultra-fast completions endpoint via Groq Cloud.",
    isLocal: false,
    isFree: false,
    isConfigured: () => Boolean(process.env.GROQ_API_KEY),
    defaultModel: process.env.DEFAULT_MODEL_NAME || "llama3-8b-8192"
  },
  openrouter: {
    id: "openrouter",
    label: "OpenRouter",
    description: "Unified AI gateway for open-source and paid models.",
    isLocal: false,
    isFree: false,
    isConfigured: () => Boolean(process.env.OPENROUTER_API_KEY),
    defaultModel: process.env.DEFAULT_MODEL_NAME || "meta-llama/llama-3-8b-instruct:free"
  },
  ollama: {
    id: "ollama",
    label: "Ollama",
    description: "Local model running via Ollama Desktop.",
    isLocal: true,
    isFree: true,
    isConfigured: () => true, // Ollama doesn't require a key
    defaultModel: process.env.DEFAULT_MODEL_NAME || "llama3"
  },
  lmstudio: {
    id: "lmstudio",
    label: "LM Studio",
    description: "Local model running via LM Studio client.",
    isLocal: true,
    isFree: true,
    isConfigured: () => true, // LM Studio doesn't require a key
    defaultModel: process.env.DEFAULT_MODEL_NAME || "any"
  },
  custom: {
    id: "custom",
    label: "Custom Gateway",
    description: "Custom OpenAI-compatible inference endpoint.",
    isLocal: false,
    isFree: false,
    isConfigured: () => Boolean(process.env.CUSTOM_OPENAI_BASE_URL),
    defaultModel: process.env.DEFAULT_MODEL_NAME || "custom-model"
  }
};
