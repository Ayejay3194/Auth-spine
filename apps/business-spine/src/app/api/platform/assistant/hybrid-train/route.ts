import { NextRequest, NextResponse } from 'next/server';
import { HybridAssistantService } from "@spine/enterprise/platform/assistant";

// Initialize the hybrid assistant service
const assistant = new HybridAssistantService();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, trainingData, customData, nluConfig } = body;

    switch (action) {
      case 'train':
        // Train hybrid assistant with comprehensive dataset
        await assistant.trainAssistant();
        
        // Train with custom data if provided
        if (customData && customData.intents) {
          await assistant.trainAssistant(customData);
        }

        // Update NLU config if provided
        if (nluConfig) {
          assistant.updateConfig({ nluConfig });
        }

        return NextResponse.json({
          success: true,
          message: 'Hybrid assistant trained successfully with Snips NLU and Enhanced NLU',
          data: {
            nluStats: assistant.getStats().nluStats,
            hybridStats: assistant.getStats().hybridStats
          }
        });

      case 'test_nlu_comparison':
        const { testTexts } = body;
        
        if (!testTexts || !Array.isArray(testTexts)) {
          return NextResponse.json(
            { success: false, error: 'Test texts array is required' },
            { status: 400 }
          );
        }

        const comparisonResults = [];

        for (const testText of testTexts) {
          const startTime = Date.now();
          const analysis = await assistant.getIntentAnalysis(testText);
          const processingTime = Date.now() - startTime;

          comparisonResults.push({
            input: testText,
            intent: analysis.intent,
            confidence: analysis.confidence,
            nluSource: analysis.source,
            entities: analysis.entities,
            processingTime
          });
        }

        return NextResponse.json({
          success: true,
          data: {
            comparison: comparisonResults,
            stats: assistant.getStats()
          }
        });

      case 'test_conversation_flow':
        const { flowType, messages } = body;
        
        if (!messages || !Array.isArray(messages)) {
          return NextResponse.json(
            { success: false, error: 'Messages array is required' },
            { status: 400 }
          );
        }

        const sessionId = `test_${Date.now()}`;
        const results = [];

        for (const message of messages) {
          const response = await assistant.processMessage(
            message,
            sessionId,
            'test-user',
            '127.0.0.1',
            'test-agent'
          );
          results.push({
            userMessage: message,
            assistantResponse: response.message,
            intent: response.intent,
            confidence: response.confidence,
            nluSource: response.nluSource,
            actions: response.actions,
            securityViolations: response.securityViolations
          });
        }

        return NextResponse.json({
          success: true,
          data: {
            sessionId,
            flowType,
            conversation: results,
            stats: assistant.getStats()
          }
        });

      case 'test_security':
        const { securityTests } = body;
        
        if (!securityTests || !Array.isArray(securityTests)) {
          return NextResponse.json(
            { success: false, error: 'Security tests array is required' },
            { status: 400 }
          );
        }

        const securityResults = [];

        for (const testInput of securityTests) {
          try {
            const response = await assistant.processMessage(
              testInput,
              `security_test_${Date.now()}`,
              'test-user',
              '127.0.0.1',
              'test-agent'
            );
            
            securityResults.push({
              input: testInput,
              allowed: response.securityViolations.length === 0,
              violations: response.securityViolations,
              response: response.message,
              nluSource: response.nluSource
            });
          } catch (error) {
            securityResults.push({
              input: testInput,
              allowed: false,
              violations: [{ type: 'blocked', message: error.message }],
              response: null,
              nluSource: 'none'
            });
          }
        }

        return NextResponse.json({
          success: true,
          data: {
            securityTests: securityResults,
            securityStats: assistant.getStats().securityStats
          }
        });

      case 'update_config':
        if (!nluConfig) {
          return NextResponse.json(
            { success: false, error: 'NLU config is required' },
            { status: 400 }
          );
        }

        assistant.updateConfig({ nluConfig });

        return NextResponse.json({
          success: true,
          message: 'Configuration updated successfully',
          data: {
            config: assistant.getStats().nluStats
          }
        });

      default:
        return NextResponse.json(
          { success: false, error: 'Invalid action' },
          { status: 400 }
        );
    }

  } catch (error) {
    console.error('Hybrid assistant training error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to process training request' },
      { status: 500 }
    );
  }
}

// GET endpoint for training status and stats
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');

    switch (type) {
      case 'stats':
        const stats = assistant.getStats();
        return NextResponse.json({
          success: true,
          data: stats
        });

      case 'nlu-comparison':
        const texts = searchParams.get('texts')?.split(',') || [
          "I want to book a haircut",
          "How much does a massage cost?",
          "Cancel my appointment",
          "Hello, I need help"
        ];

        const comparisonResults = [];
        for (const text of texts) {
          const analysis = await assistant.getIntentAnalysis(text.trim());
          comparisonResults.push({
            text: text.trim(),
            ...analysis
          });
        }

        return NextResponse.json({
          success: true,
          data: {
            comparison: comparisonResults
          }
        });

      case 'security-audit':
        const limit = parseInt(searchParams.get('limit') || '100');
        const auditLog = assistant.getSecurityAuditLog(limit);
        return NextResponse.json({
          success: true,
          data: {
            auditLog,
            totalViolations: auditLog.length
          }
        });

      case 'training-data':
        const trainingData = assistant.exportTrainingData();
        return NextResponse.json({
          success: true,
          data: {
            trainingData,
            summary: {
              intents: trainingData.intents.length,
              examples: trainingData.intents.reduce((sum, intent) => sum + intent.utterances.length, 0)
            }
          }
        });

      case 'config':
        const config = assistant.getStats().nluStats;
        return NextResponse.json({
          success: true,
          data: {
            config,
            capabilities: [
              'Hybrid NLU Processing (Snips + Enhanced)',
              'Intent Classification',
              'Entity Extraction',
              'Context-Aware Understanding',
              'Security Firewall Integration',
              'Real-time Processing',
              'Multi-source Confidence Scoring'
            ]
          }
        });

      default:
        return NextResponse.json({
          success: true,
          data: {
            message: 'Hybrid Assistant Service with Snips NLU Integration',
            capabilities: [
              'Dual NLU Processing (Snips + Enhanced)',
              'Intent Classification with Confidence Scoring',
              'Entity Extraction and Recognition',
              'Context-Aware Conversation Management',
              'Security Firewall Protection',
              'Real-time Analytics and Monitoring',
              'Training and Customization Support',
              'Multi-language Support (via Snips)',
              'Hybrid Confidence Scoring'
            ],
            endpoints: [
              'POST /train - Train the hybrid assistant',
              'GET /train?type=stats - Get comprehensive statistics',
              'GET /train?type=nlu-comparison - Compare NLU sources',
              'GET /train?type=security-audit - Get security audit log',
              'GET /train?type=training-data - Export training data',
              'GET /train?type=config - Get current configuration',
              'POST /train?action=test_nlu_comparison - Test NLU comparison',
              'POST /train?action=test_conversation_flow - Test conversation flows',
              'POST /train?action=test_security - Test security features',
              'POST /train?action=update_config - Update NLU configuration'
            ],
            features: {
              snipsNLU: 'Production-ready NLU with entity recognition',
              enhancedNLU: 'Custom intent classification and context awareness',
              hybridProcessing: 'Combines both systems for optimal accuracy',
              securityIntegration: 'Built-in security firewall and monitoring',
              realTimeAnalytics: 'Comprehensive usage and performance metrics'
            }
          }
        });
    }

  } catch (error) {
    console.error('Hybrid assistant stats error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to get assistant stats' },
      { status: 500 }
    );
  }
}
