import { getProviderConfigurationStatus } from "../../../lib/ai/providerStatus";

export async function GET(request) {
  try {
    const status = getProviderConfigurationStatus();
    return new Response(JSON.stringify(status), {
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
