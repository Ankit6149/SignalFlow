import { requireOwnerAccess } from "../_auth";

export async function POST(request) {
  const accessError = requireOwnerAccess(request);
  if (accessError) {
    return accessError;
  }

  const body = await request.json();
  const payload = body?.payload || {};
  const source = payload.CoreTokens || body?.context || "Describe what should be posted.";
  const target = body?.target || "post";
  return new Response(JSON.stringify({ 
    text: `[Standalone ${target}] ${String(source).slice(0, 420)}`,
    note: "Experimental/Internal API route. Not for main UI workflow.",
    experimental: true
  }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}
