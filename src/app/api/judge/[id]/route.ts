import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const judgeId = parseInt(id, 10);

    if (isNaN(judgeId)) {
      return NextResponse.json(
        { success: false, error: 'รหัสกรรมการไม่ถูกต้อง' },
        { status: 400 }
      );
    }

    const judge = await prisma.judge.findUnique({
      where: { id: judgeId },
      include: {
        gradeLevel: true,
      },
    });

    if (!judge) {
      return NextResponse.json(
        { success: false, error: 'ไม่พบข้อมูลกรรมการ' },
        { status: 404 }
      );
    }

    // Fetch all classrooms in this grade level
    const classrooms = await prisma.classroom.findMany({
      where: { gradeLevelId: judge.gradeLevelId },
      orderBy: { roomNumber: 'asc' },
    });

    // Fetch all criteria
    const criteria = await prisma.criterion.findMany({
      orderBy: { criterionOrder: 'asc' },
    });

    // Fetch existing scores given by this judge
    const scores = await prisma.scoreRecord.findMany({
      where: { judgeId },
    });

    // Fetch judge submissions / comments
    const submissions = await prisma.judgeClassSubmission.findMany({
      where: { judgeId },
    });

    // Format scores into map: scoresMap[classroomId][criterionId] = score
    const scoresMap: Record<number, Record<number, number>> = {};
    for (const s of scores) {
      if (!scoresMap[s.classroomId]) {
        scoresMap[s.classroomId] = {};
      }
      scoresMap[s.classroomId][s.criterionId] = s.score;
    }

    // Format submissions into map: submissionsMap[classroomId] = { comment, isCompleted }
    const submissionsMap: Record<number, { comment: string; isCompleted: boolean }> = {};
    for (const sub of submissions) {
      submissionsMap[sub.classroomId] = {
        comment: sub.comment,
        isCompleted: sub.isCompleted,
      };
    }

    const config = await prisma.adminConfig.findFirst();

    return NextResponse.json({
      success: true,
      judge,
      classrooms,
      criteria,
      scoresMap,
      submissionsMap,
      config,
    });
  } catch (error: any) {
    console.error('Error fetching judge details:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
