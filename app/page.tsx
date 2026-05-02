'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { MAIN_CATEGORIES, DEFAULT_CITIES } from '@/lib/categories';

const STEPS = [
  {
    num: '01',
    icon: '📋',
    title: 'Создайте заявку',
    desc: 'Опишите, что вам нужно, где пройдет событие, дату и примерный бюджет.',
  },
  {
    num: '02',
    icon: '👥',
    title: 'Получите подборку',
    desc: 'Подходящие вендоры увидят вашу заявку по категории, городу и другим критериям.',
  },
  {
    num: '03',
    icon: '💬',
    title: 'Сравните предложения',
    desc: 'Изучите профили, портфолио, документы, доступность и отзывы.',
  },
  {
    num: '04',
    icon: '✅',
    title: 'Начните работу',
    desc: 'Выберите подрядчика, согласуйте детали и ведите коммуникацию внутри платформы.',
  },
  {
    num: '05',
    icon: '⭐',
    title: 'Оставьте отзыв',
    desc: 'Отзывы доступны только после завершенной работы, чтобы сохранять доверие.',
  },
];

const TOP_VENDORS = [
  {
    name: 'LA StageWorks',
    category: 'Технический продакшн',
    city: 'Лос-Анджелес + 6 городов',
    rating: '4.9',
    reviews: '128',
    tags: ['Звук', 'Свет', 'Сцена'],
    initials: 'LS',
  },
  {
    name: 'Metro Venue Hall',
    category: 'Площадка',
    city: 'Нью-Йорк + 2 города',
    rating: '4.8',
    reviews: '96',
    tags: ['Indoor', '1200 мест', 'Гримерки'],
    initials: 'MV',
  },
  {
    name: 'TourLine Logistics',
    category: 'Транспорт и логистика',
    city: 'Чикаго + 9 городов',
    rating: '5.0',
    reviews: '74',
    tags: ['Фрахт', 'Водители', 'Тур'],
    initials: 'TL',
  },
];

const REQUESTS = [
  {
    title: 'Звуковая система для зала на 1 200 человек',
    city: 'Los Angeles, CA',
    date: '14 марта 2026',
    budget: '$4,000 – $8,000',
    matches: '18 подходящих вендоров',
    icon: '〽️',
  },
  {
    title: 'Команда безопасности для концертного вечера',
    city: 'New York, NY',
    date: '18 апреля 2026',
    budget: '$2,000 – $4,000',
    matches: '12 подходящих вендоров',
    icon: '🛡️',
  },
  {
    title: 'Свет и видео для фестиваля',
    city: 'Miami, FL',
    date: '23 мая 2026',
    budget: '$6,000 – $12,000',
    matches: '15 подходящих вендоров',
    icon: '🔆',
  },
];

const BUDGET_OPTIONS = [
  { label: 'Любой бюджет', value: '' },
  { label: 'от 100 000 ₽', value: '100000' },
  { label: 'от 500 000 ₽', value: '500000' },
  { label: 'от 1 000 000 ₽', value: '1000000' },
  { label: 'от 5 000 000 ₽', value: '5000000' },
];

function ArrowIcon() {
  return (
    <svg
      className="h-5 w-5"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M5 12H19M13 6L19 12L13 18"
        stroke="currentColor"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function Logo({ dark = false }: { dark?: boolean }) {
  return (
    <Link href="/" className="flex items-center gap-3">
      <div className="relative flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 via-indigo-500 to-blue-500 shadow-lg shadow-violet-500/30">
        <svg
          viewBox="0 0 48 48"
          className="h-8 w-8 text-white"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-label="ConcertGid logo"
        >
          <path
            d="M25.5 11.5C17.8 11.5 12 17.2 12 24.5C12 31.8 17.8 37.5 25.5 37.5C30.2 37.5 34.1 35.5 36.5 32.3"
            stroke="currentColor"
            strokeWidth="4"
            strokeLinecap="round"
          />
          <path
            d="M36.5 20.5C34.4 15.2 30.1 11.5 24.2 11.5"
            stroke="currentColor"
            strokeWidth="4"
            strokeLinecap="round"
            opacity="0.72"
          />
          <path
            d="M36.5 24.5H27.5"
            stroke="currentColor"
            strokeWidth="4"
            strokeLinecap="round"
          />
          <path
            d="M36.5 24.5V32.3"
            stroke="currentColor"
            strokeWidth="4"
            strokeLinecap="round"
          />
          <circle cx="29" cy="24.5" r="2.7" fill="currentColor" />
        </svg>
      </div>

      <div className="leading-tight">
        <div
          className={
            dark
              ? 'text-xl font-black tracking-tight text-slate-950'
              : 'text-xl font-black tracking-tight text-white'
          }
        >
          ConcertGid
        </div>
        <div
          className={
            dark
              ? 'hidden text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 sm:block'
              : 'hidden text-[10px] font-bold uppercase tracking-[0.2em] text-white/45 sm:block'
          }
        >
          Маркетплейс концертной индустрии
        </div>
      </div>
    </Link>
  );
}

function isAuthenticated() {
  if (typeof window === 'undefined') return false;

  const user = localStorage.getItem('user');
  const authToken = localStorage.getItem('authToken');

  return Boolean(user && authToken);
}

function HeroDashboard() {
  return (
    <div className="relative">
      <div className="rounded-[2rem] border border-white/15 bg-white/10 p-5 shadow-2xl shadow-black/40 backdrop-blur-2xl">
        <div className="rounded-[1.5rem] border border-white/10 bg-[#11162B]/95 p-6 text-white">
          <div className="flex items-start justify-between gap-6">
            <div>
              <div className="inline-flex rounded-lg bg-violet-500 px-3 py-1.5 text-xs font-black">
                Новая заявка
              </div>
              <h3 className="mt-5 text-2xl font-black">
                Звуковая система для площадки на 1 200 человек
              </h3>
            </div>

            <div className="text-right">
              <div className="text-xs font-bold text-white/50">Бюджет</div>
              <div className="mt-1 text-xl font-black">$8,000</div>
            </div>
          </div>

          <div className="mt-7 grid grid-cols-3 gap-3">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <div className="text-xl">📍</div>
              <div className="mt-3 text-xs font-bold text-white/45">
                Локация
              </div>
              <div className="mt-1 text-sm font-black">Los Angeles, CA</div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <div className="text-xl">📅</div>
              <div className="mt-3 text-xs font-bold text-white/45">Дата</div>
              <div className="mt-1 text-sm font-black">14 марта 2026</div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <div className="text-xl">📁</div>
              <div className="mt-3 text-xs font-bold text-white/45">
                Категория
              </div>
              <div className="mt-1 text-sm font-black">
                Технический продакшн
              </div>
            </div>
          </div>

          <div className="mt-5 grid grid-cols-4 gap-3">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <div className="text-3xl font-black">18</div>
              <div className="mt-2 text-xs font-medium text-white/50">
                Подходящих вендоров
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <div className="text-3xl font-black">6</div>
              <div className="mt-2 text-xs font-medium text-white/50">
                Предложений
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <div className="text-3xl font-black">3</div>
              <div className="mt-2 text-xs font-medium text-white/50">
                Документа
              </div>
            </div>

            <div className="flex items-center justify-center rounded-2xl border border-white/10 bg-white/5 p-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-full border-4 border-violet-400 text-sm font-black">
                94%
              </div>
            </div>
          </div>

          <div className="mt-7 flex items-center justify-between">
            <div className="text-sm font-black">Лучшие совпадения</div>
            <Link href="/search" className="text-sm font-bold text-violet-300">
              Смотреть всех
            </Link>
          </div>

          <div className="mt-4 space-y-3">
            {[
              ['LA StageWorks', 'Технический продакшн', '4.9'],
              ['Prime Audio Group', 'Звук и свет', '4.8'],
              ['WestCoast Rigging', 'Сцена и rigging', '5.0'],
            ].map((vendor) => (
              <div
                key={vendor[0]}
                className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.04] p-3"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-sm font-black text-slate-950">
                    {vendor[0]
                      .split(' ')
                      .map((item) => item[0])
                      .join('')
                      .slice(0, 2)}
                  </div>

                  <div>
                    <div className="flex items-center gap-2 font-black">
                      {vendor[0]}
                      <span className="text-blue-300">✓</span>
                    </div>
                    <div className="text-sm text-white/50">{vendor[1]}</div>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-sm font-black">⭐ {vendor[2]}</div>
                  <Link
                    href="/search"
                    className="rounded-xl border border-white/15 px-4 py-2 text-xs font-black transition hover:bg-white/10"
                  >
                    Профиль
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function SearchBox() {
  const router = useRouter();

  const [category, setCategory] = useState('');
  const [city, setCity] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [budget, setBudget] = useState('');

  const selectedCategory = useMemo(() => {
    return MAIN_CATEGORIES.find((item) => item.id === category);
  }, [category]);

  function buildParams() {
    const params = new URLSearchParams();

    if (category) params.set('category', category);
    if (city) params.set('city', city);
    if (eventDate) params.set('date', eventDate);
    if (budget) params.set('budget', budget);

    return params;
  }

  function goToProtectedPage(path: '/search' | '/create-request') {
    const params = buildParams();
    const query = params.toString();

    if (!isAuthenticated()) {
      const registerParams = new URLSearchParams();

      registerParams.set('redirect', path);

      if (category) registerParams.set('category', category);
      if (city) registerParams.set('city', city);
      if (eventDate) registerParams.set('date', eventDate);
      if (budget) registerParams.set('budget', budget);

      router.push(`/auth/register?${registerParams.toString()}`);
      return;
    }

    router.push(query ? `${path}?${query}` : path);
  }

  return (
    <section className="relative z-20 mx-auto -mt-16 max-w-7xl px-6">
      <div className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-2xl shadow-slate-950/15">
        <div className="mb-5 flex flex-col justify-between gap-3 lg:flex-row lg:items-center">
          <div>
            <h2 className="text-2xl font-black text-slate-950">
              Что вам нужно?
            </h2>
            <p className="mt-1 text-sm font-semibold text-slate-500">
              Выберите параметры, и мы покажем подходящих вендоров.
            </p>
          </div>

          {(category || city || eventDate || budget) && (
            <button
              type="button"
              onClick={() => {
                setCategory('');
                setCity('');
                setEventDate('');
                setBudget('');
              }}
              className="self-start rounded-xl bg-slate-100 px-4 py-2 text-sm font-black text-slate-600 transition hover:bg-slate-200 lg:self-auto"
            >
              Сбросить
            </button>
          )}
        </div>

        <div className="grid gap-4 lg:grid-cols-[1.25fr_0.9fr_0.9fr_0.9fr_auto]">
          <div className="rounded-2xl border border-slate-200 bg-white px-5 py-4 transition focus-within:border-violet-300 focus-within:ring-4 focus-within:ring-violet-500/10">
            <label className="flex items-center gap-3">
              <span className="text-xl">🔎</span>
              <div className="flex-1">
                <div className="text-sm font-bold text-slate-700">
                  Услуга или категория
                </div>

                <select
                  value={category}
                  onChange={(event) => setCategory(event.target.value)}
                  className="mt-1 w-full cursor-pointer border-0 bg-transparent p-0 text-sm font-semibold text-slate-400 outline-none"
                >
                  <option value="">Звук, свет, площадка...</option>
                  {MAIN_CATEGORIES.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.icon} {item.name_ru}
                    </option>
                  ))}
                </select>

                {selectedCategory && (
                  <div className="mt-1 text-xs font-bold text-violet-600">
                    {selectedCategory.name_ru}
                  </div>
                )}
              </div>
            </label>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white px-5 py-4 transition focus-within:border-violet-300 focus-within:ring-4 focus-within:ring-violet-500/10">
            <label className="flex items-center gap-3">
              <span className="text-xl">📍</span>
              <div className="flex-1">
                <div className="text-sm font-bold text-slate-700">Где?</div>

                <select
                  value={city}
                  onChange={(event) => setCity(event.target.value)}
                  className="mt-1 w-full cursor-pointer border-0 bg-transparent p-0 text-sm font-semibold text-slate-400 outline-none"
                >
                  <option value="">Город или зона</option>
                  {DEFAULT_CITIES.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </div>
            </label>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white px-5 py-4 transition focus-within:border-violet-300 focus-within:ring-4 focus-within:ring-violet-500/10">
            <label className="flex items-center gap-3">
              <span className="text-xl">📅</span>
              <div className="flex-1">
                <div className="text-sm font-bold text-slate-700">Когда?</div>

                <input
                  type="date"
                  value={eventDate}
                  onChange={(event) => setEventDate(event.target.value)}
                  className="mt-1 w-full border-0 bg-transparent p-0 text-sm font-semibold text-slate-400 outline-none"
                />
              </div>
            </label>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white px-5 py-4 transition focus-within:border-violet-300 focus-within:ring-4 focus-within:ring-violet-500/10">
            <label className="flex items-center gap-3">
              <span className="text-xl">💵</span>
              <div className="flex-1">
                <div className="text-sm font-bold text-slate-700">Бюджет</div>

                <select
                  value={budget}
                  onChange={(event) => setBudget(event.target.value)}
                  className="mt-1 w-full cursor-pointer border-0 bg-transparent p-0 text-sm font-semibold text-slate-400 outline-none"
                >
                  {BUDGET_OPTIONS.map((item) => (
                    <option key={item.label} value={item.value}>
                      {item.label}
                    </option>
                  ))}
                </select>
              </div>
            </label>
          </div>

          <button
            type="button"
            onClick={() => goToProtectedPage('/search')}
            className="flex items-center justify-center rounded-2xl bg-gradient-to-r from-violet-600 to-blue-600 px-8 py-5 text-sm font-black text-white shadow-lg shadow-violet-500/25 transition hover:-translate-y-0.5"
          >
            Найти вендоров
          </button>
        </div>
      </div>
    </section>
  );
}

export default function HomePage() {
  function protectedHref(path: string) {
    return path;
  }

  return (
    <main className="min-h-screen bg-[#F7F8FC] text-slate-950">
      <section className="relative overflow-hidden bg-[#070B18]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(109,61,255,0.35),transparent_30%),radial-gradient(circle_at_80%_10%,rgba(37,99,255,0.28),transparent_28%),radial-gradient(circle_at_70%_80%,rgba(0,194,255,0.16),transparent_32%)]" />
        <div className="absolute inset-0 opacity-40 [background-image:linear-gradient(rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.04)_1px,transparent_1px)] [background-size:64px_64px]" />
        <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-[#070B18] to-transparent" />

        <div className="relative mx-auto grid max-w-7xl gap-16 px-6 pb-32 pt-24 lg:grid-cols-[0.95fr_1.05fr] lg:pb-44 lg:pt-28">
          <div className="flex flex-col justify-center">
            <div className="mb-7 inline-flex w-fit items-center gap-2 rounded-full border border-white/10 bg-white/10 px-4 py-2 text-sm font-bold text-white/75 backdrop-blur">
              <span>✨</span>
              Платформа для реальной работы концертной индустрии
            </div>

            <h1 className="max-w-3xl text-5xl font-black leading-[0.98] tracking-tight text-white sm:text-6xl lg:text-7xl">
              Найдите проверенных подрядчиков для каждого этапа{' '}
              <span className="bg-gradient-to-r from-violet-400 to-blue-400 bg-clip-text text-transparent">
                концерта
              </span>
            </h1>

            <p className="mt-7 max-w-2xl text-lg leading-8 text-slate-300">
              ConcertGid соединяет организаторов с площадками, техническими
              командами, логистикой, кейтерингом, безопасностью, персоналом,
              медиа-командами и backline-вендорами.
            </p>

            <div className="mt-9 flex flex-col gap-4 sm:flex-row">
              <Link
                href="/create-request"
                className="inline-flex items-center justify-center gap-3 rounded-xl bg-gradient-to-r from-violet-500 to-blue-500 px-8 py-4 text-sm font-black text-white shadow-2xl shadow-violet-500/25 transition hover:-translate-y-0.5"
              >
                Создать заявку
                <ArrowIcon />
              </Link>

              <Link
                href="/marketplace"
                className="inline-flex items-center justify-center rounded-xl border border-white/20 bg-white/5 px-8 py-4 text-sm font-black text-white backdrop-blur transition hover:-translate-y-0.5 hover:bg-white/10"
              >
                Открыть маркетплейс
              </Link>
            </div>

            <div className="mt-12 grid max-w-2xl gap-5 sm:grid-cols-3">
              <div className="flex gap-3">
                <div className="mt-1 text-xl text-violet-300">✅</div>
                <div>
                  <div className="font-black text-white">
                    Проверенные профессионалы
                  </div>
                  <div className="mt-1 text-sm text-slate-400">
                    Реальные отзывы после работы
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="mt-1 text-xl text-blue-300">🛡️</div>
                <div>
                  <div className="font-black text-white">
                    Безопасная платформа
                  </div>
                  <div className="mt-1 text-sm text-slate-400">
                    Документы и сообщения
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="mt-1 text-xl text-cyan-300">🔒</div>
                <div>
                  <div className="font-black text-white">
                    Фокус на индустрии
                  </div>
                  <div className="mt-1 text-sm text-slate-400">
                    Строгие категории и качество
                  </div>
                </div>
              </div>
            </div>
          </div>

          <HeroDashboard />
        </div>
      </section>

      <SearchBox />

      <section className="mx-auto max-w-7xl px-6 py-20">
        <div className="text-center">
          <h2 className="text-3xl font-black tracking-tight text-slate-950">
            Категории
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-slate-600">
            Ищите подрядчиков по строгим категориям концертной индустрии, а не
            по случайным типам профилей.
          </p>
        </div>

        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {MAIN_CATEGORIES.map((cat) => (
            <Link
              key={cat.id}
              href={`/search?category=${cat.id}`}
              className="group rounded-[1.5rem] border border-slate-200 bg-white p-6 text-center shadow-sm transition hover:-translate-y-1 hover:shadow-xl hover:shadow-slate-950/10"
            >
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-50 text-3xl transition group-hover:bg-violet-100">
                {cat.icon}
              </div>

              <h3 className="mt-5 font-black text-slate-950">
                {cat.name_ru}
              </h3>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                {cat.subcategories?.length
                  ? `${cat.subcategories.length} подкатегорий`
                  : 'Профессиональные услуги для мероприятий'}
              </p>
            </Link>
          ))}
        </div>

        <div className="mt-8 text-center">
          <Link
            href="/search"
            className="inline-flex items-center gap-2 text-sm font-black text-violet-600 hover:text-violet-700"
          >
            Смотреть все категории
            <ArrowIcon />
          </Link>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 pb-20">
        <div className="text-center">
          <h2 className="text-3xl font-black tracking-tight text-slate-950">
            Как работает ConcertGid
          </h2>
        </div>

        <div className="relative mt-12 grid gap-8 lg:grid-cols-5">
          <div className="absolute left-16 right-16 top-10 hidden h-px bg-gradient-to-r from-transparent via-violet-200 to-transparent lg:block" />

          {STEPS.map((step) => (
            <div key={step.num} className="relative text-center">
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full border border-slate-200 bg-white text-3xl shadow-lg shadow-slate-950/5">
                {step.icon}
              </div>

              <div className="mt-5 text-sm font-black text-slate-950">
                {step.num}. {step.title}
              </div>

              <p className="mx-auto mt-2 max-w-[220px] text-sm leading-6 text-slate-500">
                {step.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-8 px-6 pb-20 lg:grid-cols-2">
        <div className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-xl font-black text-slate-950">
              Лучшие вендоры
            </h2>
            <Link
              href="/search"
              className="inline-flex items-center gap-2 text-sm font-black text-violet-600"
            >
              Смотреть всех <ArrowIcon />
            </Link>
          </div>

          <div className="space-y-4">
            {TOP_VENDORS.map((vendor) => (
              <div
                key={vendor.name}
                className="flex flex-col gap-4 rounded-2xl border border-slate-100 bg-white p-4 transition hover:bg-slate-50 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex items-start gap-4">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#0B1020] text-sm font-black text-white">
                    {vendor.initials}
                  </div>

                  <div>
                    <div className="font-black text-slate-950">
                      {vendor.name}
                    </div>
                    <div className="mt-1 text-sm font-medium text-slate-500">
                      {vendor.category}
                    </div>
                    <div className="mt-1 text-sm text-slate-500">
                      {vendor.city}
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <div className="text-sm font-black text-slate-800">
                    ⭐ {vendor.rating}{' '}
                    <span className="font-medium text-slate-400">
                      ({vendor.reviews})
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {vendor.tags.map((tag) => (
                      <span
                        key={tag}
                        className="rounded-lg bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  <Link
                    href="/search"
                    className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-black text-slate-800 transition hover:bg-white"
                  >
                    Запросить КП
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-xl font-black text-slate-950">
              Последние заявки
            </h2>
            <Link
              href="/marketplace"
              className="inline-flex items-center gap-2 text-sm font-black text-violet-600"
            >
              Смотреть все <ArrowIcon />
            </Link>
          </div>

          <div className="space-y-4">
            {REQUESTS.map((request) => (
              <div
                key={request.title}
                className="flex flex-col gap-4 rounded-2xl border border-slate-100 bg-white p-4 transition hover:bg-slate-50 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex items-start gap-4">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-violet-50 text-2xl">
                    {request.icon}
                  </div>

                  <div>
                    <div className="font-black text-slate-950">
                      {request.title}
                    </div>
                    <div className="mt-1 text-sm text-slate-500">
                      {request.city} · {request.date}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-4 sm:min-w-[240px]">
                  <div>
                    <div className="text-xs font-bold text-slate-400">
                      Бюджет
                    </div>
                    <div className="font-black text-slate-950">
                      {request.budget}
                    </div>
                    <div className="mt-1 text-xs text-slate-500">
                      {request.matches}
                    </div>
                  </div>

                  <Link
                    href="/marketplace"
                    className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-black text-slate-800 transition hover:bg-white"
                  >
                    Открыть
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#0B1020]">
        <div className="mx-auto max-w-7xl px-6 py-16">
          <h2 className="text-center text-3xl font-black tracking-tight text-white">
            Создано для реальной индустриальной работы
          </h2>

          <div className="mt-10 grid gap-5 md:grid-cols-5">
            {[
              {
                icon: '⭐',
                title: 'Проверенные отзывы',
                desc: 'Только после завершенной работы',
              },
              {
                icon: '📄',
                title: 'Документы',
                desc: 'Страховки, лицензии, сертификаты',
              },
              {
                icon: '👥',
                title: 'Модерация',
                desc: 'Контроль качества и blacklist',
              },
              {
                icon: '🛡️',
                title: 'Безопасность',
                desc: 'Защита обеих сторон сделки',
              },
              {
                icon: '🔎',
                title: 'Без fake-данных',
                desc: 'Реальные профессионалы и заявки',
              },
            ].map((item) => (
              <div key={item.title} className="flex gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/10 text-xl">
                  {item.icon}
                </div>

                <div>
                  <div className="font-black text-white">{item.title}</div>
                  <div className="mt-1 text-sm leading-6 text-slate-400">
                    {item.desc}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-gradient-to-r from-violet-600 via-indigo-600 to-blue-600">
        <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-8 px-6 py-14 lg:flex-row lg:items-center">
          <div>
            <h2 className="text-3xl font-black tracking-tight text-white">
              Готовы спланировать следующее live-событие?
            </h2>
            <p className="mt-3 text-lg text-violet-100">
              Создайте заявку и получите подборку профессионалов концертной
              индустрии.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Link
              href="/create-request"
              className="inline-flex items-center justify-center gap-3 rounded-xl bg-white px-7 py-4 text-sm font-black text-violet-700 shadow-xl shadow-black/10 transition hover:-translate-y-0.5"
            >
              Создать заявку
              <ArrowIcon />
            </Link>

            <Link
              href="/auth/register"
              className="inline-flex items-center justify-center gap-3 rounded-xl border border-white/25 bg-white/10 px-7 py-4 text-sm font-black text-white backdrop-blur transition hover:-translate-y-0.5 hover:bg-white/15"
            >
              Стать вендором
              <ArrowIcon />
            </Link>
          </div>
        </div>
      </section>

      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-6 px-6 py-8 sm:flex-row sm:items-center sm:justify-between">
          <Logo dark />
          <div className="text-sm font-semibold text-slate-500">
            © 2026 ConcertGid. B2B-маркетплейс для live event professionals.
          </div>
        </div>
      </footer>
    </main>
  );
}