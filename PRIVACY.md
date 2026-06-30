# Privacy Policy

Last Updated: July 1, 2026

At **SignalFlow Studio** ("we," "our," "us"), we take your privacy and data security seriously. This Privacy Policy describes how we collect, use, process, and protect your information when you use our local-first application and cloud hosted services.

---

## 1. Information We Collect & How We Use It

### A. Local-First Processing (Local Edition)
* **Codebases & Directory Files**: If you run codebase scans locally, the directory files are parsed on your machine. We do **not** upload your source code files to our servers.
* **Screen & Voice Recordings**: Walkthrough screencasts and microphone tracks are captured natively using the browser's WebRTC sandbox. They are stored as local blobs in your browser storage and are never streamed to us.
* **API Keys**: When you use the Bring Your Own Key (BYOK) settings, your API keys (OpenAI, Claude, Gemini, etc.) are XOR-obfuscated with a persistent salt and stored in your browser's `localStorage`. They are only sent in HTTPS headers directly to the respective AI endpoints (or via our serverless proxy transiently without being logged or saved on our servers).

### B. Cloud Services (SaaS Edition)
* **Account Registration**: We collect your email address, name, and billing details when you sign up for our premium cloud-hosted plans.
* **GitHub Integration**: If you connect your GitHub repository, we temporarily access repository metadata and code files using your GitHub personal access token. This data is processed in-memory to assemble prompt contexts and is never written to persistent databases.
* **OAuth Connections**: When linking your LinkedIn, X, or Reddit profiles, we encrypt and store the OAuth access tokens to publish scheduled drafts on your behalf. You can disconnect these channels and wipe this data at any time.

---

## 2. Security of Your Data
We employ industry-standard protocols to safeguard your records:
* **AES & SHA-256 Encryption**: Stored tokens are encrypted at rest on our cloud databases.
* **Timing-Safe Session Validation**: High-entropy HMAC signatures protect server API routes from unauthorized access.
* **Sanitization Guardrails**: Input text parameters are cleaned and enclosed inside XML scopes to prevent malicious prompt injections.

---

## 3. Third-Party Services & AI Providers
Because SignalFlow Studio routes requests to external AI model providers, your inputs are subject to their respective privacy terms:
* **OpenAI**: [Privacy Policy](https://openai.com/policies/privacy-policy)
* **Anthropic**: [Privacy Policy](https://www.anthropic.com/privacy)
* **Google Gemini**: [Privacy Policy](https://policies.google.com/privacy)

---

## 4. GDPR & CCPA Compliance (Your Rights)
Depending on your location, you have the following data rights:
* **Access & Portability**: You can export a full backup JSON dump of your profiles, settings, and drafts directly from our Settings menu.
* **Deletion ("Right to be Forgotten")**: You can click the "Clear All Data" button in settings to permanently wipe all local storage databases instantly. For cloud SaaS users, contact us to wipe your account.
* **Opt-Out**: We do not sell your personal data or codebase files to third-party brokers.

---

## 5. Contact Information
For privacy inquiries or deletion requests, contact us at: `privacy@signalflow.io`
