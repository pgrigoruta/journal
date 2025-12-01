import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma/client';
import { CreateMetricInput, UpdateMetricInput } from '@/lib/types/metric';

// GET - List all metrics
export async function GET() {
  try {
    const metrics = await prisma.metric.findMany({
      orderBy: { sortOrder: 'asc' },
    });

    return NextResponse.json(metrics);
  } catch (error) {
    console.error('Error fetching metrics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch metrics' },
      { status: 500 }
    );
  }
}

// POST - Create a new metric
export async function POST(request: NextRequest) {
  try {
    const body: CreateMetricInput = await request.json();
    
    // Validate key format (lowercase letters, numbers, underscores only)
    if (!/^[a-z0-9_]+$/.test(body.key)) {
      return NextResponse.json(
        { error: 'Key must contain only lowercase letters, numbers, and underscores' },
        { status: 400 }
      );
    }

    // Get the highest sort order
    const maxSortOrder = await prisma.metric.aggregate({
      _max: { sortOrder: true },
    });

    const newMetric = await prisma.metric.create({
      data: {
        key: body.key,
        label: body.label,
        type: body.type,
        options: body.options ? JSON.parse(JSON.stringify(body.options)) : null,
        recurrence: JSON.parse(JSON.stringify(body.recurrence)),
        sortOrder: (maxSortOrder._max.sortOrder ?? -1) + 1,
        active: body.active ?? true,
      },
    });

    return NextResponse.json(newMetric, { status: 201 });
  } catch (error: any) {
    console.error('Error creating metric:', error);
    
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'A metric with this key already exists' },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to create metric' },
      { status: 500 }
    );
  }
}

