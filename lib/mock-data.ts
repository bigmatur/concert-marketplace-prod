// lib/mock-data.ts

export type UserRole = 'buyer' | 'vendor' | 'admin';

export interface Vendor {
  id: string;
  name: string;
  category: string;
  subcategories: string[];
  city: string;
  rating: number;
  verified: boolean;
  description?: string;
  tags?: string[];
  team?: number;
  reviews?: number;
  projects?: number;
  isVenue?: boolean;
  venue?: {
    type: string;
    seated?: number;
    standing?: number;
    capacity?: number;
    address?: string;
    country?: string;
    region?: string;
    indoor?: 'indoor' | 'outdoor';
    parking?: boolean;
    accessibility?: boolean;
    amenities?: string[];
  };
}

export interface Request {
  id: string;
  title: string;
  category: string;
  subcategories?: string[];
  city: string;
  date?: string;
  budget?: { min: number; max: number };
  status: 'draft' | 'published' | 'collecting';
  description?: string;
  audience?: number;
  expectedAudience?: number;
  venueType?: string;
  format?: 'seated' | 'standing' | 'mixed';
}

// ════════════════════════════════════════════════════════════════
// КАТЕГОРИИ И ПОДКАТЕГОРИИ
// ════════════════════════════════════════════════════════════════

export const CATEGORIES = [
  {
    id: 'technical',
    name: '🔊 Техническое оборудование',
    icon: '🔊',
    subcategories: ['Звук', 'Свет', 'Видео', 'Сцена', 'Проектора', 'Микрофоны'],
  },
  {
    id: 'transport',
    name: '🚌 Логистика и транспорт',
    icon: '🚌',
    subcategories: ['Грузовики', 'Доставка', 'Упаковка', 'Погрузка', 'Страховка'],
  },
  {
    id: 'catering',
    name: '🍽️ Кейтеринг',
    icon: '🍽️',
    subcategories: ['Еда', 'Напитки', 'Посуда', 'Персонал', 'Барная стойка', 'Десерты'],
  },
  {
    id: 'management',
    name: '🎯 Менеджмент события',
    icon: '🎯',
    subcategories: ['Координация', 'Документы', 'Контракты', 'Страховка', 'Лицензия'],
  },
  {
    id: 'venues',
    name: '🏟️ Аренда площадки',
    icon: '🏟️',
    subcategories: ['Стадионы', 'Арены', 'Клубы', 'Открытые', 'Паркинг', 'Гостинцы'],
  },
  {
    id: 'rentals',
    name: '🎛️ Аренда оборудования',
    icon: '🎛️',
    subcategories: ['Столы', 'Стулья', 'Палатки', 'Освещение', 'Обогрев', 'Кондиционер'],
  },
  {
    id: 'media',
    name: '🎬 Медиа и фото',
    icon: '🎬',
    subcategories: ['Фотограф', 'Видеограф', 'Прямая трансляция', 'Монтаж', 'Дроны'],
  },
  {
    id: 'staff',
    name: '👷 Персонал',
    icon: '👷',
    subcategories: ['Охрана', 'Хозяйство', 'Волонтёры', 'Администраторы', 'Помощники'],
  },
  {
    id: 'security',
    name: '🛡️ Безопасность',
    icon: '🛡️',
    subcategories: ['Охрана', 'Контроль доступа', 'МЧС', 'Скорая помощь', 'Страховка'],
  },
];

// ════════════════════════════════════════════════════════════════
// ВЕНДОРЫ (с подкатегориями)
// ════════════════════════════════════════════════════════════════

export const vendorsData: Vendor[] = [
  {
    id: '1',
    name: 'Pro Sound Moscow',
    category: 'technical',
    subcategories: ['Звук', 'Свет'],
    city: 'Москва',
    rating: 4.8,
    verified: true,
    description: 'Профессиональное звуковое оборудование и свет для крупных событий',
    tags: ['Звук', 'Свет', 'Концерты', 'Конференции'],
    team: 15,
    reviews: 42,
    projects: 156,
  },
  {
    id: '2',
    name: 'Event Transport',
    category: 'transport',
    subcategories: ['Грузовики', 'Доставка'],
    city: 'Москва',
    rating: 4.6,
    verified: true,
    description: 'Транспортировка оборудования и грузов для событий',
    tags: ['Грузовики', 'Логистика', 'Страховка'],
    team: 25,
    reviews: 38,
    projects: 203,
  },
  {
    id: '3',
    name: 'Catering Plus',
    category: 'catering',
    subcategories: ['Еда', 'Напитки'],
    city: 'Санкт-Петербург',
    rating: 4.7,
    verified: true,
    description: 'Кейтеринг для корпоративных и личных событий',
    tags: ['Еда', 'Напитки', 'Обслуживание', 'Персонал'],
    team: 30,
    reviews: 67,
    projects: 289,
  },
  {
    id: '4',
    name: 'Лужники - Большая арена',
    category: 'venues',
    subcategories: ['Стадионы'],
    city: 'Москва',
    rating: 4.9,
    verified: true,
    isVenue: true,
    venue: {
      type: 'Стадион',
      seated: 78000,
      standing: 81000,
      capacity: 81000,
      address: 'Лужнецкая наб, 24',
      country: 'Россия',
      region: 'Москва',
      indoor: 'outdoor',
      parking: true,
      accessibility: true,
      amenities: ['Парковка', 'Туалеты', 'Буфет', 'Медицина'],
    },
  },
  {
    id: '5',
    name: 'Крокус Сити Холл',
    category: 'venues',
    subcategories: ['Арены'],
    city: 'Москва',
    rating: 4.8,
    verified: true,
    isVenue: true,
    venue: {
      type: 'Арена',
      seated: 6200,
      standing: 7500,
      capacity: 7500,
      address: 'Мясницкая ул, 24/7',
      country: 'Россия',
      region: 'Москва',
      indoor: 'indoor',
      parking: true,
      accessibility: true,
      amenities: ['VIP зоны', 'Ресторан', 'Паркинг', 'Раздевалки'],
    },
  },
  {
    id: '6',
    name: 'A2 Green Concert',
    category: 'venues',
    subcategories: ['Клубы'],
    city: 'Санкт-Петербург',
    rating: 4.7,
    verified: true,
    isVenue: true,
    venue: {
      type: 'Клуб',
      standing: 1500,
      capacity: 1500,
      address: 'Пушкинская ул, 10',
      country: 'Россия',
      region: 'Санкт-Петербург',
      indoor: 'indoor',
      parking: false,
      accessibility: true,
      amenities: ['Сцена', 'Звук', 'Свет', 'Бар'],
    },
  },
  {
    id: '7',
    name: 'Event Management Pro',
    category: 'management',
    subcategories: ['Координация', 'Документы'],
    city: 'Москва',
    rating: 4.9,
    verified: true,
    description: 'Полное управление и координация событий',
    tags: ['Менеджмент', 'Координация', 'Опыт 20+ лет'],
    team: 50,
    reviews: 120,
    projects: 500,
  },
  {
    id: '8',
    name: 'Security Guard Team',
    category: 'security',
    subcategories: ['Охрана', 'Контроль доступа'],
    city: 'Москва',
    rating: 4.8,
    verified: true,
    description: 'Профессиональная охрана и контроль доступа',
    tags: ['Охрана', 'Безопасность', 'Лицензировано'],
    team: 100,
    reviews: 85,
    projects: 300,
  },
];

// ════════════════════════════════════════════════════════════════
// ЗАЯВКИ (REQUESTS)
// ════════════════════════════════════════════════════════════════

export const requestsData: Request[] = [
  {
    id: '1',
    title: 'Организация корпоративного события на 500 человек',
    category: 'management',
    subcategories: ['Координация', 'Документы'],
    city: 'Москва',
    date: '2024-05-15',
    budget: { min: 500000, max: 1000000 },
    status: 'published',
    description: 'Ищу полный пакет услуг для корпоратива: площадку, питание, звук, охрану',
    audience: 500,
    expectedAudience: 500,
    venueType: 'Арена',
  },
  {
    id: '2',
    title: 'Свадебное торжество на 200 гостей',
    category: 'catering',
    subcategories: ['Еда', 'Напитки'],
    city: 'Санкт-Петербург',
    date: '2024-06-20',
    budget: { min: 200000, max: 400000 },
    status: 'collecting',
    description: 'Кейтеринг европейской кухни, красивое оформление, профессиональное обслуживание',
    audience: 200,
    expectedAudience: 200,
  },
  {
    id: '3',
    title: 'Концерт открытого воздуха в парке',
    category: 'technical',
    subcategories: ['Звук', 'Свет'],
    city: 'Москва',
    date: '2024-07-01',
    budget: { min: 1000000, max: 2000000 },
    status: 'published',
    description: 'Ищу профессиональный звук, свет, сцену для концерта под открытым небом',
    audience: 3000,
    expectedAudience: 3000,
    venueType: 'Открытая площадка',
  },
];

// ════════════════════════════════════════════════════════════════
// ГОРОДА
// ════════════════════════════════════════════════════════════════

export const CITIES = [
  'Москва',
  'Санкт-Петербург',
  'Казань',
  'Новосибирск',
  'Екатеринбург',
  'Сочи',
  'Самара',
];

// ════════════════════════════════════════════════════════════════
// ДИАПАЗОНЫ ВМЕСТИМОСТИ
// ════════════════════════════════════════════════════════════════

export const CAPACITY_RANGES = [
  { label: 'До 500', min: 0, max: 500 },
  { label: '500–1 000', min: 500, max: 1000 },
  { label: '1 000–2 000', min: 1000, max: 2000 },
  { label: '2 000–3 000', min: 2000, max: 3000 },
  { label: '3 000–5 000', min: 3000, max: 5000 },
  { label: '5 000–10 000', min: 5000, max: 10000 },
  { label: '10 000+', min: 10000, max: 100000 },
];