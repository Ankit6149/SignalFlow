import { buildUnifiedContext } from "../context/buildUnifiedContext";
import { buildStudioPrompt } from "../prompt/buildStudioPrompt";
import { generateLocalTemplatePackage } from "../package/templatePackage";
import { normalizePackage } from "../package/normalizePackage";
import { generateJSON } from "./generateJSON";
import { buildMarkdown } from "../export/markdown";
import { PROVIDERS } from "./types";

/**
 * Main orchestration entry point.
 * Generates the full Studio content package based on model route and ingested context.
 */
export async function generateStudioPackage(inputs) {
  const {
    projectName = "SignalFlow Studio",
    notes = "",
    audience = "general tech audience",
    repoContext = null,
    linksContext = [],
    fileNames = [],
    mediaItems = [],
    selectedChannels = [],
    selectedOutputs = [],
    generator = "prompt", // Selected provider ID
    model_name = "",       // Optional model name override
    model_endpoint = "",    // Optional custom endpoint override
    appUrl = ""
  } = inputs;

  const warnings = [];

  // Compile context first
  const context = buildUnifiedContext({
    projectName,
    notes,
    audience,
    repoContext,
    linksContext,
    fileNames,
    mediaItems,
    selectedChannels,
    selectedOutputs,
    appUrl
  });

  if (context.warnings?.length) {
    warnings.push(...context.warnings);
  }

  // Build the generation prompt (which is needed for both AI and Prompt modes)
  const studioPrompt = buildStudioPrompt(context);

  // Mode 1: Prompt mode
  if (generator === "prompt") {
    // Generate fallback template package locally so the UI displays complete structures
    const localPkgResult = generateLocalTemplatePackage({
      projectName,
      notes,
      audience,
      repoContext,
      linksContext,
      fileNames,
      mediaItems,
      selectedChannels,
      selectedOutputs,
      appUrl
    });

    return {
      ...localPkgResult,
      providerUsed: "prompt",
      fallbackUsed: true,
      chatbot_prompt: studioPrompt,
      warnings: [
        "Prompt mode active. Copy the chatbot prompt details below and paste into any external chatbot. Review fallback template results in the preview sections.",
        ...warnings
      ]
    };
  }

  // Mode 2: Deterministic local template mode
  if (generator === "template") {
    const localPkgResult = generateLocalTemplatePackage({
      projectName,
      notes,
      audience,
      repoContext,
      linksContext,
      fileNames,
      mediaItems,
      selectedChannels,
      selectedOutputs,
      appUrl
    });

    return {
      ...localPkgResult,
      providerUsed: "template",
      fallbackUsed: true,
      chatbot_prompt: studioPrompt,
      warnings: [
        "Local template mode active. Generating deterministic package without AI calls.",
        ...warnings
      ]
    };
  }

  // Mode 3: AI Provider Mode
  const providerMeta = PROVIDERS[generator];
  if (!providerMeta) {
    // Unknown provider fallback
    const localPkgResult = generateLocalTemplatePackage({
      projectName,
      notes,
      audience,
      repoContext,
      linksContext,
      fileNames,
      mediaItems,
      selectedChannels,
      selectedOutputs,
      appUrl
    });
    return {
      ...localPkgResult,
      providerUsed: "template",
      fallbackUsed: true,
      warnings: [`Unknown generator "${generator}". Falling back to templates.`, ...warnings]
    };
  }

  // Verify key is configured (for cloud services)
  if (!providerMeta.isConfigured()) {
    // Fall back to template, notify user
    const localPkgResult = generateLocalTemplatePackage({
      projectName,
      notes,
      audience,
      repoContext,
      linksContext,
      fileNames,
      mediaItems,
      selectedChannels,
      selectedOutputs,
      appUrl
    });

    return {
      ...localPkgResult,
      providerUsed: generator,
      fallbackUsed: true,
      chatbot_prompt: studioPrompt,
      warnings: [
        `Provider "${providerMeta.label}" is not configured (missing environment API key). Fell back to deterministic template generation.`,
        ...warnings
      ]
    };
  }

  // Configure environment overrides if using Ollama / LM Studio / Custom OpenAI gateways
  if (generator === "ollama" && model_endpoint) {
    process.env.OLLAMA_BASE_URL = model_endpoint;
  }
  if (generator === "lmstudio" && model_endpoint) {
    process.env.LMSTUDIO_BASE_URL = model_endpoint;
  }
  if (generator === "custom" && model_endpoint) {
    process.env.CUSTOM_OPENAI_BASE_URL = model_endpoint;
  }

  const modelOverride = model_name || providerMeta.defaultModel;

  try {
    // Generate JSON response using dynamic provider adapters
    const rawJsonPkg = await generateJSON({
      provider: generator,
      prompt: studioPrompt,
      modelOverride
    });

    // Normalize response JSON to fit V1 package schema perfectly
    const normalizedPkg = normalizePackage(rawJsonPkg, {
      projectName,
      notes,
      audience,
      repoContext,
      linksContext,
      fileNames,
      mediaItems,
      selectedChannels,
      selectedOutputs,
      appUrl
    });

    // Generate output assets format
    const name = normalizedPkg.project.name || projectName;
    const desc = normalizedPkg.project.description || notes || "";
    
    // Compile platform drafts dictionary
    const postsDict = {};
    const channels = selectedChannels.length ? selectedChannels : ["linkedin", "x", "instagram", "newsletter"];
    
    channels.forEach(ch => {
      if (ch === "linkedin" && normalizedPkg.posts.linkedin) {
        postsDict.linkedin = normalizedPkg.posts.linkedin.body || normalizedPkg.posts.linkedin;
      } else if (ch === "x" && normalizedPkg.posts.x) {
        postsDict.x = Array.isArray(normalizedPkg.posts.x.posts) 
          ? normalizedPkg.posts.x.posts.join("\n\n") 
          : (normalizedPkg.posts.x.body || normalizedPkg.posts.x);
      } else if (ch === "instagram" && normalizedPkg.posts.instagram) {
        postsDict.instagram = normalizedPkg.posts.instagram.caption || normalizedPkg.posts.instagram;
      } else if (ch === "reddit" && normalizedPkg.posts.reddit) {
        postsDict.reddit = normalizedPkg.posts.reddit.body || normalizedPkg.posts.reddit;
      } else if (ch === "hn" && normalizedPkg.posts.hackernews) {
        postsDict.hn = normalizedPkg.posts.hackernews.body || normalizedPkg.posts.hackernews;
      } else if (ch === "blog" && normalizedPkg.posts.blog) {
        postsDict.blog = normalizedPkg.posts.blog.draft || normalizedPkg.posts.blog;
      } else if (ch === "newsletter" && normalizedPkg.posts.newsletter) {
        postsDict.newsletter = normalizedPkg.posts.newsletter.body || normalizedPkg.posts.newsletter;
      } else if (ch === "release_notes" && normalizedPkg.posts.releaseNotes) {
        const rn = normalizedPkg.posts.releaseNotes;
        postsDict.release_notes = rn.sections 
          ? rn.sections.map(s => `### ${s.title}\n${Array.isArray(s.items) ? s.items.map(i => `- ${i}`).join("\n") : s.items}`).join("\n\n")
          : rn;
      }
    });

    // Build SVG visual asset card data URI
    const svgContent = `
<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <rect width="1200" height="630" fill="#0f1720"/>
  <rect x="54" y="54" width="1092" height="522" rx="24" fill="#1e293b"/>
  <text x="92" y="132" fill="#10b981" font-family="Segoe UI, Arial" font-size="28" font-weight="800">LAUNCH KIT</text>
  <text x="92" y="232" fill="#f8fafc" font-family="Segoe UI, Arial" font-size="68" font-weight="900">${escapeXml(name)}</text>
  <foreignObject x="92" y="278" width="980" height="190">
    <div xmlns="http://www.w3.org/1999/xhtml" style="font-family: Segoe UI, Arial; color:#94a3b8; font-size:34px; line-height:1.35">${escapeXml(desc.substring(0, 150))}...</div>
  </foreignObject>
  <rect x="92" y="500" width="240" height="52" rx="26" fill="#10b981"/>
  <text x="135" y="535" fill="#0f1720" font-family="Segoe UI, Arial" font-size="24" font-weight="900">AI Synthesized</text>
</svg>
    `;

    return {
      ok: true,
      providerUsed: generator,
      fallbackUsed: false,
      chatbot_prompt: studioPrompt,
      warnings,
      package: normalizedPkg,
      posts: postsDict,
      channels,
      outputs: selectedOutputs,
      markdown: buildMarkdown({ projectName: name, package: normalizedPkg, prompt: studioPrompt }),
      json: normalizedPkg,
      media_plan: normalizedPkg.media.assetChecklist.map((item, idx) => ({
        type: item.toLowerCase().includes("video") || item.toLowerCase().includes("recording") ? "video" : "screenshot",
        title: item,
        summary: `Asset checklist requirement generated by model.`
      })),
      documents: [
        { title: "Strategy Document", summary: normalizedPkg.strategy.positioning },
        { title: "Release Changelog", summary: normalizedPkg.posts.releaseNotes?.title || "Changelog" }
      ],
      assets: {
        markdown: `${name.toLowerCase().replace(/\s+/g, "-")}-package.md`,
        summary: `${name.toLowerCase().replace(/\s+/g, "-")}-package.json`,
        code_image: "browser-generated-post-card.svg"
      },
      image_mime: "image/svg+xml",
      image_base64: Buffer.from(svgContent.trim()).toString("base64"),
      integration_config: {
        mode: "review_first",
        manual: true,
        webhookReady: true,
        officialApisOnly: true,
        platforms: {
          linkedin: { 
            supported: "manual_or_official_api", 
            configured: Boolean(process.env.LINKEDIN_ACCESS_TOKEN && process.env.LINKEDIN_ORGANIZATION_ID),
            notes: [] 
          },
          instagram: { 
            supported: "official_meta_api_only", 
            configured: Boolean(process.env.META_ACCESS_TOKEN && process.env.META_IG_USER_ID),
            notes: [] 
          },
          x: { 
            supported: "official_api_only", 
            configured: Boolean(process.env.X_ACCESS_TOKEN && process.env.X_API_KEY && process.env.X_API_SECRET),
            notes: [] 
          }
        }
      }
    };

  } catch (err) {
    // Model generation failed - fallback gracefully
    const localPkgResult = generateLocalTemplatePackage({
      projectName,
      notes,
      audience,
      repoContext,
      linksContext,
      fileNames,
      mediaItems,
      selectedChannels,
      selectedOutputs,
      appUrl
    });

    return {
      ...localPkgResult,
      providerUsed: generator,
      fallbackUsed: true,
      chatbot_prompt: studioPrompt,
      warnings: [
        `Generation failed for provider "${providerMeta.label}": ${err.message}. Local template fallback was used.`,
        ...warnings
      ]
    };
  }
}

function escapeXml(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
