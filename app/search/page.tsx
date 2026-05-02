'use client';

import { useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import Link from 'next/link';
import { MAIN_CATEGORIES, DEFAULT_CITIES } from '@/lib/categories';

interface Vendor {
  id: string;
  name: string;
  description?: string;
  main_categories: string[];
  subcategories: string[];
  tags: string[];
  primary_city: string;
  service_cities: string[];
  rating?: number;
  verified?: boolean;
  is_venue?: boolean;
  venue_type?: string;
  seated_capacity?: number;
  standing_capacity?: number;
  max_capacity?: number;
  dressing_rooms?: number;
  address?: string;
  parking?: boolean;
  accessibility?: boolean;
  status?: string;
}

type ViewMode = 'grid' | 'list';

function formatCapacity(value?: number) {
  if (!value || value <= 0) return '—';
  return value.toLocaleString('ru');
}

function getMainCategory(vendor: Vendor) {
  return vendor.main_categories?.[0]
    ? MAIN_CATEGORIES.find((category) => category.id === vendor.main_categories[0])
    : null;
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
  searchQuery,
  setSearchQuery,
}: {
  searchQuery: string;
  setSearchQuery: (value: string) => void;
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
              Проверенные поставщики для концертной индустрии
            </div>

            <h1 className="max-w-3xl text-4xl font-black leading-tight tracking-tight text-white md:text-6xl">
              Найдите вендоров и площадки для вашего концерта
            </h1>

            <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-300">
              Сравнивайте технических подрядчиков, площадки, логистику, кейтеринг,
              персонал, безопасность, медиа-команды и backline vendors в одном месте.
            </p>
          </div>

          <div className="rounded-[1.5rem] border border-white/10 bg-white/10 p-5 backdrop-blur-xl">
            <div className="text-sm font-black text-white">Быстрый поиск вендора</div>

            <div className="relative mt-4">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg text-slate-400">
                🔍
              </span>
              <input
                type="text"
                placeholder="Поиск по названию или описанию..."
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                className="w-full rounded-2xl border border-white/10 bg-white px-12 py-4 text-sm font-semibold text-slate-900 shadow-xl outline-none transition focus:border-violet-300 focus:ring-4 focus:ring-violet-500/20"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-black text-slate-400 transition hover:text-slate-700"
                >
                  ✕
                </button>
              )}
            </div>

            <div className="mt-4 grid grid-cols-3 gap-3">
              <div className="rounded-2xl bg-white/10 p-3">
                <div className="text-2xl font-black text-white">9</div>
                <div className="mt-1 text-xs text-slate-400">категорий</div>
              </div>
              <div className="rounded-2xl bg-white/10 p-3">
                <div className="text-2xl font-black text-white">B2B</div>
                <div className="mt-1 text-xs text-slate-400">формат</div>
              </div>
              <div className="rounded-2xl bg-white/10 p-3">
                <div className="text-2xl font-black text-white">✓</div>
                <div className="mt-1 text-xs text-slate-400">проверка</div>
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

function VendorGridCard({ vendor }: { vendor: Vendor }) {
  const mainCategory = getMainCategory(vendor);
  const icon = mainCategory?.icon || '🎯';
  const hasCapacity = Boolean(vendor.is_venue && vendor.max_capacity && vendor.max_capacity > 0);
  const serviceCitiesCount = vendor.service_cities?.length || 0;

  return (
    <Link href={`/vendors/${vendor.id}`} className="group block h-full">
      <article className="flex h-full flex-col overflow-hidden rounded-[1.5rem] border border-slate-200 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:border-violet-200 hover:shadow-xl hover:shadow-slate-950/10">
        <div className="h-1.5 w-full bg-gradient-to-r from-violet-500 via-indigo-500 to-blue-500" />

        <div className="flex flex-1 flex-col p-5">
          <div className="flex items-start justify-between gap-4">
            <div className="flex min-w-0 items-start gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-violet-50 text-3xl transition group-hover:scale-105 group-hover:bg-violet-100">
                {icon}
              </div>

              <div className="min-w-0">
                <div className="mb-2 flex flex-wrap items-center gap-2">
                  {vendor.verified && (
                    <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-black text-emerald-700">
                      Проверен
                    </span>
                  )}

                  {vendor.is_venue && (
                    <span className="rounded-full bg-blue-50 px-2.5 py-1 text-[11px] font-black text-blue-700">
                      Площадка
                    </span>
                  )}
                </div>

                <h3 className="line-clamp-2 text-base font-black leading-snug text-slate-950 transition group-hover:text-violet-700">
                  {vendor.name}
                </h3>

                <p className="mt-1 text-xs font-bold text-slate-500">
                  {mainCategory?.name_ru || 'Вендор'}
                </p>
              </div>
            </div>

            {vendor.rating ? (
              <div className="shrink-0 rounded-xl bg-amber-50 px-2.5 py-1.5 text-xs font-black text-amber-700">
                ★ {vendor.rating}
              </div>
            ) : null}
          </div>

          <div className="mt-4 flex items-center gap-2 rounded-2xl bg-slate-50 px-3 py-2 text-sm font-bold text-slate-700">
            <span>📍</span>
            <span className="truncate">{vendor.primary_city || 'Город не указан'}</span>
            {serviceCitiesCount > 1 && (
              <span className="ml-auto rounded-full bg-white px-2 py-1 text-[11px] font-black text-slate-500">
                +{serviceCitiesCount - 1}
              </span>
            )}
          </div>

          {vendor.description && (
            <p className="mt-4 line-clamp-2 text-sm leading-6 text-slate-500">
              {vendor.description}
            </p>
          )}

          {hasCapacity && (
            <div className="mt-4 rounded-2xl border border-violet-100 bg-gradient-to-br from-violet-50 to-blue-50 p-4">
              <div className="text-xs font-black uppercase tracking-wide text-violet-600">
                Вместимость площадки
              </div>

              <div className="mt-1 text-3xl font-black text-violet-800">
                {formatCapacity(vendor.max_capacity)}
              </div>

              <div className="mt-2 grid grid-cols-2 gap-2">
                <div className="rounded-xl bg-white/70 p-2">
                  <div className="text-[10px] font-bold text-slate-400">Сидячих</div>
                  <div className="text-sm font-black text-slate-800">
                    {formatCapacity(vendor.seated_capacity)}
                  </div>
                </div>

                <div className="rounded-xl bg-white/70 p-2">
                  <div className="text-[10px] font-bold text-slate-400">Стоячих</div>
                  <div className="text-sm font-black text-slate-800">
                    {formatCapacity(vendor.standing_capacity)}
                  </div>
                </div>
              </div>

              {vendor.dressing_rooms ? (
                <div className="mt-2 text-xs font-bold text-violet-700">
                  🎭 Гримерных комнат: {vendor.dressing_rooms}
                </div>
              ) : null}
            </div>
          )}

          {vendor.subcategories?.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {vendor.subcategories.slice(0, 3).map((subcategory) => (
                <span
                  key={subcategory}
                  className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600"
                >
                  {subcategory}
                </span>
              ))}

              {vendor.subcategories.length > 3 && (
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">
                  +{vendor.subcategories.length - 3}
                </span>
              )}
            </div>
          )}

          {vendor.tags?.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {vendor.tags.slice(0, 3).map((tag) => (
                <span
                  key={tag}
                  className="rounded-full bg-violet-50 px-3 py-1 text-xs font-bold text-violet-700"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}

          <div className="flex-1" />

          <div className="mt-5 border-t border-slate-100 pt-4">
            <div className="flex items-center justify-between gap-4">
              <div>
                <div className="text-[11px] font-black uppercase tracking-wide text-slate-400">
                  Зона работы
                </div>
                <div className="mt-1 text-sm font-black text-slate-950">
                  {serviceCitiesCount > 1
                    ? `${serviceCitiesCount} городов`
                    : vendor.primary_city || 'Не указана'}
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

function VendorListCard({ vendor }: { vendor: Vendor }) {
  const mainCategory = getMainCategory(vendor);
  const icon = mainCategory?.icon || '🎯';
  const hasCapacity = Boolean(vendor.is_venue && vendor.max_capacity && vendor.max_capacity > 0);
  const serviceCitiesCount = vendor.service_cities?.length || 0;

  return (
    <Link href={`/vendors/${vendor.id}`} className="group block">
      <article className="overflow-hidden rounded-[1.5rem] border border-slate-200 bg-white shadow-sm transition duration-300 hover:-translate-y-0.5 hover:border-violet-200 hover:shadow-xl hover:shadow-slate-950/10">
        <div className="h-1.5 w-full bg-gradient-to-r from-violet-500 via-indigo-500 to-blue-500" />

        <div className="grid gap-5 p-5 lg:grid-cols-[1fr_230px_auto] lg:items-center">
          <div className="flex gap-4">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-violet-50 text-3xl transition group-hover:scale-105 group-hover:bg-violet-100">
              {icon}
            </div>

            <div className="min-w-0">
              <div className="mb-2 flex flex-wrap items-center gap-2">
                {vendor.verified && (
                  <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-black text-emerald-700">
                    Проверен
                  </span>
                )}

                {vendor.is_venue && (
                  <span className="rounded-full bg-blue-50 px-2.5 py-1 text-[11px] font-black text-blue-700">
                    Площадка
                  </span>
                )}

                {vendor.rating ? (
                  <span className="rounded-full bg-amber-50 px-2.5 py-1 text-[11px] font-black text-amber-700">
                    ★ {vendor.rating}
                  </span>
                ) : null}
              </div>

              <h3 className="line-clamp-1 text-lg font-black text-slate-950 transition group-hover:text-violet-700">
                {vendor.name}
              </h3>

              <div className="mt-1 flex flex-wrap items-center gap-2 text-sm font-semibold text-slate-500">
                <span>{mainCategory?.name_ru || 'Вендор'}</span>
                <span className="text-slate-300">•</span>
                <span>📍 {vendor.primary_city || 'Город не указан'}</span>
                {serviceCitiesCount > 1 && (
                  <>
                    <span className="text-slate-300">•</span>
                    <span>{serviceCitiesCount} городов обслуживания</span>
                  </>
                )}
              </div>

              {vendor.description && (
                <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-500">
                  {vendor.description}
                </p>
              )}

              <div className="mt-3 flex flex-wrap gap-2">
                {vendor.subcategories?.slice(0, 4).map((subcategory) => (
                  <span
                    key={subcategory}
                    className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600"
                  >
                    {subcategory}
                  </span>
                ))}

                {vendor.tags?.slice(0, 3).map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full bg-violet-50 px-3 py-1 text-xs font-bold text-violet-700"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {hasCapacity ? (
            <div className="rounded-2xl bg-violet-50 p-4">
              <div className="text-xs font-black uppercase tracking-wide text-violet-500">
                Вместимость
              </div>
              <div className="mt-1 text-2xl font-black text-violet-800">
                {formatCapacity(vendor.max_capacity)}
              </div>
              <div className="mt-2 text-xs font-bold text-slate-500">
                Сидячих: {formatCapacity(vendor.seated_capacity)}
              </div>
              <div className="mt-1 text-xs font-bold text-slate-500">
                Стоячих: {formatCapacity(vendor.standing_capacity)}
              </div>
            </div>
          ) : (
            <div className="rounded-2xl bg-slate-50 p-4">
              <div className="text-xs font-black uppercase tracking-wide text-slate-400">
                Категория
              </div>
              <div className="mt-1 text-sm font-black text-slate-950">
                {mainCategory?.name_ru || 'Не указана'}
              </div>
              <div className="mt-2 text-xs font-bold text-slate-500">
                {serviceCitiesCount > 1
                  ? `${serviceCitiesCount} городов`
                  : vendor.primary_city || 'Город не указан'}
              </div>
            </div>
          )}

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

export default function SearchPage() {
  const [allVendors, setAllVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedCities, setSelectedCities] = useState<string[]>([]);
  const [citySearch, setCitySearch] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [capacityFilter, setCapacityFilter] = useState('');

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);

      try {
        const response = await fetch('/api/admin/vendors');

        if (response.ok) {
          const data = await response.json();
          setAllVendors(data);
        }
      } catch (error) {
        console.error('Error fetching vendors:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, []);

  const filtered = useMemo(() => {
    return allVendors.filter((vendor) => {
      if (vendor.status === 'blocked' || vendor.status === 'suspended') {
        return false;
      }

      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const nameMatch = vendor.name?.toLowerCase().includes(query);
        const descriptionMatch = vendor.description?.toLowerCase().includes(query);

        if (!nameMatch && !descriptionMatch) return false;
      }

      if (selectedCategory) {
        const categoryMatch = vendor.main_categories?.includes(selectedCategory);
        if (!categoryMatch) return false;
      }

      if (selectedCities.length > 0) {
        const cityMatch =
          selectedCities.includes(vendor.primary_city) ||
          vendor.service_cities?.some((city) => selectedCities.includes(city));

        if (!cityMatch) return false;
      }

      if (capacityFilter) {
        const capacity = vendor.max_capacity || 0;
        const minCapacity = parseInt(capacityFilter, 10);

        if (capacity < minCapacity) return false;
      }

      return true;
    });
  }, [allVendors, searchQuery, selectedCategory, selectedCities, capacityFilter]);

  const allCities = useMemo(() => {
    const citiesSet = new Set<string>();

    allVendors.forEach((vendor) => {
      if (vendor.primary_city) citiesSet.add(vendor.primary_city);
      if (vendor.service_cities) {
        vendor.service_cities.forEach((city) => citiesSet.add(city));
      }
    });

    DEFAULT_CITIES.forEach((city) => citiesSet.add(city));

    return Array.from(citiesSet).sort();
  }, [allVendors]);

  const filteredCities = useMemo(() => {
    return allCities.filter((city) =>
      city.toLowerCase().includes(citySearch.toLowerCase())
    );
  }, [allCities, citySearch]);

  const toggleCity = (city: string) => {
    setSelectedCities((previousCities) =>
      previousCities.includes(city)
        ? previousCities.filter((currentCity) => currentCity !== city)
        : [...previousCities, city]
    );
  };

  const resetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('');
    setSelectedCities([]);
    setCapacityFilter('');
    setCitySearch('');
  };

  const hasActiveFilters =
    searchQuery || selectedCategory || selectedCities.length > 0 || capacityFilter;

  const activeCategoryName = selectedCategory
    ? MAIN_CATEGORIES.find((category) => category.id === selectedCategory)?.name_ru
    : null;

  const verifiedCount = allVendors.filter((vendor) => vendor.verified).length;
  const venuesCount = allVendors.filter((vendor) => vendor.is_venue).length;

  return (
    <main className="min-h-screen bg-[#F7F8FC] text-slate-950">
      <PageHero searchQuery={searchQuery} setSearchQuery={setSearchQuery} />

      <section className="mx-auto max-w-7xl px-6 py-8">
        <div className="mb-6 grid gap-4 md:grid-cols-4">
          <div className="rounded-[1.25rem] border border-slate-200 bg-white p-5 shadow-sm">
            <div className="text-xs font-black uppercase tracking-wide text-slate-400">
              Всего вендоров
            </div>
            <div className="mt-2 text-3xl font-black text-slate-950">
              {allVendors.length}
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
              Проверенных
            </div>
            <div className="mt-2 text-3xl font-black text-emerald-600">
              {verifiedCount}
            </div>
          </div>

          <div className="rounded-[1.25rem] border border-slate-200 bg-white p-5 shadow-sm">
            <div className="text-xs font-black uppercase tracking-wide text-slate-400">
              Площадок
            </div>
            <div className="mt-2 text-3xl font-black text-blue-600">
              {venuesCount}
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
                    onClick={() =>
                      setSelectedCategory(
                        selectedCategory === category.id ? '' : category.id
                      )
                    }
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

            <FilterCard title="Город / регион">
              <input
                type="text"
                placeholder="Поиск города..."
                value={citySearch}
                onChange={(event) => setCitySearch(event.target.value)}
                className="mb-3 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm font-semibold outline-none transition focus:border-violet-300 focus:bg-white focus:ring-4 focus:ring-violet-500/10"
              />

              {selectedCities.length > 0 && (
                <div className="mb-3">
                  <div className="mb-2 flex flex-wrap gap-2">
                    {selectedCities.map((city) => (
                      <button
                        key={city}
                        onClick={() => toggleCity(city)}
                        className="rounded-full bg-violet-50 px-3 py-1.5 text-xs font-black text-violet-700 transition hover:bg-violet-100"
                      >
                        {city} ✕
                      </button>
                    ))}
                  </div>

                  <button
                    onClick={() => setSelectedCities([])}
                    className="text-xs font-black text-slate-400 transition hover:text-slate-700"
                  >
                    Сбросить города
                  </button>
                </div>
              )}

              <div className="max-h-56 space-y-1 overflow-y-auto pr-1">
                {filteredCities.map((city) => (
                  <label
                    key={city}
                    className="flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 hover:text-slate-950"
                  >
                    <input
                      type="checkbox"
                      checked={selectedCities.includes(city)}
                      onChange={() => toggleCity(city)}
                      className="accent-violet-600"
                    />
                    <span className="truncate">{city}</span>
                  </label>
                ))}

                {filteredCities.length === 0 && (
                  <div className="rounded-xl bg-slate-50 p-3 text-sm font-semibold text-slate-400">
                    Города не найдены
                  </div>
                )}
              </div>
            </FilterCard>

            <FilterCard title="Вместимость">
              <div className="space-y-1">
                {[
                  { val: '', label: 'Любая вместимость' },
                  { val: '500', label: 'от 500 мест' },
                  { val: '1000', label: 'от 1 000 мест' },
                  { val: '2000', label: 'от 2 000 мест' },
                ].map(({ val, label }) => (
                  <button
                    key={val}
                    onClick={() => setCapacityFilter(val)}
                    className={`w-full rounded-xl px-3 py-2.5 text-left text-sm font-bold transition ${
                      capacityFilter === val
                        ? 'bg-violet-600 text-white shadow-lg shadow-violet-500/20'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-950'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>

              <p className="mt-3 text-xs leading-5 text-slate-400">
                Фильтр вместимости особенно важен для площадок.
              </p>
            </FilterCard>

            {hasActiveFilters && (
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
                    Загрузка вендоров...
                  </span>
                ) : (
                  <div>
                    <div className="text-sm font-black text-slate-950">
                      Найдено:{' '}
                      <span className="text-violet-600">{filtered.length}</span>{' '}
                      вендоров
                      {allVendors.length > 0 && (
                        <span className="font-semibold text-slate-400">
                          {' '}
                          из {allVendors.length}
                        </span>
                      )}
                    </div>

                    <div className="mt-1 text-xs font-bold text-slate-400">
                      Категория: {activeCategoryName || 'все'} · Города:{' '}
                      {selectedCities.length > 0 ? selectedCities.length : 'все'}
                    </div>
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
                  Создать заявку
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
                  Вендоры не найдены
                </h3>

                <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-slate-500">
                  Попробуйте изменить фильтры, очистить поиск или выбрать другую категорию.
                </p>

                <div className="mt-7 flex justify-center">
                  <button
                    onClick={resetFilters}
                    className="rounded-xl bg-gradient-to-r from-violet-600 to-blue-600 px-5 py-3 text-sm font-black text-white shadow-lg shadow-violet-500/20 transition hover:-translate-y-0.5"
                  >
                    Сбросить фильтры
                  </button>
                </div>
              </div>
            )}

            {!loading && filtered.length > 0 && viewMode === 'grid' && (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {filtered.map((vendor) => (
                  <VendorGridCard key={vendor.id} vendor={vendor} />
                ))}
              </div>
            )}

            {!loading && filtered.length > 0 && viewMode === 'list' && (
              <div className="space-y-3">
                {filtered.map((vendor) => (
                  <VendorListCard key={vendor.id} vendor={vendor} />
                ))}
              </div>
            )}
          </section>
        </div>
      </section>
    </main>
  );
}