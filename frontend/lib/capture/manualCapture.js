/**
 * Formats manually uploaded file metadata into a structured capture package.
 */
export function processManualAsset(fileMetadata) {
  if (!fileMetadata) return null;

  const { name, size, type, description = "" } = fileMetadata;
  const ext = name.split(".").pop().toLowerCase();
  
  // Categorize standard manual asset types
  let category = "document";
  if (["png", "jpg", "jpeg", "webp", "gif"].includes(ext)) {
    category = name.toLowerCase().includes("logo") ? "logo" : "screenshot";
  } else if (["mp4", "mov", "webm", "avi"].includes(ext)) {
    category = "screen recording";
  }

  return {
    name,
    sizeBytes: size || 0,
    fileType: type || "unknown",
    category,
    description,
    path: `/uploads/${name}`, // Virtual path reference
    createdAt: new Date().toISOString()
  };
}

export function compileManualAssetsList(assets = []) {
  return assets.map(processManualAsset).filter(Boolean);
}
