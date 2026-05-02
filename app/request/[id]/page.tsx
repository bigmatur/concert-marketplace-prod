'use client';

import { useState } from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { requestsData, CATEGORIES } from '@/lib/mock-data';

type Tab = 'details' | 'proposals' | 'messages';

function formatMoney(value: number) {
  return value.toLocaleString('ru') + ' ₽';
}

function getStatusLabel(status: string) {
  if (status === 'published') return 'Открыта';
  if (status === 'review') return 'На рассмотрении';
  if (status === 'closed') return 'Закрыта';
  return status || 'Не указан';
}

function getStatusClass(status: string) {
  if (status === 'published') {
    return 'border-emerald-100 bg-emerald-50 text-emerald-700';
  }

  if (status === 'closed') {
    return 'border-red-100 bg-red-50 text-red-700';
  }

  return 'border-blue-100 bg-blue-50 text-blue-700';
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

function InfoCard({
  icon,
  label,
  value,
}: {
  icon: string;
  label: string;
  value: string;
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

export default function RequestDetailPage({ params }: { params: { id: string } }) {
  const request = requestsData.find((item) => item.id === params.id);
  const [activeTab, setActiveTab] = useState<Tab>('details');

  if (!request) {
    notFound();
  }

  const category = CATEGORIES.find((item) => item.id === request.category);

  const proposals = [
    {
      id: 1,
      vendorName: 'Pro Sound Moscow',
      vendorRating: 4.8,
      price: 750000,
      description: 'Профессиональное звуковое оборудование и опытная команда',
      status: 'pending',
      date: '2024-04-29',
    },
    {
      id: 2,
      vendorName: 'Event Transport',
      vendorRating: 4.6,
      price: 150000,
      description: 'Доставка оборудования с полной страховкой',
      status: 'accepted',
      date: '2024-04-28',
    },
  ];

  const categoryIcon = category?.icon || '🎯';
  const categoryName = category?.name || request.category;

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
                request.status
              )}`}
            >
              {getStatusLabel(request.status)}
            </span>
          </div>

          <div className="grid gap-8 lg:grid-cols-[1fr_380px] lg:items-end">
            <div>
              <div className="mb-5 flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-white/10 px-3 py-1.5 text-xs font-black text-white/70">
                  {categoryIcon} {categoryName}
                </span>

                <span className="rounded-full bg-blue-400/15 px-3 py-1.5 text-xs font-black text-blue-200">
                  Mock request
                </span>
              </div>

              <h1 className="max-w-4xl text-4xl font-black leading-tight tracking-tight text-white md:text-6xl">
                {request.title}
              </h1>

              <p className="mt-5 max-w-3xl text-lg leading-8 text-slate-300">
                {request.description}
              </p>
            </div>

            <div className="rounded-[1.5rem] border border-white/10 bg-white/10 p-5 backdrop-blur-xl">
              <div className="text-sm font-black text-white">Кратко по заявке</div>

              <div className="mt-5 grid grid-cols-2 gap-3">
                <div className="rounded-2xl bg-white/10 p-4">
                  <div className="text-xs font-bold text-slate-400">Город</div>
                  <div className="mt-1 truncate text-lg font-black text-white">
                    {request.city || '—'}
                  </div>
                </div>

                <div className="rounded-2xl bg-white/10 p-4">
                  <div className="text-xs font-bold text-slate-400">Дата</div>
                  <div className="mt-1 truncate text-lg font-black text-white">
                    {request.date || '—'}
                  </div>
                </div>

                <div className="rounded-2xl bg-white/10 p-4">
                  <div className="text-xs font-bold text-slate-400">Аудитория</div>
                  <div className="mt-1 text-lg font-black text-white">
                    {request.audience ? request.audience.toLocaleString('ru') : '—'}
                  </div>
                </div>

                <div className="rounded-2xl bg-white/10 p-4">
                  <div className="text-xs font-bold text-slate-400">Предложения</div>
                  <div className="mt-1 text-lg font-black text-white">
                    {proposals.length}
                  </div>
                </div>
              </div>

              <div className="mt-4 rounded-2xl bg-white p-4">
                <div className="text-xs font-black uppercase tracking-wide text-slate-400">
                  Бюджет
                </div>

                <div className="mt-1 text-xl font-black text-slate-950">
                  {request.budget
                    ? `${formatMoney(request.budget.min)} – ${formatMoney(request.budget.max)}`
                    : 'Не указан'}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-6 px-6 py-8 lg:grid-cols-[1fr_340px]">
        <div className="min-w-0 space-y-6">
          <div className="overflow-hidden rounded-[1.5rem] border border-slate-200 bg-white shadow-sm">
            <div className="flex overflow-x-auto border-b border-slate-100 bg-white">
              {[
                { id: 'details', label: 'Детали', icon: '📋' },
                { id: 'proposals', label: `Предложения (${proposals.length})`, icon: '💼' },
                { id: 'messages', label: 'Сообщения', icon: '💬' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as Tab)}
                  className={`whitespace-nowrap px-5 py-4 text-sm font-black transition ${
                    activeTab === tab.id
                      ? 'border-b-2 border-violet-600 bg-violet-50 text-violet-700'
                      : 'text-slate-500 hover:bg-slate-50 hover:text-slate-950'
                  }`}
                >
                  {tab.icon} {tab.label}
                </button>
              ))}
            </div>

            <div className="p-6 lg:p-8">
              {activeTab === 'details' && (
                <div className="space-y-8">
                  <div>
                    <div className="mb-4 flex items-start gap-4">
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
                        {request.description}
                      </p>
                    </div>
                  </div>

                  <div>
                    <div className="mb-5 flex items-start gap-4">
                      <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-violet-50 text-3xl">
                        📅
                      </div>

                      <div>
                        <h2 className="text-2xl font-black text-slate-950">
                          Основная информация
                        </h2>
                        <p className="mt-1 text-sm font-semibold text-slate-500">
                          Категория, город, дата и аудитория.
                        </p>
                      </div>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                      <InfoCard
                        icon={categoryIcon}
                        label="Категория"
                        value={categoryName}
                      />
                      <InfoCard
                        icon="📍"
                        label="Город"
                        value={request.city || 'Не указан'}
                      />
                      <InfoCard
                        icon="📅"
                        label="Дата события"
                        value={request.date || 'Не указана'}
                      />
                      <InfoCard
                        icon="👥"
                        label="Ожидаемая аудитория"
                        value={
                          request.audience
                            ? `${request.audience.toLocaleString('ru')} человек`
                            : 'Не указана'
                        }
                      />
                    </div>
                  </div>

                  <div>
                    <div className="mb-4 flex items-start gap-4">
                      <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 text-3xl">
                        💰
                      </div>

                      <div>
                        <h2 className="text-2xl font-black text-slate-950">
                          Бюджет
                        </h2>
                        <p className="mt-1 text-sm font-semibold text-slate-500">
                          Ориентировочный диапазон, указанный организатором.
                        </p>
                      </div>
                    </div>

                    <div className="rounded-[1.5rem] border border-emerald-100 bg-emerald-50 p-6">
                      {request.budget ? (
                        <>
                          <p className="text-xs font-black uppercase tracking-wide text-emerald-600">
                            Диапазон бюджета
                          </p>

                          <p className="mt-2 text-3xl font-black text-emerald-800">
                            {formatMoney(request.budget.min)} – {formatMoney(request.budget.max)}
                          </p>

                          <p className="mt-3 text-sm font-semibold text-emerald-700">
                            Общая сумма: {request.budget.min.toLocaleString('ru')} –{' '}
                            {request.budget.max.toLocaleString('ru')} ₽
                          </p>
                        </>
                      ) : (
                        <p className="text-sm font-semibold text-slate-500">
                          Бюджет не указан
                        </p>
                      )}
                    </div>
                  </div>

                  {request.subcategories && request.subcategories.length > 0 && (
                    <div>
                      <div className="mb-4 flex items-start gap-4">
                        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-violet-50 text-3xl">
                          🧩
                        </div>

                        <div>
                          <h2 className="text-2xl font-black text-slate-950">
                            Требуемая специализация
                          </h2>
                          <p className="mt-1 text-sm font-semibold text-slate-500">
                            Подкатегории и направления, которые нужны организатору.
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        {request.subcategories.map((subcategory) => (
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
                </div>
              )}

              {activeTab === 'proposals' && (
                <div>
                  <div className="mb-6 flex items-start gap-4">
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-violet-50 text-3xl">
                      💼
                    </div>

                    <div>
                      <h2 className="text-2xl font-black text-slate-950">
                        Предложения вендоров
                      </h2>
                      <p className="mt-1 text-sm font-semibold text-slate-500">
                        Временные mock-предложения для прототипа.
                      </p>
                    </div>
                  </div>

                  {proposals.length > 0 ? (
                    <div className="space-y-4">
                      {proposals.map((proposal) => (
                        <div
                          key={proposal.id}
                          className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-sm transition hover:border-violet-200 hover:shadow-xl hover:shadow-slate-950/5"
                        >
                          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
                            <div>
                              <Link href="/vendors/1">
                                <h3 className="text-lg font-black text-slate-950 transition hover:text-violet-700">
                                  {proposal.vendorName}
                                </h3>
                              </Link>

                              <p className="mt-1 text-sm font-semibold text-slate-500">
                                ★ {proposal.vendorRating} рейтинг · {proposal.date}
                              </p>
                            </div>

                            <span
                              className={`rounded-full px-3 py-1.5 text-xs font-black ${
                                proposal.status === 'accepted'
                                  ? 'bg-emerald-50 text-emerald-700'
                                  : 'bg-blue-50 text-blue-700'
                              }`}
                            >
                              {proposal.status === 'accepted'
                                ? 'Принято'
                                : 'На рассмотрении'}
                            </span>
                          </div>

                          <p className="mt-4 text-sm font-medium leading-6 text-slate-600">
                            {proposal.description}
                          </p>

                          <div className="mt-5 flex flex-col justify-between gap-4 rounded-2xl bg-slate-50 p-4 md:flex-row md:items-center">
                            <div>
                              <p className="text-xs font-black uppercase tracking-wide text-slate-400">
                                Предложенная цена
                              </p>

                              <p className="mt-1 text-2xl font-black text-slate-950">
                                {proposal.price.toLocaleString('ru')} ₽
                              </p>
                            </div>

                            <div className="flex flex-wrap gap-3">
                              <Link
                                href="/messages"
                                className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-black text-slate-700 transition hover:bg-slate-50"
                              >
                                Переписка
                              </Link>

                              {proposal.status !== 'accepted' && (
                                <button className="inline-flex items-center justify-center rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-black text-white transition hover:bg-violet-600">
                                  Принять
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="rounded-[1.5rem] border border-dashed border-slate-200 bg-slate-50 p-12 text-center">
                      <div className="text-5xl">💼</div>
                      <h3 className="mt-4 text-xl font-black text-slate-950">
                        Предложений пока нет
                      </h3>
                      <p className="mt-2 text-sm font-semibold text-slate-500">
                        Когда вендоры откликнутся, предложения появятся здесь.
                      </p>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'messages' && (
                <div className="py-12 text-center">
                  <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-[1.5rem] bg-violet-50 text-4xl">
                    💬
                  </div>

                  <h2 className="mt-5 text-2xl font-black text-slate-950">
                    Переписка по заявке
                  </h2>

                  <p className="mx-auto mt-3 max-w-md text-sm font-semibold leading-6 text-slate-500">
                    Откройте центр сообщений, чтобы продолжить общение с вендорами
                    и организаторами.
                  </p>

                  <Link
                    href="/messages"
                    className="mt-6 inline-flex items-center justify-center gap-2 rounded-xl bg-slate-950 px-5 py-3 text-sm font-black text-white transition hover:bg-violet-600"
                  >
                    Открыть переписку
                    <ArrowIcon />
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>

        <aside className="space-y-6 lg:sticky lg:top-24 lg:self-start">
          <div className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-sm">
            <h3 className="text-lg font-black text-slate-950">
              Статус заявки
            </h3>

            <div className="mt-5 space-y-3">
              <SidebarInfoItem
                icon="📊"
                label="Статус"
                value={getStatusLabel(request.status)}
              />

              <SidebarInfoItem
                icon="💼"
                label="Предложений"
                value={String(proposals.length)}
              />

              <SidebarInfoItem
                icon="📅"
                label="Опубликовано"
                value={request.date || '—'}
              />

              <SidebarInfoItem
                icon="🆔"
                label="ID заявки"
                value={`${request.id.slice(0, 8)}...`}
              />
            </div>
          </div>

          <div className="rounded-[1.5rem] border border-violet-100 bg-white p-5 shadow-sm">
            <h3 className="text-lg font-black text-slate-950">
              Действия
            </h3>

            <div className="mt-5 space-y-3">
              <button className="w-full rounded-xl bg-slate-950 px-5 py-3 text-sm font-black text-white transition hover:bg-violet-600">
                ✏️ Отредактировать
              </button>

              <button className="w-full rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-black text-slate-700 transition hover:bg-slate-50 hover:text-violet-700">
                📢 Переопубликовать
              </button>

              <button className="w-full rounded-xl border border-red-100 bg-red-50 px-5 py-3 text-sm font-black text-red-600 transition hover:bg-red-100">
                ❌ Закрыть заявку
              </button>
            </div>
          </div>

          <div className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-sm">
            <h3 className="text-sm font-black text-slate-950">
              Важное замечание
            </h3>

            <p className="mt-2 text-sm font-semibold leading-6 text-slate-500">
              Эта страница пока использует mock-data. Для продакшена лучше
              перевести её на реальные данные из Supabase или сделать redirect
              на страницу <code className="font-black text-violet-700">/posting/[id]</code>.
            </p>
          </div>
        </aside>
      </section>
    </main>
  );
}