from sqlalchemy import Column, String, Text, ARRAY, DateTime, func
from sqlalchemy.dialects.postgresql import UUID, JSONB
from pgvector.sqlalchemy import Vector
from database import Base
import uuid

class KnowledgeItem(Base):
    __tablename__ = "knowledge_items"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), nullable=False)
    content = Column(Text, nullable=False)
    item_type = Column(String, nullable=False)
    source = Column(String, default="manual")
    tags = Column(ARRAY(String), default=[])
    embedding = Column(Vector(384))
    metadata = Column(JSONB, default={})
    created_at = Column(DateTime(timezone=True), server_default=func.now())
