import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma/client';
import { fromDateOnlyString } from '@/lib/utils/date';

// GET - Get entries for a date range
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const startDateStr = searchParams.get('startDate');
    const endDateStr = searchParams.get('endDate');

    if (!startDateStr || !endDateStr) {
      return NextResponse.json(
        { error: 'startDate and endDate parameters are required' },
        { status: 400 }
      );
    }

    // Parse dates in local timezone
    const startDate = fromDateOnlyString(startDateStr);
    const endDate = fromDateOnlyString(endDateStr);
    // Set endDate to end of day
    endDate.setHours(23, 59, 59, 999);

    const entries = await prisma.journalEntry.findMany({
      where: {
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
      include: {
        values: {
          include: {
            metric: true,
          },
        },
      },
      orderBy: {
        date: 'asc',
      },
    });

    // Transform to a more usable format
    const result = entries.map((entry) => ({
      date: entry.date,
      score: entry.score,
      categoryScores: entry.categoryScores as Record<string, number> | null,
      values: entry.values.reduce((acc, val) => {
        acc[val.metricId] = {
          value: val.value,
          metric: {
            id: val.metric.id,
            label: val.metric.label,
          },
        };
        return acc;
      }, {} as Record<string, any>),
    }));

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error fetching journal entries:', error);
    return NextResponse.json(
      { error: 'Failed to fetch journal entries' },
      { status: 500 }
    );
  }
}

