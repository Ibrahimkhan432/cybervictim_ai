import logging
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update, delete
from typing import Optional

from core.database import get_db
from dependencies.auth import get_current_user
from schemas.auth import UserResponse

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/v1/cybercrime", tags=["cybercrime"])


class ConversationCreate(BaseModel):
    title: str
    crime_type: Optional[str] = None
    is_child_safety: bool = False


class ConversationResponse(BaseModel):
    id: int
    title: str
    crime_type: Optional[str] = None
    is_child_safety: bool = False


class MessageCreate(BaseModel):
    conversation_id: int
    role: str
    content: str
    crime_type: Optional[str] = None


class MessageResponse(BaseModel):
    id: int
    conversation_id: int
    role: str
    content: str
    crime_type: Optional[str] = None


@router.post("/conversations", response_model=ConversationResponse)
async def create_conversation(
    data: ConversationCreate,
    current_user: UserResponse = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Create a new conversation for the current user."""
    try:
        from models.conversations import Conversations

        conversation = Conversations(
            user_id=current_user.id,
            title=data.title,
            crime_type=data.crime_type,
            is_child_safety=data.is_child_safety,
        )
        db.add(conversation)
        await db.commit()
        await db.refresh(conversation)
        return ConversationResponse(
            id=conversation.id,
            title=conversation.title,
            crime_type=conversation.crime_type,
            is_child_safety=conversation.is_child_safety,
        )
    except Exception as e:
        logger.error(f"Create conversation error: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to create conversation: {str(e)}")


@router.get("/conversations", response_model=list[ConversationResponse])
async def list_conversations(
    current_user: UserResponse = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """List all conversations for the current user."""
    try:
        from models.conversations import Conversations

        result = await db.execute(
            select(Conversations)
            .where(Conversations.user_id == current_user.id)
            .order_by(Conversations.created_at.desc())
        )
        conversations = result.scalars().all()
        return [
            ConversationResponse(
                id=c.id,
                title=c.title,
                crime_type=c.crime_type,
                is_child_safety=c.is_child_safety,
            )
            for c in conversations
        ]
    except Exception as e:
        logger.error(f"List conversations error: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to list conversations: {str(e)}")


@router.get("/conversations/{conversation_id}/messages", response_model=list[MessageResponse])
async def get_messages(
    conversation_id: int,
    current_user: UserResponse = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get all messages for a conversation."""
    try:
        from models.conversations import Conversations
        from models.messages import Messages

        # Verify conversation belongs to user
        conv_result = await db.execute(
            select(Conversations).where(
                Conversations.id == conversation_id,
                Conversations.user_id == current_user.id,
            )
        )
        conversation = conv_result.scalar_one_or_none()
        if not conversation:
            raise HTTPException(status_code=404, detail="Conversation not found")

        result = await db.execute(
            select(Messages)
            .where(Messages.conversation_id == conversation_id)
            .order_by(Messages.created_at.asc())
        )
        messages = result.scalars().all()
        return [
            MessageResponse(
                id=m.id,
                conversation_id=m.conversation_id,
                role=m.role,
                content=m.content,
                crime_type=m.crime_type,
            )
            for m in messages
        ]
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Get messages error: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to get messages: {str(e)}")


@router.post("/conversations/{conversation_id}/messages", response_model=MessageResponse)
async def create_message(
    conversation_id: int,
    data: MessageCreate,
    current_user: UserResponse = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Add a message to a conversation."""
    try:
        from models.conversations import Conversations
        from models.messages import Messages

        # Verify conversation belongs to user
        conv_result = await db.execute(
            select(Conversations).where(
                Conversations.id == conversation_id,
                Conversations.user_id == current_user.id,
            )
        )
        conversation = conv_result.scalar_one_or_none()
        if not conversation:
            raise HTTPException(status_code=404, detail="Conversation not found")

        message = Messages(
            conversation_id=conversation_id,
            role=data.role,
            content=data.content,
            crime_type=data.crime_type,
        )
        db.add(message)
        await db.commit()
        await db.refresh(message)
        return MessageResponse(
            id=message.id,
            conversation_id=message.conversation_id,
            role=message.role,
            content=message.content,
            crime_type=message.crime_type,
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Create message error: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to create message: {str(e)}")


@router.delete("/conversations/{conversation_id}")
async def delete_conversation(
    conversation_id: int,
    current_user: UserResponse = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Delete a conversation and all its messages."""
    try:
        from models.conversations import Conversations
        from models.messages import Messages

        # Verify conversation belongs to user
        conv_result = await db.execute(
            select(Conversations).where(
                Conversations.id == conversation_id,
                Conversations.user_id == current_user.id,
            )
        )
        conversation = conv_result.scalar_one_or_none()
        if not conversation:
            raise HTTPException(status_code=404, detail="Conversation not found")

        # Delete messages first
        await db.execute(
            delete(Messages).where(Messages.conversation_id == conversation_id)
        )
        # Delete conversation
        await db.execute(
            delete(Conversations).where(Conversations.id == conversation_id)
        )
        await db.commit()
        return {"status": "deleted", "conversation_id": conversation_id}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Delete conversation error: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to delete conversation: {str(e)}")