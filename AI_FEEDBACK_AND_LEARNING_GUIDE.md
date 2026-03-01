# AI Feedback & Supervised Learning Guide

## Overview

Auth-Spine AI platform now features a **comprehensive feedback collection and supervised learning system** that enables:

1. **Multiple Feedback Modes** - Thumbs, ratings, text, categories
2. **Customer Service Prompts** - Proactively asks "How could I improve?"
3. **Supervised Learning** - Learns from feedback with human oversight
4. **Improvement Suggestions** - System generates actionable recommendations
5. **Human-in-the-Loop** - Approval workflow for all changes

---

## 🎯 Quick Start

### Basic Setup

```typescript
import { getAIPlatform } from '@auth-spine/enterprise';

const ai = getAIPlatform({
  llm: {
    baseUrl: process.env.LLM_BASE_URL,
    apiKey: process.env.LLM_API_KEY,
    defaultModel: 'gpt-3.5-turbo'
  },
  enableFeedback: true,   // Enable feedback collection
  enableLearning: true    // Enable supervised learning
});

await ai.initialize();
```

### Collect Feedback

```typescript
// Quick thumbs feedback
await ai.giveFeedback(requestId, 'up', { userId: 'user123' });

// Detailed rating
await ai.rateResponse(requestId, 4, {
  accuracy: 5,
  helpfulness: 4,
  tone: 4,
  relevance: 5
}, "Very helpful, but could be more concise");

// Improvement suggestion
await ai.suggestImprovement(requestId, "Add more examples please");
```

### Customer Service Prompts

```typescript
// Check if should ask for feedback
if (ai.shouldAskForFeedback()) {
  const prompt = ai.getFeedbackPrompt('improvement');
  
  console.log(prompt.question);
  // "How could I improve my response?"
  
  console.log(prompt.context);
  // "I want to provide the best possible assistance."
  
  // Show to user and collect their response
  const userFeedback = await askUser(prompt.question);
  await ai.suggestImprovement(requestId, userFeedback);
}
```

### Review Learning Insights

```typescript
// Get insights summary
const insights = ai.getLearningInsights(7);  // Last 7 days

console.log(`Total insights: ${insights.totalInsights}`);
console.log(`Avg confidence: ${(insights.avgConfidence * 100).toFixed(1)}%`);

// Top insights
insights.topInsights.forEach(insight => {
  console.log(`
    ${insight.type}: ${insight.insight}
    Confidence: ${(insight.confidence * 100).toFixed(1)}%
    Based on ${insight.feedbackCount} feedback entries
  `);
});
```

### Approve Suggestions

```typescript
// Get pending suggestions
const pending = ai.getPendingApprovals();

for (const suggestion of pending) {
  console.log(`
    ${suggestion.area}: ${suggestion.suggestion}
    Expected improvement: ${suggestion.expectedImprovement}%
    Confidence: ${(suggestion.confidence * 100).toFixed(1)}%
  `);
  
  // Approve or reject
  await ai.approveSuggestion(suggestion.id, 'admin@company.com');
  // or
  await ai.rejectSuggestion(suggestion.id, 'Not applicable now');
}
```

---

## 📋 Feedback Types

### 1. Thumbs Up/Down (Quick Feedback)

**Use Case**: Simple, immediate feedback on response quality

```typescript
// Positive feedback
await ai.giveFeedback(requestId, 'up', {
  userId: 'user123',
  tenantId: 'acme-corp',
  sessionId: 'session-456'
});

// Negative feedback
await ai.giveFeedback(requestId, 'down', {
  userId: 'user123'
});
```

**When to Use**:
- ✅ Quick user feedback
- ✅ High-volume scenarios
- ✅ Mobile/compact UIs
- ✅ Initial sentiment capture

### 2. Star Ratings (1-5)

**Use Case**: Detailed satisfaction rating

```typescript
await ai.rateResponse(requestId, 4, undefined, "Good response!");
```

**Rating Scale**:
- 5 stars: Excellent
- 4 stars: Good
- 3 stars: Acceptable
- 2 stars: Poor
- 1 star: Very poor

**When to Use**:
- ✅ Detailed feedback collection
- ✅ Quality benchmarking
- ✅ Customer satisfaction surveys

### 3. Category Ratings

**Use Case**: Specific feedback on different aspects

```typescript
await ai.rateResponse(requestId, 4, {
  accuracy: 5,      // How accurate was the information?
  helpfulness: 4,   // How helpful was the response?
  tone: 5,          // Was the tone appropriate?
  relevance: 4,     // Was it relevant to your question?
  completeness: 3   // Was it complete enough?
}, "Accurate but could be more complete");
```

**Categories**:
- **Accuracy**: Factual correctness
- **Helpfulness**: Usefulness to user
- **Tone**: Communication style
- **Relevance**: On-topic
- **Completeness**: Thoroughness

**When to Use**:
- ✅ Identifying specific improvement areas
- ✅ Detailed quality analysis
- ✅ Training data for learning

### 4. Text Feedback & Suggestions

**Use Case**: Open-ended improvement suggestions

```typescript
await ai.suggestImprovement(
  requestId,
  "Could provide more code examples and explain edge cases",
  {
    wasHelpful: true,
    userId: 'user123',
    tenantId: 'acme-corp'
  }
);
```

**When to Use**:
- ✅ Specific improvement ideas
- ✅ Feature requests
- ✅ Detailed user needs
- ✅ Learning system input

---

## 🎙️ Customer Service Prompts

### Proactive Feedback Collection

The system automatically prompts users for feedback after N responses (configurable):

```typescript
const ai = getAIPlatform({
  feedbackConfig: {
    promptAfterResponses: 5,  // Ask every 5 responses
    proactivePrompts: true
  }
});

// In your chat loop
if (ai.shouldAskForFeedback()) {
  const prompt = ai.getFeedbackPrompt();
  showPromptToUser(prompt);
}
```

### Prompt Types

**1. Improvement Questions**

```typescript
const prompt = ai.getFeedbackPrompt('improvement');
```

Examples:
- "How could I improve my response?"
- "What would make this response more helpful?"
- Context: "I want to provide the best possible assistance"
- Follow-up: "What specific aspect would you like me to enhance?"

**2. Clarification Questions**

```typescript
const prompt = ai.getFeedbackPrompt('clarification');
```

Examples:
- "Was anything unclear in my response?"
- Follow-up: "What can I clarify for you?"

**3. Satisfaction Questions**

```typescript
const prompt = ai.getFeedbackPrompt('satisfaction');
```

Examples:
- "Did this response meet your expectations?"
- Follow-up: "What would have made it better?"

**4. Suggestion Questions**

```typescript
const prompt = ai.getFeedbackPrompt('suggestion');
```

Examples:
- "Do you have any suggestions for how I could assist you better?"
- "What features or capabilities would be most valuable to you?"
- Context: "I continuously learn from user feedback to improve"

### Contextual Prompts

Adapts based on previous feedback:

```typescript
// If user gave negative feedback, ask for improvement
// If user gave positive feedback, ask for suggestions
const prompt = feedbackCollector.getContextualPrompt(previousFeedback);
```

---

## 🤖 Supervised Learning

### How It Works

1. **Collect Feedback** - Users provide feedback on responses
2. **Analyze Patterns** - System identifies trends and issues
3. **Generate Insights** - Creates learning insights with confidence scores
4. **Create Suggestions** - Generates actionable improvement recommendations
5. **Human Review** - Admin approves or rejects suggestions
6. **Test (Optional)** - A/B test before full deployment
7. **Deploy** - Apply approved improvements

### Learning Modes

```typescript
const ai = getAIPlatform({
  learningConfig: {
    mode: 'supervised',  // Options: 'supervised', 'autonomous', 'disabled'
    minFeedbackForInsight: 10,
    minConfidenceForSuggestion: 0.7,
    requireApproval: true,
    autoApproveThreshold: 0.95  // Auto-approve if confidence > 95%
  }
});
```

**Modes**:
- **supervised**: Requires human approval (recommended)
- **autonomous**: Auto-deploys high-confidence suggestions
- **disabled**: Feedback collection only, no learning

### Analyzing Feedback

```typescript
// Collect recent feedback (from Parquet or other storage)
const recentFeedback: FeedbackEntry[] = [
  // ... feedback entries
];

// Analyze and generate insights
const insights = await ai.analyzeAndLearn(recentFeedback);

insights.forEach(insight => {
  console.log(`
    Type: ${insight.type}
    Insight: ${insight.insight}
    Confidence: ${(insight.confidence * 100).toFixed(1)}%
    Feedback Count: ${insight.feedbackCount}
    Success Rate: ${(insight.successRate * 100).toFixed(1)}%
  `);
});
```

### Insight Types

**1. Pattern**
- General observations about system behavior
- Example: "Response mode 'instant' shows mixed performance with 65% helpful rate"

**2. Improvement**
- Specific improvement opportunities
- Example: "60% of suggestions mention making responses more detailed"

**3. Warning**
- Issues requiring attention
- Example: "Model gpt-3.5-turbo has low performance with only 45% helpful rate"

**4. Success**
- Well-performing aspects
- Example: "Model gpt-4 is performing well with 92% helpful rate"

### Generating Suggestions

```typescript
// Generate improvement suggestions
const suggestions = await ai.generateImprovementSuggestions();

suggestions.forEach(suggestion => {
  console.log(`
    Area: ${suggestion.area}
    Suggestion: ${suggestion.suggestion}
    Rationale: ${suggestion.rationale}
    Confidence: ${(suggestion.confidence * 100).toFixed(1)}%
    Expected Improvement: ${suggestion.expectedImprovement}%
    Based on: ${suggestion.basedOnFeedback} feedback entries
    Status: ${suggestion.status}
  `);
});
```

### Suggestion Areas

**1. Prompt** - System prompt refinements
```typescript
{
  area: 'prompt',
  suggestion: 'Refine system prompts to emphasize accuracy and fact-checking',
  rationale: "Category 'accuracy' has lowest average rating of 3.2/5"
}
```

**2. Model** - Model selection
```typescript
{
  area: 'model',
  suggestion: 'Consider switching from gpt-3.5-turbo to a better-performing model',
  rationale: 'Model gpt-3.5-turbo has low performance with only 45% helpful rate'
}
```

**3. Parameters** - Generation parameters
```typescript
{
  area: 'parameters',
  suggestion: 'Increase max_tokens parameter for more detailed responses',
  rationale: '65% of suggestions mention making responses more detailed'
}
```

**4. Workflow** - Process improvements
```typescript
{
  area: 'workflow',
  suggestion: 'Use instant mode for simple queries to improve response time',
  rationale: '60% of suggestions mention making responses faster'
}
```

---

## 👥 Human-in-the-Loop Approval

### Approval Workflow

```typescript
// 1. Get pending suggestions
const pending = ai.getPendingApprovals();

console.log(`${pending.length} suggestions need review`);

// 2. Review each suggestion
for (const suggestion of pending) {
  console.log(`
    ID: ${suggestion.id}
    Suggestion: ${suggestion.suggestion}
    Confidence: ${(suggestion.confidence * 100).toFixed(1)}%
    Expected Improvement: ${suggestion.expectedImprovement}%
    Based on ${suggestion.basedOnFeedback} feedback entries
  `);
  
  // 3. Approve or reject
  const approved = await adminReview(suggestion);
  
  if (approved) {
    await ai.approveSuggestion(
      suggestion.id,
      'admin@company.com',
      skipTesting = false  // Run A/B test first
    );
  } else {
    await ai.rejectSuggestion(
      suggestion.id,
      'Not applicable for our use case'
    );
  }
}
```

### Auto-Approval

High-confidence suggestions can be auto-approved:

```typescript
const ai = getAIPlatform({
  learningConfig: {
    mode: 'supervised',
    requireApproval: true,
    autoApproveThreshold: 0.95  // Auto-approve if confidence > 95%
  }
});
```

If a suggestion has confidence > 0.95, it's automatically approved (but can still require A/B testing).

### Suggestion Statuses

- **pending**: Awaiting approval
- **approved**: Approved, ready for testing/deployment
- **rejected**: Rejected by admin
- **testing**: Currently in A/B test
- **deployed**: Live in production

---

## 📊 Analytics & Monitoring

### Feedback Statistics

```typescript
const stats = await ai.getFeedbackStats({
  startDate: new Date('2024-01-01'),
  endDate: new Date('2024-01-31'),
  tenantId: 'acme-corp'
});

console.log(stats);
// {
//   totalFeedback: 1250,
//   helpfulRate: 0.87,
//   avgRating: 4.2,
//   thumbsUpRate: 0.85,
//   sentimentBreakdown: {
//     positive: 1050,
//     neutral: 125,
//     negative: 75
//   },
//   topImprovements: [
//     { suggestion: 'more examples', count: 85 },
//     { suggestion: 'faster responses', count: 62 }
//   ],
//   categoryRatings: {
//     accuracy: 4.5,
//     helpfulness: 4.3,
//     tone: 4.7,
//     relevance: 4.4,
//     completeness: 3.9
//   }
// }
```

### Learning Insights Summary

```typescript
const summary = ai.getLearningInsights(30);  // Last 30 days

console.log(`
  Total Insights: ${summary.totalInsights}
  Average Confidence: ${(summary.avgConfidence * 100).toFixed(1)}%
  
  By Type:
    - Patterns: ${summary.byType.pattern || 0}
    - Improvements: ${summary.byType.improvement || 0}
    - Warnings: ${summary.byType.warning || 0}
    - Successes: ${summary.byType.success || 0}
  
  Top Insights:
`);

summary.topInsights.slice(0, 5).forEach((insight, i) => {
  console.log(`
    ${i + 1}. ${insight.insight}
       Confidence: ${(insight.confidence * 100).toFixed(1)}%
       Feedback: ${insight.feedbackCount} entries
  `);
});
```

### Health Monitoring

```typescript
const health = await ai.getHealth();

console.log(`
  Feedback System: ${health.feedbackReady ? '✓' : '✗'}
  Learning System: ${health.learningReady ? '✓' : '✗'}
  
  Feedback Stats:
    - Total Feedback: ${health.feedback?.totalFeedback}
    - Helpful Rate: ${((health.feedback?.helpfulRate || 0) * 100).toFixed(1)}%
    - Avg Rating: ${health.feedback?.avgRating?.toFixed(1)}/5
  
  Learning Stats:
    - Total Insights: ${health.learning?.totalInsights}
    - Pending Suggestions: ${health.learning?.pendingSuggestions}
    - Approved Suggestions: ${health.learning?.approvedSuggestions}
`);
```

---

## 🔧 Configuration

### Complete Configuration

```typescript
const ai = getAIPlatform({
  llm: {
    baseUrl: process.env.LLM_BASE_URL,
    apiKey: process.env.LLM_API_KEY,
    defaultModel: 'gpt-3.5-turbo',
    timeoutMs: 30000
  },
  
  enableFeedback: true,
  feedbackConfig: {
    dataDir: './data/ai-feedback',
    promptAfterResponses: 5,
    proactivePrompts: true,
    storeInParquet: true,
    retentionDays: 365
  },
  
  enableLearning: true,
  learningConfig: {
    mode: 'supervised',
    minFeedbackForInsight: 10,
    minConfidenceForSuggestion: 0.7,
    requireApproval: true,
    autoApproveThreshold: 0.95,
    enableABTesting: true,
    testDuration: 7 * 24 * 60 * 60,  // 7 days
    testSampleSize: 100
  }
});
```

### Feedback Configuration

```typescript
feedbackConfig: {
  // Storage
  dataDir: './data/ai-feedback',
  storeInParquet: true,
  retentionDays: 365,
  
  // Prompting
  promptAfterResponses: 5,  // Ask every N responses
  proactivePrompts: true,   // Enable customer service prompts
}
```

### Learning Configuration

```typescript
learningConfig: {
  // Mode
  mode: 'supervised',  // supervised, autonomous, disabled
  
  // Thresholds
  minFeedbackForInsight: 10,      // Min feedback to generate insight
  minConfidenceForSuggestion: 0.7, // Min confidence for suggestion
  
  // Approval
  requireApproval: true,
  autoApproveThreshold: 0.95,
  
  // A/B Testing
  enableABTesting: true,
  testDuration: 7 * 24 * 60 * 60,  // 7 days
  testSampleSize: 100
}
```

---

## 💡 Best Practices

### 1. Collect Diverse Feedback

```typescript
// ✅ Use multiple feedback types
await ai.giveFeedback(requestId, 'up');  // Quick
await ai.rateResponse(requestId, 4, categories);  // Detailed
await ai.suggestImprovement(requestId, text);  // Specific

// ❌ Don't rely on just one type
await ai.giveFeedback(requestId, 'up');  // Only thumbs
```

### 2. Prompt Strategically

```typescript
// ✅ Ask at the right time
if (ai.shouldAskForFeedback()) {  // After N responses
  const prompt = ai.getFeedbackPrompt('improvement');
  showToUser(prompt);
}

// ❌ Don't spam users
// Asking after every single response
```

### 3. Review Regularly

```typescript
// ✅ Regular review schedule
setInterval(async () => {
  const pending = ai.getPendingApprovals();
  if (pending.length > 0) {
    notifyAdmin(`${pending.length} suggestions need review`);
  }
}, 24 * 60 * 60 * 1000);  // Daily

// ❌ Don't ignore suggestions
// Letting suggestions pile up
```

### 4. Act on Insights

```typescript
// ✅ Monitor and act
const insights = ai.getLearningInsights(7);
const warnings = insights.topInsights.filter(i => i.type === 'warning');

for (const warning of warnings) {
  console.warn(`Action needed: ${warning.insight}`);
  // Take action based on warning
}

// ❌ Don't just collect data
// Collecting feedback but never reviewing
```

### 5. Test Before Deploying

```typescript
// ✅ A/B test improvements
await ai.approveSuggestion(
  suggestionId,
  adminEmail,
  skipTesting = false  // Run A/B test
);

// ❌ Don't deploy blindly
await ai.approveSuggestion(id, email, true);  // Skip testing
```

---

## 🎯 Use Cases

### Use Case 1: Customer Support Bot

```typescript
// Bot responds to user
const response = await ai.instant(messages, { userId });

// Show response
showToUser(response);

// Collect quick feedback
const thumbs = await askUserForThumbs();
await ai.giveFeedback(requestId, thumbs, { userId });

// Periodic improvement question
if (ai.shouldAskForFeedback()) {
  const prompt = ai.getFeedbackPrompt('improvement');
  const suggestion = await askUser(prompt.question);
  
  if (suggestion) {
    await ai.suggestImprovement(requestId, suggestion, { userId });
  }
}
```

### Use Case 2: Documentation Q&A

```typescript
// User asks about docs
const response = await ai.long(messages);

// Collect detailed feedback
const rating = await askUserForRating();
await ai.rateResponse(requestId, rating, {
  accuracy: await askAccuracyRating(),
  helpfulness: await askHelpfulnessRating(),
  completeness: await askCompletenessRating()
});

// Analyze feedback monthly
setInterval(async () => {
  const insights = await ai.analyzeAndLearn(lastMonthFeedback);
  const suggestions = await ai.generateImprovementSuggestions();
  
  // Review with team
  reviewWithTeam(suggestions);
}, 30 * 24 * 60 * 60 * 1000);
```

### Use Case 3: Code Assistant

```typescript
// Generate code
const code = await ai.long(messages);

// Collect category ratings
await ai.rateResponse(requestId, 5, {
  accuracy: 5,      // Code works correctly
  helpfulness: 4,   // Solved the problem
  completeness: 3,  // Missing edge cases
  tone: 5          // Clear explanations
}, "Great code but needs edge case handling");

// Learning system identifies pattern
// Insight: "Category 'completeness' rated lower (3.2/5)"
// Suggestion: "Add more comprehensive code examples with edge cases"
```

---

## 🚀 Advanced Features

### Custom Prompts

```typescript
// Add custom feedback prompts
feedbackCollector.feedbackPrompts.push({
  id: 'custom_1',
  type: 'suggestion',
  question: 'What domain-specific features would help you most?',
  context: 'We\'re building specialized tools for your industry'
});
```

### Sentiment Analysis

Built-in simple sentiment analysis on text feedback:

```typescript
// Automatically analyzes sentiment
await ai.suggestImprovement(requestId, "This is great!");
// sentiment: 'positive'

await ai.suggestImprovement(requestId, "This is terrible!");
// sentiment: 'negative'
```

### Confidence Scoring

All insights and suggestions include confidence scores:

```typescript
const insights = await ai.analyzeAndLearn(feedback);

insights.forEach(insight => {
  if (insight.confidence > 0.8) {
    console.log('High confidence:', insight.insight);
  } else if (insight.confidence > 0.5) {
    console.log('Medium confidence:', insight.insight);
  } else {
    console.log('Low confidence:', insight.insight);
  }
});
```

---

## 📚 API Reference

### Feedback Methods

```typescript
// Quick feedback
ai.giveFeedback(requestId, thumbs, context?): Promise<void>

// Detailed rating
ai.rateResponse(requestId, rating, categories?, text?): Promise<void>

// Text feedback
ai.suggestImprovement(requestId, suggestion, context?): Promise<void>

// Prompting
ai.shouldAskForFeedback(): boolean
ai.getFeedbackPrompt(type?): FeedbackPrompt | null

// Analytics
ai.getFeedbackStats(filters?): Promise<FeedbackStats>
```

### Learning Methods

```typescript
// Analysis
ai.analyzeAndLearn(feedback): Promise<LearningInsight[]>

// Suggestions
ai.generateImprovementSuggestions(): Promise<ImprovementSuggestion[]>
ai.getPendingApprovals(): ImprovementSuggestion[]

// Approval
ai.approveSuggestion(id, approvedBy, skipTesting?): Promise<void>
ai.rejectSuggestion(id, reason?): Promise<void>

// Insights
ai.getLearningInsights(days?): InsightsSummary
```

---

## 🎉 Summary

Auth-Spine AI platform now provides:

✅ **Multiple Feedback Types** - Thumbs, ratings, text, categories  
✅ **Customer Service Prompts** - Proactive improvement questions  
✅ **Supervised Learning** - Learns from feedback patterns  
✅ **Human Oversight** - Approval workflow for changes  
✅ **Actionable Insights** - Specific improvement suggestions  
✅ **Quality Tracking** - Monitor performance by category  
✅ **Continuous Improvement** - System gets better over time  

**A complete feedback and learning system for production AI!** 🚀✨
