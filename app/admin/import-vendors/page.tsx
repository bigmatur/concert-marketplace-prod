'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';
import * as XLSX from 'xlsx';

interface VenueRow {
  venue_name?: string;
  venue_type?: string;
  city?: string;
  address?: string;
  capacity?: number;
  website?: string;
  phone?: string;
  email?: string;
  instagram?: string;
  vk?: string;
  telegram?: string;
  facebook?: string;
  youtube?: string;
  tiktok?: string;
  confidence?: string;
  description_ru?: string;
  notes?: string;
  [key: string]: any;
}

interface ImportResult {
  success: number;
  failed: number;
  errors: string[];
}

export default function ImportVendorsPage() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState<VenueRow[]>([]);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [step, setStep] = useState<'upload' | 'preview' | 'done'>('upload');

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFile = e.target.files?.[0];
    if (!uploadedFile) return;

    setFile(uploadedFile);

    try {
      const data = await uploadedFile.arrayBuffer();
      const workbook = XLSX.read(data, { type: 'array' });
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const rows = XLSX.utils.sheet_to_json(worksheet) as VenueRow[];

      // Показать первые 5 строк для превью
      setPreview(rows.slice(0, 5));
      setStep('preview');
    } catch (error) {
      console.error('Error reading file:', error);
      alert('❌ Ошибка при чтении файла');
    }
  };

  const handleImport = async () => {
    if (!file) return;

    setLoading(true);

    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data, { type: 'array' });
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const rows = XLSX.utils.sheet_to_json(worksheet) as VenueRow[];

      // Отправить на сервер
const response = await fetch('/api/admin/vendors', {        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ venues: rows }),
      });

      if (response.ok) {
        const result = await response.json();
        setResult(result);
        setStep('done');
      } else {
        const error = await response.json();
        alert(`❌ Ошибка: ${error.error}`);
      }
    } catch (error) {
      console.error('Error importing:', error);
      alert('❌ Ошибка при импорте');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/admin/vendors">
            
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">📥 Импорт вендоров</h1>
          <div className="w-[120px]"></div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-12">
        {/* Progress */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className={`flex items-center ${step === 'upload' ? 'opacity-100' : 'opacity-50'}`}>
              <div className="w-8 h-8 rounded-full bg-purple-600 text-white flex items-center justify-center text-sm font-bold">1</div>
              <span className="ml-2 text-sm font-medium">Загрузка</span>
            </div>
            <div className={`flex items-center ${step === 'preview' ? 'opacity-100' : 'opacity-50'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${step === 'preview' ? 'bg-purple-600 text-white' : 'bg-gray-200 text-gray-600'}`}>2</div>
              <span className="ml-2 text-sm font-medium">Превью</span>
            </div>
            <div className={`flex items-center ${step === 'done' ? 'opacity-100' : 'opacity-50'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${step === 'done' ? 'bg-purple-600 text-white' : 'bg-gray-200 text-gray-600'}`}>3</div>
              <span className="ml-2 text-sm font-medium">Готово</span>
            </div>
          </div>
        </div>

        {/* Step 1: Upload */}
        {step === 'upload' && (
          <div className="bg-white rounded-lg border border-gray-200 p-8">
            <h2 className="text-lg font-bold text-gray-900 mb-6">📁 Выбери Excel файл</h2>

            <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center mb-6">
              <input
                type="file"
                id="file-input"
                onChange={handleFileUpload}
                className="hidden"
                accept=".xlsx,.xls,.csv"
              />
              <label htmlFor="file-input" className="cursor-pointer">
                <div className="text-4xl mb-4">📄</div>
                <p className="text-lg font-semibold text-gray-900 mb-2">
                  {file ? `Выбран: ${file.name}` : 'Загрузи Excel файл'}
                </p>
                <p className="text-sm text-gray-500">
                  Поддерживаются форматы: .xlsx, .xls, .csv
                </p>
              </label>
            </div>

            <div className="bg-blue-50 rounded-lg border border-blue-200 p-4 mb-6">
              <p className="text-sm text-blue-800">
                <strong>ℹ️ Требования:</strong>
              </p>
              <ul className="text-sm text-blue-700 mt-2 space-y-1">
                <li>• Первая строка должна содержать заголовки колонок</li>
                <li>• Обязательные колонки: venue_name, city</li>
                <li>• Остальные поля заполняются автоматически если есть данные</li>
              </ul>
            </div>

            <div className="flex gap-3">
              <Link href="/admin/vendors" className="flex-1">
                <Button variant="secondary" className="w-full">
                  Отмена
                </Button>
              </Link>
              <button
                onClick={() => setStep('preview')}
                disabled={!file}
                className="flex-1 px-6 py-3 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                Далее →
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Preview */}
        {step === 'preview' && (
          <div className="bg-white rounded-lg border border-gray-200 p-8">
            <h2 className="text-lg font-bold text-gray-900 mb-6">👁️ Превью данных</h2>

            <div className="bg-gray-50 rounded-lg p-4 mb-6 overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-2 px-3 font-semibold text-gray-700">Название</th>
                    <th className="text-left py-2 px-3 font-semibold text-gray-700">Тип</th>
                    <th className="text-left py-2 px-3 font-semibold text-gray-700">Город</th>
                    <th className="text-left py-2 px-3 font-semibold text-gray-700">Email</th>
                    <th className="text-left py-2 px-3 font-semibold text-gray-700">Телефон</th>
                  </tr>
                </thead>
                <tbody>
                  {preview.map((row, idx) => (
                    <tr key={idx} className="border-b border-gray-100">
                      <td className="py-2 px-3 text-gray-900">{row.venue_name || '—'}</td>
                      <td className="py-2 px-3 text-gray-600">{row.venue_type || '—'}</td>
                      <td className="py-2 px-3 text-gray-600">{row.city || '—'}</td>
                      <td className="py-2 px-3 text-gray-600">{row.email ? row.email.split(';')[0].trim() : '—'}</td>
                      <td className="py-2 px-3 text-gray-600">{row.phone ? row.phone.split(';')[0].trim() : '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="bg-yellow-50 rounded-lg border border-yellow-200 p-4 mb-6">
              <p className="text-sm text-yellow-800">
                <strong>⚠️ Внимание:</strong> Будут загружены все строки из файла. Проверь данные перед импортом.
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setStep('upload');
                  setFile(null);
                  setPreview([]);
                }}
                className="flex-1 px-6 py-3 bg-gray-100 text-gray-900 rounded-lg font-semibold hover:bg-gray-200 transition-colors"
              >
                ← Назад
              </button>
              <button
                onClick={handleImport}
                disabled={loading}
                className="flex-1 px-6 py-3 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? '⏳ Импортируем...' : '✓ Импортировать'}
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Done */}
        {step === 'done' && result && (
          <div className="bg-white rounded-lg border border-gray-200 p-8">
            <h2 className="text-lg font-bold text-gray-900 mb-6">✅ Импорт завершён</h2>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-green-50 rounded-lg border border-green-200 p-4">
                <p className="text-sm text-gray-600">Успешно загружено</p>
                <p className="text-3xl font-bold text-green-600">{result.success}</p>
              </div>
              <div className="bg-red-50 rounded-lg border border-red-200 p-4">
                <p className="text-sm text-gray-600">Ошибок</p>
                <p className="text-3xl font-bold text-red-600">{result.failed}</p>
              </div>
            </div>

            {result.errors.length > 0 && (
              <div className="bg-red-50 rounded-lg border border-red-200 p-4 mb-6">
                <p className="text-sm font-semibold text-red-900 mb-2">❌ Ошибки:</p>
                <ul className="text-sm text-red-800 space-y-1 max-h-40 overflow-y-auto">
                  {result.errors.map((error, idx) => (
                    <li key={idx}>• {error}</li>
                  ))}
                </ul>
              </div>
            )}

            <Link href="/admin/vendors" className="w-full block">
              <Button className="w-full">
                ✓ Перейти к вендорам
              </Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}