# SignalFlow

SignalFlow turns local repository work into a small developer launch kit: ranked code highlights, shareable code images, post copy, slide outlines, and a pipeline summary.

The project is intentionally local-first. It is useful for developers, maintainers, and DevRel teams who want to explain technical work without pasting private source code into a hosted product.

## What Works Today

- Scan a repository and rank source files by simple signal-to-noise heuristics.
- Render syntax-highlighted code snippets to PNG.
- Generate stubbed social copy and slide outlines through a local FastAPI service.
- Run a local pipeline that writes a JSON summary and media artifacts.
- Use a Next.js UI that proxies requests to the local Python backend.

## Quick Start

Install Python dependencies and scan a repository:

```bash
python -m pip install -r requirements.txt
python -m signalflow.cli scan --repo "C:\path\to\repo" --top 10
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

## Useful Commands

Render a code image:

```bash
python -m signalflow.cli render --file path/to/file.py --out code.png
```

Run the full local pipeline:

```bash
python -m signalflow.cli pipeline --repo "C:\path\to\repo" --out-dir pipeline-output --top 5
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
  -d "{\"repo\":\"C:\\path\\to\\repo\",\"project_name\":\"My Project\",\"audience\":\"open-source maintainers\"}"
```

## Project Structure

- `signalflow/` - Python CLI, ingestion pipeline, model adapters, and media utilities.
- `frontend/` - Next.js App Router UI and API proxy routes.
- `rust_media_compositor/` - Optional Rust renderer scaffold.
- `go_transport/` - Optional Go transport worker scaffold.
- `tests/` - Python smoke tests for core pipeline pieces.

## Open-Source Direction

The strongest product angle is: **a local-first launch kit generator for open-source maintainers**.

See [ROADMAP.md](ROADMAP.md) for the path from prototype to a product people can understand, try, and contribute to.
See [docs/INTEGRATIONS.md](docs/INTEGRATIONS.md) for the GitHub, social, and blog integration strategy.

Security and ethics: see [SECURITY.md](SECURITY.md). SignalFlow must not harvest credentials, bypass platform protections, or publish to third-party services without official APIs and explicit user approval.
