from fastapi import FastAPI
from pydantic import BaseModel
from typing import Dict, Any

app = FastAPI(title="SignalFlow Model Stub")


class GenerateRequest(BaseModel):
    context: str = ""
    payload: Dict[str, Any] = {}
    target: str = ""


class GenerateResponse(BaseModel):
    text: str


@app.post("/generate_post", response_model=GenerateResponse)
def generate_post(req: GenerateRequest):
    # Very small deterministic stub: echo first 280 chars with platform hint
    core = req.payload.get("CoreTokens", "")
    snippet = core.strip().replace("\n", " ")[:280]
    text = f"[SignalFlow stub for {req.target}] {snippet}"
    return {"text": text}


@app.post("/generate_presentation")
def generate_presentation(req: GenerateRequest):
    core = req.payload.get("CoreTokens", "")
    md = f"# Presentation\n\n{core[:400]}"
    return {"markdown": md}
