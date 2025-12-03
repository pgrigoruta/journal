import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma/client';
import { CreateMetricInput, UpdateMetricInput } from '@/lib/types/metric';

// GET - List all metrics
export async function GET() {
  try {
    const metrics = await prisma.metric.findMany({
      include: {
        category: true,
      },
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
    
    // Validate categoryId is provided
    if (!body.categoryId) {
      return NextResponse.json(
        { error: 'Category is required' },
        { status: 400 }
      );
    }

    // Get the highest sort order
    const maxSortOrder = await prisma.metric.aggregate({
      _max: { sortOrder: true },
    });

    const newMetric = await prisma.metric.create({
      data: {
        label: body.label,
        categoryId: body.categoryId,
        sortOrder: (maxSortOrder._max.sortOrder ?? -1) + 1,
        active: body.active ?? true,
      },
      include: {
        category: true,
      },
    });

    return NextResponse.json(newMetric, { status: 201 });
  } catch (error: any) {
    console.error('Error creating metric:', error);

    return NextResponse.json(
      { error: 'Failed to create metric' },
      { status: 500 }
    );
  }
}

