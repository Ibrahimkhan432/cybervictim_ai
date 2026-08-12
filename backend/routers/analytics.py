"""
Public analytics endpoints.

These endpoints intentionally do NOT require authentication — they return
aggregate, non-personal counts used on the marketing/home page.
"""
import logging
from typing import List

from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from core.database import get_db
from models.auth import User
from models.conversations import Conversations
from models.messages import Messages

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/v1/public/analytics", tags=["public-analytics"])


class ContentTypeBreakdown(BaseModel):
    content_type: str
    count: int
    percentage: float


class PublicAnalyticsOverview(BaseModel):
    total_users: int
    total_conversations: int
    total_messages: int
    unique_content_types: int
    content_types: List[ContentTypeBreakdown]


@router.get("/overview", response_model=PublicAnalyticsOverview)
async def get_public_overview(db: AsyncSession = Depends(get_db)):
    """
    Aggregate, anonymous platform stats for the public analytics page.

    Returns totals + a breakdown of conversations by crime_type (content type).
    """
    # Totals
    total_users = (await db.execute(select(func.count(User.id)))).scalar_one() or 0
    total_conversations = (
        await db.execute(select(func.count(Conversations.id)))
    ).scalar_one() or 0
    total_messages = (
        await db.execute(select(func.count(Messages.id)))
    ).scalar_one() or 0

    # Content type breakdown (COALESCE nulls to "unspecified")
    ct_col = func.coalesce(Conversations.crime_type, "unspecified").label("content_type")
    rows = (
        await db.execute(
            select(ct_col, func.count(Conversations.id).label("count"))
            .group_by(ct_col)
            .order_by(func.count(Conversations.id).desc())
        )
    ).all()

    total = sum(r.count for r in rows) or 1  # avoid /0
    content_types = [
        ContentTypeBreakdown(
            content_type=r.content_type,
            count=r.count,
            percentage=round((r.count / total) * 100, 2),
        )
        for r in rows
    ]

    return PublicAnalyticsOverview(
        total_users=total_users,
        total_conversations=total_conversations,
        total_messages=total_messages,
        unique_content_types=len(content_types),
        content_types=content_types,
    )
