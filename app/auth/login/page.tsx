'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';

export default function LoginPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = event.target;

    setFormData((previousData) => ({
      ...previousData,
      [name]: value,
    }));
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();

    setError('');
    setLoading(true);

    if (formData.email === 'tour@fangid.com' && formData.password === 'admin123') {
      const user = {
        fullName: 'Administrator',
        name: 'Administrator',
        email: 'tour@fangid.com',
        role: 'admin',
      };

      const token = 'admin-token-' + Date.now();

      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('authToken', token);

      document.cookie = `user=${encodeURIComponent(JSON.stringify(user))}; path=/; max-age=604800`;
      document.cookie = `authToken=${token}; path=/; max-age=604800`;

      setTimeout(() => {
        router.push('/admin');
      }, 500);

      return;
    }

    if (formData.email && formData.password.length >= 6) {
      let role: 'buyer' | 'vendor' = 'buyer';
      let vendorId: string | undefined;

      try {
        const vendorResponse = await fetch(`/api/admin/vendors?search=${encodeURIComponent(formData.email)}`);

        if (vendorResponse.ok) {
          const vendorData = await vendorResponse.json();
          const matchedVendor = Array.isArray(vendorData)
            ? vendorData.find((vendor) => vendor?.email?.toLowerCase() === formData.email.toLowerCase())
            : null;

          if (matchedVendor) {
            role = 'vendor';
            vendorId = matchedVendor.id;
          }
        }
      } catch (lookupError) {
        console.error('Vendor lookup failed during login:', lookupError);
      }

      const user = {
        fullName: 'Test User',
        name: 'Test User',
        email: formData.email,
        role,
        vendor_id: vendorId,
      };

      const token = 'token-' + Date.now();

      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('authToken', token);

      document.cookie = `user=${encodeURIComponent(JSON.stringify(user))}; path=/; max-age=604800`;
      document.cookie = `authToken=${token}; path=/; max-age=604800`;

      setTimeout(() => {
        router.push('/dashboard');
      }, 500);

      return;
    }

    setError('Неверный email или пароль');
    setLoading(false);
  }

  return (
    <main className="min-h-screen bg-[#070B18] text-slate-950">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(109,61,255,0.35),transparent_30%),radial-gradient(circle_at_80%_10%,rgba(37,99,255,0.24),transparent_28%),radial-gradient(circle_at_70%_80%,rgba(0,194,255,0.14),transparent_32%)]" />
      <div className="absolute inset-0 opacity-40 [background-image:linear-gradient(rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.04)_1px,transparent_1px)] [background-size:64px_64px]" />

      <section className="relative z-10 mx-auto grid min-h-screen max-w-7xl px-6 py-10 lg:grid-cols-[1fr_500px] lg:items-center lg:gap-16">
        <div className="hidden lg:block">
          <Link href="/" className="inline-flex items-center gap-3">
            <div className="relative flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 via-indigo-500 to-blue-500 shadow-lg shadow-violet-500/25">
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

            <div>
              <div className="text-2xl font-black tracking-tight text-white">
                ConcertGid
              </div>
              <div className="text-xs font-bold uppercase tracking-[0.22em] text-white/45">
                Маркетплейс концертов
              </div>
            </div>
          </Link>

          <div className="mt-16 max-w-2xl">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-4 py-2 text-sm font-bold text-white/75 backdrop-blur">
              <span className="h-2 w-2 rounded-full bg-cyan-300" />
              B2B платформа для концертной индустрии
            </div>

            <h1 className="text-6xl font-black leading-tight tracking-tight text-white">
              Войдите в рабочий кабинет ConcertGid
            </h1>

            <p className="mt-6 max-w-xl text-lg leading-8 text-slate-300">
              Управляйте заявками, вендорами, площадками, сообщениями, профилем
              компании и сделками в одном месте.
            </p>

            <div className="mt-10 grid max-w-xl grid-cols-2 gap-4">
              <div className="rounded-[1.5rem] border border-white/10 bg-white/10 p-5 backdrop-blur">
                <div className="text-3xl font-black text-white">9</div>
                <div className="mt-2 text-sm font-semibold text-slate-400">
                  основных категорий
                </div>
              </div>

              <div className="rounded-[1.5rem] border border-white/10 bg-white/10 p-5 backdrop-blur">
                <div className="text-3xl font-black text-white">B2B</div>
                <div className="mt-2 text-sm font-semibold text-slate-400">
                  только индустрия событий
                </div>
              </div>

              <div className="rounded-[1.5rem] border border-white/10 bg-white/10 p-5 backdrop-blur">
                <div className="text-3xl font-black text-white">✓</div>
                <div className="mt-2 text-sm font-semibold text-slate-400">
                  проверенные профили
                </div>
              </div>

              <div className="rounded-[1.5rem] border border-white/10 bg-white/10 p-5 backdrop-blur">
                <div className="text-3xl font-black text-white">24/7</div>
                <div className="mt-2 text-sm font-semibold text-slate-400">
                  доступ к платформе
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mx-auto w-full max-w-md lg:max-w-none">
          <div className="mb-8 flex justify-center lg:hidden">
            <Link href="/" className="inline-flex items-center gap-3">
              <div className="relative flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 via-indigo-500 to-blue-500 shadow-lg shadow-violet-500/25">
                <span className="text-lg font-black text-white">CG</span>
              </div>

              <div>
                <div className="text-2xl font-black tracking-tight text-white">
                  ConcertGid
                </div>
                <div className="text-xs font-bold uppercase tracking-[0.22em] text-white/45">
                  Маркетплейс концертов
                </div>
              </div>
            </Link>
          </div>

          <div className="overflow-hidden rounded-[2rem] border border-white/10 bg-white shadow-2xl shadow-black/30">
            <div className="bg-gradient-to-r from-violet-600 via-indigo-600 to-blue-600 px-8 py-8 text-white">
              <div className="inline-flex rounded-full bg-white/15 px-3 py-1 text-xs font-black text-white/90">
                Вход в аккаунт
              </div>

              <h2 className="mt-5 text-3xl font-black tracking-tight">
                Добро пожаловать
              </h2>

              <p className="mt-2 text-sm font-semibold text-violet-100">
                Войдите, чтобы продолжить работу с заявками, вендорами и
                сообщениями.
              </p>
            </div>

            <div className="p-8">
              {error && (
                <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-4">
                  <p className="text-sm font-black text-red-700">
                    {error}
                  </p>
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <div className="mb-5">
                  <label className="mb-2 block text-sm font-black text-slate-900">
                    Email
                  </label>

                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Введите email"
                    required
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm font-semibold text-slate-950 outline-none transition focus:border-violet-300 focus:bg-white focus:ring-4 focus:ring-violet-500/10"
                  />
                </div>

                <div className="mb-5">
                  <label className="mb-2 block text-sm font-black text-slate-900">
                    Пароль
                  </label>

                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Введите пароль"
                    required
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm font-semibold text-slate-950 outline-none transition focus:border-violet-300 focus:bg-white focus:ring-4 focus:ring-violet-500/10"
                  />
                </div>

                <div className="mb-6 flex items-center justify-between gap-3">
                  <label className="flex cursor-pointer items-center gap-2">
                    <input
                      type="checkbox"
                      className="h-4 w-4 rounded accent-violet-600"
                    />
                    <span className="text-sm font-semibold text-slate-600">
                      Запомнить меня
                    </span>
                  </label>

                  <Link
                    href="/auth/forgot-password"
                    className="text-sm font-black text-violet-600 transition hover:text-violet-700"
                  >
                    Забыли пароль?
                  </Link>
                </div>

                <Button
                  loading={loading}
                  size="lg"
                  className="w-full rounded-2xl bg-slate-950 text-white hover:bg-violet-700"
                  type="submit"
                >
                  Войти
                </Button>
              </form>

              <div className="mt-6 rounded-2xl bg-slate-50 p-4">
                <p className="text-xs font-black uppercase tracking-wide text-slate-400">
                  Тестовый доступ администратора
                </p>
                <p className="mt-2 text-sm font-semibold text-slate-600">
                  tour@fangid.com / admin123
                </p>
              </div>

              <div className="mt-6 border-t border-slate-100 pt-6 text-center">
                <p className="text-sm font-semibold text-slate-600">
                  Нет аккаунта?{' '}
                  <Link
                    href="/auth/register"
                    className="font-black text-violet-600 transition hover:text-violet-700"
                  >
                    Зарегистрироваться
                  </Link>
                </p>
              </div>
            </div>
          </div>

          <div className="mt-6 text-center">
            <Link
              href="/"
              className="text-sm font-black text-white/80 transition hover:text-white"
            >
              ← Вернуться на главную
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}