'use client';

import { useEffect, useState, use } from 'react';
import Link from 'next/link';
import { formatScore } from '@/lib/utils';
import { Printer, ArrowLeft } from 'lucide-react';

export default function PrintScoreSheetPage({
  params,
}: {
  params: Promise<{ gradeId: string }>;
}) {
  const { gradeId } = use(params);
  const [overviewData, setOverviewData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/overview')
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setOverviewData(data);
        }
      })
      .catch((e) => console.error(e))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-8">
        <p className="text-slate-600 font-bold">กำลังเตรียมเอกสารสรุปผลคะแนน...</p>
      </div>
    );
  }

  const grade = overviewData?.grades?.find((g: any) => g.gradeId === parseInt(gradeId, 10));
  const config = overviewData?.config;
  const judges = grade?.judges || [];
  const leaderboard = grade?.leaderboard || [];

  if (!grade) {
    return (
      <div className="p-8 text-center">
        <p className="text-rose-600 font-bold">ไม่พบข้อมูลระดับชั้นที่ระบุ</p>
        <Link href="/" className="mt-4 inline-block text-amber-600 underline">
          กลับสู่หน้าแรก
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 py-6 px-4 print:p-0 print:bg-white text-slate-900 font-serif">
      {/* Top action bar (hidden during print) */}
      <div className="max-w-4xl mx-auto mb-6 flex items-center justify-between no-print bg-white p-4 rounded-2xl shadow-sm border border-slate-200">
        <div className="flex items-center gap-3">
          <Link
            href="/admin"
            className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center gap-1 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>กลับหน้าแอดมิน</span>
          </Link>
          <span className="text-sm font-bold text-slate-700">
            เอกสารสรุปผลคะแนนทางการระดับชั้น{grade.gradeName}
          </span>
        </div>

        <button
          onClick={() => window.print()}
          className="px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm flex items-center gap-2 shadow-sm transition-all active:scale-95"
        >
          <Printer className="w-4 h-4" />
          <span>พิมพ์เอกสารนี้ (Print / PDF)</span>
        </button>
      </div>

      {/* Official A4 Printable Page Container */}
      <div className="max-w-4xl mx-auto bg-white p-8 sm:p-12 rounded-3xl shadow-md print:shadow-none print:p-4 print:max-w-full border print:border-none">
        {/* Header */}
        <div className="text-center pb-5 border-b-2 border-slate-900 mb-6">
          <h1 className="text-xl font-bold tracking-tight text-slate-900 mb-1">
            ใบบันทึกสรุปผลการตัดสินการประกวดคลิปสร้างสรรค์
          </h1>
          <h2 className="text-lg font-extrabold text-slate-900 mb-1">
            {config?.competitionName || '"เท่อย่างเซียน"'}
          </h2>
          <p className="text-xs text-slate-600">
            ระดับชั้น{grade.gradeName} ({grade.gradeShortName}) • {config?.schoolName || 'ระดับมัธยมศึกษา'} • ปีการศึกษา {config?.academicYear || '2569'}
          </p>
        </div>

        {/* Info Box */}
        <div className="grid grid-cols-2 gap-4 text-xs text-slate-700 mb-6 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
          <div>
            <p><strong>จำนวนห้องเรียนที่เข้าแข่งขัน:</strong> {leaderboard.length} ห้อง</p>
            <p><strong>เกณฑ์การตัดสิน:</strong> รวม 5 ข้อ (100 คะแนนเต็ม)</p>
          </div>
          <div>
            <p><strong>วิธีคิดคะแนน:</strong> คะแนนเฉลี่ย (Mean) และส่วนเบี่ยงเบนมาตรฐาน (S.D.)</p>
            <p><strong>เกณฑ์เหรียญรางวัล:</strong> ทอง (80+), เงิน (70-79), ทองแดง (60-69)</p>
          </div>
        </div>

        {/* Results Table with Mean and S.D. */}
        <table className="w-full border-collapse border border-slate-800 text-xs mb-8">
          <thead>
            <tr className="bg-slate-100 text-slate-900 border-b border-slate-800">
              <th className="border border-slate-800 py-2 px-1 text-center w-10 font-bold">อันดับ</th>
              <th className="border border-slate-800 py-2 px-2 text-left font-bold">ห้องเรียน</th>
              {judges.map((j: any) => (
                <th key={j.id} className="border border-slate-800 py-2 px-1 text-center font-bold">
                  {j.name} (100)
                </th>
              ))}
              <th className="border border-slate-800 py-2 px-1 text-center font-bold bg-slate-200/80">
                คะแนนเฉลี่ย (Mean)
              </th>
              <th className="border border-slate-800 py-2 px-1 text-center font-bold">
                ส่วนเบี่ยงเบน (S.D.)
              </th>
              <th className="border border-slate-800 py-2 px-2 text-center font-bold">
                ผลการตัดสิน / เหรียญ
              </th>
              <th className="border border-slate-800 py-2 px-2 text-left font-bold">
                ข้อเสนอแนะ
              </th>
            </tr>
          </thead>
          <tbody>
            {leaderboard.map((room: any) => {
              const allComments = room.judgeScores
                .filter((js: any) => js.comment)
                .map((js: any) => js.comment)
                .join('; ');

              return (
                <tr key={room.classroomId} className="border-b border-slate-300">
                  <td className="border border-slate-800 py-2 px-1 text-center font-bold">
                    {room.rank}
                  </td>
                  <td className="border border-slate-800 py-2 px-2 font-bold">
                    ห้อง {room.classroomName}
                  </td>
                  {judges.map((j: any) => {
                    const js = room.judgeScores.find((s: any) => s.judgeId === j.id);
                    return (
                      <td key={j.id} className="border border-slate-800 py-2 px-1 text-center">
                        {js?.isCompleted || (js?.totalScore && js.totalScore > 0)
                          ? js.totalScore
                          : '-'}
                      </td>
                    );
                  })}
                  <td className="border border-slate-800 py-2 px-1 text-center font-bold bg-slate-50">
                    {room.averageScore > 0 ? formatScore(room.averageScore) : '-'}
                  </td>
                  <td className="border border-slate-800 py-2 px-1 text-center font-semibold">
                    {room.averageScore > 0 ? formatScore(room.sd || 0) : '-'}
                  </td>
                  <td className="border border-slate-800 py-2 px-2 text-center font-semibold">
                    {room.averageScore > 0 ? room.medalLabel : 'รอผลคะแนน'}
                  </td>
                  <td className="border border-slate-800 py-2 px-2 text-[11px] text-slate-600">
                    {allComments || '-'}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {/* Signature Blocks for 3 Judges */}
        <div className="pt-6 border-t border-slate-300 mt-12">
          <p className="text-center font-bold text-xs mb-8">
            ขอรับรองว่าผลการตัดสินข้างต้นถูกต้องตามเกณฑ์การประเมินทุกประการ
          </p>

          <div className="grid grid-cols-3 gap-6 text-center text-xs">
            {judges.map((judge: any, idx: number) => (
              <div key={judge.id} className="space-y-2">
                <div className="pt-8">
                  <p className="text-slate-400">......................................................</p>
                  <p className="font-bold text-slate-900 mt-2">({judge.name})</p>
                  <p className="text-slate-500 text-[11px] mt-0.5">กรรมการตัดสินท่านที่ {idx + 1}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Document Footer */}
        <div className="mt-12 pt-4 border-t border-slate-200 text-center text-[10px] text-slate-400">
          พิมพ์จากระบบลงคะแนนการประกวด • วันที่พิมพ์ {new Date().toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })} น.
        </div>
      </div>
    </div>
  );
}
