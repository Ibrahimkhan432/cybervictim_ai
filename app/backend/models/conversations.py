from core.database import Base
from datetime import datetime
from sqlalchemy import Boolean, Column, DateTime, Integer, String


class Conversations(Base):
    __tablename__ = "conversations"
    __table_args__ = {"extend_existing": True}

    id = Column(String(255), primary_key=True, index=True, nullable=False)
    title = Column(String, nullable=False)
    crime_type = Column(String, nullable=True)
    is_child_safety = Column(Boolean, nullable=True, default=False, server_default='false')
    is_favorited = Column(Boolean, default=False, nullable=False)
    is_archived = Column(Boolean, default=False, nullable=False)
    user_id = Column(String, nullable=False)
    created_at = Column(DateTime(timezone=True), default=datetime.now)
    updated_at = Column(DateTime(timezone=True), default=datetime.now, onupdate=datetime.now)