from PIL import Image, ImageDraw, ImageFont
from pygments import highlight
from pygments.lexers import get_lexer_by_name, guess_lexer
from pygments.formatters import HtmlFormatter
from pygments.token import Token
from pygments.style import Style
from pygments.formatters import ImageFormatter
import tempfile
from pathlib import Path
from typing import Optional


class ImageRenderer:
    """Render syntax-highlighted code snippets to PNG images.

    Uses Pygments + Pillow. Designed to be simple, portable, and dependency-light.
    """

    def __init__(self, font_path: Optional[str] = None, font_size: int = 16, theme: str = "default"):
        self.font_size = font_size
        try:
            if font_path:
                self.font = ImageFont.truetype(font_path, font_size)
            else:
                self.font = ImageFont.load_default()
        except Exception:
            self.font = ImageFont.load_default()

    def render_code(self, code: str, lexer_name: Optional[str] = None, out_path: Optional[Path] = None, width: int = 1200, bg_color="#0f1720") -> Path:
        if lexer_name:
            try:
                lexer = get_lexer_by_name(lexer_name)
            except Exception:
                lexer = guess_lexer(code)
        else:
            lexer = guess_lexer(code)

        # Use Pygments ImageFormatter for simple PIL integration
        formatter = ImageFormatter(font_name="DejaVu Sans Mono", font_size=self.font_size, line_numbers=False, style="default")

        # highlight returns bytes for ImageFormatter
        data = highlight(code, lexer, formatter)

        # Pygments ImageFormatter returns PNG bytes
        if out_path is None:
            out_path = Path(tempfile.mkdtemp()) / "code.png"
        else:
            out_path = Path(out_path)

        with open(out_path, "wb") as f:
            f.write(data)

        return out_path
