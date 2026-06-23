import JSZip from "jszip";
import { buildMarkdown } from "./markdown";
import { buildJSONExport } from "./json";

/**
 * Builds a ZIP buffer containing separate drafts for all selected channels.
 */
export async function buildZipExport(pkg, metadata = {}) {
  const zip = new JSZip();
  const name = pkg.project?.name || "signalflow";
  
  // 1. Add markdown and json overview summaries
  const mdContent = buildMarkdown({ projectName: name, package: pkg, prompt: metadata.prompt || "" });
  zip.file("package.md", mdContent);
  
  const jsonContent = buildJSONExport(pkg, metadata);
  zip.file("package.json", jsonContent);

  const posts = pkg.posts || {};
  const channels = metadata.selectedChannels || Object.keys(posts);

  // 2. Extract selected formats to separate files
  if (channels.includes("linkedin") && posts.linkedin) {
    const li = posts.linkedin;
    const body = li.body || li;
    const tags = Array.isArray(li.hashtags) ? li.hashtags.map(h => `#${h}`).join(" ") : "";
    const text = `Title: ${li.title || "LinkedIn Update"}\n\n${body}\n\nCTA: ${li.cta || ""}\n${tags}`;
    zip.file("linkedin.txt", text);
  }

  if (channels.includes("x") && posts.x) {
    const x = posts.x;
    const text = Array.isArray(x.posts) ? x.posts.join("\n\n---\n\n") : (x.body || x);
    zip.file("x.txt", text);
  }

  if (channels.includes("instagram") && posts.instagram) {
    const inst = posts.instagram;
    const cap = inst.caption || inst;
    const tags = Array.isArray(inst.hashtags) ? inst.hashtags.map(h => `#${h}`).join(" ") : "";
    const text = `${cap}\n\nVisual Direction:\n${inst.visualDirection || "N/A"}\n\n${tags}`;
    zip.file("instagram.txt", text);
  }

  if (channels.includes("reddit") && posts.reddit) {
    const red = posts.reddit;
    const subreddits = Array.isArray(red.subredditSuggestions) ? red.subredditSuggestions.join(", ") : "";
    const text = `Subreddit Suggestions: ${subreddits}\n\nTitle: ${red.title || "Reddit Post"}\n\n${red.body || red}`;
    zip.file("reddit.txt", text);
  }

  if (channels.includes("hn") && posts.hackernews) {
    const hn = posts.hackernews;
    const text = `Title: ${hn.title || "Show HN"}\n\n${hn.body || hn}`;
    zip.file("hackernews.txt", text);
  }

  if (channels.includes("blog") && posts.blog) {
    const blog = posts.blog;
    const text = `# ${blog.title || "Blog Draft"}\n\n${blog.draft || blog}`;
    zip.file("blog.md", text);
  }

  if (channels.includes("newsletter") && posts.newsletter) {
    const nl = posts.newsletter;
    const text = `Subject: ${nl.subject || "Newsletter"}\nPreview: ${nl.preview || ""}\n\n${nl.body || nl}`;
    zip.file("newsletter.md", text);
  }

  if (channels.includes("release_notes") && posts.releaseNotes) {
    const rn = posts.releaseNotes;
    const secTexts = Array.isArray(rn.sections) 
      ? rn.sections.map(s => `## ${s.title}\n${Array.isArray(s.items) ? s.items.map(i => `- ${i}`).join("\n") : s.items}`).join("\n\n")
      : (rn.body || rn);
    const text = `# ${rn.title || "Release Notes"}\n\n${secTexts}`;
    zip.file("release-notes.md", text);
  }

  // 3. Media schedules
  if (pkg.media) {
    let mediaMd = `# Visual Media Plan for ${name}\n\n`;
    if (pkg.media.screenshotPlan?.length) {
      mediaMd += `### Screenshot Plan\n`;
      pkg.media.screenshotPlan.forEach(p => { mediaMd += `- [ ] ${p}\n`; });
      mediaMd += `\n`;
    }
    if (pkg.media.videoScript?.length) {
      mediaMd += `### Video script\n`;
      pkg.media.videoScript.forEach(p => { mediaMd += `- ${p}\n`; });
      mediaMd += `\n`;
    }
    if (pkg.media.carouselPlan?.length) {
      mediaMd += `### Carousel Plan\n`;
      pkg.media.carouselPlan.forEach(p => { mediaMd += `- ${p}\n`; });
    }
    zip.file("media-plan.md", mediaMd);
  }

  // 4. Checklist schedules
  if (pkg.publishing) {
    let pubMd = `# Publishing Checklist for ${name}\n\n`;
    if (pkg.publishing.platformChecklist?.length) {
      pubMd += `### Platform Steps\n`;
      pkg.publishing.platformChecklist.forEach(p => { pubMd += `- [ ] ${p}\n`; });
      pubMd += `\n`;
    }
    if (pkg.publishing.manualPostingSteps?.length) {
      pubMd += `### Posting Flow\n`;
      pkg.publishing.manualPostingSteps.forEach(p => { pubMd += `${p}\n`; });
    }
    zip.file("publishing-checklist.md", pubMd);
  }

  return await zip.generateAsync({ type: "nodebuffer" });
}
