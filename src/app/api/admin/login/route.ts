import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const { password } = await request.json();

    if (!password) {
      return NextResponse.json(
        { success: false, error: 'กรุณากรอกรหัสผ่าน' },
        { status: 400 }
      );
    }

    const config = await prisma.adminConfig.findFirst();

    if (!config) {
      // Fallback
      if (password === 'admin1234') {
        return NextResponse.json({ success: true, message: 'เข้าสู่ระบบสำเร็จ' });
      }
      return NextResponse.json(
        { success: false, error: 'รหัสผ่านไม่ถูกต้อง' },
        { status: 401 }
      );
    }

    if (password === config.passwordHash) {
      return NextResponse.json({
        success: true,
        message: 'เข้าสู่ระบบสำเร็จ',
      });
    } else {
      return NextResponse.json(
        { success: false, error: 'รหัสผ่านไม่ถูกต้อง กรุณาลองใหม่อีกครั้ง' },
        { status: 401 }
      );
    }
  } catch (error: any) {
    console.error('Error logging in admin:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
