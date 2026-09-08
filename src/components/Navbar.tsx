'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Award, Home, Shield, BarChart3 } from 'lucide-react';

export default function Navbar({
  competitionTitle = 'เท่อย่างเซียน',
}: {
  competitionTitle?: string;
}) {
  const pathname = usePathname();

  const isActive = (path: string) => {
    if (path === '/' && pathname === '/') return true;
    if (path !== '/' && pathname.startsWith(path)) return true;
    return false;
  };

  return (
    <header className="bg-white/95 backdrop-blur-md border-b border-slate-200/80 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 sm:h-18">
          {/* Logo & Title */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center text-amber-400 shadow-xs group-hover:scale-105 transition-transform border border-slate-800">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-base sm:text-xl text-slate-900 tracking-tight">
                  ระบบลงคะแนน
                </span>
                <span className="bg-amber-50 text-amber-900 text-[11px] font-semibold px-2 py-0.5 rounded-md border border-amber-200/60">
                  {competitionTitle}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block">
                ระบบบันทึกและประมวลผลคะแนนการตัดสิน
              </p>
            </div>
          </Link>

          {/* Navigation Links */}
          <nav className="flex items-center gap-1 sm:gap-1.5">
            <Link
              href="/"
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl font-medium text-xs sm:text-sm transition-all ${
                isActive('/')
                  ? 'bg-slate-900 text-white shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
              }`}
            >
              <Home className="w-4 h-4" />
              <span>หน้าแรก</span>
            </Link>

            <Link
              href="/leaderboard"
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl font-medium text-xs sm:text-sm transition-all ${
                isActive('/leaderboard')
                  ? 'bg-slate-900 text-white shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              <span>ผลคะแนน & จัดอันดับ</span>
            </Link>

            <Link
              href="/admin"
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl font-medium text-xs sm:text-sm transition-all ${
                isActive('/admin')
                  ? 'bg-amber-500 text-slate-950 font-bold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80 border border-slate-200/80'
              }`}
            >
              <Shield className="w-4 h-4" />
              <span>ผู้ดูแลระบบ</span>
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
}
