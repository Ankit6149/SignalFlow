import { compileWorkspaceContext } from "./documentContext";

/**
 * Builds the single, unified context object from all input streams.
 */
export function buildUnifiedContext({
  projectName = "SignalFlow Studio",
  notes = "",
  audience = "general tech audience",
  repoContext = null,
  linksContext = [],
  fileNames = [],
  mediaItems = [],
  selectedChannels = [],
  selectedOutputs = [],
  appUrl = ""
}) {
  return compileWorkspaceContext({
    projectName,
    notes,
    audience,
    repoContext,
    linksContext,
    fileNames,
    mediaItems,
    selectedChannels,
    selectedOutputs,
    appUrl
  });
}
