import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const judges = await prisma.judge.findMany({
      orderBy: [{ gradeLevelId: 'asc' }, { judgeOrder: 'asc' }],
      include: {
        gradeLevel: true,
      },
    });
    return NextResponse.json({ success: true, judges });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, gradeLevelId, judgeOrder, avatarColor, pinCode } = body;

    if (!name || !gradeLevelId) {
      return NextResponse.json(
        { success: false, error: 'กรุณากรอกชื่อกรรมการและเลือกระดับชั้น' },
        { status: 400 }
      );
    }

    // Auto-generate PIN if not provided: gradeOrder(2) + judgeOrder(2)
    let resolvedPin = pinCode;
    if (!resolvedPin) {
      const gl = await prisma.gradeLevel.findUnique({ where: { id: parseInt(gradeLevelId, 10) } });
      const gradeCode = String(gl?.levelOrder ?? 1).padStart(2, '0');
      const judgeCode = String(judgeOrder ?? 1).padStart(2, '0');
      resolvedPin = `${gradeCode}${judgeCode}`;
    }

    const judge = await prisma.judge.create({
      data: {
        name: name.trim(),
        gradeLevelId: parseInt(gradeLevelId, 10),
        judgeOrder: parseInt(judgeOrder, 10) || 1,
        avatarColor: avatarColor || 'amber',
        pinCode: resolvedPin,
      },
    });

    return NextResponse.json({ success: true, judge });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, name, gradeLevelId, judgeOrder, avatarColor, pinCode } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'กรุณาระบุ ID กรรมการ' },
        { status: 400 }
      );
    }

    const judge = await prisma.judge.update({
      where: { id: parseInt(id, 10) },
      data: {
        ...(name && { name: name.trim() }),
        ...(gradeLevelId !== undefined && { gradeLevelId: parseInt(gradeLevelId, 10) }),
        ...(judgeOrder !== undefined && { judgeOrder: parseInt(judgeOrder, 10) }),
        ...(avatarColor && { avatarColor }),
        ...(pinCode && { pinCode: String(pinCode).trim() }),
      },
    });

    return NextResponse.json({ success: true, judge });
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
        { success: false, error: 'กรุณาระบุ ID กรรมการ' },
        { status: 400 }
      );
    }

    await prisma.judge.delete({
      where: { id: parseInt(id, 10) },
    });

    return NextResponse.json({ success: true, message: 'ลบกรรมการเรียบร้อย' });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
