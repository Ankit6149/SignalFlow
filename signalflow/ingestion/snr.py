import math
from pathlib import Path
from typing import Dict, List
from signalflow.ingestion.walker import DirectoryWalker


class SNRScorer:
    """Simple heuristic-based Signal-to-Noise Ratio scorer.

    Scores files by combining token density, size, and structural indicators.
    This is intentionally language-agnostic and fast; it is a first-pass filter.
    """

    def __init__(self):
        pass

    def score_text(self, text: str) -> float:
        if not text:
            return 0.0
        total_chars = len(text)
        if total_chars == 0:
            return 0.0

        non_ws = sum(1 for c in text if not c.isspace())
        token_density = non_ws / total_chars

        lines = text.splitlines()
        avg_line_len = sum(len(l) for l in lines) / max(1, len(lines))

        # crude nesting heuristic: count occurrences of common block tokens
        block_tokens = sum(text.count(tok) for tok in ["def ", "class ", "function ", "if ", "for ", "while ", "->"])

        # file size influence (larger files may have more signal but penalize huge vendor files)
        size_factor = math.log1p(total_chars)

        score = token_density * 0.6 + (avg_line_len / 120.0) * 0.2 + (block_tokens / 20.0) * 0.2
        # scale with size but dampen
        score = score * (1.0 + math.tanh((size_factor - 5) / 5))

        return float(max(0.0, min(score, 5.0)))

    def score_files(self, paths: List[Path]) -> Dict[Path, float]:
        walker = DirectoryWalker(paths[0].parent) if paths else None
        results = {}
        # read concurrently
        if paths:
            contents = DirectoryWalker.read_files_concurrent(walker, paths)
            for p, text in contents.items():
                results[p] = self.score_text(text) if text else 0.0
        return results
