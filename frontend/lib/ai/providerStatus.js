import { PROVIDERS } from "./types";

/**
 * Returns the configuration status of all available model routes.
 */
export function getProviderConfigurationStatus() {
  const status = {};
  
  Object.keys(PROVIDERS).forEach(key => {
    const provider = PROVIDERS[key];
    status[key] = {
      id: provider.id,
      label: provider.label,
      description: provider.description,
      isLocal: provider.isLocal,
      isFree: provider.isFree,
      configured: provider.isConfigured(),
      defaultModel: provider.defaultModel
    };
  });

  return status;
}
