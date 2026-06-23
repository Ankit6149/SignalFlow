import { requireOwnerAccess } from "../../_auth";
import { ingestGitHubRepo } from "../../../../lib/context/github";

export async function POST(request) {
  const accessError = requireOwnerAccess(request);
  if (accessError) {
    return accessError;
  }

  try {
    const { repoUrl } = await request.json();
    if (!repoUrl) {
      return new Response(JSON.stringify({ error: "Missing repoUrl parameter" }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }

    const result = await ingestGitHubRepo(repoUrl);
    
    return new Response(JSON.stringify(result), {
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
