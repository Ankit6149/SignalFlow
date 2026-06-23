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

=======================================
INSTRUCTIONS & RULES:
1. You MUST respond ONLY with a single JSON object. Do not wrap it in markdown codeblocks like \`\`\`json. Your output must start with '{' and end with '}'.
2. You MUST strictly adhere to the requested JSON schema shown below. Do not add or rename keys.
3. Be professional, authentic, and clear. Avoid typical marketing hype, buzzwords ("revolutionary", "game-changer", "delve"), and over-exaggerated claims.
4. Distinguish between confirmed facts (from the repo code and user settings) and user assumptions/inferences. If a claim is an assumption, mention it in the strategy.
5. Create high-value, platform-specific content:
   - LinkedIn: Polished, narrative, story-driven, professional, includes cta and hashtags.
   - X: Concise, hook-driven, engaging. Output as a post thread (with multiple posts in an array).
   - Instagram: Visual-focused caption, suggested visual direction.
   - Reddit: Factual, helpful, useful, non-spammy, suggests subreddits.
   - Hacker News: Simple, engineering-focused, Show HN format.
   - Blog: Deeper analysis, draft outline, full writeup.
   - Newsletter: Hooky subject, preview line, narrative update.
   - Release Notes: Formatted by feature changes, additions, and configs.
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
    "carouselPlan": [],
    "thumbnailIdeas": [],
    "altText": [],
    "assetChecklist": [],
    "shotList": [],
    "videoEditingTimeline": [],
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
