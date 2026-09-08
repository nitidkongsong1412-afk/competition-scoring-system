import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const grades = await prisma.gradeLevel.findMany({
      orderBy: { levelOrder: 'asc' },
      include: {
        classrooms: { orderBy: { roomNumber: 'asc' } },
        judges: { orderBy: { judgeOrder: 'asc' } },
      },
    });
    return NextResponse.json({ success: true, grades });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, shortName, levelOrder } = body;

    if (!name || !shortName) {
      return NextResponse.json(
        { success: false, error: 'กรุณากรอกชื่อระดับชั้นและชื่อย่อ' },
        { status: 400 }
      );
    }

    const grade = await prisma.gradeLevel.create({
      data: {
        name: name.trim(),
        shortName: shortName.trim(),
        levelOrder: parseInt(levelOrder, 10) || 1,
      },
    });

    return NextResponse.json({ success: true, grade });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, name, shortName, levelOrder } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'กรุณาระบุ ID ระดับชั้น' },
        { status: 400 }
      );
    }

    const grade = await prisma.gradeLevel.update({
      where: { id: parseInt(id, 10) },
      data: {
        ...(name && { name: name.trim() }),
        ...(shortName && { shortName: shortName.trim() }),
        ...(levelOrder !== undefined && { levelOrder: parseInt(levelOrder, 10) }),
      },
    });

    return NextResponse.json({ success: true, grade });
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
        { success: false, error: 'กรุณาระบุ ID ระดับชั้น' },
        { status: 400 }
      );
    }

    await prisma.gradeLevel.delete({
      where: { id: parseInt(id, 10) },
    });

    return NextResponse.json({ success: true, message: 'ลบระดับชั้นเรียบร้อย' });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
