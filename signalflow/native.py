import shutil
import subprocess
from pathlib import Path
from typing import Optional


def find_rust_renderer() -> Optional[Path]:
    # Look for built renderer binary in known locations
    candidates = [
        Path("rust_media_compositor/target/release/renderer"),
        Path("rust_media_compositor/target/release/renderer.exe"),
        Path("rust_media_compositor/target/debug/renderer"),
        Path("rust_media_compositor/target/debug/renderer.exe"),
    ]
    for c in candidates:
        if c.exists():
            return c
    return None


def render_code_via_rust(code: str, out_path: Path) -> Path:
    renderer = find_rust_renderer()
    if not renderer:
        raise FileNotFoundError("Rust renderer binary not found. Build rust_media_compositor first.")

    tmp_in = out_path.parent / (out_path.stem + ".in.txt")
    tmp_in.write_text(code, encoding="utf-8")
    cmd = [str(renderer), str(tmp_in), str(out_path)]
    subprocess.run(cmd, check=True)
    return out_path
