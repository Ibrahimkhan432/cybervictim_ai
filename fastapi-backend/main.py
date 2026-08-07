"""
Cybercrime Guidance Agentic AI - FastAPI Backend
A standalone FastAPI + LangChain + ChromaDB backend for cybercrime victim guidance.
This is a separate deliverable from the Atoms Cloud web application.

Run: uvicorn main:app --reload
"""

from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer
from pydantic import BaseModel
from typing import Optional
from datetime import datetime, timedelta
from jose import JWTError, jwt
import sqlite3
import json
import os

from chat_engine import CybercrimeChatEngine
from knowledge_base import (
    CRIME_TYPES,
    EVIDENCE_CHECKLISTS,
    PECA_SECTIONS,
    AUTHORITY_REFERRALS,
    SYSTEM_PROMPT,
    CHILD_SAFETY_PROMPT,
)

# ============================================================
# Configuration
# ============================================================

SECRET_KEY = os.environ.get("SECRET_KEY", "cybershield-dev-secret-key-change-in-production")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24  # 24 hours

app = FastAPI(
    title="CyberShield AI - Cybercrime Guidance Backend",
    description="FastAPI + LangChain + ChromaDB backend for cybercrime victim guidance in Pakistan",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login")

# Initialize SQLite database
DB_PATH = os.environ.get("DB_PATH", "cybershield.db")


def get_db_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def init_db():
    conn = get_db_connection()
    conn.executescript("""
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            email TEXT UNIQUE NOT NULL,
            name TEXT,
            hashed_password TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS conversations (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            title TEXT NOT NULL,
            crime_type TEXT,
            is_child_safety BOOLEAN DEFAULT 0,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id)
        );

        CREATE TABLE IF NOT EXISTS messages (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            conversation_id INTEGER NOT NULL,
            role TEXT NOT NULL,
            content TEXT NOT NULL,
            crime_type TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE
        );
    """)
    conn.commit()
    conn.close()


init_db()

# Initialize chat engine
chat_engine = CybercrimeChatEngine()


# ============================================================
# Pydantic Models
# ============================================================

class UserRegister(BaseModel):
    email: str
    name: Optional[str] = None
    password: str


class UserLogin(BaseModel):
    email: str
    password: str


class UserResponse(BaseModel):
    id: int
    email: str
    name: Optional[str] = None


class Token(BaseModel):
    access_token: str
    token_type: str


class ConversationCreate(BaseModel):
    title: str
    crime_type: Optional[str] = None
    is_child_safety: bool = False


class ConversationResponse(BaseModel):
    id: int
    title: str
    crime_type: Optional[str] = None
    is_child_safety: bool = False
    created_at: Optional[str] = None


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
    created_at: Optional[str] = None


class ChatRequest(BaseModel):
    message: str
    conversation_id: Optional[int] = None
    crime_type: Optional[str] = None


class ChatResponse(BaseModel):
    reply: str
    crime_type: Optional[str] = None
    conversation_id: Optional[int] = None
    evidence_checklist: Optional[list] = None
    peca_sections: Optional[list] = None
    authority_referrals: Optional[dict] = None


# ============================================================
# Auth Helpers
# ============================================================

def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)


def verify_token(token: str) -> dict:
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None:
            raise HTTPException(status_code=401, detail="Invalid token")
        return payload
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")


async def get_current_user(token: str = Depends(oauth2_scheme)) -> dict:
    return verify_token(token)


# ============================================================
# Auth Routes
# ============================================================

@app.post("/api/v1/auth/register", response_model=Token)
async def register(user: UserRegister):
    """Register a new user."""
    from passlib.context import CryptContext
    pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

    conn = get_db_connection()
    existing = conn.execute("SELECT id FROM users WHERE email = ?", (user.email,)).fetchone()
    if existing:
        conn.close()
        raise HTTPException(status_code=400, detail="Email already registered")

    hashed_password = pwd_context.hash(user.password)
    cursor = conn.execute(
        "INSERT INTO users (email, name, hashed_password) VALUES (?, ?, ?)",
        (user.email, user.name, hashed_password),
    )
    conn.commit()
    user_id = cursor.lastrowid
    conn.close()

    access_token = create_access_token(data={"sub": str(user_id), "email": user.email})
    return Token(access_token=access_token, token_type="bearer")


@app.post("/api/v1/auth/login", response_model=Token)
async def login(user: UserLogin):
    """Login and get access token."""
    from passlib.context import CryptContext
    pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

    conn = get_db_connection()
    db_user = conn.execute("SELECT id, email, hashed_password FROM users WHERE email = ?", (user.email,)).fetchone()
    conn.close()

    if not db_user or not pwd_context.verify(user.password, db_user["hashed_password"]):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    access_token = create_access_token(data={"sub": str(db_user["id"]), "email": db_user["email"]})
    return Token(access_token=access_token, token_type="bearer")


@app.get("/api/v1/auth/me", response_model=UserResponse)
async def get_me(current_user: dict = Depends(get_current_user)):
    """Get current user profile."""
    conn = get_db_connection()
    user = conn.execute("SELECT id, email, name FROM users WHERE id = ?", (int(current_user["sub"]),)).fetchone()
    conn.close()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return UserResponse(id=user["id"], email=user["email"], name=user["name"])


# ============================================================
# Conversation Routes
# ============================================================

@app.post("/api/v1/cybercrime/conversations", response_model=ConversationResponse)
async def create_conversation(
    data: ConversationCreate,
    current_user: dict = Depends(get_current_user),
):
    """Create a new conversation."""
    user_id = int(current_user["sub"])
    conn = get_db_connection()
    cursor = conn.execute(
        "INSERT INTO conversations (user_id, title, crime_type, is_child_safety) VALUES (?, ?, ?, ?)",
        (user_id, data.title, data.crime_type, int(data.is_child_safety)),
    )
    conn.commit()
    conv_id = cursor.lastrowid
    conv = conn.execute("SELECT * FROM conversations WHERE id = ?", (conv_id,)).fetchone()
    conn.close()
    return ConversationResponse(
        id=conv["id"],
        title=conv["title"],
        crime_type=conv["crime_type"],
        is_child_safety=bool(conv["is_child_safety"]),
        created_at=conv["created_at"],
    )


@app.get("/api/v1/cybercrime/conversations", response_model=list[ConversationResponse])
async def list_conversations(current_user: dict = Depends(get_current_user)):
    """List all conversations for the current user."""
    user_id = int(current_user["sub"])
    conn = get_db_connection()
    convs = conn.execute(
        "SELECT * FROM conversations WHERE user_id = ? ORDER BY created_at DESC",
        (user_id,),
    ).fetchall()
    conn.close()
    return [
        ConversationResponse(
            id=c["id"],
            title=c["title"],
            crime_type=c["crime_type"],
            is_child_safety=bool(c["is_child_safety"]),
            created_at=c["created_at"],
        )
        for c in convs
    ]


@app.get("/api/v1/cybercrime/conversations/{conversation_id}/messages", response_model=list[MessageResponse])
async def get_messages(
    conversation_id: int,
    current_user: dict = Depends(get_current_user),
):
    """Get all messages for a conversation."""
    user_id = int(current_user["sub"])
    conn = get_db_connection()
    conv = conn.execute(
        "SELECT * FROM conversations WHERE id = ? AND user_id = ?",
        (conversation_id, user_id),
    ).fetchone()
    if not conv:
        conn.close()
        raise HTTPException(status_code=404, detail="Conversation not found")

    msgs = conn.execute(
        "SELECT * FROM messages WHERE conversation_id = ? ORDER BY created_at ASC",
        (conversation_id,),
    ).fetchall()
    conn.close()
    return [
        MessageResponse(
            id=m["id"],
            conversation_id=m["conversation_id"],
            role=m["role"],
            content=m["content"],
            crime_type=m["crime_type"],
            created_at=m["created_at"],
        )
        for m in msgs
    ]


@app.delete("/api/v1/cybercrime/conversations/{conversation_id}")
async def delete_conversation(
    conversation_id: int,
    current_user: dict = Depends(get_current_user),
):
    """Delete a conversation and all its messages."""
    user_id = int(current_user["sub"])
    conn = get_db_connection()
    conv = conn.execute(
        "SELECT * FROM conversations WHERE id = ? AND user_id = ?",
        (conversation_id, user_id),
    ).fetchone()
    if not conv:
        conn.close()
        raise HTTPException(status_code=404, detail="Conversation not found")

    conn.execute("DELETE FROM messages WHERE conversation_id = ?", (conversation_id,))
    conn.execute("DELETE FROM conversations WHERE id = ?", (conversation_id,))
    conn.commit()
    conn.close()
    return {"status": "deleted", "conversation_id": conversation_id}


# ============================================================
# Chat AI Route
# ============================================================

@app.post("/api/v1/cybercrime/chat", response_model=ChatResponse)
async def chat(
    data: ChatRequest,
    current_user: dict = Depends(get_current_user),
):
    """Send a message and get AI-powered cybercrime guidance."""
    user_id = int(current_user["sub"])

    # Get or create conversation
    conversation_id = data.conversation_id
    if not conversation_id:
        conn = get_db_connection()
        cursor = conn.execute(
            "INSERT INTO conversations (user_id, title, crime_type, is_child_safety) VALUES (?, ?, ?, ?)",
            (user_id, data.message[:50] + "..." if len(data.message) > 50 else data.message, data.crime_type, 0),
        )
        conn.commit()
        conversation_id = cursor.lastrowid
        conn.close()

    # Get conversation history
    conn = get_db_connection()
    history_msgs = conn.execute(
        "SELECT role, content FROM messages WHERE conversation_id = ? ORDER BY created_at ASC",
        (conversation_id,),
    ).fetchall()
    conn.close()

    # Build chat history for LangChain
    chat_history = [(m["role"], m["content"]) for m in history_msgs]

    # Save user message
    conn = get_db_connection()
    conn.execute(
        "INSERT INTO messages (conversation_id, role, content, crime_type) VALUES (?, ?, ?, ?)",
        (conversation_id, "user", data.message, data.crime_type),
    )
    conn.commit()
    conn.close()

    # Get AI response using LangChain + ChromaDB
    is_child_safety = data.crime_type == "child_safety"
    result = chat_engine.chat(
        message=data.message,
        chat_history=chat_history,
        crime_type=data.crime_type,
        is_child_safety=is_child_safety,
    )

    # Save assistant message
    detected_crime = result.get("crime_type", data.crime_type)
    conn = get_db_connection()
    conn.execute(
        "INSERT INTO messages (conversation_id, role, content, crime_type) VALUES (?, ?, ?, ?)",
        (conversation_id, "assistant", result["reply"], detected_crime),
    )
    # Update conversation crime type if detected
    if detected_crime:
        conn.execute(
            "UPDATE conversations SET crime_type = ?, is_child_safety = ? WHERE id = ?",
            (detected_crime, int(detected_crime == "child_safety"), conversation_id),
        )
    conn.commit()
    conn.close()

    # Build evidence checklist
    evidence = EVIDENCE_CHECKLISTS.get(detected_crime, []) if detected_crime else []
    peca = PECA_SECTIONS.get(detected_crime, {}).get("sections", []) if detected_crime else []

    return ChatResponse(
        reply=result["reply"],
        crime_type=detected_crime,
        conversation_id=conversation_id,
        evidence_checklist=evidence,
        peca_sections=peca,
        authority_referrals={
            "fia": AUTHORITY_REFERRALS["fia"],
            "drf": AUTHORITY_REFERRALS["drf"],
            "child_protection": AUTHORITY_REFERRALS["childProtection"],
        } if detected_crime else None,
    )


# ============================================================
# Knowledge Base Routes
# ============================================================

@app.get("/api/v1/cybercrime/crime-types")
async def get_crime_types():
    """Get all supported crime types."""
    return CRIME_TYPES


@app.get("/api/v1/cybercrime/evidence-checklist/{crime_type}")
async def get_evidence_checklist(crime_type: str):
    """Get evidence checklist for a crime type."""
    checklist = EVIDENCE_CHECKLISTS.get(crime_type)
    if not checklist:
        raise HTTPException(status_code=404, detail="Crime type not found")
    return {"crime_type": crime_type, "checklist": checklist}


@app.get("/api/v1/cybercrime/peca-sections/{crime_type}")
async def get_peca_sections(crime_type: str):
    """Get PECA 2016 sections for a crime type."""
    sections = PECA_SECTIONS.get(crime_type)
    if not sections:
        raise HTTPException(status_code=404, detail="Crime type not found")
    return sections


@app.get("/api/v1/cybercrime/authority-referrals")
async def get_authority_referrals():
    """Get authority referral contacts."""
    return AUTHORITY_REFERRALS


# ============================================================
# Health Check
# ============================================================

@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "CyberShield AI Backend"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)