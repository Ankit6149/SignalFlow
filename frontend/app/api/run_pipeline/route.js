export async function POST(request) {
  const body = await request.json();
  return new Response(JSON.stringify({
    status: "app",
    message: "SignalFlow Studio is a one-app hosted product. Repository scanning should be wired into the app workflow before being exposed to users.",
    repo: body?.repo || "",
  }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}
