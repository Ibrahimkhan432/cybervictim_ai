# CyberShield AI - Functionality Fix Implementation Plan

## Current State Analysis

### Frontend Issues
1. UserMenu: "My Profile", "Settings", and language buttons are non-functional
2. ChatHistory: Loads conversations but doesn't actually load messages when clicked
3. Chat Component: Doesn't save messages to backend, doesn't create conversations
4. Missing Routes: No /profile or /settings pages
5. Missing Functionality: No language persistence, no proper logout handling

### Backend Status  
✅ Conversation API endpoints exist at `/api/v1/auth/v2/conversations`
✅ Message API endpoints exist  
✅ ConversationService and conversation_service are implemented
✅ Database models (User, Conversation, ChatMessage) exist
✅ User language_preference field exists in database

### Key Findings
- Backend is mostly ready
- Frontend components exist but aren't connected to backend
- API endpoints are functional but frontend doesn't use them properly

## Implementation Steps

### Phase 1: Fix UserMenu Component
1. Add navigation to profile page
2. Add navigation to settings page
3. Implement language preference switching
4. Fix logout functionality

### Phase 2: Create Profile & Settings Pages
1. Create profile page component
2. Create settings page component
3. Add routes for both

### Phase 3: Fix Chat Component Message Persistence
1. Implement conversation creation on first message
2. Save user messages to backend
3. Save AI responses to backend
4. Load conversation messages when conversation is selected

### Phase 4: Implement Language Switching
1. Create language utility hook
2. Persist language preference to backend
3. Apply language setting to UI

### Phase 5: Fix Logout Functionality
1. Properly clear auth state
2. Redirect to login
3. Add loading states

### Phase 6: Complete ChatHistory Integration
1. Actually load messages when clicking history item
2. Update conversation list after creating new chat
3. Handle conversation loading states

## Files to Create/Modify

### Create
- src/pages/Profile.tsx
- src/pages/Settings.tsx
- src/hooks/useLanguage.ts
- src/lib/conversation-api.ts

### Modify  
- src/App.tsx (add new routes)
- src/components/UserMenu.tsx (add navigation and language switching)
- src/pages/Chat.tsx (add message persistence)
- src/contexts/AuthContext.tsx (improve logout)

## API Endpoints to Use

```
GET  /api/v1/auth/v2/conversations             - List user conversations
POST /api/v1/auth/v2/conversations             - Create conversation
GET  /api/v1/auth/v2/conversations/{id}        - Get conversation with messages
DELETE /api/v1/auth/v2/conversations/{id}      - Delete conversation
POST /api/v1/auth/v2/conversations/{id}/messages - Save message
```

## Testing Checklist
- [ ] Login -> Chat works
- [ ] User menu shows correct name/email
- [ ] My Profile navigates to profile page
- [ ] Settings navigates to settings page
- [ ] Language switching changes UI and persists
- [ ] Send message creates conversation and saves message
- [ ] Chat history loads messages when clicked
- [ ] New Chat resets state and creates new conversation
- [ ] Logout clears state and redirects to login
