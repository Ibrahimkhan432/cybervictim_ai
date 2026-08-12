"""
Statistics and Analytics Service
Provides comprehensive analytics about user conversations and messages
Supports both public (platform-wide) and private (user-specific) statistics
"""

import logging
from typing import Dict, List, Any, Tuple
from datetime import datetime, timedelta
from sqlalchemy import func, select, desc
from sqlalchemy.ext.asyncio import AsyncSession

from models.conversations import Conversations
from models.messages import Messages
from models.auth import User

logger = logging.getLogger(__name__)


class StatisticsService:
    """Service for retrieving and calculating conversation statistics"""

    @staticmethod
    async def get_overall_statistics(
        db: AsyncSession, user_id: str = None, is_public: bool = False
    ) -> Dict[str, Any]:
        """Get overall statistics (total conversations, messages, etc.)

        Args:
            db: Database session
            user_id: Filter by specific user (None for platform-wide)
            is_public: If True, returns platform-wide stats (ignores user_id)
        """
        try:
            # Build base queries
            conv_query = select(func.count(Conversations.id))
            msg_query = select(func.count(Messages.id))
            user_query = select(func.count(func.distinct(Conversations.user_id)))

            # Apply filters only if not public and user_id provided
            if not is_public and user_id:
                conv_query = conv_query.where(Conversations.user_id == user_id)
                msg_query = msg_query.where(Messages.user_id == user_id)
                user_query = None  # Don't count distinct users for individual user view

            # Execute queries
            total_conversations = await db.scalar(conv_query)
            total_messages = await db.scalar(msg_query)
            total_users = await db.scalar(user_query) if is_public else None

            # Get unique crime types
            crime_types_query = select(func.distinct(Conversations.crime_type)).where(
                Conversations.crime_type.isnot(None)
            )
            if not is_public and user_id:
                crime_types_query = crime_types_query.where(Conversations.user_id == user_id)

            crime_types = await db.scalars(crime_types_query)
            crime_types_list = [ct for ct in crime_types if ct]

            stats = {
                "total_conversations": total_conversations or 0,
                "total_messages": total_messages or 0,
                "unique_crime_types": len(crime_types_list),
                "avg_messages_per_conversation": (
                    round(total_messages / total_conversations, 2)
                    if total_conversations > 0
                    else 0
                ),
            }

            # Add total users for public stats
            if is_public and total_users is not None:
                stats["total_users"] = total_users

            return stats
        except Exception as e:
            logger.error(f"Error getting overall statistics: {str(e)}", exc_info=True)
            raise

    @staticmethod
    async def get_crime_type_distribution(
        db: AsyncSession, user_id: str = None, is_public: bool = False
    ) -> List[Dict[str, Any]]:
        """Get distribution of conversations by crime type

        Args:
            db: Database session
            user_id: Filter by specific user (None for platform-wide)
            is_public: If True, returns platform-wide stats (ignores user_id)
        """
        try:
            query = select(
                Conversations.crime_type,
                func.count(Conversations.id).label("count")
            ).where(Conversations.crime_type.isnot(None))

            if not is_public and user_id:
                query = query.where(Conversations.user_id == user_id)

            query = query.group_by(Conversations.crime_type).order_by(
                desc(func.count(Conversations.id))
            )

            results = await db.execute(query)
            rows = results.all()

            return [
                {
                    "crime_type": row[0] or "Unknown",
                    "count": row[1],
                    "percentage": 0,  # Will be calculated on frontend
                }
                for row in rows
            ]
        except Exception as e:
            logger.error(
                f"Error getting crime type distribution: {str(e)}", exc_info=True
            )
            raise

    @staticmethod
    async def get_conversations_over_time(
        db: AsyncSession, user_id: str = None, days: int = 30, is_public: bool = False
    ) -> List[Dict[str, Any]]:
        """Get conversations created over time (last N days)

        Args:
            db: Database session
            user_id: Filter by specific user (None for platform-wide)
            days: Number of days to look back
            is_public: If True, returns platform-wide stats (ignores user_id)
        """
        try:
            start_date = datetime.utcnow() - timedelta(days=days)

            query = select(
                func.date(Conversations.created_at).label("date"),
                func.count(Conversations.id).label("count")
            ).where(Conversations.created_at >= start_date)

            if not is_public and user_id:
                query = query.where(Conversations.user_id == user_id)

            query = query.group_by(
                func.date(Conversations.created_at)
            ).order_by(func.date(Conversations.created_at))

            results = await db.execute(query)
            rows = results.all()

            return [
                {
                    "date": str(row[0]),
                    "conversations": row[1],
                }
                for row in rows
            ]
        except Exception as e:
            logger.error(
                f"Error getting conversations over time: {str(e)}", exc_info=True
            )
            raise

    @staticmethod
    async def get_messages_distribution(
        db: AsyncSession, user_id: str = None, is_public: bool = False
    ) -> Dict[str, Any]:
        """Get distribution of messages by role (user vs assistant)

        Args:
            db: Database session
            user_id: Filter by specific user (None for platform-wide)
            is_public: If True, returns platform-wide stats (ignores user_id)
        """
        try:
            query = select(
                Messages.role,
                func.count(Messages.id).label("count")
            ).where(Messages.role.in_(["user", "assistant"]))

            if not is_public and user_id:
                query = query.where(Messages.user_id == user_id)

            query = query.group_by(Messages.role)

            results = await db.execute(query)
            rows = results.all()

            distribution = {
                "user": 0,
                "assistant": 0,
            }

            for role, count in rows:
                if role == "user":
                    distribution["user"] = count
                elif role == "assistant":
                    distribution["assistant"] = count

            return distribution
        except Exception as e:
            logger.error(
                f"Error getting messages distribution: {str(e)}", exc_info=True
            )
            raise

    @staticmethod
    async def get_top_crime_types(
        db: AsyncSession, user_id: str = None, limit: int = 10, is_public: bool = False
    ) -> List[Dict[str, Any]]:
        """Get top crime types by conversation count

        Args:
            db: Database session
            user_id: Filter by specific user (None for platform-wide)
            limit: Maximum number of results
            is_public: If True, returns platform-wide stats (ignores user_id)
        """
        try:
            query = select(
                Conversations.crime_type,
                func.count(Conversations.id).label("count")
            ).where(Conversations.crime_type.isnot(None))

            if not is_public and user_id:
                query = query.where(Conversations.user_id == user_id)

            query = query.group_by(Conversations.crime_type).order_by(
                desc(func.count(Conversations.id))
            ).limit(limit)

            results = await db.execute(query)
            rows = results.all()

            return [
                {
                    "name": row[0] or "Unknown",
                    "value": row[1],
                }
                for row in rows
            ]
        except Exception as e:
            logger.error(f"Error getting top crime types: {str(e)}", exc_info=True)
            raise

    @staticmethod
    async def get_conversation_details(
        db: AsyncSession, user_id: str = None, limit: int = 10
    ) -> List[Dict[str, Any]]:
        """Get detailed info about recent conversations"""
        try:
            query = select(
                Conversations.id,
                Conversations.title,
                Conversations.crime_type,
                Conversations.created_at,
                func.count(Messages.id).label("message_count")
            ).outerjoin(
                Messages,
                Conversations.id == Messages.conversation_id
            )

            if user_id:
                query = query.where(Conversations.user_id == user_id)

            query = query.group_by(
                Conversations.id,
                Conversations.title,
                Conversations.crime_type,
                Conversations.created_at
            ).order_by(desc(Conversations.created_at)).limit(limit)

            results = await db.execute(query)
            rows = results.all()

            return [
                {
                    "id": row[0],
                    "title": row[1] or "Untitled",
                    "crime_type": row[2] or "Unknown",
                    "created_at": row[3].isoformat() if row[3] else None,
                    "message_count": row[4] or 0,
                }
                for row in rows
            ]
        except Exception as e:
            logger.error(
                f"Error getting conversation details: {str(e)}", exc_info=True
            )
            raise

    @staticmethod
    async def get_engagement_metrics(
        db: AsyncSession, user_id: str = None, is_public: bool = False
    ) -> Dict[str, Any]:
        """Get user engagement metrics

        Args:
            db: Database session
            user_id: Filter by specific user (None for platform-wide)
            is_public: If True, returns platform-wide stats (ignores user_id)
        """
        try:
            # Get total conversations
            conv_query = select(func.count(Conversations.id))
            if not is_public and user_id:
                conv_query = conv_query.where(Conversations.user_id == user_id)
            total_conversations = await db.scalar(conv_query)

            # Get total messages
            msg_query = select(func.count(Messages.id))
            if not is_public and user_id:
                msg_query = msg_query.where(Messages.user_id == user_id)
            total_messages = await db.scalar(msg_query)

            # Get archived conversations
            archived_query = select(func.count(Conversations.id)).where(
                Conversations.is_archived == True
            )
            if not is_public and user_id:
                archived_query = archived_query.where(Conversations.user_id == user_id)
            archived_conversations = await db.scalar(archived_query)

            # Get favorited conversations
            fav_query = select(func.count(Conversations.id)).where(
                Conversations.is_favorited == True
            )
            if not is_public and user_id:
                fav_query = fav_query.where(Conversations.user_id == user_id)
            favorited_conversations = await db.scalar(fav_query)

            return {
                "total_conversations": total_conversations or 0,
                "total_messages": total_messages or 0,
                "archived_conversations": archived_conversations or 0,
                "favorited_conversations": favorited_conversations or 0,
                "engagement_score": min(
                    100,
                    (total_conversations or 0) * 10 + (total_messages or 0) * 2
                ),
            }
        except Exception as e:
            logger.error(f"Error getting engagement metrics: {str(e)}", exc_info=True)
            raise
