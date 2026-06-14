from signalflow.compositor.image_renderer import ImageRenderer
from pathlib import Path


def test_image_renderer(tmp_path):
    code = "def hello():\n    print('hello')\n"
    out = tmp_path / "code.png"
    r = ImageRenderer()
    path = r.render_code(code, out_path=out)
    assert Path(path).exists()
    assert Path(path).stat().st_size > 0
