'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface Vendor {
  id: string;
  name: string;
  email?: string;
}

export default function VendorContactPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [vendor, setVendor] = useState<Vendor | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    senderName: '',
    senderEmail: '',
    subject: 'Сообщение от клиента',
    message: '',
  });

  useEffect(() => {
    const fetchVendor = async () => {
      try {
        const response = await fetch(`/api/admin/vendors/${params.id}`);
        if (response.ok) {
          const data = await response.json();
          setVendor(data);
        }
      } catch (error) {
        console.error('Error fetching vendor:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchVendor();
  }, [params.id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.senderName.trim() || !formData.senderEmail.trim() || !formData.message.trim()) {
      alert('❌ Заполни все обязательные поля');
      return;
    }

    if (!formData.senderEmail.includes('@')) {
      alert('❌ Введи правильный email');
      return;
    }

    setSubmitting(true);

    try {
      const conversationResponse = await fetch('/api/conversations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'createConversation',
          vendorId: params.id,
          clientEmail: formData.senderEmail,
          clientName: formData.senderName,
        }),
      });

      if (!conversationResponse.ok) {
        const error = await conversationResponse.json();
        alert(`❌ Ошибка: ${error.error}`);
        return;
      }

      const conversation = await conversationResponse.json();
      const subject = formData.subject.trim();
      const messageText = subject && subject !== 'Сообщение от клиента'
        ? `Тема: ${subject}\n\n${formData.message.trim()}`
        : formData.message.trim();

      const messageResponse = await fetch('/api/conversations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'sendMessage',
          conversationId: conversation.id,
          senderEmail: formData.senderEmail,
          senderName: formData.senderName,
          senderType: 'client',
          message: messageText,
        }),
      });

      if (!messageResponse.ok) {
        const error = await messageResponse.json();
        alert(`❌ Ошибка: ${error.error}`);
        return;
      }

      localStorage.setItem('chat_user_email', formData.senderEmail);
      localStorage.setItem('chat_user_name', formData.senderName);
      localStorage.setItem('chat_user_type', 'client');

      setSuccess(true);
      setTimeout(() => {
        router.push(`/messages?conv=${conversation.id}`);
      }, 600);
    } catch (error) {
      console.error('Error sending message:', error);
      alert('❌ Ошибка при отправке сообщения');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Загрузка...</p>
        </div>
      </div>
    );
  }

  if (!vendor) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 text-lg mb-4">Вендор не найден</p>
          <Link href="/search">
            <Button>← Вернуться к поиску</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <Link href={`/vendors/${params.id}`}>
            <Button variant="ghost" size="sm">← Назад к профилю</Button>
          </Link>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-12">
        {success && (
          <div className="mb-8 bg-green-50 border border-green-200 rounded-lg p-6 text-center">
            <p className="text-green-700 text-lg font-semibold">✅ Сообщение отправлено!</p>
            <p className="text-green-600 text-sm mt-2">Переходим в мессенджер...</p>
          </div>
        )}

        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">📧 Отправить сообщение</h1>
            <p className="text-gray-600">Напиши сообщение для <strong>{vendor.name}</strong></p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Sender Name */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">Твое имя *</label>
              <input
                type="text"
                name="senderName"
                value={formData.senderName}
                onChange={handleChange}
                placeholder="Иван Петров"
                required
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            {/* Sender Email */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">Твой email *</label>
              <input
                type="email"
                name="senderEmail"
                value={formData.senderEmail}
                onChange={handleChange}
                placeholder="ivan@example.com"
                required
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              <p className="text-xs text-gray-500 mt-1">На этот email вендор может ответить</p>
            </div>

            {/* Subject */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">Тема сообщения</label>
              <input
                type="text"
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                placeholder="Сообщение от клиента"
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            {/* Message */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">Сообщение *</label>
              <textarea
                name="message"
                value={formData.message}
                onChange={handleChange}
                placeholder="Напиши своё сообщение здесь...&#10;&#10;Например:&#10;- Какие услуги вас интересуют?&#10;- Какие у вас есть предложения?&#10;- Когда вы доступны?"
                required
                rows={6}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
              />
              <p className="text-xs text-gray-500 mt-1">{formData.message.length} символов</p>
            </div>

            {/* Buttons */}
            <div className="flex gap-3 pt-4">
              <Button
                type="submit"
                disabled={submitting}
                className={submitting ? 'opacity-50 cursor-not-allowed' : ''}
              >
                {submitting ? 'Отправка...' : '📧 Отправить сообщение'}
              </Button>
              <Link href={`/vendors/${params.id}`}>
                <Button variant="secondary">Отмена</Button>
              </Link>
            </div>
          </form>
        </div>

        {/* Info Section */}
        <div className="mt-8 bg-blue-50 rounded-lg p-6 border border-blue-200">
          <h3 className="font-semibold text-blue-900 mb-2">ℹ️ Как это работает?</h3>
          <ul className="text-sm text-blue-800 space-y-2">
            <li>✓ Сообщение попадет в единый мессенджер</li>
            <li>✓ Вся переписка будет храниться в истории диалога</li>
            <li>✓ После отправки откроется нужная беседа</li>
          </ul>
        </div>
      </div>
    </div>
  );
}