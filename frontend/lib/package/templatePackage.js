import { buildMarkdown } from "../export/markdown";

/**
 * Deterministically generates the complete "Studio Package" using local templates and input context.
 * Returns a standardized package structure.
 */
export function generateLocalTemplatePackage({
  projectName = "My Project",
  notes = "",
  audience = "developers and builders",
  repoUrl = "",
  repoContext = null,
  linksContext = [],
  fileNames = [],
  mediaItems = [],
  selectedChannels = [],
  selectedOutputs = []
}) {
  const name = (projectName || (repoContext?.repo) || "SignalFlow Studio Project").trim();
  const desc = (notes || (repoContext?.readme ? repoContext.readme.substring(0, 300) : "") || "A local-first product built to streamline development and content automation workflow.").trim();
  const targetAudience = (audience || "developers, makers, and founders").trim();
  
  // Format inputs into facts and insights
  const confirmedFacts = [];
  const inferredFacts = [];
  const missingContext = [];

  confirmedFacts.push(`Product is named: ${name}.`);
  confirmedFacts.push(`Target audience is: ${targetAudience}.`);
  if (repoUrl) {
    confirmedFacts.push(`Source repository is configured at: ${repoUrl}.`);
  }
  if (notes) {
    confirmedFacts.push(`Project core description: "${desc.slice(0, 100)}..."`);
  }

  const techStack = repoContext?.detectedTechStack || [];
  if (techStack.length) {
    confirmedFacts.push(`Tech stack detected from source files: ${techStack.join(", ")}.`);
  } else {
    inferredFacts.push("Appears to be built using standard web engineering tools.");
    techStack.push("Next.js", "JavaScript");
  }

  const features = repoContext?.detectedFeatures || [];
  if (features.length === 0) {
    features.push(
      "Automated package synthesis",
      "Local-first static asset generation",
      "Multi-channel formatting",
      "Review-ready export flow"
    );
  }

  const links = linksContext.map(l => l.url).filter(Boolean);
  if (links.length) {
    confirmedFacts.push(`Product docs links checked: ${links.join(", ")}.`);
  } else {
    missingContext.push("Product documentation / link scrapes are missing.");
  }

  const mediaNames = mediaItems.map(m => m.name).filter(Boolean);
  if (mediaNames.length) {
    confirmedFacts.push(`Screenshots/recordings loaded: ${mediaNames.join(", ")}.`);
  } else {
    missingContext.push("Product screenshots or video captures are missing.");
  }

  const repoInsights = [];
  if (repoContext?.fileTreeSummary?.length) {
    repoInsights.push(`Found ${repoContext.fileTreeSummary.length} source code nodes.`);
    repoInsights.push(`Contains files: ${repoContext.fileTreeSummary.slice(0, 5).join(", ")}`);
  }

  const docsInsights = linksContext.map(l => `Scraped ${l.title || "webpage"} (${l.url})`).slice(0, 3);
  const linkInsights = links.length ? [`Found ${links.length} associated URL references.` ] : [];
  const mediaInsights = mediaNames.length ? [`Prepared ${mediaNames.length} image/video references.`] : [];

  const coreAngle = `Showcasing ${name} as a local-first solution that solves the bottleneck of manual content assembly for ${targetAudience}.`;
  const positioning = `A developer-friendly workspace that turns raw product code, links, and details into cohesive postings in minutes.`;

  // Builds structured JSON package shape
  const pkg = {
    project: {
      name,
      oneLine: `Simplify and accelerate your content pipeline with ${name}.`,
      description: desc,
      audience: targetAudience,
      category: "Developer Tools / Productivity",
      stage: "V1 Launch"
    },
    context: {
      confirmedFacts,
      inferredFacts,
      missingContext,
      features,
      techStack,
      repoInsights,
      docsInsights,
      linkInsights,
      mediaInsights
    },
    strategy: {
      coreAngle,
      positioning,
      hooks: [
        `Tired of manually preparing posting assets for ${name}? Here is the solution.`,
        `How we went from raw code to reviewable multi-channel post drafts in seconds.`,
        `Local-first content studio for builders and indie developers is finally here.`
      ],
      proofPoints: [
        `Identified ${features.length} core product features directly from workspace source.`,
        `Exports full Markdown, JSON, and ZIP file packages in a single run.`,
        `Runs completely locally without requiring cloud API keys.`
      ],
      risks: [
        `Static templates do not change context styles dynamically.`,
        `No advanced natural language rewriting in pure template mode.`
      ],
      safeClaims: [
        `Generates platform-ready content templates locally.`,
        `Extracts key files and configuration details without cloning repositories.`
      ],
      avoidClaims: [
        `Do not claim that the tool does deep semantic code audits or full video content generation.`
      ]
    },
    posts: {
      linkedin: {
        title: `Announcing the launch of ${name}!`,
        body: `I am excited to introduce ${name} – a local-first workspace built for ${targetAudience}.\n\nHere is what it does:\n${features.map(f => `• ${f}`).join("\n")}\n\nOur tech stack: ${techStack.join(", ")}.\n\nWhether you are launching a product, sharing an update, or creating release notes, this prepares the full package in one run. No complex setups or cloud dependencies required.\n\nTry it out and let us know what you think!`,
        hashtags: ["IndieHackers", "DeveloperTools", "LocalFirst", "ProductLaunch"],
        cta: "Download the source code or check the live demo!"
      },
      x: {
        mode: "post_or_thread",
        posts: [
          `Introducing ${name} 🚀\n\nA local-first content studio built to turn descriptions, repos, and app links into structured post packages.\n\nHere is how it works: (1/3)`,
          `⚡ Core Features:\n${features.slice(0, 3).map(f => `• ${f}`).join("\n")}\n\nBuilt using ${techStack.slice(0, 3).join(", ")}. (2/3)`,
          `📦 Get full drafts for LinkedIn, X, Reddit, and newsletters alongside a visual media plan and ZIP exports.\n\nRuns offline/locally. Check it out! (3/3)`
        ]
      },
      instagram: {
        caption: `Automate your marketing pipeline with ${name}. Made for ${targetAudience} to save hours of manual asset building.\n\nSwipe to see features! 👉`,
        hashtags: ["developer", "indiehackers", "solopreneur", "productivity", "coding"],
        visualDirection: "Show a before-and-after split showing raw description notes on the left and a structured ZIP package on the right."
      },
      reddit: {
        title: `I built ${name} - a local-first tool that converts code repos & links into complete post drafts`,
        body: `Hey developers,\n\nI wanted to share ${name}, a tool I've been working on to solve the annoying chore of assembling launch posts, feature updates, and newsletter summaries.\n\nYou give it your repo URL, README, docs URL, or description, and it compiles a unified package containing platform-ready posts, media plans, and release notes.\n\nWhy local-first? It respects privacy and works offline without requiring expensive cloud subscriptions.\n\nWould love your feedback on features or integrations!`,
        subredditSuggestions: ["r/sideproject", "r/developer", "r/indiehackers", "r/selfhosted"]
      },
      hackernews: {
        title: `Show HN: ${name} – Local-first content studio from repos and markdown`,
        body: `${name} is an offline-friendly post package builder designed for developers and product founders.\n\nIt parses your local repository metadata (README, package.json, code structure) and scrapes docs URLs to generate formatted platform posts, blog summaries, and visual asset checklists.\n\nYou can review, edit, and export the generated assets as a single Markdown document, JSON data file, or a full ZIP package.\n\nProject details:\n- Ingests public repositories via GitHub trees.\n- Uses template heuristics as an offline/free fallback.\n- Generates structured ZIP packages on the fly.`
      },
      blog: {
        title: `Behind the Scenes: Why We Built ${name}`,
        outline: [
          `Introduction: The struggle of developer marketing.`,
          `What is ${name} and who is it for?`,
          `How local-first tools improve productivity.`,
          `Core features: Repo ingestion and multi-format outputs.`,
          `Future roadmap and next integrations.`
        ],
        draft: `# Behind the Scenes: Why We Built ${name}\n\nEvery creator and software developer faces the same bottleneck: after building a feature or product, you must write about it across multiple channels (LinkedIn, Twitter, newsletters, blogs). This often takes hours.\n\n${name} was built to streamline this flow. By feeding in your repository, notes, and documentation, the system outputs structured platform drafts, release notes, and a visual media checklist.\n\n## Solving the Marketing Bottleneck\n\nMarketing shouldn't feel like a chore. With ${name}, you can go from raw repository files to a complete launch kit in minutes.`
      },
      newsletter: {
        subject: `Introducing ${name}: The local-first content studio`,
        preview: `Read how ${name} converts code and documentation into structured post packages.`,
        body: `Hi there,\n\nWe just launched ${name}! It is a tool created specifically for ${targetAudience} to automate the packaging of product updates.\n\nHere is what you can do:\n${features.map(f => `- ${f}`).join("\n")}\n\nCheck out the documentation or download the project today!\n\nBest,\nThe ${name} Team`
      },
      releaseNotes: {
        title: `${name} V1.0.0 Release Notes`,
        sections: [
          {
            title: "Features Added",
            items: features
          },
          {
            title: "Tech Stack & Configuration",
            items: techStack.map(t => `Integrated support for ${t}`)
          },
          {
            title: "Security & Safe Posting Guidelines",
            items: [
              "Local-first data execution. No keys leaked to browsers.",
              "Explicit manual approval before publishing to any platform."
            ]
          }
        ]
      }
    },
    media: {
      screenshotPlan: [
        `Main dashboard showing input context loaded.`,
        `The Step 4 package review interface.`,
        `The downloaded ZIP package contents.`
      ],
      videoScript: [
        `[0:00-0:02] Hook: Stop manual copywriting for your product updates.`,
        `[0:02-0:08] Paste GitHub repo URL and type a brief description in ${name}.`,
        `[0:08-0:15] Click generate and watch the multi-channel drafts appear instantly.`,
        `[0:15-0:20] Click "Download ZIP" and show the formatted files.`
      ],
      carouselPlan: [
        `Slide 1: The Developer Content Problem (Manual writing is slow)`,
        `Slide 2: Meet ${name} (Automated post packages)`,
        `Slide 3: Real Ingestion (Fetches README, package.json, docs)`,
        `Slide 4: Platform Ready (LinkedIn, X, Reddit, newsletters)`,
        `Slide 5: Try it locally today (No cloud account needed)`
      ],
      thumbnailIdeas: [
        `Glow gradient background with the text "${name}" and a large ZIP file icon.`,
        `Split image: Code on the left, social cards on the right.`
      ],
      altText: [
        `Screenshot of the ${name} Model setup screen.`,
        `Visual schematic of the SignalFlow content pipeline.`
      ],
      assetChecklist: [
        `1x Generated SVG Card (built-in)`,
        `3x Product screenshots`,
        `1x Short screen recording demo (WebM)`
      ]
    },
    publishing: {
      platformChecklist: [
        `Review LinkedIn draft and add custom visual card.`,
        `Copy X thread posts into scheduler.`,
        `Review blog post markdown draft before pasting to CMS.`
      ],
      manualPostingSteps: [
        `1. Download the ZIP file.`,
        `2. Extract the txt/md drafts.`,
        `3. Copy individual posts to their respective apps.`,
        `4. Attach screenshots or local recordings.`
      ],
      apiPublishingNotes: [
        `V1 encourages manual publishing. Official OAuth pipelines can be configured for webhooks.`
      ],
      warnings: [
        `In Template Mode, text is static and may need minor edits to match your exact launch tone.`
      ]
    }
  };

  return {
    ok: true,
    providerUsed: "template",
    fallbackUsed: true,
    warnings: ["System running in local template fallback mode. Connect a model API key to unlock dynamic generations."],
    package: pkg,
    posts: {
      linkedin: pkg.posts.linkedin.body,
      x: pkg.posts.x.posts.join("\n\n"),
      instagram: pkg.posts.instagram.caption,
      reddit: pkg.posts.reddit.body,
      hn: pkg.posts.hackernews.body,
      blog: pkg.posts.blog.draft,
      newsletter: pkg.posts.newsletter.body,
      release_notes: pkg.posts.releaseNotes.sections.map(s => `### ${s.title}\n${s.items.map(i => `- ${i}`).join("\n")}`).join("\n\n")
    },
    channels: selectedChannels.length ? selectedChannels : ["linkedin", "x", "instagram", "newsletter"],
    outputs: selectedOutputs.length ? selectedOutputs : ["caption", "text", "image", "video", "doc"],
    markdown: buildMarkdown({ projectName: name, package: pkg, prompt: "Template generator fallback" }),
    json: pkg,
    media_plan: pkg.media.assetChecklist.map((item, idx) => ({
      type: item.includes("recording") ? "video" : item.includes("Card") ? "image" : "screenshot",
      title: item,
      summary: `Asset ${idx + 1} requirement checklist item.`
    })),
    documents: [
      { title: "Release Notes", summary: pkg.posts.releaseNotes.title },
      { title: "Newsletter draft", summary: pkg.posts.newsletter.subject }
    ],
    assets: {
      markdown: `${name.toLowerCase().replace(/\s+/g, "-")}-package.md`,
      summary: `${name.toLowerCase().replace(/\s+/g, "-")}-package.json`,
      code_image: "browser-generated-post-card.svg"
    },
    image_mime: "image/svg+xml",
    image_base64: Buffer.from(`
<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <rect width="1200" height="630" fill="#0f1720"/>
  <rect x="54" y="54" width="1092" height="522" rx="24" fill="#1e293b"/>
  <text x="92" y="132" fill="#38bdf8" font-family="Segoe UI, Arial" font-size="28" font-weight="800">TEMPLATE MODE</text>
  <text x="92" y="232" fill="#f8fafc" font-family="Segoe UI, Arial" font-size="68" font-weight="900">${name}</text>
  <foreignObject x="92" y="278" width="980" height="190">
    <div xmlns="http://www.w3.org/1999/xhtml" style="font-family: Segoe UI, Arial; color:#94a3b8; font-size:34px; line-height:1.35">${desc.substring(0, 150)}...</div>
  </foreignObject>
  <rect x="92" y="500" width="240" height="52" rx="26" fill="#f43f5e"/>
  <text x="124" y="535" fill="#ffffff" font-family="Segoe UI, Arial" font-size="24" font-weight="900">Deterministic V1</text>
</svg>
    `).toString("base64"),
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
}
