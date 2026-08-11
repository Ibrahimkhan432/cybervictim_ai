"""
Authentication service for user management and JWT tokens
Handles login, signup, password hashing, and token generation
"""

import logging
import uuid
from datetime import datetime, timedelta, timezone
from typing import Optional, Tuple
import jwt
from passlib.context import CryptContext
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from core.config import settings
from models.auth import User
from schemas.auth import UserCreateRequest, UserLoginRequest

logger = logging.getLogger(__name__)

# Password hashing - using argon2 instead of bcrypt due to compatibility issues
pwd_context = CryptContext(schemes=["argon2"], deprecated="auto")

# JWT configuration
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24  # 24 hours
REFRESH_TOKEN_EXPIRE_DAYS = 7


class AuthService:
    """Service for user authentication and token management"""

    @staticmethod
    def hash_password(password: str) -> str:
        """Hash password using bcrypt"""
        return pwd_context.hash(password)

    @staticmethod
    def verify_password(plain_password: str, hashed_password: str) -> bool:
        """Verify password against hash"""
        return pwd_context.verify(plain_password, hashed_password)

    @staticmethod
    def create_access_token(user_id: str, email: str) -> Tuple[str, int]:
        """Create JWT access token"""
        now = datetime.utcnow()
        expire = now + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)

        payload = {
            "sub": user_id,
            "email": email,
            "iat": int(now.timestamp()),
            "exp": int(expire.timestamp()),
        }

        token = jwt.encode(payload, settings.jwt_secret_key, algorithm=ALGORITHM)
        expires_in = int((expire - now).total_seconds())

        return token, expires_in

    @staticmethod
    def create_refresh_token(user_id: str, email: str) -> str:
        """Create JWT refresh token"""
        now = datetime.utcnow()
        expire = now + timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS)

        payload = {
            "sub": user_id,
            "email": email,
            "type": "refresh",
            "iat": int(now.timestamp()),
            "exp": int(expire.timestamp()),
        }

        token = jwt.encode(payload, settings.jwt_secret_key, algorithm=ALGORITHM)
        return token

    @staticmethod
    def verify_token(token: str) -> Optional[dict]:
        """Verify and decode JWT token"""
        try:
            payload = jwt.decode(token, settings.jwt_secret_key, algorithms=[ALGORITHM])
            return payload
        except jwt.ExpiredSignatureError:
            logger.warning("Token expired")
            return None
        except jwt.InvalidTokenError:
            logger.warning("Invalid token")
            return None

    @staticmethod
    async def register_user(
        db: AsyncSession, request: UserCreateRequest
    ) -> Tuple[User, str, int]:
        """
        Register a new user
        Returns: (user, access_token, expires_in)
        """
        try:
            # Check if user exists
            result = await db.execute(select(User).where(User.email == request.email.lower()))
            existing_user = result.scalar_one_or_none()
            if existing_user:
                raise ValueError("Email already registered")

            # Create new user
            user_id = f"user_{uuid.uuid4().hex[:12]}"
            user = User(
                id=user_id,
                email=request.email.lower(),
                name=request.name,
                password_hash=AuthService.hash_password(request.password),
                language_preference=request.language_preference or "english",
                is_active=True,
            )

            db.add(user)
            await db.commit()
            await db.refresh(user)

            logger.info(f"User registered: {user.email}")

            # Create tokens
            access_token, expires_in = AuthService.create_access_token(user.id, user.email)

            return user, access_token, expires_in

        except Exception as e:
            await db.rollback()
            logger.error(f"Error registering user: {str(e)}")
            raise

    @staticmethod
    async def login_user(
        db: AsyncSession, request: UserLoginRequest
    ) -> Tuple[User, str, int]:
        """
        Login user
        Returns: (user, access_token, expires_in)
        """
        try:
            # Find user by email
            result = await db.execute(select(User).where(User.email == request.email.lower()))
            user = result.scalar_one_or_none()
            if not user:
                raise ValueError("Invalid email or password")

            # Verify password
            if not AuthService.verify_password(request.password, user.password_hash):
                raise ValueError("Invalid email or password")

            # Check if user is active
            if not user.is_active:
                raise ValueError("User account is inactive")

            # Update last login
            user.last_login_at = datetime.now(timezone.utc)
            await db.commit()
            await db.refresh(user)

            logger.info(f"User logged in: {user.email}")

            # Create tokens
            access_token, expires_in = AuthService.create_access_token(user.id, user.email)

            return user, access_token, expires_in

        except Exception as e:
            logger.error(f"Error logging in user: {str(e)}")
            raise

    @staticmethod
    async def get_user_by_id(db: AsyncSession, user_id: str) -> Optional[User]:
        """Get user by ID"""
        result = await db.execute(select(User).where(User.id == user_id))
        return result.scalar_one_or_none()

    @staticmethod
    async def get_user_by_email(db: AsyncSession, email: str) -> Optional[User]:
        """Get user by email"""
        result = await db.execute(select(User).where(User.email == email.lower()))
        return result.scalar_one_or_none()

    @staticmethod
    async def update_user_profile(
        db: AsyncSession, user_id: str, name: Optional[str] = None,
        language_preference: Optional[str] = None
    ) -> Optional[User]:
        """Update user profile"""
        try:
            user = await AuthService.get_user_by_id(db, user_id)
            if not user:
                return None

            if name:
                user.name = name
            if language_preference:
                user.language_preference = language_preference

            await db.commit()
            await db.refresh(user)

            logger.info(f"User profile updated: {user.email}")
            return user

        except Exception as e:
            await db.rollback()
            logger.error(f"Error updating user profile: {str(e)}")
            raise

    @staticmethod
    async def change_password(
        db: AsyncSession, user_id: str, old_password: str, new_password: str
    ) -> bool:
        """Change user password"""
        try:
            user = await AuthService.get_user_by_id(db, user_id)
            if not user:
                raise ValueError("User not found")

            # Verify old password
            if not AuthService.verify_password(old_password, user.password_hash):
                raise ValueError("Invalid current password")

            # Set new password
            user.password_hash = AuthService.hash_password(new_password)
            await db.commit()
            await db.refresh(user)

            logger.info(f"Password changed for user: {user.email}")
            return True

        except Exception as e:
            await db.rollback()
            logger.error(f"Error changing password: {str(e)}")
            raise
