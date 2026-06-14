from signalflow.compositor.presentation import render_slide_pdf
from pathlib import Path


def test_render_pdf(tmp_path):
    md = "# Title\n\nSlide content\n---\n# Next\nMore"
    out = tmp_path / "out.pdf"
    render_slide_pdf(md, out)
    assert out.exists() and out.stat().st_size > 0
