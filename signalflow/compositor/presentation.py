from reportlab.lib.pagesizes import landscape, A4
from reportlab.pdfgen import canvas
from reportlab.lib.units import mm
from pathlib import Path
import markdown2
from typing import List


def slides_from_markdown(md: str) -> List[str]:
    # Split on slide divider lines '---' alone on a line
    parts = []
    cur = []
    for line in md.splitlines():
        if line.strip() == "---":
            parts.append("\n".join(cur).strip())
            cur = []
        else:
            cur.append(line)
    if cur:
        parts.append("\n".join(cur).strip())
    return parts


def render_slide_pdf(md: str, out_pdf: Path, page_size=landscape(A4)) -> Path:
    slides = slides_from_markdown(md)
    c = canvas.Canvas(str(out_pdf), pagesize=page_size)
    width, height = page_size

    for s in slides:
        # simple layout: title is first line if not empty
        lines = s.splitlines()
        title = lines[0] if lines else ""
        body = "\n".join(lines[1:]) if len(lines) > 1 else ""

        # draw title
        c.setFont("Helvetica-Bold", 28)
        c.drawString(20 * mm, height - 30 * mm, title)

        # convert body markdown to plain text via markdown2 (strip tags)
        html = markdown2.markdown(body)
        # very naive strip of tags for PDF text flow
        import re

        text = re.sub(r"<[^>]+>", "", html)

        c.setFont("Helvetica", 14)
        text_object = c.beginText(20 * mm, height - 45 * mm)
        for line in text.splitlines():
            text_object.textLine(line)
        c.drawText(text_object)
        c.showPage()

    c.save()
    return out_pdf


if __name__ == "__main__":
    import sys

    if len(sys.argv) < 3:
        print("Usage: presentation.py input.md out.pdf")
        sys.exit(2)
    md = Path(sys.argv[1]).read_text(encoding="utf-8")
    out = Path(sys.argv[2])
    render_slide_pdf(md, out)
