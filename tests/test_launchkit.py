from pathlib import Path

from signalflow.launchkit import create_launch_kit, create_notes_kit, create_research_kit


def test_create_launch_kit(tmp_path):
    repo = tmp_path / "repo"
    repo.mkdir()
    source = repo / "app.py"
    source.write_text(
        "def launch():\n"
        "    message = 'ship useful open source work'\n"
        "    return message\n",
        encoding="utf-8",
    )

    result = create_launch_kit(
        repo=repo,
        out_dir=tmp_path / "out",
        project_name="Demo Project",
        audience="maintainers",
        channels=["linkedin", "newsletter"],
        top_n=1,
    )

    assert result["project_name"] == "Demo Project"
    assert result["highlights"][0]["path"] == "app.py"
    assert "linkedin" in result["posts"]
    assert "newsletter" in result["posts"]
    assert "x" not in result["posts"]
    assert Path(result["assets"]["code_image"]).exists()
    assert Path(result["assets"]["markdown"]).exists()
    assert Path(result["assets"]["summary"]).exists()
    assert result["image_base64"]


def test_create_notes_kit(tmp_path):
    result = create_notes_kit(
        notes=(
            "Shipped a local-first publishing workflow.\n"
            "It turns notes and changelogs into LinkedIn, X, blog, newsletter, and release drafts."
        ),
        out_dir=tmp_path / "out",
        project_name="Demo Notes",
        audience="builders",
        channels=["x"],
    )

    assert result["repo"] == "raw-brief"
    assert result["highlights"][0]["path"] == "raw-brief"
    assert list(result["posts"].keys()) == ["x"]
    assert result["chatbot_prompt"]
    assert Path(result["assets"]["markdown"]).exists()


def test_create_research_kit(tmp_path):
    result = create_research_kit(
        research_url="https://example.com/research",
        document_text="Research note about a technical workflow and content orchestration.",
        out_dir=tmp_path / "out",
        project_name="Research Demo",
        audience="technical readers",
        channels=["blog", "release_notes"],
        generator="slm",
    )

    assert result["repo"] == "research"
    assert result["context_engine"]["input_count"] == 2
    assert result["model_adapter"]["route"] == "slm"
    assert list(result["posts"].keys()) == ["blog", "release_notes"]
