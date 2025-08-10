from datetime import datetime
from typing import List, Dict
import httpx
from fastapi import APIRouter, Depends
from pydantic import BaseModel
from app.api.deps import get_current_user
from app.core.config import settings

router = APIRouter(prefix="/search", tags=["search"])

class SearchIn(BaseModel):
    query: str

def _tavily_search(query: str) -> List[Dict]:
    """Call Tavily if API key is present; otherwise raise to fallback."""
    if not settings.TAVILY_API_KEY:
        raise RuntimeError("No Tavily key")
    url = "https://api.tavily.com/search"
    payload = {
        "api_key": settings.TAVILY_API_KEY,
        "query": query,
        "search_depth": "basic",
        "include_answer": True,
        "max_results": 5,
    }
    r = httpx.post(url, json=payload, timeout=20)
    r.raise_for_status()
    data = r.json()
    results = []
    for item in data.get("results", []):
        results.append({
            "title": item.get("title") or item.get("url"),
            "url": item.get("url"),
            "summary": item.get("content") or item.get("snippet")
        })
    # Fallback to answer at top if helpful
    if data.get("answer"):
        results.insert(0, {
            "title": "Summary",
            "url": "",
            "summary": data["answer"]
        })
    return results

@router.post("/", response_model=dict)
def do_search(payload: SearchIn, user = Depends(get_current_user)):
    q = (payload.query or "").strip()
    now = datetime.utcnow().isoformat() + "Z"

    try:
        results = _tavily_search(q)
    except Exception:
        # Safe demo fallback
        results = [
            {"title": f"What is {q}?", "url": "https://example.com/what-is",
             "summary": f"An overview of {q} with key ideas."},
            {"title": f"{q} basics", "url": "https://example.com/basics",
             "summary": f"Basic concepts and quick start guide for {q}."}
        ]

    return {"id": int(datetime.utcnow().timestamp()), "query": q, "results": results, "created_at": now}
