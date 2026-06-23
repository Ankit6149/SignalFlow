import { requireOwnerAccess } from "../../_auth";
import { buildJSONExport } from "../../../../lib/export/json";

export async function POST(request) {
  const accessError = requireOwnerAccess(request);
  if (accessError) {
    return accessError;
  }

  try {
    const { package: pkg, projectName, metadata } = await request.json();
    if (!pkg) {
      return new Response(JSON.stringify({ error: "Missing package object" }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }

    const jsonContent = buildJSONExport(pkg, metadata);
    const filename = `${(projectName || "project").toLowerCase().replace(/\s+/g, "-")}-package.json`;

    return new Response(jsonContent, {
      status: 200,
      headers: {
        "Content-Type": "application/json; charset=utf-8",
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
