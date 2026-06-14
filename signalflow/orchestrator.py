import os
import json
import subprocess
from pathlib import Path
from typing import List
from signalflow.ingestion.walker import DirectoryWalker
from signalflow.ingestion.snr import SNRScorer
from signalflow.compositor.image_renderer import ImageRenderer
from signalflow.compositor.terminal_recorder import TerminalRecorder
from signalflow.compositor.presentation import render_slide_pdf
from signalflow.model.adapter import LocalRESTAdapter, CloudStubAdapter
from signalflow.native import render_code_via_rust, find_rust_renderer


def ensure_output_dir(path: Path) -> Path:
    path.mkdir(parents=True, exist_ok=True)
    return path


def select_top_files(repo: Path, top_n: int) -> List[Path]:
    walker = DirectoryWalker(repo)
    files = list(walker.walk())
    scorer = SNRScorer()
    scored = scorer.score_files(files)
    sorted_files = sorted(scored.items(), key=lambda item: item[1], reverse=True)
    return [path for path, _ in sorted_files[:top_n]]


def generate_visual_assets(file_path: Path, out_dir: Path) -> dict:
    out = {}
    code = file_path.read_text(encoding="utf-8")
    image_out = out_dir / "code_snapshot.png"
    if find_rust_renderer() is not None:
        try:
            render_code_via_rust(code, image_out)
            out["code_image"] = str(image_out)
        except Exception:
            renderer = ImageRenderer()
            out["code_image"] = str(renderer.render_code(code, out_path=image_out))
    else:
        renderer = ImageRenderer()
        out["code_image"] = str(renderer.render_code(code, out_path=image_out))

    pdf_out = out_dir / "presentation.pdf"
    out["presentation_pdf"] = str(render_slide_pdf(code, pdf_out))
    return out


def record_demo_session(repo: Path, out_dir: Path) -> str:
    recorder = TerminalRecorder()
    demo_video = out_dir / "demo_terminal.mp4"
    commands = [
        f"cd {repo.as_posix()} && git status --short",
        f"cd {repo.as_posix()} && git log --oneline -n 3",
    ]
    # On Windows use PowerShell style commands when necessary.
    if os.name == "nt":
        commands = [f"cd /d {repo.as_posix()} && git status --short", f"cd /d {repo.as_posix()} && git log --oneline -n 3"]
    recorder.record(commands, demo_video, keep_frames=False)
    return str(demo_video)


def synthesize_post(file_path: Path, target: str, base_url: str = "http://127.0.0.1:8000") -> str:
    payload = {"CoreTokens": file_path.read_text(encoding="utf-8")}
    adapter = LocalRESTAdapter(base_url=base_url)
    try:
        adapter.initialize({"base_url": base_url})
        return adapter.generate_post_text("", payload, target)
    except Exception:
        adapter = CloudStubAdapter()
        return adapter.generate_post_text("", payload, target)


def run_pipeline(repo: Path, out_dir: Path, top_n: int = 5):
    out_dir = ensure_output_dir(out_dir)
    summary = {
        "repo": str(repo),
        "top_n": top_n,
        "files": [],
        "assets": {},
    }

    top_files = select_top_files(repo, top_n)
    if not top_files:
        raise RuntimeError("No eligible source files found in repository.")

    summary["files"] = [str(p) for p in top_files]
    primary = top_files[0]
    summary["assets"] = generate_visual_assets(primary, out_dir)
    summary["demo_video"] = record_demo_session(repo, out_dir)
    summary["post_text"] = synthesize_post(primary, target="local_demo")
    summary_path = out_dir / "pipeline_summary.json"
    summary_path.write_text(json.dumps(summary, indent=2), encoding="utf-8")
    print(f"Pipeline complete. Output directory: {out_dir}")
    print(json.dumps(summary, indent=2))
    return summary
