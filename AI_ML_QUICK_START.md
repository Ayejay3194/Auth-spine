# AI/ML Quick Start Guide

Get started with Auth-Spine's AI/ML capabilities in minutes.

---

## 🚀 Quick Start (5 Minutes)

### Option 1: Use Unified AI Agent (Easiest)

The Unified AI Agent is already integrated and ready to use:

```typescript
import { UnifiedAIAgent } from '@auth-spine/enterprise';

// Initialize the agent
const agent = new UnifiedAIAgent({
  authLevel: 'authenticated',
  llmConfig: {
    provider: 'openai', // optional - works without LLM too
    apiKey: process.env.OPENAI_API_KEY,
    model: 'gpt-4'
  }
});

await agent.initialize();

// Use NLP capabilities
const sentiment = await agent.analyzeSentiment('This product is amazing!');
console.log(sentiment); // { score: 0.95, label: 'POSITIVE' }

// Extract intent
const intent = await agent.detectIntent('I want to book an appointment');
console.log(intent); // { intent: 'booking', confidence: 0.92 }

// Question answering
const answer = await agent.answerQuestion(
  'What services do you offer?',
  context
);
```

### Option 2: Use Solari GenAI Kit

For controlled generation with schema validation:

```typescript
import { generateControlled } from '@auth-spine/solari-genai-kit';

const result = await generateControlled({
  modelBaseUrl: 'http://localhost:11434', // or your LLM endpoint
  schemaName: 'report',
  userPrompt: 'Summarize user feedback for Q4 2025'
});

console.log(result.parsed); // Schema-validated JSON output
```

### Option 3: Use ML Platform

For machine learning tasks:

```typescript
import { createModel, predictChurn } from '@auth-spine/ml-platform';

// Create a churn prediction model
const model = createModel({
  type: 'churn-prediction',
  features: ['last_login', 'total_bookings', 'avg_session_duration'],
  threshold: 0.7
});

// Make predictions
const prediction = await model.predict(userData);
console.log(prediction); // { risk: 0.35, label: 'low', confidence: 0.89 }
```

---

## 📦 Installation

All AI/ML packages are already included in the monorepo:

```bash
# Install dependencies
npm install

# Build AI/ML packages
npm run build:ai     # Solari GenAI Kit
npm run build:ml     # ML Platform
npm run build:llm    # LLM Platform
npm run build:bioplausible  # Bioplausible Learning

# Or build everything
npm run build
```

---

## 🎯 Common Use Cases

### 1. Sentiment Analysis

```typescript
import { UnifiedAIAgent } from '@auth-spine/enterprise';

const agent = new UnifiedAIAgent({ authLevel: 'authenticated' });
await agent.initialize();

// Analyze customer feedback
const feedback = "The service was excellent and the staff was very helpful!";
const result = await agent.analyzeSentiment(feedback);

console.log(result);
// { score: 0.98, label: 'POSITIVE', confidence: 0.95 }
```

### 2. Document Q&A with RAG

```typescript
import { InMemoryKeywordStore, chunkText } from '@auth-spine/solari-genai-kit';

// Set up RAG store
const store = new InMemoryKeywordStore();

// Add documents
const chunks = chunkText('doc1', documentText, {
  maxChars: 500,
  overlapChars: 50
});
await store.upsert(chunks);

// Query
const results = await store.retrieve('pricing policy', { topK: 3 });
console.log(results); // Top 3 relevant chunks with confidence scores
```

### 3. Controlled Text Generation

```typescript
import { generateControlled } from '@auth-spine/solari-genai-kit';

// Generate with schema validation
const report = await generateControlled({
  modelBaseUrl: 'http://localhost:11434',
  schemaName: 'sales_report',
  userPrompt: 'Generate Q4 sales summary',
  systemPrompt: 'You are a data analyst'
});

// Automatically validates against schema
console.log(report.parsed); // Type-safe, validated output
```

### 4. Fraud Detection

```typescript
import { RiskScorer } from '@auth-spine/ml-platform';

const scorer = new RiskScorer();

// Score a transaction
const score = await scorer.scoreTransaction({
  userId: 'user123',
  amount: 5000,
  location: 'unusual_country',
  time: 'unusual_hour'
});

console.log(score);
// { risk: 0.85, label: 'high', factors: [...] }
```

### 5. Recommendation System

```typescript
import { TwoTowerRecommender } from '@auth-spine/ml-platform';

const recommender = new TwoTowerRecommender({
  userFeatures: ['interests', 'history', 'demographics'],
  itemFeatures: ['category', 'price', 'popularity']
});

// Get recommendations
const recommendations = await recommender.recommend(userId, {
  limit: 10,
  diversityWeight: 0.3
});

console.log(recommendations); // Top 10 items with scores
```

### 6. Time Series Forecasting

```typescript
import { TimeSeriesForecaster } from '@auth-spine/ml-platform';

const forecaster = new TimeSeriesForecaster({
  horizon: 30, // days
  seasonality: 'weekly'
});

// Forecast demand
const forecast = await forecaster.forecast(historicalData);

console.log(forecast);
// { predictions: [...], confidence_intervals: [...] }
```

### 7. Bioplausible Learning

```typescript
import { initMLP, Tensor, DFALearner } from '@auth-spine/bioplausible-learning';

// Create neural network
const mlp = initMLP([10, 20, 5], ['relu', 'linear']);

// Train with DFA
const learner = new DFALearner(mlp, { learningRate: 0.01 });

// Training loop
for (const batch of trainingData) {
  const loss = learner.train(batch.inputs, batch.targets);
  console.log(`Loss: ${loss}`);
}
```

---

## 🔧 Configuration

### Environment Variables

Create a `.env` file:

```bash
# LLM Configuration (optional)
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...

# Local LLM Server (optional)
LLM_BASE_URL=http://localhost:11434/v1
LLM_MODEL=llama-2-7b

# ML Platform
ML_CONFIDENCE_THRESHOLD=0.7
ML_DRIFT_THRESHOLD=0.1

# RAG Configuration
RAG_CHUNK_SIZE=500
RAG_OVERLAP_SIZE=50
RAG_TOP_K=5

# Security
AI_AUTH_LEVEL=authenticated
AI_ENABLE_AUDIT=true
```

### Unified AI Agent Configuration

```typescript
const config = {
  authLevel: 'authenticated',
  
  // Optional LLM
  llmConfig: {
    provider: 'openai',
    apiKey: process.env.OPENAI_API_KEY,
    model: 'gpt-4',
    temperature: 0.7,
    maxTokens: 2000
  },
  
  // Teacher mode for continuous learning
  teacherMode: {
    enabled: true,
    learningMode: 'supervised',
    learningRate: 0.01,
    updateInterval: 100
  },
  
  // Feature access control
  features: {
    sentiment: true,
    intent: true,
    ner: true,
    qa: true,
    summarization: true,
    generation: true
  }
};

const agent = new UnifiedAIAgent(config);
```

---

## 🎓 Learning Modes

### Supervised Learning

```typescript
agent.setLearningMode('supervised');

// Provide feedback on predictions
const prediction = await agent.detectIntent(userInput);
agent.recordFeedback({
  input: userInput,
  prediction: prediction,
  correctLabel: 'booking', // ground truth
  score: 1.0
});
```

### Reinforcement Learning

```typescript
agent.setLearningMode('reinforcement');

// Reward good predictions
const result = await agent.generateResponse(query);
agent.recordFeedback({
  input: query,
  output: result,
  reward: 0.9 // 0-1 score
});
```

### Semi-Supervised Learning

```typescript
agent.setLearningMode('semi-supervised');

// Some labeled, some unlabeled
agent.recordFeedback({
  input: userInput,
  prediction: prediction,
  score: 0.8,
  hasLabel: false // unlabeled data
});
```

---

## 🚀 Deployment Options

### 1. Local Development

```bash
# Start local LLM server (optional)
docker run -p 11434:11434 ollama/ollama

# Start Auth-Spine
npm run dev
```

### 2. Docker Deployment

```yaml
# docker-compose.yml
services:
  auth-spine:
    build: .
    environment:
      - LLM_BASE_URL=http://ollama:11434/v1
  
  ollama:
    image: ollama/ollama
    ports:
      - "11434:11434"
    volumes:
      - ollama_data:/root/.ollama
```

### 3. Cloud Deployment

Use existing deployment guides with AI/ML environment variables.

---

## 📊 Monitoring & Debugging

### Enable Debug Logging

```typescript
const agent = new UnifiedAIAgent({
  authLevel: 'authenticated',
  debug: true
});

// View detailed logs
agent.on('prediction', (event) => {
  console.log('Prediction:', event);
});

agent.on('feedback', (event) => {
  console.log('Feedback recorded:', event);
});
```

### Monitor Performance

```typescript
// Get system capabilities
const capabilities = await agent.getCapabilities();
console.log(capabilities);
// {
//   nlp: { sentiment: 0.95, intent: 0.92, ... },
//   readiness: 0.97
// }

// Get status
const status = agent.getStatus();
console.log(status);
// { initialized: true, llm: 'connected', models: [...] }
```

---

## 🔐 Security Best Practices

1. **Always use authentication**:
   ```typescript
   const agent = new UnifiedAIAgent({ authLevel: 'authenticated' });
   ```

2. **Enable audit logging**:
   ```typescript
   agent.enableAuditLogging();
   ```

3. **Validate inputs**:
   ```typescript
   agent.setInputValidation(true);
   ```

4. **Mask sensitive data**:
   ```typescript
   agent.setOutputMasking(['email', 'phone', 'ssn']);
   ```

5. **Use schema validation**:
   ```typescript
   // Solari GenAI Kit automatically validates
   const result = await generateControlled({
     schemaName: 'user_report', // Must match schema
     ...
   });
   ```

---

## 🆘 Troubleshooting

### Issue: Models not loading

```bash
# Check if models are downloaded
ls ~/.cache/huggingface/

# Force download
node -e "require('@auth-spine/enterprise').downloadModels()"
```

### Issue: LLM connection failed

```bash
# Test LLM endpoint
curl http://localhost:11434/v1/models

# Check environment variables
echo $LLM_BASE_URL
```

### Issue: Out of memory

```typescript
// Use smaller models
const agent = new UnifiedAIAgent({
  modelSize: 'small', // instead of 'base' or 'large'
  batchSize: 1 // process one at a time
});
```

---

## 📚 Next Steps

- [AI/ML_CAPABILITIES.md](AI_ML_CAPABILITIES.md) - Complete feature list
- [AI/ML_DEPLOYMENT.md](AI_ML_DEPLOYMENT.md) - Production deployment
- [AI/ML_API_REFERENCE.md](AI_ML_API_REFERENCE.md) - API documentation
- [AI/ML_INTEGRATION_EXAMPLES.md](AI_ML_INTEGRATION_EXAMPLES.md) - More examples

---

**Ready to build AI-powered features!** 🤖
