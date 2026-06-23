/**
 * Compiles a structured, copy-ready post payload with checklist, tags, and instructions
 * for the user to publish manually or verify before automatic hooks run.
 */
export function preparePostingPackage(platform, content, pkg = {}) {
  if (!platform || !content) {
    return {
      platform: platform || "unknown",
      status: "error",
      error: "Missing platform or content for preparation."
    };
  }

  const hashtags = [];
  // Extract hashtags from package if available
  const posts = pkg.posts || {};
  let mappedKey = platform;
  if (platform === "hn") mappedKey = "hackernews";
  if (platform === "release_notes") mappedKey = "releaseNotes";
  const platformData = posts[mappedKey] || {};
  if (Array.isArray(platformData.hashtags)) {
    hashtags.push(...platformData.hashtags);
  }

  // Detect assets needed
  const assetsNeeded = [];
  if (pkg.media?.assetChecklist) {
    pkg.media.assetChecklist.forEach(asset => {
      // Basic heuristic to align media requirements to platform
      if (platform === "linkedin" && (asset.includes("screenshot") || asset.includes("Card"))) {
        assetsNeeded.push(asset);
      } else if (platform === "instagram" && asset.includes("recording")) {
        assetsNeeded.push(asset);
      } else if (platform === "x" && (asset.includes("screenshot") || asset.includes("recording"))) {
        assetsNeeded.push(asset);
      }
    });
  }
  
  if (assetsNeeded.length === 0) {
    assetsNeeded.push("No explicit visual assets registered. (Recommended: 1x product screenshot)");
  }

  // Manual checklist specific to platform
  const checklist = [
    "Verify there are no passwords, secrets, or API keys in the copy text.",
    "Ensure any repository links or app URLs resolve successfully.",
    "Review character limits: X (280 characters unless premium), LinkedIn (3000 words limit)."
  ];

  if (platform === "linkedin") {
    checklist.push("Attach visual SVG Card or screenshot directly during composer preview.");
    checklist.push("Position links at the bottom or in the first comment to preserve algorithmic reach.");
  } else if (platform === "x") {
    checklist.push("If it is an X Thread, copy individual posts in order using the thread composer.");
  } else if (platform === "instagram") {
    checklist.push("Suggested visual style direction has been prepared: review rendering guides.");
  }

  // Check if API configured
  let isApiConfigured = false;
  const config = pkg.integration_config?.platforms?.[platform] || {};
  if (config.configured) {
    isApiConfigured = true;
  }

  return {
    platform,
    finalContent: content,
    hashtags,
    assetsNeeded,
    manualChecklist: checklist,
    copyReadyText: content,
    warning: isApiConfigured 
      ? "" 
      : `API credentials for ${platform.toUpperCase()} are not configured. You can safely publish manually using the Copy-to-Clipboard flow.`,
    status: "ready_for_manual_posting"
  };
}
