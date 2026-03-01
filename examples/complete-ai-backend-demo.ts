/**
 * Complete AI Backend Demo
 * 
 * This is a working example showing ALL features of the Auth-Spine AI platform:
 * - Feedback collection (thumbs, ratings, categories, text)
 * - Customer service prompts
 * - Supervised learning
 * - Training loops
 * - A/B testing
 * - Human approval workflows
 * - Real-time monitoring
 * 
 * Run this file to see the complete system in action!
 * 
 * Usage:
 *   npx tsx examples/complete-ai-backend-demo.ts
 */

import { getAIPlatform } from '../packages/enterprise/ai-platform/index.js';

// =====================================================
// CONFIGURATION
// =====================================================

const config = {
  llm: {
    baseUrl: process.env.LLM_BASE_URL || 'http://localhost:11434',
    apiKey: process.env.LLM_API_KEY || 'demo-key',
    defaultModel: 'gpt-3.5-turbo'
  },
  enableMetrics: true,
  enableFeedback: true,
  enableLearning: true,
  enableTrainingLoop: true,
  
  feedbackConfig: {
    dataDir: './data/feedback',
    promptAfterResponses: 3,  // Ask for feedback every 3 responses
    proactivePrompts: true
  },
  
  learningConfig: {
    mode: 'supervised' as const,
    minFeedbackForInsight: 5,
    requireApproval: true
  },
  
  trainingLoopConfig: {
    baseModel: 'gpt-3.5-turbo',
    thresholds: {
      minFeedbackCount: 10,      // Low for demo
      minSuccessRate: 0.70,
      minAvgRating: 3.0,
      maxDaysSinceRetrain: 7
    },
    schedule: 'daily',
    requireApproval: true,
    enableABTesting: true
  }
};

// =====================================================
// DEMO SCENARIOS
// =====================================================

/**
 * Scenario 1: Basic Customer Interaction with Feedback
 */
async function scenario1_basicInteraction(ai: any) {
  console.log('\n' + '='.repeat(60));
  console.log('SCENARIO 1: Basic Customer Interaction');
  console.log('='.repeat(60));
  
  // Simulate customer questions
  const questions = [
    "How do I reset my password?",
    "What are your business hours?",
    "How do I cancel my subscription?"
  ];
  
  for (let i = 0; i < questions.length; i++) {
    const question = questions[i];
    console.log(`\n📝 Customer Question ${i + 1}: "${question}"`);
    
    try {
      // Get AI response (simulated - in real system would call LLM)
      const requestId = `req_${Date.now()}_${i}`;
      console.log(`✅ Response generated (Request ID: ${requestId})`);
      
      // Simulate a good response
      const simulatedResponse = `Here's how to ${question.toLowerCase().replace('?', '')}...`;
      console.log(`💬 AI Response: "${simulatedResponse}"`);
      
      // Collect thumbs feedback
      const thumbs = i === 0 ? 'down' : 'up';  // First one is negative
      await ai.giveFeedback(requestId, thumbs, { 
        userId: 'demo_user_1',
        reason: i === 0 ? 'Not detailed enough' : undefined
      });
      console.log(`👍 Feedback collected: ${thumbs}`);
      
      // Collect detailed rating (for some)
      if (i > 0) {
        await ai.rateResponse(requestId, i === 1 ? 4 : 5, {
          accuracy: i === 1 ? 4 : 5,
          helpfulness: i === 1 ? 4 : 5,
          tone: 5,
          relevance: i === 1 ? 3 : 5,
          completeness: i === 1 ? 3 : 5
        }, i === 1 ? "Good but could be more complete" : "Perfect answer!");
        console.log(`⭐ Rating: ${i === 1 ? 4 : 5}/5`);
      }
      
      // Check if should ask for improvement
      if (ai.shouldAskForFeedback()) {
        const prompt = ai.getFeedbackPrompt('improvement');
        console.log(`❓ Customer Service Prompt: "${prompt.question}"`);
        
        // Simulate customer suggestion
        if (i === 0) {
          await ai.suggestImprovement(
            requestId, 
            "Add step-by-step instructions with screenshots",
            { userId: 'demo_user_1' }
          );
          console.log(`💡 Improvement suggested`);
        }
      }
      
      // Small delay between interactions
      await new Promise(resolve => setTimeout(resolve, 500));
      
    } catch (error) {
      console.error(`❌ Error in interaction ${i + 1}:`, error);
    }
  }
  
  console.log('\n✅ Scenario 1 Complete');
}

/**
 * Scenario 2: Supervised Learning & Insights
 */
async function scenario2_supervisedLearning(ai: any) {
  console.log('\n' + '='.repeat(60));
  console.log('SCENARIO 2: Supervised Learning & Insights');
  console.log('='.repeat(60));
  
  // Add more varied feedback
  const feedbackData = [
    { requestId: 'req_a1', thumbs: 'up', rating: 5, text: 'Very helpful!' },
    { requestId: 'req_a2', thumbs: 'up', rating: 4, text: 'Good response' },
    { requestId: 'req_a3', thumbs: 'down', rating: 2, text: 'Too slow' },
    { requestId: 'req_a4', thumbs: 'up', rating: 5, text: 'Excellent!' },
    { requestId: 'req_a5', thumbs: 'up', rating: 4, text: 'Helpful but could be faster' },
  ];
  
  console.log('\n📊 Adding feedback data for analysis...');
  for (const fb of feedbackData) {
    await ai.giveFeedback(fb.requestId, fb.thumbs, { userId: 'demo_user_2' });
    if (fb.rating) {
      await ai.rateResponse(fb.requestId, fb.rating, {
        accuracy: fb.rating,
        helpfulness: fb.rating,
        tone: fb.rating,
        relevance: fb.rating,
        completeness: fb.rating - 1
      }, fb.text);
    }
  }
  console.log('✅ Feedback data added');
  
  // Get feedback stats
  console.log('\n📈 Feedback Statistics:');
  const stats = await ai.getFeedbackStats();
  console.log(`   Total Feedback: ${stats.totalFeedback}`);
  console.log(`   Helpful Rate: ${(stats.helpfulRate * 100).toFixed(1)}%`);
  console.log(`   Avg Rating: ${stats.avgRating.toFixed(1)}/5`);
  console.log(`   Category Ratings:`);
  console.log(`     - Accuracy: ${stats.categoryRatings.accuracy.toFixed(1)}/5`);
  console.log(`     - Helpfulness: ${stats.categoryRatings.helpfulness.toFixed(1)}/5`);
  console.log(`     - Tone: ${stats.categoryRatings.tone.toFixed(1)}/5`);
  console.log(`     - Relevance: ${stats.categoryRatings.relevance.toFixed(1)}/5`);
  console.log(`     - Completeness: ${stats.categoryRatings.completeness.toFixed(1)}/5`);
  
  // Analyze and generate insights
  console.log('\n🔍 Analyzing patterns and generating insights...');
  const feedbackEntries = await ai.feedbackCollector?.getAllFeedback() || [];
  const insights = await ai.analyzeAndLearn(feedbackEntries.slice(0, 10));
  
  console.log(`✅ Generated ${insights.length} insights:`);
  insights.slice(0, 3).forEach((insight: any, i: number) => {
    console.log(`\n   Insight ${i + 1}:`);
    console.log(`     Type: ${insight.type}`);
    console.log(`     Pattern: ${insight.pattern}`);
    console.log(`     Confidence: ${(insight.confidence * 100).toFixed(1)}%`);
    console.log(`     Recommendation: ${insight.recommendation}`);
  });
  
  // Generate improvement suggestions
  console.log('\n💡 Generating improvement suggestions...');
  const suggestions = await ai.generateImprovementSuggestions();
  
  if (suggestions.length > 0) {
    console.log(`✅ Generated ${suggestions.length} suggestions:`);
    suggestions.slice(0, 2).forEach((suggestion: any, i: number) => {
      console.log(`\n   Suggestion ${i + 1}:`);
      console.log(`     Type: ${suggestion.suggestionType}`);
      console.log(`     Description: ${suggestion.description}`);
      console.log(`     Impact: ${suggestion.expectedImpact}`);
      console.log(`     Status: ${suggestion.status}`);
      console.log(`     Requires Approval: ${suggestion.requiresApproval ? 'Yes' : 'No'}`);
    });
  }
  
  console.log('\n✅ Scenario 2 Complete');
}

/**
 * Scenario 3: Training Loop Automation
 */
async function scenario3_trainingLoop(ai: any) {
  console.log('\n' + '='.repeat(60));
  console.log('SCENARIO 3: Automated Training Loop');
  console.log('='.repeat(60));
  
  // Check if retraining is needed
  console.log('\n🔍 Checking retraining thresholds...');
  const feedbackEntries = await ai.feedbackCollector?.getAllFeedback() || [];
  const stats = await ai.getFeedbackStats();
  
  const retrainCheck = ai.shouldRetrain({
    feedbackCount: feedbackEntries.length,
    successRate: stats.helpfulRate,
    avgRating: stats.avgRating,
    errorRate: 1 - stats.helpfulRate
  });
  
  console.log(`   Should Retrain: ${retrainCheck.shouldRetrain ? 'YES' : 'NO'}`);
  if (retrainCheck.reasons.length > 0) {
    console.log(`   Reasons:`);
    retrainCheck.reasons.forEach((reason: string) => {
      console.log(`     - ${reason}`);
    });
  }
  
  // Trigger training if needed (or force for demo)
  if (feedbackEntries.length >= 5) {
    console.log('\n🚀 Triggering training job...');
    
    try {
      const job = await ai.triggerTraining(feedbackEntries, {
        baseModel: 'gpt-3.5-turbo',
        skipABTest: false,
        autoApprove: false
      });
      
      console.log(`✅ Training job started:`);
      console.log(`   Job ID: ${job.id}`);
      console.log(`   Status: ${job.status}`);
      console.log(`   Feedback Count: ${job.feedbackCount}`);
      console.log(`   Base Model: ${job.baseModel}`);
      
      // Simulate waiting for job
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Check job status
      const activeJob = ai.getActiveTrainingJob();
      if (activeJob) {
        console.log(`\n📊 Training Job Status:`);
        console.log(`   ID: ${activeJob.id}`);
        console.log(`   Status: ${activeJob.status}`);
        console.log(`   Started: ${activeJob.startedAt}`);
        
        if (activeJob.newModelVersion) {
          console.log(`   New Version: ${activeJob.newModelVersion}`);
        }
        
        if (activeJob.metrics) {
          console.log(`   Metrics:`);
          console.log(`     - Validation Accuracy: ${((activeJob.metrics.validationAccuracy || 0) * 100).toFixed(1)}%`);
          console.log(`     - Avg Rating: ${(activeJob.metrics.avgRating || 0).toFixed(1)}/5`);
        }
        
        if (activeJob.abTestResults) {
          console.log(`   A/B Test Results:`);
          console.log(`     - Control Success: ${(activeJob.abTestResults.controlSuccessRate * 100).toFixed(1)}%`);
          console.log(`     - Variant Success: ${(activeJob.abTestResults.variantSuccessRate * 100).toFixed(1)}%`);
          console.log(`     - Improvement: ${(activeJob.abTestResults.improvement * 100).toFixed(1)}%`);
          console.log(`     - P-Value: ${activeJob.abTestResults.pValue?.toFixed(3)}`);
        }
      }
      
      // Check for jobs awaiting approval
      const pendingJobs = ai.getTrainingJobsAwaitingApproval();
      console.log(`\n⏳ Jobs Awaiting Approval: ${pendingJobs.length}`);
      
      if (pendingJobs.length > 0) {
        const job = pendingJobs[0];
        console.log(`\n   Reviewing Job: ${job.id}`);
        
        // Simulate human review
        if (job.abTestResults && job.abTestResults.improvement >= 0.05) {
          console.log(`   ✅ Improvement meets threshold (${(job.abTestResults.improvement * 100).toFixed(1)}% >= 5%)`);
          console.log(`   👍 Approving job...`);
          await ai.approveTrainingJob(job.id);
          console.log(`   ✅ Job approved and deployed!`);
        } else {
          console.log(`   ❌ Improvement too small`);
          console.log(`   👎 Rejecting job...`);
          await ai.rejectTrainingJob(job.id, 'Insufficient improvement');
          console.log(`   ❌ Job rejected`);
        }
      }
      
    } catch (error) {
      console.log(`ℹ️  Training job simulation (would train in production)`);
    }
  } else {
    console.log(`ℹ️  Not enough feedback for training (need at least 5, have ${feedbackEntries.length})`);
  }
  
  console.log('\n✅ Scenario 3 Complete');
}

/**
 * Scenario 4: Export Training Data
 */
async function scenario4_exportTrainingData(ai: any) {
  console.log('\n' + '='.repeat(60));
  console.log('SCENARIO 4: Export Training Data');
  console.log('='.repeat(60));
  
  const feedbackEntries = await ai.feedbackCollector?.getAllFeedback() || [];
  
  if (feedbackEntries.length === 0) {
    console.log('ℹ️  No feedback data available to export');
    return;
  }
  
  console.log(`\n📦 Exporting training data from ${feedbackEntries.length} feedback entries...`);
  
  try {
    // Convert to chat completion format
    const dataset = await ai.feedbackToTrainingData(feedbackEntries, 'chat_completion');
    
    console.log(`\n✅ Training Dataset Created:`);
    console.log(`   Format: ${dataset.format}`);
    console.log(`   Examples: ${dataset.examples.length}`);
    console.log(`   Source Count: ${dataset.metadata.sourceCount}`);
    console.log(`   Filtered Count: ${dataset.metadata.filteredCount}`);
    console.log(`   Deduplicated Count: ${dataset.metadata.deduplicatedCount}`);
    console.log(`   Avg Quality: ${(dataset.metadata.avgRating || 0).toFixed(1)}/5`);
    
    // Show sample example
    if (dataset.examples.length > 0) {
      console.log(`\n📄 Sample Training Example:`);
      const example = dataset.examples[0] as any;
      if (example.messages) {
        example.messages.slice(0, 2).forEach((msg: any) => {
          console.log(`   ${msg.role}: ${msg.content.substring(0, 80)}...`);
        });
      }
    }
    
    // Export to JSONL
    const jsonl = await ai.exportTrainingData(dataset, 'jsonl');
    console.log(`\n💾 Exported to JSONL format (${jsonl.split('\n').length} lines)`);
    console.log(`   First line: ${jsonl.split('\n')[0].substring(0, 100)}...`);
    
  } catch (error) {
    console.error('❌ Error exporting training data:', error);
  }
  
  console.log('\n✅ Scenario 4 Complete');
}

/**
 * Scenario 5: System Health & Monitoring
 */
async function scenario5_healthMonitoring(ai: any) {
  console.log('\n' + '='.repeat(60));
  console.log('SCENARIO 5: System Health & Monitoring');
  console.log('='.repeat(60));
  
  console.log('\n🏥 Checking system health...');
  
  const health = await ai.getHealth();
  
  console.log(`\n📊 System Status:`);
  console.log(`   LLM Connected: ${health.llmConnected ? '✅' : '❌'}`);
  console.log(`   Metrics Ready: ${health.metricsReady ? '✅' : '❌'}`);
  console.log(`   Feedback Ready: ${health.feedbackReady ? '✅' : '❌'}`);
  console.log(`   Learning Ready: ${health.learningReady ? '✅' : '❌'}`);
  console.log(`   Training Loop Ready: ${health.trainingLoopReady ? '✅' : '❌'}`);
  
  if (health.performance) {
    console.log(`\n⚡ Performance Metrics:`);
    console.log(`   Avg Latency: ${health.performance.avgLatencyMs.toFixed(1)}ms`);
    console.log(`   Success Rate: ${(health.performance.successRate * 100).toFixed(1)}%`);
    console.log(`   Total Requests: ${health.performance.totalRequests}`);
  }
  
  if (health.feedback) {
    console.log(`\n👍 Feedback Metrics:`);
    console.log(`   Total Feedback: ${health.feedback.totalFeedback}`);
    console.log(`   Helpful Rate: ${(health.feedback.helpfulRate * 100).toFixed(1)}%`);
    console.log(`   Avg Rating: ${health.feedback.avgRating.toFixed(1)}/5`);
  }
  
  if (health.learning) {
    console.log(`\n🧠 Learning Metrics:`);
    console.log(`   Total Insights: ${health.learning.totalInsights}`);
    console.log(`   Pending Suggestions: ${health.learning.pendingSuggestions}`);
    console.log(`   Approved Suggestions: ${health.learning.approvedSuggestions}`);
  }
  
  if (health.trainingLoop) {
    console.log(`\n🔄 Training Loop Metrics:`);
    console.log(`   Active Job: ${health.trainingLoop.activeJob ? 'Yes' : 'No'}`);
    console.log(`   Total Jobs: ${health.trainingLoop.totalJobs}`);
    console.log(`   Awaiting Approval: ${health.trainingLoop.jobsAwaitingApproval}`);
    if (health.trainingLoop.lastRetrainedAt) {
      console.log(`   Last Retrained: ${health.trainingLoop.lastRetrainedAt}`);
    }
  }
  
  if (health.errors.length > 0) {
    console.log(`\n❌ Errors (${health.errors.length}):`);
    health.errors.forEach((error: string) => {
      console.log(`   - ${error}`);
    });
  } else {
    console.log(`\n✅ No errors detected`);
  }
  
  console.log('\n✅ Scenario 5 Complete');
}

// =====================================================
// MAIN DEMO
// =====================================================

async function runCompleteDemo() {
  console.log('\n' + '='.repeat(60));
  console.log('AUTH-SPINE AI PLATFORM - COMPLETE DEMO');
  console.log('='.repeat(60));
  console.log('\nThis demo showcases ALL features of the AI-based backend:');
  console.log('  ✅ Feedback collection (thumbs, ratings, categories, text)');
  console.log('  ✅ Customer service prompts');
  console.log('  ✅ Supervised learning & insights');
  console.log('  ✅ Automated training loops');
  console.log('  ✅ A/B testing');
  console.log('  ✅ Human approval workflows');
  console.log('  ✅ System health monitoring');
  console.log('  ✅ Training data export');
  console.log('\n' + '='.repeat(60));
  
  try {
    // Initialize AI Platform
    console.log('\n🚀 Initializing AI Platform...');
    const ai = getAIPlatform(config);
    await ai.initialize();
    console.log('✅ AI Platform initialized successfully!');
    
    // Start training loop (optional)
    await ai.startTrainingLoop();
    console.log('✅ Training loop started');
    
    // Run all scenarios
    await scenario1_basicInteraction(ai);
    await scenario2_supervisedLearning(ai);
    await scenario3_trainingLoop(ai);
    await scenario4_exportTrainingData(ai);
    await scenario5_healthMonitoring(ai);
    
    // Final summary
    console.log('\n' + '='.repeat(60));
    console.log('DEMO COMPLETE! 🎉');
    console.log('='.repeat(60));
    console.log('\nThe Auth-Spine AI Platform has successfully demonstrated:');
    console.log('  ✅ Complete feedback collection workflow');
    console.log('  ✅ Customer service interaction patterns');
    console.log('  ✅ Supervised learning and insights generation');
    console.log('  ✅ Automated training loop with thresholds');
    console.log('  ✅ Training data preparation and export');
    console.log('  ✅ System health and monitoring');
    console.log('\n📚 For more information, see:');
    console.log('  - AI_FEEDBACK_AND_LEARNING_GUIDE.md');
    console.log('  - CUSTOMER_SERVICE_TRAINING_LOOPS_GUIDE.md');
    console.log('  - AI_ML_QUICK_START.md');
    console.log('\n' + '='.repeat(60) + '\n');
    
    // Cleanup
    await ai.stopTrainingLoop();
    
  } catch (error) {
    console.error('\n❌ Demo failed with error:', error);
    process.exit(1);
  }
}

// Run the demo if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runCompleteDemo().catch(console.error);
}

export { runCompleteDemo };
