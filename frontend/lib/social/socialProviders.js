import { SOCIAL_PLATFORMS } from "./socialConfig.js";
import { getAccessToken, getRefreshToken, isTokenExpired, updateAccessToken } from "./tokenStore.js";

/**
 * Platform-specific posting functions.
 * Each function takes a decrypted token and content, then posts to the platform's API.
 */

// ─── Token Refresh ───

async function refreshLinkedInToken(refreshToken) {
  const platform = SOCIAL_PLATFORMS.linkedin;
  const resp = await fetch(platform.tokenUrl, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: refreshToken,
      client_id: process.env[platform.clientEnvKey],
      client_secret: process.env[platform.secretEnvKey]
    })
  });
  if (!resp.ok) throw new Error("LinkedIn token refresh failed");
  return resp.json();
}

async function refreshXToken(refreshToken) {
  const platform = SOCIAL_PLATFORMS.x;
  const credentials = Buffer.from(
    `${process.env[platform.clientEnvKey]}:${process.env[platform.secretEnvKey]}`
  ).toString("base64");
  const resp = await fetch(platform.tokenUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${credentials}`
    },
    body: new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: refreshToken
    })
  });
  if (!resp.ok) throw new Error("X token refresh failed");
  return resp.json();
}

async function refreshRedditToken(refreshToken) {
  const platform = SOCIAL_PLATFORMS.reddit;
  const credentials = Buffer.from(
    `${process.env[platform.clientEnvKey]}:${process.env[platform.secretEnvKey]}`
  ).toString("base64");
  const resp = await fetch(platform.tokenUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${credentials}`
    },
    body: new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: refreshToken
    })
  });
  if (!resp.ok) throw new Error("Reddit token refresh failed");
  return resp.json();
}

/**
 * Ensures a valid access token is available, refreshing if needed.
 */
async function ensureValidToken(platformId) {
  let token = getAccessToken(platformId);
  if (!token) {
    throw new Error(`No access token stored for ${platformId}. Please connect your account first.`);
  }

  if (isTokenExpired(platformId)) {
    const refreshToken = getRefreshToken(platformId);
    if (!refreshToken) {
      throw new Error(`Token for ${platformId} has expired and no refresh token is available. Please reconnect your account.`);
    }

    let newTokenData;
    switch (platformId) {
      case "linkedin":
        newTokenData = await refreshLinkedInToken(refreshToken);
        break;
      case "x":
        newTokenData = await refreshXToken(refreshToken);
        break;
      case "reddit":
        newTokenData = await refreshRedditToken(refreshToken);
        break;
      default:
        throw new Error(`Token refresh not supported for ${platformId}`);
    }

    updateAccessToken(platformId, newTokenData);
    token = newTokenData.access_token;
  }

  return token;
}

// ─── LinkedIn Posting ───

export async function postToLinkedIn(content, projectName = "") {
  const token = await ensureValidToken("linkedin");

  // Get user profile URN
  const profileResp = await fetch("https://api.linkedin.com/v2/userinfo", {
    headers: { Authorization: `Bearer ${token}` }
  });

  if (!profileResp.ok) {
    const errText = await profileResp.text();
    throw new Error(`LinkedIn profile fetch failed: ${errText}`);
  }

  const profile = await profileResp.json();
  const authorUrn = `urn:li:person:${profile.sub}`;

  // Create UGC Post
  const postBody = {
    author: authorUrn,
    lifecycleState: "PUBLISHED",
    specificContent: {
      "com.linkedin.ugc.ShareContent": {
        shareCommentary: {
          text: content.substring(0, 3000) // LinkedIn 3000 char limit
        },
        shareMediaCategory: "NONE"
      }
    },
    visibility: {
      "com.linkedin.ugc.MemberNetworkVisibility": "PUBLIC"
    }
  };

  const postResp = await fetch("https://api.linkedin.com/v2/ugcPosts", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      "X-Restli-Protocol-Version": "2.0.0"
    },
    body: JSON.stringify(postBody)
  });

  if (!postResp.ok) {
    const errText = await postResp.text();
    throw new Error(`LinkedIn post failed (${postResp.status}): ${errText}`);
  }

  const result = await postResp.json();
  const postId = result.id || "";
  const postUrl = postId
    ? `https://www.linkedin.com/feed/update/${postId}/`
    : "https://www.linkedin.com/feed/";

  return {
    ok: true,
    platform: "linkedin",
    postId,
    postUrl,
    message: "Successfully published to LinkedIn!"
  };
}

// ─── X/Twitter Posting ───

export async function postToX(content) {
  const token = await ensureValidToken("x");

  // For threads, split by double newline
  const parts = content.split(/\n\n+/).filter(Boolean);

  if (parts.length === 1 || content.length <= 280) {
    // Single tweet
    const tweetResp = await fetch("https://api.twitter.com/2/tweets", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ text: content.substring(0, 280) })
    });

    if (!tweetResp.ok) {
      const errText = await tweetResp.text();
      throw new Error(`X post failed (${tweetResp.status}): ${errText}`);
    }

    const result = await tweetResp.json();
    const tweetId = result.data?.id || "";
    return {
      ok: true,
      platform: "x",
      postId: tweetId,
      postUrl: tweetId ? `https://x.com/i/status/${tweetId}` : "https://x.com",
      message: "Successfully posted to X!"
    };
  }

  // Thread posting
  let previousTweetId = null;
  let firstTweetId = null;

  for (const part of parts.slice(0, 25)) { // Max 25 tweets in thread
    const tweetBody = { text: part.substring(0, 280) };
    if (previousTweetId) {
      tweetBody.reply = { in_reply_to_tweet_id: previousTweetId };
    }

    const tweetResp = await fetch("https://api.twitter.com/2/tweets", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(tweetBody)
    });

    if (!tweetResp.ok) {
      const errText = await tweetResp.text();
      throw new Error(`X thread post failed at tweet ${parts.indexOf(part) + 1}: ${errText}`);
    }

    const result = await tweetResp.json();
    previousTweetId = result.data?.id;
    if (!firstTweetId) firstTweetId = previousTweetId;
  }

  return {
    ok: true,
    platform: "x",
    postId: firstTweetId,
    postUrl: firstTweetId ? `https://x.com/i/status/${firstTweetId}` : "https://x.com",
    message: `Successfully posted thread (${Math.min(parts.length, 25)} tweets) to X!`
  };
}

// ─── Reddit Posting ───

export async function postToReddit(content, options = {}) {
  const token = await ensureValidToken("reddit");

  const subreddit = options.subreddit || "test";
  const title = options.title || options.projectName || "New Post";

  const submitResp = await fetch("https://oauth.reddit.com/api/submit", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Bearer ${token}`,
      "User-Agent": "SignalFlowStudio/1.0"
    },
    body: new URLSearchParams({
      kind: "self",
      sr: subreddit,
      title: title.substring(0, 300),
      text: content.substring(0, 40000),
      api_type: "json"
    })
  });

  if (!submitResp.ok) {
    const errText = await submitResp.text();
    throw new Error(`Reddit submit failed (${submitResp.status}): ${errText}`);
  }

  const result = await submitResp.json();
  const postUrl = result.json?.data?.url || "https://www.reddit.com";
  const postId = result.json?.data?.id || "";

  return {
    ok: true,
    platform: "reddit",
    postId,
    postUrl,
    message: `Successfully posted to r/${subreddit}!`
  };
}

/**
 * Main dispatch function: routes to the correct platform posting function.
 */
export async function publishToSocial(platformId, content, options = {}) {
  switch (platformId) {
    case "linkedin":
      return postToLinkedIn(content, options.projectName);
    case "x":
      return postToX(content);
    case "reddit":
      return postToReddit(content, options);
    default:
      return {
        ok: false,
        platform: platformId,
        error: `Direct posting to "${platformId}" is not supported yet. Use manual copy & paste.`,
        status: "manual_only"
      };
  }
}
