import { generateText } from "./generateText";

/**
 * Executes a prompt, requests JSON, and performs robust string-to-JSON repairs.
 */
export async function generateJSON({ provider, prompt, modelOverride = null }) {
  const rawText = await generateText({ provider, prompt, modelOverride });
  
  if (!rawText || typeof rawText !== "string") {
    throw new Error("Model returned empty or non-string response.");
  }

  // Attempt standard parsing first
  try {
    return JSON.parse(rawText.trim());
  } catch (err) {
    // Continue to repair flow
  }

  // Repair Step 1: Remove markdown JSON blocks if present
  let cleanText = rawText.trim();
  if (cleanText.includes("```")) {
    // Matches ```json { ... } ``` or ``` { ... } ```
    const matches = cleanText.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
    if (matches && matches[1]) {
      cleanText = matches[1].trim();
      try {
        return JSON.parse(cleanText);
      } catch (err) {
        // continue
      }
    }
  }

  // Repair Step 2: Extract text between the first '{' and the last '}'
  const startIdx = cleanText.indexOf("{");
  const endIdx = cleanText.lastIndexOf("}");
  if (startIdx !== -1 && endIdx !== -1 && endIdx > startIdx) {
    const jsonSubstring = cleanText.substring(startIdx, endIdx + 1);
    try {
      return JSON.parse(jsonSubstring);
    } catch (err) {
      // Clean up common JSON flaws: trailing commas in arrays/objects
      const relaxedJson = jsonSubstring
        .replace(/,\s*]/g, "]") // remove trailing commas before closing brackets
        .replace(/,\s*}/g, "}"); // remove trailing commas before closing braces
      try {
        return JSON.parse(relaxedJson);
      } catch (err2) {
        throw new Error(`JSON Repair failed. Raw content: ${rawText.substring(0, 200)}...`);
      }
    }
  }

  throw new Error(`Model response did not contain a valid JSON structure. Raw start: ${rawText.substring(0, 150)}`);
}
