# SignalFlow Studio

SignalFlow Studio is a local-first AI social media automation workspace. Describe what you want to post, add data or assets, choose selected social media accounts, and generate a reviewable posting package with formatted copy, visual-media plans, generated cards, prompts, and export files.

The project is intentionally local-first. It is useful for creators, builders, founders, developers, maintainers, and small teams who do not want to manually create screenshots, GIFs, short clips, captions, and platform variants from scratch.

The product goal is low-click autopilot: the user provides information, connects or selects a model route once, and SignalFlow Studio prepares the full formatted package for every selected channel with sensible defaults. Advanced controls stay available, but they should not be required for the first successful run.

Good search summary: **AI autoposting tool that turns descriptions, screenshots, screen recordings, links, and data into formatted social media posts for LinkedIn, X, Instagram, blogs, newsletters, and release notes.**

## Product Direction

SignalFlow Studio is being built as a **product-grade open-source local-first studio**. It should work as a serious personal tool while keeping the codebase modular, secure, and easy to extend.

Current priority:

```text
local-first product quality
open-source distribution
BYOK and local model support
clean modular architecture
```

See [docs/PRODUCT_GRADE_OPEN_SOURCE.md](docs/PRODUCT_GRADE_OPEN_SOURCE.md) for the product direction.

## What Works Today

- Generate platform drafts from descriptions, pasted notes, changelogs, code snippets, screenshots text, repository context, or research excerpts.
- Produce a visual media plan for screenshots, screen recordings, GIF/video loops, generated cards, and platform variants.
- Generate selected channel formats for LinkedIn, X, Instagram, blogs, newsletters, and release notes.
- Export a model prompt for local SLMs, API models, or free chatbots.
- Configure input sources, model adapter details, selected channels, export folder, and safe distribution mode from the frontend.
- Use the frontend in autopilot mode with one description field and defaults for model route, platforms, media plan, and export.
- Keep distribution safe through manual review, files, webhooks, or official platform APIs.
- Run as a standalone Next.js app for the normal personal workflow.
- Includes `llms.txt`, `llms-full.txt`, `robots.txt`, and a discoverability checklist for AI/search visibility.

## Quick Start

Run the app:

```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:3000`.

For open-source hosting, deploy the repository to Vercel as a Next.js app and set the Vercel root directory to `frontend`. The app builds as one hosted product: UI, generation routes, media capture, crawler files, and package formatting live together.

Vercel settings:

```text
Root Directory: frontend
Framework Preset: Next.js
Install Command: npm install
Build Command: npm run build
Output Directory: .next
```

Do not use `npm install --prefix frontend` when Vercel Root Directory is already set to `frontend`; that makes Vercel look for `frontend/frontend/package.json`.

### Protect Your Hosted Demo

For your personal Vercel link, add this environment variable:

```text
SIGNALFLOW_ACCESS_KEY=make-a-long-private-key-here
```

When this is set, visitors can still see the product, docs, and UI, but they cannot generate post packages unless they enter the owner key. After the key is entered once, SignalFlow Studio stores a signed 30-day browser session token, so you do not have to remember or paste the key every time.

Do not create this as a `NEXT_PUBLIC_` variable. `SIGNALFLOW_ACCESS_KEY` is read only by server-side API routes. The browser receives only a signed session token, not the secret environment value.

For local use or someone else's self-hosted install, this variable can be left empty. In that mode generation is unlocked by default.

From the frontend you can choose the input type, paste source material, select output channels, capture media, and prepare a manual, file, webhook, or official-API distribution config.

API keys are not required for the default open-source workflow. Use demo/template mode, local models, session-only keys, or your own provider setup.

## Useful Commands

Build the frontend:

```bash
cd frontend
npm run build
```

Create a post package through the standalone frontend API:

```bash
curl -X POST http://127.0.0.1:3000/api/launch_kit \
  -H "Content-Type: application/json" \
  -d '{"input_type":"brief","notes":"raw post brief","project_name":"My Project","channels":["linkedin","x"],"generator":"standalone"}'
```

## Project Structure

- `frontend/` - the hosted SignalFlow Studio product: UI, app API routes, crawler files, media capture, and generation workflow.
- `extension/` - Chrome/WebExtension scaffold for future browser capture and handoff workflows.
- `signalflow/` - engine research code used to evolve ingestion, model adapters, and media utilities.
- `docs/` - architecture, integration, security, and discoverability notes.

## Open-Source Direction

The strongest product angle is: **a local-first autoposting engine that turns descriptions, data, and captured media into platform-ready posting packages**.

See [ROADMAP.md](ROADMAP.md) for the path from prototype to a product people can understand, try, and contribute to.
See [docs/PRODUCT_GRADE_OPEN_SOURCE.md](docs/PRODUCT_GRADE_OPEN_SOURCE.md) for the product-grade open-source direction.
See [docs/INTEGRATIONS.md](docs/INTEGRATIONS.md) for the asset-to-model and channel integration strategy.
See [docs/DISCOVERABILITY.md](docs/DISCOVERABILITY.md) for GitHub topics, search keywords, and AI visibility setup.

Security and ethics: see [SECURITY.md](SECURITY.md). SignalFlow Studio must not harvest credentials, bypass platform protections, or publish to third-party services without official APIs and explicit user approval.
