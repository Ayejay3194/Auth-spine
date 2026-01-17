import { NextRequest, NextResponse } from 'next/server';
import { HybridAssistantService } from "@spine/enterprise/platform/assistant";

// Initialize the hybrid assistant service with Snips NLU
const assistant = new HybridAssistantService({
  maxConversationLength: 50,
  sessionTimeout: 30,
  enableSecurity: true,
  enableAnalytics: true,
  enableDecisionEngine: true,
  nluConfig: {
    enableSnips: true,
    enableEnhanced: true,
    fallbackStrategy: 'combined',
    confidenceThreshold: 0.7
  },
  personality: 'professional',
  responseDelay: 300
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { message, sessionId, userId } = body;

    if (!message || !sessionId) {
      return NextResponse.json(
        { success: false, error: 'Message and sessionId are required' },
        { status: 400 }
      );
    }

    // Get client information for security
    const ipAddress = request.ip || request.headers.get('x-forwarded-for') || 'unknown';
    const userAgent = request.headers.get('user-agent') || 'unknown';

    // Process message through hybrid assistant with Snips NLU
    const response = await assistant.processMessage(
      message,
      sessionId,
      userId,
      ipAddress,
      userAgent
    );

    return NextResponse.json({
      success: true,
      data: {
        message: response.message,
        intent: response.intent,
        confidence: response.confidence,
        nluSource: response.nluSource,
        actions: response.actions,
        followUpQuestions: response.followUpQuestions,
        securityViolations: response.securityViolations,
        metadata: response.metadata
      }
    });

  } catch (error) {
    console.error('Hybrid assistant chat error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to process message' },
      { status: 500 }
    );
  }
}

// GET endpoint for session information
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('sessionId');

    if (!sessionId) {
      return NextResponse.json(
        { success: false, error: 'Session ID is required' },
        { status: 400 }
      );
    }

    const session = assistant.getSession(sessionId);
    
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Session not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        sessionId: session.id,
        userId: session.userId,
        startTime: session.startTime,
        lastActivity: session.lastActivity,
        messageCount: session.messages.length,
        personality: session.personality,
        securityRiskScore: session.securityContext.riskScore,
        nluStats: session.nluStats
      }
    });

  } catch (error) {
    console.error('Get session error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to get session' },
      { status: 500 }
    );
  }
}

// DELETE endpoint to end session
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('sessionId');

    if (!sessionId) {
      return NextResponse.json(
        { success: false, error: 'Session ID is required' },
        { status: 400 }
      );
    }

    assistant.endSession(sessionId);

    return NextResponse.json({
      success: true,
      message: 'Session ended successfully'
    });

  } catch (error) {
    console.error('End session error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to end session' },
      { status: 500 }
    );
  }
}
