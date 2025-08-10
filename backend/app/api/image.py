# backend/app/api/image.py
from datetime import datetime
from typing import List, Dict, Any
from urllib.parse import quote_plus

import httpx
from fastapi import APIRouter, Depends
from pydantic import BaseModel

from app.api.deps import get_current_user
from app.core.config import settings

router = APIRouter(prefix="/image", tags=["image"])


class ImageIn(BaseModel):
    prompt: str


def _images_from_flux_response(data: Dict[str, Any]) -> List[Dict[str, Any]]:
    out: List[Dict[str, Any]] = []

    imgs = data.get("images")
    if isinstance(imgs, list):
        for item in imgs:
            if isinstance(item, dict):
                url = item.get("url")
                b64 = item.get("b64") or item.get("image")
                if url:
                    out.append({"url": url, "meta": {"provider": "flux"}})
                elif b64:
                    if b64.startswith("data:image"):
                        out.append({"url": b64, "meta": {"provider": "flux"}})
                    else:
                        out.append({"url": f"data:image/png;base64,{b64}", "meta": {"provider": "flux"}})

    if not out and isinstance(data.get("url"), str):
        out.append({"url": data["url"], "meta": {"provider": "flux"}})

    if not out:
        b64 = data.get("image") or data.get("b64")
        if isinstance(b64, str) and b64:
            if b64.startswith("data:image"):
                out.append({"url": b64, "meta": {"provider": "flux"}})
            else:
                out.append({"url": f"data:image/png;base64,{b64}", "meta": {"provider": "flux"}})

    return out


def _try_flux(prompt: str) -> List[Dict[str, Any]]:
    base = (settings.FLUX_MCP_URL or "").rstrip("/")
    if not base:
        return []

    headers = {}
    if getattr(settings, "FLUX_API_KEY", None):
        headers["Authorization"] = f"Bearer {settings.FLUX_API_KEY}"

    payload = {"prompt": prompt}
    candidates = [base, f"{base}/generate", f"{base}/image", f"{base}/text2image"]

    timeout = httpx.Timeout(30.0, connect=10.0)
    for url in candidates:
        try:
            with httpx.Client(timeout=timeout, headers=headers) as client:
                r = client.post(url, json=payload)
                if r.status_code // 100 != 2:
                    continue
                images = _images_from_flux_response(r.json())
                if images:
                    return images
        except Exception:
            continue
    return []


def _pollinations(prompt: str) -> List[Dict[str, Any]]:
    # Free text-to-image; direct <img> URL.
    q = quote_plus(prompt)
    url = f"https://image.pollinations.ai/prompt/{q}?width=832&height=512"
    return [{"url": url, "meta": {"provider": "pollinations", "q": prompt}}]


def _unsplash_fallback(prompt: str) -> List[Dict[str, Any]]:
    q = quote_plus(prompt)
    url = f"https://source.unsplash.com/832x512/?{q}"
    return [{"url": url, "meta": {"provider": "unsplash", "q": prompt}}]


def _picsum_fallback(prompt: str) -> List[Dict[str, Any]]:
    seed = quote_plus(prompt)[:50]
    url = f"https://picsum.photos/seed/{seed}/832/512"
    return [{"url": url, "meta": {"provider": "picsum", "q": prompt}}]


@router.post("/", response_model=dict)
def generate_image(payload: ImageIn, user=Depends(get_current_user)):
    """
    Order:
    1) Flux MCP (if configured)
    2) Pollinations (free)
    3) Unsplash keyword fallback
    4) Picsum seeded fallback (always returns an image)
    """
    prompt = (payload.prompt or "").strip() or "abstract art"
    now = datetime.utcnow().isoformat() + "Z"

    images = _try_flux(prompt) or _pollinations(prompt) or _unsplash_fallback(prompt) or _picsum_fallback(prompt)

    return {
        "id": int(datetime.utcnow().timestamp()),
        "prompt": prompt,
        "images": images,
        "created_at": now,
    }
