# CyberShield AI - Development Guidelines

## Project Overview

CyberShield AI is a Cybercrime Guidance Agentic AI web application designed for cybercrime victims in Pakistan. It provides 24/7 AI-powered guidance grounded in PECA 2016 law, with features including crime classification, evidence collection checklists, psychological support, child safety module, and direct authority referral.

## Architecture

### Web Application (Atoms Cloud)
- **Frontend**: React + TypeScript + Tailwind CSS + shadcn/ui
- **Backend**: Atoms Cloud (FastAPI edge functions, PostgreSQL)
- **AI Pipeline**: `client.ai.gentxt` with Gemini 2.5 Pro (streaming)
- **Auth**: Atoms Cloud built-in authentication
- **Knowledge Base**: Embedded in system prompts (PECA 2016 content fits in context window)

### Standalone FastAPI Backend (Separate Deliverable)
- **Framework**: FastAPI
- **AI**: LangChain + Google Gemini 2.5 Pro
- **Vector DB**: ChromaDB (RAG retrieval)
- **Embeddings**: HuggingFace sentence-transformers
- **Database**: SQLite
- **Auth**: JWT (python-jose) + bcrypt (passlib)
- **Location**: `/workspace/fastapi-backend/`

## Project Structure

```
app/frontend/src/
├── pages/
│   ├── Index.tsx          # Landing page with hero, features, crime types
│   ├── Chat.tsx           # Main AI chat interface with streaming
│   ├── ChildSafety.tsx    # Dedicated child safety module
│   ├── AuthCallback.tsx   # OAuth callback handler
│   └── AuthError.tsx      # Auth error page
├── components/
│   └── Header.tsx         # Navigation header with auth
├── lib/
│   ├── knowledge-base.ts  # PECA 2016, crime types, evidence, prompts
│   └── api.ts             # Atoms Cloud client
├── App.tsx                # Routes configuration
└── index.css              # Dark theme CSS variables

app/backend/
├── routers/
│   └── cybercrime.py      # Chat history API endpoints
├── models/
│   ├── conversations.py   # Conversation ORM model
│   └── messages.py        # Message ORM model
└── services/
    ├── conversations.py   # Conversation service layer
    └── messages.py        # Message service layer

fastapi-backend/           # Standalone FastAPI deliverable
├── main.py                # FastAPI app, routes, auth
├── chat_engine.py         # LangChain + ChromaDB chat engine
├── knowledge_base.py      # PECA 2016, crime types, evidence, prompts
├── requirements.txt       # Python dependencies
└── README.md              # Setup and API documentation
```

## Development Setup

### Web Application
1. Navigate to `app/frontend/`
2. Install dependencies: `pnpm install`
3. Run dev server: `pnpm run dev`
4. Build: `pnpm run build`
5. Lint: `pnpm run lint`

### FastAPI Backend
1. Navigate to `fastapi-backend/`
2. Create virtual environment: `python -m venv venv`
3. Activate: `source venv/bin/activate`
4. Install dependencies: `pip install -r requirements.txt`
5. Set environment variables:
   ```bash
   export GOOGLE_API_KEY="your-key"
   export SECRET_KEY="your-secret"
   ```
6. Run: `uvicorn main:app --reload`

## Key Design Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| AI Pipeline (Web) | client.ai.gentxt with streaming | Best UX for real-time chat; single LLM handles classification+guidance+support |
| AI Pipeline (FastAPI) | LangChain + ChromaDB | FYP-compliant RAG architecture with vector retrieval |
| Knowledge Base (Web) | Embedded in system prompts | Simpler than RAG for MVP; PECA 2016 content fits in context window |
| Knowledge Base (FastAPI) | ChromaDB vector store | Demonstrates RAG capabilities for academic requirements |
| Crime Classification | LLM-based via prompt | More flexible than zero-shot model; handles nuanced descriptions |
| Chat History | PostgreSQL via Atoms Cloud | Persistent conversations for logged-in users |
| Theme | Dark with cyan/blue accents | Professional, trust-building, calming for distressed victims |

## Crime Types

The system classifies cybercrimes into these categories:
- **harassment** - Cyberstalking, threatening messages, online abuse
- **blackmailing** - Extortion, revenge threats, content threats
- **hacking** - Unauthorized access, stolen accounts, identity theft
- **financial_fraud** - Phishing, scams, fake investments
- **child_safety** - Cyberbullying, grooming, child exploitation
- **other** - General cybercrime guidance

## AI System Prompts

Two system prompts are used:
1. **SYSTEM_PROMPT** - General cybercrime guidance with crime classification, step-by-step instructions, evidence collection, legal reference, authority referral, and psychological support
2. **CHILD_SAFETY_PROMPT** - Extended prompt for child safety cases with age-appropriate language, parent guidance, and emergency escalation

Both prompts enforce:
- Response in the same language as user input (English/Urdu)
- Compassionate, non-judgmental tone
- Victim-first approach (never blame the victim)
- Distress detection with emotional support before practical guidance
- PECA 2016 legal references
- Authority contact information

## PECA 2016 Reference

Key sections referenced:
- Section 3: Unauthorized access to information system
- Section 4: Unauthorized copying of data
- Section 5: Unauthorized access to critical infrastructure
- Section 14: Unauthorized issuance of SIM cards
- Section 16: Spoofing
- Section 21: Offence against dignity of a person
- Section 22: Child pornography
- Section 24: Cyber terrorism

## Authority Referrals

| Authority | Helpline | Purpose |
|-----------|----------|---------|
| FIA Cyber Crime Wing | 1991 | Main government cybercrime body |
| Digital Rights Foundation | 0800-39393 | Cyber harassment helpline |
| Child Protection Services | 1121 | Emergency child protection |
| Police Emergency | 15 | Immediate physical danger |
| Emergency Services | 1122 | Medical/fire emergency |

## Coding Standards

### Frontend
- Use TypeScript for all new files
- Follow shadcn/ui component patterns
- Use Tailwind CSS classes (no inline styles)
- Keep components focused and modular
- Use `@/` path aliases for imports
- Follow React hooks best practices

### Backend (Atoms Cloud)
- Follow existing router/service/model pattern
- Use async/await for all database operations
- Include proper error handling and logging
- Validate input with Pydantic models
- Use dependency injection for auth and database

### Backend (FastAPI)
- Follow FastAPI best practices
- Use async endpoints where possible
- Include proper type hints
- Document all endpoints with docstrings
- Handle errors gracefully with HTTPException

## Testing Guidelines

### Manual Testing Checklist
- [ ] Landing page loads correctly with all sections
- [ ] Navigation works between Home, Chat, and Child Safety
- [ ] Chat interface sends messages and receives AI responses
- [ ] Crime type detection works for each category
- [ ] Evidence checklist appears in sidebar after crime detection
- [ ] PECA legal info displays correctly
- [ ] Authority referral cards show correct contact info
- [ ] Child Safety page shows parent and children tabs
- [ ] Login/logout flow works
- [ ] Mobile responsive layout works
- [ ] Dark theme renders correctly

## Deployment

### Web Application
Deploy via Atoms Cloud platform - click Publish button in App Viewer.

### FastAPI Backend
1. Set production environment variables
2. Use a production WSGI/ASGI server (gunicorn + uvicorn workers)
3. Set up a reverse proxy (nginx)
4. Use a production database (PostgreSQL instead of SQLite)
5. Enable HTTPS

## Security Considerations

- Never store sensitive user data in localStorage
- All AI conversations should be private to the authenticated user
- Child safety cases require extra data protection
- Authority referral links should use HTTPS
- Rate limit AI endpoints to prevent abuse
- Sanitize all user inputs before processing
- Do not log full conversation content

## Future Enhancements

- Multi-language support (Urdu script, not just Roman Urdu)
- Conversation export (PDF for legal filing)
- Real-time FIA complaint status tracking
- Integration with FIA online portal API
- Voice input for accessibility
- Offline mode with cached guidance
- Community forum for peer support
- Professional counselor referral system