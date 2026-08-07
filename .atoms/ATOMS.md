---
last_updated: 2026-06-29T11:42:50Z
status: active
---

# Project Context

## Project Overview
Cybercrime Guidance Agentic AI — A web-based intelligent system for cybercrime victim guidance in Pakistan. Features 24/7 AI chat, crime classification, evidence collection guidance, psychological support, child safety module, and direct authority referral. Grounded in PECA 2016 law.

## Key Decisions
| Date | Decision | By | Rationale |
|------|----------|-----|-----------|
| 2026-06-29 | Use Atoms Cloud + client.ai.gentxt for AI pipeline | Alex | Streaming UX, simpler than separate RAG pipeline; knowledge base embedded in system prompts |
| 2026-06-29 | Single comprehensive system prompt for classification + guidance + support | Alex | LLM handles all steps in one flow; reduces latency and complexity |
| 2026-06-29 | Also provide separate FastAPI+LangChain+ChromaDB code as deliverable | Alex | User needs both working app AND FYP-compliant Python backend code |
| 2026-06-29 | Dark theme with blue/teal accents for trust and calm | Alex | Cybercrime victims need reassuring, professional UI |

## Constraints
- Target users: Pakistani cybercrime victims (general public, parents, children)
- Must be mobile-responsive (many users on phones)
- All legal guidance must reference PECA 2016
- Psychological support must activate for distress signals
- Child Safety Module must be accessible and age-appropriate
- Active theme: Dark professional with blue/teal accents


