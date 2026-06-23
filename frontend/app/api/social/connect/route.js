import crypto from "crypto";
import { SOCIAL_PLATFORMS, getCallbackUrl, isPlatformConfigured } from "../../../../lib/social/socialConfig.js";
import { requireOwnerAccess } from "../../_auth.js";

/**
 * In-memory state store for OAuth CSRF protection.
 * In production, use a proper session store.
 */
const pendingStates = new Map();

// Clean up expired states every 10 minutes
if (typeof setInterval !== "undefined") {
  setInterval(() => {
    const now = Date.now();
    for (const [key, value] of pendingStates.entries()) {
      if (now - value.created > 10 * 60 * 1000) {
        pendingStates.delete(key);
      }
    }
  }, 10 * 60 * 1000);
}

/**
 * GET /api/social/connect?platform=linkedin|x|reddit
 * Initiates OAuth flow by redirecting to the platform's authorization page.
 */
export async function GET(request) {
  const accessError = requireOwnerAccess(request);
  if (accessError) return accessError;

  const { searchParams } = new URL(request.url);
  const platformId = searchParams.get("platform");

  if (!platformId || !SOCIAL_PLATFORMS[platformId]) {
    return new Response(JSON.stringify({
      error: `Unknown platform "${platformId}". Supported: ${Object.keys(SOCIAL_PLATFORMS).join(", ")}`
    }), { status: 400, headers: { "Content-Type": "application/json" } });
  }

  if (!isPlatformConfigured(platformId)) {
    const platform = SOCIAL_PLATFORMS[platformId];
    return new Response(JSON.stringify({
      error: `OAuth not configured for ${platform.label}. Set ${platform.clientEnvKey} and ${platform.secretEnvKey} in your .env.local file.`,
      setupUrl: platform.setupUrl,
      setupSteps: platform.setupSteps.map(s => s.replace("{callbackUrl}", getCallbackUrl(platformId)))
    }), { status: 400, headers: { "Content-Type": "application/json" } });
  }

  const platform = SOCIAL_PLATFORMS[platformId];
  const state = crypto.randomBytes(32).toString("hex");
  const stateData = { platform: platformId, created: Date.now() };

  // Generate PKCE challenge for X/Twitter
  if (platform.usePKCE) {
    const codeVerifier = crypto.randomBytes(32).toString("base64url");
    const codeChallenge = crypto.createHash("sha256").update(codeVerifier).digest("base64url");
    stateData.codeVerifier = codeVerifier;
    stateData.codeChallenge = codeChallenge;
  }

  pendingStates.set(state, stateData);

  // Build authorization URL
  const params = new URLSearchParams({
    response_type: platform.responseType,
    client_id: process.env[platform.clientEnvKey],
    redirect_uri: getCallbackUrl(platformId),
    scope: platform.scopes.join(" "),
    state
  });

  // Add PKCE parameters for X
  if (platform.usePKCE) {
    params.set("code_challenge", stateData.codeChallenge);
    params.set("code_challenge_method", "S256");
  }

  // Reddit requires duration=permanent for refresh tokens
  if (platformId === "reddit") {
    params.set("duration", "permanent");
  }

  const authorizationUrl = `${platform.authUrl}?${params.toString()}`;

  return Response.redirect(authorizationUrl, 302);
}

// Export for callback route to access pending states
export { pendingStates };
