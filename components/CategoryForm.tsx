'use client';

import { useState } from 'react';
import { Category, CreateCategoryInput, UpdateCategoryInput } from '@/lib/types/category';

interface CategoryFormProps {
  category?: Category;
  onSave: (data: CreateCategoryInput | UpdateCategoryInput) => Promise<void>;
  onCancel: () => void;
}

export default function CategoryForm({ category, onSave, onCancel }: CategoryFormProps) {
  const [formData, setFormData] = useState({
    name: category?.name || '',
    percent: category?.percent ?? 0,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    await onSave({
      name: formData.name,
      percent: formData.percent,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Name <span className="text-red-400">*</span>
        </label>
        <input
          type="text"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          required
          className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Category name"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Percent <span className="text-red-400">*</span>
        </label>
        <input
          type="number"
          min="0"
          max="100"
          value={formData.percent}
          onChange={(e) => setFormData({ ...formData, percent: parseInt(e.target.value) || 0 })}
          required
          className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="0-100"
        />
        <p className="mt-1 text-xs text-gray-400">Enter a value between 0 and 100</p>
      </div>

      <div className="flex gap-3">
        <button
          type="submit"
          className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-medium"
        >
          {category ? 'Update' : 'Create'} Category
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-gray-200 rounded-md"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

