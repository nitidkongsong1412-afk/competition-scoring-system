const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('--- เริ่มต้นสร้างข้อมูลเริ่มต้น (Seeding Data) ---');

  // 1. Admin Config
  const existingConfig = await prisma.adminConfig.findFirst();
  if (!existingConfig) {
    await prisma.adminConfig.create({
      data: {
        passwordHash: 'admin1234',
        competitionName: 'การประกวดคลิปสร้างสรรค์ "เท่อย่างเซียน"',
        schoolName: 'ระดับมัธยมศึกษา',
        academicYear: '2569',
        goldMinScore: 80.0,
        silverMinScore: 70.0,
        bronzeMinScore: 60.0,
      }
    });
    console.log('✓ สร้างการตั้งค่าแอดมินเริ่มต้นเรียบร้อย (รหัสผ่านเริ่มต้น: admin1234)');
  }

  // 2. Criteria (5 ข้อ รวม 100 คะแนน)
  const criteriaCount = await prisma.criterion.count();
  if (criteriaCount === 0) {
    const criteriaData = [
      {
        criterionOrder: 1,
        title: 'คลิปสร้างสรรค์สื่อถึงและแสดงออกถึงความเป็นไทย',
        description: 'การนำเสนอเนื้อหาความคิดสร้างสรรค์ บ่งบอกถึงอัตลักษณ์ความเป็นไทยอย่างชัดเจน',
        maxScore: 40,
      },
      {
        criterionOrder: 2,
        title: 'ท่าทางถูกต้องตามโจทย์ที่กำหนดและสวยงาม มีความเป็นธรรมชาติ คล่องแคล่ว นุ่มนวล มีทักษะ มีความพร้อมเพรียง',
        description: 'ความถูกต้องตามท่าทาง ความพร้อมเพรียง ความสวยงามและความเป็นธรรมชาติ',
        maxScore: 30,
      },
      {
        criterionOrder: 3,
        title: 'ความตรงต่อเวลา / นักเรียนครบตามจำนวน',
        description: 'ส่งผลงานตรงตามเวลาที่กำหนด และมีจำนวนสมาชิกนักเรียนครบถ้วนตามเกณฑ์',
        maxScore: 10,
      },
      {
        criterionOrder: 4,
        title: 'การถ่ายทำ ตัดต่อ บันทึกภาพ ชัดเจน',
        description: 'คุณภาพของภาพและเสียง ความลื่นไหลของการตัดต่อและการจัดองค์ประกอบภาพ',
        maxScore: 10,
      },
      {
        criterionOrder: 5,
        title: 'ไม่มีคำหยาบ ความรุนแรง บุคลิกภาพ การแต่งกายเป็นระเบียบเรียบร้อย',
        description: 'ความสุภาพเรียบร้อย ความเหมาะสมของเนื้อหา และการแต่งกายถูกต้องตามระเบียบ',
        maxScore: 10,
      },
    ];

    for (const c of criteriaData) {
      await prisma.criterion.create({ data: c });
    }
    console.log('✓ สร้างเกณฑ์การตัดสิน 5 ข้อ (รวม 100 คะแนน) เรียบร้อย');
  }

  // 3. Grade Levels, Classrooms & Judges
  const gradeLevelsConfig = [
    { name: 'มัธยมศึกษาปีที่ 1', shortName: 'ม.1', order: 1, roomCount: 13 },
    { name: 'มัธยมศึกษาปีที่ 2', shortName: 'ม.2', order: 2, roomCount: 13 },
    { name: 'มัธยมศึกษาปีที่ 3', shortName: 'ม.3', order: 3, roomCount: 12 },
    { name: 'มัธยมศึกษาปีที่ 4', shortName: 'ม.4', order: 4, roomCount: 12 },
    { name: 'มัธยมศึกษาปีที่ 5', shortName: 'ม.5', order: 5, roomCount: 12 },
    { name: 'มัธยมศึกษาปีที่ 6', shortName: 'ม.6', order: 6, roomCount: 11 },
  ];

  const colors = ['amber', 'emerald', 'sky', 'rose', 'indigo', 'purple'];

  for (const g of gradeLevelsConfig) {
    let gradeLevel = await prisma.gradeLevel.findFirst({
      where: { shortName: g.shortName }
    });

    if (!gradeLevel) {
      gradeLevel = await prisma.gradeLevel.create({
        data: {
          name: g.name,
          shortName: g.shortName,
          levelOrder: g.order,
        }
      });
      console.log(`✓ สร้างระดับชั้น ${g.name} (${g.shortName})`);
    }

    // Classrooms
    const existingRooms = await prisma.classroom.count({
      where: { gradeLevelId: gradeLevel.id }
    });

    if (existingRooms === 0) {
      for (let r = 1; r <= g.roomCount; r++) {
        await prisma.classroom.create({
          data: {
            gradeLevelId: gradeLevel.id,
            name: `${g.shortName}/${r}`,
            roomNumber: r,
          }
        });
      }
      console.log(`  └─ สร้างห้องเรียน ${g.shortName}/1 ถึง ${g.shortName}/${g.roomCount} (รวม ${g.roomCount} ห้อง)`);
    }

    // Judges (3 ท่าน ต่อระดับชั้น)
    const existingJudges = await prisma.judge.count({
      where: { gradeLevelId: gradeLevel.id }
    });

    if (existingJudges === 0) {
      const gradeCode = String(g.order).padStart(2, '0'); // "01" for ม.1, "02" for ม.2 ...
      for (let j = 1; j <= 3; j++) {
        const judgeCode = String(j).padStart(2, '0');     // "01", "02", "03"
        const pinCode = `${gradeCode}${judgeCode}`;       // e.g. "0101", "0102", "0601"
        await prisma.judge.create({
          data: {
            name: `กรรมการท่านที่ ${j} (${g.shortName})`,
            gradeLevelId: gradeLevel.id,
            judgeOrder: j,
            avatarColor: colors[(g.order - 1) % colors.length],
            pinCode,
          }
        });
      }
      console.log(`  └─ สร้างกรรมการ 3 ท่านสำหรับระดับชั้น ${g.shortName} (PIN: ${gradeCode}01 - ${gradeCode}03)`);
    }
  }

  console.log('--- สำเร็จ! สร้างข้อมูลเริ่มต้นครบถ้วน 100% ---');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
