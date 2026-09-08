'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import * as XLSX from 'xlsx';
import { formatScore } from '@/lib/utils';
import {
  Shield,
  Trophy,
  Edit3,
  Trash2,
  Plus,
  Save,
  Download,
  Printer,
  Settings,
  Users,
  BookOpen,
  CheckCircle2,
  AlertCircle,
  LogOut,
  RefreshCw,
  Search,
  Check,
  X,
  Sparkles,
} from 'lucide-react';

export default function AdminPage() {
  const router = useRouter();

  // Authentication state
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authChecking, setAuthChecking] = useState(true);

  // Active Tab: 'scores' | 'classes' | 'judges' | 'criteria' | 'export' | 'settings'
  const [activeTab, setActiveTab] = useState<'scores' | 'classes' | 'judges' | 'criteria' | 'export' | 'settings'>('scores');

  // Overview data
  const [overviewData, setOverviewData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedGradeId, setSelectedGradeId] = useState<number | 'all'>('all');

  // Notification Toast
  const [toastMsg, setToastMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Modals state
  const [scoreModal, setScoreModal] = useState<{
    isOpen: boolean;
    classroomId: number;
    classroomName: string;
    judgeId: number;
    judgeName: string;
    scores: Record<number, number>;
    comment: string;
    isCompleted: boolean;
  } | null>(null);

  const [classModal, setClassModal] = useState<{
    isOpen: boolean;
    mode: 'add' | 'edit';
    id?: number;
    gradeLevelId: number;
    name: string;
    roomNumber: number;
  } | null>(null);

  const [judgeModal, setJudgeModal] = useState<{
    isOpen: boolean;
    mode: 'add' | 'edit';
    id?: number;
    name: string;
    gradeLevelId: number;
    judgeOrder: number;
    pinCode: string;
  } | null>(null);

  const [criterionModal, setCriterionModal] = useState<{
    isOpen: boolean;
    mode: 'add' | 'edit';
    id?: number;
    title: string;
    description: string;
    maxScore: number;
    criterionOrder: number;
  } | null>(null);

  // Settings form state
  const [settingsForm, setSettingsForm] = useState({
    competitionName: '',
    schoolName: '',
    academicYear: '',
    passwordHash: '',
    goldMinScore: 80,
    silverMinScore: 70,
    bronzeMinScore: 60,
  });

  useEffect(() => {
    // Check authentication
    const auth = sessionStorage.getItem('admin_auth');
    if (!auth) {
      router.push('/admin/login');
    } else {
      setIsAuthenticated(true);
      setAuthChecking(false);
      fetchData();
    }
  }, [router]);

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToastMsg({ text, type });
    setTimeout(() => setToastMsg(null), 3000);
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/overview');
      const data = await res.json();
      if (data.success) {
        setOverviewData(data);
        if (data.config) {
          setSettingsForm({
            competitionName: data.config.competitionName || '',
            schoolName: data.config.schoolName || '',
            academicYear: data.config.academicYear || '',
            passwordHash: data.config.passwordHash || '',
            goldMinScore: data.config.goldMinScore || 80,
            silverMinScore: data.config.silverMinScore || 70,
            bronzeMinScore: data.config.bronzeMinScore || 60,
          });
        }
      }
    } catch (err) {
      console.error(err);
      showToast('เกิดข้อผิดพลาดในการโหลดข้อมูล', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem('admin_auth');
    router.push('/admin/login');
  };

  // --- Score Override Actions ---
  const handleOpenScoreModal = (room: any, judge: any) => {
    const judgeScoreObj = room.judgeScores.find((js: any) => js.judgeId === judge.id);
    setScoreModal({
      isOpen: true,
      classroomId: room.classroomId,
      classroomName: room.classroomName,
      judgeId: judge.id,
      judgeName: judge.name,
      scores: judgeScoreObj ? { ...judgeScoreObj.criteriaScores } : {},
      comment: judgeScoreObj?.comment || '',
      isCompleted: judgeScoreObj?.isCompleted ?? true,
    });
  };

  const handleSaveScoreOverride = async () => {
    if (!scoreModal) return;
    try {
      const res = await fetch('/api/admin/score-override', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          classroomId: scoreModal.classroomId,
          judgeId: scoreModal.judgeId,
          criteriaScores: scoreModal.scores,
          comment: scoreModal.comment,
          isCompleted: scoreModal.isCompleted,
        }),
      });
      const data = await res.json();
      if (data.success) {
        showToast('บันทึกการแก้ไขคะแนนเรียบร้อย');
        setScoreModal(null);
        fetchData();
      } else {
        showToast(data.error || 'เกิดข้อผิดพลาด', 'error');
      }
    } catch (err) {
      showToast('เกิดข้อผิดพลาดในการบันทึกคะแนน', 'error');
    }
  };

  // --- Classroom Management ---
  const handleSaveClassroom = async () => {
    if (!classModal || !classModal.name.trim()) {
      showToast('กรุณากรอกชื่อห้องเรียน', 'error');
      return;
    }

    try {
      const isEdit = classModal.mode === 'edit';
      const method = isEdit ? 'PUT' : 'POST';
      const res = await fetch('/api/admin/classrooms', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...(isEdit && { id: classModal.id }),
          gradeLevelId: classModal.gradeLevelId,
          name: classModal.name,
          roomNumber: classModal.roomNumber,
        }),
      });
      const data = await res.json();
      if (data.success) {
        showToast(isEdit ? 'แก้ไขห้องเรียนเรียบร้อย' : 'เพิ่มห้องเรียนเรียบร้อย');
        setClassModal(null);
        fetchData();
      } else {
        showToast(data.error || 'เกิดข้อผิดพลาด', 'error');
      }
    } catch (err) {
      showToast('เกิดข้อผิดพลาด', 'error');
    }
  };

  const handleDeleteClassroom = async (id: number, name: string) => {
    if (!confirm(`คุณต้องการลบห้อง ${name} ใช่หรือไม่? ข้อมูลคะแนนทั้งหมดของห้องนี้จะถูกลบไปด้วย`)) return;
    try {
      const res = await fetch(`/api/admin/classrooms?id=${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        showToast('ลบห้องเรียนเรียบร้อย');
        fetchData();
      } else {
        showToast(data.error || 'เกิดข้อผิดพลาด', 'error');
      }
    } catch (err) {
      showToast('เกิดข้อผิดพลาดในการลบห้องเรียน', 'error');
    }
  };

  // --- Judge Management ---
  const handleSaveJudge = async () => {
    if (!judgeModal || !judgeModal.name.trim()) {
      showToast('กรุณากรอกชื่อกรรมการ', 'error');
      return;
    }

    try {
      const isEdit = judgeModal.mode === 'edit';
      const method = isEdit ? 'PUT' : 'POST';
      const res = await fetch('/api/admin/judges', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...(isEdit && { id: judgeModal.id }),
          name: judgeModal.name,
          gradeLevelId: judgeModal.gradeLevelId,
          judgeOrder: judgeModal.judgeOrder,
          pinCode: judgeModal.pinCode,
        }),
      });
      const data = await res.json();
      if (data.success) {
        showToast(isEdit ? 'แก้ไขข้อมูลกรรมการเรียบร้อย' : 'เพิ่มกรรมการเรียบร้อย');
        setJudgeModal(null);
        fetchData();
      } else {
        showToast(data.error || 'เกิดข้อผิดพลาด', 'error');
      }
    } catch (err) {
      showToast('เกิดข้อผิดพลาด', 'error');
    }
  };

  const handleDeleteJudge = async (id: number, name: string) => {
    if (!confirm(`คุณต้องการลบ ${name} ใช่หรือไม่?`)) return;
    try {
      const res = await fetch(`/api/admin/judges?id=${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        showToast('ลบกรรมการเรียบร้อย');
        fetchData();
      } else {
        showToast(data.error || 'เกิดข้อผิดพลาด', 'error');
      }
    } catch (err) {
      showToast('เกิดข้อผิดพลาด', 'error');
    }
  };

  // --- Criteria Management ---
  const handleSaveCriterion = async () => {
    if (!criterionModal || !criterionModal.title.trim()) {
      showToast('กรุณากรอกชื่อเกณฑ์การตัดสิน', 'error');
      return;
    }

    try {
      const isEdit = criterionModal.mode === 'edit';
      const method = isEdit ? 'PUT' : 'POST';
      const res = await fetch('/api/admin/criteria', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...(isEdit && { id: criterionModal.id }),
          title: criterionModal.title,
          description: criterionModal.description,
          maxScore: criterionModal.maxScore,
          criterionOrder: criterionModal.criterionOrder,
        }),
      });
      const data = await res.json();
      if (data.success) {
        showToast(isEdit ? 'แก้ไขเกณฑ์เรียบร้อย' : 'เพิ่มเกณฑ์เรียบร้อย');
        setCriterionModal(null);
        fetchData();
      } else {
        showToast(data.error || 'เกิดข้อผิดพลาด', 'error');
      }
    } catch (err) {
      showToast('เกิดข้อผิดพลาด', 'error');
    }
  };

  // --- Settings Save ---
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settingsForm),
      });
      const data = await res.json();
      if (data.success) {
        showToast('บันทึกการตั้งค่าระบบเรียบร้อย');
        fetchData();
      } else {
        showToast(data.error || 'เกิดข้อผิดพลาด', 'error');
      }
    } catch (err) {
      showToast('เกิดข้อผิดพลาดในการบันทึกการตั้งค่า', 'error');
    }
  };

  // --- Export to Excel (XLSX) ---
  const handleExportExcel = () => {
    if (!overviewData || !overviewData.grades) return;

    const wb = XLSX.utils.book_new();

    overviewData.grades.forEach((grade: any) => {
      const rows: any[] = [];

      grade.leaderboard.forEach((room: any) => {
        const rowData: any = {
          'อันดับ': room.rank,
          'ระดับชั้น': grade.gradeShortName,
          'ห้องเรียน': `ห้อง ${room.classroomName}`,
        };

        // Add scores from each judge
        grade.judges.forEach((j: any) => {
          const js = room.judgeScores.find((s: any) => s.judgeId === j.id);
          rowData[`${j.name} (เต็ม 100)`] = js?.isCompleted ? js.totalScore : (js?.totalScore || '-');
        });

        rowData['คะแนนเฉลี่ย (Mean)'] = room.averageScore;
        rowData['ส่วนเบี่ยงเบน (S.D.)'] = room.sd || 0;
        rowData['ระดับเหรียญรางวัล'] = room.medalLabel;
        rowData['สถานะการตรวจ'] = room.isAllCompleted ? 'ครบ 3 กรรมการ' : `ตรวจแล้ว ${room.completedJudgesCount}/${room.totalJudgesCount}`;

        // Add comments if any
        const allComments = room.judgeScores
          .filter((js: any) => js.comment)
          .map((js: any) => `${js.judgeName}: ${js.comment}`)
          .join(' | ');
        rowData['ข้อเสนอแนะ'] = allComments;

        rows.push(rowData);
      });

      const ws = XLSX.utils.json_to_sheet(rows);
      XLSX.utils.book_append_sheet(wb, ws, `ระดับชั้น ${grade.gradeShortName}`);
    });

    // Write file
    XLSX.writeFile(wb, `สรุปผลคะแนน_การประกวดเท่อย่างเซียน_${Date.now()}.xlsx`);
    showToast('ดาวน์โหลดไฟล์ Excel เรียบร้อย');
  };

  if (authChecking || !isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white font-medium">
        กำลังตรวจสอบสิทธิ์ผู้ดูแลระบบ...
      </div>
    );
  }

  const grades = overviewData?.grades || [];
  const criteria = overviewData?.criteria || [];
  const config = overviewData?.config;

  const filteredGrades = grades.filter((g: any) => {
    if (selectedGradeId !== 'all' && g.gradeId !== selectedGradeId) return false;
    return true;
  });

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col pb-24">
      <Navbar competitionTitle={config?.competitionName || 'เท่อย่างเซียน'} />

      {/* Notification Toast */}
      {toastMsg && (
        <div
          className={`fixed bottom-6 right-6 z-50 text-white px-6 py-3.5 rounded-2xl shadow-2xl flex items-center gap-3 transition-all ${
            toastMsg.type === 'success' ? 'bg-emerald-600' : 'bg-rose-600'
          }`}
        >
          {toastMsg.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-white flex-shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 text-white flex-shrink-0" />
          )}
          <span className="text-sm font-bold">{toastMsg.text}</span>
        </div>
      )}

      {/* Admin Top Header */}
      <div className="bg-slate-900 text-white border-b border-slate-800 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-500 text-slate-950 flex items-center justify-center font-bold shadow-lg">
                <Shield className="w-7 h-7" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                    ระบบผู้ดูแลระบบ (Admin Panel)
                  </h1>
                  <span className="bg-amber-500/20 text-amber-300 text-xs font-bold px-2.5 py-0.5 rounded-full border border-amber-500/30">
                    ผู้ดูแลระบบสูงสุด
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-slate-400">
                  จัดการห้องเรียน, กรรมการ, เกณฑ์คะแนน, ปรับแก้ผลคะแนน และส่งออกรายงาน
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={fetchData}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center gap-1.5 border border-slate-700 transition-colors"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                <span>รีเฟรชข้อมูล</span>
              </button>
              <button
                onClick={handleLogout}
                className="px-4 py-2 rounded-xl bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 hover:text-rose-200 text-xs font-bold flex items-center gap-1.5 border border-rose-500/30 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span>ออกจากระบบ</span>
              </button>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto mt-6 pt-2 border-t border-slate-800 scrollbar-none">
            <button
              onClick={() => setActiveTab('scores')}
              className={`px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm flex items-center gap-2 transition-all whitespace-nowrap ${
                activeTab === 'scores'
                  ? 'bg-amber-500 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Trophy className="w-4 h-4" />
              <span>ภาพรวม & แก้ไขคะแนน</span>
            </button>

            <button
              onClick={() => setActiveTab('classes')}
              className={`px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm flex items-center gap-2 transition-all whitespace-nowrap ${
                activeTab === 'classes'
                  ? 'bg-amber-500 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span>จัดการห้องเรียน & ระดับชั้น</span>
            </button>

            <button
              onClick={() => setActiveTab('judges')}
              className={`px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm flex items-center gap-2 transition-all whitespace-nowrap ${
                activeTab === 'judges'
                  ? 'bg-amber-500 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>จัดการกรรมการตัดสิน</span>
            </button>

            <button
              onClick={() => setActiveTab('criteria')}
              className={`px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm flex items-center gap-2 transition-all whitespace-nowrap ${
                activeTab === 'criteria'
                  ? 'bg-amber-500 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>จัดการเกณฑ์คะแนน</span>
            </button>

            <button
              onClick={() => setActiveTab('export')}
              className={`px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm flex items-center gap-2 transition-all whitespace-nowrap ${
                activeTab === 'export'
                  ? 'bg-amber-500 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Download className="w-4 h-4" />
              <span>ส่งออก Excel & พิมพ์รายงาน</span>
            </button>

            <button
              onClick={() => setActiveTab('settings')}
              className={`px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm flex items-center gap-2 transition-all whitespace-nowrap ${
                activeTab === 'settings'
                  ? 'bg-amber-500 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Settings className="w-4 h-4" />
              <span>ตั้งค่าระบบ & รหัสผ่าน</span>
            </button>
          </div>
        </div>
      </div>

      {/* Content Body */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full">
        {/* TAB 1: OVERVIEW & SCORE OVERRIDE */}
        {activeTab === 'scores' && (
          <div className="space-y-6">
            {/* Grade Level Selector */}
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0 scrollbar-none">
                <button
                  onClick={() => setSelectedGradeId('all')}
                  className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all ${
                    selectedGradeId === 'all'
                      ? 'bg-slate-900 text-white shadow-md'
                      : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-200'
                  }`}
                >
                  ทั้งหมด (ม.1 - ม.6)
                </button>
                {grades.map((g: any) => (
                  <button
                    key={g.gradeId}
                    onClick={() => setSelectedGradeId(g.gradeId)}
                    className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all ${
                      selectedGradeId === g.gradeId
                        ? 'bg-slate-900 text-white shadow-md'
                        : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-200'
                    }`}
                  >
                    {g.gradeShortName}
                  </button>
                ))}
              </div>

              <div className="text-xs text-slate-500 font-medium bg-amber-50 border border-amber-200 text-amber-900 px-3 py-1.5 rounded-xl">
                💡 คลิกที่ปุ่ม <strong>"แก้ไขคะแนน"</strong> ท้ายแถว เพื่อปรับแก้หรือเติมคะแนนของกรรมการท่านใดก็ได้
              </div>
            </div>

            {/* Score Tables */}
            {filteredGrades.map((grade: any) => (
              <div
                key={grade.gradeId}
                className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden"
              >
                <div className="bg-slate-50 border-b border-slate-200 px-6 py-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="w-8 h-8 rounded-lg bg-amber-500 text-slate-950 font-black flex items-center justify-center text-sm">
                      {grade.gradeShortName}
                    </span>
                    <h3 className="font-extrabold text-slate-800 text-base sm:text-lg">
                      ผลคะแนนระดับชั้น{grade.gradeName}
                    </h3>
                  </div>

                  <Link
                    href={`/print/${grade.gradeId}`}
                    target="_blank"
                    className="text-xs font-bold text-amber-800 bg-amber-100 hover:bg-amber-200 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>พิมพ์รายงานใบคะแนน</span>
                  </Link>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-100/70 border-b border-slate-200 text-xs font-black text-slate-700">
                        <th className="py-3 px-4 text-center w-12">อันดับ</th>
                        <th className="py-3 px-4">ห้องเรียน</th>
                        {grade.judges.map((j: any) => (
                          <th key={j.id} className="py-3 px-4 text-center">
                            {j.name}
                          </th>
                        ))}
                        <th className="py-3 px-4 text-center bg-slate-100 text-slate-900 font-bold">
                          คะแนนเฉลี่ย (Mean)
                        </th>
                        <th className="py-3 px-4 text-center text-slate-700 font-bold">
                          ส่วนเบี่ยงเบน (S.D.)
                        </th>
                        <th className="py-3 px-4 text-center">ระดับเหรียญ</th>
                        <th className="py-3 px-4 text-center">จัดการคะแนน</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-sm">
                      {grade.classrooms.map((room: any) => (
                        <tr key={room.classroomId} className="hover:bg-slate-50/80 transition-colors">
                          <td className="py-3 px-4 text-center font-bold text-slate-500">
                            {room.rank}
                          </td>
                          <td className="py-3 px-4 font-extrabold text-slate-900">
                            ห้อง {room.classroomName}
                          </td>

                          {/* Each Judge Score Button */}
                          {grade.judges.map((j: any) => {
                            const js = room.judgeScores.find((s: any) => s.judgeId === j.id);
                            return (
                              <td key={j.id} className="py-3 px-4 text-center">
                                <button
                                  type="button"
                                  onClick={() => handleOpenScoreModal(room, j)}
                                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                                    js?.isCompleted
                                      ? 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200'
                                      : js && js.totalScore > 0
                                      ? 'bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200'
                                      : 'bg-slate-100 text-slate-400 hover:bg-slate-200'
                                  }`}
                                  title="คลิกเพื่อดูหรือแก้ไขคะแนนกรรมการท่านนี้"
                                >
                                  {js?.totalScore !== undefined && js.totalScore > 0
                                    ? `${js.totalScore} คะแนน`
                                    : '+ ลงคะแนน'}
                                </button>
                              </td>
                            );
                          })}

                          {/* Average Score (Mean) */}
                          <td className="py-3 px-4 text-center bg-slate-50 font-black text-slate-900">
                            {room.averageScore > 0 ? formatScore(room.averageScore) : '-'}
                          </td>

                          {/* Standard Deviation (S.D.) */}
                          <td className="py-3 px-4 text-center font-bold text-slate-600">
                            {room.averageScore > 0 ? formatScore(room.sd || 0) : '-'}
                          </td>

                          {/* Medal Tier */}
                          <td className="py-3 px-4 text-center">
                            {room.averageScore > 0 ? (
                              <span
                                className={`inline-block text-xs font-bold px-2 py-0.5 rounded-full border ${room.medalColor}`}
                              >
                                {room.medalLabel}
                              </span>
                            ) : (
                              <span className="text-xs text-slate-300">-</span>
                            )}
                          </td>

                          {/* Actions */}
                          <td className="py-3 px-4 text-center">
                            <div className="flex items-center justify-center gap-1">
                              {grade.judges.map((j: any, idx: number) => (
                                <button
                                  key={j.id}
                                  onClick={() => handleOpenScoreModal(room, j)}
                                  className="p-1.5 text-xs rounded-md bg-slate-100 hover:bg-amber-100 text-slate-600 hover:text-amber-800 font-bold transition-colors"
                                  title={`แก้ไขคะแนนกรรมการท่านที่ ${idx + 1}`}
                                >
                                  ก.{idx + 1}
                                </button>
                              ))}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* TAB 2: CLASSROOM & GRADE MANAGEMENT */}
        {activeTab === 'classes' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div>
                <h2 className="text-xl font-black text-slate-900">จัดการระดับชั้นและห้องเรียน</h2>
                <p className="text-xs text-slate-500">
                  เพิ่ม ลบ หรือแก้ไขรายชื่อห้องเรียนในแต่ละระดับชั้น
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() =>
                    setClassModal({
                      isOpen: true,
                      mode: 'add',
                      gradeLevelId: grades[0]?.gradeId || 1,
                      name: '',
                      roomNumber: 1,
                    })
                  }
                  className="px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs sm:text-sm font-bold flex items-center gap-2 shadow-sm transition-all"
                >
                  <Plus className="w-4 h-4" />
                  <span>เพิ่มห้องเรียนใหม่</span>
                </button>
              </div>
            </div>

            {/* List of Classrooms grouped by Grade */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {grades.map((grade: any) => (
                <div
                  key={grade.gradeId}
                  className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col justify-between"
                >
                  <div className="bg-slate-50 border-b border-slate-200 px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="w-8 h-8 rounded-lg bg-amber-500 text-slate-950 font-black flex items-center justify-center text-sm">
                        {grade.gradeShortName}
                      </span>
                      <h3 className="font-extrabold text-slate-800 text-base">
                        ระดับชั้น{grade.gradeName} ({grade.classrooms.length} ห้อง)
                      </h3>
                    </div>

                    <button
                      onClick={() =>
                        setClassModal({
                          isOpen: true,
                          mode: 'add',
                          gradeLevelId: grade.gradeId,
                          name: `${grade.gradeShortName}/${grade.classrooms.length + 1}`,
                          roomNumber: grade.classrooms.length + 1,
                        })
                      }
                      className="text-xs font-bold text-amber-800 bg-amber-100 hover:bg-amber-200 px-3 py-1.5 rounded-lg flex items-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>เพิ่มห้อง</span>
                    </button>
                  </div>

                  <div className="p-4 grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                    {grade.classrooms.map((room: any) => (
                      <div
                        key={room.classroomId}
                        className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 hover:bg-amber-50/50 border border-slate-200 text-xs font-bold text-slate-800 group transition-all"
                      >
                        <span>ห้อง {room.classroomName}</span>
                        <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100">
                          <button
                            onClick={() =>
                              setClassModal({
                                isOpen: true,
                                mode: 'edit',
                                id: room.classroomId,
                                gradeLevelId: grade.gradeId,
                                name: room.classroomName,
                                roomNumber: room.roomNumber,
                              })
                            }
                            className="p-1 hover:text-amber-600 rounded"
                            title="แก้ไขชื่อห้อง"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteClassroom(room.classroomId, room.classroomName)}
                            className="p-1 hover:text-rose-600 rounded"
                            title="ลบห้องนี้"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: JUDGE MANAGEMENT */}
        {activeTab === 'judges' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div>
                <h2 className="text-xl font-black text-slate-900">จัดการคณะกรรมการตัดสิน</h2>
                <p className="text-xs text-slate-500">
                  แก้ไขชื่อกรรมการ หรือเพิ่ม/ลบกรรมการในแต่ละระดับชั้น • PIN แสดงอยู่ใต้ชื่อกรรมการแต่ละท่าน
                </p>
              </div>

              <button
                onClick={() =>
                  setJudgeModal({
                    isOpen: true,
                    mode: 'add',
                    name: '',
                    gradeLevelId: grades[0]?.gradeId || 1,
                    judgeOrder: 1,
                    pinCode: '',
                  })
                }
                className="px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs sm:text-sm font-bold flex items-center gap-2 shadow-sm transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>เพิ่มกรรมการใหม่</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {grades.map((grade: any) => (
                <div
                  key={grade.gradeId}
                  className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden"
                >
                  <div className="bg-slate-50 border-b border-slate-200 px-6 py-4 flex items-center justify-between">
                    <h3 className="font-extrabold text-slate-800 text-base">
                      กรรมการประจำระดับชั้น{grade.gradeName} ({grade.gradeShortName})
                    </h3>
                  </div>

                  <div className="p-6 space-y-3">
                    {grade.judges.map((judge: any, idx: number) => (
                      <div
                        key={judge.id}
                        className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-200 hover:border-amber-400 transition-all"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-amber-500 text-slate-950 font-black flex items-center justify-center">
                            {judge.judgeOrder || idx + 1}
                          </div>
                          <div>
                            <h4 className="text-sm font-bold text-slate-800">{judge.name}</h4>
                            <div className="flex items-center gap-2 mt-0.5">
                              <p className="text-xs text-slate-400">
                                กรรมการลำดับที่ {judge.judgeOrder} • {grade.gradeShortName}
                              </p>
                              {judge.pinCode && (
                                <span className="inline-flex items-center gap-1 bg-slate-900 text-amber-400 font-mono font-bold text-[11px] px-2 py-0.5 rounded-md tracking-wider">
                                  PIN: {judge.pinCode}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() =>
                              setJudgeModal({
                                isOpen: true,
                                mode: 'edit',
                                id: judge.id,
                                name: judge.name,
                                gradeLevelId: grade.gradeId,
                                judgeOrder: judge.judgeOrder,
                                pinCode: judge.pinCode || '',
                              })
                            }
                            className="p-2 text-slate-600 hover:text-amber-600 hover:bg-amber-50 rounded-xl transition-colors"
                            title="แก้ไขชื่อกรรมการ"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteJudge(judge.id, judge.name)}
                            className="p-2 text-slate-600 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                            title="ลบกรรมการ"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: CRITERIA MANAGEMENT */}
        {activeTab === 'criteria' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div>
                <h2 className="text-xl font-black text-slate-900">จัดการเกณฑ์การให้คะแนน</h2>
                <p className="text-xs text-slate-500">
                  เกณฑ์คะแนนมาตรฐาน 5 ข้อ รวม 100 คะแนนเต็ม
                </p>
              </div>

              <button
                onClick={() =>
                  setCriterionModal({
                    isOpen: true,
                    mode: 'add',
                    title: '',
                    description: '',
                    maxScore: 10,
                    criterionOrder: criteria.length + 1,
                  })
                }
                className="px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs sm:text-sm font-bold flex items-center gap-2 shadow-sm transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>เพิ่มเกณฑ์ข้อใหม่</span>
              </button>
            </div>

            <div className="space-y-4">
              {criteria.map((c: any, idx: number) => (
                <div
                  key={c.id}
                  className="bg-white rounded-2xl border border-slate-200 p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm hover:border-amber-400 transition-all"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-2xl bg-slate-800 text-white font-black text-base flex items-center justify-center flex-shrink-0">
                      {idx + 1}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-base font-bold text-slate-900">{c.title}</h3>
                        <span className="text-xs font-black text-amber-900 bg-amber-100 px-2.5 py-0.5 rounded-full border border-amber-300">
                          เต็ม {c.maxScore} คะแนน
                        </span>
                      </div>
                      {c.description && (
                        <p className="text-xs text-slate-500 mt-1">{c.description}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end md:self-auto">
                    <button
                      onClick={() =>
                        setCriterionModal({
                          isOpen: true,
                          mode: 'edit',
                          id: c.id,
                          title: c.title,
                          description: c.description || '',
                          maxScore: c.maxScore,
                          criterionOrder: c.criterionOrder,
                        })
                      }
                      className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-amber-100 text-slate-700 hover:text-amber-900 font-bold text-xs flex items-center gap-1 transition-colors"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>แก้ไขเกณฑ์</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 5: EXPORT & PRINT */}
        {activeTab === 'export' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-black text-slate-900">ศูนย์ส่งออกข้อมูลและพิมพ์รายงาน</h2>
              <p className="text-xs text-slate-500">
                ดาวน์โหลดข้อมูลคะแนนเป็นไฟล์ Excel (.xlsx) หรือพิมพ์เอกสารทางการสำหรับลงนาม
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Excel Export Card */}
              <div className="bg-white rounded-3xl border-2 border-emerald-300 p-8 shadow-sm flex flex-col justify-between">
                <div>
                  <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-2xl mb-4">
                    <Download className="w-8 h-8" />
                  </div>
                  <h3 className="text-xl font-black text-slate-900 mb-2">
                    ส่งออกผลคะแนนเป็น Excel (.xlsx)
                  </h3>
                  <p className="text-xs text-slate-600 mb-6 leading-relaxed">
                    ระบบจะสร้างไฟล์ Excel รวมทุกระดับชั้น (แยก Sheet ตาม ม.1 ถึง ม.6) พร้อมระบุคะแนนรายกรรมการทุกคน, คะแนนเฉลี่ย (÷3), อันดับ และระดับเหรียญรางวัลอย่างครบถ้วน
                  </p>
                </div>

                <button
                  onClick={handleExportExcel}
                  className="w-full py-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-base shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 active:scale-95"
                >
                  <Download className="w-5 h-5" />
                  <span>ดาวน์โหลดไฟล์ Excel (.xlsx)</span>
                </button>
              </div>

              {/* Official Print Card */}
              <div className="bg-white rounded-3xl border-2 border-amber-300 p-8 shadow-sm flex flex-col justify-between">
                <div>
                  <div className="w-14 h-14 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold text-2xl mb-4">
                    <Printer className="w-8 h-8" />
                  </div>
                  <h3 className="text-xl font-black text-slate-900 mb-2">
                    พิมพ์รายงานใบคะแนนทางการ (Print / PDF)
                  </h3>
                  <p className="text-xs text-slate-600 mb-6 leading-relaxed">
                    พิมพ์เอกสารสรุปผลคะแนนขนาดมาตรฐาน A4 ออกแบบสวยงาม เหมาะสำหรับนำเสนอผู้บริหารและคณะกรรมการลงนามรับรองผล
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {grades.map((g: any) => (
                      <Link
                        key={g.gradeId}
                        href={`/print/${g.gradeId}`}
                        target="_blank"
                        className="py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-amber-100 text-slate-800 hover:text-amber-900 font-bold text-xs text-center border border-slate-200 transition-colors flex items-center justify-center gap-1"
                      >
                        <Printer className="w-3.5 h-3.5" />
                        <span>พิมพ์ {g.gradeShortName}</span>
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 6: SETTINGS */}
        {activeTab === 'settings' && (
          <div className="max-w-2xl bg-white rounded-3xl border border-slate-200 p-8 shadow-sm">
            <h2 className="text-xl font-black text-slate-900 mb-2">ตั้งค่าระบบและการแข่งขัน</h2>
            <p className="text-xs text-slate-500 mb-6">
              กำหนดชื่อการประกวด เกณฑ์คะแนนเหรียญรางวัล และรหัสผ่านผู้ดูแลระบบ
            </p>

            <form onSubmit={handleSaveSettings} className="space-y-5">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">
                  ชื่อการประกวด / หัวข้องาน
                </label>
                <input
                  type="text"
                  value={settingsForm.competitionName}
                  onChange={(e) =>
                    setSettingsForm({ ...settingsForm, competitionName: e.target.value })
                  }
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:border-amber-500 bg-slate-50 font-medium"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">
                    ชื่อหน่วยงาน / โรงเรียน
                  </label>
                  <input
                    type="text"
                    value={settingsForm.schoolName}
                    onChange={(e) =>
                      setSettingsForm({ ...settingsForm, schoolName: e.target.value })
                    }
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:border-amber-500 bg-slate-50 font-medium"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">
                    ปีการศึกษา
                  </label>
                  <input
                    type="text"
                    value={settingsForm.academicYear}
                    onChange={(e) =>
                      setSettingsForm({ ...settingsForm, academicYear: e.target.value })
                    }
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:border-amber-500 bg-slate-50 font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">
                  รหัสผ่านผู้ดูแลระบบ (Admin Password)
                </label>
                <input
                  type="password"
                  value={settingsForm.passwordHash}
                  onChange={(e) =>
                    setSettingsForm({ ...settingsForm, passwordHash: e.target.value })
                  }
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:border-amber-500 bg-slate-50 font-medium"
                />
              </div>

              {/* Medal thresholds */}
              <div className="pt-4 border-t border-slate-200">
                <h4 className="text-xs font-bold text-slate-700 uppercase mb-3">
                  เกณฑ์คะแนนสำหรับระดับเหรียญรางวัล (คะแนนเฉลี่ย)
                </h4>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs text-amber-700 font-bold mb-1">เหรียญทอง (ขั้นต่ำ)</label>
                    <input
                      type="number"
                      step={0.1}
                      value={settingsForm.goldMinScore}
                      onChange={(e) =>
                        setSettingsForm({ ...settingsForm, goldMinScore: parseFloat(e.target.value) || 0 })
                      }
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm font-bold text-center"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-700 font-bold mb-1">เหรียญเงิน (ขั้นต่ำ)</label>
                    <input
                      type="number"
                      step={0.1}
                      value={settingsForm.silverMinScore}
                      onChange={(e) =>
                        setSettingsForm({ ...settingsForm, silverMinScore: parseFloat(e.target.value) || 0 })
                      }
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm font-bold text-center"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-orange-800 font-bold mb-1">เหรียญทองแดง (ขั้นต่ำ)</label>
                    <input
                      type="number"
                      step={0.1}
                      value={settingsForm.bronzeMinScore}
                      onChange={(e) =>
                        setSettingsForm({ ...settingsForm, bronzeMinScore: parseFloat(e.target.value) || 0 })
                      }
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm font-bold text-center"
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                className="w-full mt-4 py-3.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-black text-sm shadow-md transition-all flex items-center justify-center gap-2"
              >
                <Save className="w-4 h-4" />
                <span>บันทึกการตั้งค่าระบบ</span>
              </button>
            </form>
          </div>
        )}
      </main>

      {/* --- MODAL: SCORE OVERRIDE --- */}
      {scoreModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200">
              <div>
                <span className="text-xs font-bold text-amber-700 bg-amber-100 px-2.5 py-0.5 rounded-full">
                  แก้ไขคะแนนโดยผู้ดูแลระบบ
                </span>
                <h3 className="text-xl font-black text-slate-900 mt-1">
                  ห้อง {scoreModal.classroomName} • {scoreModal.judgeName}
                </h3>
              </div>
              <button
                onClick={() => setScoreModal(null)}
                className="p-2 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="py-5 space-y-4 max-h-[60vh] overflow-y-auto pr-1">
              {criteria.map((c: any, idx: number) => {
                const currentScore = scoreModal.scores[c.id] ?? 0;
                return (
                  <div
                    key={c.id}
                    className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-3"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-slate-800 text-white text-xs font-bold flex items-center justify-center">
                          {idx + 1}
                        </span>
                        <h4 className="text-xs font-bold text-slate-800 line-clamp-1">{c.title}</h4>
                      </div>
                      <span className="text-xs text-amber-800 font-medium">เต็ม {c.maxScore} คะแนน</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min={0}
                        max={c.maxScore}
                        value={currentScore}
                        onChange={(e) => {
                          const val = Math.max(0, Math.min(c.maxScore, parseInt(e.target.value, 10) || 0));
                          setScoreModal({
                            ...scoreModal,
                            scores: { ...scoreModal.scores, [c.id]: val },
                          });
                        }}
                        className="w-16 h-10 text-center font-bold text-lg rounded-xl border border-slate-300 focus:outline-none focus:border-amber-500 bg-white"
                      />
                    </div>
                  </div>
                );
              })}

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  ข้อเสนอแนะเพิ่มเติม:
                </label>
                <input
                  type="text"
                  value={scoreModal.comment}
                  onChange={(e) => setScoreModal({ ...scoreModal, comment: e.target.value })}
                  placeholder="ข้อเสนอแนะ..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="markCompleted"
                  checked={scoreModal.isCompleted}
                  onChange={(e) => setScoreModal({ ...scoreModal, isCompleted: e.target.checked })}
                  className="w-4 h-4 rounded text-amber-600"
                />
                <label htmlFor="markCompleted" className="text-xs font-bold text-slate-700">
                  ทำเครื่องหมายว่าตรวจเสร็จสมบูรณ์แล้ว
                </label>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setScoreModal(null)}
                className="px-5 py-2.5 rounded-xl text-slate-600 font-bold text-sm hover:bg-slate-100"
              >
                ยกเลิก
              </button>
              <button
                type="button"
                onClick={handleSaveScoreOverride}
                className="px-6 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-sm shadow-md"
              >
                บันทึกคะแนน
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- MODAL: CLASSROOM ADD / EDIT --- */}
      {classModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border">
            <div className="flex items-center justify-between pb-3 border-b">
              <h3 className="text-lg font-black text-slate-900">
                {classModal.mode === 'edit' ? 'แก้ไขห้องเรียน' : 'เพิ่มห้องเรียนใหม่'}
              </h3>
              <button onClick={() => setClassModal(null)}>
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            <div className="py-4 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">ระดับชั้น</label>
                <select
                  value={classModal.gradeLevelId}
                  onChange={(e) =>
                    setClassModal({ ...classModal, gradeLevelId: parseInt(e.target.value, 10) })
                  }
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-sm bg-white"
                >
                  {grades.map((g: any) => (
                    <option key={g.gradeId} value={g.gradeId}>
                      ระดับชั้น{g.gradeName} ({g.gradeShortName})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">ชื่อห้องเรียน</label>
                <input
                  type="text"
                  value={classModal.name}
                  onChange={(e) => setClassModal({ ...classModal, name: e.target.value })}
                  placeholder="เช่น ม.1/14"
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-sm font-bold"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">ลำดับห้อง (ตัวเลข)</label>
                <input
                  type="number"
                  value={classModal.roomNumber}
                  onChange={(e) =>
                    setClassModal({ ...classModal, roomNumber: parseInt(e.target.value, 10) || 1 })
                  }
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-sm"
                />
              </div>
            </div>

            <div className="pt-3 border-t flex justify-end gap-2">
              <button
                onClick={() => setClassModal(null)}
                className="px-4 py-2 rounded-xl text-slate-600 font-bold text-xs"
              >
                ยกเลิก
              </button>
              <button
                onClick={handleSaveClassroom}
                className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-md"
              >
                บันทึก
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- MODAL: JUDGE ADD / EDIT --- */}
      {judgeModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border">
            <div className="flex items-center justify-between pb-3 border-b">
              <h3 className="text-lg font-black text-slate-900">
                {judgeModal.mode === 'edit' ? 'แก้ไขกรรมการ' : 'เพิ่มกรรมการใหม่'}
              </h3>
              <button onClick={() => setJudgeModal(null)}>
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            <div className="py-4 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">ชื่อกรรมการ</label>
                <input
                  type="text"
                  value={judgeModal.name}
                  onChange={(e) => setJudgeModal({ ...judgeModal, name: e.target.value })}
                  placeholder="เช่น อ.สมชาย ใจดี"
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-sm font-bold"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">ระดับชั้นที่รับผิดชอบ</label>
                <select
                  value={judgeModal.gradeLevelId}
                  onChange={(e) =>
                    setJudgeModal({ ...judgeModal, gradeLevelId: parseInt(e.target.value, 10) })
                  }
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-sm bg-white"
                >
                  {grades.map((g: any) => (
                    <option key={g.gradeId} value={g.gradeId}>
                      ระดับชั้น{g.gradeName} ({g.gradeShortName})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">ลำดับกรรมการ (1, 2, 3)</label>
                <input
                  type="number"
                  value={judgeModal.judgeOrder}
                  onChange={(e) =>
                    setJudgeModal({ ...judgeModal, judgeOrder: parseInt(e.target.value, 10) || 1 })
                  }
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  รหัส PIN (4 หลัก)
                  <span className="text-slate-400 font-normal ml-2">— ใช้สำหรับยืนยันตัวตนก่อนเข้าลงคะแนน</span>
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={4}
                  value={judgeModal.pinCode}
                  onChange={(e) =>
                    setJudgeModal({ ...judgeModal, pinCode: e.target.value.replace(/\D/g, '').slice(0, 4) })
                  }
                  placeholder="เช่น 0101 สำหรับ ม.1 กรรมการท่านที่ 1"
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-sm font-mono tracking-widest font-bold"
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  รูปแบบ PIN มาตรฐาน: [รหัสชั้น 2 หลัก][ลำดับกรรมการ 2 หลัก] เช่น ม.1 กรรมการ 1 = <strong>0101</strong>
                </p>
              </div>
            </div>

            <div className="pt-3 border-t flex justify-end gap-2">
              <button
                onClick={() => setJudgeModal(null)}
                className="px-4 py-2 rounded-xl text-slate-600 font-bold text-xs"
              >
                ยกเลิก
              </button>
              <button
                onClick={handleSaveJudge}
                className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-md"
              >
                บันทึก
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- MODAL: CRITERION ADD / EDIT --- */}
      {criterionModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border">
            <div className="flex items-center justify-between pb-3 border-b">
              <h3 className="text-lg font-black text-slate-900">
                {criterionModal.mode === 'edit' ? 'แก้ไขเกณฑ์การตัดสิน' : 'เพิ่มเกณฑ์ข้อใหม่'}
              </h3>
              <button onClick={() => setCriterionModal(null)}>
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            <div className="py-4 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">ชื่อเกณฑ์การตัดสิน</label>
                <input
                  type="text"
                  value={criterionModal.title}
                  onChange={(e) => setCriterionModal({ ...criterionModal, title: e.target.value })}
                  placeholder="เช่น คลิปสร้างสรรค์..."
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-sm font-bold"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">รายละเอียดเกณฑ์</label>
                <textarea
                  value={criterionModal.description}
                  onChange={(e) =>
                    setCriterionModal({ ...criterionModal, description: e.target.value })
                  }
                  placeholder="คำอธิบายเกณฑ์เพิ่มเติม..."
                  rows={3}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">คะแนนเต็ม</label>
                  <input
                    type="number"
                    value={criterionModal.maxScore}
                    onChange={(e) =>
                      setCriterionModal({
                        ...criterionModal,
                        maxScore: parseInt(e.target.value, 10) || 0,
                      })
                    }
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-sm font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">ลำดับข้อ</label>
                  <input
                    type="number"
                    value={criterionModal.criterionOrder}
                    onChange={(e) =>
                      setCriterionModal({
                        ...criterionModal,
                        criterionOrder: parseInt(e.target.value, 10) || 1,
                      })
                    }
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-sm"
                  />
                </div>
              </div>
            </div>

            <div className="pt-3 border-t flex justify-end gap-2">
              <button
                onClick={() => setCriterionModal(null)}
                className="px-4 py-2 rounded-xl text-slate-600 font-bold text-xs"
              >
                ยกเลิก
              </button>
              <button
                onClick={handleSaveCriterion}
                className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-md"
              >
                บันทึก
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
