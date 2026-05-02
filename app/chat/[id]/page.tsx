'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';

interface Message {
  id: string;
  sender_email: string;
  sender_name: string;
  sender_type?: 'vendor' | 'client';
  message: string;
  file_url?: string;
  file_name?: string;
  created_at: string;
}

function formatTime(dateString: string) {
  if (!dateString) return '';
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
}

export default function ChatPage() {
  const params = useParams<{ id: string }>();
  const conversationId = Array.isArray(params.id) ? params.id[0] : params.id;

  const [messages, setMessages] = useState<Message[]>([]);
  const [messageText, setMessageText] = useState('');
  const [senderEmail, setSenderEmail] = useState('');
  const [senderName, setSenderName] = useState('');
  const [senderType, setSenderType] = useState<'vendor' | 'client'>('client');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Инициализация пользователя
  useEffect(() => {
    const email = localStorage.getItem('chat_user_email') || prompt('Email:') || 'guest@example.com';
    const name = localStorage.getItem('chat_user_name') || prompt('Имя:') || 'Гость';
    const type = (localStorage.getItem('chat_user_type') as 'vendor' | 'client' | null) || 'client';

    setSenderEmail(email);
    setSenderName(name);
    setSenderType(type);

    localStorage.setItem('chat_user_email', email);
    localStorage.setItem('chat_user_name', name);
    localStorage.setItem('chat_user_type', type);

    setLoading(false);
  }, []);

  // Загрузка сообщений при открытии диалога и возврате во вкладку
  useEffect(() => {
    if (!conversationId) {
      setMessages([]);
      return;
    }

    const fetchMessages = async () => {
      try {
        const response = await fetch(`/api/conversations?conversationId=${encodeURIComponent(conversationId)}`);
        if (response.ok) {
          const data = await response.json();
          setMessages(Array.isArray(data) ? data : []);
        }
      } catch (error) {
        console.error('Error fetching messages:', error);
      }
    };

    fetchMessages();

    const handleWindowFocus = () => {
      fetchMessages();
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        fetchMessages();
      }
    };

    window.addEventListener('focus', handleWindowFocus);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('focus', handleWindowFocus);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [conversationId]);

  // Скролл вниз
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim() || !senderEmail || !senderName || !conversationId) return;

    setSending(true);

    try {
      const response = await fetch('/api/conversations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'sendMessage',
          conversationId,
          senderEmail,
          senderName,
          senderType,
          message: messageText,
        }),
      });

      if (response.ok) {
        const createdMessage = await response.json();
        setMessageText('');
        setMessages((previousMessages) => [...previousMessages, createdMessage]);
      }
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-[#F7F8FC] flex items-center justify-center">
        <div className="text-center">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-slate-200 border-b-violet-600 mx-auto mb-4" />
          <p className="text-sm font-bold text-slate-500">Загрузка...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#F7F8FC]">
      <div className="mx-auto max-w-2xl h-screen flex flex-col">
        {/* Header */}
        <div className="bg-white border-b border-slate-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-black text-slate-950">💬 Чат</h1>
              <p className="text-sm text-slate-500 mt-1">
                Вы: <span className="font-bold">{senderName}</span> ({senderEmail})
              </p>
            </div>
            <Link href="/marketplace" className="text-sm font-bold text-slate-600 hover:text-violet-600">
              ← Назад
            </Link>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 bg-[#F7F8FC]">
          {messages.length === 0 ? (
            <div className="flex items-center justify-center h-full text-center">
              <div>
                <div className="text-4xl mb-4">💬</div>
                <p className="text-slate-500">Сообщений нет. Начните разговор!</p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((msg) => {
                const isOwn = msg.sender_type ? msg.sender_type === senderType : msg.sender_email === senderEmail;
                return (
                  <div key={msg.id} className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
                    <div
                      className={`max-w-xs rounded-2xl px-4 py-3 ${
                        isOwn
                          ? 'bg-violet-600 text-white rounded-br-none'
                          : 'bg-white text-slate-950 border border-slate-200 rounded-bl-none'
                      }`}
                    >
                      <div className={`text-xs font-bold mb-1 ${isOwn ? 'text-white/70' : 'text-slate-500'}`}>
                        {msg.sender_name}
                      </div>
                      <p className="text-sm">{msg.message}</p>
                      {msg.file_url && (
                        <a
                          href={msg.file_url}
                          target="_blank"
                          rel="noreferrer"
                          className={`mt-2 block text-xs font-semibold underline ${isOwn ? 'text-white/80' : 'text-violet-600'}`}
                        >
                          {msg.file_name || 'Открыть файл'}
                        </a>
                      )}
                      <p className={`text-xs mt-1 ${isOwn ? 'text-white/60' : 'text-slate-400'}`}>
                        {formatTime(msg.created_at)}
                      </p>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input */}
        <div className="bg-white border-t border-slate-200 p-4">
          <form onSubmit={handleSendMessage} className="flex gap-3">
            <input
              type="text"
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              placeholder="Сообщение..."
              disabled={sending}
              className="flex-1 rounded-xl border border-slate-200 px-4 py-3 text-sm focus:outline-none focus:border-violet-500 disabled:bg-slate-100"
            />
            <button
              type="submit"
              disabled={!messageText.trim() || sending}
              className="px-6 py-3 bg-violet-600 text-white font-bold rounded-xl disabled:opacity-50 hover:bg-violet-700"
            >
              {sending ? '...' : 'Отправить'}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}