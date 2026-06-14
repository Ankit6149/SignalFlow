export async function POST(request) {
  const body = await request.json();
  const payload = body?.payload || {};
  const source = payload.CoreTokens || body?.context || "Post package";
  return new Response(JSON.stringify({ markdown: `# Posting Package\n\n${String(source).slice(0, 800)}` }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}
