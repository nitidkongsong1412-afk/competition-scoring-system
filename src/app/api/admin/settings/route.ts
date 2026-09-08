import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const config = await prisma.adminConfig.findFirst();
    return NextResponse.json({ success: true, config });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      passwordHash,
      competitionName,
      schoolName,
      academicYear,
      goldMinScore,
      silverMinScore,
      bronzeMinScore,
    } = body;

    let config = await prisma.adminConfig.findFirst();

    if (!config) {
      config = await prisma.adminConfig.create({
        data: {
          passwordHash: passwordHash || 'admin1234',
          competitionName: competitionName || 'การประกวดคลิปสร้างสรรค์ "เท่อย่างเซียน"',
          schoolName: schoolName || 'ระดับมัธยมศึกษา',
          academicYear: academicYear || '2569',
          goldMinScore: parseFloat(goldMinScore) || 80.0,
          silverMinScore: parseFloat(silverMinScore) || 70.0,
          bronzeMinScore: parseFloat(bronzeMinScore) || 60.0,
        },
      });
    } else {
      config = await prisma.adminConfig.update({
        where: { id: config.id },
        data: {
          ...(passwordHash && { passwordHash }),
          ...(competitionName && { competitionName }),
          ...(schoolName && { schoolName }),
          ...(academicYear && { academicYear }),
          ...(goldMinScore !== undefined && { goldMinScore: parseFloat(goldMinScore) }),
          ...(silverMinScore !== undefined && { silverMinScore: parseFloat(silverMinScore) }),
          ...(bronzeMinScore !== undefined && { bronzeMinScore: parseFloat(bronzeMinScore) }),
        },
      });
    }

    return NextResponse.json({ success: true, config, message: 'บันทึกการตั้งค่าเรียบร้อย' });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
