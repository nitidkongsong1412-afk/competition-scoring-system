import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const classrooms = await prisma.classroom.findMany({
      orderBy: [{ gradeLevelId: 'asc' }, { roomNumber: 'asc' }],
      include: {
        gradeLevel: true,
      },
    });
    return NextResponse.json({ success: true, classrooms });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { gradeLevelId, name, roomNumber } = body;

    if (!gradeLevelId || !name) {
      return NextResponse.json(
        { success: false, error: 'กรุณากรอกระดับชั้นและชื่อห้องเรียน' },
        { status: 400 }
      );
    }

    const classroom = await prisma.classroom.create({
      data: {
        gradeLevelId: parseInt(gradeLevelId, 10),
        name: name.trim(),
        roomNumber: parseInt(roomNumber, 10) || 1,
      },
    });

    return NextResponse.json({ success: true, classroom });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, name, roomNumber, gradeLevelId } = body;

    if (!id || !name) {
      return NextResponse.json(
        { success: false, error: 'กรุณาระบุข้อมูลให้ครบถ้วน' },
        { status: 400 }
      );
    }

    const classroom = await prisma.classroom.update({
      where: { id: parseInt(id, 10) },
      data: {
        name: name.trim(),
        ...(roomNumber !== undefined && { roomNumber: parseInt(roomNumber, 10) }),
        ...(gradeLevelId !== undefined && { gradeLevelId: parseInt(gradeLevelId, 10) }),
      },
    });

    return NextResponse.json({ success: true, classroom });
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
        { success: false, error: 'กรุณาระบุ ID ห้องเรียน' },
        { status: 400 }
      );
    }

    await prisma.classroom.delete({
      where: { id: parseInt(id, 10) },
    });

    return NextResponse.json({ success: true, message: 'ลบห้องเรียนเรียบร้อย' });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
