'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';

export function AdminShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isAdminHome = pathname === '/admin';

  return (
    <main className="min-h-screen bg-[#F7F8FC] text-slate-950">
      {!isAdminHome && (
        <div className="border-b border-slate-200 bg-white">
          <div className="mx-auto max-w-7xl px-6 py-4">
            <Link
              href="/admin"
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-black text-slate-700 shadow-sm transition hover:bg-slate-50"
            >
              ← В панель администратора
            </Link>
          </div>
        </div>
      )}

      {children}
    </main>
  );
}