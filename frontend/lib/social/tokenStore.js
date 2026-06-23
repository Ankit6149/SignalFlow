import crypto from "crypto";
import fs from "fs";
import path from "path";

/**
 * Encrypted token store for social platform OAuth tokens.
 * Tokens are stored in a local JSON file, encrypted with AES-256-GCM.
 * This file is gitignored and never exposed to the frontend.
 */

const ALGORITHM = "aes-256-gcm";
const TOKEN_FILE = ".signalflow/tokens.json";
const IV_LENGTH = 16;
const TAG_LENGTH = 16;

/**
 * Returns the encryption key from env or generates a deterministic one.
 */
function getEncryptionKey() {
  const envKey = process.env.SOCIAL_ENCRYPTION_KEY;
  if (envKey && envKey.length >= 32) {
    return Buffer.from(envKey.substring(0, 32), "utf-8");
  }
  // Fallback: derive from SIGNALFLOW_ACCESS_KEY or a default
  const seed = process.env.SIGNALFLOW_ACCESS_KEY || "signalflow-default-encryption-seed-key";
  return crypto.createHash("sha256").update(seed).digest().subarray(0, 32);
}

/**
 * Encrypts a string value.
 */
function encrypt(text) {
  const key = getEncryptionKey();
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  let encrypted = cipher.update(text, "utf8", "hex");
  encrypted += cipher.final("hex");
  const tag = cipher.getAuthTag();
  return iv.toString("hex") + ":" + tag.toString("hex") + ":" + encrypted;
}

/**
 * Decrypts an encrypted string value.
 */
function decrypt(encryptedText) {
  const key = getEncryptionKey();
  const parts = encryptedText.split(":");
  if (parts.length !== 3) {
    throw new Error("Invalid encrypted token format");
  }
  const iv = Buffer.from(parts[0], "hex");
  const tag = Buffer.from(parts[1], "hex");
  const encrypted = parts[2];
  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(tag);
  let decrypted = decipher.update(encrypted, "hex", "utf8");
  decrypted += decipher.final("utf8");
  return decrypted;
}

/**
 * Gets the token file path.
 */
function getTokenFilePath() {
  // Use project root or a writable directory
  const base = process.cwd();
  return path.join(base, TOKEN_FILE);
}

/**
 * Ensures the token directory exists.
 */
function ensureTokenDir() {
  const filePath = getTokenFilePath();
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

/**
 * Reads all stored tokens (encrypted on disk, decrypted in memory).
 */
function readTokenStore() {
  const filePath = getTokenFilePath();
  if (!fs.existsSync(filePath)) {
    return {};
  }
  try {
    const raw = fs.readFileSync(filePath, "utf-8");
    const data = JSON.parse(raw);
    return data;
  } catch {
    return {};
  }
}

/**
 * Writes the token store to disk.
 */
function writeTokenStore(store) {
  ensureTokenDir();
  const filePath = getTokenFilePath();
  fs.writeFileSync(filePath, JSON.stringify(store, null, 2), "utf-8");
}

/**
 * Stores an OAuth token for a platform.
 * @param {string} platform - Platform ID (e.g., "linkedin", "x", "reddit")
 * @param {object} tokenData - { access_token, refresh_token, expires_in, scope, token_type }
 * @param {object} profile - { name, username, id } user profile info
 */
export function storeToken(platform, tokenData, profile = {}) {
  const store = readTokenStore();

  const encryptedAccess = encrypt(tokenData.access_token);
  const encryptedRefresh = tokenData.refresh_token ? encrypt(tokenData.refresh_token) : null;

  store[platform] = {
    access_token: encryptedAccess,
    refresh_token: encryptedRefresh,
    token_type: tokenData.token_type || "Bearer",
    scope: tokenData.scope || "",
    expires_at: tokenData.expires_in
      ? Date.now() + (tokenData.expires_in * 1000)
      : null,
    connected_at: Date.now(),
    profile: {
      name: profile.name || "",
      username: profile.username || "",
      id: profile.id || ""
    }
  };

  writeTokenStore(store);
}

/**
 * Retrieves the decrypted access token for a platform.
 * Returns null if no token is stored or if decryption fails.
 */
export function getAccessToken(platform) {
  const store = readTokenStore();
  const entry = store[platform];
  if (!entry || !entry.access_token) {
    return null;
  }
  try {
    return decrypt(entry.access_token);
  } catch {
    return null;
  }
}

/**
 * Retrieves the decrypted refresh token for a platform.
 */
export function getRefreshToken(platform) {
  const store = readTokenStore();
  const entry = store[platform];
  if (!entry || !entry.refresh_token) {
    return null;
  }
  try {
    return decrypt(entry.refresh_token);
  } catch {
    return null;
  }
}

/**
 * Checks if a platform's token is expired.
 */
export function isTokenExpired(platform) {
  const store = readTokenStore();
  const entry = store[platform];
  if (!entry || !entry.expires_at) {
    return true;
  }
  // Consider expired 5 minutes before actual expiry
  return Date.now() > (entry.expires_at - 5 * 60 * 1000);
}

/**
 * Gets the connection status for a platform (safe for frontend — no raw tokens).
 */
export function getConnectionStatus(platform) {
  const store = readTokenStore();
  const entry = store[platform];
  if (!entry || !entry.access_token) {
    return { connected: false };
  }
  return {
    connected: true,
    profile: entry.profile || {},
    connectedAt: entry.connected_at,
    expired: isTokenExpired(platform),
    hasRefreshToken: Boolean(entry.refresh_token)
  };
}

/**
 * Gets connection status for all platforms.
 */
export function getAllConnectionStatus() {
  const store = readTokenStore();
  const status = {};
  for (const platform of Object.keys(store)) {
    status[platform] = getConnectionStatus(platform);
  }
  return status;
}

/**
 * Removes stored tokens for a platform.
 */
export function disconnectPlatform(platform) {
  const store = readTokenStore();
  delete store[platform];
  writeTokenStore(store);
}

/**
 * Updates the access token after a refresh.
 */
export function updateAccessToken(platform, newTokenData) {
  const store = readTokenStore();
  const entry = store[platform];
  if (!entry) {
    return;
  }

  entry.access_token = encrypt(newTokenData.access_token);
  if (newTokenData.refresh_token) {
    entry.refresh_token = encrypt(newTokenData.refresh_token);
  }
  entry.expires_at = newTokenData.expires_in
    ? Date.now() + (newTokenData.expires_in * 1000)
    : entry.expires_at;

  store[platform] = entry;
  writeTokenStore(store);
}
