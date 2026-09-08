import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { judgeId, classroomId, criteriaScores, comment, isCompleted } = body;

    if (!judgeId || !classroomId) {
      return NextResponse.json(
        { success: false, error: 'ข้อมูลไม่ครบถ้วน' },
        { status: 400 }
      );
    }

    const jId = parseInt(judgeId, 10);
    const cId = parseInt(classroomId, 10);

    // Save individual criteria scores if provided
    if (criteriaScores && typeof criteriaScores === 'object') {
      for (const [criterionIdStr, scoreVal] of Object.entries(criteriaScores)) {
        const criterionId = parseInt(criterionIdStr, 10);
        const criterion = await prisma.criterion.findUnique({
          where: { id: criterionId },
        });

        if (criterion) {
          const validScore = Math.max(0, Math.min(criterion.maxScore, Math.floor(Number(scoreVal) || 0)));
          await prisma.scoreRecord.upsert({
            where: {
              judgeId_classroomId_criterionId: {
                judgeId: jId,
                classroomId: cId,
                criterionId: criterionId,
              },
            },
            update: { score: validScore },
            create: {
              judgeId: jId,
              classroomId: cId,
              criterionId: criterionId,
              score: validScore,
            },
          });
        }
      }
    }

    // Update submission status if provided
    if (comment !== undefined || isCompleted !== undefined) {
      await prisma.judgeClassSubmission.upsert({
        where: {
          judgeId_classroomId: {
            judgeId: jId,
            classroomId: cId,
          },
        },
        update: {
          ...(comment !== undefined && { comment }),
          ...(isCompleted !== undefined && { isCompleted: Boolean(isCompleted) }),
        },
        create: {
          judgeId: jId,
          classroomId: cId,
          comment: comment ?? '',
          isCompleted: isCompleted ?? true,
        },
      });
    }

    return NextResponse.json({
      success: true,
      message: 'ปรับปรุงคะแนนโดยผู้ดูแลระบบเรียบร้อย',
    });
  } catch (error: any) {
    console.error('Error in score override:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
