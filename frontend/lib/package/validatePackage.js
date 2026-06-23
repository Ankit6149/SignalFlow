/**
 * Validates the generation inputs from the client.
 * Returns { valid: boolean, errors: string[] }
 */
export function validateGenerationInputs(body) {
  const errors = [];

  const notes = (body.notes || "").trim();
  const repo = (body.repo || "").trim();
  const documentText = (body.document_text || "").trim();

  // Validate that at least one main input exists
  if (!notes && !repo && !documentText) {
    errors.push("You must provide at least one input context: a Description notes brief, a GitHub repo URL, or pasted document text.");
  }

  // Validate GitHub URL format if provided
  if (repo) {
    let checkRepo = repo;
    if (!checkRepo.startsWith("http://") && !checkRepo.startsWith("https://")) {
      checkRepo = "https://" + checkRepo;
    }
    try {
      const url = new URL(checkRepo);
      if (url.hostname !== "github.com" && url.hostname !== "www.github.com") {
        errors.push("GitHub Repo must be a valid github.com URL (e.g., https://github.com/owner/repo).");
      }
    } catch {
      errors.push("GitHub Repo is not a valid URL.");
    }
  }

  // Validate research URLs if provided
  const researchUrl = (body.research_url || "").trim();
  if (researchUrl) {
    // Can be multiple urls separated by whitespace or newlines
    const urls = researchUrl.split(/\s+/).filter(Boolean);
    urls.forEach(u => {
      let checkUrl = u;
      if (!checkUrl.startsWith("http://") && !checkUrl.startsWith("https://")) {
        checkUrl = "https://" + checkUrl;
      }
      try {
        new URL(checkUrl);
      } catch {
        errors.push(`Invalid research/docs link URL: "${u}".`);
      }
    });
  }

  return {
    valid: errors.length === 0,
    errors
  };
}
