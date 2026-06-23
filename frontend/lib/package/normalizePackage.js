import { generateLocalTemplatePackage } from "./templatePackage";

/**
 * Ensures that a package object strictly conforms to the expected structure.
 * Fills in any missing sections or platform posts with clean fallback text.
 */
export function normalizePackage(rawPkg, inputs) {
  const baseline = generateLocalTemplatePackage(inputs).package;
  
  if (!rawPkg || typeof rawPkg !== "object") {
    return baseline;
  }

  const normalized = {
    project: {
      name: rawPkg?.project?.name || rawPkg?.project_name || baseline.project.name,
      oneLine: rawPkg?.project?.oneLine || baseline.project.oneLine,
      description: rawPkg?.project?.description || rawPkg?.description || baseline.project.description,
      audience: rawPkg?.project?.audience || baseline.project.audience,
      category: rawPkg?.project?.category || baseline.project.category,
      stage: rawPkg?.project?.stage || baseline.project.stage
    },
    context: {
      confirmedFacts: Array.isArray(rawPkg?.context?.confirmedFacts) ? rawPkg.context.confirmedFacts : baseline.context.confirmedFacts,
      inferredFacts: Array.isArray(rawPkg?.context?.inferredFacts) ? rawPkg.context.inferredFacts : baseline.context.inferredFacts,
      missingContext: Array.isArray(rawPkg?.context?.missingContext) ? rawPkg.context.missingContext : baseline.context.missingContext,
      features: Array.isArray(rawPkg?.context?.features) ? rawPkg.context.features : baseline.context.features,
      techStack: Array.isArray(rawPkg?.context?.techStack) ? rawPkg.context.techStack : baseline.context.techStack,
      repoInsights: Array.isArray(rawPkg?.context?.repoInsights) ? rawPkg.context.repoInsights : baseline.context.repoInsights,
      docsInsights: Array.isArray(rawPkg?.context?.docsInsights) ? rawPkg.context.docsInsights : baseline.context.docsInsights,
      linkInsights: Array.isArray(rawPkg?.context?.linkInsights) ? rawPkg.context.linkInsights : baseline.context.linkInsights,
      mediaInsights: Array.isArray(rawPkg?.context?.mediaInsights) ? rawPkg.context.mediaInsights : baseline.context.mediaInsights
    },
    strategy: {
      coreAngle: rawPkg?.strategy?.coreAngle || baseline.strategy.coreAngle,
      positioning: rawPkg?.strategy?.positioning || baseline.strategy.positioning,
      hooks: Array.isArray(rawPkg?.strategy?.hooks) ? rawPkg.strategy.hooks : baseline.strategy.hooks,
      proofPoints: Array.isArray(rawPkg?.strategy?.proofPoints) ? rawPkg.strategy.proofPoints : baseline.strategy.proofPoints,
      risks: Array.isArray(rawPkg?.strategy?.risks) ? rawPkg.strategy.risks : baseline.strategy.risks,
      safeClaims: Array.isArray(rawPkg?.strategy?.safeClaims) ? rawPkg.strategy.safeClaims : baseline.strategy.safeClaims,
      avoidClaims: Array.isArray(rawPkg?.strategy?.avoidClaims) ? rawPkg.strategy.avoidClaims : baseline.strategy.avoidClaims
    },
    posts: {
      linkedin: normalizeLinkedInPost(rawPkg?.posts?.linkedin, baseline.posts.linkedin),
      x: normalizeXPost(rawPkg?.posts?.x, baseline.posts.x),
      instagram: normalizeInstagramPost(rawPkg?.posts?.instagram, baseline.posts.instagram),
      reddit: normalizeRedditPost(rawPkg?.posts?.reddit, baseline.posts.reddit),
      hackernews: normalizeHNPost(rawPkg?.posts?.hackernews, baseline.posts.hackernews),
      blog: normalizeBlogPost(rawPkg?.posts?.blog, baseline.posts.blog),
      newsletter: normalizeNewsletterPost(rawPkg?.posts?.newsletter, baseline.posts.newsletter),
      releaseNotes: normalizeReleaseNotes(rawPkg?.posts?.releaseNotes || rawPkg?.posts?.release_notes, baseline.posts.releaseNotes)
    },
    media: {
      screenshotPlan: Array.isArray(rawPkg?.media?.screenshotPlan) ? rawPkg.media.screenshotPlan : baseline.media.screenshotPlan,
      videoScript: Array.isArray(rawPkg?.media?.videoScript) ? rawPkg.media.videoScript : baseline.media.videoScript,
      carouselPlan: Array.isArray(rawPkg?.media?.carouselPlan) ? rawPkg.media.carouselPlan : baseline.media.carouselPlan,
      thumbnailIdeas: Array.isArray(rawPkg?.media?.thumbnailIdeas) ? rawPkg.media.thumbnailIdeas : baseline.media.thumbnailIdeas,
      altText: Array.isArray(rawPkg?.media?.altText) ? rawPkg.media.altText : baseline.media.altText,
      assetChecklist: Array.isArray(rawPkg?.media?.assetChecklist) ? rawPkg.media.assetChecklist : baseline.media.assetChecklist,
      shotList: Array.isArray(rawPkg?.media?.shotList) ? rawPkg.media.shotList : baseline.media.shotList,
      videoEditingTimeline: Array.isArray(rawPkg?.media?.videoEditingTimeline) ? rawPkg.media.videoEditingTimeline : baseline.media.videoEditingTimeline,
      thumbnailPrompt: rawPkg?.media?.thumbnailPrompt || baseline.media.thumbnailPrompt
    },
    publishing: {
      platformChecklist: Array.isArray(rawPkg?.publishing?.platformChecklist) ? rawPkg.publishing.platformChecklist : baseline.publishing.platformChecklist,
      manualPostingSteps: Array.isArray(rawPkg?.publishing?.manualPostingSteps) ? rawPkg.publishing.manualPostingSteps : baseline.publishing.manualPostingSteps,
      apiPublishingNotes: rawPkg?.publishing?.apiPublishingNotes || baseline.publishing.apiPublishingNotes,
      warnings: Array.isArray(rawPkg?.publishing?.warnings) ? rawPkg.publishing.warnings : baseline.publishing.warnings
    }
  };

  return normalized;
}

function normalizeLinkedInPost(val, fallback) {
  if (!val) return fallback;
  if (typeof val === "string") return { body: val, title: fallback.title, hashtags: fallback.hashtags, cta: fallback.cta };
  return {
    title: val.title || fallback.title,
    body: val.body || val.text || fallback.body,
    hashtags: Array.isArray(val.hashtags) ? val.hashtags : fallback.hashtags,
    cta: val.cta || fallback.cta
  };
}

function normalizeXPost(val, fallback) {
  if (!val) return fallback;
  if (typeof val === "string") return { mode: "post_or_thread", posts: [val] };
  if (Array.isArray(val)) return { mode: "post_or_thread", posts: val };
  return {
    mode: val.mode || "post_or_thread",
    posts: Array.isArray(val.posts) ? val.posts : (val.body ? [val.body] : fallback.posts)
  };
}

function normalizeInstagramPost(val, fallback) {
  if (!val) return fallback;
  if (typeof val === "string") return { caption: val, hashtags: fallback.hashtags, visualDirection: fallback.visualDirection };
  return {
    caption: val.caption || val.body || fallback.caption,
    hashtags: Array.isArray(val.hashtags) ? val.hashtags : fallback.hashtags,
    visualDirection: val.visualDirection || val.visual_direction || fallback.visualDirection
  };
}

function normalizeRedditPost(val, fallback) {
  if (!val) return fallback;
  if (typeof val === "string") return { title: fallback.title, body: val, subredditSuggestions: fallback.subredditSuggestions };
  return {
    title: val.title || fallback.title,
    body: val.body || val.text || fallback.body,
    subredditSuggestions: Array.isArray(val.subredditSuggestions || val.subreddits) ? (val.subredditSuggestions || val.subreddits) : fallback.subredditSuggestions
  };
}

function normalizeHNPost(val, fallback) {
  if (!val) return fallback;
  if (typeof val === "string") return { title: fallback.title, body: val };
  return {
    title: val.title || fallback.title,
    body: val.body || val.text || fallback.body
  };
}

function normalizeBlogPost(val, fallback) {
  if (!val) return fallback;
  if (typeof val === "string") return { title: fallback.title, outline: fallback.outline, draft: val };
  return {
    title: val.title || fallback.title,
    outline: Array.isArray(val.outline) ? val.outline : fallback.outline,
    draft: val.draft || val.body || fallback.draft
  };
}

function normalizeNewsletterPost(val, fallback) {
  if (!val) return fallback;
  if (typeof val === "string") return { subject: fallback.subject, preview: fallback.preview, body: val };
  return {
    subject: val.subject || val.title || fallback.subject,
    preview: val.preview || fallback.preview,
    body: val.body || fallback.body
  };
}

function normalizeReleaseNotes(val, fallback) {
  if (!val) return fallback;
  if (typeof val === "string") return { title: fallback.title, sections: [{ title: "Notes", items: [val] }] };
  return {
    title: val.title || fallback.title,
    sections: Array.isArray(val.sections) ? val.sections.map(s => ({
      title: s.title || "Section",
      items: Array.isArray(s.items) ? s.items : (s.body ? [s.body] : [])
    })) : fallback.sections
  };
}
