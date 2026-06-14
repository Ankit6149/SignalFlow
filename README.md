# SignalFlow Studio

SignalFlow Studio is a local-first AI social media automation workspace. Describe what you want to post, add data or assets, choose selected social media accounts, and generate a reviewable posting package with formatted copy, visual-media plans, generated cards, prompts, and export files.

The project is intentionally local-first. It is useful for creators, builders, founders, developers, maintainers, and small teams who do not want to manually create screenshots, GIFs, short clips, captions, and platform variants from scratch.

The product goal is low-click autopilot: the user provides information, connects or selects a model route once, and SignalFlow Studio prepares the full formatted package for every selected channel with sensible defaults. Advanced controls stay available, but they should not be required for the first successful run.

Good search summary: **AI autoposting tool that turns descriptions, screenshots, screen recordings, links, and data into formatted social media posts for LinkedIn, X, Instagram, blogs, newsletters, and release notes.**

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
npm install
npm run dev
```

Open `http://localhost:3000`.

For open-source hosting, deploy the repository to Vercel as a Next.js app. The root `package.json` and `vercel.json` already route Vercel to `frontend/`, so the repo should build as one hosted app: UI, generation routes, media capture, and package formatting live together.

Vercel settings:

```text
Framework Preset: Next.js
Install Command: npm install --prefix frontend
Build Command: npm run build
Output Directory: frontend/.next
```

From the frontend you can choose the input type, paste source material,
select output channels, capture media, and prepare a manual, file, webhook,
or official-API distribution config.
API keys are not persisted by SignalFlow Studio; wire them through your own local vault
or deployment environment when connecting a real provider.

## Useful Commands

Build the frontend:

```bash
npm run build
```

Create a post package through the standalone frontend API:

```bash
curl -X POST http://127.0.0.1:3000/api/launch_kit ^
  -H "Content-Type: application/json" ^
  -d "{\"input_type\":\"brief\",\"notes\":\"raw post brief\",\"project_name\":\"My Project\",\"channels\":[\"linkedin\",\"x\"],\"generator\":\"standalone\"}"
```

## Project Structure

- `frontend/` - the hosted SignalFlow Studio product: UI, app API routes, crawler files, media capture, and generation workflow.
- `signalflow/` - engine research code used to evolve ingestion, model adapters, and media utilities.
- `docs/` - architecture, integration, and discoverability notes.

## Open-Source Direction

The strongest product angle is: **a local-first autoposting engine that turns descriptions, data, and captured media into platform-ready posting packages**.

See [ROADMAP.md](ROADMAP.md) for the path from prototype to a product people can understand, try, and contribute to.
See [docs/INTEGRATIONS.md](docs/INTEGRATIONS.md) for the asset-to-model and channel integration strategy.
See [docs/DISCOVERABILITY.md](docs/DISCOVERABILITY.md) for GitHub topics, search keywords, and AI visibility setup.

Security and ethics: see [SECURITY.md](SECURITY.md). SignalFlow Studio must not harvest credentials, bypass platform protections, or publish to third-party services without official APIs and explicit user approval.
