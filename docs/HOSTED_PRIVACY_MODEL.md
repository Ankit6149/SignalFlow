# Hosted Privacy and Data Security Model

SignalFlow Studio is built with a local-first, privacy-by-default architecture. This document explains how user data, API keys, and social account credentials are handled across different deployment configurations.

---

## 1. Operating Modes

### A. Local-First Mode
* **Configuration**: Default mode when running `npm run dev` locally without environment locks.
* **Data Persistence**: All project briefs, brand profiles, screen recordings, custom configurations, and drafts remain strictly inside the user's browser `localStorage` and memory.
* **Model Keys**: API keys entered into the AI Provider tab are encrypted locally in the browser sandbox. When executing completions, they are passed as transient headers to standard AI provider API routes.

### B. Hosted Private Mode
* **Configuration**: Enabled on a private server or Vercel deployment by defining a server-side lock key:
  ```env
  SIGNALFLOW_ACCESS_KEY=your_secure_workspace_lock_phrase
  ```
* **Behavior**: The entire workspace is locked by default behind a password lock page. Entering the key initializes an authenticated owner session, unlocking the server-side environment configurations.
* **Secrets Containment**: Server-side model keys and connected social channel OAuth tokens are accessible only to the authenticated owner.

### C. Public Demo Mode
* **Configuration**: Enabled on public endpoints (like a shared public instance or sandbox) by setting:
  ```env
  SIGNALFLOW_PUBLIC_HOSTED=true
  SIGNALFLOW_ACCESS_KEY=your_admin_access_key
  ```
* **Behavior**: The dashboard remains accessible to public visitors without a blocking lockout screen.
* **BYOK Enforced**: Visitors are forced to use either offline templates or configure their own personal API keys in the Settings manager.
* **Isolation of Owner Accounts**: 
  * The owner's server-side keys (e.g., `GEMINI_API_KEY`, `OPENAI_API_KEY`) are completely bypassed and inaccessible to visitors.
  * The owner's connected social media API tokens and profile identities are fully hidden from `/api/social/status` calls and cannot be used to post or read details.

---

## 2. Credentials and Secrets Protection

### A. Local Storage Encryption
AI provider credentials entered in the browser settings are scrambled using an XOR base64 persistent salt before saving. This prevents client-side scripting or browser extensions from retrieving cleartext credentials from the local database.

### B. No Key Leakage
The backend serverless routes **never** return raw keys, secrets, or connected social tokens back to the client. The client can only query metadata status (e.g., `connected: true/false`, `configured: true/false`).

### C. Official Social API Integrations
Direct posting to channels (LinkedIn, X, and Reddit) relies strictly on standard OAuth 2.0 redirection flows. SignalFlow Studio does not perform session scraping, simulate browser clicks, or request user platform passwords. All API dispatches require explicit approval or scheduling by the user.

---

## 3. Deployment Guide for Self-Hosters

If you are hosting your own instance of SignalFlow Studio:
1. Register your developer client credentials in the LinkedIn, X, and Reddit developer dashboards.
2. Configure the OAuth redirect callback URLs to match your domain:
   * `https://your-domain.com/api/social/callback/[platform]`
3. Add the keys to your server configuration file (e.g., `.env.local`).
4. Set a strong `SIGNALFLOW_ACCESS_KEY` to secure your workspace.
