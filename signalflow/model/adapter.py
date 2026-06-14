from abc import ABC, abstractmethod
from typing import Dict, Any
import requests


class ModelAdapter(ABC):
    @abstractmethod
    def initialize(self, config: Dict[str, Any]):
        pass

    @abstractmethod
    def generate_post_text(self, context: str, ingestion_payload: Dict[str, Any], target_platform: str) -> str:
        pass

    @abstractmethod
    def generate_presentation_markdown(self, context: str, ingestion_payload: Dict[str, Any]) -> str:
        pass


class LocalRESTAdapter(ModelAdapter):
    def __init__(self, base_url: str = "http://127.0.0.1:11434"):
        self.base_url = base_url

    def initialize(self, config: Dict[str, Any]):
        self.base_url = config.get("base_url", self.base_url)

    def generate_post_text(self, context: str, ingestion_payload: Dict[str, Any], target_platform: str) -> str:
        url = f"{self.base_url}/generate_post"
        resp = requests.post(url, json={"context": context, "payload": ingestion_payload, "target": target_platform}, timeout=30)
        resp.raise_for_status()
        return resp.json().get("text", "")

    def generate_presentation_markdown(self, context: str, ingestion_payload: Dict[str, Any]) -> str:
        url = f"{self.base_url}/generate_presentation"
        resp = requests.post(url, json={"context": context, "payload": ingestion_payload}, timeout=30)
        resp.raise_for_status()
        return resp.json().get("markdown", "")


class CloudStubAdapter(ModelAdapter):
    def initialize(self, config: Dict[str, Any]):
        pass

    def generate_post_text(self, context: str, ingestion_payload: Dict[str, Any], target_platform: str) -> str:
        # Placeholder stub - in production wire up real cloud SDKs
        return f"[Stubbed post for {target_platform}] {ingestion_payload.get('CoreTokens','')[:280]}"

    def generate_presentation_markdown(self, context: str, ingestion_payload: Dict[str, Any]) -> str:
        return ingestion_payload.get("CoreTokens", "")
