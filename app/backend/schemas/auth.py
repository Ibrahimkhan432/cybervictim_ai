from datetime import datetime
from typing import Optional

from pydantic import BaseModel, EmailStr, Field


class UserResponse(BaseModel):
    id: str  # Now a string UUID (platform sub)
    email: str
    name: Optional[str] = None
    role: str = "user"  # user/admin
    last_login: Optional[datetime] = None
    language_preference: Optional[str] = "english"

    class Config:
        from_attributes = True


class PlatformTokenExchangeRequest(BaseModel):
    """Request body for exchanging Platform token for app token."""

    platform_token: str


class TokenExchangeResponse(BaseModel):
    """Response body for issued application token."""

    token: str


# ============================================================================
# NEW AUTH SCHEMAS FOR PHASE 1
# ============================================================================


class UserCreateRequest(BaseModel):
    """Request to create a new user (signup)"""

    email: EmailStr
    name: str = Field(..., min_length=2, max_length=255)
    password: str = Field(..., min_length=6, max_length=255)
    language_preference: Optional[str] = "english"


class UserLoginRequest(BaseModel):
    """Request to login"""

    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    """JWT token response"""

    access_token: str
    refresh_token: Optional[str] = None
    token_type: str = "bearer"
    expires_in: int  # seconds


class LoginResponse(BaseModel):
    """Response for login endpoint"""

    success: bool
    message: str
    user: UserResponse
    token: TokenResponse


class SignupResponse(BaseModel):
    """Response for signup endpoint"""

    success: bool
    message: str
    user: UserResponse
    token: TokenResponse


class LogoutResponse(BaseModel):
    """Response for logout endpoint"""

    success: bool
    message: str


class UserProfileResponse(BaseModel):
    """Response for user profile endpoint"""

    success: bool
    user: UserResponse


# ============================================================================
# CONVERSATION SCHEMAS
# ============================================================================


class ConversationMessage(BaseModel):
    """Single message in conversation"""

    id: str
    role: str
    content: str
    language: Optional[str] = None
    created_at: datetime


class ConversationResponse(BaseModel):
    """Conversation overview"""

    id: str
    title: Optional[str] = None
    crime_type: Optional[str] = None
    is_favorited: bool
    is_archived: bool
    created_at: datetime
    updated_at: datetime
    message_count: Optional[int] = None

    class Config:
        from_attributes = True


class ConversationDetailResponse(BaseModel):
    """Full conversation with messages"""

    id: str
    title: Optional[str] = None
    crime_type: Optional[str] = None
    is_favorited: bool
    is_archived: bool
    created_at: datetime
    messages: list[ConversationMessage]

    class Config:
        from_attributes = True


class SaveMessageRequest(BaseModel):
    """Request to save a message to conversation"""

    conversation_id: str
    role: str
    content: str
    language: Optional[str] = "english"
    crime_type: Optional[str] = None


class CreateConversationRequest(BaseModel):
    """Request to create new conversation"""

    title: Optional[str] = None
    crime_type: Optional[str] = None


class UpdateConversationRequest(BaseModel):
    """Request to update conversation"""

    title: Optional[str] = None
    is_favorited: Optional[bool] = None
    is_archived: Optional[bool] = None


class ListConversationsResponse(BaseModel):
    """Response for list conversations"""

    success: bool
    conversations: list[ConversationResponse]
    total_count: int


class DeleteConversationResponse(BaseModel):
    """Response for delete conversation"""

    success: bool
    message: str
    deleted_count: int
