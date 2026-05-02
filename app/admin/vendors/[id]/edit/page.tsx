'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { MAIN_CATEGORIES } from '@/lib/categories';

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
}

export default function VendorEditPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [vendor, setVendor] = useState<Vendor | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<Partial<Vendor>>({});
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (!userStr) {
      router.push('/auth/login');
      return;
    }

    fetch(`/api/admin/vendors/${params.id}`)
      .then((r) => {
        if (!r.ok) throw new Error('Не найдено');
        return r.json();
      })
      .then((data) => {
        setVendor(data);
        setFormData(data);
        setLoading(false);
      })
      .catch((e) => {
        console.error(e);
        setLoading(false);
      });
  }, [params.id]);

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleArrayChange = (field: string, value: string, add: boolean) => {
    setFormData((prev) => {
      const arr = (prev[field as keyof Vendor] as string[]) || [];
      if (add) {
        if (!arr.includes(value)) return { ...prev, [field]: [...arr, value] };
      } else {
        return { ...prev, [field]: arr.filter((v) => v !== value) };
      }
      return prev;
    });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/vendors/${params.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!res.ok) throw new Error('Ошибка сохранения');
      const updated = await res.json();
      setVendor(updated);
      setMessage({ type: 'success', text: '✓ Профиль обновлен' });
      setTimeout(() => setMessage(null), 3000);
    } catch (e) {
      setMessage({ type: 'error', text: '✗ ' + (e instanceof Error ? e.message : 'Ошибка') });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-3xl mx-auto">
          <div className="h-8 w-32 bg-gray-200 rounded-lg animate-pulse mb-4" />
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-12 bg-white rounded-lg border border-gray-100 animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!vendor) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Вендор не найден</p>
          <Link href="/dashboard">
            <button className="px-4 py-2 bg-violet-600 text-white rounded-xl text-sm font-semibold">
              На кабинет
            </button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-3xl mx-auto space-y-6">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-black text-gray-900">✏️ Редактирование профиля</h1>
            <p className="text-gray-500 text-sm mt-1">{vendor.name}</p>
          </div>
          <Link href={`/vendors/${vendor.id}`}>
            <button className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold text-sm rounded-xl transition-colors">
              ← Назад к профилю
            </button>
          </Link>
        </div>

        {/* Messages */}
        {message && (
          <div className={`rounded-2xl p-4 text-sm font-semibold border ${
            message.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
              : 'bg-red-50 border-red-200 text-red-700'
          }`}>
            {message.text}
          </div>
        )}

        {/* Form */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-6">

          {/* Basic Info */}
          <div>
            <h2 className="font-bold text-gray-900 text-lg mb-4">📋 Основная информация</h2>
            <div className="space-y-4">
              <FormField label="Название" value={formData.name || ''} onChange={(v) => handleChange('name', v)} />
              <FormField label="Email" value={formData.email || ''} onChange={(v) => handleChange('email', v)} type="email" />
              <FormField label="Телефон" value={formData.phone || ''} onChange={(v) => handleChange('phone', v)} />
              <FormField label="Сайт" value={formData.website || ''} onChange={(v) => handleChange('website', v)} type="url" />
              <FormField
                label="Описание"
                value={formData.description || ''}
                onChange={(v) => handleChange('description', v)}
                textarea
              />
            </div>
          </div>

          {/* Location */}
          <div>
            <h2 className="font-bold text-gray-900 text-lg mb-4">📍 Локация</h2>
            <div className="space-y-4">
              <FormField label="Основной город" value={formData.primary_city || ''} onChange={(v) => handleChange('primary_city', v)} />
              <FormField label="Регион" value={formData.region || ''} onChange={(v) => handleChange('region', v)} />
              <FormField label="Адрес" value={formData.address || ''} onChange={(v) => handleChange('address', v)} />
            </div>
          </div>

          {/* Categories */}
          <div>
            <h2 className="font-bold text-gray-900 text-lg mb-4">📂 Категории</h2>
            <div className="flex flex-wrap gap-2">
              {MAIN_CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => handleArrayChange('main_categories', cat.id, !formData.main_categories?.includes(cat.id))}
                  className={`px-3 py-1.5 rounded-xl text-sm font-semibold border transition-all ${
                    formData.main_categories?.includes(cat.id)
                      ? 'bg-violet-600 text-white border-violet-600'
                      : 'bg-white border-gray-200 text-gray-700 hover:border-violet-300'
                  }`}
                >
                  {cat.icon} {cat.name_ru}
                </button>
              ))}
            </div>
          </div>

          {/* Contacts */}
          <div>
            <h2 className="font-bold text-gray-900 text-lg mb-4">📞 Социальные сети</h2>
            <div className="space-y-3">
              {[
                { field: 'instagram', label: 'Instagram' },
                { field: 'telegram', label: 'Telegram' },
                { field: 'vk', label: 'VK' },
                { field: 'youtube', label: 'YouTube' },
              ].map((s) => (
                <FormField
                  key={s.field}
                  label={s.label}
                  value={formData[s.field as keyof Vendor] as string || ''}
                  onChange={(v) => handleChange(s.field, v)}
                />
              ))}
            </div>
          </div>

          {/* Venue details */}
          {formData.is_venue && (
            <div>
              <h2 className="font-bold text-gray-900 text-lg mb-4">🏟️ Параметры площадки</h2>
              <div className="space-y-3">
                <FormField
                  label="Максимальная вместимость"
                  value={formData.max_capacity || ''}
                  onChange={(v) => handleChange('max_capacity', parseInt(v) || 0)}
                  type="number"
                />
                <FormField
                  label="Сидячих мест"
                  value={formData.seated_capacity || ''}
                  onChange={(v) => handleChange('seated_capacity', parseInt(v) || 0)}
                  type="number"
                />
                <FormField
                  label="Стоячих мест"
                  value={formData.standing_capacity || ''}
                  onChange={(v) => handleChange('standing_capacity', parseInt(v) || 0)}
                  type="number"
                />
                <div className="flex gap-3">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.parking || false}
                      onChange={(e) => handleChange('parking', e.target.checked)}
                      className="accent-violet-600 rounded"
                    />
                    <span className="text-sm text-gray-700">🅿️ Парковка</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.accessibility || false}
                      onChange={(e) => handleChange('accessibility', e.target.checked)}
                      className="accent-violet-600 rounded"
                    />
                    <span className="text-sm text-gray-700">♿ Доступность</span>
                  </label>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex-1 px-6 py-3 bg-violet-600 hover:bg-violet-700 text-white font-bold rounded-2xl transition-colors disabled:opacity-50"
          >
            {saving ? '💾 Сохраняю...' : '✓ Сохранить изменения'}
          </button>
          <Link href={`/vendors/${vendor.id}`} className="flex-1">
            <button className="w-full px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-2xl transition-colors">
              ✕ Отмена
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}

function FormField({
  label,
  value,
  onChange,
  type = 'text',
  textarea = false,
}: {
  label: string;
  value: any;
  onChange: (v: string) => void;
  type?: string;
  textarea?: boolean;
}) {
  return (
    <div>
      <label className="block text-sm font-semibold text-gray-800 mb-1.5">{label}</label>
      {textarea ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-300 focus:border-violet-400 resize-none"
          rows={4}
        />
      ) : (
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-300 focus:border-violet-400"
        />
      )}
    </div>
  );
}
