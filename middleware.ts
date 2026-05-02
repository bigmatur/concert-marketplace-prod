import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // ════════════════════════════════════════════════════════════════
  // ЗАЩИТА АДМИН МАРШРУТОВ
  // ════════════════════════════════════════════════════════════════

  if (pathname.startsWith('/admin')) {
    const token = request.cookies.get('authToken');

    if (!token) {
      return NextResponse.redirect(new URL('/auth/login', request.url));
    }

    return NextResponse.next();
  }

  // ════════════════════════════════════════════════════════════════
  // ЗАЩИТА DASHBOARD
  // ════════════════════════════════════════════════════════════════

  if (pathname.startsWith('/dashboard')) {
    const token = request.cookies.get('authToken');

    if (!token) {
      return NextResponse.redirect(new URL('/auth/login', request.url));
    }

    return NextResponse.next();
  }

  // ════════════════════════════════════════════════════════════════
  // ЗАЩИТА VENDOR DASHBOARD
  // ════════════════════════════════════════════════════════════════

  if (pathname.startsWith('/vendor/dashboard')) {
    const token = request.cookies.get('authToken');

    if (!token) {
      return NextResponse.redirect(new URL('/auth/login', request.url));
    }

    return NextResponse.next();
  }

  // ════════════════════════════════════════════════════════════════
  // ПЕРЕНАПРАВЛЕНИЯ
  // ════════════════════════════════════════════════════════════════

  if (pathname === '/register') {
    return NextResponse.redirect(new URL('/auth/register', request.url));
  }

  if (pathname === '/login') {
    return NextResponse.redirect(new URL('/auth/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/dashboard/:path*',
    '/vendor/dashboard/:path*',
    '/login',
    '/register',
  ],
};