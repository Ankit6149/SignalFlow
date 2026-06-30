# SaaS Limits and Abuse Prevention

SignalFlow Studio should stay low-cost, local-first, and safe before it becomes a paid hosted SaaS. The product should not become an unlimited AI or autoposting engine.

## Core safety principles

- Recordings stay local by default.
- AI cost is user-owned in BYOK plans.
- Posting uses official APIs only.
- Real publishing requires explicit user approval by default.
- Simulated posting must be labeled as mock/demo.
- Every sensitive action should have an audit event.
- Every expensive action should have a usage limit.

## Suggested plans

### Free

- 1 project
- limited demo/template packages
- local recording only
- no saved secrets
- copy/download only
- no real social posting

### Starter - INR 99/month

- BYOK provider mode
- session-only key mode
- optional local development key cache for self-hosted/local use
- local recordings
- content library
- copy/download
- mock scheduling
- no hosted AI credits
- no cloud media storage

### Creator - INR 299 to 499/month

- more projects
- higher content package limits
- Chrome extension workflow
- connected channels where official APIs are configured
- posting logs
- scheduled posting architecture
- still BYOK by default

### Pro - INR 999/month

- hosted AI credits later
- more projects/packages
- cloud media storage later
- advanced audit logs
- team workflows later

## Suggested usage limits

Use database counters or a lightweight rate limit service.

Track:

- generation requests
- provider connection tests
- repository scans
- URL fetches
- scheduled post creations
- real publish attempts
- failed publish attempts
- extension handoffs

Initial practical limits:

- Free: very small monthly demo package limit.
- Starter: moderate monthly package limit with BYOK AI.
- Creator: higher package limit and connected channel features.
- Pro: higher limits plus hosted AI credits when pricing supports it.

## Misuse cases to prevent

SignalFlow must not enable:

- spam campaigns
- mass autoposting without review
- automated DMs or comments
- scraping logged-in social sessions
- phishing or credential-harvesting content
- impersonation content
- illegal goods or services promotion
- hidden posting without user consent
- accidental use of server filesystem paths in hosted mode

## Product controls

Add these controls before public SaaS launch:

- workspace-level usage limits
- per-user and per-workspace authorization checks
- posting confirmation modal
- simulated vs real posting labels
- disconnect/delete buttons for social accounts
- delete key button for AI providers
- audit log visibility
- abuse flagging for repeated failures or suspicious activity

## Server cost controls

Avoid these in low-cost plans:

- default video upload
- cloud video storage
- video transcoding
- automatic video understanding
- bulk media posting
- unlimited hosted AI

Use this default:

```text
Record locally → add notes → generate text package → preview → copy/schedule/post
```

Only add cloud media processing in paid higher plans with strict storage and retention limits.

## Hosted mode checklist

When `SIGNALFLOW_PUBLIC_HOSTED=true`:

- local folder scanning is disabled
- local/internal URL targets are blocked
- response sizes are limited
- no arbitrary shell execution
- no secrets in logs
- no real posting without official OAuth and explicit user action

## Launch readiness

Before charging public users, verify:

- Terms, Privacy, Refund, and Security pages exist
- API keys have session-only mode
- saved secrets are encrypted server-side or clearly marked as local-only
- social tokens are encrypted server-side
- audit logs exist
- usage limits exist
- deletion/disconnect controls exist
- real posting is clearly separate from mock posting
