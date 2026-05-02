'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { notFound } from 'next/navigation';
import {
  MAIN_CATEGORIES,
  EXPERTISE_TAGS,
  DEFAULT_CITIES,
} from '@/lib/categories';

interface Vendor {
  id: string;
  name: string;
  description?: string;
  main_categories: string[];
  subcategories: string[];
  tags: string[];
  primary_city: string;
  service_cities: string[];
  country: string;
  region: string;
  email?: string;
  phone?: string;
  website?: string;
  instagram?: string;
  facebook?: string;
  youtube?: string;
  linkedin?: string;
  tiktok?: string;
  telegram?: string;
  vk?: string;
  is_venue: boolean;
  venue_type?: string;
  seated_capacity?: number;
  standing_capacity?: number;
  max_capacity?: number;
  dressing_rooms?: number;
  address?: string;
  indoor_outdoor?: string;
  parking?: boolean;
  accessibility?: boolean;
  rating?: number;
  verified?: boolean;
  status: string;
}

type Tab = 'overview' | 'services' | 'portfolio' | 'reviews';

function formatNumber(value?: number) {
  if (!value || value <= 0) return '—';
  return value.toLocaleString('ru');
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

function EditButton({ onClick, label = 'Редактировать' }: { onClick: () => void; label?: string }) {
  return (
    <button
      onClick={onClick}
      className="rounded-xl bg-violet-50 px-3 py-1.5 text-xs font-black text-violet-700 transition hover:bg-violet-100"
    >
      ✏️ {label}
    </button>
  );
}

function SaveCancelButtons({
  onSave,
  onCancel,
}: {
  onSave: () => void;
  onCancel: () => void;
}) {
  return (
    <div className="mt-4 flex gap-2">
      <button
        onClick={onSave}
        className="flex-1 rounded-xl bg-violet-600 px-3 py-2.5 text-sm font-black text-white transition hover:bg-violet-700"
      >
        Сохранить
      </button>
      <button
        onClick={onCancel}
        className="flex-1 rounded-xl bg-slate-100 px-3 py-2.5 text-sm font-black text-slate-700 transition hover:bg-slate-200"
      >
        Отмена
      </button>
    </div>
  );
}

export default function VendorProfilePage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [vendor, setVendor] = useState<Vendor | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [isOwner, setIsOwner] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const userStr = localStorage.getItem('user');

    fetch(`/api/admin/vendors/${params.id}`)
      .then((response) => {
        if (!response.ok) notFound();
        return response.json();
      })
      .then((data) => {
        setVendor(data);

        if (userStr) {
          const user = JSON.parse(userStr);
          setIsOwner(user.vendor_id === params.id || user.email === data.email);
        }

        setLoading(false);
      })
      .catch(() => notFound());
  }, [params.id]);

  const handleOpenChat = () => {
    if (!vendor) return;
    // Переход на страницу сообщений с вендором
    router.push(`/messages?vendor_id=${vendor.id}`);
  };

  const handleRequestQuote = () => {
    if (!vendor) return;
    // Открыть модальное окно или перейти на страницу создания запроса КП
    alert(`📋 Запрос КП отправлен для ${vendor.name}!\n\nВендор свяжется с вами в течение 24 часов.`);
    // TODO: Добавить реальную функцию отправки КП
  };

  if (loading || !vendor) {
    return (
      <main className="min-h-screen bg-[#F7F8FC]">
        <div className="mx-auto max-w-7xl px-6 py-8">
          <div className="h-80 animate-pulse rounded-[2rem] border border-slate-200 bg-white" />
          <div className="mt-6 grid gap-6 lg:grid-cols-[320px_1fr]">
            <div className="h-96 animate-pulse rounded-[1.5rem] border border-slate-200 bg-white" />
            <div className="h-96 animate-pulse rounded-[1.5rem] border border-slate-200 bg-white" />
          </div>
        </div>
      </main>
    );
  }

  const mainCategory = vendor.main_categories?.[0]
    ? MAIN_CATEGORIES.find((category) => category.id === vendor.main_categories[0])
    : null;

  const icon = mainCategory?.icon || '🎯';
  const hasCapacity = Boolean(vendor.is_venue && vendor.max_capacity && vendor.max_capacity > 0);

  return (
    <main className="min-h-screen bg-[#F7F8FC] text-slate-950">
      <section className="relative overflow-hidden bg-[#070B18]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(109,61,255,0.35),transparent_30%),radial-gradient(circle_at_80%_10%,rgba(37,99,255,0.24),transparent_28%),radial-gradient(circle_at_70%_80%,rgba(0,194,255,0.14),transparent_32%)]" />
        <div className="absolute inset-0 opacity-40 [background-image:linear-gradient(rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.04)_1px,transparent_1px)] [background-size:64px_64px]" />

        <div className="relative z-10 mx-auto max-w-7xl px-6 py-10 lg:py-14">
          <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
            <Link
              href="/search"
              className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/10 px-4 py-2.5 text-sm font-black text-white/80 backdrop-blur transition hover:bg-white/15 hover:text-white"
            >
              ← Назад к поиску
            </Link>

            <button
              onClick={() => setSaved(!saved)}
              className={`rounded-xl px-4 py-2.5 text-sm font-black transition ${
                saved
                  ? 'bg-red-50 text-red-600 hover:bg-red-100'
                  : 'border border-white/10 bg-white/10 text-white/80 backdrop-blur hover:bg-white/15 hover:text-white'
              }`}
            >
              {saved ? '❤️ Сохранено' : '🤍 Сохранить'}
            </button>
          </div>

          <div className="grid gap-8 lg:grid-cols-[1fr_360px] lg:items-end">
            <div>
              <div className="mb-5 flex flex-wrap items-center gap-2">
                {vendor.verified && (
                  <span className="rounded-full bg-emerald-400/15 px-3 py-1.5 text-xs font-black text-emerald-200">
                    ✓ Проверенный профиль
                  </span>
                )}

                {vendor.is_venue && (
                  <span className="rounded-full bg-blue-400/15 px-3 py-1.5 text-xs font-black text-blue-200">
                    Площадка
                  </span>
                )}

                <span className="rounded-full bg-white/10 px-3 py-1.5 text-xs font-black text-white/70">
                  {vendor.status || 'active'}
                </span>
              </div>

              <div className="flex items-start gap-5">
                <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-[1.5rem] bg-white text-4xl shadow-2xl shadow-black/20">
                  {icon}
                </div>

                <div className="min-w-0">
                  <h1 className="max-w-4xl text-4xl font-black leading-tight tracking-tight text-white md:text-6xl">
                    {vendor.name}
                  </h1>

                  <p className="mt-3 text-lg font-semibold text-slate-300">
                    {mainCategory?.name_ru || 'Вендор'} · {vendor.primary_city || 'Город не указан'}
                  </p>

                  {vendor.description && (
                    <p className="mt-5 max-w-3xl text-base leading-7 text-slate-300">
                      {vendor.description}
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="rounded-[1.5rem] border border-white/10 bg-white/10 p-5 backdrop-blur-xl">
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-2xl bg-white/10 p-4">
                  <div className="text-xs font-bold text-slate-400">Рейтинг</div>
                  <div className="mt-1 text-3xl font-black text-white">
                    {vendor.rating || '—'}
                  </div>
                </div>

                <div className="rounded-2xl bg-white/10 p-4">
                  <div className="text-xs font-bold text-slate-400">Отзывы</div>
                  <div className="mt-1 text-3xl font-black text-white">0</div>
                </div>

                <div className="rounded-2xl bg-white/10 p-4">
                  <div className="text-xs font-bold text-slate-400">Города</div>
                  <div className="mt-1 text-3xl font-black text-white">
                    {vendor.service_cities?.length || 1}
                  </div>
                </div>

                <div className="rounded-2xl bg-white/10 p-4">
                  <div className="text-xs font-bold text-slate-400">Проекты</div>
                  <div className="mt-1 text-3xl font-black text-white">0</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-6 px-6 py-8 lg:grid-cols-[320px_1fr]">
        <aside className="space-y-5 lg:sticky lg:top-24 lg:self-start">
          <EditableNameBlock
            vendor={vendor}
            isOwner={isOwner}
            onUpdate={setVendor}
            icon={icon}
            mainCategory={mainCategory}
          />

          <EditableContactsBlock vendor={vendor} isOwner={isOwner} onUpdate={setVendor} />

          <EditableSocialsBlock vendor={vendor} isOwner={isOwner} onUpdate={setVendor} />

          <EditableCitiesBlock vendor={vendor} isOwner={isOwner} onUpdate={setVendor} />

          {hasCapacity && (
            <div className="overflow-hidden rounded-[1.5rem] border border-violet-100 bg-white shadow-sm">
              <div className="bg-gradient-to-r from-violet-600 to-blue-600 p-5 text-white">
                <p className="text-xs font-black uppercase tracking-wide text-violet-200">
                  Вместимость
                </p>
                <p className="mt-1 text-4xl font-black">
                  {formatNumber(vendor.max_capacity)}
                </p>
                <p className="mt-1 text-sm font-semibold text-violet-100">
                  максимум гостей
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 p-4">
                <div className="rounded-2xl bg-slate-50 p-3">
                  <div className="text-xs font-black text-slate-400">Сидячих</div>
                  <div className="mt-1 text-lg font-black text-slate-950">
                    {formatNumber(vendor.seated_capacity)}
                  </div>
                </div>

                <div className="rounded-2xl bg-slate-50 p-3">
                  <div className="text-xs font-black text-slate-400">Стоячих</div>
                  <div className="mt-1 text-lg font-black text-slate-950">
                    {formatNumber(vendor.standing_capacity)}
                  </div>
                </div>

                <div className="col-span-2 rounded-2xl bg-slate-50 p-3">
                  <div className="text-xs font-black text-slate-400">Гримерные</div>
                  <div className="mt-1 text-lg font-black text-slate-950">
                    {vendor.dressing_rooms || '—'}
                  </div>
                </div>
              </div>
            </div>
          )}
        </aside>

        <section className="min-w-0 space-y-5">
          <div className="overflow-hidden rounded-[1.5rem] border border-slate-200 bg-white shadow-sm">
            <div className="flex overflow-x-auto border-b border-slate-100 bg-white">
              {[
                { id: 'overview', label: 'Обзор', icon: '📋' },
                { id: 'services', label: 'Услуги', icon: '💼' },
                { id: 'portfolio', label: 'Портфолио', icon: '🎨' },
                { id: 'reviews', label: 'Отзывы', icon: '⭐' },
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

            <div className="p-6">
              {activeTab === 'overview' && (
                <EditableOverviewBlock vendor={vendor} isOwner={isOwner} onUpdate={setVendor} />
              )}

              {activeTab === 'services' && (
                <EditableServicesBlock vendor={vendor} isOwner={isOwner} onUpdate={setVendor} />
              )}

              {activeTab === 'portfolio' && (
                <EditablePortfolioBlock vendor={vendor} isOwner={isOwner} onUpdate={setVendor} />
              )}

              {activeTab === 'reviews' && (
                <div className="py-14 text-center">
                  <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-[1.5rem] bg-amber-50 text-4xl">
                    ⭐
                  </div>
                  <h3 className="mt-5 text-2xl font-black text-slate-950">
                    Отзывов пока нет
                  </h3>
                  <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-slate-500">
                    Отзывы будут появляться только после завершенных работ. Это защищает платформу от накрутки.
                  </p>
                </div>
              )}
            </div>
          </div>

          {vendor.is_venue && (
            <div className="rounded-[1.5rem] border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-xl font-black text-slate-950">Данные площадки</h2>

              <div className="mt-5 grid gap-4 md:grid-cols-2">
                <InfoCard label="Тип площадки" value={vendor.venue_type || 'Не указан'} />
                <InfoCard label="Формат" value={vendor.indoor_outdoor || 'Не указан'} />
                <InfoCard label="Адрес" value={vendor.address || 'Не указан'} />
                <InfoCard label="Парковка" value={vendor.parking ? 'Есть' : 'Не указано'} />
                <InfoCard label="Доступность" value={vendor.accessibility ? 'Есть' : 'Не указано'} />
                <InfoCard label="Регион" value={vendor.region || 'Не указан'} />
              </div>
            </div>
          )}

          <div className="rounded-[1.5rem] bg-gradient-to-r from-violet-600 via-indigo-600 to-blue-600 p-6 text-white shadow-xl shadow-violet-500/20">
            <div className="flex flex-col justify-between gap-5 md:flex-row md:items-center">
              <div>
                <h2 className="text-2xl font-black">Готовы начать работу?</h2>
                <p className="mt-2 text-sm font-semibold text-violet-100">
                  Свяжитесь с вендором или запросите коммерческое предложение.
                </p>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <button 
                  onClick={handleOpenChat}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-black text-violet-700 transition hover:-translate-y-0.5 hover:bg-violet-50"
                >
                  💬 Написать
                </button>

                <button 
                  onClick={handleRequestQuote}
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/25 bg-white/10 px-5 py-3 text-sm font-black text-white backdrop-blur transition hover:-translate-y-0.5 hover:bg-white/15"
                >
                  📋 Запросить КП
                  <ArrowIcon />
                </button>
              </div>
            </div>
          </div>
        </section>
      </section>
    </main>
  );
}

function InfoCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-slate-50 p-4">
      <div className="text-xs font-black uppercase tracking-wide text-slate-400">
        {label}
      </div>
      <div className="mt-1 text-sm font-black text-slate-950">
        {value}
      </div>
    </div>
  );
}

// Все остальные компоненты (EditableNameBlock, EditableContactsBlock и т.д.) остаются такими же
// как в файле app/vendors/[id]/page.tsx

function EditableNameBlock({ vendor, isOwner, onUpdate, icon, mainCategory }: any) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(vendor.name || '');

  const handleSave = async () => {
    if (!name.trim()) return alert('Имя не может быть пустым');

    try {
      const response = await fetch(`/api/admin/vendors/${vendor.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      });

      if (!response.ok) throw new Error('Ошибка');

      const updated = await response.json();
      onUpdate(updated);
      setEditing(false);
    } catch (error) {
      alert('Ошибка: ' + (error instanceof Error ? error.message : ''));
    }
  };

  return (
    <div className="overflow-hidden rounded-[1.5rem] border border-slate-200 bg-white shadow-sm">
      <div className="h-20 bg-gradient-to-r from-violet-500 via-indigo-500 to-blue-500" />

      <div className="px-6 pb-6">
        <div className="-mt-10 mb-5">
          <div className="flex h-20 w-20 items-center justify-center rounded-[1.5rem] border-4 border-white bg-white text-4xl shadow-xl">
            {icon}
          </div>
        </div>

        {editing ? (
          <div>
            <input
              type="text"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Название компании"
              className="w-full rounded-xl border border-violet-200 px-4 py-3 text-sm font-black outline-none focus:ring-4 focus:ring-violet-500/10"
              autoFocus
            />
            <SaveCancelButtons onSave={handleSave} onCancel={() => setEditing(false)} />
          </div>
        ) : (
          <>
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <h2 className="text-xl font-black leading-tight text-slate-950">
                  {vendor.name}
                </h2>
                <p className="mt-1 text-sm font-semibold text-slate-500">
                  {mainCategory?.name_ru || 'Вендор'} · {vendor.primary_city}
                </p>
              </div>

              {isOwner && <EditButton onClick={() => setEditing(true)} label="" />}
            </div>

            <div className="mt-5 flex flex-wrap gap-2">
              {vendor.verified && (
                <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-black text-emerald-700">
                  ✓ Проверен
                </span>
              )}

              {vendor.is_venue && (
                <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-black text-blue-700">
                  Площадка
                </span>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function EditableContactsBlock({ vendor, isOwner, onUpdate }: any) {
  const [editing, setEditing] = useState(false);
  const [data, setData] = useState({
    email: vendor.email || '',
    phone: vendor.phone || '',
    website: vendor.website || '',
  });

  const handleSave = async () => {
    try {
      const response = await fetch(`/api/admin/vendors/${vendor.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) throw new Error('Ошибка');

      const updated = await response.json();
      onUpdate(updated);
      setEditing(false);
    } catch (error) {
      alert('Ошибка: ' + (error instanceof Error ? error.message : ''));
    }
  };

  if (editing) {
    return (
      <div className="rounded-[1.5rem] border border-violet-200 bg-white p-5 shadow-sm">
        <h3 className="mb-4 text-sm font-black text-slate-950">Контакты</h3>

        <div className="space-y-2">
          <input
            type="email"
            value={data.email}
            onChange={(event) => setData({ ...data, email: event.target.value })}
            placeholder="Email"
            className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold outline-none focus:border-violet-300"
          />

          <input
            type="tel"
            value={data.phone}
            onChange={(event) => setData({ ...data, phone: event.target.value })}
            placeholder="Телефон"
            className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold outline-none focus:border-violet-300"
          />

          <input
            type="url"
            value={data.website}
            onChange={(event) => setData({ ...data, website: event.target.value })}
            placeholder="Сайт"
            className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold outline-none focus:border-violet-300"
          />
        </div>

        <SaveCancelButtons onSave={handleSave} onCancel={() => setEditing(false)} />
      </div>
    );
  }

  return (
    <div className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-sm font-black text-slate-950">Контакты</h3>
        {isOwner && <EditButton onClick={() => setEditing(true)} label="" />}
      </div>

      <div className="space-y-2 text-sm font-semibold text-slate-600">
        {vendor.email && <p className="truncate">📧 {vendor.email}</p>}
        {vendor.phone && <p>📱 {vendor.phone}</p>}
        {vendor.website && <p className="truncate">🌐 {vendor.website}</p>}
        {!vendor.email && !vendor.phone && !vendor.website && (
          <p className="text-slate-400">Контакты не добавлены</p>
        )}
      </div>
    </div>
  );
}

function EditableSocialsBlock({ vendor, isOwner, onUpdate }: any) {
  const [editing, setEditing] = useState(false);
  const [data, setData] = useState({
    instagram: vendor.instagram || '',
    facebook: vendor.facebook || '',
    youtube: vendor.youtube || '',
    linkedin: vendor.linkedin || '',
    tiktok: vendor.tiktok || '',
    telegram: vendor.telegram || '',
    vk: vendor.vk || '',
  });

  const handleSave = async () => {
    try {
      const response = await fetch(`/api/admin/vendors/${vendor.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) throw new Error('Ошибка');

      const updated = await response.json();
      onUpdate(updated);
      setEditing(false);
    } catch (error) {
      alert('Ошибка: ' + (error instanceof Error ? error.message : ''));
    }
  };

  const socials = [
    { name: 'instagram', label: 'Instagram', icon: '📷' },
    { name: 'telegram', label: 'Telegram', icon: '✈️' },
    { name: 'vk', label: 'VK', icon: '🔗' },
    { name: 'youtube', label: 'YouTube', icon: '📹' },
    { name: 'facebook', label: 'Facebook', icon: 'f' },
    { name: 'linkedin', label: 'LinkedIn', icon: 'in' },
    { name: 'tiktok', label: 'TikTok', icon: '♪' },
  ];

  if (editing) {
    return (
      <div className="rounded-[1.5rem] border border-violet-200 bg-white p-5 shadow-sm">
        <h3 className="mb-4 text-sm font-black text-slate-950">Соцсети</h3>

        <div className="space-y-2">
          {socials.map((social) => (
            <input
              key={social.name}
              type="text"
              value={(data as any)[social.name]}
              onChange={(event) => setData({ ...data, [social.name]: event.target.value })}
              placeholder={`${social.label} (@username или URL)`}
              className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold outline-none focus:border-violet-300"
            />
          ))}
        </div>

        <SaveCancelButtons onSave={handleSave} onCancel={() => setEditing(false)} />
      </div>
    );
  }

  const filledSocials = socials.filter((social) => (data as any)[social.name]);

  return (
    <div className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-sm font-black text-slate-950">Соцсети</h3>
        {isOwner && <EditButton onClick={() => setEditing(true)} label="" />}
      </div>

      {filledSocials.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {filledSocials.map((social) => (
            <span
              key={social.name}
              className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-black text-slate-700"
            >
              {social.icon} {social.label}
            </span>
          ))}
        </div>
      ) : (
        <p className="text-sm font-semibold text-slate-400">Соцсети не добавлены</p>
      )}
    </div>
  );
}

function EditableCitiesBlock({ vendor, isOwner, onUpdate }: any) {
  const [editing, setEditing] = useState(false);
  const [primary_city, setPrimaryCity] = useState(vendor.primary_city || '');
  const [service_cities, setServiceCities] = useState<string[]>(vendor.service_cities || []);
  const [customCities, setCustomCities] = useState<string[]>([]);
  const [newCityInput, setNewCityInput] = useState('');
  const [citySearchInput, setCitySearchInput] = useState('');

  const allCities = [...DEFAULT_CITIES, ...customCities];
  const filteredCities = allCities.filter(
    (city) =>
      city.toLowerCase().includes(citySearchInput.toLowerCase()) &&
      !service_cities.includes(city)
  );

  const toggleCity = (city: string) => {
    setServiceCities((previousCities) =>
      previousCities.includes(city)
        ? previousCities.filter((currentCity) => currentCity !== city)
        : [...previousCities, city]
    );
  };

  const addNewCity = () => {
    if (newCityInput.trim() && !allCities.includes(newCityInput.trim())) {
      const newCity = newCityInput.trim();
      setCustomCities((previousCities) => [...previousCities, newCity]);
      setServiceCities((previousCities) => [...previousCities, newCity]);
      setNewCityInput('');
    }
  };

  const handleSave = async () => {
    try {
      const response = await fetch(`/api/admin/vendors/${vendor.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          primary_city,
          service_cities,
        }),
      });

      if (!response.ok) throw new Error('Ошибка');

      const updated = await response.json();
      onUpdate(updated);
      setEditing(false);
    } catch (error) {
      alert('Ошибка: ' + (error instanceof Error ? error.message : ''));
    }
  };

  if (editing) {
    return (
      <div className="rounded-[1.5rem] border border-violet-200 bg-white p-5 shadow-sm">
        <h3 className="mb-4 text-sm font-black text-slate-950">Города</h3>

        <div className="mb-4">
          <label className="mb-1 block text-xs font-black text-slate-500">
            Основной город
          </label>
          <select
            value={primary_city}
            onChange={(event) => setPrimaryCity(event.target.value)}
            className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold outline-none focus:border-violet-300"
          >
            <option value="">Выбери город</option>
            {allCities.map((city) => (
              <option key={city} value={city}>
                {city}
              </option>
            ))}
          </select>
        </div>

        <input
          type="text"
          placeholder="Поиск города..."
          value={citySearchInput}
          onChange={(event) => setCitySearchInput(event.target.value)}
          className="mb-3 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold outline-none focus:border-violet-300"
        />

        <div className="mb-3 h-48 overflow-y-auto rounded-xl border border-slate-200 bg-slate-50 p-2">
          {filteredCities.length > 0 ? (
            <div className="space-y-1">
              {filteredCities.map((city) => (
                <label
                  key={city}
                  className="flex cursor-pointer items-center gap-2 rounded-lg p-2 text-sm font-semibold text-slate-700 hover:bg-white"
                >
                  <input
                    type="checkbox"
                    checked={service_cities.includes(city)}
                    onChange={() => toggleCity(city)}
                    className="accent-violet-600"
                  />
                  <span>{city}</span>
                </label>
              ))}
            </div>
          ) : (
            <div className="py-8 text-center text-xs font-semibold text-slate-400">
              {citySearchInput ? 'Город не найден' : 'Все города добавлены'}
            </div>
          )}
        </div>

        <div className="mb-3 flex gap-2">
          <input
            type="text"
            placeholder="Добавить новый город"
            value={newCityInput}
            onChange={(event) => setNewCityInput(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                event.preventDefault();
                addNewCity();
              }
            }}
            className="flex-1 rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold outline-none focus:border-violet-300"
          />

          <button
            type="button"
            onClick={addNewCity}
            className="rounded-xl bg-violet-600 px-4 py-3 text-sm font-black text-white hover:bg-violet-700"
          >
            Добавить
          </button>
        </div>

        {service_cities.length > 0 && (
          <div className="mb-3">
            <p className="mb-2 text-xs font-black text-slate-500">
              Выбрано: {service_cities.length}
            </p>

            <div className="flex flex-wrap gap-2">
              {service_cities.map((city) => (
                <button
                  key={city}
                  type="button"
                  onClick={() => toggleCity(city)}
                  className="rounded-full bg-violet-50 px-3 py-1.5 text-xs font-black text-violet-700 hover:bg-violet-100"
                >
                  {city} ✕
                </button>
              ))}
            </div>
          </div>
        )}

        <SaveCancelButtons onSave={handleSave} onCancel={() => setEditing(false)} />
      </div>
    );
  }

  return (
    <div className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-sm font-black text-slate-950">Города</h3>
        {isOwner && <EditButton onClick={() => setEditing(true)} label="" />}
      </div>

      <div className="flex flex-wrap gap-2">
        {vendor.primary_city && (
          <span className="rounded-full bg-violet-50 px-3 py-1.5 text-xs font-black text-violet-700">
            ⭐ {vendor.primary_city}
          </span>
        )}

        {vendor.service_cities
          ?.filter((city: string) => city !== vendor.primary_city)
          .map((city: string) => (
            <span
              key={city}
              className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-600"
            >
              {city}
            </span>
          ))}
      </div>
    </div>
  );
}

function EditableOverviewBlock({ vendor, isOwner, onUpdate }: any) {
  const [editing, setEditing] = useState(false);
  const [description, setDescription] = useState(vendor.description || '');

  const handleSave = async () => {
    try {
      const response = await fetch(`/api/admin/vendors/${vendor.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ description }),
      });

      if (!response.ok) throw new Error('Ошибка');

      const updated = await response.json();
      onUpdate(updated);
      setEditing(false);
    } catch (error) {
      alert('Ошибка: ' + (error instanceof Error ? error.message : ''));
    }
  };

  return (
    <div className="space-y-7">
      <div>
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-xl font-black text-slate-950">О компании</h3>
          {isOwner && (
            <EditButton
              onClick={() => setEditing(!editing)}
              label={editing ? 'Отмена' : 'Редактировать'}
            />
          )}
        </div>

        {editing ? (
          <div>
            <textarea
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Расскажите о компании, опыте, услугах и преимуществах..."
              className="w-full rounded-xl border border-violet-200 px-4 py-3 text-sm font-semibold outline-none focus:ring-4 focus:ring-violet-500/10"
              rows={6}
            />
            <button
              onClick={handleSave}
              className="mt-3 rounded-xl bg-violet-600 px-5 py-3 text-sm font-black text-white transition hover:bg-violet-700"
            >
              Сохранить
            </button>
          </div>
        ) : (
          <p className="text-sm leading-7 text-slate-600">
            {vendor.description || 'Описание компании пока не добавлено.'}
          </p>
        )}
      </div>

      {vendor.main_categories?.length > 0 && (
        <div>
          <h3 className="mb-3 text-xl font-black text-slate-950">Категории</h3>

          <div className="flex flex-wrap gap-2">
            {vendor.main_categories.map((categoryId: string) => {
              const category = MAIN_CATEGORIES.find((item) => item.id === categoryId);

              return (
                <span
                  key={categoryId}
                  className="inline-flex items-center gap-2 rounded-xl border border-violet-100 bg-violet-50 px-3 py-2 text-sm font-black text-violet-700"
                >
                  {category?.icon} {category?.name_ru}
                </span>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function EditableServicesBlock({ vendor, isOwner, onUpdate }: any) {
  const [editing, setEditing] = useState(false);
  const [main_categories, setMainCategories] = useState<string[]>(vendor.main_categories || []);
  const [subcategories, setSubcategories] = useState<string[]>(vendor.subcategories || []);

  const toggleMainCategory = (catId: string) => {
    setMainCategories((prev) =>
      prev.includes(catId) ? prev.filter((c) => c !== catId) : [...prev, catId]
    );
  };

  const toggleSubcategory = (subId: string) => {
    setSubcategories((prev) =>
      prev.includes(subId) ? prev.filter((s) => s !== subId) : [...prev, subId]
    );
  };

  const handleSave = async () => {
    try {
      const response = await fetch(`/api/admin/vendors/${vendor.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          main_categories,
          subcategories,
        }),
      });

      if (!response.ok) throw new Error('Ошибка');

      const updated = await response.json();
      onUpdate(updated);
      setEditing(false);
    } catch (error) {
      alert('Ошибка: ' + (error instanceof Error ? error.message : ''));
    }
  };

  if (!editing) {
    return (
      <div>
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-xl font-black text-slate-950">Категории и услуги</h3>
          {isOwner && <EditButton onClick={() => setEditing(true)} label="Изменить" />}
        </div>

        {vendor.main_categories && vendor.main_categories.length > 0 ? (
          <div className="space-y-4">
            <div>
              <h4 className="mb-2 text-sm font-bold text-slate-500">Основные категории</h4>
              <div className="flex flex-wrap gap-2">
                {vendor.main_categories.map((catId: string) => {
                  const cat = MAIN_CATEGORIES.find((c) => c.id === catId);
                  return (
                    <span
                      key={catId}
                      className="inline-flex items-center gap-2 rounded-xl border border-violet-100 bg-violet-50 px-3 py-2 text-sm font-black text-violet-700"
                    >
                      {cat?.icon} {cat?.name_ru}
                    </span>
                  );
                })}
              </div>
            </div>

            {vendor.subcategories && vendor.subcategories.length > 0 && (
              <div>
                <h4 className="mb-2 text-sm font-bold text-slate-500">Подкатегории</h4>
                <div className="flex flex-wrap gap-2">
                  {vendor.subcategories.map((subId: string, i: number) => (
                    <span
                      key={i}
                      className="rounded-xl border border-blue-100 bg-blue-50 px-3 py-2 text-sm font-black text-blue-700"
                    >
                      {subId}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <p className="text-sm font-semibold text-slate-400">Категории не выбраны</p>
        )}
      </div>
    );
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-xl font-black text-slate-950">Категории и услуги</h3>
        {isOwner && (
          <button
            onClick={() => setEditing(false)}
            className="text-xs font-black text-slate-500 hover:text-slate-900"
          >
            ✕ Отмена
          </button>
        )}
      </div>

      <div className="mb-6">
        <label className="mb-3 block text-sm font-black text-slate-950">
          📂 Основные категории
        </label>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {MAIN_CATEGORIES.map((cat) => (
            <label
              key={cat.id}
              className="flex cursor-pointer items-center gap-2 rounded-xl border border-slate-200 p-3 hover:border-violet-300 hover:bg-violet-50"
            >
              <input
                type="checkbox"
                checked={main_categories.includes(cat.id)}
                onChange={() => toggleMainCategory(cat.id)}
                className="accent-violet-600"
              />
              <span className="text-sm font-bold text-slate-700">
                {cat.icon} {cat.name_ru}
              </span>
            </label>
          ))}
        </div>
      </div>

      {main_categories.length > 0 && (
        <div className="mb-6">
          <label className="mb-3 block text-sm font-black text-slate-950">
            🔧 Подкатегории / Специализация
          </label>

          {main_categories.map((mainCatId) => {
            const mainCategory = MAIN_CATEGORIES.find((cat) => cat.id === mainCatId);
            if (!mainCategory) return null;

            return (
              <div key={mainCatId} className="mb-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
                <h4 className="mb-3 text-sm font-black text-slate-900">
                  {mainCategory.icon} {mainCategory.name_ru}
                </h4>

                <div className="grid grid-cols-2 gap-2">
                  {mainCategory.subcategories.map((sub) => (
                    <label key={sub.id} className="flex cursor-pointer items-center gap-2">
                      <input
                        type="checkbox"
                        checked={subcategories.includes(sub.id)}
                        onChange={() => toggleSubcategory(sub.id)}
                        className="accent-violet-600"
                      />
                      <span className="text-sm font-semibold text-slate-700">{sub.name_ru}</span>
                    </label>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <SaveCancelButtons onSave={handleSave} onCancel={() => setEditing(false)} />
    </div>
  );
}

function EditablePortfolioBlock({ vendor, isOwner, onUpdate }: any) {
  const [editing, setEditing] = useState(false);
  const [portfolio, setPortfolio] = useState<Array<any>>(vendor.portfolio || []);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    date: '',
    city: '',
    venue: '',
    capacity: '',
    event_name: '',
  });

  const addPortfolioItem = () => {
    if (!formData.name.trim()) return alert('Название проекта обязательно');

    const newItem = {
      id: Date.now().toString(),
      name: formData.name,
      description: formData.description || undefined,
      date: formData.date || undefined,
      city: formData.city || undefined,
      venue: formData.venue || undefined,
      capacity: formData.capacity ? parseInt(formData.capacity) : undefined,
      event_name: formData.event_name || undefined,
    };

    setPortfolio([...portfolio, newItem]);
    setFormData({
      name: '',
      description: '',
      date: '',
      city: '',
      venue: '',
      capacity: '',
      event_name: '',
    });
  };

  const removePortfolioItem = (id: string) => {
    setPortfolio(portfolio.filter((item) => item.id !== id));
  };

  const handleSave = async () => {
    try {
      const response = await fetch(`/api/admin/vendors/${vendor.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          portfolio,
        }),
      });

      if (!response.ok) throw new Error('Ошибка');

      const updated = await response.json();
      onUpdate(updated);
      setEditing(false);
    } catch (error) {
      alert('Ошибка: ' + (error instanceof Error ? error.message : ''));
    }
  };

  if (!editing) {
    return (
      <div>
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-xl font-black text-slate-950">Портфолио</h3>
          {isOwner && <EditButton onClick={() => setEditing(true)} label="Добавить" />}
        </div>

        {vendor.portfolio && vendor.portfolio.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2">
            {vendor.portfolio.map((item: any) => (
              <div key={item.id} className="rounded-2xl border border-green-100 bg-green-50 p-4">
                {item.image && (
                  <img src={item.image} alt={item.name} className="mb-3 h-32 w-full rounded-lg object-cover" />
                )}
                <h4 className="font-black text-green-900">{item.name}</h4>
                {item.event_name && <p className="mt-1 text-xs text-green-700">🎪 {item.event_name}</p>}
                {item.date && <p className="text-xs text-green-600">📅 {item.date}</p>}
                {item.city && <p className="text-xs text-green-600">📍 {item.city}</p>}
                {item.venue && <p className="text-xs text-green-600">🏢 {item.venue}</p>}
                {item.capacity && <p className="text-xs text-green-600">👥 {item.capacity} мест</p>}
                {item.description && <p className="mt-2 text-sm text-green-700">{item.description}</p>}
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-[1.5rem] border border-dashed border-slate-200 bg-slate-50 p-10 text-center">
            <div className="text-4xl">🎨</div>
            <p className="mt-3 text-sm font-semibold text-slate-400">
              Портфолио пока не добавлено
            </p>
          </div>
        )}
      </div>
    );
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-xl font-black text-slate-950">Портфолио</h3>
        {isOwner && (
          <button
            onClick={() => setEditing(false)}
            className="text-xs font-black text-slate-500 hover:text-slate-900"
          >
            ✕ Отмена
          </button>
        )}
      </div>

      <div className="mb-8 rounded-xl border border-violet-200 bg-violet-50 p-6">
        <h4 className="mb-4 text-sm font-black text-slate-950">Добавить проект в портфолио</h4>

        <div className="grid gap-3 md:grid-cols-2">
          <input
            type="text"
            placeholder="Название проекта *"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold outline-none focus:border-violet-300"
          />

          <input
            type="text"
            placeholder="Название мероприятия"
            value={formData.event_name}
            onChange={(e) => setFormData({ ...formData, event_name: e.target.value })}
            className="rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold outline-none focus:border-violet-300"
          />

          <input
            type="date"
            value={formData.date}
            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            className="rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold outline-none focus:border-violet-300"
          />

          <input
            type="text"
            placeholder="Город"
            value={formData.city}
            onChange={(e) => setFormData({ ...formData, city: e.target.value })}
            className="rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold outline-none focus:border-violet-300"
          />

          <input
            type="text"
            placeholder="Название площадки"
            value={formData.venue}
            onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
            className="rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold outline-none focus:border-violet-300"
          />

          <input
            type="number"
            placeholder="Вместимость"
            value={formData.capacity}
            onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
            className="rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold outline-none focus:border-violet-300"
          />

          <textarea
            placeholder="Описание проекта"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            rows={2}
            className="col-span-2 rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold outline-none focus:border-violet-300"
          />
        </div>

        <button
          type="button"
          onClick={addPortfolioItem}
          className="mt-4 rounded-xl bg-violet-600 px-5 py-3 text-sm font-black text-white transition hover:bg-violet-700"
        >
          ➕ Добавить проект
        </button>
      </div>

      {portfolio.length > 0 && (
        <div className="mb-6 space-y-3">
          <h4 className="text-sm font-bold text-slate-500">Добавленные проекты ({portfolio.length})</h4>
          {portfolio.map((item) => (
            <div
              key={item.id}
              className="flex items-start justify-between gap-4 rounded-xl border border-slate-200 bg-white p-4"
            >
              <div className="min-w-0 flex-1">
                <h5 className="font-bold text-slate-900">{item.name}</h5>
                <div className="mt-2 space-y-1 text-xs text-slate-600">
                  {item.event_name && <p>🎪 {item.event_name}</p>}
                  {item.date && <p>📅 {item.date}</p>}
                  {item.city && <p>📍 {item.city}</p>}
                  {item.venue && <p>🏢 {item.venue}</p>}
                  {item.capacity && <p>👥 {item.capacity} мест</p>}
                  {item.description && <p className="mt-1">{item.description}</p>}
                </div>
              </div>
              <button
                type="button"
                onClick={() => removePortfolioItem(item.id)}
                className="text-sm font-black text-red-600 hover:text-red-700"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}

      <SaveCancelButtons onSave={handleSave} onCancel={() => setEditing(false)} />
    </div>
  );
}
