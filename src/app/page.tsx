'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import {
  Users,
  CheckCircle2,
  Clock,
  ArrowRight,
  Sparkles,
  Trophy,
  BarChart,
  School,
  Layers,
  Search,
} from 'lucide-react';

interface Judge {
  id: number;
  name: string;
  judgeOrder: number;
  avatarColor: string;
  gradeLevelId: number;
  gradeLevel: {
    id: number;
    name: string;
    shortName: string;
  };
  totalRooms: number;
  completedRooms: number;
  progressPercent: number;
}

interface GradeLevelData {
  id: number;
  name: string;
  shortName: string;
  levelOrder: number;
  classrooms: { id: number; name: string; roomNumber: number }[];
  judges: Judge[];
}

export default function HomePage() {
  const [gradeLevels, setGradeLevels] = useState<GradeLevelData[]>([]);
  const [selectedGradeId, setSelectedGradeId] = useState<number | 'all'>('all');
  const [loading, setLoading] = useState(true);
  const [config, setConfig] = useState<any>(null);

  useEffect(() => {
    fetchJudges();
    const interval = setInterval(fetchJudges, 10000);
    return () => clearInterval(interval);
  }, []);

  const fetchJudges = async () => {
    try {
      const res = await fetch('/api/judges');
      const data = await res.json();
      if (data.success) {
        setGradeLevels(data.gradeLevels);
        setConfig(data.config);
      }
    } catch (err) {
      console.error('Error fetching judges:', err);
    } finally {
      setLoading(false);
    }
  };

  // Compute overall stats
  let totalClassrooms = 0;
  let totalJudges = 0;
  let totalSubmissionsNeeded = 0;
  let totalSubmissionsDone = 0;

  gradeLevels.forEach((g) => {
    totalClassrooms += g.classrooms.length;
    totalJudges += g.judges.length;
    g.judges.forEach((j) => {
      totalSubmissionsNeeded += j.totalRooms;
      totalSubmissionsDone += j.completedRooms;
    });
  });

  const overallProgress =
    totalSubmissionsNeeded > 0
      ? Math.round((totalSubmissionsDone / totalSubmissionsNeeded) * 100)
      : 0;

  // Filter grade levels
  const filteredGrades = gradeLevels.filter((g) => {
    if (selectedGradeId !== 'all' && g.id !== selectedGradeId) return false;
    return true;
  });

  return (
    <div className="min-h-screen bg-slate-50/80 flex flex-col font-sans">
      <Navbar competitionTitle={config?.competitionName || 'เท่อย่างเซียน'} />

      {/* Hero Banner - Clean & Premium Slate Design */}
      <section className="bg-slate-900 text-white py-10 sm:py-14 px-4 sm:px-6 lg:px-8 border-b border-slate-800">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-amber-300 border border-white/10 text-xs font-semibold mb-3">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>ระบบบันทึกคะแนนการตัดสินอย่างเป็นทางการ</span>
              </div>
              <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-white mb-2">
                {config?.competitionName || 'การประกวดคลิปสร้างสรรค์ "เท่อย่างเซียน"'}
              </h1>
              <p className="text-slate-400 text-xs sm:text-sm max-w-2xl leading-relaxed">
                กรรมการทุกท่านสามารถคลิกที่ <strong>การ์ดชื่อของตนเอง</strong> ด้านล่างเพื่อเข้าสู่หน้าลงคะแนนได้ทันทีในคลิกเดียว (ไม่ต้องกรอกรหัสผ่าน)
              </p>
            </div>

            {/* Overall stats widget */}
            <div className="w-full md:w-auto flex-shrink-0 bg-white/5 rounded-2xl p-4 sm:p-5 border border-white/10 flex items-center gap-6">
              <div className="text-center">
                <span className="block text-2xl sm:text-3xl font-black text-amber-400">
                  {totalClassrooms}
                </span>
                <span className="text-[11px] text-slate-400 font-medium">ห้องเรียนทั้งหมด</span>
              </div>
              <div className="h-9 w-px bg-white/10" />
              <div className="text-center">
                <span className="block text-2xl sm:text-3xl font-black text-white">
                  {totalJudges}
                </span>
                <span className="text-[11px] text-slate-400 font-medium">คณะกรรมการ</span>
              </div>
              <div className="h-9 w-px bg-white/10" />
              <div className="text-center">
                <span className="block text-2xl sm:text-3xl font-black text-emerald-400">
                  {overallProgress}%
                </span>
                <span className="text-[11px] text-slate-400 font-medium">ตรวจแล้วเสร็จ</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full">
        {/* Quick action bar & Grade Filter Tabs */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 mb-8">
          {/* Grade level filter tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-2 sm:pb-0 scrollbar-none">
            <button
              onClick={() => setSelectedGradeId('all')}
              className={`px-4 py-2 rounded-xl font-bold text-xs sm:text-sm whitespace-nowrap transition-all ${
                selectedGradeId === 'all'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/80'
              }`}
            >
              ทั้งหมด (ม.1 - ม.6)
            </button>
            {gradeLevels.map((g) => (
              <button
                key={g.id}
                onClick={() => setSelectedGradeId(g.id)}
                className={`px-4 py-2 rounded-xl font-bold text-xs sm:text-sm whitespace-nowrap transition-all ${
                  selectedGradeId === g.id
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/80'
                }`}
              >
                {g.shortName}
              </button>
            ))}
          </div>

          {/* Quick link to leaderboard */}
          <Link
            href="/leaderboard"
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs sm:text-sm shadow-xs transition-all active:scale-95"
          >
            <Trophy className="w-4 h-4 text-slate-950" />
            <span>ดูตารางผลคะแนนและอันดับรางวัล</span>
          </Link>
        </div>

        {/* Loading state */}
        {loading && (
          <div className="py-20 text-center">
            <div className="inline-block animate-spin rounded-full h-10 w-10 border-3 border-slate-900 border-t-transparent"></div>
            <p className="mt-4 text-slate-500 font-medium text-sm">กำลังโหลดข้อมูลกรรมการและห้องเรียน...</p>
          </div>
        )}

        {/* Judges Section by Grade Level */}
        {!loading && (
          <div className="space-y-8">
            {filteredGrades.map((grade) => (
              <div
                key={grade.id}
                className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden"
              >
                {/* Grade Header */}
                <div className="bg-slate-50/70 border-b border-slate-200/80 px-6 py-4 flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-slate-900 text-amber-400 font-bold flex items-center justify-center text-sm shadow-xs">
                      {grade.shortName}
                    </div>
                    <div>
                      <h2 className="text-base sm:text-lg font-bold text-slate-900">
                        ระดับชั้น{grade.name} ({grade.shortName})
                      </h2>
                      <p className="text-xs text-slate-400">
                        จำนวนห้องเรียน {grade.classrooms.length} ห้อง ({grade.shortName}/1 - {grade.shortName}/{grade.classrooms.length})
                      </p>
                    </div>
                  </div>

                  <div className="text-xs font-semibold text-slate-600 bg-white px-3 py-1.5 rounded-xl border border-slate-200">
                    กรรมการ {grade.judges.length} ท่าน (คะแนนเฉลี่ย ÷ {grade.judges.length || 3})
                  </div>
                </div>

                {/* Judge Cards Grid */}
                <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-5">
                  {grade.judges.map((judge) => {
                    const isFinished =
                      judge.totalRooms > 0 && judge.completedRooms >= judge.totalRooms;
                    const isStarted = judge.completedRooms > 0;

                    return (
                      <div
                        key={judge.id}
                        className={`rounded-2xl border p-5 transition-all flex flex-col justify-between ${
                          isFinished
                            ? 'border-emerald-200 bg-emerald-50/20'
                            : isStarted
                            ? 'border-amber-200 bg-amber-50/15'
                            : 'border-slate-200/90 bg-white hover:border-slate-300'
                        }`}
                      >
                        <div>
                          {/* Top row: Avatar & Status Badge */}
                          <div className="flex items-start justify-between gap-3 mb-4">
                            <div className="flex items-center gap-3">
                              <div className="w-11 h-11 rounded-2xl bg-slate-900 text-white font-bold text-base flex items-center justify-center flex-shrink-0">
                                {judge.judgeOrder}
                              </div>
                              <div>
                                <span className="text-[11px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                                  กรรมการท่านที่ {judge.judgeOrder}
                                </span>
                                <h3 className="text-sm font-bold text-slate-900 mt-1 line-clamp-1">
                                  {judge.name}
                                </h3>
                              </div>
                            </div>

                            {/* Status Badge */}
                            <div>
                              {isFinished ? (
                                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-800 bg-emerald-100/80 px-2.5 py-0.5 rounded-full border border-emerald-200">
                                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                  ตรวจครบแล้ว
                                </span>
                              ) : isStarted ? (
                                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-800 bg-amber-100/80 px-2.5 py-0.5 rounded-full border border-amber-200">
                                  <Clock className="w-3 h-3 text-amber-600" />
                                  กำลังตรวจ
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                                  ยังไม่เริ่ม
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Progress bar */}
                          <div className="my-3">
                            <div className="flex justify-between text-xs font-medium text-slate-500 mb-1">
                              <span>ความคืบหน้า</span>
                              <span className="font-bold text-slate-800">
                                {judge.completedRooms} / {judge.totalRooms} ห้อง ({judge.progressPercent}%)
                              </span>
                            </div>
                            <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                              <div
                                className={`h-full transition-all duration-500 rounded-full ${
                                  isFinished
                                    ? 'bg-emerald-500'
                                    : isStarted
                                    ? 'bg-amber-500'
                                    : 'bg-slate-300'
                                }`}
                                style={{ width: `${judge.progressPercent}%` }}
                              />
                            </div>
                          </div>
                        </div>

                        {/* 1-Click Action Button for Senior Judges */}
                        <Link
                          href={`/judge/${judge.id}`}
                          className={`mt-4 w-full py-3 px-4 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-xs ${
                            isFinished
                              ? 'bg-slate-100 hover:bg-slate-200 text-slate-800'
                              : 'bg-slate-900 hover:bg-slate-800 text-white'
                          }`}
                        >
                          <span>{isFinished ? 'ดูและแก้ไขคะแนน' : 'เข้าสู่หน้าลงคะแนน'}</span>
                          <ArrowRight className="w-4 h-4" />
                        </Link>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200/80 py-6 text-center text-xs text-slate-400 mt-12">
        <div className="max-w-7xl mx-auto px-4">
          <p>
            {config?.competitionName || 'ระบบบันทึกคะแนนการประกวด "เท่อย่างเซียน"'} • ปีการศึกษา {config?.academicYear || '2569'}
          </p>
        </div>
      </footer>
    </div>
  );
}
