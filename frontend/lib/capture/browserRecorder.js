/**
 * Configurations for browser MediaRecorder integrations.
 */
export const RECORDING_CONFIGS = {
  videoBitsPerSecond: 2500000,
  mimeType: "video/webm;codecs=vp8",
  frameRate: 30
};

/**
 * Parses a recorded WebM stream metadata for context inclusion.
 */
export function processBrowserRecording(recordingMeta) {
  if (!recordingMeta) return null;

  const { name, durationSeconds = 0, size = 0 } = recordingMeta;

  return {
    name: name || `recording-${new Date().getTime()}.webm`,
    category: "screen recording",
    durationSeconds,
    sizeBytes: size,
    mimeType: "video/webm",
    source: "navigator.mediaDevices.getDisplayMedia",
    createdAt: new Date().toISOString()
  };
}
