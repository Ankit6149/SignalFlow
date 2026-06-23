import { SOCIAL_PLATFORMS, getCallbackUrl } from "../../../../../lib/social/socialConfig.js";
import { storeToken } from "../../../../../lib/social/tokenStore.js";
import { pendingStates } from "../../connect/route.js";

/**
 * GET /api/social/callback/[platform]
 * Handles the OAuth callback from the social platform.
 * Exchanges authorization code for access token, stores encrypted token, and redirects back to app.
 */
export async function GET(request, { params }) {
  const platformId = params.platform;
  const platform = SOCIAL_PLATFORMS[platformId];

  if (!platform) {
    return buildRedirect("error", `Unknown platform: ${platformId}`);
  }

  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const error = searchParams.get("error");
  const errorDescription = searchParams.get("error_description");

  // Handle error responses from the platform
  if (error) {
    return buildRedirect("error", errorDescription || error);
  }

  if (!code || !state) {
    return buildRedirect("error", "Missing authorization code or state parameter.");
  }

  // Verify state to prevent CSRF
  const stateData = pendingStates.get(state);
  if (!stateData || stateData.platform !== platformId) {
    return buildRedirect("error", "Invalid or expired state parameter. Please try connecting again.");
  }
  pendingStates.delete(state);

  try {
    // Exchange authorization code for access token
    const tokenData = await exchangeCodeForToken(platformId, platform, code, stateData);

    // Fetch user profile
    const profile = await fetchUserProfile(platformId, platform, tokenData.access_token);

    // Store encrypted token
    storeToken(platformId, tokenData, profile);

    return buildRedirect("success", `Connected to ${platform.label} as ${profile.name || profile.username || "user"}`);

  } catch (err) {
    console.error(`OAuth callback error for ${platformId}:`, err.message);
    return buildRedirect("error", err.message);
  }
}

/**
 * Exchanges the authorization code for an access token.
 */
async function exchangeCodeForToken(platformId, platform, code, stateData) {
  const tokenParams = {
    grant_type: "authorization_code",
    code,
    redirect_uri: getCallbackUrl(platformId)
  };

  let headers = { "Content-Type": "application/x-www-form-urlencoded" };

  if (platformId === "linkedin") {
    tokenParams.client_id = process.env[platform.clientEnvKey];
    tokenParams.client_secret = process.env[platform.secretEnvKey];
  } else if (platformId === "x") {
    // X uses Basic auth + PKCE code_verifier
    const credentials = Buffer.from(
      `${process.env[platform.clientEnvKey]}:${process.env[platform.secretEnvKey]}`
    ).toString("base64");
    headers.Authorization = `Basic ${credentials}`;
    if (stateData.codeVerifier) {
      tokenParams.code_verifier = stateData.codeVerifier;
    }
  } else if (platformId === "reddit") {
    const credentials = Buffer.from(
      `${process.env[platform.clientEnvKey]}:${process.env[platform.secretEnvKey]}`
    ).toString("base64");
    headers.Authorization = `Basic ${credentials}`;
  }

  const resp = await fetch(platform.tokenUrl, {
    method: "POST",
    headers,
    body: new URLSearchParams(tokenParams)
  });

  if (!resp.ok) {
    const errText = await resp.text();
    throw new Error(`Token exchange failed for ${platform.label} (${resp.status}): ${errText}`);
  }

  return resp.json();
}

/**
 * Fetches the user's profile from the platform.
 */
async function fetchUserProfile(platformId, platform, accessToken) {
  const headers = {
    Authorization: `Bearer ${accessToken}`
  };

  // Reddit requires User-Agent
  if (platformId === "reddit") {
    headers["User-Agent"] = "SignalFlowStudio/1.0";
  }

  try {
    const resp = await fetch(platform.profileUrl, { headers });
    if (!resp.ok) {
      return { name: "Unknown", username: "unknown", id: "" };
    }

    const data = await resp.json();

    switch (platformId) {
      case "linkedin":
        return {
          name: data.name || `${data.given_name || ""} ${data.family_name || ""}`.trim(),
          username: data.email || data.sub || "",
          id: data.sub || ""
        };
      case "x":
        return {
          name: data.data?.name || "",
          username: data.data?.username || "",
          id: data.data?.id || ""
        };
      case "reddit":
        return {
          name: data.name || "",
          username: `u/${data.name || ""}`,
          id: data.id || ""
        };
      default:
        return { name: "Unknown", username: "unknown", id: "" };
    }
  } catch {
    return { name: "Connected User", username: "", id: "" };
  }
}

/**
 * Builds a redirect response back to the app with status info.
 */
function buildRedirect(status, message) {
  const baseUrl = process.env.NEXTAUTH_URL || process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : "http://localhost:3000";

  const params = new URLSearchParams({
    social_status: status,
    social_message: message
  });

  return Response.redirect(`${baseUrl}/?${params.toString()}`, 302);
}
