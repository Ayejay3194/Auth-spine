import { NextRequest, NextResponse } from 'next/server';
import { reportGenerator } from '@spine/audit-reporting';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { startDate, endDate, eventTypes, categories, severities, userId, clientId } = body;

    const report = await reportGenerator.generateReport(
      'Audit Report',
      {
        startDate: startDate ? new Date(startDate) : undefined,
        endDate: endDate ? new Date(endDate) : undefined,
        eventTypes,
        categories,
        severities,
        userId,
        clientId,
        limit: 1000,
      },
      {
        includeInsights: true,
        includeRecommendations: true,
      }
    );

    return NextResponse.json(report);
  } catch (error: any) {
    console.error('Failed to generate report:', error);
    return NextResponse.json(
      { error: 'Failed to generate report', details: error.message },
      { status: 500 }
    );
  }
}
