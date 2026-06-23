import { requireOwnerAccess } from "../_auth";

/**
 * Handles V1 review-first posting/publishing.
 * Only attempts official posting if official tokens are configured in the environment.
 */
export async function POST(request) {
  const accessError = requireOwnerAccess(request);
  if (accessError) {
    return accessError;
  }

  try {
    const { platform, content, projectName } = await request.json();
    if (!platform || !content) {
      return new Response(JSON.stringify({ ok: false, error: "Missing platform or content parameters" }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }

    const lowerPlatform = platform.toLowerCase();

    // 1. LinkedIn Official posting verification
    if (lowerPlatform === "linkedin") {
      const token = process.env.LINKEDIN_ACCESS_TOKEN;
      const orgId = process.env.LINKEDIN_ORGANIZATION_ID;
      
      if (!token || !orgId) {
        return new Response(JSON.stringify({
          ok: false,
          status: "ready_for_manual_posting",
          error: "LinkedIn access token or Organization ID is not configured in .env variables.",
          manualInstruction: "Please copy the draft post text and publish it manually on LinkedIn."
        }), {
          status: 200,
          headers: { "Content-Type": "application/json" }
        });
      }

      // Try official posting using LinkedIn Share API
      try {
        const shareUrl = "https://api.linkedin.com/v2/shares";
        const body = {
          owner: `urn:li:organization:${orgId}`,
          text: { text: content },
          distribution: {
            linkedInDistributionTarget: {
              visibleToConnectionOnly: false
            }
          }
        };

        const resp = await fetch(shareUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify(body)
        });

        if (!resp.ok) {
          const errDetails = await resp.text();
          throw new Error(`LinkedIn API Share failed (HTTP ${resp.status}): ${errDetails}`);
        }

        const data = await resp.json();
        return new Response(JSON.stringify({
          ok: true,
          platform: "LinkedIn",
          status: "published",
          postId: data.id,
          message: "Successfully published to LinkedIn organization feed!"
        }), {
          status: 200,
          headers: { "Content-Type": "application/json" }
        });
      } catch (err) {
        return new Response(JSON.stringify({
          ok: false,
          error: `Official LinkedIn posting failed: ${err.message}`
        }), {
          status: 200,
          headers: { "Content-Type": "application/json" }
        });
      }
    }

    // 2. X/Twitter Official posting verification
    if (lowerPlatform === "x" || lowerPlatform === "twitter") {
      const token = process.env.X_ACCESS_TOKEN;
      const key = process.env.X_API_KEY;
      const secret = process.env.X_API_SECRET;
      
      if (!token || !key || !secret) {
        return new Response(JSON.stringify({
          ok: false,
          status: "ready_for_manual_posting",
          error: "X API Key, Secret, or Access Token is not configured in .env variables.",
          manualInstruction: "Please copy the draft thread and post it manually on X."
        }), {
          status: 200,
          headers: { "Content-Type": "application/json" }
        });
      }

      // V1/V2 endpoints require OAuth signatures which is complex, we check keys and throw structured errors
      // or try basic bearer fetch if using v2 endpoint
      return new Response(JSON.stringify({
        ok: false,
        status: "ready_for_manual_posting",
        error: "X/Twitter requires custom OAuth1.0a signatures. API publishing is currently unconfigured. Use manual/export.",
        manualInstruction: "Copy the draft posts and use X scheduler."
      }), {
        status: 200,
        headers: { "Content-Type": "application/json" }
      });
    }

    // 3. Instagram Official posting verification
    if (lowerPlatform === "instagram") {
      const token = process.env.META_ACCESS_TOKEN;
      const igId = process.env.META_IG_USER_ID;

      if (!token || !igId) {
        return new Response(JSON.stringify({
          ok: false,
          status: "ready_for_manual_posting",
          error: "Instagram Meta Access Token or IG User ID is not configured in .env variables.",
          manualInstruction: "Copy caption and transfer assets manually."
        }), {
          status: 200,
          headers: { "Content-Type": "application/json" }
        });
      }

      return new Response(JSON.stringify({
        ok: false,
        status: "ready_for_manual_posting",
        error: "Instagram official API requires visual media uploads to Meta graph endpoints first. Manual publication is advised.",
      }), {
        status: 200,
        headers: { "Content-Type": "application/json" }
      });
    }

    // Standard manual queue fallback for other platforms
    return new Response(JSON.stringify({
      ok: false,
      status: "ready_for_manual_posting",
      message: `Platform "${platform}" does not support direct API integrations in V1. Manual posting is required.`
    }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });

  } catch (err) {
    return new Response(JSON.stringify({ ok: false, error: err.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}
