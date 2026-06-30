/**
 * Local-first client persistence layer using localStorage.
 * Standardizes projects, content packages, scheduled queues, and configurations.
 */

const IS_BROWSER = typeof window !== "undefined";

const KEYS = {
  PROJECTS: "signalflow_projects",
  PACKAGES: "signalflow_packages",
  SCHEDULED_POSTS: "signalflow_scheduled_posts",
  CHANNELS: "signalflow_channels",
  AI_SETTINGS: "signalflow_ai_settings",
  ACTIVE_PROJECT: "signalflow_active_project"
};

function read(key, fallback = []) {
  if (!IS_BROWSER) return fallback;
  try {
    const val = localStorage.getItem(key);
    return val ? JSON.parse(val) : fallback;
  } catch (e) {
    console.error(`Error reading ${key} from storage`, e);
    return fallback;
  }
}

function write(key, data) {
  if (!IS_BROWSER) return;
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.error(`Error writing ${key} to storage`, e);
  }
}

// ─── Projects ───
export const storageService = {
  getProjects() {
    const projects = read(KEYS.PROJECTS, []);
    if (projects.length === 0) {
      // Seed default project
      const defaultProj = {
        id: "default-project",
        name: "My Brand Studio",
        url: "https://example.com",
        description: "A professional creator portfolio and brand content production hub.",
        audience: "developers, content creators, tech-savvy founders",
        brandVoice: "founder-style",
        category: "Productivity / Creator Tools",
        cta: "Sign up for early access / Follow my build journey",
        platforms: ["linkedin", "x", "instagram", "newsletter"],
        visualStyle: "High-end dark mode, glassmorphism, clean typography",
        hashtags: ["IndieHackers", "BuildInPublic", "AIStudio"],
        references: ["https://github.com/Ankit6149/SignalFlow-Studio"],
        goals: ["launch", "educational", "personal builder post"],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      write(KEYS.PROJECTS, [defaultProj]);
      return [defaultProj];
    }
    return projects;
  },

  saveProject(project) {
    const projects = this.getProjects();
    const idx = projects.findIndex(p => p.id === project.id);
    const updated = { ...project, updatedAt: new Date().toISOString() };
    if (idx !== -1) {
      projects[idx] = updated;
    } else {
      projects.push(updated);
    }
    write(KEYS.PROJECTS, projects);
    return updated;
  },

  deleteProject(id) {
    let projects = this.getProjects();
    projects = projects.filter(p => p.id !== id);
    write(KEYS.PROJECTS, projects);
    if (this.getActiveProjectId() === id) {
      if (projects.length > 0) {
        this.setActiveProjectId(projects[0].id);
      } else {
        localStorage.removeItem(KEYS.ACTIVE_PROJECT);
      }
    }
  },

  getActiveProjectId() {
    if (!IS_BROWSER) return "default-project";
    let activeId = localStorage.getItem(KEYS.ACTIVE_PROJECT);
    if (!activeId) {
      const projects = this.getProjects();
      if (projects.length > 0) {
        activeId = projects[0].id;
        localStorage.setItem(KEYS.ACTIVE_PROJECT, activeId);
      }
    }
    return activeId || "default-project";
  },

  setActiveProjectId(id) {
    if (!IS_BROWSER) return;
    localStorage.setItem(KEYS.ACTIVE_PROJECT, id);
  },

  // ─── Content Packages ───
  getPackages() {
    return read(KEYS.PACKAGES, []);
  },

  savePackage(pkg) {
    const packages = this.getPackages();
    const idx = packages.findIndex(p => p.id === pkg.id);
    const updated = { ...pkg, updatedAt: new Date().toISOString() };
    if (idx !== -1) {
      packages[idx] = updated;
    } else {
      packages.push(updated);
    }
    write(KEYS.PACKAGES, packages);
    return updated;
  },

  deletePackage(id) {
    const packages = this.getPackages().filter(p => p.id !== id);
    write(KEYS.PACKAGES, packages);
    
    // Also remove any scheduled posts linked to this package
    const scheduled = this.getScheduledPosts().filter(s => s.packageId !== id);
    write(KEYS.SCHEDULED_POSTS, scheduled);
  },

  // ─── Scheduled Posts Queue ───
  getScheduledPosts() {
    return read(KEYS.SCHEDULED_POSTS, []);
  },

  saveScheduledPost(post) {
    const posts = this.getScheduledPosts();
    const idx = posts.findIndex(p => p.id === post.id);
    if (idx !== -1) {
      posts[idx] = post;
    } else {
      posts.push(post);
    }
    write(KEYS.SCHEDULED_POSTS, posts);
    return post;
  },

  deleteScheduledPost(id) {
    const posts = this.getScheduledPosts().filter(p => p.id !== id);
    write(KEYS.SCHEDULED_POSTS, posts);
  },

  // ─── Connected Channel overrides ───
  getConnectedChannels() {
    return read(KEYS.CHANNELS, {});
  },

  saveConnectedChannels(channels) {
    write(KEYS.CHANNELS, channels);
  },

  // ─── AI Settings ───
  getAISettings() {
    const defaultSettings = {
      defaultProvider: "template",
      openai: { apiKey: "", model: "gpt-4o-mini" },
      claude: { apiKey: "", model: "claude-3-5-sonnet-20241022" },
      gemini: { apiKey: "", model: "gemini-2.0-flash" },
      groq: { apiKey: "", model: "llama-3.1-8b-instant" },
      openrouter: { apiKey: "", model: "google/gemma-3-27b-it:free" },
      ollama: { baseUrl: "http://localhost:11434", model: "llama3" },
      lmstudio: { baseUrl: "http://localhost:1234", model: "any" },
      custom: { baseUrl: "", apiKey: "", model: "" }
    };
    const saved = read(KEYS.AI_SETTINGS, defaultSettings);
    const salt = getVaultSalt();

    // Decrypt apiKeys on load
    const decrypted = { ...saved };
    Object.keys(decrypted).forEach(key => {
      if (decrypted[key] && typeof decrypted[key] === "object" && "apiKey" in decrypted[key]) {
        decrypted[key] = {
          ...decrypted[key],
          apiKey: decryptField(decrypted[key].apiKey, salt)
        };
      }
    });

    return { ...defaultSettings, ...decrypted };
  },

  saveAISettings(settings) {
    const salt = getVaultSalt();
    const encrypted = { ...settings };
    Object.keys(encrypted).forEach(key => {
      if (encrypted[key] && typeof encrypted[key] === "object" && "apiKey" in encrypted[key]) {
        encrypted[key] = {
          ...encrypted[key],
          apiKey: encryptField(encrypted[key].apiKey, salt)
        };
      }
    });
    write(KEYS.AI_SETTINGS, encrypted);
  }
};

// ─── Vault Cryptography Obfuscator ───
function getVaultSalt() {
  if (!IS_BROWSER) return "";
  let salt = localStorage.getItem("signalflow_vault_salt");
  if (!salt) {
    salt = Math.random().toString(36).substring(2) + Math.random().toString(36).substring(2);
    localStorage.setItem("signalflow_vault_salt", salt);
  }
  return salt;
}

function encryptField(text, salt) {
  if (!text) return "";
  let result = "";
  for (let i = 0; i < text.length; i++) {
    const charCode = text.charCodeAt(i) ^ salt.charCodeAt(i % salt.length);
    result += String.fromCharCode(charCode);
  }
  return btoa(result);
}

function decryptField(encoded, salt) {
  if (!encoded) return "";
  try {
    const text = atob(encoded);
    let result = "";
    for (let i = 0; i < text.length; i++) {
      const charCode = text.charCodeAt(i) ^ salt.charCodeAt(i % salt.length);
      result += String.fromCharCode(charCode);
    }
    return result;
  } catch (e) {
    return "";
  }
}
