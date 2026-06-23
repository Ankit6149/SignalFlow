import { requireOwnerAccess } from "../../_auth.js";
import { getAllConnectionStatus } from "../../../../lib/social/tokenStore.js";
import { getAllPlatformStatus } from "../../../../lib/social/socialConfig.js";

/**
 * GET /api/social/status
 * Returns the connection status for all social platforms.
 * Shows: configured (OAuth credentials exist), connected (user has authed), profile info.
 * Never returns raw tokens.
 */
export async function GET(request) {
  const accessError = requireOwnerAccess(request);
  if (accessError) return accessError;

  try {
    const platformConfig = getAllPlatformStatus();
    const connections = getAllConnectionStatus();

    // Merge configuration status with connection status
    const result = {};
    for (const [key, config] of Object.entries(platformConfig)) {
      const connection = connections[key] || { connected: false };
      result[key] = {
        ...config,
        connected: connection.connected,
        profile: connection.profile || null,
        connectedAt: connection.connectedAt || null,
        expired: connection.expired || false,
        hasRefreshToken: connection.hasRefreshToken || false
      };
    }

    // Add manual-only platforms
    result.instagram = {
      id: "instagram",
      label: "Instagram",
      icon: "📷",
      color: "#E1306C",
      configured: false,
      connected: false,
      manualOnly: true,
      reason: "Instagram API requires Meta Business account and media URL uploads. Use manual posting for now.",
      supportsMedia: true,
      postMaxLength: 2200
    };

    result.hn = {
      id: "hn",
      label: "Hacker News",
      icon: "Y",
      color: "#FF6600",
      configured: false,
      connected: false,
      manualOnly: true,
      reason: "Hacker News has no official posting API. Submit manually at news.ycombinator.com.",
      supportsMedia: false,
      postMaxLength: null
    };

    result.blog = {
      id: "blog",
      label: "Blog",
      icon: "✍",
      color: "#333333",
      configured: false,
      connected: false,
      manualOnly: true,
      reason: "Blog publishing depends on your CMS. Use the exported markdown file.",
      supportsMedia: true,
      postMaxLength: null
    };

    result.newsletter = {
      id: "newsletter",
      label: "Newsletter",
      icon: "📧",
      color: "#6366F1",
      configured: false,
      connected: false,
      manualOnly: true,
      reason: "Newsletter sending depends on your email provider (Substack, Buttondown, etc.). Copy the generated content.",
      supportsMedia: true,
      postMaxLength: null
    };

    result.release_notes = {
      id: "release_notes",
      label: "Release Notes",
      icon: "📋",
      color: "#059669",
      configured: false,
      connected: false,
      manualOnly: true,
      reason: "Release notes are exported as markdown. Paste into GitHub Releases or your changelog.",
      supportsMedia: false,
      postMaxLength: null
    };

    return new Response(JSON.stringify({ platforms: result }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });

  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}
