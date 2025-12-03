'use client';

import { Category } from '@/lib/types/category';

interface CategoryListProps {
  categories: Category[];
  onEdit: (category: Category) => void;
  onDelete: (id: string) => Promise<void>;
}

export default function CategoryList({ categories, onEdit, onDelete }: CategoryListProps) {
  if (categories.length === 0) {
    return (
      <div className="text-center py-12 text-gray-400">
        <p>No categories found. Click "Add New Category" to create your first category.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {categories.map((category) => (
        <div
          key={category.id}
          className="bg-gray-800 border border-gray-700 rounded-lg p-4"
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-100 mb-2">{category.name}</h3>
              <div className="text-sm text-gray-400">
                <span className="font-medium">Percent:</span> {category.percent}%
              </div>
            </div>
            <div className="flex gap-2 ml-4">
              <button
                onClick={() => onEdit(category)}
                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-md"
              >
                Edit
              </button>
              <button
                onClick={() => onDelete(category.id)}
                className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-sm rounded-md"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

