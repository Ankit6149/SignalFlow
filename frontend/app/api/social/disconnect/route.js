import { requireOwnerAccess } from "../../_auth.js";
import { disconnectPlatform, getConnectionStatus } from "../../../../lib/social/tokenStore.js";

/**
 * POST /api/social/disconnect
 * Disconnects a social platform by removing stored tokens.
 */
export async function POST(request) {
  const accessError = requireOwnerAccess(request);
  if (accessError) return accessError;

  try {
    const { platform } = await request.json();

    if (!platform) {
      return new Response(JSON.stringify({ error: "Missing platform parameter" }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }

    const status = getConnectionStatus(platform);
    if (!status.connected) {
      return new Response(JSON.stringify({
        ok: true,
        message: `${platform} was not connected.`
      }), {
        status: 200,
        headers: { "Content-Type": "application/json" }
      });
    }

    disconnectPlatform(platform);

    return new Response(JSON.stringify({
      ok: true,
      message: `Successfully disconnected ${platform}.`
    }), {
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
