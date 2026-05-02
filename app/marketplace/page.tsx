'use client';

import { useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import Link from 'next/link';
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
  rider_file_url?: string;
  status: string;
  created_at: string;
}

type ViewMode = 'grid' | 'list';

const PAGE_SIZE = 20;

function formatDate(dateString: string) {
  if (!dateString) return 'Дата не указана';

  return new Date(dateString).toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function formatBudget(min?: number, max?: number) {
  if (!min && !max) return null;
  if (min && max) return `${min.toLocaleString('ru')} – ${max.toLocaleString('ru')} ₽`;
  if (min) return `от ${min.toLocaleString('ru')} ₽`;
  if (max) return `до ${max.toLocaleString('ru')} ₽`;
  return null;
}

function formatLabel(format: string) {
  if (format === 'seated') return 'Сидячий формат';
  if (format === 'standing') return 'Стоячий формат';
  return 'Смешанный формат';
}

function getDaysAgo(createdAt: string) {
  const diff = Math.floor((Date.now() - new Date(createdAt).getTime()) / 86400000);

  if (Number.isNaN(diff) || diff < 0) return 'недавно';
  if (diff === 0) return 'сегодня';
  if (diff === 1) return '1 день назад';
  if (diff > 1 && diff < 5) return `${diff} дня назад`;
  return `${diff} дней назад`;
}

function getCategory(categoryId: string) {
  return MAIN_CATEGORIES.find((category) => category.id === categoryId);
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

function PageHero({
  searchText,
  setSearchText,
}: {
  searchText: string;
  setSearchText: (value: string) => void;
}) {
  return (
    <section className="relative overflow-hidden bg-[#070B18]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(109,61,255,0.35),transparent_30%),radial-gradient(circle_at_80%_10%,rgba(37,99,255,0.24),transparent_28%),radial-gradient(circle_at_70%_80%,rgba(0,194,255,0.14),transparent_32%)]" />
      <div className="absolute inset-0 opacity-40 [background-image:linear-gradient(rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.04)_1px,transparent_1px)] [background-size:64px_64px]" />

      <div className="relative z-10 mx-auto max-w-7xl px-6 py-12 lg:py-16">
        <div className="grid gap-10 lg:grid-cols-[1fr_420px] lg:items-end">
          <div>
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-4 py-2 text-sm font-bold text-white/75 backdrop-blur">
              <span className="h-2 w-2 rounded-full bg-cyan-300" />
              Открытые заявки от организаторов
            </div>

            <h1 className="max-w-3xl text-4xl font-black leading-tight tracking-tight text-white md:text-6xl">
              Маркетплейс заявок для концертной индустрии
            </h1>

            <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-300">
              Находите реальные заявки на площадки, техническое производство,
              логистику, кейтеринг, персонал, безопасность и медиа-команды.
            </p>
          </div>

          <div className="rounded-[1.5rem] border border-white/10 bg-white/10 p-5 backdrop-blur-xl">
            <div className="text-sm font-black text-white">Быстрый поиск</div>

            <div className="relative mt-4">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg text-slate-400">
                🔍
              </span>
              <input
                type="text"
                placeholder="Поиск по названию или описанию..."
                value={searchText}
                onChange={(event) => setSearchText(event.target.value)}
                className="w-full rounded-2xl border border-white/10 bg-white px-12 py-4 text-sm font-semibold text-slate-900 shadow-xl outline-none transition focus:border-violet-300 focus:ring-4 focus:ring-violet-500/20"
              />
              {searchText && (
                <button
                  onClick={() => setSearchText('')}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-black text-slate-400 transition hover:text-slate-700"
                >
                  ✕
                </button>
              )}
            </div>

            <div className="mt-4 grid grid-cols-3 gap-3">
              <div className="rounded-2xl bg-white/10 p-3">
                <div className="text-2xl font-black text-white">B2B</div>
                <div className="mt-1 text-xs text-slate-400">формат</div>
              </div>
              <div className="rounded-2xl bg-white/10 p-3">
                <div className="text-2xl font-black text-white">9</div>
                <div className="mt-1 text-xs text-slate-400">категорий</div>
              </div>
              <div className="rounded-2xl bg-white/10 p-3">
                <div className="text-2xl font-black text-white">24/7</div>
                <div className="mt-1 text-xs text-slate-400">доступ</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function FilterCard({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-sm">
      <h3 className="mb-4 text-sm font-black text-slate-900">{title}</h3>
      {children}
    </div>
  );
}

function PostingGridCard({ posting }: { posting: JobPosting }) {
  const category = getCategory(posting.category);
  const budget = formatBudget(posting.budget_min, posting.budget_max);
  const createdLabel = getDaysAgo(posting.created_at);

  return (
    <Link href={`/posting/${posting.id}`} className="group block h-full">
      <article className="flex h-full flex-col overflow-hidden rounded-[1.5rem] border border-slate-200 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:border-violet-200 hover:shadow-xl hover:shadow-slate-950/10">
        <div className="h-1.5 w-full bg-gradient-to-r from-violet-500 via-indigo-500 to-blue-500" />

        <div className="flex flex-1 flex-col p-5">
          <div className="flex items-start gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-violet-50 text-3xl transition group-hover:scale-105 group-hover:bg-violet-100">
              {category?.icon || '🎯'}
            </div>

            <div className="min-w-0 flex-1">
              <div className="mb-2 flex items-center justify-between gap-2">
                <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-black text-emerald-700">
                  Активная
                </span>
                <span className="text-xs font-bold text-slate-400">{createdLabel}</span>
              </div>

              <h3 className="line-clamp-2 text-base font-black leading-snug text-slate-950 transition group-hover:text-violet-700">
                {posting.title}
              </h3>

              <p className="mt-1 text-xs font-bold text-slate-500">
                {category?.name_ru || posting.category}
              </p>
            </div>
          </div>

          <p className="mt-4 line-clamp-2 text-sm leading-6 text-slate-500">
            {posting.description || 'Описание заявки не указано.'}
          </p>

          <div className="mt-5 grid grid-cols-2 gap-2">
            <div className="rounded-2xl bg-slate-50 p-3">
              <div className="text-[11px] font-black uppercase tracking-wide text-slate-400">
                Город
              </div>
              <div className="mt-1 truncate text-sm font-black text-slate-800">
                📍 {posting.event_city || 'Не указан'}
              </div>
            </div>

            <div className="rounded-2xl bg-slate-50 p-3">
              <div className="text-[11px] font-black uppercase tracking-wide text-slate-400">
                Дата
              </div>
              <div className="mt-1 truncate text-sm font-black text-slate-800">
                📅 {formatDate(posting.event_date)}
              </div>
            </div>

            <div className="rounded-2xl bg-slate-50 p-3">
              <div className="text-[11px] font-black uppercase tracking-wide text-slate-400">
                Гостей
              </div>
              <div className="mt-1 truncate text-sm font-black text-slate-800">
                👥 {posting.guest_count?.toLocaleString('ru') || '—'}
              </div>
            </div>

            <div className="rounded-2xl bg-slate-50 p-3">
              <div className="text-[11px] font-black uppercase tracking-wide text-slate-400">
                Формат
              </div>
              <div className="mt-1 truncate text-sm font-black text-slate-800">
                {formatLabel(posting.format)}
              </div>
            </div>
          </div>

          {posting.venue_name && (
            <div className="mt-3 rounded-2xl bg-violet-50 px-3 py-2 text-xs font-bold text-violet-700">
              🏛️ {posting.venue_name}
            </div>
          )}

          {posting.subcategories?.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {posting.subcategories.slice(0, 3).map((subcategory) => (
                <span
                  key={subcategory}
                  className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600"
                >
                  {subcategory}
                </span>
              ))}
              {posting.subcategories.length > 3 && (
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">
                  +{posting.subcategories.length - 3}
                </span>
              )}
            </div>
          )}

          <div className="flex-1" />

          <div className="mt-5 border-t border-slate-100 pt-4">
            <div className="flex items-center justify-between gap-4">
              <div>
                <div className="text-[11px] font-black uppercase tracking-wide text-slate-400">
                  Бюджет
                </div>
                <div className="mt-1 text-sm font-black text-slate-950">
                  {budget || 'Не указан'}
                </div>
              </div>

              <div className="inline-flex items-center gap-2 rounded-xl bg-slate-950 px-4 py-2 text-xs font-black text-white transition group-hover:bg-violet-600">
                Подробнее
                <ArrowIcon />
              </div>
            </div>
          </div>
        </div>
      </article>
    </Link>
  );
}

function PostingListCard({ posting }: { posting: JobPosting }) {
  const category = getCategory(posting.category);
  const budget = formatBudget(posting.budget_min, posting.budget_max);
  const createdLabel = getDaysAgo(posting.created_at);

  return (
    <Link href={`/posting/${posting.id}`} className="group block">
      <article className="overflow-hidden rounded-[1.5rem] border border-slate-200 bg-white shadow-sm transition duration-300 hover:-translate-y-0.5 hover:border-violet-200 hover:shadow-xl hover:shadow-slate-950/10">
        <div className="h-1.5 w-full bg-gradient-to-r from-violet-500 via-indigo-500 to-blue-500" />

        <div className="grid gap-5 p-5 lg:grid-cols-[1fr_230px_auto] lg:items-center">
          <div className="flex gap-4">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-violet-50 text-3xl transition group-hover:scale-105 group-hover:bg-violet-100">
              {category?.icon || '🎯'}
            </div>

            <div className="min-w-0">
              <div className="mb-2 flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-black text-emerald-700">
                  Активная
                </span>
                <span className="text-xs font-bold text-slate-400">{createdLabel}</span>
                {posting.rider_file_url && (
                  <span className="rounded-full bg-blue-50 px-2.5 py-1 text-[11px] font-black text-blue-700">
                    📎 Есть документы
                  </span>
                )}
              </div>

              <h3 className="line-clamp-1 text-lg font-black text-slate-950 transition group-hover:text-violet-700">
                {posting.title}
              </h3>

              <p className="mt-1 line-clamp-2 text-sm leading-6 text-slate-500">
                {posting.description || 'Описание заявки не указано.'}
              </p>

              <div className="mt-3 flex flex-wrap gap-2">
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">
                  {category?.name_ru || posting.category}
                </span>
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">
                  📍 {posting.event_city || 'Город не указан'}
                </span>
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">
                  📅 {formatDate(posting.event_date)}
                </span>
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">
                  👥 {posting.guest_count?.toLocaleString('ru') || '—'}
                </span>
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">
                  {formatLabel(posting.format)}
                </span>
              </div>
            </div>
          </div>

          <div className="rounded-2xl bg-slate-50 p-4">
            <div className="text-xs font-black uppercase tracking-wide text-slate-400">
              Бюджет
            </div>
            <div className="mt-1 text-base font-black text-slate-950">
              {budget || 'Не указан'}
            </div>
            {posting.venue_name && (
              <div className="mt-2 truncate text-xs font-bold text-slate-500">
                🏛️ {posting.venue_name}
              </div>
            )}
          </div>

          <div className="flex items-center justify-end">
            <div className="inline-flex items-center gap-2 rounded-xl bg-slate-950 px-4 py-3 text-xs font-black text-white transition group-hover:bg-violet-600">
              Смотреть
              <ArrowIcon />
            </div>
          </div>
        </div>
      </article>
    </Link>
  );
}

export default function MarketplacePage() {
  const [allPostings, setAllPostings] = useState<JobPosting[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [page, setPage] = useState(1);
  const [citySearch, setCitySearch] = useState('');
  const [budgetFilter, setBudgetFilter] = useState('');

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);

      try {
        const response = await fetch('/api/job-postings');

        if (response.ok) {
          const data = await response.json();
          setAllPostings(data);
        }
      } catch (error) {
        console.error('Error fetching postings:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, []);

  useEffect(() => {
    setPage(1);
  }, [searchText, selectedCategory, selectedCity, budgetFilter]);

  const filtered = useMemo(() => {
    return allPostings.filter((posting) => {
      if (posting.status !== 'active' && posting.status !== 'open') return false;

      if (searchText.trim()) {
        const query = searchText.toLowerCase();

        if (
          !posting.title?.toLowerCase().includes(query) &&
          !posting.description?.toLowerCase().includes(query)
        ) {
          return false;
        }
      }

      if (selectedCategory && posting.category !== selectedCategory) return false;
      if (selectedCity && posting.event_city !== selectedCity) return false;

      if (budgetFilter) {
        const minBudget = parseInt(budgetFilter, 10);
        if (!posting.budget_min || posting.budget_min < minBudget) return false;
      }

      return true;
    });
  }, [allPostings, searchText, selectedCategory, selectedCity, budgetFilter]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const cities = useMemo(() => {
    return Array.from(new Set(allPostings.map((posting) => posting.event_city).filter(Boolean))).sort();
  }, [allPostings]);

  const resetFilters = () => {
    setSearchText('');
    setSelectedCategory('');
    setSelectedCity('');
    setBudgetFilter('');
    setCitySearch('');
    setPage(1);
  };

  const hasFilters = searchText || selectedCategory || selectedCity || budgetFilter;

  const activeCategoryName = selectedCategory
    ? MAIN_CATEGORIES.find((category) => category.id === selectedCategory)?.name_ru
    : null;

  return (
    <main className="min-h-screen bg-[#F7F8FC] text-slate-950">
      <PageHero searchText={searchText} setSearchText={setSearchText} />

      <section className="mx-auto max-w-7xl px-6 py-8">
        <div className="mb-6 grid gap-4 md:grid-cols-4">
          <div className="rounded-[1.25rem] border border-slate-200 bg-white p-5 shadow-sm">
            <div className="text-xs font-black uppercase tracking-wide text-slate-400">
              Всего заявок
            </div>
            <div className="mt-2 text-3xl font-black text-slate-950">
              {allPostings.length}
            </div>
          </div>

          <div className="rounded-[1.25rem] border border-slate-200 bg-white p-5 shadow-sm">
            <div className="text-xs font-black uppercase tracking-wide text-slate-400">
              Найдено
            </div>
            <div className="mt-2 text-3xl font-black text-violet-600">
              {filtered.length}
            </div>
          </div>

          <div className="rounded-[1.25rem] border border-slate-200 bg-white p-5 shadow-sm">
            <div className="text-xs font-black uppercase tracking-wide text-slate-400">
              Категория
            </div>
            <div className="mt-2 truncate text-lg font-black text-slate-950">
              {activeCategoryName || 'Все'}
            </div>
          </div>

          <div className="rounded-[1.25rem] border border-slate-200 bg-white p-5 shadow-sm">
            <div className="text-xs font-black uppercase tracking-wide text-slate-400">
              Город
            </div>
            <div className="mt-2 truncate text-lg font-black text-slate-950">
              {selectedCity || 'Все города'}
            </div>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[290px_1fr]">
          <aside className="space-y-4">
            <FilterCard title="Категория">
              <div className="space-y-1">
                <button
                  onClick={() => setSelectedCategory('')}
                  className={`w-full rounded-xl px-3 py-2.5 text-left text-sm font-bold transition ${
                    selectedCategory === ''
                      ? 'bg-violet-600 text-white shadow-lg shadow-violet-500/20'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-950'
                  }`}
                >
                  Все категории
                </button>

                {MAIN_CATEGORIES.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(selectedCategory === category.id ? '' : category.id)}
                    className={`flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-left text-sm font-bold transition ${
                      selectedCategory === category.id
                        ? 'bg-violet-600 text-white shadow-lg shadow-violet-500/20'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-950'
                    }`}
                  >
                    <span>{category.icon}</span>
                    <span className="truncate">{category.name_ru}</span>
                  </button>
                ))}
              </div>
            </FilterCard>

            <FilterCard title="Город">
              <input
                type="text"
                placeholder="Поиск города..."
                value={citySearch}
                onChange={(event) => setCitySearch(event.target.value)}
                className="mb-3 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm font-semibold outline-none transition focus:border-violet-300 focus:bg-white focus:ring-4 focus:ring-violet-500/10"
              />

              {selectedCity && (
                <button
                  onClick={() => setSelectedCity('')}
                  className="mb-3 inline-flex items-center gap-2 rounded-full bg-violet-50 px-3 py-1.5 text-xs font-black text-violet-700 transition hover:bg-violet-100"
                >
                  {selectedCity}
                  <span>✕</span>
                </button>
              )}

              <div className="max-h-56 space-y-1 overflow-y-auto pr-1">
                {cities
                  .filter((city) => city.toLowerCase().includes(citySearch.toLowerCase()))
                  .map((city) => (
                    <label
                      key={city}
                      className="flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 hover:text-slate-950"
                    >
                      <input
                        type="radio"
                        name="city"
                        checked={selectedCity === city}
                        onChange={() => setSelectedCity(selectedCity === city ? '' : city)}
                        className="accent-violet-600"
                      />
                      <span className="truncate">{city}</span>
                    </label>
                  ))}

                {cities.length === 0 && (
                  <div className="rounded-xl bg-slate-50 p-3 text-sm font-semibold text-slate-400">
                    Города пока не найдены
                  </div>
                )}
              </div>
            </FilterCard>

            <FilterCard title="Бюджет">
              <div className="space-y-1">
                {[
                  { val: '', label: 'Любой бюджет' },
                  { val: '100000', label: 'от 100 000 ₽' },
                  { val: '500000', label: 'от 500 000 ₽' },
                  { val: '1000000', label: 'от 1 000 000 ₽' },
                ].map(({ val, label }) => (
                  <button
                    key={val}
                    onClick={() => setBudgetFilter(val)}
                    className={`w-full rounded-xl px-3 py-2.5 text-left text-sm font-bold transition ${
                      budgetFilter === val
                        ? 'bg-violet-600 text-white shadow-lg shadow-violet-500/20'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-950'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </FilterCard>

            {hasFilters && (
              <button
                onClick={resetFilters}
                className="w-full rounded-[1.25rem] border border-slate-200 bg-white px-4 py-3 text-sm font-black text-slate-500 shadow-sm transition hover:border-violet-200 hover:text-violet-700"
              >
                ✕ Сбросить все фильтры
              </button>
            )}
          </aside>

          <section className="min-w-0">
            <div className="mb-5 flex flex-col gap-4 rounded-[1.5rem] border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
              <div>
                {loading ? (
                  <span className="text-sm font-bold text-slate-400">
                    Загрузка заявок...
                  </span>
                ) : (
                  <div>
                    <div className="text-sm font-black text-slate-950">
                      Найдено:{' '}
                      <span className="text-violet-600">{filtered.length}</span>{' '}
                      заявок
                      {allPostings.length > 0 && (
                        <span className="font-semibold text-slate-400">
                          {' '}
                          из {allPostings.length}
                        </span>
                      )}
                    </div>
                    {totalPages > 1 && (
                      <div className="mt-1 text-xs font-bold text-slate-400">
                        Страница {page} из {totalPages}
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2">
                <div className="rounded-2xl bg-slate-100 p-1">
                  <button
                    onClick={() => setViewMode('grid')}
                    title="Плитка"
                    className={`h-9 w-9 rounded-xl text-sm font-black transition ${
                      viewMode === 'grid'
                        ? 'bg-white text-violet-700 shadow-sm'
                        : 'text-slate-400 hover:text-slate-700'
                    }`}
                  >
                    ⊞
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    title="Список"
                    className={`h-9 w-9 rounded-xl text-sm font-black transition ${
                      viewMode === 'list'
                        ? 'bg-white text-violet-700 shadow-sm'
                        : 'text-slate-400 hover:text-slate-700'
                    }`}
                  >
                    ☰
                  </button>
                </div>

                <Link
                  href="/create-request"
                  className="hidden rounded-xl bg-slate-950 px-4 py-3 text-sm font-black text-white transition hover:bg-violet-600 sm:inline-flex"
                >
                  + Создать заявку
                </Link>
              </div>
            </div>

            {loading && (
              <div
                className={
                  viewMode === 'grid'
                    ? 'grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3'
                    : 'space-y-3'
                }
              >
                {Array.from({ length: 6 }).map((_, index) => (
                  <div
                    key={index}
                    className="h-64 animate-pulse rounded-[1.5rem] border border-slate-200 bg-white"
                  />
                ))}
              </div>
            )}

            {!loading && filtered.length === 0 && (
              <div className="rounded-[1.75rem] border border-slate-200 bg-white p-14 text-center shadow-sm">
                <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-[1.5rem] bg-violet-50 text-4xl">
                  🔍
                </div>

                <h3 className="mt-6 text-2xl font-black text-slate-950">
                  Заявки не найдены
                </h3>

                <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-slate-500">
                  Попробуйте изменить фильтры, очистить поиск или создать новую заявку для поставщиков.
                </p>

                <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
                  {hasFilters && (
                    <button
                      onClick={resetFilters}
                      className="rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-black text-slate-700 transition hover:bg-slate-50"
                    >
                      Сбросить фильтры
                    </button>
                  )}

                  <Link
                    href="/create-request"
                    className="rounded-xl bg-gradient-to-r from-violet-600 to-blue-600 px-5 py-3 text-sm font-black text-white shadow-lg shadow-violet-500/20 transition hover:-translate-y-0.5"
                  >
                    + Создать заявку
                  </Link>
                </div>
              </div>
            )}

            {!loading && paginated.length > 0 && viewMode === 'grid' && (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {paginated.map((posting) => (
                  <PostingGridCard key={posting.id} posting={posting} />
                ))}
              </div>
            )}

            {!loading && paginated.length > 0 && viewMode === 'list' && (
              <div className="space-y-3">
                {paginated.map((posting) => (
                  <PostingListCard key={posting.id} posting={posting} />
                ))}
              </div>
            )}

            {!loading && totalPages > 1 && (
              <div className="mt-8 flex flex-wrap items-center justify-center gap-2">
                <button
                  onClick={() => setPage((currentPage) => Math.max(1, currentPage - 1))}
                  disabled={page === 1}
                  className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-black text-slate-600 transition hover:border-violet-300 hover:text-violet-700 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  ← Назад
                </button>

                {Array.from({ length: totalPages }, (_, index) => index + 1)
                  .filter(
                    (pageNumber) =>
                      pageNumber === 1 ||
                      pageNumber === totalPages ||
                      Math.abs(pageNumber - page) <= 2
                  )
                  .reduce<(number | '...')[]>((accumulator, pageNumber, index, array) => {
                    if (index > 0 && pageNumber - (array[index - 1] as number) > 1) {
                      accumulator.push('...');
                    }

                    accumulator.push(pageNumber);
                    return accumulator;
                  }, [])
                  .map((pageNumber, index) =>
                    pageNumber === '...' ? (
                      <span key={`dots-${index}`} className="px-2 text-slate-400">
                        …
                      </span>
                    ) : (
                      <button
                        key={pageNumber}
                        onClick={() => setPage(pageNumber as number)}
                        className={`h-10 w-10 rounded-xl text-sm font-black transition ${
                          page === pageNumber
                            ? 'bg-violet-600 text-white shadow-lg shadow-violet-500/20'
                            : 'border border-slate-200 bg-white text-slate-600 hover:border-violet-300 hover:text-violet-700'
                        }`}
                      >
                        {pageNumber}
                      </button>
                    )
                  )}

                <button
                  onClick={() => setPage((currentPage) => Math.min(totalPages, currentPage + 1))}
                  disabled={page === totalPages}
                  className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-black text-slate-600 transition hover:border-violet-300 hover:text-violet-700 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Вперёд →
                </button>
              </div>
            )}
          </section>
        </div>
      </section>
    </main>
  );
}