'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';

interface AdminUser {
  id: string;
  email: string;
  phone?: string;
  full_name?: string;
  role: 'admin' | 'vendor' | 'buyer' | string;
  vendor_id?: string | null;
  created_at: string;
  updated_at?: string;
  last_sign_in_at?: string | null;
  email_confirmed_at?: string | null;
  confirmed_at?: string | null;
  banned_until?: string | null;
}

const ROLE_LABELS: Record<string, string> = {
  admin: 'Админ',
  vendor: 'Вендор',
  buyer: 'Организатор',
  client: 'Клиент',
};

function formatDate(dateString?: string | null) {
  if (!dateString) return '—';

  const date = new Date(dateString);

  if (Number.isNaN(date.getTime())) return '—';

  return date.toLocaleDateString('ru-RU', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function getRoleBadgeClass(role: string) {
  if (role === 'admin') return 'bg-violet-50 text-violet-700 border-violet-100';
  if (role === 'vendor') return 'bg-blue-50 text-blue-700 border-blue-100';
  return 'bg-emerald-50 text-emerald-700 border-emerald-100';
}

function getStatus(user: AdminUser) {
  if (user.banned_until) return 'blocked';
  if (user.email_confirmed_at || user.confirmed_at) return 'active';
  return 'pending';
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const fetchUsers = async () => {
    setLoading(true);

    try {
      const response = await fetch('/api/admin/users', {
        cache: 'no-store',
      });

      if (!response.ok) {
        const error = await response.json().catch(() => null);
        alert(error?.error || 'Ошибка загрузки пользователей');
        return;
      }

      const data = await response.json();
      setUsers(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching users:', error);
      alert('Ошибка загрузки пользователей');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const filteredUsers = useMemo(() => {
    const query = searchText.toLowerCase().trim();

    return users.filter((user) => {
      const status = getStatus(user);

      if (query) {
        const matches =
          user.email?.toLowerCase().includes(query) ||
          user.full_name?.toLowerCase().includes(query) ||
          user.id?.toLowerCase().includes(query);

        if (!matches) return false;
      }

      if (roleFilter && user.role !== roleFilter) return false;
      if (statusFilter && status !== statusFilter) return false;

      return true;
    });
  }, [users, searchText, roleFilter, statusFilter]);

  const stats = useMemo(() => {
    return {
      total: users.length,
      admins: users.filter((user) => user.role === 'admin').length,
      vendors: users.filter((user) => user.role === 'vendor').length,
      buyers: users.filter((user) => user.role === 'buyer' || user.role === 'client').length,
      blocked: users.filter((user) => getStatus(user) === 'blocked').length,
      pending: users.filter((user) => getStatus(user) === 'pending').length,
    };
  }, [users]);

  const handleUpdateRole = async (user: AdminUser, nextRole: string) => {
    const confirmed = window.confirm(
      `Изменить роль пользователя ${user.email} на "${ROLE_LABELS[nextRole] || nextRole}"?`
    );

    if (!confirmed) return;

    try {
      const response = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'updateRole',
          userId: user.id,
          role: nextRole,
          vendor_id: user.vendor_id || null,
        }),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => null);
        alert(error?.error || 'Ошибка изменения роли');
        return;
      }

      await fetchUsers();
    } catch (error) {
      console.error('Error updating role:', error);
      alert('Ошибка изменения роли');
    }
  };

  const handleBanToggle = async (user: AdminUser) => {
    const isBlocked = getStatus(user) === 'blocked';

    const confirmed = window.confirm(
      isBlocked
        ? `Разблокировать пользователя ${user.email}?`
        : `Заблокировать пользователя ${user.email}?`
    );

    if (!confirmed) return;

    try {
      const response = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: isBlocked ? 'unbanUser' : 'banUser',
          userId: user.id,
        }),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => null);
        alert(error?.error || 'Ошибка изменения статуса');
        return;
      }

      await fetchUsers();
    } catch (error) {
      console.error('Error updating user status:', error);
      alert('Ошибка изменения статуса');
    }
  };

  const resetFilters = () => {
    setSearchText('');
    setRoleFilter('');
    setStatusFilter('');
  };

  const hasFilters = searchText || roleFilter || statusFilter;

  return (
    <main className="min-h-screen bg-[#F7F8FC] text-slate-950">
      <section className="relative overflow-hidden bg-[#070B18]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(109,61,255,0.35),transparent_30%),radial-gradient(circle_at_80%_10%,rgba(37,99,255,0.24),transparent_28%),radial-gradient(circle_at_70%_80%,rgba(0,194,255,0.14),transparent_32%)]" />
        <div className="absolute inset-0 opacity-40 [background-image:linear-gradient(rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.04)_1px,transparent_1px)] [background-size:64px_64px]" />

        <div className="relative z-10 mx-auto max-w-7xl px-6 py-10">
          

          <div className="grid gap-8 lg:grid-cols-[1fr_360px] lg:items-end">
            <div>
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-4 py-2 text-sm font-bold text-white/75 backdrop-blur">
                <span className="h-2 w-2 rounded-full bg-cyan-300" />
                Control Center
              </div>

              <h1 className="text-4xl font-black leading-tight tracking-tight text-white md:text-6xl">
                Пользователи
              </h1>

              <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-300">
                Реальные аккаунты из Supabase Auth: роли, статусы, последний вход и управление доступом.
              </p>
            </div>

            <div className="rounded-[1.5rem] border border-white/10 bg-white/10 p-5 backdrop-blur-xl">
              <div className="text-sm font-black text-white">Всего пользователей</div>
              <div className="mt-3 text-5xl font-black text-white">{stats.total}</div>
              <div className="mt-4 grid grid-cols-2 gap-3">
                <div className="rounded-2xl bg-white/10 p-3">
                  <div className="text-2xl font-black text-white">{stats.vendors}</div>
                  <div className="text-xs text-slate-400">вендоров</div>
                </div>
                <div className="rounded-2xl bg-white/10 p-3">
                  <div className="text-2xl font-black text-white">{stats.buyers}</div>
                  <div className="text-xs text-slate-400">организаторов</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-8">
        <div className="mb-6 grid gap-4 md:grid-cols-6">
          <div className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-sm">
            <div className="text-sm font-bold text-slate-500">Всего</div>
            <div className="mt-2 text-3xl font-black text-slate-950">{stats.total}</div>
          </div>

          <div className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-sm">
            <div className="text-sm font-bold text-slate-500">Админы</div>
            <div className="mt-2 text-3xl font-black text-violet-700">{stats.admins}</div>
          </div>

          <div className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-sm">
            <div className="text-sm font-bold text-slate-500">Вендоры</div>
            <div className="mt-2 text-3xl font-black text-blue-700">{stats.vendors}</div>
          </div>

          <div className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-sm">
            <div className="text-sm font-bold text-slate-500">Организаторы</div>
            <div className="mt-2 text-3xl font-black text-emerald-700">{stats.buyers}</div>
          </div>

          <div className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-sm">
            <div className="text-sm font-bold text-slate-500">Ожидают</div>
            <div className="mt-2 text-3xl font-black text-amber-600">{stats.pending}</div>
          </div>

          <div className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-sm">
            <div className="text-sm font-bold text-slate-500">Блок</div>
            <div className="mt-2 text-3xl font-black text-red-600">{stats.blocked}</div>
          </div>
        </div>

        <div className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-xl">
          <div className="border-b border-slate-100 p-5">
            <div className="grid gap-3 lg:grid-cols-[1fr_220px_220px_auto]">
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                  🔍
                </span>
                <input
                  type="text"
                  value={searchText}
                  onChange={(event) => setSearchText(event.target.value)}
                  placeholder="Поиск по email, имени или id..."
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-11 py-3 text-sm font-semibold outline-none transition focus:border-violet-300 focus:bg-white focus:ring-4 focus:ring-violet-500/10"
                />
              </div>

              <select
                value={roleFilter}
                onChange={(event) => setRoleFilter(event.target.value)}
                className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold outline-none transition focus:border-violet-300 focus:bg-white focus:ring-4 focus:ring-violet-500/10"
              >
                <option value="">Все роли</option>
                <option value="admin">Админ</option>
                <option value="vendor">Вендор</option>
                <option value="buyer">Организатор</option>
                <option value="client">Клиент</option>
              </select>

              <select
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value)}
                className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold outline-none transition focus:border-violet-300 focus:bg-white focus:ring-4 focus:ring-violet-500/10"
              >
                <option value="">Все статусы</option>
                <option value="active">Активные</option>
                <option value="pending">Не подтверждены</option>
                <option value="blocked">Заблокированы</option>
              </select>

              <div className="flex gap-2">
                {hasFilters && (
                  <button
                    type="button"
                    onClick={resetFilters}
                    className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-black text-slate-600 transition hover:bg-slate-50"
                  >
                    Сбросить
                  </button>
                )}

                <button
                  type="button"
                  onClick={fetchUsers}
                  className="rounded-2xl bg-violet-600 px-5 py-3 text-sm font-black text-white transition hover:bg-violet-700"
                >
                  Обновить
                </button>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            {loading ? (
              <div className="p-12 text-center">
                <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-slate-200 border-b-violet-600" />
                <p className="text-sm font-bold text-slate-500">Загрузка пользователей...</p>
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="p-16 text-center">
                <div className="mb-4 text-5xl">👥</div>
                <h3 className="text-xl font-black text-slate-950">Пользователи не найдены</h3>
                <p className="mt-2 text-sm font-semibold text-slate-500">
                  Измени фильтры или обнови список.
                </p>
              </div>
            ) : (
              <table className="w-full min-w-[1000px] text-left">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-5 py-4 text-xs font-black uppercase tracking-wide text-slate-400">
                      Пользователь
                    </th>
                    <th className="px-5 py-4 text-xs font-black uppercase tracking-wide text-slate-400">
                      Роль
                    </th>
                    <th className="px-5 py-4 text-xs font-black uppercase tracking-wide text-slate-400">
                      Статус
                    </th>
                    <th className="px-5 py-4 text-xs font-black uppercase tracking-wide text-slate-400">
                      Создан
                    </th>
                    <th className="px-5 py-4 text-xs font-black uppercase tracking-wide text-slate-400">
                      Последний вход
                    </th>
                    <th className="px-5 py-4 text-xs font-black uppercase tracking-wide text-slate-400">
                      Vendor ID
                    </th>
                    <th className="px-5 py-4 text-xs font-black uppercase tracking-wide text-slate-400">
                      Действия
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {filteredUsers.map((user) => {
                    const status = getStatus(user);
                    const isBlocked = status === 'blocked';

                    return (
                      <tr key={user.id} className="transition hover:bg-slate-50">
                        <td className="px-5 py-5">
                          <div className="flex items-center gap-3">
                            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-blue-500 text-sm font-black text-white">
                              {(user.full_name || user.email || '?').slice(0, 2).toUpperCase()}
                            </div>

                            <div className="min-w-0">
                              <div className="truncate text-sm font-black text-slate-950">
                                {user.full_name || 'Без имени'}
                              </div>
                              <div className="truncate text-sm font-semibold text-slate-500">
                                {user.email || 'Email не указан'}
                              </div>
                              <div className="mt-1 truncate font-mono text-[11px] text-slate-400">
                                {user.id}
                              </div>
                            </div>
                          </div>
                        </td>

                        <td className="px-5 py-5">
                          <select
                            value={user.role || 'buyer'}
                            onChange={(event) => handleUpdateRole(user, event.target.value)}
                            className={`rounded-xl border px-3 py-2 text-xs font-black outline-none ${getRoleBadgeClass(user.role || 'buyer')}`}
                          >
                            <option value="buyer">Организатор</option>
                            <option value="vendor">Вендор</option>
                            <option value="admin">Админ</option>
                          </select>
                        </td>

                        <td className="px-5 py-5">
                          <span
                            className={`rounded-full px-3 py-1.5 text-xs font-black ${
                              status === 'blocked'
                                ? 'bg-red-50 text-red-700'
                                : status === 'pending'
                                  ? 'bg-amber-50 text-amber-700'
                                  : 'bg-emerald-50 text-emerald-700'
                            }`}
                          >
                            {status === 'blocked'
                              ? 'Заблокирован'
                              : status === 'pending'
                                ? 'Не подтвержден'
                                : 'Активен'}
                          </span>
                        </td>

                        <td className="px-5 py-5 text-sm font-semibold text-slate-600">
                          {formatDate(user.created_at)}
                        </td>

                        <td className="px-5 py-5 text-sm font-semibold text-slate-600">
                          {formatDate(user.last_sign_in_at)}
                        </td>

                        <td className="px-5 py-5">
                          {user.vendor_id ? (
                            <code className="rounded-lg bg-slate-100 px-2 py-1 text-xs font-bold text-slate-600">
                              {user.vendor_id.slice(0, 8)}...
                            </code>
                          ) : (
                            <span className="text-sm font-semibold text-slate-400">—</span>
                          )}
                        </td>

                        <td className="px-5 py-5">
                          <div className="flex flex-wrap gap-2">
                            <button
                              type="button"
                              onClick={() => handleBanToggle(user)}
                              className={`rounded-xl px-3 py-2 text-xs font-black transition ${
                                isBlocked
                                  ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                                  : 'bg-red-50 text-red-700 hover:bg-red-100'
                              }`}
                            >
                              {isBlocked ? 'Разблокировать' : 'Заблокировать'}
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}