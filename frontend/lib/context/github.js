import { shouldIncludeFile, getFilePriorityScore } from "./fileFilter";

/**
 * Parses owner, repo, and branch from a GitHub URL.
 * e.g., https://github.com/owner/repo/tree/branch-name or https://github.com/owner/repo
 */
export function parseGitHubUrl(urlStr) {
  if (!urlStr) return null;
  
  try {
    let cleanUrl = urlStr.trim();
    if (!cleanUrl.startsWith("http://") && !cleanUrl.startsWith("https://")) {
      cleanUrl = "https://" + cleanUrl;
    }
    
    const url = new URL(cleanUrl);
    if (url.hostname !== "github.com") {
      return null;
    }
    
    const parts = url.pathname.split("/").filter(Boolean);
    if (parts.length < 2) {
      return null;
    }
    
    const owner = parts[0];
    const repo = parts[1].replace(/\.git$/, "");
    
    let branch = null;
    // Check if branch name is specified in URL (e.g., /tree/branch-name)
    if (parts[2] === "tree" && parts[3]) {
      branch = parts.slice(3).join("/");
    }
    
    return { owner, repo, branch };
  } catch (e) {
    return null;
  }
}

/**
 * Ingests a public GitHub repository.
 * Returns structured metadata and raw content files.
 */
export async function ingestGitHubRepo(repoUrl, customToken = null) {
  const parsed = parseGitHubUrl(repoUrl);
  if (!parsed) {
    return {
      warnings: ["Invalid GitHub URL format. Use https://github.com/owner/repo"],
    };
  }

  const { owner, repo, branch: urlBranch } = parsed;
  const warnings = [];
  
  // Set headers (include Authorization if token is provided, and User-Agent which GitHub requires)
  const headers = {
    "User-Agent": "SignalFlow-Studio-V1",
    Accept: "application/vnd.github.v3+json",
  };
  
  // Try to use server environment token if available
  const token = customToken || process.env.GITHUB_TOKEN;
  if (token) {
    headers["Authorization"] = `token ${token}`;
  }

  let defaultBranch = urlBranch;

  // 1. Fetch repo info if no branch specified
  if (!defaultBranch) {
    try {
      const infoResp = await fetch(`https://api.github.com/repos/${owner}/${repo}`, { headers });
      if (infoResp.status === 403 || infoResp.status === 429) {
        warnings.push("GitHub API rate limited or forbidden. Attempting default branches 'main' and 'master'.");
        defaultBranch = "main"; // fallback
      } else if (!infoResp.ok) {
        throw new Error(`Repo not found or inaccessible (HTTP ${infoResp.status})`);
      } else {
        const infoData = await infoResp.json();
        defaultBranch = infoData.default_branch || "main";
      }
    } catch (err) {
      warnings.push(`Could not fetch repo metadata: ${err.message}. Defaulting to 'main'.`);
      defaultBranch = "main";
    }
  }

  let fileTreeSummary = [];
  let importantFiles = [];
  let readme = "";
  let packageJson = null;
  let detectedTechStack = [];
  let detectedFeatures = [];
  let rawContext = "";

  // 2. Fetch repo git tree recursively
  try {
    const treeUrl = `https://api.github.com/repos/${owner}/${repo}/git/trees/${defaultBranch}?recursive=1`;
    const treeResp = await fetch(treeUrl, { headers });
    
    if (treeResp.status === 404 && !urlBranch && defaultBranch === "main") {
      // Try master
      const masterUrl = `https://api.github.com/repos/${owner}/${repo}/git/trees/master?recursive=1`;
      const masterResp = await fetch(masterUrl, { headers });
      if (masterResp.ok) {
        defaultBranch = "master";
        return ingestGitHubRepo(repoUrl.replace(/\/tree\/main/, "/tree/master"), customToken);
      }
    }

    if (!treeResp.ok) {
      throw new Error(`Failed to fetch file tree (HTTP ${treeResp.status})`);
    }

    const treeData = await treeResp.json();
    if (treeData.truncated) {
      warnings.push("Large repository tree truncated by GitHub.");
    }

    const files = (treeData.tree || [])
      .filter((node) => node.type === "blob")
      .map((node) => ({
        path: node.path,
        size: node.size,
        priority: getFilePriorityScore(node.path),
        shouldInclude: shouldIncludeFile(node.path)
      }));

    // Filter tree paths for overall summary
    fileTreeSummary = files
      .filter(f => f.shouldInclude)
      .map(f => f.path);

    // Filter down to candidates for raw code ingestion (high priority, skip massive files)
    const ingestCandidates = files
      .filter((f) => f.shouldInclude && f.size < 100 * 1024) // limit to files < 100KB
      .sort((a, b) => b.priority - a.priority);

    // Limit fetching to top 8 files to conserve API quota and prompt tokens
    const filesToFetch = ingestCandidates.slice(0, 8);

    for (const file of filesToFetch) {
      try {
        const rawUrl = `https://raw.githubusercontent.com/${owner}/${repo}/${defaultBranch}/${file.path}`;
        const rawResp = await fetch(rawUrl, { headers: { "User-Agent": "SignalFlow-Studio-V1" } });
        if (rawResp.ok) {
          let text = await rawResp.text();
          
          // Truncate individual file if extremely large
          if (text.length > 8000) {
            text = text.substring(0, 8000) + `\n\n... [File truncated for context limits, total size: ${file.size} bytes]`;
          }

          importantFiles.push({
            path: file.path,
            content: text,
            priority: file.priority,
          });

          if (file.path.toLowerCase() === "readme.md") {
            readme = text;
          }
          if (file.path.toLowerCase() === "package.json") {
            try {
              packageJson = JSON.parse(text);
            } catch {
              // skip parse if broken
            }
          }
        }
      } catch (err) {
        warnings.push(`Could not fetch raw file content for ${file.path}: ${err.message}`);
      }
    }
  } catch (err) {
    warnings.push(`Could not load repository files list: ${err.message}`);
  }

  // Detect tech stack and basic features from package.json and structure
  if (packageJson) {
    const deps = { ...packageJson.dependencies, ...packageJson.devDependencies };
    const keywords = ["next", "react", "vue", "svelte", "typescript", "express", "tailwind", "prisma", "mongodb", "postgres", "redis", "firebase", "graphql", "fastapi", "django", "flask", "rust", "go"];
    
    keywords.forEach(keyword => {
      if (deps[keyword] || (packageJson.name && packageJson.name.includes(keyword))) {
        detectedTechStack.push(keyword.charAt(0).toUpperCase() + keyword.slice(1));
      }
    });

    if (packageJson.scripts) {
      detectedFeatures.push(`Configured scripts: ${Object.keys(packageJson.scripts).join(", ")}`);
    }
  }

  // If no package.json, try simple file tree heuristics
  if (detectedTechStack.length === 0) {
    const treeStr = fileTreeSummary.join(" ");
    if (treeStr.includes("requirements.txt") || treeStr.includes("pyproject.toml")) detectedTechStack.push("Python");
    if (treeStr.includes("cargo.toml")) detectedTechStack.push("Rust");
    if (treeStr.includes("go.mod")) detectedTechStack.push("Go");
    if (treeStr.includes("tsconfig.json")) detectedTechStack.push("TypeScript");
    if (treeStr.includes("next.config")) detectedTechStack.push("Next.js");
  }

  // Synthesize rawContext block for the AI model
  rawContext = `=== REPOSITORY SUMMARY ===\n`;
  rawContext += `URL: ${repoUrl}\n`;
  rawContext += `Default Branch: ${defaultBranch}\n`;
  if (detectedTechStack.length) {
    rawContext += `Detected Stack: ${detectedTechStack.join(", ")}\n`;
  }
  rawContext += `File tree subset:\n${fileTreeSummary.slice(0, 60).map(p => ` - ${p}`).join("\n")}\n`;
  if (fileTreeSummary.length > 60) {
    rawContext += ` ... and ${fileTreeSummary.length - 60} more files.\n`;
  }
  
  if (importantFiles.length) {
    rawContext += `\n=== CODE FILE CONTENT DETAILS ===\n`;
    for (const f of importantFiles) {
      rawContext += `\n--- File: ${f.path} ---\n${f.content}\n`;
    }
  }

  return {
    repoUrl,
    owner,
    repo,
    defaultBranch,
    readme: readme || (importantFiles.find(f => f.path.toLowerCase().includes("readme"))?.content || ""),
    packageJson,
    detectedTechStack,
    detectedFeatures,
    importantFiles: importantFiles.map(f => f.path),
    fileTreeSummary,
    rawContext,
    warnings,
  };
}
