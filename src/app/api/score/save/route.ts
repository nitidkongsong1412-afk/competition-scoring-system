import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { judgeId, classroomId, criterionId, score, comment, isCompleted } = body;

    if (!judgeId || !classroomId) {
      return NextResponse.json(
        { success: false, error: 'ข้อมูลไม่ครบถ้วน (judgeId หรือ classroomId หายไป)' },
        { status: 400 }
      );
    }

    // If criterionId and score are provided, save/update the score
    if (criterionId !== undefined && score !== undefined) {
      const criterion = await prisma.criterion.findUnique({
        where: { id: parseInt(criterionId, 10) },
      });

      if (!criterion) {
        return NextResponse.json(
          { success: false, error: 'ไม่พบเกณฑ์การให้คะแนน' },
          { status: 404 }
        );
      }

      // Validate integer and score range
      const numericScore = Math.floor(Number(score));
      if (isNaN(numericScore) || numericScore < 0 || numericScore > criterion.maxScore) {
        return NextResponse.json(
          {
            success: false,
            error: `คะแนนต้องเป็นจำนวนเต็มตั้งแต่ 0 ถึง ${criterion.maxScore}`,
          },
          { status: 400 }
        );
      }

      await prisma.scoreRecord.upsert({
        where: {
          judgeId_classroomId_criterionId: {
            judgeId: parseInt(judgeId, 10),
            classroomId: parseInt(classroomId, 10),
            criterionId: parseInt(criterionId, 10),
          },
        },
        update: {
          score: numericScore,
        },
        create: {
          judgeId: parseInt(judgeId, 10),
          classroomId: parseInt(classroomId, 10),
          criterionId: parseInt(criterionId, 10),
          score: numericScore,
        },
      });
    }

    // If comment or isCompleted is provided, upsert the JudgeClassSubmission
    if (comment !== undefined || isCompleted !== undefined) {
      const currentSubmission = await prisma.judgeClassSubmission.findUnique({
        where: {
          judgeId_classroomId: {
            judgeId: parseInt(judgeId, 10),
            classroomId: parseInt(classroomId, 10),
          },
        },
      });

      await prisma.judgeClassSubmission.upsert({
        where: {
          judgeId_classroomId: {
            judgeId: parseInt(judgeId, 10),
            classroomId: parseInt(classroomId, 10),
          },
        },
        update: {
          ...(comment !== undefined && { comment }),
          ...(isCompleted !== undefined && { isCompleted: Boolean(isCompleted) }),
        },
        create: {
          judgeId: parseInt(judgeId, 10),
          classroomId: parseInt(classroomId, 10),
          comment: comment ?? '',
          isCompleted: isCompleted ?? false,
        },
      });
    }

    return NextResponse.json({
      success: true,
      message: 'บันทึกคะแนนเรียบร้อย',
    });
  } catch (error: any) {
    console.error('Error saving score:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
