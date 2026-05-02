import React from 'react';
import clsx from 'clsx';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helpText?: string;
}

export function Input({
  label,
  error,
  helpText,
  className,
  ...props
}: InputProps) {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-900 mb-2">
          {label}
        </label>
      )}
      <input
        className={clsx(
          'w-full px-4 py-2 rounded-lg border border-gray-200',
          'bg-white text-gray-900 placeholder-gray-400',
          'focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent',
          'transition-colors',
          {
            'border-red-500 focus:ring-red-500': error,
          },
          className
        )}
        {...props}
      />
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
      {helpText && !error && <p className="mt-1 text-sm text-gray-500">{helpText}</p>}
    </div>
  );
}
