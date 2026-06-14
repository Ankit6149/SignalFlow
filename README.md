# SignalFlow (safe subset)

This repository contains a safe, local-first implementation of the SignalFlow prototype.

Key components:

- `signalflow/` — Python orchestrator, ingestion pipeline, model adapters, and compositor utilities.
- `frontend/` — Minimal Next.js scaffold (UI to be expanded).
- `rust_media_compositor/` — Rust scaffold for high-performance media work (optional).
- `go_transport/` — Go scaffold for transport workers (optional).

Quick start (install Python deps then run the CLI):

```bash
python -m pip install -r requirements.txt
python -m signalflow.cli scan --repo "C:\\path\\to\\repo" --top 10
```

Optional native component builds:

```bash
cd rust_media_compositor
cargo build --release

cd ../go_transport
go build -o transport.exe .
```

Frontend UI (Next.js App Router)

```bash
cd frontend
npm install
npm run dev
```

Then open `http://localhost:3000` and use the Next.js UI to generate text, render code snapshots, create slide outlines, and run the local pipeline. The frontend now uses the Next.js App Router with API routes under `frontend/app/api/` to proxy requests to the local backend. Make sure the Python model stub is running at `http://localhost:8000` first.

Rendering a code image:

```bash
python -m signalflow.cli render --file examples/example.py --out code.png
```

Run the full local pipeline:

```bash
python -m signalflow.cli pipeline --repo "C:\\path\\to\\repo" --out-dir output --top 5
```

Start the local model stub:

```bash
python -m signalflow.cli serve --host 127.0.0.1 --port 8000
```

Generate presentation PDF from Markdown slides:

```bash
python -c "from signalflow.compositor.presentation import render_slide_pdf; import pathlib; render_slide_pdf(pathlib.Path('slides.md').read_text(), pathlib.Path('slides.pdf'))"
```

Security & ethics: see `SECURITY.md` for details about allowed/forbidden features and safe deployment guidance.
