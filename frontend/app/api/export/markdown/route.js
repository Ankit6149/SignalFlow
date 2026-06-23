import { requireOwnerAccess } from "../../_auth";
import { buildMarkdown } from "../../../../lib/export/markdown";

export async function POST(request) {
  const accessError = requireOwnerAccess(request);
  if (accessError) {
    return accessError;
  }

  try {
    const { package: pkg, projectName, prompt } = await request.json();
    if (!pkg) {
      return new Response(JSON.stringify({ error: "Missing package object" }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }

    const mdContent = buildMarkdown({ projectName, package: pkg, prompt });
    const filename = `${(projectName || "project").toLowerCase().replace(/\s+/g, "-")}-package.md`;

    return new Response(mdContent, {
      status: 200,
      headers: {
        "Content-Type": "text/markdown; charset=utf-8",
        "Content-Disposition": `attachment; filename="${filename}"`
      }
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}
