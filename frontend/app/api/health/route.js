import { isAccessLocked, isPublicHostedMode } from "../../../lib/hostedMode.js";

export async function GET() {
  return new Response(
    JSON.stringify({
      status: "ok",
      mode: "app",
      runtime: "nextjs",
      access_locked: isAccessLocked(),
      public_hosted: isPublicHostedMode(),
    }),
    {
      status: 200,
      headers: { "Content-Type": "application/json" },
    },
  );
}
