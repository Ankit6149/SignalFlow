# Security & Ethics

SignalFlow is intended as a privacy-first, legal, and ethical toolkit. The project intentionally omits and forbids any functionality that would:

- Harvest or exfiltrate browser session cookies or secrets.
- Bypass platform security, authentication, or rate-limiting systems.
- Attempt to spoof TLS/JA3 fingerprints or otherwise evade network security controls.

Recommended practices:

- Use official platform APIs and OAuth flows when publishing to third-party services.
- Store secrets only in OS-provided secure vaults or encrypted local stores.
- Run network-heavy publishing from controlled infrastructure with appropriate approvals.
