import { requireOwnerAccess } from "../_auth";

export async function POST(request) {
  const accessError = requireOwnerAccess(request);
  if (accessError) {
    return accessError;
  }

  const body = await request.json();
  const code = String(body?.code || "SignalFlow Studio standalone card");
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630"><rect width="1200" height="630" fill="#171b18"/><text x="70" y="120" fill="#fffaf0" font-family="Segoe UI, Arial" font-size="48" font-weight="900">SignalFlow Studio</text><foreignObject x="70" y="170" width="1040" height="360"><div xmlns="http://www.w3.org/1999/xhtml" style="font-family:Segoe UI,Arial;color:#fffaf0;font-size:30px;line-height:1.4;white-space:pre-wrap">${escapeXml(code.slice(0, 900))}</div></foreignObject></svg>`;
  return new Response(JSON.stringify({ 
    image_base64: Buffer.from(svg).toString("base64"), 
    image_mime: "image/svg+xml",
    note: "Experimental/Internal API route. Not for main UI workflow.",
    experimental: true
  }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}

function escapeXml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
