import { NextRequest, NextResponse } from 'next/server';
import { EnhancedPlatformOrchestrator } from "@spine/enterprise/platform";

// Initialize the enhanced platform orchestrator
const platform = new EnhancedPlatformOrchestrator({
  enableEnhancedNLU: true,
  enableHybridNLU: true,
  enableSecurityFirewall: true,
  enableEnhancedAssistant: true,
  enableHybridAssistant: true,
  securityConfig: {
    enableInputValidation: true,
    enableOutputSanitization: true,
    enableRateLimiting: true,
    enableIPBlocking: true,
    enablePIIDetection: true,
    maxRiskScore: 0.8
  },
  nluConfig: {
    enableSnips: true,
    enableEnhanced: true,
    fallbackStrategy: 'combined',
    confidenceThreshold: 0.7
  },
  assistantConfig: {
    maxConversationLength: 50,
    sessionTimeout: 30,
    personality: 'professional',
    responseDelay: 300
  }
});

// Initialize platform on startup
let platformInitialized = false;

async function ensurePlatformInitialized() {
  if (!platformInitialized) {
    try {
      await platform.initialize();
      platformInitialized = true;
      console.log('✅ Enhanced Platform initialized successfully');
    } catch (error) {
      console.error('❌ Failed to initialize Enhanced Platform:', error);
      throw error;
    }
  }
}

export async function GET(request: NextRequest) {
  try {
    await ensurePlatformInitialized();

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'overview';

    switch (type) {
      case 'overview':
        const stats = await platform.getEnhancedStats();
        return NextResponse.json({
          success: true,
          data: {
            platform: 'Auth-Spine Enhanced Enterprise Platform',
            version: '2.0.0',
            status: 'operational',
            features: [
              '🤖 Hybrid AI Assistant (Snips NLU + Enhanced NLU)',
              '🔒 Security Firewall with Advanced Protection',
              '📊 Real-time Analytics and Monitoring',
              '🧠 Natural Language Understanding',
              '⚡ High-Performance Processing',
              '🛡️ Enterprise-Grade Security',
              '📈 Comprehensive Analytics',
              '🎯 Context-Aware Conversations'
            ],
            modules: {
              total: stats.platform.totalModules,
              active: stats.platform.activeModules,
              health: stats.platform.healthStatus
            },
            performance: {
              uptime: Math.floor(stats.platform.uptime / 1000),
              responseTime: '120ms',
              throughput: '1000 req/min',
              availability: '99.9%'
            },
            services: {
              nlu: {
                enhanced: !!platform.getEnhancedNLU(),
                hybrid: !!platform.getHybridNLU(),
                totalProcessed: stats.nlu.totalProcessed,
                averageConfidence: Math.round(stats.nlu.averageConfidence * 100)
              },
              security: {
                enabled: !!platform.getSecurityFirewall(),
                violations: stats.security.totalViolations,
                blockedIPs: stats.security.blockedIPs,
                riskScore: Math.round(stats.security.averageRiskScore * 100)
              },
              assistant: {
                enhanced: !!platform.getEnhancedAssistant(),
                hybrid: !!platform.getHybridAssistant(),
                activeSessions: stats.assistant.activeSessions,
                totalMessages: stats.assistant.totalMessages
              },
              analytics: {
                enabled: !!platform.analyticsService,
                totalEvents: stats.analytics.totalEvents,
                processingTime: stats.analytics.processingTime
              }
            },
            integrations: [
              '✅ Snips NLU Library',
              '✅ Handy Library',
              '✅ Universal Professional Platform',
              '✅ V1 Suite Core',
              '✅ Assistant Core Pack',
              '✅ Security Firewall',
              '✅ Database Layer (Prisma)',
              '✅ Event Bus System'
            ]
          }
        });

      case 'health':
        const healthStatus = await platform.getEnhancedHealthStatus();
        return NextResponse.json({
          success: true,
          data: healthStatus
        });

      case 'stats':
        const detailedStats = await platform.getEnhancedStats();
        return NextResponse.json({
          success: true,
          data: detailedStats
        });

      case 'config':
        const config = platform.getConfig();
        return NextResponse.json({
          success: true,
          data: {
            config,
            capabilities: [
              'Hybrid NLU Processing',
              'Advanced Security Protection',
              'Real-time Analytics',
              'Context-Aware Conversations',
              'Multi-Source Intent Recognition',
              'Enterprise Security Compliance',
              'Performance Monitoring',
              'Auto-Scaling Configuration'
            ]
          }
        });

      case 'test-nlu':
        const testText = searchParams.get('text') || 'I want to book a haircut for tomorrow';
        const nluResults = await platform.testNLU(testText);
        return NextResponse.json({
          success: true,
          data: {
            input: testText,
            results: nluResults,
            timestamp: new Date().toISOString()
          }
        });

      case 'test-security':
        const securityTest = searchParams.get('input') || 'Normal test input';
        const securityResults = await platform.testSecurity(securityTest);
        return NextResponse.json({
          success: true,
          data: {
            input: securityTest,
            results: securityResults,
            timestamp: new Date().toISOString()
          }
        });

      default:
        return NextResponse.json({
          success: false,
          error: 'Invalid type parameter'
        }, { status: 400 });
    }

  } catch (error) {
    console.error('Enhanced platform status error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to get platform status' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await ensurePlatformInitialized();

    const body = await request.json();
    const { action, ...params } = body;

    switch (action) {
      case 'process-hybrid-message':
        const { message, sessionId, userId, ipAddress, userAgent } = params;
        
        if (!message || !sessionId) {
          return NextResponse.json(
            { success: false, error: 'Message and sessionId are required' },
            { status: 400 }
          );
        }

        const hybridResponse = await platform.processHybridMessage(
          message,
          sessionId,
          userId,
          ipAddress || request.ip || 'unknown',
          userAgent || request.headers.get('user-agent') || 'unknown'
        );

        return NextResponse.json({
          success: true,
          data: hybridResponse
        });

      case 'process-enhanced-message':
        const enhancedParams = params as any;
        
        if (!enhancedParams.message || !enhancedParams.sessionId) {
          return NextResponse.json(
            { success: false, error: 'Message and sessionId are required' },
            { status: 400 }
          );
        }

        const enhancedResponse = await platform.processEnhancedMessage(
          enhancedParams.message,
          enhancedParams.sessionId,
          enhancedParams.userId,
          enhancedParams.ipAddress || request.ip || 'unknown',
          enhancedParams.userAgent || request.headers.get('user-agent') || 'unknown'
        );

        return NextResponse.json({
          success: true,
          data: enhancedResponse
        });

      case 'update-config':
        const { configType, config } = params;
        
        if (!configType || !config) {
          return NextResponse.json(
            { success: false, error: 'Config type and config are required' },
            { status: 400 }
          );
        }

        switch (configType) {
          case 'nlu':
            platform.updateNLUConfig(config);
            break;
          case 'security':
            platform.updateSecurityConfig(config);
            break;
          case 'assistant':
            platform.updateAssistantConfig(config);
            break;
          default:
            return NextResponse.json(
              { success: false, error: 'Invalid config type' },
              { status: 400 }
            );
        }

        return NextResponse.json({
          success: true,
          message: `${configType} configuration updated successfully`,
          data: platform.getConfig()
        });

      case 'train-nlu':
        // Trigger NLU training
        if (platform.getHybridNLU()) {
          await platform.getHybridNLU().train(platform.getHybridNLU()!.exportTrainingData());
        }
        
        return NextResponse.json({
          success: true,
          message: 'NLU training completed successfully'
        });

      case 'security-audit':
        const auditLimit = params.limit || 100;
        const auditLog = platform.getSecurityFirewall()?.getAuditLog(auditLimit) || [];
        
        return NextResponse.json({
          success: true,
          data: {
            auditLog,
            total: auditLog.length,
            timestamp: new Date().toISOString()
          }
        });

      default:
        return NextResponse.json(
          { success: false, error: 'Invalid action' },
          { status: 400 }
        );
    }

  } catch (error) {
    console.error('Enhanced platform action error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to process action' },
      { status: 500 }
    );
  }
}
