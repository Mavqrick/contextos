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
    # Embed the search query
    query_embedding = embed_text(q)

    # Search using pgvector cosine similarity
    results = await db.execute(
        text("""
            SELECT 
                id::text,
                content,
                item_type,
                tags,
                source,
                1 - (embedding <=> :query_vec::vector) as similarity
            FROM knowledge_items
            WHERE user_id = :user_id
            ORDER BY embedding <=> :query_vec::vector
            LIMIT :limit
        """),
        {
            "query_vec": str(query_embedding),
            "user_id": user_id,
            "limit": limit
        }
    )

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