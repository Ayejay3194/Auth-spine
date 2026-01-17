import { NextRequest, NextResponse } from 'next/server';
import { EnhancedAssistantService } from "@spine/enterprise/platform/assistant";
import { comprehensiveTrainingData, conversationalFlows } from "@spine/enterprise/platform/nlu";

// Initialize the enhanced assistant service
const assistant = new EnhancedAssistantService();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, trainingData, customData } = body;

    switch (action) {
      case 'train':
        // Train with comprehensive dataset
        await assistant.trainAssistant(comprehensiveTrainingData);
        
        // Train with custom data if provided
        if (customData && Array.isArray(customData)) {
          await assistant.trainAssistant(customData);
        }

        return NextResponse.json({
          success: true,
          message: 'Assistant trained successfully',
          data: {
            totalExamples: comprehensiveTrainingData.length + (customData?.length || 0),
            nluStats: assistant.getStats().nluStats
          }
        });

      case 'test_conversation':
        const { flowIndex, messages } = body;
        
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
            securityViolations: response.securityViolations
          });
        }

        return NextResponse.json({
          success: true,
          data: {
            sessionId,
            conversation: results,
            stats: assistant.getStats()
          }
        });

      case 'test_security':
        const { testInputs } = body;
        
        if (!testInputs || !Array.isArray(testInputs)) {
          return NextResponse.json(
            { success: false, error: 'Test inputs array is required' },
            { status: 400 }
          );
        }

        const securityResults = [];

        for (const testInput of testInputs) {
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
              response: response.message
            });
          } catch (error) {
            securityResults.push({
              input: testInput,
              allowed: false,
              violations: [{ type: 'blocked', message: error.message }],
              response: null
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

      default:
        return NextResponse.json(
          { success: false, error: 'Invalid action' },
          { status: 400 }
        );
    }

  } catch (error) {
    console.error('Assistant training error:', error);
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

      case 'conversation-flows':
        return NextResponse.json({
          success: true,
          data: conversationalFlows
        });

      default:
        return NextResponse.json({
          success: true,
          data: {
            message: 'Enhanced Assistant Service',
            capabilities: [
              'Natural Language Understanding',
              'Security Firewall Protection',
              'Conversation Management',
              'Decision Engine Integration',
              'Analytics Tracking',
              'Multi-personality Support'
            ],
            endpoints: [
              'POST /train - Train the assistant',
              'GET /train?type=stats - Get assistant statistics',
              'GET /train?type=security-audit - Get security audit log',
              'GET /train?type=conversation-flows - Get test conversation flows'
            ]
          }
        });
    }

  } catch (error) {
    console.error('Assistant stats error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to get assistant stats' },
      { status: 500 }
    );
  }
}
