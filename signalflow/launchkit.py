import base64
import json
from datetime import datetime
from pathlib import Path
from typing import Dict, List, Optional
from uuid import uuid4

from signalflow.compositor.image_renderer import ImageRenderer
from signalflow.context_engine import (
    asset_from_text,
    assets_from_repo,
    assets_from_research,
    context_prompt,
    public_assets,
)

CHANNEL_LABELS = {
    "linkedin": "LinkedIn",
    "x": "X",
    "instagram": "Instagram",
    "blog": "Blog",
    "newsletter": "Newsletter",
    "release_notes": "Release Notes",
}

DEFAULT_CHANNELS = ["linkedin", "x", "blog", "newsletter"]
GENERATOR_ROUTES = {"local", "api", "slm", "chatbot", "cloud"}


def _safe_slug(value: str) -> str:
    cleaned = "".join(ch.lower() if ch.isalnum() else "-" for ch in value)
    parts = [part for part in cleaned.split("-") if part]
    return "-".join(parts[:8]) or "signalflow-kit"


def _kit_dir(out_dir: Path, project_name: str) -> Path:
    timestamp = datetime.now().strftime("%Y%m%d-%H%M%S-%f")
    return Path(out_dir) / f"{_safe_slug(project_name)}-{timestamp}-{uuid4().hex[:6]}"


def _normal_channels(channels: Optional[List[str]]) -> List[str]:
    if not channels:
        return DEFAULT_CHANNELS
    valid = []
    for channel in channels:
        key = channel.strip().lower()
        if key in CHANNEL_LABELS and key not in valid:
            valid.append(key)
    return valid or DEFAULT_CHANNELS


def _normal_generator(generator: str) -> str:
    route = (generator or "local").strip().lower()
    return route if route in GENERATOR_ROUTES else "local"


def _combined_signal(assets: List[Dict]) -> Dict:
    primary = assets[0]
    if len(assets) == 1:
        return primary
    return {
        "path": f"{primary['path']} + {len(assets) - 1} more",
        "summary": "; ".join(asset["summary"] for asset in assets[:3]),
        "score": primary.get("score", 1.0),
    }


def _channel_drafts(project_name: str, assets: List[Dict], audience: str, channels: List[str]) -> Dict[str, str]:
    signal = _combined_signal(assets)
    signal_name = signal["path"]
    summary = signal["summary"]
    audience_line = audience or "technical builders and readers"
    all_drafts = {
        "linkedin": (
            f"I am working on {project_name}.\n\n"
            f"The strongest signal right now is `{signal_name}`: {summary}\n\n"
            f"Built for {audience_line}. The goal is to make the work easier to understand and share."
        ),
        "x": (
            f"Building {project_name}.\n\n"
            f"Signal: `{signal_name}`\n"
            f"{summary}\n\n"
            "Turning raw work into channel-ready content."
        ),
        "instagram": (
            f"New from {project_name}\n\n"
            f"{summary}\n\n"
            "Use this as a caption starter with the generated signal card."
        ),
        "blog": (
            f"{project_name} is focused on turning technical context into clearer content. "
            f"The key signal in this run is `{signal_name}`: {summary.lower()} "
            "This gives the article a concrete starting point instead of a blank page."
        ),
        "newsletter": (
            f"Subject: {project_name} update\n\n"
            f"Here is the strongest signal from this update: `{signal_name}`.\n\n"
            f"{summary}\n\n"
            f"This matters for {audience_line} because it turns raw progress into something easy to follow."
        ),
        "release_notes": (
            f"## {project_name} update\n\n"
            f"- Signal: `{signal_name}`\n"
            f"- Context: {summary}\n"
            f"- Audience: {audience_line}\n\n"
            "Review this draft, add version details, and publish through your official release workflow."
        ),
    }
    return {channel: all_drafts[channel] for channel in channels}


def _slide_outline(project_name: str, assets: List[Dict]) -> str:
    bullets = "\n".join(f"- `{asset['path']}`: {asset['summary']}" for asset in assets)
    return (
        f"# {project_name} Content Brief\n\n"
        "## Context\n"
        f"{bullets}\n\n"
        "## Angle\n"
        "- Explain what changed, why it matters, and who should care.\n\n"
        "## Distribution\n"
        "- Review drafts, edit for voice, and publish through manual or official API workflows."
    )


def _media_plan(project_name: str, assets: List[Dict], channels: List[str]) -> List[Dict[str, str]]:
    signal = _combined_signal(assets)
    platform_list = ", ".join(CHANNEL_LABELS[channel] for channel in channels)
    return [
        {
            "type": "screen_recording",
            "title": "Record the user flow",
            "summary": f"Capture the app/product flow that proves `{signal['path']}` so it can become short clips.",
        },
        {
            "type": "screenshot_set",
            "title": "Capture key states",
            "summary": "Take clean screenshots of the before state, main action, and final result for carousel or card formats.",
        },
        {
            "type": "gif_clip",
            "title": "Create a short loop",
            "summary": "Turn the strongest 3-6 seconds of the recording into a GIF or silent clip for fast social scanning.",
        },
        {
            "type": "generated_card",
            "title": "Generate a native post card",
            "summary": f"Use the generated visual card as a fallback asset for {project_name} when no recording is available.",
        },
        {
            "type": "platform_variants",
            "title": "Adapt for selected platforms",
            "summary": f"Prepare aspect-ratio and caption variants for {platform_list}.",
        },
    ]


def _markdown_export(
    project_name: str,
    assets: List[Dict],
    drafts: Dict[str, str],
    outline: str,
    prompt: str,
    media_plan: List[Dict[str, str]],
) -> str:
    assets_md = "\n".join(
        f"- `{asset['path']}` - score {asset['score']:.2f}: {asset['summary']}" for asset in assets
    )
    drafts_md = "\n\n".join(f"### {name.replace('_', ' ').title()}\n\n{body}" for name, body in drafts.items())
    media_md = "\n".join(f"- **{item['title']}** ({item['type']}): {item['summary']}" for item in media_plan)
    return (
        f"# {project_name} Kit\n\n"
        "## Unified Context Signals\n\n"
        f"{assets_md}\n\n"
        "## Visual Media Plan\n\n"
        f"{media_md}\n\n"
        "## Channel Drafts\n\n"
        f"{drafts_md}\n\n"
        "## Content Outline\n\n"
        f"{outline}\n\n"
        "## Prompt For SLM/API/Chatbot\n\n"
        f"```text\n{prompt}\n```\n"
    )


def _write_content_kit(
    kit_dir: Path,
    project_name: str,
    source_label: str,
    context_assets: List[Dict],
    audience: str,
    channels: Optional[List[str]] = None,
    generator: str = "local",
) -> Dict:
    selected_channels = _normal_channels(channels)
    generator_route = _normal_generator(generator)
    public_context = public_assets(context_assets)
    channel_names = ", ".join(CHANNEL_LABELS[channel] for channel in selected_channels)
    prompt = context_prompt(project_name, audience, context_assets, channel_names)

    image_path = kit_dir / "signal-card.png"
    ImageRenderer(theme="monokai", font_size=18).render_code(
        context_assets[0].get("content", context_assets[0]["summary"]),
        out_path=image_path,
    )
    image_base64 = base64.b64encode(image_path.read_bytes()).decode("utf-8")

    drafts = _channel_drafts(project_name, context_assets, audience, selected_channels)
    outline = _slide_outline(project_name, public_context)
    media_plan = _media_plan(project_name, public_context, selected_channels)
    markdown = _markdown_export(project_name, public_context, drafts, outline, prompt, media_plan)

    markdown_path = kit_dir / "signalflow-kit.md"
    summary_path = kit_dir / "signalflow-kit.json"
    markdown_path.write_text(markdown, encoding="utf-8")

    result = {
        "project_name": project_name,
        "repo": source_label,
        "output_dir": str(kit_dir),
        "highlights": public_context,
        "context_engine": {
            "input_count": len(context_assets),
            "source_types": sorted({asset.get("source_type", "unknown") for asset in context_assets}),
        },
        "model_adapter": {
            "route": generator_route,
            "status": "prompt_ready" if generator_route in {"api", "slm", "chatbot", "cloud"} else "local_template",
        },
        "posts": drafts,
        "channels": selected_channels,
        "generator": generator_route,
        "chatbot_prompt": prompt,
        "slide_outline": outline,
        "markdown": markdown,
        "assets": {
            "code_image": str(image_path),
            "markdown": str(markdown_path),
            "summary": str(summary_path),
        },
        "media_assets": [
            {
                "type": "generated_card",
                "path": str(image_path),
                "summary": "Generated fallback image card for posts when no screen capture is attached.",
            },
            {
                "type": "planned_recording",
                "path": "",
                "summary": "Record the relevant product flow, then convert it into GIF/video variants.",
            },
            {
                "type": "planned_screenshots",
                "path": "",
                "summary": "Capture before/action/result states for carousel and static post variants.",
            },
        ],
        "media_plan": media_plan,
        "image_base64": image_base64,
        "integration_notes": [
            "Use the description, data, and media plan as input for a local SLM, API model, cloud gateway, or free chatbot.",
            "Selected channels control the copy, asset, and format variants.",
            "Distribution should use manual review, exports, webhooks, or official platform APIs.",
        ],
    }
    summary_path.write_text(json.dumps({k: v for k, v in result.items() if k != "image_base64"}, indent=2), encoding="utf-8")
    return result


def create_launch_kit(
    repo: Path,
    out_dir: Path,
    project_name: str = "",
    audience: str = "",
    top_n: int = 5,
    channels: Optional[List[str]] = None,
    generator: str = "local",
) -> Dict:
    repo = Path(repo).expanduser().resolve()
    project_name = project_name.strip() or repo.name
    kit_dir = _kit_dir(out_dir, project_name)
    kit_dir.mkdir(parents=True, exist_ok=True)
    context_assets = assets_from_repo(repo, top_n=top_n)
    return _write_content_kit(kit_dir, project_name, str(repo), context_assets, audience, channels, generator)


def create_notes_kit(
    notes: str,
    out_dir: Path,
    project_name: str = "",
    audience: str = "",
    channels: Optional[List[str]] = None,
    generator: str = "local",
) -> Dict:
    project_name = project_name.strip() or "SignalFlow Draft"
    kit_dir = _kit_dir(out_dir, project_name)
    kit_dir.mkdir(parents=True, exist_ok=True)
    context_assets = [asset_from_text("raw-brief", notes, "brief", score=1.0)]
    return _write_content_kit(kit_dir, project_name, "raw-brief", context_assets, audience, channels, generator)


def create_research_kit(
    research_url: str = "",
    document_text: str = "",
    document_path: Optional[Path] = None,
    out_dir: Path = Path("pipeline-output"),
    project_name: str = "",
    audience: str = "",
    channels: Optional[List[str]] = None,
    generator: str = "local",
) -> Dict:
    project_name = project_name.strip() or "SignalFlow Research"
    kit_dir = _kit_dir(out_dir, project_name)
    kit_dir.mkdir(parents=True, exist_ok=True)
    context_assets = assets_from_research(research_url, document_text, document_path)
    return _write_content_kit(kit_dir, project_name, "research", context_assets, audience, channels, generator)
