import base64
import tempfile
from pathlib import Path
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Dict, Any
from signalflow.compositor.image_renderer import ImageRenderer
from signalflow.launchkit import create_launch_kit
from signalflow.orchestrator import run_pipeline

app = FastAPI(title="SignalFlow Model Stub")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class GenerateRequest(BaseModel):
    context: str = ""
    payload: Dict[str, Any] = {}
    target: str = ""


class GenerateResponse(BaseModel):
    text: str


class RenderRequest(BaseModel):
    code: str
    lexer: str = ""


class RenderResponse(BaseModel):
    image_base64: str


class PipelineRequest(BaseModel):
    repo: str
    out_dir: str = "pipeline-output"
    top: int = 5


class LaunchKitRequest(BaseModel):
    repo: str
    out_dir: str = "pipeline-output"
    project_name: str = ""
    audience: str = ""
    top: int = 5


@app.post("/generate_post", response_model=GenerateResponse)
def generate_post(req: GenerateRequest):
    core = req.payload.get("CoreTokens", "")
    snippet = core.strip().replace("\n", " ")[:280]
    text = f"[SignalFlow stub for {req.target}] {snippet}"
    return {"text": text}


@app.post("/generate_presentation")
def generate_presentation(req: GenerateRequest):
    core = req.payload.get("CoreTokens", "")
    md = f"# Presentation\n\n{core[:400]}"
    return {"markdown": md}


@app.post("/render_code", response_model=RenderResponse)
def render_code(req: RenderRequest):
    renderer = ImageRenderer()
    tmp_dir = Path(tempfile.mkdtemp())
    out_path = tmp_dir / "render.png"
    image_file = renderer.render_code(req.code, lexer_name=req.lexer or None, out_path=out_path)
    encoded = base64.b64encode(image_file.read_bytes()).decode("utf-8")
    return {"image_base64": encoded}


@app.post("/run_pipeline")
def pipeline(req: PipelineRequest):
    summary = run_pipeline(Path(req.repo), Path(req.out_dir), req.top)
    return summary


@app.post("/launch_kit")
def launch_kit(req: LaunchKitRequest):
    return create_launch_kit(
        repo=Path(req.repo),
        out_dir=Path(req.out_dir),
        project_name=req.project_name,
        audience=req.audience,
        top_n=req.top,
    )


@app.get("/health")
def health():
    return {"status": "ok"}
