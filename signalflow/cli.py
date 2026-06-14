import argparse
import sys
from pathlib import Path
from signalflow.ingestion.walker import DirectoryWalker
from signalflow.ingestion.snr import SNRScorer
from signalflow.compositor.image_renderer import ImageRenderer
from signalflow.compositor.terminal_recorder import TerminalRecorder
from signalflow.model.adapter import CloudStubAdapter


def cmd_scan(args):
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


def cmd_render(args):
    code = Path(args.file).read_text(encoding="utf-8")
    renderer = ImageRenderer()
    out = renderer.render_code(code, lexer_name=args.lexer, out_path=Path(args.out))
    print(f"Wrote code image to: {out}")


def cmd_record(args):
    cmds = args.commands
    recorder = TerminalRecorder()
    out = recorder.record(cmds, Path(args.out))
    print(f"Wrote terminal video to: {out}")


def cmd_stub_generate(args):
    adapter = CloudStubAdapter()
    payload = {"CoreTokens": Path(args.file).read_text(encoding="utf-8")}
    text = adapter.generate_post_text("", payload, args.target)
    print(text)


def main(argv=None):
    parser = argparse.ArgumentParser(description="SignalFlow - Orchestrator CLI")
    sub = parser.add_subparsers(dest="cmd")

    p_scan = sub.add_parser("scan")
    p_scan.add_argument("--repo", required=True)
    p_scan.add_argument("--top", type=int, default=10)

    p_render = sub.add_parser("render")
    p_render.add_argument("--file", required=True, help="Source code file to render")
    p_render.add_argument("--lexer", required=False)
    p_render.add_argument("--out", required=False, default="out.png")

    p_record = sub.add_parser("record")
    p_record.add_argument("--commands", nargs="+", required=True, help="Commands to run sequentially (shell)")
    p_record.add_argument("--out", required=False, default="out.mp4")

    p_stub = sub.add_parser("stub-generate")
    p_stub.add_argument("--file", required=True)
    p_stub.add_argument("--target", required=True)

    args = parser.parse_args(argv)
    if args.cmd == "scan":
        cmd_scan(args)
    elif args.cmd == "render":
        cmd_render(args)
    elif args.cmd == "record":
        cmd_record(args)
    elif args.cmd == "stub-generate":
        cmd_stub_generate(args)
    else:
        parser.print_help()


if __name__ == "__main__":
    main()
