import argparse
import sys
from pathlib import Path
from signalflow.ingestion.walker import DirectoryWalker
from signalflow.ingestion.snr import SNRScorer


def main(argv=None):
    parser = argparse.ArgumentParser(description="SignalFlow - Context Ingestion (safe subset)")
    parser.add_argument("--repo", required=True, help="Path to repository or directory to scan")
    parser.add_argument("--top", type=int, default=10, help="Show top N scored files")
    args = parser.parse_args(argv)

    root = Path(args.repo)
    if not root.exists():
        print(f"Path not found: {root}")
        sys.exit(2)

    walker = DirectoryWalker(root)
    files = list(walker.walk())

    scorer = SNRScorer()
    scored = scorer.score_files(files)
    scored_sorted = sorted(scored.items(), key=lambda t: t[1], reverse=True)

    print(f"Scanned {len(files)} files; top {args.top} by SNR:\n")
    for path, score in scored_sorted[: args.top]:
        print(f"{score:.3f}\t{path}")


if __name__ == "__main__":
    main()
