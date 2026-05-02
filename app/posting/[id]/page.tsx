'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { notFound, useRouter } from 'next/navigation';
import { MAIN_CATEGORIES } from '@/lib/categories';

interface JobPosting {
  id: string;
  title: string;
  description: string;
  category: string;
  subcategories: string[];
  event_city: string;
  event_date: string;
  guest_count: number;
  venue_name?: string;
  venue_type?: string;
  format: string;
  budget_min?: number;
  budget_max?: number;
  organizer_name?: string;
  organizer_email?: string;
  rider_file_url?: string;
  status: string;
  created_at: string;
}

function formatDate(dateString: string) {
  if (!dateString) return 'Дата не указана';

  const date = new Date(dateString);

  if (Number.isNaN(date.getTime())) {
    return 'Дата не указана';
  }

  return date.toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

function formatShortDate(dateString: string) {
  if (!dateString) return '—';

  const date = new Date(dateString);

  if (Number.isNaN(date.getTime())) {
    return '—';
  }

  return date.toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function formatBudget(min?: number, max?: number) {
  if (!min && !max) return 'Бюджет не указан';
  if (min && max) return `${min.toLocaleString('ru')} – ${max.toLocaleString('ru')} ₽`;
  if (min) return `от ${min.toLocaleString('ru')} ₽`;
  if (max) return `до ${max.toLocaleString('ru')} ₽`;
  return 'Бюджет не указан';
}

function formatEventFormat(format: string) {
  if (format === 'seated') return 'Сидячий формат';
  if (format === 'standing') return 'Стоячий формат';
  return 'Смешанный формат';
}

function getStatusLabel(status: string) {
  if (status === 'active') return 'Активна';
  if (status === 'open') return 'Открыта';
  if (status === 'closed') return 'Закрыта';
  if (status === 'archived') return 'Архив';
  return status || 'Не указан';
}

function getStatusClass(status: string) {
  if (status === 'active' || status === 'open') {
    return 'bg-emerald-50 text-emerald-700 border-emerald-100';
  }

  if (status === 'closed') {
    return 'bg-red-50 text-red-700 border-red-100';
  }

  if (status === 'archived') {
    return 'bg-slate-100 text-slate-600 border-slate-200';
  }

  return 'bg-slate-100 text-slate-600 border-slate-200';
}

function ArrowIcon() {
  return (
    <svg
      className="h-4 w-4"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M5 12H19M13 6L19 12L13 18"
        stroke="currentColor"
        strokeWidth="2.3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

interface StoredUser {
  email?: string;
  fullName?: string;
  name?: string;
  role?: 'buyer' | 'vendor' | 'admin';
  vendor_id?: string;
}

function ChatButton({ posting }: { posting: JobPosting }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleStartChat = async () => {
    setLoading(true);

    const rawUser = localStorage.getItem('user');
    const storedUser: StoredUser | null = rawUser ? JSON.parse(rawUser) : null;
    const vendorEmail = storedUser?.email || '';
    const vendorName = storedUser?.fullName || storedUser?.name || '';
    const vendorId = storedUser?.vendor_id || '';
    const clientName = posting.organizer_name || '';
    const clientEmail = posting.organizer_email || '';

    if (!vendorEmail || !vendorName) {
      alert('Для ответа на заявку нужно войти как вендор.');
      setLoading(false);
      return;
    }

    if (storedUser?.role !== 'vendor') {
      alert('Отклик на заявку доступен только вендорам.');
      setLoading(false);
      return;
    }

    if (!clientName || !clientEmail || !clientEmail.includes('@')) {
      alert('У заявки не заполнены контакты организатора. Пересоздайте заявку после входа под клиентом.');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/conversations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'createConversation',
          postingId: posting.id,
          vendorId,
          vendorEmail,
          clientEmail,
          clientName,
        }),
      });

      if (response.ok) {
        const conversation = await response.json();

        localStorage.setItem('chat_user_email', vendorEmail);
        localStorage.setItem('chat_user_name', vendorName);
        localStorage.setItem('chat_user_type', 'vendor');

        router.push(`/chat/${conversation.id}`);
      } else {
        const error = await response.json();
        alert(`Ошибка: ${error.error}`);
      }
    } catch (error) {
      console.error('Error creating conversation:', error);
      alert('Ошибка при создании чата');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="overflow-hidden rounded-[1.5rem] border border-violet-100 bg-white shadow-sm">
      <div className="bg-gradient-to-r from-violet-600 via-indigo-600 to-blue-600 p-5 text-white">
        <div className="inline-flex rounded-full bg-white/15 px-3 py-1 text-xs font-black text-white/90">
          Отклик на заявку
        </div>

        <h3 className="mt-4 text-2xl font-black">Заинтересованы?</h3>

        <p className="mt-2 text-sm font-semibold leading-6 text-violet-100">
          Начните разговор с организатором, уточните детали, сроки и условия.
        </p>
      </div>

      <div className="p-5">
        <button
          onClick={handleStartChat}
          disabled={loading}
          className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-slate-950 px-5 py-3 text-sm font-black text-white shadow-lg shadow-slate-950/10 transition hover:-translate-y-0.5 hover:bg-violet-600 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? 'Создаём чат...' : 'Начать чат'}
          {!loading && <ArrowIcon />}
        </button>

        <p className="mt-3 text-center text-xs font-semibold text-slate-400">
          Данные сохранятся для следующих сообщений.
        </p>
      </div>
    </div>
  );
}

function InfoCard({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon: string;
}) {
  return (
    <div className="rounded-[1.25rem] border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-violet-50 text-2xl">
          {icon}
        </div>

        <div className="min-w-0">
          <div className="text-xs font-black uppercase tracking-wide text-slate-400">
            {label}
          </div>

          <div className="mt-1 text-base font-black text-slate-950">
            {value}
          </div>
        </div>
      </div>
    </div>
  );
}

function SidebarInfoItem({
  icon,
  label,
  value,
}: {
  icon: string;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-3 rounded-2xl bg-slate-50 p-4">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-xl shadow-sm">
        {icon}
      </div>

      <div className="min-w-0">
        <p className="text-xs font-black uppercase tracking-wide text-slate-400">
          {label}
        </p>
        <p className="mt-1 break-words text-sm font-black text-slate-950">
          {value}
        </p>
      </div>
    </div>
  );
}

export default function PostingDetailsPage({ params }: { params: { id: string } }) {
  const [posting, setPosting] = useState<JobPosting | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPosting = async () => {
      try {
        const response = await fetch(`/api/job-postings?id=${params.id}`);

        if (response.ok) {
          const data = await response.json();
          const found = Array.isArray(data)
            ? data.find((item) => item.id === params.id)
            : data;

          if (found) {
            setPosting(found);
          } else {
            notFound();
          }
        } else {
          notFound();
        }
      } catch (error) {
        console.error('Error fetching posting:', error);
        notFound();
      } finally {
        setLoading(false);
      }
    };

    fetchPosting();
  }, [params.id]);

  if (loading) {
    return (
      <main className="min-h-screen bg-[#F7F8FC]">
        <div className="mx-auto flex min-h-screen max-w-7xl items-center justify-center px-6">
          <div className="text-center">
            <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-slate-200 border-b-violet-600" />
            <p className="mt-4 text-sm font-bold text-slate-500">
              Загрузка заявки...
            </p>
          </div>
        </div>
      </main>
    );
  }

  if (!posting) {
    notFound();
  }

  const categoryData = MAIN_CATEGORIES.find((category) => category.id === posting.category);
  const categoryIcon = categoryData?.icon || '🎯';
  const categoryName = categoryData?.name_ru || posting.category;

  return (
    <main className="min-h-screen bg-[#F7F8FC] text-slate-950">
      <section className="relative overflow-hidden bg-[#070B18]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(109,61,255,0.35),transparent_30%),radial-gradient(circle_at_80%_10%,rgba(37,99,255,0.24),transparent_28%),radial-gradient(circle_at_70%_80%,rgba(0,194,255,0.14),transparent_32%)]" />
        <div className="absolute inset-0 opacity-40 [background-image:linear-gradient(rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.04)_1px,transparent_1px)] [background-size:64px_64px]" />

        <div className="relative z-10 mx-auto max-w-7xl px-6 py-10 lg:py-14">
          <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
            <Link
              href="/marketplace"
              className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/10 px-4 py-2.5 text-sm font-black text-white/80 backdrop-blur transition hover:bg-white/15 hover:text-white"
            >
              ← Назад к маркетплейсу
            </Link>

            <span
              className={`rounded-full border px-4 py-2 text-sm font-black ${getStatusClass(
                posting.status
              )}`}
            >
              {getStatusLabel(posting.status)}
            </span>
          </div>

          <div className="grid gap-8 lg:grid-cols-[1fr_380px] lg:items-end">
            <div>
              <div className="mb-5 flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-white/10 px-3 py-1.5 text-xs font-black text-white/70">
                  {categoryIcon} {categoryName}
                </span>

                {posting.rider_file_url && (
                  <span className="rounded-full bg-blue-400/15 px-3 py-1.5 text-xs font-black text-blue-200">
                    Есть документы
                  </span>
                )}
              </div>

              <h1 className="max-w-4xl text-4xl font-black leading-tight tracking-tight text-white md:text-6xl">
                {posting.title}
              </h1>

              <p className="mt-5 max-w-3xl text-lg leading-8 text-slate-300">
                {posting.description?.slice(0, 240)}
                {posting.description?.length > 240 ? '...' : ''}
              </p>
            </div>

            <div className="rounded-[1.5rem] border border-white/10 bg-white/10 p-5 backdrop-blur-xl">
              <div className="text-sm font-black text-white">Кратко по заявке</div>

              <div className="mt-5 grid grid-cols-2 gap-3">
                <div className="rounded-2xl bg-white/10 p-4">
                  <div className="text-xs font-bold text-slate-400">Дата</div>
                  <div className="mt-1 text-lg font-black text-white">
                    {formatShortDate(posting.event_date)}
                  </div>
                </div>

                <div className="rounded-2xl bg-white/10 p-4">
                  <div className="text-xs font-bold text-slate-400">Город</div>
                  <div className="mt-1 truncate text-lg font-black text-white">
                    {posting.event_city || '—'}
                  </div>
                </div>

                <div className="rounded-2xl bg-white/10 p-4">
                  <div className="text-xs font-bold text-slate-400">Гостей</div>
                  <div className="mt-1 text-lg font-black text-white">
                    {posting.guest_count?.toLocaleString('ru') || '—'}
                  </div>
                </div>

                <div className="rounded-2xl bg-white/10 p-4">
                  <div className="text-xs font-bold text-slate-400">Формат</div>
                  <div className="mt-1 truncate text-lg font-black text-white">
                    {formatEventFormat(posting.format)}
                  </div>
                </div>
              </div>

              <div className="mt-4 rounded-2xl bg-white p-4">
                <div className="text-xs font-black uppercase tracking-wide text-slate-400">
                  Бюджет
                </div>
                <div className="mt-1 text-xl font-black text-slate-950">
                  {formatBudget(posting.budget_min, posting.budget_max)}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-6 px-6 py-8 lg:grid-cols-[1fr_360px]">
        <div className="space-y-6">
          <div className="rounded-[1.5rem] border border-slate-200 bg-white p-6 shadow-sm lg:p-8">
            <div className="mb-5 flex items-start gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-violet-50 text-3xl">
                📝
              </div>

              <div>
                <h2 className="text-2xl font-black text-slate-950">
                  Описание заявки
                </h2>
                <p className="mt-1 text-sm font-semibold text-slate-500">
                  Основные требования и контекст события.
                </p>
              </div>
            </div>

            <div className="rounded-[1.25rem] bg-slate-50 p-5">
              <p className="whitespace-pre-wrap text-sm font-medium leading-7 text-slate-700">
                {posting.description || 'Описание не указано.'}
              </p>
            </div>
          </div>

          <div className="rounded-[1.5rem] border border-slate-200 bg-white p-6 shadow-sm lg:p-8">
            <div className="mb-6 flex items-start gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-violet-50 text-3xl">
                📅
              </div>

              <div>
                <h2 className="text-2xl font-black text-slate-950">
                  Детали события
                </h2>
                <p className="mt-1 text-sm font-semibold text-slate-500">
                  Дата, город, формат и площадка.
                </p>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <InfoCard
                icon="📅"
                label="Дата события"
                value={formatDate(posting.event_date)}
              />

              <InfoCard
                icon="📍"
                label="Город"
                value={posting.event_city || 'Не указан'}
              />

              <InfoCard
                icon="👥"
                label="Ожидаемая аудитория"
                value={posting.guest_count?.toLocaleString('ru') || 'Не указана'}
              />

              <InfoCard
                icon="📊"
                label="Формат"
                value={formatEventFormat(posting.format)}
              />

              {posting.venue_name && (
                <InfoCard
                  icon="🏛️"
                  label="Площадка"
                  value={posting.venue_name}
                />
              )}

              {posting.venue_type && (
                <InfoCard
                  icon="🎪"
                  label="Тип площадки"
                  value={posting.venue_type}
                />
              )}
            </div>
          </div>

          {posting.subcategories && posting.subcategories.length > 0 && (
            <div className="rounded-[1.5rem] border border-slate-200 bg-white p-6 shadow-sm lg:p-8">
              <div className="mb-5 flex items-start gap-4">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-violet-50 text-3xl">
                  🧩
                </div>

                <div>
                  <h2 className="text-2xl font-black text-slate-950">
                    Специализация
                  </h2>
                  <p className="mt-1 text-sm font-semibold text-slate-500">
                    Подкатегории и направления, которые нужны организатору.
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                {posting.subcategories.map((subcategory) => (
                  <span
                    key={subcategory}
                    className="rounded-full border border-violet-100 bg-violet-50 px-4 py-2 text-sm font-black text-violet-700"
                  >
                    {subcategory}
                  </span>
                ))}
              </div>
            </div>
          )}

          {posting.rider_file_url && (
            <div className="rounded-[1.5rem] border border-slate-200 bg-white p-6 shadow-sm lg:p-8">
              <div className="mb-5 flex items-start gap-4">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-3xl">
                  📎
                </div>

                <div>
                  <h2 className="text-2xl font-black text-slate-950">
                    Вложения
                  </h2>
                  <p className="mt-1 text-sm font-semibold text-slate-500">
                    Райдер, техническое задание или другие документы.
                  </p>
                </div>
              </div>

              <div className="flex flex-col gap-4 rounded-[1.5rem] border border-blue-100 bg-blue-50 p-5 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white text-3xl shadow-sm">
                    📄
                  </div>

                  <div>
                    <p className="font-black text-slate-950">
                      Документы заявки
                    </p>
                    <p className="mt-1 text-sm font-semibold text-slate-500">
                      Файл от организатора
                    </p>
                  </div>
                </div>

                <a
                  href={posting.rider_file_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  download
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-black text-white transition hover:bg-blue-700"
                >
                  Скачать
                  <ArrowIcon />
                </a>
              </div>
            </div>
          )}
        </div>

        <aside className="space-y-6 lg:sticky lg:top-24 lg:self-start">
          <div className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-sm">
            <div className="text-xs font-black uppercase tracking-wide text-slate-400">
              Бюджет
            </div>

            <div className="mt-2 text-2xl font-black text-slate-950">
              {formatBudget(posting.budget_min, posting.budget_max)}
            </div>

            <p className="mt-2 text-sm font-semibold leading-6 text-slate-500">
              Ориентировочный диапазон, указанный организатором.
            </p>
          </div>

          <div className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-sm">
            <h3 className="mb-4 text-lg font-black text-slate-950">
              Информация
            </h3>

            <div className="space-y-3">
              <SidebarInfoItem
                icon="📊"
                label="Статус"
                value={getStatusLabel(posting.status)}
              />

              <SidebarInfoItem
                icon={categoryIcon}
                label="Категория"
                value={categoryName}
              />

              <SidebarInfoItem
                icon="📅"
                label="Опубликовано"
                value={formatDate(posting.created_at)}
              />

              <SidebarInfoItem
                icon="🆔"
                label="ID заявки"
                value={`${posting.id.slice(0, 8)}...`}
              />

              {posting.rider_file_url && (
                <SidebarInfoItem
                  icon="📎"
                  label="Документы"
                  value="Есть вложения"
                />
              )}
            </div>
          </div>

          <ChatButton posting={posting} />

          <Link href="/marketplace" className="block">
            <button className="w-full rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-black text-slate-700 shadow-sm transition hover:bg-slate-50 hover:text-violet-700">
              ← Другие заявки
            </button>
          </Link>

          <div className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-sm">
            <h3 className="text-sm font-black text-slate-950">
              Поделиться заявкой
            </h3>

            <p className="mt-2 text-sm font-semibold leading-6 text-slate-500">
              Можно отправить ссылку на эту заявку другим участникам команды.
            </p>

            <div className="mt-4 rounded-xl bg-slate-50 p-3">
              <div className="text-xs font-black uppercase tracking-wide text-slate-400">
                ID
              </div>
              <code className="mt-1 block truncate text-sm font-black text-violet-700">
                {posting.id}
              </code>
            </div>
          </div>
        </aside>
      </section>
    </main>
  );
}