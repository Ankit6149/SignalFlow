import { requireOwnerAccess } from "../_auth";

const CHANNEL_LABELS = {
  linkedin: "LinkedIn",
  x: "X",
  instagram: "Instagram",
  reddit: "Reddit",
  hn: "Hacker News",
  youtube: "YouTube",
  tiktok: "TikTok",
  blog: "Blog",
  newsletter: "Newsletter",
  release_notes: "Release notes",
  discord: "Discord",
  slack: "Slack",
};

const DEFAULT_CHANNELS = ["linkedin", "x", "instagram", "newsletter"];
const DEFAULT_OUTPUTS = ["caption", "text", "image", "video", "doc"];

function normalizeChannels(channels) {
  const selected = Array.isArray(channels) ? channels : [];
  const valid = selected.filter((channel) => CHANNEL_LABELS[channel]);
  return valid.length ? valid : DEFAULT_CHANNELS;
}

function normalizeOutputs(outputs) {
  const selected = Array.isArray(outputs) ? outputs.filter(Boolean) : [];
  return selected.length ? selected : DEFAULT_OUTPUTS;
}

function excerpt(value) {
  return (value || "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 220);
}

function svgCard(projectName, signal) {
  const title = escapeXml(projectName || "SignalFlow Studio");
  const body = escapeXml(signal || "Describe once. Generate the full posting package.");
  return `
<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <rect width="1200" height="630" fill="#171b18"/>
  <rect x="54" y="54" width="1092" height="522" rx="24" fill="#fffaf0"/>
  <text x="92" y="132" fill="#226b57" font-family="Segoe UI, Arial" font-size="28" font-weight="800">POST PACKAGE</text>
  <text x="92" y="232" fill="#111512" font-family="Segoe UI, Arial" font-size="68" font-weight="900">${title}</text>
  <foreignObject x="92" y="278" width="980" height="190">
    <div xmlns="http://www.w3.org/1999/xhtml" style="font-family: Segoe UI, Arial; color:#536159; font-size:34px; line-height:1.35">${body}</div>
  </foreignObject>
  <rect x="92" y="500" width="240" height="52" rx="26" fill="#ea6b4d"/>
  <text x="124" y="535" fill="#24100a" font-family="Segoe UI, Arial" font-size="24" font-weight="900">Ready to review</text>
</svg>`;
}

function escapeXml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function cardDataUri(projectName, signal) {
  return `data:image/svg+xml;base64,${Buffer.from(svgCard(projectName, signal)).toString("base64")}`;
}

function channelDrafts({ projectName, signal, audience, channels }) {
  const who = audience || "your audience";
  const drafts = {
    linkedin:
      `${projectName} update\n\n${signal}\n\nWhy it matters: this is built for ${who}, and the goal is to make the full story easier to understand without manually rebuilding every post asset.\n\nGenerated package: copy, visual direction, and review-ready assets.`,
    x:
      `${projectName}: ${signal}\n\nDescribe once. Get the post package: copy, media direction, and export-ready formats.`,
    instagram:
      `${projectName}\n\n${signal}\n\nUse this with the generated card, screenshot set, or short screen-recording clip.`,
    reddit:
      `Title: I built ${projectName} to turn raw product context into a complete posting package\n\n${signal}\n\nI would use it to prepare captions, visuals, docs, and channel variants from the same source material. Curious what workflows people would want automated first.`,
    hn:
      `Show HN: ${projectName} - generate posting packages from raw product context\n\n${signal}\n\nIt takes descriptions, links, docs, repos, screenshots, or recordings and prepares reviewable social assets instead of making users assemble every format manually.`,
    youtube:
      `${projectName} demo idea\n\nHook: Stop rebuilding every product post by hand.\n\nShow: paste context, add assets, choose outputs, generate captions, visual plan, video script, and docs.\n\nCTA: Review the package and publish through your own channels.`,
    tiktok:
      `Short video script for ${projectName}\n\n0-2s: "I do not want to manually make posts from product updates anymore."\n3-8s: Show inputs going in.\n9-15s: Show generated captions, image plan, video plan, and docs.\nCaption: ${signal}`,
    blog:
      `${projectName} is a useful update for ${who}. ${signal} This post package gives the article a clear angle, suggested visual assets, and platform-specific follow-up copy.`,
    newsletter:
      `Subject: ${projectName} update\n\n${signal}\n\nThe package includes ready-to-edit copy, visual asset direction, and selected-platform variants so the update can be reviewed and shared faster.`,
    release_notes:
      `## ${projectName} update\n\n- Summary: ${signal}\n- Audience: ${who}\n- Included assets: generated card, visual media plan, platform drafts\n- Review before publishing through official channels.`,
    discord:
      `**${projectName} update**\n\n${signal}\n\nGenerated package includes captions, visual direction, and selected-channel drafts for review.`,
    slack:
      `*${projectName} update*\n\n${signal}\n\nPrepared package: channel drafts, visual asset plan, doc summary, and publishing handoff notes.`,
  };
  return Object.fromEntries(channels.map((channel) => [channel, drafts[channel]]));
}

function mediaPlan(projectName, signal, channels, outputs) {
  const channelNames = channels.map((channel) => CHANNEL_LABELS[channel]).join(", ");
  const plans = [
    {
      type: "image",
      title: "Use the generated card",
      summary: `Static visual for ${projectName}: ${signal}`,
    },
    {
      type: "screenshot_set",
      title: "Capture before/action/result",
      summary: "Use three clean states for carousel posts or visual proof.",
    },
    {
      type: "video",
      title: "Create a short demo clip",
      summary: "Capture the product flow once and reuse it for short clips.",
    },
    {
      type: "gif",
      title: "Create a short loop",
      summary: "Turn the strongest 3-6 seconds into a GIF or silent video.",
    },
    {
      type: "carousel",
      title: "Build a carousel",
      summary: "Use problem, input, generation, result, and review slides.",
    },
    {
      type: "caption",
      title: "Format per selected account",
      summary: `Prepare copy and assets for ${channelNames}.`,
    },
  ];
  return plans.filter((item) => outputs.includes(item.type) || item.type === "caption");
}

function documents(projectName, signal, outputs) {
  if (!outputs.includes("doc")) {
    return [];
  }

  return [
    {
      title: "Posting brief",
      summary: `A clean source-of-truth doc for ${projectName}: audience, angle, selected channels, copy, visual direction, and review checklist.`,
    },
    {
      title: "Publishing handoff",
      summary: `A structured handoff that explains what to publish, where to publish it, and which assets belong with each channel.`,
    },
  ];
}

function buildMarkdown({ projectName, signal, drafts, plan, prompt }) {
  const posts = Object.entries(drafts)
    .map(([channel, text]) => `### ${CHANNEL_LABELS[channel]}\n\n${text}`)
    .join("\n\n");
  const media = plan.map((item) => `- **${item.title}** (${item.type}): ${item.summary}`).join("\n");
  return `# ${projectName} Post Package\n\n## Core Signal\n\n${signal}\n\n## Platform Drafts\n\n${posts}\n\n## Visual Media Plan\n\n${media}\n\n## Model Prompt\n\n\`\`\`text\n${prompt}\n\`\`\`\n`;
}

function localPackage(body) {
  const projectName = (body.project_name || "SignalFlow Studio").trim();
  const channels = normalizeChannels(body.channels);
  const outputs = normalizeOutputs(body.output_types);
  const sourceParts = [
    body.notes,
    body.research_url,
    body.repo,
    body.document_text,
    Array.isArray(body.media_items) ? body.media_items.map((item) => item.name).join(", ") : "",
  ];
  const signal = excerpt(sourceParts.filter(Boolean).join(" ")) || "Describe what happened and why it matters.";
  const audience = (body.audience || "selected social media audiences").trim();
  const prompt = `Create formatted posting packages for ${projectName}.
Audience: ${audience}
Selected channels: ${channels.map((channel) => CHANNEL_LABELS[channel]).join(", ")}
Requested outputs: ${outputs.join(", ")}
Source information: ${signal}
Return copy, captions, visual media suggestions, document notes, and review notes per channel.`;
  const posts = channelDrafts({ projectName, signal, audience, channels });
  const plan = mediaPlan(projectName, signal, channels, outputs);
  const docs = documents(projectName, signal, outputs);
  const imageBase64 = cardDataUri(projectName, signal).split(",")[1];
  return {
    project_name: projectName,
    repo: body.repo || "standalone-frontend",
    output_dir: body.out_dir || "browser-generated",
    highlights: [
      {
        path: "user-description",
        score: 1,
        summary: signal,
      },
    ],
    context_engine: {
      input_count: 1,
      source_types: [body.input_type || "brief"],
    },
    model_adapter: {
      route: body.generator || "standalone",
      status: "frontend_generated",
    },
    posts,
    channels,
    outputs,
    generator: body.generator || "standalone",
    chatbot_prompt: prompt,
    slide_outline: `# ${projectName} Posting Plan\n\n- Core signal: ${signal}\n- Channels: ${channels.map((channel) => CHANNEL_LABELS[channel]).join(", ")}\n- Review copy and media before publishing.`,
    markdown: buildMarkdown({ projectName, signal, drafts: posts, plan, prompt }),
    assets: {
      code_image: "browser-generated-post-card.svg",
      markdown: "browser-generated-post-package.md",
      summary: "browser-generated-post-package.json",
    },
    media_assets: [
      {
        type: "generated_card",
        path: "browser-generated-post-card.svg",
        summary: "Generated SVG card for the post package.",
      },
    ],
    media_plan: plan,
    documents: docs,
    image_mime: "image/svg+xml",
    image_base64: imageBase64,
    integration_config: {
      model_route: body.generator || "standalone",
      model_endpoint: body.model_endpoint || "",
      model_name: body.model_name || "frontend-template",
      api_key_present: Boolean(body.api_key_present),
      distribution_mode: body.distribution_mode || "manual",
      webhook_configured: Boolean(body.webhook_url),
    },
    integration_notes: [
      "Generated by the hosted SignalFlow Studio app.",
      "Review before publishing.",
      "Connect official APIs or webhooks only when you want real publishing handoff.",
    ],
  };
}

export async function POST(request) {
  const accessError = requireOwnerAccess(request);
  if (accessError) {
    return accessError;
  }

  const body = await request.json();
  return new Response(JSON.stringify(localPackage(body)), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}
