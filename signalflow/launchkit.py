import base64
import json
from datetime import datetime
from pathlib import Path
from typing import Dict, List

from signalflow.compositor.image_renderer import ImageRenderer
from signalflow.ingestion.snr import SNRScorer
from signalflow.ingestion.walker import DirectoryWalker


def _safe_slug(value: str) -> str:
    cleaned = "".join(ch.lower() if ch.isalnum() else "-" for ch in value)
    parts = [part for part in cleaned.split("-") if part]
    return "-".join(parts[:8]) or "launch-kit"


def _read_excerpt(path: Path, max_chars: int = 1400) -> str:
    text = path.read_text(encoding="utf-8", errors="ignore")
    return text.strip()[:max_chars]


def _platform_posts(project_name: str, highlight: Dict[str, str], audience: str) -> Dict[str, str]:
    signal_name = highlight["path"]
    summary = highlight["summary"]
    audience_line = audience or "developers who want the technical signal quickly"

    return {
        "github_release": (
            f"## {project_name} update\n\n"
            f"- Signal: `{signal_name}`\n"
            f"- Why it matters: {summary}\n"
            f"- Built for: {audience_line}\n\n"
            "Try it locally, inspect the output, and open an issue with the next workflow you want supported."
        ),
        "linkedin": (
            f"I shipped a new {project_name} workflow that turns technical work into publish-ready drafts.\n\n"
            f"The current signal is `{signal_name}`: {summary}\n\n"
            "The goal is simple: help builders explain progress clearly without starting from a blank page."
        ),
        "x": (
            f"Building {project_name}: raw work in, channel-ready drafts out.\n\n"
            f"Signal: `{signal_name}`\n"
            f"{summary}\n\n"
            "Useful for builders who want sharper posts, release notes, newsletters, and launch assets."
        ),
        "blog_intro": (
            f"{project_name} is becoming a local-first publishing engine for technical builders. "
            f"This run selected `{signal_name}` as the strongest signal because {summary.lower()} "
            "From there, it creates reusable copy, a slide outline, and visual assets that can be edited before publishing."
        ),
        "newsletter": (
            f"Subject: {project_name} update\n\n"
            f"This week I worked on {project_name}, with the strongest signal coming from `{signal_name}`.\n\n"
            f"{summary}\n\n"
            f"This is built for {audience_line}. The goal is to make the work easier to understand, reuse, and share."
        ),
    }


def _slide_outline(project_name: str, highlights: List[Dict[str, str]]) -> str:
    bullets = "\n".join(f"- `{item['path']}`: {item['summary']}" for item in highlights)
    return (
        f"# {project_name} Launch Kit\n\n"
        "## Problem\n"
        "- Developers ship meaningful work, but turning it into public updates takes extra time.\n\n"
        "## What Changed\n"
        f"{bullets}\n\n"
        "## Why It Matters\n"
        "- Keeps source local.\n"
        "- Turns implementation details into reusable communication assets.\n"
        "- Gives maintainers a repeatable launch workflow.\n\n"
        "## Next Step\n"
        "- Review the generated copy, edit for voice, and publish through official platform workflows."
    )


def _markdown_export(project_name: str, highlights: List[Dict[str, str]], posts: Dict[str, str], slide_outline: str) -> str:
    highlights_md = "\n".join(
        f"- `{item['path']}` - score {item['score']:.2f}: {item['summary']}" for item in highlights
    )
    posts_md = "\n\n".join(f"### {name.replace('_', ' ').title()}\n\n{body}" for name, body in posts.items())
    return (
        f"# {project_name} Kit\n\n"
        "## Signals\n\n"
        f"{highlights_md}\n\n"
        "## Post Drafts\n\n"
        f"{posts_md}\n\n"
        "## Slide Outline\n\n"
        f"{slide_outline}\n"
    )


def _write_launch_kit(
    kit_dir: Path,
    project_name: str,
    repo: str,
    highlights: List[Dict[str, str]],
    primary_code: str,
    audience: str,
) -> Dict:
    image_path = kit_dir / "signal-card.png"
    ImageRenderer(theme="monokai", font_size=18).render_code(primary_code, out_path=image_path)
    image_base64 = base64.b64encode(image_path.read_bytes()).decode("utf-8")

    posts = _platform_posts(project_name, highlights[0], audience)
    slide_outline = _slide_outline(project_name, highlights)
    markdown = _markdown_export(project_name, highlights, posts, slide_outline)

    markdown_path = kit_dir / "signalflow-kit.md"
    summary_path = kit_dir / "signalflow-kit.json"
    markdown_path.write_text(markdown, encoding="utf-8")

    result = {
        "project_name": project_name,
        "repo": repo,
        "output_dir": str(kit_dir),
        "highlights": highlights,
        "posts": posts,
        "slide_outline": slide_outline,
        "markdown": markdown,
        "assets": {
            "code_image": str(image_path),
            "markdown": str(markdown_path),
            "summary": str(summary_path),
        },
        "image_base64": image_base64,
        "integration_notes": [
            "Copy drafts into LinkedIn, X, newsletters, blogs, GitHub releases, or docs.",
            "Keep publishing manual until OAuth integrations are configured by the user.",
            "Use the Markdown export as the source of truth for launch review.",
        ],
    }
    summary_path.write_text(json.dumps({k: v for k, v in result.items() if k != "image_base64"}, indent=2), encoding="utf-8")
    return result


def create_launch_kit(repo: Path, out_dir: Path, project_name: str = "", audience: str = "", top_n: int = 5) -> Dict:
    repo = Path(repo).expanduser().resolve()
    if not repo.exists() or not repo.is_dir():
        raise FileNotFoundError(f"Repository path not found: {repo}")

    top_n = max(1, min(int(top_n or 5), 10))
    project_name = project_name.strip() or repo.name
    timestamp = datetime.now().strftime("%Y%m%d-%H%M%S-%f")
    kit_dir = Path(out_dir) / f"{_safe_slug(project_name)}-{timestamp}"
    kit_dir.mkdir(parents=True, exist_ok=True)

    files = list(DirectoryWalker(repo).walk())
    scored = SNRScorer().score_files(files)
    ranked = sorted(scored.items(), key=lambda item: item[1], reverse=True)[:top_n]
    if not ranked:
        raise RuntimeError("No eligible source files found in repository.")

    highlights = []
    for path, score in ranked:
        rel_path = path.relative_to(repo).as_posix()
        excerpt = _read_excerpt(path)
        first_line = next((line.strip() for line in excerpt.splitlines() if line.strip()), "Source file selected")
        highlights.append(
            {
                "path": rel_path,
                "absolute_path": str(path),
                "score": float(score),
                "summary": f"High-signal source selected from `{rel_path}`; starts with: {first_line[:140]}",
            }
        )

    primary = highlights[0]
    primary_code = _read_excerpt(Path(primary["absolute_path"]))
    return _write_launch_kit(kit_dir, project_name, str(repo), highlights, primary_code, audience)


def create_notes_kit(notes: str, out_dir: Path, project_name: str = "", audience: str = "") -> Dict:
    notes = notes.strip()
    if len(notes) < 20:
        raise RuntimeError("Add at least a few lines of notes, code, changelog, or launch context.")

    project_name = project_name.strip() or "SignalFlow Draft"
    timestamp = datetime.now().strftime("%Y%m%d-%H%M%S-%f")
    kit_dir = Path(out_dir) / f"{_safe_slug(project_name)}-{timestamp}"
    kit_dir.mkdir(parents=True, exist_ok=True)

    first_line = next((line.strip() for line in notes.splitlines() if line.strip()), "Pasted launch notes")
    highlights = [
        {
            "path": "pasted-notes",
            "score": 1.0,
            "summary": f"Launch context supplied from notes; starts with: {first_line[:140]}",
        }
    ]
    return _write_launch_kit(kit_dir, project_name, "pasted-notes", highlights, notes[:1400], audience)
