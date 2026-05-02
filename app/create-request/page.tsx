'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { MAIN_CATEGORIES, DEFAULT_CITIES } from '@/lib/categories';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

type EventFormat = 'seated' | 'standing' | 'mixed';

export default function CreateRequestPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    subcategories: [] as string[],
    event_city: '',
    event_date: '',
    guest_count: '',
    venue_name: '',
    venue_type: '',
    format: 'mixed' as EventFormat,
    budget_min: '',
    budget_max: '',
    rider_file_url: '',
  });

  const currentCategory = MAIN_CATEGORIES.find((category) => category.id === formData.category);
  const subcategoryOptions = currentCategory?.subcategories || [];

  function handleChange(
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) {
    const { name, value } = event.target;

    setFormData((previousData) => ({
      ...previousData,
      [name]: value,
    }));

    if (errors[name]) {
      setErrors((previousErrors) => {
        const newErrors = { ...previousErrors };
        delete newErrors[name];
        return newErrors;
      });
    }
  }

  function handleFileUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      setErrors((previousErrors) => ({
        ...previousErrors,
        rider: 'Файл не должен быть больше 10 МБ',
      }));
      return;
    }

    setUploadedFile(file);

    setFormData((previousData) => ({
      ...previousData,
      rider_file_url: file.name,
    }));

    setErrors((previousErrors) => {
      const newErrors = { ...previousErrors };
      delete newErrors.rider;
      return newErrors;
    });
  }

  function toggleSubcategory(subcategoryId: string) {
    setFormData((previousData) => ({
      ...previousData,
      subcategories: previousData.subcategories.includes(subcategoryId)
        ? previousData.subcategories.filter((subcategory) => subcategory !== subcategoryId)
        : [...previousData.subcategories, subcategoryId],
    }));
  }

  function validateStep1(): boolean {
    const newErrors: { [key: string]: string } = {};

    if (!formData.title?.trim()) {
      newErrors.title = 'Название заявки обязательно';
    }

    if (!formData.description?.trim()) {
      newErrors.description = 'Описание обязательно';
    }

    if (!formData.category) {
      newErrors.category = 'Выберите категорию';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  function validateStep2(): boolean {
    const newErrors: { [key: string]: string } = {};

    if (!formData.event_city) {
      newErrors.event_city = 'Выберите город';
    }

    if (!formData.event_date) {
      newErrors.event_date = 'Выберите дату';
    }

    if (!formData.guest_count) {
      newErrors.guest_count = 'Укажите количество гостей';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  function validateStep3(): boolean {
    const newErrors: { [key: string]: string } = {};

    if (formData.budget_min && !formData.budget_max) {
      newErrors.budget = 'Заполните максимальный бюджет или оставьте оба поля пустыми';
    }

    if (formData.budget_max && !formData.budget_min) {
      newErrors.budget = 'Заполните минимальный бюджет или оставьте оба поля пустыми';
    }

    if (formData.budget_min && formData.budget_max) {
      if (parseFloat(formData.budget_min) >= parseFloat(formData.budget_max)) {
        newErrors.budget = 'Минимальный бюджет должен быть меньше максимального';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  function handleNextClick() {
    if (step === 1) {
      if (validateStep1()) setStep(2);
      return;
    }

    if (step === 2) {
      if (validateStep2()) setStep(3);
    }
  }

  function handleBackClick() {
    setStep((currentStep) => Math.max(1, currentStep - 1));
    setErrors({});
  }

  async function handleSubmit() {
    if (!validateStep3()) return;

    setLoading(true);

    try {
      const rawUser = localStorage.getItem('user');
      const storedUser = rawUser ? JSON.parse(rawUser) : null;
      const organizerName = storedUser?.fullName || storedUser?.name || '';
      const organizerEmail = storedUser?.email || '';

      const formDataToSend = new FormData();

      formDataToSend.append('title', formData.title);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('category', formData.category);
      formDataToSend.append('subcategories', JSON.stringify(formData.subcategories));
      formDataToSend.append('event_city', formData.event_city);
      formDataToSend.append('event_date', formData.event_date);
      formDataToSend.append('guest_count', formData.guest_count);
      formDataToSend.append('venue_name', formData.venue_name || '');
      formDataToSend.append('venue_type', formData.venue_type || '');
      formDataToSend.append('format', formData.format);
      formDataToSend.append('budget_min', formData.budget_min || '');
      formDataToSend.append('budget_max', formData.budget_max || '');
      formDataToSend.append('organizer_name', organizerName);
      formDataToSend.append('organizer_email', organizerEmail);

      if (uploadedFile) {
        formDataToSend.append('rider', uploadedFile);
      }

      const response = await fetch('/api/job-postings', {
        method: 'POST',
        body: formDataToSend,
      });

      if (response.ok) {
        const data = await response.json();

        alert('Заявка успешно создана');

        setFormData({
          title: '',
          description: '',
          category: '',
          subcategories: [],
          event_city: '',
          event_date: '',
          guest_count: '',
          venue_name: '',
          venue_type: '',
          format: 'mixed',
          budget_min: '',
          budget_max: '',
          rider_file_url: '',
        });

        setUploadedFile(null);
        setStep(1);
        setErrors({});

        router.push(`/marketplace?highlight=${data.id}`);
      } else {
        const error = await response.json();
        alert(`Ошибка: ${error.error}`);
        setLoading(false);
      }
    } catch (error) {
      console.error('Error creating job posting:', error);
      alert('Ошибка при создании заявки');
      setLoading(false);
    }
  }

  const progressPercent = (step / 3) * 100;

  return (
    <main className="min-h-screen bg-[#F7F8FC] text-slate-950">
      <section className="relative overflow-hidden bg-[#070B18]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(109,61,255,0.35),transparent_30%),radial-gradient(circle_at_80%_10%,rgba(37,99,255,0.24),transparent_28%),radial-gradient(circle_at_70%_80%,rgba(0,194,255,0.14),transparent_32%)]" />
        <div className="absolute inset-0 opacity-40 [background-image:linear-gradient(rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.04)_1px,transparent_1px)] [background-size:64px_64px]" />

        <div className="relative z-10 mx-auto max-w-7xl px-6 py-10 lg:py-14">
          <div className="mb-8">
            <Link
              href="/marketplace"
              className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/10 px-4 py-2.5 text-sm font-black text-white/80 backdrop-blur transition hover:bg-white/15 hover:text-white"
            >
              ← Вернуться в маркетплейс
            </Link>
          </div>

          <div className="grid gap-8 lg:grid-cols-[1fr_420px] lg:items-end">
            <div>
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-4 py-2 text-sm font-bold text-white/75 backdrop-blur">
                <span className="h-2 w-2 rounded-full bg-cyan-300" />
                Новая заявка для вендоров
              </div>

              <h1 className="max-w-4xl text-4xl font-black leading-tight tracking-tight text-white md:text-6xl">
                Создайте заявку для концертной индустрии
              </h1>

              <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-300">
                Опишите событие, выберите категорию, город, дату, бюджет и документы.
                После публикации заявка появится в маркетплейсе для подходящих вендоров.
              </p>
            </div>

            <div className="rounded-[1.5rem] border border-white/10 bg-white/10 p-5 backdrop-blur-xl">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-black text-white">Прогресс заявки</div>
                  <div className="mt-1 text-xs font-semibold text-slate-400">
                    Шаг {step} из 3
                  </div>
                </div>

                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-lg font-black text-slate-950">
                  {step}/3
                </div>
              </div>

              <div className="mt-5 h-2 overflow-hidden rounded-full bg-white/10">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-violet-400 to-blue-400 transition-all duration-300"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>

              <div className="mt-5 grid grid-cols-3 gap-3">
                <StepPill active={step >= 1} label="Описание" />
                <StepPill active={step >= 2} label="Детали" />
                <StepPill active={step >= 3} label="Бюджет" />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-6 px-6 py-8 lg:grid-cols-[320px_1fr]">
        <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
          <div className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-sm font-black text-slate-950">Этапы создания</h2>

            <div className="mt-5 space-y-3">
              <SidebarStep
                number="1"
                title="Основная информация"
                desc="Название, описание и категория"
                active={step === 1}
                done={step > 1}
              />
              <SidebarStep
                number="2"
                title="Детали события"
                desc="Город, дата, аудитория и формат"
                active={step === 2}
                done={step > 2}
              />
              <SidebarStep
                number="3"
                title="Бюджет и документы"
                desc="Диапазон бюджета и вложения"
                active={step === 3}
                done={false}
              />
            </div>
          </div>

          <div className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-sm font-black text-slate-950">Кратко по заявке</h2>

            <div className="mt-4 space-y-3">
              <SummaryItem label="Название" value={formData.title || 'Не указано'} />
              <SummaryItem
                label="Категория"
                value={currentCategory?.name_ru || 'Не выбрана'}
              />
              <SummaryItem label="Город" value={formData.event_city || 'Не выбран'} />
              <SummaryItem label="Дата" value={formData.event_date || 'Не указана'} />
              <SummaryItem
                label="Гостей"
                value={formData.guest_count ? formData.guest_count : 'Не указано'}
              />
            </div>
          </div>

          <div className="rounded-[1.5rem] border border-violet-100 bg-violet-50 p-5">
            <h3 className="text-sm font-black text-violet-800">Совет</h3>
            <p className="mt-2 text-sm font-semibold leading-6 text-violet-700">
              Чем точнее описание, дата, город и бюджет — тем выше шанс получить
              релевантные предложения от вендоров.
            </p>
          </div>
        </aside>

        <section className="min-w-0">
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm lg:p-8">
            {step === 1 && (
              <div className="space-y-6">
                <SectionTitle
                  icon="📋"
                  title="Основная информация"
                  desc="Расскажите, что именно нужно для вашего события."
                />

                <FieldBlock label="Название заявки" required error={errors.title}>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    placeholder="Например: Звук и свет для концерта на 1 200 человек"
                    className={inputClass(errors.title)}
                  />
                </FieldBlock>

                <FieldBlock label="Описание" required error={errors.description}>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Опишите формат события, требования, тайминг, важные условия, ожидания от вендора..."
                    rows={7}
                    className={inputClass(errors.description)}
                  />
                </FieldBlock>

                <FieldBlock label="Категория" required error={errors.category}>
                  <select
                    name="category"
                    value={formData.category}
                    aria-label="Категория заявки"
                    onChange={(event) => {
                      handleChange(event);
                      setFormData((previousData) => ({
                        ...previousData,
                        category: event.target.value,
                        subcategories: [],
                      }));
                    }}
                    className={inputClass(errors.category)}
                  >
                    <option value="">Выберите категорию</option>
                    {MAIN_CATEGORIES.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.icon} {category.name_ru}
                      </option>
                    ))}
                  </select>
                </FieldBlock>

                {currentCategory && subcategoryOptions.length > 0 && (
                  <div>
                    <div className="mb-3">
                      <label className="text-sm font-black text-slate-950">
                        Специализация
                      </label>
                      <p className="mt-1 text-xs font-semibold text-slate-500">
                        Можно выбрать несколько подкатегорий.
                      </p>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2">
                      {subcategoryOptions.map((subcategory) => (
                        <label
                          key={subcategory.id}
                          className={`cursor-pointer rounded-2xl border-2 p-4 transition ${
                            formData.subcategories.includes(subcategory.id)
                              ? 'border-violet-500 bg-violet-50 shadow-lg shadow-violet-500/10'
                              : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={formData.subcategories.includes(subcategory.id)}
                            onChange={() => toggleSubcategory(subcategory.id)}
                            className="sr-only"
                          />

                          <div className="flex items-center justify-between gap-3">
                            <span className="text-sm font-black text-slate-900">
                              {subcategory.name_ru}
                            </span>

                            <span
                              className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-black ${
                                formData.subcategories.includes(subcategory.id)
                                  ? 'bg-violet-600 text-white'
                                  : 'bg-slate-100 text-slate-400'
                              }`}
                            >
                              ✓
                            </span>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {step === 2 && (
              <div className="space-y-6">
                <SectionTitle
                  icon="📅"
                  title="Детали события"
                  desc="Укажите город, дату, аудиторию и площадку."
                />

                <div className="grid gap-5 md:grid-cols-2">
                  <FieldBlock label="Город" required error={errors.event_city}>
                    <select
                      name="event_city"
                      value={formData.event_city}
                      aria-label="Город события"
                      onChange={handleChange}
                      className={inputClass(errors.event_city)}
                    >
                      <option value="">Выберите город</option>
                      {DEFAULT_CITIES.map((city) => (
                        <option key={city} value={city}>
                          {city}
                        </option>
                      ))}
                    </select>
                  </FieldBlock>

                  <FieldBlock label="Дата события" required error={errors.event_date}>
                    <input
                      type="date"
                      name="event_date"
                      value={formData.event_date}
                      aria-label="Дата события"
                      onChange={handleChange}
                      className={inputClass(errors.event_date)}
                    />
                  </FieldBlock>
                </div>

                <FieldBlock label="Ожидаемая аудитория" required error={errors.guest_count}>
                  <input
                    type="number"
                    name="guest_count"
                    value={formData.guest_count}
                    onChange={handleChange}
                    placeholder="Количество человек"
                    className={inputClass(errors.guest_count)}
                  />
                </FieldBlock>

                <div className="grid gap-5 md:grid-cols-2">
                  <FieldBlock label="Название площадки">
                    <input
                      type="text"
                      name="venue_name"
                      value={formData.venue_name}
                      onChange={handleChange}
                      placeholder="Например: Microsoft Theater"
                      className={inputClass()}
                    />
                  </FieldBlock>

                  <FieldBlock label="Тип площадки">
                    <input
                      type="text"
                      name="venue_type"
                      value={formData.venue_type}
                      onChange={handleChange}
                      placeholder="Арена, клуб, театр, outdoor..."
                      className={inputClass()}
                    />
                  </FieldBlock>
                </div>

                <div>
                  <div className="mb-3">
                    <label className="text-sm font-black text-slate-950">
                      Формат события
                    </label>
                    <p className="mt-1 text-xs font-semibold text-slate-500">
                      Выберите формат аудитории.
                    </p>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-3">
                    {[
                      { value: 'seated', title: 'Сидячий', desc: 'Театр, зал, seated event', icon: '🪑' },
                      { value: 'standing', title: 'Стоячий', desc: 'Клуб, танцпол, standing room', icon: '🚶' },
                      { value: 'mixed', title: 'Смешанный', desc: 'Комбинированный формат', icon: '📊' },
                    ].map((format) => (
                      <label
                        key={format.value}
                        className={`cursor-pointer rounded-2xl border-2 p-4 transition ${
                          formData.format === format.value
                            ? 'border-violet-500 bg-violet-50 shadow-lg shadow-violet-500/10'
                            : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
                        }`}
                      >
                        <input
                          type="radio"
                          name="format"
                          value={format.value}
                          checked={formData.format === format.value}
                          onChange={(event) =>
                            setFormData((previousData) => ({
                              ...previousData,
                              format: event.target.value as EventFormat,
                            }))
                          }
                          className="sr-only"
                        />

                        <div className="text-2xl">{format.icon}</div>
                        <div className="mt-3 text-sm font-black text-slate-950">
                          {format.title}
                        </div>
                        <div className="mt-1 text-xs font-semibold leading-5 text-slate-500">
                          {format.desc}
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-6">
                <SectionTitle
                  icon="💰"
                  title="Бюджет и документы"
                  desc="Бюджет необязателен, но помогает получить более точные предложения."
                />

                <div className="rounded-[1.5rem] border border-violet-100 bg-violet-50 p-5">
                  <h3 className="text-sm font-black text-violet-800">
                    Как указывать бюджет
                  </h3>
                  <ul className="mt-3 space-y-2 text-sm font-semibold text-violet-700">
                    <li>• Можно оставить бюджет пустым.</li>
                    <li>• Диапазон помогает отсеять неподходящих подрядчиков.</li>
                    <li>• Лучше указывать реалистичный бюджет для вашей категории.</li>
                  </ul>
                </div>

                <div className="grid gap-5 md:grid-cols-2">
                  <FieldBlock label="Бюджет от">
                    <input
                      type="number"
                      name="budget_min"
                      value={formData.budget_min}
                      onChange={handleChange}
                      placeholder="Минимальный бюджет"
                      className={inputClass()}
                    />
                  </FieldBlock>

                  <FieldBlock label="Бюджет до">
                    <input
                      type="number"
                      name="budget_max"
                      value={formData.budget_max}
                      onChange={handleChange}
                      placeholder="Максимальный бюджет"
                      className={inputClass()}
                    />
                  </FieldBlock>
                </div>

                {errors.budget && (
                  <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-black text-red-700">
                    {errors.budget}
                  </div>
                )}

                {formData.budget_min && formData.budget_max && (
                  <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-5">
                    <p className="text-xs font-black uppercase tracking-wide text-slate-400">
                      Итоговый диапазон
                    </p>
                    <p className="mt-2 text-3xl font-black text-slate-950">
                      {parseInt(formData.budget_min).toLocaleString('ru')} –{' '}
                      {parseInt(formData.budget_max).toLocaleString('ru')} ₽
                    </p>
                  </div>
                )}

                <div className="border-t border-slate-100 pt-6">
                  <h3 className="text-lg font-black text-slate-950">
                    Вложения
                  </h3>
                  <p className="mt-1 text-sm font-semibold text-slate-500">
                    Можно загрузить райдер, техзадание, таблицу или документ.
                  </p>

                  <div
                    className={`mt-4 rounded-[1.5rem] border-2 border-dashed p-8 text-center transition ${
                      uploadedFile
                        ? 'border-violet-300 bg-violet-50'
                        : 'border-slate-300 bg-slate-50 hover:border-violet-300 hover:bg-violet-50'
                    }`}
                  >
                    <input
                      type="file"
                      id="rider-upload"
                      onChange={handleFileUpload}
                      className="hidden"
                      accept=".pdf,.doc,.docx,.xls,.xlsx"
                    />

                    <label htmlFor="rider-upload" className="block cursor-pointer">
                      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-white text-3xl shadow-sm">
                        📄
                      </div>

                      <p className="mt-4 text-sm font-black text-slate-950">
                        {uploadedFile
                          ? `Файл загружен: ${uploadedFile.name}`
                          : 'Нажмите для загрузки файла'}
                      </p>

                      <p className="mt-1 text-xs font-semibold text-slate-500">
                        PDF, DOC, DOCX, XLS, XLSX · максимум 10 МБ
                      </p>
                    </label>
                  </div>

                  {errors.rider && (
                    <p className="mt-2 text-xs font-black text-red-500">
                      {errors.rider}
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="mt-6 flex items-center justify-between gap-4">
            {step > 1 ? (
              <button
                type="button"
                onClick={handleBackClick}
                className="rounded-xl border border-slate-200 bg-white px-6 py-3 text-sm font-black text-slate-700 shadow-sm transition hover:bg-slate-50"
              >
                ← Назад
              </button>
            ) : (
              <div />
            )}

            {step < 3 ? (
              <button
                type="button"
                onClick={handleNextClick}
                className="inline-flex items-center gap-2 rounded-xl bg-slate-950 px-6 py-3 text-sm font-black text-white shadow-lg shadow-slate-950/10 transition hover:-translate-y-0.5 hover:bg-violet-600"
              >
                Далее →
              </button>
            ) : (
              <Button
                loading={loading}
                type="button"
                onClick={handleSubmit}
                className="rounded-xl bg-gradient-to-r from-violet-600 to-blue-600 px-6 py-3 text-sm font-black text-white shadow-lg shadow-violet-500/20 transition hover:-translate-y-0.5"
              >
                Опубликовать заявку
              </Button>
            )}
          </div>
        </section>
      </section>
    </main>
  );
}

function StepPill({ active, label }: { active: boolean; label: string }) {
  return (
    <div
      className={`rounded-xl px-3 py-2 text-center text-xs font-black ${
        active ? 'bg-white text-slate-950' : 'bg-white/10 text-white/40'
      }`}
    >
      {label}
    </div>
  );
}

function SidebarStep({
  number,
  title,
  desc,
  active,
  done,
}: {
  number: string;
  title: string;
  desc: string;
  active: boolean;
  done: boolean;
}) {
  return (
    <div
      className={`rounded-2xl border p-4 transition ${
        active
          ? 'border-violet-200 bg-violet-50'
          : done
            ? 'border-emerald-100 bg-emerald-50'
            : 'border-slate-200 bg-white'
      }`}
    >
      <div className="flex items-start gap-3">
        <div
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-sm font-black ${
            active
              ? 'bg-violet-600 text-white'
              : done
                ? 'bg-emerald-600 text-white'
                : 'bg-slate-100 text-slate-500'
          }`}
        >
          {done ? '✓' : number}
        </div>

        <div>
          <div className="text-sm font-black text-slate-950">{title}</div>
          <div className="mt-1 text-xs font-semibold leading-5 text-slate-500">
            {desc}
          </div>
        </div>
      </div>
    </div>
  );
}

function SummaryItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-xs font-black uppercase tracking-wide text-slate-400">
        {label}
      </div>
      <div className="mt-1 truncate text-sm font-black text-slate-950">
        {value}
      </div>
    </div>
  );
}

function SectionTitle({
  icon,
  title,
  desc,
}: {
  icon: string;
  title: string;
  desc: string;
}) {
  return (
    <div className="border-b border-slate-100 pb-6">
      <div className="flex items-start gap-4">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-violet-50 text-3xl">
          {icon}
        </div>

        <div>
          <h2 className="text-2xl font-black text-slate-950">{title}</h2>
          <p className="mt-2 text-sm font-semibold leading-6 text-slate-500">
            {desc}
          </p>
        </div>
      </div>
    </div>
  );
}

function FieldBlock({
  label,
  required,
  error,
  children,
}: {
  label: string;
  required?: boolean;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-black text-slate-950">
        {label}
        {required && <span className="ml-1 text-red-500">*</span>}
      </label>

      {children}

      {error && (
        <p className="mt-2 text-xs font-black text-red-500">
          {error}
        </p>
      )}
    </div>
  );
}

function inputClass(error?: string) {
  return `w-full rounded-2xl border bg-slate-50 px-4 py-4 text-sm font-semibold text-slate-950 outline-none transition focus:bg-white focus:ring-4 focus:ring-violet-500/10 ${
    error
      ? 'border-red-300 focus:border-red-300'
      : 'border-slate-200 focus:border-violet-300'
  }`;
}