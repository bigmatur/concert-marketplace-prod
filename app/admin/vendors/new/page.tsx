'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';
import { 
  MAIN_CATEGORIES, 
  EXPERTISE_TAGS, 
  DEFAULT_CITIES, 
  COUNTRIES,
  getSubcategoriesByMainId 
} from '@/lib/categories';

export default function CreateVendorPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [customCities, setCustomCities] = useState<string[]>([]);
  const [newCityInput, setNewCityInput] = useState('');
  const [citySearchInput, setCitySearchInput] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    main_categories: [] as string[],
    subcategories: [] as string[],
    tags: [] as string[],
    status: 'active',
    primary_city: '',
    service_cities: [] as string[],
    country: 'Россия',
    region: '',
    email: '',
    phone: '',
    website: '',
    instagram: '',
    facebook: '',
    youtube: '',
    linkedin: '',
    tiktok: '',
    telegram: '',
    vk: '',
    is_venue: false,
    venue_type: '',
    seated_capacity: 0,
    standing_capacity: 0,
    max_capacity: 0,
    dressing_rooms: 0,
    address: '',
    indoor_outdoor: 'indoor',
    parking: false,
    accessibility: false,
  });

  const allCities = [...DEFAULT_CITIES, ...customCities];
  const filteredCities = allCities.filter((city) =>
    city.toLowerCase().includes(citySearchInput.toLowerCase())
  );

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      setFormData((prev) => ({
        ...prev,
        [name]: (e.target as HTMLInputElement).checked,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: name.includes('capacity') || name === 'dressing_rooms' ? parseInt(value) || 0 : value,
      }));
    }
  }

  function toggleMainCategory(catId: string) {
    setFormData((prev) => ({
      ...prev,
      main_categories: prev.main_categories.includes(catId)
        ? prev.main_categories.filter((c) => c !== catId)
        : [...prev.main_categories, catId],
    }));
  }

  function toggleSubcategory(subId: string) {
    setFormData((prev) => ({
      ...prev,
      subcategories: prev.subcategories.includes(subId)
        ? prev.subcategories.filter((s) => s !== subId)
        : [...prev.subcategories, subId],
    }));
  }

  function toggleTag(tagId: string) {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.includes(tagId)
        ? prev.tags.filter((t) => t !== tagId)
        : [...prev.tags, tagId],
    }));
  }

  function toggleCity(city: string) {
    setFormData((prev) => ({
      ...prev,
      service_cities: prev.service_cities.includes(city)
        ? prev.service_cities.filter((c) => c !== city)
        : [...prev.service_cities, city],
    }));
  }

  function addNewCity() {
    if (newCityInput.trim() && !allCities.includes(newCityInput.trim())) {
      const newCity = newCityInput.trim();
      setCustomCities((prev) => [...prev, newCity]);
      setFormData((prev) => ({
        ...prev,
        service_cities: [...prev.service_cities, newCity],
      }));
      setNewCityInput('');
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    
    // Проверка обязательных полей на фронте
    if (!formData.name.trim()) {
      alert('❌ Введи название вендора');
      return;
    }
    
    if (formData.main_categories.length === 0) {
      alert('❌ Выбери хотя бы одну основную категорию');
      return;
    }
    
    if (!formData.primary_city) {
      alert('❌ Выбери основной город');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/admin/vendors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const responseData = await res.json();

      if (res.ok) {
        alert('✅ Вендор создан успешно!');
        router.push('/admin/vendors');
      } else {
        alert(`❌ ${responseData.error || 'Ошибка при создании вендора'}`);
      }
    } catch (error) {
      console.error('Error:', error);
      alert('❌ Ошибка при создании вендора');
    } finally {
      setLoading(false);
    }
  }

  const totalSteps = 5;
  const progress = (step / totalSteps) * 100;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Link href="/admin/vendors">
            <Button variant="ghost">← Назад</Button>
          </Link>
          <h1 className="text-4xl font-bold text-gray-900">➕ Создать вендора</h1>
          <div className="text-sm text-gray-600">Шаг {step} из {totalSteps}</div>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-purple-600 h-2 rounded-full transition-all"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* STEP 1: Основная информация */}
          {step === 1 && (
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8 space-y-6">
              <h2 className="text-2xl font-bold text-gray-900">🏢 Основная информация</h2>

              {/* Название */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Название вендора / Бренд *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Например: Pro Sound Moscow"
                  required
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              {/* Описание */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Описание профиля
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Опишите ваши услуги, опыт и специализацию"
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              {/* Это площадка? */}
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  name="is_venue"
                  checked={formData.is_venue}
                  onChange={handleChange}
                  className="w-4 h-4"
                />
                <span className="text-sm font-medium text-gray-900">🏟️ Это площадка / место проведения</span>
              </label>

              {/* Основные категории (МНОЖЕСТВЕННЫЙ ВЫБОР) */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-3">
                  📂 Основные категории *
                </label>
                <p className="text-xs text-gray-600 mb-3">Выбери одну или несколько основных категорий</p>
                <div className="grid grid-cols-2 gap-3">
                  {MAIN_CATEGORIES.map((cat) => (
                    <label key={cat.id} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.main_categories.includes(cat.id)}
                        onChange={() => toggleMainCategory(cat.id)}
                        className="w-4 h-4"
                      />
                      <span className="text-sm text-gray-700">{cat.icon} {cat.name_ru}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Подкатегории */}
              {formData.main_categories.length > 0 && (
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-3">
                    🔧 Подкатегории / Специализация
                  </label>
                  <p className="text-xs text-gray-600 mb-3">Выбери услуги/специализацию в рамках выбранных основных категорий</p>
                  <div className="space-y-4">
                    {formData.main_categories.map((mainCatId) => {
                      const mainCategory = MAIN_CATEGORIES.find((cat) => cat.id === mainCatId);
                      if (!mainCategory) return null;

                      return (
                        <div key={mainCatId} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                          <h4 className="text-sm font-bold text-gray-900 mb-3">
                            {mainCategory.icon} {mainCategory.name_ru}
                          </h4>

                          {/* Группировка подкатегорий если есть */}
                          <div className="space-y-3">
                            {mainCategory.subcategories.reduce((groups, sub) => {
                              const group = sub.group || 'Основное';
                              const existing = groups.find((g) => g.group === group);
                              if (existing) {
                                existing.items.push(sub);
                              } else {
                                groups.push({ group, items: [sub] });
                              }
                              return groups;
                            }, [] as Array<{ group: string; items: typeof mainCategory.subcategories }>).map((group) => (
                              <div key={group.group}>
                                {group.group !== 'Основное' && (
                                  <p className="text-xs font-semibold text-gray-500 uppercase mb-2">{group.group}</p>
                                )}
                                <div className="grid grid-cols-2 gap-2">
                                  {group.items.map((sub) => (
                                    <label key={sub.id} className="flex items-center gap-2 cursor-pointer">
                                      <input
                                        type="checkbox"
                                        checked={formData.subcategories.includes(sub.id)}
                                        onChange={() => toggleSubcategory(sub.id)}
                                        className="w-4 h-4"
                                      />
                                      <span className="text-sm text-gray-700">{sub.name_ru}</span>
                                    </label>
                                  ))}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Теги / Экспертиза */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-3">
                  🏷️ Теги / Экспертиза (опционально)
                </label>
                <div className="flex flex-wrap gap-2">
                  {EXPERTISE_TAGS.map((tag) => (
                    <button
                      key={tag.id}
                      type="button"
                      onClick={() => toggleTag(tag.id)}
                      className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                        formData.tags.includes(tag.id)
                          ? 'bg-purple-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {tag.name_ru}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: Города и регион */}
          {step === 2 && (
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8 space-y-6">
              <h2 className="text-2xl font-bold text-gray-900">📍 Города обслуживания</h2>

              {/* Основной город */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Основной город *
                </label>
                <select
                  name="primary_city"
                  value={formData.primary_city}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="">Выбери город</option>
                  {allCities.map((city) => (
                    <option key={city} value={city}>
                      {city}
                    </option>
                  ))}
                </select>
              </div>

              {/* Города обслуживания с поиском */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-3">
                  Города обслуживания
                </label>

                {/* Search Input */}
                <div className="mb-4">
                  <input
                    type="text"
                    placeholder="🔍 Поиск города..."
                    value={citySearchInput}
                    onChange={(e) => setCitySearchInput(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                {/* City List with Scroll */}
                <div className="border border-gray-200 rounded-lg p-4 h-64 overflow-y-auto bg-gray-50">
                  {filteredCities.length > 0 ? (
                    <div className="space-y-2">
                      {filteredCities.map((city) => (
                        <label key={city} className="flex items-center gap-2 cursor-pointer hover:bg-white p-2 rounded transition-colors">
                          <input
                            type="checkbox"
                            checked={formData.service_cities.includes(city)}
                            onChange={() => toggleCity(city)}
                            className="w-4 h-4"
                          />
                          <span className="text-sm text-gray-700">{city}</span>
                          {formData.service_cities.includes(city) && (
                            <span className="ml-auto text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded">✓</span>
                          )}
                        </label>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center text-gray-500 py-8">
                      <p className="text-sm">Город не найден</p>
                    </div>
                  )}
                </div>

                {/* Add New City */}
                <div className="mt-4">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="➕ Добавить новый город"
                      value={newCityInput}
                      onChange={(e) => setNewCityInput(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addNewCity())}
                      className="flex-1 px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                    />
                    <button
                      type="button"
                      onClick={addNewCity}
                      className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium text-sm transition-colors"
                    >
                      Добавить
                    </button>
                  </div>
                </div>

                {/* Selected Cities */}
                {formData.service_cities.length > 0 && (
                  <div className="mt-4">
                    <p className="text-xs font-semibold text-gray-600 mb-2">
                      Выбрано: {formData.service_cities.length}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {formData.service_cities.map((city) => (
                        <div key={city} className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-sm font-medium flex items-center gap-2">
                          {city}
                          <button
                            type="button"
                            onClick={() => toggleCity(city)}
                            className="hover:text-purple-900 font-bold"
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Страна */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Страна
                </label>
                <select
                  name="country"
                  value={formData.country}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  {COUNTRIES.map((country) => (
                    <option key={country} value={country}>
                      {country}
                    </option>
                  ))}
                </select>
              </div>

              {/* Регион */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Регион / Область
                </label>
                <input
                  type="text"
                  name="region"
                  value={formData.region}
                  onChange={handleChange}
                  placeholder="Например: Московская область"
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>
          )}

          {/* STEP 3: Контакты и соцсети */}
          {step === 3 && (
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8 space-y-6">
              <h2 className="text-2xl font-bold text-gray-900">📱 Контакты и соцсети</h2>

              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  📧 Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="contact@vendor.com"
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  📱 Телефон
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="+7 (999) 123-45-67"
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  🌐 Веб-сайт
                </label>
                <input
                  type="url"
                  name="website"
                  value={formData.website}
                  onChange={handleChange}
                  placeholder="https://vendor.com"
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div className="border-t border-gray-200 pt-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Социальные сети</h3>

                {[
                  { name: 'instagram', label: 'Instagram', icon: '📷' },
                  { name: 'facebook', label: 'Facebook', icon: '👍' },
                  { name: 'youtube', label: 'YouTube', icon: '📹' },
                  { name: 'linkedin', label: 'LinkedIn', icon: '💼' },
                  { name: 'tiktok', label: 'TikTok', icon: '🎵' },
                  { name: 'telegram', label: 'Telegram', icon: '✈️' },
                  { name: 'vk', label: 'VK', icon: '🔗' },
                ].map((social) => (
                  <div key={social.name} className="mb-4">
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      {social.icon} {social.label}
                    </label>
                    <input
                      type="text"
                      name={social.name}
                      value={(formData as any)[social.name]}
                      onChange={handleChange}
                      placeholder={`@username или полный URL`}
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* STEP 4: Информация о площадке */}
          {step === 4 && (
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8 space-y-6">
              <h2 className="text-2xl font-bold text-gray-900">🏟️ Информация о площадке</h2>

              {formData.is_venue ? (
                <>
                  {/* Тип площадки */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      Тип площадки
                    </label>
                    <select
                      name="venue_type"
                      value={formData.venue_type}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                      <option value="">Выбери тип площадки</option>
                      {MAIN_CATEGORIES.find((c) => c.id === 'venues')?.subcategories.map((venue) => (
                        <option key={venue.id} value={venue.id}>
                          {venue.name_ru}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Вместимость */}
                  <div className="bg-purple-50 rounded-lg p-6 border border-purple-200">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">Вместимость</h3>
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-900 mb-2">
                          Сидячих мест
                        </label>
                        <input
                          type="number"
                          name="seated_capacity"
                          value={formData.seated_capacity}
                          onChange={handleChange}
                          min="0"
                          className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-900 mb-2">
                          Стоячих мест
                        </label>
                        <input
                          type="number"
                          name="standing_capacity"
                          value={formData.standing_capacity}
                          onChange={handleChange}
                          min="0"
                          className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-900 mb-2">
                          Максимум
                        </label>
                        <input
                          type="number"
                          name="max_capacity"
                          value={formData.max_capacity}
                          onChange={handleChange}
                          min="0"
                          className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Гримерные комнаты */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      Количество гримерных комнат
                    </label>
                    <input
                      type="number"
                      name="dressing_rooms"
                      value={formData.dressing_rooms}
                      onChange={handleChange}
                      min="0"
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>

                  {/* Адрес */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      Адрес площадки
                    </label>
                    <textarea
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      placeholder="Полный адрес площадки"
                      rows={3}
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>

                  {/* Внутри/Снаружи */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      Внутри / Снаружи
                    </label>
                    <select
                      name="indoor_outdoor"
                      value={formData.indoor_outdoor}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                      <option value="indoor">🏠 Внутри</option>
                      <option value="outdoor">🌳 Снаружи</option>
                      <option value="both">🏢 Оба варианта</option>
                    </select>
                  </div>

                  {/* Парковка */}
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      name="parking"
                      checked={formData.parking}
                      onChange={handleChange}
                      className="w-4 h-4"
                    />
                    <span className="text-sm font-medium text-gray-900">✓ Есть парковка</span>
                  </label>

                  {/* Доступность */}
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      name="accessibility"
                      checked={formData.accessibility}
                      onChange={handleChange}
                      className="w-4 h-4"
                    />
                    <span className="text-sm font-medium text-gray-900">✓ Доступна для инвалидных колясок</span>
                  </label>
                </>
              ) : (
                <div className="bg-gray-50 rounded-lg p-6 border border-gray-200 text-center">
                  <p className="text-gray-600">
                    Этот раздел применяется только к площадкам. Вы можете пропустить этот шаг или вернуться назад, чтобы включить "Это площадка".
                  </p>
                </div>
              )}
            </div>
          )}

          {/* STEP 5: Проверка и статус */}
          {step === 5 && (
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8 space-y-6">
              <h2 className="text-2xl font-bold text-gray-900">✅ Проверка и статус</h2>

              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Начальный статус
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="active">✅ Активный</option>
                  <option value="suspended">⏸️ Заморожен</option>
                  <option value="blocked">🚫 Заблокирован</option>
                </select>
              </div>

              <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Резюме вендора</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Название:</span>
                    <span className="font-semibold">{formData.name || '—'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Основные категории:</span>
                    <span className="font-semibold text-right">
                      {formData.main_categories.length > 0
                        ? formData.main_categories
                            .map((id) => MAIN_CATEGORIES.find((c) => c.id === id)?.name_ru)
                            .join(', ')
                        : '—'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Подкатегории:</span>
                    <span className="font-semibold">{formData.subcategories.length > 0 ? formData.subcategories.length : '—'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Основной город:</span>
                    <span className="font-semibold">{formData.primary_city || '—'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Города обслуживания:</span>
                    <span className="font-semibold">{formData.service_cities.length > 0 ? formData.service_cities.length + ' город(-ов)' : '—'}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex gap-4 justify-between">
            {step > 1 && (
              <Button
                type="button"
                variant="secondary"
                onClick={() => setStep(step - 1)}
              >
                ← Предыдущий
              </Button>
            )}
            <div className="flex-1"></div>
            {step < totalSteps ? (
              <Button
                type="button"
                onClick={() => setStep(step + 1)}
              >
                Далее →
              </Button>
            ) : (
              <Button loading={loading} type="submit">
                ✅ Создать вендора
              </Button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}