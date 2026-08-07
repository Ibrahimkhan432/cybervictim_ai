---
last_updated: 2026-06-29T11:42:50Z
---

# Architecture Design

## System Overview
Cybercrime Guidance Agentic AI — 4-layer architecture: UI (React+Tailwind) → Backend (Atoms Cloud Edge Functions) → AI Core (client.ai.gentxt with comprehensive system prompts) → Data (PostgreSQL for chat history, embedded knowledge base in prompts).

## Tech Stack
- Frontend: React + TypeScript + Tailwind CSS + shadcn/ui
- Backend: Atoms Cloud (FastAPI edge functions, PostgreSQL)
- AI: client.ai.gentxt (gemini-2.5-pro for classification + guidance + support)
- Auth: Atoms Cloud built-in auth
- Separate deliverable: Python FastAPI + LangChain + ChromaDB

## Module Design
| Module | Responsibility | Key Files |
|--------|---------------|-----------|
| Landing Page | Hero, features, CTA to chat | src/pages/Index.tsx |
| Chat Interface | AI chat with streaming, crime badges, evidence checklists | src/pages/Chat.tsx |
| Child Safety | Dedicated parent/child guidance module | src/pages/ChildSafety.tsx |
| Knowledge Base | PECA 2016, FIA procedures, evidence checklists, prompts | src/lib/knowledge-base.ts |
| Navigation | Header with nav links | src/components/Header.tsx |
| Chat History API | Save/retrieve conversations | backend/routers/cybercrime.py |
| Chat Service | Business logic for chat operations | backend/services/cybercrime.py |

## Tech Decisions
| Decision | Choice | Rationale |
|----------|--------|-----------|
| AI Pipeline | client.ai.gentxt with streaming | Best UX for real-time chat; single LLM handles classification+guidance+support |
| Knowledge Base | Embedded in system prompts | Simpler than RAG for MVP; PECA 2016 content fits in context window |
| Crime Classification | LLM-based via prompt | More flexible than zero-shot model; handles nuanced descriptions |
| Chat History | PostgreSQL via Atoms Cloud | Persistent conversations for logged-in users |

## File Tree Plan
```
app/frontend/src/
├── pages/
│   ├── Index.tsx          # Landing page
│   ├── Chat.tsx           # Main chat interface
│   └── ChildSafety.tsx    # Child safety module
├── components/
│   └── Header.tsx         # Navigation header
├── lib/
│   └── knowledge-base.ts  # Knowledge base + prompts
├── App.tsx                # Routes
└── index.css              # Custom styles

app/backend/
├── routers/
│   └── cybercrime.py      # Chat history API
└── services/
    └── cybercrime.py      # Chat service logic
```

## Implementation Guide
1. Create DB tables for conversations and messages
2. Build knowledge-base.ts with all PECA 2016 content, crime types, evidence checklists, and AI system prompts
3. Build Header component with navigation
4. Build Landing page with hero section and feature cards
5. Build Chat page with streaming AI integration
6. Build Child Safety page with dedicated guidance
7. Build backend API for saving/retrieving chat history
8. Update App.tsx routes and index.css styles

