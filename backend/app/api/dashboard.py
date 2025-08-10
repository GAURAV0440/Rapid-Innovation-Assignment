# backend/app/api/dashboard.py
import json
from typing import List, Literal, Dict, Any, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.api.deps import get_db, get_current_user
from app.db.models.search_history import SearchHistory
from app.db.models.image_history import ImageHistory

router = APIRouter(prefix="/dashboard", tags=["dashboard"])

# ---------- CLEANUP (declare before /{item_id}) ----------
@router.delete("/cleanup-all", response_model=dict)
def cleanup_untitled(db: Session = Depends(get_db), user = Depends(get_current_user)):
    s_deleted = db.query(SearchHistory)\
        .filter(SearchHistory.user_id == user.id)\
        .filter((SearchHistory.query == "") | (SearchHistory.query.is_(None)))\
        .delete(synchronize_session=False)

    i_deleted = db.query(ImageHistory)\
        .filter(ImageHistory.user_id == user.id)\
        .filter((ImageHistory.prompt == "") | (ImageHistory.prompt.is_(None)))\
        .delete(synchronize_session=False)

    db.commit()
    return {"ok": True, "deleted": {"search": s_deleted, "image": i_deleted}}

# ---------- LIST ----------
@router.get("/", response_model=dict)
def list_entries(
    type: Literal["all", "search", "image"] = Query("all"),
    page: int = Query(1, ge=1),
    q: str = Query("", alias="q"),
    db: Session = Depends(get_db),
    user = Depends(get_current_user),
):
    PAGE_SIZE = 10
    merged: List[dict] = []

    if type in ("all", "search"):
        qs = db.query(SearchHistory).filter(SearchHistory.user_id == user.id)
        if q:
            qs = qs.filter(SearchHistory.query.ilike(f"%{q}%"))
        for row in qs.all():
            snippet = None
            try:
                data = json.loads(row.results_json) if row.results_json else []
                if isinstance(data, list) and data and isinstance(data[0], dict):
                    snippet = data[0].get("title") or data[0].get("summary")
            except Exception:
                pass
            merged.append({
                "id": row.id,
                "type": "search",
                "title": f"Results for: {row.query or 'untitled'}",
                "snippet": snippet,
                "image_url": None,
                "created_at": row.created_at,
            })

    if type in ("all", "image"):
        qi = db.query(ImageHistory).filter(ImageHistory.user_id == user.id)
        if q:
            qi = qi.filter(ImageHistory.prompt.ilike(f"%{q}%"))
        for row in qi.all():
            merged.append({
                "id": row.id,
                "type": "image",
                "title": row.prompt or "untitled",
                "snippet": None,
                "image_url": row.image_url,
                "created_at": row.created_at,
            })

    merged.sort(key=lambda x: x["created_at"], reverse=True)

    PAGE_SIZE = 10
    start = (page - 1) * PAGE_SIZE
    end = start + PAGE_SIZE
    page_items = merged[start:end]
    total_pages = max(1, (len(merged) + PAGE_SIZE - 1) // PAGE_SIZE)

    return {"items": page_items, "page": page, "total_pages": total_pages}

# ---------- DETAIL ----------
@router.get("/{item_id}", response_model=dict)
def get_entry(
    item_id: int,
    type: Literal["search", "image"],
    db: Session = Depends(get_db),
    user = Depends(get_current_user),
):
    if type == "search":
        row = db.query(SearchHistory).filter(
            SearchHistory.id == item_id,
            SearchHistory.user_id == user.id
        ).first()
        if not row:
            raise HTTPException(status_code=404, detail="Not found")
        results = []
        try:
            results = json.loads(row.results_json) if row.results_json else []
        except Exception:
            results = []
        return {
            "id": row.id,
            "type": "search",
            "query": row.query or "",
            "results": results,
            "created_at": row.created_at,
            "title": f"Results for: {row.query or 'untitled'}",
        }

    # image
    row = db.query(ImageHistory).filter(
        ImageHistory.id == item_id,
        ImageHistory.user_id == user.id
    ).first()
    if not row:
        raise HTTPException(status_code=404, detail="Not found")

    images: List[Dict[str, Any]] = []
    try:
        meta = json.loads(row.meta) if row.meta else []
        if isinstance(meta, list):
            images = meta
    except Exception:
        images = []

    # If meta was empty but we have an image_url saved, show at least that.
    if not images and row.image_url:
        images = [{"url": row.image_url}]

    return {
        "id": row.id,
        "type": "image",
        "prompt": row.prompt or "",
        "images": images,
        "created_at": row.created_at,
        "title": row.prompt or "Image",
    }

# ---------- SAVE ----------
@router.post("/", response_model=dict)
def save_entry(payload: dict, db: Session = Depends(get_db), user = Depends(get_current_user)):
    entry_type = payload.get("type")

    if entry_type == "search":
        query = payload.get("query") or payload.get("q") or ""
        results = payload.get("results") or []
        rec = SearchHistory(user_id=user.id, query=query, results_json=json.dumps(results))
        db.add(rec); db.commit(); db.refresh(rec)
        return {"ok": True, "id": rec.id}

    if entry_type == "image":
        prompt = payload.get("prompt") or ""
        images = payload.get("images") or []
        image_url = None
        if images and isinstance(images, list):
            first = images[0] if isinstance(images[0], dict) else {}
            image_url = first.get("url") or first.get("image_url")
        rec = ImageHistory(user_id=user.id, prompt=prompt, image_url=image_url, meta=json.dumps(images))
        db.add(rec); db.commit(); db.refresh(rec)
        return {"ok": True, "id": rec.id}

    raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Unknown type")

# ---------- DELETE BY ID ----------
@router.delete("/{item_id}", response_model=dict)
def delete_entry(item_id: int, type: Literal["search","image"], db: Session = Depends(get_db), user = Depends(get_current_user)):
    if type == "search":
        row = db.query(SearchHistory).filter(SearchHistory.id==item_id, SearchHistory.user_id==user.id).first()
    else:
        row = db.query(ImageHistory).filter(ImageHistory.id==item_id, ImageHistory.user_id==user.id).first()
    if not row:
        raise HTTPException(status_code=404, detail="Not found")
    db.delete(row); db.commit()
    return {"ok": True}
