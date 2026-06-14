# PostPilot

PostPilot is a local-first posting workspace. Describe what you want to post, add data or assets, choose platforms, and generate a reviewable package with copy, visual-media plans, generated cards, prompts, and export files.

The project is intentionally local-first. It is useful for creators, builders, founders, developers, maintainers, and small teams who do not want to manually create screenshots, GIFs, short clips, captions, and platform variants from scratch.

## What Works Today

- Generate platform drafts from descriptions, pasted notes, changelogs, code snippets, screenshots text, repository context, or research excerpts.
- Produce a visual media plan for screenshots, screen recordings, GIF/video loops, generated cards, and platform variants.
- Scan a repository and rank source files by simple signal-to-noise heuristics.
- Render syntax-highlighted code snippets to PNG.
- Generate selected channel formats for LinkedIn, X, Instagram, blogs, newsletters, and release notes.
- Export a model prompt for local SLMs, API models, or free chatbots.
- Configure input sources, model adapter details, selected channels, export folder, and safe distribution mode from the frontend.
- Keep distribution safe through manual review, files, webhooks, or official platform APIs.
- Run a local pipeline that writes Markdown, JSON, and media artifacts.
- Use a Next.js UI that proxies requests to the local Python backend.

## Quick Start

Install Python dependencies and scan a repository:

```bash
python -m pip install -r requirements.txt
python -m signalflow.cli scan --repo "C:\path\to\repo" --top 10
```

Create a launch kit from the CLI:

```bash
python -m signalflow.cli launch-kit ^
  --repo "C:\path\to\repo" ^
  --project-name "My Project" ^
  --audience "open-source maintainers"
```

Create from a notes file instead of a repository:

```bash
python -m signalflow.cli launch-kit ^
  --notes-file launch-notes.md ^
  --project-name "My Project" ^
  --audience "technical founders" ^
  --channel linkedin ^
  --channel newsletter
```

Create from research/document context:

```bash
python -m signalflow.cli launch-kit ^
  --research-url "https://example.com/report" ^
  --document-text "Paste notes or extracted PDF text here" ^
  --project-name "My Project" ^
  --channel blog ^
  --channel release_notes ^
  --generator slm
```

Start the local backend:

```bash
python -m signalflow.cli serve --host 127.0.0.1 --port 8000
```

In a second terminal, start the frontend:

```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:3000`.

From the frontend you can choose the input type, paste or point to source material,
set the model route/endpoint/model name, select output channels, choose an export
folder, and prepare a manual, file, webhook, or official-API distribution config.
API keys are not persisted by PostPilot; wire them through your own local vault
or deployment environment when connecting a real provider.

## Useful Commands

Render a code image:

```bash
python -m signalflow.cli render --file path/to/file.py --out code.png
```

Run the full local pipeline:

```bash
python -m signalflow.cli pipeline --repo "C:\path\to\repo" --out-dir pipeline-output --top 5
```

Create only the launch kit:

```bash
python -m signalflow.cli launch-kit --repo "C:\path\to\repo" --out-dir pipeline-output --top 5
```

Run tests:

```bash
python -m pytest -q
```

Build the frontend:

```bash
cd frontend
npm run build
```

Create a launch kit through the API:

```bash
curl -X POST http://127.0.0.1:8000/launch_kit ^
  -H "Content-Type: application/json" ^
  -d "{\"input_type\":\"brief\",\"notes\":\"raw launch brief\",\"project_name\":\"My Project\",\"channels\":[\"linkedin\",\"x\"],\"generator\":\"chatbot\"}"
```

## Project Structure

- `signalflow/` - Python CLI, ingestion pipeline, model adapters, and media utilities.
- `frontend/` - Next.js App Router UI and API proxy routes.
- `rust_media_compositor/` - Optional Rust renderer scaffold.
- `go_transport/` - Optional Go transport worker scaffold.
- `tests/` - Python smoke tests for core pipeline pieces.

## Open-Source Direction

The strongest product angle is: **a local-first autoposting engine that turns descriptions, data, and captured media into platform-ready posting packages**.

See [ROADMAP.md](ROADMAP.md) for the path from prototype to a product people can understand, try, and contribute to.
See [docs/INTEGRATIONS.md](docs/INTEGRATIONS.md) for the asset-to-model and channel integration strategy.

Security and ethics: see [SECURITY.md](SECURITY.md). PostPilot must not harvest credentials, bypass platform protections, or publish to third-party services without official APIs and explicit user approval.
