import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma/client';
import { ReorderMetricsInput } from '@/lib/types/metric';

// POST - Reorder metrics
export async function POST(request: NextRequest) {
  try {
    const body: ReorderMetricsInput = await request.json();
    const { metricIds } = body;

    // Update sort order for each metric
    const updates = metricIds.map((id, index) =>
      prisma.metric.update({
        where: { id },
        data: { sortOrder: index },
      })
    );

    await Promise.all(updates);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error reordering metrics:', error);
    return NextResponse.json(
      { error: 'Failed to reorder metrics' },
      { status: 500 }
    );
  }
}

