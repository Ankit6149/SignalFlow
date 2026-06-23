/**
 * Compiles notes, files, parsed repositories, scraped links, and media metadata 
 * into a single unified context object for package generation.
 */
export function compileWorkspaceContext({
  projectName = "SignalFlow Studio",
  notes = "",
  audience = "general tech audience",
  repoContext = null,
  linksContext = [],
  fileNames = [],
  mediaItems = [],
  selectedChannels = [],
  selectedOutputs = []
}) {
  const warnings = [];

  // Gather warnings from children
  if (repoContext?.warnings) {
    warnings.push(...repoContext.warnings);
  }
  if (Array.isArray(linksContext)) {
    linksContext.forEach(link => {
      if (link.warnings) warnings.push(...link.warnings);
    });
  }

  // Determine missing context
  const missingContext = [];
  if (!repoContext || !repoContext.repo) {
    missingContext.push("GitHub code repository tree and details are missing.");
  }
  if (!linksContext || linksContext.length === 0) {
    missingContext.push("Documentation or public product links are missing.");
  }
  if (!mediaItems || mediaItems.length === 0) {
    missingContext.push("Screenshots or demo recordings are missing.");
  }

  // Parse repo tech stack / features if present
  const techStack = repoContext?.detectedTechStack || [];
  const features = repoContext?.detectedFeatures || [];

  // Compile facts vs assumptions
  const confirmedFacts = [];
  const inferredFacts = [];

  if (projectName && projectName !== "SignalFlow Studio") {
    confirmedFacts.push(`Product Name is confirmed as ${projectName}.`);
  }
  if (audience) {
    confirmedFacts.push(`Target audience is confirmed as "${audience}".`);
  }
  if (repoContext?.repo) {
    confirmedFacts.push(`GitHub repository exists at github.com/${repoContext.owner}/${repoContext.repo} on branch ${repoContext.defaultBranch}.`);
    if (techStack.length) {
      confirmedFacts.push(`Confirmed Tech Stack: ${techStack.join(", ")}`);
    }
  }

  if (notes) {
    confirmedFacts.push(`User description provided: "${notes.trim().substring(0, 150)}..."`);
  }

  // Infer features based on descriptions/repo
  if (repoContext?.repo && !techStack.length) {
    inferredFacts.push(`Appears to be a code project built on standard web technologies.`);
  }
  if (notes && notes.toLowerCase().includes("auth")) {
    inferredFacts.push(`Includes user authentication flow (inferred from notes).`);
  }
  if (notes && notes.toLowerCase().includes("database")) {
    inferredFacts.push(`Includes database storage backend (inferred from notes).`);
  }

  // Compile media insights
  const mediaNames = mediaItems.map(item => `${item.name} (${item.type})`);
  
  // Format summary content string
  let summary = `Product Name: ${projectName}\n`;
  summary += `Audience: ${audience}\n`;
  if (notes) {
    summary += `Brief:\n${notes}\n`;
  }

  return {
    projectName,
    notes,
    audience,
    repoContext,
    linksContext,
    fileNames,
    mediaItems,
    mediaNames,
    selectedChannels,
    selectedOutputs,
    confirmedFacts,
    inferredFacts,
    missingContext,
    techStack,
    features,
    warnings,
    summary
  };
}
