/**
 * Example Usage of NLU-Integrated Assistant System
 * Demonstrates how to use the enhanced SmartAssistant with NLU capabilities
 */

import { EnhancedSmartAssistant, EnhancedAssistantConfig } from './enhanced-assistant.js';
import { AssistantContext, SmartEngine } from '../../business-spine/src/core/types.js';
import { defaultIntegrationConfig } from './index.js';

/**
 * Example: Setting up the enhanced assistant with NLU
 */
export async function setupEnhancedAssistant(): Promise<EnhancedSmartAssistant> {
  // Configuration for the enhanced assistant
  const config: EnhancedAssistantConfig = {
    enabled: true,
    engines: ['nlu-engine'],
    maxSuggestions: 8,
    nlu: {
      ...defaultIntegrationConfig,
      routing: {
        confidenceThreshold: 0.6,
        enableLLMFallback: true,
        maxRetries: 2,
        timeoutMs: 5000
      }
    },
    features: {
      intelligentRouting: true,
      contextAwareness: true,
      learningMode: true,
      analyticsEnabled: true
    }
  };

  // Create the enhanced assistant
  const assistant = new EnhancedSmartAssistant(config);
  
  // Initialize with empty engines (NLU engine is added internally)
  await assistant.initialize(new Map<string, SmartEngine>());
  
  return assistant;
}

/**
 * Example: Processing user messages with NLU
 */
export async function processUserMessage(
  assistant: EnhancedSmartAssistant,
  message: string,
  userId: string,
  tenantId: string
) {
  // Create conversation context
  const ctx = {
    actor: {
      userId,
      role: 'client' as const
    },
    tenantId,
    nowISO: new Date().toISOString(),
    channel: 'chat' as const,
    conversationId: `conv_${userId}_${Date.now()}`
  };

  try {
    // Process the message with NLU-enhanced assistant
    const suggestions = await assistant.processMessage(message, ctx);
    
    console.log(`Processed message: "${message}"`);
    console.log(`Generated ${suggestions.length} suggestions:`);
    
    suggestions.forEach((suggestion, index) => {
      console.log(`\n${index + 1}. ${suggestion.title}`);
      console.log(`   Message: ${suggestion.message}`);
      console.log(`   Severity: ${suggestion.severity}`);
      
      if (suggestion.nluData) {
        console.log(`   NLU Intent: ${suggestion.nluData.intent}`);
        console.log(`   Confidence: ${(suggestion.nluData.confidence * 100).toFixed(0)}%`);
        if (suggestion.nluData.entities.length > 0) {
          console.log(`   Entities: ${suggestion.nluData.entities.map(e => `${e.entity}:${e.value}`).join(', ')}`);
        }
      }
      
      if (suggestion.actions && suggestion.actions.length > 0) {
        console.log(`   Actions: ${suggestion.actions.map(a => a.label).join(', ')}`);
      }
    });
    
    return suggestions;
    
  } catch (error) {
    console.error('Failed to process message:', error);
    throw error;
  }
}

/**
 * Example: Adding custom business intents
 */
export async function addCustomBusinessIntents(assistant: EnhancedSmartAssistant) {
  // Add custom intents for specific business needs
  await assistant.nluIntegration.addCustomIntent(
    'appointment_reminder',
    'User wants to set or manage appointment reminders',
    [
      'set reminder for appointment',
      'remind me about my booking',
      'appointment notification',
      'booking reminder'
    ]
  );
  
  await assistant.nluIntegration.addCustomIntent(
    'service_inquiry',
    'User is asking about available services',
    [
      'what services do you offer',
      'available treatments',
      'service menu',
      'what can I book'
    ]
  );
  
  await assistant.nluIntegration.addCustomEntity(
    'service_type',
    'Type of service or treatment',
    [
      'haircut', 'massage', 'facial', 'manicure', 'pedicure',
      'consultation', 'therapy', 'treatment'
    ]
  );
  
  console.log('Added custom business intents and entities');
}

/**
 * Example: Recording user feedback for learning
 */
export async function recordUserFeedback(
  assistant: EnhancedSmartAssistant,
  suggestionId: string,
  userAccepted: boolean,
  feedbackScore?: number
) {
  await assistant.recordFeedback({
    suggestionId,
    accepted: userAccepted,
    score: feedbackScore,
    notes: userAccepted ? 'User found this helpful' : 'User did not find this helpful'
  });
  
  console.log(`Recorded feedback for suggestion ${suggestionId}: ${userAccepted ? 'Accepted' : 'Rejected'}`);
}

/**
 * Example: Getting analytics and insights
 */
export function displayAssistantAnalytics(assistant: EnhancedSmartAssistant) {
  const analytics = assistant.getAnalytics();
  
  console.log('\n=== Assistant Analytics ===');
  console.log(`Total Conversations: ${analytics.totalConversations}`);
  console.log(`Average Processing Time: ${analytics.averageProcessingTime.toFixed(0)}ms`);
  console.log(`NLU Accuracy: ${(analytics.nluAccuracy * 100).toFixed(1)}%`);
  console.log(`Learning Effectiveness: ${analytics.learningEffectiveness.toFixed(2)}`);
  
  console.log('\nTop Intents:');
  analytics.topIntents.forEach((intent, index) => {
    console.log(`${index + 1}. ${intent.intent}: ${intent.count} uses`);
  });
}

/**
 * Example: Health check and monitoring
 */
export async function performHealthCheck(assistant: EnhancedSmartAssistant) {
  const health = await assistant.healthCheck();
  
  console.log('\n=== Assistant Health Check ===');
  console.log(`Status: ${health.status.toUpperCase()}`);
  
  if (health.status === 'healthy') {
    console.log('✅ All systems operational');
  } else if (health.status === 'degraded') {
    console.log('⚠️  Some systems experiencing issues');
  } else {
    console.log('❌ Critical issues detected');
  }
  
  console.log('\nSystem Details:');
  Object.entries(health.details).forEach(([key, value]) => {
    if (typeof value === 'object') {
      console.log(`${key}: ${JSON.stringify(value, null, 2)}`);
    } else {
      console.log(`${key}: ${value}`);
    }
  });
}

/**
 * Complete example workflow
 */
export async function runCompleteExample() {
  console.log('🚀 Starting NLU-Enhanced Assistant Example\n');
  
  try {
    // 1. Setup the assistant
    console.log('1. Setting up enhanced assistant...');
    const assistant = await setupEnhancedAssistant();
    
    // 2. Add custom business intents
    console.log('\n2. Adding custom business intents...');
    await addCustomBusinessIntents(assistant);
    
    // 3. Process sample messages
    console.log('\n3. Processing sample messages...');
    
    const sampleMessages = [
      'I want to book a haircut for tomorrow',
      'Can you help me pay my invoice?',
      'What services do you offer?',
      'I need to cancel my appointment',
      'Show me my booking history'
    ];
    
    for (const message of sampleMessages) {
      await processUserMessage(assistant, message, 'user123', 'tenant456');
      console.log('---');
    }
    
    // 4. Record some feedback
    console.log('\n4. Recording user feedback...');
    await recordUserFeedback(assistant, 'suggestion_1', true, 0.8);
    await recordUserFeedback(assistant, 'suggestion_2', false, -0.3);
    
    // 5. Display analytics
    console.log('\n5. Displaying analytics...');
    displayAssistantAnalytics(assistant);
    
    // 6. Perform health check
    console.log('\n6. Performing health check...');
    await performHealthCheck(assistant);
    
    console.log('\n✅ Example completed successfully!');
    
  } catch (error) {
    console.error('❌ Example failed:', error);
    throw error;
  }
}

/**
 * Example: Custom NLU configuration for different business types
 */
export function createBusinessSpecificConfig(businessType: 'salon' | 'clinic' | 'consulting'): EnhancedAssistantConfig {
  const baseConfig: EnhancedAssistantConfig = {
    enabled: true,
    engines: ['nlu-engine'],
    maxSuggestions: 8,
    features: {
      intelligentRouting: true,
      contextAwareness: true,
      learningMode: true,
      analyticsEnabled: true
    }
  };
  
  switch (businessType) {
    case 'salon':
      return {
        ...baseConfig,
        nlu: {
          ...defaultIntegrationConfig,
          routing: {
            confidenceThreshold: 0.5, // Lower threshold for conversational salon interactions
            enableLLMFallback: true,
            maxRetries: 2,
            timeoutMs: 6000
          }
        }
      };
      
    case 'clinic':
      return {
        ...baseConfig,
        nlu: {
          ...defaultIntegrationConfig,
          routing: {
            confidenceThreshold: 0.8, // Higher threshold for medical accuracy
            enableLLMFallback: true,
            maxRetries: 3,
            timeoutMs: 4000
          }
        }
      };
      
    case 'consulting':
      return {
        ...baseConfig,
        nlu: {
          ...defaultIntegrationConfig,
          routing: {
            confidenceThreshold: 0.7,
            enableLLMFallback: true,
            maxRetries: 2,
            timeoutMs: 8000 // Longer timeout for complex consulting queries
          }
        }
      };
      
    default:
      return baseConfig;
  }
}

// Export for use in other modules
export {
  setupEnhancedAssistant,
  processUserMessage,
  addCustomBusinessIntents,
  recordUserFeedback,
  displayAssistantAnalytics,
  performHealthCheck,
  runCompleteExample,
  createBusinessSpecificConfig
};
