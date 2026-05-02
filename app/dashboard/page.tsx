'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface UserData {
  id: string;
  name: string;
  email: string;
  role: 'buyer' | 'vendor' | 'admin';
}

interface Stats {
  totalVendors?: number;
  activeVendors?: number;
  totalPostings?: number;
  activePostings?: number;
  totalUsers?: number;
  pendingVendors?: number;
}

function StatCard({ icon, value, label, color = 'violet' }: {
  icon: string; value: string | number; label: string; color?: 'violet' | 'emerald' | 'blue' | 'amber' | 'red';
}) {
  const bg = { violet: 'bg-violet-50 border-violet-100', emerald: 'bg-emerald-50 border-emerald-100', blue: 'bg-blue-50 border-blue-100', amber: 'bg-amber-50 border-amber-100', red: 'bg-red-50 border-red-100' };
  const text = { violet: 'text-violet-700', emerald: 'text-emerald-700', blue: 'text-blue-700', amber: 'text-amber-700', red: 'text-red-700' };
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-start gap-4">
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center text-xl border ${bg[color]}`}>{icon}</div>
      <div>
        <div className={`text-2xl font-black ${text[color]}`}>{value}</div>
        <div className="text-xs text-gray-500 mt-0.5">{label}</div>
      </div>
    </div>
  );
}

function ActionCard({ href, icon, title, desc, primary = false }: {
  href: string; icon: string; title: string; desc: string; primary?: boolean;
}) {
  return (
    <Link href={href}>
      <div className={`group rounded-2xl border p-5 cursor-pointer transition-all duration-200 hover:shadow-lg h-full ${primary ? 'bg-violet-600 border-violet-500 hover:bg-violet-700' : 'bg-white border-gray-100 hover:border-violet-200'}`}>
        <div className="text-2xl mb-2 group-hover:scale-110 transition-transform duration-200 inline-block">{icon}</div>
        <h3 className={`font-bold text-sm mb-1 ${primary ? 'text-white' : 'text-gray-900'}`}>{title}</h3>
        <p className={`text-xs leading-relaxed ${primary ? 'text-violet-200' : 'text-gray-500'}`}>{desc}</p>
      </div>
    </Link>
  );
}

function BuyerDashboard({ user }: { user: UserData }) {
  const [postings, setPostings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/job-postings').then(r => r.json()).then(data => {
      setPostings(Array.isArray(data) ? data.slice(0, 5) : []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-6 py-10">
        <div className="mb-8 flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-violet-100 flex items-center justify-center text-2xl">👤</div>
          <div>
            <h1 className="text-2xl font-black text-gray-900">Добро пожаловать{user.name ? `, ${user.name}` : ''}!</h1>
            <p className="text-gray-500 text-sm">{user.email}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <StatCard icon="📋" value={postings.length} label="Заявок на площадке" color="violet" />
          <StatCard icon="✅" value={postings.filter(p => p.status === 'active').length} label="Активных" color="emerald" />
          <StatCard icon="💬" value="0" label="Новых сообщений" color="blue" />
          <StatCard icon="⭐" value="—" label="Средний рейтинг" color="amber" />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <ActionCard href="/create-request" icon="➕" title="Создать заявку" desc="Разместить запрос для вендоров" primary />
          <ActionCard href="/marketplace" icon="🎭" title="Маркетплейс" desc="Все открытые заявки" />
          <ActionCard href="/search" icon="🔍" title="Найти вендора" desc="Поиск по базе исполнителей" />
          <ActionCard href="/messages" icon="💬" title="Сообщения" desc="Переписка с вендорами" />
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between p-6 border-b border-gray-50">
            <h2 className="font-bold text-gray-900">📋 Последние заявки на маркетплейсе</h2>
            <Link href="/marketplace" className="text-violet-600 hover:text-violet-700 text-sm font-semibold">Все →</Link>
          </div>
          {loading ? (
            <div className="p-6 space-y-3">{[1,2,3].map(i => <div key={i} className="h-14 bg-gray-50 rounded-xl animate-pulse" />)}</div>
          ) : postings.length === 0 ? (
            <div className="p-12 text-center">
              <div className="text-4xl mb-3">📭</div>
              <p className="text-gray-500 text-sm mb-4">Заявок пока нет</p>
              <Link href="/create-request"><button className="px-4 py-2 bg-violet-600 text-white rounded-xl text-sm font-semibold hover:bg-violet-700">Создать первую</button></Link>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {postings.map((p) => (
                <Link key={p.id} href={`/posting/${p.id}`}>
                  <div className="flex items-center justify-between px-6 py-4 hover:bg-gray-50 cursor-pointer group">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-9 h-9 rounded-xl bg-violet-50 flex items-center justify-center text-lg flex-shrink-0">🎭</div>
                      <div className="min-w-0">
                        <p className="font-semibold text-gray-900 text-sm truncate group-hover:text-violet-700">{p.title}</p>
                        <p className="text-xs text-gray-400">📍 {p.event_city} · 📅 {new Date(p.event_date).toLocaleDateString('ru-RU')}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0 ml-4">
                      <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${p.status === 'active' ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-100 text-gray-600'}`}>
                        {p.status === 'active' ? '✓ Активна' : p.status}
                      </span>
                      <span className="text-gray-300 group-hover:text-violet-500 transition-colors">→</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function VendorDashboard({ user }: { user: UserData }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-6 py-10">
        <div className="mb-8 flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-blue-100 flex items-center justify-center text-2xl">🏢</div>
          <div>
            <h1 className="text-2xl font-black text-gray-900">Кабинет вендора</h1>
            <p className="text-gray-500 text-sm">{user.email}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <StatCard icon="📤" value="0" label="Предложений" color="blue" />
          <StatCard icon="✅" value="0" label="Принято" color="emerald" />
          <StatCard icon="⭐" value="—" label="Рейтинг" color="amber" />
          <StatCard icon="💬" value="0" label="Сообщений" color="violet" />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
          <ActionCard href="/marketplace" icon="📋" title="Смотреть заявки" desc="Открытые запросы от организаторов" primary />
          <ActionCard href="/search" icon="👤" title="Мой профиль" desc="Редактировать публичный профиль" />
          <ActionCard href="/messages" icon="💬" title="Сообщения" desc="Переписка с организаторами" />
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h2 className="font-bold text-gray-900 mb-4">🏢 Профиль вендора</h2>
          <div className="grid grid-cols-2 gap-6 mb-4">
            <div><p className="text-xs text-gray-500 mb-1">Имя / Компания</p><p className="font-semibold text-gray-900">{user.name || '—'}</p></div>
            <div><p className="text-xs text-gray-500 mb-1">Email</p><p className="font-semibold text-gray-900">{user.email}</p></div>
          </div>
          <div className="pt-4 border-t border-gray-50">
            <p className="text-xs text-gray-400 mb-2">Заполни профиль чтобы появиться в поиске</p>
            <div className="w-full bg-gray-100 rounded-full h-1.5">
              <div className="bg-violet-500 h-1.5 rounded-full w-1/5" />
            </div>
            <p className="text-xs text-gray-400 mt-1">20% заполнено</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function AdminDashboard({ user }: { user: UserData }) {
  const [stats, setStats] = useState<Stats>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch('/api/admin/vendors').then(r => r.json()).catch(() => []),
      fetch('/api/job-postings').then(r => r.json()).catch(() => []),
      fetch('/api/admin/users').then(r => r.json()).catch(() => []),
    ]).then(([vendors, postings, users]) => {
      const v = Array.isArray(vendors) ? vendors : [];
      const p = Array.isArray(postings) ? postings : [];
      const u = Array.isArray(users) ? users : [];
      setStats({
        totalVendors: v.length,
        activeVendors: v.filter((x: any) => x.status === 'active').length,
        pendingVendors: v.filter((x: any) => x.status === 'pending').length,
        totalPostings: p.length,
        activePostings: p.filter((x: any) => x.status === 'active').length,
        totalUsers: u.length,
      });
      setLoading(false);
    });
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-6 py-10">

        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-500 to-blue-500 flex items-center justify-center text-2xl">⚙️</div>
            <div>
              <h1 className="text-2xl font-black text-gray-900">Панель администратора</h1>
              <p className="text-gray-500 text-sm">{user.email}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 border border-emerald-100 rounded-xl">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
            <span className="text-xs font-semibold text-emerald-700">Система работает</span>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          {loading ? (
            Array.from({ length: 6 }).map((_, i) => <div key={i} className="bg-white rounded-2xl border border-gray-100 h-24 animate-pulse" />)
          ) : (
            <>
              <StatCard icon="🏢" value={stats.totalVendors ?? '—'} label="Всего вендоров" color="violet" />
              <StatCard icon="✅" value={stats.activeVendors ?? '—'} label="Активных" color="emerald" />
              <StatCard icon="⏳" value={stats.pendingVendors ?? '—'} label="На проверке" color="amber" />
              <StatCard icon="📋" value={stats.totalPostings ?? '—'} label="Заявок" color="blue" />
              <StatCard icon="🔥" value={stats.activePostings ?? '—'} label="Активных заявок" color="emerald" />
              <StatCard icon="👥" value={stats.totalUsers ?? '—'} label="Пользователей" color="violet" />
            </>
          )}
        </div>

        {/* Nav */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
          <ActionCard href="/admin/vendors" icon="🏢" title="Вендоры" desc="Управление базой вендоров" primary />
          <ActionCard href="/admin/requests" icon="📋" title="Заявки" desc="Все запросы на платформе" />
          <ActionCard href="/admin/users" icon="👥" title="Пользователи" desc="Управление аккаунтами" />
          <ActionCard href="/admin/analytics" icon="📊" title="Аналитика" desc="Статистика и отчёты" />
          <ActionCard href="/admin/import-vendors" icon="📥" title="Импорт вендоров" desc="Загрузить из Excel" />
          <ActionCard href="/marketplace" icon="🎭" title="Маркетплейс" desc="Публичная страница заявок" />
        </div>

        {/* Pending alert */}
        {!loading && (stats.pendingVendors ?? 0) > 0 && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-2xl">⏳</span>
              <div>
                <p className="font-bold text-amber-800">{stats.pendingVendors} вендор{(stats.pendingVendors ?? 0) > 1 ? 'а' : ''} ожидают проверки</p>
                <p className="text-xs text-amber-600">Требуется модерация перед публикацией</p>
              </div>
            </div>
            <Link href="/admin/vendors">
              <button className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white text-sm font-bold rounded-xl transition-colors">Проверить →</button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    const token = localStorage.getItem('authToken');
    if (!userStr || !token) { router.push('/auth/login'); return; }
    try { setUser(JSON.parse(userStr)); } catch { router.push('/auth/login'); }
    setLoading(false);
  }, []);

  if (loading) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-violet-200 border-t-violet-600 rounded-full animate-spin mx-auto mb-4" />
        <p className="text-gray-500 text-sm">Загрузка кабинета...</p>
      </div>
    </div>
  );

  if (!user) return null;
  if (user.role === 'buyer') return <BuyerDashboard user={user} />;
  if (user.role === 'vendor') return <VendorDashboard user={user} />;
  if (user.role === 'admin') return <AdminDashboard user={user} />;

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <p className="text-gray-600 mb-4">Неизвестная роль пользователя</p>
        <button onClick={() => router.push('/')} className="px-4 py-2 bg-violet-600 text-white rounded-xl text-sm font-semibold">На главную</button>
      </div>
    </div>
  );
}
