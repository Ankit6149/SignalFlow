/**
 * Local-first client persistence layer using localStorage.
 * Standardizes projects, content packages, scheduled queues, and local configurations.
 *
 * Security boundary:
 * - This file is for local/demo persistence only.
 * - API keys cached here are obfuscated for casual local privacy, not production-grade encrypted vaulting.
 * - A public SaaS build must store secrets server-side using an encrypted database/KMS flow.
 */

const IS_BROWSER = typeof window !== "undefined";
const MAX_AUDIT_EVENTS = 250;

const KEYS = {
  PROJECTS: "signalflow_projects",
  PACKAGES: "signalflow_packages",
  SCHEDULED_POSTS: "signalflow_scheduled_posts",
  CHANNELS: "signalflow_channels",
  AI_SETTINGS: "signalflow_ai_settings",
  ACTIVE_PROJECT: "signalflow_active_project",
  AUDIT_LOGS: "signalflow_audit_logs"
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

function nowIso() {
  return new Date().toISOString();
}

function createId(prefix) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export const storageService = {
  // ─── Projects ───
  getProjects() {
    const projects = read(KEYS.PROJECTS, []);
    if (projects.length === 0) {
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
        createdAt: nowIso(),
        updatedAt: nowIso()
      };
      write(KEYS.PROJECTS, [defaultProj]);
      this.logAuditEvent("project_seeded", "project", defaultProj.id, { localOnly: true });
      return [defaultProj];
    }
    return projects;
  },

  saveProject(project) {
    const projects = this.getProjects();
    const idx = projects.findIndex(p => p.id === project.id);
    const updated = { ...project, updatedAt: nowIso() };
    if (idx !== -1) {
      projects[idx] = updated;
    } else {
      projects.push(updated);
    }
    write(KEYS.PROJECTS, projects);
    this.logAuditEvent(idx !== -1 ? "project_updated" : "project_created", "project", updated.id);
    return updated;
  },

  deleteProject(id) {
    let projects = this.getProjects();
    projects = projects.filter(p => p.id !== id);
    write(KEYS.PROJECTS, projects);
    this.logAuditEvent("project_deleted", "project", id);
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
    this.logAuditEvent("active_project_changed", "project", id);
  },

  // ─── Content Packages ───
  getPackages() {
    return read(KEYS.PACKAGES, []);
  },

  savePackage(pkg) {
    const packages = this.getPackages();
    const idx = packages.findIndex(p => p.id === pkg.id);
    const updated = { ...pkg, updatedAt: nowIso() };
    if (idx !== -1) {
      packages[idx] = updated;
    } else {
      packages.push(updated);
    }
    write(KEYS.PACKAGES, packages);
    this.logAuditEvent(idx !== -1 ? "package_updated" : "package_created", "content_package", updated.id, {
      status: updated.status,
      platforms: updated.platforms || []
    });
    return updated;
  },

  deletePackage(id) {
    const packages = this.getPackages().filter(p => p.id !== id);
    write(KEYS.PACKAGES, packages);

    const scheduled = this.getScheduledPosts().filter(s => s.packageId !== id);
    write(KEYS.SCHEDULED_POSTS, scheduled);
    this.logAuditEvent("package_deleted", "content_package", id);
  },

  // ─── Scheduled Posts Queue ───
  getScheduledPosts() {
    return read(KEYS.SCHEDULED_POSTS, []);
  },

  saveScheduledPost(post) {
    const posts = this.getScheduledPosts();
    const idx = posts.findIndex(p => p.id === post.id);
    const updated = { ...post, updatedAt: nowIso() };
    if (idx !== -1) {
      posts[idx] = updated;
    } else {
      posts.push(updated);
    }
    write(KEYS.SCHEDULED_POSTS, posts);
    this.logAuditEvent(idx !== -1 ? "scheduled_post_updated" : "scheduled_post_created", "scheduled_post", updated.id, {
      platform: updated.platform,
      status: updated.status,
      mockMode: Boolean(updated.mockMode || updated.mock_mode)
    });
    return updated;
  },

  deleteScheduledPost(id) {
    const posts = this.getScheduledPosts().filter(p => p.id !== id);
    write(KEYS.SCHEDULED_POSTS, posts);
    this.logAuditEvent("scheduled_post_deleted", "scheduled_post", id);
  },

  // ─── Connected Channel overrides ───
  getConnectedChannels() {
    return read(KEYS.CHANNELS, {});
  },

  saveConnectedChannels(channels) {
    write(KEYS.CHANNELS, channels);
    this.logAuditEvent("local_channel_state_updated", "channel_state", "local", {
      platforms: Object.keys(channels || {})
    });
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
    const salt = getLocalCacheSalt();

    const decrypted = { ...saved };
    Object.keys(decrypted).forEach(key => {
      if (decrypted[key] && typeof decrypted[key] === "object" && "apiKey" in decrypted[key]) {
        decrypted[key] = {
          ...decrypted[key],
          apiKey: decodeLocalKeyCache(decrypted[key].apiKey, salt)
        };
      }
    });

    return { ...defaultSettings, ...decrypted };
  },

  saveAISettings(settings) {
    const salt = getLocalCacheSalt();
    const cached = { ...settings };
    const providersWithCachedKeys = [];

    Object.keys(cached).forEach(key => {
      if (cached[key] && typeof cached[key] === "object" && "apiKey" in cached[key]) {
        if (cached[key].apiKey) providersWithCachedKeys.push(key);
        cached[key] = {
          ...cached[key],
          apiKey: encodeLocalKeyCache(cached[key].apiKey, salt)
        };
      }
    });
    write(KEYS.AI_SETTINGS, cached);
    this.logAuditEvent("local_ai_settings_updated", "ai_settings", "local", {
      defaultProvider: settings?.defaultProvider,
      providersWithCachedKeys,
      warning: "Local browser key cache is obfuscation only, not production-grade encrypted storage."
    });
  },

  clearAISettings() {
    if (!IS_BROWSER) return;
    localStorage.removeItem(KEYS.AI_SETTINGS);
    this.logAuditEvent("local_ai_settings_cleared", "ai_settings", "local");
  },

  // ─── Local Audit Log ───
  getAuditLogs() {
    return read(KEYS.AUDIT_LOGS, []);
  },

  logAuditEvent(action, targetType = "system", targetId = "local", metadata = {}) {
    if (!IS_BROWSER) return null;
    const logs = read(KEYS.AUDIT_LOGS, []);
    const event = {
      id: createId("audit"),
      action,
      targetType,
      targetId,
      metadata,
      localOnly: true,
      createdAt: nowIso()
    };
    const nextLogs = [event, ...logs].slice(0, MAX_AUDIT_EVENTS);
    write(KEYS.AUDIT_LOGS, nextLogs);
    return event;
  },

  clearAuditLogs() {
    write(KEYS.AUDIT_LOGS, []);
  }
};

// ─── Local Development Key Cache ───
// This is only obfuscation for local browser convenience. It is not cryptographic vaulting.
// Production SaaS must use server-side encryption, KMS/Vault, masked display, deletion, rotation, and audit logs.
function getLocalCacheSalt() {
  if (!IS_BROWSER) return "";
  let salt = localStorage.getItem("signalflow_local_cache_salt");
  if (!salt) {
    salt = Math.random().toString(36).substring(2) + Math.random().toString(36).substring(2);
    localStorage.setItem("signalflow_local_cache_salt", salt);
  }
  return salt;
}

function encodeLocalKeyCache(text, salt) {
  if (!text) return "";
  let result = "";
  for (let i = 0; i < text.length; i++) {
    const charCode = text.charCodeAt(i) ^ salt.charCodeAt(i % salt.length);
    result += String.fromCharCode(charCode);
  }
  return btoa(result);
}

function decodeLocalKeyCache(encoded, salt) {
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
