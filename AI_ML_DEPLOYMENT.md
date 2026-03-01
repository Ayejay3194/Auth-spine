# AI/ML Deployment Guide

Complete guide for deploying Auth-Spine's AI/ML capabilities in development and production.

---

## 📋 Table of Contents

1. [Local Development](#local-development)
2. [Docker Deployment](#docker-deployment)
3. [Cloud Deployment](#cloud-deployment)
4. [Self-Hosted LLM](#self-hosted-llm)
5. [Production Checklist](#production-checklist)
6. [Monitoring & Observability](#monitoring--observability)

---

## 🚀 Local Development

### Prerequisites

```bash
Node.js >= 18.0.0
PostgreSQL >= 14.0 (for RAG and multi-tenant features)
8GB+ RAM (for local LLM models - optional)
```

### Quick Setup

```bash
# 1. Clone and install
git clone https://github.com/Ayejay3194/Auth-spine.git
cd Auth-spine
npm install

# 2. Build AI/ML packages
npm run build:ai
npm run build:ml
npm run build:llm
npm run build:bioplausible

# 3. Configure environment
cp .env.example .env
nano .env
```

### Environment Configuration

```bash
# .env
# ==========================================
# AI/ML Configuration
# ==========================================

# Unified AI Agent
AI_AUTH_LEVEL=authenticated
AI_ENABLE_AUDIT=true
AI_DEBUG=false

# LLM Configuration (Optional - system works without LLM)
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...

# OR use local LLM
LLM_BASE_URL=http://localhost:11434/v1
LLM_MODEL=llama-2-7b
LLM_TIMEOUT=30000

# ML Platform
ML_CONFIDENCE_THRESHOLD=0.7
ML_DRIFT_THRESHOLD=0.1
ML_ENABLE_CANARY=true

# RAG Configuration
RAG_CHUNK_SIZE=500
RAG_OVERLAP_SIZE=50
RAG_TOP_K=5
RAG_CONFIDENCE_MIN=0.5

# Solari GenAI Kit
GENAI_MODEL_BASE_URL=http://localhost:11434
GENAI_SCHEMA_DIR=./schemas
GENAI_ENABLE_REPAIR=true

# Bioplausible Learning
BIOPLAUSIBLE_LEARNING_RATE=0.01
BIOPLAUSIBLE_BATCH_SIZE=32

# Database (for multi-tenant features)
POSTGRES_URL=******localhost:5432/authspine
```

### Start Development

```bash
# Start all services
npm run dev

# Or start specific services
npm run dev:auth  # Auth server only
npm run dev:ui    # UI only
```

### Verify Installation

```bash
# Run verification script
node scripts/verify-ai-ml.js

# Or manual verification
curl http://localhost:4000/health
curl http://localhost:3000/api/health
```

---

## 🐳 Docker Deployment

### Option 1: Use Existing Docker Compose

The existing `docker-compose.yml` supports AI/ML:

```bash
# Start with AI/ML enabled
docker-compose up -d

# Check logs
docker-compose logs -f auth-server
docker-compose logs -f business-app
```

### Option 2: Docker Compose with Local LLM

Create `docker-compose.ai.yml`:

```yaml
version: '3.8'

services:
  # Existing services from docker-compose.yml
  postgres:
    extends:
      file: docker-compose.yml
      service: postgres

  redis:
    extends:
      file: docker-compose.yml
      service: redis

  auth-server:
    extends:
      file: docker-compose.yml
      service: auth-server
    environment:
      - LLM_BASE_URL=http://ollama:11434/v1
      - LLM_MODEL=llama-2-7b

  business-app:
    extends:
      file: docker-compose.yml
      service: business-app
    environment:
      - LLM_BASE_URL=http://ollama:11434/v1

  # Local LLM Server (Optional)
  ollama:
    image: ollama/ollama:latest
    ports:
      - "11434:11434"
    volumes:
      - ollama_data:/root/.ollama
    environment:
      - OLLAMA_NUM_PARALLEL=2
      - OLLAMA_MAX_LOADED_MODELS=1
    restart: unless-stopped
    deploy:
      resources:
        reservations:
          devices:
            - driver: nvidia
              count: 1
              capabilities: [gpu]

  # vLLM Server (Alternative)
  vllm:
    image: vllm/vllm-openai:latest
    ports:
      - "8000:8000"
    volumes:
      - vllm_cache:/root/.cache/huggingface
    command: >
      --model TheBloke/Llama-2-7B-Chat-GGUF
      --tensor-parallel-size 1
      --dtype auto
    restart: unless-stopped
    deploy:
      resources:
        reservations:
          devices:
            - driver: nvidia
              count: 1
              capabilities: [gpu]

volumes:
  ollama_data:
  vllm_cache:
```

Deploy:

```bash
# Start everything including LLM
docker-compose -f docker-compose.yml -f docker-compose.ai.yml up -d

# Download model
docker exec -it auth-spine-ollama ollama pull llama-2-7b

# Test LLM endpoint
curl http://localhost:11434/v1/models
```

---

## ☁️ Cloud Deployment

### AWS Deployment

#### Option 1: ECS with GPU for LLM

```bash
# Build and push images
docker build -t auth-spine/auth-server -f packages/auth-server/Dockerfile .
docker tag auth-spine/auth-server:latest $ECR_URI/auth-server:latest
docker push $ECR_URI/auth-server:latest

# Deploy with GPU instance for LLM
# Use g4dn.xlarge or larger for local LLM
```

ECS Task Definition:

```json
{
  "family": "auth-spine-ai",
  "requiresCompatibilities": ["EC2"],
  "containerDefinitions": [
    {
      "name": "auth-server",
      "image": "$ECR_URI/auth-server:latest",
      "memory": 2048,
      "cpu": 1024,
      "environment": [
        { "name": "LLM_BASE_URL", "value": "http://localhost:11434/v1" }
      ]
    },
    {
      "name": "ollama",
      "image": "ollama/ollama:latest",
      "memory": 6144,
      "resourceRequirements": [
        { "type": "GPU", "value": "1" }
      ]
    }
  ]
}
```

#### Option 2: Use AWS Bedrock

```bash
# .env
OPENAI_API_KEY=  # Leave empty
AWS_REGION=us-east-1
AWS_BEDROCK_MODEL=anthropic.claude-v2

# No local LLM needed
```

### Google Cloud Deployment

#### Option 1: Cloud Run with Vertex AI

```bash
# Build and deploy
gcloud builds submit --tag gcr.io/PROJECT_ID/auth-spine
gcloud run deploy auth-spine \
  --image gcr.io/PROJECT_ID/auth-spine \
  --platform managed \
  --set-env-vars="VERTEX_AI_PROJECT=PROJECT_ID,VERTEX_AI_LOCATION=us-central1"
```

#### Option 2: GKE with GPU Node Pool

```bash
# Create GPU node pool
gcloud container node-pools create gpu-pool \
  --cluster=auth-spine-cluster \
  --machine-type=n1-standard-4 \
  --accelerator type=nvidia-tesla-t4,count=1

# Deploy with k8s manifests
kubectl apply -f k8s/
kubectl apply -f k8s/ai-ml/
```

### Azure Deployment

```bash
# Deploy with Azure OpenAI
az containerapp create \
  --name auth-spine \
  --resource-group auth-spine-rg \
  --environment auth-spine-env \
  --image auth-spine/auth-server:latest \
  --env-vars \
    OPENAI_API_KEY=$AZURE_OPENAI_KEY \
    OPENAI_API_BASE=$AZURE_OPENAI_ENDPOINT
```

---

## 🖥️ Self-Hosted LLM Options

### Option 1: Ollama (Recommended for Development)

```bash
# Install Ollama
curl https://ollama.ai/install.sh | sh

# Pull model
ollama pull llama-2-7b

# Start server
ollama serve

# Test
curl http://localhost:11434/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{
    "model": "llama-2-7b",
    "messages": [{"role": "user", "content": "Hello!"}]
  }'
```

### Option 2: vLLM (Recommended for Production)

```bash
# Install vLLM
pip install vllm

# Start server
python -m vllm.entrypoints.openai.api_server \
  --model TheBloke/Llama-2-7B-Chat-GGUF \
  --port 8000 \
  --tensor-parallel-size 1

# Test
curl http://localhost:8000/v1/models
```

### Option 3: llama-cpp-python

```bash
# Install
CMAKE_ARGS="-DLLAMA_CUBLAS=on" pip install llama-cpp-python[server]

# Start server
python -m llama_cpp.server \
  --model ./models/llama-2-7b.gguf \
  --n_gpu_layers 32

# Test
curl http://localhost:8080/v1/models
```

### Option 4: Text Generation WebUI

```bash
# Clone and install
git clone https://github.com/oobabooga/text-generation-webui
cd text-generation-webui
./start_linux.sh --api

# Configure in Auth-Spine
LLM_BASE_URL=http://localhost:5000/v1
```

### GPU Requirements

| Model Size | Min VRAM | Recommended GPU |
|-----------|----------|-----------------|
| 7B | 6GB | RTX 3060, T4 |
| 13B | 12GB | RTX 3090, A10 |
| 30B | 24GB | A100 40GB |
| 70B | 48GB | 2x A100 40GB |

### CPU-Only Deployment

For CPU-only deployments, use quantized models:

```bash
# Use GGUF quantized models
ollama pull llama-2-7b-q4_0  # 4-bit quantization

# Or with llama-cpp
python -m llama_cpp.server \
  --model llama-2-7b-Q4_K_M.gguf
```

---

## ✅ Production Checklist

### AI/ML Specific

- [ ] **Model Selection**
  - [ ] Choose appropriate model size for your use case
  - [ ] Test model performance and accuracy
  - [ ] Evaluate latency requirements
  - [ ] Consider cost vs. quality tradeoffs

- [ ] **Resource Planning**
  - [ ] GPU allocation (if using local LLM)
  - [ ] Memory requirements (8GB+ for 7B models)
  - [ ] Storage for model weights
  - [ ] Network bandwidth for cloud APIs

- [ ] **Security**
  - [ ] API keys secured in secrets manager
  - [ ] Input validation enabled
  - [ ] Output sanitization configured
  - [ ] Rate limiting on AI endpoints
  - [ ] Audit logging enabled

- [ ] **Monitoring**
  - [ ] Model performance tracking
  - [ ] Latency monitoring
  - [ ] Error rate alerts
  - [ ] Cost tracking (for cloud APIs)
  - [ ] Drift detection enabled

- [ ] **Backup & Recovery**
  - [ ] Model weights backed up
  - [ ] Training data versioned
  - [ ] Rollback strategy defined
  - [ ] Disaster recovery plan

- [ ] **Compliance**
  - [ ] Data privacy requirements met
  - [ ] Model bias assessed
  - [ ] Explainability requirements
  - [ ] Audit trail complete

### Performance Optimization

- [ ] **Caching**
  - [ ] Enable Redis caching for embeddings
  - [ ] Cache frequent queries
  - [ ] Implement result memoization

- [ ] **Batching**
  - [ ] Batch inference requests
  - [ ] Use optimal batch sizes
  - [ ] Implement request queuing

- [ ] **Model Optimization**
  - [ ] Use quantized models (4-bit, 8-bit)
  - [ ] Enable model caching
  - [ ] Optimize tokenization
  - [ ] Use flash attention (if available)

---

## 📊 Monitoring & Observability

### Metrics to Track

```typescript
// Custom metrics for AI/ML
const metrics = {
  // Latency
  llm_latency_ms: histogram,
  embedding_latency_ms: histogram,
  rag_retrieval_latency_ms: histogram,
  
  // Accuracy
  sentiment_accuracy: gauge,
  intent_accuracy: gauge,
  ner_accuracy: gauge,
  
  // Usage
  llm_requests_total: counter,
  llm_tokens_total: counter,
  rag_queries_total: counter,
  
  // Errors
  llm_errors_total: counter,
  validation_failures_total: counter,
  
  // ML Platform
  ml_predictions_total: counter,
  ml_drift_detected: counter,
  ml_canary_failures: counter
};
```

### Logging

```typescript
// Enable structured logging
const logger = {
  info: (message, metadata) => {
    console.log(JSON.stringify({
      level: 'info',
      message,
      timestamp: new Date().toISOString(),
      ...metadata
    }));
  },
  
  // Log AI/ML events
  logPrediction: (input, output, metadata) => {
    logger.info('ai_prediction', {
      input_length: input.length,
      output_length: output.length,
      model: metadata.model,
      latency_ms: metadata.latency,
      confidence: metadata.confidence
    });
  }
};
```

### Dashboards

Recommended dashboard panels:

1. **Performance**
   - LLM response time (p50, p95, p99)
   - Embedding generation time
   - RAG retrieval time

2. **Accuracy**
   - Sentiment analysis accuracy over time
   - Intent detection accuracy
   - Model drift indicators

3. **Usage**
   - Requests per minute
   - Token usage (for cost tracking)
   - Active models

4. **Errors**
   - Error rate by type
   - Validation failures
   - Timeout errors

5. **Costs**
   - API costs (for cloud providers)
   - GPU utilization
   - Storage costs

### Alerting

Set up alerts for:

```yaml
alerts:
  - name: HighErrorRate
    condition: ai_errors_total > 100 in 5m
    severity: critical
  
  - name: HighLatency
    condition: llm_latency_ms.p95 > 5000
    severity: warning
  
  - name: ModelDrift
    condition: ml_drift_detected > 0
    severity: warning
  
  - name: LowAccuracy
    condition: sentiment_accuracy < 0.8
    severity: warning
  
  - name: HighCost
    condition: daily_api_cost > budget_threshold
    severity: warning
```

---

## 🔧 Troubleshooting

### Common Issues

**1. Out of Memory**

```bash
# Reduce model size
ollama pull llama-2-7b-q4_0  # Use quantized version

# Or reduce context window
LLM_MAX_TOKENS=1024  # Instead of 2048
```

**2. Slow Inference**

```bash
# Enable GPU
docker run --gpus all ollama/ollama

# Or use smaller model
LLM_MODEL=llama-2-7b  # Instead of 13b or 70b

# Enable caching
ENABLE_MODEL_CACHE=true
```

**3. Connection Timeout**

```bash
# Increase timeout
LLM_TIMEOUT=60000  # 60 seconds

# Check LLM server
curl http://localhost:11434/v1/models
```

**4. High API Costs**

```bash
# Use local LLM instead
LLM_BASE_URL=http://localhost:11434/v1

# Enable caching
ENABLE_RESULT_CACHE=true

# Set rate limits
MAX_REQUESTS_PER_MINUTE=100
```

---

## 📚 Next Steps

- [AI_ML_CAPABILITIES.md](AI_ML_CAPABILITIES.md) - Full feature list
- [AI_ML_QUICK_START.md](AI_ML_QUICK_START.md) - Getting started
- [AI_ML_API_REFERENCE.md](AI_ML_API_REFERENCE.md) - API docs (coming soon)
- [AI_ML_INTEGRATION_EXAMPLES.md](AI_ML_INTEGRATION_EXAMPLES.md) - Examples (coming soon)

---

**Deploy AI/ML capabilities anywhere!** 🚀🤖
