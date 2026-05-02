'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';

interface Review {
  id: string;
  rating: number;
  comment: string;
  vendor_id?: string;
  is_hidden: boolean;
  is_flagged: boolean;
  created_at: string;
  moderation_notes?: string;
}

export default function ReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [flaggedOnly, setFlaggedOnly] = useState(false);
  const [hiddenOnly, setHiddenOnly] = useState(false);
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);
  const [action, setAction] = useState<'hide' | 'unhide' | 'flag' | null>(null);
  const [notes, setNotes] = useState('');

  useEffect(() => {
    loadReviews();
  }, [flaggedOnly, hiddenOnly]);

  async function loadReviews() {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (flaggedOnly) params.append('flagged', 'true');
      if (hiddenOnly) params.append('hidden', 'true');

      const res = await fetch(`/api/admin/reviews?${params}`);
      const data = await res.json();
      setReviews(data);
    } catch (error) {
      console.error('Error loading reviews:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleReviewAction(reviewId: string, updates: any) {
    try {
      const res = await fetch('/api/admin/reviews', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: reviewId, ...updates }),
      });

      if (res.ok) {
        alert('✅ Review updated');
        loadReviews();
        setSelectedReview(null);
        setAction(null);
      }
    } catch (error) {
      console.error('Error:', error);
      alert('❌ Error updating review');
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900">⭐ Модерация отзывов</h1>
            <p className="text-gray-600 mt-2">Всего отзывов: {reviews.length}</p>
          </div>
          <Link href="/admin">
            <Button variant="ghost">← Назад</Button>
          </Link>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 mb-6">
          <div className="flex gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={flaggedOnly}
                onChange={(e) => setFlaggedOnly(e.target.checked)}
                className="w-4 h-4"
              />
              <span className="text-sm text-gray-700">🚩 Только помеченные</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={hiddenOnly}
                onChange={(e) => setHiddenOnly(e.target.checked)}
                className="w-4 h-4"
              />
              <span className="text-sm text-gray-700">👁️ Только скрытые</span>
            </label>
            <Button onClick={loadReviews} variant="secondary">Refresh</Button>
          </div>
        </div>

        {/* Reviews */}
        {loading ? (
          <div className="text-center py-12">Loading...</div>
        ) : (
          <div className="space-y-4">
            {reviews.map((review) => (
              <div key={review.id} className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <div className="text-lg font-semibold text-gray-900">
                      {'⭐'.repeat(review.rating)} ({review.rating}/5)
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{review.comment}</p>
                  </div>
                  <div className="flex gap-2">
                    {review.is_flagged && (
                      <span className="px-3 py-1 bg-red-100 text-red-700 text-xs font-semibold rounded-full">
                        🚩 Flagged
                      </span>
                    )}
                    {review.is_hidden && (
                      <span className="px-3 py-1 bg-gray-100 text-gray-700 text-xs font-semibold rounded-full">
                        👁️ Hidden
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex gap-2">
                  {!review.is_hidden && (
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => {
                        setSelectedReview(review);
                        setAction('hide');
                      }}
                    >
                      👁️ Hide
                    </Button>
                  )}
                  {review.is_hidden && (
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => {
                        setSelectedReview(review);
                        setAction('unhide');
                      }}
                    >
                      👁️ Show
                    </Button>
                  )}
                  {!review.is_flagged && (
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => {
                        setSelectedReview(review);
                        setAction('flag');
                      }}
                    >
                      🚩 Flag
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Confirmation */}
        {selectedReview && action && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-2xl p-6 max-w-md w-full mx-4">
              <h3 className="text-lg font-bold text-gray-900 mb-3">
                {action === 'hide' && '👁️ Hide Review?'}
                {action === 'unhide' && '👁️ Show Review?'}
                {action === 'flag' && '🚩 Flag Review?'}
              </h3>
              <div className="flex gap-3">
                <Button
                  variant="secondary"
                  className="flex-1"
                  onClick={() => {
                    setSelectedReview(null);
                    setAction(null);
                  }}
                >
                  Cancel
                </Button>
                <Button
                  className="flex-1"
                  onClick={() => {
                    if (selectedReview) {
                      if (action === 'hide') {
                        handleReviewAction(selectedReview.id, { is_hidden: true });
                      } else if (action === 'unhide') {
                        handleReviewAction(selectedReview.id, { is_hidden: false });
                      } else if (action === 'flag') {
                        handleReviewAction(selectedReview.id, { is_flagged: true });
                      }
                    }
                  }}
                >
                  Confirm
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}