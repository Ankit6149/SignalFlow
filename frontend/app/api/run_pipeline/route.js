import { requireOwnerAccess } from "../_auth";

export async function POST(request) {
  const accessError = requireOwnerAccess(request);
  if (accessError) {
    return accessError;
  }

  const body = await request.json();
  return new Response(JSON.stringify({
    status: "app",
    message: "SignalFlow Studio is a one-app hosted product. Repository scanning should be wired into the app workflow before being exposed to users.",
    repo: body?.repo || "",
    note: "Experimental/Internal API route. Not for main UI workflow.",
    experimental: true
  }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}
