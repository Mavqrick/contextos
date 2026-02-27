from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text
from database import get_db
from services.embeddings import embed_text
from services.classifier import classify_item
import uuid
import asyncio
from concurrent.futures import ThreadPoolExecutor

router = APIRouter(prefix="/capture", tags=["capture"])
executor = ThreadPoolExecutor(max_workers=2)

class CaptureRequest(BaseModel):
    content: str
    source: str = "manual"
    user_id: str = "00000000-0000-0000-0000-000000000001"

class CaptureResponse(BaseModel):
    id: str
    type: str
    tags: list[str]
    message: str

@router.post("/", response_model=CaptureResponse)
async def capture_item(payload: CaptureRequest, db: AsyncSession = Depends(get_db)):
    
    # Run both classification and embedding concurrently in thread pool
    # This prevents blocking the async event loop
    loop = asyncio.get_event_loop()
    
    classification_future = loop.run_in_executor(executor, classify_item, payload.content)
    embedding_future = loop.run_in_executor(executor, embed_text, payload.content)
    
    # Wait for both to complete
    classification, embedding = await asyncio.gather(classification_future, embedding_future)

    embedding_str = "[" + ",".join(str(x) for x in embedding) + "]"
    item_id = str(uuid.uuid4())

    await db.execute(
        text("""
            INSERT INTO knowledge_items 
            (id, user_id, content, item_type, source, tags, embedding)
            VALUES 
            (:id, CAST(:user_id AS uuid), :content, :item_type, :source, :tags, CAST(:embedding AS vector))
        """),
        {
            "id": item_id,
            "user_id": payload.user_id,
            "content": payload.content,
            "item_type": classification.get("type", "insight"),
            "source": payload.source,
            "tags": classification.get("tags", []),
            "embedding": embedding_str
        }
    )
    await db.commit()

    return CaptureResponse(
        id=item_id,
        type=classification.get("type", "insight"),
        tags=classification.get("tags", []),
        message="Item captured successfully"
    )