import { requireOwnerAccess } from "../../_auth";
import { buildZipExport } from "../../../../lib/export/zip";

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

    const zipBuffer = await buildZipExport(pkg, metadata);
    const filename = `${(projectName || "project").toLowerCase().replace(/\s+/g, "-")}-package.zip`;

    return new Response(zipBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/zip",
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
