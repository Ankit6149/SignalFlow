/**
 * Synthesizes the ingested repository info into structured high-level insights.
 */
export function summarizeRepo(repoContext) {
  if (!repoContext || repoContext.warnings?.length && !repoContext.repo) {
    return {
      summary: "No repository context available.",
      techStack: [],
      features: [],
      insights: []
    };
  }

  const { readme, packageJson, detectedTechStack, detectedFeatures, fileTreeSummary } = repoContext;
  
  const insights = [];
  const features = [...(detectedFeatures || [])];
  
  // Try to parse README for key descriptions or features
  let summary = "";
  if (readme) {
    // Extract first 3 paragraphs of README as a quick summary
    const lines = readme.split("\n");
    const paragraphs = [];
    let currentParagraph = [];
    
    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed === "" || trimmed.startsWith("#")) {
        if (currentParagraph.length) {
          paragraphs.push(currentParagraph.join(" "));
          currentParagraph = [];
        }
      } else {
        currentParagraph.push(trimmed);
      }
      if (paragraphs.length >= 3) break;
    }
    if (currentParagraph.length && paragraphs.length < 3) {
      paragraphs.push(currentParagraph.join(" "));
    }
    
    summary = paragraphs.join("\n\n");
    
    // Scan README for features/bullets
    const bulletLines = lines.filter(l => l.trim().startsWith("- ") || l.trim().startsWith("* "));
    if (bulletLines.length) {
      insights.push(`Contains README documentation with ${bulletLines.length} bullet points.`);
      // Extract up to 5 clear feature items
      const cleanBullets = bulletLines
        .map(b => b.replace(/^[-*]\s+/, "").trim())
        .filter(b => b.length > 5 && b.length < 120)
        .slice(0, 5);
      features.push(...cleanBullets);
    }
  } else {
    summary = "No README documentation found in the repository.";
  }

  if (packageJson) {
    insights.push(`Detected package.json named '${packageJson.name || "unnamed"}' version ${packageJson.version || "0.0.1"}.`);
  }

  if (fileTreeSummary?.length) {
    insights.push(`Repository contains ${fileTreeSummary.length} tracked files.`);
    const paths = fileTreeSummary.join("/");
    if (paths.includes("api/")) insights.push("Repository contains backend API endpoints.");
    if (paths.includes("test/") || paths.includes("tests/")) insights.push("Repository includes test suites.");
    if (paths.includes("docker") || paths.includes("Docker")) insights.push("Repository contains Docker configurations.");
  }

  // Deduplicate lists
  const uniqueFeatures = Array.from(new Set(features)).filter(Boolean);
  const uniqueTechStack = Array.from(new Set(detectedTechStack || [])).filter(Boolean);

  return {
    summary: summary || "Public repository containing codebase.",
    techStack: uniqueTechStack,
    features: uniqueFeatures.slice(0, 10), // Limit features list
    insights: insights
  };
}
