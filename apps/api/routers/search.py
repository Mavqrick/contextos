from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text
from database import get_db
from services.embeddings import embed_text
from pydantic import BaseModel

router = APIRouter(prefix="/search", tags=["search"])

class SearchResult(BaseModel):
    id: str
    content: str
    item_type: str
    tags: list[str]
    source: str
    similarity: float

@router.get("/", response_model=list[SearchResult])
async def search_knowledge(
    q: str = Query(..., description="Search query"),
    user_id: str = Query(default="00000000-0000-0000-0000-000000000001"),
    limit: int = Query(default=5, le=20),
    db: AsyncSession = Depends(get_db)
):
    query_embedding = embed_text(q)
    # Format as postgres vector literal
    embedding_str = "[" + ",".join(str(x) for x in query_embedding) + "]"

    # Use literal query string with embedding inlined directly
    # This avoids asyncpg parameter casting issues with vector type
    sql = f"""
        SELECT 
            id::text,
            content,
            item_type,
            tags,
            source,
            1 - (embedding <=> '{embedding_str}'::vector) as similarity
        FROM knowledge_items
        WHERE user_id = '{user_id}'::uuid
        ORDER BY embedding <=> '{embedding_str}'::vector
        LIMIT {limit}
    """

    results = await db.execute(text(sql))
    rows = results.fetchall()

    return [
        SearchResult(
            id=row.id,
            content=row.content,
            item_type=row.item_type,
            tags=row.tags or [],
            source=row.source or "manual",
            similarity=round(float(row.similarity), 4)
        )
        for row in rows
    ]