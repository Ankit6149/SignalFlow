/**
 * Builds the comprehensive prompt instructions for the AI models.
 * Directs the model to output a structured JSON shape with clean, professional copy.
 */
export function buildStudioPrompt(context) {
  const {
    projectName,
    notes,
    audience,
    repoContext,
    linksContext,
    mediaNames,
    confirmedFacts,
    inferredFacts,
    missingContext,
    techStack,
    features,
    appUrl,
    mediaItems,
    fileNames
  } = context;

  // Render lists into text blocks
  const factsStr = confirmedFacts.map(f => `- ${f}`).join("\n") || "None provided.";
  const inferredStr = inferredFacts.map(f => `- ${f}`).join("\n") || "None provided.";
  const missingStr = missingContext.map(f => `- ${f}`).join("\n") || "None provided.";
  const stackStr = techStack.join(", ") || "Unknown / Not specified.";
  const featuresStr = features.map(f => `- ${f}`).join("\n") || "None detected.";

  // Format detailed manual and recorded media descriptions
  let mediaStr = "";
  if (Array.isArray(mediaItems) && mediaItems.length) {
    mediaStr = mediaItems.map((item, idx) => {
      const type = item.type || item.category || "asset";
      const desc = item.description ? ` - Description: ${item.description}` : "";
      return `${idx + 1}. [${type.toUpperCase()}] ${item.name}${desc}`;
    }).join("\n");
  } else {
    mediaStr = "No screenshots, logos, product images, or recordings provided.";
  }

  // Format pasted or uploaded text files contents
  let docsTextStr = "";
  if (Array.isArray(fileNames) && fileNames.length) {
    docsTextStr = fileNames.map((text, idx) => {
      return `Document ${idx + 1} Content:\n---\n${text}\n---`;
    }).join("\n\n");
  } else {
    docsTextStr = "No reference text documents or pasted content provided.";
  }

  // Scraped links info
  let scrapedStr = "";
  if (Array.isArray(linksContext) && linksContext.length) {
    scrapedStr = linksContext.map((link, idx) => {
      return `Link ${idx + 1}: ${link.url}\nTitle: ${link.title || "N/A"}\nDescription: ${link.description || "N/A"}\nContent excerpt:\n${link.text ? link.text.substring(0, 1500) : "N/A"}\n`;
    }).join("\n---\n");
  } else {
    scrapedStr = "None scraped.";
  }

  // Repository code details
  let repoCodeStr = "";
  if (repoContext && repoContext.rawContext) {
    repoCodeStr = repoContext.rawContext;
  } else {
    repoCodeStr = "No repository code files parsed.";
  }

  const prompt = `You are a professional Content Director and Product Marketing Engineer.
Your task is to analyze the following product context and generate a complete, structured Studio Content Package in JSON format.

=== PRODUCT INPUTS ===
Product Name: ${projectName}
Target Audience: ${audience}
App URL: ${appUrl || "None configured."}
User Description Notes:
${notes || "No description provided."}

=== UPLOADED DOCUMENTS & PASTED TEXT ===
${docsTextStr}

=== SELECTED MEDIA ASSETS ===
${mediaStr}

=== CONFIRMED FACTS ===
${factsStr}

=== INFERRED FACTS & USER ASSUMPTIONS ===
${inferredStr}

=== MISSING CONTEXT WARNINGS ===
${missingStr}

=== DETECTED TECH STACK ===
${stackStr}

=== DETECTED FEATURES ===
${featuresStr}

=== SELECTED MEDIA ASSETS ===
${mediaStr}

=== SCRAPED DOCUMENTATION & LINKS ===
${scrapedStr}

=== PARSED REPOSITORY CODE SUMMARY ===
${repoCodeStr}

INSTRUCTIONS & RULES FOR HIGHLY NATURAL, HUMAN-LIKE WRITING (HUMANIFIED TONE):
1. You MUST respond ONLY with a single JSON object. Do not wrap it in markdown codeblocks like \`\`\`json. Your output must start with '{' and end with '}'.
2. You MUST strictly adhere to the requested JSON schema shown below. Do not add or rename keys.
3. ABSOLUTELY NO AI BUZZWORDS OR MARKETING JARGON. Strictly avoid words like: "revolutionize", "game-changer", "delve", "seamless", "ultimate", "leverage", "transform", "unlock", "foster", "testament", "landscape", "dynamic", "empower", "elevate", "robust", "key", "master", "look no further", "in today's fast-paced world".
4. WRITE LIKE A HUMAN DEVELOPER/BUILDER.
   - Use direct, conversational, and humble language. Write in the first person singular ("I built this because...") or plural ("We wanted to solve...").
   - Vary your sentence structures. Avoid writing paragraphs that have uniform sentence lengths. Use short, punchy statements mixed with explanatory sentences.
   - Do not use exclamation marks in every sentence. Limit them to a maximum of 1 or 2 per platform post.
   - Do not start with generic marketing hook templates (e.g., "Are you tired of X?"). Instead, state a direct observation, a technical challenge, or a simple backstory of why the app was built.
5. PLATFORM-SPECIFIC GUIDELINES:
   - LinkedIn: Avoid generic corporate-speak. Share a real, authentic startup or engineering story. Describe the problem, the technical implementation, and what you learned. Use only 2-3 highly relevant hashtags.
   - X (Twitter): Write in the tone of a real tech builder on Twitter—casual, direct, minimal fluff, showing technical details or direct screenshots. Avoid cheesy thread hooks.
   - Reddit: Must be completely factual, educational, and useful. Discuss technical decisions, trade-offs (e.g. running local fs parsers instead of API endpoints), and limitations.
   - Hacker News: Strictly objective, simple, engineering-focused, detailing technical architecture, libraries used, and why this method is helpful.
6. Make sure all selected platform outputs are complete and ready to copy. Do not output placeholders, TODOs, or ellipses like "...".

=== REQUIRED JSON OUTPUT SCHEMA ===
{
  "project": {
    "name": "",
    "oneLine": "",
    "description": "",
    "audience": "",
    "category": "",
    "stage": ""
  },
  "context": {
    "confirmedFacts": [],
    "inferredFacts": [],
    "missingContext": [],
    "features": [],
    "techStack": [],
    "repoInsights": [],
    "docsInsights": [],
    "linkInsights": [],
    "mediaInsights": []
  },
  "strategy": {
    "coreAngle": "",
    "positioning": "",
    "hooks": [],
    "proofPoints": [],
    "risks": [],
    "safeClaims": [],
    "avoidClaims": []
  },
  "posts": {
    "linkedin": {
      "title": "",
      "body": "",
      "hashtags": [],
      "cta": ""
    },
    "x": {
      "mode": "post_or_thread",
      "posts": []
    },
    "instagram": {
      "caption": "",
      "hashtags": [],
      "visualDirection": ""
    },
    "reddit": {
      "title": "",
      "body": "",
      "subredditSuggestions": []
    },
    "hackernews": {
      "title": "",
      "body": ""
    },
    "blog": {
      "title": "",
      "outline": [],
      "draft": ""
    },
    "newsletter": {
      "subject": "",
      "preview": "",
      "body": ""
    },
    "releaseNotes": {
      "title": "",
      "sections": [
        {
          "title": "",
          "items": []
        }
      ]
    }
  },
  "media": {
    "screenshotPlan": [],
    "videoScript": [],
    "voiceoverScript": [],
    "shotList": [],
    "recordingGuide": [],
    "carouselPlan": [],
    "thumbnailIdeas": [],
    "videoTimeline": [],
    "altText": [],
    "assetChecklist": [],
    "thumbnailPrompt": ""
  },
  "publishing": {
    "platformChecklist": [],
    "manualPostingSteps": [],
    "apiPublishingNotes": "",
    "warnings": []
  }
}

Now parse the context and output the completed JSON object:`;

  return prompt;
}
