'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import { formatScore } from '@/lib/utils';
import {
  Trophy,
  Medal,
  Award,
  Crown,
  Search,
  Printer,
  RefreshCw,
  Sparkles,
  Users,
  ChevronRight,
  TrendingUp,
} from 'lucide-react';

export default function LeaderboardPage() {
  const [overviewData, setOverviewData] = useState<any>(null);
  const [selectedGradeId, setSelectedGradeId] = useState<number | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchOverview();
    const interval = setInterval(fetchOverview, 8000);
    return () => clearInterval(interval);
  }, []);

  const fetchOverview = async () => {
    try {
      const res = await fetch('/api/admin/overview');
      const data = await res.json();
      if (data.success) {
        setOverviewData(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleManualRefresh = () => {
    setRefreshing(true);
    fetchOverview();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
        <Navbar />
        <div className="flex-1 flex items-center justify-center py-20">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-10 w-10 border-3 border-slate-900 border-t-transparent"></div>
            <p className="mt-4 text-slate-500 font-medium text-sm">กำลังคำนวณผลคะแนนและจัดอันดับแบบเรียลไทม์...</p>
          </div>
        </div>
      </div>
    );
  }

  const grades = overviewData?.grades || [];
  const config = overviewData?.config;
  const filteredGrades = grades.filter((g: any) => {
    if (selectedGradeId !== 'all' && g.gradeId !== selectedGradeId) return false;
    return true;
  });

  return (
    <div className="min-h-screen bg-slate-50/80 flex flex-col pb-24 font-sans">
      <Navbar competitionTitle={config?.competitionName || 'เท่อย่างเซียน'} />

      {/* Header Banner - Clean & Premium */}
      <section className="bg-slate-900 text-white py-10 px-4 sm:px-6 lg:px-8 border-b border-slate-800">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-amber-300 border border-white/10 text-xs font-semibold mb-2">
              <Trophy className="w-3.5 h-3.5 text-amber-400" />
              <span>สรุปผลคะแนนและอันดับรางวัลอย่างเป็นทางการ</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              ตารางสรุปผลการตัดสิน (Live Leaderboard)
            </h1>
            <p className="text-slate-400 text-xs sm:text-sm mt-1">
              คำนวณคะแนนเฉลี่ย (Mean) และส่วนเบี่ยงเบนมาตรฐาน (S.D.) จากคณะกรรมการ 3 ท่าน
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleManualRefresh}
              className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-bold flex items-center gap-2 border border-white/15 transition-all"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
              <span>รีเฟรชข้อมูล</span>
            </button>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full space-y-8">
        {/* Filter Tabs & Search */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-2 sm:pb-0 scrollbar-none">
            <button
              onClick={() => setSelectedGradeId('all')}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all ${
                selectedGradeId === 'all'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/80'
              }`}
            >
              รวมทุกระดับชั้น
            </button>
            {grades.map((g: any) => (
              <button
                key={g.gradeId}
                onClick={() => setSelectedGradeId(g.gradeId)}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all ${
                  selectedGradeId === g.gradeId
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/80'
                }`}
              >
                {g.gradeShortName}
              </button>
            ))}
          </div>

          {/* Search bar */}
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="ค้นหาห้องเรียน..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm bg-white focus:outline-none focus:border-slate-900"
            />
          </div>
        </div>

        {/* Grade Results */}
        {filteredGrades.map((grade: any) => {
          const leaderboard = grade.leaderboard.filter((room: any) => {
            if (searchQuery && !room.classroomName.toLowerCase().includes(searchQuery.toLowerCase())) {
              return false;
            }
            return true;
          });

          // Top 3 Podium
          const top1 = leaderboard[0];
          const top2 = leaderboard[1];
          const top3 = leaderboard[2];

          return (
            <div
              key={grade.gradeId}
              className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden"
            >
              {/* Grade Header */}
              <div className="bg-slate-50/80 border-b border-slate-200/80 px-6 py-4 flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-slate-900 text-amber-400 font-bold text-base flex items-center justify-center shadow-xs">
                    {grade.gradeShortName}
                  </div>
                  <div>
                    <h2 className="text-base sm:text-lg font-bold text-slate-900">
                      ผลการตัดสินระดับชั้น{grade.gradeName} ({grade.gradeShortName})
                    </h2>
                    <p className="text-xs text-slate-400">
                      กรรมการ: {grade.judges.map((j: any) => j.name).join(' • ')}
                    </p>
                  </div>
                </div>

                <Link
                  href={`/print/${grade.gradeId}`}
                  target="_blank"
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-xs transition-all"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>พิมพ์รายงานทางการ (A4 / PDF)</span>
                </Link>
              </div>

              {/* Top 3 Podium Cards */}
              {top1 && top1.averageScore > 0 && (
                <div className="p-6 bg-slate-50/40 border-b border-slate-100">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-4 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    <span>ห้องที่ได้คะแนนสูงสุด 3 อันดับแรก ({grade.gradeShortName})</span>
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Rank 1 - Gold */}
                    {top1 && (
                      <div className="rounded-2xl border border-amber-200 bg-amber-50/30 p-5 shadow-xs flex flex-col justify-between">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-black text-base shadow-xs">
                              🥇
                            </div>
                            <div>
                              <span className="text-[11px] font-bold text-amber-900 bg-amber-100/80 px-2 py-0.5 rounded-md">
                                ชนะเลิศอันดับ 1
                              </span>
                              <h4 className="text-lg font-black text-slate-900 mt-0.5">
                                ห้อง {top1.classroomName}
                              </h4>
                            </div>
                          </div>
                          <div className="text-right">
                            <span className="text-xl font-black text-slate-900">
                              {formatScore(top1.averageScore)}
                            </span>
                            <span className="block text-[10px] text-slate-400">S.D. {formatScore(top1.sd || 0)}</span>
                          </div>
                        </div>
                        <div className="mt-4 pt-3 border-t border-amber-200/60 flex items-center justify-between text-xs">
                          <span className="text-slate-500 font-medium">คะแนนเฉลี่ย (÷3)</span>
                          <span className={`font-bold px-2 py-0.5 rounded-md ${top1.medalColor}`}>
                            {top1.medalLabel}
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Rank 2 - Silver */}
                    {top2 && (
                      <div className="rounded-2xl border border-slate-200 bg-slate-50/50 p-5 shadow-xs flex flex-col justify-between">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-slate-200 text-slate-800 flex items-center justify-center font-black text-base shadow-xs">
                              🥈
                            </div>
                            <div>
                              <span className="text-[11px] font-bold text-slate-700 bg-slate-200/70 px-2 py-0.5 rounded-md">
                                รองชนะเลิศอันดับ 1
                              </span>
                              <h4 className="text-lg font-black text-slate-900 mt-0.5">
                                ห้อง {top2.classroomName}
                              </h4>
                            </div>
                          </div>
                          <div className="text-right">
                            <span className="text-xl font-black text-slate-900">
                              {formatScore(top2.averageScore)}
                            </span>
                            <span className="block text-[10px] text-slate-400">S.D. {formatScore(top2.sd || 0)}</span>
                          </div>
                        </div>
                        <div className="mt-4 pt-3 border-t border-slate-200 flex items-center justify-between text-xs">
                          <span className="text-slate-500 font-medium">คะแนนเฉลี่ย (÷3)</span>
                          <span className={`font-bold px-2 py-0.5 rounded-md ${top2.medalColor}`}>
                            {top2.medalLabel}
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Rank 3 - Bronze */}
                    {top3 && (
                      <div className="rounded-2xl border border-orange-200 bg-orange-50/30 p-5 shadow-xs flex flex-col justify-between">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-orange-100 text-orange-900 flex items-center justify-center font-black text-base shadow-xs">
                              🥉
                            </div>
                            <div>
                              <span className="text-[11px] font-bold text-orange-900 bg-orange-200/60 px-2 py-0.5 rounded-md">
                                รองชนะเลิศอันดับ 2
                              </span>
                              <h4 className="text-lg font-black text-slate-900 mt-0.5">
                                ห้อง {top3.classroomName}
                              </h4>
                            </div>
                          </div>
                          <div className="text-right">
                            <span className="text-xl font-black text-slate-900">
                              {formatScore(top3.averageScore)}
                            </span>
                            <span className="block text-[10px] text-slate-400">S.D. {formatScore(top3.sd || 0)}</span>
                          </div>
                        </div>
                        <div className="mt-4 pt-3 border-t border-orange-200/60 flex items-center justify-between text-xs">
                          <span className="text-slate-500 font-medium">คะแนนเฉลี่ย (÷3)</span>
                          <span className={`font-bold px-2 py-0.5 rounded-md ${top3.medalColor}`}>
                            {top3.medalLabel}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Detailed Score Table with Mean & S.D. */}
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50/70 border-b border-slate-200 text-xs font-bold text-slate-700">
                      <th className="py-3 px-4 text-center w-14">อันดับ</th>
                      <th className="py-3 px-4">ห้องเรียน</th>
                      {grade.judges.map((j: any) => (
                        <th key={j.id} className="py-3 px-4 text-center font-semibold text-slate-600">
                          {j.name} (100)
                        </th>
                      ))}
                      <th className="py-3 px-4 text-center bg-slate-100/80 text-slate-900 font-bold">
                        คะแนนเฉลี่ย (Mean)
                      </th>
                      <th className="py-3 px-4 text-center text-slate-700 font-bold">
                        ส่วนเบี่ยงเบน (S.D.)
                      </th>
                      <th className="py-3 px-4 text-center">ระดับเหรียญรางวัล</th>
                      <th className="py-3 px-4 text-center">สถานะ</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs sm:text-sm">
                    {leaderboard.map((room: any) => {
                      const isTop1 = room.rank === 1 && room.averageScore > 0;
                      const isTop2 = room.rank === 2 && room.averageScore > 0;
                      const isTop3 = room.rank === 3 && room.averageScore > 0;

                      return (
                        <tr
                          key={room.classroomId}
                          className={`hover:bg-slate-50/80 transition-colors ${
                            isTop1 ? 'bg-amber-50/20 font-semibold' : ''
                          }`}
                        >
                          {/* Rank Badge */}
                          <td className="py-3.5 px-4 text-center">
                            {isTop1 ? (
                              <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-amber-400 text-slate-950 font-black text-xs shadow-xs">
                                1
                              </span>
                            ) : isTop2 ? (
                              <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-slate-200 text-slate-800 font-black text-xs shadow-xs">
                                2
                              </span>
                            ) : isTop3 ? (
                              <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-orange-200 text-orange-900 font-black text-xs shadow-xs">
                                3
                              </span>
                            ) : (
                              <span className="text-slate-400 font-bold">{room.rank}</span>
                            )}
                          </td>

                          {/* Classroom Name */}
                          <td className="py-3.5 px-4 font-bold text-slate-900">
                            ห้อง {room.classroomName}
                          </td>

                          {/* Judge 1, 2, 3 Scores */}
                          {room.judgeScores.map((js: any) => (
                            <td key={js.judgeId} className="py-3.5 px-4 text-center">
                              {js.isCompleted ? (
                                <span className="font-bold text-slate-800">{js.totalScore}</span>
                              ) : js.totalScore > 0 ? (
                                <span className="text-amber-600 font-medium">{js.totalScore}</span>
                              ) : (
                                <span className="text-slate-300">-</span>
                              )}
                            </td>
                          ))}

                          {/* Average Score (Mean) */}
                          <td className="py-3.5 px-4 text-center bg-slate-100/60 font-black text-sm sm:text-base text-slate-900">
                            {room.averageScore > 0 ? formatScore(room.averageScore) : '-'}
                          </td>

                          {/* Standard Deviation (S.D.) */}
                          <td className="py-3.5 px-4 text-center font-bold text-slate-600">
                            {room.averageScore > 0 ? formatScore(room.sd || 0) : '-'}
                          </td>

                          {/* Medal Tier */}
                          <td className="py-3.5 px-4 text-center">
                            {room.averageScore > 0 ? (
                              <span
                                className={`inline-block text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${room.medalColor}`}
                              >
                                {room.medalLabel}
                              </span>
                            ) : (
                              <span className="text-xs text-slate-300">รอผลคะแนน</span>
                            )}
                          </td>

                          {/* Status */}
                          <td className="py-3.5 px-4 text-center">
                            {room.isAllCompleted ? (
                              <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                                ครบ 3 ท่าน
                              </span>
                            ) : (
                              <span className="text-[11px] font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                                {room.completedJudgesCount} / {room.totalJudgesCount}
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          );
        })}
      </main>
    </div>
  );
}
