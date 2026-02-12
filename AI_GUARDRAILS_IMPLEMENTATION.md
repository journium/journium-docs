# AI Chat Guardrails Implementation

## Summary
Implemented a three-layer defense system to prevent off-topic conversations in the AI documentation assistant.

## Changes Made

### 1. Pre-Check Relevance Filter (Backend)
**File**: `apps/docs-app/app/api/chat/route.ts`

Added a fast LLM classification check that runs **before** the main chat response:
- Uses `gpt-4o-mini` for quick, cheap relevance classification
- Analyzes each user question to determine if it's related to Journium
- Returns immediate rejection response for off-topic questions
- Fails open (allows questions through) if the check errors

```typescript
async function checkRelevance(question: string, aiProvider, requestId): Promise<boolean>
```

### 2. Stricter System Prompt (Backend)
**File**: `apps/docs-app/app/api/chat/route.ts`

Completely rewrote the system prompt with:
- **Explicit boundaries**: Clear lists of allowed and forbidden topics
- **Mandatory response template**: Exact text to use for off-topic questions
- **Concrete examples**: Shows correct handling of various off-topic scenarios
- **Strict instructions**: "DO NOT engage", "DO NOT try to connect", "NEVER be overly accommodating"

Key sections:
- `CRITICAL RULES - ABSOLUTE BOUNDARIES`
- `ALLOWED TOPICS` vs `FORBIDDEN TOPICS`
- `OFF-TOPIC RESPONSE TEMPLATE`
- `EXAMPLES OF CORRECT HANDLING`

### 3. Strike System (Backend)
**File**: `apps/docs-app/app/api/chat/route.ts`

Tracks off-topic attempts in conversation history:
- Counts how many times the AI has given the off-topic rejection response
- After **2 strikes**, locks the conversation
- Returns HTTP 429 (Too Many Requests) with error message
- Forces user to start a new conversation

```typescript
function countOffTopicStrikes(messages): number
```

### 4. Frontend Error Handling
**File**: `apps/docs-app/components/ai/ai-search.tsx`

Added UI to display:
- Error messages when conversation is locked
- Red alert box with clear messaging
- Error handling in the `useChat` hook

## How It Works

### Flow Diagram
```
User Question
    ↓
Strike Check (2+ strikes?) → YES → Return "Conversation Locked" (429)
    ↓ NO
Relevance Check (OpenAI API) → OFF_TOPIC → Return Standard Rejection (200)
    ↓ RELEVANT
System Prompt Enforcement
    ↓
Generate Response with Tools
    ↓
Return to User
```

### Example Scenarios

#### Scenario 1: First Off-Topic Question
- User: "What's the weather today?"
- **Relevance Check**: Classifies as OFF_TOPIC
- **Response**: "I can only assist with Journium documentation, features, and integration..."
- **Strike Count**: 1

#### Scenario 2: Second Off-Topic Question
- User: "Tell me about cooking pasta"
- **Relevance Check**: Classifies as OFF_TOPIC
- **Response**: Same standard rejection
- **Strike Count**: 2

#### Scenario 3: Third Off-Topic Question (Locked)
- User: "I'm a roofer"
- **Strike Check**: Detects 2 previous strikes
- **Response**: HTTP 429 error - "This conversation has been locked due to repeated off-topic questions. Please start a new conversation with Journium-related questions."
- **UI**: Red error box displayed

#### Scenario 4: Journium Question (Allowed)
- User: "How do I integrate Journium with Next.js?"
- **Relevance Check**: Classifies as RELEVANT
- **Response**: Full detailed answer with code examples
- **Strike Count**: 0

## Configuration

### Environment Variables
- `OPENAI_API_KEY`: Required for relevance check (uses `gpt-4o-mini`)
- Falls back gracefully if not available (allows all questions through)

### Strike Limit
Current limit: **2 off-topic responses** before conversation lock

To adjust, modify this line in `route.ts`:
```typescript
if (offTopicStrikes >= 2) { // Change this number
```

### Relevance Check Model
Current model: `gpt-4o-mini` (fast and cheap)

To change, modify the `checkRelevance` function in `route.ts`.

## Testing

### Test Cases
1. ✅ Ask off-topic question → Should get rejection
2. ✅ Ask 2 off-topic questions → Should still get rejections
3. ✅ Ask 3 off-topic questions → Should lock conversation
4. ✅ Ask valid Journium question → Should get full answer
5. ✅ Mix of valid and off-topic → Strikes only count for off-topic

### Manual Testing
```bash
# Start dev server
pnpm dev

# Open AI chat and try:
1. "What's the weather?" (should reject)
2. "Tell me a joke" (should reject)
3. "I'm a roofer" (should lock conversation)
4. Clear chat and ask "How do I use Journium?" (should answer)
```

## Costs & Performance

### Relevance Check
- **Model**: `gpt-4o-mini`
- **Cost**: ~$0.00015 per question (input) + $0.0006 per classification (output)
- **Latency**: ~200-500ms additional per question
- **Total**: Minimal impact on UX and budget

### Optimization Options
If costs become an issue:
1. Cache classification results for similar questions
2. Use keyword filtering before LLM check
3. Batch multiple questions together
4. Only check after first off-topic strike

## Monitoring

Check server logs for:
```bash
# Relevance classifications
[requestId] Relevance classification: OFF_TOPIC (isRelevant: false)

# Strike counts
[requestId] Off-topic strikes: 2

# Locked conversations
[requestId] User exceeded off-topic limit (2 strikes)
```

## Future Improvements

1. **User feedback**: Add "Was this helpful?" to rejection messages
2. **Analytics**: Track off-topic attempt patterns
3. **Smart unlocking**: Allow reset after timeout
4. **Category detection**: Provide specific rejection messages per category
5. **A/B testing**: Compare strict vs lenient enforcement

## Known Issues & Fixes

### Issue: AI mentions links but doesn't provide them
**Symptom**: AI says "I've linked the documentation below" but no links appear

**Cause**: AI mentions links in text without actually calling the `provideLinks` tool

**Fix Applied**: Added explicit instructions to system prompt:
- "DO NOT say things like 'I've linked the documentation below' unless you have actually used the provideLinks tool"
- "Only mention 'links' or 'references' in your text if you ACTUALLY call the provideLinks tool"
- "Links are OPTIONAL - you can answer comprehensively without providing links, but you MUST still fetch documentation first"

### Issue: Risk of hallucination about Journium features
**Symptom**: AI might answer from training data rather than current documentation, leading to outdated or incorrect information

**Cause**: Original prompt allowed answering "from knowledge" without fetching documentation

**Fix Applied**: Added strict anti-hallucination rules:
- "You MUST fetch documentation for Journium-specific questions - do NOT rely on training data or memory"
- "NEVER answer from memory or training data about Journium specifics - always fetch current documentation"
- "ANTI-HALLUCINATION RULE: Never make up Journium features, APIs, configuration options, or behavior"
- "If you cannot find information in the documentation after fetching, say 'I don't see this in the current documentation' rather than guessing"
- "Only provide information that you have verified by fetching from the documentation"

This ensures all Journium-specific answers are grounded in actual documentation, not AI memory.

## Rollback Plan

To disable guardrails:
1. Remove relevance check in `POST` handler (lines ~209-246)
2. Remove strike check (lines ~186-200)
3. Restore original system prompt from git history
4. Deploy

Rollback is safe and non-breaking.
