import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma/client';
import { fromDateOnlyString, normalizeToDateOnly } from '@/lib/utils/date';
import { calculateScores } from '@/lib/utils/score';

// GET - Get entry for a specific date
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const dateStr = searchParams.get('date');

    if (!dateStr) {
      return NextResponse.json(
        { error: 'Date parameter is required' },
        { status: 400 }
      );
    }

    // Parse date-only string to Date in local timezone
    const date = fromDateOnlyString(dateStr);

    const entry = await prisma.journalEntry.findUnique({
      where: { date },
      include: {
        values: {
          include: {
            metric: true,
          },
        },
      },
    });

    if (!entry) {
      return NextResponse.json({ entry: null, values: [] });
    }

    // Transform values into a more usable format
    const values: Record<string, any> = {};
    entry.values.forEach((val: { metricId: string; value: any }) => {
      values[val.metricId] = val.value;
    });

    return NextResponse.json({
      entry: {
        id: entry.id,
        date: entry.date,
        score: entry.score,
        categoryScores: entry.categoryScores,
      },
      values,
    });
  } catch (error) {
    console.error('Error fetching journal entry:', error);
    return NextResponse.json(
      { error: 'Failed to fetch journal entry' },
      { status: 500 }
    );
  }
}

// POST - Create or update entry for a date
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { date, values } = body;

    if (!date) {
      return NextResponse.json(
        { error: 'Date is required' },
        { status: 400 }
      );
    }

    // Parse date-only string to Date in local timezone
    const entryDate = fromDateOnlyString(date);

    // Load all metrics for score calculation
    const allMetrics = await prisma.metric.findMany({
      include: {
        category: true,
      },
      where: {
        active: true,
      },
    });

    // Calculate score
    const scoreCalculation = calculateScores(allMetrics, values || {});

    // Use transaction to ensure atomicity
    const result = await prisma.$transaction(async (tx: any) => {
      // Find or create entry
      let entry = await tx.journalEntry.findUnique({
        where: { date: entryDate },
      });

      // Prepare category scores as JSON object
      const categoryScoresJson = scoreCalculation.categoryScores.reduce((acc, catScore) => {
        acc[catScore.categoryId] = catScore.score;
        return acc;
      }, {} as Record<string, number>);

      if (!entry) {
        entry = await tx.journalEntry.create({
          data: {
            date: entryDate,
            score: scoreCalculation.totalScore,
            categoryScores: categoryScoresJson,
          },
        });
      } else {
        // Update score and category scores
        entry = await tx.journalEntry.update({
          where: { id: entry.id },
          data: {
            score: scoreCalculation.totalScore,
            categoryScores: categoryScoresJson,
          },
        });
      }

      // Update or create values
      const valuePromises = Object.entries(values || {}).map(([metricId, value]) =>
        tx.journalEntryValue.upsert({
          where: {
            entryId_metricId: {
              entryId: entry.id,
              metricId,
            },
          },
          create: {
            entryId: entry.id,
            metricId,
            value: JSON.parse(JSON.stringify(value)), // Ensure proper JSON serialization
          },
          update: {
            value: JSON.parse(JSON.stringify(value)),
          },
        })
      );

      await Promise.all(valuePromises);

      // Return the updated entry with values
      return await tx.journalEntry.findUnique({
        where: { id: entry.id },
        include: {
          values: {
            include: {
              metric: true,
            },
          },
        },
      });
    });

    // Transform values
    const transformedValues: Record<string, any> = {};
    result?.values.forEach((val: { metricId: string; value: any }) => {
      transformedValues[val.metricId] = val.value;
    });

    return NextResponse.json({
      entry: {
        id: result?.id,
        date: result?.date,
      },
      values: transformedValues,
    });
  } catch (error: any) {
    console.error('Error saving journal entry:', error);
    return NextResponse.json(
      { error: 'Failed to save journal entry' },
      { status: 500 }
    );
  }
}

// DELETE - Delete entry for a specific date
export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const dateStr = searchParams.get('date');

    if (!dateStr) {
      return NextResponse.json(
        { error: 'Date parameter is required' },
        { status: 400 }
      );
    }

    // Parse date-only string to Date in local timezone
    const date = fromDateOnlyString(dateStr);

    // Delete entry (cascade will delete associated values)
    await prisma.journalEntry.delete({
      where: { date },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    // If entry doesn't exist, that's fine - return success
    if (error.code === 'P2025') {
      return NextResponse.json({ success: true });
    }
    console.error('Error deleting journal entry:', error);
    return NextResponse.json(
      { error: 'Failed to delete journal entry' },
      { status: 500 }
    );
  }
}

