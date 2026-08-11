from core.database import Base
from datetime import datetime
from sqlalchemy import Column, DateTime, Integer, String


class Messages(Base):
    __tablename__ = "messages"
    __table_args__ = {"extend_existing": True}

    id = Column(String(255), primary_key=True, index=True, nullable=False)
    conversation_id = Column(String(255), nullable=False)
    role = Column(String, nullable=False)
    content = Column(String, nullable=False)
    language = Column(String, nullable=True)
    crime_type = Column(String, nullable=True)
    user_id = Column(String, nullable=False)
    created_at = Column(DateTime(timezone=True), default=datetime.now)
    updated_at = Column(DateTime(timezone=True), default=datetime.now, onupdate=datetime.now)