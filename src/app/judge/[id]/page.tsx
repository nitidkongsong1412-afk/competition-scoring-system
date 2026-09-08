'use client';

import { useEffect, useState, use, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import { calculateMedal } from '@/lib/utils';
import confetti from 'canvas-confetti';
import {
  ArrowLeft,
  CheckCircle,
  Clock,
  Sparkles,
  Award,
  AlertCircle,
  MessageSquare,
  Check,
  Plus,
  Minus,
  Trophy,
  AlertTriangle,
  X,
} from 'lucide-react';

interface JudgeData {
  id: number;
  name: string;
  judgeOrder: number;
  gradeLevelId: number;
  gradeLevel: {
    id: number;
    name: string;
    shortName: string;
  };
}

interface Classroom {
  id: number;
  gradeLevelId: number;
  name: string;
  roomNumber: number;
}

interface Criterion {
  id: number;
  title: string;
  description: string;
  maxScore: number;
  criterionOrder: number;
}

export default function JudgeScoringPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();

  const [judge, setJudge] = useState<JudgeData | null>(null);
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [criteria, setCriteria] = useState<Criterion[]>([]);
  const [scoresMap, setScoresMap] = useState<Record<number, Record<number, number>>>({});
  const [submissionsMap, setSubmissionsMap] = useState<Record<number, { comment: string; isCompleted: boolean }>>({});
  const [config, setConfig] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Filter: 'all' | 'pending' | 'completed'
  const [activeFilter, setActiveFilter] = useState<'all' | 'pending' | 'completed'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Saving state indicators
  const [savingStatus, setSavingStatus] = useState<Record<string, 'idle' | 'saving' | 'saved' | 'error'>>({});
  const [globalSavedToast, setGlobalSavedToast] = useState(false);
  const autoSaveTimeouts = useRef<Record<string, NodeJS.Timeout>>({});

  // Max score exceeded alert modal
  const [overflowAlert, setOverflowAlert] = useState<{
    isOpen: boolean;
    criterionTitle: string;
    maxScore: number;
    enteredScore: number;
    classroomName: string;
  } | null>(null);

  // PIN verification
  const [isPinVerified, setIsPinVerified] = useState(false);
  const [enteredPin, setEnteredPin] = useState('');
  const [pinError, setPinError] = useState('');
  const [pinLoading, setPinLoading] = useState(false);
  const [judgeNameForPin, setJudgeNameForPin] = useState('');

  // Fetch minimal judge name for the PIN screen (before full data load)
  useEffect(() => {
    fetch(`/api/judge/${id}`)
      .then((r) => r.json())
      .then((d) => { if (d.success) setJudgeNameForPin(d.judge?.name || ''); })
      .catch(() => {});
  }, [id]);

  useEffect(() => {
    if (isPinVerified) fetchJudgeData();
  }, [isPinVerified]);

  const fetchJudgeData = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/judge/${id}`);
      const data = await res.json();
      if (data.success) {
        setJudge(data.judge);
        setClassrooms(data.classrooms);
        setCriteria(data.criteria);
        setScoresMap(data.scoresMap || {});
        setSubmissionsMap(data.submissionsMap || {});
        setConfig(data.config);
      } else {
        alert(data.error || 'เกิดข้อผิดพลาดในการโหลดข้อมูล');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Helper: Get score for a classroom & criterion
  const getScore = (classroomId: number, criterionId: number): number | '' => {
    const roomScores = scoresMap[classroomId];
    if (!roomScores || roomScores[criterionId] === undefined || roomScores[criterionId] === null) return '';
    return roomScores[criterionId];
  };

  // Helper: Get classroom total score
  const getRoomTotal = (classroomId: number): number => {
    const roomScores = scoresMap[classroomId] || {};
    let total = 0;
    criteria.forEach((c) => {
      const score = roomScores[c.id];
      if (typeof score === 'number') {
        total += score;
      }
    });
    return total;
  };

  // Helper: Check if room has all criteria filled
  const isRoomAllFilled = (classroomId: number): boolean => {
    const roomScores = scoresMap[classroomId] || {};
    return criteria.length > 0 && criteria.every((c) => typeof roomScores[c.id] === 'number');
  };

  // Handle Score Input Change with:
  // 1. Normalizing leading zeros (e.g. 040 -> 40, 05 -> 5)
  // 2. Immediately clearing if > maxScore and showing popup warning
  const handleScoreChange = (
    classroomId: number,
    criterion: Criterion,
    rawVal: string,
    classroomName: string
  ) => {
    const criterionId = criterion.id;
    const maxScore = criterion.maxScore;

    if (rawVal === '') {
      // Clear input locally and update state
      setScoresMap((prev) => {
        const nextRoom = { ...(prev[classroomId] || {}) };
        delete nextRoom[criterionId];
        return { ...prev, [classroomId]: nextRoom };
      });
      return;
    }

    // Parse as integer (automatically strips leading zeroes: "040" -> 40, "05" -> 5)
    const parsed = parseInt(rawVal, 10);
    if (isNaN(parsed)) return;

    if (parsed > maxScore) {
      // 1. Clear score immediately
      setScoresMap((prev) => {
        const nextRoom = { ...(prev[classroomId] || {}) };
        delete nextRoom[criterionId];
        return { ...prev, [classroomId]: nextRoom };
      });

      // 2. Trigger popup warning
      setOverflowAlert({
        isOpen: true,
        criterionTitle: criterion.title,
        maxScore,
        enteredScore: parsed,
        classroomName,
      });
      return;
    }

    const val = Math.max(0, parsed);

    // Update local state immediately for snappy UI
    setScoresMap((prev) => ({
      ...prev,
      [classroomId]: {
        ...(prev[classroomId] || {}),
        [criterionId]: val,
      },
    }));

    triggerAutoSaveScore(classroomId, criterionId, val);
  };

  // Trigger Debounced Auto-save to Server
  const triggerAutoSaveScore = (classroomId: number, criterionId: number, score: number) => {
    const key = `${classroomId}-${criterionId}`;
    setSavingStatus((prev) => ({ ...prev, [key]: 'saving' }));

    if (autoSaveTimeouts.current[key]) {
      clearTimeout(autoSaveTimeouts.current[key]);
    }

    autoSaveTimeouts.current[key] = setTimeout(async () => {
      try {
        const res = await fetch('/api/score/save', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            judgeId: judge?.id,
            classroomId,
            criterionId,
            score,
          }),
        });
        const data = await res.json();
        if (data.success) {
          setSavingStatus((prev) => ({ ...prev, [key]: 'saved' }));
          showGlobalToast();
          setTimeout(() => {
            setSavingStatus((prev) => ({ ...prev, [key]: 'idle' }));
          }, 2000);
        } else {
          setSavingStatus((prev) => ({ ...prev, [key]: 'error' }));
        }
      } catch (err) {
        setSavingStatus((prev) => ({ ...prev, [key]: 'error' }));
      }
    }, 400); // 400ms debounce
  };

  // Handle Comment change
  const handleCommentChange = (classroomId: number, comment: string) => {
    setSubmissionsMap((prev) => ({
      ...prev,
      [classroomId]: {
        ...(prev[classroomId] || { isCompleted: false }),
        comment,
      },
    }));

    const key = `comment-${classroomId}`;
    if (autoSaveTimeouts.current[key]) {
      clearTimeout(autoSaveTimeouts.current[key]);
    }

    autoSaveTimeouts.current[key] = setTimeout(async () => {
      try {
        await fetch('/api/score/save', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            judgeId: judge?.id,
            classroomId,
            comment,
          }),
        });
        showGlobalToast();
      } catch (e) {}
    }, 600);
  };

  // Confirm / Complete single classroom
  const toggleRoomCompletion = async (classroomId: number) => {
    const currentCompleted = submissionsMap[classroomId]?.isCompleted ?? false;
    const newStatus = !currentCompleted;

    if (newStatus && !isRoomAllFilled(classroomId)) {
      alert('กรุณากรอกคะแนนให้ครบทั้ง 5 เกณฑ์ก่อนยืนยันผลห้องนี้ครับ');
      return;
    }

    setSubmissionsMap((prev) => ({
      ...prev,
      [classroomId]: {
        ...(prev[classroomId] || { comment: '' }),
        isCompleted: newStatus,
      },
    }));

    try {
      const res = await fetch('/api/score/submit-room', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          judgeId: judge?.id,
          classroomId,
          isCompleted: newStatus,
          comment: submissionsMap[classroomId]?.comment || '',
        }),
      });
      const data = await res.json();
      if (data.success) {
        showGlobalToast();
        checkAllCompletedCelebration(classroomId, newStatus);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const checkAllCompletedCelebration = (changedRoomId: number, changedStatus: boolean) => {
    const completedCount = classrooms.filter((c) => {
      if (c.id === changedRoomId) return changedStatus;
      return submissionsMap[c.id]?.isCompleted;
    }).length;

    if (completedCount === classrooms.length && classrooms.length > 0) {
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 },
      });
    }
  };

  const showGlobalToast = () => {
    setGlobalSavedToast(true);
    setTimeout(() => setGlobalSavedToast(false), 2500);
  };

  // Progress calculations
  const totalRoomsCount = classrooms.length;
  const completedRoomsCount = classrooms.filter((c) => submissionsMap[c.id]?.isCompleted).length;
  const progressPercent = totalRoomsCount > 0 ? Math.round((completedRoomsCount / totalRoomsCount) * 100) : 0;

  // Filter classrooms
  const filteredClassrooms = classrooms.filter((room) => {
    const isCompleted = submissionsMap[room.id]?.isCompleted;
    if (activeFilter === 'pending' && isCompleted) return false;
    if (activeFilter === 'completed' && !isCompleted) return false;
    if (searchQuery && !room.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  // PIN verification handler
  const handlePinKey = (key: string) => {
    setPinError('');
    if (key === 'del') {
      setEnteredPin((prev) => prev.slice(0, -1));
      return;
    }
    if (key === 'clear') {
      setEnteredPin('');
      return;
    }
    if (enteredPin.length >= 4) return;
    const next = enteredPin + key;
    setEnteredPin(next);
    if (next.length === 4) {
      verifyPin(next);
    }
  };

  const verifyPin = async (pin: string) => {
    setPinLoading(true);
    try {
      const res = await fetch('/api/judge/verify-pin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ judgeId: id, pinCode: pin }),
      });
      const data = await res.json();
      if (data.success) {
        setIsPinVerified(true);
      } else {
        setPinError(data.error || 'รหัส PIN ไม่ถูกต้อง กรุณาลองใหม่อีกครั้ง');
        setEnteredPin('');
      }
    } catch {
      setPinError('เกิดข้อผิดพลาด กรุณาลองใหม่');
      setEnteredPin('');
    } finally {
      setPinLoading(false);
    }
  };

  // ── PIN Lock Screen ──────────────────────────────────────────────
  if (!isPinVerified) {
    const pinKeys = ['1','2','3','4','5','6','7','8','9','clear','0','del'];
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-6 font-sans">
        <div className="w-full max-w-xs space-y-6">
          {/* Header */}
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white/10 text-amber-400 mb-4 border border-white/10">
              <Award className="w-8 h-8" />
            </div>
            <h1 className="text-xl font-black text-white">ยืนยันตัวตนก่อนเข้าระบบ</h1>
            <p className="text-slate-400 text-sm mt-1">
              กรุณากรอก <strong className="text-white">รหัส PIN 4 หลัก</strong> ของท่าน
            </p>
            {judgeNameForPin && (
              <p className="mt-2 text-amber-400 font-bold text-sm">
                {judgeNameForPin}
              </p>
            )}
          </div>

          {/* PIN dots */}
          <div className="flex justify-center gap-4">
            {[0, 1, 2, 3].map((i) => (
              <div
                key={i}
                className={`w-4 h-4 rounded-full border-2 transition-all duration-150 ${
                  enteredPin.length > i
                    ? 'bg-amber-400 border-amber-400 scale-110'
                    : 'bg-transparent border-slate-600'
                }`}
              />
            ))}
          </div>

          {/* Error message */}
          {pinError && (
            <div className="bg-rose-500/20 border border-rose-500/40 text-rose-300 text-sm font-medium text-center py-2.5 px-4 rounded-xl">
              {pinError}
            </div>
          )}

          {/* PIN Keypad */}
          <div className="grid grid-cols-3 gap-3">
            {pinKeys.map((key) => (
              <button
                key={key}
                onClick={() => handlePinKey(key)}
                disabled={pinLoading}
                className={`
                  h-16 rounded-2xl text-lg font-bold transition-all active:scale-95
                  ${key === 'del' ? 'text-slate-300 bg-white/5 hover:bg-white/10 text-sm'
                    : key === 'clear' ? 'text-slate-400 bg-white/5 hover:bg-white/10 text-xs'
                    : 'bg-white/10 hover:bg-white/15 text-white border border-white/10'}
                  ${pinLoading ? 'opacity-50 cursor-not-allowed' : ''}
                `}
              >
                {key === 'del' ? '⌫' : key === 'clear' ? 'ล้าง' : key}
              </button>
            ))}
          </div>

          {/* Loading indicator */}
          {pinLoading && (
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-6 w-6 border-2 border-amber-400 border-t-transparent"></div>
              <p className="text-slate-400 text-xs mt-2">กำลังตรวจสอบ...</p>
            </div>
          )}

          {/* Back link */}
          <div className="text-center pt-2">
            <Link href="/" className="text-slate-500 hover:text-slate-400 text-xs transition-colors">
              ← กลับสู่หน้าหลัก
            </Link>
          </div>
        </div>
      </div>
    );
  }
  // ────────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center py-20">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-10 w-10 border-3 border-slate-900 border-t-transparent"></div>
            <p className="mt-4 text-slate-600 font-medium text-sm">กำลังเปิดหน้าลงคะแนน...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!judge) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center p-6 text-center">
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200 max-w-md">
            <AlertCircle className="w-12 h-12 text-rose-500 mx-auto mb-3" />
            <h2 className="text-xl font-bold text-slate-800">ไม่พบข้อมูลกรรมการ</h2>
            <p className="text-slate-500 mt-2 text-sm">กรุณากลับไปที่หน้าแรกและเลือกรหัสกรรมการใหม่อีกครั้ง</p>
            <Link
              href="/"
              className="mt-6 inline-block w-full py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-2xl transition-all"
            >
              กลับสู่หน้าแรก
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/80 flex flex-col pb-24 font-sans">
      <Navbar competitionTitle={config?.competitionName || 'เท่อย่างเซียน'} />

      {/* Auto-save Floating Toast */}
      <div
        className={`fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-xl flex items-center gap-3 transition-all transform ${
          globalSavedToast ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6 pointer-events-none'
        }`}
      >
        <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" />
        <span className="text-xs sm:text-sm font-medium">บันทึกคะแนนอัตโนมัติแล้ว ✓</span>
      </div>

      {/* Warning Modal when Score Exceeds maxScore */}
      {overflowAlert && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-rose-100 text-center animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 rounded-2xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-600 mx-auto mb-4">
              <AlertTriangle className="w-8 h-8" />
            </div>

            <h3 className="text-xl font-black text-slate-900 mb-2">
              กรอกคะแนนเกินเกณฑ์ที่กำหนด!
            </h3>

            <p className="text-sm text-slate-600 mb-4 leading-relaxed">
              ในห้อง <strong className="text-slate-900">"{overflowAlert.classroomName}"</strong> ข้อ{' '}
              <strong className="text-slate-900">"{overflowAlert.criterionTitle}"</strong>
              <br />
              กำหนดคะแนนเต็มไม่เกิน{' '}
              <span className="inline-block px-2 py-0.5 bg-rose-100 text-rose-800 rounded font-bold">
                {overflowAlert.maxScore} คะแนน
              </span>
            </p>

            <div className="bg-rose-50/70 border border-rose-200/60 rounded-2xl p-3.5 text-xs text-rose-800 font-medium mb-6">
              ⚠️ ท่านกรอก <strong>{overflowAlert.enteredScore} คะแนน</strong> ซึ่งเกินเกณฑ์ ระบบได้ลบคะแนนในช่องนี้ออกแล้ว เพื่อให้ท่านกรอกคะแนนที่ถูกต้องใหม่อีกครั้ง
            </div>

            <button
              onClick={() => setOverflowAlert(null)}
              className="w-full py-3.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm shadow-md transition-all active:scale-95"
            >
              เข้าใจแล้ว / กรอกคะแนนใหม่
            </button>
          </div>
        </div>
      )}

      {/* Top Sticky Header */}
      <div className="bg-white border-b border-slate-200/80 sticky top-16 sm:top-20 z-30 shadow-sm backdrop-blur-md bg-white/95">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            {/* Judge Info & Back button */}
            <div className="flex items-center gap-3.5">
              <Link
                href="/"
                className="p-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200/80 text-slate-700 transition-colors flex items-center gap-1.5 font-medium text-xs sm:text-sm"
                title="กลับหน้าเลือกกรรมการ"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="hidden sm:inline">หน้าแรก</span>
              </Link>
              <div>
                <div className="flex items-center gap-2">
                  <span className="bg-amber-100/80 text-amber-900 font-bold px-2.5 py-0.5 rounded-lg text-xs border border-amber-200">
                    {judge.gradeLevel.shortName}
                  </span>
                  <h1 className="text-lg sm:text-2xl font-black text-slate-900 tracking-tight">
                    {judge.name}
                  </h1>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  ระดับชั้น{judge.gradeLevel.name} • เกณฑ์รวม 100 คะแนนเต็ม
                </p>
              </div>
            </div>

            {/* Progress summary widget */}
            <div className="flex items-center gap-4 bg-slate-50 px-4 py-2.5 rounded-2xl border border-slate-200/80 flex-shrink-0">
              <div className="text-right">
                <span className="text-[11px] text-slate-400 block font-medium">ความคืบหน้า</span>
                <span className="font-extrabold text-sm sm:text-base text-slate-800">
                  ตรวจแล้ว <span className="text-emerald-600">{completedRoomsCount}</span> / {totalRoomsCount} ห้อง
                </span>
              </div>
              <div className="w-24 sm:w-28 h-2.5 bg-slate-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-500 transition-all duration-300 rounded-full"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          </div>

          {/* Filter Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 mt-4 pt-3 border-t border-slate-100">
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setActiveFilter('all')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  activeFilter === 'all'
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                ทั้งหมด ({totalRoomsCount})
              </button>
              <button
                onClick={() => setActiveFilter('pending')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  activeFilter === 'pending'
                    ? 'bg-amber-600 text-white shadow-sm'
                    : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                ยังไม่ตรวจ ({totalRoomsCount - completedRoomsCount})
              </button>
              <button
                onClick={() => setActiveFilter('completed')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  activeFilter === 'completed'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                ตรวจเสร็จแล้ว ({completedRoomsCount})
              </button>
            </div>

            <div className="text-[11px] text-slate-500 hidden sm:flex items-center gap-1.5">
              <span>💡 พิมพ์คะแนนในช่อง ระบบจะบันทึกอัตโนมัติ (ไม่เกินคะแนนเต็มแต่ละข้อ)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Scoring Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex-1 w-full space-y-6">
        {filteredClassrooms.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 text-slate-500">
            <CheckCircle className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
            <p className="text-base font-bold text-slate-800">ไม่มีห้องเรียนในหมวดหมู่นี้</p>
            <p className="text-xs text-slate-400 mt-1">คุณตรวจครบทุกห้องแล้ว หรือไม่มีห้องที่ตรงกับเงื่อนไข</p>
          </div>
        ) : (
          filteredClassrooms.map((room) => {
            const isCompleted = submissionsMap[room.id]?.isCompleted ?? false;
            const comment = submissionsMap[room.id]?.comment ?? '';
            const roomTotal = getRoomTotal(room.id);
            const allFilled = isRoomAllFilled(room.id);
            const medalInfo = calculateMedal(
              roomTotal,
              config?.goldMinScore ?? 80,
              config?.silverMinScore ?? 70,
              config?.bronzeMinScore ?? 60
            );

            return (
              <div
                key={room.id}
                className={`bg-white rounded-3xl border transition-all shadow-sm overflow-hidden ${
                  isCompleted
                    ? 'border-emerald-300 ring-1 ring-emerald-300/50'
                    : allFilled
                    ? 'border-amber-300'
                    : 'border-slate-200/90 hover:border-slate-300'
                }`}
              >
                {/* Classroom Card Header */}
                <div
                  className={`px-6 py-4 flex flex-wrap items-center justify-between gap-4 border-b ${
                    isCompleted
                      ? 'bg-emerald-50/40 border-emerald-100'
                      : allFilled
                      ? 'bg-amber-50/30 border-amber-100'
                      : 'bg-slate-50/60 border-slate-100'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-11 h-11 rounded-2xl font-black text-lg flex items-center justify-center shadow-xs ${
                        isCompleted
                          ? 'bg-emerald-600 text-white'
                          : allFilled
                          ? 'bg-amber-600 text-white'
                          : 'bg-slate-800 text-white'
                      }`}
                    >
                      {room.name.replace(`${judge.gradeLevel.shortName}/`, '')}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="text-xl font-black text-slate-900 tracking-tight">
                          ห้อง {room.name}
                        </h2>
                        {isCompleted && (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-800 bg-emerald-100/80 px-2.5 py-0.5 rounded-full border border-emerald-200">
                            <Check className="w-3 h-3" />
                            ยืนยันผลแล้ว
                          </span>
                        )}
                        {!isCompleted && allFilled && (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-800 bg-amber-100/80 px-2.5 py-0.5 rounded-full border border-amber-200">
                            กรอกครบ 5 ข้อ
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-400">
                        ลำดับที่ {room.roomNumber} ในระดับชั้น{judge.gradeLevel.name}
                      </p>
                    </div>
                  </div>

                  {/* Room Total Score Box */}
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <span className="text-[11px] font-medium text-slate-400 block">คะแนนรวมของห้องนี้</span>
                      <div className="flex items-baseline gap-1.5 justify-end">
                        <span
                          className={`text-2xl sm:text-3xl font-black ${
                            roomTotal >= (config?.goldMinScore ?? 80)
                              ? 'text-amber-600'
                              : roomTotal >= (config?.silverMinScore ?? 70)
                              ? 'text-slate-700'
                              : roomTotal >= (config?.bronzeMinScore ?? 60)
                              ? 'text-orange-700'
                              : 'text-slate-800'
                          }`}
                        >
                          {roomTotal}
                        </span>
                        <span className="text-xs text-slate-400 font-bold">/ 100</span>
                      </div>
                    </div>

                    {roomTotal > 0 && (
                      <div
                        className={`hidden sm:flex items-center gap-1 px-3 py-1 rounded-xl border text-xs font-bold ${medalInfo.color}`}
                      >
                        <Award className="w-3.5 h-3.5" />
                        <span>{medalInfo.label}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* 5 Criteria Inputs Grid */}
                <div className="p-6 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {criteria.map((criterion, idx) => {
                      const scoreVal = getScore(room.id, criterion.id);

                      return (
                        <div
                          key={criterion.id}
                          className={`rounded-2xl p-4 border transition-all flex flex-col justify-between ${
                            scoreVal !== '' && typeof scoreVal === 'number'
                              ? 'bg-slate-50/50 border-slate-200'
                              : 'bg-white border-slate-200 hover:border-slate-300'
                          }`}
                        >
                          {/* Criterion Header */}
                          <div>
                            <div className="flex items-start justify-between gap-2 mb-2">
                              <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-slate-800 text-white text-[11px] font-bold flex-shrink-0">
                                {idx + 1}
                              </span>
                              <span className="text-[11px] font-extrabold text-amber-900 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200/60">
                                เต็ม {criterion.maxScore} คะแนน
                              </span>
                            </div>
                            <h3 className="text-xs sm:text-sm font-bold text-slate-800 line-clamp-3 leading-snug">
                              {criterion.title}
                            </h3>
                            {criterion.description && (
                              <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">
                                {criterion.description}
                              </p>
                            )}
                          </div>

                          {/* Large Senior-Friendly Input Control with +/- Stepper */}
                          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                            <span className="text-xs font-semibold text-slate-500">
                              กรอกคะแนน:
                            </span>

                            <div className="flex items-center gap-1.5">
                              {/* Minus Button */}
                              <button
                                type="button"
                                onClick={() => {
                                  const cur = typeof scoreVal === 'number' ? scoreVal : 0;
                                  if (cur > 0) {
                                    handleScoreChange(
                                      room.id,
                                      criterion,
                                      String(cur - 1),
                                      room.name
                                    );
                                  }
                                }}
                                className="w-9 h-9 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold flex items-center justify-center text-base active:scale-95 transition-transform"
                                title="ลด 1 คะแนน"
                              >
                                <Minus className="w-3.5 h-3.5" />
                              </button>

                              {/* Number Input */}
                              <input
                                type="number"
                                min={0}
                                max={criterion.maxScore}
                                step={1}
                                value={scoreVal}
                                onChange={(e) =>
                                  handleScoreChange(
                                    room.id,
                                    criterion,
                                    e.target.value,
                                    room.name
                                  )
                                }
                                placeholder="0"
                                className={`w-16 h-11 text-center text-xl font-black rounded-xl border-2 focus:outline-none transition-all ${
                                  scoreVal !== ''
                                    ? 'bg-amber-50/50 border-amber-500 text-slate-900'
                                    : 'bg-white border-slate-300 focus:border-slate-800 text-slate-700'
                                }`}
                              />

                              {/* Plus Button */}
                              <button
                                type="button"
                                onClick={() => {
                                  const cur = typeof scoreVal === 'number' ? scoreVal : 0;
                                  if (cur < criterion.maxScore) {
                                    handleScoreChange(
                                      room.id,
                                      criterion,
                                      String(cur + 1),
                                      room.name
                                    );
                                  } else {
                                    // Alert if already at max
                                    setOverflowAlert({
                                      isOpen: true,
                                      criterionTitle: criterion.title,
                                      maxScore: criterion.maxScore,
                                      enteredScore: cur + 1,
                                      classroomName: room.name,
                                    });
                                  }
                                }}
                                className="w-9 h-9 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold flex items-center justify-center text-base active:scale-95 transition-transform"
                                title="เพิ่ม 1 คะแนน"
                              >
                                <Plus className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Comment Box & Room Submission Button */}
                  <div className="pt-4 border-t border-slate-100 flex flex-col md:flex-row items-stretch md:items-end justify-between gap-4">
                    {/* Comment box */}
                    <div className="flex-1">
                      <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                        <MessageSquare className="w-3.5 h-3.5 text-slate-400" />
                        <span>ข้อเสนอแนะเพิ่มเติมสำหรับห้องนี้ (ไม่บังคับ):</span>
                      </label>
                      <input
                        type="text"
                        value={comment}
                        onChange={(e) => handleCommentChange(room.id, e.target.value)}
                        placeholder="กรอกคำชื่นชมหรือข้อเสนอแนะ..."
                        className="w-full px-4 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-800 focus:outline-none focus:border-slate-800 bg-white"
                      />
                    </div>

                    {/* Room Save / Confirm Button */}
                    <div className="flex-shrink-0">
                      <button
                        type="button"
                        onClick={() => toggleRoomCompletion(room.id)}
                        className={`w-full md:w-auto px-6 py-2.5 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-xs active:scale-95 ${
                          isCompleted
                            ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                            : allFilled
                            ? 'bg-amber-600 hover:bg-amber-700 text-white'
                            : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                        }`}
                      >
                        <Check className="w-4 h-4" />
                        <span>{isCompleted ? '✓ บันทึกและยืนยันแล้ว (แก้ไขได้)' : 'ยืนยันผลการตัดสินห้องนี้'}</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}

        {/* Global Summary Card at bottom */}
        <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-md mt-10 border border-slate-800">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <Trophy className="w-5 h-5 text-amber-400" />
                <h3 className="text-lg sm:text-xl font-bold text-white">
                  สรุปผลการลงคะแนนของ {judge.name}
                </h3>
              </div>
              <p className="text-slate-400 text-xs sm:text-sm">
                คุณลงคะแนนและยืนยันผลไปแล้ว{' '}
                <strong className="text-amber-400 text-base">{completedRoomsCount}</strong> จาก{' '}
                <strong className="text-white text-base">{totalRoomsCount}</strong> ห้องเรียน
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
              <Link
                href="/leaderboard"
                className="flex-1 md:flex-initial px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs sm:text-sm text-center border border-white/15 transition-all"
              >
                ดูตารางผลคะแนนรวม
              </Link>
              <Link
                href="/"
                className="flex-1 md:flex-initial px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs sm:text-sm text-center transition-all shadow-xs"
              >
                เสร็จสิ้น / กลับหน้าหลัก
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
