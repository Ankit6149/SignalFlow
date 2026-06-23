/**
 * Formats the package JSON for download with creation metadata.
 */
export function buildJSONExport(pkg, metadata = {}) {
  if (!pkg) return JSON.stringify({ error: "No package generated" });

  const exportObj = {
    metadata: {
      client: "SignalFlow Studio V1",
      createdAt: new Date().toISOString(),
      providerUsed: metadata.providerUsed || "unknown",
      fallbackUsed: Boolean(metadata.fallbackUsed),
      selectedChannels: metadata.selectedChannels || [],
      selectedOutputs: metadata.selectedOutputs || []
    },
    package: pkg
  };

  return JSON.stringify(exportObj, null, 2);
}
