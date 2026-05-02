'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

interface Vendor {
  id: string;
  name: string;
  primary_city: string;
  status: string;
}

interface User {
  id: string;
  email: string;
  name?: string;
  role: 'admin' | 'vendor' | 'buyer';
  vendor_id?: string;
}

const roleLabels = {
  admin: 'Администратор',
  vendor: 'Вендор',
  buyer: 'Организатор',
};

function LogoMark() {
  return (
    <div className="relative flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 via-indigo-500 to-blue-500 shadow-lg shadow-violet-500/25">
      <svg
        viewBox="0 0 48 48"
        className="h-7 w-7 text-white"
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
  );
}

export function Header() {
  const router = useRouter();
  const pathname = usePathname();

  const [user, setUser] = useState<User | null>(null);
  const [vendor, setVendor] = useState<Vendor | null>(null);
  const [showMenu, setShowMenu] = useState(false);
  const [vendorLoading, setVendorLoading] = useState(false);

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (!userStr) return;

    try {
      const parsedUser = JSON.parse(userStr);
      setUser(parsedUser);

      if (parsedUser.role === 'vendor' || parsedUser.role === 'buyer') {
        setVendorLoading(true);

        fetch('/api/admin/vendors')
          .then((response) => response.json())
          .then((vendors: any[]) => {
            const userVendor = parsedUser.vendor_id
              ? vendors.find((item: any) => item.id === parsedUser.vendor_id)
              : vendors.find((item: any) => item.email === parsedUser.email) || vendors[0];

            if (userVendor) {
              setVendor(userVendor);
            }
          })
          .catch((error) => console.error('Ошибка загрузки вендора:', error))
          .finally(() => setVendorLoading(false));
      }
    } catch (error) {
      console.error('Ошибка парсинга user:', error);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('authToken');
    router.push('/');
  };

  if (!user) return null;

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/85 shadow-sm backdrop-blur-xl">
      <div className="mx-auto max-w-7xl px-6">
        <div className="flex h-20 items-center justify-between gap-4">
          <Link
            href="/"
            className="flex shrink-0 items-center gap-3 transition hover:opacity-90"
          >
            <LogoMark />

            <div className="hidden leading-tight sm:block">
              <div className="text-lg font-black tracking-tight text-slate-950">
                ConcertGid
              </div>
              <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">
                Маркетплейс концертов
              </div>
            </div>
          </Link>

          <nav className="hidden flex-1 items-center justify-center gap-1 md:flex">
            <NavLink
              href="/search"
              icon="🔍"
              label="Поиск"
              active={pathname === '/search'}
            />
            <NavLink
              href="/marketplace"
              icon="🎭"
              label="Маркетплейс"
              active={pathname === '/marketplace'}
            />

            {user.role === 'buyer' && (
              <NavLink
                href="/create-request"
                icon="➕"
                label="Создать заявку"
                active={pathname === '/create-request'}
              />
            )}

            {user.role === 'admin' && (
              <NavLink
                href="/admin"
                icon="⚙️"
                label="Панель"
                active={pathname?.startsWith('/admin')}
              />
            )}
          </nav>

          <div className="ml-auto flex items-center gap-2">
            {(user.role === 'vendor' || user.role === 'buyer') && (
              <>
                {vendorLoading ? (
                  <div className="hidden items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2 sm:flex">
                    <div className="h-8 w-8 animate-pulse rounded-xl bg-slate-200" />
                    <div>
                      <div className="h-3 w-24 animate-pulse rounded bg-slate-200" />
                      <div className="mt-1 h-3 w-16 animate-pulse rounded bg-slate-200" />
                    </div>
                  </div>
                ) : vendor ? (
                  <Link href={`/vendors/${vendor.id}`} className="hidden sm:block">
                    <div className="group flex items-center gap-3 rounded-2xl border border-violet-100 bg-gradient-to-r from-violet-50 to-blue-50 px-4 py-2 transition hover:-translate-y-0.5 hover:border-violet-200 hover:shadow-lg hover:shadow-violet-500/10">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-blue-500 text-xs font-black text-white shadow-md shadow-violet-500/20">
                        {vendor.name.charAt(0).toUpperCase()}
                      </div>

                      <div className="min-w-0">
                        <p className="max-w-[150px] truncate text-xs font-black text-slate-950">
                          {vendor.name}
                        </p>
                        <p className="text-xs font-semibold text-slate-500">
                          📍 {vendor.primary_city}
                        </p>
                      </div>

                      <span className="text-xs font-black text-violet-600 transition group-hover:translate-x-0.5">
                        →
                      </span>
                    </div>
                  </Link>
                ) : (
                  <Link href="/admin/vendors/new" className="hidden sm:block">
                    <button className="rounded-xl border border-violet-200 bg-violet-50 px-4 py-2.5 text-sm font-black text-violet-700 transition hover:-translate-y-0.5 hover:bg-violet-100">
                      + Создать профиль
                    </button>
                  </Link>
                )}
              </>
            )}

            <div className="relative">
              <button
                onClick={() => setShowMenu((value) => !value)}
                className="flex items-center gap-3 rounded-2xl px-3 py-2 transition hover:bg-slate-50"
              >
                <div className="hidden flex-col items-end sm:flex">
                  <p className="max-w-[150px] truncate text-xs font-black text-slate-950">
                    {user.name || user.email.split('@')[0]}
                  </p>
                  <p className="text-xs font-semibold text-slate-400">
                    {roleLabels[user.role]}
                  </p>
                </div>

                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-slate-950 text-sm font-black text-white shadow-lg shadow-slate-950/10">
                  {user.role === 'admin' ? '⚙️' : user.role === 'vendor' ? '🏢' : '👤'}
                </div>
              </button>

              {showMenu && (
                <div className="absolute right-0 mt-2 w-72 overflow-hidden rounded-[1.5rem] border border-slate-200 bg-white shadow-2xl shadow-slate-950/15">
                  <div className="border-b border-slate-100 bg-slate-50 px-5 py-4">
                    <p className="mb-1 text-xs font-black uppercase tracking-wide text-slate-400">
                      Вход как
                    </p>
                    <p className="truncate text-sm font-black text-slate-950">
                      {user.email}
                    </p>
                    <p className="mt-0.5 text-xs font-semibold text-slate-500">
                      {roleLabels[user.role]}
                    </p>
                  </div>

                  <div className="py-2">
                    <MenuLink href="/search" icon="🔍" label="Поиск вендоров" />
                    <MenuLink href="/marketplace" icon="🎭" label="Маркетплейс заявок" />

                    {(user.role === 'vendor' || user.role === 'buyer') && vendor && (
                      <>
                        <div className="my-2 border-t border-slate-100" />
                        <MenuLink
                          href={`/vendors/${vendor.id}`}
                          icon="👁️"
                          label={`Профиль: ${vendor.name}`}
                        />
                      </>
                    )}

                    {(user.role === 'vendor' || user.role === 'buyer') && !vendor && (
                      <>
                        <div className="my-2 border-t border-slate-100" />
                        <MenuLink
                          href="/admin/vendors/new"
                          icon="➕"
                          label="Создать профиль вендора"
                        />
                      </>
                    )}

                    <div className="my-2 border-t border-slate-100" />
                    <MenuLink href="/dashboard" icon="📊" label="Кабинет" />
                    <MenuLink href="/messages" icon="💬" label="Сообщения" />

                    {user.role === 'buyer' && (
                      <MenuLink href="/create-request" icon="➕" label="Создать заявку" />
                    )}

                    {user.role === 'admin' && (
                      <MenuLink href="/admin" icon="⚙️" label="Админ-панель" />
                    )}
                  </div>

                  <button
                    onClick={handleLogout}
                    className="w-full border-t border-slate-100 px-5 py-4 text-left text-sm font-black text-red-600 transition hover:bg-red-50"
                  >
                    🚪 Выход
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        <nav className="flex items-center gap-1 overflow-x-auto border-t border-slate-100 py-2 md:hidden">
          <MobileNavLink
            href="/search"
            icon="🔍"
            label="Поиск"
            active={pathname === '/search'}
          />
          <MobileNavLink
            href="/marketplace"
            icon="🎭"
            label="Маркетплейс"
            active={pathname === '/marketplace'}
          />

          {user.role === 'buyer' && (
            <MobileNavLink
              href="/create-request"
              icon="➕"
              label="Создать"
              active={pathname === '/create-request'}
            />
          )}

          {user.role === 'admin' && (
            <MobileNavLink
              href="/admin"
              icon="⚙️"
              label="Панель"
              active={pathname?.startsWith('/admin')}
            />
          )}

          <MobileNavLink
            href="/dashboard"
            icon="📊"
            label="Кабинет"
            active={pathname === '/dashboard'}
          />
        </nav>
      </div>
    </header>
  );
}

function NavLink({
  href,
  icon,
  label,
  active,
}: {
  href: string;
  icon: string;
  label: string;
  active?: boolean;
}) {
  return (
    <Link href={href}>
      <div
        className={`flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-black transition ${
          active
            ? 'bg-slate-950 text-white shadow-lg shadow-slate-950/10'
            : 'text-slate-600 hover:bg-slate-50 hover:text-slate-950'
        }`}
      >
        <span>{icon}</span>
        <span>{label}</span>
      </div>
    </Link>
  );
}

function MobileNavLink({
  href,
  icon,
  label,
  active,
}: {
  href: string;
  icon: string;
  label: string;
  active?: boolean;
}) {
  return (
    <Link href={href} className="shrink-0">
      <div
        className={`flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-black transition ${
          active
            ? 'bg-slate-950 text-white'
            : 'text-slate-600 hover:bg-slate-50 hover:text-slate-950'
        }`}
      >
        <span>{icon}</span>
        <span>{label}</span>
      </div>
    </Link>
  );
}

function MenuLink({
  href,
  icon,
  label,
}: {
  href: string;
  icon: string;
  label: string;
}) {
  return (
    <Link href={href}>
      <div className="flex items-center gap-3 px-5 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50 hover:text-slate-950">
        <span>{icon}</span>
        <span className="truncate">{label}</span>
      </div>
    </Link>
  );
}