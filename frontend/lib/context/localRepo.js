import fs from "fs";
import path from "path";
import { shouldIncludeFile, getFilePriorityScore } from "./fileFilter";

/**
 * Ingests a local workspace repository from a folder path on disk.
 * Returns structured metadata and raw content files matching the shape of ingestGitHubRepo.
 */
export async function ingestLocalRepo(dirPath) {
  const warnings = [];
  const resolvedPath = path.resolve(dirPath);

  if (!fs.existsSync(resolvedPath)) {
    return {
      warnings: [`Local path "${dirPath}" does not exist.`]
    };
  }

  const stat = fs.statSync(resolvedPath);
  if (!stat.isDirectory()) {
    return {
      warnings: [`Local path "${dirPath}" is not a directory.`]
    };
  }

  let fileTreeSummary = [];
  let importantFiles = [];
  let readme = "";
  let packageJson = null;
  let detectedTechStack = [];
  let detectedFeatures = [];

  // Recursively gather all file paths relative to resolvedPath
  function walkDir(currentPath, relativePath = "") {
    const entries = fs.readdirSync(currentPath, { withFileTypes: true });
    for (const entry of entries) {
      const relEntryPath = relativePath ? path.join(relativePath, entry.name) : entry.name;
      // Skip ignored directories directly during traversal
      const normalizedPath = relEntryPath.replace(/\\/g, "/");
      const pathParts = normalizedPath.split("/");
      const parentDir = pathParts[pathParts.length - 2];
      if (entry.isDirectory()) {
        if (parentDir === "node_modules" || entry.name === "node_modules" || entry.name === ".git" || entry.name === ".next" || entry.name === "dist" || entry.name === "build") {
          continue;
        }
        walkDir(path.join(currentPath, entry.name), relEntryPath);
      } else {
        if (shouldIncludeFile(normalizedPath)) {
          fileTreeSummary.push(normalizedPath);
        }
      }
    }
  }

  try {
    walkDir(resolvedPath);
  } catch (err) {
    return {
      warnings: [`Failed to scan local path "${dirPath}": ${err.message}`]
    };
  }

  // Rank files by priority and read the top ones
  const filesWithMetadata = fileTreeSummary.map(filePath => {
    const fullPath = path.join(resolvedPath, filePath);
    const size = fs.statSync(fullPath).size;
    return {
      path: filePath,
      size,
      priority: getFilePriorityScore(filePath)
    };
  });

  const ingestCandidates = filesWithMetadata
    .filter(f => f.size < 100 * 1024)
    .sort((a, b) => b.priority - a.priority);

  const filesToFetch = ingestCandidates.slice(0, 8);

  for (const file of filesToFetch) {
    try {
      const fullPath = path.join(resolvedPath, file.path);
      let text = fs.readFileSync(fullPath, "utf-8");

      if (text.length > 8000) {
        text = text.substring(0, 8000) + `\n\n... [File truncated for context limits, total size: ${file.size} bytes]`;
      }

      importantFiles.push({
        path: file.path,
        content: text,
        priority: file.priority
      });

      if (file.path.toLowerCase() === "readme.md") {
        readme = text;
      }
      if (file.path.toLowerCase() === "package.json") {
        try {
          packageJson = JSON.parse(text);
        } catch {
          // Ignore parse errors
        }
      }
    } catch (err) {
      warnings.push(`Could not read local file ${file.path}: ${err.message}`);
    }
  }

  // Detect tech stack & features
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

  if (detectedTechStack.length === 0) {
    const treeStr = fileTreeSummary.join(" ");
    if (treeStr.includes("requirements.txt") || treeStr.includes("pyproject.toml")) detectedTechStack.push("Python");
    if (treeStr.includes("cargo.toml")) detectedTechStack.push("Rust");
    if (treeStr.includes("go.mod")) detectedTechStack.push("Go");
    if (treeStr.includes("tsconfig.json")) detectedTechStack.push("TypeScript");
    if (treeStr.includes("next.config")) detectedTechStack.push("Next.js");
  }

  // Synthesize rawContext block for the AI model
  let rawContext = `=== REPOSITORY SUMMARY ===\n`;
  rawContext += `Local Directory Path: ${resolvedPath}\n`;
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
    repoUrl: resolvedPath,
    owner: "local",
    repo: path.basename(resolvedPath),
    defaultBranch: "local",
    readme: readme || (importantFiles.find(f => f.path.toLowerCase().includes("readme"))?.content || ""),
    packageJson,
    detectedTechStack,
    detectedFeatures,
    importantFiles: importantFiles.map(f => f.path),
    fileTreeSummary,
    rawContext,
    warnings
  };
}
