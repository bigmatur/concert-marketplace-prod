'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { MAIN_CATEGORIES } from '@/lib/categories';

interface Vendor {
  id: string;
  name: string;
  main_categories: string[];
  primary_city: string;
  rating?: number;
  status: 'active' | 'suspended' | 'blocked';
}

export default function VendorsPage() {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchVendors();
  }, []);

  async function fetchVendors() {
    try {
      const response = await fetch('/api/admin/vendors');
      if (response.ok) {
        const data = await response.json();
        setVendors(data);
      } else {
        setError('Ошибка при загрузке вендоров');
      }
    } catch (err) {
      console.error('Error:', err);
      setError('Ошибка при загрузке вендоров');
    } finally {
      setLoading(false);
    }
  }

  const handleStatusChange = async (vendorId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/admin/vendors/${vendorId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        setVendors((prev) =>
          prev.map((v) => (v.id === vendorId ? { ...v, status: newStatus as any } : v))
        );
        alert('✅ Статус обновлён');
      } else {
        alert('❌ Ошибка при обновлении статуса');
      }
    } catch (error) {
      console.error('Error updating status:', error);
      alert('❌ Ошибка при обновлении');
    }
  }

  // Фильтрация вендоров
  const filteredVendors = vendors.filter((vendor) => {
    const matchesSearch = vendor.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || vendor.main_categories?.includes(selectedCategory);
    const matchesStatus = selectedStatus === 'all' || vendor.status === selectedStatus;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return { label: '✅ Активный', color: 'bg-green-100 text-green-800' };
      case 'suspended':
        return { label: '⏸️ Заморожен', color: 'bg-yellow-100 text-yellow-800' };
      case 'blocked':
        return { label: '🚫 Заблокирован', color: 'bg-red-100 text-red-800' };
      default:
        return { label: status, color: 'bg-gray-100 text-gray-800' };
    }
  };

  const getCategoryName = (categoryId: string) => {
    const category = MAIN_CATEGORIES.find((c) => c.id === categoryId);
    return category ? `${category.icon} ${category.name_ru}` : categoryId;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Загрузка вендоров...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">🎤 Управление вендорами</h1>
            <p className="text-gray-600">Всего вендоров: {vendors.length}</p>
          </div>
          <div className="flex gap-2 flex-wrap">
            <Link href="/admin/analytics">
              <Button variant="secondary" size="sm">
                📊 Аналитика
              </Button>
            </Link>
            <Link href="/admin/requests">
              <Button variant="secondary" size="sm">
                📋 Заявки
              </Button>
            </Link>
            <Link href="/admin/users">
              <Button variant="secondary" size="sm">
                👥 Пользователи
              </Button>
            </Link>
            <Link href="/admin/import-vendors">
              <Button variant="secondary">
                📥 Импорт
              </Button>
            </Link>
            <Link href="/admin/vendors/new">
              <Button>
                ➕ Создать
              </Button>
            </Link>
          </div>
        </div>

        {/* Filters & Search */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {/* Search */}
          <div>
            <input
              type="text"
              placeholder="🔍 Поиск вендоров"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="all">Все категории</option>
            {MAIN_CATEGORIES.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.icon} {cat.name_ru}
              </option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="all">Все статусы</option>
            <option value="active">✅ Активный</option>
            <option value="suspended">⏸️ Заморожен</option>
            <option value="blocked">🚫 Заблокирован</option>
          </select>

          {/* Refresh Button */}
          <Button
            onClick={() => {
              setLoading(true);
              fetchVendors();
            }}
            variant="secondary"
          >
            🔄 Обновить
          </Button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-8">
            <p className="text-red-800">❌ {error}</p>
          </div>
        )}

        {/* Vendors Table */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Название</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Категория</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Город</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Рейтинг</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Статус</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Действия</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredVendors.length > 0 ? (
                filteredVendors.map((vendor) => {
                  const statusBadge = getStatusBadge(vendor.status);
                  const categoryName = vendor.main_categories?.[0]
                    ? getCategoryName(vendor.main_categories[0])
                    : '—';

                  return (
                    <tr key={vendor.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <span className="font-semibold text-gray-900">{vendor.name}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-gray-600">{categoryName}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-gray-600">{vendor.primary_city || '—'}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm font-medium text-gray-900">
                          {'⭐ ' + (vendor.rating || 5)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${statusBadge.color}`}>
                          {statusBadge.label}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2 flex-wrap">
                          {vendor.status === 'pending' && (
                            <button
                              onClick={() => handleStatusChange(vendor.id, 'active')}
                              className="px-3 py-1 text-sm font-semibold rounded-lg bg-green-100 text-green-700 hover:bg-green-200 transition-colors"
                            >
                              ✅ Активировать
                            </button>
                          )}
                          {vendor.status === 'active' && (
                            <>
                              <button
                                onClick={() => handleStatusChange(vendor.id, 'suspended')}
                                className="px-3 py-1 text-sm font-semibold rounded-lg bg-yellow-100 text-yellow-700 hover:bg-yellow-200 transition-colors"
                              >
                                ⏸️ Приостановить
                              </button>
                              <button
                                onClick={() => handleStatusChange(vendor.id, 'blocked')}
                                className="px-3 py-1 text-sm font-semibold rounded-lg bg-red-100 text-red-700 hover:bg-red-200 transition-colors"
                              >
                                🚫 Заблокировать
                              </button>
                            </>
                          )}
                          {vendor.status === 'suspended' && (
                            <>
                              <button
                                onClick={() => handleStatusChange(vendor.id, 'active')}
                                className="px-3 py-1 text-sm font-semibold rounded-lg bg-green-100 text-green-700 hover:bg-green-200 transition-colors"
                              >
                                ✅ Активировать
                              </button>
                              <button
                                onClick={() => handleStatusChange(vendor.id, 'blocked')}
                                className="px-3 py-1 text-sm font-semibold rounded-lg bg-red-100 text-red-700 hover:bg-red-200 transition-colors"
                              >
                                🚫 Заблокировать
                              </button>
                            </>
                          )}
                          {vendor.status === 'blocked' && (
                            <button
                              onClick={() => handleStatusChange(vendor.id, 'active')}
                              className="px-3 py-1 text-sm font-semibold rounded-lg bg-green-100 text-green-700 hover:bg-green-200 transition-colors"
                            >
                              ✅ Активировать
                            </button>
                          )}
                          <Link href={`/admin/vendors/${vendor.id}/edit`}>
                            <button className="px-3 py-1 text-sm font-semibold rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors">
                              ✏️ Редактировать
                            </button>
                          </Link>
                          <button
                            onClick={() => {
                              if (confirm('Вы уверены? Это действие нельзя отменить.')) {
                                fetch(`/api/admin/vendors/${vendor.id}`, { method: 'DELETE' })
                                  .then(() => {
                                    setVendors(vendors.filter((v) => v.id !== vendor.id));
                                  })
                                  .catch(console.error);
                              }
                            }}
                            className="px-3 py-1 text-sm font-semibold rounded-lg bg-red-100 text-red-700 hover:bg-red-200 transition-colors"
                          >
                            🗑️ Удалить
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center">
                    <p className="text-gray-500">
                      {searchQuery || selectedCategory !== 'all' || selectedStatus !== 'all'
                        ? '❌ Вендоры не найдены'
                        : '📭 Нет вендоров. Создайте первого!'}
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}