# Teacher Mode Guide - LLM as Educational Assistant

## Overview

The Teacher Mode adds an LLM-powered educational layer to your existing rule-based business automation system. **The LLM does NOT make decisions or replace core operations** - it only explains what the system does and teaches users about business automation concepts.

## Key Principles

### ✅ What Teacher Mode DOES:
- Explains how the rule-based system made decisions
- Provides educational content about business concepts
- Offers step-by-step explanations of operations
- Teaches users about system capabilities
- Provides alternative approaches and best practices

### ❌ What Teacher Mode DOES NOT:
- Replace intent detection (still uses patterns)
- Make business decisions
- Modify core operations
- Override existing logic
- Process user requests directly

## Architecture

```
┌─────────────────────────────────────────┐
│           User Request                 │
└─────────────────┬───────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────┐
│    Original Rule-Based System           │
│  (Intent Detection, Processing, etc.)   │
└─────────────────┬───────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────┐
│          Business Result                │
└─────────────────┬───────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────┐
│      Teacher Mode (Optional)            │
│     - Explains what happened            │
│     - Teaches concepts                  │
│     - Provides guidance                 │
└─────────────────────────────────────────┘
```

## Configuration

### Environment Variables

```bash
# Enable Teacher Mode
ASSISTANT_TEACHER_MODE=true

# LLM Configuration for Teacher Only
LLM_PROVIDER=openai  # or anthropic, local
OPENAI_API_KEY=your-key-here
ANTHROPIC_API_KEY=your-key-here

# Core System (unchanged)
ASSISTANT_ENABLED=true
ASSISTANT_ENGINES=predictive_scheduling,client_behavior
```

### Example Configuration

```typescript
const config = {
  tenantId: "your-tenant",
  modules: [
    { name: "booking", enabled: true },
    { name: "crm", enabled: true }
  ],
  assistant: {
    enabled: true,
    engines: ["predictive_scheduling", "client_behavior"],
    teacherMode: true,  // Enable teacher
    useLLM: false       // LLM NOT used for operations
  },
  llm: {
    provider: "openai",
    apiKey: process.env.OPENAI_API_KEY,
    model: "gpt-4",
    fallbackEnabled: true
  }
};
```

## API Endpoints

### Core Business Endpoints (Unchanged)
- `POST /assistant/chat` - Process business requests
- `POST /assistant/intent` - Detect intents using patterns
- `POST /assistant/suggestions` - Get rule-based suggestions

### Teacher-Only Endpoints
- `POST /teacher/explain-operation` - Explain what happened
- `POST /teacher/explain-intent` - Explain intent detection
- `POST /teacher/explain-suggestion` - Explain AI suggestions
- `POST /teacher/teach-concept` - Learn business concepts
- `POST /teacher/configure` - Set up LLM for teaching
- `POST /teacher/toggle` - Enable/disable teacher mode
- `GET /teacher/status` - Check teacher availability

## Usage Examples

### 1. Basic Business Operation (Unchanged)
```bash
curl -X POST /assistant/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Book appointment for tomorrow at 2pm",
    "context": {
      "actor": {"userId": "user123", "role": "staff"},
      "tenantId": "tenant123"
    }
  }'
```
*Response: Same as before - uses rule-based processing*

### 2. With Explanation (Teacher Mode)
```bash
curl -X POST /assistant/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Book appointment for tomorrow at 2pm",
    "context": {
      "actor": {"userId": "user123", "role": "staff"},
      "tenantId": "tenant123"
    },
    "explain": true
  }'
```
*Response: Business result + teacher explanation*

### 3. Standalone Explanation
```bash
curl -X POST /teacher/explain-operation \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Book appointment for tomorrow at 2pm",
    "context": {
      "actor": {"userId": "user123", "role": "staff"},
      "tenantId": "tenant123"
    }
  }'
```

### 4. Learn Concepts
```bash
curl -X POST /teacher/teach-concept \
  -H "Content-Type: application/json" \
  -d '{
    "concept": "intent detection",
    "userLevel": "beginner"
  }'
```

## Response Examples

### Business Operation (Unchanged)
```json
{
  "success": true,
  "result": {
    "steps": [
      {"kind": "execute", "action": "booking.create", "tool": "booking.create"}
    ],
    "final": {"ok": true, "message": "Appointment booked successfully"}
  },
  "teacherEnabled": true
}
```

### With Teacher Explanation
```json
{
  "success": true,
  "result": {
    "steps": [
      {"kind": "execute", "action": "booking.create", "tool": "booking.create"}
    ],
    "final": {"ok": true, "message": "Appointment booked successfully"}
  },
  "teacherEnabled": true,
  "explanation": {
    "type": "explain_operation",
    "title": "Booking Operation",
    "explanation": "The system detected your booking intent using pattern matching...",
    "reasoning": "Pattern 'book' matched with 75% confidence...",
    "confidence": 0.8,
    "examples": ["Book appointment", "Schedule meeting"],
    "nextSteps": ["Confirm booking details", "Send confirmation"]
  }
}
```

## Benefits

### For Users
- **Learn the System**: Understand how business automation works
- **Better Decisions**: Know why the system makes certain choices
- **Troubleshooting**: Get explanations when things don't work as expected
- **Skill Development**: Learn business automation concepts

### For Developers
- **Zero Risk**: LLM cannot break existing functionality
- **Debugging**: See exactly how the system processes requests
- **Documentation**: Automatic explanations of system behavior
- **User Training**: Built-in educational content

### For Business
- **Transparency**: Users understand automated decisions
- **Compliance**: Clear audit trails with explanations
- **Training**: Reduce support tickets with self-service learning
- **Adoption**: Users more comfortable with automation when they understand it

## Safety & Reliability

### Core System Protection
- Original rule-based logic never modified
- LLM runs in parallel, not in the critical path
- Fallback explanations when LLM unavailable
- No impact on business operations

### Teacher Mode Failures
- If LLM fails, business operations continue normally
- Graceful degradation to simple explanations
- Clear error messages for configuration issues
- Offline mode with basic explanations

## Implementation Details

### Teacher-Only Components
1. **TeacherOrchestrator**: Wraps original orchestrator, adds explanations
2. **TeacherBusinessSpine**: Preserves original spine, adds teacher methods
3. **TeacherApiServer**: Separate endpoints for teaching functionality
4. **TeacherService**: Handles LLM interactions for explanations only

### Integration Points
- Original system methods unchanged (`processRequest`, `detectIntents`, etc.)
- Teacher methods added alongside (`explainOperation`, `teachConcept`, etc.)
- Optional `explain` parameter on existing endpoints
- Separate `/teacher/*` endpoints for dedicated teaching

## Migration Path

### Step 1: Add Teacher Dependencies
```bash
npm install openai @anthropic-ai/sdk nanoid
```

### Step 2: Update Configuration
Add teacher mode settings to your existing config.

### Step 3: Deploy Teacher API
Use `TeacherApiServer` instead of or alongside your existing server.

### Step 4: Configure LLM
Set up API keys and test teacher functionality.

### Step 5: Enable Gradually
Start with teacher mode disabled, enable for testing, then roll out to users.

## Troubleshooting

### Teacher Not Working
1. Check `ASSISTANT_TEACHER_MODE=true`
2. Verify LLM API keys are set
3. Test LLM connectivity: `GET /teacher/status`
4. Check logs for configuration errors

### Explanations Missing
1. Ensure `explain: true` in request
2. Verify teacher mode is enabled
3. Check LLM service availability
4. Review response for explanation field

### Performance Impact
- Teacher mode adds minimal overhead when not used
- LLM calls only made when explanations requested
- Core operations performance unchanged
- Consider caching for common explanations

## Best Practices

### For Users
- Use explanations to learn the system
- Start with basic concepts, advance gradually
- Combine explanations with actual operations
- Provide feedback on explanation quality

### For Developers
- Keep core business logic separate from teacher logic
- Test teacher functionality independently
- Monitor LLM usage and costs
- Provide fallback explanations for reliability

### For Administrators
- Enable teacher mode gradually
- Monitor explanation quality and user feedback
- Set appropriate LLM usage limits
- Maintain API key security

---

**Note**: Teacher Mode is designed to enhance, not replace, your existing business automation system. The rule-based core remains fully functional and reliable, with the LLM serving only as an educational assistant.
