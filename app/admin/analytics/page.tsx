'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { MAIN_CATEGORIES } from '@/lib/categories';

interface JobPosting {
  id: string;
  title: string;
  category: string;
  event_city: string;
  status: string;
  budget_min?: number;
  budget_max?: number;
  created_at: string;
}

interface Analytics {
  totalPostings: number;
  activePostings: number;
  closedPostings: number;
  archivedPostings: number;
  postingsByCategory: { name: string; value: number }[];
  postingsByCity: { name: string; value: number }[];
  averageBudget: number;
  budgetDistribution: { range: string; count: number }[];
  postingsThisMonth: number;
}

const COLORS = ['#8b5cf6', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6'];

export default function AdminAnalyticsPage() {
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const response = await fetch('/api/analytics');
      if (response.ok) {
        const data = await response.json();
        setAnalytics(data);
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Загрузка аналитики...</p>
        </div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <p className="text-gray-600">Ошибка при загрузке аналитики</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/admin/vendors">
            
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">📊 Аналитика</h1>
          <Button onClick={fetchAnalytics}>🔄 Обновить</Button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <p className="text-sm text-gray-600 mb-2">Всего заявок</p>
            <p className="text-3xl font-bold text-gray-900">{analytics.totalPostings}</p>
            <p className="text-xs text-gray-500 mt-2">за все время</p>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <p className="text-sm text-gray-600 mb-2">Активных</p>
            <p className="text-3xl font-bold text-green-600">{analytics.activePostings}</p>
            <p className="text-xs text-gray-500 mt-2">{Math.round((analytics.activePostings / analytics.totalPostings) * 100)}%</p>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <p className="text-sm text-gray-600 mb-2">За месяц</p>
            <p className="text-3xl font-bold text-blue-600">{analytics.postingsThisMonth}</p>
            <p className="text-xs text-gray-500 mt-2">новых заявок</p>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <p className="text-sm text-gray-600 mb-2">Средний бюджет</p>
            <p className="text-3xl font-bold text-purple-600">
              {analytics.averageBudget ? `${Math.round(analytics.averageBudget / 1000)}K` : '—'}
            </p>
            <p className="text-xs text-gray-500 mt-2">₽</p>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-2 gap-8 mb-8">
          {/* By Category */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-6">📂 Заявки по категориям</h2>
            {analytics.postingsByCategory.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={analytics.postingsByCategory}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={(entry) => `${entry.name.slice(0, 10)}: ${entry.value}`}
                    outerRadius={80}
                    fill="#8b5cf6"
                    dataKey="value"
                  >
                    {analytics.postingsByCategory.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-gray-500 text-center py-8">Нет данных</p>
            )}
          </div>

          {/* By City */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-6">📍 Заявки по городам</h2>
            {analytics.postingsByCity.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={analytics.postingsByCity}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={(entry) => `${entry.name.slice(0, 10)}: ${entry.value}`}
                    outerRadius={80}
                    fill="#3b82f6"
                    dataKey="value"
                  >
                    {analytics.postingsByCity.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-gray-500 text-center py-8">Нет данных</p>
            )}
          </div>
        </div>

        {/* Status Distribution */}
        <div className="grid grid-cols-1 gap-8 mb-8">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-6">🎯 Статусы заявок</h2>
            {analytics.totalPostings > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={[
                      { name: 'Активные', value: analytics.activePostings },
                      { name: 'Закрытые', value: analytics.closedPostings },
                      { name: 'Архивные', value: analytics.archivedPostings },
                    ]}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={(entry) => `${entry.name}: ${entry.value}`}
                    outerRadius={80}
                    fill="#10b981"
                    dataKey="value"
                  >
                    <Cell fill="#10b981" />
                    <Cell fill="#ef4444" />
                    <Cell fill="#6b7280" />
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-gray-500 text-center py-8">Нет данных</p>
            )}
          </div>
        </div>

        {/* Budget Distribution */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-6">💰 Распределение по бюджету</h2>
          {analytics.budgetDistribution.length > 0 ? (
            <div className="space-y-3">
              {analytics.budgetDistribution.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">{item.range}</span>
                  <div className="flex items-center gap-3 flex-1 ml-4">
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-purple-600 h-2 rounded-full"
                        style={{
                          width: `${(item.count / analytics.totalPostings) * 100}%`,
                        }}
                      ></div>
                    </div>
                    <span className="text-sm font-semibold text-gray-900 w-8 text-right">{item.count}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">Нет данных</p>
          )}
        </div>
      </div>
    </div>
  );
}