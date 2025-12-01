import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma/client';
import { UpdateMetricInput } from '@/lib/types/metric';

// GET - Get a single metric
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const metric = await prisma.metric.findUnique({
      where: { id },
    });

    if (!metric) {
      return NextResponse.json(
        { error: 'Metric not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(metric);
  } catch (error) {
    console.error('Error fetching metric:', error);
    return NextResponse.json(
      { error: 'Failed to fetch metric' },
      { status: 500 }
    );
  }
}

// PUT - Update a metric
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body: UpdateMetricInput = await request.json();

    const updateData: any = {};
    if (body.label !== undefined) updateData.label = body.label;
    if (body.type !== undefined) updateData.type = body.type;
    if (body.options !== undefined) {
      updateData.options = body.options ? JSON.parse(JSON.stringify(body.options)) : null;
    }
    if (body.recurrence !== undefined) {
      updateData.recurrence = JSON.parse(JSON.stringify(body.recurrence));
    }
    if (body.active !== undefined) updateData.active = body.active;

    const updatedMetric = await prisma.metric.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json(updatedMetric);
  } catch (error: any) {
    console.error('Error updating metric:', error);
    
    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: 'Metric not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to update metric' },
      { status: 500 }
    );
  }
}

// DELETE - Delete a metric
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    await prisma.metric.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting metric:', error);
    
    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: 'Metric not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to delete metric' },
      { status: 500 }
    );
  }
}

