import { getProviderConfigurationStatus } from "../../../lib/ai/providerStatus";

export async function GET(request) {
  try {
    const status = getProviderConfigurationStatus();
    const defaultProvider = process.env.DEFAULT_MODEL_PROVIDER || "";
    return new Response(JSON.stringify({
      providers: status,
      defaultProvider: defaultProvider
    }), {
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
