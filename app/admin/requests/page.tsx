'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';
import { MAIN_CATEGORIES } from '@/lib/categories';

interface JobPosting {
  id: string;
  title: string;
  description: string;
  category: string;
  event_city: string;
  event_date: string;
  guest_count: number;
  budget_min?: number;
  budget_max?: number;
  status: string;
  created_at: string;
}

export default function AdminRequestsPage() {
  const [postings, setPostings] = useState<JobPosting[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');

  useEffect(() => {
    fetchPostings();
  }, []);

  const fetchPostings = async () => {
    try {
      const response = await fetch('/api/job-postings');
      if (response.ok) {
        const data = await response.json();
        setPostings(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error('Error fetching postings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (postingId: string, newStatus: string) => {
    if (!confirm(`❓ Изменить статус на "${newStatus === 'active' ? 'Активна' : 'Приостановлена'}"?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/job-postings/${postingId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        setPostings((prev) =>
          prev.map((p) => (p.id === postingId ? { ...p, status: newStatus } : p))
        );
        alert('✅ Статус обновлён');
      } else {
        alert('❌ Ошибка при обновлении статуса');
      }
    } catch (error) {
      console.error('Error updating status:', error);
      alert('❌ Ошибка при обновлении');
    }
  };

  const handleDeletePosting = async (postingId: string) => {
    if (!confirm('❌ Вы уверены что хотите удалить эту заявку?')) {
      return;
    }

    try {
      const response = await fetch(`/api/job-postings/${postingId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setPostings((prev) => prev.filter((p) => p.id !== postingId));
        alert('✅ Заявка удалена');
      } else {
        alert('❌ Ошибка при удалении');
      }
    } catch (error) {
      console.error('Error deleting posting:', error);
      alert('❌ Ошибка при удалении');
    }
  };

  const getCategoryName = (catId: string) => {
    return MAIN_CATEGORIES.find((c) => c.id === catId)?.name_ru || catId;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const filteredPostings = postings.filter((posting) => {
    const matchSearch = posting.title.toLowerCase().includes(searchText.toLowerCase());
    const matchStatus = !selectedStatus || posting.status === selectedStatus;
    return matchSearch && matchStatus;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/admin/vendors">
            
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">📋 Управление заявками</h1>
          <Link href="/create-request">
            <Button>➕ Создать заявку</Button>
          </Link>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Stats */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <p className="text-sm text-gray-600 mb-1">Всего заявок</p>
            <p className="text-2xl font-bold text-gray-900">{postings.length}</p>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <p className="text-sm text-gray-600 mb-1">Активных</p>
            <p className="text-2xl font-bold text-green-600">{postings.filter((p) => p.status === 'active').length}</p>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <p className="text-sm text-gray-600 mb-1">Закрытых</p>
            <p className="text-2xl font-bold text-gray-600">{postings.filter((p) => p.status === 'closed').length}</p>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <p className="text-sm text-gray-600 mb-1">Архивных</p>
            <p className="text-2xl font-bold text-gray-600">{postings.filter((p) => p.status === 'archived').length}</p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-8">
          <div className="flex gap-4">
            <input
              type="text"
              placeholder="Поиск по названию..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              className="flex-1 px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="">Все статусы</option>
              <option value="active">🟢 Активные</option>
              <option value="closed">🔴 Закрытые</option>
              <option value="archived">📦 Архивные</option>
            </select>
            <Button onClick={fetchPostings}>🔄 Обновить</Button>
          </div>
        </div>

        {/* Table */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Загрузка заявок...</p>
          </div>
        ) : filteredPostings.length === 0 ? (
          <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
            <p className="text-gray-600 text-lg">Заявки не найдены</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Название</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Категория</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Город</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Дата</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Бюджет</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Статус</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Действия</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredPostings.map((posting) => (
                    <tr key={posting.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-medium text-gray-900 truncate">{posting.title}</p>
                          <p className="text-xs text-gray-500 mt-1">{posting.id.slice(0, 8)}...</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-gray-600">{getCategoryName(posting.category)}</p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-gray-600">📍 {posting.event_city}</p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-gray-600">{formatDate(posting.event_date)}</p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-gray-600">
                          {posting.budget_min && posting.budget_max
                            ? `${posting.budget_min.toLocaleString('ru')} – ${posting.budget_max.toLocaleString('ru')} ₽`
                            : '—'}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            posting.status === 'active'
                              ? 'bg-green-100 text-green-700'
                              : posting.status === 'closed'
                              ? 'bg-red-100 text-red-700'
                              : 'bg-gray-100 text-gray-700'
                          }`}
                        >
                          {posting.status === 'active'
                            ? '🟢 Активна'
                            : posting.status === 'closed'
                            ? '🔴 Закрыта'
                            : '📦 Архив'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <Link href={`/posting/${posting.id}`}>
                            <Button size="sm" variant="secondary">
                              👁️ View
                            </Button>
                          </Link>
                          <button
                            onClick={() => handleStatusChange(posting.id, posting.status === 'active' ? 'closed' : 'active')}
                            className={`px-3 py-1 text-sm font-semibold rounded-lg transition-colors ${
                              posting.status === 'active'
                                ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                                : 'bg-green-100 text-green-700 hover:bg-green-200'
                            }`}
                          >
                            {posting.status === 'active' ? '⏸️ Pause' : '▶️ Resume'}
                          </button>
                          <button
                            onClick={() => handleDeletePosting(posting.id)}
                            className="px-3 py-1 text-sm font-semibold rounded-lg bg-red-100 text-red-700 hover:bg-red-200 transition-colors"
                          >
                            🗑️ Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}