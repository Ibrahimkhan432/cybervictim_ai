"""
AI Hub Service module.
Implements AIHubService that wraps any OpenAI-compatible AI provider (e.g. Groq).
Uses httpx directly to avoid any openai SDK version issues.
"""

import asyncio
import json
import logging
import time
from typing import AsyncGenerator, Optional

import httpx

from core.config import settings
from schemas.aihub import (
    AnalyzePdfRequest,
    AnalyzePdfResponse,
    GenAudioRequest,
    GenAudioResponse,
    GenImgRequest,
    GenImgResponse,
    GenTxtRequest,
    GenTxtResponse,
    GenVideoRequest,
    GenVideoResponse,
    TranscribeAudioRequest,
    TranscribeAudioResponse,
)

logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Shared HTTP client
#
# A fresh httpx.AsyncClient() used to be created (and torn down) on every
# single request. Each one pays for a brand-new TCP handshake + TLS
# negotiation to the AI provider before the first token can even be
# requested — pure latency, repeated on every chat message. Reusing one
# process-wide client lets httpx keep the connection alive (HTTP keep-alive)
# between requests, which is the single biggest lever for consistent
# response times on a host with variable network conditions (e.g. Render
# free tier).
#
# Timeouts are split by phase instead of one flat value applied to
# connect+read+write+pool alike: connect/write/pool fail fast (a hung TCP
# handshake shouldn't cost the user 60-120s before anything happens), while
# read stays generous enough for the provider to actually generate.
# ---------------------------------------------------------------------------
_AI_TIMEOUT = httpx.Timeout(connect=10.0, read=60.0, write=10.0, pool=10.0)
_AI_LIMITS = httpx.Limits(max_connections=20, max_keepalive_connections=10, keepalive_expiry=30.0)

_shared_client: Optional[httpx.AsyncClient] = None
_shared_client_lock = asyncio.Lock()


async def _get_shared_client() -> httpx.AsyncClient:
    """Return the process-wide reusable httpx.AsyncClient, creating it lazily."""
    global _shared_client
    if _shared_client is None or _shared_client.is_closed:
        async with _shared_client_lock:
            if _shared_client is None or _shared_client.is_closed:
                _shared_client = httpx.AsyncClient(timeout=_AI_TIMEOUT, limits=_AI_LIMITS)
    return _shared_client


async def close_http_client() -> None:
    """Close the shared client. Call this from the app's shutdown/lifespan handler."""
    global _shared_client
    if _shared_client is not None and not _shared_client.is_closed:
        await _shared_client.aclose()
    _shared_client = None


class InvalidImageInputError(Exception):
    """Raised when an invalid image input is provided."""
    pass


class InvalidAudioInputError(Exception):
    """Raised when an invalid audio input is provided."""
    pass


class InvalidPdfInputError(Exception):
    """Raised when an invalid PDF input is provided."""
    pass


class AIHubService:
    """Service class that wraps any OpenAI-compatible AI provider via httpx."""

    def __init__(self):
        self.base_url = (settings.app_ai_base_url or "").rstrip("/")
        self.api_key = settings.app_ai_key
        self.model = getattr(settings, "app_ai_text_model", None) or "llama-3.3-70b-versatile"

        if not self.api_key:
            raise ValueError(
                "AI provider API key is not configured. "
                "Please set APP_AI_KEY in your .env file."
            )
        if not self.base_url:
            raise ValueError(
                "AI provider base URL is not configured. "
                "Please set APP_AI_BASE_URL in your .env file."
            )

        self._headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json",
        }
        logger.debug(f"AIHubService initialized: base_url={self.base_url}, model={self.model}")

    def _resolve_model(self, requested_model: Optional[str]) -> str:
        """Prefer the server-configured model; fall back to the requested one."""
        return self.model or requested_model or "llama-3.3-70b-versatile"

    def _build_messages(self, request: GenTxtRequest) -> list:
        """Convert GenTxtRequest messages to the OpenAI-compatible format."""
        messages = []
        for msg in request.messages:
            if isinstance(msg.content, str):
                messages.append({"role": msg.role, "content": msg.content})
            else:
                parts = []
                for part in msg.content:
                    if part.type == "text":
                        parts.append({"type": "text", "text": part.text})
                    elif part.type == "image_url":
                        parts.append({
                            "type": "image_url",
                            "image_url": {"url": part.image_url.url},
                        })
                messages.append({"role": msg.role, "content": parts})
        return messages

    async def gentxt(self, request: GenTxtRequest) -> GenTxtResponse:
        """Generate text (non-streaming) using chat completions."""
        model = self._resolve_model(request.model)
        messages = self._build_messages(request)
        payload = {
            "model": model,
            "messages": messages,
            "temperature": request.temperature,
            "max_tokens": request.max_tokens,
            "stream": False,
        }

        logger.debug(f"gentxt: model={model}, messages={len(messages)}")

        t0 = time.monotonic()
        client = await _get_shared_client()
        response = await client.post(
            f"{self.base_url}/chat/completions",
            headers=self._headers,
            json=payload,
        )
        response.raise_for_status()
        data = response.json()
        logger.info(f"[TIMING] gentxt provider call: {time.monotonic() - t0:.3f}s")

        content = data["choices"][0]["message"]["content"] or ""
        usage = data.get("usage")

        return GenTxtResponse(content=content, model=model, usage=usage)

    async def gentxt_stream(self, request: GenTxtRequest) -> AsyncGenerator[str, None]:
        """Generate text with streaming. Yields content chunks."""
        model = self._resolve_model(request.model)
        messages = self._build_messages(request)
        payload = {
            "model": model,
            "messages": messages,
            "temperature": request.temperature,
            "max_tokens": request.max_tokens,
            "stream": True,
        }

        logger.debug(f"gentxt_stream: model={model}, messages={len(messages)}")

        t0 = time.monotonic()
        first_chunk_at: Optional[float] = None
        client = await _get_shared_client()
        async with client.stream(
            "POST",
            f"{self.base_url}/chat/completions",
            headers=self._headers,
            json=payload,
        ) as response:
            response.raise_for_status()
            logger.info(f"[TIMING] provider connection established: {time.monotonic() - t0:.3f}s")
            async for line in response.aiter_lines():
                line = line.strip()
                if not line or line == "data: [DONE]":
                    continue
                if line.startswith("data: "):
                    line = line[6:]
                try:
                    chunk = json.loads(line)
                    delta = chunk.get("choices", [{}])[0].get("delta", {})
                    content = delta.get("content")
                    if content:
                        if first_chunk_at is None:
                            first_chunk_at = time.monotonic()
                            logger.info(f"[TIMING] provider time-to-first-token: {first_chunk_at - t0:.3f}s")
                        yield content
                except (json.JSONDecodeError, IndexError, KeyError):
                    continue
        logger.info(f"[TIMING] provider stream total: {time.monotonic() - t0:.3f}s")

    async def genimg(self, request: GenImgRequest) -> GenImgResponse:
        raise NotImplementedError(
            "Image generation requires a compatible provider (e.g., OpenAI DALL-E). "
            "Configure APP_AI_BASE_URL to an image-generation endpoint."
        )

    async def genvideo(self, request: GenVideoRequest) -> GenVideoResponse:
        raise NotImplementedError(
            "Video generation requires a compatible provider. "
            "Configure APP_AI_BASE_URL to a video-generation endpoint."
        )

    async def genaudio(self, request: GenAudioRequest) -> GenAudioResponse:
        raise NotImplementedError(
            "Audio (TTS) generation requires a compatible provider. "
            "Configure APP_AI_BASE_URL to a TTS endpoint."
        )

    async def transcribe(self, request: TranscribeAudioRequest) -> TranscribeAudioResponse:
        raise NotImplementedError(
            "Audio transcription requires a compatible provider. "
            "Configure APP_AI_BASE_URL to an STT endpoint."
        )

    async def analyze_pdf(self, request: AnalyzePdfRequest) -> AnalyzePdfResponse:
        raise NotImplementedError(
            "PDF analysis requires a compatible vision/PDF provider. "
            "Configure APP_AI_BASE_URL to a vision-capable endpoint."
        )