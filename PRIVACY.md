# Privacy Policy

Last Updated: July 1, 2026

At **SignalFlow Studio** ("we," "our," "us"), we take your privacy and data security seriously. This Privacy Policy describes how we collect, use, process, and protect your information when you use our local-first application and self-hosted deployments.

---

## 1. Information We Collect & How We Use It

### A. Local-First Processing
* **Codebases & Directory Files**: If you run codebase scans, the directory files are parsed locally or in-memory. We do not persistently store or harvest your source code files.
* **Screen & Voice Recordings**: Walkthrough screencasts and microphone tracks are captured natively using the browser's WebRTC sandbox. They are stored as local blobs in your browser memory and are never streamed to us.
* **API Keys**: When you use the Bring Your Own Key (BYOK) settings, your API keys (OpenAI, Claude, Gemini, etc.) are XOR-scrambled and stored in your browser's `localStorage`. They are only sent in HTTPS headers directly to the respective AI endpoints (or via our serverless proxy transiently without being logged or saved on our servers).

### B. Workspace Authentication & Tokens
* **Workspace Protection**: If you use a password-protected hosted deployment, the access verification token is stored securely in your browser's local storage.
* **OAuth Connections**: When linking your LinkedIn, X, or Reddit profiles, OAuth access tokens are used to publish scheduled drafts. You can disconnect these channels and wipe this data at any time from the settings or direct connection status panels.

---

## 2. Security of Your Data
We employ industry-standard protocols to safeguard your records:
* **Timing-Safe Session Validation**: High-entropy HMAC signatures protect server API routes from unauthorized access.
* **Sanitization Guardrails**: Input text parameters are cleaned and enclosed inside XML scopes to prevent malicious prompt injections.

---

## 3. Third-Party Services & AI Providers
Because SignalFlow Studio routes requests to external AI model providers, your inputs are subject to their respective privacy terms:
* **OpenAI**: [Privacy Policy](https://openai.com/policies/privacy-policy)
* **Anthropic**: [Privacy Policy](https://www.anthropic.com/privacy)
* **Google Gemini**: [Privacy Policy](https://policies.google.com/privacy)

---

## 4. Your Rights
* **Access & Portability**: You can export a full backup JSON dump of your profiles, settings, and drafts directly from our Settings menu.
* **Deletion**: You can click the "Clear Local Database" button in settings to permanently wipe all local storage databases instantly.
* **Opt-Out**: We do not collect or sell your personal data or codebase files.

---

## 5. Contact Information
For privacy inquiries or deletion requests, contact us at: `privacy@signalflow.io`
