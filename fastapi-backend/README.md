# CyberShield AI - FastAPI Backend

A standalone FastAPI + LangChain + ChromaDB backend for the Cybercrime Guidance Agentic AI system, designed for cybercrime victim guidance in Pakistan.

## Features

- **AI Chat Engine**: LangChain-powered chat with Google Gemini + ChromaDB RAG
- **Crime Classification**: Automatic classification of cybercrime types
- **Evidence Guidance**: Step-by-step evidence collection checklists
- **Legal Reference**: PECA 2016 section references and penalties
- **Authority Referral**: Direct contact info for FIA, DRF, child protection
- **Psychological Support**: Distress detection and empathetic responses
- **Child Safety Module**: Dedicated guidance for parents and children
- **Chat History**: SQLite-based conversation persistence
- **User Auth**: JWT-based registration and login

## Tech Stack

- **Framework**: FastAPI
- **AI**: LangChain + Google Gemini 2.5 Pro
- **Vector DB**: ChromaDB (for RAG retrieval)
- **Embeddings**: HuggingFace sentence-transformers
- **Database**: SQLite
- **Auth**: JWT (python-jose) + bcrypt (passlib)

## Setup

### 1. Install Dependencies

```bash
pip install -r requirements.txt
```

### 2. Set Environment Variables

```bash
export GOOGLE_API_KEY="your-google-api-key"
export SECRET_KEY="your-secret-key-for-jwt"
export DB_PATH="cybershield.db"  # optional, defaults to cybershield.db
export CHROMA_PERSIST_DIR="./chroma_db"  # optional
```

### 3. Run the Server

```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

The API will be available at `http://localhost:8000`

API docs at `http://localhost:8000/docs`

## API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/auth/register` | Register new user |
| POST | `/api/v1/auth/login` | Login and get token |
| GET | `/api/v1/auth/me` | Get current user |

### Chat
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/cybercrime/chat` | Send message, get AI guidance |
| POST | `/api/v1/cybercrime/conversations` | Create conversation |
| GET | `/api/v1/cybercrime/conversations` | List conversations |
| GET | `/api/v1/cybercrime/conversations/{id}/messages` | Get messages |
| DELETE | `/api/v1/cybercrime/conversations/{id}` | Delete conversation |

### Knowledge Base
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/cybercrime/crime-types` | List crime types |
| GET | `/api/v1/cybercrime/evidence-checklist/{type}` | Get evidence checklist |
| GET | `/api/v1/cybercrime/peca-sections/{type}` | Get PECA sections |
| GET | `/api/v1/cybercrime/authority-referrals` | Get authority contacts |

### Health
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Health check |

## Project Structure

```
fastapi-backend/
├── main.py              # FastAPI app, routes, auth
├── chat_engine.py       # LangChain + ChromaDB chat engine
├── knowledge_base.py    # PECA 2016, crime types, evidence, prompts
├── requirements.txt     # Python dependencies
└── README.md           # This file
```

## Crime Types Supported

- **Harassment** - Cyberstalking, threatening messages, online abuse
- **Blackmailing** - Extortion, revenge threats, content threats
- **Hacking** - Unauthorized access, stolen accounts, identity theft
- **Financial Fraud** - Phishing, scams, fake investments
- **Child Safety** - Cyberbullying, grooming, child exploitation
- **Other** - General cybercrime guidance

## Architecture

```
User Message → FastAPI Route → Chat Engine → LangChain Pipeline
                                              ├── System Prompt (PECA 2016 + guidance rules)
                                              ├── Chat History (from SQLite)
                                              ├── RAG Context (from ChromaDB)
                                              └── Google Gemini 2.5 Pro
                                                    ↓
                                              AI Response
                                                    ↓
                                         Save to SQLite → Return to User
```

## License

This project is developed as a Final Year Project for academic purposes.