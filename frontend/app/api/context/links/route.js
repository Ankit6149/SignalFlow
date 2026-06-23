import { requireOwnerAccess } from "../../_auth";
import { fetchUrlContent } from "../../../../lib/context/linkFetcher";

export async function POST(request) {
  const accessError = requireOwnerAccess(request);
  if (accessError) {
    return accessError;
  }

  try {
    const { urls } = await request.json();
    if (!urls || !Array.isArray(urls)) {
      return new Response(JSON.stringify({ error: "Missing or invalid urls array parameter" }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }

    const results = [];
    for (const url of urls) {
      if (url) {
        const fetched = await fetchUrlContent(url);
        if (fetched) {
          results.push(fetched);
        }
      }
    }

    return new Response(JSON.stringify({ linksContext: results }), {
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
