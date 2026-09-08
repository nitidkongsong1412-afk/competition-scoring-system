import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function calculateMedal(
  score: number,
  goldMin: number = 80,
  silverMin: number = 70,
  bronzeMin: number = 60
): { medal: 'gold' | 'silver' | 'bronze' | 'participant'; label: string; color: string; badgeBg: string } {
  if (score >= goldMin) {
    return {
      medal: 'gold',
      label: 'ระดับเหรียญทอง',
      color: 'text-amber-700 border-amber-400 bg-amber-50',
      badgeBg: 'bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-900',
    };
  } else if (score >= silverMin) {
    return {
      medal: 'silver',
      label: 'ระดับเหรียญเงิน',
      color: 'text-slate-700 border-slate-300 bg-slate-50',
      badgeBg: 'bg-gradient-to-r from-slate-300 to-slate-400 text-slate-900',
    };
  } else if (score >= bronzeMin) {
    return {
      medal: 'bronze',
      label: 'ระดับเหรียญทองแดง',
      color: 'text-orange-800 border-orange-300 bg-orange-50',
      badgeBg: 'bg-gradient-to-r from-orange-400 to-amber-600 text-white',
    };
  } else {
    return {
      medal: 'participant',
      label: 'เกียรติบัตรเข้าร่วม',
      color: 'text-emerald-700 border-emerald-300 bg-emerald-50',
      badgeBg: 'bg-emerald-100 text-emerald-800',
    };
  }
}

export function formatScore(score: number): string {
  if (Number.isInteger(score)) {
    return score.toString();
  }
  return score.toFixed(2);
}

export function calculateSD(scores: number[]): number {
  if (!scores || scores.length <= 1) return 0;
  const validScores = scores.filter((s) => typeof s === 'number' && !isNaN(s));
  if (validScores.length <= 1) return 0;
  const mean = validScores.reduce((sum, val) => sum + val, 0) / validScores.length;
  // Sample standard deviation
  const variance =
    validScores.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) /
    (validScores.length - 1);
  return Number(Math.sqrt(variance).toFixed(2));
}
