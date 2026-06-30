# Secure Secrets Architecture

SignalFlow Studio is local-first today. Local browser storage is useful for personal use, but it is not a production-grade secret vault. A paid hosted SaaS version must treat user API keys and social tokens as high-risk secrets.

## Security promise

Production SignalFlow should be able to say:

- We never ask for social account passwords.
- Social posting uses official OAuth only.
- API keys can be used session-only or saved encrypted.
- Saved secrets are encrypted on the server before database storage.
- Full secrets are never returned to the browser after saving.
- Users can delete or rotate keys at any time.
- Sensitive actions are logged.

## Supported secret modes

### Session-only key

The safest first-use mode.

Flow:

```text
User pastes provider key
→ frontend sends it for one generation/test request over HTTPS
→ backend uses it only for that request
→ backend does not persist it
→ browser clears it when the session ends
```

### Local development key cache

This is only for local/self-hosted convenience.

Rules:

- Label it as local/dev only.
- Do not call it a secure vault.
- Show a warning in UI.
- Do not use it as the security model for paid hosted SaaS.

### Production saved key

Required flow for hosted SaaS:

```text
User saves provider key
→ backend receives it over HTTPS
→ backend encrypts it with a server-side key or KMS/Vault
→ encrypted value is stored in the database
→ frontend receives only provider, masked display, and status
→ backend decrypts only during server-side generation
```

## Data model requirements

Create production tables or equivalent models for:

- users
- workspaces
- workspace members
- projects
- content packages
- package outputs
- recording metadata
- scheduled posts
- social connections
- encrypted AI provider keys
- usage events
- audit logs

For encrypted AI provider keys, store:

- workspace id
- provider
- encrypted secret material
- encryption metadata
- key version
- masked display value
- last used timestamp
- status
- created/updated/revoked timestamps

For social connections, store:

- workspace id
- platform
- profile id/name
- approved scopes
- encrypted token material
- expiration timestamp
- status
- last used timestamp
- created/updated/revoked timestamps

Never return encrypted token material or full plaintext secrets through client APIs.

## Backend routes needed later

- save/test/delete AI provider key
- get masked provider-key status
- start social OAuth connection
- receive social OAuth callback
- disconnect social account
- read audit log
- publish or schedule post with explicit workspace authorization

## Frontend display rules

Show only masked information, for example:

```text
OpenAI connected: sk-...9Q2a
Last used: 2 hours ago
Mode: saved encrypted key / session only / environment key
Delete key
Test connection
```

Never show a full saved key again.

## Required audit events

At minimum, log:

- session key used
- saved key created
- saved key deleted
- key test attempted
- social account connected
- social account disconnected
- generation started
- generation completed
- simulated post created
- real post attempted
- real post succeeded
- real post failed
- scheduled post created
- scheduled post cancelled

## Hosted-mode restrictions

When `SIGNALFLOW_PUBLIC_HOSTED=true`:

- Disable server-local folder scanning.
- Block URLs with embedded credentials.
- Block local/internal URL targets.
- Enforce response size limits and timeouts.
- Never read environment, token, key, or credential files.
- Never execute shell commands from user input.

## Launch rule

Do not charge users for a hosted SaaS plan that stores saved secrets until server-side encrypted storage, deletion controls, and audit logs are implemented.
