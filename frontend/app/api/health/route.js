import { isAccessLocked } from "../_auth";

export async function GET() {
  return new Response(
    JSON.stringify({
      status: "ok",
      mode: "app",
      runtime: "nextjs",
      access_locked: isAccessLocked(),
      public_hosted: process.env.SIGNALFLOW_PUBLIC_HOSTED === "true",
    }),
    {
      status: 200,
      headers: { "Content-Type": "application/json" },
    },
  );
}
