export const PRODUCT_NAME = "SignalFlow Studio";

export const MODEL_ROUTES_META = [
  { key: "prompt", title: "Prompt only", desc: "Generates a copyable chatbot instruction prompt.", use: "No API keys needed. Free chatbots.", badge: "Local", price: "Free" },
  { key: "template", title: "SignalFlow AI (Demo Mode)", desc: "Deterministic offline template rules generator.", use: "Fully offline, fast, zero AI calls.", badge: "Local", price: "Free" },
  { key: "openai", title: "OpenAI API", desc: "Native ChatGPT (GPT-4o/mini) BYOK connection.", use: "Best for high-quality, general marketing copy.", badge: "Cloud", price: "BYOK" },
  { key: "claude", title: "Anthropic Claude", desc: "Native Claude 3.5 Sonnet completions.", use: "Best for eloquent brand voice and deep logic.", badge: "Cloud", price: "BYOK" },
  { key: "gemini", title: "Google Gemini", desc: "Native Gemini completions via official BYOK.", use: "Best for structured code & readme context.", badge: "Cloud", price: "BYOK" },
  { key: "groq", title: "Groq Cloud", desc: "Ultra-low-latency open weights completions.", use: "Speedy text and outline synthesis.", badge: "Cloud", price: "BYOK" },
  { key: "openrouter", title: "OpenRouter Gateway", desc: "Access open-source and paid models globally.", use: "Access diverse models under one key.", badge: "Cloud", price: "BYOK" },
  { key: "ollama", title: "Local Ollama", desc: "Runs on your machine at port 11434.", use: "Privacy-centric local generation.", badge: "Local", price: "Free/Local" },
  { key: "lmstudio", title: "LM Studio API", desc: "Runs local models at port 1234.", use: "Privacy-centric local model testing.", badge: "Local", price: "Free/Local" },
  { key: "custom", title: "Custom Gateway", desc: "OpenAI-compatible gateway connection.", use: "Your corporate endpoint or custom API.", badge: "Cloud", price: "BYOK" }
];

export const CHANNELS = [
  ["linkedin", "LinkedIn", "💼", "#0077b5"],
  ["x", "X / Twitter", "🐦", "#000000"],
  ["instagram", "Instagram", "📷", "#E1306C"],
  ["reddit", "Reddit", "👽", "#ff4500"],
  ["hn", "Hacker News", "🧡", "#ff6600"],
  ["blog", "Blog Draft", "✍", "#333333"],
  ["newsletter", "Newsletter", "📧", "#6366F1"],
  ["release_notes", "Release notes", "📋", "#059669"]
];

export const OUTPUT_TYPES = [
  ["caption", "Captions"],
  ["text", "Platform Posts"],
  ["thread", "X Threads"],
  ["image", "Visual Plan"],
  ["video", "Video Scripts"],
  ["carousel", "Carousel Layouts"],
  ["doc", "Briefs & Checklist"]
];

export const STEPS = ["Model", "Source", "Inputs / Settings", "Package Review"];
