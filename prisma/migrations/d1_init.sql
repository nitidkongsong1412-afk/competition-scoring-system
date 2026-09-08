
-- CreateTable
CREATE TABLE IF NOT EXISTS "AdminConfig" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "passwordHash" TEXT NOT NULL DEFAULT 'admin1234',
    "competitionName" TEXT NOT NULL DEFAULT 'การประกวดคลิปสร้างสรรค์ ''เท่อย่างเซียน''',
    "schoolName" TEXT NOT NULL DEFAULT 'โรงเรียน',
    "academicYear" TEXT NOT NULL DEFAULT '2569',
    "goldMinScore" REAL NOT NULL DEFAULT 80.0,
    "silverMinScore" REAL NOT NULL DEFAULT 70.0,
    "bronzeMinScore" REAL NOT NULL DEFAULT 60.0,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "GradeLevel" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "shortName" TEXT NOT NULL,
    "levelOrder" INTEGER NOT NULL DEFAULT 1,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "Classroom" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "gradeLevelId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "roomNumber" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Classroom_gradeLevelId_fkey" FOREIGN KEY ("gradeLevelId") REFERENCES "GradeLevel" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "Judge" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "gradeLevelId" INTEGER NOT NULL,
    "judgeOrder" INTEGER NOT NULL DEFAULT 1,
    "avatarColor" TEXT NOT NULL DEFAULT 'amber',
    "pinCode" TEXT NOT NULL DEFAULT '0000',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Judge_gradeLevelId_fkey" FOREIGN KEY ("gradeLevelId") REFERENCES "GradeLevel" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "Criterion" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "maxScore" INTEGER NOT NULL,
    "criterionOrder" INTEGER NOT NULL DEFAULT 1,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "ScoreRecord" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "judgeId" INTEGER NOT NULL,
    "classroomId" INTEGER NOT NULL,
    "criterionId" INTEGER NOT NULL,
    "score" INTEGER NOT NULL DEFAULT 0,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ScoreRecord_judgeId_fkey" FOREIGN KEY ("judgeId") REFERENCES "Judge" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ScoreRecord_classroomId_fkey" FOREIGN KEY ("classroomId") REFERENCES "Classroom" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ScoreRecord_criterionId_fkey" FOREIGN KEY ("criterionId") REFERENCES "Criterion" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "JudgeClassSubmission" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "judgeId" INTEGER NOT NULL,
    "classroomId" INTEGER NOT NULL,
    "comment" TEXT NOT NULL DEFAULT '',
    "isCompleted" BOOLEAN NOT NULL DEFAULT false,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "JudgeClassSubmission_judgeId_fkey" FOREIGN KEY ("judgeId") REFERENCES "Judge" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "JudgeClassSubmission_classroomId_fkey" FOREIGN KEY ("classroomId") REFERENCES "Classroom" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE UNIQUE INDEX IF NOT EXISTS "ScoreRecord_judgeId_classroomId_criterionId_key" ON "ScoreRecord"("judgeId", "classroomId", "criterionId");
CREATE UNIQUE INDEX IF NOT EXISTS "JudgeClassSubmission_judgeId_classroomId_key" ON "JudgeClassSubmission"("judgeId", "classroomId");

INSERT OR REPLACE INTO "AdminConfig" ("id", "passwordHash", "competitionName", "schoolName", "academicYear", "goldMinScore", "silverMinScore", "bronzeMinScore", "updatedAt") VALUES (1, 'admin1234', 'การประกวดคลิปสร้างสรรค์ "เท่อย่างเซียน"', 'ระดับมัธยมศึกษา', '2569', 80, 70, 60, 1788361252290);
INSERT OR REPLACE INTO "GradeLevel" ("id", "name", "shortName", "levelOrder", "createdAt") VALUES (1, 'มัธยมศึกษาปีที่ 1', 'ม.1', 1, 1788361252308);
INSERT OR REPLACE INTO "GradeLevel" ("id", "name", "shortName", "levelOrder", "createdAt") VALUES (2, 'มัธยมศึกษาปีที่ 2', 'ม.2', 2, 1788361252345);
INSERT OR REPLACE INTO "GradeLevel" ("id", "name", "shortName", "levelOrder", "createdAt") VALUES (3, 'มัธยมศึกษาปีที่ 3', 'ม.3', 3, 1788361252384);
INSERT OR REPLACE INTO "GradeLevel" ("id", "name", "shortName", "levelOrder", "createdAt") VALUES (4, 'มัธยมศึกษาปีที่ 4', 'ม.4', 4, 1788361252420);
INSERT OR REPLACE INTO "GradeLevel" ("id", "name", "shortName", "levelOrder", "createdAt") VALUES (5, 'มัธยมศึกษาปีที่ 5', 'ม.5', 5, 1788361252456);
INSERT OR REPLACE INTO "GradeLevel" ("id", "name", "shortName", "levelOrder", "createdAt") VALUES (6, 'มัธยมศึกษาปีที่ 6', 'ม.6', 6, 1788361252492);
INSERT OR REPLACE INTO "Classroom" ("id", "gradeLevelId", "name", "roomNumber", "createdAt") VALUES (1, 1, 'ม.1/1', 1, 1788361252310);
INSERT OR REPLACE INTO "Classroom" ("id", "gradeLevelId", "name", "roomNumber", "createdAt") VALUES (2, 1, 'ม.1/2', 2, 1788361252313);
INSERT OR REPLACE INTO "Classroom" ("id", "gradeLevelId", "name", "roomNumber", "createdAt") VALUES (3, 1, 'ม.1/3', 3, 1788361252315);
INSERT OR REPLACE INTO "Classroom" ("id", "gradeLevelId", "name", "roomNumber", "createdAt") VALUES (4, 1, 'ม.1/4', 4, 1788361252317);
INSERT OR REPLACE INTO "Classroom" ("id", "gradeLevelId", "name", "roomNumber", "createdAt") VALUES (5, 1, 'ม.1/5', 5, 1788361252319);
INSERT OR REPLACE INTO "Classroom" ("id", "gradeLevelId", "name", "roomNumber", "createdAt") VALUES (6, 1, 'ม.1/6', 6, 1788361252321);
INSERT OR REPLACE INTO "Classroom" ("id", "gradeLevelId", "name", "roomNumber", "createdAt") VALUES (7, 1, 'ม.1/7', 7, 1788361252324);
INSERT OR REPLACE INTO "Classroom" ("id", "gradeLevelId", "name", "roomNumber", "createdAt") VALUES (8, 1, 'ม.1/8', 8, 1788361252326);
INSERT OR REPLACE INTO "Classroom" ("id", "gradeLevelId", "name", "roomNumber", "createdAt") VALUES (9, 1, 'ม.1/9', 9, 1788361252328);
INSERT OR REPLACE INTO "Classroom" ("id", "gradeLevelId", "name", "roomNumber", "createdAt") VALUES (10, 1, 'ม.1/10', 10, 1788361252330);
INSERT OR REPLACE INTO "Classroom" ("id", "gradeLevelId", "name", "roomNumber", "createdAt") VALUES (11, 1, 'ม.1/11', 11, 1788361252332);
INSERT OR REPLACE INTO "Classroom" ("id", "gradeLevelId", "name", "roomNumber", "createdAt") VALUES (12, 1, 'ม.1/12', 12, 1788361252334);
INSERT OR REPLACE INTO "Classroom" ("id", "gradeLevelId", "name", "roomNumber", "createdAt") VALUES (13, 1, 'ม.1/13', 13, 1788361252336);
INSERT OR REPLACE INTO "Classroom" ("id", "gradeLevelId", "name", "roomNumber", "createdAt") VALUES (14, 2, 'ม.2/1', 1, 1788361252348);
INSERT OR REPLACE INTO "Classroom" ("id", "gradeLevelId", "name", "roomNumber", "createdAt") VALUES (15, 2, 'ม.2/2', 2, 1788361252350);
INSERT OR REPLACE INTO "Classroom" ("id", "gradeLevelId", "name", "roomNumber", "createdAt") VALUES (16, 2, 'ม.2/3', 3, 1788361252352);
INSERT OR REPLACE INTO "Classroom" ("id", "gradeLevelId", "name", "roomNumber", "createdAt") VALUES (17, 2, 'ม.2/4', 4, 1788361252354);
INSERT OR REPLACE INTO "Classroom" ("id", "gradeLevelId", "name", "roomNumber", "createdAt") VALUES (18, 2, 'ม.2/5', 5, 1788361252357);
INSERT OR REPLACE INTO "Classroom" ("id", "gradeLevelId", "name", "roomNumber", "createdAt") VALUES (19, 2, 'ม.2/6', 6, 1788361252359);
INSERT OR REPLACE INTO "Classroom" ("id", "gradeLevelId", "name", "roomNumber", "createdAt") VALUES (20, 2, 'ม.2/7', 7, 1788361252361);
INSERT OR REPLACE INTO "Classroom" ("id", "gradeLevelId", "name", "roomNumber", "createdAt") VALUES (21, 2, 'ม.2/8', 8, 1788361252363);
INSERT OR REPLACE INTO "Classroom" ("id", "gradeLevelId", "name", "roomNumber", "createdAt") VALUES (22, 2, 'ม.2/9', 9, 1788361252365);
INSERT OR REPLACE INTO "Classroom" ("id", "gradeLevelId", "name", "roomNumber", "createdAt") VALUES (23, 2, 'ม.2/10', 10, 1788361252368);
INSERT OR REPLACE INTO "Classroom" ("id", "gradeLevelId", "name", "roomNumber", "createdAt") VALUES (24, 2, 'ม.2/11', 11, 1788361252370);
INSERT OR REPLACE INTO "Classroom" ("id", "gradeLevelId", "name", "roomNumber", "createdAt") VALUES (25, 2, 'ม.2/12', 12, 1788361252372);
INSERT OR REPLACE INTO "Classroom" ("id", "gradeLevelId", "name", "roomNumber", "createdAt") VALUES (26, 2, 'ม.2/13', 13, 1788361252374);
INSERT OR REPLACE INTO "Classroom" ("id", "gradeLevelId", "name", "roomNumber", "createdAt") VALUES (27, 3, 'ม.3/1', 1, 1788361252386);
INSERT OR REPLACE INTO "Classroom" ("id", "gradeLevelId", "name", "roomNumber", "createdAt") VALUES (28, 3, 'ม.3/2', 2, 1788361252388);
INSERT OR REPLACE INTO "Classroom" ("id", "gradeLevelId", "name", "roomNumber", "createdAt") VALUES (29, 3, 'ม.3/3', 3, 1788361252391);
INSERT OR REPLACE INTO "Classroom" ("id", "gradeLevelId", "name", "roomNumber", "createdAt") VALUES (30, 3, 'ม.3/4', 4, 1788361252392);
INSERT OR REPLACE INTO "Classroom" ("id", "gradeLevelId", "name", "roomNumber", "createdAt") VALUES (31, 3, 'ม.3/5', 5, 1788361252395);
INSERT OR REPLACE INTO "Classroom" ("id", "gradeLevelId", "name", "roomNumber", "createdAt") VALUES (32, 3, 'ม.3/6', 6, 1788361252397);
INSERT OR REPLACE INTO "Classroom" ("id", "gradeLevelId", "name", "roomNumber", "createdAt") VALUES (33, 3, 'ม.3/7', 7, 1788361252399);
INSERT OR REPLACE INTO "Classroom" ("id", "gradeLevelId", "name", "roomNumber", "createdAt") VALUES (34, 3, 'ม.3/8', 8, 1788361252401);
INSERT OR REPLACE INTO "Classroom" ("id", "gradeLevelId", "name", "roomNumber", "createdAt") VALUES (35, 3, 'ม.3/9', 9, 1788361252404);
INSERT OR REPLACE INTO "Classroom" ("id", "gradeLevelId", "name", "roomNumber", "createdAt") VALUES (36, 3, 'ม.3/10', 10, 1788361252406);
INSERT OR REPLACE INTO "Classroom" ("id", "gradeLevelId", "name", "roomNumber", "createdAt") VALUES (37, 3, 'ม.3/11', 11, 1788361252408);
INSERT OR REPLACE INTO "Classroom" ("id", "gradeLevelId", "name", "roomNumber", "createdAt") VALUES (38, 3, 'ม.3/12', 12, 1788361252410);
INSERT OR REPLACE INTO "Classroom" ("id", "gradeLevelId", "name", "roomNumber", "createdAt") VALUES (39, 4, 'ม.4/1', 1, 1788361252422);
INSERT OR REPLACE INTO "Classroom" ("id", "gradeLevelId", "name", "roomNumber", "createdAt") VALUES (40, 4, 'ม.4/2', 2, 1788361252424);
INSERT OR REPLACE INTO "Classroom" ("id", "gradeLevelId", "name", "roomNumber", "createdAt") VALUES (41, 4, 'ม.4/3', 3, 1788361252427);
INSERT OR REPLACE INTO "Classroom" ("id", "gradeLevelId", "name", "roomNumber", "createdAt") VALUES (42, 4, 'ม.4/4', 4, 1788361252429);
INSERT OR REPLACE INTO "Classroom" ("id", "gradeLevelId", "name", "roomNumber", "createdAt") VALUES (43, 4, 'ม.4/5', 5, 1788361252431);
INSERT OR REPLACE INTO "Classroom" ("id", "gradeLevelId", "name", "roomNumber", "createdAt") VALUES (44, 4, 'ม.4/6', 6, 1788361252433);
INSERT OR REPLACE INTO "Classroom" ("id", "gradeLevelId", "name", "roomNumber", "createdAt") VALUES (45, 4, 'ม.4/7', 7, 1788361252435);
INSERT OR REPLACE INTO "Classroom" ("id", "gradeLevelId", "name", "roomNumber", "createdAt") VALUES (46, 4, 'ม.4/8', 8, 1788361252437);
INSERT OR REPLACE INTO "Classroom" ("id", "gradeLevelId", "name", "roomNumber", "createdAt") VALUES (47, 4, 'ม.4/9', 9, 1788361252440);
INSERT OR REPLACE INTO "Classroom" ("id", "gradeLevelId", "name", "roomNumber", "createdAt") VALUES (48, 4, 'ม.4/10', 10, 1788361252442);
INSERT OR REPLACE INTO "Classroom" ("id", "gradeLevelId", "name", "roomNumber", "createdAt") VALUES (49, 4, 'ม.4/11', 11, 1788361252444);
INSERT OR REPLACE INTO "Classroom" ("id", "gradeLevelId", "name", "roomNumber", "createdAt") VALUES (50, 4, 'ม.4/12', 12, 1788361252446);
INSERT OR REPLACE INTO "Classroom" ("id", "gradeLevelId", "name", "roomNumber", "createdAt") VALUES (51, 5, 'ม.5/1', 1, 1788361252458);
INSERT OR REPLACE INTO "Classroom" ("id", "gradeLevelId", "name", "roomNumber", "createdAt") VALUES (52, 5, 'ม.5/2', 2, 1788361252460);
INSERT OR REPLACE INTO "Classroom" ("id", "gradeLevelId", "name", "roomNumber", "createdAt") VALUES (53, 5, 'ม.5/3', 3, 1788361252462);
INSERT OR REPLACE INTO "Classroom" ("id", "gradeLevelId", "name", "roomNumber", "createdAt") VALUES (54, 5, 'ม.5/4', 4, 1788361252465);
INSERT OR REPLACE INTO "Classroom" ("id", "gradeLevelId", "name", "roomNumber", "createdAt") VALUES (55, 5, 'ม.5/5', 5, 1788361252467);
INSERT OR REPLACE INTO "Classroom" ("id", "gradeLevelId", "name", "roomNumber", "createdAt") VALUES (56, 5, 'ม.5/6', 6, 1788361252469);
INSERT OR REPLACE INTO "Classroom" ("id", "gradeLevelId", "name", "roomNumber", "createdAt") VALUES (57, 5, 'ม.5/7', 7, 1788361252472);
INSERT OR REPLACE INTO "Classroom" ("id", "gradeLevelId", "name", "roomNumber", "createdAt") VALUES (58, 5, 'ม.5/8', 8, 1788361252474);
INSERT OR REPLACE INTO "Classroom" ("id", "gradeLevelId", "name", "roomNumber", "createdAt") VALUES (59, 5, 'ม.5/9', 9, 1788361252476);
INSERT OR REPLACE INTO "Classroom" ("id", "gradeLevelId", "name", "roomNumber", "createdAt") VALUES (60, 5, 'ม.5/10', 10, 1788361252478);
INSERT OR REPLACE INTO "Classroom" ("id", "gradeLevelId", "name", "roomNumber", "createdAt") VALUES (61, 5, 'ม.5/11', 11, 1788361252481);
INSERT OR REPLACE INTO "Classroom" ("id", "gradeLevelId", "name", "roomNumber", "createdAt") VALUES (62, 5, 'ม.5/12', 12, 1788361252483);
INSERT OR REPLACE INTO "Classroom" ("id", "gradeLevelId", "name", "roomNumber", "createdAt") VALUES (63, 6, 'ม.6/1', 1, 1788361252495);
INSERT OR REPLACE INTO "Classroom" ("id", "gradeLevelId", "name", "roomNumber", "createdAt") VALUES (64, 6, 'ม.6/2', 2, 1788361252497);
INSERT OR REPLACE INTO "Classroom" ("id", "gradeLevelId", "name", "roomNumber", "createdAt") VALUES (65, 6, 'ม.6/3', 3, 1788361252499);
INSERT OR REPLACE INTO "Classroom" ("id", "gradeLevelId", "name", "roomNumber", "createdAt") VALUES (66, 6, 'ม.6/4', 4, 1788361252501);
INSERT OR REPLACE INTO "Classroom" ("id", "gradeLevelId", "name", "roomNumber", "createdAt") VALUES (67, 6, 'ม.6/5', 5, 1788361252503);
INSERT OR REPLACE INTO "Classroom" ("id", "gradeLevelId", "name", "roomNumber", "createdAt") VALUES (68, 6, 'ม.6/6', 6, 1788361252506);
INSERT OR REPLACE INTO "Classroom" ("id", "gradeLevelId", "name", "roomNumber", "createdAt") VALUES (69, 6, 'ม.6/7', 7, 1788361252508);
INSERT OR REPLACE INTO "Classroom" ("id", "gradeLevelId", "name", "roomNumber", "createdAt") VALUES (70, 6, 'ม.6/8', 8, 1788361252510);
INSERT OR REPLACE INTO "Classroom" ("id", "gradeLevelId", "name", "roomNumber", "createdAt") VALUES (71, 6, 'ม.6/9', 9, 1788361252512);
INSERT OR REPLACE INTO "Classroom" ("id", "gradeLevelId", "name", "roomNumber", "createdAt") VALUES (72, 6, 'ม.6/10', 10, 1788361252515);
INSERT OR REPLACE INTO "Classroom" ("id", "gradeLevelId", "name", "roomNumber", "createdAt") VALUES (73, 6, 'ม.6/11', 11, 1788361252517);
INSERT OR REPLACE INTO "Judge" ("id", "name", "gradeLevelId", "judgeOrder", "avatarColor", "pinCode", "createdAt") VALUES (1, 'กรรมการท่านที่ 1 (ม.1)', 1, 1, 'amber', '0101', 1788361252339);
INSERT OR REPLACE INTO "Judge" ("id", "name", "gradeLevelId", "judgeOrder", "avatarColor", "pinCode", "createdAt") VALUES (2, 'กรรมการท่านที่ 2 (ม.1)', 1, 2, 'amber', '0102', 1788361252341);
INSERT OR REPLACE INTO "Judge" ("id", "name", "gradeLevelId", "judgeOrder", "avatarColor", "pinCode", "createdAt") VALUES (3, 'กรรมการท่านที่ 3 (ม.1)', 1, 3, 'amber', '0103', 1788361252343);
INSERT OR REPLACE INTO "Judge" ("id", "name", "gradeLevelId", "judgeOrder", "avatarColor", "pinCode", "createdAt") VALUES (4, 'กรรมการท่านที่ 1 (ม.2)', 2, 1, 'emerald', '0201', 1788361252377);
INSERT OR REPLACE INTO "Judge" ("id", "name", "gradeLevelId", "judgeOrder", "avatarColor", "pinCode", "createdAt") VALUES (5, 'กรรมการท่านที่ 2 (ม.2)', 2, 2, 'emerald', '0202', 1788361252379);
INSERT OR REPLACE INTO "Judge" ("id", "name", "gradeLevelId", "judgeOrder", "avatarColor", "pinCode", "createdAt") VALUES (6, 'กรรมการท่านที่ 3 (ม.2)', 2, 3, 'emerald', '0203', 1788361252381);
INSERT OR REPLACE INTO "Judge" ("id", "name", "gradeLevelId", "judgeOrder", "avatarColor", "pinCode", "createdAt") VALUES (7, 'กรรมการท่านที่ 1 (ม.3)', 3, 1, 'sky', '0301', 1788361252413);
INSERT OR REPLACE INTO "Judge" ("id", "name", "gradeLevelId", "judgeOrder", "avatarColor", "pinCode", "createdAt") VALUES (8, 'กรรมการท่านที่ 2 (ม.3)', 3, 2, 'sky', '0302', 1788361252415);
INSERT OR REPLACE INTO "Judge" ("id", "name", "gradeLevelId", "judgeOrder", "avatarColor", "pinCode", "createdAt") VALUES (9, 'กรรมการท่านที่ 3 (ม.3)', 3, 3, 'sky', '0303', 1788361252417);
INSERT OR REPLACE INTO "Judge" ("id", "name", "gradeLevelId", "judgeOrder", "avatarColor", "pinCode", "createdAt") VALUES (10, 'กรรมการท่านที่ 1 (ม.4)', 4, 1, 'rose', '0401', 1788361252449);
INSERT OR REPLACE INTO "Judge" ("id", "name", "gradeLevelId", "judgeOrder", "avatarColor", "pinCode", "createdAt") VALUES (11, 'กรรมการท่านที่ 2 (ม.4)', 4, 2, 'rose', '0402', 1788361252451);
INSERT OR REPLACE INTO "Judge" ("id", "name", "gradeLevelId", "judgeOrder", "avatarColor", "pinCode", "createdAt") VALUES (12, 'กรรมการท่านที่ 3 (ม.4)', 4, 3, 'rose', '0403', 1788361252453);
INSERT OR REPLACE INTO "Judge" ("id", "name", "gradeLevelId", "judgeOrder", "avatarColor", "pinCode", "createdAt") VALUES (13, 'กรรมการท่านที่ 1 (ม.5)', 5, 1, 'indigo', '0501', 1788361252485);
INSERT OR REPLACE INTO "Judge" ("id", "name", "gradeLevelId", "judgeOrder", "avatarColor", "pinCode", "createdAt") VALUES (14, 'กรรมการท่านที่ 2 (ม.5)', 5, 2, 'indigo', '0502', 1788361252488);
INSERT OR REPLACE INTO "Judge" ("id", "name", "gradeLevelId", "judgeOrder", "avatarColor", "pinCode", "createdAt") VALUES (15, 'กรรมการท่านที่ 3 (ม.5)', 5, 3, 'indigo', '0503', 1788361252490);
INSERT OR REPLACE INTO "Judge" ("id", "name", "gradeLevelId", "judgeOrder", "avatarColor", "pinCode", "createdAt") VALUES (16, 'กรรมการท่านที่ 1 (ม.6)', 6, 1, 'purple', '0601', 1788361252519);
INSERT OR REPLACE INTO "Judge" ("id", "name", "gradeLevelId", "judgeOrder", "avatarColor", "pinCode", "createdAt") VALUES (17, 'กรรมการท่านที่ 2 (ม.6)', 6, 2, 'purple', '0602', 1788361252524);
INSERT OR REPLACE INTO "Judge" ("id", "name", "gradeLevelId", "judgeOrder", "avatarColor", "pinCode", "createdAt") VALUES (18, 'กรรมการท่านที่ 3 (ม.6)', 6, 3, 'purple', '0603', 1788361252526);
INSERT OR REPLACE INTO "Criterion" ("id", "title", "description", "maxScore", "criterionOrder", "createdAt") VALUES (1, 'คลิปสร้างสรรค์สื่อถึงและแสดงออกถึงความเป็นไทย', 'การนำเสนอเนื้อหาความคิดสร้างสรรค์ บ่งบอกถึงอัตลักษณ์ความเป็นไทยอย่างชัดเจน', 40, 1, 1788361252295);
INSERT OR REPLACE INTO "Criterion" ("id", "title", "description", "maxScore", "criterionOrder", "createdAt") VALUES (2, 'ท่าทางถูกต้องตามโจทย์ที่กำหนดและสวยงาม มีความเป็นธรรมชาติ คล่องแคล่ว นุ่มนวล มีทักษะ มีความพร้อมเพรียง', 'ความถูกต้องตามท่าทาง ความพร้อมเพรียง ความสวยงามและความเป็นธรรมชาติ', 30, 2, 1788361252297);
INSERT OR REPLACE INTO "Criterion" ("id", "title", "description", "maxScore", "criterionOrder", "createdAt") VALUES (3, 'ความตรงต่อเวลา / นักเรียนครบตามจำนวน', 'ส่งผลงานตรงตามเวลาที่กำหนด และมีจำนวนสมาชิกนักเรียนครบถ้วนตามเกณฑ์', 10, 3, 1788361252299);
INSERT OR REPLACE INTO "Criterion" ("id", "title", "description", "maxScore", "criterionOrder", "createdAt") VALUES (4, 'การถ่ายทำ ตัดต่อ บันทึกภาพ ชัดเจน', 'คุณภาพของภาพและเสียง ความลื่นไหลของการตัดต่อและการจัดองค์ประกอบภาพ', 10, 4, 1788361252302);
INSERT OR REPLACE INTO "Criterion" ("id", "title", "description", "maxScore", "criterionOrder", "createdAt") VALUES (5, 'ไม่มีคำหยาบ ความรุนแรง บุคลิกภาพ การแต่งกายเป็นระเบียบเรียบร้อย', 'ความสุภาพเรียบร้อย ความเหมาะสมของเนื้อหา และการแต่งกายถูกต้องตามระเบียบ', 10, 5, 1788361252304);
