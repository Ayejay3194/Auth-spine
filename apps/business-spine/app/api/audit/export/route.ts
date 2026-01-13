import { NextRequest, NextResponse } from 'next/server';
import { reportGenerator, auditStorage } from '@spine/audit-reporting';

export async function POST(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const format = searchParams.get('format') || 'json';
    const body = await request.json();
    const { reportId, startDate, endDate } = body;

    let report;
    if (reportId) {
      const filter = {
        startDate: startDate ? new Date(startDate) : new Date(Date.now() - 24 * 60 * 60 * 1000),
        endDate: endDate ? new Date(endDate) : new Date(),
      };
      report = await reportGenerator.generateReport('Export Report', filter);
    } else {
      const filter = {
        startDate: startDate ? new Date(startDate) : new Date(Date.now() - 24 * 60 * 60 * 1000),
        endDate: endDate ? new Date(endDate) : new Date(),
      };
      report = await reportGenerator.generateReport('Export Report', filter);
    }

    let content: string;
    let contentType: string;
    let filename: string;

    switch (format) {
      case 'csv':
        content = reportGenerator.exportToCSV(report);
        contentType = 'text/csv';
        filename = `audit-report-${Date.now()}.csv`;
        break;
      case 'html':
        content = reportGenerator.exportToHTML(report);
        contentType = 'text/html';
        filename = `audit-report-${Date.now()}.html`;
        break;
      case 'json':
      default:
        content = reportGenerator.exportToJSON(report);
        contentType = 'application/json';
        filename = `audit-report-${Date.now()}.json`;
        break;
    }

    return new NextResponse(content, {
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });
  } catch (error: any) {
    console.error('Failed to export report:', error);
    return NextResponse.json(
      { error: 'Failed to export report', details: error.message },
      { status: 500 }
    );
  }
}
