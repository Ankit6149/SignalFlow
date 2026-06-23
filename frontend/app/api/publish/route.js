import { requireOwnerAccess } from "../_auth.js";
import { publishToSocial } from "../../../lib/social/socialProviders.js";
import { getConnectionStatus } from "../../../lib/social/tokenStore.js";

/**
 * POST /api/publish
 * Publishes content to a connected social platform.
 * Uses stored OAuth tokens — never requires raw API keys in the request.
 */
export async function POST(request) {
  const accessError = requireOwnerAccess(request);
  if (accessError) return accessError;

  try {
    const { platform, content, projectName, options } = await request.json();

    if (!platform || !content) {
      return new Response(JSON.stringify({
        ok: false,
        error: "Missing platform or content parameters."
      }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }

    // Check connection status first
    const status = getConnectionStatus(platform);
    if (!status.connected) {
      return new Response(JSON.stringify({
        ok: false,
        status: "not_connected",
        error: `Your ${platform} account is not connected. Please connect it first from the Accounts panel.`,
        manualInstruction: "Copy the post text and publish manually."
      }), {
        status: 200,
        headers: { "Content-Type": "application/json" }
      });
    }

    // Attempt to publish via the social provider
    const result = await publishToSocial(platform, content, {
      projectName: projectName || "",
      ...(options || {})
    });

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });

  } catch (err) {
    return new Response(JSON.stringify({
      ok: false,
      error: `Publishing failed: ${err.message}`,
      manualInstruction: "Copy the post text and publish manually as a fallback."
    }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  }
}
