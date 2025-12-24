# NLP.js Integration Example

This example demonstrates how to integrate the nlp.js library with the Auth-spine NLU engine.

## Basic Usage

```typescript
import { dockStart } from '../external/nlp.js/packages/node-nlp/src';

// Example: Using NLP.js with Auth-spine NLU Engine
async function initializeNLPEngine() {
  const dock = await dockStart({ use: ['Basic'] });
  const nlp = dock.get('nlp');
  
  // Add corpus for intent training
  await nlp.addCorpus('en');
  
  // Train the model
  await nlp.train();
  
  return nlp;
}

// Example: Process user input
async function processUserIntent(nlp: any, text: string) {
  const response = await nlp.process('en', text);
  
  return {
    intent: response.intent,
    score: response.score,
    entities: response.entities,
    sentiment: response.sentiment
  };
}

// Integration with existing NLU Engine
// This can be used in packages/enterprise/nlu/nlu-integration.ts
export async function enhanceNLUWithNlpJs() {
  const nlp = await initializeNLPEngine();
  
  // Add intents related to Auth-spine functionality
  nlp.addDocument('en', 'show me users', 'users.list');
  nlp.addDocument('en', 'list all users', 'users.list');
  nlp.addDocument('en', 'create a new booking', 'booking.create');
  nlp.addDocument('en', 'make a reservation', 'booking.create');
  nlp.addDocument('en', 'check permissions', 'rbac.check');
  nlp.addDocument('en', 'what can I access', 'rbac.check');
  
  // Add answers
  nlp.addAnswer('en', 'users.list', 'I can help you view the user list');
  nlp.addAnswer('en', 'booking.create', 'Let me help you create a booking');
  nlp.addAnswer('en', 'rbac.check', 'I can show you your permissions');
  
  await nlp.train();
  
  return nlp;
}
```

## Advanced Features

### Entity Extraction

```typescript
// Extract named entities from user input
async function extractEntities(nlp: any, text: string) {
  const result = await nlp.process('en', text);
  
  // Example: "book a table for John at 7pm"
  // Entities: { name: 'John', time: '7pm' }
  return result.entities;
}
```

### Sentiment Analysis

```typescript
// Analyze sentiment of user messages
async function analyzeSentiment(nlp: any, text: string) {
  const result = await nlp.process('en', text);
  
  return {
    score: result.sentiment.score,
    comparative: result.sentiment.comparative,
    vote: result.sentiment.vote // positive, negative, neutral
  };
}
```

### Multi-language Support

```typescript
// Support multiple languages
async function createMultilingualNLP() {
  const dock = await dockStart({ use: ['Basic', 'LangEn', 'LangEs', 'LangFr'] });
  const nlp = dock.get('nlp');
  
  // Add training data for multiple languages
  nlp.addDocument('en', 'hello', 'greetings.hello');
  nlp.addDocument('es', 'hola', 'greetings.hello');
  nlp.addDocument('fr', 'bonjour', 'greetings.hello');
  
  await nlp.train();
  
  return nlp;
}
```

## Integration Points

The nlp.js library can be integrated at these points in Auth-spine:

1. **NLU Engine** (`packages/enterprise/nlu/nlu-engine.ts`)
   - Replace or enhance the existing intent detection
   - Add entity extraction capabilities
   - Improve sentiment analysis

2. **Smart Assistant** (`packages/enterprise/nlu/enhanced-assistant.ts`)
   - Process natural language queries
   - Extract user intent and entities
   - Provide context-aware responses

3. **Chat/Command Interface**
   - Parse user commands in natural language
   - Execute actions based on detected intents
   - Map intents to RBAC permissions

## Installation

The nlp.js library is already available as a submodule. To use it in your code:

```bash
# Ensure submodule is initialized
git submodule update --init --recursive

# Install nlp.js dependencies (if needed for direct usage)
cd external/nlp.js
npm install
```

## References

- [NLP.js Documentation](https://github.com/axa-group/nlp.js)
- [Auth-spine NLU Engine](../packages/enterprise/nlu/nlu-engine.ts)
- [Auth-spine NLU Integration](../packages/enterprise/nlu/nlu-integration.ts)
