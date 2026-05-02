'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

interface AdminStats {
  users: number;
  vendors: number;
  pendingVendors: number;
  requests: number;
  activeRequests: number;
}

const ADMIN_CARDS = [
  {
    href: '/admin/vendors',
    icon: '🎤',
    title: 'Вендоры',
    desc: 'Профили компаний, площадок и сервис-провайдеров',
    color: 'from-violet-600 to-blue-600',
  },
  {
    href: '/admin/requests',
    icon: '📋',
    title: 'Заявки',
    desc: 'Модерация, пауза, закрытие и контроль заявок',
    color: 'from-blue-600 to-cyan-600',
  },
  {
    href: '/admin/users',
    icon: '👥',
    title: 'Пользователи',
    desc: 'Аккаунты, роли, блокировки и доступы',
    color: 'from-emerald-600 to-teal-600',
  },
  {
    href: '/admin/analytics',
    icon: '📊',
    title: 'Аналитика',
    desc: 'Статистика заявок, пользователей и конверсий',
    color: 'from-orange-500 to-amber-500',
  },
  {
    href: '/admin/import-vendors',
    icon: '📥',
    title: 'Импорт',
    desc: 'Загрузка и обновление базы через Excel / CSV',
    color: 'from-pink-600 to-rose-600',
  },
  {
    href: '/marketplace',
    icon: '🎭',
    title: 'Маркетплейс',
    desc: 'Публичная часть с заявками и поиском',
    color: 'from-slate-800 to-slate-950',
  },
];

export default function AdminPage() {
  const [stats, setStats] = useState<AdminStats>({
    users: 0,
    vendors: 0,
    pendingVendors: 0,
    requests: 0,
    activeRequests: 0,
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const [vendorsRes, requestsRes, usersRes] = await Promise.allSettled([
          fetch('/api/admin/vendors'),
          fetch('/api/job-postings'),
          fetch('/api/admin/users'),
        ]);

        let vendors: any[] = [];
        let requests: any[] = [];
        let users: any[] = [];

        if (vendorsRes.status === 'fulfilled' && vendorsRes.value.ok) {
          const data = await vendorsRes.value.json();
          vendors = Array.isArray(data) ? data : [];
        }

        if (requestsRes.status === 'fulfilled' && requestsRes.value.ok) {
          const data = await requestsRes.value.json();
          requests = Array.isArray(data) ? data : [];
        }

        if (usersRes.status === 'fulfilled' && usersRes.value.ok) {
          const data = await usersRes.value.json();
          users = Array.isArray(data) ? data : [];
        }

        setStats({
          users: users.length,
          vendors: vendors.length,
          pendingVendors: vendors.filter(
            (vendor) =>
              vendor.status === 'pending' ||
              vendor.status === 'review' ||
              vendor.claim_status === 'invited'
          ).length,
          requests: requests.length,
          activeRequests: requests.filter(
            (request) => request.status === 'active' || request.status === 'open'
          ).length,
        });
      } catch (error) {
        console.error('Admin stats error:', error);
      } finally {
        setLoading(false);
      }
    };

    loadStats();
  }, []);

  return (
    <section className="mx-auto max-w-7xl px-6 py-8">
      <div className="mb-6 grid gap-4 md:grid-cols-5">
        <div className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-sm">
          <div className="text-sm font-bold text-slate-500">Пользователи</div>
          <div className="mt-2 text-3xl font-black text-slate-950">
            {loading ? '—' : stats.users}
          </div>
        </div>

        <div className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-sm">
          <div className="text-sm font-bold text-slate-500">Вендоры</div>
          <div className="mt-2 text-3xl font-black text-violet-700">
            {loading ? '—' : stats.vendors}
          </div>
        </div>

        <div className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-sm">
          <div className="text-sm font-bold text-slate-500">На проверке</div>
          <div className="mt-2 text-3xl font-black text-amber-600">
            {loading ? '—' : stats.pendingVendors}
          </div>
        </div>

        <div className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-sm">
          <div className="text-sm font-bold text-slate-500">Заявки</div>
          <div className="mt-2 text-3xl font-black text-blue-700">
            {loading ? '—' : stats.requests}
          </div>
        </div>

        <div className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-sm">
          <div className="text-sm font-bold text-slate-500">Активные</div>
          <div className="mt-2 text-3xl font-black text-emerald-700">
            {loading ? '—' : stats.activeRequests}
          </div>
        </div>
      </div>

      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {ADMIN_CARDS.map((card) => (
          <Link
            key={card.href}
            href={card.href}
            className="group overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl hover:shadow-slate-950/10"
          >
            <div className={`h-2 bg-gradient-to-r ${card.color}`} />

            <div className="p-6">
              <div className="flex items-start justify-between gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-3xl transition group-hover:scale-105">
                  {card.icon}
                </div>

                <span className="text-xl font-black text-slate-300 transition group-hover:translate-x-1 group-hover:text-violet-500">
                  →
                </span>
              </div>

              <h2 className="mt-5 text-xl font-black text-slate-950">
                {card.title}
              </h2>

              <p className="mt-2 text-sm font-semibold leading-6 text-slate-500">
                {card.desc}
              </p>
            </div>
          </Link>
        ))}
      </div>

      <div className="mt-8 rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-black text-slate-950">
          Что важно дальше
        </h2>

        <div className="mt-5 grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl bg-slate-50 p-5">
            <div className="text-2xl">🔐</div>
            <h3 className="mt-3 font-black text-slate-950">Auth</h3>
            <p className="mt-2 text-sm font-semibold leading-6 text-slate-500">
              Перевести login/register на Supabase Auth, чтобы пользователи были настоящими.
            </p>
          </div>

          <div className="rounded-2xl bg-slate-50 p-5">
            <div className="text-2xl">🎤</div>
            <h3 className="mt-3 font-black text-slate-950">Vendor Claim</h3>
            <p className="mt-2 text-sm font-semibold leading-6 text-slate-500">
              Добавить invite link, чтобы вендор мог забрать созданный админом профиль.
            </p>
          </div>

          <div className="rounded-2xl bg-slate-50 p-5">
            <div className="text-2xl">🚫</div>
            <h3 className="mt-3 font-black text-slate-950">Moderation</h3>
            <p className="mt-2 text-sm font-semibold leading-6 text-slate-500">
              Жалобы, blacklist, блокировки и проверка отзывов.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}