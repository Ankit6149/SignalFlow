from pathlib import Path
from typing import Dict, List, Optional

from signalflow.ingestion.snr import SNRScorer
from signalflow.ingestion.walker import DirectoryWalker


def read_excerpt(path: Path, max_chars: int = 1800) -> str:
    return path.read_text(encoding="utf-8", errors="ignore").strip()[:max_chars]


def _first_line(text: str, fallback: str) -> str:
    return next((line.strip() for line in text.splitlines() if line.strip()), fallback)


def asset_from_text(asset_id: str, text: str, source_type: str, score: float = 1.0) -> Dict:
    text = text.strip()
    if len(text) < 20:
        raise RuntimeError("Add at least a few lines of context so SignalFlow has enough signal to work with.")
    first_line = _first_line(text, "Text asset")
    return {
        "path": asset_id,
        "source_type": source_type,
        "score": float(score),
        "summary": f"{source_type.title()} supplied as context; starts with: {first_line[:140]}",
        "content": text[:1800],
    }


def assets_from_repo(repo: Path, top_n: int = 5) -> List[Dict]:
    repo = Path(repo).expanduser().resolve()
    if not repo.exists() or not repo.is_dir():
        raise FileNotFoundError(f"Repository path not found: {repo}")

    top_n = max(1, min(int(top_n or 5), 10))
    files = list(DirectoryWalker(repo).walk())
    scored = SNRScorer().score_files(files)
    ranked = sorted(scored.items(), key=lambda item: item[1], reverse=True)[:top_n]
    if not ranked:
        raise RuntimeError("No eligible source files found in repository.")

    assets = []
    for path, score in ranked:
        rel_path = path.relative_to(repo).as_posix()
        excerpt = read_excerpt(path)
        first_line = _first_line(excerpt, "Source file selected")
        assets.append(
            {
                "path": rel_path,
                "absolute_path": str(path),
                "source_type": "repository",
                "score": float(score),
                "summary": f"Repository signal from `{rel_path}`; starts with: {first_line[:140]}",
                "content": excerpt,
            }
        )
    return assets


def assets_from_research(
    research_url: str = "",
    document_text: str = "",
    document_path: Optional[Path] = None,
) -> List[Dict]:
    assets = []
    if research_url.strip():
        url = research_url.strip()
        assets.append(
            {
                "path": url,
                "source_type": "research_url",
                "score": 0.8,
                "summary": f"Research URL provided for context: {url[:160]}",
                "content": url,
            }
        )

    if document_path:
        path = Path(document_path).expanduser()
        if not path.exists():
            raise FileNotFoundError(f"Document path not found: {path}")
        if path.suffix.lower() == ".pdf":
            content = f"PDF document registered: {path.name}. Paste extracted text for deeper summarization."
        else:
            content = read_excerpt(path)
        assets.append(asset_from_text(path.name, content, "document", score=1.0))

    if document_text.strip():
        assets.append(asset_from_text("research-notes", document_text, "research", score=1.0))

    if not assets:
        raise RuntimeError("Add a research URL, document path, or pasted research notes.")
    return assets


def public_assets(assets: List[Dict]) -> List[Dict]:
    return [
        {key: value for key, value in asset.items() if key not in {"content", "absolute_path"}}
        for asset in assets
    ]


def context_prompt(project_name: str, audience: str, assets: List[Dict], channel_names: str) -> str:
    signals = "\n".join(f"- {asset['path']}: {asset['summary']}" for asset in assets)
    return (
        f"You are generating content for {project_name}.\n"
        f"Audience: {audience or 'technical builders and readers'}.\n"
        f"Target channel formats: {channel_names}.\n\n"
        "Unified context signals:\n"
        f"{signals}\n\n"
        "Use only the provided context. Create one section per selected channel. "
        "Keep the output concrete, useful, and easy to edit before publishing."
    )
