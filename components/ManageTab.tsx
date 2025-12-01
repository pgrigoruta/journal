'use client';

import { useState, useEffect } from 'react';
import { Metric, CreateMetricInput, UpdateMetricInput } from '@/lib/types/metric';
import MetricList from './MetricList';
import MetricForm from './MetricForm';

export default function ManageTab() {
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

