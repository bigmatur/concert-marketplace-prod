'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';

type UserType = 'vendor' | 'client' | 'admin';

interface Message {
  id: string;
  sender_email: string;
  sender_name: string;
  sender_type: UserType;
  message: string;
  file_url?: string | null;
  file_name?: string | null;
  is_read: boolean;
  created_at: string;
  conversation_id: string;
}

interface Conversation {
  id: string;
  posting_id?: string | null;
  vendor_id?: string | null;
  vendor_name?: string | null;
  vendor_email?: string | null;
  client_email: string;
  client_name: string;
  status: string;
  last_message_at: string;
  created_at: string;

  deleted_by_client?: boolean | null;
  deleted_by_vendor?: boolean | null;
  deleted_by_admin?: boolean | null;

  blocked_by_client?: boolean | null;
  blocked_by_vendor?: boolean | null;
  blocked_by_admin?: boolean | null;
  blocked_reason?: string | null;
  blocked_at?: string | null;
}

interface StoredUser {
  email?: string;
  fullName?: string;
  name?: string;
  role?: 'buyer' | 'vendor' | 'admin';
  vendor_id?: string;
}

interface VendorTarget {
  id: string;
  name: string;
  email?: string | null;
}

function formatTime(dateString: string) {
  if (!dateString) return '';

  const date = new Date(dateString);
  const now = new Date();

  if (Number.isNaN(date.getTime())) return '';

  if (date.toDateString() === now.toDateString()) {
    return date.toLocaleTimeString('ru-RU', {
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  return date.toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'short',
  });
}

function getInitials(name?: string) {
  if (!name) return '?';

  return name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

function getRoleLabel(userType: UserType | null) {
  if (userType === 'admin') return 'Администратор';
  if (userType === 'vendor') return 'Вендор';
  return 'Клиент';
}

export default function MessagesPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const selectedConvId = searchParams.get('conv');
  const vendorIdParam = searchParams.get('vendor_id');

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);

  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  const [messageText, setMessageText] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [userName, setUserName] = useState('');
  const [userType, setUserType] = useState<UserType | null>(null);

  const [activeVendorId, setActiveVendorId] = useState('');
  const [activeVendorEmail, setActiveVendorEmail] = useState('');
  const [targetVendor, setTargetVendor] = useState<VendorTarget | null>(null);

  const [searchText, setSearchText] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const getConversationTitle = (conversation: Conversation) => {
    if (userType === 'vendor') {
      return conversation.client_name || 'Клиент';
    }

    return conversation.vendor_name || 'Вендор';
  };

  const getConversationSubtitle = (conversation: Conversation) => {
    if (userType === 'vendor') {
      return conversation.client_email || 'Email не указан';
    }

    return conversation.vendor_email || 'Контакт вендора недоступен';
  };

  const isNewVendorChat =
    (userType === 'client' || userType === 'admin') &&
    Boolean(vendorIdParam) &&
    Boolean(targetVendor) &&
    (!selectedConversation || selectedConversation.vendor_id !== vendorIdParam);

  const activeTitle = selectedConversation
    ? getConversationTitle(selectedConversation)
    : targetVendor?.name || '';

  const activeSubtitle = selectedConversation
    ? getConversationSubtitle(selectedConversation)
    : targetVendor?.email || 'Контакт вендора недоступен';

  const conversationBlocked =
    Boolean(selectedConversation?.blocked_by_client) ||
    Boolean(selectedConversation?.blocked_by_vendor) ||
    Boolean(selectedConversation?.blocked_by_admin) ||
    selectedConversation?.status === 'blocked';

  // Инициализация пользователя
  useEffect(() => {
    if (typeof window === 'undefined') return;

    try {
      const savedEmail = localStorage.getItem('chat_user_email');
      const savedName = localStorage.getItem('chat_user_name');
      const rawUser = localStorage.getItem('user');

      let storedUser: StoredUser | null = null;

      if (rawUser) {
        try {
          storedUser = JSON.parse(rawUser) as StoredUser;
        } catch (error) {
          console.error('Failed to parse stored user:', error);
        }
      }

      const resolvedVendorId = storedUser?.vendor_id || '';

      const resolvedUserType: UserType =
        storedUser?.role === 'admin'
          ? 'admin'
          : storedUser?.role === 'vendor'
            ? 'vendor'
            : 'client';

      const email =
        storedUser?.email ||
        savedEmail ||
        prompt('Введите свой email:') ||
        '';

      const name =
        storedUser?.fullName ||
        storedUser?.name ||
        savedName ||
        prompt('Введите своё имя:') ||
        '';

      setUserEmail(email);
      setUserName(name);
      setUserType(resolvedUserType);

      setActiveVendorId(resolvedUserType === 'vendor' ? resolvedVendorId : '');
      setActiveVendorEmail(resolvedUserType === 'vendor' ? email : '');

      if (email) {
        localStorage.setItem('chat_user_email', email);
      }

      if (name) {
        localStorage.setItem('chat_user_name', name);
      }

      localStorage.setItem('chat_user_type', resolvedUserType);
    } catch (error) {
      console.error('Error initializing user:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Получить вендора, если открыли /messages?vendor_id=...
  useEffect(() => {
    const fetchTargetVendor = async () => {
      if (!vendorIdParam || (userType !== 'client' && userType !== 'admin')) {
        setTargetVendor(null);
        return;
      }

      try {
        const response = await fetch(`/api/admin/vendors/${vendorIdParam}`);

        if (!response.ok) {
          setTargetVendor(null);
          return;
        }

        const data = await response.json();

        setTargetVendor({
          id: data.id,
          name: data.name || 'Вендор',
          email: data.email || null,
        });
      } catch (error) {
        console.error('Error fetching target vendor:', error);
        setTargetVendor(null);
      }
    };

    fetchTargetVendor();
  }, [userType, vendorIdParam]);

  // Загрузка бесед
  useEffect(() => {
    const fetchConversations = async () => {
      if (!userType) return;

      if (userType === 'vendor' && !activeVendorId && !activeVendorEmail) return;
      if (userType === 'client' && !userEmail) return;

      try {
        const requestUrl =
          userType === 'admin'
            ? `/api/conversations?type=conversations&userType=${userType}`
            : userType === 'vendor'
              ? activeVendorId
                ? `/api/conversations?type=conversations&vendorId=${encodeURIComponent(activeVendorId)}&userType=${userType}`
                : `/api/conversations?type=conversations&vendorEmail=${encodeURIComponent(activeVendorEmail)}&userType=${userType}`
              : `/api/conversations?type=conversations&clientEmail=${encodeURIComponent(userEmail)}&userType=${userType}`;

        const response = await fetch(requestUrl);

        if (!response.ok) return;

        const data = await response.json();
        const conversationList = Array.isArray(data) ? data : [];

        setConversations(conversationList);

        if (selectedConvId) {
          const conversationFromUrl = conversationList.find(
            (conversation) => conversation.id === selectedConvId
          );

          if (conversationFromUrl) {
            setSelectedConversation(conversationFromUrl);
            return;
          }
        }

        if (vendorIdParam && (userType === 'client' || userType === 'admin')) {
          const vendorConversation = conversationList.find(
            (conversation) => conversation.vendor_id === vendorIdParam
          );

          if (vendorConversation) {
            setSelectedConversation(vendorConversation);
            return;
          }

          // Если открываем нового вендора, старую беседу не выбираем
          setSelectedConversation(null);
          setMessages([]);
          return;
        }

        setSelectedConversation((currentConversation) => {
          if (!conversationList.length) return null;

          if (currentConversation) {
            return (
              conversationList.find((conversation) => conversation.id === currentConversation.id) ||
              conversationList[0]
            );
          }

          return conversationList[0];
        });
      } catch (error) {
        console.error('Error fetching conversations:', error);
      }
    };

    fetchConversations();
  }, [
    activeVendorEmail,
    activeVendorId,
    selectedConvId,
    userEmail,
    userType,
    vendorIdParam,
  ]);

  // Загрузка сообщений
  useEffect(() => {
    if (!selectedConversation) {
      setMessages([]);
      return;
    }

    const fetchMessages = async () => {
      try {
        const response = await fetch(
          `/api/conversations?conversationId=${selectedConversation.id}`
        );

        if (response.ok) {
          const data = await response.json();
          setMessages(Array.isArray(data) ? data : []);
        }
      } catch (error) {
        console.error('Error fetching messages:', error);
      }
    };

    fetchMessages();

    const intervalId = window.setInterval(fetchMessages, 7000);

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
      window.clearInterval(intervalId);
      window.removeEventListener('focus', handleWindowFocus);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [selectedConversation]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const refreshAfterConversationAction = (conversationId: string) => {
    setConversations((previousConversations) =>
      previousConversations.filter((conversation) => conversation.id !== conversationId)
    );

    setMessages([]);
    setSelectedConversation(null);
    router.replace('/messages');
  };

  const handleDeleteConversation = async () => {
    if (!selectedConversation || !userType) return;

    const confirmed = window.confirm(
      'Удалить этот чат из вашего списка? История будет скрыта только для вас.'
    );

    if (!confirmed) return;

    try {
      const response = await fetch('/api/conversations', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'deleteConversation',
          conversationId: selectedConversation.id,
          userType,
        }),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => null);
        alert(error?.error || 'Ошибка при удалении чата');
        return;
      }

      refreshAfterConversationAction(selectedConversation.id);
    } catch (error) {
      console.error('Error deleting conversation:', error);
      alert('Ошибка при удалении чата');
    }
  };

  const handleBlockConversation = async () => {
    if (!selectedConversation || !userType) return;

    const reason = window.prompt('Причина блокировки. Можно оставить пустым:');

    const confirmed = window.confirm(
      'Заблокировать собеседника? После блокировки отправка сообщений будет невозможна.'
    );

    if (!confirmed) return;

    try {
      const response = await fetch('/api/conversations', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'blockConversation',
          conversationId: selectedConversation.id,
          userType,
          blockedReason: reason || '',
        }),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => null);
        alert(error?.error || 'Ошибка при блокировке');
        return;
      }

      const updatedConversation = await response.json();

      setSelectedConversation(updatedConversation);

      setConversations((previousConversations) =>
        previousConversations.map((conversation) =>
          conversation.id === updatedConversation.id ? updatedConversation : conversation
        )
      );
    } catch (error) {
      console.error('Error blocking conversation:', error);
      alert('Ошибка при блокировке');
    }
  };

  const handleUnblockConversation = async () => {
    if (!selectedConversation) return;

    const confirmed = window.confirm('Разблокировать этот чат?');

    if (!confirmed) return;

    try {
      const response = await fetch('/api/conversations', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'unblockConversation',
          conversationId: selectedConversation.id,
        }),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => null);
        alert(error?.error || 'Ошибка при разблокировке');
        return;
      }

      const updatedConversation = await response.json();

      setSelectedConversation(updatedConversation);

      setConversations((previousConversations) =>
        previousConversations.map((conversation) =>
          conversation.id === updatedConversation.id ? updatedConversation : conversation
        )
      );
    } catch (error) {
      console.error('Error unblocking conversation:', error);
      alert('Ошибка при разблокировке');
    }
  };

  const handleSendMessage = async (event: React.FormEvent) => {
    event.preventDefault();

    if (conversationBlocked) {
      alert('Этот чат заблокирован. Отправка сообщений недоступна.');
      return;
    }

    if ((!messageText.trim() && !selectedFile) || !userEmail || !userName || !userType) {
      return;
    }

    setSending(true);

    try {
      let fileUrl: string | null = null;
      let fileName: string | null = null;

      if (selectedFile) {
        const formData = new FormData();
        formData.append('file', selectedFile);

        const uploadResponse = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });

        if (uploadResponse.ok) {
          const uploadData = await uploadResponse.json();
          fileUrl = uploadData.url;
          fileName = selectedFile.name;
        }
      }

      let conversation = selectedConversation;

      if (!conversation && (userType === 'client' || userType === 'admin') && targetVendor) {
        const createConversationResponse = await fetch('/api/conversations', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            action: 'createConversation',
            postingId: null,
            vendorId: targetVendor.id,
            vendorEmail: targetVendor.email,
            vendorName: targetVendor.name,
            clientEmail: userEmail,
            clientName: userName,
          }),
        });

        if (!createConversationResponse.ok) {
          const error = await createConversationResponse.json().catch(() => null);
          alert(error?.error || 'Ошибка при создании диалога');
          return;
        }

        const createdConversation = await createConversationResponse.json();

        conversation = {
          ...createdConversation,
          vendor_id: createdConversation.vendor_id || targetVendor.id,
          vendor_name: createdConversation.vendor_name || targetVendor.name,
          vendor_email: createdConversation.vendor_email || targetVendor.email || null,
        };

        setConversations((previousConversations) => {
          const exists = previousConversations.some(
            (item) => item.id === conversation?.id
          );

          if (exists) return previousConversations;

          return [conversation as Conversation, ...previousConversations];
        });

        setSelectedConversation(conversation as Conversation);
        router.replace(`/messages?conv=${createdConversation.id}`);
      }

      if (!conversation) {
        alert('Выберите беседу или откройте профиль вендора заново');
        return;
      }

      const response = await fetch('/api/conversations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'sendMessage',
          conversationId: conversation.id,
          senderEmail: userEmail,
          senderName: userName,
          senderType: userType,
          message: messageText,
          file_url: fileUrl,
          file_name: fileName,
        }),
      });

      if (response.ok) {
        const createdMessage = await response.json();

        setMessageText('');
        setSelectedFile(null);

        setMessages((previousMessages) => [...previousMessages, createdMessage]);

        setConversations((previousConversations) =>
          previousConversations.map((item) =>
            item.id === createdMessage.conversation_id
              ? {
                  ...item,
                  last_message_at: createdMessage.created_at,
                  deleted_by_client: false,
                  deleted_by_vendor: false,
                  deleted_by_admin: false,
                }
              : item
          )
        );

        setSelectedConversation((currentConversation) =>
          currentConversation && currentConversation.id === createdMessage.conversation_id
            ? {
                ...currentConversation,
                last_message_at: createdMessage.created_at,
                deleted_by_client: false,
                deleted_by_vendor: false,
                deleted_by_admin: false,
              }
            : currentConversation
        );
      } else {
        const error = await response.json().catch(() => null);
        alert(error?.error || 'Ошибка при отправке сообщения');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Ошибка при отправке сообщения');
    } finally {
      setSending(false);
    }
  };

  const filteredConversations = conversations.filter((conversation) => {
    const query = searchText.toLowerCase();

    return (
      getConversationTitle(conversation).toLowerCase().includes(query) ||
      getConversationSubtitle(conversation).toLowerCase().includes(query) ||
      conversation.client_name?.toLowerCase().includes(query) ||
      conversation.client_email?.toLowerCase().includes(query) ||
      conversation.vendor_name?.toLowerCase().includes(query) ||
      conversation.vendor_email?.toLowerCase().includes(query) ||
      conversation.status?.toLowerCase().includes(query)
    );
  });

  const currentMessages = selectedConversation
    ? messages.filter((message) => message.conversation_id === selectedConversation.id)
    : [];

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#F7F8FC]">
        <div className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-slate-200 border-b-violet-600" />
          <p className="text-sm font-bold text-slate-500">Загрузка...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#F7F8FC] text-slate-950">
      {/* HERO */}
      <section className="relative overflow-hidden bg-[#070B18]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(109,61,255,0.35),transparent_30%),radial-gradient(circle_at_80%_10%,rgba(37,99,255,0.24),transparent_28%),radial-gradient(circle_at_70%_80%,rgba(0,194,255,0.14),transparent_32%)]" />
        <div className="absolute inset-0 opacity-40 [background-image:linear-gradient(rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.04)_1px,transparent_1px)] [background-size:64px_64px]" />

        <div className="relative z-10 mx-auto max-w-7xl px-6 py-10">
          <div className="mb-6">
            <Link
              href="/marketplace"
              className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/10 px-4 py-2.5 text-sm font-black text-white/80 backdrop-blur transition hover:bg-white/15 hover:text-white"
            >
              ← Вернуться в маркетплейс
            </Link>
          </div>

          <div className="grid gap-8 lg:grid-cols-[1fr_360px] lg:items-end">
            <div>
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-4 py-2 text-sm font-bold text-white/75 backdrop-blur">
                <span className="h-2 w-2 rounded-full bg-cyan-300" />
                Сообщения
              </div>

              <h1 className="text-4xl font-black leading-tight tracking-tight text-white md:text-6xl">
                Сообщения ConcertGid
              </h1>

              <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-300">
                Общайтесь с клиентами и вендорами, обсуждайте детали заявок,
                бюджет, сроки и условия работы.
              </p>
            </div>

            <div className="rounded-[1.5rem] border border-white/10 bg-white/10 p-5 backdrop-blur-xl">
              <div className="text-sm font-black text-white">Ваш профиль</div>

              <div className="mt-4 flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-blue-500 text-sm font-black text-white">
                  {getInitials(userName)}
                </div>

                <div className="min-w-0">
                  <div className="truncate text-sm font-black text-white">
                    {userName || 'Гость'}
                  </div>

                  <div className="truncate text-xs font-semibold text-slate-400">
                    {userEmail || 'Email не указан'}
                  </div>

                  <div className="mt-1 text-xs font-black text-violet-200">
                    {getRoleLabel(userType)}
                  </div>
                </div>
              </div>

              <div className="mt-4 rounded-2xl bg-white/10 p-3">
                <div className="text-2xl font-black text-white">
                  {conversations.length}
                </div>
                <div className="mt-1 text-xs text-slate-400">бесед</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CHAT AREA */}
      <section className="mx-auto max-w-7xl px-6 py-8">
        <div className="grid min-h-[720px] overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-xl lg:grid-cols-[360px_1fr_300px]">
          {/* LEFT SIDEBAR */}
          <aside className="flex flex-col border-b border-slate-200 lg:border-b-0 lg:border-r">
            <div className="border-b border-slate-100 p-5">
              <h2 className="text-lg font-black text-slate-950">Переписки</h2>
              <p className="mt-1 text-xs font-semibold text-slate-400">
                Найдено: {filteredConversations.length}
              </p>

              <div className="relative mt-5">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                  🔍
                </span>

                <input
                  type="text"
                  placeholder="Поиск..."
                  value={searchText}
                  onChange={(event) => setSearchText(event.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-11 py-3 text-sm font-semibold outline-none transition focus:border-violet-300 focus:bg-white focus:ring-4 focus:ring-violet-500/10"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-3">
              {filteredConversations.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center p-8 text-center">
                  <div className="mb-4 text-3xl">💬</div>
                  <h3 className="text-lg font-black text-slate-950">
                    Нет бесед
                  </h3>
                  <p className="mt-2 text-sm font-semibold text-slate-500">
                    Начните разговор через профиль вендора
                  </p>
                </div>
              ) : (
                filteredConversations.map((conversation) => {
                  const isActive = conversation.id === selectedConversation?.id;
                  const conversationMessages = messages.filter(
                    (message) => message.conversation_id === conversation.id
                  );
                  const lastMessage =
                    conversationMessages[conversationMessages.length - 1];
                  const title = getConversationTitle(conversation);
                  const subtitle = getConversationSubtitle(conversation);
                  const isBlocked =
                    Boolean(conversation.blocked_by_client) ||
                    Boolean(conversation.blocked_by_vendor) ||
                    Boolean(conversation.blocked_by_admin) ||
                    conversation.status === 'blocked';

                  return (
                    <button
                      key={conversation.id}
                      onClick={() => {
                        setSelectedConversation(conversation);
                        router.push(`/messages?conv=${conversation.id}`);
                      }}
                      className={`mb-2 w-full rounded-2xl border p-4 text-left transition ${
                        isActive
                          ? 'border-violet-200 bg-violet-50 shadow-lg shadow-violet-500/10'
                          : 'border-transparent bg-white hover:border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-sm font-black text-white ${
                            isActive
                              ? 'bg-gradient-to-br from-violet-500 to-blue-500'
                              : 'bg-slate-950'
                          }`}
                        >
                          {getInitials(title)}
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex items-start justify-between gap-2">
                            <h3 className="truncate text-sm font-black text-slate-950">
                              {title}
                            </h3>

                            <span className="text-[11px] font-bold text-slate-400">
                              {formatTime(conversation.last_message_at)}
                            </span>
                          </div>

                          <p className="mt-1 truncate text-xs font-semibold text-slate-500">
                            {lastMessage ? lastMessage.message : subtitle}
                          </p>

                          <div className="mt-3">
                            <span
                              className={`rounded-full px-2.5 py-1 text-[11px] font-black ${
                                isBlocked
                                  ? 'bg-red-50 text-red-700'
                                  : conversation.status === 'open'
                                    ? 'bg-emerald-50 text-emerald-700'
                                    : 'bg-slate-100 text-slate-500'
                              }`}
                            >
                              {isBlocked
                                ? 'Заблокирован'
                                : conversation.status === 'open'
                                  ? 'Открыта'
                                  : conversation.status || '—'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </aside>

          {/* CENTER CHAT */}
          <section className="flex min-h-[720px] flex-col bg-[#F7F8FC]">
            {selectedConversation || targetVendor ? (
              <>
                <div className="border-b border-slate-200 bg-white px-6 py-5">
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-blue-500 text-sm font-black text-white">
                      {getInitials(activeTitle)}
                    </div>

                    <div className="min-w-0 flex-1">
                      <h2 className="truncate text-lg font-black text-slate-950">
                        {activeTitle}
                      </h2>

                      <p className="truncate text-sm font-semibold text-slate-500">
                        {activeSubtitle}
                      </p>

                      {isNewVendorChat && (
                        <p className="mt-1 text-xs font-black text-violet-600">
                          Новый диалог. Напишите первое сообщение.
                        </p>
                      )}

                      {conversationBlocked && (
                        <p className="mt-1 text-xs font-black text-red-600">
                          Чат заблокирован. Отправка сообщений недоступна.
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto px-5 py-6">
                  {currentMessages.length === 0 ? (
                    <div className="flex h-full items-center justify-center text-center">
                      <div>
                        <div className="mb-4 text-4xl">💬</div>
                        <h2 className="text-2xl font-black text-slate-950">
                          Начните разговор
                        </h2>
                        <p className="mt-3 text-sm font-semibold text-slate-500">
                          Отправьте первое сообщение
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="mx-auto max-w-3xl space-y-4">
                      {currentMessages.map((message) => {
                        const isOwn = message.sender_email === userEmail;

                        return (
                          <div
                            key={message.id}
                            className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                          >
                            <div
                              className={`max-w-xs rounded-2xl px-4 py-3 ${
                                isOwn
                                  ? 'rounded-br-none bg-gradient-to-r from-violet-600 to-blue-600 text-white'
                                  : 'rounded-bl-none border border-slate-200 bg-white text-slate-950'
                              }`}
                            >
                              <div
                                className={`mb-1 text-xs font-bold ${
                                  isOwn ? 'text-white/70' : 'text-slate-500'
                                }`}
                              >
                                {message.sender_name}
                              </div>

                              {message.message && (
                                <p className="whitespace-pre-wrap text-sm">
                                  {message.message}
                                </p>
                              )}

                              {message.file_url && (
                                <a
                                  href={message.file_url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className={`mt-2 block text-xs font-semibold underline ${
                                    isOwn ? 'text-white/80' : 'text-violet-600'
                                  }`}
                                >
                                  📎 {message.file_name || 'Файл'}
                                </a>
                              )}

                              <p
                                className={`mt-2 text-xs ${
                                  isOwn ? 'text-white/60' : 'text-slate-400'
                                }`}
                              >
                                {formatTime(message.created_at)}
                              </p>
                            </div>
                          </div>
                        );
                      })}

                      <div ref={messagesEndRef} />
                    </div>
                  )}
                </div>

                <div className="border-t border-slate-200 bg-white px-5 py-4">
                  <form onSubmit={handleSendMessage} className="flex gap-3">
                    <input
                      type="text"
                      value={messageText}
                      onChange={(event) => setMessageText(event.target.value)}
                      placeholder={
                        conversationBlocked
                          ? 'Чат заблокирован'
                          : 'Сообщение...'
                      }
                      disabled={sending || conversationBlocked}
                      className="flex-1 rounded-xl border border-slate-200 px-4 py-3 text-sm focus:border-violet-500 focus:outline-none disabled:bg-slate-100"
                    />

                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={conversationBlocked}
                      className="rounded-xl bg-slate-100 px-4 py-3 font-bold text-slate-600 hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      📎
                    </button>

                    <input
                      ref={fileInputRef}
                      type="file"
                      onChange={(event) =>
                        setSelectedFile(event.target.files?.[0] || null)
                      }
                      aria-label="Прикрепить файл"
                      className="hidden"
                    />

                    <button
                      type="submit"
                      disabled={
                        conversationBlocked ||
                        (!messageText.trim() && !selectedFile) ||
                        sending
                      }
                      className="rounded-xl bg-violet-600 px-6 py-3 font-bold text-white hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {sending ? '...' : '↑'}
                    </button>
                  </form>

                  {selectedFile && (
                    <div className="mt-2 text-xs text-slate-500">
                      📎 {selectedFile.name}
                      <button
                        type="button"
                        onClick={() => setSelectedFile(null)}
                        className="ml-2 text-red-500"
                      >
                        ✕
                      </button>
                    </div>
                  )}

                  {conversationBlocked && (
                    <div className="mt-3 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-bold text-red-700">
                      Этот чат заблокирован. Отправка сообщений недоступна.
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex flex-1 items-center justify-center text-center">
                <div>
                  <div className="mb-4 text-4xl">💬</div>
                  <h2 className="text-2xl font-black text-slate-950">
                    Выберите беседу
                  </h2>
                  <p className="mt-3 text-sm text-slate-500">
                    Откройте диалог слева или начните разговор через профиль вендора.
                  </p>
                </div>
              </div>
            )}
          </section>

          {/* RIGHT SIDEBAR */}
          <aside className="hidden border-l border-slate-200 bg-white p-5 lg:block">
            {selectedConversation || targetVendor ? (
              <div className="space-y-5">
                <div>
                  <h3 className="text-sm font-black text-slate-950">Детали</h3>
                  <p className="mt-2 text-sm font-semibold text-slate-500">
                    Контекст беседы
                  </p>
                </div>

                <div className="rounded-[1.5rem] bg-slate-50 p-4">
                  <div className="text-xs font-black uppercase text-slate-400">
                    {userType === 'vendor' ? 'Клиент' : 'Вендор'}
                  </div>
                  <div className="mt-2 text-sm font-black text-slate-950">
                    {activeTitle}
                  </div>
                  <div className="mt-1 text-xs font-semibold text-slate-500">
                    {activeSubtitle}
                  </div>
                </div>

                <div className="rounded-[1.5rem] bg-slate-50 p-4">
                  <div className="text-xs font-black uppercase text-slate-400">
                    Статус
                  </div>
                  <div className="mt-2 text-sm font-black text-slate-950">
                    {conversationBlocked
                      ? 'Заблокирован'
                      : selectedConversation
                        ? selectedConversation.status === 'open'
                          ? 'Открыта'
                          : selectedConversation.status
                        : 'Новый диалог'}
                  </div>

                  {selectedConversation?.blocked_reason && (
                    <div className="mt-3 rounded-xl bg-red-50 p-3 text-xs font-bold text-red-700">
                      Причина: {selectedConversation.blocked_reason}
                    </div>
                  )}
                </div>

                {selectedConversation && (
                  <div className="rounded-[1.5rem] bg-slate-50 p-4">
                    <div className="text-xs font-black uppercase text-slate-400">
                      Действия
                    </div>

                    <div className="mt-3 space-y-2">
                      <button
                        type="button"
                        onClick={handleDeleteConversation}
                        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-black text-slate-700 transition hover:bg-slate-100"
                      >
                        Удалить чат
                      </button>

                      {conversationBlocked ? (
                        <button
                          type="button"
                          onClick={handleUnblockConversation}
                          className="w-full rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-2.5 text-sm font-black text-emerald-700 transition hover:bg-emerald-100"
                        >
                          Разблокировать
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={handleBlockConversation}
                          className="w-full rounded-xl border border-red-100 bg-red-50 px-4 py-2.5 text-sm font-black text-red-600 transition hover:bg-red-100"
                        >
                          Заблокировать
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-sm font-semibold text-slate-400">
                Выберите беседу
              </p>
            )}
          </aside>
        </div>
      </section>
    </main>
  );
}