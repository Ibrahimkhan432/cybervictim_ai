"""Public analytics write endpoints."""

from uuid import uuid4

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field
from sqlalchemy.ext.asyncio import AsyncSession

from core.database import get_db
from models.conversations import Conversations
from models.messages import Messages

router = APIRouter(prefix="/api/v1/public/analytics", tags=["public-analytics"])


class ChildSafetyPrompt(BaseModel):
    prompt: str = Field(min_length=1, max_length=10_000)


@router.post("/child-safety/prompt", status_code=status.HTTP_201_CREATED)
async def record_child_safety_prompt(
    request: ChildSafetyPrompt,
    db: AsyncSession = Depends(get_db),
):
    """Store an anonymous child-safety prompt for aggregate analytics."""
    prompt = request.prompt.strip()
    if not prompt:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Prompt must not be blank",
        )

    anonymous_user_id = f"anonymous-child-safety:{uuid4()}"
    conversation_id = str(uuid4())
    db.add(
        Conversations(
            id=conversation_id,
            title=prompt[:120],
            crime_type="child_safety",
            is_child_safety=True,
            user_id=anonymous_user_id,
        )
    )
    db.add(
        Messages(
            id=str(uuid4()),
            conversation_id=conversation_id,
            role="user",
            content=prompt,
            crime_type="child_safety",
            user_id=anonymous_user_id,
        )
    )
    await db.commit()

    return {"recorded": True}
