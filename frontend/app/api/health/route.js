export async function GET() {
  return new Response(
    JSON.stringify({
      status: "ok",
      mode: "app",
      runtime: "nextjs",
    }),
    {
      status: 200,
      headers: { "Content-Type": "application/json" },
    },
  );
}
