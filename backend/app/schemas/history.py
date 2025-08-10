from typing import List, Literal, Optional, Any
from pydantic import BaseModel, Field

EntryType = Literal["search", "image"]

class SaveSearchPayload(BaseModel):
    type: Literal["search"]
    query: str
    results: List[dict] = Field(default_factory=list)

class SaveImagePayload(BaseModel):
    type: Literal["image"]
    prompt: str
    images: List[dict] = Field(default_factory=list)  # [{url, meta?}]

SavePayload = SaveSearchPayload | SaveImagePayload

class EntryOut(BaseModel):
    id: int
    type: EntryType
    title: Optional[str] = None
    snippet: Optional[str] = None
    image_url: Optional[str] = None
    created_at: Any
