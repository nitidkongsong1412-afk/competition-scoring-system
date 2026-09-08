import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const criteria = await prisma.criterion.findMany({
      orderBy: { criterionOrder: 'asc' },
    });
    return NextResponse.json({ success: true, criteria });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, description, maxScore, criterionOrder } = body;

    if (!title || maxScore === undefined) {
      return NextResponse.json(
        { success: false, error: 'กรุณากรอกชื่อเกณฑ์และคะแนนเต็ม' },
        { status: 400 }
      );
    }

    const criterion = await prisma.criterion.create({
      data: {
        title: title.trim(),
        description: (description || '').trim(),
        maxScore: parseInt(maxScore, 10),
        criterionOrder: parseInt(criterionOrder, 10) || 1,
      },
    });

    return NextResponse.json({ success: true, criterion });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, title, description, maxScore, criterionOrder } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'กรุณาระบุ ID เกณฑ์' },
        { status: 400 }
      );
    }

    const criterion = await prisma.criterion.update({
      where: { id: parseInt(id, 10) },
      data: {
        ...(title && { title: title.trim() }),
        ...(description !== undefined && { description: description.trim() }),
        ...(maxScore !== undefined && { maxScore: parseInt(maxScore, 10) }),
        ...(criterionOrder !== undefined && { criterionOrder: parseInt(criterionOrder, 10) }),
      },
    });

    return NextResponse.json({ success: true, criterion });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'กรุณาระบุ ID เกณฑ์' },
        { status: 400 }
      );
    }

    await prisma.criterion.delete({
      where: { id: parseInt(id, 10) },
    });

    return NextResponse.json({ success: true, message: 'ลบเกณฑ์เรียบร้อย' });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
