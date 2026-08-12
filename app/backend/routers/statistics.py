"""
Statistics and Analytics API Router
Provides endpoints for retrieving conversation and engagement statistics

Endpoints are split into:
- PUBLIC: /api/v1/statistics/public/* - Platform-wide stats (no auth required)
- PRIVATE: /api/v1/statistics/* - User-specific stats (auth required)
"""

import logging
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from core.database import get_db
from dependencies.auth import get_current_user
from schemas.auth import UserResponse
from services.statistics_service import StatisticsService

logger = logging.getLogger(__name__)

# Public router (no authentication required)
public_router = APIRouter(prefix="/api/v1/statistics/public", tags=["statistics-public"])

# Private router (authentication required)
router = APIRouter(prefix="/api/v1/statistics", tags=["statistics"])


@router.get("/overview")
async def get_overview_statistics(
    current_user: UserResponse = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get overview statistics for the current user"""
    try:
        stats = await StatisticsService.get_overall_statistics(
            db=db, user_id=current_user.id
        )
        return {
            "success": True,
            "data": stats,
        }
    except Exception as e:
        logger.error(f"Error fetching overview statistics: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch statistics",
        )


@router.get("/crime-types")
async def get_crime_types_distribution(
    current_user: UserResponse = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get crime type distribution"""
    try:
        distribution = await StatisticsService.get_crime_type_distribution(
            db=db, user_id=current_user.id
        )

        # Calculate percentages
        total = sum(item["count"] for item in distribution)
        if total > 0:
            for item in distribution:
                item["percentage"] = round((item["count"] / total) * 100, 2)

        return {
            "success": True,
            "data": distribution,
        }
    except Exception as e:
        logger.error(f"Error fetching crime type distribution: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch crime types distribution",
        )


@router.get("/conversations-timeline")
async def get_conversations_timeline(
    days: int = Query(30, ge=1, le=365),
    current_user: UserResponse = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get conversations created over time (last N days)"""
    try:
        timeline = await StatisticsService.get_conversations_over_time(
            db=db, user_id=current_user.id, days=days
        )
        return {
            "success": True,
            "data": timeline,
        }
    except Exception as e:
        logger.error(f"Error fetching conversations timeline: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch conversations timeline",
        )


@router.get("/messages-distribution")
async def get_messages_distribution(
    current_user: UserResponse = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get distribution of messages by role"""
    try:
        distribution = await StatisticsService.get_messages_distribution(
            db=db, user_id=current_user.id
        )
        return {
            "success": True,
            "data": distribution,
        }
    except Exception as e:
        logger.error(f"Error fetching messages distribution: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch messages distribution",
        )


@router.get("/top-crime-types")
async def get_top_crime_types(
    limit: int = Query(10, ge=1, le=50),
    current_user: UserResponse = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get top crime types by conversation count"""
    try:
        top_types = await StatisticsService.get_top_crime_types(
            db=db, user_id=current_user.id, limit=limit
        )
        return {
            "success": True,
            "data": top_types,
        }
    except Exception as e:
        logger.error(f"Error fetching top crime types: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch top crime types",
        )


@router.get("/recent-conversations")
async def get_recent_conversations(
    limit: int = Query(10, ge=1, le=50),
    current_user: UserResponse = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get details about recent conversations"""
    try:
        conversations = await StatisticsService.get_conversation_details(
            db=db, user_id=current_user.id, limit=limit
        )
        return {
            "success": True,
            "data": conversations,
        }
    except Exception as e:
        logger.error(
            f"Error fetching recent conversations: {str(e)}", exc_info=True
        )
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch recent conversations",
        )


@router.get("/engagement-metrics")
async def get_engagement_metrics(
    current_user: UserResponse = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get user engagement metrics"""
    try:
        metrics = await StatisticsService.get_engagement_metrics(
            db=db, user_id=current_user.id
        )
        return {
            "success": True,
            "data": metrics,
        }
    except Exception as e:
        logger.error(f"Error fetching engagement metrics: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch engagement metrics",
        )


# ============================================================================
# PUBLIC ENDPOINTS - NO AUTHENTICATION REQUIRED
# Returns platform-wide statistics for all users
# ============================================================================


@public_router.get("/overview")
async def get_public_overview_statistics(db: AsyncSession = Depends(get_db)):
    """Get platform-wide overview statistics (public)"""
    try:
        stats = await StatisticsService.get_overall_statistics(
            db=db, is_public=True
        )
        return {
            "success": True,
            "data": stats,
        }
    except Exception as e:
        logger.error(f"Error fetching public overview statistics: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch statistics",
        )


@public_router.get("/crime-types")
async def get_public_crime_types_distribution(db: AsyncSession = Depends(get_db)):
    """Get platform-wide crime type distribution (public)"""
    try:
        distribution = await StatisticsService.get_crime_type_distribution(
            db=db, is_public=True
        )

        # Calculate percentages
        total = sum(item["count"] for item in distribution)
        if total > 0:
            for item in distribution:
                item["percentage"] = round((item["count"] / total) * 100, 2)

        return {
            "success": True,
            "data": distribution,
        }
    except Exception as e:
        logger.error(
            f"Error fetching public crime type distribution: {str(e)}", exc_info=True
        )
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch crime types distribution",
        )


@public_router.get("/conversations-timeline")
async def get_public_conversations_timeline(
    days: int = Query(30, ge=1, le=365),
    db: AsyncSession = Depends(get_db),
):
    """Get platform-wide conversations timeline (public)"""
    try:
        timeline = await StatisticsService.get_conversations_over_time(
            db=db, days=days, is_public=True
        )
        return {
            "success": True,
            "data": timeline,
        }
    except Exception as e:
        logger.error(f"Error fetching public conversations timeline: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch conversations timeline",
        )


@public_router.get("/messages-distribution")
async def get_public_messages_distribution(db: AsyncSession = Depends(get_db)):
    """Get platform-wide messages distribution (public)"""
    try:
        distribution = await StatisticsService.get_messages_distribution(
            db=db, is_public=True
        )
        return {
            "success": True,
            "data": distribution,
        }
    except Exception as e:
        logger.error(
            f"Error fetching public messages distribution: {str(e)}", exc_info=True
        )
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch messages distribution",
        )


@public_router.get("/top-crime-types")
async def get_public_top_crime_types(
    limit: int = Query(10, ge=1, le=50),
    db: AsyncSession = Depends(get_db),
):
    """Get platform-wide top crime types (public)"""
    try:
        top_types = await StatisticsService.get_top_crime_types(
            db=db, limit=limit, is_public=True
        )
        return {
            "success": True,
            "data": top_types,
        }
    except Exception as e:
        logger.error(f"Error fetching public top crime types: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch top crime types",
        )


@public_router.get("/engagement-metrics")
async def get_public_engagement_metrics(db: AsyncSession = Depends(get_db)):
    """Get platform-wide engagement metrics (public)"""
    try:
        metrics = await StatisticsService.get_engagement_metrics(
            db=db, is_public=True
        )
        return {
            "success": True,
            "data": metrics,
        }
    except Exception as e:
        logger.error(f"Error fetching public engagement metrics: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch engagement metrics",
        )
