import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { calculateMedal, calculateSD } from '@/lib/utils';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const config = await prisma.adminConfig.findFirst();
    const goldMin = config?.goldMinScore ?? 80.0;
    const silverMin = config?.silverMinScore ?? 70.0;
    const bronzeMin = config?.bronzeMinScore ?? 60.0;

    const gradeLevels = await prisma.gradeLevel.findMany({
      orderBy: { levelOrder: 'asc' },
      include: {
        judges: {
          orderBy: { judgeOrder: 'asc' },
        },
        classrooms: {
          orderBy: { roomNumber: 'asc' },
          include: {
            scores: {
              include: {
                criterion: true,
                judge: true,
              },
            },
            submissions: {
              include: {
                judge: true,
              },
            },
          },
        },
      },
    });

    const criteria = await prisma.criterion.findMany({
      orderBy: { criterionOrder: 'asc' },
    });

    const overviewByGrade = gradeLevels.map((grade) => {
      const judges = grade.judges;
      const totalJudgesInGrade = judges.length;

      // Process each classroom
      const classroomResults = grade.classrooms.map((room) => {
        let totalScoreAllJudges = 0;
        let completedJudgesCount = 0;

        const judgeScoreDetails = judges.map((judge) => {
          // Find submission for this judge & room
          const submission = room.submissions.find((s) => s.judgeId === judge.id);
          const isCompleted = submission?.isCompleted ?? false;
          const comment = submission?.comment ?? '';

          // Scores given by this judge for this room
          const judgeRoomScores = room.scores.filter((s) => s.judgeId === judge.id);
          const criteriaScores: Record<number, number> = {};
          let judgeSum = 0;

          criteria.forEach((c) => {
            const scoreObj = judgeRoomScores.find((s) => s.criterionId === c.id);
            const scoreVal = scoreObj ? scoreObj.score : 0;
            criteriaScores[c.id] = scoreVal;
            judgeSum += scoreVal;
          });

          if (isCompleted) {
            completedJudgesCount++;
          }

          totalScoreAllJudges += judgeSum;

          return {
            judgeId: judge.id,
            judgeName: judge.name,
            judgeOrder: judge.judgeOrder,
            totalScore: judgeSum,
            isCompleted,
            criteriaScores,
            comment,
          };
        });

        // Compute average score: user specified "หาร 3 ตามจำนวนคณะกรรมการแต่ละชั้น"
        // If totalJudgesInGrade > 0, we divide by totalJudgesInGrade (default 3)
        const divisor = totalJudgesInGrade > 0 ? totalJudgesInGrade : 3;
        const averageScore = Number((totalScoreAllJudges / divisor).toFixed(2));

        const medalInfo = calculateMedal(averageScore, goldMin, silverMin, bronzeMin);

        // Compute S.D. of judges' scores
        const judgeTotalScores = judgeScoreDetails
          .filter((js) => js.isCompleted || js.totalScore > 0)
          .map((js) => js.totalScore);
        const sd = calculateSD(judgeTotalScores);

        return {
          classroomId: room.id,
          classroomName: room.name,
          roomNumber: room.roomNumber,
          gradeLevelId: grade.id,
          gradeLevelName: grade.name,
          gradeLevelShortName: grade.shortName,
          judgeScores: judgeScoreDetails,
          totalSumScore: totalScoreAllJudges,
          averageScore,
          sd,
          completedJudgesCount,
          totalJudgesCount: totalJudgesInGrade,
          isAllCompleted: completedJudgesCount === totalJudgesInGrade && totalJudgesInGrade > 0,
          medal: medalInfo.medal,
          medalLabel: medalInfo.label,
          medalColor: medalInfo.color,
          medalBadgeBg: medalInfo.badgeBg,
          rank: 0,
        };
      });

      // Sort by averageScore descending to calculate ranks
      const sortedRooms = [...classroomResults].sort((a, b) => b.averageScore - a.averageScore);

      // Assign ranks (handling ties)
      let currentRank = 1;
      sortedRooms.forEach((room, index) => {
        if (index > 0 && room.averageScore < sortedRooms[index - 1].averageScore) {
          currentRank = index + 1;
        }
        room.rank = currentRank;
      });

      // Re-sort back by roomNumber for standard table view, while keeping .rank property
      const roomsOrderedByRoomNumber = [...classroomResults].sort((a, b) => a.roomNumber - b.roomNumber);

      return {
        gradeId: grade.id,
        gradeName: grade.name,
        gradeShortName: grade.shortName,
        judges,
        classrooms: roomsOrderedByRoomNumber,
        leaderboard: sortedRooms, // Sorted by score for leaderboard view
      };
    });

    return NextResponse.json({
      success: true,
      config,
      criteria,
      grades: overviewByGrade,
    });
  } catch (error: any) {
    console.error('Error getting admin overview:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
