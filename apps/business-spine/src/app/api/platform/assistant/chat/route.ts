import { NextRequest, NextResponse } from 'next/server';
import { PlatformOrchestrator, DEFAULT_VERTICALS } from '@spine/enterprise/platform';

// Initialize the platform orchestrator
const platform = new PlatformOrchestrator();

// Initialize on first request
let initialized = false;
async function ensureInitialized() {
  if (!initialized) {
    await platform.initialize();
    Object.values(DEFAULT_VERTICALS).forEach(config => {
      platform.loadVerticalConfig(config);
    });
    initialized = true;
  }
}

export async function POST(request: NextRequest) {
  try {
    await ensureInitialized();
    
    const body = await request.json();
    const { 
      message, 
      clientId, 
      professionalId, 
      conversationHistory = [] 
    } = body;
    
    if (!message || !clientId) {
      return NextResponse.json(
        { success: false, error: 'Message and client ID are required' },
        { status: 400 }
      );
    }
    
    // Validate client exists
    const client = platform.clients.get(clientId);
    if (!client) {
      return NextResponse.json(
        { success: false, error: 'Client not found' },
        { status: 404 }
      );
    }
    
    // Process the message through the AI assistant
    const result = await platform.processMessage(message, {
      clientId,
      professionalId,
      conversationHistory
    });
    
    return NextResponse.json({
      success: true,
      data: {
        response: result.response,
        intent: result.intent,
        decision: result.decision,
        suggestions: generateActionSuggestions(result.decision)
      }
    });
  } catch (error: any) {
    console.error('Error processing message:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to process message' },
      { status: 500 }
    );
  }
}

function generateActionSuggestions(decision: any): string[] {
  const suggestions: string[] = [];
  
  switch (decision.action) {
    case 'process_booking':
      suggestions.push('Check availability', 'Book appointment', 'View pricing');
      break;
    case 'provide_pricing':
      suggestions.push('Show service prices', 'View packages', 'Get quote');
      break;
    case 'describe_services':
      suggestions.push('Browse services', 'Filter by category', 'View details');
      break;
    case 'process_cancellation':
      suggestions.push('Cancel booking', 'Reschedule', 'View policy');
      break;
    case 'request_clarification':
      suggestions.push('Be more specific', 'Choose from options', 'Contact support');
      break;
    case 'escalate_to_human':
      suggestions.push('Call support', 'Schedule callback', 'Send email');
      break;
    default:
      suggestions.push('Continue conversation', 'View help', 'Contact support');
  }
  
  return suggestions;
}
