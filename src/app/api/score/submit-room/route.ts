import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { judgeId, classroomId, isCompleted, comment } = body;

    if (!judgeId || !classroomId) {
      return NextResponse.json(
        { success: false, error: 'ข้อมูลไม่ครบถ้วน' },
        { status: 400 }
      );
    }

    const submission = await prisma.judgeClassSubmission.upsert({
      where: {
        judgeId_classroomId: {
          judgeId: parseInt(judgeId, 10),
          classroomId: parseInt(classroomId, 10),
        },
      },
      update: {
        isCompleted: Boolean(isCompleted),
        ...(comment !== undefined && { comment }),
      },
      create: {
        judgeId: parseInt(judgeId, 10),
        classroomId: parseInt(classroomId, 10),
        isCompleted: Boolean(isCompleted),
        comment: comment ?? '',
      },
    });

    return NextResponse.json({
      success: true,
      submission,
      message: isCompleted ? 'ยืนยันการลงคะแนนห้องนี้เรียบร้อย' : 'ยกเลิกการยืนยันเรียบร้อย',
    });
  } catch (error: any) {
    console.error('Error submitting room:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
