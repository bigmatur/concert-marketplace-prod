'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';

interface Stats {
  totalUsers: number;
  totalBuyers: number;
  totalVendors: number;
  activeVendors: number;
  totalRequests: number;
  activeRequests: number;
  totalReviews: number;
  averageRating: number;
  suspendedAccounts: number;
  blockedAccounts: number;
}

export default function StatisticsPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  async function loadStats() {
    try {
      setLoading(true);
      
      // Load all data
      const [usersRes, vendorsRes, requestsRes, reviewsRes] = await Promise.all([
        fetch('/api/admin/users'),
        fetch('/api/admin/vendors'),
        fetch('/api/admin/requests'),
        fetch('/api/admin/reviews'),
      ]);

      const [users, vendors, requests, reviews] = await Promise.all([
        usersRes.json(),
        vendorsRes.json(),
        requestsRes.json(),
        reviewsRes.json(),
      ]);

      const avgRating = reviews.length > 0
        ? (reviews.reduce((sum: number, r: any) => sum + (r.rating || 0), 0) / reviews.length).toFixed(1)
        : 0;

      setStats({
        totalUsers: users.length,
        totalBuyers: users.filter((u: any) => u.role === 'buyer').length,
        totalVendors: vendors.length,
        activeVendors: vendors.filter((v: any) => v.status === 'active').length,
        totalRequests: requests.length,
        activeRequests: requests.filter((r: any) => r.status === 'published' || r.status === 'collecting').length,
        totalReviews: reviews.length,
        averageRating: parseFloat(String(avgRating)),
        suspendedAccounts: users.filter((u: any) => u.status === 'suspended').length,
        blockedAccounts: users.filter((u: any) => u.status === 'blocked').length,
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setLoading(false);
    }
  }

  if (loading || !stats) {
    return <div className="text-center py-12">Loading...</div>;
  }

  const StatCard = ({ icon, label, value, color = 'blue' }: any) => (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
      <div className="text-3xl mb-2">{icon}</div>
      <p className="text-sm text-gray-600">{label}</p>
      <p className="text-3xl font-bold text-gray-900">{value}</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900">📊 Статистика платформы</h1>
          <Link href="/admin">
            <Button variant="ghost">← Назад</Button>
          </Link>
        </div>

        {/* User Stats */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">👥 Пользователи</h2>
          <div className="grid grid-cols-4 gap-6">
            <StatCard icon="👤" label="Всего пользователей" value={stats.totalUsers} />
            <StatCard icon="🎪" label="Организаторов" value={stats.totalBuyers} />
            <StatCard icon="🏢" label="Вендоров" value={stats.totalVendors} />
            <StatCard icon="✅" label="Активных вендоров" value={stats.activeVendors} />
          </div>
        </div>

        {/* Request Stats */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">📋 Заявки</h2>
          <div className="grid grid-cols-2 gap-6">
            <StatCard icon="📋" label="Всего заявок" value={stats.totalRequests} />
            <StatCard icon="⏳" label="Активных заявок" value={stats.activeRequests} />
          </div>
        </div>

        {/* Review Stats */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">⭐ Отзывы</h2>
          <div className="grid grid-cols-2 gap-6">
            <StatCard icon="⭐" label="Всего отзывов" value={stats.totalReviews} />
            <StatCard icon="📊" label="Средний рейтинг" value={stats.averageRating} />
          </div>
        </div>

        {/* Moderation Stats */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">🚨 Модерация</h2>
          <div className="grid grid-cols-2 gap-6">
            <StatCard icon="⏸️" label="Заморожено аккаунтов" value={stats.suspendedAccounts} />
            <StatCard icon="🚫" label="Заблокировано аккаунтов" value={stats.blockedAccounts} />
          </div>
        </div>

        {/* Refresh */}
        <Button onClick={loadStats}>🔄 Обновить статистику</Button>
      </div>
    </div>
  );
}