from PIL import Image, ImageDraw, ImageFont
from pygments import highlight
from pygments.lexers import get_lexer_by_name, guess_lexer
from pygments.formatters import ImageFormatter
import tempfile
from pathlib import Path
from typing import Optional
import shutil
import os


COMMON_FONTS = [
    "/usr/share/fonts/truetype/dejavu/DejaVuSansMono.ttf",
    "/usr/share/fonts/truetype/liberation/LiberationMono-Regular.ttf",
    "C:/Windows/Fonts/DejaVuSansMono.ttf",
    "C:/Windows/Fonts/Courier_New.ttf",
]


class ImageRenderer:
    """Render syntax-highlighted code snippets to PNG images.

    Uses Pygments + Pillow. Designed to be simple, portable, and dependency-light.
    """

    def __init__(self, font_path: Optional[str] = None, font_size: int = 16, theme: str = "default"):
        self.font_size = font_size
        self.theme = theme
        self.font = None
        self.font_path = None
        # resolve font
        if font_path and Path(font_path).exists():
            try:
                self.font = ImageFont.truetype(font_path, font_size)
                self.font_path = font_path
            except Exception:
                self.font = None
                self.font_path = None

        if self.font is None:
            for p in COMMON_FONTS:
                if Path(p).exists():
                    try:
                        self.font = ImageFont.truetype(p, font_size)
                        self.font_path = p
                        break
                    except Exception:
                        continue

        if self.font is None:
            self.font = ImageFont.load_default()
            self.font_path = None

    def render_code(self, code: str, lexer_name: Optional[str] = None, out_path: Optional[Path] = None, width: int = 1200, bg_color="#0f1720") -> Path:
        if lexer_name:
            try:
                lexer = get_lexer_by_name(lexer_name)
            except Exception:
                lexer = guess_lexer(code)
        else:
            lexer = guess_lexer(code)

        # Try using Pygments ImageFormatter which emits PNG bytes
        try:
            font_name = self.font_path if self.font_path else "DejaVu Sans Mono"
            formatter = ImageFormatter(font_name=font_name, font_size=self.font_size, line_numbers=False, style=self.theme)
            data = highlight(code, lexer, formatter)
            if out_path is None:
                out_path = Path(tempfile.mkdtemp()) / "code.png"
            else:
                out_path = Path(out_path)
            with open(out_path, "wb") as f:
                f.write(data)
            return out_path
        except Exception:
            # Fallback: render onto a PIL canvas line-by-line
            lines = code.splitlines() or [" "]
            # estimate image size
            measure_canvas = ImageDraw.Draw(Image.new("RGB", (1, 1)))
            line_height = measure_canvas.textbbox((0, 0), "Ay", font=self.font)[3] + 4
            img_height = max(200, line_height * len(lines) + 20)
            img = Image.new("RGBA", (width, img_height), (15, 23, 32, 255))
            draw = ImageDraw.Draw(img)
            y = 10
            for ln in lines:
                draw.text((10, y), ln, font=self.font, fill=(230, 230, 230))
                y += line_height

            if out_path is None:
                out_path = Path(tempfile.mkdtemp()) / "code.png"
            else:
                out_path = Path(out_path)
            img.save(out_path)
            return out_path
