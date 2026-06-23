import { requireOwnerAccess } from "../../_auth";
import { captureAppScreenshot } from "../../../../lib/capture/appCapture";

export async function POST(request) {
  const accessError = requireOwnerAccess(request);
  if (accessError) {
    return accessError;
  }

  try {
    const { appUrl } = await request.json();
    if (!appUrl) {
      return new Response(JSON.stringify({ error: "Missing appUrl parameter" }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }

    const result = await captureAppScreenshot(appUrl);
    
    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}
