import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const gradeLevels = await prisma.gradeLevel.findMany({
      orderBy: { levelOrder: 'asc' },
      include: {
        classrooms: {
          orderBy: { roomNumber: 'asc' },
        },
        judges: {
          orderBy: { judgeOrder: 'asc' },
          include: {
            submissions: true,
          },
        },
      },
    });

    const judgesData = gradeLevels.map((grade) => {
      const totalRooms = grade.classrooms.length;

      const judges = grade.judges.map((judge) => {
        // Count how many classrooms this judge has completed
        const completedRooms = judge.submissions.filter((s) => s.isCompleted).length;
        const progressPercent = totalRooms > 0 ? Math.round((completedRooms / totalRooms) * 100) : 0;

        return {
          id: judge.id,
          name: judge.name,
          judgeOrder: judge.judgeOrder,
          avatarColor: judge.avatarColor,
          gradeLevelId: grade.id,
          gradeLevel: {
            id: grade.id,
            name: grade.name,
            shortName: grade.shortName,
          },
          totalRooms,
          completedRooms,
          progressPercent,
        };
      });

      return {
        ...grade,
        judges,
      };
    });

    const config = await prisma.adminConfig.findFirst();

    return NextResponse.json({
      success: true,
      gradeLevels: judgesData,
      config,
    });
  } catch (error: any) {
    console.error('Error fetching judges:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
