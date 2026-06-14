import os
from pathlib import Path
from concurrent.futures import ThreadPoolExecutor, as_completed
from typing import Iterable, List

IGNORE_DIRS = {
    "node_modules",
    "vendor",
    "dist",
    "build",
    "target",
    ".git",
    "__pycache__",
    "venv",
}

CODE_EXTENSIONS = {
    ".py",
    ".js",
    ".ts",
    ".go",
    ".rs",
    ".java",
    ".c",
    ".cpp",
    ".h",
    ".hpp",
}


class DirectoryWalker:
    """Concurrently walk a directory tree and yield code file paths.

    Skips common vendor/build folders and yields files with known code extensions.
    """

    def __init__(self, root: Path):
        self.root = Path(root)

    def walk(self) -> Iterable[Path]:
        """Yield files to be analyzed."""
        for dirpath, dirnames, filenames in os.walk(self.root):
            # prune ignored directories
            dirnames[:] = [d for d in dirnames if d not in IGNORE_DIRS]
            for fn in filenames:
                p = Path(dirpath) / fn
                if p.suffix.lower() in CODE_EXTENSIONS:
                    yield p

    def read_files_concurrent(self, paths: List[Path], max_workers: int = 8):
        results = {}
        with ThreadPoolExecutor(max_workers=max_workers) as ex:
            futures = {ex.submit(self._read_file, p): p for p in paths}
            for fut in as_completed(futures):
                p = futures[fut]
                try:
                    results[p] = fut.result()
                except Exception:
                    results[p] = None
        return results

    @staticmethod
    def _read_file(path: Path):
        try:
            return path.read_text(encoding="utf-8", errors="ignore")
        except Exception:
            return None
