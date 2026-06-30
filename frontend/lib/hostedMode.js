/**
 * Helper utilities to manage hosted environment state.
 */

export function isPublicHostedMode() {
  return process.env.SIGNALFLOW_PUBLIC_HOSTED === "true";
}

export function isAccessLocked() {
  return Boolean(process.env.SIGNALFLOW_ACCESS_KEY);
}

export function shouldHideOwnerConnections() {
  return isPublicHostedMode() && isAccessLocked();
}
