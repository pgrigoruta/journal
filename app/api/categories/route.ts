import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma/client';
import { CreateCategoryInput } from '@/lib/types/category';

// GET - List all categories
export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { createdAt: 'asc' },
    });

    return NextResponse.json(categories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    return NextResponse.json(
      { error: 'Failed to fetch categories' },
      { status: 500 }
    );
  }
}

// POST - Create a new category
export async function POST(request: NextRequest) {
  try {
    const body: CreateCategoryInput = await request.json();

    // Validate percent range
    if (body.percent < 0 || body.percent > 100) {
      return NextResponse.json(
        { error: 'Percent must be between 0 and 100' },
        { status: 400 }
      );
    }

    // Validate name
    if (!body.name || body.name.trim().length === 0) {
      return NextResponse.json(
        { error: 'Name is required' },
        { status: 400 }
      );
    }

    const newCategory = await prisma.category.create({
      data: {
        name: body.name.trim(),
        percent: body.percent,
      },
    });

    return NextResponse.json(newCategory, { status: 201 });
  } catch (error: any) {
    console.error('Error creating category:', error);

    return NextResponse.json(
      { error: 'Failed to create category' },
      { status: 500 }
    );
  }
}

