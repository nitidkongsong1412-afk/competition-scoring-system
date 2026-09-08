import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    const { judgeId, pinCode } = await req.json();

    if (!judgeId || !pinCode) {
      return NextResponse.json({ success: false, error: 'กรุณากรอก PIN' }, { status: 400 });
    }

    const judge = await prisma.judge.findUnique({
      where: { id: Number(judgeId) },
      select: { id: true, pinCode: true, name: true },
    });

    if (!judge) {
      return NextResponse.json({ success: false, error: 'ไม่พบข้อมูลกรรมการ' }, { status: 404 });
    }

    if (judge.pinCode !== String(pinCode).trim()) {
      return NextResponse.json({ success: false, error: 'รหัส PIN ไม่ถูกต้อง' }, { status: 401 });
    }

    return NextResponse.json({ success: true, judgeId: judge.id, name: judge.name });
  } catch (error) {
    console.error('PIN verify error:', error);
    return NextResponse.json({ success: false, error: 'เกิดข้อผิดพลาด' }, { status: 500 });
  }
}
