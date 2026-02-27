from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text
from database import get_db
from services.embeddings import embed_text
from services.classifier import classify_item
import uuid

router = APIRouter(prefix="/capture", tags=["capture"])

class CaptureRequest(BaseModel):
    content: str
    source: str = "manual"
    # For now we use a hardcoded test user
    # We'll add real auth in a later phase
    user_id: str = "00000000-0000-0000-0000-000000000001"

class CaptureResponse(BaseModel):
    id: str
    type: str
    tags: list[str]
    message: str

@router.post("/", response_model=CaptureResponse)
async def capture_item(payload: CaptureRequest, db: AsyncSession = Depends(get_db)):
    # Step 1: Classify the content
    classification = classify_item(payload.content)

    # Step 2: Embed the content
    embedding = embed_text(payload.content)

    # Step 3: Store in database
    item_id = str(uuid.uuid4())
    await db.execute(
        text("""
            INSERT INTO knowledge_items 
            (id, user_id, content, item_type, source, tags, embedding)
            VALUES 
            (:id, :user_id, :content, :item_type, :source, :tags, :embedding)
        """),
        {
            "id": item_id,
            "user_id": payload.user_id,
            "content": payload.content,
            "item_type": classification.get("type", "insight"),
            "source": payload.source,
            "tags": classification.get("tags", []),
            "embedding": str(embedding)
        }
    )
    await db.commit()

    return CaptureResponse(
        id=item_id,
        type=classification.get("type", "insight"),
        tags=classification.get("tags", []),
        message="Item captured successfully"
    )