import { NextRequest, NextResponse } from 'next/server';

// Mock autocomplete suggestions based on common patterns
const suggestionPatterns = {
  appointment: [
    'book appointment',
    'schedule appointment',
    'cancel appointment',
    'reschedule appointment',
    'appointment availability'
  ],
  booking: [
    'booking confirmation',
    'booking cancellation',
    'booking status',
    'modify booking'
  ],
  pricing: [
    'pricing information',
    'price list',
    'cost estimate',
    'pricing plans'
  ],
  availability: [
    'check availability',
    'available slots',
    'open appointments',
    'time slots'
  ],
  service: [
    'service information',
    'service details',
    'available services',
    'service types'
  ],
  provider: [
    'find provider',
    'provider search',
    'nearby providers',
    'provider reviews'
  ],
  payment: [
    'payment methods',
    'billing information',
    'payment history',
    'invoice'
  ],
  help: [
    'help center',
    'customer support',
    'contact support',
    'frequently asked questions'
  ]
};

function generateSuggestions(query: string, context?: string): string[] {
  const lowerQuery = query.toLowerCase();
  const suggestions: string[] = [];

  // Find matching patterns
  Object.entries(suggestionPatterns).forEach(([key, patterns]) => {
    if (lowerQuery.includes(key)) {
      patterns.forEach(pattern => {
        if (pattern.toLowerCase().includes(lowerQuery) || 
            lowerQuery.includes(pattern.toLowerCase().substring(0, 3))) {
          suggestions.push(pattern);
        }
      });
    }
  });

  // Context-aware suggestions
  if (context) {
    switch (context) {
      case '/dashboard':
        suggestions.push('book new appointment', 'view upcoming appointments', 'check availability');
        break;
      case '/appointments':
        suggestions.push('cancel appointment', 'reschedule appointment', 'appointment details');
        break;
      case '/services':
        suggestions.push('service pricing', 'service availability', 'book service');
        break;
      case '/billing':
        suggestions.push('payment history', 'invoice details', 'billing support');
        break;
    }
  }

  // Generic suggestions if no matches found
  if (suggestions.length === 0) {
    suggestions.push(
      `${query} appointment`,
      `${query} booking`,
      `${query} pricing`,
      `${query} availability`
    );
  }

  // Remove duplicates and limit to 5 suggestions
  return Array.from(new Set(suggestions)).slice(0, 5);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { query, sessionId, context } = body;

    if (!query || typeof query !== 'string') {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Query is required and must be a string' 
        },
        { status: 400 }
      );
    }

    // Generate suggestions based on query and context
    const suggestions = generateSuggestions(query, context?.page);

    // Log the autocomplete request for analytics
    console.log(`Autocomplete request: "${query}" for session ${sessionId}`);

    return NextResponse.json({
      success: true,
      data: {
        suggestions,
        query,
        context,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Failed to generate autocomplete suggestions:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to generate suggestions' 
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('query');
    const context = searchParams.get('context');

    if (!query) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Query parameter is required' 
        },
        { status: 400 }
      );
    }

    const suggestions = generateSuggestions(query, context || undefined);

    return NextResponse.json({
      success: true,
      data: {
        suggestions,
        query,
        context,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Failed to get autocomplete suggestions:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to get suggestions' 
      },
      { status: 500 }
    );
  }
}
