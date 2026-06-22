import React from 'react';
import { Category } from '../types';
import * as Icons from 'lucide-react';

interface CategoryCardProps {
  key?: string;
  category: Category;
  isActive?: boolean;
  onClick?: () => void;
}

export default function CategoryCard({ category, isActive = false, onClick }: CategoryCardProps) {
  // Gracefully fetch icon, fallback to Book
  const IconComponent = (Icons as any)[category.iconName] || Icons.Book;

  return (
    <button
      onClick={onClick}
      className={`group flex items-center gap-4 rounded-2xl border p-5 text-left transition-all duration-200 select-none w-full ${
        isActive
          ? 'border-blue-600 bg-blue-50/40 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400 shadow-sm shadow-blue-500/5'
          : 'border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-200 hover:border-zinc-330 hover:shadow-md dark:hover:border-zinc-700'
      }`}
    >
      <div
        className={`flex h-12 w-12 items-center justify-center rounded-xl transition-colors duration-205 ${
          isActive
            ? 'bg-blue-600 text-white'
            : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500 group-hover:bg-blue-50 group-hover:text-blue-600 dark:group-hover:bg-blue-950/40 dark:group-hover:text-blue-400'
        }`}
      >
        <IconComponent className="h-6 w-6" />
      </div>
      <div>
        <h4 className="font-semibold text-sm transition-colors duration-200">
          {category.name}
        </h4>
        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
          {category.booksCount} Books
        </p>
      </div>
    </button>
  );
}
