export interface AdminConfigData {
  id: number;
  passwordHash: string;
  competitionName: string;
  schoolName: string;
  academicYear: string;
  goldMinScore: number;
  silverMinScore: number;
  bronzeMinScore: number;
}

export interface CriterionData {
  id: number;
  title: string;
  description: string;
  maxScore: number;
  criterionOrder: number;
}

export interface ClassroomData {
  id: number;
  gradeLevelId: number;
  name: string;
  roomNumber: number;
}

export interface JudgeData {
  id: number;
  name: string;
  gradeLevelId: number;
  judgeOrder: number;
  avatarColor: string;
  gradeLevel?: {
    id: number;
    name: string;
    shortName: string;
  };
  totalRooms?: number;
  completedRooms?: number;
  progressPercent?: number;
}

export interface ScoreRecordData {
  id: number;
  judgeId: number;
  classroomId: number;
  criterionId: number;
  score: number;
}

export interface SubmissionData {
  id: number;
  judgeId: number;
  classroomId: number;
  comment: string;
  isCompleted: boolean;
}

export interface ClassroomResultData {
  classroomId: number;
  classroomName: string;
  roomNumber: number;
  gradeLevelId: number;
  gradeLevelName: string;
  judgeScores: {
    judgeId: number;
    judgeName: string;
    judgeOrder: number;
    totalScore: number;
    isCompleted: boolean;
    criteriaScores: Record<number, number>;
    comment?: string;
  }[];
  averageScore: number;
  sd?: number;
  totalSumScore: number;
  completedJudgesCount: number;
  totalJudgesCount: number;
  isAllCompleted: boolean;
  rank?: number;
  medal?: 'gold' | 'silver' | 'bronze' | 'participant';
  medalLabel?: string;
}
