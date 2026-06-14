from signalflow.native import find_rust_renderer
from pathlib import Path


def test_find_renderer_not_built():
    # Likely not built in CI; ensure function returns None or Path
    r = find_rust_renderer()
    assert (r is None) or isinstance(r, Path)
