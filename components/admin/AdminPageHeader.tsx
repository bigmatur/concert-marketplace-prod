'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const ADMIN_LINKS = [
  { href: '/admin/vendors', label: 'Вендоры', icon: '🏢' },
  { href: '/admin/requests', label: 'Заявки', icon: '📋' },
  { href: '/admin/users', label: 'Пользователи', icon: '👥' },
  { href: '/admin/analytics', label: 'Аналитика', icon: '📊' },
  { href: '/admin/import', label: 'Импорт', icon: '📥' },
  { href: '/marketplace', label: 'Маркетплейс', icon: '🎭' },
];

interface AdminPageHeaderProps {
  title: string;
  subtitle?: string;
  icon?: string;
  action?: React.ReactNode;
}

export function AdminPageHeader({
  title,
  subtitle,
  icon = '⚙️',
  action,
}: AdminPageHeaderProps) {
  const pathname = usePathname();

  return (
    <div className="bg-white border-b border-slate-200">
      <div className="mx-auto max-w-7xl px-6 py-5">
        <div className="mb-5 flex items-center justify-between gap-4">
          <Link
            href="/admin"
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-black text-slate-700 transition hover:bg-slate-50"
          >
            ← В панель администратора
          </Link>

          {action && <div>{action}</div>}
        </div>

        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="text-3xl font-black tracking-tight text-slate-950">
              {icon} {title}
            </h1>

            {subtitle && (
              <p className="mt-2 text-sm font-semibold text-slate-500">
                {subtitle}
              </p>
            )}
          </div>

          <div className="flex flex-wrap gap-2">
            {ADMIN_LINKS.map((link) => {
              const active = pathname === link.href;

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`rounded-xl px-3.5 py-2 text-sm font-black transition ${
                    active
                      ? 'bg-slate-950 text-white shadow-lg shadow-slate-950/15'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {link.icon} {link.label}
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}