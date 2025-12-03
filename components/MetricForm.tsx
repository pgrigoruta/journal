'use client';

import { useState, useEffect } from 'react';
import { Metric, CreateMetricInput, UpdateMetricInput } from '@/lib/types/metric';
import { Category } from '@/lib/types/category';

interface MetricFormProps {
  metric?: Metric;
  onSave: (data: CreateMetricInput | UpdateMetricInput) => Promise<void>;
  onCancel: () => void;
}

export default function MetricForm({ metric, onSave, onCancel }: MetricFormProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [formData, setFormData] = useState({
    label: metric?.label || '',
    categoryId: metric?.categoryId || '',
    active: metric?.active ?? true,
  });

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      setLoadingCategories(true);
      const response = await fetch('/api/categories');
      if (!response.ok) throw new Error('Failed to load categories');
      const data = await response.json();
      setCategories(data);
    } catch (error) {
      console.error('Error loading categories:', error);
    } finally {
      setLoadingCategories(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.categoryId) {
      alert('Please select a category');
      return;
    }
    
      await onSave({
        label: formData.label,
      categoryId: formData.categoryId,
        active: formData.active,
      });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Label <span className="text-red-400">*</span>
        </label>
        <input
          type="text"
          value={formData.label}
          onChange={(e) => setFormData({ ...formData, label: e.target.value })}
          required
          className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Category <span className="text-red-400">*</span>
        </label>
        <select
          value={formData.categoryId}
          onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
          disabled={loadingCategories}
          required
          className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <option value="">Select a category...</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name} ({category.percent}%)
            </option>
          ))}
        </select>
      </div>

      <div className="flex items-center">
        <input
          type="checkbox"
          id="active"
          checked={formData.active}
          onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
          className="w-4 h-4 text-blue-600 bg-gray-800 border-gray-700 rounded focus:ring-blue-500"
        />
        <label htmlFor="active" className="ml-2 text-sm text-gray-300">
          Active
        </label>
      </div>

      <div className="flex gap-3">
        <button
          type="submit"
          className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-medium"
        >
          {metric ? 'Update' : 'Create'} Metric
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

