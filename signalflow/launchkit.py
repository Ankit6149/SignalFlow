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
    file_name = highlight["path"]
    summary = highlight["summary"]
    audience_line = audience or "developers who want the technical signal quickly"

    return {
        "github_release": (
            f"## {project_name} update\n\n"
            f"- Highlight: `{file_name}`\n"
            f"- Why it matters: {summary}\n"
            f"- Built for: {audience_line}\n\n"
            "Try it locally, inspect the output, and open an issue with the next workflow you want supported."
        ),
        "linkedin": (
            f"I shipped a new {project_name} workflow that turns repository work into a local launch kit.\n\n"
            f"The current highlight is `{file_name}`: {summary}\n\n"
            "The goal is simple: help maintainers explain technical progress without uploading private source."
        ),
        "x": (
            f"Building {project_name}: local repo in, launch kit out.\n\n"
            f"Highlight: `{file_name}`\n"
            f"{summary}\n\n"
            "Useful for maintainers who want sharper release notes, posts, and code visuals."
        ),
        "blog_intro": (
            f"{project_name} is becoming a local-first launch kit generator for technical projects. "
            f"This run selected `{file_name}` as the strongest code highlight because {summary.lower()} "
            "From there, it creates reusable copy, a slide outline, and visual assets that can be edited before publishing."
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
        f"# {project_name} Launch Kit\n\n"
        "## Code Highlights\n\n"
        f"{highlights_md}\n\n"
        "## Post Drafts\n\n"
        f"{posts_md}\n\n"
        "## Slide Outline\n\n"
        f"{slide_outline}\n"
    )


def create_launch_kit(repo: Path, out_dir: Path, project_name: str = "", audience: str = "", top_n: int = 5) -> Dict:
    repo = Path(repo).expanduser().resolve()
    if not repo.exists() or not repo.is_dir():
        raise FileNotFoundError(f"Repository path not found: {repo}")

    project_name = project_name.strip() or repo.name
    timestamp = datetime.now().strftime("%Y%m%d-%H%M%S")
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
                "excerpt": excerpt,
            }
        )

    primary = highlights[0]
    primary_code = primary["excerpt"] or Path(primary["absolute_path"]).read_text(encoding="utf-8", errors="ignore")[:1400]
    image_path = kit_dir / "code-highlight.png"
    ImageRenderer(theme="monokai", font_size=18).render_code(primary_code, out_path=image_path)
    image_base64 = base64.b64encode(image_path.read_bytes()).decode("utf-8")

    posts = _platform_posts(project_name, primary, audience)
    slide_outline = _slide_outline(project_name, highlights)
    markdown = _markdown_export(project_name, highlights, posts, slide_outline)

    markdown_path = kit_dir / "launch-kit.md"
    summary_path = kit_dir / "launch-kit.json"
    markdown_path.write_text(markdown, encoding="utf-8")

    result = {
        "project_name": project_name,
        "repo": str(repo),
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
            "Copy the GitHub release draft into a GitHub Release or PR description.",
            "Use the LinkedIn and X drafts as editable starting points.",
            "Keep publishing manual until OAuth integrations are configured by the user.",
        ],
    }
    summary_path.write_text(json.dumps({k: v for k, v in result.items() if k != "image_base64"}, indent=2), encoding="utf-8")
    return result
