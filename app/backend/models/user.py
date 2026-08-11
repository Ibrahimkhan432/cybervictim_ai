"""
User model for authentication and profile management
"""

from datetime import datetime
from sqlalchemy import Column, String, DateTime, Boolean, Text
from .base import Base


class User(Base):
    """
    User account model for authentication
    Stores user credentials and profile information
    """

    __tablename__ = "users"

    id = Column(String(255), primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    name = Column(String(255), nullable=False)
    password_hash = Column(String(255), nullable=False)
    is_active = Column(Boolean, default=True, index=True)
    is_verified = Column(Boolean, default=True)  # For future email verification
    profile_image = Column(String(500), nullable=True)
    bio = Column(Text, nullable=True)
    language_preference = Column(String(10), default="english")  # "urdu" or "english"
    created_at = Column(DateTime, default=datetime.utcnow, index=True)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    last_login_at = Column(DateTime, nullable=True)
    last_login_ip = Column(String(50), nullable=True)


class Conversation(Base):
    """
    Represents a chat conversation/session
    Groups related messages together
    """

    __tablename__ = "conversations"

    id = Column(String(255), primary_key=True, index=True)
    user_id = Column(String(255), index=True, nullable=False)
    title = Column(String(500), nullable=True)  # Auto-generated from first message
    crime_type = Column(String(255), nullable=True)  # Detected crime type
    is_archived = Column(Boolean, default=False, index=True)
    is_favorited = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow, index=True)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    expires_at = Column(DateTime, nullable=True)  # Auto-delete after X days


class ChatMessage(Base):
    """
    Individual messages in a conversation
    Linked to conversations for organization
    """

    __tablename__ = "messages"

    id = Column(String(255), primary_key=True, index=True)
    conversation_id = Column(String(255), index=True, nullable=False)
    user_id = Column(String(255), index=True, nullable=False)
    role = Column(String(20), nullable=False)  # "user" or "assistant"
    content = Column(Text, nullable=False)
    language = Column(String(10), nullable=True)  # "urdu" or "english"
    crime_type = Column(String(255), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, index=True)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
