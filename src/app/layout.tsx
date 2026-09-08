import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'ระบบลงคะแนนการประกวด - เท่อย่างเซียน',
  description: 'ระบบบันทึกและประมวลผลคะแนนการประกวดคลิปสร้างสรรค์ เท่อย่างเซียน',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="th">
      <body className="min-h-screen bg-slate-50 text-slate-900 antialiased flex flex-col font-sans">
        {children}
      </body>
    </html>
  );
}
