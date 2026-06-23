const IGNORED_DIRS = new Set([
  "node_modules",
  ".next",
  "dist",
  "build",
  "out",
  "coverage",
  ".git",
  ".github",
  "__pycache__",
]);

const IGNORED_FILES = new Set([
  "package-lock.json",
  "pnpm-lock.yaml",
  "yarn.lock",
  "npm-debug.log",
  "yarn-error.log",
  "pnpm-debug.log",
]);

const IGNORED_EXTENSIONS = new Set([
  // Images
  "png", "jpg", "jpeg", "gif", "svg", "webp", "ico", "bmp", "tiff",
  // Videos & Audio
  "mp4", "mov", "avi", "mkv", "webm", "mp3", "wav", "flac",
  // Archives
  "zip", "tar", "gz", "rar", "7z",
  // Binaries / Build outputs
  "exe", "dll", "so", "dylib", "bin", "pdf", "epub",
  // Font files
  "woff", "woff2", "ttf", "eot", "otf"
]);

/**
 * Checks if a file path should be included in code context.
 * @param {string} filepath 
 * @returns {boolean}
 */
export function shouldIncludeFile(filepath) {
  if (!filepath) return false;

  const normalized = filepath.replace(/\\/g, "/");
  const parts = normalized.split("/");

  // Check if any directory in the path is ignored
  for (const part of parts.slice(0, -1)) {
    if (IGNORED_DIRS.has(part)) {
      return false;
    }
  }

  const filename = parts[parts.length - 1];

  // Check if specific filename is ignored
  if (IGNORED_FILES.has(filename)) {
    return false;
  }

  // Check extension
  const extIndex = filename.lastIndexOf(".");
  if (extIndex !== -1) {
    const ext = filename.substring(extIndex + 1).toLowerCase();
    if (IGNORED_EXTENSIONS.has(ext)) {
      return false;
    }
  }

  // Avoid minified files (usually contain .min.)
  if (filename.includes(".min.")) {
    return false;
  }

  return true;
}

/**
 * Returns a priority score for checking/summarizing file content.
 * READMEs, package.json, configs, and main source paths are higher priority.
 */
export function getFilePriorityScore(filepath) {
  if (!filepath) return 0;
  const normalized = filepath.toLowerCase().replace(/\\/g, "/");

  if (normalized.endsWith("readme.md")) return 100;
  if (normalized.endsWith("package.json") || normalized.endsWith("pyproject.toml") || normalized.endsWith("requirements.txt")) return 90;
  if (normalized.endsWith("changelog.md") || normalized.endsWith("roadmap.md") || normalized.endsWith("contributing.md")) return 80;
  if (normalized.startsWith("docs/")) return 70;
  if (normalized.startsWith("app/") || normalized.startsWith("pages/") || normalized.startsWith("src/")) return 60;
  if (normalized.includes("api/")) return 50;

  return 10;
}
