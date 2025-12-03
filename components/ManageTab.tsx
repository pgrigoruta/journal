'use client';

import { useState, useEffect } from 'react';
import { Metric, CreateMetricInput, UpdateMetricInput } from '@/lib/types/metric';
import { Category, CreateCategoryInput, UpdateCategoryInput } from '@/lib/types/category';
import MetricList from './MetricList';
import MetricForm from './MetricForm';
import CategoryList from './CategoryList';
import CategoryForm from './CategoryForm';
import TabButton from './ui/TabButton';

type ManageSubTab = 'metrics' | 'categories';

const MANAGE_SUBTABS: Array<{ id: ManageSubTab; label: string }> = [
  { id: 'metrics', label: 'Metrics' },
  { id: 'categories', label: 'Categories' },
];

function MetricsSubTab() {
  const [metrics, setMetrics] = useState<Metric[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingMetric, setEditingMetric] = useState<Metric | undefined>();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadMetrics();
  }, []);

  const loadMetrics = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/metrics');
      if (!response.ok) throw new Error('Failed to load metrics');
      const data = await response.json();
      setMetrics(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load metrics');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (data: CreateMetricInput) => {
    try {
      const response = await fetch('/api/metrics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create metric');
      }

      await loadMetrics();
      setShowForm(false);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to create metric');
    }
  };

  const handleUpdate = async (data: UpdateMetricInput) => {
    if (!editingMetric) return;

    try {
      const response = await fetch(`/api/metrics/${editingMetric.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update metric');
      }

      await loadMetrics();
      setShowForm(false);
      setEditingMetric(undefined);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to update metric');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this metric?')) return;

    try {
      const response = await fetch(`/api/metrics/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete metric');
      }

      await loadMetrics();
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to delete metric');
    }
  };

  const handleReorder = async (metricIds: string[]) => {
    try {
      const response = await fetch('/api/metrics/reorder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ metricIds }),
      });

      if (!response.ok) {
        throw new Error('Failed to reorder metrics');
      }

      await loadMetrics();
    } catch (err: any) {
      setError(err.message || 'Failed to reorder metrics');
    }
  };

  const handleSave = async (data: CreateMetricInput | UpdateMetricInput) => {
    if (editingMetric) {
      await handleUpdate(data as UpdateMetricInput);
    } else {
      await handleCreate(data as CreateMetricInput);
    }
  };

  const handleEdit = (metric: Metric) => {
    setEditingMetric(metric);
    setShowForm(true);
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingMetric(undefined);
  };

  const handleAddNew = () => {
    setEditingMetric(undefined);
    setShowForm(true);
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center text-gray-400">Loading metrics...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-semibold text-gray-100">Manage Metrics</h2>
          {!showForm && (
            <button
              onClick={handleAddNew}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-medium"
            >
              Add New Metric
            </button>
          )}
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-900/50 border border-red-700 rounded-md text-red-200">
            {error}
          </div>
        )}

        {showForm ? (
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
            <h3 className="text-xl font-semibold text-gray-100 mb-4">
              {editingMetric ? 'Edit Metric' : 'Create New Metric'}
            </h3>
            <MetricForm
              metric={editingMetric}
              onSave={handleSave}
              onCancel={handleCancel}
            />
          </div>
        ) : (
          <MetricList
            metrics={metrics}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onReorder={handleReorder}
          />
        )}
      </div>
    </div>
  );
}

function CategoriesSubTab() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | undefined>();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/categories');
      if (!response.ok) throw new Error('Failed to load categories');
      const data = await response.json();
      setCategories(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (data: CreateCategoryInput) => {
    try {
      const response = await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create category');
      }

      await loadCategories();
      setShowForm(false);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to create category');
    }
  };

  const handleUpdate = async (data: UpdateCategoryInput) => {
    if (!editingCategory) return;

    try {
      const response = await fetch(`/api/categories/${editingCategory.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update category');
      }

      await loadCategories();
      setShowForm(false);
      setEditingCategory(undefined);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to update category');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this category?')) return;

    try {
      const response = await fetch(`/api/categories/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete category');
      }

      await loadCategories();
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to delete category');
    }
  };

  const handleSave = async (data: CreateCategoryInput | UpdateCategoryInput) => {
    if (editingCategory) {
      await handleUpdate(data as UpdateCategoryInput);
    } else {
      await handleCreate(data as CreateCategoryInput);
    }
  };

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setShowForm(true);
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingCategory(undefined);
  };

  const handleAddNew = () => {
    setEditingCategory(undefined);
    setShowForm(true);
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center text-gray-400">Loading categories...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-semibold text-gray-100">Manage Categories</h2>
          {!showForm && (
            <button
              onClick={handleAddNew}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-medium"
            >
              Add New Category
            </button>
          )}
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-900/50 border border-red-700 rounded-md text-red-200">
            {error}
          </div>
        )}

        {showForm ? (
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
            <h3 className="text-xl font-semibold text-gray-100 mb-4">
              {editingCategory ? 'Edit Category' : 'Create New Category'}
            </h3>
            <CategoryForm
              category={editingCategory}
              onSave={handleSave}
              onCancel={handleCancel}
            />
          </div>
        ) : (
          <CategoryList
            categories={categories}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        )}
      </div>
    </div>
  );
}

export default function ManageTab() {
  const [activeSubTab, setActiveSubTab] = useState<ManageSubTab>('metrics');

  return (
    <div className="flex flex-col h-full">
      {/* Subtab Navigation */}
      <div className="border-b border-surface-border">
        <nav className="flex space-x-1 px-4" aria-label="Manage Subtabs">
          {MANAGE_SUBTABS.map((tab) => (
            <TabButton
              key={tab.id}
              isActive={activeSubTab === tab.id}
              onClick={() => setActiveSubTab(tab.id)}
            >
              {tab.label}
            </TabButton>
          ))}
        </nav>
      </div>

      {/* Subtab Content */}
      <div className="flex-1 overflow-auto">
        {activeSubTab === 'metrics' && <MetricsSubTab />}
        {activeSubTab === 'categories' && <CategoriesSubTab />}
      </div>
    </div>
  );
}

