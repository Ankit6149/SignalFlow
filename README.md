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

Rendering a code image:

```bash
python -m signalflow.cli render --file examples/example.py --out code.png
```

Generate presentation PDF from Markdown slides:

```bash
python -c "from signalflow.compositor.presentation import render_slide_pdf; import pathlib; render_slide_pdf(pathlib.Path('slides.md').read_text(), pathlib.Path('slides.pdf'))"
```

Security & ethics: see `SECURITY.md` for details about allowed/forbidden features and safe deployment guidance.

