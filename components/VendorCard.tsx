'use client';

import Link from 'next/link';
import { MAIN_CATEGORIES } from '@/lib/categories';

interface Vendor {
  id: string;
  name: string;
  description?: string;
  main_categories: string[];
  subcategories: string[];
  tags: string[];
  primary_city: string;
  service_cities: string[];
  rating?: number;
  verified?: boolean;
  is_venue?: boolean;
  venue_type?: string;
  seated_capacity?: number;
  standing_capacity?: number;
  max_capacity?: number;
  dressing_rooms?: number;
  address?: string;
  parking?: boolean;
  accessibility?: boolean;
}

interface VendorCardProps {
  vendor: Vendor;
}

export function VendorCard({ vendor }: VendorCardProps) {
  const mainCategory = vendor.main_categories && vendor.main_categories.length > 0
    ? MAIN_CATEGORIES.find((c) => c.id === vendor.main_categories[0])
    : null;
  const categoryIcon = mainCategory?.icon || '🎯';

  // ПРАВИЛЬНАЯ проверка вместимости (не falsy trap)
  const hasCapacity = vendor.is_venue && 
    vendor.max_capacity !== null && 
    vendor.max_capacity !== undefined && 
    vendor.max_capacity > 0;

  return (
    <Link href={`/vendors/${vendor.id}`}>
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-lg transition-all p-6 cursor-pointer h-full">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-2xl">{categoryIcon}</span>
              <h3 className="font-semibold text-gray-900 text-lg line-clamp-2">{vendor.name}</h3>
            </div>
            <p className="text-sm text-gray-600">
              {mainCategory?.name_ru} • {vendor.primary_city}
            </p>
          </div>
          <div className="text-right flex-shrink-0">
            {vendor.rating && (
              <div className="text-yellow-500 font-semibold text-sm">★ {vendor.rating}</div>
            )}
            {vendor.verified && (
              <div className="text-xs text-green-600 font-medium">✓ Верифицирован</div>
            )}
          </div>
        </div>

        {/* Description */}
        {vendor.description && (
          <p className="text-sm text-gray-600 mb-3 line-clamp-2">{vendor.description}</p>
        )}

        {/* Venue Details Block */}
        {hasCapacity && (
          <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-4 mb-4 border border-purple-100">
            <div className="text-xs font-semibold text-gray-700 mb-3">🏟️ ПЛОЩАДКА</div>
            
            {/* Capacity Display */}
            <div className="space-y-2">
              {/* Main Capacity */}
              <div className="flex items-baseline justify-between">
                <span className="text-sm text-gray-600">Вместимость:</span>
                <span className="text-xl font-bold text-gray-900">
                  {vendor.max_capacity.toLocaleString('ru')}
                </span>
              </div>

              {/* Seated Capacity */}
              {vendor.seated_capacity && vendor.seated_capacity > 0 && (
                <div className="flex items-baseline justify-between text-sm">
                  <span className="text-gray-600">Сидячих:</span>
                  <span className="font-semibold text-gray-800">
                    {vendor.seated_capacity.toLocaleString('ru')}
                  </span>
                </div>
              )}

              {/* Standing Capacity */}
              {vendor.standing_capacity && vendor.standing_capacity > 0 && (
                <div className="flex items-baseline justify-between text-sm">
                  <span className="text-gray-600">Стоячих:</span>
                  <span className="font-semibold text-gray-800">
                    {vendor.standing_capacity.toLocaleString('ru')}
                  </span>
                </div>
              )}

              {/* Dressing Rooms */}
              {vendor.dressing_rooms && vendor.dressing_rooms > 0 && (
                <div className="flex items-baseline justify-between text-sm">
                  <span className="text-gray-600">Гримерок:</span>
                  <span className="font-semibold text-gray-800">
                    {vendor.dressing_rooms}
                  </span>
                </div>
              )}
            </div>

            {/* Amenities */}
            {(vendor.parking || vendor.accessibility) && (
              <div className="mt-3 pt-3 border-t border-purple-200 flex gap-3">
                {vendor.parking && (
                  <span className="text-xs bg-white px-2 py-1 rounded text-gray-700">🅿️ Парковка</span>
                )}
                {vendor.accessibility && (
                  <span className="text-xs bg-white px-2 py-1 rounded text-gray-700">♿ Доступность</span>
                )}
              </div>
            )}
          </div>
        )}

        {/* Subcategories */}
        {vendor.subcategories && vendor.subcategories.length > 0 && (
          <div className="mb-3">
            <div className="flex flex-wrap gap-2">
              {vendor.subcategories.slice(0, 4).map((sub) => (
                <span
                  key={sub}
                  className="inline-block px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full font-medium whitespace-nowrap"
                >
                  {sub}
                </span>
              ))}
              {vendor.subcategories.length > 4 && (
                <span className="text-xs text-gray-500 py-1">+{vendor.subcategories.length - 4}</span>
              )}
            </div>
          </div>
        )}

        {/* Tags */}
        {vendor.tags && vendor.tags.length > 0 && (
          <div className="mb-4">
            <div className="flex flex-wrap gap-2">
              {vendor.tags.slice(0, 3).map((tag) => (
                <span
                  key={tag}
                  className="inline-block px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded whitespace-nowrap"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Stats Footer */}
        <div className="border-t border-gray-200 pt-3 grid grid-cols-4 gap-2 text-center text-xs">
          <div>
            <div className="font-semibold text-gray-900">0</div>
            <div className="text-gray-500">Проектов</div>
          </div>
          <div>
            <div className="font-semibold text-gray-900">0</div>
            <div className="text-gray-500">Отзывов</div>
          </div>
          <div>
            <div className="font-semibold text-gray-900">0</div>
            <div className="text-gray-500">Команда</div>
          </div>
          <div>
            <div className="font-semibold text-gray-900">{vendor.rating || 5}</div>
            <div className="text-gray-500">Рейтинг</div>
          </div>
        </div>
      </div>
    </Link>
  );
}