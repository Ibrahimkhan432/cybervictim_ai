"""
Service for managing conversations and chat history
"""

import logging
import uuid
from datetime import datetime
from typing import List, Optional, Tuple
from sqlalchemy import desc, select
from sqlalchemy.ext.asyncio import AsyncSession

from models.conversations import Conversations as Conversation
from models.messages import Messages as ChatMessage

logger = logging.getLogger(__name__)


class ConversationService:
    """Service for conversation and message management"""

    @staticmethod
    async def create_conversation(
        db: AsyncSession,
        user_id: str,
        title: Optional[str] = None,
        crime_type: Optional[str] = None,
    ) -> Conversation:
        """Create a new conversation"""
        try:
            conversation = Conversation(
                id=f"conv_{uuid.uuid4().hex[:12]}",
                user_id=user_id,
                title=title,
                crime_type=crime_type,
                created_at=datetime.now(),
                updated_at=datetime.now(),
            )

            db.add(conversation)
            await db.commit()
            await db.refresh(conversation)

            logger.info(f"Conversation created: {conversation.id} for user {user_id}")
            return conversation

        except Exception as e:
            await db.rollback()
            logger.error(f"Error creating conversation: {str(e)}")
            raise

    @staticmethod
    async def get_conversation(
        db: AsyncSession, conversation_id: str, user_id: str
    ) -> Optional[Conversation]:
        """Get conversation by ID (verify ownership)"""
        result = await db.execute(
            select(Conversation).where(
                Conversation.id == conversation_id,
                Conversation.user_id == user_id
            )
        )
        return result.scalar_one_or_none()

    @staticmethod
    async def list_conversations(
        db: AsyncSession,
        user_id: str,
        archived: bool = False,
        limit: int = 50,
        offset: int = 0,
    ) -> Tuple[List[Conversation], int]:
        """List user's conversations"""
        try:
            # Count query
            count_result = await db.execute(
                select(Conversation).where(
                    Conversation.user_id == user_id,
                    Conversation.is_archived == archived,
                )
            )
            total_count = len(count_result.fetchall())

            # Fetch conversations
            query = select(Conversation).where(
                Conversation.user_id == user_id,
                Conversation.is_archived == archived,
            ).order_by(desc(Conversation.updated_at)).limit(limit).offset(offset)

            result = await db.execute(query)
            conversations = result.scalars().all()

            return conversations, total_count

        except Exception as e:
            logger.error(f"Error listing conversations: {str(e)}")
            raise

    @staticmethod
    async def update_conversation(
        db: AsyncSession,
        conversation_id: str,
        user_id: str,
        title: Optional[str] = None,
        is_favorited: Optional[bool] = None,
        is_archived: Optional[bool] = None,
    ) -> Optional[Conversation]:
        """Update conversation"""
        try:
            conversation = await ConversationService.get_conversation(
                db, conversation_id, user_id
            )

            if not conversation:
                return None

            if title is not None:
                conversation.title = title
            if is_favorited is not None:
                conversation.is_favorited = is_favorited
            if is_archived is not None:
                conversation.is_archived = is_archived

            conversation.updated_at = datetime.now()
            await db.commit()
            await db.refresh(conversation)

            logger.info(f"Conversation updated: {conversation.id}")
            return conversation

        except Exception as e:
            await db.rollback()
            logger.error(f"Error updating conversation: {str(e)}")
            raise

    @staticmethod
    async def delete_conversation(
        db: AsyncSession,
        conversation_id: str,
        user_id: str,
    ) -> bool:
        """Delete conversation"""
        try:
            conversation = await ConversationService.get_conversation(
                db, conversation_id, user_id
            )

            if not conversation:
                return False

            await db.delete(conversation)
            await db.commit()

            logger.info(f"Conversation deleted: {conversation_id}")
            return True

        except Exception as e:
            await db.rollback()
            logger.error(f"Error deleting conversation: {str(e)}")
            raise

    @staticmethod
    async def save_message(
        db: AsyncSession,
        conversation_id: str,
        user_id: str,
        role: str,
        content: str,
        language: Optional[str] = None,
        crime_type: Optional[str] = None,
    ) -> ChatMessage:
        """Save a message to a conversation"""
        try:
            # Verify conversation exists and belongs to user
            conversation = await ConversationService.get_conversation(
                db, conversation_id, user_id
            )

            if not conversation:
                raise ValueError("Conversation not found or access denied")

            message = ChatMessage(
                id=f"msg_{uuid.uuid4().hex[:12]}",
                conversation_id=conversation.id,
                user_id=user_id,
                role=role,
                content=content,
                language=language,
                crime_type=crime_type,
                created_at=datetime.now(),
            )

            db.add(message)
            await db.commit()
            await db.refresh(message)

            logger.info(f"Message saved: {message.id} to conversation {conversation_id}")
            return message

        except Exception as e:
            await db.rollback()
            logger.error(f"Error saving message: {str(e)}")
            raise

    @staticmethod
    async def get_conversation_messages(
        db: AsyncSession,
        conversation_id: str,
        limit: int = 100,
        offset: int = 0,
    ) -> List[ChatMessage]:
        """Get all messages in a conversation"""
        try:
            result = await db.execute(
                select(ChatMessage).where(
                    ChatMessage.conversation_id == conversation_id
                ).order_by(ChatMessage.created_at).limit(limit).offset(offset)
            )
            return result.scalars().all()

        except Exception as e:
            logger.error(f"Error retrieving messages: {str(e)}")
            raise

    @staticmethod
    async def delete_message(
        db: AsyncSession,
        message_id: str,
        user_id: str,
    ) -> bool:
        """Delete a message"""
        try:
            result = await db.execute(
                select(ChatMessage).where(ChatMessage.id == message_id)
            )
            message = result.scalar_one_or_none()

            if not message or message.user_id != user_id:
                return False

            await db.delete(message)
            await db.commit()

            logger.info(f"Message deleted: {message_id}")
            return True

        except Exception as e:
            await db.rollback()
            logger.error(f"Error deleting message: {str(e)}")
            raise

    @staticmethod
    async def get_conversation_with_messages(
        db: AsyncSession,
        conversation_id: str,
        user_id: str,
    ) -> Optional[dict]:
        """Get conversation with all messages"""
        try:
            conversation = await ConversationService.get_conversation(
                db, conversation_id, user_id
            )

            if not conversation:
                return None

            messages = await ConversationService.get_conversation_messages(
                db, conversation_id
            )

            return {
                "id": conversation.id,
                "title": conversation.title,
                "crime_type": conversation.crime_type,
                "created_at": conversation.created_at.isoformat() if conversation.created_at else None,
                "updated_at": conversation.updated_at.isoformat() if conversation.updated_at else None,
                "messages": [
                    {
                        "id": msg.id,
                        "role": msg.role,
                        "content": msg.content,
                        "created_at": msg.created_at.isoformat() if msg.created_at else None,
                    }
                    for msg in messages
                ],
            }

        except Exception as e:
            logger.error(f"Error retrieving conversation with messages: {str(e)}")
            raise
