/**
 * Social platform OAuth configuration registry.
 * Each platform defines its OAuth endpoints, scopes, and env variable keys.
 */

export const SOCIAL_PLATFORMS = {
  linkedin: {
    id: "linkedin",
    label: "LinkedIn",
    icon: "in",
    color: "#0A66C2",
    authUrl: "https://www.linkedin.com/oauth/v2/authorization",
    tokenUrl: "https://www.linkedin.com/oauth/v2/accessToken",
    profileUrl: "https://api.linkedin.com/v2/userinfo",
    scopes: ["openid", "profile", "w_member_social"],
    clientEnvKey: "LINKEDIN_CLIENT_ID",
    secretEnvKey: "LINKEDIN_CLIENT_SECRET",
    grantType: "authorization_code",
    responseType: "code",
    tokenExpiry: 60 * 24 * 60 * 60, // 60 days default
    postMaxLength: 3000,
    supportsMedia: true,
    postEndpoint: "https://api.linkedin.com/v2/ugcPosts",
    setupUrl: "https://www.linkedin.com/developers/apps",
    setupSteps: [
      "Go to LinkedIn Developer Portal → Create App",
      "Add 'Sign In with LinkedIn using OpenID Connect' and 'Share on LinkedIn' products",
      "Set Redirect URL to: {callbackUrl}",
      "Copy Client ID and Client Secret to .env.local"
    ]
  },

  x: {
    id: "x",
    label: "X (Twitter)",
    icon: "𝕏",
    color: "#000000",
    authUrl: "https://twitter.com/i/oauth2/authorize",
    tokenUrl: "https://api.twitter.com/2/oauth2/token",
    profileUrl: "https://api.twitter.com/2/users/me",
    scopes: ["tweet.read", "tweet.write", "users.read", "offline.access"],
    clientEnvKey: "X_CLIENT_ID",
    secretEnvKey: "X_CLIENT_SECRET",
    grantType: "authorization_code",
    responseType: "code",
    usePKCE: true, // X requires PKCE for OAuth 2.0
    tokenExpiry: 2 * 60 * 60, // 2 hours (uses refresh tokens)
    postMaxLength: 280,
    threadMaxLength: 25,
    supportsMedia: true,
    postEndpoint: "https://api.twitter.com/2/tweets",
    setupUrl: "https://developer.twitter.com/en/portal/dashboard",
    setupSteps: [
      "Go to X Developer Portal → Create a Project & App",
      "Set up User Authentication with OAuth 2.0",
      "Set Type to 'Web App' and Redirect URL to: {callbackUrl}",
      "Copy Client ID and Client Secret to .env.local"
    ]
  },

  reddit: {
    id: "reddit",
    label: "Reddit",
    icon: "R",
    color: "#FF4500",
    authUrl: "https://www.reddit.com/api/v1/authorize",
    tokenUrl: "https://www.reddit.com/api/v1/access_token",
    profileUrl: "https://oauth.reddit.com/api/v1/me",
    scopes: ["identity", "submit", "read"],
    clientEnvKey: "REDDIT_CLIENT_ID",
    secretEnvKey: "REDDIT_CLIENT_SECRET",
    grantType: "authorization_code",
    responseType: "code",
    tokenExpiry: 60 * 60, // 1 hour (uses refresh tokens)
    postMaxLength: 40000,
    supportsMedia: false, // Text posts only in V1
    postEndpoint: "https://oauth.reddit.com/api/submit",
    setupUrl: "https://www.reddit.com/prefs/apps",
    setupSteps: [
      "Go to Reddit Apps Preferences → Create App",
      "Select 'web app' type",
      "Set Redirect URI to: {callbackUrl}",
      "Copy App ID (under app name) and Secret to .env.local"
    ]
  }
};

/**
 * Returns the callback URL for a given platform.
 */
export function getCallbackUrl(platform) {
  const base = process.env.NEXTAUTH_URL || process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : "http://localhost:3000";
  return `${base}/api/social/callback/${platform}`;
}

/**
 * Checks if a platform's OAuth client credentials are configured.
 */
export function isPlatformConfigured(platformId) {
  const platform = SOCIAL_PLATFORMS[platformId];
  if (!platform) return false;
  return Boolean(
    process.env[platform.clientEnvKey] &&
    process.env[platform.secretEnvKey]
  );
}

/**
 * Returns configuration status for all platforms.
 */
export function getAllPlatformStatus() {
  const status = {};
  for (const [key, platform] of Object.entries(SOCIAL_PLATFORMS)) {
    status[key] = {
      id: platform.id,
      label: platform.label,
      icon: platform.icon,
      color: platform.color,
      configured: isPlatformConfigured(key),
      postMaxLength: platform.postMaxLength,
      supportsMedia: platform.supportsMedia,
      setupUrl: platform.setupUrl,
      setupSteps: platform.setupSteps.map(s =>
        s.replace("{callbackUrl}", getCallbackUrl(key))
      )
    };
  }
  return status;
}
