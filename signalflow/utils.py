from pathlib import Path


def is_text_file(path: Path) -> bool:
    try:
        with open(path, "rb") as f:
            chunk = f.read(1024)
            if b"\0" in chunk:
                return False
    except Exception:
        return False
    return True
